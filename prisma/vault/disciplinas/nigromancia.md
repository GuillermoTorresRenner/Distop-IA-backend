---
kind: paths
name: Nigromancia
order: 10
tooltip: Magia de los muertos. Tres sendas (Sepulcro, Osario, Cenizas) + rituales.
paths:
  - key: senda_sepulcro
    name: Senda del Sepulcro
    order: 1
    tooltip: Senda primaria. Invoca, interroga y vincula fantasmas del Inframundo.
    powers:
      - level: 1
        name: Penetración
        summary: Lees los últimos minutos de vida en los ojos de un cadáver.
        bloodCost: 0
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Visión final del muerto; dif 10 para no-vivos (zombis) y 8 para criaturas que vivieron."
      - level: 2
        name: Invocar espíritu
        summary: Llamas a un fantasma específico del Inframundo para conversar.
        bloodCost: 0
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Invocas un fantasma específico; -2 dificultad si tienes un objeto que tocó en vida."
      - level: 3
        name: Ordenar a espíritu
        summary: Fuerzas al espíritu a obedecer una orden.
        bloodCost: 0
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cada éxito sube el grado de obediencia: 1=quedarse cerca, 5=cumple sin objetar."
      - level: 4
        name: Embrujar
        summary: Atas al fantasma a un lugar u objeto durante una noche.
        bloodCost: 0
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Ata fantasma al lugar; resistir requiere FV dif 10 + 2 éxitos o sufrir agravado."
      - level: 5
        name: Atormentar
        summary: Golpeas a un espíritu como si estuvieras en las tierras de los muertos.
        bloodCost: 0
        rollAttribute: stamina
        rollAbility: Empatía
        rollDifficulty: 7
        tooltip: "Cada éxito = 1 nivel de daño letal al espíritu; al perder todos los niveles, destruido."

  - key: senda_osario
    name: Senda del Osario
    order: 2
    tooltip: Domina los cadáveres. Animarlos, manipularlos, hablar a través de ellos.
    powers:
      - level: 1
        name: Tremens
        summary: Animas la carne de un cadáver durante una acción sencilla.
        bloodCost: 1
        rollAttribute: dexterity
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Animas cadáver durante una acción; útil para asustar o transmitir mensajes."
      - level: 2
        name: Las escobas del aprendiz
        summary: Un cuerpo muerto realiza una función sencilla por horas.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cadáveres realizan tareas simples (cargar, cavar); no defienden ni atacan."
      - level: 3
        name: Hordas tambaleantes
        summary: Animas zombis combatientes que obedecen tu última orden.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cada éxito = 1 zombi animado (Fuerza 3, Dex 2, Res 4, Pelea 2). 1 FV por sesión."
      - level: 4
        name: Robar alma
        summary: Conviertes a un viviente en un fantasma vinculado a su cuerpo vacío.
        bloodCost: 0
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Tirada enfrentada de Manipulación + Ocultismo (dif 6); cada éxito = 1 hora fuera del cuerpo."
      - level: 5
        name: Posesión demoníaca
        summary: Introduces un alma en un cadáver reciente para que lo habite.
        bloodCost: 0
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cadáver con < 30 min de muerto; alma usa físicas del nuevo cuerpo, mentales propias."

  - key: senda_cenizas
    name: Senda de las Cenizas
    order: 3
    tooltip: Observa, atraviesa y manipula el Inframundo y su Manto.
    powers:
      - level: 1
        name: Visión del manto
        summary: Ves a través del Manto y contemplas el paisaje de las Tierras de las Sombras.
        bloodCost: 0
        rollAttribute: perception
        rollAbility: Alerta
        rollDifficulty: 7
        tooltip: "Ves el Inframundo y sus moradores durante una escena; los espíritus también te ven."
      - level: 2
        name: Lenguas sin vida
        summary: Conversas con fantasmas sin esfuerzo y sin gastar sangre.
        bloodCost: 0
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hablas con cualquier fantasma cercano; incluye Visión del Manto automáticamente."
      - level: 3
        name: Mano muerta
        summary: Atraviesas el Manto y afectas objetos ectoplásmicos como si fueran físicos.
        bloodCost: 0
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Coges objetos del Inframundo; vampiro sólido para fantasmas (y sus armas)."
      - level: 4
        name: Ex nihilo
        summary: Entras físicamente en el Inframundo y caminas por las tierras de los muertos.
        bloodCost: 2
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Atraviesas el Manto en cuerpo; solo daños agravados a fantasmas pueden herirte allí."
      - level: 5
        name: Dominio del manto
        summary: Manipulas el velo entre vivos y muertos. Refuerzas o debilitas el Manto.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 9
        tooltip: "Cada éxito modifica dificultades de acciones de los fantasmas hasta 10 o mínimo 3."

