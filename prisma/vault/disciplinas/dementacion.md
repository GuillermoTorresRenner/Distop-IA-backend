---
name: Dementación
order: 11
tooltip: "Canaliza la locura del Malkavian hacia la psique de otros, catalizando quiebres mentales y delirios."
powers:
  - level: 1
    name: Pasión
    summary: Amplifica o atenúa emociones presentes en la víctima, alterando su temperamento sin control.
    bloodCost: 0
    rollAttribute: charisma
    rollAbility: Empatía
    rollDifficulty: null
    tooltip: "Dificultad = Humanidad de la víctima. Amplifica o reduce una emoción ya presente. Duración: 1 turno a 3 meses según éxitos."
  - level: 2
    name: Hechizar
    summary: Llena la mente de la víctima con ilusiones sensoriales que la abruman y confunden.
    bloodCost: 1
    rollAttribute: manipulation
    rollAbility: Subterfugio
    rollDifficulty: null
    tooltip: "Dificultad = Percepción + Autocontrol de la víctima. Visiones, sonidos, olores falsos. Duración: una noche a un año según éxitos."
  - level: 3
    name: Los Ojos del Caos
    summary: El Malkavian percibe patrones ocultos, secretos y verdades prohibidas del universo.
    bloodCost: 0
    rollAttribute: perception
    rollAbility: Ocultismo
    rollDifficulty: null
    tooltip: "Se concentra un turno. Tira Percepción + Ocultismo. Dificultad variable (6-9). Discerne Naturaleza, patrones del cosmos, mensajes cifrados."
  - level: 4
    name: La Voz de la Locura
    summary: Una sola palabra desencadena frénesi, terror o histeria incontrolable en el oyente.
    bloodCost: 0
    rollAttribute: manipulation
    rollAbility: Empatía
    rollDifficulty: null
    tooltip: "Tira Manipulación + Empatía. Dificultad = Fuerza de Voluntad permanente del objetivo. La víctima cae automáticamente en frénesi o Rötschcheck. El Malkavian debe tirar frénesi (+1 dif) al activarla."
  - level: 5
    name: Locura Total
    summary: El Malkavian inunda al objetivo con trastornos mentales y delirios que lo incapacitan.
    bloodCost: 1
    rollAttribute: manipulation
    rollAbility: Intimidación
    rollDifficulty: null
    tooltip: "Tira Manipulación + Intimidación. Dificultad = Fuerza de Voluntad de la víctima. Duración: 1 turno a 1 año según éxitos. El Narrador elige los Trastornos."
---

# Dementación

La Disciplina de los Malkavian que canaliza la **locura** como arma, espejo y catalizador del quiebre mental ajeno. No es puramente destructiva — funciona amplificando fisuras ya presentes en la psique. Un Malkavian no necesita estar diagnosticado como demente para aprenderla, aunque la Locura Cierta lo ayuda. En cambio, **toda víctima** sale transformada después del contacto prolongado con Dementación: algunas quiedan rotas, otras tocan verdades que desearían ignorar.

Funciona tanto en vampiros como en mortales, aunque los segundos suelen romperse más fácilmente. Los Lunáticos la llaman el "grito silencioso". La Inquisición la teme como pocas disciplinas porque no deja marcas físicas — solo cicatrices del alma.

**Maestros del clan**: Malkavian. Raramente practicada fuera del clan; algunos Camarilla la aprenden, pero nunca la dominan del todo.

## Resistencia a Dementación (regla común)

- **Mortales**: vulnerable total. Los pocos que resisten tienen fe religiosa extrema, entrenamiento psíquico o psicólogos muy competentes. Incluso entonces, la disciplina socava defensas mentales.
- **Vampiros**: requiere superar la Fuerza de Voluntad permanente del objetivo. Los Lasombra y Tremere con Auspex pueden detectar el ataque en progreso.
- **Trastornos previos**: una víctima con Trastorno mental preexistente sufre Dificultad -1 a su resistencia (más vulnerable).
- **Fracaso catastrófico**: si el Narrador determina que el poder falló por mucho, el Malkavian puede sufrir **rebote** — tira Cordura como si hubiera visto lo que intentaba infligir.

## 1 — Pasión

El Malkavian toca la emoción latente en su objetivo y la amplifica o atenúa a voluntad. No elige qué emoción despertar — ya debe estar presente, aunque dormida. Solo intensifica lo que existe: el miedo oculto se vuelve pánico; la ira contenida brota como furia; el amor silencioso se convierte en obsesión.

El efecto es sutil al principio pero crece con intensidad. Los compañeros de la víctima notan cambios de humor drásticos. Algunos blancos caen en espirales emocionales que dañan sus relaciones o decisiones críticas.

**Sistema**: `Carisma + Empatía`. Dificultad = **Humanidad** (o Senda de Virtud) del objetivo. Cada éxito intensifica el efecto:

| Éxitos | Duración |
|---|---|
| 1 | Un turno |
| 2 | Una hora |
| 3 | Una noche |
| 4 | Una semana |
| 5+ | Un mes o más |

Durante la duración, la víctima sufre **±1 a ±2 dados** a tiradas relacionadas con la emoción amplificada (frénesi, resistencias a Presencia, decisiones caritativas si es Compasión, etc.). El efecto natural y puede atribuirse a estrés, cambios de humor o circunstancia.

## 2 — Hechizar

El Malkavian inunda la mente de la víctima con alucinaciones complejas: ve caras fantasma en las sombras, escucha susurros que solo ella oye, huele humo que no existe. Las ilusiones son **sensoriales pero no táctiles** — la víctima siente la emoción pero no puede tocar el fantasma.

