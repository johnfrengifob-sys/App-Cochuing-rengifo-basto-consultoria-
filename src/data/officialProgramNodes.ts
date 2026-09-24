import { ProgramNodeInfo, Session, WorkshopRoadmapStep } from '../types';

export const DEFAULT_CALENDAR_URL = 'https://calendar.app.google/b5h9YrYnyjME7LbD7';

const STANDARD_INDAGACION_TITLE = 'Espacio de Indagación Autónoma y Construcción de Sentido';
const STANDARD_INDAGACION_OBJECTIVE =
  'Facilitar un espacio de reflexión profunda donde el cliente explore su propia realidad, identifique nuevas distinciones y potencie su aprendizaje autónomo.';
const STANDARD_INDAGACION_REQUIREMENTS =
  'Disposición para la autoobservación, apertura a la incertidumbre y un entorno seguro y libre de juicios.';

const STANDARD_CIERRE_TITLE =
  'Cierre de Ciclo: Integración, Cosecha de Aprendizajes y Evolución del Ser';
const STANDARD_CIERRE_OBJECTIVE =
  'Acompañar al cliente en la integración reflexiva del proceso recorrido, facilitando un espacio de autoconocimiento donde reconozca sus propias transformaciones, consolide los aprendizajes clave derivados de su experiencia y proyecte con autonomía sus siguientes pasos y compromisos de desarrollo.';
const STANDARD_CIERRE_REQUIREMENTS =
  'Disposición para la autoobservación profunda, apertura para reconocer los logros y quiebres superados durante el proceso, y un nivel de presencia plena para evaluar el impacto de su propia evolución sin expectativas externas.';

const LEVEL_CONFIGS: Record<
  'Nivel I' | 'Nivel II' | 'Nivel III',
  { title: string; defaultWeeks: [string, string, string, string] }
> = {
  'Nivel I': {
    title: 'Fundamentos & Transparencia',
    defaultWeeks: ['Semanas 1-2', 'Semanas 1-2', 'Semanas 3-4', 'Semanas 3-4'],
  },
  'Nivel II': {
    title: 'Corporalidad, Relaciones & Emocionalidad',
    defaultWeeks: ['Semanas 5-6', 'Semanas 5-6', 'Semanas 7-8', 'Semanas 7-8'],
  },
  'Nivel III': {
    title: 'Dirección & Trascendencia',
    defaultWeeks: ['Semanas 9-10', 'Semanas 9-10', 'Semanas 11-12', 'Semanas 11-12'],
  },
};

function generateRoadmapSteps(step: number, isCierre: boolean): WorkshopRoadmapStep[] {
  if (isCierre) {
    return [
      {
        id: `step-${step}-1`,
        stepNumber: 1,
        title: 'Apertura y Presencia Plena',
        phaseType: 'Centramiento & Apertura',
        description: 'Centramiento somático y balance inicial de la evolución personal.',
        durationMinutes: 10,
      },
      {
        id: `step-${step}-2`,
        stepNumber: 2,
        title: 'Cosecha de Aprendizajes y Quiebres Superados',
        phaseType: 'Marco Teórico Ontológico',
        description: 'Revisión reflexiva de las transformaciones y distinciones alcanzadas.',
        durationMinutes: 25,
      },
      {
        id: `step-${step}-3`,
        stepNumber: 3,
        title: 'Integración del Nuevo Observador',
        phaseType: 'Dinámica Vivencial',
        description: 'Evaluación del impacto de la propia evolución sin expectativas externas.',
        durationMinutes: 15,
      },
      {
        id: `step-${step}-4`,
        stepNumber: 4,
        title: 'Proyección y Compromisos de Desarrollo',
        phaseType: 'Cierre & Acuerdos',
        description: 'Declaración de acuerdos de futuro y siguientes pasos con total autonomía.',
        durationMinutes: 10,
      },
    ];
  }

  return [
    {
      id: `step-${step}-1`,
      stepNumber: 1,
      title: 'Centramiento y Creación del Espacio Seguro',
      phaseType: 'Centramiento & Apertura',
      description: 'Disposición para la autoobservación y apertura a la incertidumbre.',
      durationMinutes: 10,
    },
    {
      id: `step-${step}-2`,
      stepNumber: 2,
      title: 'Indagación y Exploración de la Realidad',
      phaseType: 'Marco Teórico Ontológico',
      description: 'Exploración profunda de la realidad actual y formulación de preguntas maestras.',
      durationMinutes: 25,
    },
    {
      id: `step-${step}-3`,
      stepNumber: 3,
      title: 'Construcción de Sentido y Nuevas Distinciones',
      phaseType: 'Dinámica Vivencial',
      description: 'Identificación de nuevas distinciones y desbloqueo de posibilidades.',
      durationMinutes: 15,
    },
    {
      id: `step-${step}-4`,
      stepNumber: 4,
      title: 'Cierre y Aprendizaje Autónomo',
      phaseType: 'Cierre & Acuerdos',
      description: 'Síntesis personal y compromisos para potenciar el aprendizaje autónomo.',
      durationMinutes: 10,
    },
  ];
}

