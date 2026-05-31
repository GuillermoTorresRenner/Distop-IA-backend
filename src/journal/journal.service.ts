import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { enrichUserWithAvatarUrl } from '../common/utils/avatar.utils';
import {
  CreateCharacterJournalEntryDto,
  CreateChronicleJournalEntryDto,
  UpdateCharacterJournalEntryDto,
  UpdateChronicleJournalEntryDto,
} from './dto';

const authorSelect = {
  id: true,
  email: true,
  nickname: true,
  avatar: true,
} satisfies Prisma.UsersSelect;

const characterSelect = {
  id: true,
  name: true,
  kind: true,
} satisfies Prisma.CharacterSelect;

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertMember(chronicleId: string, userId: string) {
    const member = await this.prisma.chronicleMember.findUnique({
      where: { chronicleId_userId: { chronicleId, userId } },
    });
    if (!member) {
      const chronicle = await this.prisma.chronicle.findUnique({
        where: { id: chronicleId },
        select: { id: true },
      });
      if (!chronicle) throw new NotFoundException('Chronicle not found');
      throw new ForbiddenException('You are not a member of this chronicle');
    }
    return member;
  }

  private async assertNarrator(chronicleId: string, userId: string) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { id: true, narratorId: true },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');
    if (chronicle.narratorId !== userId) {
      throw new ForbiddenException('Only the narrator can perform this action');
    }
  }

  /**
   * Verifica que `characterId` exista, sea del usuario y esté asociado a la
   * crónica. Es la única forma legal de vincular una nota personal a un
   * personaje: cada nota pertenece a un PJ específico del autor.
   */
  private async assertOwnedCharacterInChronicle(
    chronicleId: string,
    userId: string,
    characterId: string,
  ) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, userId: true },
    });
    if (!character) {
      throw new NotFoundException('Character not found');
    }
    if (character.userId !== userId) {
      throw new ForbiddenException('This character is not yours');
    }
    const link = await this.prisma.chronicleCharacter.findUnique({
      where: {
        chronicleId_characterId: { chronicleId, characterId },
      },
      select: { id: true },
    });
    if (!link) {
      throw new ForbiddenException(
        'This character is not associated with this chronicle',
      );
    }
  }

  async listChronicleEntries(chronicleId: string, userId: string) {
    await this.assertMember(chronicleId, userId);
    const [chronicleEntries, sharedCharacterEntries] = await Promise.all([
      this.prisma.chronicleJournalEntry.findMany({
        where: { chronicleId },
        include: { author: { select: authorSelect } },
        orderBy: [
          { sessionDate: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.characterJournalEntry.findMany({
        where: { chronicleId, isShared: true },
        include: {
          author: { select: authorSelect },
          character: { select: characterSelect },
        },
        orderBy: [
          { sessionDate: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
      }),
    ]);

    const all = [
      ...chronicleEntries.map((e) => ({ ...this.serializeEntry(e), entryKind: 'CHRONICLE' as const })),
      ...sharedCharacterEntries.map((e) => ({ ...this.serializeEntry(e), entryKind: 'CHARACTER' as const })),
    ].sort((a, b) => {
      // Ordena por sessionDate desc (nulls last), luego createdAt desc.
      const da = a.sessionDate ? new Date(a.sessionDate).getTime() : 0;
      const db = b.sessionDate ? new Date(b.sessionDate).getTime() : 0;
      if (da !== db) return db - da;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return all;
  }

  async createChronicleEntry(
    chronicleId: string,
    userId: string,
    dto: CreateChronicleJournalEntryDto,
  ) {
    await this.assertNarrator(chronicleId, userId);
    const entry = await this.prisma.chronicleJournalEntry.create({
      data: {
        chronicleId,
        authorId: userId,
        title: dto.title,
        body: dto.body,
        sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : null,
      },
      include: { author: { select: authorSelect } },
    });
    return this.serializeEntry(entry);
  }

  async updateChronicleEntry(
    chronicleId: string,
    entryId: string,
    userId: string,
    dto: UpdateChronicleJournalEntryDto,
  ) {
    await this.assertNarrator(chronicleId, userId);
    const entry = await this.prisma.chronicleJournalEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.chronicleId !== chronicleId) {
      throw new NotFoundException('Entry not found');
    }
    const updated = await this.prisma.chronicleJournalEntry.update({
      where: { id: entryId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.sessionDate !== undefined
          ? { sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : null }
          : {}),
      },
      include: { author: { select: authorSelect } },
    });
    return this.serializeEntry(updated);
  }

  async removeChronicleEntry(
    chronicleId: string,
    entryId: string,
    userId: string,
  ) {
    await this.assertNarrator(chronicleId, userId);
    const entry = await this.prisma.chronicleJournalEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.chronicleId !== chronicleId) {
      throw new NotFoundException('Entry not found');
    }
    await this.prisma.chronicleJournalEntry.delete({ where: { id: entryId } });
    return { ok: true };
  }

  async listCharacterEntries(chronicleId: string, userId: string) {
    await this.assertMember(chronicleId, userId);
    const entries = await this.prisma.characterJournalEntry.findMany({
      where: { chronicleId, authorId: userId },
      include: {
        author: { select: authorSelect },
        character: { select: characterSelect },
      },
      orderBy: [
        { sessionDate: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
    return entries.map((e) => this.serializeEntry(e));
  }

  async createCharacterEntry(
    chronicleId: string,
    userId: string,
    dto: CreateCharacterJournalEntryDto,
  ) {
    await this.assertMember(chronicleId, userId);
    await this.assertOwnedCharacterInChronicle(
      chronicleId,
      userId,
      dto.characterId,
    );
    const entry = await this.prisma.characterJournalEntry.create({
      data: {
        chronicleId,
        authorId: userId,
        characterId: dto.characterId,
        title: dto.title,
        body: dto.body,
        sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : null,
      },
      include: {
        author: { select: authorSelect },
        character: { select: characterSelect },
      },
    });
    return this.serializeEntry(entry);
  }

  async updateCharacterEntry(
    chronicleId: string,
    entryId: string,
    userId: string,
    dto: UpdateCharacterJournalEntryDto,
  ) {
    const entry = await this.prisma.characterJournalEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.chronicleId !== chronicleId) {
      throw new NotFoundException('Entry not found');
    }
    if (entry.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own entries');
    }
    if (dto.characterId !== undefined) {
      await this.assertOwnedCharacterInChronicle(
        chronicleId,
        userId,
        dto.characterId,
      );
    }
    const updated = await this.prisma.characterJournalEntry.update({
      where: { id: entryId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.sessionDate !== undefined
          ? { sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : null }
          : {}),
        ...(dto.characterId !== undefined
          ? { characterId: dto.characterId }
          : {}),
      },
      include: {
        author: { select: authorSelect },
        character: { select: characterSelect },
      },
    });
    return this.serializeEntry(updated);
  }

  /**
   * Activa o desactiva la visibilidad pública de una nota de personaje.
   * Solo el autor puede cambiar este flag. Cuando isShared=true la entrada
   * aparece en la bitácora de la crónica para todos los miembros.
   */
  async shareCharacterEntry(
    chronicleId: string,
    entryId: string,
    userId: string,
    isShared: boolean,
  ) {
    const entry = await this.prisma.characterJournalEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.chronicleId !== chronicleId) {
      throw new NotFoundException('Entry not found');
    }
    if (entry.authorId !== userId) {
      throw new ForbiddenException('You can only share your own entries');
    }
    const updated = await this.prisma.characterJournalEntry.update({
      where: { id: entryId },
      data: { isShared },
      include: {
        author: { select: authorSelect },
        character: { select: characterSelect },
      },
    });
    return this.serializeEntry(updated);
  }

  async removeCharacterEntry(
    chronicleId: string,
    entryId: string,
    userId: string,
  ) {
    const entry = await this.prisma.characterJournalEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.chronicleId !== chronicleId) {
      throw new NotFoundException('Entry not found');
    }
    if (entry.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own entries');
    }
    await this.prisma.characterJournalEntry.delete({ where: { id: entryId } });
    return { ok: true };
  }

  async listMyJournal(userId: string) {
    const [chronicleEntries, characterEntries] = await Promise.all([
      this.prisma.chronicleJournalEntry.findMany({
        where: { chronicle: { members: { some: { userId } } } },
        include: {
          author: { select: authorSelect },
          chronicle: { select: { id: true, name: true } },
        },
        orderBy: [
          { sessionDate: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        take: 30,
      }),
      this.prisma.characterJournalEntry.findMany({
        where: { authorId: userId },
        include: {
          author: { select: authorSelect },
          chronicle: { select: { id: true, name: true } },
          character: { select: characterSelect },
        },
        orderBy: [
          { sessionDate: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        take: 30,
      }),
    ]);
    return {
      chronicle: chronicleEntries.map((e) =>
        this.serializeFeedEntry(e, 'CHRONICLE'),
      ),
      character: characterEntries.map((e) =>
        this.serializeFeedEntry(e, 'CHARACTER'),
      ),
    };
  }

  private serializeEntry(
    e:
      | Prisma.ChronicleJournalEntryGetPayload<{
          include: { author: { select: typeof authorSelect } };
        }>
      | Prisma.CharacterJournalEntryGetPayload<{
          include: {
            author: { select: typeof authorSelect };
            character: { select: typeof characterSelect };
          };
        }>,
  ) {
    return {
      id: e.id,
      chronicleId: e.chronicleId,
      title: e.title,
      body: e.body,
      sessionDate: e.sessionDate,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      author: enrichUserWithAvatarUrl(e.author),
      character: 'character' in e ? e.character : null,
      isShared: 'isShared' in e ? e.isShared : null,
    };
  }

  private serializeFeedEntry(
    e:
      | Prisma.ChronicleJournalEntryGetPayload<{
          include: {
            author: { select: typeof authorSelect };
            chronicle: { select: { id: true; name: true } };
          };
        }>
      | Prisma.CharacterJournalEntryGetPayload<{
          include: {
            author: { select: typeof authorSelect };
            chronicle: { select: { id: true; name: true } };
            character: { select: typeof characterSelect };
          };
        }>,
    kind: 'CHRONICLE' | 'CHARACTER',
  ) {
    return {
      id: e.id,
      kind,
      chronicle: e.chronicle,
      title: e.title,
      body: e.body,
      sessionDate: e.sessionDate,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      author: enrichUserWithAvatarUrl(e.author),
      character: 'character' in e ? e.character : null,
    };
  }
}
