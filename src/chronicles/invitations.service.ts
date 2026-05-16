import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  ChronicleInvitationStatus,
  ChronicleMemberRole,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { enrichUserWithAvatarUrl } from '../common/utils/avatar.utils';
import { envs } from '../config/envs';
import { ChroniclesService } from './chronicles.service';

const INVITE_TTL_HOURS = 168;
const INVITABLE_RESULT_LIMIT = 10;

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly chronicles: ChroniclesService,
  ) {}

  async invite(
    chronicleId: string,
    narratorId: string,
    payload: { email?: string; userId?: string },
  ) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      include: {
        narrator: { select: { id: true, email: true, nickname: true } },
      },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');
    if (chronicle.narratorId !== narratorId) {
      throw new ForbiddenException('Only the narrator can invite players');
    }

    let existingUser: { id: string; email: string } | null = null;
    let normalizedEmail: string;

    if (payload.userId) {
      const target = await this.prisma.users.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, isActive: true },
      });
      if (!target || target.isActive === false) {
        throw new NotFoundException('User not found');
      }
      existingUser = { id: target.id, email: target.email };
      normalizedEmail = target.email.toLowerCase();
    } else {
      if (!payload.email) {
        throw new BadRequestException('email or userId is required');
      }
      normalizedEmail = payload.email.trim().toLowerCase();
      existingUser = await this.prisma.users.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true },
      });
    }

    if (normalizedEmail === chronicle.narrator.email.toLowerCase()) {
      throw new BadRequestException('The narrator is already a member');
    }

    if (existingUser) {
      const alreadyMember = await this.prisma.chronicleMember.findUnique({
        where: {
          chronicleId_userId: {
            chronicleId,
            userId: existingUser.id,
          },
        },
      });
      if (alreadyMember) {
        throw new BadRequestException('User already a member of this chronicle');
      }
    }

    const pendingDuplicate = await this.prisma.chronicleInvitation.findFirst({
      where: {
        chronicleId,
        email: normalizedEmail,
        status: ChronicleInvitationStatus.PENDING,
      },
    });
    if (pendingDuplicate) {
      throw new BadRequestException('An invitation is already pending for this email');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);

    const invitation = await this.prisma.chronicleInvitation.create({
      data: {
        token,
        chronicleId,
        email: normalizedEmail,
        invitedById: narratorId,
        invitedUserId: existingUser?.id ?? null,
        expiresAt,
      },
      include: {
        invitedUser: { select: { id: true, email: true, nickname: true, avatar: true } },
      },
    });

    const inviterEmail = chronicle.narrator.email;
    const inviterNickname = chronicle.narrator.nickname;
    const chronicleName = chronicle.name;
    const baseUrl = envs.frontendUrl ?? '';

    if (existingUser) {
      const acceptUrl = `${baseUrl}/invitations/${token}`;
      this.mail
        .sendChronicleInviteExisting(
          normalizedEmail,
          inviterNickname,
          inviterEmail,
          chronicleName,
          acceptUrl,
          expiresAt,
        )
        .catch((err) =>
          this.logger.error(`Failed to send existing-user invite to ${normalizedEmail}`, err),
        );
    } else {
      const registerUrl = `${baseUrl}/register?invite=${token}`;
      this.mail
        .sendChronicleInviteNew(
          normalizedEmail,
          inviterNickname,
          inviterEmail,
          chronicleName,
          registerUrl,
          expiresAt,
        )
        .catch((err) =>
          this.logger.error(`Failed to send new-user invite to ${normalizedEmail}`, err),
        );
    }

    return invitation;
  }

  async cancel(chronicleId: string, narratorId: string, invitationId: string) {
    await this.chronicles.assertNarrator(chronicleId, narratorId);
    const invitation = await this.prisma.chronicleInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation || invitation.chronicleId !== chronicleId) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== ChronicleInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }
    await this.prisma.chronicleInvitation.update({
      where: { id: invitationId },
      data: { status: ChronicleInvitationStatus.CANCELLED },
    });
    return { ok: true };
  }

  async findByToken(token: string) {
    const invitation = await this.prisma.chronicleInvitation.findUnique({
      where: { token },
      include: {
        chronicle: {
          select: { id: true, name: true, description: true, setting: true },
        },
        invitedBy: { select: { id: true, email: true, nickname: true, avatar: true } },
      },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

    const effectiveStatus =
      invitation.status === ChronicleInvitationStatus.PENDING &&
      invitation.expiresAt < new Date()
        ? ChronicleInvitationStatus.EXPIRED
        : invitation.status;

    return {
      id: invitation.id,
      email: invitation.email,
      status: effectiveStatus,
      expiresAt: invitation.expiresAt,
      chronicle: invitation.chronicle,
      invitedBy: invitation.invitedBy,
    };
  }

  async findForUser(userId: string, userEmail: string) {
    return this.prisma.chronicleInvitation.findMany({
      where: {
        status: ChronicleInvitationStatus.PENDING,
        OR: [{ invitedUserId: userId }, { email: userEmail.toLowerCase() }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        chronicle: { select: { id: true, name: true, setting: true } },
        invitedBy: { select: { id: true, email: true, nickname: true } },
      },
    });
  }

  async accept(token: string, userId: string, userEmail: string) {
    const invitation = await this.prisma.chronicleInvitation.findUnique({
      where: { token },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== ChronicleInvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }
    if (invitation.expiresAt < new Date()) {
      await this.prisma.chronicleInvitation.update({
        where: { id: invitation.id },
        data: { status: ChronicleInvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException('Invitation does not match your account email');
    }

    const existingMember = await this.prisma.chronicleMember.findUnique({
      where: {
        chronicleId_userId: {
          chronicleId: invitation.chronicleId,
          userId,
        },
      },
    });

    if (!existingMember) {
      await this.prisma.chronicleMember.create({
        data: {
          chronicleId: invitation.chronicleId,
          userId,
          role: ChronicleMemberRole.PLAYER,
        },
      });
    }

    await this.prisma.chronicleInvitation.update({
      where: { id: invitation.id },
      data: {
        status: ChronicleInvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
        invitedUserId: userId,
      },
    });

    return {
      ok: true,
      chronicleId: invitation.chronicleId,
    };
  }

  async searchInvitable(
    chronicleId: string,
    narratorId: string,
    rawQuery: string,
  ) {
    await this.chronicles.assertNarrator(chronicleId, narratorId);
    const q = rawQuery.trim();
    if (q.length < 2) return [];

    const [members, pendingInvites] = await Promise.all([
      this.prisma.chronicleMember.findMany({
        where: { chronicleId },
        select: { userId: true },
      }),
      this.prisma.chronicleInvitation.findMany({
        where: {
          chronicleId,
          status: ChronicleInvitationStatus.PENDING,
        },
        select: { email: true, invitedUserId: true },
      }),
    ]);

    const excludeUserIds = new Set<string>(members.map((m) => m.userId));
    for (const inv of pendingInvites) {
      if (inv.invitedUserId) excludeUserIds.add(inv.invitedUserId);
    }
    const excludeEmails = new Set<string>(
      pendingInvites.map((i) => i.email.toLowerCase()),
    );

    const where: Prisma.UsersWhereInput = {
      isActive: true,
      id: { notIn: Array.from(excludeUserIds) },
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { nickname: { contains: q, mode: 'insensitive' } },
      ],
    };

    const matches = await this.prisma.users.findMany({
      where,
      take: INVITABLE_RESULT_LIMIT,
      orderBy: [{ nickname: 'asc' }, { email: 'asc' }],
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
      },
    });

    return matches
      .filter((u) => !excludeEmails.has(u.email.toLowerCase()))
      .map((u) => enrichUserWithAvatarUrl(u));
  }
}
