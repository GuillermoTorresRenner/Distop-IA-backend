import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { MusicService } from './music.service';
import { PlayMusicDto } from './dto/play-music.dto';
import type { MusicStateResponse } from './dto/music.types';
import { TableService } from '../table/table.service';

@ApiTags('Music')
@Controller('chronicles/:chronicleId/music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    private readonly tableService: TableService,
  ) {}

  private async validateMembership(userId: string, chronicleId: string) {
    return this.tableService.getMembership(userId, chronicleId);
  }

  private async validateNarrator(userId: string, chronicleId: string) {
    const narratorId = await this.tableService.getNarratorId(chronicleId);
    return narratorId === userId;
  }

  @Get('state')
  @Auth()
  @ApiOperation({ summary: 'Estado actual del reproductor' })
  async getState(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const role = await this.validateMembership(userId, chronicleId);
    if (!role) throw new ForbiddenException('Not a member of this chronicle');
    return this.musicService.getState(chronicleId);
  }

  @Get('stream')
  @ApiOperation({ summary: 'Stream de audio OGG chunked (sin auth para <audio>)' })
  getStream(
    @Param('chronicleId') chronicleId: string,
    @Res() res: Response,
  ) {
    this.musicService.connectStreamClient(chronicleId, res);
  }

  @Post('play')
  @Auth()
  @ApiOperation({ summary: 'Agrega y reproduce una URL de YouTube inmediatamente' })
  async play(
    @Param('chronicleId') chronicleId: string,
    @Body() dto: PlayMusicDto,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const role = await this.validateMembership(userId, chronicleId);
    if (!role) throw new ForbiddenException('Not a member of this chronicle');
    return this.musicService.play(chronicleId, dto.url, userId);
  }

  @Post('pause')
  @Auth()
  @ApiOperation({ summary: 'Pausa la reproducción (solo narrador)' })
  async pause(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can pause music');
    return this.musicService.pause(chronicleId);
  }

  @Post('resume')
  @Auth()
  @ApiOperation({ summary: 'Reanuda la reproducción (solo narrador)' })
  async resume(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can resume music');
    return this.musicService.resume(chronicleId);
  }

  @Post('skip')
  @Auth()
  @ApiOperation({ summary: 'Siguiente track en loop (solo narrador)' })
  async skip(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can skip');
    return this.musicService.skip(chronicleId);
  }

  @Post('stop')
  @Auth()
  @ApiOperation({ summary: 'Detiene la reproducción (playlist intacta, solo narrador)' })
  async stop(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can stop music');
    return this.musicService.stop(chronicleId);
  }

  @Post('queue')
  @Auth()
  @ApiOperation({ summary: 'Agrega track a la playlist (narrador y jugadores)' })
  async addToPlaylist(
    @Param('chronicleId') chronicleId: string,
    @Body() dto: PlayMusicDto,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const role = await this.validateMembership(userId, chronicleId);
    if (!role) throw new ForbiddenException('Not a member of this chronicle');
    return this.musicService.addToPlaylist(chronicleId, dto.url, userId);
  }

  @Post('play-at/:index')
  @Auth()
  @ApiOperation({ summary: 'Salta a un track específico de la playlist (solo narrador)' })
  async playAt(
    @Param('chronicleId') chronicleId: string,
    @Param('index', ParseIntPipe) index: number,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can select tracks');
    return this.musicService.playAt(chronicleId, index);
  }

  @Delete('queue/:index')
  @Auth()
  @ApiOperation({ summary: 'Elimina un track de la playlist (solo narrador)' })
  async removeFromPlaylist(
    @Param('chronicleId') chronicleId: string,
    @Param('index', ParseIntPipe) index: number,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can remove tracks');
    return this.musicService.removeFromPlaylist(chronicleId, index);
  }

  @Delete('queue')
  @Auth()
  @ApiOperation({ summary: 'Limpia toda la playlist (solo narrador)' })
  async clearPlaylist(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ): Promise<MusicStateResponse> {
    const isNarrator = await this.validateNarrator(userId, chronicleId);
    if (!isNarrator) throw new ForbiddenException('Only the narrator can clear the playlist');
    return this.musicService.clearPlaylist(chronicleId);
  }
}
