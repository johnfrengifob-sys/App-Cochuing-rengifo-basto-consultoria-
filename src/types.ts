export type UserRole = 'client' | 'coach';

export type PaymentStatus = 'Pago Único' | 'Cuota 1 de 2' | 'Completado';

export type ClientStatus = 'active' | 'waiting' | 'inactive';

export interface User {
  uid: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  title?: string;
  phone?: string;
  joinedAt?: string;
  programProgress?: number; // 1 to 6 (sesión quincenal en el programa de 12 semanas)
  programStep?: number;
  company?: string;
  notes?: string;
  paymentStatus?: PaymentStatus;
  programName?: string;
  programFee?: string;
  status?: ClientStatus; // 'active' (verde), 'waiting' (amarillo), 'inactive' (gris/rojo)
  totalInvested?: string; // Monto total invertido en su progreso
  primaryBreakdown?: string; // Quiebre principal sintético (ej: "Gestión de la ira", "Trato con sus padres", etc.)
  lastActivityAt?: string;
}

export type ProspectStatus =
  | 'matriz_enviada'
  | 'sesion_20min_agendada'
  | 'convertido'
  | 'descartado';

export interface Prospect {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  status: ProspectStatus;
  origin: string; // "Conversatorio Raíz y Balance"
  notes?: string;
  matrixSentAt?: string;
  session20minDate?: string;
  convertedAt?: string;
  createdAt: string;
}

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  clientId: string;
  sessionNumber?: number; // 1 to 6
  date: string; // ISO string
  meetLink: string;
  status: SessionStatus;
  notes?: string;
  ontologicalFocus?: string;
  isPaid?: boolean;
  paymentValidatedAt?: string;
  unlockedByPaymentId?: string;
  unlockedPaymentPlan?: 'level' | 'full';
  durationMinutes?: number;
  programNodeStep?: number;
}

export interface PostSessionForm {
  id: string;
  sessionId: string;
  sessionNumber: number;
  clientId: string;
  clientName: string;
  sessionDate: string;
  submittedAt: string;
  // Pregunta 1: Emoción principal y nivel de resistencia/apertura
  coacheeEmotionAndOpenness: string;
  // Pregunta 2: Juicio maestro, narrativa o creencia limitante
  masterJudgmentAndNarrative: string;
  // Pregunta 3: Evidencia de cambio de perspectiva o nuevo nivel de consciencia
  perspectiveShiftEvidence: string;
  // Pregunta 4: Momento de directividad y competencia ICF a cuidar
  directivenessAndIcfCompetency: string;
  // Material de Cuaderno de Trabajo para el Coachee
  workbookTitle?: string;
  coacheeKeyDeclaration?: string;
  agreedActionItems?: string[];
  somaticHomework?: string;
}

export interface FormSubmission {
  id: string;
  clientId: string;
  sessionId: string;
  sessionStep: number; // 1 to 6
  level: 'Nivel I' | 'Nivel II' | 'Nivel III';
  bodyEmotion: string; // Respuesta a "¿Qué emoción tiene una fuerte presencia en tu cuerpo hoy?"
  reflections: string;
  levelSpecificAnswer?: string; // Respuesta a la pregunta específica del nivel
  dynamicAnswers?: Record<string, string | number>; // Dynamic questionnaire responses
  submittedAt: string; // ISO string
}

export interface LevelReinforcementPack {
  title: string;
  subtitle: string;
  summary: string;
  audioGuideTitle: string;
  audioDuration: string;
  audioScript: string;
  keyPractices: string[];
  selfCareProtocol: string;
  reflectiveQuestions: string[];
}

export interface WorkshopRoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  durationMinutes: number;
  phaseType:
    | 'Centramiento & Apertura'
    | 'Marco Teórico Ontológico'
    | 'Dinámica Vivencial'
    | 'Práctica Somática'
    | 'Cierre & Acuerdos';
  description: string;
  keyInstructions?: string[];
}

