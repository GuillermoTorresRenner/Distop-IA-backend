---
kind: paths
name: Taumaturgia
order: 9
tooltip: Magia de sangre de los Tremere. Sendas y rituales según el manual V20.
paths:
  - key: senda_sangre
    name: Senda de la Sangre
    order: 1
    tooltip: Senda primaria de los Tremere. Manipula la vitae propia y ajena.
    powers:
      - level: 1
        name: El sabor de la sangre
        summary: Catando vitae descubres generación, edad, salud y diablerie.
        bloodCost: 0
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Un sorbo basta para conocer al enemigo: generación, alimentación, salud."
      - level: 2
        name: La furia de la sangre
        summary: Obligas al objetivo a gastar su propia sangre contra su voluntad.
        bloodCost: 0
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cada éxito fuerza al objetivo a quemar 1 punto de sangre; ansiedad cercana al frenesí."
      - level: 3
        name: La sangre del poder
        summary: Concentras tu vitae para reducir temporalmente tu generación.
        bloodCost: 0
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Bajas tu generación 1 nivel por éxito durante una hora; uso por noche."
      - level: 4
        name: Robo de vitae
        summary: Drenas la sangre de un objetivo a la vista, sin contacto.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Transfieres puntos de sangre del objetivo a ti hasta a 18m. Crea vínculo de sangre."
      - level: 5
        name: Caldero de sangre
        summary: Hierves la sangre del objetivo con un toque; daño agravado.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 9
        tooltip: "Un éxito basta para matar a un mortal; cada éxito = 1 nivel de daño agravado."

  - key: encanto_llamas
    name: El Encanto de las Llamas
    order: 2
    tooltip: Conjura llamas místicas desde una vela hasta un infierno consumidor.
    powers:
      - level: 1
        name: Vela
        summary: Una llama del tamaño de una vela en la palma del Tremere.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 3
        tooltip: "Llama tipo vela; un nivel de daño agravado por turno (dificultad 3 para absorber)."
      - level: 2
        name: Palma de fuego
        summary: Una llama del tamaño de una mano arde sin combustible.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Palma de fuego; un nivel de daño agravado por turno (dificultad 4 para absorber)."
      - level: 3
        name: Fogata
        summary: Llamas de hoguera que cubren un metro cuadrado.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Fogata; dos niveles de daño agravado por turno (dificultad 5 para absorber)."
      - level: 4
        name: Hoguera
        summary: Una hoguera intensa lo bastante grande para alcanzar a varios objetivos.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hoguera; dos niveles de daño agravado por turno (dificultad 7 para absorber)."
      - level: 5
        name: Infierno
        summary: Un infierno consume todo en un radio amplio. El miedo de los vástagos.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Infierno; tres niveles de daño agravado por turno (dificultad 9 para absorber)."

  - key: movimiento_mental
    name: Movimiento Mental
    order: 3
    tooltip: Telequinesis mística mediante el poder de la sangre. Mueve objetos a voluntad.
    powers:
      - level: 1
        name: Medio kilo
        summary: Mueves objetos pequeños (hasta 0.5 kg) a voluntad.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Manipulas objetos hasta 0.5 kg; cada éxito = 1 turno de control."
      - level: 2
        name: Diez kilos
        summary: Mueves objetos medianos (hasta 10 kg).
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Manipulas objetos hasta 10 kg; mantener requiere Fuerza de Voluntad por turno extra."
      - level: 3
        name: Cien kilos
        summary: Mueves objetos pesados (hasta 100 kg). El Tremere puede levitar.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hasta 100 kg; puedes levitar y volar a velocidad de carrera."
      - level: 4
        name: Doscientos cincuenta kilos
        summary: Mueves objetos muy pesados (hasta 250 kg). Puedes arrojarlos.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hasta 250 kg; puedes arrojar objetos con Fuerza igual a tu nivel en la senda."
      - level: 5
        name: Quinientos kilos
        summary: Mueves objetos enormes (hasta 500 kg). Maestría telequinética.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hasta 500 kg; el máximo canon de la senda."

  - key: senda_conjuracion
    name: Senda de la Conjuración
    order: 4
    tooltip: Invocas objetos de la nada. Cuanto más alto el nivel, más complejos.
    powers:
      - level: 1
        name: Invocar la forma sencilla
        summary: Conjuras objetos sencillos e inanimados sin partes móviles.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Crea objetos simples (batuta, tubo, estaca). 1 PS por turno para mantenerlos."
      - level: 2
        name: Permanencia
        summary: Tus invocaciones simples se vuelven permanentes con 3 PS.
        bloodCost: 3
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Por 3 puntos de sangre el objeto sencillo invocado se hace permanente."
      - level: 3
        name: La magia del herrero
        summary: Conjuras objetos complejos con múltiples partes móviles.
        bloodCost: 3
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Objetos complejos (pistolas, bicicletas, sierras). Requiere tirada de Conocimientos."
      - level: 4
        name: Invertir conjuración
        summary: Desintegras un objeto que conjuraste antes.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Tirada extendida; igualar los éxitos de la conjuración original para deshacerla."
      - level: 5
        name: Poder sobre la vida
        summary: Conjuras simulacros vivientes pero sin voluntad propia.
        bloodCost: 5
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "10 PS para crear una criatura sin voluntad; dura una semana. No es vida real."

  - key: manos_destruccion
    name: Manos de Destrucción
    order: 5
    tooltip: Senda violenta del Sabbat. Decadencia, corrosión, descomposición.
    powers:
      - level: 1
        name: Deterioro
        summary: Aceleras la decrepitud de un objeto inanimado con un toque.
        bloodCost: 0
        rollAttribute: dexterity
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cada minuto de contacto envejece el objeto 10 años. Solo materia inerte u orgánica muerta."
      - level: 2
        name: Retorcer la madera
        summary: Combas y deformas madera con la mirada. Inutiliza estacas y muebles.
        bloodCost: 1
        rollAttribute: dexterity
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Retuerces 25 kg de madera por PS gastado; visible y a distancia."
      - level: 3
        name: Toque corrosivo
        summary: Tu cuerpo segrega ácido cáustico. Corroes metal, madera y carne.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "1 PS = ácido que atraviesa 5 mm de acero; ataques cc agravados por 1 PS/turno."
      - level: 4
        name: Atrofia
        summary: Pudres un miembro de la víctima dejándolo inútil. Irreversible en mortales.
        bloodCost: 0
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Necesitas 3+ éxitos para atrofia total; pierna o brazo, jamás cabeza o torso."
      - level: 5
        name: Convertir en polvo
        summary: Aceleras la decrepitud de una víctima viva. Polvo a tu toque.
        bloodCost: 0
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cada éxito envejece a la víctima 10 años; resistencia con Resistencia + Coraje."

