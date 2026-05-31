export interface TrackInfo {
  videoId: string;
  title: string;
  url: string;
  duration: number | null;
  thumbnail: string | null;
  requestedBy: string;
}

export interface MusicStateResponse {
  chronicleId: string;
  status: 'idle' | 'playing' | 'paused';
  currentTrack: TrackInfo | null;
  /** Índice activo en la playlist. -1 = ninguno. */
  currentIndex: number;
  /** Lista persistente de tracks. Nunca se borra al saltar. */
  playlist: TrackInfo[];
  startedAt: number | null;
  pausedAt: number | null;
}