export interface ProgramNodeInfo {
  step: number; // 1 to 6
  weekLabel: string; // "Semanas 1-2", "Semanas 3-4", etc.
  level: 'Nivel I' | 'Nivel II' | 'Nivel III';
  levelTitle: string;
  sessionTitle: string;
  title?: string;
  objective: string;
  tangibleOutcomes: string[];
  keyQuestion: string;
  levelPrompt: string;
  methodology: {
    linguistic: string;
    somatic: string;
    emotional: string;
  };
  dailyMicroPractice: {
    title: string;
    description: string;
    frequency: string;
  };
  reinforcementPack: LevelReinforcementPack;
  studyMaterials: {
    title: string;
    type: 'Guía de Trabajo' | 'Ficha de Ejercicio' | 'Matriz de Diagnóstico' | 'Protocolo Somático';
    pages: string;
    description: string;
  }[];
  reflectiveQuestions?: string[];
  roadmapSteps?: WorkshopRoadmapStep[];
}

export type QuestionType =
  | 'textarea'
  | 'text'
  | 'rating_scale'
  | 'select'
  | 'boolean';

export interface QuestionnaireQuestion {
  id: string;
  questionnaireId: string;
  order: number;
  label: string;
  placeholder?: string;
  helperText?: string;
  type: QuestionType;
  required: boolean;
  category?: 'lingüístico' | 'emocional' | 'somático' | 'metodológico' | 'acuerdos' | 'general';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

export interface DynamicQuestionnaire {
  id: string;
  targetType: 'workshop_node' | 'session' | 'post_session' | 'general';
  targetStep?: number;
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
  updatedAt: string;
}

export type PulseFlag = 'Green' | 'Yellow' | 'Red';

export interface AIInsight {
  id: string;
  clientId: string;
  sessionId: string;
  sessionStep?: number;
  linguisticBarriers: string[] | string;
  limitingBeliefs?: string[];
  emotionalWisdom?: string; // Síntesis Ontológica & Sabiduría Emocional
  pulseFlag?: PulseFlag; // Indicador de estado: Green, Yellow, Red
  generatedAt: string;
  webhookStatus?: 'sent' | 'fallback' | 'pending';
  somaticIndicators?: string;
  recommendedShift?: string;
  powerfulQuestions?: string[];
  somaticScore?: number;
  confidenceScore?: number;
  confidenceLevel?: string;
}

export interface EventRegistration {
  id: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  icfTermsAccepted: boolean;
  privacyTermsAccepted: boolean;
  attendedEvent: boolean;
  userUid?: string;
  googleAuthConnected?: boolean;
}

export type EventCategory =
  | 'Conversatorio Quincenal'
  | 'Masterclass Ontológica'
  | 'Taller Vivencial'
  | 'Círculo de Liderazgo'
  | 'Programa de Acompañamiento'
  | 'Seminario Ejecutivo'
  | 'Primer Taller • En Vivo'
  | 'Taller de Apertura';

export interface OntologicalProgram {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  duration: string; // ej: "12 Semanas (6 Sesiones Quincenales)"
  format: '1 a 1 Ejecutivo' | 'Grupal / Cohorte' | 'Taller Intensivo' | 'Híbrido';
  fee: string; // "$1.500.000 COP"
  totalCapacity: number; // cupos máximos totales
  availableSpots: number; // cupos disponibles restantes
  enrolledCount?: number; // cantidad de participantes activos
  status: 'active' | 'enrolling' | 'completed' | 'draft' | string;
  description: string;
  keyOutcomes: string[];
  startDate?: string;
  displaySchedule?: string;
  facilitator?: string;
  totalNodes?: number;
}

export interface SyllabusBlock {
  id: string;
  title: string;
  duration?: string; // ej: "30 min"
  description: string;
}

export type SupportMaterialType = 'pdf' | 'video' | 'presentation' | 'guide' | 'link';

export interface SupportMaterial {
  id: string;
  title: string;
  type: SupportMaterialType;
  url: string;
  sizeOrDuration?: string;
  description?: string;
}

export interface PostWorkshopQuestion {
  id: string;
  question: string;
  type: 'textarea' | 'text' | 'rating_scale';
  placeholder?: string;
  category?: 'reflexion' | 'somatica' | 'compromiso' | 'evaluacion';
  required?: boolean;
}

export interface WorkshopWorkbookSubmission {
  id: string;
  eventId: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  submittedAt: string;
  answers: Record<string, string | number>;
  somaticObservation?: string;
  coachFeedback?: string;
}

export interface CronogramaEvent {
  id: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  eventType?: 'Taller' | 'Sesión' | 'Workshop' | 'Conversatorio' | 'Masterclass' | string;
  date: string; // ISO string
  displayDate: string; // "Jueves, 12 de Octubre"
  time: string; // "7:00 PM (GMT-5)"
  mode: 'Online (Google Meet)' | 'Presencial & Streaming' | 'Híbrido';
  meetUrl?: string;
  location?: string;
  description: string;
  imageUrl: string;
  coverImage?: string; // Alias or dedicated cover image
  showOnHome?: boolean; // Casilla: destacar en la portada principal de la app o mantener solo de forma interna
  capacityType?: 'individual' | 'grupal'; // Individual (1) o Grupal (varios)
  capacity?: number; // Límite numérico de participantes
  priceAmount?: number; // Precio / Valor numérico
  currency?: string; // ej: "COP"
  launchDate?: string; // Calendario de fecha de lanzamiento y convocatoria
  eventDate?: string; // Fecha de realización
  aiPromptUsed?: string;
  facilitator: string;
  spotsLeft: number;
  totalSpots: number;
  featured: boolean;
  status: 'upcoming' | 'live' | 'completed';
  price?: string;
  // Sección 2: Contenido y Temario
  syllabus?: SyllabusBlock[];
  guidingQuestions?: string[];
  supportMaterials?: SupportMaterial[];
  // Sección 3: Evaluación y Cuaderno Descargable
  postWorkshopQuestions?: PostWorkshopQuestion[];
  workbookSubmissions?: WorkshopWorkbookSubmission[];
}

export interface GoogleWorkspaceConfig {
  accountEmail: string; // rengifobastoco@gmail.com
  isConnected: boolean;
  accessToken?: string;
  tokenExpiresAt?: number;
  lastConnectedAt?: string;
  drive: {
    enabled: boolean;
    rootFolderId?: string;
    rootFolderName: string;
    reportsFolderId?: string;
    sheetsFolderId?: string;
    formsFolderId?: string;
    autoSaveReports: boolean;
  };
  sheets: {
    enabled: boolean;
    masterSpreadsheetId?: string;
    masterSpreadsheetUrl?: string;
    lastSyncedAt?: string;
    autoSyncClients: boolean;
  };
  forms: {
    enabled: boolean;
    activeFormId?: string;
    activeFormUrl?: string;
    activeFormEditUrl?: string;
    lastGeneratedAt?: string;
    responsesCount?: number;
  };
  calendar: {
    enabled: boolean;
    calendarId: string;
    lastSyncedAt?: string;
    autoCreateMeet: boolean;
  };
}

export type WorkspaceDocumentCategory =
  | 'doc'
  | 'sheet'
  | 'slide'
  | 'form'
  | 'pdf_report'
  | 'client_summary'
  | 'folder'
  | 'knowledge_base';

export interface DriveExportedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  uploadedAt: string;
  sizeFormatted?: string;
  category: WorkspaceDocumentCategory;
  description?: string;
  tags?: string[];
  clientId?: string;
  clientName?: string;
  isBrainDocument?: boolean;
  contentSnippet?: string;
}

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: { email: string; displayName?: string }[];
}

