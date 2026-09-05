import { CronogramaEvent, OntologicalProgram } from '../types';

export const INITIAL_CRONOGRAMA_EVENTS: CronogramaEvent[] = [
  // =========================================================================
  // TALLER I: Raíz – Deconstrucción Somática & Sabiduría Emocional
  // =========================================================================
  {
    id: 'taller-1-raiz',
    title: 'Taller I: Raíz – Deconstrucción Somática & Sabiduría Emocional',
    subtitle: 'Reconocer la raíz: Corporalidad, límites y descodificación de las emociones fundamentales.',
    category: 'Primer Taller • En Vivo',
    eventType: 'Taller / Programa Intensivo',
    date: '2026-09-12T19:00:00.000-05:00',
    displayDate: 'Sábado, 12 de Septiembre de 2026',
    time: '7:00 PM - 8:30 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    description:
      'Primer encuentro vivencial del programa maestro RAÍZ Y BALANCE: Evolución de las Emociones. Reconocer la raíz: Corporalidad, límites y descodificación de las emociones fundamentales a través del mapeo de la transparencia cotidiana, la decodificación somática del miedo y la rabia inspirada en Norberto Levy, y la proclamación del "Basta" como acto fundacional de soberanía relacional.',
    imageUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
    showOnHome: true,
    capacityType: 'grupal',
    capacity: 12,
    totalSpots: 12,
    spotsLeft: 12,
    priceAmount: 180000,
    price: '$180.000 COP',
    currency: 'COP',
    launchDate: '2026-09-05',
    eventDate: '2026-09-12',
    facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
    featured: true,
    status: 'upcoming',
    // 2. CONTENIDO Y TEMARIO:
    syllabus: [
      {
        id: 'syl-t1-1',
        title: 'Bloque 1: Mapeo de la Transparencia y Quiebres Inconscientes',
        duration: '35 min',
        description:
          'Identificación de mandatos automáticos, exigencias descalificadoras y la inercia corporal cotidiana.',
      },
      {
        id: 'syl-t1-2',
        title: 'Bloque 2: Decodificación Somática del Miedo y la Rabia (Inspirado en Norberto Levy)',
        duration: '40 min',
        description:
          'Lectura corporal de las emociones primarias y sus límites sin juicios clínicos.',
      },
    ],
    guidingQuestions: [
      '¿En qué áreas de tu vida estás diciendo "Sí" por complacencia cuando tu cuerpo grita "Basta"?',
      '¿Cuál es el costo somático, emocional y relacional de intentar controlarlo todo?',
      '¿Qué emoción o mandato invisible te acompaña hoy al iniciar este espacio?',
    ],
    supportMaterials: [
      {
        id: 'mat-t1-1',
        title: 'Guía de Trabajo: Protocolo de Autoobservación Somática (PDF)',
        type: 'pdf',
        url: 'https://rbc.edu.co/recursos/protocolo-autoobservacion-somatica.pdf',
        description:
          'Protocolo experiencial para mapear señales corporales, respiración consciente y decodificación de límites sin juicios clínicos.',
        sizeOrDuration: 'PDF • 8 Páginas',
      },
    ],
    // 3. CUESTIONARIO POSTERIOR Y CUADERNO PDF:
    postWorkshopQuestions: [
      {
        id: 'pwq-t1-1',
        question:
          '¿Cuál fue el quiebre principal o revelación que descubriste en este primer taller sobre tu mapa emocional?',
        type: 'textarea',
        category: 'reflexion',
        required: true,
      },
      {
        id: 'pwq-t1-2',
        question:
          '¿Qué sensación corporal o mensaje somático lograste identificar al explorar tus límites y emociones?',
        type: 'textarea',
        category: 'somatica',
        required: true,
      },
      {
        id: 'pwq-t1-3',
        question:
          '¿A qué compromiso o nuevo acuerdo interno te declaras leal para esta semana en pro de tu equilibrio?',
        type: 'textarea',
        category: 'compromiso',
        required: true,
      },
      {
        id: 'pwq-t1-4',
        question:
          '¿Cómo calificarías la profundidad y aplicabilidad de lo vivido en esta sesión (1 a 5)?',
        type: 'rating_scale',
        category: 'evaluacion',
        required: true,
      },
    ],
    workbookSubmissions: [],
  },

  // =========================================================================
  // TALLER II: Tallo – Lenguaje, Juicios y Narrativas Limitantes
  // =========================================================================
  {
    id: 'taller-2-tallo',
    title: 'Taller II: Tallo – Lenguaje, Juicios y Narrativas Limitantes',
    subtitle: 'Transformar desde el lenguaje: Deconstrucción de juicios, actos lingüísticos y rediseño de observadores.',
    category: 'Taller Vivencial',
    eventType: 'Taller / Programa Intensivo',
    date: '2026-09-19T19:00:00.000-05:00',
    displayDate: 'Sábado, 19 de Septiembre de 2026',
    time: '7:00 PM - 8:30 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    description:
      'Segundo encuentro vivencial del programa maestro RAÍZ Y BALANCE: Evolución de las Emociones. Transformar desde el lenguaje: Deconstrucción de juicios, actos lingüísticos y rediseño de observadores. Indagación sobre frases automáticas cotidianas, contratos invisibles y el diseño de nuevas conversaciones de posibilidad y liderazgo.',
    imageUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80',
    showOnHome: true,
    capacityType: 'grupal',
    capacity: 12,
    totalSpots: 12,
    spotsLeft: 12,
    priceAmount: 180000,
    price: '$180.000 COP',
    currency: 'COP',
    launchDate: '2026-09-13',
    eventDate: '2026-09-19',
    facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
    featured: true,
    status: 'upcoming',
    // 2. CONTENIDO Y TEMARIO:
    syllabus: [
      {
        id: 'syl-t2-1',
        title: 'Bloque 1: El Lenguaje como Espejo y las "Palabras que Pesan"',
        duration: '35 min',
        description:
          'Identificación de frases automáticas cotidianas y la emocionalidad que las sostiene.',
      },
      {
        id: 'syl-t2-2',
        title: 'Bloque 2: Declaraciones Ocultas y el Contrato Invisible',
        duration: '40 min',
        description:
          'Indagación sobre compromisos internos y juicios maestros.',
      },
    ],
    guidingQuestions: [
      '¿Qué frase o narrativa repetitiva sobre ti mismo está condicionando las decisiones que hoy evitas tomar?',
      '¿Cuál es el juicio maestro que subyace detrás de tu sensación de estancamiento?',
      '¿Qué declaración pendiente de hacer (o de revocar) requiere tu liderazgo actual?',
    ],
    supportMaterials: [
      {
        id: 'mat-t2-1',
        title: 'Guía de Trabajo: Distinciones del Lenguaje y Reencuadre (PDF)',
        type: 'pdf',
        url: 'https://rbc.edu.co/recursos/distinciones-lenguaje-reencuadre.pdf',
        description:
          'Matriz práctica de deconstrucción de juicios maestros, afirmaciones vs declaraciones y diseño de conversaciones de posibilidad.',
        sizeOrDuration: 'PDF • 10 Páginas',
      },
    ],
    // 3. CUESTIONARIO POSTERIOR Y CUADERNO PDF:
    postWorkshopQuestions: [
      {
        id: 'pwq-t2-1',
        question:
          '¿Cuál fue el juicio o narrativa limitante que lograste deconstruir durante esta sesión?',
        type: 'textarea',
        category: 'reflexion',
        required: true,
      },
      {
        id: 'pwq-t2-2',
        question:
          '¿Qué nueva interpretación o posibilidad de observador comenzó a abrirse para ti?',
        type: 'textarea',
        category: 'somatica',
        required: true,
      },
      {
        id: 'pwq-t2-3',
        question:
          '¿Qué declaración fundamental asumes para modificar tu coherencia esta semana?',
        type: 'textarea',
        category: 'compromiso',
        required: true,
      },
      {
        id: 'pwq-t2-4',
        question:
          '¿Cómo calificarías la profundidad y aplicabilidad de lo vivido en esta sesión (1 a 5)?',
        type: 'rating_scale',
        category: 'evaluacion',
        required: true,
      },
    ],
    workbookSubmissions: [],
  },

  // =========================================================================
  // TALLER III: Florecimiento – Acción, Propósito y Coherencia
  // =========================================================================
  {
    id: 'taller-3-florecimiento',
    title: 'Taller III: Florecimiento – Acción, Propósito y Coherencia',
    subtitle: 'Encarnar la transformación: Mapa de decisiones conscientes, diseño de futuros y contribución relacional.',
    category: 'Conversatorio de Cierre',
    eventType: 'Taller / Programa Intensivo',
    date: '2026-09-26T19:00:00.000-05:00',
    displayDate: 'Sábado, 26 de Septiembre de 2026',
    time: '7:00 PM - 8:30 PM (GMT-5)',
    mode: 'Online (Google Meet)',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    description:
      'Tercer y culminante encuentro vivencial del programa maestro RAÍZ Y BALANCE: Evolución de las Emociones. Encarnar la transformación: Mapa de decisiones conscientes, diseño de futuros y contribución relacional. Integración sistémica de la Raíz y el Tallo con el momento presente para consolidar el plan tridimensional y pactar acuerdos de vida innegociables.',
    imageUrl:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80',
    showOnHome: true,
    capacityType: 'grupal',
    capacity: 12,
    totalSpots: 12,
    spotsLeft: 12,
    priceAmount: 180000,
    price: '$180.000 COP',
    currency: 'COP',
    launchDate: '2026-09-20',
    eventDate: '2026-09-26',
    facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
    featured: true,
    status: 'upcoming',
    // 2. CONTENIDO Y TEMARIO:
    syllabus: [
      {
        id: 'syl-t3-1',
        title: 'Bloque 1: Cosecha del Proceso y Línea del Florecimiento',
        duration: '35 min',
        description:
          'Integración sistémica de la Raíz y el Tallo con el momento presente.',
      },
      {
        id: 'syl-t3-2',
        title: 'Bloque 2: El Mapa de Decisiones y el Plan Tridimensional',
        duration: '40 min',
        description:
          'Diseño de acciones en dimensiones: Personal, Relacional y Contribución.',
      },
    ],
    guidingQuestions: [
      '¿Cuál es el camino de acción que has venido repitiendo por inercia y qué decisión requiere de ti un rumbo diferente?',
      '¿Qué conversación pendiente o compromiso relacional necesitas iniciar para alinear tu coherencia?',
      '¿Cuál es el recurso vital más valioso que te llevas de este proceso para aportarlo a tu entorno?',
    ],
    supportMaterials: [
      {
        id: 'mat-t3-1',
        title: 'Guía de Trabajo: Plan de Acción y Mapa de Propósito (PDF)',
        type: 'pdf',
        url: 'https://rbc.edu.co/recursos/plan-accion-mapa-proposito.pdf',
        description:
          'Estructura de compromisos tridimensionales (personal, relacional, contribución) y manifiesto de coherencia ontológica.',
        sizeOrDuration: 'PDF • 12 Páginas',
      },
    ],
    // 3. CUESTIONARIO POSTERIOR Y CUADERNO PDF:
    postWorkshopQuestions: [
      {
        id: 'pwq-t3-1',
        question:
          '¿Cuál consideras que fue el aprendizaje o recurso interno más potente que cosechaste a lo largo de este programa?',
        type: 'textarea',
        category: 'reflexion',
        required: true,
      },
      {
        id: 'pwq-t3-2',
        question:
          '¿Qué acción o conversación específica te comprometes a ejecutar esta semana para honrar tu proceso?',
        type: 'textarea',
        category: 'compromiso',
        required: true,
      },
      {
        id: 'pwq-t3-3',
        question:
          '¿Cómo se traduce este florecimiento en tu manera de relacionarte con tu entorno y tus metas a corto plazo?',
        type: 'textarea',
        category: 'somatica',
        required: true,
      },
      {
        id: 'pwq-t3-4',
        question:
          '¿Cómo calificarías la profundidad y aplicabilidad de lo vivido en esta sesión (1 a 5)?',
        type: 'rating_scale',
        category: 'evaluacion',
        required: true,
      },
    ],
    workbookSubmissions: [],
  },
];