Los objetos reales pueden incorporarse a las alucinaciones (una taza de café se vuelve llena de gusanos; un espejo muestra un rostro desconocido). La víctima sigue funcionando, pero con dificultad creciente. Algunos creen que pierden la cordura. Otros sospechan que los rodean.

**Sistema**: se gasta **1 punto de sangre**. El Malkavian tira `Manipulación + Subterfugio`. Dificultad = **Percepción + Autocontrol** de la víctima. Éxitos determinan la complejidad:

| Éxitos | Complejidad |
|---|---|
| 1 | Ilusión simple y repetitiva (mismo sonido, misma sombra) |
| 2 | Ilusión coherente en un sentido (voces que conversan; olores que acompañan lugares) |
| 3 | Ilusión inmersiva multi-sensorial (jardín fantasma con flores, ruidos de viento, olor a rosas) |
| 4 | Ilusión reactiva (responde a las acciones de la víctima — pasos que la persiguen, voces que responden) |
| 5+ | Ilusión casi real (la víctima falla tiradas para distinguirla, a menos que lo intente activamente) |

La víctima puede intentar tirada de Percepción + Astucia (dificultad 7) para cuestionarse la realidad, pero solo si **sospecha** que algo es falso.

Duración:

| Éxitos | Duración |
|---|---|
| 1 | Una noche |
| 2 | Dos noches |
| 3 | Una semana |
| 4 | Un mes |
| 5+ | Un año (o hasta que la víctima rompa el contacto definitivamente) |

## 3 — Los Ojos del Caos

El Malkavian **ve**.

Se concentra un momento y la locura que reside en su sangre expande su consciencia hacia patrones ocultos en el tejido del universo. Percibe verdades que los cuerdos ignoran: conexiones imposibles, propósitos cifrados en coincidencias, la naturaleza verdadera de una persona reflejada en sus actos.

No es telepatía — no oye pensamientos. Es intuición sobrenatural. El objetivo puede ser una persona viva, un objeto con historia, un documento o incluso un lugar.

**Sistema**: concentración de un turno (acción completa). El jugador tira `Percepción + Ocultismo`. Dificultad variable:

| Objetivo | Dificultad |
|---|---|
| Extraño no familiar | 9 |
| Persona conocida superficialmente | 8 |
| Amigo viejo o aliado de largo plazo | 6 |
| Documento cifrado o carta codificada | 7 |
| Patrones naturales (fauna, ecosistema, clima) | 6 |
| Arquitectura antigua o lugar cargado | 7 |

Cada éxito responde una pregunta implícita: "¿Cuál es tu naturaleza verdadera?" "¿Qué guardas?" "¿Quién te controla?"

El Malkavian aprende fragmentos válidos pero no siempre interpretables — a veces lo que ve es tan lejano que necesita contexto. Un fracaso revela **falsas verdades**: el Malkavian aprende algo que cree cierto pero es engañosa ilusión.

## 4 — La Voz de la Locura

Una sola palabra, un grito silencioso, una frase cargada de intención vampírica dirigida al oído (no necesariamente sonoro) de la víctima.

La víctima cae en **frénesi o Rötschcheck** automático. No puede resistir porque la palabra ha alcanzado la fisura más profunda de su psique.

Este poder es peligroso incluso para el Malkavian — activarlo lo acerca a su propia locura.

**Sistema**: el Malkavian tira `Manipulación + Empatía`. Dificultad = **Fuerza de Voluntad permanente** del objetivo. Si logra al menos un éxito, la víctima cae automáticamente en **Rötschcheck o frénesis** según su personalidad. Vástagos con Fuerza de Voluntad alta o Lupinos pueden **intentar** resistir; el atacante suma +2 a su dificultad para permitirles una tirada defensiva.

**Mortales**: caen sin remisión. Despiertan horas después sin recordar qué pasó, solo marcados por la sensación de que algo los tocó desde dentro.

**Costo importante**: el Malkavian también debe tirar **frénesis o Rötschcheck** (con +1 a la dificultad normal) al activar el poder. La locura es bidireccional.

## 5 — Locura Total

El Malkavian concentra toda la locura dentro de sí y la **vierte como un tsunami** sobre la psique del objetivo.

La víctima sufre un colapso mental devastador. Desarrolla **Trastornos mentales** que pueden durar desde horas hasta años. El objetivo puede quedar catatónico, paranoico, homicida o simplemente roto — incapaz de funcionar en sociedad.

Este poder es el acto final de Dementación. Exige que el Malkavian tenga la atención absoluta del objetivo — mirándose a los ojos durante al menos un turno completo. Solo entonces puede soltar el poder.

**Sistema**: se gasta **1 punto de sangre**. El Malkavian tira `Manipulación + Intimidación`. Dificultad = **Fuerza de Voluntad permanente** del objetivo.

Si el Malkavian logra al menos un éxito, el objetivo sufre Trastornos mentales. El **Narrador elige qué trastornos**, usando la tabla del manual V20 (págs. 222-223):

- Amnesia
- Alucinaciones
- Fobias agudas
- Paranoia
- Trastorno de identidad múltiple
- Catatonia
- Impulsos homicidas compulsivos
- Depresión catatónica
- Otros inventados por el Narrador

Duración según éxitos:

| Éxitos | Duración |
|---|---|
| 1 | Un turno |
| 2 | Una noche |
| 3 | Una semana |
| 4 | Un mes |
| 5+ | Un año o permanente |

Un fracaso significa que el ataque rebota — el **Malkavian sufre los Trastornos** que intentaba infligir, con duración = éxitos que la víctima obtenga en su tirada defensiva.

Algunos Vástagos antiguos usan este poder solo como último recurso. Los mortales que sobreviven suelen terminar institucionalizados o vagabundos, marcados por una cordura que nunca pueden recuperar totalmente.
