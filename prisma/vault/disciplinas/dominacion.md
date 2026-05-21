---
name: Dominación
order: 3
tooltip: Imposición directa sobre la mente del objetivo a través del contacto visual. Exige captar la mirada.
powers:
  - level: 1
    name: Orden
    summary: Comando verbal de una palabra que se obedece de inmediato sin pensar.
    bloodCost: 0
    rollAttribute: null
    rollAbility: null
    rollDifficulty: null
    tooltip: "Requiere captar la mirada y enfatizar la palabra. La orden ambigua produce respuestas literales o confusas. No se puede ordenar algo directamente dañino."
  - level: 2
    name: Mesmerismo
    summary: Implanta verbalmente una sugestión hipnótica en el subconsciente del objetivo.
    bloodCost: 0
    rollAttribute: manipulation
    rollAbility: Liderazgo
    rollDifficulty: 7
    tooltip: "Dificultad igual a la FV permanente del objetivo. El objetivo y el vampiro deben estar libres de distracciones. Una sugestión por persona a la vez."
  - level: 3
    name: La Mente Olvidadiza
    summary: Borra, altera o reconstruye recuerdos del objetivo tras capturar su mirada.
    bloodCost: 0
    rollAttribute: wits
    rollAbility: Subterfugio
    rollDifficulty: 7
    tooltip: "Dificultad = FV del objetivo. Tabla 1-5 éxitos: borrar un recuerdo / borrar permanentemente / cambios ligeros / borrar o alterar escenas / reconstruir periodos enteros."
  - level: 4
    name: Condicionamiento
    summary: Manipulación prolongada que hace a la víctima receptiva a tu voluntad. Crea esclavos mentales.
    bloodCost: 0
    rollAttribute: charisma
    rollAbility: Liderazgo
    rollDifficulty: 7
    tooltip: "Dificultad = FV permanente del objetivo. Acción extendida: 5-10 veces el Autocontrol del objetivo en éxitos. Inmuniza al objetivo contra otros dominadores (+2 dif)."
  - level: 5
    name: Posesión
    summary: Suplanta por completo la mente de una víctima mortal y controla su cuerpo.
    bloodCost: 0
    rollAttribute: charisma
    rollAbility: Intimidación
    rollDifficulty: 7
    tooltip: "Tirada enfrentada de FV. Si gana el atacante: 1 FV temporal por turno desplazado. Si el atacante fracasa, la víctima queda permanentemente inmune. No funciona en Vástagos."
---

# Dominación

Disciplina mental clásica. Influye en pensamientos y acciones de los demás mediante la Fuerza de Voluntad del vampiro. Requiere **capturar la mirada** del objetivo, por lo que solo puede emplearse contra **un sujeto a la vez** y exige proximidad y un instante de contacto ocular.

Las órdenes deben ser verbales (algunas signos sencillos como señalar y poner expresión severa equivalen a ¡Vete!). Si el objetivo no comprende el idioma, no oye las palabras o no entiende la directiva, esta no se cumple — por muy fuerte que sea la voluntad sobrenatural del Vástago.

**Maestros del clan**: Giovanni, Lasombra, Tremere, Ventrue. La Disciplina favorece personalidades autoritarias.

## Resistencia a la Dominación (regla común)

- **Mortales**: pocos resisten; la fuerza de voluntad mortal no compara con el magnetismo vampírico. Quienes tengan fuerte fe religiosa, talentos psíquicos únicos o gran resolución pueden combatirla. Organizaciones como la Inquisición conocen rituales de inmunización.
- **Vampiros**: imposible Dominar a otro Vástago de generación inferior o igual; el atacante debe ser de generación más alta (más cercano a Caín).
- **Naturaleza**: el Narrador puede reducir o aumentar la dificultad 1-2 puntos según la naturaleza del objetivo (más fácil sobre conformistas/niños/protectores; más difícil sobre bravucones/directores/rebeldes).
- **Fracaso**: tras un fracaso, el objetivo queda inmunizado a futuros intentos del mismo vampiro durante el resto de la historia.

## 1 — Orden

El vampiro mira a los ojos al objetivo y pronuncia una sola palabra que debe obedecerse de inmediato. La palabra debe ser clara y directa: "corre", "tose", "para", "duerme", etc. Las órdenes confusas o ambiguas pueden producir respuestas literales o no del todo lo deseado. **No puede ordenarse algo directamente dañino** ("muere" no funciona).

La palabra puede incluirse en una frase oculta a los demás, siempre que el vampiro observe los ojos de la víctima en el momento y enfatice ligeramente la palabra. Un observador atento (o el propio objetivo) podría notar el énfasis pero atribuirlo a coincidencia.

**Sistema**: `Manipulación + Intimidación`. Dificultad = **Fuerza de Voluntad permanente** del objetivo. Un mayor número de éxitos = la acción se cumple con más cuidado o durante más tiempo (corriendo varios turnos, partiéndose de risa, estornudando sin control).

## 2 — Mesmerismo

Implanta verbalmente un pensamiento falso o una sugestión hipnótica en el subconsciente del objetivo. Tanto el vampiro como la víctima deben estar libres de distracciones — Mesmerismo requiere concentración intensa y precisión en el lenguaje.

El vampiro puede activar el pensamiento implantado en el momento o establecer un estímulo que lo dispare más tarde. Una sola persona puede tener implantada una única sugestión a la vez.

