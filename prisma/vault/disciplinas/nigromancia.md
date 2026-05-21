---
kind: paths
name: Nigromancia
order: 10
tooltip: Magia de los muertos. Tres sendas (Sepulcro primaria, Osario, Cenizas) + rituales. Mecánica como Taumaturgia.
paths:
  - key: senda_sepulcro
    name: Senda del Sepulcro
    order: 1
    tooltip: Senda primaria de todo nigromante. Invoca, interroga, ata y golpea fantasmas.
    powers:
      - level: 1
        name: Penetración
        summary: Mira los ojos de un cadáver para ver lo último que contempló antes de morir.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Ve lo último que un cadáver contempló antes de morir."
      - level: 2
        name: Invocar Espíritu
        summary: Llama a un fantasma específico del Inframundo a tu presencia.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Llama a un fantasma específico del Inframundo."
      - level: 3
        name: Ordenar a Espíritu
        summary: Obliga a un espíritu invocado a obedecer órdenes.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Fuerza a un espíritu invocado a obedecer."
      - level: 4
        name: Embrujar
        summary: Ata al fantasma invocado a un lugar u objeto.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Ata al fantasma a un lugar u objeto."
      - level: 5
        name: Atormentar
        summary: Golpeas a un fantasma como si estuvieras en el Inframundo causándole daño ectoplásmico.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Empatía
        rollDifficulty: 7
        tooltip: "Golpeas a un espíritu causándole daño ectoplásmico."

  - key: senda_osario
    name: Senda del Osario
    order: 2
    tooltip: Trabajo con cadáveres. Animarlos, gobernarlos, robar y reinsertar almas en cuerpos muertos.
    powers:
      - level: 1
        name: Tremens
        summary: Anima la carne de un cadáver durante una acción sencilla.
        bloodCost: 1
        rollAttribute: dexterity
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Anima un cadáver durante una acción sencilla."
      - level: 2
        name: Las Escobas del Aprendiz
        summary: Un cuerpo muerto realiza una función sencilla durante horas.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Un cuerpo muerto cumple tareas simples por horas."
      - level: 3
        name: Hordas Tambaleantes
        summary: Anima zombis combatientes que obedecen la última orden.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Anima zombis combatientes que cumplen una orden."
      - level: 4
        name: Robar Alma
        summary: Arranca el alma de un cuerpo viviente convirtiéndolo en fantasma vinculado.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Arranca el alma de un viviente; cuerpo catatónico."
      - level: 5
        name: Posesión Demoníaca
        summary: Introduce un alma en un cadáver recientemente muerto para que lo habite.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Introduce un alma en un cadáver reciente."

  - key: senda_cenizas
    name: Senda de las Cenizas
    order: 3
    tooltip: Observa y atraviesa el Manto entre vivos y muertos. La más peligrosa de las tres sendas.
    powers:
      - level: 1
        name: Visión del Manto
        summary: Ves a través del Manto al Inframundo y sus moradores.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Alerta
        rollDifficulty: 7
        tooltip: "Ves a través del Manto al Inframundo."
      - level: 2
        name: Lenguas sin Vida
        summary: Conversas con fantasmas sin esfuerzo y sin gastar sangre.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hablas con fantasmas sin esfuerzo. Incluye Visión del Manto."
      - level: 3
        name: Mano Muerta
        summary: Atraviesas el Manto y afectas objetos ectoplásmicos como si fueran físicos.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Afectas objetos del Inframundo como si fueran físicos."
      - level: 4
        name: Ex Nihilo
        summary: Entras físicamente en el Inframundo.
        bloodCost: 2
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Atraviesas físicamente al Inframundo."
      - level: 5
        name: Dominio del Manto
        summary: Manipulas el velo entre vivos y muertos.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 9
        tooltip: "Manipulas el velo entre vivos y muertos."

