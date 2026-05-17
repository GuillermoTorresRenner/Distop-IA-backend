import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArmorDto, UpdateArmorDto } from './dto/armor.dto';
import { CreateWeaponDto, UpdateWeaponDto } from './dto/weapon.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listArchetypes() {
    return this.prisma.archetype.findMany({ orderBy: { order: 'asc' } });
  }

  listAttributes() {
    return this.prisma.attributeInfo.findMany({
      orderBy: { order: 'asc' },
    });
  }

  listAbilities() {
    return this.prisma.abilityInfo.findMany({
      orderBy: { order: 'asc' },
    });
  }

  listHealthLevels() {
    return this.prisma.healthLevelInfo.findMany({
      orderBy: { order: 'asc' },
    });
  }

  listDisciplines() {
    return this.prisma.discipline.findMany({
      orderBy: { order: 'asc' },
      include: { powers: { orderBy: { level: 'asc' } } },
    });
  }

  listMeritsFlaws() {
    return this.prisma.meritFlaw.findMany({
      orderBy: [{ kind: 'asc' }, { value: 'asc' }, { name: 'asc' }],
    });
  }

  listClans() {
    return this.prisma.clan.findMany({ orderBy: { order: 'asc' } });
  }

  // ── Equipo ──

  listWeaponCategories() {
    return this.prisma.weaponCategory.findMany({
      orderBy: [{ kind: 'asc' }, { order: 'asc' }],
    });
  }

  /**
   * Devuelve armas system + customs del usuario. La UI decide cómo separar.
   */
  listWeapons(userId: string) {
    return this.prisma.weapon.findMany({
      where: { OR: [{ system: true }, { userId }] },
      orderBy: [{ system: 'desc' }, { order: 'asc' }, { name: 'asc' }],
      include: { category: true },
    });
  }

  async createWeapon(userId: string, dto: CreateWeaponDto) {
    await this.assertCategoryExists(dto.categoryId, dto.kind);
    return this.prisma.weapon.create({
      data: {
        ...dto,
        system: false,
        userId,
      },
      include: { category: true },
    });
  }

  async updateWeapon(id: string, userId: string, dto: UpdateWeaponDto) {
    const existing = await this.prisma.weapon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Weapon not found');
    if (existing.system) {
      throw new ForbiddenException('System weapons cannot be modified');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this weapon');
    }
    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId, dto.kind ?? existing.kind);
    }
    return this.prisma.weapon.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async deleteWeapon(id: string, userId: string) {
    const existing = await this.prisma.weapon.findUnique({
      where: { id },
      include: { _count: { select: { characterWeapons: true } } },
    });
    if (!existing) throw new NotFoundException('Weapon not found');
    if (existing.system) {
      throw new ForbiddenException('System weapons cannot be deleted');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this weapon');
    }
    if (existing._count.characterWeapons > 0) {
      throw new BadRequestException(
        'This weapon is in use by one or more characters and cannot be deleted',
      );
    }
    await this.prisma.weapon.delete({ where: { id } });
    return { ok: true };
  }

  listArmors(userId: string) {
    return this.prisma.armor.findMany({
      where: { OR: [{ system: true }, { userId }] },
      orderBy: [{ system: 'desc' }, { order: 'asc' }, { rating: 'asc' }],
    });
  }

  createArmor(userId: string, dto: CreateArmorDto) {
    return this.prisma.armor.create({
      data: { ...dto, system: false, userId },
    });
  }

  async updateArmor(id: string, userId: string, dto: UpdateArmorDto) {
    const existing = await this.prisma.armor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Armor not found');
    if (existing.system) {
      throw new ForbiddenException('System armors cannot be modified');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this armor');
    }
    return this.prisma.armor.update({ where: { id }, data: dto });
  }

  async deleteArmor(id: string, userId: string) {
    const existing = await this.prisma.armor.findUnique({
      where: { id },
      include: { _count: { select: { characterArmors: true } } },
    });
    if (!existing) throw new NotFoundException('Armor not found');
    if (existing.system) {
      throw new ForbiddenException('System armors cannot be deleted');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not own this armor');
    }
    if (existing._count.characterArmors > 0) {
      throw new BadRequestException(
        'This armor is in use by one or more characters and cannot be deleted',
      );
    }
    await this.prisma.armor.delete({ where: { id } });
    return { ok: true };
  }

  private async assertCategoryExists(categoryId: string, kind: string) {
    const cat = await this.prisma.weaponCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, kind: true },
    });
    if (!cat) throw new BadRequestException('Invalid categoryId');
    if (cat.kind !== kind) {
      throw new BadRequestException(
        `Category kind (${cat.kind}) does not match weapon kind (${kind})`,
      );
    }
  }
}