rituals:
  - key: llamada_muertos_hambrientos
    name: La Llamada de los Muertos Hambrientos
    level: 1
    order: 1
    tooltip: Oyes retazos de conversaciones del otro lado del Manto.
    ingredients: Un cabello de la cabeza del objetivo, quemado en una vela negra.
    castingTime: 10 minutos
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4

  - key: ojos_tumba
    name: Ojos de la Tumba
    level: 2
    order: 2
    tooltip: La víctima experimenta visiones intermitentes de su propia muerte.
    ingredients: Un poco de tierra de un sepulcro reciente.
    castingTime: Dos horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5

  - key: ritual_grillete_desenterrado
    name: Ritual del Grillete Desenterrado
    level: 3
    order: 3
    tooltip: Una falange permite usar los poderes del Sepulcro con mayor facilidad.
    ingredients: Una falange del esqueleto del fantasma y una esquirla de lápida.
    castingTime: Tres horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 6

  - key: toque_cadaverico
    name: Toque Cadavérico
    level: 4
    order: 4
    tooltip: Conviertes a un mortal en una réplica cadavérica de sí mismo.
    ingredients: Una muñeca de cera con la forma del objetivo.
    castingTime: Tres horas cantando
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 7

  - key: aferrar_fantasmal
    name: Aferrar lo Fantasmal
    level: 5
    order: 5
    tooltip: Traes un objeto del Inframundo al mundo físico.
    ingredients: Seis horas de cánticos y un objeto de masa equivalente para reemplazar.
    castingTime: Seis horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 8
---

# Nigromancia

La **Nigromancia** es a la vez una Disciplina y una escuela de
aprendizaje mágico dedicada al **control de las almas de los muertos**.
Se parece a la Taumaturgia en que, en vez de ser una progresión lineal
de poderes, consiste en distintas **sendas** con sus correspondientes
**rituales**. Los nigromantes vampíricos más poderosos pueden invocar a
los muertos, expulsar o aprisionar almas, e incluso reinsertar a los
fantasmas en cuerpos vivos (o no-muertos).

A lo largo de los siglos las diferentes escuelas se han diversificado,
dejando tres sendas de magia abiertas a los Cainitas. Todos los
nigromantes aprenden primero la **Senda del Sepulcro**, extendiendo sus
estudios después, cuando el tiempo y la oportunidad lo permiten, a la
**Senda del Osario** o a la **Senda de las Cenizas**. La Senda del
Sepulcro se considera primaria del personaje y aumenta automáticamente
cuando sube su puntuación general en Nigromancia. Las Sendas del
Osario y de las Cenizas se adquieren por separado.

Un nigromante Cainita debe aprender al menos tres niveles en la Senda
del Sepulcro antes de aprender el primero en una de las otras dos.
Luego debe alcanzar la maestría en la Senda Primaria (cinco niveles)
antes de adquirir el primer nivel en la tercera Senda.

## Senda — Senda del Sepulcro {#senda_sepulcro}

Senda primaria. Trabajo con fantasmas: ver lo que vio el muerto antes
de morir, invocar espíritus, ordenarles, atarlos a lugares, y golpear
sus formas ectoplásmicas.

### Poder 1 — Penetración

Mira los ojos de un cadáver y ve reflejado lo último que el muerto
contempló antes de morir. Una imagen visible sólo en las retinas del
nigromante; dificultad 8 para criaturas que estuvieron vivas, 10 para
no-vivos (incluidos vampiros).

### Poder 2 — Invocar espíritu

Llama a un fantasma específico del Inframundo. El nigromante debe
conocer el nombre del fantasma; un objeto del fantasma cercano otorga
**-2 a la dificultad**. Los fantasmas invocados serán visibles y
audibles para todos. No se puede invocar a fantasmas destruidos o
perdidos en la Tormenta del Inframundo.

### Poder 3 — Ordenar a espíritu

Una vez invocado, el vampiro fuerza al fantasma a obedecer. Cada éxito
asciende el grado de control: 1 éxito = el fantasma debe quedarse
cerca; 5 éxitos = el fantasma está atrapado y obedece. Atadura por una
hora por éxito; un punto temporal de Fuerza de Voluntad lo extiende a
una noche.

### Poder 4 — Embrujar

Ata al fantasma a un lugar o un objeto. Si intenta abandonarlo deberá
hacer una tirada de FV (dif 10) o sufrir un nivel de daño agravado. Si
pierde todos los niveles de salud es arrojado al Inframundo donde se
enfrentará a su destrucción.

### Poder 5 — Atormentar

El nigromante golpea al espíritu como si estuviera en las tierras de
los muertos. Cada éxito en una tirada de Resistencia + Empatía causa
un nivel de daño letal a la forma ectoplásmica.

## Senda — Senda del Osario {#senda_osario}

Se ocupa principalmente de los **cadáveres** y los métodos por los que
las almas muertas pueden regresar al mundo de los vivos, temporal o
permanentemente.

### Poder 1 — Tremens

Anima durante una acción sencilla la carne de un cadáver. Un brazo se
extiende, los ojos se abren, el cadáver se sienta. Provoca grandes
reacciones en quienes no lo esperan.

