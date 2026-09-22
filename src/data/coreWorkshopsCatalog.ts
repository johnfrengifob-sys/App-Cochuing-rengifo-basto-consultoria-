import { CoreWorkshopTrack } from '../components/dashboard/ParticipantTalleresModule';
import { OFFICIAL_FORMS_SHEETS_BASE_MAP } from './officialFormsSheetsBase';
export type { CoreWorkshopTrack };

export const CORE_WORKSHOPS_CATALOG: CoreWorkshopTrack[] = [
  {
    id: 'taller-1-raiz',
    matchIds: ['taller-1-raiz', 'taller-1', 'raiz', 'event-raiz-balance'],
    stageName: 'Raíz',
    phase: 'Fase I • Fundamentos & Transparencia Somática',
    levelBadge: 'Nivel I • Fase Raíz',
    accentColor: 'emerald',
    title: 'Taller 1: Raíz',
    subtitle: 'Reconocer la raíz: Corporalidad, límites y descodificación de las emociones fundamentales.',
    thematicFocus:
      'Suspensión reflexiva del piloto automático, decodificación de tensiones musculares y reconocimiento de quiebres ocultos en la rutina ejecutiva.',
    guidingQuestion:
      '¿En qué áreas de tu vida estás operando en piloto automático tolerando costos ocultos que drenan tu energía vital?',
    somaticPractice:
      'Respiración diafragmática 4-2-6 y enraizamiento en planta de pies ante situaciones de alta fricción o reactividad.',
    meetLink: 'https://meet.google.com/rbc-conversatorio-ontologico',
    defaultDate: 'Sábado, 19 de Septiembre de 2026',
    defaultBreakthrough:
      'Identificación de automatismos reactivos y apertura deliberada de espacio para la pausa reflexiva antes de responder.',
    defaultCommitments:
      'Pausa somática de 90 segundos al percibir tensión; registro quincenal de quiebres en la bitácora personal.',
    googleFormsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl,
    googleSheetsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl,
    agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl,
    agreementSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl,
    bitacoraFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl,
    bitacoraSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    autocratUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl,
    autocratFolderUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.driveFolderUrl,
  },
  {
    id: 'taller-2-tallo',
    matchIds: ['taller-2-tallo', 'taller-2', 'tallo', 'event-tallo'],
    stageName: 'Nivel II',
    phase: 'Fase II • Fronteras & Soberanía Relacional',
    levelBadge: 'Nivel II • Lenguaje y Juicios',
    accentColor: 'amber',
    title: 'Taller 2: Nivel II - Lenguaje y Juicios',
    subtitle: 'Transformar desde el lenguaje: Deconstrucción de juicios, actos lingüísticos y rediseño de observadores.',
    thematicFocus:
      'El poder fundacional del "No" y del "Basta" ontológico. Deconstrucción de la culpa condicionada y diseño de conversaciones de frontera.',
    guidingQuestion:
      '¿Qué límites has omitido declarar por temor al conflicto o por necesidad aprendida de aprobación?',
    somaticPractice:
      'Apertura de caja torácica, alineación de eje vertical y anclaje de mirada asertiva sin contracción mandibular.',
    meetLink: 'https://meet.google.com/rbc-conversatorio-ontologico',
    defaultDate: 'Sábado, 26 de Septiembre de 2026',
    defaultBreakthrough:
      'Declaración clara de fronteras personales sin culpa ni necesidad de justificaciones reactivas excesivas.',
    defaultCommitments:
      'Sostener el "No" limpio y respetuoso ante peticiones que vulneren el descanso o la coherencia interna.',
    googleFormsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl,
    googleSheetsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl,
    agreementSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl,
    bitacoraFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl,
    bitacoraSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    autocratUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    autocratFolderUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.driveFolderUrl,
  },
  {
    id: 'taller-3-florecimiento',
    matchIds: ['taller-3-florecimiento', 'taller-3', 'florecimiento', 'event-florecimiento'],
    stageName: 'Florecimiento',
    phase: 'Fase III • Maestría Lingüística & Cosecha',
    levelBadge: 'Nivel III • Florecimiento',
    accentColor: 'indigo',
    title: 'Taller 3: Florecimiento',
    subtitle: 'Encarnar la transformación: Mapa de decisiones conscientes, diseño de futuros y contribución relacional.',
    thematicFocus:
      'Integración coherente de cuerpo, emoción y lenguaje. Proclamación del Manifiesto de Soberanía Personal y coordinación impecable de compromisos.',
    guidingQuestion:
      '¿Desde qué nuevo observador estás eligiendo diseñar tu futuro y tus acuerdos relacionales?',
    somaticPractice:
      'Presencia centrada, respiración fluida y soltura mandibular para articulación de juicios fundados y promesas claras.',
    meetLink: 'https://meet.google.com/rbc-conversatorio-ontologico',
    defaultDate: 'Sábado, 3 de Octubre de 2026',
    defaultBreakthrough:
      'Habitar un observador reflexivo con capacidad de generar nuevas realidades a través de la palabra comprometida.',
    defaultCommitments:
      'Revisión periódica del Manifiesto Ontológico y cumplimiento riguroso de promesas y pedidos directivos.',
    googleFormsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl,
    googleSheetsUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    agreementFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl,
    agreementSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl,
    bitacoraFormUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl,
    bitacoraSheetUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    autocratUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl,
    autocratFolderUrl: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.driveFolderUrl,
  },
];
