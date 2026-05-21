---
kind: paths
name: Taumaturgia
order: 9
tooltip: Magia de sangre de los Tremere. Cada poder de senda cuesta 1 PS + tirada de FV vs (nivel + 3).
paths:
  - key: senda_sangre
    name: Senda de la Sangre
    order: 1
    tooltip: Senda primaria de la mayoría de los Tremere. Manipula la vitae vampírica.
    powers:
      - level: 1
        name: El Sabor de la Sangre
        summary: Catando vitae descubres edad, generación, salud y diablerie reciente.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Cuesta 1 PS. Tirada FV dif 4 (nivel+3). Éxitos = cantidad y precisión de información obtenida sobre la sangre del objetivo."
      - level: 2
        name: La Furia de la Sangre
        summary: Obligas al objetivo a gastar su propia sangre contra su voluntad.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Cuesta 1 PS. Toque + tirada FV dif 5. Cada éxito obliga a la víctima a quemar 1 PS; puede exceder el límite normal por turno. +1 dif para resistir frenesí."
      - level: 3
        name: La Sangre del Poder
        summary: Concentras tu vitae para rebajar temporalmente tu generación durante una hora.
        bloodCost: 0
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS y tirada FV dif 6. 1 éxito = -1 generación durante 1 hora. Cada éxito adicional: -1 más a generación o +1 hora. Uso una vez por noche. Si te diablerizan, fin del efecto."
      - level: 4
        name: Robo de Vitae
        summary: Drenas la vitae de un objetivo a la vista, sin contacto.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 7. Víctima a 18m máximo, a la vista. Cada éxito transfiere 1 PS al taumaturgo. Cuenta como beber sangre — crea vínculo. La Camarilla lo considera ruptura de Mascarada en público."
      - level: 5
        name: Caldero de Sangre
        summary: Hierves la sangre del objetivo con un toque; daño agravado.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS. Toque + tirada FV dif 8. Cada éxito hierve 1 PS del objetivo y causa 1 nivel agravado. Mortal: 1 éxito basta para matarlo. Vampiros con Fortaleza absorben usando solo dados de Fortaleza."

  - key: encanto_llamas
    name: El Encanto de las Llamas
    order: 2
    tooltip: Conjura llamas místicas. El fuego no es natural pero arde con normalidad una vez liberado.
    powers:
      - level: 1
        name: Vela
        summary: Llama del tamaño de una vela en la palma o señalada con el dedo.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. Llama tipo vela. Absorber: dif 3, un nivel agravado/turno. Mientras esté en la mano no causa daño."
      - level: 2
        name: Palma de Fuego
        summary: Una llama del tamaño de una mano arde sin combustible.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Cuesta 1 PS. Tirada FV dif 5. Absorber: dif 4, un nivel agravado/turno."
      - level: 3
        name: Fogata
        summary: Llamas tipo hoguera que cubren un metro cuadrado.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS. Tirada FV dif 6. Absorber: dif 5, dos niveles agravados/turno."
      - level: 4
        name: Hoguera
        summary: Hoguera intensa que alcanza a varios objetivos.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 7. Absorber: dif 7, dos niveles agravados/turno."
      - level: 5
        name: Infierno
        summary: Un infierno consume todo en un radio amplio.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS. Tirada FV dif 8. Absorber: dif 9, tres niveles agravados/turno. Para conjurar en la propia mano basta 1 éxito; 5 sitúa la llama en cualquier punto del alcance visual."

  - key: movimiento_mental
    name: Movimiento Mental
    order: 3
    tooltip: Telequinesia mística. La masa que puedes mover escala con el nivel; en nivel 3 puedes volar.
    powers:
      - level: 1
        name: Medio Kilo
        summary: Mueve objetos hasta 0,5 kg con la mente.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. Éxitos = turnos de manipulación. Para mantener pasado ese tiempo se hace nueva tirada (sin gasto). Si pierdes control y vuelves a manipular, 1 PS de nuevo."
      - level: 2
        name: Diez Kilos
        summary: Manipula objetos hasta 10 kg.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Cuesta 1 PS. Tirada FV dif 5. Tabla de masa idéntica salvo el peso máximo."
      - level: 3
        name: Cien Kilos
        summary: Manipula hasta 100 kg. Permite levitar y volar a velocidad de carrera.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS. Tirada FV dif 6. Vuela como si corriera. Restricciones de peso si transporta otros objetos."
      - level: 4
        name: Doscientos Cincuenta Kilos
        summary: Hasta 250 kg. Puede arrojar objetos con Fuerza = puntuación en la senda.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 7. Daño por arrojar = Fuerza (nivel en la senda)."
      - level: 5
        name: Quinientos Kilos
        summary: Hasta 500 kg. Maestría telequinética.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS. Tirada FV dif 8. Tope canon de la senda. Para resistir a otro ser, tirada enfrentada de FV cada turno."

  - key: senda_conjuracion
    name: Senda de la Conjuración
    order: 4
    tooltip: Invoca objetos de la nada. Los objetos creados son genéricos e idénticos si se conjuran de nuevo.
    powers:
      - level: 1
        name: Invocar la Forma Sencilla
        summary: Crea objetos sencillos e inanimados sin partes móviles.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. 1 éxito = creación pobre; 5 = réplica casi perfecta. 1 PS adicional por turno para mantener el objeto."
      - level: 2
        name: Permanencia
        summary: Las invocaciones simples se vuelven permanentes con 3 PS.
        bloodCost: 3
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Cuesta 3 PS. Tirada FV dif 5. El objeto sencillo invocado se hace permanente."
      - level: 3
        name: La Magia del Herrero
        summary: Conjuras objetos complejos con múltiples partes móviles (pistolas, bicicletas, sierras).
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS. Tirada FV dif 6. Los más complejos requieren tirada adicional de Conocimientos (Pericias, Ciencia)."
      - level: 4
        name: Invertir Conjuración
        summary: Desintegra un objeto previamente conjurado.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 7 extendida: acumular tantos éxitos como el invocador original obtuvo en la hora del objeto."
      - level: 5
        name: Poder sobre la Vida
        summary: Conjura simulacros de criaturas sin voluntad propia.
        bloodCost: 5
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS para la tirada + 10 PS canónicamente para mantener la criatura. Tirada FV dif 8. Simulacro carece de voluntad. Una semana después se desvanece."

  - key: manos_destruccion
    name: Manos de Destrucción
    order: 5
    tooltip: Senda violenta. Acelera la decrepitud y corrompe el cuerpo de la víctima.
    powers:
      - level: 1
        name: Deterioro
        summary: Acelera la decrepitud de un objeto inanimado con un toque.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 4
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. Si tiene éxito, el objeto envejece 10 años por minuto de contacto. Sin efecto en vampiros (-1 Apariencia 1 noche)."
      - level: 2
        name: Retorcer la Madera
        summary: Combaduras visuales en madera, basta la mirada.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Cuesta 1 PS por uso. Tirada FV dif 5. 25 kg de madera por PS gastado. Útil para estacas de cazavampiros."
      - level: 3
        name: Toque Corrosivo
        summary: Segregas ácido cáustico por la piel. Corroe metal, madera y carne.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS. Tirada FV dif 6. 1 PS = ácido atraviesa 5 mm de acero o 10 cm de madera. Daño CC agravado por 1 PS/turno (gasto separado). Inmune a su propia secreción."
      - level: 4
        name: Atrofia
        summary: Pudres un miembro de la víctima. Irreversible en mortales.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 7. Necesitas 3+ éxitos en Resistencia + Atletismo (dif 8) para resistir. Brazo o pierna; no cabeza ni torso. 5 PS para rejuvenecer."
      - level: 5
        name: Convertir en Polvo
        summary: Aceleras la decrepitud de víctimas vivas. Polvo a tu toque.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS. Tirada FV dif 8. Cada éxito envejece a la víctima 10 años. Resistencia + Coraje (dif 8) — debe sumar más éxitos que el taumaturgo. Mortales mueren si la magia funciona; vampiros solo se arrugan (-1 Apariencia 1 noche)."

