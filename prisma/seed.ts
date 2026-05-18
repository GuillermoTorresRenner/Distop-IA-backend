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
        order: a.order || i,
      },
      update: {
        name: a.name,
        category: a.category,
        description: a.description,
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
        order: a.order || i,
      },
      update: {
        name: a.name,
        category: a.category,
        description: a.description,
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
        order: h.order || i,
      },
      update: {
        name: h.name,
        penalty: h.penalty,
        description: h.description,
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
      create: { name: a.name, description: a.description, order: a.order || i },
      update: { description: a.description, order: a.order || i },
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
        order: m.order || i,
      },
      update: {
        kind: m.kind,
        value: m.value,
        category: m.category,
        description: m.description,
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
        order: b.order || i,
      },
      update: {
        name: b.name,
        category: b.category,
        description: b.description,
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
        order: c.order || i,
      },
      update: {
        sect: c.sect,
        disciplines: c.disciplines,
        weakness: c.weakness,
        description: c.description,
        order: c.order || i,
      },
    });
  }
  console.log(`✓ ${items.length} clanes.`);
}

async function seedDisciplines(abilityNames: Set<string>) {
  const items = loadDisciplines(abilityNames);
  for (let i = 0; i < items.length; i++) {
    const d = items[i];
    const discipline = await prisma.discipline.upsert({
      where: { name: d.name },
      create: { name: d.name, description: d.description, order: d.order || i },
      update: { description: d.description, order: d.order || i },
    });
    for (const p of d.powers) {
      const description = d.powerDescriptions[p.level] ?? null;
      const mechanics = {
        summary: p.summary ?? null,
        bloodCost: p.bloodCost,
        rollAttribute: p.rollAttribute,
        rollAbility: p.rollAbility,
        rollDifficulty: p.rollDifficulty,
      };
      await prisma.disciplinePower.upsert({
        where: {
          disciplineId_level: { disciplineId: discipline.id, level: p.level },
        },
        create: {
          disciplineId: discipline.id,
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
  }
  console.log(`✓ ${items.length} disciplinas con poderes.`);
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
  await prisma.weapon.deleteMany({ where: { system: true } });
  await prisma.weapon.createMany({
    data: weapons.map((w, idx) => ({
      name: w.name,
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
      notes: w.notes,
      order: w.order || idx,
      system: true,
      userId: null,
    })),
  });
  console.log(
    `✓ ${categories.length} categorías de armas y ${weapons.length} armas (system).`,
  );
}

async function seedArmors() {
  const items = loadArmors();
  await prisma.armor.deleteMany({ where: { system: true } });
  await prisma.armor.createMany({
    data: items.map((a, idx) => ({
      name: a.name,
      rating: a.rating,
      penalty: a.penalty,
      description: a.description,
      order: a.order || idx,
      system: true,
      userId: null,
    })),
  });
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
