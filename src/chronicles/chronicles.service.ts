import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChronicleMemberRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploaderService } from '../uploader/uploader.service';
import { CreateChronicleDto, UpdateChronicleDto } from './dto';

@Injectable()
export class ChroniclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploader: UploaderService,
  ) {}

  async create(narratorId: string, dto: CreateChronicleDto) {
    const chronicle = await this.prisma.chronicle.create({
      data: {
        name: dto.name,
        description: dto.description,
        setting: dto.setting,
        narratorId,
        members: {
          create: { userId: narratorId, role: ChronicleMemberRole.NARRATOR },
        },
      },
      include: this.detailInclude(),
    });

    return chronicle;
  }

  async findAllForUser(userId: string) {
    return this.prisma.chronicle.findMany({
      where: {
        members: { some: { userId } },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        narrator: {
          select: { id: true, email: true, nickname: true, avatar: true },
        },
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: { select: { id: true, email: true, nickname: true, avatar: true } },
          },
        },
        _count: {
          select: { members: true, invitations: true },
        },
      },
    });
  }

  async findOneAsMember(chronicleId: string, userId: string) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      include: this.detailInclude(),
    });

    if (!chronicle) {
      throw new NotFoundException('Chronicle not found');
    }

    const isMember = chronicle.members.some((m) => m.user.id === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }

    return chronicle;
  }

  async update(chronicleId: string, userId: string, dto: UpdateChronicleDto) {
    await this.assertNarrator(chronicleId, userId);
    return this.prisma.chronicle.update({
      where: { id: chronicleId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.setting !== undefined ? { setting: dto.setting } : {}),
      },
      include: this.detailInclude(),
    });
  }

  async remove(chronicleId: string, userId: string) {
    await this.assertNarrator(chronicleId, userId);
    const current = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { image: true },
    });
    if (current?.image) {
      await this.uploader.deleteChronicleImage(current.image);
    }
    await this.prisma.chronicle.delete({ where: { id: chronicleId } });
    return { ok: true };
  }

  async assertNarrator(chronicleId: string, userId: string) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { id: true, narratorId: true },
    });
    if (!chronicle) {
      throw new NotFoundException('Chronicle not found');
    }
    if (chronicle.narratorId !== userId) {
      throw new ForbiddenException('Only the narrator can perform this action');
    }
    return chronicle;
  }

  async setImage(chronicleId: string, userId: string, filename: string) {
    await this.assertNarrator(chronicleId, userId);
    const current = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { image: true },
    });
    if (current?.image && current.image !== filename) {
      await this.uploader.deleteChronicleImage(current.image);
    }
    return this.prisma.chronicle.update({
      where: { id: chronicleId },
      data: { image: filename },
      include: this.detailInclude(),
    });
  }

  async clearImage(chronicleId: string, userId: string) {
    await this.assertNarrator(chronicleId, userId);
    const current = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { image: true },
    });
    if (current?.image) {
      await this.uploader.deleteChronicleImage(current.image);
    }
    return this.prisma.chronicle.update({
      where: { id: chronicleId },
      data: { image: null },
      include: this.detailInclude(),
    });
  }

  async removeMember(chronicleId: string, requesterId: string, memberUserId: string) {
    const chronicle = await this.assertNarrator(chronicleId, requesterId);
    if (chronicle.narratorId === memberUserId) {
      throw new BadRequestException('Cannot remove the narrator');
    }
    const deleted = await this.prisma.chronicleMember.deleteMany({
      where: { chronicleId, userId: memberUserId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Member not found in chronicle');
    }
    return { ok: true };
  }

  private detailInclude() {
    return {
      narrator: {
        select: { id: true, email: true, nickname: true, avatar: true },
      },
      members: {
        orderBy: { joinedAt: 'asc' as const },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: { select: { id: true, email: true, nickname: true, avatar: true } },
        },
      },
      invitations: {
        where: { status: 'PENDING' as const },
        orderBy: { createdAt: 'desc' as const },
        select: {
          id: true,
          email: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          invitedUser: { select: { id: true, email: true, nickname: true, avatar: true } },
        },
      },
    };
  }
}
