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

export const VIRTUE_KEYS = [
  'conscience',
  'self-control',
  'courage',
  'conviction',
  'instinct',
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
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const AbilitySchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'debe ser kebab-case (a-z 0-9 -)'),
  name: z.string().min(1),
  category: z.enum(['TALENT', 'SKILL', 'KNOWLEDGE']),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const HealthSchema = z.object({
  key: z.enum(HEALTH_KEYS),
  name: z.string().min(1),
  penalty: z.number().int(),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const ArchetypeSchema = z.object({
  name: z.string().min(1),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const MeritFlawSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['MERIT', 'FLAW']),
  value: z.number().int(),
  category: z.string().min(1),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const BackgroundSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, 'usa kebab-case'),
  name: z.string().min(1),
  category: z.string().optional().nullable().default(null),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const ClanSchema = z.object({
  name: z.string().min(1),
  sect: z.string().min(1),
  disciplines: z.string().min(1),
  weakness: z.string().min(1),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const DisciplinePowerSchema = z
  .object({
    level: z.number().int().min(1).max(5),
    name: z.string().min(1),
    summary: z.string().optional().nullable(),
    tooltip: z.string().optional().nullable(),
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

/// Ritual taumatúrgico/nigromántico. Cada ritual tiene su propio nivel
/// canon (1..5) y se aprende uno por uno. La `key` es estable (snake_case
/// sin acentos) y única dentro de la disciplina.
const RitualSchema = z
  .object({
    key: z
      .string()
      .min(1)
      .regex(
        /^[a-z0-9_]+$/,
        'la key debe ser snake_case en minúsculas (a-z, 0-9, _)',
      ),
    level: z.number().int().min(1).max(5),
    name: z.string().min(1),
    tooltip: z.string().optional().nullable(),
    ingredients: z.string().optional().nullable(),
    castingTime: z.string().optional().nullable(),
    rollAttribute: z.enum(ATTRIBUTE_KEYS).nullable().optional().default(null),
    rollAbility: z.string().nullable().optional().default(null),
    rollDifficulty: z.number().int().nullable().optional().default(null),
    order: z.number().int().optional().default(0),
  })
  .transform((r) => ({
    ...r,
    tooltip: r.tooltip ?? null,
    ingredients: r.ingredients ?? null,
    castingTime: r.castingTime ?? null,
    rollAttribute: r.rollAttribute ?? null,
    rollAbility: r.rollAbility ?? null,
    rollDifficulty: r.rollDifficulty ?? null,
  }));

/// Senda dentro de una disciplina ramificada (Taumaturgia, Nigromancia).
/// Cada senda tiene exactamente 5 niveles propios de poderes.
const PathSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9_]+$/,
      'la key debe ser snake_case en minúsculas (a-z, 0-9, _)',
    ),
  name: z.string().min(1),
  order: z.number().int().optional().default(0),
  tooltip: z.string().optional().nullable().default(null),
  powers: z
    .array(DisciplinePowerSchema)
    .length(5, 'cada senda debe tener exactamente los 5 niveles (1..5)'),
});

const MonolithicDisciplineSchema = z.object({
  kind: z.literal('monolithic'),
  name: z.string().min(1),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
  powers: z
    .array(DisciplinePowerSchema)
    .length(5, 'deben existir los 5 niveles (1..5)'),
});

const PathsDisciplineSchema = z.object({
  kind: z.literal('paths'),
  name: z.string().min(1),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
  paths: z.array(PathSchema).min(1, 'la disciplina con sendas debe tener al menos una senda'),
  rituals: z.array(RitualSchema).optional().default([]),
});

/// Discriminated union por `kind`: si el frontmatter omite `kind`, lo
/// completamos como 'monolithic' antes de parsear. Las disciplinas con
/// kind='paths' (Taumaturgia, Nigromancia) usan `paths` y opcionalmente
/// `rituals`; el resto sigue con `powers` lineales.
const DisciplineSchema = z.preprocess(
  (raw) => {
    if (typeof raw === 'object' && raw !== null && !('kind' in raw)) {
      return { ...raw, kind: 'monolithic' as const };
    }
    return raw;
  },
  z.discriminatedUnion('kind', [MonolithicDisciplineSchema, PathsDisciplineSchema]),
);

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
  description: z.string().optional().nullable().default(null),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const ArmorSchema = z.object({
  name: z.string().min(1),
  rating: z.number().int().min(0),
  penalty: z.number().int().min(0),
  tooltip: z.string().optional().nullable().default(null),
  order: z.number().int().optional().default(0),
});

const VirtueSchema = z.object({
  key: z.enum(VIRTUE_KEYS),
  name: z.string().min(1),
  tooltip: z.string().optional().nullable().default(null),
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
/// Record público de una disciplina ya cargada del vault. Discriminada
/// por `kind` para que el seed sepa cuáles ramas crear.
export type MonolithicDisciplineRecord = z.infer<
  typeof MonolithicDisciplineSchema
> & {
  kind: 'monolithic';
  description: string;
  /** description por poder, en orden de level (1..5). */
  powerDescriptions: Record<number, string>;
};

export type PathsDisciplineRecord = z.infer<typeof PathsDisciplineSchema> & {
  kind: 'paths';
  description: string;
  /** description por senda → level → markdown del cuerpo. */
  pathPowerDescriptions: Record<string, Record<number, string>>;
  /** description por ritual key → markdown del cuerpo. */
  ritualDescriptions: Record<string, string>;
  /** description por senda key (cabecera bajo "## Senda — {nombre}"). */
  pathDescriptions: Record<string, string>;
};

export type DisciplineRecord = MonolithicDisciplineRecord | PathsDisciplineRecord;
export type WeaponCategoryRecord = z.infer<typeof WeaponCategorySchema>;
export type WeaponRecord = z.infer<typeof WeaponSchema> & {
  description?: string | null;
  notes: string | null;
};
export type ArmorRecord = z.infer<typeof ArmorSchema> & {
  description: string;
};
export type VirtueRecord = z.infer<typeof VirtueSchema> & {
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

export function loadVirtues(): VirtueRecord[] {
  const files = listMd('virtudes');
  const out: VirtueRecord[] = files.map((f) => {
    const { frontmatter, body } = readMd(`virtudes/${f}`);
    const parsed = parseOrThrow(VirtueSchema, frontmatter, `virtudes/${f}`);
    return { ...parsed, description: body };
  });
  // Sanity: keys y names únicos.
  const seenKey = new Set<string>();
  const seenName = new Set<string>();
  for (const v of out) {
    if (seenKey.has(v.key))
      throw new Error(`vault/virtudes → key duplicada: ${v.key}`);
    if (seenName.has(v.name))
      throw new Error(`vault/virtudes → name duplicado: ${v.name}`);
    seenKey.add(v.key);
    seenName.add(v.name);
  }
  return out;
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

    if (parsed.kind === 'paths') {
      return parsePathsDiscipline(f, parsed, body, knownAbilityNames);
    }
    return parseMonolithicDiscipline(f, parsed, body, knownAbilityNames);
  });
  return out;
}

function parseMonolithicDiscipline(
  filename: string,
  parsed: z.infer<typeof MonolithicDisciplineSchema>,
  body: string,
  knownAbilityNames: Set<string>,
): MonolithicDisciplineRecord {
  // Validación cruzada: rollAbility debe referenciar una habilidad existente
  // o el propio name de la disciplina.
  for (const p of parsed.powers) {
    if (p.rollAbility) {
      const ok =
        knownAbilityNames.has(p.rollAbility) || p.rollAbility === parsed.name;
      if (!ok) {
        throw new Error(
          `vault/disciplinas/${filename} → powers[${p.level - 1}].rollAbility: "${p.rollAbility}" no existe en habilidades/ (ni coincide con el nombre de la disciplina)`,
        );
      }
    }
  }
  // Sanity: niveles 1..5 sin duplicados.
  const levels = new Set<number>();
  for (const p of parsed.powers) {
    if (levels.has(p.level)) {
      throw new Error(
        `vault/disciplinas/${filename} → nivel duplicado: ${p.level}`,
      );
    }
    levels.add(p.level);
  }
  for (let l = 1; l <= 5; l++) {
    if (!levels.has(l)) {
      throw new Error(`vault/disciplinas/${filename} → falta nivel ${l}`);
    }
  }
  const powerDescriptions = extractPowerDescriptions(body);
  // Cuerpo "principal" = todo lo antes del primer h2 numerado.
  const splitIdx = body.search(/^##\s+(?:Poder\s+)?\d/m);
  const headerBody = splitIdx === -1 ? body : body.slice(0, splitIdx).trim();
  return {
    ...parsed,
    kind: 'monolithic',
    description: headerBody,
    powerDescriptions,
  };
}

function parsePathsDiscipline(
  filename: string,
  parsed: z.infer<typeof PathsDisciplineSchema>,
  body: string,
  knownAbilityNames: Set<string>,
): PathsDisciplineRecord {
  // Keys únicas en las sendas y los rituales.
  const pathKeys = new Set<string>();
  for (const p of parsed.paths) {
    if (pathKeys.has(p.key)) {
      throw new Error(
        `vault/disciplinas/${filename} → path key duplicada: ${p.key}`,
      );
    }
    pathKeys.add(p.key);
  }
  const ritualKeys = new Set<string>();
  for (const r of parsed.rituals) {
    if (ritualKeys.has(r.key)) {
      throw new Error(
        `vault/disciplinas/${filename} → ritual key duplicada: ${r.key}`,
      );
    }
    ritualKeys.add(r.key);
  }

  // Cada senda debe tener niveles 1..5 sin huecos.
  for (const path of parsed.paths) {
    const levels = new Set<number>();
    for (const p of path.powers) {
      if (levels.has(p.level)) {
        throw new Error(
          `vault/disciplinas/${filename} → senda "${path.key}" nivel duplicado: ${p.level}`,
        );
      }
      levels.add(p.level);
      if (p.rollAbility) {
        const ok =
          knownAbilityNames.has(p.rollAbility) ||
          p.rollAbility === parsed.name;
        if (!ok) {
          throw new Error(
            `vault/disciplinas/${filename} → senda "${path.key}" powers[${p.level - 1}].rollAbility: "${p.rollAbility}" no existe en habilidades/`,
          );
        }
      }
    }
    for (let l = 1; l <= 5; l++) {
      if (!levels.has(l)) {
        throw new Error(
          `vault/disciplinas/${filename} → senda "${path.key}" falta nivel ${l}`,
        );
      }
    }
  }

  // Validación de habilidades en rituales.
  for (const r of parsed.rituals) {
    if (r.rollAbility) {
      const ok =
        knownAbilityNames.has(r.rollAbility) ||
        r.rollAbility === parsed.name;
      if (!ok) {
        throw new Error(
          `vault/disciplinas/${filename} → ritual "${r.key}".rollAbility: "${r.rollAbility}" no existe en habilidades/`,
        );
      }
    }
  }

  // Parseo del body: secciones por "## Senda — {nombre}" o "## Ritual — {nombre}"
  // y luego "### Poder N" dentro de cada senda. La cabecera previa al primer
  // ## es la `description` general de la disciplina.
  const sections = splitBodySections(body);
  return {
    ...parsed,
    kind: 'paths',
    description: sections.header,
    pathDescriptions: sections.paths,
    pathPowerDescriptions: sections.pathPowers,
    ritualDescriptions: sections.rituals,
  };
}

/**
 * Divide el cuerpo de un .md de disciplina con sendas en secciones:
 * - `header`: todo lo anterior al primer "## Senda" / "## Ritual".
 * - `paths[pathKey]`: texto bajo "## Senda — {nombre} {#key}" hasta el
 *   primer "### Poder" o el siguiente "## ".
 * - `pathPowers[pathKey][level]`: texto bajo "### Poder N" dentro de
 *   esa senda.
 * - `rituals[ritualKey]`: texto bajo "## Ritual — {nombre} {#key}".
 *
 * Reconocemos la key con el sufijo opcional `{#snake_case}` al final del
 * heading. Si no hay sufijo, intenta slugificar el nombre, pero el seed
 * fallará si no matchea con el frontmatter.
 */
function splitBodySections(body: string): {
  header: string;
  paths: Record<string, string>;
  pathPowers: Record<string, Record<number, string>>;
  rituals: Record<string, string>;
} {
  const result = {
    header: '',
    paths: {} as Record<string, string>,
    pathPowers: {} as Record<string, Record<number, string>>,
    rituals: {} as Record<string, string>,
  };
  const lines = body.split('\n');
  type Mode =
    | { kind: 'header' }
    | { kind: 'path'; key: string }
    | { kind: 'path-power'; pathKey: string; level: number }
    | { kind: 'ritual'; key: string };
  let mode: Mode = { kind: 'header' };
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    buffer = [];
    if (!text) return;
    if (mode.kind === 'header') result.header = text;
    else if (mode.kind === 'path') result.paths[mode.key] = text;
    else if (mode.kind === 'path-power') {
      (result.pathPowers[mode.pathKey] ??= {})[mode.level] = text;
    } else if (mode.kind === 'ritual') result.rituals[mode.key] = text;
  };

  const readKey = (heading: string): string | null => {
    const m = /\{#([a-z0-9_]+)\}\s*$/.exec(heading);
    return m ? m[1] : null;
  };

  for (const line of lines) {
    const sendaMatch = /^##\s+Senda\b[^{\n]*?\{#([a-z0-9_]+)\}/i.exec(line);
    const ritualMatch = /^##\s+Ritual\b[^{\n]*?\{#([a-z0-9_]+)\}/i.exec(line);
    const powerMatch = /^###\s+(?:Poder\s+)?(\d)\b/i.exec(line);
    if (sendaMatch) {
      flush();
      mode = { kind: 'path', key: sendaMatch[1] };
      continue;
    }
    if (ritualMatch) {
      flush();
      mode = { kind: 'ritual', key: ritualMatch[1] };
      continue;
    }
    if (powerMatch && (mode.kind === 'path' || mode.kind === 'path-power')) {
      const pathKey = mode.kind === 'path' ? mode.key : mode.pathKey;
      flush();
      mode = { kind: 'path-power', pathKey, level: Number(powerMatch[1]) };
      continue;
    }
    // h2 desconocido: cierra cualquier sección abierta y vuelve a header
    // (efectivamente lo ignora) para no contaminar las descripciones.
    if (/^##\s+/.test(line) && !sendaMatch && !ritualMatch) {
      flush();
      mode = { kind: 'header' };
      // No se descarta la línea — un h2 no reconocido entra al buffer
      // del header siguiente, pero como ya se vació el buffer, se ignora.
      continue;
    }
    buffer.push(line);
  }
  flush();
  // Silencia "unused" del helper readKey: se exporta como utilidad
  // para futuros parsers que extraigan keys sueltas.
  void readKey;
  return result;
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
