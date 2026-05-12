/* eslint-disable @typescript-eslint/no-floating-promises */
import 'dotenv/config';
import { PrismaClient, MeritFlawKind } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

/** Arquetipos canónicos (Naturaleza/Conducta) — V20. */
const ARCHETYPES: { name: string; description: string }[] = [
  { name: 'Arquitecto', description: 'Construye algo duradero que otros disfrutarán.' },
  { name: 'Autócrata', description: 'Quiere mandar; busca control y poder.' },
  { name: 'Bon vivant', description: 'Disfruta la (no)vida con apetitos sensoriales.' },
  { name: 'Bravucón', description: 'Intimida para obtener lo que quiere.' },
  { name: 'Cabezota', description: 'Una vez que decide algo, no cambia de idea.' },
  { name: 'Capullo', description: 'Pretende ser otra cosa de la que realmente es.' },
  { name: 'Caudillo', description: 'Lidera por carisma y guía a otros.' },
  { name: 'Celebrante', description: 'Vive una causa o ideal con devoción.' },
  { name: 'Comodín', description: 'Sorprende con burla y bromas; impredecible.' },
  { name: 'Conformista', description: 'Sigue a los demás y al statu quo.' },
  { name: 'Director', description: 'Necesita orden y coordina a los demás.' },
  { name: 'Fanático', description: 'Persigue una causa por encima de todo.' },
  { name: 'Gamberro', description: 'Disfruta haciendo el mal a otros.' },
  { name: 'Jueza', description: 'Sopesa, decide y dicta veredictos.' },
  { name: 'Lacayo', description: 'Sirve a otro fielmente, sin ambición propia.' },
  { name: 'Maquinador', description: 'Manipula desde las sombras.' },
  { name: 'Niño', description: 'Inocencia, dependencia, capricho.' },
  { name: 'Pedagogo', description: 'Quiere enseñar y transmitir lo aprendido.' },
  { name: 'Penitente', description: 'Carga culpa; vive para expiar.' },
  { name: 'Rebelde', description: 'Se opone a la autoridad y a las normas.' },
  { name: 'Rufián', description: 'Resuelve a base de fuerza bruta.' },
  { name: 'Solitario', description: 'Trabaja y vive aparte de los demás.' },
  { name: 'Superviviente', description: 'Lo único que importa es seguir adelante.' },
  { name: 'Trotamundos', description: 'Sigue su camino sin ataduras.' },
  { name: 'Vividor', description: 'Aprovecha a otros sin esfuerzo propio.' },
];

