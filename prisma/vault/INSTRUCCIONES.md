# Vault de catálogo — Distop-IA VTT

Este vault es la **fuente de verdad** para todo el catálogo del juego que se
carga en la base de datos vía `prisma db seed`. Está pensado para abrirse en
[Obsidian](https://obsidian.md/) y dejarse editar por colaboradores no
programadores que tengan el manual oficial de **Vampiro: la Mascarada 20º
aniversario (V20)** a mano.

> **TL;DR**
> Cada entrada del catálogo es **un archivo `.md`** con dos partes: un
> bloque YAML (frontmatter) entre `---` donde van los datos estructurados
> y un cuerpo en Markdown donde va el texto largo que verá el jugador en
> el modal. El seeder valida ambos antes de tocar la base de datos: si
> algo está mal, te lo dice en la consola y aborta sin escribir nada.

## Cómo usar este vault

1. Abre la carpeta `back/prisma/vault/` como vault de Obsidian.
2. Edita los archivos que quieras mejorar/corregir.
3. Guarda. Ejecuta el seeder desde `back/`:
   ```bash
   npx prisma db seed
   ```
4. Si el seeder reporta errores, los muestra **por archivo + línea conceptual**
   (ej. `vault/disciplinas/dominacion.md → powers[0].rollAttribute: …`).
5. El seeder es **idempotente**: corre las veces que quieras, solo actualiza
   lo que cambió.

## Estructura de carpetas

```
vault/
├── INSTRUCCIONES.md          ← este archivo
├── atributos/                ← 9 archivos (Fuerza, Destreza, …)
├── habilidades/              ← 30 archivos (Pelea, Subterfugio, …)
├── disciplinas/              ← 1 por disciplina, con sus 5 poderes embebidos
├── clanes/                   ← 1 por clan/linaje
├── arquetipos/               ← Naturalezas y Conductas (compartidos)
├── meritos-defectos/         ← Méritos y Defectos
├── trasfondos/               ← Aliados, Contactos, Recursos, Generación, …
├── armas/                    ← Catálogo de armas system
├── armaduras/                ← Catálogo de armaduras system
└── salud/                    ← Niveles de salud (Magullado, Lastimado, …)
```

## Formato general de cada archivo

Todo `.md` empieza con un bloque YAML entre `---` (frontmatter) y luego un
cuerpo libre de Markdown que será mostrado tal cual en el modal de la app.

```markdown
---
campo: valor
otro: 12
lista:
  - elemento1
  - elemento2
---

# Título legible

Texto largo en **Markdown**. Puedes usar:

- listas con viñetas
- *cursivas* y **negritas**
- > citas
- enlaces, encabezados, tablas, etc.

El cuerpo entero del archivo se guarda en el campo `description` de la base
de datos y se renderiza con soporte GFM en el modal.
```

> ⚠️ El `name` del frontmatter es la **clave única** que enlaza con la base
> de datos. Cambiar el `name` de un archivo equivale a crear una entrada
> nueva (la vieja queda huérfana). Si necesitas renombrar, hazlo desde la
> base de datos o avisa al equipo técnico.

---

## Esquemas por carpeta

### `atributos/` — uno por atributo

```yaml
---
key: strength          # OBLIGATORIO. Debe matchear la columna del modelo Character.
name: Fuerza           # OBLIGATORIO. Nombre canónico en español.
category: PHYSICAL     # PHYSICAL | SOCIAL | MENTAL
order: 0               # opcional, controla el orden de display
---
```

`key` válidas (no inventes):

- Físicos: `strength` (Fuerza), `dexterity` (Destreza), `stamina` (Resistencia).
- Sociales: `charisma` (Carisma), `manipulation` (Manipulación), `appearance` (Apariencia).
- Mentales: `perception` (Percepción), `intelligence` (Inteligencia), `wits` (Astucia).

### `habilidades/` — uno por habilidad

```yaml
---
key: pelea             # slug interno en kebab-case
name: Pelea            # OBLIGATORIO. Nombre canónico V20.
category: TALENT       # TALENT | SKILL | KNOWLEDGE
order: 0
---
```

El `name` se usa para **enlazar con `DisciplinePower.rollAbility`** (cuando un
poder pide tirar contra una habilidad). Si renombras una habilidad, asegúrate
de actualizar la referencia en las disciplinas correspondientes.

### `disciplinas/` — una por disciplina, con sus 5 poderes embebidos

```yaml
---
name: Dominación
order: 4
powers:
  - level: 1
    name: Orden
    summary: Una orden cargada de mandato fuerza una acción simple.
    bloodCost: 0
    rollAttribute: manipulation   # key del modelo Character o null
    rollAbility: Intimidación     # name de una habilidad o null
    rollDifficulty: 7             # número o null (default 6)
  - level: 2
    name: Hipnotismo
    ...
---

# Dominación

Texto narrativo de la disciplina.

## 1 — Orden

Texto largo del poder de nivel 1 (mecánica, ejemplos, narrativa).

## 2 — Hipnotismo

...
```

Reglas para los poderes:

- Deben existir los **5 niveles** (1 a 5). Si falta alguno, el seeder aborta.
- `rollAttribute` debe ser una key válida (`strength`, `dexterity`, `stamina`,
  `charisma`, `manipulation`, `appearance`, `perception`, `intelligence`,
  `wits`) o `null` para poderes pasivos.
- `rollAbility` debe ser el `name` exacto de una habilidad de
  `habilidades/` (case-sensitive, incluye tildes), o el nombre de la propia
  disciplina si V20 lo prescribe (ej. "Dominación").
- `bloodCost` default `0`. `rollDifficulty` default `null` (el cliente asume 6).
- El **cuerpo del archivo** se guarda como `description` de la disciplina.
- Cada `## N — Nombre` corresponde al `description` del poder N.

### `clanes/`

```yaml
---
name: Brujah
sect: Camarilla        # texto libre
disciplines: Celeridad, Potencia, Presencia
weakness: La Bestia siempre cerca: penalización para resistir el frenesí.
order: 0
---

# Brujah

Texto narrativo del clan.
```

### `arquetipos/`

```yaml
---
name: Arquitecto
order: 0
---

Construye algo duradero que otros disfrutarán.
```

Sin secciones especiales — el cuerpo entero es la descripción.

### `meritos-defectos/`

```yaml
---
name: Buen oído
kind: MERIT            # MERIT | FLAW
value: 1               # positivo para méritos, negativo para defectos
category: Físico       # Físico | Mental | Social | Sobrenatural
order: 0
---

Tienes un oído sobrenaturalmente agudo. +1 a tiradas de percepción auditiva.
```

El select de la hoja agrupa estas entradas con **dos niveles**:

1. **Categoría** (`category`): Físico, Mental, Social, Sobrenatural.
2. **Tipo**: dentro de cada categoría se separan en *Méritos* y *Defectos*
   (a partir del campo `kind`).

Si necesitas una categoría nueva (ej. "Habilidades sobrenaturales"), basta
con escribirla en `category`: el front la usa como label tal cual y la
inserta como un nuevo grupo en el dropdown. Mantén nombres consistentes
entre archivos para que no haya grupos duplicados por error tipográfico.

El jugador puede igualmente crear un mérito/defecto **customizado** desde
la hoja, indicando nombre, kind, value y categoría libre; ese custom
queda inline en el personaje y no se persiste como entrada del catálogo.

### `trasfondos/` — uno por trasfondo

```yaml
---
key: aliados           # slug interno en kebab-case
name: Aliados          # OBLIGATORIO. Nombre canónico V20.
category: Social       # opcional, texto libre (Social, Sobrenatural, Material).
order: 0               # orden en el dropdown.
---

# Aliados

**Trasfondo · Social**

Texto narrativo y descripción de los niveles (1..5).
```

Los Trasfondos del catálogo son la lista cerrada que ofrece el dropdown en
la hoja del personaje. El jugador puede igualmente escribir un Trasfondo
**customizado** (no presente en el catálogo); el valor se guarda como texto
libre en `CharacterBackground.name` y no necesita estar acá.

Para agregar un Trasfondo nuevo al catálogo, crea el archivo `.md`
correspondiente y vuelve a correr el seeder.

### `armas/`

```yaml
---
name: Cuchillo
category: Cuchillo                # debe coincidir con el name de una categoría
kind: MELEE                       # MELEE | RANGED
damageBase: STRENGTH              # STRENGTH | FLAT
damageBonus: 1
lethal: true                      # opcional
aggravated: false                 # opcional
bluntPlus: false                  # opcional
range: null                       # solo RANGED
rate: null                        # solo RANGED, texto (ej. "3" o "1*")
magazine: null                    # solo RANGED
concealment: C                    # B | P | J | G | N (ocultabilidad)
order: 0
---

Texto del manual sobre el arma.
```

Las categorías de armas viven en `armas/_categorias.md` (un solo archivo con
todas las categorías en YAML; las armas las referencian por `name`).

### `armaduras/`

```yaml
---
name: Clase Tres (Kevlar)
rating: 3              # absorción
penalty: 1             # penalización a reservas de Destreza
order: 0
---

Texto del manual.
```

### `salud/` — uno por nivel

```yaml
---
key: bruised           # bruised | hurt | injured | wounded | mauled | crippled | incapacitated
name: Magullado
penalty: 0
order: 0
---

Sin penalización a las acciones. Daño superficial visible.
```

---

## ¿Qué pasa si me equivoco?

El seeder valida cada archivo con [Zod](https://zod.dev) y aborta antes de
escribir si encuentra un problema. Errores típicos que te va a reportar
con archivo + campo:

- Falta un campo obligatorio (`name`, `key`, `category`, …).
- `category` con un valor fuera del enum permitido.
- `rollAttribute` con una key inexistente (no es un atributo real).
- `rollAbility` que referencia una habilidad que no existe en `habilidades/`.
- Disciplinas con menos de 5 niveles.

Lee el mensaje, edita el archivo correspondiente, vuelve a correr el seeder.

## ¿Y los IDs?

No te preocupes por los IDs. El seeder los maneja por `name` o `key`:

- Si una entrada con ese `name`/`key` ya existe, la **actualiza**.
- Si no existe, la **crea**.
- Si una entrada existe en la base pero ya **no está en el vault**, el seeder
  **no la borra** automáticamente (para no destruir datos de jugadores). Si
  necesitas eliminar algo del catálogo, pide al equipo técnico una migración.

## Manual oficial

Toma como fuente el **Vampiro: la Mascarada 20º aniversario (V20)** edición
en español. Si encuentras discrepancias entre el manual y el vault, **el
manual gana** y el vault debe ajustarse.

## Contacto

Dudas o algo no encaja: abre un issue en el repositorio o escribe a
`contacto@guillermotorresdev.com`.
