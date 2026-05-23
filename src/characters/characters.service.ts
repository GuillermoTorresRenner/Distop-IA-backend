import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChronicleMemberRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto';
import { CharacterAbilityDto } from './dto/ability.dto';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  private fullInclude() {
    return {
      nature: true,
      demeanor: true,
      clan: true,
      abilities: {
        orderBy: [{ category: 'asc' as const }, { name: 'asc' as const }],
      },
      backgrounds: { orderBy: { order: 'asc' as const } },
      disciplines: {
        include: {
          discipline: {
            include: {
              powers: { orderBy: { level: 'asc' as const } },
              paths: {
                orderBy: { order: 'asc' as const },
                include: { powers: { orderBy: { level: 'asc' as const } } },
              },
              rituals: {
                orderBy: [{ level: 'asc' as const }, { order: 'asc' as const }],
              },
            },
          },
          paths: { include: { path: true } },
        },
      },
      disciplineRituals: { include: { ritual: true } },
      meritsFlaws: { include: { meritFlaw: true } },
      weapons: {
        orderBy: { order: 'asc' as const },
        include: { weapon: { include: { category: true } } },
      },
      armors: {
        orderBy: { order: 'asc' as const },
        include: { armor: true },
      },
      chronicles: {
        include: {
          chronicle: {
            select: { id: true, name: true, setting: true },
          },
        },
      },
      // Dueño del personaje — el frontend lo usa para pintar el campo
      // "Jugador" de la hoja con el nickname.
      user: {
        select: { id: true, email: true, nickname: true, avatar: true },
      },
    } satisfies Prisma.CharacterInclude;
  }

  async create(userId: string, dto: CreateCharacterDto) {
    // NPCs y antagonistas solo se crean en el contexto de una crónica
    // (POST /chronicles/:id/characters). Este endpoint es solo para PCs.
    const kind = dto.kind ?? 'PC';
    if (kind !== 'PC') {
      throw new ForbiddenException(
        'NPCs and antagonists must be created within a chronicle',
      );
    }
    await this.validateCatalogIds(dto, userId);
    return this.prisma.character.create({
      data: this.buildCreateData(userId, dto),
      include: this.fullInclude(),
    });
  }

  /**
   * Crea un personaje en el contexto de una crónica.
   * - El caller debe ser miembro de la crónica.
   * - Si targetUserId difiere del caller, el caller debe ser narrador.
   * - El personaje queda asociado a la crónica (ChronicleCharacter) en la misma tx.
   */
  async createForChronicle(
    callerId: string,
    chronicleId: string,
    dto: CreateCharacterDto,
    targetUserId?: string,
  ) {
    const effectiveOwnerId = targetUserId ?? callerId;
    await this.validateCatalogIds(dto, effectiveOwnerId);

    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: {
        id: true,
        narratorId: true,
        members: { select: { userId: true, role: true } },
      },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');

    const callerMembership = chronicle.members.find(
      (m) => m.userId === callerId,
    );
    if (!callerMembership) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }

    const isCallerNarrator =
      chronicle.narratorId === callerId ||
      callerMembership.role === ChronicleMemberRole.NARRATOR;

    // NPC y Antagonista solo los crea el narrador; siempre quedan bajo su propiedad
    const kind = dto.kind ?? 'PC';
    if (kind !== 'PC') {
      if (!isCallerNarrator) {
        throw new ForbiddenException(
          'Only the narrator can create NPCs or antagonists',
        );
      }
    }

    const ownerId =
      kind === 'PC' ? (targetUserId ?? callerId) : chronicle.narratorId;

    if (ownerId !== callerId && !isCallerNarrator) {
      throw new ForbiddenException(
        'Only the narrator can create a character for another player',
      );
    }

    if (kind === 'PC' && ownerId !== callerId) {
      const targetIsMember = chronicle.members.some(
        (m) => m.userId === ownerId,
      );
      if (!targetIsMember) {
        throw new BadRequestException(
          'Target user is not a member of this chronicle',
        );
      }
    }

    return this.prisma.character.create({
      data: {
        ...this.buildCreateData(ownerId, dto),
        chronicles: { create: { chronicleId } },
      },
      include: this.fullInclude(),
    });
  }

  /**
   * Clona un personaje del usuario actual. Copia la hoja completa
   * (atributos, habilidades, trasfondos, disciplinas, méritos/defectos, salud,
   * virtudes, experiencia) pero NO los vínculos a crónicas. El nombre se prefija
   * con "Copia de ".
   */
  async clone(id: string, userId: string) {
    const source = await this.findOneOwned(id, userId);

    return this.prisma.character.create({
      data: {
        userId,
        name: `Copia de ${source.name}`.slice(0, 120),
        concept: source.concept,
        chronicleName: source.chronicleName,
        generation: source.generation,
        haven: source.haven,
        clanId: source.clanId,
        natureId: source.natureId,
        demeanorId: source.demeanorId,

        strength: source.strength,
        dexterity: source.dexterity,
        stamina: source.stamina,
        charisma: source.charisma,
        manipulation: source.manipulation,
        appearance: source.appearance,
        perception: source.perception,
        intelligence: source.intelligence,
        wits: source.wits,

        virtueScheme: source.virtueScheme,
        conscience: source.conscience,
        selfControl: source.selfControl,
        courage: source.courage,

        humanity: source.humanity,
        willpowerMax: source.willpowerMax,
        willpowerCurrent: source.willpowerCurrent,
        bloodPool: source.bloodPool,

        healthBruised: source.healthBruised,
        healthHurt: source.healthHurt,
        healthInjured: source.healthInjured,
        healthWounded: source.healthWounded,
        healthMauled: source.healthMauled,
        healthCrippled: source.healthCrippled,
        healthIncapacitated: source.healthIncapacitated,

        experience: source.experience,

        abilities: source.abilities.length
          ? {
              create: source.abilities.map((a) => ({
                category: a.category,
                name: a.name,
                value: a.value,
                specialty: a.specialty,
              })),
            }
          : undefined,
        backgrounds: source.backgrounds.length
          ? {
              create: source.backgrounds.map((b, idx) => ({
                name: b.name,
                level: b.level,
                notes: b.notes,
                order: idx,
              })),
            }
          : undefined,
        disciplines: source.disciplines.length
          ? {
              create: source.disciplines.map((d) => ({
                disciplineId: d.disciplineId,
                level: d.level,
                paths: d.paths?.length
                  ? {
                      create: d.paths.map((p) => ({
                        pathId: p.pathId,
                        level: p.level,
                        isPrimary: p.isPrimary,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
        disciplineRituals: source.disciplineRituals.length
          ? {
              create: source.disciplineRituals.map((r) => ({
                ritualId: r.ritualId,
                disciplineId: r.disciplineId,
              })),
            }
          : undefined,
        meritsFlaws: source.meritsFlaws.length
          ? {
              create: source.meritsFlaws.map((m) => ({
                meritFlawId: m.meritFlawId,
                customName: m.customName,
                customKind: m.customKind,
                customValue: m.customValue,
                customCategory: m.customCategory,
                notes: m.notes,
              })),
            }
          : undefined,
      },
      include: this.fullInclude(),
    });
  }

  /**
   * Asocia un personaje existente a la crónica.
   * - Caller debe ser narrador O dueño del personaje.
   * - El dueño del personaje debe ser miembro de la crónica.
   */
  async linkExistingToChronicle(
    chronicleId: string,
    characterId: string,
    callerId: string,
  ) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, userId: true, name: true },
    });
    if (!character) throw new NotFoundException('Character not found');

    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: {
        id: true,
        narratorId: true,
        members: { select: { userId: true } },
      },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');

    const isNarrator = chronicle.narratorId === callerId;
    const isOwner = character.userId === callerId;
    if (!isNarrator && !isOwner) {
      throw new ForbiddenException(
        'Only the narrator or the character owner can associate it',
      );
    }

    const ownerIsMember = chronicle.members.some(
      (m) => m.userId === character.userId,
    );
    if (!ownerIsMember) {
      throw new BadRequestException(
        'The character owner is not a member of this chronicle',
      );
    }

    const existing = await this.prisma.chronicleCharacter.findUnique({
      where: { chronicleId_characterId: { chronicleId, characterId } },
    });
    if (existing) {
      throw new BadRequestException(
        'Character is already associated with this chronicle',
      );
    }

    await this.prisma.chronicleCharacter.create({
      data: { chronicleId, characterId },
    });
    return { ok: true };
  }

  /**
   * Desvincula un personaje de la crónica.
   * - Caller debe ser narrador O dueño del personaje.
   */
  async unlinkFromChronicle(
    chronicleId: string,
    characterId: string,
    callerId: string,
  ) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, userId: true },
    });
    if (!character) throw new NotFoundException('Character not found');

    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { id: true, narratorId: true },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');

    const isNarrator = chronicle.narratorId === callerId;
    const isOwner = character.userId === callerId;
    if (!isNarrator && !isOwner) {
      throw new ForbiddenException(
        'Only the narrator or the character owner can dissociate it',
      );
    }

    const deleted = await this.prisma.chronicleCharacter.deleteMany({
      where: { chronicleId, characterId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Association not found');
    }
    return { ok: true };
  }

  /**
   * Transfiere la propiedad de un personaje a otro miembro de la crónica.
   *
   * Solo el narrador puede ejecutar la transferencia. Las reglas:
   * - El personaje debe estar asociado a la crónica.
   * - Solo se permite transferir PCs (NPC/Antagonista siempre son del narrador).
   * - El usuario destino debe ser miembro de la crónica y distinto del actual.
   *
   * No se elimina la asociación a la crónica: solo cambia el `userId`. Si el
   * narrador transfiere uno propio (porque lo creó por nombre del jugador antes
   * del flujo de invitaciones), el nuevo dueño puede editarlo de inmediato.
   */
  async transferOwnership(
    chronicleId: string,
    characterId: string,
    callerId: string,
    targetUserId: string,
  ) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: {
        id: true,
        narratorId: true,
        members: { select: { userId: true } },
      },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');

    if (chronicle.narratorId !== callerId) {
      throw new ForbiddenException(
        'Only the narrator can transfer a character',
      );
    }

    const targetIsMember = chronicle.members.some(
      (m) => m.userId === targetUserId,
    );
    if (!targetIsMember) {
      throw new BadRequestException(
        'Target user is not a member of this chronicle',
      );
    }

    const link = await this.prisma.chronicleCharacter.findFirst({
      where: { chronicleId, characterId },
      select: {
        character: { select: { id: true, userId: true, kind: true } },
      },
    });
    if (!link) {
      throw new NotFoundException(
        'Character is not associated with this chronicle',
      );
    }
    const character = link.character;

    if (character.kind !== 'PC') {
      throw new BadRequestException(
        'NPCs and antagonists belong to the narrator and cannot be transferred',
      );
    }

    if (character.userId === targetUserId) {
      throw new BadRequestException('Character already belongs to this user');
    }

    await this.prisma.character.update({
      where: { id: characterId },
      data: { userId: targetUserId },
    });
    return { ok: true };
  }

  /**
   * Lista personajes que pueden asociarse a la crónica.
   * - Narrador: ve los de TODOS los miembros (no asociados aún).
   * - Jugador: ve solo los suyos (no asociados aún).
   */
  async findAssociableForChronicle(chronicleId: string, callerId: string) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: {
        id: true,
        narratorId: true,
        members: { select: { userId: true } },
      },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');

    const isMember = chronicle.members.some((m) => m.userId === callerId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }
    const isNarrator = chronicle.narratorId === callerId;

    const memberIds = chronicle.members.map((m) => m.userId);
    const ownerFilter: string[] = isNarrator ? memberIds : [callerId];

    const linked = await this.prisma.chronicleCharacter.findMany({
      where: { chronicleId },
      select: { characterId: true },
    });
    const linkedIds = new Set(linked.map((l) => l.characterId));

    const characters = await this.prisma.character.findMany({
      where: { userId: { in: ownerFilter } },
      orderBy: [{ userId: 'asc' }, { name: 'asc' }],
      include: {
        clan: true,
        user: {
          select: { id: true, email: true, nickname: true, avatar: true },
        },
      },
    });

    return characters.filter((c) => !linkedIds.has(c.id));
  }

  /**
   * Lista los personajes asociados a una crónica.
   * Requiere que el caller sea miembro.
   */
  async findAllForChronicle(chronicleId: string, callerId: string) {
    const membership = await this.prisma.chronicleMember.findUnique({
      where: { chronicleId_userId: { chronicleId, userId: callerId } },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { narratorId: true },
    });
    const isNarrator = chronicle?.narratorId === callerId;
    const links = await this.prisma.chronicleCharacter.findMany({
      where: {
        chronicleId,
        // Los PNJs y Antagonistas del narrador son herramientas suyas — los
        // jugadores no deben verlos en la lista de la crónica. Solo PCs son
        // públicos a toda la mesa.
        ...(isNarrator ? {} : { character: { kind: 'PC' } }),
      },
      orderBy: { joinedAt: 'asc' },
      include: {
        character: {
          include: {
            ...this.fullInclude(),
            user: {
              select: { id: true, email: true, nickname: true, avatar: true },
            },
          },
        },
      },
    });
    return links.map((link) => ({
      joinedAt: link.joinedAt,
      character: link.character,
    }));
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
    const owned = await this.findOneOwned(id, userId);
    await this.validateCatalogIds(dto, owned.userId);
    return this.applyUpdate(id, dto);
  }

  /**
   * Actualiza un personaje en el contexto de una crónica.
   * Permitido si el caller es el dueño, o si es narrador de la crónica
   * y el personaje está asociado a ella.
   */
  async updateFromChronicle(
    chronicleId: string,
    characterId: string,
    callerId: string,
    dto: UpdateCharacterDto,
  ) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { id: true, narratorId: true },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, userId: true },
    });
    if (!character) throw new NotFoundException('Character not found');

    const isOwner = character.userId === callerId;
    const isNarrator = chronicle.narratorId === callerId;
    if (!isOwner && !isNarrator) {
      throw new ForbiddenException(
        'You must be the owner or the narrator to edit this character',
      );
    }

    // Si NO es dueño, el personaje debe estar asociado a esta crónica
    // (para limitar el alcance del narrador a su propia mesa).
    if (!isOwner) {
      const link = await this.prisma.chronicleCharacter.findUnique({
        where: {
          chronicleId_characterId: { chronicleId, characterId },
        },
        select: { id: true },
      });
      if (!link) {
        throw new ForbiddenException(
          'Character is not associated with this chronicle',
        );
      }
    }

    await this.validateCatalogIds(dto, character.userId);
    return this.applyUpdate(characterId, dto);
  }

  private applyUpdate(id: string, dto: UpdateCharacterDto) {
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
            data: dto.abilities.map((a) => ({
              ...this.abilityCreate(a),
              characterId: id,
            })),
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
        // CharacterDisciplinePath está en cascade desde CharacterDiscipline,
        // así que un deleteMany de disciplines limpia también sus paths.
        await tx.characterDiscipline.deleteMany({ where: { characterId: id } });
        // Los rituales aprendidos se manejan aparte porque no caen en cascade
        // desde CharacterDiscipline (la FK está en Character).
        await tx.characterDisciplineRitual.deleteMany({
          where: { characterId: id },
        });
        for (const d of dto.disciplines) {
          await tx.characterDiscipline.create({
            data: {
              characterId: id,
              disciplineId: d.disciplineId,
              level: d.level,
              paths: d.paths?.length
                ? {
                    create: d.paths.map((p) => ({
                      pathId: p.pathId,
                      level: p.level,
                      isPrimary: p.isPrimary ?? false,
                    })),
                  }
                : undefined,
            },
          });
          if (d.learnedRitualIds?.length) {
            await tx.characterDisciplineRitual.createMany({
              data: d.learnedRitualIds.map((ritualId) => ({
                characterId: id,
                ritualId,
                disciplineId: d.disciplineId,
              })),
            });
          }
        }
      }

      if (dto.meritsFlaws) {
        await tx.characterMeritFlaw.deleteMany({ where: { characterId: id } });
        if (dto.meritsFlaws.length) {
          await tx.characterMeritFlaw.createMany({
            data: dto.meritsFlaws.map((m) => ({
              characterId: id,
              meritFlawId: m.meritFlawId ?? null,
              customName: m.customName ?? null,
              customKind: m.customKind ?? null,
              customValue: m.customValue ?? null,
              customCategory: m.customCategory ?? null,
              notes: m.notes ?? null,
            })),
          });
        }
      }

      if (dto.weapons) {
        await tx.characterWeapon.deleteMany({ where: { characterId: id } });
        if (dto.weapons.length) {
          await tx.characterWeapon.createMany({
            data: dto.weapons.map((w, idx) => ({
              characterId: id,
              weaponId: w.weaponId,
              notes: w.notes ?? null,
              order: w.order ?? idx,
            })),
          });
        }
      }

      if (dto.armors) {
        await tx.characterArmor.deleteMany({ where: { characterId: id } });
        if (dto.armors.length) {
          await tx.characterArmor.createMany({
            data: dto.armors.map((a, idx) => ({
              characterId: id,
              armorId: a.armorId,
              notes: a.notes ?? null,
              order: a.order ?? idx,
            })),
          });
        }
      }

      return tx.character.findUnique({
        where: { id },
        include: this.fullInclude(),
      });
    });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    await this.prisma.character.delete({ where: { id } });
    return { ok: true };
  }

  /**
   * Verifica que `callerId` pueda editar este personaje:
   *   - es dueño, O
   *   - es narrador de **alguna** crónica donde el personaje está asociado.
   *
   * Diseñado para mutaciones cross-crónica (subir/quitar avatar, etc.) que
   * no quieren forzar el ID de la crónica como parte de la ruta.
   */
  async assertEditable(characterId: string, callerId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        userId: true,
        avatar: true,
        chronicles: {
          select: { chronicle: { select: { narratorId: true } } },
        },
      },
    });
    if (!character) throw new NotFoundException('Character not found');
    if (character.userId === callerId) return character;

    const narratorOfLinkedChronicle = character.chronicles.some(
      (c) => c.chronicle.narratorId === callerId,
    );
    if (!narratorOfLinkedChronicle) {
      throw new ForbiddenException(
        'You must be the owner or a narrator of a linked chronicle',
      );
    }
    return character;
  }

  /** Asigna el filename del retrato y devuelve la ficha completa. */
  async setAvatar(characterId: string, callerId: string, filename: string) {
    const current = await this.assertEditable(characterId, callerId);
    if (current.avatar && current.avatar !== filename) {
      // No bloqueamos la respuesta por la limpieza del file viejo; el caller
      // (controller) puede invocar uploaderService.deleteCharacterAvatar.
    }
    await this.prisma.character.update({
      where: { id: characterId },
      data: { avatar: filename },
    });
    return {
      character: await this.prisma.character.findUnique({
        where: { id: characterId },
        include: this.fullInclude(),
      }),
      previousFilename: current.avatar ?? null,
    };
  }

  /** Quita el retrato (deja `avatar=null`) y retorna filename previo. */
  async clearAvatar(characterId: string, callerId: string) {
    const current = await this.assertEditable(characterId, callerId);
    if (!current.avatar) {
      return {
        character: await this.prisma.character.findUnique({
          where: { id: characterId },
          include: this.fullInclude(),
        }),
        previousFilename: null,
      };
    }
    await this.prisma.character.update({
      where: { id: characterId },
      data: { avatar: null },
    });
    return {
      character: await this.prisma.character.findUnique({
        where: { id: characterId },
        include: this.fullInclude(),
      }),
      previousFilename: current.avatar,
    };
  }

  async associateChronicle(
    characterId: string,
    userId: string,
    chronicleId: string,
  ) {
    await this.findOneOwned(characterId, userId);
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: {
        id: true,
        members: { where: { userId }, select: { id: true } },
      },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');
    if (chronicle.members.length === 0) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }
    const existing = await this.prisma.chronicleCharacter.findUnique({
      where: { chronicleId_characterId: { chronicleId, characterId } },
    });
    if (existing) {
      throw new BadRequestException(
        'Character is already associated with this chronicle',
      );
    }
    await this.prisma.chronicleCharacter.create({
      data: { chronicleId, characterId },
    });
    return this.findOneOwned(characterId, userId);
  }

  async dissociateChronicle(
    characterId: string,
    userId: string,
    chronicleId: string,
  ) {
    await this.findOneOwned(characterId, userId);
    const deleted = await this.prisma.chronicleCharacter.deleteMany({
      where: { chronicleId, characterId },
    });
    if (deleted.count === 0)
      throw new NotFoundException('Association not found');
    return this.findOneOwned(characterId, userId);
  }

  // --- helpers ---

  private buildCreateData(
    ownerUserId: string,
    dto: CreateCharacterDto,
  ): Prisma.CharacterCreateInput {
    const {
      abilities,
      backgrounds,
      disciplines,
      meritsFlaws,
      weapons,
      armors,
      clanId,
      natureId,
      demeanorId,
      ...scalars
    } = dto;
    return {
      ...scalars,
      user: { connect: { id: ownerUserId } },
      ...(clanId ? { clan: { connect: { id: clanId } } } : {}),
      ...(natureId ? { nature: { connect: { id: natureId } } } : {}),
      ...(demeanorId ? { demeanor: { connect: { id: demeanorId } } } : {}),
      abilities: abilities?.length
        ? { create: abilities.map(this.abilityCreate) }
        : undefined,
      backgrounds: backgrounds?.length
        ? { create: backgrounds.map((b, idx) => ({ ...b, order: idx })) }
        : undefined,
      disciplines: disciplines?.length
        ? {
            create: disciplines.map((d) => ({
              disciplineId: d.disciplineId,
              level: d.level,
              paths: d.paths?.length
                ? {
                    create: d.paths.map((p) => ({
                      pathId: p.pathId,
                      level: p.level,
                      isPrimary: p.isPrimary ?? false,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
      disciplineRituals: disciplines?.length
        ? {
            create: disciplines.flatMap((d) =>
              (d.learnedRitualIds ?? []).map((ritualId) => ({
                ritualId,
                disciplineId: d.disciplineId,
              })),
            ),
          }
        : undefined,
      meritsFlaws: meritsFlaws?.length
        ? {
            create: meritsFlaws.map((m) => ({
              meritFlawId: m.meritFlawId,
              customName: m.customName,
              customKind: m.customKind,
              customValue: m.customValue,
              customCategory: m.customCategory,
              notes: m.notes,
            })),
          }
        : undefined,
      weapons: weapons?.length
        ? {
            create: weapons.map((w, idx) => ({
              weaponId: w.weaponId,
              notes: w.notes ?? null,
              order: w.order ?? idx,
            })),
          }
        : undefined,
      armors: armors?.length
        ? {
            create: armors.map((a, idx) => ({
              armorId: a.armorId,
              notes: a.notes ?? null,
              order: a.order ?? idx,
            })),
          }
        : undefined,
    };
  }

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
      weapons: _w,
      armors: _ar,
      // `kind` no se permite mutar por PATCH (se decide al crear)
      kind: _k,
      ...rest
    } = dto;
    return rest;
  }

  private async validateCatalogIds(
    dto: Partial<CreateCharacterDto> & { abilities?: CharacterAbilityDto[] },
    ownerUserId?: string,
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
        select: { id: true, hasPaths: true, paths: { select: { id: true } } },
      });
      if (found.length !== ids.length) {
        throw new BadRequestException('One or more disciplineId are invalid');
      }
      const byId = new Map(found.map((d) => [d.id, d]));

      // Coherencia paths ↔ hasPaths y reglas V20.
      const allRitualIds = new Set<string>();
      for (const entry of dto.disciplines) {
        const catalog = byId.get(entry.disciplineId)!;
        const paths = entry.paths ?? [];
        if (catalog.hasPaths) {
          if (paths.length === 0) {
            throw new BadRequestException(
              `Discipline ${entry.disciplineId} requires at least one path with isPrimary=true`,
            );
          }
          // Cada pathId debe pertenecer a la disciplina.
          const validPathIds = new Set(catalog.paths.map((p) => p.id));
          for (const p of paths) {
            if (!validPathIds.has(p.pathId)) {
              throw new BadRequestException(
                `pathId ${p.pathId} does not belong to discipline ${entry.disciplineId}`,
              );
            }
          }
          // Exactamente una primaria.
          const primaries = paths.filter((p) => p.isPrimary === true);
          if (primaries.length !== 1) {
            throw new BadRequestException(
              `Discipline ${entry.disciplineId} must have exactly one primary path`,
            );
          }
          // Secundarias ≤ primaria.
          const primaryLevel = primaries[0].level;
          for (const p of paths) {
            if (!p.isPrimary && p.level > primaryLevel) {
              throw new BadRequestException(
                `Secondary path level (${p.level}) cannot exceed primary path level (${primaryLevel})`,
              );
            }
          }
        } else if (paths.length > 0) {
          throw new BadRequestException(
            `Discipline ${entry.disciplineId} does not support paths`,
          );
        }

        for (const r of entry.learnedRitualIds ?? []) {
          if (allRitualIds.has(r)) {
            throw new BadRequestException(`Duplicate ritualId: ${r}`);
          }
          allRitualIds.add(r);
        }
      }

      // Los rituales declarados deben pertenecer a alguna disciplina del DTO.
      if (allRitualIds.size > 0) {
        const rituals = await this.prisma.disciplineRitual.findMany({
          where: { id: { in: [...allRitualIds] } },
          select: { id: true, disciplineId: true },
        });
        if (rituals.length !== allRitualIds.size) {
          throw new BadRequestException(
            'One or more learnedRitualIds are invalid',
          );
        }
        const dtoDisciplineIds = new Set(
          dto.disciplines.map((d) => d.disciplineId),
        );
        for (const r of rituals) {
          if (!dtoDisciplineIds.has(r.disciplineId)) {
            throw new BadRequestException(
              `Ritual ${r.id} does not belong to a discipline owned by the character`,
            );
          }
        }
      }
    }
    if (dto.meritsFlaws?.length) {
      // Cada entrada debe estar en modo catálogo XOR modo custom.
      for (const m of dto.meritsFlaws) {
        const isCatalog = !!m.meritFlawId;
        const isCustom = !!m.customName || !!m.customKind || !!m.customValue;
        if (isCatalog && isCustom) {
          throw new BadRequestException(
            'Un mérito/defecto no puede ser del catálogo y custom a la vez',
          );
        }
        if (!isCatalog && !isCustom) {
          throw new BadRequestException(
            'Un mérito/defecto debe tener meritFlawId o ser custom (name+kind+value)',
          );
        }
        if (isCustom) {
          if (
            !m.customName ||
            !m.customKind ||
            typeof m.customValue !== 'number'
          ) {
            throw new BadRequestException(
              'Mérito/defecto custom requiere customName + customKind + customValue',
            );
          }
          // El signo del value debe ser coherente con el kind.
          if (m.customKind === 'MERIT' && m.customValue <= 0) {
            throw new BadRequestException(
              'customValue de un mérito debe ser positivo',
            );
          }
          if (m.customKind === 'FLAW' && m.customValue >= 0) {
            throw new BadRequestException(
              'customValue de un defecto debe ser negativo',
            );
          }
        }
      }
      const ids = dto.meritsFlaws
        .map((m) => m.meritFlawId)
        .filter((x): x is string => !!x);
      if (ids.length) {
        const unique = [...new Set(ids)];
        const found = await this.prisma.meritFlaw.findMany({
          where: { id: { in: unique } },
          select: { id: true },
        });
        if (found.length !== unique.length) {
          throw new BadRequestException('One or more meritFlawId are invalid');
        }
      }
    }
    if (dto.weapons?.length) {
      const ids = [...new Set(dto.weapons.map((w) => w.weaponId))];
      const found = await this.prisma.weapon.findMany({
        where: {
          id: { in: ids },
          ...(ownerUserId
            ? { OR: [{ system: true }, { userId: ownerUserId }] }
            : {}),
        },
        select: { id: true },
      });
      if (found.length !== ids.length) {
        throw new BadRequestException(
          'One or more weaponId are invalid or not accessible by the character owner',
        );
      }
    }
    if (dto.armors?.length) {
      const ids = [...new Set(dto.armors.map((a) => a.armorId))];
      const found = await this.prisma.armor.findMany({
        where: {
          id: { in: ids },
          ...(ownerUserId
            ? { OR: [{ system: true }, { userId: ownerUserId }] }
            : {}),
        },
        select: { id: true },
      });
      if (found.length !== ids.length) {
        throw new BadRequestException(
          'One or more armorId are invalid or not accessible by the character owner',
        );
      }
    }
  }
}
