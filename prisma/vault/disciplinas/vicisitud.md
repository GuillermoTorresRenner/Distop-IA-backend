---
name: Vicisitud
order: 10
tooltip: Esculpe la carne y los huesos. Maestría del clan Tzimisce sobre la materia viva o muerta.
powers:
  - level: 1
    name: Semblante Maleable
    summary: Altera tus propios parámetros corporales (altura, voz, rasgos faciales, tono de piel).
    bloodCost: 1
    rollAttribute: intelligence
    rollAbility: Medicina
    rollDifficulty: 6
    tooltip: "1 PS por parte del cuerpo a cambiar. Cambios cosméticos hasta 30 cm. Duplicar a otro: dif 8 con 5 éxitos para reproducción exacta. Aumentar Apariencia: dif 10."
  - level: 2
    name: Moldear Carne
    summary: Esculpe la piel, músculo, grasa y cartílago de un objetivo capturado (no hueso).
    bloodCost: 0
    rollAttribute: dexterity
    rollAbility: Medicina
    rollDifficulty: 5
    tooltip: "Dificultad 5 manipulación tosca, 9 transformación precisa. Cada éxito altera un Atributo en 1. Reducir es más fácil (dif 5)."
  - level: 3
    name: Moldear Hueso
    summary: Manipula el hueso del mismo modo que la carne. Crea garras, púas defensivas o deformaciones letales.
    bloodCost: 0
    rollAttribute: strength
    rollAbility: Medicina
    rollDifficulty: 7
    tooltip: "Como arma ofensiva: cada éxito (dif 7) = 1 nivel letal. Pinchos en nudillos: Fuerza+1 letal. Púas defensivas: Fuerza dados letales al atacante en CC. 5+ éxitos vs Vástago: cierra caja torácica al corazón, mitad de PS quemados."
  - level: 4
    name: Forma Horrenda
    summary: Te conviertes en una monstruosidad de pesadilla; +3 a todos los Físicos, Sociales caen a 0.
    bloodCost: 2
    rollAttribute: null
    rollAbility: null
    rollDifficulty: null
    tooltip: "Cuesta 2 PS. Físicos +3, Sociales 0 (salvo Intimidación). Intimidar permite usar Atributo Físico en su lugar. +1 daño en combate cuerpo a cuerpo."
  - level: 5
    name: Forma de Sangre
    summary: Transforma todo el cuerpo en vitae sentiente; fluye por el suelo y atraviesa fisuras.
    bloodCost: 0
    rollAttribute: null
    rollAbility: null
    rollDifficulty: null
    tooltip: "Sin coste de tirada pero requiere que toda la sangre quede contigo. Puedes alimentar, crear ghouls o vincular. Si esta sangre se ingiere o destruye = Muerte Definitiva. Inmune a estacas, perforaciones, aplastamientos. Arderá al sol."
---

# Vicisitud

Disciplina característica de los **Tzimisce**. Es similar en muchos aspectos a Protean, pero permite a los Demonios esculpir tanto su carne y sus huesos como los de los demás. Cuando un Tzimisce utiliza Vicisitud para alterar a un mortal, un ghoul o a un vampiro de generación superior, los efectos del poder son **permanentes**. Los Vástagos de igual o menor generación pueden curar los efectos como si se tratara de heridas agravadas. Por supuesto, un Tzimisce siempre puede reformar su propia carne.

Para uso ajeno hay que **tocar a la víctima** y a menudo esculpir físicamente sus nuevas facciones. Esto se aplica al uso personal de la Disciplina también. Los Tzimisce más habilidosos suelen ser inhumanamente bellos; los demás son simplemente inhumanos.

**Nota**: los Nosferatu siempre "curan" las alteraciones, al menos las que les dan un mejor aspecto. La Disciplina no permite ignorar la vieja maldición del clan.

## Alteración Corporal (Habilidad)

La Vicisitud es tanto un arte como un poder, así que los vampiros que deseen emplearla tendrán que aprender una versión particular de la Técnica **Pericias** conocida como **Alteración Corporal**. Permite cambios en hueso y carne viva o muerta. Muchos Tzimisce conocen también desollamiento, talla de huesos, embalsamamiento, taxidermia, tatuaje y piercing.

## 1 — Semblante Maleable

Altera los propios parámetros corporales: altura, constitución, voz, rasgos faciales y tono de piel. Cambios cosméticos y de alcance menor: no más de 30 cm de gano o pérdida. La alteración debe moldearse en el cuerpo hasta obtener el resultado deseado.

**Sistema**: el jugador gasta **1 PS por cada parte del cuerpo a cambiar**. Tirada de `Inteligencia + Alteración Corporal` (dif 6). Duplicar la voz o el aspecto de otra persona: `Percepción + Alteración Corporal` (dif 8), con cinco éxitos necesarios para reproducción exacta. Éxitos menores dejan fallos. Aumentar en uno el Rasgo **Apariencia** tiene dificultad 10. Un fracaso reduce el Atributo permanentemente en uno.

