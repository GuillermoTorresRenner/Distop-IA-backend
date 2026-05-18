"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIRTUE_KEYS = exports.HEALTH_KEYS = exports.ATTRIBUTE_KEYS = void 0;
exports.loadAttributes = loadAttributes;
exports.loadAbilities = loadAbilities;
exports.loadHealthLevels = loadHealthLevels;
exports.loadArchetypes = loadArchetypes;
exports.loadMeritsFlaws = loadMeritsFlaws;
exports.loadBackgrounds = loadBackgrounds;
exports.loadClans = loadClans;
exports.loadVirtues = loadVirtues;
exports.loadDisciplines = loadDisciplines;
exports.loadWeaponCategories = loadWeaponCategories;
exports.loadWeapons = loadWeapons;
exports.loadArmors = loadArmors;
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
const fs_1 = require("fs");
const path_1 = require("path");
const gray_matter_1 = __importDefault(require("gray-matter"));
const zod_1 = require("zod");
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
function resolveVaultRoot() {
    const candidates = [
        (0, path_1.join)(__dirname, 'vault'),
        (0, path_1.resolve)(__dirname, '..', '..', 'prisma', 'vault'),
        (0, path_1.resolve)(process.cwd(), 'prisma', 'vault'),
    ];
    for (const p of candidates) {
        if ((0, fs_1.existsSync)(p))
            return p;
    }
    throw new Error(`No se encontró el vault. Rutas probadas:\n${candidates.map((c) => `  · ${c}`).join('\n')}`);
}
const VAULT_ROOT = resolveVaultRoot();
// Atributos canónicos del modelo Character. Se usan para validar
// `rollAttribute` en disciplinas y para chequear que el vault de atributos
// no inventa keys nuevas.
exports.ATTRIBUTE_KEYS = [
    'strength',
    'dexterity',
    'stamina',
    'charisma',
    'manipulation',
    'appearance',
    'perception',
    'intelligence',
    'wits',
];
exports.HEALTH_KEYS = [
    'bruised',
    'hurt',
    'injured',
    'wounded',
    'mauled',
    'crippled',
    'incapacitated',
];
exports.VIRTUE_KEYS = [
    'conscience',
    'self-control',
    'courage',
    'conviction',
    'instinct',
];
// ─── Helpers ──────────────────────────────────────────────────
function readMd(relPath) {
    const abs = (0, path_1.join)(VAULT_ROOT, relPath);
    if (!(0, fs_1.existsSync)(abs)) {
        throw new Error(`vault/${relPath} → no existe`);
    }
    const raw = (0, fs_1.readFileSync)(abs, 'utf-8');
    const parsed = (0, gray_matter_1.default)(raw);
    return { frontmatter: parsed.data, body: parsed.content.trim() };
}
function listMd(dir) {
    const abs = (0, path_1.join)(VAULT_ROOT, dir);
    if (!(0, fs_1.existsSync)(abs)) {
        throw new Error(`vault/${dir}/ → no existe`);
    }
    return (0, fs_1.readdirSync)(abs)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
        .sort();
}
function parseOrThrow(schema, data, fileLabel) {
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
const AttributeSchema = zod_1.z.object({
    key: zod_1.z.enum(exports.ATTRIBUTE_KEYS),
    name: zod_1.z.string().min(1),
    category: zod_1.z.enum(['PHYSICAL', 'SOCIAL', 'MENTAL']),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const AbilitySchema = zod_1.z.object({
    key: zod_1.z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, 'debe ser kebab-case (a-z 0-9 -)'),
    name: zod_1.z.string().min(1),
    category: zod_1.z.enum(['TALENT', 'SKILL', 'KNOWLEDGE']),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const HealthSchema = zod_1.z.object({
    key: zod_1.z.enum(exports.HEALTH_KEYS),
    name: zod_1.z.string().min(1),
    penalty: zod_1.z.number().int(),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const ArchetypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const MeritFlawSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    kind: zod_1.z.enum(['MERIT', 'FLAW']),
    value: zod_1.z.number().int(),
    category: zod_1.z.string().min(1),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const BackgroundSchema = zod_1.z.object({
    key: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/, 'usa kebab-case'),
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().optional().nullable().default(null),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const ClanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sect: zod_1.z.string().min(1),
    disciplines: zod_1.z.string().min(1),
    weakness: zod_1.z.string().min(1),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const DisciplinePowerSchema = zod_1.z
    .object({
    level: zod_1.z.number().int().min(1).max(5),
    name: zod_1.z.string().min(1),
    summary: zod_1.z.string().optional().nullable(),
    tooltip: zod_1.z.string().optional().nullable(),
    bloodCost: zod_1.z.number().int().min(0).optional().default(0),
    rollAttribute: zod_1.z
        .enum(exports.ATTRIBUTE_KEYS)
        .nullable()
        .optional()
        .default(null),
    rollAbility: zod_1.z.string().nullable().optional().default(null),
    rollDifficulty: zod_1.z.number().int().nullable().optional().default(null),
})
    // Una vez parseado: si rollAttribute es undefined → null
    .transform((p) => ({
    ...p,
    rollAttribute: p.rollAttribute ?? null,
    rollAbility: p.rollAbility ?? null,
    rollDifficulty: p.rollDifficulty ?? null,
}));
const DisciplineSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
    powers: zod_1.z.array(DisciplinePowerSchema).length(5, 'deben existir los 5 niveles (1..5)'),
});
const WeaponKindSchema = zod_1.z.enum(['MELEE', 'RANGED']);
const WeaponDamageSchema = zod_1.z.enum(['STRENGTH', 'FLAT']);
const WeaponCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    kind: WeaponKindSchema,
    order: zod_1.z.number().int().optional().default(0),
});
const WeaponCategoriesFileSchema = zod_1.z.object({
    categories: zod_1.z.array(WeaponCategorySchema).min(1),
});
const WeaponSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    kind: WeaponKindSchema,
    damageBase: WeaponDamageSchema,
    damageBonus: zod_1.z.number().int(),
    lethal: zod_1.z.boolean().optional().default(false),
    aggravated: zod_1.z.boolean().optional().default(false),
    bluntPlus: zod_1.z.boolean().optional().default(false),
    range: zod_1.z.number().int().nullable().optional().default(null),
    // Acepta string ("3", "1*") o número (YAML puede inferir tipo numérico).
    rate: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((v) => String(v))
        .nullable()
        .optional()
        .default(null),
    magazine: zod_1.z.number().int().nullable().optional().default(null),
    concealment: zod_1.z.string().nullable().optional().default(null),
    description: zod_1.z.string().optional().nullable().default(null),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const ArmorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(0),
    penalty: zod_1.z.number().int().min(0),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
const VirtueSchema = zod_1.z.object({
    key: zod_1.z.enum(exports.VIRTUE_KEYS),
    name: zod_1.z.string().min(1),
    tooltip: zod_1.z.string().optional().nullable().default(null),
    order: zod_1.z.number().int().optional().default(0),
});
// ─── Loaders por entidad ──────────────────────────────────────
function loadAttributes() {
    const files = listMd('atributos');
    const out = files.map((f) => {
        const { frontmatter, body } = readMd(`atributos/${f}`);
        const parsed = parseOrThrow(AttributeSchema, frontmatter, `atributos/${f}`);
        return { ...parsed, description: body };
    });
    // Sanity: las keys deben ser únicas y todas válidas.
    const seen = new Set();
    for (const a of out) {
        if (seen.has(a.key)) {
            throw new Error(`vault/atributos → key duplicada: ${a.key}`);
        }
        seen.add(a.key);
    }
    return out;
}
function loadAbilities() {
    const files = listMd('habilidades');
    const out = files.map((f) => {
        const { frontmatter, body } = readMd(`habilidades/${f}`);
        const parsed = parseOrThrow(AbilitySchema, frontmatter, `habilidades/${f}`);
        return { ...parsed, description: body };
    });
    const seenKey = new Set();
    const seenName = new Set();
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
function loadHealthLevels() {
    const files = listMd('salud');
    const out = files.map((f) => {
        const { frontmatter, body } = readMd(`salud/${f}`);
        const parsed = parseOrThrow(HealthSchema, frontmatter, `salud/${f}`);
        return { ...parsed, description: body };
    });
    return out;
}
function loadArchetypes() {
    const files = listMd('arquetipos');
    return files.map((f) => {
        const { frontmatter, body } = readMd(`arquetipos/${f}`);
        const parsed = parseOrThrow(ArchetypeSchema, frontmatter, `arquetipos/${f}`);
        return { ...parsed, description: body };
    });
}
function loadMeritsFlaws() {
    const files = listMd('meritos-defectos');
    return files.map((f) => {
        const { frontmatter, body } = readMd(`meritos-defectos/${f}`);
        const parsed = parseOrThrow(MeritFlawSchema, frontmatter, `meritos-defectos/${f}`);
        return { ...parsed, description: body };
    });
}
function loadBackgrounds() {
    const files = listMd('trasfondos');
    const out = files.map((f) => {
        const { frontmatter, body } = readMd(`trasfondos/${f}`);
        const parsed = parseOrThrow(BackgroundSchema, frontmatter, `trasfondos/${f}`);
        return { ...parsed, description: body };
    });
    // Sanity: keys y names únicos.
    const seenKey = new Set();
    const seenName = new Set();
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
function loadClans() {
    const files = listMd('clanes');
    return files.map((f) => {
        const { frontmatter, body } = readMd(`clanes/${f}`);
        const parsed = parseOrThrow(ClanSchema, frontmatter, `clanes/${f}`);
        return { ...parsed, description: body };
    });
}
function loadVirtues() {
    const files = listMd('virtudes');
    const out = files.map((f) => {
        const { frontmatter, body } = readMd(`virtudes/${f}`);
        const parsed = parseOrThrow(VirtueSchema, frontmatter, `virtudes/${f}`);
        return { ...parsed, description: body };
    });
    // Sanity: keys y names únicos.
    const seenKey = new Set();
    const seenName = new Set();
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
function extractPowerDescriptions(body) {
    const out = {};
    const lines = body.split('\n');
    let current = null;
    let buffer = [];
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
        if (current !== null)
            buffer.push(line);
    }
    flush();
    return out;
}
function loadDisciplines(knownAbilityNames) {
    const files = listMd('disciplinas');
    const out = files.map((f) => {
        const { frontmatter, body } = readMd(`disciplinas/${f}`);
        const parsed = parseOrThrow(DisciplineSchema, frontmatter, `disciplinas/${f}`);
        // Validación cruzada: rollAbility debe referenciar una habilidad existente
        // o el propio name de la disciplina.
        for (const p of parsed.powers) {
            if (p.rollAbility) {
                const ok = knownAbilityNames.has(p.rollAbility) || p.rollAbility === parsed.name;
                if (!ok) {
                    throw new Error(`vault/disciplinas/${f} → powers[${p.level - 1}].rollAbility: "${p.rollAbility}" no existe en habilidades/ (ni coincide con el nombre de la disciplina)`);
                }
            }
        }
        // Sanity: niveles 1..5 sin duplicados.
        const levels = new Set();
        for (const p of parsed.powers) {
            if (levels.has(p.level)) {
                throw new Error(`vault/disciplinas/${f} → nivel duplicado: ${p.level}`);
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
function loadWeaponCategories() {
    const { frontmatter } = readMd('armas/_categorias.md');
    const parsed = parseOrThrow(WeaponCategoriesFileSchema, frontmatter, 'armas/_categorias.md');
    return parsed.categories;
}
function loadWeapons(categoryNames) {
    const files = listMd('armas');
    return files.map((f) => {
        const { frontmatter, body } = readMd(`armas/${f}`);
        const parsed = parseOrThrow(WeaponSchema, frontmatter, `armas/${f}`);
        if (!categoryNames.has(parsed.category)) {
            throw new Error(`vault/armas/${f} → category "${parsed.category}" no existe en armas/_categorias.md`);
        }
        // Extraer notes del cuerpo (cualquier bloque tipo "> nota" se conserva como notes).
        const noteMatch = body.match(/^>\s*(.+)$/m);
        return {
            ...parsed,
            notes: noteMatch ? noteMatch[1].trim() : null,
        };
    });
}
function loadArmors() {
    const files = listMd('armaduras');
    return files.map((f) => {
        const { frontmatter, body } = readMd(`armaduras/${f}`);
        const parsed = parseOrThrow(ArmorSchema, frontmatter, `armaduras/${f}`);
        return { ...parsed, description: body };
    });
}