rituals:
  - key: defensa_refugio_sagrado
    name: Defensa del Refugio Sagrado
    level: 1
    order: 1
    tooltip: Impide que la luz solar entre a menos de 6 metros del refugio.
    ingredients: La propia sangre del taumaturgo, trazada en puertas y ventanas.
    castingTime: 1 hora
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: despertar_frescura_tarde
    name: Despertar con la Frescura de la Tarde
    level: 1
    order: 2
    tooltip: Despierta al instante ante el peligro durante el día.
    ingredients: Cenizas de plumas quemadas esparcidas en la zona de descanso.
    castingTime: Inmediatamente antes de dormir
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: comunicacion_sire
    name: Comunicación con el Sire del Vástago
    level: 1
    order: 3
    tooltip: Conexión telepática con el sire a cualquier distancia.
    ingredients: Un objeto que haya pertenecido al sire.
    castingTime: 30 minutos de meditación
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: desviacion_muerte_madera
    name: Desviación de la Muerte de Madera
    level: 1
    order: 4
    tooltip: La primera estaca que iría a tu corazón se desintegra.
    ingredients: Un círculo continuo de madera (muebles, troncos, tablones).
    castingTime: 1 hora dentro del círculo
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: toque_diablo
    name: El Toque del Diablo
    level: 1
    order: 5
    tooltip: "Maldices a un mortal: todos lo encuentran odioso una noche."
    ingredients: Un penique colocado en la persona del objetivo.
    castingTime: La invocación frente al objetivo
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4

  - key: proteccion_contra_ghouls
    name: Protección contra Ghouls
    level: 2
    order: 6
    tooltip: Un objeto encantado causa dolor a cualquier ghoul que lo toque.
    ingredients: Un objeto pequeño (moneda, pergamino) y un punto de sangre vertido.
    castingTime: 10 horas tras el encantamiento
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5
  - key: foco_infusion_vitae
    name: Foco de Infusión de Vitae
    level: 2
    order: 7
    tooltip: Un objeto almacena un punto de sangre del taumaturgo para uso futuro.
    ingredients: Un objeto pequeño (moneda, pergamino) y un punto de sangre.
    castingTime: 10 minutos
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5

  - key: paso_incorporeo
    name: Paso Incorpóreo
    level: 3
    order: 8
    tooltip: El taumaturgo se vuelve inmaterial y atraviesa paredes durante el ritual.
    ingredients: Un fragmento de un espejo roto que conserve la imagen del vampiro.
    castingTime: Horas iguales a los éxitos de Astucia + Supervivencia
    rollAttribute: wits
    rollAbility: Supervivencia
    rollDifficulty: 6
  - key: escudo_presencia_inmunda
    name: Escudo de Presencia Inmunda
    level: 3
    order: 9
    tooltip: La Presencia se invierte sobre el atacante mientras el escudo dure.
    ingredients: Una tira de seda azul alrededor del cuello.
    castingTime: Una noche
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 6

  - key: hueso_mentiras
    name: Hueso de Mentiras
    level: 4
    order: 10
    tooltip: Un hueso fuerza a cualquiera que lo sostenga a decir la verdad.
    ingredients: Un hueso mortal de al menos 200 años de antigüedad y 10 puntos de sangre.
    castingTime: Una noche
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 7

  - key: contrato_sangre
    name: Contrato de Sangre
    level: 5
    order: 11
    tooltip: Acuerdo irrompible firmado en sangre, obligado sobrenaturalmente.
    ingredients: Sangre del invocador para escribir; sangre de cada firmante.
    castingTime: Tres noches
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 8
---

