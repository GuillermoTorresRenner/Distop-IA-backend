/**
 * Lee el vault de colaboración y valida cada archivo con Zod.
 * Devuelve datos tipados para que `seed.ts` los inserte en la base.
 *
 * Estructura esperada del vault:
 *
 *   prisma/vault/
 *     atributos/*.md
 *     habilidades/*.md
 *     disciplinas/*.md
 *     clanes/*.md
 *     arquetipos/*.md
 *     meritos-defectos/*.md
 *     armas/_categorias.md  (un archivo con todas las categorías)
 *     armas/*.md            (una por arma)
 *     armaduras/*.md
 *     salud/*.md
 *
 * Cada archivo tiene un frontmatter YAML + cuerpo Markdown libre.
 * El cuerpo se inyecta como `description` en la base.
 *
 * Si algo no valida, esta función lanza con un mensaje que incluye
 * archivo + ruta del campo. El seeder corta antes de tocar la DB.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

/**
 * Resuelve la ruta del vault probando varios candidatos. El seeder se ejecuta
 * en dos contextos:
 *   - dev (ts-node / tsx): `__dirname` = `<repo>/back/prisma`, el vault está
 *     en `<repo>/back/prisma/vault`.
 *   - prod (compilado): `__dirname` = `/app/dist-seed/prisma`, pero `prisma/`
 *     se copia entera al runtime stage, así que el vault está en
 *     `/app/prisma/vault`. Por eso probamos también `process.cwd()` y subir
 *     dos niveles desde dist-seed.
 */
function resolveVaultRoot(): string {
  const candidates = [
    join(__dirname, 'vault'),
    resolve(__dirname, '..', '..', 'prisma', 'vault'),
    resolve(process.cwd(), 'prisma', 'vault'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    `No se encontró el vault. Rutas probadas:\n${candidates.map((c) => `  · ${c}`).join('\n')}`,
  );
}

const VAULT_ROOT = resolveVaultRoot();

// Atributos canónicos del modelo Character. Se usan para validar
// `rollAttribute` en disciplinas y para chequear que el vault de atributos
// no inventa keys nuevas.
export const ATTRIBUTE_KEYS = [
  'strength',
  'dexterity',
  'stamina',
  'charisma',
  'manipulation',
  'appearance',
  'perception',
  'intelligence',
  'wits',
] as const;

export const HEALTH_KEYS = [
  'bruised',
  'hurt',
  'injured',
  'wounded',
  'mauled',
  'crippled',
  'incapacitated',
] as const;

// ─── Helpers ──────────────────────────────────────────────────

function readMd(relPath: string): { frontmatter: unknown; body: string } {
  const abs = join(VAULT_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`vault/${relPath} → no existe`);
  }
  const raw = readFileSync(abs, 'utf-8');
  const parsed = matter(raw);
  return { frontmatter: parsed.data, body: parsed.content.trim() };
}

function listMd(dir: string): string[] {
  const abs = join(VAULT_ROOT, dir);
  if (!existsSync(abs)) {
    throw new Error(`vault/${dir}/ → no existe`);
  }
  return readdirSync(abs)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort();
}

function parseOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fileLabel: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`vault/${fileLabel} → frontmatter inválido:\n${issues}`);
  }
  return result.data;
}

// ─── Schemas Zod ──────────────────────────────────────────────

const AttributeSchema = z.object({
  key: z.enum(ATTRIBUTE_KEYS),
  name: z.string().min(1),
  category: z.enum(['PHYSICAL', 'SOCIAL', 'MENTAL']),
  order: z.number().int().optional().default(0),
});

const AbilitySchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'debe ser kebab-case (a-z 0-9 -)'),
  name: z.string().min(1),
  category: z.enum(['TALENT', 'SKILL', 'KNOWLEDGE']),
  order: z.number().int().optional().default(0),
});

const HealthSchema = z.object({
  key: z.enum(HEALTH_KEYS),
  name: z.string().min(1),
  penalty: z.number().int(),
  order: z.number().int().optional().default(0),
});

const ArchetypeSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().optional().default(0),
});

const MeritFlawSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['MERIT', 'FLAW']),
  value: z.number().int(),
  category: z.string().min(1),
  order: z.number().int().optional().default(0),
});

const BackgroundSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, 'usa kebab-case'),
  name: z.string().min(1),
  category: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const ClanSchema = z.object({
  name: z.string().min(1),
  sect: z.string().min(1),
  disciplines: z.string().min(1),
  weakness: z.string().min(1),
  order: z.number().int().optional().default(0),
});

const DisciplinePowerSchema = z
  .object({
    level: z.number().int().min(1).max(5),
    name: z.string().min(1),
    summary: z.string().optional().nullable(),
    bloodCost: z.number().int().min(0).optional().default(0),
    rollAttribute: z
      .enum(ATTRIBUTE_KEYS)
      .nullable()
      .optional()
      .default(null),
    rollAbility: z.string().nullable().optional().default(null),
    rollDifficulty: z.number().int().nullable().optional().default(null),
  })
  // Una vez parseado: si rollAttribute es undefined → null
  .transform((p) => ({
    ...p,
    rollAttribute: p.rollAttribute ?? null,
    rollAbility: p.rollAbility ?? null,
    rollDifficulty: p.rollDifficulty ?? null,
  }));

const DisciplineSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().optional().default(0),
  powers: z.array(DisciplinePowerSchema).length(5, 'deben existir los 5 niveles (1..5)'),
});

const WeaponKindSchema = z.enum(['MELEE', 'RANGED']);
const WeaponDamageSchema = z.enum(['STRENGTH', 'FLAT']);

const WeaponCategorySchema = z.object({
  name: z.string().min(1),
  kind: WeaponKindSchema,
  order: z.number().int().optional().default(0),
});

const WeaponCategoriesFileSchema = z.object({
  categories: z.array(WeaponCategorySchema).min(1),
});

const WeaponSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  kind: WeaponKindSchema,
  damageBase: WeaponDamageSchema,
  damageBonus: z.number().int(),
  lethal: z.boolean().optional().default(false),
  aggravated: z.boolean().optional().default(false),
  bluntPlus: z.boolean().optional().default(false),
  range: z.number().int().nullable().optional().default(null),
  // Acepta string ("3", "1*") o número (YAML puede inferir tipo numérico).
  rate: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .nullable()
    .optional()
    .default(null),
  magazine: z.number().int().nullable().optional().default(null),
  concealment: z.string().nullable().optional().default(null),
  order: z.number().int().optional().default(0),
});

const ArmorSchema = z.object({
  name: z.string().min(1),
  rating: z.number().int().min(0),
  penalty: z.number().int().min(0),
  order: z.number().int().optional().default(0),
});

// ─── Tipos públicos ───────────────────────────────────────────

export type AttributeRecord = z.infer<typeof AttributeSchema> & {
  description: string;
};
export type AbilityRecord = z.infer<typeof AbilitySchema> & {
  description: string;
};
export type HealthRecord = z.infer<typeof HealthSchema> & {
  description: string;
};
export type ArchetypeRecord = z.infer<typeof ArchetypeSchema> & {
  description: string;
};
export type MeritFlawRecord = z.infer<typeof MeritFlawSchema> & {
  description: string;
};
export type BackgroundRecord = z.infer<typeof BackgroundSchema> & {
  description: string;
};
export type ClanRecord = z.infer<typeof ClanSchema> & {
  description: string;
};
export type DisciplineRecord = z.infer<typeof DisciplineSchema> & {
  description: string;
  /** description por poder, en orden de level (1..5). */
  powerDescriptions: Record<number, string>;
};
export type WeaponCategoryRecord = z.infer<typeof WeaponCategorySchema>;
export type WeaponRecord = z.infer<typeof WeaponSchema> & {
  notes: string | null;
};
export type ArmorRecord = z.infer<typeof ArmorSchema> & {
  description: string;
};