### Poder 2 — Las escobas del aprendiz

Un cuerpo muerto realiza una función sencilla por horas. Cargar
objetos, cavar, arrastrar de un lugar a otro. Los cuerpos no atacarán
ni se defenderán, sólo seguirán intentando cumplir sus órdenes hasta
ser incapacitados.

### Poder 3 — Hordas tambaleantes

Cuerpos reanimados capaces de atacar de forma torpe y lenta. Una vez
levantados, esperan (años, si es necesario) hasta cumplir sus órdenes.
Estadísticas zombi: Fuerza 3, Destreza 2, Resistencia 4, Pelea 2;
siempre actúan los últimos en un turno.

### Poder 4 — Robar alma

Arranca el alma de un cuerpo vivo (o vampírico) y la convierte en una
especie de fantasma vinculado a su cuerpo vacío. Los éxitos indican el
número de horas que el alma queda fuera; el cuerpo queda catatónico
durante ese tiempo.

### Poder 5 — Posesión demoníaca

Introduce un alma en un cuerpo recientemente muerto (menos de 30
minutos). El nuevo inquilino debe estar dispuesto (no es posible
obligar a un alma o forma astral a entrar en una cáscara). El cuerpo
en cuestión se descompone en una semana.

## Senda — Senda de las Cenizas {#senda_cenizas}

Observa las tierras de los muertos e incluso afecta a los objetos y
criaturas que las habitan. De las tres Sendas de la Nigromancia, ésta
es la más peligrosa, ya que muchos poderes aumentan la vulnerabilidad
del vampiro a los fantasmas.

### Poder 1 — Visión del manto

Ver a través del Manto, la barrera mística que separa el mundo de los
vivos del Inframundo. El vampiro contempla edificios fantasmales, el
paisaje de las Tierras de las Sombras y a los propios muertos.
Cualquier espíritu cercano detecta que un vampiro lo observa, lo que
puede traer consecuencias desagradables.

### Poder 2 — Lenguas sin vida

Mientras Visión del Manto sólo dejaba ver fantasmas, este poder
permite **conversar** con ellos sin esfuerzo. No se necesita gasto de
sangre ni obligar a los fantasmas a realizar esfuerzos. Incluye el
efecto de Visión del Manto automáticamente.

### Poder 3 — Mano muerta

Atraviesa el Manto y afecta los objetos ectoplásmicos como si fueran
físicos. Los fantasmas serán sólidos para el nigromante. Además, puede
relacionarse con los edificios espirituales (dando la sensación de que
camina por el aire). A cambio, el vampiro es **totalmente sólido para
los residentes del Inframundo** y sus armas.

### Poder 4 — Ex Nihilo

El vampiro entra **físicamente** en el Inframundo. Mantendrá su número
normal de niveles de salud, pero sólo podrá ser afectado por aquello
que cause daño agravado a los fantasmas. Está sometido a todos los
peligros del Inframundo, incluyendo la destrucción definitiva.

### Poder 5 — Dominio del manto

Manipula el velo entre vivos y muertos para servir al nigromante o
hacer imposible que los espíritus contacten el mundo material. Cada
éxito rebaja o aumenta la dificultad de las acciones de los fantasmas
en uno, hasta un máximo de 10 y un mínimo de 3.

## Ritual — La Llamada de los Muertos Hambrientos {#llamada_muertos_hambrientos}

Solo 10 minutos, pero requiere de un cabello de la cabeza del objetivo.
El rito termina con la quema del cabello en una vela negra; tras lo
cual la víctima oye retazos de conversaciones del otro lado del Manto.

## Ritual — Ojos de la Tumba {#ojos_tumba}

Tras dos horas de invocación, el objetivo experimenta visiones
intermitentes de su muerte durante una semana. Las imágenes pueden
durar hasta un minuto; cada vez que aparecen el objetivo debe tirar
Coraje (dificultad 7) o aterrorizarse.

## Ritual — Ritual del Grillete Desenterrado {#ritual_grillete_desenterrado}

Una falange del esqueleto del fantasma se convierte en "brújula
nigromántica" tras tres horas de invocación. Permite usar los poderes
de la Senda del Sepulcro con mayor facilidad y seguir al objeto en
cuestión. Necesita esquirla de lápida (no del propio dueño) para
funcionar.

## Ritual — Toque Cadavérico {#toque_cadaverico}

Cantando durante tres horas y fundiendo una muñeca de cera con la
forma del objetivo, el nigromante convierte a un mortal en una réplica
cadavérica de sí mismo: piel pálida, pulso débil. +2 dificultad a
todas las tiradas Sociales. Reversible: derretir más cera deshace el
efecto.

## Ritual — Aferrar lo Fantasmal {#aferrar_fantasmal}

Tras seis horas de cánticos, el nigromante trae un objeto del
Inframundo al mundo real. Un objeto material de masa equivalente debe
ser reemplazado en el lugar del objeto traído. Los objetos así
adquiridos tienden a disiparse después de un año aproximadamente.
