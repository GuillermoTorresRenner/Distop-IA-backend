---
name: Auspex
order: 1
tooltip: Percepción sobrenatural. Sentidos amplificados, lectura de auras, telepatía y proyección psíquica.
powers:
  - level: 1
    name: Sentidos Agudizados
    summary: Duplica el alcance y nitidez de los cinco sentidos a voluntad.
    bloodCost: 0
    rollAttribute: null
    rollAbility: null
    rollDifficulty: null
    tooltip: "No requiere tirada. Activación voluntaria. Riesgo de quedar cegado/aturdido por estímulos intensos (FV dif 4 para resistir)."
  - level: 2
    name: Percepción del Aura
    summary: Ve las auras psíquicas que irradian las criaturas y deduce emociones y naturaleza sobrenatural.
    bloodCost: 0
    rollAttribute: perception
    rollAbility: Empatía
    rollDifficulty: 8
    tooltip: "Cada éxito agrega claridad. Solo un intento por sujeto y día sin fracaso, o un mes de espera."
  - level: 3
    name: El Toque del Espíritu
    summary: Lee impresiones psíquicas dejadas en un objeto por quienes lo manipularon recientemente.
    bloodCost: 0
    rollAttribute: perception
    rollAbility: Empatía
    rollDifficulty: 6
    tooltip: "Trance superficial al sostener el objeto. Dificultad según antigüedad y carga emocional del residuo."
  - level: 4
    name: Telepatía
    summary: Proyecta o lee pensamientos en mentes cercanas.
    bloodCost: 0
    rollAttribute: intelligence
    rollAbility: Subterfugio
    rollDifficulty: 7
    tooltip: "Dificultad = Fuerza de Voluntad del objetivo. 1 éxito por capa de pensamiento penetrada. No funciona con muertos vivientes salvo gastando 1 FV."
  - level: 5
    name: Proyección Psíquica
    summary: Proyecta tu conciencia fuera del cuerpo; viajas como forma astral por el mundo.
    bloodCost: 0
    rollAttribute: perception
    rollAbility: Ocultismo
    rollDifficulty: 7
    tooltip: "Cuesta 1 FV. Dificultad 7 cerca de territorio conocido, hasta 10 lejos. Cordón de plata vulnerable a cortes."
---

# Auspex

Disciplina sensorial. Amplifica los sentidos, revela auras, lee impresiones de objetos, comunica mentes y permite proyectar la conciencia al plano astral. Es la herramienta principal de investigadores y políticos Vástagos.

**Maestros del clan**: Tremere, Toreador, Tzimisce, Malkavian. **Percepción** elevada potencia toda la Disciplina.

## Ver lo Invisible (regla común)

- vs **Ofuscación**: si Auspex > Ofuscación del objetivo, detecta automáticamente. Si igual, tirada enfrentada `Percepción + Subterfugio` vs `Manipulación + Subterfugio` (dif 7 ambas). Si Ofuscación es mayor, sigue oculto.
- vs **Quimerismo**: igual procedimiento. El jugador debe declarar sospecha.
- vs **otros poderes** (magos, fantasmas): tirada enfrentada `Percepción + Subterfugio` vs `Manipulación + Subterfugio` (dif 7).

## 1 — Sentidos Agudizados

Duplica vista, oído, olfato; refina tacto y gusto. Permite ataques a distancia si puede oír/oler al objetivo. En oscuridad penumbrosa reduce la dificultad para actuar de +2 a +1.

Riesgo: la sobrecarga sensorial puede cegar o aturdir. Tirada `Fuerza de Voluntad` (dif 4) ante luz/ruido/olor muy intenso; fallo = sentidos saturados uno o dos turnos.

## 2 — Percepción del Aura

Lee las auras psíquicas. Cuanto más claros y brillantes los colores, más intensas las emociones; las mezclas y patrones revelan complejidad psicológica. Permite identificar magos (auras brillantes y restallantes), licántropos (intensas y vibrantes), fantasmas (débiles e intermitentes), Vástagos (pálidas), diabolistas (venas negras).

Tabla canon de éxitos:

| Éxitos | Resultado |
|---|---|
| 1 | Solo distingue una sombra (pálida o brillante) |
| 2 | Color principal |
| 3 | Patrones de color |
| 4 | Cambios sutiles |
| 5 | Mezclas y patrones complejos |

Un fracaso = interpretación falsa. Solo un intento por sujeto; pasado un mes se puede volver a intentar sin penalización.

## 3 — El Toque del Espíritu

Sostener un objeto en trance superficial revela quién lo usó, cuándo y para qué. Visiones fragmentarias tipo "fotografía psíquica desenfocada". Acontecimientos con emociones intensas dejan trazas más vívidas.

**Dificultad orientativa**: 5 para una pistola usada en un asesinato reciente; 9 para identificar al dueño de unas llaves perdidas hace días.

| Éxitos | Resultado |
|---|---|
| 1 | Dato genérico ("el reloj estuvo en el bolsillo de un hombre") |
| 3 | Tipo de persona ("hombre mezquino y asustado de mediana edad") |
| 4 | Nombre |
| 5+ | Conexión personal completa con el objeto |

Un ruido repentino o sensación física fuerte interrumpe la concentración.

## 4 — Telepatía

Proyecta o lee pensamientos en mentes mortales cercanas. Proyectar pensamientos = 1 éxito (el sujeto siente que el pensamiento no es suyo). Leer = 1 éxito por dato extraído o capa penetrada. Secretos profundos: 5+ éxitos.

No funciona con mentes no-muertas salvo gastando **1 FV** para hacer el esfuerzo y luego tirar normalmente. Se recomienda describir resultados como corrientes de emociones e imágenes, no como prosa.

## 5 — Proyección Psíquica

La conciencia abandona el cuerpo. El cascarón queda en letargo. La forma astral es inmune al daño físico y la fatiga; vuela por la Tierra a hasta 1.500 km/h. Un **cordón de plata** la une al cuerpo: cortarlo deja la psique atrapada en el plano astral.

**Sistema**: 1 FV + `Percepción + Ocultismo`. Dificultades: **7** para destino familiar, **10** para zonas alejadas (primer viaje a otro continente, centro de la Tierra). Más éxitos = mayor concentración. Cambiar curso = otro FV y nueva tirada.

En forma astral los Rasgos Físicos se sustituyen por Mentales/Sociales (`Astucia`↔`Destreza`, `Manipulación`↔`Fuerza`, `Inteligencia`↔`Resistencia`). En combate astral se usa Fuerza de Voluntad como pool de salud; quien quede a 0 ve cortarse su cordón.

Con otro punto de FV puede manifestarse como figura fantasmal durante un turno; habla pero no puede afectar objetos físicos.
