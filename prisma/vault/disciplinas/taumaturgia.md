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
        tooltip: "Catando vitae: revela datos sobre el dueño de la sangre."
      - level: 2
        name: La Furia de la Sangre
        summary: Obligas al objetivo a gastar su propia sangre contra su voluntad.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Fuerza al objetivo a quemar puntos de sangre por turno."
      - level: 3
        name: La Sangre del Poder
        summary: Concentras tu vitae para rebajar temporalmente tu generación durante una hora.
        bloodCost: 0
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Reduce tu generación durante una hora. Solo una vez por noche."
      - level: 4
        name: Robo de Vitae
        summary: Drenas la vitae de un objetivo a la vista, sin contacto.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Drena sangre de un objetivo a 18 m. Crea vínculo. Ruptura de Mascarada en público."
      - level: 5
        name: Caldero de Sangre
        summary: Hierves la sangre del objetivo con un toque; daño agravado.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Toque que hierve la sangre del objetivo. Daño agravado letal."

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
        tooltip: "Llama del tamaño de una vela."
      - level: 2
        name: Palma de Fuego
        summary: Una llama del tamaño de una mano arde sin combustible.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Llama del tamaño de una palma."
      - level: 3
        name: Fogata
        summary: Llamas tipo hoguera que cubren un metro cuadrado.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Llamas tipo fogata; 1 m² de cobertura."
      - level: 4
        name: Hoguera
        summary: Hoguera intensa que alcanza a varios objetivos.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Hoguera intensa que alcanza a varios objetivos."
      - level: 5
        name: Infierno
        summary: Un infierno consume todo en un radio amplio.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Infierno: consume todo en un radio amplio."

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
        tooltip: "Manipulas hasta 0,5 kg con la mente."
      - level: 2
        name: Diez Kilos
        summary: Manipula objetos hasta 10 kg.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Hasta 10 kg de masa manipulable."
      - level: 3
        name: Cien Kilos
        summary: Manipula hasta 100 kg. Permite levitar y volar a velocidad de carrera.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Hasta 100 kg; levitas y vuelas a velocidad de carrera."
      - level: 4
        name: Doscientos Cincuenta Kilos
        summary: Hasta 250 kg. Puede arrojar objetos con Fuerza = puntuación en la senda.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Hasta 250 kg. Puedes arrojar objetos como armas."
      - level: 5
        name: Quinientos Kilos
        summary: Hasta 500 kg. Maestría telequinética.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Hasta 500 kg. Maestría telequinética."

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
        tooltip: "Crea objetos simples sin partes móviles."
      - level: 2
        name: Permanencia
        summary: Las invocaciones simples se vuelven permanentes con 3 PS.
        bloodCost: 3
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Hace permanente un objeto sencillo conjurado."
      - level: 3
        name: La Magia del Herrero
        summary: Conjuras objetos complejos con múltiples partes móviles (pistolas, bicicletas, sierras).
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Conjura objetos complejos con partes móviles."
      - level: 4
        name: Invertir Conjuración
        summary: Desintegra un objeto previamente conjurado.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Desintegra un objeto que conjuraste antes."
      - level: 5
        name: Poder sobre la Vida
        summary: Conjura simulacros de criaturas sin voluntad propia.
        bloodCost: 5
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Conjura criaturas simuladas (sin voluntad propia)."

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
        tooltip: "Envejece un objeto con tu toque."
      - level: 2
        name: Retorcer la Madera
        summary: Combaduras visuales en madera, basta la mirada.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 5
        tooltip: "Comba y deforma madera con la mirada."
      - level: 3
        name: Toque Corrosivo
        summary: Segregas ácido cáustico por la piel. Corroe metal, madera y carne.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Segregas ácido cáustico. Corroe metal, madera y carne."
      - level: 4
        name: Atrofia
        summary: Pudres un miembro de la víctima. Irreversible en mortales.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Pudres un miembro de la víctima. Irreversible en mortales."
      - level: 5
        name: Convertir en Polvo
        summary: Aceleras la decrepitud de víctimas vivas. Polvo a tu toque.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Aceleras la decrepitud de víctimas vivas; polvo a tu toque."