/** Disciplinas y sus 5 poderes anidados. Descripciones breves. */
const DISCIPLINES: {
  name: string;
  description: string;
  powers: { level: number; name: string; description: string }[];
}[] = [
  {
    name: 'Animalismo',
    description: 'Comunión y dominio sobre las bestias.',
    powers: [
      { level: 1, name: 'Susurros bestiales', description: 'Comunicarse con animales.' },
      { level: 2, name: 'Llamada salvaje', description: 'Convocar criaturas cercanas.' },
      { level: 3, name: 'Dominio de la Bestia', description: 'Calmar o enfurecer a animales y a la Bestia interna.' },
      { level: 4, name: 'Compartir el espíritu', description: 'Habitar la mente de un animal.' },
      { level: 5, name: 'Manada bajo control', description: 'Coordinar a varios animales como uno solo.' },
    ],
  },
  {
    name: 'Auspex',
    description: 'Sentidos sobrenaturales y percepción del más allá.',
    powers: [
      { level: 1, name: 'Sentidos agudizados', description: 'Amplifica un sentido a niveles sobrehumanos.' },
      { level: 2, name: 'Percepción del aura', description: 'Lee el aura emocional y sobrenatural.' },
      { level: 3, name: 'Tacto espiritual', description: 'Lee la historia de objetos al tocarlos.' },
      { level: 4, name: 'Telepatía', description: 'Lee y proyecta pensamientos.' },
      { level: 5, name: 'Proyección psíquica', description: 'Separa la consciencia del cuerpo.' },
    ],
  },
  {
    name: 'Celeridad',
    description: 'Velocidad sobrenatural.',
    powers: [
      { level: 1, name: 'Celeridad I', description: '+1 acción reflexiva por turno.' },
      { level: 2, name: 'Celeridad II', description: '+2 acciones reflexivas por turno.' },
      { level: 3, name: 'Celeridad III', description: '+3 acciones reflexivas por turno.' },
      { level: 4, name: 'Celeridad IV', description: '+4 acciones reflexivas por turno.' },
      { level: 5, name: 'Celeridad V', description: '+5 acciones reflexivas por turno.' },
    ],
  },
  {
    name: 'Dominación',
    description: 'Imponer la voluntad sobre otra mente.',
    powers: [
      { level: 1, name: 'Orden imperiosa', description: 'Una palabra cargada de mandato.' },
      { level: 2, name: 'Hipnotismo', description: 'Implanta sugestiones complejas.' },
      { level: 3, name: 'Olvido', description: 'Borra o altera recuerdos recientes.' },
      { level: 4, name: 'Acondicionamiento', description: 'Doblega la mente a largo plazo.' },
      { level: 5, name: 'Posesión', description: 'Toma el cuerpo del sujeto.' },
    ],
  },
  {
    name: 'Fortaleza',
    description: 'Resistencia física sobrenatural.',
    powers: [
      { level: 1, name: 'Fortaleza I', description: '+1 dado para absorber daño, incluso agravado.' },
      { level: 2, name: 'Fortaleza II', description: '+2 dados para absorber daño.' },
      { level: 3, name: 'Fortaleza III', description: '+3 dados para absorber daño.' },
      { level: 4, name: 'Fortaleza IV', description: '+4 dados para absorber daño.' },
      { level: 5, name: 'Fortaleza V', description: '+5 dados para absorber daño.' },
    ],
  },
  {
    name: 'Ofuscación',
    description: 'Eludir la percepción ajena.',
    powers: [
      { level: 1, name: 'Manto sombrío', description: 'Pasa desapercibido en sombras y rincones.' },
      { level: 2, name: 'Inadvertencia', description: 'Invisible a quienes no te buscan.' },
      { level: 3, name: 'Máscara de los mil rostros', description: 'Aparece como otra persona genérica.' },
      { level: 4, name: 'Mente velada', description: 'Borra impresiones que dejas tras de ti.' },
      { level: 5, name: 'Soslayar la mirada', description: 'Invisibilidad incluso a quien te observa.' },
    ],
  },
  {
    name: 'Potencia',
    description: 'Fuerza sobrenatural.',
    powers: [
      { level: 1, name: 'Potencia I', description: '+1 dado a daño físico o levantar peso.' },
      { level: 2, name: 'Potencia II', description: '+2 dados.' },
      { level: 3, name: 'Potencia III', description: '+3 dados.' },
      { level: 4, name: 'Potencia IV', description: '+4 dados.' },
      { level: 5, name: 'Potencia V', description: '+5 dados.' },
    ],
  },
  {
    name: 'Presencia',
    description: 'Atracción y manejo emocional sobrenatural.',
    powers: [
      { level: 1, name: 'Pavor', description: 'Provoca terror sobrenatural.' },
      { level: 2, name: 'Atracción', description: 'Genera fascinación inmediata.' },
      { level: 3, name: 'Llamada', description: 'Atrae a un sujeto desde la distancia.' },
      { level: 4, name: 'Majestad', description: 'Impone respeto absoluto.' },
      { level: 5, name: 'Espíritu de la multitud', description: 'Mueve a las masas a la acción.' },
    ],
  },
  {
    name: 'Protean',
    description: 'Cambio de forma y comunión con la tierra.',
    powers: [
      { level: 1, name: 'Ojos de la Bestia', description: 'Visión nocturna y mirada bestial.' },
      { level: 2, name: 'Garras de Lobo', description: 'Crece garras letales.' },
      { level: 3, name: 'Forma de la Tierra', description: 'Se funde con el suelo durante el día.' },
      { level: 4, name: 'Forma bestial', description: 'Se transforma en lobo o murciélago.' },
      { level: 5, name: 'Forma de mente única', description: 'Forma de bruma capaz de cualquier acción mental.' },
    ],
  },
  {
    name: 'Taumaturgia',
    description: 'Magia de sangre (Tremere). Sendas y rituales.',
    powers: [
      { level: 1, name: 'Senda de la sangre · I', description: 'Sentido y manipulación básica de vitae.' },
      { level: 2, name: 'Senda de la sangre · II', description: 'Robo de sangre a distancia.' },
      { level: 3, name: 'Senda de la sangre · III', description: 'Hervir la sangre del enemigo.' },
      { level: 4, name: 'Senda de la sangre · IV', description: 'Comunión con la vitae.' },
      { level: 5, name: 'Senda de la sangre · V', description: 'Vinculación de sangre instantánea.' },
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
  { name: 'Buen oído', kind: 'MERIT', value: 1, category: 'Físico', description: '+1 a tiradas de percepción auditiva.' },
  { name: 'Reflejos felinos', kind: 'MERIT', value: 1, category: 'Físico', description: 'Equilibrio innato sobrehumano.' },
  { name: 'Pelaje espeso', kind: 'MERIT', value: 1, category: 'Físico', description: 'Resistencia natural al frío.' },
  { name: 'Sentido del tiempo', kind: 'MERIT', value: 1, category: 'Mental', description: 'Conoce la hora exacta sin reloj.' },
  // Méritos sociales
  { name: 'Contactos', kind: 'MERIT', value: 1, category: 'Social', description: 'Una red de informantes mortales.' },
  { name: 'Reputación', kind: 'MERIT', value: 2, category: 'Social', description: 'Buen nombre en círculos vampíricos.' },
  // Méritos sobrenaturales
  { name: 'Inofensivo', kind: 'MERIT', value: 1, category: 'Sobrenatural', description: 'Otros vampiros te subestiman.' },
  { name: 'Sangre fuerte', kind: 'MERIT', value: 4, category: 'Sobrenatural', description: 'Tu vitae cuenta como una generación menor.' },
  // Defectos físicos
  { name: 'Cojo', kind: 'FLAW', value: -3, category: 'Físico', description: 'Movimiento reducido permanentemente.' },
  { name: 'Cicatrices', kind: 'FLAW', value: -1, category: 'Físico', description: 'Apariencia marcada por la violencia.' },
  // Defectos mentales
  { name: 'Pesadillas', kind: 'FLAW', value: -1, category: 'Mental', description: 'Dificultad para descansar al amanecer.' },
  { name: 'Fobia', kind: 'FLAW', value: -3, category: 'Mental', description: 'Pánico frente a un estímulo concreto.' },
  // Defectos sociales
  { name: 'Enemigo', kind: 'FLAW', value: -3, category: 'Social', description: 'Alguien poderoso quiere tu ruina.' },
  { name: 'Mala reputación', kind: 'FLAW', value: -2, category: 'Social', description: 'Estigma entre tus pares.' },
  // Defectos sobrenaturales
  { name: 'Halo de la Bestia', kind: 'FLAW', value: -2, category: 'Sobrenatural', description: 'Tu aura delata claramente tu condición.' },
  { name: 'Sangre débil', kind: 'FLAW', value: -4, category: 'Sobrenatural', description: 'Tu generación efectiva es una mayor.' },
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
      await prisma.disciplinePower.upsert({
        where: { disciplineId_level: { disciplineId: discipline.id, level: p.level } },
        create: { disciplineId: discipline.id, level: p.level, name: p.name, description: p.description },
        update: { name: p.name, description: p.description },
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
  { name: 'Brujah', sect: 'Camarilla', description: 'Rebeldes apasionados, idealistas y guerreros. Herederos de la antigua Cartago.', disciplines: 'Celeridad, Potencia, Presencia', weakness: 'La Bestia siempre cerca: penalización para resistir el frenesí.' },
  { name: 'Gangrel', sect: 'Camarilla', description: 'Vagabundos salvajes, cercanos a la Bestia y a la naturaleza.', disciplines: 'Animalismo, Fortaleza, Protean', weakness: 'Tras cada frenesí ganan un rasgo animal permanente.' },
  { name: 'Malkavian', sect: 'Camarilla', description: 'Locos visionarios; oráculos malditos de la Mascarada.', disciplines: 'Auspex, Dominación, Ofuscación', weakness: 'Toda la línea sufre una locura incurable.' },
  { name: 'Nosferatu', sect: 'Camarilla', description: 'Monstruos deformes; amos de la información subterránea.', disciplines: 'Animalismo, Ofuscación, Potencia', weakness: 'Apariencia 0 permanente; horror físico irreversible.' },
  { name: 'Toreador', sect: 'Camarilla', description: 'Artistas y sibaritas, esclavos de la belleza.', disciplines: 'Auspex, Celeridad, Presencia', weakness: 'Quedan absortos ante obras de gran belleza.' },
  { name: 'Tremere', sect: 'Camarilla', description: 'Hechiceros usurpadores; el clan brujo.', disciplines: 'Auspex, Dominación, Taumaturgia', weakness: 'Vinculados al consejo de Viena por sangre.' },
  { name: 'Ventrue', sect: 'Camarilla', description: 'Aristócratas natos; líderes políticos.', disciplines: 'Dominación, Fortaleza, Presencia', weakness: 'Solo pueden alimentarse de un tipo muy específico de presa.' },
  // --- Sabbat ---
  { name: 'Lasombra', sect: 'Sabbat', description: 'Señores de la oscuridad; amos de las sombras.', disciplines: 'Dominación, Obtenebración, Potencia', weakness: 'No reflejan en superficies; daño doble por luz solar y santa.' },
  { name: 'Tzimisce', sect: 'Sabbat', description: 'Demonios eslavos; moldeadores de carne.', disciplines: 'Animalismo, Auspex, Vicisitud', weakness: 'Deben descansar sobre la tierra natal de su Abrazo.' },
  // --- Independientes ---
  { name: 'Assamita', sect: 'Independiente', description: 'Asesinos persas; el clan diezmador.', disciplines: 'Celeridad, Ofuscación, Quietus', weakness: 'La sangre adictiva los doblega tras diablerie.' },
  { name: 'Followers of Set', sect: 'Independiente', description: 'Corruptores serpenteantes; herederos del dios oscuro Set.', disciplines: 'Ofuscación, Presencia, Serpentis', weakness: 'Doble daño por luz solar; debilitamiento ante toda luz.' },
  { name: 'Giovanni', sect: 'Independiente', description: 'Necromantes y banqueros; una familia de muertos vivos.', disciplines: 'Dominación, Necromancia, Potencia', weakness: 'Su beso causa daño desgarrador, no éxtasis.' },
  { name: 'Ravnos', sect: 'Independiente', description: 'Engañadores nómadas; herederos de los Rom.', disciplines: 'Animalismo, Fortaleza, Quimerismo', weakness: 'Cada miembro tiene un vicio compulsivo (engaño, robo, etc.).' },
  // --- Linajes / Bloodlines ---
  { name: 'Caitiff', sect: 'Linaje', description: 'Vampiros sin clan; huérfanos de la sangre.', disciplines: 'Tres disciplinas libres', weakness: 'Sin debilidad fija, pero socialmente despreciados.' },
  { name: 'Daughters of Cacophony', sect: 'Linaje', description: 'Cantantes vampiras; voces hipnóticas e inquietantes.', disciplines: 'Fortaleza, Melpominee, Presencia', weakness: 'Música etérea las acompaña, delatando su presencia.' },
  { name: 'Salubri', sect: 'Linaje', description: 'Curanderos y guerreros del tercer ojo.', disciplines: 'Auspex, Fortaleza, Obeah o Valeren', weakness: 'Tercer ojo visible; perseguidos por Tremere y Sabbat.' },
  { name: 'Samedi', sect: 'Linaje', description: 'Vampiros putrefactos; señores haitianos de la muerte.', disciplines: 'Fortaleza, Necromancia, Thanatosis', weakness: 'Su cuerpo siempre muestra signos de descomposición.' },
  { name: 'Gargoyles', sect: 'Linaje', description: 'Sirvientes creados por los Tremere a partir de tres clanes.', disciplines: 'Fortaleza, Potencia, Visceratika', weakness: 'Piel pétrea visible; condicionamiento Tremere.' },
  { name: 'Baali', sect: 'Linaje', description: 'Adoradores de demonios; linaje infernal y odiado.', disciplines: 'Daimoinon, Ofuscación, Presencia', weakness: 'Reciben daño agravado de símbolos sagrados verdaderos.' },
  { name: 'Kiasyd', sect: 'Linaje', description: 'Estudiosos lóbregos, conectados con la fae.', disciplines: 'Dominación, Mytherceria, Obtenebración', weakness: 'Vulnerables al hierro frío.' },
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

async function main() {
  await seedArchetypes();
  await seedDisciplines();
  await seedMeritsFlaws();
  await seedClans();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
