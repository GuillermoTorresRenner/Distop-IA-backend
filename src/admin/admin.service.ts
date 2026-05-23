import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PresenceService } from '../presence/presence.service';

export interface AdminOverviewStats {
  users: { total: number; active: number; admins: number; online: number };
  chronicles: { total: number; withMembers: number };
  characters: {
    total: number;
    byKind: { PC: number; NPC: number; ANTAGONIST: number };
  };
  invitations: { pending: number; accepted: number };
  messages: { total: number };
  diceRolls: { total: number };
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface OnlineSnapshot {
  count: number;
  socketCount: number;
  users: Array<{
    id: string;
    email: string;
    nickname: string;
    avatar: string | null;
  }>;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  /** Snapshot global de métricas. */
  async getOverview(): Promise<AdminOverviewStats> {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalChronicles,
      chroniclesWithMembers,
      totalCharacters,
      pcCount,
      npcCount,
      antagonistCount,
      pendingInvitations,
      acceptedInvitations,
      totalMessages,
      totalDiceRolls,
    ] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.users.count({ where: { isActive: true } }),
      this.prisma.users.count({ where: { isAdmin: true } }),
      this.prisma.chronicle.count(),
      this.prisma.chronicle.count({
        where: { members: { some: {} } },
      }),
      this.prisma.character.count(),
      this.prisma.character.count({ where: { kind: 'PC' } }),
      this.prisma.character.count({ where: { kind: 'NPC' } }),
      this.prisma.character.count({ where: { kind: 'ANTAGONIST' } }),
      this.prisma.chronicleInvitation.count({ where: { status: 'PENDING' } }),
      this.prisma.chronicleInvitation.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.directMessage.count(),
      this.prisma.diceRoll.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        online: this.presence.onlineCount(),
      },
      chronicles: {
        total: totalChronicles,
        withMembers: chroniclesWithMembers,
      },
      characters: {
        total: totalCharacters,
        byKind: {
          PC: pcCount,
          NPC: npcCount,
          ANTAGONIST: antagonistCount,
        },
      },
      invitations: {
        pending: pendingInvitations,
        accepted: acceptedInvitations,
      },
      messages: { total: totalMessages },
      diceRolls: { total: totalDiceRolls },
    };
  }

  /**
   * Registros de usuarios por día durante los últimos `days` días.
   * Devuelve serie completa (incluye días sin altas con count=0) para que el
   * gráfico no tenga huecos.
   */
  async getRegistrationsSeries(days = 30): Promise<TimeSeriesPoint[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - (days - 1));

    const users = await this.prisma.users.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setUTCDate(from.getUTCDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const u of users) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  /** Tiradas de dados por día en los últimos `days` días. */
  async getDiceRollsSeries(days = 30): Promise<TimeSeriesPoint[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - (days - 1));

    const rolls = await this.prisma.diceRoll.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setUTCDate(from.getUTCDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rolls) {
      const key = r.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  /** Snapshot de usuarios actualmente conectados (cuenta sockets multi-tab). */
  async getOnlineSnapshot(): Promise<OnlineSnapshot> {
    const userIds = this.presence.onlineUserIds();
    if (userIds.length === 0) {
      return {
        count: 0,
        socketCount: this.presence.socketCount(),
        users: [],
      };
    }
    const users = await this.prisma.users.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
      },
    });
    return {
      count: users.length,
      socketCount: this.presence.socketCount(),
      users,
    };
  }
}