rituals:
  - key: defensa_refugio_sagrado
    name: Defensa del Refugio Sagrado
    level: 1
    order: 1
    tooltip: Bloquea la luz solar en 6 m alrededor mientras el Tremere esté dentro.
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
    tooltip: La primera estaca dirigida a tu corazón se desintegra en manos del atacante.
    ingredients: Círculo continuo de madera y un trocito bajo la lengua.
    castingTime: 1 hora dentro del círculo
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4
  - key: toque_diablo
    name: El Toque del Diablo
    level: 1
    order: 5
    tooltip: Maldice a un mortal; todos lo encuentran insoportable una noche.
    ingredients: Un penique en la persona del objetivo.
    castingTime: La invocación frente al objetivo
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 4

  - key: proteccion_contra_ghouls
    name: Protección contra Ghouls
    level: 2
    order: 6
    tooltip: Un objeto encantado causa dolor a cualquier ghoul que lo toque.
    ingredients: Un objeto pequeño (moneda, pergamino) y un punto de sangre.
    castingTime: 10 horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 5
  - key: foco_infusion_vitae
    name: Foco de Infusión de Vitae
    level: 2
    order: 7
    tooltip: Un objeto almacena un punto de sangre del taumaturgo para uso posterior.
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
    tooltip: La Presencia que se use contra el objetivo se revierte sobre el atacante.
    ingredients: Tira de seda azul alrededor del cuello.
    castingTime: Una noche
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 6

  - key: hueso_mentiras
    name: Hueso de Mentiras
    level: 4
    order: 10
    tooltip: Hueso encantado que fuerza a quien lo sostenga a decir la verdad.
    ingredients: Hueso mortal de al menos 200 años + 10 PS.
    castingTime: Una noche
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 7

  - key: contrato_sangre
    name: Contrato de Sangre
    level: 5
    order: 11
    tooltip: Acuerdo irrompible firmado en sangre. Obliga sobrenaturalmente al cumplimiento.
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

## Senda — Senda de la Sangre {#senda_sangre}

Senda primaria de la mayoría de los Tremere. Trabaja directamente con la vitae vampírica: la del propio personaje y la de las víctimas.

### Poder 1 — El Sabor de la Sangre

Catando vitae el taumaturgo descubre datos sobre quien la portó. **Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Los éxitos determinan cuánta información y precisión: edad aproximada, generación, salud, si hubo diablerie reciente.

### Poder 2 — La Furia de la Sangre

Fuerza al objetivo a gastar puntos de sangre contra su voluntad. **Sistema**: 1 PS + toque + Fuerza de Voluntad (dif 5). Cada éxito obliga a la víctima a quemar 1 PS de inmediato, pudiendo exceder el límite por turno de su generación. La dificultad para resistir el frenesí del objetivo aumenta en 1 por cada éxito.

### Poder 3 — La Sangre del Poder

Concentra la propia vitae para reducir temporalmente la generación. **Sistema**: 1 PS + Fuerza de Voluntad (dif 6). Un éxito reduce 1 nivel de generación durante 1 hora. Cada éxito adicional añade un nivel más o una hora extra. Solo una vez por noche. Si te diablerizan durante el efecto, este desaparece.

### Poder 4 — Robo de Vitae

Drena la vitae del objetivo a distancia. **Sistema**: 1 PS + Fuerza de Voluntad (dif 7). El blanco debe estar a la vista, a menos de 18 m. Cada éxito transfiere 1 PS al taumaturgo. Cuenta como beber sangre: puede crear vínculo. La Camarilla lo considera ruptura de Mascarada en público.

### Poder 5 — Caldero de Sangre

Hierve la sangre del objetivo con un toque. **Sistema**: 1 PS + toque + Fuerza de Voluntad (dif 8). Cada éxito hierve 1 PS del objetivo y causa 1 nivel de daño **agravado**. A un mortal le basta un éxito para morir. Vampiros con Fortaleza absorben usando solo los dados de Fortaleza.

## Senda — El Encanto de las Llamas {#encanto_llamas}

Conjura llamas místicas. El fuego no es natural, pero una vez liberado arde con normalidad y escapa al control del taumaturgo. Para conjurar en la propia mano basta 1 éxito; 5 éxitos sitúan la llama en cualquier punto del alcance visual.

### Poder 1 — Vela

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Llama del tamaño de una vela. Para absorber: dif 3, un nivel agravado por turno. Mientras esté en la mano del taumaturgo no causa daño.

### Poder 2 — Palma de Fuego

**Sistema**: 1 PS + Fuerza de Voluntad (dif 5). Para absorber: dif 4, un nivel agravado por turno.

### Poder 3 — Fogata

**Sistema**: 1 PS + Fuerza de Voluntad (dif 6). Para absorber: dif 5, dos niveles agravados por turno.

### Poder 4 — Hoguera

**Sistema**: 1 PS + Fuerza de Voluntad (dif 7). Para absorber: dif 7, dos niveles agravados por turno.

### Poder 5 — Infierno

**Sistema**: 1 PS + Fuerza de Voluntad (dif 8). Para absorber: dif 9, tres niveles agravados por turno.