export type PaymentMethodType = 'efectivo' | 'bre_b_nu' | 'transferencia' | 'pasarela';
export type PaymentApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  amount: string; // ej: "$500.000 COP"
  concept: string; // ej: "Desbloqueo Nivel II: Diseñando Conversaciones y Límites"
  targetStep: number; // 1 to 6
  planType: 'level' | 'full'; // Cuota nivel vs Programa Completo
  method: PaymentMethodType;
  proofImageUrl?: string; // Base64 de la imagen o URL
  whatsappContacted?: boolean;
  notes?: string;
  status: PaymentApprovalStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  openedSessionNumbers?: number[];
  openedSessionIds?: string[];
}

export interface ClientEmailLog {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  templateType?: 'welcome' | 'meet_invitation' | 'post_session' | 'payment_unlocked' | 'reactivation' | 'custom' | string;
  templateName?: string;
  subject: string;
  content?: string;
  bodyPreview?: string;
  sentAt: string;
  status: 'sent' | 'draft';
}

export interface AutomatedTriggerConfig {
  id: string;
  name: string;
  description: string;
  event: 'form_submitted' | 'payment_validated' | 'session_scheduled' | 'inactivity_detected';
  enabled: boolean;
  actions: string[];
  lastTriggeredAt?: string;
  executionsCount: number;
}

export interface PricingPackage {
  id: string;
  name: string;
  duration: string;
  targetAudience: string;
  sessionsCount: number;
  basePriceCOP: number;
  brebNuDiscountPercent: number; // e.g., 5%
  includes: string[];
  active: boolean;
}