rituals:
  - key: llamada_muertos_hambrientos
    name: La Llamada de los Muertos Hambrientos
    level: 1
    order: 1
    tooltip: La víctima oye retazos de conversaciones del otro lado del Manto.
    ingredients: Cabello del objetivo quemado en una vela negra.
    castingTime: 10 minutos
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4

  - key: ojos_tumba
    name: Ojos de la Tumba
    level: 2
    order: 2
    tooltip: La víctima sufre visiones intermitentes de su muerte durante una semana.
    ingredients: Tierra de un sepulcro reciente.
    castingTime: Dos horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5

  - key: ritual_grillete_desenterrado
    name: Ritual del Grillete Desenterrado
    level: 3
    order: 3
    tooltip: Una falange permite usar la Senda del Sepulcro con mayor facilidad.
    ingredients: Falange del esqueleto del fantasma + esquirla de lápida.
    castingTime: Tres horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 6

  - key: toque_cadaverico
    name: Toque Cadavérico
    level: 4
    order: 4
    tooltip: Convierte a un mortal en una réplica cadavérica de sí mismo.
    ingredients: Muñeca de cera con la forma del objetivo.
    castingTime: Tres horas cantando
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 7

  - key: aferrar_fantasmal
    name: Aferrar lo Fantasmal
    level: 5
    order: 5
    tooltip: Trae un objeto del Inframundo al mundo real.
    ingredients: Seis horas de cánticos + objeto material de masa equivalente para reemplazar.
    castingTime: Seis horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 8
---

# Nigromancia

Disciplina-escuela dedicada al **control de las almas de los muertos**. Como Taumaturgia, en vez de ser una progresión lineal, consiste en **sendas** con sus correspondientes **rituales**. Los nigromantes vampíricos más poderosos invocan, expulsan, aprisionan o reinsertan almas en cuerpos vivos o muertos.

Su estudio no está muy extendido entre los Vástagos; los Giovanni son los maestros canónicos. Los nigromantes son rehuidos e ignorados siempre que se puede.

## Sendas conocidas

A lo largo de los siglos las escuelas se han diversificado, dejando tres sendas abiertas a los Cainitas:

- **Senda del Sepulcro** (primaria por convención): trabajo con fantasmas. Aumenta automáticamente al subir el nivel general de Nigromancia.
- **Senda del Osario**: trabajo con cadáveres. Animar, gobernar y robar almas.
- **Senda de las Cenizas**: observación y manipulación del Manto. La más peligrosa porque incrementa la vulnerabilidad del vampiro a los fantasmas.

Un nigromante Cainita debe aprender al menos **tres niveles** en la Senda del Sepulcro antes de aprender el primero en una de las otras dos. Luego debe alcanzar la maestría en la Senda Primaria (cinco niveles) antes de adquirir el primer nivel en la **tercera** Senda.

Como con la Taumaturgia, el avance en la senda primaria cuesta la experiencia normal mientras que el estudio de las secundarias es más oneroso.

## Sistema (regla universal de las sendas)

Como con Taumaturgia, cada poder de senda requiere típicamente **1 PS** + tirada de **Fuerza de Voluntad** vs **nivel del poder + 3**. Algunos poderes requieren tiradas adicionales (Manipulación + Ocultismo enfrentada vs Fuerza de Voluntad del fantasma, etc.) descritas en cada caso.

## Rituales

Los tiempos de invocación varían (consulta cada descripción). El jugador tira `Inteligencia + Ocultismo` con dificultad **3 + nivel del ritual** (máximo 9). Un éxito indica que el ritual se desarrolló correctamente; un fallo no produce efecto y un fracaso puede activar el ritual en perjuicio del invocador.

Los rituales nigrománticos son **muy variados**. Algunos tienen relación directa con las sendas y otros parecen enseñados por los propios fantasmas. Todos los nigromantes comienzan con un ritual de nivel 1; los demás se aprenden a lo largo de la crónica como en Taumaturgia, aunque son **totalmente incompatibles** con ella (un Tremere no puede aprender rituales nigrománticos y viceversa).

## Senda — Senda del Sepulcro {#senda_sepulcro}

Senda primaria de todo nigromante. Trabajo con fantasmas: percibirlos, invocarlos, ordenarles, atarlos y golpear sus formas ectoplásmicas.

### Poder 1 — Penetración

