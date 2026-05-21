---
name: Animalismo
order: 0
tooltip: Conexión sobrenatural con la naturaleza primordial; comunica, controla y proyecta la Bestia.
powers:
  - level: 1
    name: Susurros Salvajes
    summary: Comunicarse con un animal cruzando la mirada; requiere contacto visual continuo.
    bloodCost: 0
    rollAttribute: manipulation
    rollAbility: Trato con animales
    rollDifficulty: 6
    tooltip: "Establece comunicación cruzando la mirada con el animal; dificultad varía según la criatura."
  - level: 2
    name: La Llamada
    summary: Llamada mística que invoca animales de un tipo específico desde la zona cercana.
    bloodCost: 0
    rollAttribute: stamina
    rollAbility: Supervivencia
    rollDifficulty: 6
    tooltip: "Imita la voz del animal con un componente místico; cada éxito acerca más animales."
  - level: 3
    name: Reprimir a la Bestia
    summary: Somete o aquieta la Bestia interior de un mortal con la mirada o el tacto.
    bloodCost: 0
    rollAttribute: manipulation
    rollAbility: Intimidación
    rollDifficulty: 7
    tooltip: "Acción extendida; tantos éxitos como Fuerza de Voluntad del objetivo. No afecta a Vástagos."
  - level: 4
    name: Comunión de Espíritus
    summary: Proyecta tu conciencia al cuerpo de un animal; tu cascarón queda en letargo.
    bloodCost: 0
    rollAttribute: manipulation
    rollAbility: Trato con animales
    rollDifficulty: 8
    tooltip: "Solo animales con visión y mirando al vampiro. Éxitos determinan cuántas Disciplinas puedes usar dentro del animal."
  - level: 5
    name: Apartar a la Bestia
    summary: Transfiere tu propia Bestia a una víctima cercana, evitando un frenesí inminente.
    bloodCost: 0
    rollAttribute: manipulation
    rollAbility: Empatía
    rollDifficulty: 8
    tooltip: "El vampiro debe estar en frenesí o muy cerca; la víctima recibe la furia y entra en frenesí en su lugar."
---

# Animalismo

Disciplina que conecta al vampiro con la **naturaleza primordial** propia y ajena. Permite hablar telepáticamente con bestias menores, proyectar la propia voluntad sobre ellas y, en niveles altos, dominar la Bestia interior de mortales y de uno mismo.

Un vampiro que carezca de esta Disciplina y de la Técnica **Trato con Animales** repelerá a las bestias, que se mostrarán inquietas en su presencia (a menudo hasta el punto de huir o de atacar). Animalismo permite invertir esa relación: calmar, atraer o controlar a las criaturas menores.

**Maestros del clan**: Gangrel. También cuentan con talento los Nosferatu, Ravnos y Tzimisce. Los Rasgos **Manipulación** y **Carisma** son centrales: cuanto más fuerte la personalidad, más fácil influye en las criaturas.

## 1 — Susurros Salvajes

Conexión empática con una bestia mediante el contacto visual. El vampiro cruza la mirada con el animal y transmite intenciones por pura fuerza de voluntad. No es necesario sisear, trinar o ladrar — aunque algunos lo hacen porque facilita el vínculo.

El contacto visual debe ser **constante**: si se rompe hay que restablecer la conexión desde el principio. No afecta criaturas sin visión, ni a insectos, invertebrados o peces (su Bestia es demasiado simple).

**Sistema**: no requiere tirada, pero hay que establecer contacto visual. Dar órdenes requiere `Manipulación + Trato con animales`. Dificultad por tipo:

| Animal | Dificultad |
|---|---|
| Mamíferos depredadores (lobos, felinos, murciélagos vampiro) | 6 |
| Demás mamíferos y pájaros depredadores (ratas, lechuzas) | 7 |
| Otros pájaros y reptiles (palomas, serpientes) | 8 |

Los éxitos determinan hasta qué punto el animal queda afectado por la orden. Un éxito basta para que un gato siga a alguien o que un cuervo guíe al personaje a un lugar; cinco aseguran lealtad casi feroz durante meses.

## 2 — La Llamada

La conexión con la Bestia se vuelve tan fuerte que la voz del vampiro evoca a un tipo concreto de animal (aullando como un lobo, graznando como un cuervo, etc.). La llamada invoca místicamente a criaturas de esa especie en la zona — aunque cada una decide si responde o no.

**Sistema**: tirada de `Carisma + Supervivencia` (dificultad 6). Solo responderán los animales que hayan podido oír al vampiro. La cantidad depende de los éxitos:

