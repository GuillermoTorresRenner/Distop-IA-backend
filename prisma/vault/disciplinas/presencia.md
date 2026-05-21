---
name: Presencia
order: 7
tooltip: Atracción sobrenatural. Inspira fervor, devoción o terror a multitudes sin requerir contacto ocular.
powers:
  - level: 1
    name: Fascinación
    summary: Magnetismo sublime que atrae a quienes se acerquen y los vuelve receptivos al vampiro.
    bloodCost: 0
    rollAttribute: charisma
    rollAbility: Interpretación
    rollDifficulty: 7
    tooltip: "Tabla 1-5 éxitos: 1 persona / 2 / 6 / 20 / todos los presentes. Los afectados pueden gastar FV para liberarse cada turno cerca del Vástago."
  - level: 2
    name: Mirada Aterradora
    summary: Revela tu naturaleza vampírica al objetivo, paralizándolo o aterrorizándolo.
    bloodCost: 0
    rollAttribute: charisma
    rollAbility: Intimidación
    rollDifficulty: 7
    tooltip: "Dificultad = Astucia + Coraje de la víctima. 1 éxito = sorprendido; 3+ = huye. Cada éxito resta dado al objetivo durante el siguiente turno."
  - level: 3
    name: Encantamiento
    summary: Convierte a otros en criados serviciales y leales por amor (más fiables, menos predecibles que esclavos).
    bloodCost: 0
    rollAttribute: appearance
    rollAbility: Empatía
    rollDifficulty: 7
    tooltip: "Dificultad = FV permanente del objetivo. Duración 1 hora / 1 día / 1 semana / 1 mes / 1 año según éxitos. Puede convertirse en vínculo de sangre real con un trago."
  - level: 4
    name: Invocación
    summary: Atrae a una persona conocida hacia ti desde cualquier distancia en el mundo físico.
    bloodCost: 0
    rollAttribute: charisma
    rollAbility: Subterfugio
    rollDifficulty: 5
    tooltip: "Dificultad base 5; 7 si es un extraño completo. Tabla 1-5 éxitos: lenta y dubitativa / suspicaz / velocidad razonable / supera obstáculos / lo hace todo por llegar. Renovar cada noche."
  - level: 5
    name: Majestad
    summary: Encanto sobrenatural multiplicado. Inspira respeto, devoción o miedo universal.
    bloodCost: 0
    rollAttribute: null
    rollAbility: null
    rollDifficulty: null
    tooltip: "Cuesta 1 FV. Quien quiera resistir tira Coraje (dif = Carisma + Intimidación del vampiro). Un éxito permite mantener postura por el momento; un fallo provoca disculpas y sumisión. Duración: una escena."
---

# Presencia

Disciplina de atracción sobrenatural. Inspira fervor fanático, pasión devota o terror inexplicable tanto en mortales como en inmortales. A diferencia de la mayoría de las Disciplinas mentales, algunos poderes afectan a **multitudes** y no requieren contacto ocular: basta con que el rostro del vampiro sea visible.

**Maestros del clan**: Brujah, Seguidores de Set, Toreador, Ventrue. Los Ventrue pueden ser los más hábiles, combinando Presencia con Dominación.

**Limitación**: Presencia solo controla **emociones**, no acciones concretas. Sugerencias suicidas o ridículas no parecerán lógicas; sí lo hace una elocuencia inspirada por la Disciplina. Cualquiera puede resistir un turno gastando **1 FV** y superando una tirada del mismo Rasgo (dif 8), pero el gasto debe repetirse cada turno hasta soltarse de la mirada del vampiro. Vástagos al menos tres generaciones menores que el "invocador" deben hacer una gran tirada de FV para ignorar la Presencia durante toda la escena (sin gasto adicional).

## 1 — Fascinación

Magnetismo sobrenatural. Quien esté cerca sentirá un deseo repentino de acercarse y se volverá receptivo a las opiniones del Vástago. No importa lo que diga: el corazón de los afectados se inclinará hacia sus posiciones. Los débiles querrán estar de acuerdo; los más fuertes resistirán al principio pero acabarán superados en número.

Los afectados conservan su instinto de conservación. La fascinación se rompe ante peligro real o si se alejan del vampiro. Las víctimas, al recordar la atracción, se verán afectadas si lo encuentran después.

**Sistema**: `Carisma + Interpretación` (dif 7). Si hay más personas presentes que las que el vampiro puede afectar, Fascinación actúa primero sobre las de **menor FV**. Dura toda la escena o hasta que el vampiro lo cancele. Tabla:

| Éxitos | Personas |
|---|---|
| 1 | Una |
| 2 | Dos |
| 3 | Seis |
| 4 | Veinte |
| 5 | Todos los presentes (auditorio, turba) |

Los afectados pueden gastar **1 FV** por turno para resistir. En cuanto agoten su FV (o cesen el gasto) caerán de nuevo bajo la Fascinación.

## 2 — Mirada Aterradora