Permite mirar a los ojos de un cadáver para ver reflejado lo último que contempló antes de morir. La imagen solo se ve en las retinas del nigromante.

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Posterior tirada de Percepción + Ocultismo (dif 8 si la criatura estuvo viva, 10 si no la tuvo — como zombis, 9 si es vampiro). Los éxitos determinan la claridad de la visión:

| Éxitos | Resultado |
|---|---|
| 1 | Sensación básica de la muerte |
| 2 | Imagen clara del sujeto y los segundos previos |
| 3 | Imagen con sonido de los minutos anteriores a la muerte |
| 4 | Imagen con sonido de la media hora anterior |
| 5 | Percepción sensorial completa de la hora previa |

Un fracaso mostrará al nigromante su propia Muerte Definitiva, posiblemente induciendo Rötschreck. No funciona en cadáveres de vampiros que alcanzaron la Golconda, fueron diabolizados o cuya descomposición está avanzada.

### Poder 2 — Invocar Espíritu

Llama a un fantasma específico del Inframundo, aunque solo para conversar con él. **Sistema**: 1 PS + Fuerza de Voluntad (dif 5). Posterior Percepción + Ocultismo (dif 7 o Fuerza de Voluntad del fantasma si el Narrador la conoce). El nigromante debe conocer el nombre del fantasma; tener un objeto que tocó en vida le concede -2 a la dificultad.

Los éxitos determinan la disposición del espíritu y el tiempo que se quedará. No se puede invocar a fantasmas ya destruidos, diabolizados, o perdidos en la Tormenta del Inframundo. Un fracaso invoca un espectro hostil que comienza a atormentar al nigromante.

### Poder 3 — Ordenar a Espíritu

Fuerza al espíritu invocado a obedecer las órdenes del vampiro. **Sistema**: 1 PS + Fuerza de Voluntad (dif 6). Posterior Manipulación + Ocultismo (dif = Fuerza de Voluntad del objetivo). Por cada éxito el nigromante logra mayor control:

| Éxitos | Grado de control |
|---|---|
| 1 | El fantasma debe quedarse cerca; no ataca a nadie sin permiso |
| 2 | Obligado a responder preguntas, aunque hay que formularlas con cuidado |
| 3 | Debe responder la verdad a cualquier pregunta sin omisión |
| 4 | Servirá según la letra de las órdenes (no según el espíritu) |
| 5 | Atrapado: obedece con la mayor diligencia posible |

Las órdenes atan al fantasma 1 hora por éxito. Gastar 1 FV temporal extiende a una noche; 1 FV permanente extiende a un año y un día.

### Poder 4 — Embrujar

Ata al fantasma invocado a un lugar u objeto. Si intenta abandonarlo deberá tirar Fuerza de Voluntad (dif 10) con 2 éxitos o sufrir 1 nivel de daño agravado. Si pierde todos sus niveles de salud es arrojado al Inframundo donde se enfrentará a su destrucción.

**Sistema**: 1 PS + Fuerza de Voluntad (dif 7). Posterior Manipulación + Ocultismo (dif = Fuerza de Voluntad del objetivo si resiste, 4 si no). Cada éxito ata 1 noche; 1 FV temporal extiende a una semana; 1 FV permanente a un año.

### Poder 5 — Atormentar

Golpea a un espíritu como si estuviera en las tierras de los muertos, causando daño a su forma ectoplásmica. El Vástago permanece en el mundo real, por lo que el fantasma no podrá responder a los ataques. **Sistema**: 1 PS + Fuerza de Voluntad (dif 8). Posterior Resistencia + Empatía (dif = Fuerza de Voluntad del objetivo). Cada éxito causa 1 nivel de daño letal. Si el fantasma pierde todos los niveles desaparece, arrastrado a una zona del Inframundo cercana a un terrible mundo de pesadillas; no podrá regresar al mundo real durante un mes.

## Senda — Senda del Osario {#senda_osario}

Se ocupa principalmente de los cadáveres y los métodos por los que las almas muertas pueden regresar al mundo de los vivos, temporal o permanentemente.

### Poder 1 — Tremens

