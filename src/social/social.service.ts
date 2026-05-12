import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { enrichUserWithAvatarUrl } from '../common/utils/avatar.utils';
import { SearchUsersDto } from './dto';

const userSummarySelect = {
  id: true,
  email: true,
  nickname: true,
  avatar: true,
} satisfies Prisma.UsersSelect;

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(currentUserId: string, dto: SearchUsersDto) {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UsersWhereInput = {
      id: { not: currentUserId },
      isActive: true,
      ...(dto.q
        ? {
            OR: [
              { email: { contains: dto.q, mode: 'insensitive' } },
              { nickname: { contains: dto.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: pageSize,
        select: userSummarySelect,
        orderBy: { email: 'asc' },
      }),
      this.prisma.users.count({ where }),
    ]);

    const userIds = users.map((u) => u.id);
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: { in: userIds } },
          { addresseeId: currentUserId, requesterId: { in: userIds } },
        ],
      },
    });

    const data = users.map((u) => {
      const f = friendships.find(
        (fr) =>
          (fr.requesterId === currentUserId && fr.addresseeId === u.id) ||
          (fr.addresseeId === currentUserId && fr.requesterId === u.id),
      );
      let relation: 'NONE' | 'OUTGOING' | 'INCOMING' | 'FRIENDS' | 'DECLINED' =
        'NONE';
      if (f) {
        if (f.status === FriendshipStatus.ACCEPTED) relation = 'FRIENDS';
        else if (f.status === FriendshipStatus.PENDING)
          relation =
            f.requesterId === currentUserId ? 'OUTGOING' : 'INCOMING';
        else if (f.status === FriendshipStatus.DECLINED) relation = 'DECLINED';
      }
      return { ...enrichUserWithAvatarUrl(u), relation };
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async request(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot send a friendship request to yourself');
    }
    const target = await this.prisma.users.findUnique({
      where: { id: addresseeId },
      select: { id: true, isActive: true },
    });
    if (!target || target.isActive === false) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('You are already friends');
      }
      if (existing.status === FriendshipStatus.PENDING) {
        if (existing.requesterId === requesterId) {
          throw new BadRequestException('Friendship request already pending');
        }
        const updated = await this.prisma.friendship.update({
          where: { id: existing.id },
          data: {
            status: FriendshipStatus.ACCEPTED,
            acceptedAt: new Date(),
          },
          include: this.friendshipInclude(),
        });
        return this.serializeFriendship(updated);
      }
      const recreated = await this.prisma.friendship.update({
        where: { id: existing.id },
        data: {
          requesterId,
          addresseeId,
          status: FriendshipStatus.PENDING,
          acceptedAt: null,
        },
        include: this.friendshipInclude(),
      });
      return this.serializeFriendship(recreated);
    }

    const created = await this.prisma.friendship.create({
      data: { requesterId, addresseeId },
      include: this.friendshipInclude(),
    });
    return this.serializeFriendship(created);
  }

  async accept(currentUserId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }
    if (friendship.addresseeId !== currentUserId) {
      throw new ForbiddenException('You cannot accept this request');
    }
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Friendship is not pending');
    }
    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: FriendshipStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: this.friendshipInclude(),
    });
    return this.serializeFriendship(updated);
  }

  async decline(currentUserId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }
    if (friendship.addresseeId !== currentUserId) {
      throw new ForbiddenException('You cannot decline this request');
    }
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Friendship is not pending');
    }
    await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.DECLINED },
    });
    return { ok: true };
  }

  async remove(currentUserId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }
    if (
      friendship.requesterId !== currentUserId &&
      friendship.addresseeId !== currentUserId
    ) {
      throw new ForbiddenException('You are not part of this friendship');
    }
    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return { ok: true };
  }

  async listFriends(currentUserId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      },
      include: this.friendshipInclude(),
      orderBy: { acceptedAt: 'desc' },
    });
    return friendships.map((f) => this.serializeFriendship(f));
  }

  async listIncoming(currentUserId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.PENDING,
        addresseeId: currentUserId,
      },
      include: this.friendshipInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return friendships.map((f) => this.serializeFriendship(f));
  }

  async listOutgoing(currentUserId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.PENDING,
        requesterId: currentUserId,
      },
      include: this.friendshipInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return friendships.map((f) => this.serializeFriendship(f));
  }

  private friendshipInclude() {
    return {
      requester: { select: userSummarySelect },
      addressee: { select: userSummarySelect },
    };
  }

  private serializeFriendship(
    f: Prisma.FriendshipGetPayload<{
      include: {
        requester: { select: typeof userSummarySelect };
        addressee: { select: typeof userSummarySelect };
      };
    }>,
  ) {
    return {
      id: f.id,
      status: f.status,
      createdAt: f.createdAt,
      acceptedAt: f.acceptedAt,
      requester: enrichUserWithAvatarUrl(f.requester),
      addressee: enrichUserWithAvatarUrl(f.addressee),
    };
  }
}