export const OFFICIAL_PROGRAM_NODES: ProgramNodeInfo[] = Array.from({ length: 12 }, (_, i) => {
  const step = i + 1;
  const cycleIndex = (step - 1) % 4; // 0, 1, 2, 3
  const isCierre = cycleIndex === 3;
  const level: 'Nivel I' | 'Nivel II' | 'Nivel III' =
    step <= 4 ? 'Nivel I' : step <= 8 ? 'Nivel II' : 'Nivel III';
  const levelMeta = LEVEL_CONFIGS[level];
  const weekLabel = levelMeta.defaultWeeks[cycleIndex];

  const sessionTitle = isCierre ? STANDARD_CIERRE_TITLE : STANDARD_INDAGACION_TITLE;
  const objective = isCierre ? STANDARD_CIERRE_OBJECTIVE : STANDARD_INDAGACION_OBJECTIVE;
  const requirements = isCierre ? STANDARD_CIERRE_REQUIREMENTS : STANDARD_INDAGACION_REQUIREMENTS;

  return {
    step,
    weekLabel,
    level,
    levelTitle: levelMeta.title,
    sessionTitle,
    objective,
    tangibleOutcomes: isCierre
      ? [
          'Reconocimiento y consolidación de las transformaciones y quiebres superados durante el ciclo.',
          'Evaluación ontológica del avance personal y acuerdos de auto-compromiso.',
          'Diseño de la proyección y compromisos de desarrollo hacia los siguientes pasos.',
        ]
      : [
          'Identificación precisa de la realidad actual y descubrimiento de nuevas distinciones.',
          'Ampliación del sentido personal y superación de quiebres limitantes.',
          'Fortalecimiento del aprendizaje autónomo y registro en la bitácora ontológica.',
        ],
    keyQuestion: isCierre
      ? '¿Qué nuevo observador emerge en ti al reconocer tu evolución y qué compromisos eliges proyectar?'
      : '¿Qué aspecto de tu realidad requiere hoy una indagación profunda para construir un sentido renovado?',
    levelPrompt: requirements,
    methodology: isCierre
      ? {
          linguistic: 'Declaraciones de cierre, gratitud ontológica y afirmación de nuevos compromisos.',
          somatic: 'Presencia plena, respiración integrativa y arraigo visceral de los aprendizajes.',
          emotional: 'Satisfacción serena, paz reflexiva y confianza en la propia evolución.',
        }
      : {
          linguistic: 'Indagación abierta, formulación de quiebres y construcción reflexiva de sentido.',
          somatic: 'Autoobservación corporal, escucha sin juicio y centramiento consciente.',
          emotional: 'Apertura a la incertidumbre, serenidad y asombro ante nuevas posibilidades.',
        },
    dailyMicroPractice: isCierre
      ? {
          title: 'Cosecha de Aprendizajes y Celebración del Ser',
          description:
            'Espacio reflexivo de 5 minutos para registrar en la bitácora la evolución experimentada.',
          frequency: 'Al culminar cada ciclo',
        }
      : {
          title: 'Micro-pausa de Autoobservación Consciente (90 seg)',
          description:
            'Pausa diaria para registrar evidencias de aprendizaje y nuevas distinciones en tu actuar cotidiano.',
          frequency: 'Diaria (1 vez al día)',
        },
    reinforcementPack: {
      title: isCierre ? 'Compendio de Integración y Cierre de Ciclo' : 'Guía de Indagación Autónoma',
      subtitle: isCierre ? 'Consolidación de aprendizajes ontológicos' : 'Construcción reflexiva de sentido',
      summary: requirements,
      audioGuideTitle: isCierre ? 'Audio Guía: Integración y Cosecha' : 'Audio Guía: Indagación Autónoma',
      audioDuration: '8 min',
      audioScript: isCierre
        ? 'Respira profundo y contempla el recorrido transitado...'
        : 'Pausa reflexiva para conectar con tu observador interior...',
      keyPractices: [
        'Autoobservación consciente',
        'Registro en bitácora ontológica',
        'Reconocimiento de nuevas distinciones',
      ],
      selfCareProtocol: 'Mantener un espacio seguro y libre de juicios para la reflexión personal.',
      reflectiveQuestions: isCierre
        ? [
            '¿Cuáles fueron los quiebres más significativos que superaste a lo largo de este ciclo?',
            '¿Qué transformaciones reconoces hoy en tu forma de observar, sentir y comunicarte?',
          ]
        : [
            '¿Qué distinciones nuevas descubres en tu realidad actual al observarte sin juicios?',
            '¿Cómo puedes transformar la incertidumbre en un motor de aprendizaje continuo?',
          ],
    },
    studyMaterials: [
      {
        title: `Bitácora de Autoobservación - Módulo ${step}`,
        type: 'Bitácora Reflexiva',
        pages: '4 páginas',
        description: requirements,
      },
    ],
    reflectiveQuestions: isCierre
      ? [
          '¿Cuáles fueron los quiebres más significativos que superaste a lo largo de este ciclo?',
          '¿Qué transformaciones reconoces hoy en tu forma de observar, sentir y comunicarte?',
          '¿Hacia qué metas y compromisos proyectas tu evolución de manera autónoma?',
        ]
      : [
          '¿Qué distinciones nuevas descubres en tu realidad actual al observarte sin juicios?',
          '¿Cómo puedes transformar la incertidumbre en un motor de aprendizaje continuo?',
          '¿Qué acciones conscientes brotan de esta nueva construcción de sentido?',
        ],
    roadmapSteps: generateRoadmapSteps(step, isCierre),
    googleSheetsUrl:
      'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    agreementSheetUrl:
      'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
    agreementFormUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
    bitacoraSheetUrl:
      'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    bitacoraFormUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    formsIntegrationId: 'bitacora_sesiones_b2b',
    reminderMessage: `Recordatorio: Tu sesión #${step} (${sessionTitle}) requiere revisión previa en tu bitácora ontológica.`,
    postSurveyMessage: `Por favor diligencia la Bitácora del módulo "${sessionTitle}".`,
    welcomeMessage: `¡Hola! Tu módulo de sesión "${sessionTitle}" está disponible para tu indagación.`,
  };
});

