import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listArchetypes() {
    return this.prisma.archetype.findMany({ orderBy: { order: 'asc' } });
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
}