rituals:
  - key: defensa_refugio_sagrado
    name: Defensa del Refugio Sagrado
    level: 1
    order: 1
    tooltip: Impide que la luz solar entre a menos de 6 metros del lugar. Dura mientras el Tremere esté dentro.
    ingredients: La propia sangre del taumaturgo trazada en puertas y ventanas.
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
    tooltip: Conexión telepática con el sire a cualquier distancia. 10 minutos por éxito.
    ingredients: Un objeto que haya pertenecido al sire.
    castingTime: 30 minutos de meditación
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: desviacion_muerte_madera
    name: Desviación de la Muerte de Madera
    level: 1
    order: 4
    tooltip: La primera estaca que iría a tu corazón se desintegra en manos del atacante. Dura hasta amanecer/anochecer.
    ingredients: Círculo continuo de madera y un trocito bajo la lengua.
    castingTime: 1 hora dentro del círculo
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: toque_diablo
    name: El Toque del Diablo
    level: 1
    order: 5
    tooltip: "Maldice a un mortal: todos lo encuentran odioso una noche."
    ingredients: Un penique en la persona del objetivo.
    castingTime: La invocación frente al objetivo
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4

  - key: proteccion_contra_ghouls
    name: Protección contra Ghouls
    level: 2
    order: 6
    tooltip: Un objeto encantado causa dolor a cualquier ghoul que lo toque. 3 dados letales/contacto.
    ingredients: Un objeto pequeño (moneda, pergamino) y un punto de sangre.
    castingTime: 10 horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5
  - key: foco_infusion_vitae
    name: Foco de Infusión de Vitae
    level: 2
    order: 7
    tooltip: Un objeto almacena un punto de sangre del taumaturgo para liberación posterior.
    ingredients: Un objeto pequeño y un PS del propio taumaturgo.
    castingTime: 10 minutos
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5

  - key: paso_incorporeo
    name: Paso Incorpóreo
    level: 3
    order: 8
    tooltip: Te vuelves inmaterial. Atraviesas paredes y eres invulnerable a ataques físicos.
    ingredients: Fragmento de espejo roto que conserve la imagen del vampiro.
    castingTime: Horas iguales a los éxitos de Astucia + Supervivencia
    rollAttribute: wits
    rollAbility: Supervivencia
    rollDifficulty: 6
  - key: escudo_presencia_inmunda
    name: Escudo de Presencia Inmunda
    level: 3
    order: 9
    tooltip: La Presencia que se use contra el objetivo se revierte sobre el atacante. Dura una noche.
    ingredients: Tira de seda azul alrededor del cuello.
    castingTime: Una noche
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 6

  - key: hueso_mentiras
    name: Hueso de Mentiras
    level: 4
    order: 10
    tooltip: Hueso encantado fuerza a quien lo sostenga a decir la verdad. 10 PS de duración por mentira.
    ingredients: Hueso mortal de al menos 200 años + 10 PS.
    castingTime: Una noche
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 7

  - key: contrato_sangre
    name: Contrato de Sangre
    level: 5
    order: 11
    tooltip: Acuerdo irrompible firmado en sangre. Sobrenaturalmente obliga al cumplimiento.
    ingredients: Sangre del invocador para escribir; sangre de cada firmante; 1 PS adicional al firmar.
    castingTime: Tres noches
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 8
---