| Éxitos | Respuesta |
|---|---|
| 1 | Responde un solo animal |
| 2 | Responde el 25% de los animales en la zona |
| 3 | Responderá el 50% |
| 4 | Responderán casi todos |
| 5 | Responderán todos los animales |

## 3 — Reprimir a la Bestia

El depredador se asoma a la naturaleza bestial oculta en todo corazón mortal y la somete. Reprime emociones poderosas (esperanza, furia, inspiración) o las induce, convirtiendo al sujeto en apático, indiferente o sumiso.

Los clanes evocan este poder de formas diferentes: los Tzimisce lo llaman **Amedrentar a la Bestia**; los Nosferatu **Canción de la Serenidad**; los Gangrel obligan al espíritu mortal a someterse al miedo o la apatía.

**Sistema**: el vampiro debe tocar a la víctima o mirarla a los ojos. Tirada de `Manipulación + Intimidación` para someter mediante miedo, o `Manipulación + Empatía` si induce complacencia. Dificultad **7** en ambos casos.

Acción extendida que requiere tantos éxitos como puntos de Fuerza de Voluntad tenga el objetivo. Un fallo indica que el vampiro debe comenzar desde el principio; con un fracaso no podrá volver a afectar jamás a esa Bestia. La víctima cesa toda resistencia mental o física; ni se defiende si la atacan. Para recuperarse debe tirar `Fuerza de Voluntad` (dificultad 6) una vez al día hasta acumular tantos éxitos como la puntuación del vampiro en el Rasgo. No funciona contra Vástagos.

## 4 — Comunión de Espíritus

El vampiro proyecta su psique al cuerpo de un animal y lo posee. Mientras dure, el cascarón del Vástago queda en un estado similar al letargo. Algunos antiguos creen que es transferencia de espíritu; los más jóvenes, transferencia de conciencia. En cualquier caso, el espíritu del animal se desplaza por el del vampiro.

Los **Gangrel** disfrutan este uso para vivir el mundo desde otras especies. Los **Tzimisce** lo consideran ofensivo y rara vez lo usan.

**Sistema**: tirada de `Manipulación + Trato con Animales` (dificultad 8) mirando a los ojos del objetivo (solo se puede poseer bestias con sentido de la vista). Los éxitos determinan hasta qué punto desplaza al espíritu del animal y qué Disciplinas mentales puede usar dentro:

| Éxitos | Resultado |
|---|---|
| 1 | No puede utilizar Disciplinas |
| 2 | Puede utilizar Auspex |
| 3 | También Presencia |
| 4 | También Dementación y Dominación |
| 5 | También Nigromancia, Quimerismo y Taumaturgia |

Con menos de 5 éxitos el comportamiento del vampiro adopta rasgos del animal: su alma se nubla por instintos y necesidades animales. Los daños que sufra el animal se transfieren al cuerpo vampírico del modo normal. Si el animal muere antes de que el alma del Vástago pueda escapar, el cuerpo no-muerto queda en letargo.

Al final del incidente, para que el personaje mantenga la consciencia humana tras la posesión, tirada de `Astucia + Empatía` (dificultad 8). Un fallo deja parte de la mente atrapada en un comportamiento puramente animal. Un fracaso induce un frenesí tan extremo que ni gastar Fuerza de Voluntad lo evita.

## 5 — Apartar a la Bestia

Maestría total sobre la Bestia interior. Cada vez que el vampiro esté a punto de entrar en frenesí, puede **desviar** los instintos salvajes hacia otra criatura cercana, que entrará en frenesí en su lugar.

**Sistema**: el vampiro debe estar en frenesí o muy cerca para emplear el poder. Declara el objetivo (debe estar a la vista o en contacto) y tira `Manipulación + Autocontrol` (dificultad 8). Tabla:

| Éxitos | Resultado |
|---|---|
| 1 | Transfiere la Bestia pero la libera sobre alguien al azar |
| 2 | Queda aturdido y no puede actuar el siguiente turno; transfiere con éxito |
| 3 | Transfiere a la Bestia con éxito |

Si la tirada falla, la intensidad del frenesí del vampiro aumenta dramáticamente. Un fracaso es catastrófico: frenesí extremo, mínimo el doble de duración. Si el vampiro abandona las cercanías del objetivo antes de que la furia se calme, perderá su Bestia, quizá permanentemente. También se puede matar al anfitrión para que la Bestia regrese, pero esta acción costará un punto de Humanidad.