export const MASTER_PROGRAM_RAIZ_BALANCE: OntologicalProgram = {
  id: 'prog-raiz-y-balance',
  name: 'RAÍZ Y BALANCE: Evolución de las Emociones',
  subtitle: 'Programa Maestro de Transformación Ontológica: Raíz, Tallo y Florecimiento',
  category: 'Programa de Acompañamiento',
  duration: '3 Talleres Intensivos (Sábados 7:00 PM - 8:30 PM)',
  format: 'Grupal / Cohorte',
  fee: '$540.000 COP ($180.000 COP por taller)',
  totalCapacity: 12,
  availableSpots: 12,
  enrolledCount: 0,
  status: 'enrolling',
  description:
    'Programa vivencial intensivo en tres niveles progresivos guiado por John Fredy Rengifo Basto: Taller I (Raíz: Somática y Sabiduría Emocional), Taller II (Tallo: Lenguaje y Deconstrucción de Juicios) y Taller III (Florecimiento: Acción, Propósito y Coherencia).',
  keyOutcomes: [
    'Deconstrucción somática, límites y sabiduría adaptativa de emociones',
    'Deconstrucción de juicios limitantes, actos del habla y nuevos observadores',
    'Mapa tridimensional de decisiones, florecimiento y compromisos innegociables',
  ],
  startDate: '2026-09-12',
  displaySchedule: 'Sábados 12, 19 y 26 de Septiembre 2026 • 7:00 PM - 8:30 PM (GMT-5)',
  facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
  totalNodes: 3,
};