# Taumaturgia

Magia de sangre del clan Tremere. Combina hechicería mortal con vitae vampírica. Disciplina **versátil y poderosa**: se divide en dos partes — **sendas** (aplicaciones del conocimiento sobre la magia de la sangre) y **rituales** (fórmulas más formulaicas, como conjuros de las noches antiguas).

Cuando un personaje aprende su primer círculo de Taumaturgia elige una **senda primaria**: recibe automáticamente un círculo en ella y, a partir de ahí, cada nivel de Taumaturgia incrementa también la senda primaria. Las sendas secundarias se compran por separado (puntos de experiencia o gratuitos). La puntuación en la primaria siempre debe ser igual o superior al de cualquier secundaria, hasta que se domine la primaria a nivel 5; entonces las secundarias también pueden subir a 5.

La puntuación general de Taumaturgia puede superar el nivel **5** (los grados superiores aparecerán en futuros suplementos), pero las sendas no exceden 5.

## Sistema (regla universal de las sendas)

Cada vez que el personaje invoca un poder de una senda taumatúrgica, el jugador debe **gastar un punto de sangre** y hacer una tirada de **Fuerza de Voluntad** contra una dificultad del **nivel del poder + 3**. Solo se necesita un éxito para provocar el efecto: la potencia de la magia (cantidad/duración) la determina la senda, no los éxitos. Un fallo indica que la magia no surte efecto; un fracaso significa la pérdida de **un punto permanente de Fuerza de Voluntad**.

## Rituales

Los rituales son fórmulas meticulosas. Menos versátiles que las sendas pero más adecuados para fines concretos. Cada ritual se aprende por separado. La invocación lleva **5 minutos por nivel** (un ritual de nivel 2 tarda 10 minutos). Tirada `Inteligencia + Ocultismo`, dificultad **3 + nivel del ritual** (máximo 9). Un éxito basta. Los rituales suelen requerir ingredientes especiales (hierbas, huesos, objetos ceremoniales).

Un Vástago aprende automáticamente **un ritual de nivel 1** con el primer nivel de Taumaturgia. El resto se aprenden a lo largo de la crónica (pueden llevar noches a años de estudio según el nivel).

## Sendas conocidas

- **Senda de la Sangre** (primaria habitual): manipula la vitae propia y ajena.
- **El Encanto de las Llamas**: conjura llamas místicas.
- **Movimiento Mental**: telequinesia y vuelo en niveles altos.
- **Senda de la Conjuración**: crea objetos de la nada.
- **Manos de Destrucción**: corroe y pudre. Senda preferida del Sabbat.