## 2 — Moldear Carne

Como Semblante Maleable, pero permite alteraciones drásticas y grotescas sobre **otras criaturas**. Los Tzimisce suelen emplearlo para transformar a sus servidores en guardias monstruosos. Solo carne (piel, músculo, grasa y cartílago), no hueso.

**Sistema**: el vampiro debe apresar a la víctima. `Destreza + Alteración Corporal` con dificultad variable: **5** para manipulación tosca, **9** para transformaciones precisas. Aumentar Apariencia funciona como en el poder anterior; **reducir** es más fácil (dif 5). Una desfiguración inspirada puede precisar dificultad mayor. Cada éxito aumenta o reduce el Atributo en uno.

Un vampiro puede mover trozos de piel, grasa y tejido muscular para protección extra en una zona. Por cada éxito en una tirada de `Destreza + Alteración Corporal` (dif 8) puede aumentar en 1 la reserva de absorción, al precio de **1 PS o 1 nivel de salud** (elección del vampiro).

## 3 — Moldear Hueso

Manipula el hueso como la carne. Combinado con Moldear Carne, deforma a una víctima (o a sí mismo) más allá de todo reconocimiento. Empleado junto a las artes anteriores excepto cuando se quieren provocar daños.

**Sistema**: tirada de `Fuerza + Alteración Corporal` (dificultades como anteriores). Usar como arma ofensiva: cada éxito (dif 7) inflige 1 nivel de daño **letal**, ya que los huesos romperán, cortarán y rasgarán los tejidos.

Crear armamento óseo:

- **Pinchos en nudillos**: arma ofensiva. El vampiro o víctima sufren 1 nivel letal al crearse (atraviesa la carne). Daño en combate: **Fuerza + 1** letal.
- **Púas defensivas**: receptor sufre 5 - éxitos en niveles de salud (fracaso mata a un mortal o letarga a un vampiro). Atacantes en CC reciben **Fuerza** dados letales, salvo que logren tres o más éxitos en su tirada (sufren daño normal igualmente). Suman +2 al daño causado por presas, agarrones y placajes.

5+ éxitos contra un Vástago rival: cierra la caja torácica hacia el corazón. No causa letargo pero la víctima pierde la **mitad de sus PS**, el centro impulsor de la vitae se quema.

## 4 — Forma Horrenda

Convierte al Tzimisce en una monstruosidad imponente. Estatura hasta dos metros y medio, piel verde grisácea o gris oscura, brazos largos y nudosos, grandes garras, rostro distorsionado, pinchos óseos a lo largo de la columna vertebral, caparazón exudando sustancia hedionda.

**Sistema**: cuesta **2 puntos de sangre**. Todos los Atributos Físicos (Fuerza, Destreza, Resistencia) aumentan en **3**; los Sociales descienden a **0** (salvo para tratar con otras Formas Horrendas). Un vampiro con este poder activo que intimide a alguien podrá usar **Fuerza** en lugar del Atributo Social correspondiente. El daño en combate cuerpo a cuerpo aumenta en **1** debido a los filos óseos y protuberancias.

## 5 — Forma de Sangre

Transforma físicamente todo el cuerpo, o parte de él, en **vitae sentiente**. Esta sangre será idéntica en todos los aspectos a la de cualquier vampiro: podrá emplearse para alimentarse el mismo o a otros, crear ghouls o establecer vínculos de sangre. Si por cualquier motivo toda esta sangre se ingiere o destruye, el vampiro sufre la **Muerte Definitiva**.

**Sistema**: el Vástago puede transformar cualquier parte de sí mismo. Cada pierna se convierte en dos puntos de sangre, igual que el torso. Los brazos, la cabeza y el abdomen tienen el equivalente a un punto de sangre. Esta vitae puede recuperar su antigua forma siempre que esté en contacto con el vampiro. Si la sangre ha sido utilizada o destruida, el Vástago deberá gastar un número de puntos de sangre igual al equivalente para recuperar el miembro perdido.

Un vampiro que adopte **por completo** esta forma no puede ser atravesado con una estaca, rajado, perforado o aplastado, pero sí arderá si se le expone al sol. El Vástago podrá fluir por el suelo, gotear de las paredes o atravesar las menores fisuras como se vio en **Forma Tenebrosa** de Obtenebración (ver Lasombra).

Se pueden emplear las Disciplinas mentales siempre que no sea necesario el contacto ocular o la comunicación verbal. Si un vampiro en esta forma "empapa" a un mortal o animal, este deberá superar una tirada de **Coraje** (dif 8) o huir aterrorizado.
