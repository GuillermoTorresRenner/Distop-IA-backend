import { Injectable } from '@nestjs/common';

/**
 * Tracker en memoria de usuarios conectados.
 *
 * Cuenta sockets por `userId` (multi-tab): un usuario con dos pestañas abiertas
 * tiene `count=2`. Solo se considera "desconectado" cuando todos sus sockets
 * cierran.
 *
 * Implementación in-memory: si hay múltiples instancias del backend (escala
 * horizontal) hay que reemplazar por Redis pub/sub. Hoy no aplica.
 */
@Injectable()
export class PresenceService {
  private readonly sockets = new Map<string, Set<string>>();
  private readonly firstSeen = new Map<string, Date>();

  /** Registra un socket de un usuario. Devuelve true si era la primera conexión. */
  add(userId: string, socketId: string): boolean {
    const set = this.sockets.get(userId);
    if (set) {
      set.add(socketId);
      return false;
    }
    this.sockets.set(userId, new Set([socketId]));
    this.firstSeen.set(userId, new Date());
    return true;
  }

  /** Quita un socket. Devuelve true si era la última conexión del usuario. */
  remove(userId: string, socketId: string): boolean {
    const set = this.sockets.get(userId);
    if (!set) return false;
    set.delete(socketId);
    if (set.size === 0) {
      this.sockets.delete(userId);
      this.firstSeen.delete(userId);
      return true;
    }
    return false;
  }

  /** Cantidad de usuarios únicos online. */
  onlineCount(): number {
    return this.sockets.size;
  }

  /** IDs de usuarios online (snapshot). */
  onlineUserIds(): string[] {
    return Array.from(this.sockets.keys());
  }

  /** Total de sockets activos (sumando multi-tab). */
  socketCount(): number {
    let total = 0;
    for (const set of this.sockets.values()) total += set.size;
    return total;
  }
}
