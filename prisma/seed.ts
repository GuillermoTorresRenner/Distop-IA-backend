/* eslint-disable @typescript-eslint/no-floating-promises */
/**
 * Seeder de catálogo Distop-IA VTT.
 *
 * **Fuente de verdad:** los archivos Markdown bajo `prisma/vault/`. Para
 * modificar cualquier dato del juego (descripciones, mecánica de poderes,
 * datos de armas, etc.) edita el .md correspondiente y vuelve a correr
 * este seeder. Lee `prisma/vault/INSTRUCCIONES.md` para la guía completa.
 *
 * El seeder valida cada archivo con Zod antes de tocar la base. Si algo
 * está mal te lo dice en consola con archivo + campo y aborta.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  loadArchetypes,
  loadAttributes,
  loadAbilities,
  loadBackgrounds,
  loadHealthLevels,
  loadDisciplines,
  loadMeritsFlaws,
  loadClans,
  loadVirtues,
  loadWeaponCategories,
  loadWeapons,
  loadArmors,
} from './vault-loader';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function seedAttributes() {
  const items = loadAttributes();
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    await prisma.attributeInfo.upsert({
      where: { key: a.key },
      create: {
        key: a.key,
        name: a.name,
        category: a.category,
        description: a.description,
        tooltip: a.tooltip,
        order: a.order || i,
      },
      update: {
        name: a.name,
        category: a.category,
        description: a.description,
        tooltip: a.tooltip,
        order: a.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} atributos.`);
}

async function seedAbilities() {
  const items = loadAbilities();
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    await prisma.abilityInfo.upsert({
      where: { key: a.key },
      create: {
        key: a.key,
        name: a.name,
        category: a.category,
        description: a.description,
        tooltip: a.tooltip,
        order: a.order || i,
      },
      update: {
        name: a.name,
        category: a.category,
        description: a.description,
        tooltip: a.tooltip,
        order: a.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} habilidades.`);
}

async function seedHealthLevels() {
  const items = loadHealthLevels();
  for (let i = 0; i < items.length; i++) {
    const h = items[i];
    await prisma.healthLevelInfo.upsert({
      where: { key: h.key },
      create: {
        key: h.key,
        name: h.name,
        penalty: h.penalty,
        description: h.description,
        tooltip: h.tooltip,
        order: h.order || i,
      },
      update: {
        name: h.name,
        penalty: h.penalty,
        description: h.description,
        tooltip: h.tooltip,
        order: h.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} niveles de salud.`);
}

async function seedArchetypes() {
  const items = loadArchetypes();
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    await prisma.archetype.upsert({
      where: { name: a.name },
      create: {
        name: a.name,
        description: a.description,
        tooltip: a.tooltip,
        order: a.order || i,
      },
      update: { description: a.description, tooltip: a.tooltip, order: a.order || i },
    });
  }
  console.log(`✓ ${items.length} arquetipos.`);
}

async function seedMeritsFlaws() {
  const items = loadMeritsFlaws();
  for (let i = 0; i < items.length; i++) {
    const m = items[i];
    await prisma.meritFlaw.upsert({
      where: { name: m.name },
      create: {
        name: m.name,
        kind: m.kind,
        value: m.value,
        category: m.category,
        description: m.description,
        tooltip: m.tooltip,
        order: m.order || i,
      },
      update: {
        kind: m.kind,
        value: m.value,
        category: m.category,
        description: m.description,
        tooltip: m.tooltip,
        order: m.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} méritos/defectos.`);
}

async function seedBackgrounds() {
  const items = loadBackgrounds();
  for (let i = 0; i < items.length; i++) {
    const b = items[i];
    await prisma.background.upsert({
      where: { key: b.key },
      create: {
        key: b.key,
        name: b.name,
        category: b.category,
        description: b.description,
        tooltip: b.tooltip,
        order: b.order || i,
      },
      update: {
        name: b.name,
        category: b.category,
        description: b.description,
        tooltip: b.tooltip,
        order: b.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} trasfondos.`);
}

async function seedClans() {
  const items = loadClans();
  for (let i = 0; i < items.length; i++) {
    const c = items[i];
    await prisma.clan.upsert({
      where: { name: c.name },
      create: {
        name: c.name,
        sect: c.sect,
        disciplines: c.disciplines,
        weakness: c.weakness,
        description: c.description,
        tooltip: c.tooltip,
        order: c.order || i,
      },
      update: {
        sect: c.sect,
        disciplines: c.disciplines,
        weakness: c.weakness,
        description: c.description,
        tooltip: c.tooltip,
        order: c.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} clanes.`);
}

async function seedVirtues() {
  const items = loadVirtues();
  for (let i = 0; i < items.length; i++) {
    const v = items[i];
    await prisma.virtueInfo.upsert({
      where: { key: v.key },
      create: {
        key: v.key,
        name: v.name,
        description: v.description,
        tooltip: v.tooltip,
        order: v.order || i,
      },
      update: {
        name: v.name,
        description: v.description,
        tooltip: v.tooltip,
        order: v.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} virtudes.`);
}

async function seedDisciplines(abilityNames: Set<string>) {
  const items = loadDisciplines(abilityNames);
  for (let i = 0; i < items.length; i++) {
    const d = items[i];
    const hasPaths = d.kind === 'paths';
    const discipline = await prisma.discipline.upsert({
      where: { name: d.name },
      create: {
        name: d.name,
        description: d.description,
        tooltip: d.tooltip,
        order: d.order || i,
        hasPaths,
      },
      update: {
        description: d.description,
        tooltip: d.tooltip,
        order: d.order || i,
        hasPaths,
      },
    });

    if (d.kind === 'monolithic') {
      // Disciplina clásica: 5 poderes directos bajo la disciplina.
      for (const p of d.powers) {
        const description = d.powerDescriptions[p.level] ?? null;
        const mechanics = {
          summary: p.summary ?? null,
          tooltip: p.tooltip ?? null,
          bloodCost: p.bloodCost,
          rollAttribute: p.rollAttribute,
          rollAbility: p.rollAbility,
          rollDifficulty: p.rollDifficulty,
        };
        await prisma.disciplinePower.upsert({
          where: {
            disciplineId_level: {
              disciplineId: discipline.id,
              level: p.level,
            },
          },
          create: {
            disciplineId: discipline.id,
            pathId: null,
            level: p.level,
            name: p.name,
            description,
            ...mechanics,
          },
          update: {
            name: p.name,
            description,
            ...mechanics,
          },
        });
      }
      continue;
    }

    // Disciplina ramificada: cada senda con sus 5 poderes + rituales.
    // Limpiamos primero los poderes "legacy" que apuntaban directo a esta
    // disciplina (caso típico: la disciplina era monolítica y ahora pasa
    // a tener sendas). Solo eliminamos los que tienen `disciplineId` set
    // y `pathId` null — los poderes nuevos viven bajo path.
    await prisma.disciplinePower.deleteMany({
      where: { disciplineId: discipline.id, pathId: null },
    });

    // Después limpiamos sendas/rituales que ya no estén en el vault — el
    // upsert posterior recrea lo vigente.
    const vaultPathKeys = new Set(d.paths.map((p) => p.key));
    const vaultRitualKeys = new Set(d.rituals.map((r) => r.key));
    const dbPaths = await prisma.disciplinePath.findMany({
      where: { disciplineId: discipline.id },
      select: { id: true, key: true },
    });
    for (const dbPath of dbPaths) {
      if (!vaultPathKeys.has(dbPath.key)) {
        await prisma.disciplinePath.delete({ where: { id: dbPath.id } });
      }
    }
    const dbRituals = await prisma.disciplineRitual.findMany({
      where: { disciplineId: discipline.id },
      select: { id: true, key: true },
    });
    for (const dbRitual of dbRituals) {
      if (!vaultRitualKeys.has(dbRitual.key)) {
        await prisma.disciplineRitual.delete({ where: { id: dbRitual.id } });
      }
    }

    for (let pIdx = 0; pIdx < d.paths.length; pIdx++) {
      const path = d.paths[pIdx];
      const pathDescription = d.pathDescriptions[path.key] ?? null;
      const dbPath = await prisma.disciplinePath.upsert({
        where: {
          disciplineId_key: { disciplineId: discipline.id, key: path.key },
        },
        create: {
          disciplineId: discipline.id,
          key: path.key,
          name: path.name,
          description: pathDescription,
          tooltip: path.tooltip,
          order: path.order || pIdx,
        },
        update: {
          name: path.name,
          description: pathDescription,
          tooltip: path.tooltip,
          order: path.order || pIdx,
        },
      });
      for (const power of path.powers) {
        const pathPowerDescriptions =
          d.pathPowerDescriptions[path.key] ?? {};
        const description = pathPowerDescriptions[power.level] ?? null;
        const mechanics = {
          summary: power.summary ?? null,
          tooltip: power.tooltip ?? null,
          bloodCost: power.bloodCost,
          rollAttribute: power.rollAttribute,
          rollAbility: power.rollAbility,
          rollDifficulty: power.rollDifficulty,
        };
        await prisma.disciplinePower.upsert({
          where: {
            pathId_level: { pathId: dbPath.id, level: power.level },
          },
          create: {
            disciplineId: null,
            pathId: dbPath.id,
            level: power.level,
            name: power.name,
            description,
            ...mechanics,
          },
          update: {
            name: power.name,
            description,
            ...mechanics,
          },
        });
      }
    }

    for (let rIdx = 0; rIdx < d.rituals.length; rIdx++) {
      const ritual = d.rituals[rIdx];
      const description = d.ritualDescriptions[ritual.key] ?? null;
      await prisma.disciplineRitual.upsert({
        where: {
          disciplineId_key: { disciplineId: discipline.id, key: ritual.key },
        },
        create: {
          disciplineId: discipline.id,
          key: ritual.key,
          level: ritual.level,
          name: ritual.name,
          description,
          tooltip: ritual.tooltip,
          ingredients: ritual.ingredients,
          castingTime: ritual.castingTime,
          rollAttribute: ritual.rollAttribute,
          rollAbility: ritual.rollAbility,
          rollDifficulty: ritual.rollDifficulty,
          order: ritual.order || rIdx,
        },
        update: {
          level: ritual.level,
          name: ritual.name,
          description,
          tooltip: ritual.tooltip,
          ingredients: ritual.ingredients,
          castingTime: ritual.castingTime,
          rollAttribute: ritual.rollAttribute,
          rollAbility: ritual.rollAbility,
          rollDifficulty: ritual.rollDifficulty,
          order: ritual.order || rIdx,
        },
      });
    }
  }
  console.log(`✓ ${items.length} disciplinas con poderes${items.some((d) => d.kind === 'paths') ? ' / sendas / rituales' : ''}.`);
}

async function seedWeapons() {
  const categories = loadWeaponCategories();
  const categoryByName = new Map<string, string>();
  for (let i = 0; i < categories.length; i++) {
    const def = categories[i];
    const cat = await prisma.weaponCategory.upsert({
      where: { name: def.name },
      create: { name: def.name, kind: def.kind, order: def.order || i },
      update: { kind: def.kind, order: def.order || i },
    });
    categoryByName.set(def.name, cat.id);
  }

  const weapons = loadWeapons(new Set(categories.map((c) => c.name)));
  // findFirst + create/update por nombre+system (en lugar de delete+create) para
  // no romper FKs con `character_weapons` cuando hay personajes que ya tienen
  // armas system asociadas en la BD. Weapon.name no es @unique, así que no se
  // puede usar `upsert`.
  for (let idx = 0; idx < weapons.length; idx++) {
    const w = weapons[idx];
    const existing = await prisma.weapon.findFirst({
      where: { name: w.name, system: true },
    });
    const data = {
      kind: w.kind,
      categoryId: categoryByName.get(w.category)!,
      damageBase: w.damageBase,
      damageBonus: w.damageBonus,
      lethal: w.lethal,
      aggravated: w.aggravated,
      bluntPlus: w.bluntPlus,
      range: w.range,
      rate: w.rate,
      magazine: w.magazine,
      concealment: w.concealment,
      description: w.description ?? null,
      tooltip: w.tooltip,
      notes: w.notes,
      order: w.order || idx,
      system: true,
    };
    if (existing) {
      await prisma.weapon.update({ where: { id: existing.id }, data });
    } else {
      await prisma.weapon.create({ data: { name: w.name, userId: null, ...data } });
    }
  }
  console.log(
    `✓ ${categories.length} categorías de armas y ${weapons.length} armas (system).`,
  );
}

async function seedArmors() {
  const items = loadArmors();
  // findFirst + create/update por nombre+system para no romper FKs con
  // `character_armors` cuando hay personajes con armaduras system ya
  // asociadas. Armor.name no es @unique.
  for (let idx = 0; idx < items.length; idx++) {
    const a = items[idx];
    const existing = await prisma.armor.findFirst({
      where: { name: a.name, system: true },
    });
    const data = {
      rating: a.rating,
      penalty: a.penalty,
      description: a.description,
      tooltip: a.tooltip,
      order: a.order || idx,
      system: true,
    };
    if (existing) {
      await prisma.armor.update({ where: { id: existing.id }, data });
    } else {
      await prisma.armor.create({ data: { name: a.name, userId: null, ...data } });
    }
  }
  console.log(`✓ ${items.length} armaduras (system).`);
}

async function main() {
  console.log('▶ Seed Distop-IA — leyendo vault…');
  // El orden importa: las disciplinas validan contra los nombres de habilidades.
  const abilities = loadAbilities();
  const abilityNames = new Set<string>(abilities.map((a) => a.name));

  await seedAttributes();
  await seedAbilities();
  await seedHealthLevels();
  await seedArchetypes();
  await seedMeritsFlaws();
  await seedBackgrounds();
  await seedClans();
  await seedVirtues();
  await seedDisciplines(abilityNames);
  await seedWeapons();
  await seedArmors();

  console.log('✔ Seed completado.');
}

main()
  .catch((err: Error) => {
    console.error('\n✖ Seed abortado:\n');
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