export function getOfficialProgramNodes(): ProgramNodeInfo[] {
  return JSON.parse(JSON.stringify(OFFICIAL_PROGRAM_NODES));
}

export function generateOfficialSessions(clientId: string = 'client-legadobarber2026'): Session[] {
  const baseStartDate = new Date('2026-09-23T10:00:00.000-05:00');
  return OFFICIAL_PROGRAM_NODES.map((node, idx) => {
    const sessionDate = new Date(baseStartDate.getTime() + idx * 14 * 24 * 60 * 60 * 1000);
    const dateStr = sessionDate.toISOString();
    const scheduledDate = dateStr.split('T')[0];
    const isCierre = node.step % 4 === 0;

    return {
      id: `sess-${clientId}-${node.step}`,
      clientId,
      sessionNumber: node.step,
      title: `Sesión ${node.step}: ${node.sessionTitle}`,
      sessionType: (isCierre ? 'cierre_ciclo' : 'sesion') as 'cierre_ciclo' | 'sesion',
      level: node.level,
      levelTitle: node.levelTitle,
      weekLabel: node.weekLabel,
      weekNumber: node.step,
      date: dateStr,
      scheduledDate,
      scheduledTime: '10:00',
      meetLink: 'https://meet.google.com/rbc-conversatorio-ontologico',
      calendarLink: DEFAULT_CALENDAR_URL,
      status: (node.step === 1 ? 'completed' : 'scheduled') as 'completed' | 'scheduled',
      isPaid: true,
      durationMinutes: 60,
      sessionGoal: node.objective,
      openingQuestion: node.keyQuestion,
      ontologicalFocus: node.sessionTitle,
      notes: `Requisitos: ${node.levelPrompt}`,
      programNodeStep: node.step,
      googleSheetsUrl:
        'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
      googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
      agreementFormUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
      agreementSheetUrl:
        'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
      bitacoraFormUrl: 'https://forms.gle/APUFto8sGbJt322WA',
      bitacoraSheetUrl:
        'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
      formsIntegrationId: 'bitacora_sesiones_b2b',
      expedienteSyncStatus: 'synced' as const,
    };
  });
}
