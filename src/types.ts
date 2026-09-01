export type UserRole = 'client' | 'coach';

export type PaymentStatus = 'Pago Único' | 'Cuota 1 de 2' | 'Completado';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  title?: string;
  phone?: string;
  joinedAt?: string;
  programProgress?: number; // 1 to 6 (sesión quincenal en el programa de 12 semanas)
  paymentStatus?: PaymentStatus;
  programName?: string;
  programFee?: string;
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

export interface ProgramNodeInfo {
  step: number; // 1 to 6
  weekLabel: string; // "Semanas 1-2", "Semanas 3-4", etc.
  level: 'Nivel I' | 'Nivel II' | 'Nivel III';
  levelTitle: string;
  sessionTitle: string;
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
}

export type PulseFlag = 'Green' | 'Yellow' | 'Red';

export interface AIInsight {
  id: string;
  clientId: string;
  sessionId: string;
  sessionStep?: number;
  linguisticBarriers: string[];
  limitingBeliefs: string[];
  emotionalWisdom: string; // Síntesis Ontológica & Sabiduría Emocional
  pulseFlag: PulseFlag; // Indicador de estado: Green, Yellow, Red
  generatedAt: string;
  webhookStatus?: 'sent' | 'fallback' | 'pending';
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
  | 'Círculo de Liderazgo';

export interface CronogramaEvent {
  id: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  date: string; // ISO string
  displayDate: string; // "Jueves, 12 de Octubre"
  time: string; // "7:00 PM (GMT-5)"
  mode: 'Online (Google Meet)' | 'Presencial & Streaming';
  meetUrl?: string;
  description: string;
  imageUrl: string;
  aiPromptUsed?: string;
  facilitator: string;
  spotsLeft: number;
  totalSpots: number;
  featured: boolean;
  status: 'upcoming' | 'live' | 'completed';
}