El vampiro revela su naturaleza vampírica (mostrando colmillos, mirada malevolencia, gestos amenazadores), creando terror insostenible. Sirve para amedrentar a víctimas, llevándolas a la inmovilidad, la lucha temeraria o el pánico ciego.

**Sistema**: `Carisma + Intimidación`. Dificultad = `Astucia + Coraje` de la víctima. Tabla:

| Éxitos | Resultado |
|---|---|
| 1 | Sorprendido pero no aterrorizado |
| 2 | Asustado |
| 3+ | Huye despavorida; sin escape arañará paredes para abrir túnel antes de mirar al vampiro |

Cada éxito resta un dado a las reservas del objetivo el turno siguiente. Se puede emplear una vez por turno o como acción extendida (subyugando completamente). En esa última, cuando la víctima pierda todas las reservas caerá en posición fetal llorando. Un fallo en la acción extendida pierde los éxitos acumulados y obliga a empezar el turno siguiente. Un fracaso significa que el objetivo no se impresiona en absoluto (incluso puede tomar los gestos del vampiro como cómicos): a partir de ese momento estará inmune a cualquier nuevo uso de Presencia por su parte durante toda la historia.

## 3 — Encantamiento

Convierte a los demás en **criados serviciales** del vampiro por amor (perversión del amor) — no mediante dominio de la voluntad. Estos secuaces son más agradables y animados que los esclavos mentales, pero también más impredecibles. Como Encantamiento tiene duración limitada, un sirviente liberado puede ser problemático: un Vástago inteligente dispondrá de él tras un servicio leal o lo atará más estrechamente mediante un vínculo de sangre real (mucho más fácil de lograr gracias a la aceptación del secuaz).

**Sistema**: `Apariencia + Empatía`. Dificultad = FV permanente del objetivo. El Narrador puede preferir hacerlo en secreto para que el jugador nunca esté seguro de la fuerza de la atadura. Mantener al criado bajo control solo se puede intentar cuando el Encantamiento inicial haya **expirado**. Tabla de duración:

| Éxitos | Duración |
|---|---|
| 1 | Una hora |
| 2 | Un día |
| 3 | Una semana |
| 4 | Un mes |
| 5 | Un año |

## 4 — Invocación

Atrae a una persona conocida hacia el vampiro. La llamada afecta a cualquiera (mortal o sobrenatural) en cualquier punto del mundo físico. El objetivo viajará hacia el vampiro lo más rápido posible (normalmente sin saber por qué). Sabe intuitivamente cómo dar con su invocador; si el vampiro se desplaza, el sujeto cambiará de rumbo en cuanto le sea posible.

Aunque permite llamar a alguien lejano, suele ser más eficaz de forma local. Si el viaje tarda más de lo necesario, la llamada se pierde. La víctima mantiene los instintos de conservación: no se suicidará, pero tampoco evitará la violencia si la requiere para alcanzar su destino. La invocación desaparece al amanecer, así que salvo que la víctima sepa cómo llegar a destino la primera noche, hay que volver a invocarla cada noche.

**Sistema**: `Carisma + Subterfugio`. Dificultad base **5**, sube a **7** si es completo extraño. Si el vampiro ha usado Presencia con éxito sobre el objetivo en el pasado, la dificultad baja a **4**; si el intento previo falló, sube a **8**. Tabla:

| Éxitos | Velocidad/actitud |
|---|---|
| 1 | Acercamiento lento y dubitativo |
| 2 | Suspicaz; obstáculos sencillos lo detienen |
| 3 | Velocidad razonable |
| 4 | Rápido, supera obstáculos del camino |
| 5 | Hará cualquier cosa por llegar |

## 5 — Majestad

Multiplica el encanto sobrenatural del vampiro. Si es atractivo, se vuelve insoportablemente bello; si es feo, un demonio monstruoso. Inspira respeto, devoción o miedo (o todo a la vez) en quienes le rodean. Los débiles harán lo que sea por cumplir sus deseos; hasta los más resistentes tendrán dificultades para negarle algo.

Los afectados verán al vampiro tan formidable que no se arriesgarán a contrariarle. Alzar la voz contra él será difícil, levantar la mano impensable. Las pocas víctimas que ignoren este encanto y se opongan podrán ser apaleadas por los demás sin que el inmortal levante un dedo.

Bajo la influencia de la Majestad, hasta el corazón más fuerte tiembla. Los inteligentes la usan con sumo cuidado: alguien humillado frente a los demás pierde rápidamente el perdón, y si se trata de un Vástago, los siglos sobran para planear la venganza.

**Sistema**: no necesita tiradas del vampiro, pero requiere gastar **1 FV**. La víctima debe tirar `Coraje` (dificultad = `Carisma + Intimidación` del personaje) o quedar sometida. Un éxito permite actuar normalmente, aunque sentirá el peso del desagrado; si la víctima falla cambiará intenciones inmediatamente y hará cualquier cosa por humillarse ante el vampiro y suplicar su perdón. Dura una escena.