Anima durante una acción sencilla la carne de un cadáver. Un brazo se extiende, un muerto se sienta, unos ojos se abren al momento menos esperado. Útil para asustar o transmitir mensajes; el cadáver no puede atacar ni causar daño.

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Posterior Destreza + Ocultismo (dif 6). Cuantos más éxitos, más complicada puede ser la orden: 1 éxito = espasmo súbito; 5 éxitos = condiciones específicas ("la próxima vez que alguien entre, abre los ojos").

### Poder 2 — Las Escobas del Aprendiz

Un cuerpo muerto realiza una función sencilla durante horas: cargar objetos, cavar, arrastrar de un sitio a otro. Los cuerpos no atacarán ni se defenderán; solo seguirán intentando cumplir su orden hasta ser incapacitados (descuartizados, quemados o destruidos).

**Sistema**: 1 PS de sangre + 1 PS de Fuerza de Voluntad + Fuerza de Voluntad (dif 5). Posterior Astucia + Ocultismo (dif 7). El número de muertos animados es igual al número de éxitos obtenidos. El cuerpo seguirá descomponiéndose, aunque mucho más lentamente de lo normal.

### Poder 3 — Hordas Tambaleantes

Crea cuerpos reanimados con capacidad de atacar. Una vez animados, los cadáveres esperan (años si es necesario) hasta cumplir sus órdenes. Estadísticas zombi canon: Fuerza 3, Destreza 2, Resistencia 4, Pelea 2, Fuerza de Voluntad 0. Siempre actúan en último lugar del turno.

**Sistema**: 1 PS de FV + 1 PS de sangre por cada cadáver animado + Fuerza de Voluntad (dif 6). Posterior Astucia + Ocultismo (dif 8). Cada éxito permite levantar otro cadáver.

### Poder 4 — Robar Alma

Arranca el alma de un cuerpo viviente y la convierte en una especie de fantasma vinculado a su cuerpo vacío. Un humano exiliado de su cuerpo se convierte en un espíritu con un único vínculo con el mundo real: su cáscara vacía.

**Sistema**: 1 PS de sangre + 1 PS de FV + Fuerza de Voluntad (dif 7). Tirada enfrentada del mismo rasgo contra la víctima (dif 6 ambas). Los éxitos indican las horas que el alma queda fuera del cuerpo. El cuerpo permanecerá clínicamente vivo, pero catatónico.

### Poder 5 — Posesión Demoníaca

Introduce un alma en un cuerpo recientemente muerto (menos de 30 minutos) para que lo habite mientras dure el efecto. Útil para que un fantasma o alma vagabunda disponga de un hogar temporal. El cuerpo empezará a descomponerse en una semana.

**Sistema**: 1 PS + Fuerza de Voluntad (dif 8). El cadáver tiene < 30 minutos de muerto y el nuevo inquilino debe estar dispuesto. Para forzar a un Vástago vivo a salir de su cuerpo: 3 éxitos en tirada de Fuerza de Voluntad enfrentada contra el propietario original. El alma usa los Físicos del nuevo cuerpo y los Mentales propios.

## Senda — Senda de las Cenizas {#senda_cenizas}

Observa y manipula el Manto que separa vivos y muertos. La más peligrosa de las tres: muchos poderes aumentan la vulnerabilidad del vampiro a los fantasmas.

### Poder 1 — Visión del Manto

Ver a través del Manto, contemplar el paisaje de las Tierras de las Sombras y a los propios muertos en reposo. Cualquier espíritu cercano detecta que un vampiro lo observa, lo que puede traer consecuencias desagradables.

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Posterior Percepción + Alerta (dif 7). Los efectos duran una escena.

### Poder 2 — Lenguas sin Vida

Conversa con fantasmas sin esfuerzo y sin gastar sangre. Incluye automáticamente el efecto de Visión del Manto. **Sistema**: 1 PS + 1 FV + Percepción + Ocultismo (dif 6).

### Poder 3 — Mano Muerta

Atraviesa el Manto y afecta a objetos ectoplásmicos como si fueran físicos. Los fantasmas serán sólidos para el nigromante. A cambio, el vampiro queda totalmente sólido para los residentes del Inframundo y sus armas.

