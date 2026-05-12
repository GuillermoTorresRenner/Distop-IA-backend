import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto';
import { CharacterAbilityDto } from './dto/ability.dto';
import { CharacterBackgroundDto } from './dto/background.dto';
import { CharacterDisciplineDto } from './dto/discipline.dto';
import { CharacterMeritFlawDto } from './dto/merit-flaw.dto';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  private fullInclude() {
    return {
      nature: true,
      demeanor: true,
      clan: true,
      abilities: { orderBy: [{ category: 'asc' as const }, { name: 'asc' as const }] },
      backgrounds: { orderBy: { order: 'asc' as const } },
      disciplines: {
        include: { discipline: { include: { powers: { orderBy: { level: 'asc' as const } } } } },
      },
      meritsFlaws: { include: { meritFlaw: true } },
      chronicles: {
        include: {
          chronicle: {
            select: { id: true, name: true, setting: true },
          },
        },
      },
    } satisfies Prisma.CharacterInclude;
  }

  async create(userId: string, dto: CreateCharacterDto) {
    await this.validateCatalogIds(dto);
    const scalars = this.scalarData(dto) as Omit<CreateCharacterDto, 'abilities' | 'backgrounds' | 'disciplines' | 'meritsFlaws'>;
    return this.prisma.character.create({
      data: {
        ...scalars,
        userId,
        abilities: dto.abilities ? { create: dto.abilities.map(this.abilityCreate) } : undefined,
        backgrounds: dto.backgrounds
          ? { create: dto.backgrounds.map((b, idx) => ({ ...b, order: idx })) }
          : undefined,
        disciplines: dto.disciplines
          ? { create: dto.disciplines.map((d) => ({ disciplineId: d.disciplineId, level: d.level })) }
          : undefined,
        meritsFlaws: dto.meritsFlaws
          ? { create: dto.meritsFlaws.map((m) => ({ meritFlawId: m.meritFlawId, notes: m.notes })) }
          : undefined,
      },
      include: this.fullInclude(),
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.character.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: this.fullInclude(),
    });
  }

  async findOneOwned(id: string, userId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: this.fullInclude(),
    });
    if (!character) throw new NotFoundException('Character not found');
    if (character.userId !== userId) {
      throw new ForbiddenException('You do not own this character');
    }
    return character;
  }

  async update(id: string, userId: string, dto: UpdateCharacterDto) {
    await this.findOneOwned(id, userId);
    await this.validateCatalogIds(dto);

    // Estrategia: scalars con update; listas con replace (delete + create) en una transacción.
    return this.prisma.$transaction(async (tx) => {
      await tx.character.update({
        where: { id },
        data: this.scalarData(dto),
      });

      if (dto.abilities) {
        await tx.characterAbility.deleteMany({ where: { characterId: id } });
        if (dto.abilities.length) {
          await tx.characterAbility.createMany({
            data: dto.abilities.map((a) => ({ ...this.abilityCreate(a), characterId: id })),
          });
        }
      }

      if (dto.backgrounds) {
        await tx.characterBackground.deleteMany({ where: { characterId: id } });
        if (dto.backgrounds.length) {
          await tx.characterBackground.createMany({
            data: dto.backgrounds.map((b, idx) => ({
              characterId: id,
              name: b.name,
              level: b.level,
              notes: b.notes ?? null,
              order: idx,
            })),
          });
        }
      }

      if (dto.disciplines) {
        await tx.characterDiscipline.deleteMany({ where: { characterId: id } });
        if (dto.disciplines.length) {
          await tx.characterDiscipline.createMany({
            data: dto.disciplines.map((d) => ({
              characterId: id,
              disciplineId: d.disciplineId,
              level: d.level,
            })),
          });
        }
      }

      if (dto.meritsFlaws) {
        await tx.characterMeritFlaw.deleteMany({ where: { characterId: id } });
        if (dto.meritsFlaws.length) {
          await tx.characterMeritFlaw.createMany({
            data: dto.meritsFlaws.map((m) => ({
              characterId: id,
              meritFlawId: m.meritFlawId,
              notes: m.notes ?? null,
            })),
          });
        }
      }

      return tx.character.findUnique({ where: { id }, include: this.fullInclude() });
    });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    await this.prisma.character.delete({ where: { id } });
    return { ok: true };
  }

  async associateChronicle(characterId: string, userId: string, chronicleId: string) {
    await this.findOneOwned(characterId, userId);
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { id: true, members: { where: { userId }, select: { id: true } } },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');
    if (chronicle.members.length === 0) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }
    const existing = await this.prisma.chronicleCharacter.findUnique({
      where: { chronicleId_characterId: { chronicleId, characterId } },
    });
    if (existing) {
      throw new BadRequestException('Character is already associated with this chronicle');
    }
    await this.prisma.chronicleCharacter.create({
      data: { chronicleId, characterId },
    });
    return this.findOneOwned(characterId, userId);
  }

  async dissociateChronicle(characterId: string, userId: string, chronicleId: string) {
    await this.findOneOwned(characterId, userId);
    const deleted = await this.prisma.chronicleCharacter.deleteMany({
      where: { chronicleId, characterId },
    });
    if (deleted.count === 0) throw new NotFoundException('Association not found');
    return this.findOneOwned(characterId, userId);
  }

  // --- helpers ---

  private abilityCreate = (a: CharacterAbilityDto) => ({
    category: a.category,
    name: a.name,
    value: a.value,
    specialty: a.specialty ?? null,
  });

  private scalarData(dto: Partial<CreateCharacterDto>) {
    const {
      abilities: _a,
      backgrounds: _b,
      disciplines: _d,
      meritsFlaws: _m,
      ...rest
    } = dto;
    return rest;
  }

  private async validateCatalogIds(
    dto: Partial<CreateCharacterDto> & { abilities?: CharacterAbilityDto[] },
  ) {
    if (dto.natureId) {
      const exists = await this.prisma.archetype.findUnique({
        where: { id: dto.natureId },
        select: { id: true },
      });
      if (!exists) throw new BadRequestException('Invalid natureId');
    }
    if (dto.demeanorId) {
      const exists = await this.prisma.archetype.findUnique({
        where: { id: dto.demeanorId },
        select: { id: true },
      });
      if (!exists) throw new BadRequestException('Invalid demeanorId');
    }
    if (dto.clanId) {
      const exists = await this.prisma.clan.findUnique({
        where: { id: dto.clanId },
        select: { id: true },
      });
      if (!exists) throw new BadRequestException('Invalid clanId');
    }
    if (dto.disciplines?.length) {
      const ids = [...new Set(dto.disciplines.map((d) => d.disciplineId))];
      const found = await this.prisma.discipline.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });
      if (found.length !== ids.length) {
        throw new BadRequestException('One or more disciplineId are invalid');
      }
    }
    if (dto.meritsFlaws?.length) {
      const ids = [...new Set(dto.meritsFlaws.map((m) => m.meritFlawId))];
      const found = await this.prisma.meritFlaw.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });
      if (found.length !== ids.length) {
        throw new BadRequestException('One or more meritFlawId are invalid');
      }
    }
  }
}