// ─── Loaders por entidad ──────────────────────────────────────

export function loadAttributes(): AttributeRecord[] {
  const files = listMd('atributos');
  const out: AttributeRecord[] = files.map((f) => {
    const { frontmatter, body } = readMd(`atributos/${f}`);
    const parsed = parseOrThrow(AttributeSchema, frontmatter, `atributos/${f}`);
    return { ...parsed, description: body };
  });
  // Sanity: las keys deben ser únicas y todas válidas.
  const seen = new Set<string>();
  for (const a of out) {
    if (seen.has(a.key)) {
      throw new Error(`vault/atributos → key duplicada: ${a.key}`);
    }
    seen.add(a.key);
  }
  return out;
}

export function loadAbilities(): AbilityRecord[] {
  const files = listMd('habilidades');
  const out: AbilityRecord[] = files.map((f) => {
    const { frontmatter, body } = readMd(`habilidades/${f}`);
    const parsed = parseOrThrow(AbilitySchema, frontmatter, `habilidades/${f}`);
    return { ...parsed, description: body };
  });
  const seenKey = new Set<string>();
  const seenName = new Set<string>();
  for (const a of out) {
    if (seenKey.has(a.key)) {
      throw new Error(`vault/habilidades → key duplicada: ${a.key}`);
    }
    if (seenName.has(a.name)) {
      throw new Error(`vault/habilidades → name duplicado: ${a.name}`);
    }
    seenKey.add(a.key);
    seenName.add(a.name);
  }
  return out;
}

export function loadHealthLevels(): HealthRecord[] {
  const files = listMd('salud');
  const out: HealthRecord[] = files.map((f) => {
    const { frontmatter, body } = readMd(`salud/${f}`);
    const parsed = parseOrThrow(HealthSchema, frontmatter, `salud/${f}`);
    return { ...parsed, description: body };
  });
  return out;
}

export function loadArchetypes(): ArchetypeRecord[] {
  const files = listMd('arquetipos');
  return files.map((f) => {
    const { frontmatter, body } = readMd(`arquetipos/${f}`);
    const parsed = parseOrThrow(ArchetypeSchema, frontmatter, `arquetipos/${f}`);
    return { ...parsed, description: body };
  });
}

export function loadMeritsFlaws(): MeritFlawRecord[] {
  const files = listMd('meritos-defectos');
  return files.map((f) => {
    const { frontmatter, body } = readMd(`meritos-defectos/${f}`);
    const parsed = parseOrThrow(
      MeritFlawSchema,
      frontmatter,
      `meritos-defectos/${f}`,
    );
    return { ...parsed, description: body };
  });
}

export function loadBackgrounds(): BackgroundRecord[] {
  const files = listMd('trasfondos');
  const out: BackgroundRecord[] = files.map((f) => {
    const { frontmatter, body } = readMd(`trasfondos/${f}`);
    const parsed = parseOrThrow(BackgroundSchema, frontmatter, `trasfondos/${f}`);
    return { ...parsed, description: body };
  });
  // Sanity: keys y names únicos.
  const seenKey = new Set<string>();
  const seenName = new Set<string>();
  for (const b of out) {
    if (seenKey.has(b.key))
      throw new Error(`vault/trasfondos → key duplicada: ${b.key}`);
    if (seenName.has(b.name))
      throw new Error(`vault/trasfondos → name duplicado: ${b.name}`);
    seenKey.add(b.key);
    seenName.add(b.name);
  }
  return out;
}

export function loadClans(): ClanRecord[] {
  const files = listMd('clanes');
  return files.map((f) => {
    const { frontmatter, body } = readMd(`clanes/${f}`);
    const parsed = parseOrThrow(ClanSchema, frontmatter, `clanes/${f}`);
    return { ...parsed, description: body };
  });
}

