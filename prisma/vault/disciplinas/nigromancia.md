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
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. Posteriormente Percepción + Ocultismo (dif 8 si tuvo vida, 10 si no la tuvo, 9 si es vampiro). Tabla 1-5 éxitos: sensación / imagen clara / con sonido minutos previos / media hora / hora completa. Fracaso: ve la propia Muerte Definitiva (Rötschreck)."
      - level: 2
        name: Invocar Espíritu
        summary: Llama a un fantasma específico del Inframundo a tu presencia.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 5. Posterior Percepción + Ocultismo dif 7 (o FV del fantasma). Objeto que tocó en vida: -2 dificultad. No invoca fantasmas destruidos, diabolizados o perdidos en la Tormenta. Fracaso: invoca espectro hostil."
      - level: 3
        name: Ordenar a Espíritu
        summary: Obliga a un espíritu invocado a obedecer órdenes.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 6. Posterior Manipulación + Ocultismo (dif = FV del objetivo). Tabla: 1=quedarse cerca / 2=responder preguntas / 3=verdad sin omisión / 4=servicio por la letra / 5=esclavitud diligente. 1h por éxito o 1 noche por 1 FV temporal o 1 año+1 día por 1 FV permanente."
      - level: 4
        name: Embrujar
        summary: Ata al fantasma invocado a un lugar u objeto.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 7. Manipulación + Ocultismo (dif = FV del objetivo si se resiste, 4 si no). Cada éxito ata 1 noche; 1 FV temporal = semana; 1 FV permanente = año. Si el fantasma fuerza salida: FV dif 10 con 2 éxitos o nivel agravado."
      - level: 5
        name: Atormentar
        summary: Golpeas a un fantasma como si estuvieras en el Inframundo causándole daño ectoplásmico.
        bloodCost: 1
        rollAttribute: stamina
        rollAbility: Empatía
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS. Tirada FV dif 8. Resistencia + Empatía (dif = FV del objetivo). Cada éxito 1 nivel letal al espíritu. Si pierde todos los niveles, arrojado al Inframundo; no puede volver al mundo real durante un mes."

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
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. Posterior Destreza + Ocultismo dif 6. Cuantos más éxitos, acción más compleja: 1 espasmo súbito; 5 condiciones específicas (\"abre los ojos la próxima vez que alguien entre\"). El cadáver no atacará ni causará daño."
      - level: 2
        name: Las Escobas del Aprendiz
        summary: Un cuerpo muerto realiza una función sencilla durante horas.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS de sangre + 1 PS de FV. Tirada FV dif 5. Posterior Astucia + Ocultismo dif 7. Éxitos = número de muertos animados. El cadáver realizará tareas simples; no atacará ni se defenderá. Sirve hasta ser destruido."
      - level: 3
        name: Hordas Tambaleantes
        summary: Anima zombis combatientes que obedecen la última orden.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS de FV + 1 PS de sangre por cadáver animado. Tirada FV dif 6. Astucia + Ocultismo dif 8. Cada éxito permite animar otro cadáver. Zombi: Fuerza 3, Destreza 2, Resistencia 4, Pelea 2, FV 0. Siempre actúan al final del turno."
      - level: 4
        name: Robar Alma
        summary: Arranca el alma de un cuerpo viviente convirtiéndolo en fantasma vinculado.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS de sangre + 1 PS de FV. Tirada FV dif 7 + tirada enfrentada de Manipulación + Ocultismo vs Resistencia del objetivo (dif 6 ambas). Éxitos = horas que el alma permanece fuera del cuerpo (cuerpo catatónico)."
      - level: 5
        name: Posesión Demoníaca
        summary: Introduce un alma en un cadáver recientemente muerto para que lo habite.
        bloodCost: 1
        rollAttribute: manipulation
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Cuesta 1 PS. Tirada FV dif 8. Cadáver con < 30 min de muerto, alma dispuesta. Cuerpo se descompone en una semana. Alma usa Físicas del nuevo cuerpo, Mentales propias. Forzar a Vástago vivo a salir de su cuerpo: 3 éxitos FV vs FV original."

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
        tooltip: "Cuesta 1 PS. Tirada FV dif 4. Posterior Percepción + Alerta dif 7. Efectos duran una escena. Los espíritus que detecten al vampiro pueden traer consecuencias desagradables."
      - level: 2
        name: Lenguas sin Vida
        summary: Conversas con fantasmas sin esfuerzo y sin gastar sangre.
        bloodCost: 1
        rollAttribute: perception
        rollAbility: Ocultismo
        rollDifficulty: 6
        tooltip: "Cuesta 1 PS + 1 FV. Tirada Percepción + Ocultismo dif 6. Hablas con cualquier fantasma cercano. Incluye Visión del Manto automáticamente."
      - level: 3
        name: Mano Muerta
        summary: Atraviesas el Manto y afectas objetos ectoplásmicos como si fueran físicos.
        bloodCost: 1
        rollAttribute: wits
        rollAbility: Ocultismo
        rollDifficulty: 7
        tooltip: "Cuesta 1 PS + 1 FV. Tirada FV dif 6. Posterior Astucia + Ocultismo dif 7. Por cada escena en que el vampiro desee permanecer en contacto se gasta 1 PS adicional. El vampiro es sólido para fantasmas (y sus armas)."
      - level: 4
        name: Ex Nihilo
        summary: Entras físicamente en el Inframundo.
        bloodCost: 2
        rollAttribute: stamina
        rollAbility: Ocultismo
        rollDifficulty: 8
        tooltip: "Dibujar el umbral con tiza/sangre + 2 PS de FV + 2 PS sangre. Tirada Resistencia + Ocultismo dif 8. Atraviesas. Solo afectable por daños agravados a fantasmas. Para regresar: otro PS de FV + Resistencia + Ocultismo dif 6. Fracaso = atrapado para siempre."
      - level: 5
        name: Dominio del Manto
        summary: Manipulas el velo entre vivos y muertos.
        bloodCost: 0
        rollAttribute: intelligence
        rollAbility: Ocultismo
        rollDifficulty: 9
        tooltip: "Cuesta 2 FV. Tirada FV dif 9. Cada éxito rebaja o aumenta la dificultad de acciones de fantasmas en 1 (máx 10, mín 3). El Manto recupera consistencia a 1 punto por hora."

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
    tooltip: Una falange permite usar la Senda del Sepulcro con mayor facilidad y seguir al objetivo.
    ingredients: Falange del esqueleto del fantasma + esquirla de lápida.
    castingTime: Tres horas
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 6

  - key: toque_cadaverico
    name: Toque Cadavérico
    level: 4
    order: 4
    tooltip: Convierte a un mortal en una réplica cadavérica de sí mismo (+2 dif Sociales).
    ingredients: Muñeca de cera con la forma del objetivo.
    castingTime: Tres horas cantando
    rollAttribute: intelligence
    rollAbility: Ocultismo
    rollDifficulty: 7

  - key: aferrar_fantasmal
    name: Aferrar lo Fantasmal
    level: 5
    order: 5
    tooltip: Trae un objeto del Inframundo al mundo real. Reemplazo de masa equivalente requerido.
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