## Senda — Movimiento Mental {#movimiento_mental}

Telequinesia mística. La masa que puedes mover escala con el nivel. En nivel 3 puedes levitar y volar como si corrieras.

### Poder 1 — Medio Kilo

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Manipulas hasta 0,5 kg. Los éxitos = turnos de control. Mantener después: nueva tirada sin gasto. Si pierdes y vuelves a manipular, 1 PS nuevo.

### Poder 2 — Diez Kilos

**Sistema**: 1 PS + Fuerza de Voluntad (dif 5). Hasta 10 kg.

### Poder 3 — Cien Kilos

**Sistema**: 1 PS + Fuerza de Voluntad (dif 6). Hasta 100 kg. Puedes levitar y volar a velocidad de carrera. Las restricciones de masa aplican si transportas más objetos.

### Poder 4 — Doscientos Cincuenta Kilos

**Sistema**: 1 PS + Fuerza de Voluntad (dif 7). Hasta 250 kg. Puedes arrojar objetos con Fuerza igual a tu puntuación en la senda.

### Poder 5 — Quinientos Kilos

**Sistema**: 1 PS + Fuerza de Voluntad (dif 8). Hasta 500 kg. Tope canon. Para resistir a otro ser, tirada enfrentada de Fuerza de Voluntad cada turno.

## Senda — Senda de la Conjuración {#senda_conjuracion}

Invoca objetos "de la nada". Los objetos creados son uniformemente genéricos: invocar el mismo objeto dos veces produce copias idénticas. El tamaño máximo está limitado al del propio invocador.

### Poder 1 — Invocar la Forma Sencilla

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Crea objetos sencillos sin partes móviles (un bastón, una estaca, un tubo). 1 éxito = creación pobre; 5 = réplica casi perfecta. Para mantener el objeto se gasta 1 PS por turno.

### Poder 2 — Permanencia

**Sistema**: 3 PS + Fuerza de Voluntad (dif 5). El objeto sencillo invocado se hace permanente.

### Poder 3 — La Magia del Herrero

**Sistema**: 1 PS + Fuerza de Voluntad (dif 6). Conjura objetos complejos con múltiples partes móviles (pistolas, bicicletas, sierras eléctricas). Los más complejos requieren tirada adicional de Conocimientos (Pericias, Ciencia).

### Poder 4 — Invertir Conjuración

**Sistema**: 1 PS + Fuerza de Voluntad (dif 7), tirada extendida. Acumula tantos éxitos como obtuvo el invocador original durante la hora del objeto en cuestión.

### Poder 5 — Poder sobre la Vida

**Sistema**: 1 PS para la tirada + 10 PS para crear la criatura (cinco si se gastan también 1 FV temporal) + Fuerza de Voluntad (dif 8). El simulacro carece de voluntad propia y sigue las instrucciones del creador. Se desvanece una semana después.

## Senda — Manos de Destrucción {#manos_destruccion}

Practicada casi exclusivamente por los Sabbat. Encarna la naturaleza violenta de la secta: provoca entropía, decadencia y destrucción de cuerpos y materia.

### Poder 1 — Deterioro

**Sistema**: 1 PS + Fuerza de Voluntad (dif 4). Si hay éxito, el objeto tocado envejece 10 años por minuto de contacto. No afecta a vampiros (en mortales: vómito, malestar; en vampiros: -1 a Apariencia 1 noche).

### Poder 2 — Retorcer la Madera

**Sistema**: 1 PS + Fuerza de Voluntad (dif 5). Combaduras visuales en 25 kg de madera por punto de sangre gastado. Útil para inutilizar estacas de cazadores.

### Poder 3 — Toque Corrosivo

**Sistema**: 1 PS + Fuerza de Voluntad (dif 6). 1 PS de ácido atraviesa 5 mm de acero o 10 cm de madera. Ataques cuerpo a cuerpo aumentados con este ácido: daño agravado por 1 PS gastado adicional por turno. El taumaturgo es inmune a su propia secreción.

### Poder 4 — Atrofia

**Sistema**: 1 PS + Fuerza de Voluntad (dif 7). Pudres un brazo o pierna (no cabeza, no torso). La víctima resiste con Resistencia + Atletismo (dif 8): necesita igualar o superar los éxitos del taumaturgo. Mortales: irreversible. Vampiros: 5 PS para rejuvenecer el miembro.

### Poder 5 — Convertir en Polvo

**Sistema**: 1 PS + Fuerza de Voluntad (dif 8). Cada éxito envejece a la víctima 10 años. Resistencia + Coraje (dif 8) por encima de los éxitos del taumaturgo para resistir. Mortales mueren si la magia funciona; vampiros solo se arrugan (-1 Apariencia 1 noche).