Se pueden dar órdenes sencillas y precisas (entregar un objeto) o complejas y elaboradas (tomar nota de hábitos y entregar información en un momento determinado).

**Sistema**: `Manipulación + Liderazgo`. Dificultad = FV permanente del objetivo. Los éxitos determinan qué tan bien implantada queda la sugestión:

| Éxitos | Calidad |
|---|---|
| 1-2 | No puede ser nada extraño (salir a la calle pero no portarse como gallina) |
| 3-4 | Orden eficaz siempre que no ponga en peligro la vida |
| 5+ | Casi cualquier cosa se puede implantar |

No importa cuán fuerte sea la voluntad del vampiro, las órdenes no obligan a la víctima a actuar contra su Naturaleza o a dañarse a sí misma.

Si el vampiro trata de Mesmerizar a un objetivo que aún tiene una sugestión sin cumplir, se comparan los éxitos: la nueva tirada determina qué orden permanece. En empate, la nueva borra la antigua.

## 3 — La Mente Olvidadiza

Tras capturar la mirada del objetivo, el vampiro tratea su memoria robando, alterando o reconstruyendo recuerdos a voluntad. No permite contacto telepático: actúa como hipnotizador haciendo preguntas y obteniendo respuestas. La cantidad de detalle altera la fuerza con la que se asienta el nuevo recuerdo: un recuerdo falso simple ("Anoche fuiste al cine") se derrumba más fácilmente que uno detallado.

Un vampiro también puede saber si los recuerdos de un sujeto han sido alterados por uso de este poder, e incluso recuperarlos si el sujeto ya no está bloqueado.

**Sistema**: el jugador indica la alteración que quiere realizar y tira `Astucia + Subterfugio`. Dificultad = FV del objetivo. Cualquier éxito calma a la víctima durante el tiempo que se realiza el cambio (verbalmente). Tabla canon:

| Éxitos | Alcance |
|---|---|
| 1 | Eliminar un solo recuerdo (dura un día) |
| 2 | Eliminar (no alterar) recuerdos permanentemente |
| 3 | Cambios ligeros en los recuerdos |
| 4 | Eliminar o alterar escenas enteras |
| 5 | Reconstruir periodos enteros de la vida |

Para **restaurar** recuerdos eliminados, el nivel de Dominación del personaje que lo intente debe ser al menos igual al del vampiro que realizó la alteración. Tirada `Astucia + Empatía` (dificultad = FV permanente del primer vampiro) y obtener más éxitos que el predecesor.

## 4 — Condicionamiento

Manipulación prolongada para convertir a una víctima en **esclavo mental** receptivo y leal. Los sirvientes Condicionados pierden gran parte de su pasión e individualidad: siguen órdenes de forma literal y no toman iniciativa. Al final terminan convirtiéndose en zombis automáticos.

**Sistema**: `Carisma + Liderazgo`. Dificultad = FV permanente del objetivo. Acción extendida. El Narrador determina en secreto los éxitos necesarios, normalmente entre **5 y 10 veces** el Autocontrol del objetivo. Las víctimas empáticas requieren menos éxitos; las testarudas, más.

Una víctima Condicionada totalmente queda **inmune a la Dominación de otros vampiros** (aumenta la dificultad +2 hasta máximo 10). Si se la separa de su maestro por largo periodo (seis meses menos un número de semanas igual a su FV), va recuperando su personalidad; una sola tirada `Carisma + Liderazgo` con la FV del objetivo como dificultad basta para reanudar el dominio si el vampiro la encuentra de nuevo.

## 5 — Posesión

La psique del vampiro suplanta por completo la mente de una víctima mortal. No es necesario hablar, pero sí captar la mirada. Los dos contendientes se mirarán fijamente.

Si el Vástago aplasta la mente de la víctima, mueve su consciencia al otro cuerpo y lo controla como si fuera el propio. El mortal queda en fuga mental (consciente como en sueños). Mientras tanto, el cuerpo del vampiro queda en letargo e indefenso ante ataques externos.

**Sistema**: el Vástago gasta **1 punto de FV** y tira `Carisma + Intimidación` (dif 7), mientras el objetivo tira `Fuerza de Voluntad` enfrentada (también dif 7). Cada éxito del vampiro sobre la víctima le hace perder **1 punto temporal de FV**; cada éxito del objetivo sobre el vampiro suma un dado a su próxima tirada. Solo si el atacante **fracasa** podrá el objetivo escapar a su destino — y ese resultado lo inmuniza para siempre frente a cualquier Dominación de ese mismo vampiro.

Cuando el objetivo pierde toda su FV temporal su mente queda abierta. El vampiro tira `Manipulación + Intimidación` (dif 7) para determinar control:

| Éxitos | Resultado |
|---|---|
| 1 | No puede usar Disciplinas |
| 2 | Puede usar Auspex |
| 3 | También Dominación, Presencia |
| 4 | También Dementación y Quimerismo |
| 5 | También Nigromancia, Taumaturgia |

**No puede usarse contra otros vampiros**: hasta el Vástago más débil resiste un control mental tan directo. Solo el vínculo de sangre logra ese tipo de dominio sobre un vampiro.

El cuerpo del vampiro permanece en letargo durante la posesión. El mortal puede recuperar el control si el vampiro lo abandona; la cáscara recibirá daño aplicable al vampiro también. Si el mortal muere antes de que el vampiro regrese, su cáscara puede entrar en letargo eterno o destruirse.