# Taumaturgia

La Taumaturgia engloba la magia de sangre y otras artes de hechicería
única de los Tremere. Combina la hechicería mortal con el poder de la
vitae vampírica. Es **versátil y poderosa**: su práctica está dividida
en dos partes — **sendas** (aplicaciones del conocimiento sobre la magia
de la sangre) y **rituales** (fórmulas formulaicas más elaboradas).

Cuando un personaje aprende su primer círculo de Taumaturgia, elige una
senda como su **senda primaria**. Esta sube automáticamente al
incrementar el nivel general de Taumaturgia. Las sendas secundarias se
compran por separado (a 7 puntos de experiencia por nivel), nunca pueden
superar a la primaria, y la primaria nunca puede pasar de 5 en creación.

Cada activación de un poder taumatúrgico consume **1 punto de sangre** y
exige una tirada de Fuerza de Voluntad contra una dificultad de
**nivel del poder + 3**. Un fallo significa que el personaje pierde
1 punto de Fuerza de Voluntad permanente — la Taumaturgia no es un arte
que se estudie por mera afición.

## Senda — Senda de la Sangre {#senda_sangre}

Casi todos los Tremere estudian esta senda como primaria. Abarca algunos
de los principios más fundamentales de la Taumaturgia manipulando la
vitae vampírica.

### Poder 1 — El sabor de la sangre

Permite conocer el poder de un enemigo. Con sólo catar la sangre del
objetivo el taumaturgo puede determinar cuánta vitae le queda, si se
trata de un vampiro, cuándo se alimentó por última vez, su generación
aproximada y, con tres o más éxitos, si ha cometido diablerie
recientemente.

### Poder 2 — La furia de la sangre

Este poder obliga a otro vástago a gastar sangre contra su voluntad.
Cada éxito obliga al objetivo a gastar un punto de sangre. Los puntos
gastados de este modo pueden exceder el límite normal por turno y cada
éxito aumenta en uno la dificultad de las tiradas para resistirse al
frenesí.

### Poder 3 — La sangre del poder

El taumaturgo obtiene tal control sobre su propia sangre que puede
"concentrarla", rebajando temporalmente su generación. Un éxito permite
reducir en uno la generación durante una hora.

### Poder 4 — Robo de vitae

Extrae la vitae de su objetivo a distancia. Cada éxito en una tirada de
Fuerza de Voluntad consigue transferir un punto de sangre. La víctima
debe estar a la vista y a menos de 18 metros.

### Poder 5 — Caldero de sangre

Hierve la sangre del objetivo en sus venas como agua en una olla. El
número de éxitos determina cuántos puntos de sangre hierven; cada uno
es un nivel de daño agravado. Un éxito basta para matar a un mortal.

## Senda — El Encanto de las Llamas {#encanto_llamas}

Conjura llamas místicas que escalan por niveles. El fuego creado no es
"natural" y debe ser **liberado** para causar daño: una palma de fuego
en la mano del taumaturgo no le quema. Una vez liberado, arde con
normalidad y queda fuera del control del invocador.

### Poder 1 — Vela
### Poder 2 — Palma de fuego
### Poder 3 — Fogata
### Poder 4 — Hoguera
### Poder 5 — Infierno

Cada nivel determina el tamaño y peligro de la llama (de vela a infierno).
Sólo Fortaleza puede absorber el daño.

## Senda — Movimiento Mental {#movimiento_mental}

Telequinesis mística. El taumaturgo manipula objetos como si los
tuviera en la mano. Los niveles fijan la masa máxima que se puede
mover; al alcanzar el nivel 3 el propio Tremere puede levitar y volar.