## Ritual — Defensa del Refugio Sagrado {#defensa_refugio_sagrado}

Una oscuridad mística cubre puertas y ventanas a menos de 6 metros del lugar de invocación, bloqueando la luz solar. Dura mientras el Tremere permanezca dentro del radio. **Sistema**: 1 hora de invocación, 1 PS del taumaturgo trazado en puertas y ventanas, Inteligencia + Ocultismo (dif 4).

## Ritual — Despertar con la Frescura de la Tarde {#despertar_frescura_tarde}

Permite al Tremere despertar de inmediato ante cualquier peligro durante el día. Si surge una amenaza el vampiro se levanta preparado, ignorando temporalmente el límite a reservas de dados por Humanidad durante los primeros turnos de conciencia. **Sistema**: ceniza de pluma esparcida en la zona; ritual inmediatamente antes de dormir; Inteligencia + Ocultismo (dif 4).

## Ritual — Comunicación con el Sire del Vástago {#comunicacion_sire}

Conexión telepática con el sire a cualquier distancia. Conversación durante 10 minutos por éxito. **Sistema**: objeto que perteneció al sire, 30 minutos de meditación, Inteligencia + Ocultismo (dif 4).

## Ritual — Desviación de la Muerte de Madera {#desviacion_muerte_madera}

La primera estaca dirigida al corazón del taumaturgo se desintegra en manos del atacante. Estacas próximas pero no dirigidas al corazón no se ven afectadas. **Sistema**: círculo continuo de madera + 1 hora dentro + trocito de madera bajo la lengua + Inteligencia + Ocultismo (dif 4). Dura hasta el siguiente amanecer/anochecer.

## Ritual — El Toque del Diablo {#toque_diablo}

Maldice a un mortal: durante toda una noche, el resto del mundo lo detesta y le hace la existencia imposible. **Sistema**: penique colocado disimuladamente en la persona del objetivo + invocación frente a él + Inteligencia + Ocultismo (dif 4).

## Ritual — Protección contra Ghouls {#proteccion_contra_ghouls}

Un objeto encantado causa dolor a cualquier ghoul que entre en contacto con él. Los ghouls que insistan en tocarlo sufren 3 dados de daño letal por intento; deben gastar Fuerza de Voluntad para intentar tocarlo de nuevo. **Sistema**: objeto pequeño + 1 PS + 10 horas tras el encantamiento + Inteligencia + Ocultismo (dif 5).

## Ritual — Foco de Infusión de Vitae {#foco_infusion_vitae}

Un objeto almacena 1 PS del taumaturgo para uso futuro. Con una orden mental el Tremere libera la sangre encantada y dispone de ella. **Sistema**: objeto pequeño + 1 PS del propio taumaturgo + 10 minutos + Inteligencia + Ocultismo (dif 5). Útil como reserva de emergencia.

## Ritual — Paso Incorpóreo {#paso_incorporeo}

El taumaturgo se vuelve inmaterial. Atraviesa paredes y puertas; es invulnerable a ataques físicos. Debe seguir un camino directo y no puede volver atrás. **Sistema**: fragmento de espejo roto que conserve la imagen del vampiro + Astucia + Supervivencia (dif 6). Dura un número de horas igual a los éxitos obtenidos.

## Ritual — Escudo de Presencia Inmunda {#escudo_presencia_inmunda}

Los Vástagos que invocan **Presencia** sobre el objetivo verán los efectos invertidos sobre ellos mismos: el agresor sentiría el terror que pretendía infundir. **Sistema**: tira de seda azul que el protegido lleva alrededor del cuello + Inteligencia + Ocultismo (dif 6). Dura hasta el siguiente amanecer.

## Ritual — Hueso de Mentiras {#hueso_mentiras}

Un hueso mortal antiguo se encanta para forzar a cualquiera que lo sostenga a decir la verdad. Cada mentira intentada consume 1 PS del hueso; cuando se agotan los 10 PS la magia desaparece. **Sistema**: hueso mortal de al menos 200 años + 10 PS al imbuirlo + Inteligencia + Ocultismo (dif 7).

## Ritual — Contrato de Sangre {#contrato_sangre}

Un acuerdo escrito con la sangre del invocador y sellado por la sangre de los firmantes. A las tres noches el contrato se vuelve **irrompible**: todos quedan obligados a cumplir su parte. El único modo de romperlo es cumplir los términos o quemar el propio documento. **Sistema**: sangre del invocador para escribir + 1 PS adicional por firmante + tres noches + Inteligencia + Ocultismo (dif 8).
