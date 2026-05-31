import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { PassThrough } from 'stream';
import type { FfmpegCommand } from 'fluent-ffmpeg';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpeg = require('fluent-ffmpeg') as typeof import('fluent-ffmpeg');
import YTDlpWrap from 'yt-dlp-wrap';
import type { TrackInfo, MusicStateResponse } from './dto/music.types';

const YT_DLP_PATHS = [
  `${homedir()}/.local/bin/yt-dlp`,
  '/usr/local/bin/yt-dlp',
  '/usr/bin/yt-dlp',
];
const ytDlpBin = YT_DLP_PATHS.find(existsSync) ?? 'yt-dlp';
const ytDlp = new YTDlpWrap(ytDlpBin);

interface PlayerState {
  chronicleId: string;
  status: 'idle' | 'playing' | 'paused';
  /**
   * Lista persistente de tracks. Nunca se vacía al saltar — se mantiene
   * hasta que el narrador la limpia explícitamente con clearPlaylist().
   */
  playlist: TrackInfo[];
  /** Índice del track actualmente activo en `playlist`. -1 = ninguno. */
  currentIndex: number;
  startedAt: number | null;
  pausedAt: number | null;
  ffmpegCommand: FfmpegCommand | null;
  passThrough: PassThrough | null;
  streamClients: Set<Response>;
}

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);
  private readonly players = new Map<string, PlayerState>();
  private readonly inactivityTimers = new Map<string, NodeJS.Timeout>();

  // ─────────────────────────────────────────────────────────
  // Resolución de URL
  // ─────────────────────────────────────────────────────────

  private async resolveTrack(
    youtubeUrl: string,
    userId: string,
  ): Promise<TrackInfo> {
    if (
      !youtubeUrl.startsWith('https://www.youtube.com/') &&
      !youtubeUrl.startsWith('https://youtu.be/') &&
      !youtubeUrl.startsWith('https://youtube.com/')
    ) {
      throw new BadRequestException('Solo se aceptan URLs de YouTube.');
    }

    let metadata: Record<string, unknown>;
    try {
      const raw = await ytDlp.execPromise([
        youtubeUrl,
        '--dump-json',
        '--no-warnings',
        '--no-playlist',
        '-f', 'bestaudio/best',
      ]);
      metadata = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.warn(`yt-dlp failed for ${youtubeUrl}: ${msg}`);
      throw new BadRequestException(
        'No se pudo obtener el stream de este video. ¿Es público y está disponible?',
      );
    }

    const videoId = metadata['id'] as string | undefined;
    const streamUrl = metadata['url'] as string | undefined;
    if (!videoId || !streamUrl) {
      throw new BadRequestException('yt-dlp no devolvió una URL de stream válida.');
    }

    return {
      videoId,
      title: (metadata['title'] as string) || 'Sin título',
      url: streamUrl,
      duration: (metadata['duration'] as number) ?? null,
      thumbnail: (metadata['thumbnail'] as string) ?? null,
      requestedBy: userId,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Gestión del player
  // ─────────────────────────────────────────────────────────

  private getOrCreate(chronicleId: string): PlayerState {
    if (!this.players.has(chronicleId)) {
      this.players.set(chronicleId, {
        chronicleId,
        status: 'idle',
        playlist: [],
        currentIndex: -1,
        startedAt: null,
        pausedAt: null,
        ffmpegCommand: null,
        passThrough: null,
        streamClients: new Set(),
      });
    }
    return this.players.get(chronicleId)!;
  }

  private launchStream(player: PlayerState): void {
    if (!player.playlist[player.currentIndex]) return;

    this.teardownStream(player);

    const pt = new PassThrough();
    player.passThrough = pt;

    const track = player.playlist[player.currentIndex];
    const cmd = ffmpeg(track.url)
      .noVideo()
      .audioCodec('libvorbis')
      .audioBitrate('96k')
      .audioChannels(2)
      .audioFrequency(44100)
      .format('ogg')
      .on('start', (cmdLine: string) => {
        this.logger.log(`ffmpeg started: ${cmdLine.slice(0, 80)}…`);
      })
      .on('error', (err: Error) => {
        this.logger.warn(`ffmpeg error (${player.chronicleId}): ${err.message}`);
        pt.destroy();
        for (const res of player.streamClients) res.end();
        player.streamClients.clear();
        player.ffmpegCommand = null;
        player.passThrough = null;
      });

    cmd.pipe(pt, { end: true });
    player.ffmpegCommand = cmd;

    for (const res of player.streamClients) {
      this.pipeToClient(pt, res);
    }
  }

  private pipeToClient(pt: PassThrough, res: Response): void {
    pt.pipe(res, { end: false });
  }

  private teardownStream(player: PlayerState): void {
    if (player.ffmpegCommand) {
      try { player.ffmpegCommand.kill('SIGKILL'); } catch { /* ignore */ }
      player.ffmpegCommand = null;
    }
    if (player.passThrough) {
      player.passThrough.destroy();
      player.passThrough = null;
    }
  }

  private fullStop(player: PlayerState): void {
    this.teardownStream(player);
    for (const res of player.streamClients) res.end();
    player.streamClients.clear();
  }

  private serialize(player: PlayerState): MusicStateResponse {
    return {
      chronicleId: player.chronicleId,
      status: player.status,
      currentTrack: player.currentIndex >= 0
        ? (player.playlist[player.currentIndex] ?? null)
        : null,
      currentIndex: player.currentIndex,
      playlist: [...player.playlist],
      startedAt: player.startedAt,
      pausedAt: player.pausedAt,
    };
  }

  private scheduleInactivityStop(chronicleId: string): void {
    const prev = this.inactivityTimers.get(chronicleId);
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => {
      const p = this.players.get(chronicleId);
      if (p && p.streamClients.size === 0 && p.status !== 'idle') {
        this.logger.log(`Inactivity timeout — stopping player for ${chronicleId}`);
        this.teardownStream(p);
        p.status = 'idle';
      }
    }, 30_000);
    this.inactivityTimers.set(chronicleId, timer);
  }

  // ─────────────────────────────────────────────────────────
  // API pública
  // ─────────────────────────────────────────────────────────

  /**
   * Agrega un track a la playlist. Si el player está idle, lo reproduce
   * inmediatamente. Si ya está reproduciendo, lo encola al final.
   */
  async addToPlaylist(
    chronicleId: string,
    youtubeUrl: string,
    userId: string,
  ): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    const track = await this.resolveTrack(youtubeUrl, userId);
    player.playlist.push(track);

    if (player.status === 'idle') {
      player.currentIndex = player.playlist.length - 1;
      player.status = 'playing';
      player.startedAt = Date.now();
      player.pausedAt = null;
      this.launchStream(player);
    }

    return this.serialize(player);
  }

  /**
   * Salta directamente a un track de la playlist por índice.
   * El track no se elimina de la lista.
   */
  async playAt(
    chronicleId: string,
    index: number,
  ): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    if (index < 0 || index >= player.playlist.length) {
      throw new BadRequestException('Índice de playlist inválido.');
    }

    this.teardownStream(player);
    player.currentIndex = index;
    player.status = 'playing';
    player.startedAt = Date.now();
    player.pausedAt = null;
    this.launchStream(player);

    return this.serialize(player);
  }

  /**
   * Reproduce una URL nueva: la agrega a la playlist y salta a ella.
   */
  async play(
    chronicleId: string,
    youtubeUrl: string,
    userId: string,
  ): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    const track = await this.resolveTrack(youtubeUrl, userId);
    player.playlist.push(track);

    this.teardownStream(player);
    player.currentIndex = player.playlist.length - 1;
    player.status = 'playing';
    player.startedAt = Date.now();
    player.pausedAt = null;
    this.launchStream(player);

    return this.serialize(player);
  }

  /**
   * Salta al siguiente track de la playlist. Si está en el último,
   * vuelve al primero (modo loop). No borra nada.
   */
  async skip(chronicleId: string): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    if (player.playlist.length === 0) {
      throw new BadRequestException('La playlist está vacía.');
    }

    const next = (player.currentIndex + 1) % player.playlist.length;
    return this.playAt(chronicleId, next);
  }

  async pause(chronicleId: string): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    if (player.status !== 'playing') {
      throw new BadRequestException('No hay reproducción activa.');
    }

    player.pausedAt = Date.now() - (player.startedAt ?? 0);
    player.status = 'paused';
    this.teardownStream(player);

    return this.serialize(player);
  }

  async resume(chronicleId: string): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    if (player.status !== 'paused' || player.currentIndex < 0) {
      throw new BadRequestException('No hay reproducción pausada.');
    }

    player.status = 'playing';
    player.startedAt = Date.now() - (player.pausedAt ?? 0);
    player.pausedAt = null;
    this.launchStream(player);

    return this.serialize(player);
  }

  /**
   * Detiene la reproducción pero mantiene la playlist intacta.
   */
  async stop(chronicleId: string): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    this.fullStop(player);
    player.status = 'idle';
    player.startedAt = null;
    player.pausedAt = null;
    // currentIndex se mantiene — al reanudar sabrá desde dónde.

    return this.serialize(player);
  }

  /**
   * Elimina un track de la playlist por índice. Ajusta currentIndex
   * si el track eliminado está antes o en la posición actual.
   */
  async removeFromPlaylist(
    chronicleId: string,
    index: number,
  ): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    if (index < 0 || index >= player.playlist.length) {
      throw new BadRequestException('Índice de playlist inválido.');
    }

    // Si se elimina el track en reproducción, saltar al siguiente si existe.
    if (index === player.currentIndex) {
      if (player.status === 'playing' || player.status === 'paused') {
        player.playlist.splice(index, 1);
        if (player.playlist.length === 0) {
          this.fullStop(player);
          player.status = 'idle';
          player.currentIndex = -1;
          player.startedAt = null;
          player.pausedAt = null;
        } else {
          const next = index < player.playlist.length ? index : 0;
          player.currentIndex = next;
          player.status = 'playing';
          player.startedAt = Date.now();
          player.pausedAt = null;
          this.teardownStream(player);
          this.launchStream(player);
        }
        return this.serialize(player);
      }
    }

    player.playlist.splice(index, 1);

    // Ajustar currentIndex si el borrado fue antes de la posición actual.
    if (index < player.currentIndex) {
      player.currentIndex -= 1;
    }
    // Si queda vacía, resetear.
    if (player.playlist.length === 0) {
      player.currentIndex = -1;
    }

    return this.serialize(player);
  }

  /**
   * Limpia toda la playlist y detiene la reproducción.
   */
  async clearPlaylist(chronicleId: string): Promise<MusicStateResponse> {
    const player = this.getOrCreate(chronicleId);
    this.fullStop(player);
    player.status = 'idle';
    player.playlist = [];
    player.currentIndex = -1;
    player.startedAt = null;
    player.pausedAt = null;

    return this.serialize(player);
  }

  async getState(chronicleId: string): Promise<MusicStateResponse> {
    return this.serialize(this.getOrCreate(chronicleId));
  }

  connectStreamClient(chronicleId: string, res: Response): void {
    const player = this.getOrCreate(chronicleId);

    res.setHeader('Content-Type', 'audio/ogg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    player.streamClients.add(res);
    this.logger.log(
      `Stream client connected (${player.streamClients.size} total) — ${chronicleId}`,
    );

    if (player.passThrough && !player.passThrough.destroyed) {
      this.pipeToClient(player.passThrough, res);
    }

    const cleanup = () => {
      player.streamClients.delete(res);
      this.logger.log(
        `Stream client disconnected (${player.streamClients.size} remaining) — ${chronicleId}`,
      );
      if (player.streamClients.size === 0 && player.status !== 'idle') {
        this.scheduleInactivityStop(chronicleId);
      }
    };

    res.on('close', cleanup);
    res.on('error', cleanup);
  }
}
