/* eslint-disable @typescript-eslint/no-floating-promises */
import 'dotenv/config';
import {
  PrismaClient,
  MeritFlawKind,
  WeaponKind,
  WeaponDamageBase,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

/** Arquetipos canónicos (Naturaleza/Conducta) — V20. */
const ARCHETYPES: { name: string; description: string }[] = [
  {
    name: 'Arquitecto',
    description: 'Construye algo duradero que otros disfrutarán.',
  },
  { name: 'Autócrata', description: 'Quiere mandar; busca control y poder.' },
  {
    name: 'Bon vivant',
    description: 'Disfruta la (no)vida con apetitos sensoriales.',
  },
  { name: 'Bravucón', description: 'Intimida para obtener lo que quiere.' },
  {
    name: 'Cabezota',
    description: 'Una vez que decide algo, no cambia de idea.',
  },
  {
    name: 'Capullo',
    description: 'Pretende ser otra cosa de la que realmente es.',
  },
  { name: 'Caudillo', description: 'Lidera por carisma y guía a otros.' },
  { name: 'Celebrante', description: 'Vive una causa o ideal con devoción.' },
  {
    name: 'Comodín',
    description: 'Sorprende con burla y bromas; impredecible.',
  },
  { name: 'Conformista', description: 'Sigue a los demás y al statu quo.' },
  { name: 'Director', description: 'Necesita orden y coordina a los demás.' },
  { name: 'Fanático', description: 'Persigue una causa por encima de todo.' },
  { name: 'Gamberro', description: 'Disfruta haciendo el mal a otros.' },
  { name: 'Jueza', description: 'Sopesa, decide y dicta veredictos.' },
  {
    name: 'Lacayo',
    description: 'Sirve a otro fielmente, sin ambición propia.',
  },
  { name: 'Maquinador', description: 'Manipula desde las sombras.' },
  { name: 'Niño', description: 'Inocencia, dependencia, capricho.' },
  {
    name: 'Pedagogo',
    description: 'Quiere enseñar y transmitir lo aprendido.',
  },
  { name: 'Penitente', description: 'Carga culpa; vive para expiar.' },
  { name: 'Rebelde', description: 'Se opone a la autoridad y a las normas.' },
  { name: 'Rufián', description: 'Resuelve a base de fuerza bruta.' },
  { name: 'Solitario', description: 'Trabaja y vive aparte de los demás.' },
  {
    name: 'Superviviente',
    description: 'Lo único que importa es seguir adelante.',
  },
  { name: 'Trotamundos', description: 'Sigue su camino sin ataduras.' },
  { name: 'Vividor', description: 'Aprovecha a otros sin esfuerzo propio.' },
];

/** Disciplinas V20 con metadata mecánica para auto-descuento de sangre y
 *  prefill de tirada.
 *   - `bloodCost`: puntos de sangre que cuesta activar. 0 = pasivo/gratuito.
 *   - `rollAttribute` / `rollAbility`: claves para la tirada activa.
 *     Si ambos son null, el poder es pasivo o sólo descuenta sangre.
 *   - `rollDifficulty`: dificultad por defecto (canon V20 suele ser 6-8).
 *   - `summary`: resumen condensado para el tooltip de la mesa.
 *
 *  Las claves de atributo usan el formato del modelo Character
 *  (strength, charisma, manipulation, intelligence, perception, stamina...).
 *  Para `rollAbility` se usa el nombre canónico de la skill o el nombre de
 *  la propia disciplina cuando V20 lo prescribe (Manipulación + Dominación).
 */
type SeedDisciplinePower = {
  level: number;
  name: string;
  description: string;
  summary?: string;
  bloodCost?: number;
  rollAttribute?: string | null;
  rollAbility?: string | null;
  rollDifficulty?: number | null;
};

const DISCIPLINES: {
  name: string;
  description: string;
  powers: SeedDisciplinePower[];
}[] = [
  {
    name: 'Animalismo',
    description: 'Comunión y dominio sobre las bestias.',
    powers: [
      {
        level: 1,
        name: 'Susurros bestiales',
        description:
          'Comunicarse con animales mediante voz y gestos sobrenaturales.',
        summary: 'Hablar con animales (Manipulación + Animalismo, dif 6).',
        bloodCost: 0,
        rollAttribute: 'manipulation',
        rollAbility: 'Animalismo',
        rollDifficulty: 6,
      },
      {
        level: 2,
        name: 'Llamada salvaje',
        description: 'Convoca a animales cercanos a tu presencia.',
        summary:
          'Convocar bestias (Carisma + Animalismo, dif 6). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Animalismo',
        rollDifficulty: 6,
      },
      {
        level: 3,
        name: 'Dominio de la Bestia',
        description:
          'Calma o enfurece animales y la Bestia interna (propia o ajena).',
        summary:
          'Dominar la Bestia (Manipulación + Empatía con animales, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'manipulation',
        rollAbility: 'Empatía con los animales',
        rollDifficulty: 7,
      },
      {
        level: 4,
        name: 'Compartir el espíritu',
        description:
          'Proyecta tu consciencia dentro de un animal con el que ya tienes lazo.',
        summary:
          'Habitar la mente animal (Manipulación + Animalismo, dif 8). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'manipulation',
        rollAbility: 'Animalismo',
        rollDifficulty: 8,
      },
      {
        level: 5,
        name: 'Manada bajo control',
        description: 'Coordina a una manada como si fuera una sola mente.',
        summary:
          'Manada como una mente (Carisma + Animalismo, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Animalismo',
        rollDifficulty: 7,
      },
    ],
  },
  {
    name: 'Auspex',
    description: 'Sentidos sobrenaturales y percepción del más allá.',
    powers: [
      {
        level: 1,
        name: 'Sentidos agudizados',
        description:
          'Amplifica un sentido a niveles sobrehumanos por una escena.',
        summary: 'Sentidos sobrehumanos (Percepción + Conciencia, dif 6).',
        bloodCost: 0,
        rollAttribute: 'perception',
        rollAbility: 'Conciencia',
        rollDifficulty: 6,
      },
      {
        level: 2,
        name: 'Percepción del aura',
        description:
          'Lee el aura emocional y sobrenatural del sujeto observado.',
        summary: 'Leer aura (Percepción + Empatía, dif 8).',
        bloodCost: 0,
        rollAttribute: 'perception',
        rollAbility: 'Empatía',
        rollDifficulty: 8,
      },
      {
        level: 3,
        name: 'Tacto espiritual',
        description: 'Lee la historia psíquica de un objeto al tocarlo.',
        summary: 'Psicometría (Percepción + Empatía, dif 7).',
        bloodCost: 0,
        rollAttribute: 'perception',
        rollAbility: 'Empatía',
        rollDifficulty: 7,
      },
      {
        level: 4,
        name: 'Telepatía',
        description: 'Lee y proyecta pensamientos del sujeto.',
        summary:
          'Telepatía (Inteligencia + Subterfugio, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'intelligence',
        rollAbility: 'Subterfugio',
        rollDifficulty: 7,
      },
      {
        level: 5,
        name: 'Proyección psíquica',
        description:
          'Separa la consciencia del cuerpo y viaja en forma astral.',
        summary: 'Viaje astral (Percepción + Auspex, dif 8). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'perception',
        rollAbility: 'Auspex',
        rollDifficulty: 8,
      },
    ],
  },
  {
    name: 'Celeridad',
    description: 'Velocidad sobrenatural.',
    powers: [
      {
        level: 1,
        name: 'Celeridad I',
        description: 'Gasta 1 sangre por turno para sumar +1 acción reflexiva.',
        summary: '1 sangre → +1 acción reflexiva este turno.',
        bloodCost: 1,
      },
      {
        level: 2,
        name: 'Celeridad II',
        description:
          'Gasta 1 sangre por turno para sumar +2 acciones reflexivas.',
        summary: '1 sangre → +2 acciones reflexivas este turno.',
        bloodCost: 1,
      },
      {
        level: 3,
        name: 'Celeridad III',
        description:
          'Gasta 1 sangre por turno para sumar +3 acciones reflexivas.',
        summary: '1 sangre → +3 acciones reflexivas este turno.',
        bloodCost: 1,
      },
      {
        level: 4,
        name: 'Celeridad IV',
        description:
          'Gasta 1 sangre por turno para sumar +4 acciones reflexivas.',
        summary: '1 sangre → +4 acciones reflexivas este turno.',
        bloodCost: 1,
      },
      {
        level: 5,
        name: 'Celeridad V',
        description:
          'Gasta 1 sangre por turno para sumar +5 acciones reflexivas.',
        summary: '1 sangre → +5 acciones reflexivas este turno.',
        bloodCost: 1,
      },
    ],
  },
  {
    name: 'Dominación',
    description: 'Imponer la voluntad sobre otra mente.',
    powers: [
      {
        level: 1,
        name: 'Orden',
        description: 'Una palabra cargada de mandato fuerza una acción simple.',
        summary: 'Manipulación + Intimidación vs Voluntad del objetivo.',
        bloodCost: 0,
        rollAttribute: 'manipulation',
        rollAbility: 'Intimidación',
        rollDifficulty: 7,
      },
      {
        level: 2,
        name: 'Hipnotismo',
        description: 'Implanta sugestiones complejas en la mente del sujeto.',
        summary: 'Sugestión compleja (Manipulación + Dominación, dif 7).',
        bloodCost: 0,
        rollAttribute: 'manipulation',
        rollAbility: 'Dominación',
        rollDifficulty: 7,
      },
      {
        level: 3,
        name: 'Olvido',
        description: 'Borra o altera recuerdos recientes del sujeto.',
        summary: 'Editar memoria reciente (Carisma + Dominación, dif 7).',
        bloodCost: 0,
        rollAttribute: 'charisma',
        rollAbility: 'Dominación',
        rollDifficulty: 7,
      },
      {
        level: 4,
        name: 'Acondicionamiento',
        description:
          'Doblega la mente del sujeto a largo plazo, escena tras escena.',
        summary:
          'Programar mente (Carisma + Liderazgo, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Liderazgo',
        rollDifficulty: 7,
      },
      {
        level: 5,
        name: 'Posesión',
        description: 'Tu mente toma el cuerpo del sujeto.',
        summary:
          'Tomar el cuerpo (Carisma + Intimidación, dif 8). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Intimidación',
        rollDifficulty: 8,
      },
    ],
  },
  {
    name: 'Fortaleza',
    description: 'Resistencia física sobrenatural.',
    powers: [
      {
        level: 1,
        name: 'Fortaleza I',
        description: '+1 dado para absorber daño, incluso agravado.',
        summary: '+1 dado de absorción (también contra agravado). Pasivo.',
        bloodCost: 0,
      },
      {
        level: 2,
        name: 'Fortaleza II',
        description: '+2 dados para absorber daño, incluso agravado.',
        summary: '+2 dados de absorción. Pasivo.',
        bloodCost: 0,
      },
      {
        level: 3,
        name: 'Fortaleza III',
        description: '+3 dados para absorber daño, incluso agravado.',
        summary: '+3 dados de absorción. Pasivo.',
        bloodCost: 0,
      },
      {
        level: 4,
        name: 'Fortaleza IV',
        description: '+4 dados para absorber daño, incluso agravado.',
        summary: '+4 dados de absorción. Pasivo.',
        bloodCost: 0,
      },
      {
        level: 5,
        name: 'Fortaleza V',
        description: '+5 dados para absorber daño, incluso agravado.',
        summary: '+5 dados de absorción. Pasivo.',
        bloodCost: 0,
      },
    ],
  },
  {
    name: 'Ofuscación',
    description: 'Eludir la percepción ajena.',
    powers: [
      {
        level: 1,
        name: 'Manto sombrío',
        description: 'Pasas desapercibido en sombras y rincones.',
        summary: 'Camuflaje en sombras. Sin tirada ni coste para activarlo.',
        bloodCost: 0,
      },
      {
        level: 2,
        name: 'Inadvertencia',
        description: 'Eres invisible a quienes no te buscan activamente.',
        summary: 'Invisible salvo a quien busca. Sin tirada para iniciarlo.',
        bloodCost: 0,
      },
      {
        level: 3,
        name: 'Máscara de los mil rostros',
        description: 'Apareces como otra persona genérica.',
        summary: 'Cambiar de aspecto (Manipulación + Subterfugio, dif 7).',
        bloodCost: 0,
        rollAttribute: 'manipulation',
        rollAbility: 'Subterfugio',
        rollDifficulty: 7,
      },
      {
        level: 4,
        name: 'Mente velada',
        description:
          'Borra impresiones y rastros mentales que dejas tras de ti.',
        summary: 'Sin tirada activa. Cuesta 1 sangre.',
        bloodCost: 1,
      },
      {
        level: 5,
        name: 'Soslayar la mirada',
        description: 'Invisibilidad incluso a quien te observa fijamente.',
        summary:
          'Invisible bajo observación (Carisma + Subterfugio, dif 8). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Subterfugio',
        rollDifficulty: 8,
      },
    ],
  },
  {
    name: 'Potencia',
    description: 'Fuerza sobrenatural.',
    powers: [
      {
        level: 1,
        name: 'Potencia I',
        description: '+1 dado a daño físico cuerpo a cuerpo y a levantar peso.',
        summary: '+1 dado a Fuerza (daño/atletismo). Pasivo.',
        bloodCost: 0,
      },
      {
        level: 2,
        name: 'Potencia II',
        description:
          '+2 dados a daño físico cuerpo a cuerpo y a levantar peso.',
        summary: '+2 dados a Fuerza. Pasivo.',
        bloodCost: 0,
      },
      {
        level: 3,
        name: 'Potencia III',
        description:
          '+3 dados a daño físico cuerpo a cuerpo y a levantar peso.',
        summary: '+3 dados a Fuerza. Pasivo.',
        bloodCost: 0,
      },
      {
        level: 4,
        name: 'Potencia IV',
        description:
          '+4 dados a daño físico cuerpo a cuerpo y a levantar peso.',
        summary: '+4 dados a Fuerza. Pasivo.',
        bloodCost: 0,
      },
      {
        level: 5,
        name: 'Potencia V',
        description:
          '+5 dados a daño físico cuerpo a cuerpo y a levantar peso.',
        summary: '+5 dados a Fuerza. Pasivo.',
        bloodCost: 0,
      },
    ],
  },
  {
    name: 'Presencia',
    description: 'Atracción y manejo emocional sobrenatural.',
    powers: [
      {
        level: 1,
        name: 'Pavor',
        description: 'Provoca terror sobrenatural en quienes te miran.',
        summary: 'Aterrar (Carisma + Intimidación, dif 7).',
        bloodCost: 0,
        rollAttribute: 'charisma',
        rollAbility: 'Intimidación',
        rollDifficulty: 7,
      },
      {
        level: 2,
        name: 'Atracción',
        description: 'Generas fascinación inmediata en quien te ve.',
        summary: 'Encantar (Carisma + Empatía, dif 7).',
        bloodCost: 0,
        rollAttribute: 'charisma',
        rollAbility: 'Empatía',
        rollDifficulty: 7,
      },
      {
        level: 3,
        name: 'Llamada',
        description: 'Atrae a un sujeto conocido desde la distancia.',
        summary:
          'Llamar a distancia (Manipulación + Empatía, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'manipulation',
        rollAbility: 'Empatía',
        rollDifficulty: 7,
      },
      {
        level: 4,
        name: 'Majestad',
        description:
          'Impones respeto absoluto: pocos osan atacarte o desafiarte.',
        summary: 'Majestad (Carisma + Intimidación, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Intimidación',
        rollDifficulty: 7,
      },
      {
        level: 5,
        name: 'Espíritu de la multitud',
        description: 'Mueve a las masas a la acción o las contiene.',
        summary:
          'Mover multitudes (Carisma + Liderazgo, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'charisma',
        rollAbility: 'Liderazgo',
        rollDifficulty: 7,
      },
    ],
  },
  {
    name: 'Protean',
    description: 'Cambio de forma y comunión con la tierra.',
    powers: [
      {
        level: 1,
        name: 'Ojos de la Bestia',
        description:
          'Visión nocturna sobrenatural y mirada bestial intimidante.',
        summary: 'Visión nocturna. Sin tirada ni coste.',
        bloodCost: 0,
      },
      {
        level: 2,
        name: 'Garras de Lobo',
        description: 'Crece garras letales que infligen daño agravado.',
        summary: 'Garras agravadas. Cuesta 1 sangre.',
        bloodCost: 1,
      },
      {
        level: 3,
        name: 'Forma de la Tierra',
        description:
          'Se funde con suelo natural para descansar durante el día.',
        summary: 'Refugio en tierra. Cuesta 1 sangre.',
        bloodCost: 1,
      },
      {
        level: 4,
        name: 'Forma bestial',
        description: 'Se transforma en lobo o murciélago.',
        summary:
          'Transformación animal (Resistencia + Supervivencia, dif 6). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'stamina',
        rollAbility: 'Supervivencia',
        rollDifficulty: 6,
      },
      {
        level: 5,
        name: 'Forma de mente única',
        description: 'Forma de bruma capaz de cualquier acción mental.',
        summary:
          'Forma bruma (Resistencia + Ocultismo, dif 6). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'stamina',
        rollAbility: 'Ocultismo',
        rollDifficulty: 6,
      },
    ],
  },
  {
    name: 'Taumaturgia',
    description:
      'Magia de sangre (Tremere). Senda elemental: Senda de la sangre.',
    powers: [
      {
        level: 1,
        name: 'Un puñado de polvo',
        description:
          'Sentido y manipulación básica de la vitae propia o ajena.',
        summary: 'Inteligencia + Ocultismo (dif 4).',
        bloodCost: 0,
        rollAttribute: 'intelligence',
        rollAbility: 'Ocultismo',
        rollDifficulty: 4,
      },
      {
        level: 2,
        name: 'Robo de vitae',
        description: 'Drena la sangre de un blanco a distancia.',
        summary:
          'Robar sangre a distancia (Inteligencia + Ocultismo, dif 5). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'intelligence',
        rollAbility: 'Ocultismo',
        rollDifficulty: 5,
      },
      {
        level: 3,
        name: 'Hervir la sangre',
        description: 'Hace hervir la sangre del enemigo desde dentro.',
        summary:
          'Daño por hervor (Inteligencia + Ocultismo, dif 6). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'intelligence',
        rollAbility: 'Ocultismo',
        rollDifficulty: 6,
      },
      {
        level: 4,
        name: 'Bautismo de sangre',
        description:
          'Vincula sangre a un objetivo con un solo trago compartido.',
        summary:
          'Vinculación reforzada (Inteligencia + Ocultismo, dif 7). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'intelligence',
        rollAbility: 'Ocultismo',
        rollDifficulty: 7,
      },
      {
        level: 5,
        name: 'Cauterizar la herida',
        description:
          'Comunión total con la vitae: sana heridas agravadas a través de la sangre.',
        summary:
          'Sanar agravado (Inteligencia + Ocultismo, dif 8). Cuesta 1 sangre.',
        bloodCost: 1,
        rollAttribute: 'intelligence',
        rollAbility: 'Ocultismo',
        rollDifficulty: 8,
      },
    ],
  },
];

const MERITS_FLAWS: {
  name: string;
  kind: MeritFlawKind;
  value: number;
  category: string;
  description: string;
}[] = [
  // Méritos físicos
  {
    name: 'Buen oído',
    kind: 'MERIT',
    value: 1,
    category: 'Físico',
    description: '+1 a tiradas de percepción auditiva.',
  },
  {
    name: 'Reflejos felinos',
    kind: 'MERIT',
    value: 1,
    category: 'Físico',
    description: 'Equilibrio innato sobrehumano.',
  },
  {
    name: 'Pelaje espeso',
    kind: 'MERIT',
    value: 1,
    category: 'Físico',
    description: 'Resistencia natural al frío.',
  },
  {
    name: 'Sentido del tiempo',
    kind: 'MERIT',
    value: 1,
    category: 'Mental',
    description: 'Conoce la hora exacta sin reloj.',
  },
  // Méritos sociales
  {
    name: 'Contactos',
    kind: 'MERIT',
    value: 1,
    category: 'Social',
    description: 'Una red de informantes mortales.',
  },
  {
    name: 'Reputación',
    kind: 'MERIT',
    value: 2,
    category: 'Social',
    description: 'Buen nombre en círculos vampíricos.',
  },
  // Méritos sobrenaturales
  {
    name: 'Inofensivo',
    kind: 'MERIT',
    value: 1,
    category: 'Sobrenatural',
    description: 'Otros vampiros te subestiman.',
  },
  {
    name: 'Sangre fuerte',
    kind: 'MERIT',
    value: 4,
    category: 'Sobrenatural',
    description: 'Tu vitae cuenta como una generación menor.',
  },
  // Defectos físicos
  {
    name: 'Cojo',
    kind: 'FLAW',
    value: -3,
    category: 'Físico',
    description: 'Movimiento reducido permanentemente.',
  },
  {
    name: 'Cicatrices',
    kind: 'FLAW',
    value: -1,
    category: 'Físico',
    description: 'Apariencia marcada por la violencia.',
  },
  // Defectos mentales
  {
    name: 'Pesadillas',
    kind: 'FLAW',
    value: -1,
    category: 'Mental',
    description: 'Dificultad para descansar al amanecer.',
  },
  {
    name: 'Fobia',
    kind: 'FLAW',
    value: -3,
    category: 'Mental',
    description: 'Pánico frente a un estímulo concreto.',
  },
  // Defectos sociales
  {
    name: 'Enemigo',
    kind: 'FLAW',
    value: -3,
    category: 'Social',
    description: 'Alguien poderoso quiere tu ruina.',
  },
  {
    name: 'Mala reputación',
    kind: 'FLAW',
    value: -2,
    category: 'Social',
    description: 'Estigma entre tus pares.',
  },
  // Defectos sobrenaturales
  {
    name: 'Halo de la Bestia',
    kind: 'FLAW',
    value: -2,
    category: 'Sobrenatural',
    description: 'Tu aura delata claramente tu condición.',
  },
  {
    name: 'Sangre débil',
    kind: 'FLAW',
    value: -4,
    category: 'Sobrenatural',
    description: 'Tu generación efectiva es una mayor.',
  },
];

async function seedArchetypes() {
  for (let i = 0; i < ARCHETYPES.length; i++) {
    const a = ARCHETYPES[i];
    await prisma.archetype.upsert({
      where: { name: a.name },
      create: { name: a.name, description: a.description, order: i },
      update: { description: a.description, order: i },
    });
  }
  console.log(`✓ ${ARCHETYPES.length} arquetipos.`);
}

async function seedDisciplines() {
  for (let i = 0; i < DISCIPLINES.length; i++) {
    const d = DISCIPLINES[i];
    const discipline = await prisma.discipline.upsert({
      where: { name: d.name },
      create: { name: d.name, description: d.description, order: i },
      update: { description: d.description, order: i },
    });
    for (const p of d.powers) {
      const mechanics = {
        summary: p.summary ?? null,
        bloodCost: p.bloodCost ?? 0,
        rollAttribute: p.rollAttribute ?? null,
        rollAbility: p.rollAbility ?? null,
        rollDifficulty: p.rollDifficulty ?? null,
      };
      await prisma.disciplinePower.upsert({
        where: {
          disciplineId_level: { disciplineId: discipline.id, level: p.level },
        },
        create: {
          disciplineId: discipline.id,
          level: p.level,
          name: p.name,
          description: p.description,
          ...mechanics,
        },
        update: {
          name: p.name,
          description: p.description,
          ...mechanics,
        },
      });
    }
  }
  console.log(`✓ ${DISCIPLINES.length} disciplinas con poderes.`);
}

async function seedMeritsFlaws() {
  for (let i = 0; i < MERITS_FLAWS.length; i++) {
    const m = MERITS_FLAWS[i];
    await prisma.meritFlaw.upsert({
      where: { name: m.name },
      create: { ...m, order: i },
      update: { ...m, order: i },
    });
  }
  console.log(`✓ ${MERITS_FLAWS.length} méritos/defectos.`);
}

const CLANS: {
  name: string;
  sect: string;
  description: string;
  disciplines: string;
  weakness: string;
}[] = [
  // --- Camarilla ---
  {
    name: 'Brujah',
    sect: 'Camarilla',
    description:
      'Rebeldes apasionados, idealistas y guerreros. Herederos de la antigua Cartago.',
    disciplines: 'Celeridad, Potencia, Presencia',
    weakness: 'La Bestia siempre cerca: penalización para resistir el frenesí.',
  },
  {
    name: 'Gangrel',
    sect: 'Camarilla',
    description: 'Vagabundos salvajes, cercanos a la Bestia y a la naturaleza.',
    disciplines: 'Animalismo, Fortaleza, Protean',
    weakness: 'Tras cada frenesí ganan un rasgo animal permanente.',
  },
  {
    name: 'Malkavian',
    sect: 'Camarilla',
    description: 'Locos visionarios; oráculos malditos de la Mascarada.',
    disciplines: 'Auspex, Dominación, Ofuscación',
    weakness: 'Toda la línea sufre una locura incurable.',
  },
  {
    name: 'Nosferatu',
    sect: 'Camarilla',
    description: 'Monstruos deformes; amos de la información subterránea.',
    disciplines: 'Animalismo, Ofuscación, Potencia',
    weakness: 'Apariencia 0 permanente; horror físico irreversible.',
  },
  {
    name: 'Toreador',
    sect: 'Camarilla',
    description: 'Artistas y sibaritas, esclavos de la belleza.',
    disciplines: 'Auspex, Celeridad, Presencia',
    weakness: 'Quedan absortos ante obras de gran belleza.',
  },
  {
    name: 'Tremere',
    sect: 'Camarilla',
    description: 'Hechiceros usurpadores; el clan brujo.',
    disciplines: 'Auspex, Dominación, Taumaturgia',
    weakness: 'Vinculados al consejo de Viena por sangre.',
  },
  {
    name: 'Ventrue',
    sect: 'Camarilla',
    description: 'Aristócratas natos; líderes políticos.',
    disciplines: 'Dominación, Fortaleza, Presencia',
    weakness: 'Solo pueden alimentarse de un tipo muy específico de presa.',
  },
  // --- Sabbat ---
  {
    name: 'Lasombra',
    sect: 'Sabbat',
    description: 'Señores de la oscuridad; amos de las sombras.',
    disciplines: 'Dominación, Obtenebración, Potencia',
    weakness: 'No reflejan en superficies; daño doble por luz solar y santa.',
  },
  {
    name: 'Tzimisce',
    sect: 'Sabbat',
    description: 'Demonios eslavos; moldeadores de carne.',
    disciplines: 'Animalismo, Auspex, Vicisitud',
    weakness: 'Deben descansar sobre la tierra natal de su Abrazo.',
  },
  // --- Independientes ---
  {
    name: 'Assamita',
    sect: 'Independiente',
    description: 'Asesinos persas; el clan diezmador.',
    disciplines: 'Celeridad, Ofuscación, Quietus',
    weakness: 'La sangre adictiva los doblega tras diablerie.',
  },
  {
    name: 'Followers of Set',
    sect: 'Independiente',
    description: 'Corruptores serpenteantes; herederos del dios oscuro Set.',
    disciplines: 'Ofuscación, Presencia, Serpentis',
    weakness: 'Doble daño por luz solar; debilitamiento ante toda luz.',
  },
  {
    name: 'Giovanni',
    sect: 'Independiente',
    description: 'Necromantes y banqueros; una familia de muertos vivos.',
    disciplines: 'Dominación, Necromancia, Potencia',
    weakness: 'Su beso causa daño desgarrador, no éxtasis.',
  },
  {
    name: 'Ravnos',
    sect: 'Independiente',
    description: 'Engañadores nómadas; herederos de los Rom.',
    disciplines: 'Animalismo, Fortaleza, Quimerismo',
    weakness: 'Cada miembro tiene un vicio compulsivo (engaño, robo, etc.).',
  },
  // --- Linajes / Bloodlines ---
  {
    name: 'Caitiff',
    sect: 'Linaje',
    description: 'Vampiros sin clan; huérfanos de la sangre.',
    disciplines: 'Tres disciplinas libres',
    weakness: 'Sin debilidad fija, pero socialmente despreciados.',
  },
  {
    name: 'Daughters of Cacophony',
    sect: 'Linaje',
    description: 'Cantantes vampiras; voces hipnóticas e inquietantes.',
    disciplines: 'Fortaleza, Melpominee, Presencia',
    weakness: 'Música etérea las acompaña, delatando su presencia.',
  },
  {
    name: 'Salubri',
    sect: 'Linaje',
    description: 'Curanderos y guerreros del tercer ojo.',
    disciplines: 'Auspex, Fortaleza, Obeah o Valeren',
    weakness: 'Tercer ojo visible; perseguidos por Tremere y Sabbat.',
  },
  {
    name: 'Samedi',
    sect: 'Linaje',
    description: 'Vampiros putrefactos; señores haitianos de la muerte.',
    disciplines: 'Fortaleza, Necromancia, Thanatosis',
    weakness: 'Su cuerpo siempre muestra signos de descomposición.',
  },
  {
    name: 'Gargoyles',
    sect: 'Linaje',
    description: 'Sirvientes creados por los Tremere a partir de tres clanes.',
    disciplines: 'Fortaleza, Potencia, Visceratika',
    weakness: 'Piel pétrea visible; condicionamiento Tremere.',
  },
  {
    name: 'Baali',
    sect: 'Linaje',
    description: 'Adoradores de demonios; linaje infernal y odiado.',
    disciplines: 'Daimoinon, Ofuscación, Presencia',
    weakness: 'Reciben daño agravado de símbolos sagrados verdaderos.',
  },
  {
    name: 'Kiasyd',
    sect: 'Linaje',
    description: 'Estudiosos lóbregos, conectados con la fae.',
    disciplines: 'Dominación, Mytherceria, Obtenebración',
    weakness: 'Vulnerables al hierro frío.',
  },
];

async function seedClans() {
  for (let i = 0; i < CLANS.length; i++) {
    const c = CLANS[i];
    await prisma.clan.upsert({
      where: { name: c.name },
      create: { ...c, order: i },
      update: { ...c, order: i },
    });
  }
  console.log(`✓ ${CLANS.length} clanes.`);
}

// =====================================================================
// EQUIPO — armas (cuerpo a cuerpo + a distancia) y armaduras
// Fuente: V20 Manual del jugador. Solo se seedan entradas "system": los
// jugadores podrán crear customs reutilizando las mismas categorías.
// =====================================================================

interface WeaponCategoryDef {
  name: string;
  kind: WeaponKind;
}

const WEAPON_CATEGORIES: WeaponCategoryDef[] = [
  // CC
  { name: 'Porra', kind: 'MELEE' },
  { name: 'Garrote', kind: 'MELEE' },
  { name: 'Cuchillo', kind: 'MELEE' },
  { name: 'Espada', kind: 'MELEE' },
  { name: 'Hacha', kind: 'MELEE' },
  { name: 'Estaca', kind: 'MELEE' },
  // Distancia
  { name: 'Revólver ligero', kind: 'RANGED' },
  { name: 'Revólver pesado', kind: 'RANGED' },
  { name: 'Pistola ligera', kind: 'RANGED' },
  { name: 'Pistola pesada', kind: 'RANGED' },
  { name: 'Fusil', kind: 'RANGED' },
  { name: 'Ametralladora pequeña', kind: 'RANGED' },
  { name: 'Ametralladora grande', kind: 'RANGED' },
  { name: 'Escopeta', kind: 'RANGED' },
  { name: 'Ballesta', kind: 'RANGED' },
];

interface SystemWeaponDef {
  name: string;
  category: string; // matches WeaponCategoryDef.name
  kind: WeaponKind;
  damageBase: WeaponDamageBase;
  damageBonus: number;
  lethal?: boolean;
  aggravated?: boolean;
  bluntPlus?: boolean;
  range?: number;
  rate?: string;
  magazine?: number;
  concealment?: string;
  notes?: string;
}

const SYSTEM_WEAPONS: SystemWeaponDef[] = [
  // ── Cuerpo a cuerpo (manual pág. ref. armas CC) ──
  // El "+" del manual: contundente, letal si se apunta a la cabeza.
  {
    name: 'Porra',
    category: 'Porra',
    kind: 'MELEE',
    damageBase: 'STRENGTH',
    damageBonus: 1,
    bluntPlus: true,
    concealment: 'B',
  },
  {
    name: 'Garrote',
    category: 'Garrote',
    kind: 'MELEE',
    damageBase: 'STRENGTH',
    damageBonus: 2,
    bluntPlus: true,
    concealment: 'G',
  },
  {
    name: 'Cuchillo',
    category: 'Cuchillo',
    kind: 'MELEE',
    damageBase: 'STRENGTH',
    damageBonus: 1,
    lethal: true,
    concealment: 'C',
  },
  {
    name: 'Espada',
    category: 'Espada',
    kind: 'MELEE',
    damageBase: 'STRENGTH',
    damageBonus: 2,
    lethal: true,
    concealment: 'G',
  },
  {
    name: 'Hacha',
    category: 'Hacha',
    kind: 'MELEE',
    damageBase: 'STRENGTH',
    damageBonus: 3,
    lethal: true,
    concealment: 'N',
  },
  {
    name: 'Estaca',
    category: 'Estaca',
    kind: 'MELEE',
    damageBase: 'STRENGTH',
    damageBonus: 1,
    aggravated: true,
    concealment: 'B',
    notes:
      'Puede paralizar a un vampiro si se clava en el corazón (apuntar, dificultad 9, 3 éxitos).',
  },

  // ── Armas a distancia (manual) ──
  // Revólver ligero — ejemplo: SW M640 (.38 special)
  {
    name: 'SW M640 (.38 special)',
    category: 'Revólver ligero',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 4,
    lethal: true,
    range: 12,
    rate: '3',
    magazine: 6,
    concealment: 'B',
  },
  // Revólver pesado — Colt Anaconda (.44 Magnum)
  {
    name: 'Colt Anaconda (.44 Magnum)',
    category: 'Revólver pesado',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 6,
    lethal: true,
    range: 35,
    rate: '2',
    magazine: 6,
    concealment: 'C',
  },
  // Pistola ligera — Glock 17 (9 mm)
  {
    name: 'Glock 17 (9 mm)',
    category: 'Pistola ligera',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 4,
    lethal: true,
    range: 20,
    rate: '4',
    magazine: 17,
    concealment: 'P',
  },
  // Pistola pesada — SIG P220 (.45 ACP)
  {
    name: 'SIG P220 (.45 ACP)',
    category: 'Pistola pesada',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 5,
    lethal: true,
    range: 30,
    rate: '3',
    magazine: 7,
    concealment: 'J',
  },
  // Fusil — Remington M-700 (30.06)
  {
    name: 'Remington M-700 (30.06)',
    category: 'Fusil',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 8,
    lethal: true,
    range: 200,
    rate: '1',
    magazine: 5,
    concealment: 'N',
  },
  // Ametralladora pequeña — Ingram Mac-10
  {
    name: 'Ingram Mac-10',
    category: 'Ametralladora pequeña',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 4,
    lethal: true,
    range: 25,
    rate: '3',
    magazine: 30,
    concealment: 'J',
  },
  // Ametralladora grande — Uzi (9 mm)
  {
    name: 'Uzi (9 mm)',
    category: 'Ametralladora grande',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 4,
    lethal: true,
    range: 50,
    rate: '3',
    magazine: 32,
    concealment: 'J',
  },
  // Ametralladora grande — Steyr-Aug (5.56 mm)
  {
    name: 'Steyr-Aug (5.56 mm)',
    category: 'Ametralladora grande',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 7,
    lethal: true,
    range: 150,
    rate: '3',
    magazine: 30,
    concealment: 'N',
  },
  // Escopeta — Ithaca M-37
  {
    name: 'Ithaca M-37',
    category: 'Escopeta',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 8,
    lethal: true,
    range: 20,
    rate: '1',
    magazine: 5,
    concealment: 'N',
  },
  // Escopeta semiautomática — Franchi-Law (.12)
  {
    name: 'Franchi-Law (.12)',
    category: 'Escopeta',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 8,
    lethal: true,
    range: 20,
    rate: '3',
    magazine: 8,
    concealment: 'N',
  },
  // Ballesta — ejemplo
  {
    name: 'Ballesta',
    category: 'Ballesta',
    kind: 'RANGED',
    damageBase: 'FLAT',
    damageBonus: 5,
    lethal: true,
    range: 20,
    rate: '1',
    magazine: 1,
    concealment: 'N',
    notes:
      'Apunta al corazón para paralizar a un vampiro (causa daño letal contundente, aggravado contra otros mortales).',
    aggravated: true,
  },
];

async function seedWeapons() {
  // 1. Categorías (orden estable basado en el array)
  const categoryByName = new Map<string, string>();
  for (let i = 0; i < WEAPON_CATEGORIES.length; i++) {
    const def = WEAPON_CATEGORIES[i];
    const cat = await prisma.weaponCategory.upsert({
      where: { name: def.name },
      create: { name: def.name, kind: def.kind, order: i },
      update: { kind: def.kind, order: i },
    });
    categoryByName.set(def.name, cat.id);
  }

  // 2. Armas del manual. Como el modelo Weapon no tiene unique en name+system,
  //    primero borramos todas las system y reinsertamos — idempotente y simple.
  await prisma.weapon.deleteMany({ where: { system: true } });

  await prisma.weapon.createMany({
    data: SYSTEM_WEAPONS.map((w, idx) => ({
      name: w.name,
      kind: w.kind,
      categoryId: categoryByName.get(w.category)!,
      damageBase: w.damageBase,
      damageBonus: w.damageBonus,
      lethal: w.lethal ?? false,
      aggravated: w.aggravated ?? false,
      bluntPlus: w.bluntPlus ?? false,
      range: w.range ?? null,
      rate: w.rate ?? null,
      magazine: w.magazine ?? null,
      concealment: w.concealment ?? null,
      notes: w.notes ?? null,
      order: idx,
      system: true,
      userId: null,
    })),
  });

  console.log(
    `✓ ${WEAPON_CATEGORIES.length} categorías de armas y ${SYSTEM_WEAPONS.length} armas (V20).`,
  );
}

const SYSTEM_ARMORS: {
  name: string;
  rating: number;
  penalty: number;
  description: string;
}[] = [
  {
    name: 'Clase Uno (ropa reforzada)',
    rating: 1,
    penalty: 0,
    description:
      'Sumar a la absorción contra contundente, letal y agravado de colmillos/garras. No protege contra fuego ni luz solar.',
  },
  {
    name: 'Clase Dos (chaleco)',
    rating: 2,
    penalty: 1,
    description: 'Idem clase 1. Penaliza reservas de Destreza.',
  },
  {
    name: 'Clase Tres (Kevlar)',
    rating: 3,
    penalty: 1,
    description: 'Idem. Estándar policial moderno.',
  },
  {
    name: 'Clase Cuatro (antibalas)',
    rating: 4,
    penalty: 2,
    description: 'Idem. Equipo táctico militar.',
  },
  {
    name: 'Clase Cinco (antidisturbios)',
    rating: 5,
    penalty: 3,
    description: 'Idem. Equipo pesado, restringe la movilidad.',
  },
];

async function seedArmors() {
  await prisma.armor.deleteMany({ where: { system: true } });
  await prisma.armor.createMany({
    data: SYSTEM_ARMORS.map((a, idx) => ({
      name: a.name,
      rating: a.rating,
      penalty: a.penalty,
      description: a.description,
      order: idx,
      system: true,
      userId: null,
    })),
  });
  console.log(`✓ ${SYSTEM_ARMORS.length} armaduras (V20).`);
}

async function main() {
  await seedArchetypes();
  await seedDisciplines();
  await seedMeritsFlaws();
  await seedClans();
  await seedWeapons();
  await seedArmors();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