// Extrae los descripciones por poder del cuerpo. Convenio:
//   ## 1 — Nombre   o   ## Poder 1: Nombre
// Cualquier encabezado h2 que empiece con un número se asocia a ese nivel.
function extractPowerDescriptions(body: string): Record<number, string> {
  const out: Record<number, string> = {};
  const lines = body.split('\n');
  let current: number | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current !== null) {
      out[current] = buffer.join('\n').trim();
      buffer = [];
    }
  };
  for (const line of lines) {
    const match = /^##\s+(?:Poder\s+)?(\d)\s*[—:\-–.]?\s*/i.exec(line);
    if (match) {
      flush();
      current = Number(match[1]);
      continue;
    }
    if (current !== null) buffer.push(line);
  }
  flush();
  return out;
}

export function loadDisciplines(
  knownAbilityNames: Set<string>,
): DisciplineRecord[] {
  const files = listMd('disciplinas');
  const out: DisciplineRecord[] = files.map((f) => {
    const { frontmatter, body } = readMd(`disciplinas/${f}`);
    const parsed = parseOrThrow(
      DisciplineSchema,
      frontmatter,
      `disciplinas/${f}`,
    );
    // Validación cruzada: rollAbility debe referenciar una habilidad existente
    // o el propio name de la disciplina.
    for (const p of parsed.powers) {
      if (p.rollAbility) {
        const ok =
          knownAbilityNames.has(p.rollAbility) || p.rollAbility === parsed.name;
        if (!ok) {
          throw new Error(
            `vault/disciplinas/${f} → powers[${p.level - 1}].rollAbility: "${p.rollAbility}" no existe en habilidades/ (ni coincide con el nombre de la disciplina)`,
          );
        }
      }
    }
    // Sanity: niveles 1..5 sin duplicados.
    const levels = new Set<number>();
    for (const p of parsed.powers) {
      if (levels.has(p.level)) {
        throw new Error(
          `vault/disciplinas/${f} → nivel duplicado: ${p.level}`,
        );
      }
      levels.add(p.level);
    }
    for (let l = 1; l <= 5; l++) {
      if (!levels.has(l)) {
        throw new Error(`vault/disciplinas/${f} → falta nivel ${l}`);
      }
    }
    const powerDescriptions = extractPowerDescriptions(body);
    // Cuerpo "principal" = todo lo antes del primer h2 numerado.
    const splitIdx = body.search(/^##\s+(?:Poder\s+)?\d/m);
    const headerBody = splitIdx === -1 ? body : body.slice(0, splitIdx).trim();
    return {
      ...parsed,
      description: headerBody,
      powerDescriptions,
    };
  });
  return out;
}

export function loadWeaponCategories(): WeaponCategoryRecord[] {
  const { frontmatter } = readMd('armas/_categorias.md');
  const parsed = parseOrThrow(
    WeaponCategoriesFileSchema,
    frontmatter,
    'armas/_categorias.md',
  );
  return parsed.categories;
}

export function loadWeapons(
  categoryNames: Set<string>,
): WeaponRecord[] {
  const files = listMd('armas');
  return files.map((f) => {
    const { frontmatter, body } = readMd(`armas/${f}`);
    const parsed = parseOrThrow(WeaponSchema, frontmatter, `armas/${f}`);
    if (!categoryNames.has(parsed.category)) {
      throw new Error(
        `vault/armas/${f} → category "${parsed.category}" no existe en armas/_categorias.md`,
      );
    }
    // Extraer notes del cuerpo (cualquier bloque tipo "> nota" se conserva como notes).
    const noteMatch = body.match(/^>\s*(.+)$/m);
    return {
      ...parsed,
      notes: noteMatch ? noteMatch[1].trim() : null,
    };
  });
}

export function loadArmors(): ArmorRecord[] {
  const files = listMd('armaduras');
  return files.map((f) => {
    const { frontmatter, body } = readMd(`armaduras/${f}`);
    const parsed = parseOrThrow(ArmorSchema, frontmatter, `armaduras/${f}`);
    return { ...parsed, description: body };
  });
}