**Sistema**: 1 PS + 1 FV + Fuerza de Voluntad (dif 6). Posterior Astucia + Ocultismo (dif 7). Por cada escena en que el vampiro desee permanecer en contacto se gasta 1 PS adicional.

### Poder 4 — Ex Nihilo

El vampiro entra físicamente en el Inframundo. Mantiene sus niveles de salud habituales pero solo puede ser afectado por aquello que cause daño agravado a los fantasmas (armas forjadas con almas, poderes espectrales, etc.). Sometido a todos los peligros del Inframundo, incluyendo la destrucción definitiva.

**Sistema**: dibujar el umbral con tiza o sangre sobre una superficie adecuada + 2 PS de FV + 2 PS de sangre + Resistencia + Ocultismo (dif 8). Para regresar al mundo real: 1 PS de FV adicional + Resistencia + Ocultismo (dif 6). Un fracaso al regresar deja al nigromante atrapado en el Inframundo para siempre.

### Poder 5 — Dominio del Manto

Manipula el velo entre vivos y muertos para servir al nigromante o hacer imposible que los espíritus contacten con el mundo material. **Sistema**: 2 PS de FV + Fuerza de Voluntad (dif 9). Cada éxito rebaja o aumenta la dificultad de las acciones de los fantasmas en uno (máximo 10, mínimo 3). El Manto recupera consistencia a 1 punto por hora.

## Ritual — La Llamada de los Muertos Hambrientos {#llamada_muertos_hambrientos}

Solo 10 minutos pero requiere un cabello de la cabeza del objetivo, quemado en una vela negra. La víctima oirá retazos de conversaciones del otro lado del Manto durante el efecto. Si el objetivo no está preparado, las voces le llegarán como aullidos confusos haciendo demandas sobrenaturales que pueden enloquecerle temporalmente. **Sistema**: Inteligencia + Ocultismo (dif 4).

## Ritual — Ojos de la Tumba {#ojos_tumba}

Tras dos horas de invocación, la víctima experimenta visiones intermitentes de su propia muerte durante una semana. Las imágenes pueden durar hasta un minuto. El invocador no controla el contenido, solo que se manifiestan. Cada vez que las imágenes lleguen el objetivo debe tirar Coraje (dif 7) o sentirse totalmente aterrorizado. Pueden aparecer en cualquier momento, interfiriendo en actividades como conducir, disparar, etc. **Sistema**: Inteligencia + Ocultismo (dif 5). Requiere tierra de un sepulcro reciente.

## Ritual — Ritual del Grillete Desenterrado {#ritual_grillete_desenterrado}

Tras tres horas de invocación, una falange del esqueleto del fantasma se convierte en "sintonizador" con un elemento de vital importancia para él, facilitando los poderes de la Senda del Sepulcro contra ese fantasma. Muchos vampiros usan la falange como brújula sobrenatural. **Sistema**: 3 horas + falange + esquirla de lápida (no necesariamente del fantasma; se convierte en polvo y se espolvorea sobre el hueso) + Inteligencia + Ocultismo (dif 6).

## Ritual — Toque Cadavérico {#toque_cadaverico}

Tras tres horas cantando y fundiendo una muñeca de cera con la forma del objetivo, el nigromante convierte a un mortal en una réplica cadavérica de sí mismo: pulso débil, piel pálida y pegajosa. No le impide vivir, pero le convierte en una copia razonable de un muerto viviente. **+2 dificultad a todas las tiradas Sociales**. Los efectos solo empiezan a pasar cuando se permite a la cera endurecerse; si se vuelve a calentar el conjuro también se rompe. **Sistema**: 3 horas cantando + muñeca de cera + Inteligencia + Ocultismo (dif 7).

## Ritual — Aferrar lo Fantasmal {#aferrar_fantasmal}

Tras seis horas de cánticos permite al nigromante traer un objeto del Inframundo al mundo real. Un objeto material de masa equivalente debe ser reemplazado por el que se trae. Si no se hace así el objeto traído perderá su existencia ectoplásmica. Los objetos del Inframundo tienden a disiparse después de un año. **Sistema**: 6 horas + objeto material para reemplazo + Inteligencia + Ocultismo (dif 8).