### Poder 1 — Medio kilo
### Poder 2 — Diez kilos
### Poder 3 — Cien kilos
### Poder 4 — Doscientos cincuenta kilos
### Poder 5 — Quinientos kilos

## Senda — Senda de la Conjuración {#senda_conjuracion}

Invoca objetos "de la nada". Los objetos creados son uniformemente
genéricos y, si se conjuran de nuevo, vuelven idénticos. El tamaño
máximo está limitado al del propio invocador.

### Poder 1 — Invocar la forma sencilla
### Poder 2 — Permanencia
### Poder 3 — La magia del herrero
### Poder 4 — Invertir conjuración
### Poder 5 — Poder sobre la vida

## Senda — Manos de Destrucción {#manos_destruccion}

Practicada casi exclusivamente por los taumaturgos del Sabbat. Encarna
la naturaleza violenta de la secta: provoca la entropía y la decadencia
de objetos, materia y seres vivos.

### Poder 1 — Deterioro
### Poder 2 — Retorcer la madera
### Poder 3 — Toque corrosivo
### Poder 4 — Atrofia
### Poder 5 — Convertir en polvo

## Ritual — Defensa del Refugio Sagrado {#defensa_refugio_sagrado}

Una oscuridad mística cubre puertas y ventanas, impidiendo que la luz
solar entre a menos de 6 metros del lugar de invocación. Dura mientras
el Tremere permanezca dentro del radio.

## Ritual — Despertar con la Frescura de la Tarde {#despertar_frescura_tarde}

Permite al Tremere despertar de inmediato ante la menor señal de peligro,
incluso durante el día. Si surge una circunstancia dañina el vampiro se
levanta preparado, ignorando la regla del límite a la reserva de dados
por Humanidad durante los primeros turnos.

## Ritual — Comunicación con el Sire del Vástago {#comunicacion_sire}

Une la mente del Tremere a la de su sire, conversación telepática a
cualquier distancia. Requiere algún objeto que haya pertenecido al sire.
Dura 10 minutos por éxito.

## Ritual — Desviación de la Muerte de Madera {#desviacion_muerte_madera}

La primera estaca que vaya a atravesar el corazón del taumaturgo se
desintegra en las manos del atacante. Las estacas próximas pero no
dirigidas al corazón no se ven afectadas. Dura hasta el siguiente
amanecer.

## Ritual — El Toque del Diablo {#toque_diablo}

Maldice a un mortal: durante toda una noche el resto del mundo lo
detesta y le hace la existencia imposible. Hasta los vagabundos lo
escupirán. Requiere colocar un penique en su persona.

## Ritual — Protección contra Ghouls {#proteccion_contra_ghouls}

Un objeto encantado causa dolor a cualquier ghoul que entre en contacto
con él. Los ghouls que insistan sufrirán tres dados de daño letal por
toque y deberán gastar Fuerza de Voluntad para intentar tocarlo de nuevo.

## Ritual — Foco de Infusión de Vitae {#foco_infusion_vitae}

Un objeto almacena un punto de sangre del taumaturgo para uso futuro.
Con una orden mental el Tremere libera el encantamiento y abre una
fuente de sangre disponible. Útil como reserva de emergencia.

## Ritual — Paso Incorpóreo {#paso_incorporeo}

El taumaturgo se vuelve **inmaterial** durante el ritual, pudiendo
atravesar paredes y puertas. También es invulnerable a ataques físicos.
Se debe seguir un camino directo y no se puede volver atrás. Exige un
fragmento de espejo roto que conserve la imagen del vampiro.

## Ritual — Escudo de Presencia Inmunda {#escudo_presencia_inmunda}

Los vástagos que invocan **Presencia** sobre el objetivo verán los
efectos invertidos sobre ellos mismos. Un vampiro que intentara
infundir terror lo sentiría en sus carnes. Requiere una tira de seda
azul que el protegido lleve alrededor del cuello.

## Ritual — Hueso de Mentiras {#hueso_mentiras}

Un hueso mortal antiguo se encanta para forzar a cualquiera que lo
sostenga a decir la verdad. Cada mentira intentada consume un punto
de sangre del hueso; cuando se agotan los 10 puntos la magia
desaparece.

## Ritual — Contrato de Sangre {#contrato_sangre}

Un acuerdo escrito en la sangre del invocador y sellado por la sangre
de cualquiera que firme. A las tres noches el contrato se vuelve
**irrompible**: todos los firmantes quedan obligados a cumplir su
parte. El único modo de romperlo es cumplir los términos o quemar el
propio documento.
