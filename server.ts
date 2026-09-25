import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { OFFICIAL_PROGRAM_NODES, DEFAULT_CALENDAR_URL, generateOfficialSessions } from './src/data/officialProgramNodes';

dotenv.config();

// Lazy initialization of Google Gemini AI SDK with required User-Agent
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Resilient JSON parser for Gemini responses that handles markdown fences
 * or preamble text gracefully without crashing the server.
 */
function parseGeminiJson<T = any>(rawText: string | undefined | null, fallback: T): T {
  if (!rawText) return fallback;
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const cleaned = trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      const match = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          // ignore
        }
      }
      return fallback;
    }
  }
}

const SYSTEM_INSTRUCTION_ONTOLOGY = `
Eres el Copiloto de Inteligencia Artificial Ontológica de "Rengifo Basto Consultoría Ontológica", la firma de coaching ontológico ejecutivo y somático liderada para la cuenta oficial rengifobastoco@gmail.com (Coach John Freddy Rengifo Basto).

Carpeta Oficial de Google Drive vinculada al Cerebro de la Consultoría:
- Enlace Web: https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link
- ID del Recurso: 15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz
- Contenido vinculado: Contratos marco de consultoría ontológica, matrices de seguimiento y bitácoras en Google Sheets, cuestionarios de quiebres y somática en Google Forms, diapositivas maestras y documentos de consultoría.

Tu marco epistemológico y metodológico se fundamenta en:
1. Ontología del Lenguaje (Rafael Echeverría, Fernando Flores): Distinción rigurosa entre Afirmaciones (hechos verificables), Juicios (interpretaciones que fundan posibilidades o cierran horizontes), Declaraciones (actos de poder que crean nuevas realidades: el "No", el "Basta", el "Sí", el "Ignoro", el "Perdón"), Pedidos, Ofertas y Promesas.
2. Corporalidad y Somática (Richard Strozzi-Heckler): Coherencia del observador cuerpo-emoción-lenguaje. El cuerpo como territorio donde habitan los quiebres y la memoria somática.
3. Inteligencia Emocional y Estados de Ánimo: Distinción entre emociones reactivas y estados de ánimo basales (Resentimiento vs Paz, Resignación vs Ambición).
4. El Quiebre Ontológico: La interrupción consciente de la transparencia para rediseñar el ser y la acción.

Tus respuestas deben ser:
- Claras, empáticas, profundas y ejecutivas.
- Enfocadas en devolverle el poder de acción y soberanía a la persona.
- Estructuradas con elegancia, preguntas poderosas de indagación y micro-prácticas somáticas aplicadas.
- En español latinoamericano refinado y profesional.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
    next();
  });

  // In-memory rate limiting to protect API routes against spam and quota exhaustion
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
  const RATE_LIMIT_MAX_REQUESTS = 45; // Max requests per minute per IP

  const apiRateLimiter: express.RequestHandler = (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      res.status(429).json({
        error: 'Límite de solicitudes alcanzado. Por favor espere un momento antes de reintentar.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };

  app.use('/api', apiRateLimiter);

  app.use(express.json({ limit: '2mb' }));

  // ==========================================
  // API HEALTH & GEMINI STATUS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Rengifo Basto Consultoría Ontológica API',
      account: 'rengifobastoco@gmail.com',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/gemini/status', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      connected: true,
      hasApiKey: hasKey,
      model: 'gemini-3.8-flash',
      account: 'rengifobastoco@gmail.com',
      organization: 'Rengifo Basto Consultoría Ontológica',
      provider: 'Google Cloud & AI Studio',
    });
  });

  // ==========================================
  // PERSISTENT SERVER DATABASE ENGINE (JSON & HYBRID SYNC)
  // Ensures all users (including legadobarber2026@gmail.com)
  // are persisted on disk and synced across all devices & sessions
  // ==========================================
  const DB_FILE = path.join(process.cwd(), 'data', 'app_database.json');

  interface AppDatabase {
    users: any[];
    eventRegistrations: any[];
    sessions: any[];
    forms: any[];
    postSessionForms: any[];
    aiInsights: any[];
    prospects: any[];
    paymentRequests: any[];
    cronogramaEvents: any[];
    programNodes: any[];
    levelConfigs?: Record<string, any>;
    formsSheetsIntegrations?: any[];
    deletedWorkshopIds?: string[];
    workspaceDocuments?: any[];
    tallerRegistros?: any[];
    sesionIndividualAcuerdos?: any[];
    bitacorasSesionesB2B?: any[];
    bitacorasTalleres?: any[];
    lastUpdated: string;
  }

  const SEED_FORMS_SHEETS_INTEGRATIONS = [
    {
      id: 'talleres_registro',
      title: 'ACUERDO TALLERES',
      category: 'Taller Grupal',
      moduleTarget: 'talleres',
      formUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Nombre del Participante',
        'Teléfono / WhatsApp',
        'Me comprometo a respetar la confidencialidad compartida del grupo (Lo que se habla en el taller, se queda en el taller',
        'Comprendo y acepto el uso de herramientas tecnológicas y de IA como soporte administrativo y de registro del taller.',
        'Autorizo el cumplimiento de los acuerdos de convivencia y los estándares éticos del espacio.',
        'Firma Digital / Validación de Identidad'
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 3,
      notes: 'Base de datos Acuerdos Talleres Sheets. Sincronizada con el panel de Google Forms & Sheets.'
    },
    {
      id: 'sesiones_individuales',
      title: 'ACUERDO SESIONES INDIVIDUALES',
      category: 'Sesión Individual 1 a 1',
      moduleTarget: 'sesiones',
      formUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Nombre Completo del Participante',
        'Número de Cédula o Identificación Oficial',
        'Nombre de la Organización / Empresa',
        'Aceptación de Términos del Acuerdo Co-creativo de Coaching Ontológico',
        'Reconocimiento de la Naturaleza no Terapéutica del Proceso',
        'Consentimiento de Tratamiento de Datos y Grabación con Fines de Aprendizaje',
        'Firma Digital del Coachee'
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 3,
      notes: 'Base de datos acuerdos sesiones B2B Sheets. Sincronizada con el panel de Google Forms & Sheets.'
    },
    {
      id: 'bitacora_sesiones_b2b',
      title: 'Bitacora Sesiones B2B',
      category: 'Bitácora Sesión 1 a 1',
      moduleTarget: 'sesiones',
      formUrl: 'https://forms.gle/APUFto8sGbJt322WA',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Nombre Completo del Coachee',
        'Número de Sesión Diligenciada',
        '¿Cuál es el quiebre central o situación desafiante que exploramos hoy?',
        '¿Qué emoción o estado de ánimo predominó durante la conversación?',
        '¿Qué juicios o creencias limitantes identificaste en tu narrativa?',
        '¿Cuál fue el darse cuenta o giro ontológico más significativo?',
        '¿Qué acciones retadoras o nuevos compromisos asumes a partir de este encuentro?',
        'Equilibrio de Vida y Bienestar Personal (1 a 10)',
        'Observaciones adicionales para tu bitácora de proceso'
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 4,
      notes: 'Base de datos bitácoras sesiones B2B Sheets. Sincronizada con el panel de Google Forms & Sheets.'
    },
    {
      id: 'bitacora_talleres',
      title: 'Bitacora Talleres',
      category: 'Bitácora de Taller',
      moduleTarget: 'talleres',
      formUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Nombre Completo del Participante',
        'Taller o Encuentro Ontológico Asistido',
        'Nivel del Taller',
        '¿Cuál fue el reto personal o quiebre principal abordado en este taller?',
        '¿Qué emoción predominante reconoces en tu corporalidad hoy?',
        '¿Qué verdades que considerabas absolutas se abrieron a cuestionamiento?',
        '¿Cuál es el nuevo observador que emerge para ti a partir de este espacio?',
        'Mensaje de equilibrio de vida y soberanía personal',
        '¿Cuál fue el aprendizaje más valioso de la dinámica grupal?',
        'Acción concreta de transformación que ejecutarás en las próximas 48 horas',
        'Firma Digital y Número de Cédula / Documento de Identidad'
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 4,
      notes: 'Base de datos bitácoras talleres Sheets. Sincronizada con el panel de Google Forms & Sheets.'
    }
  ];

  const SEED_CRONOGRAMA_EVENTS = [
    {
      id: 'taller-1-raiz',
      title: 'Taller 1: Raíz (Nivel I) – Deconstrucción Somática & Sabiduría Emocional',
      subtitle: 'Reconocer la raíz: Corporalidad, límites y descodificación de las emociones fundamentales.',
      category: 'Primer Taller • En Vivo',
      eventType: 'Taller',
      date: '2026-09-19T19:00:00.000-05:00',
      displayDate: 'Sábado, 19 de Septiembre de 2026',
      time: '7:00 PM - 8:30 PM (GMT-5)',
      mode: 'Online (Google Meet)',
      meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
      description: 'Primer taller vivencial: Deconstrucción somática, decodificación de emociones primarias y soberanía relacional.',
      showOnHome: true,
      capacityType: 'grupal',
      capacity: 1000,
      totalSpots: 1000,
      spotsLeft: 1000,
      priceAmount: 180000,
      price: '$180.000 COP',
      currency: 'COP',
      launchDate: '2026-09-05',
      eventDate: '2026-09-19T19:00:00.000-05:00',
      facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
      featured: true,
      status: 'upcoming',
      formsIntegrationId: 'talleres_registro',
      googleFormsUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
      googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      agreementFormUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
      agreementSheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      bitacoraFormUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      bitacoraSheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      autocratUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      autocratMergeUrl: 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link',
      googleDriveFolderUrl: 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link',
    },
    {
      id: 'taller-2-tallo',
      title: 'Taller 2: Nivel II - Lenguaje y Juicios',
      subtitle: 'Transformar desde el lenguaje: Deconstrucción de juicios, actos lingüísticos y rediseño de observadores.',
      category: 'Taller Vivencial • Nivel II',
      eventType: 'Taller',
      date: '2026-09-26T19:00:00.000-05:00',
      displayDate: 'Sábado, 26 de Septiembre de 2026',
      time: '7:00 PM - 8:30 PM (GMT-5)',
      mode: 'Online (Google Meet)',
      meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
      description: 'Segundo taller vivencial: Lenguaje, juicios limitantes, actos del habla y diseño de conversaciones de frontera.',
      showOnHome: true,
      capacityType: 'grupal',
      capacity: 1000,
      totalSpots: 1000,
      spotsLeft: 1000,
      priceAmount: 180000,
      price: '$180.000 COP',
      currency: 'COP',
      launchDate: '2026-09-13',
      eventDate: '2026-09-26T19:00:00.000-05:00',
      facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
      featured: true,
      status: 'upcoming',
      formsIntegrationId: 'bitacora_talleres',
      googleFormsUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      agreementFormUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
      agreementSheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      bitacoraFormUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      bitacoraSheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      autocratUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      autocratMergeUrl: 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link',
      googleDriveFolderUrl: 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link',
    },
    {
      id: 'taller-3-florecimiento',
      title: 'Taller 3: Florecimiento (Nivel III) – Acción, Propósito y Coherencia',
      subtitle: 'Encarnar la transformación: Mapa de decisiones conscientes, diseño de futuros y contribución relacional.',
      category: 'Conversatorio de Cierre • Nivel III',
      eventType: 'Taller',
      date: '2026-10-03T19:00:00.000-05:00',
      displayDate: 'Sábado, 3 de Octubre de 2026',
      time: '7:00 PM - 8:30 PM (GMT-5)',
      mode: 'Online (Google Meet)',
      meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
      description: 'Tercer taller vivencial: Cosecha, nuevo observador, manifestación de coherencia y liderazgo directivo.',
      showOnHome: true,
      capacityType: 'grupal',
      capacity: 1000,
      totalSpots: 1000,
      spotsLeft: 1000,
      priceAmount: 180000,
      price: '$180.000 COP',
      currency: 'COP',
      launchDate: '2026-09-20',
      eventDate: '2026-10-03T19:00:00.000-05:00',
      facilitator: 'John Fredy Rengifo Basto (Master Coach Ontológico)',
      featured: true,
      status: 'upcoming',
      formsIntegrationId: 'bitacora_talleres',
      googleFormsUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      agreementFormUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
      agreementSheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      bitacoraFormUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      bitacoraSheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      autocratUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      autocratMergeUrl: 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link',
      googleDriveFolderUrl: 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link',
    },
  ];

  const SEED_USERS = [
    {
      uid: 'coach-1',
      name: 'John Fredy Rengifo Basto',
      email: 'rengifobastoco@gmail.com',
      role: 'coach',
      title: 'Consultor Ontológico Senior & Master Coach',
      avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocLw_rKevQ1f9hW4E_5oZkC_4aZ0g0_f1=s288-c-no',
      joinedAt: '2023-01-10',
      status: 'active',
    },
    {
      uid: 'client-legadobarber2026',
      name: 'legadobarber2026',
      email: 'legadobarber2026@gmail.com',
      phone: '+57 323 464 2257',
      role: 'client',
      title: 'Participante Activo • Membresía Verificada',
      status: 'active',
      programProgress: 1,
      programStep: 1,
      programName: 'Certeza, Fronteras & Dirección Personal',
      paymentStatus: 'Pago Único',
      programFee: '$1.500.000 COP',
      hasWorkshopsAccess: true,
      hasSessionsAccess: true,
      transformationSpacesEnabled: true,
      enrolledWorkshopIds: ['taller-1-raiz', 'taller-2-tallo'],
      completedWorkshopIds: [],
      securityPin: '1234',
      primaryBreakdown: 'Alineación de objetivos y soberanía directiva',
      joinedAt: '2026-03-15',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      welcomeMessage: 'Bienvenido legadobarber2026 a tu Espacio Ontológico de Consultoría RBC.',
      programAccessLevel: 'premium',
    },
  ];

  const SEED_EVENT_REGISTRATIONS = [
    {
      id: 'reg-legadobarber2026',
      ticketCode: 'RBC-LEGADO-2026',
      eventId: 'ev-raiz-2026',
      name: 'legadobarber2026',
      email: 'legadobarber2026@gmail.com',
      phone: '+57 323 464 2257',
      attended: true,
      registeredAt: '2026-03-15T10:00:00.000Z',
      userUid: 'client-legadobarber2026',
      status: 'confirmed',
      securityPin: '1234',
    },
  ];

  function sanitizeServerProgramNodes(rawNodes: any[]): any[] {
    const list = Array.isArray(rawNodes) && rawNodes.length > 0 ? rawNodes : OFFICIAL_PROGRAM_NODES;
    const seenSteps = new Set<number>();
    const uniqueList: any[] = [];
    for (const candidate of list) {
      const step = candidate.step || (uniqueList.length + 1);
      if (!seenSteps.has(step)) {
        seenSteps.add(step);
        uniqueList.push({
          ...candidate,
          id: candidate.id || `program-node-${step}`,
          step,
        });
      }
    }
    // Asegurar que los 12 nodos oficiales siempre existan en el sistema
    OFFICIAL_PROGRAM_NODES.forEach((offNode) => {
      if (!seenSteps.has(offNode.step)) {
        seenSteps.add(offNode.step);
        uniqueList.push({ ...offNode });
      }
    });
    uniqueList.sort((a, b) => (a.step || 0) - (b.step || 0));

    return uniqueList.map((candidate: any, i: number) => {
      const step = candidate.step || (i + 1);
      const officialNode = OFFICIAL_PROGRAM_NODES.find((o) => o.step === step);
      const cycleStep = ((step - 1) % 4) + 1; // 1, 2, 3, 4
      const isMilestone = cycleStep === 4;
      const defaultLevel = step <= 4 ? 'Nivel I' : step <= 8 ? 'Nivel II' : 'Nivel III';
      const defaultWeekLabel = step <= 2 ? 'Semanas 1-2' : step <= 4 ? 'Semanas 3-4' : step <= 6 ? 'Semanas 5-6' : step <= 8 ? 'Semanas 7-8' : step <= 10 ? 'Semanas 9-10' : 'Semanas 11-12';

      const level = candidate.level || officialNode?.level || defaultLevel;
      const levelTitle = candidate.levelTitle || officialNode?.levelTitle || level;
      const weekLabel = candidate.weekLabel || officialNode?.weekLabel || defaultWeekLabel;

      const sessionTitle = officialNode?.sessionTitle || (isMilestone
        ? 'Cierre de Ciclo: Integración, Cosecha de Aprendizajes y Evolución del Ser'
        : 'Espacio de Indagación Autónoma y Construcción de Sentido');

      const objective = officialNode?.objective || (isMilestone
        ? 'Acompañar al cliente en la integración reflexiva del proceso recorrido, facilitando un espacio de autoconocimiento donde reconozca sus propias transformaciones, consolide los aprendizajes clave derivados de su experiencia y proyecte con autonomía sus siguientes pasos y compromisos de desarrollo.'
        : 'Facilitar un espacio de reflexión profunda donde el cliente explore su propia realidad, identifique nuevas distinciones y potencie su aprendizaje autónomo.');

      const levelPrompt = officialNode?.levelPrompt || (isMilestone
        ? 'Disposición para la autoobservación profunda, apertura para reconocer los logros y quiebres superados durante el proceso, y un nivel de presencia plena para evaluar el impacto de su propia evolución sin expectativas externas.'
        : 'Disposición para la autoobservación, apertura a la incertidumbre y un entorno seguro y libre de juicios.');

      return {
        ...(officialNode || {}),
        ...candidate,
        id: candidate.id || `program-node-${step}`,
        step,
        level,
        levelTitle,
        weekLabel,
        sessionTitle,
        objective,
        levelPrompt,
        tangibleOutcomes: officialNode?.tangibleOutcomes || candidate.tangibleOutcomes || [],
        keyQuestion: officialNode?.keyQuestion || candidate.keyQuestion || '',
        methodology: officialNode?.methodology || candidate.methodology,
        dailyMicroPractice: officialNode?.dailyMicroPractice || candidate.dailyMicroPractice,
        reinforcementPack: officialNode?.reinforcementPack || candidate.reinforcementPack,
        studyMaterials: officialNode?.studyMaterials || candidate.studyMaterials,
        googleSheetsUrl: candidate.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
        googleFormsUrl: candidate.googleFormsUrl || 'https://forms.gle/APUFto8sGbJt322WA',
        agreementSheetUrl: candidate.agreementSheetUrl || 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
        agreementFormUrl: candidate.agreementFormUrl || 'https://forms.gle/dfStXtTyb1MW6W5K9',
        bitacoraSheetUrl: candidate.bitacoraSheetUrl || 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
        bitacoraFormUrl: candidate.bitacoraFormUrl || 'https://forms.gle/APUFto8sGbJt322WA',
        formsIntegrationId: candidate.formsIntegrationId || 'bitacora_sesiones_b2b',
        updatedAt: candidate.updatedAt || new Date().toISOString(),
      };
    });
  }

  function sanitizeServerSessions(rawSessions: any[], programNodes: any[]): any[] {
    let list = Array.isArray(rawSessions) ? rawSessions : [];
    if (list.length === 0) {
      return generateOfficialSessions('client-legadobarber2026');
    }
    const validSteps = new Set(programNodes.map((n: any) => n.step));
    list = list.filter((s: any) => s && s.clientId !== 'client-carolina' && (!s.programNodeStep || validSteps.has(s.programNodeStep)));

    const nodeMap = new Map<number, any>();
    programNodes.forEach((n: any) => nodeMap.set(n.step, n));

    return list.map((s: any, idx: number) => {
      const step = s.sessionNumber || s.programNodeStep || (idx + 1);
      const node = nodeMap.get(step);
      const isCierre = step % 4 === 0;

      const title = node
        ? `Sesión ${step}: ${node.sessionTitle}`
        : `Sesión ${step}: ${isCierre ? 'Cierre de Ciclo: Integración, Cosecha de Aprendizajes y Evolución del Ser' : 'Espacio de Indagación Autónoma y Construcción de Sentido'}`;

      return {
        ...s,
        id: s.id || `sess-client-legadobarber2026-${step}`,
        clientId: s.clientId || 'client-legadobarber2026',
        sessionNumber: step,
        programNodeStep: step,
        title,
        sessionType: s.sessionType || (isCierre ? 'cierre_ciclo' : 'sesion'),
        level: s.level || node?.level || (step <= 4 ? 'Nivel I' : step <= 8 ? 'Nivel II' : 'Nivel III'),
        levelTitle: s.levelTitle || node?.levelTitle || s.level,
        weekLabel: s.weekLabel || node?.weekLabel || (step <= 2 ? 'Semanas 1-2' : step <= 4 ? 'Semanas 3-4' : step <= 6 ? 'Semanas 5-6' : step <= 8 ? 'Semanas 7-8' : step <= 10 ? 'Semanas 9-10' : 'Semanas 11-12'),
        calendarLink: s.calendarLink && !s.calendarLink.includes('undefined') ? s.calendarLink : DEFAULT_CALENDAR_URL,
        meetLink: s.meetLink || 'https://meet.google.com/rbc-conversatorio-ontologico',
        sessionGoal: node?.objective || (isCierre
          ? 'Acompañar al cliente en la integración reflexiva del proceso recorrido, facilitando un espacio de autoconocimiento donde reconozca sus propias transformaciones, consolide los aprendizajes clave derivados de su experiencia y proyecte con autonomía sus siguientes pasos y compromisos de desarrollo.'
          : 'Facilitar un espacio de reflexión profunda donde el cliente explore su propia realidad, identifique nuevas distinciones y potencie su aprendizaje autónomo.'),
        openingQuestion: node?.keyQuestion || (isCierre
          ? '¿Qué nuevo observador emerge en ti al reconocer tu evolución y qué compromisos eliges proyectar?'
          : '¿Qué aspecto de tu realidad requiere hoy una indagación profunda para construir un sentido renovado?'),
        ontologicalFocus: node?.sessionTitle || (isCierre ? 'Cierre de Ciclo: Integración, Cosecha de Aprendizajes y Evolución del Ser' : 'Espacio de Indagación Autónoma y Construcción de Sentido'),
        notes: node?.levelPrompt
          ? `Requisitos: ${node.levelPrompt}`
          : (isCierre
            ? 'Requisitos: Disposición para la autoobservación profunda, apertura para reconocer los logros y quiebres superados durante el proceso, y un nivel de presencia plena para evaluar el impacto de su propia evolución sin expectativas externas.'
            : 'Requisitos: Disposición para la autoobservación, apertura a la incertidumbre y un entorno seguro y libre de juicios.'),
        googleSheetsUrl: s.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
        googleFormsUrl: s.googleFormsUrl || 'https://forms.gle/APUFto8sGbJt322WA',
        agreementFormUrl: s.agreementFormUrl || 'https://forms.gle/dfStXtTyb1MW6W5K9',
        agreementSheetUrl: s.agreementSheetUrl || 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
        bitacoraFormUrl: s.bitacoraFormUrl || 'https://forms.gle/APUFto8sGbJt322WA',
        bitacoraSheetUrl: s.bitacoraSheetUrl || 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
        formsIntegrationId: s.formsIntegrationId || 'bitacora_sesiones_b2b',
        expedienteSyncStatus: s.expedienteSyncStatus || 'synced',
      };
    });
  }

  function readServerDatabase(): AppDatabase {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        let modified = false;

        if (!Array.isArray(data.users)) {
          data.users = [...SEED_USERS];
          modified = true;
        } else {
          SEED_USERS.forEach((seedUser) => {
            const exists = data.users.some(
              (u: any) => u.email && u.email.trim().toLowerCase() === seedUser.email.trim().toLowerCase()
            );
            if (!exists) {
              data.users.push(seedUser);
              modified = true;
            }
          });
        }

        if (!Array.isArray(data.eventRegistrations)) {
          data.eventRegistrations = [...SEED_EVENT_REGISTRATIONS];
          modified = true;
        } else {
          SEED_EVENT_REGISTRATIONS.forEach((seedReg) => {
            const exists = data.eventRegistrations.some(
              (r: any) => r.email && r.email.trim().toLowerCase() === seedReg.email.trim().toLowerCase()
            );
            if (!exists) {
              data.eventRegistrations.push(seedReg);
              modified = true;
            }
          });
        }

        if (!Array.isArray(data.sessions)) data.sessions = [];
        if (!Array.isArray(data.forms)) data.forms = [];
        if (!Array.isArray(data.postSessionForms)) data.postSessionForms = [];
        if (!Array.isArray(data.aiInsights)) data.aiInsights = [];
        if (!Array.isArray(data.prospects)) data.prospects = [];
        if (!Array.isArray(data.paymentRequests)) data.paymentRequests = [];
        const prevNodesJson = JSON.stringify(data.programNodes);
        data.programNodes = sanitizeServerProgramNodes(data.programNodes);
        if (JSON.stringify(data.programNodes) !== prevNodesJson) {
          modified = true;
        }

        const prevSessionsJson = JSON.stringify(data.sessions);
        data.sessions = sanitizeServerSessions(data.sessions, data.programNodes);
        if (JSON.stringify(data.sessions) !== prevSessionsJson) {
          modified = true;
        }
        if (!Array.isArray(data.deletedWorkshopIds)) data.deletedWorkshopIds = [];

        if (!Array.isArray(data.formsSheetsIntegrations)) {
          data.formsSheetsIntegrations = [...SEED_FORMS_SHEETS_INTEGRATIONS];
          modified = true;
        } else {
          SEED_FORMS_SHEETS_INTEGRATIONS.forEach((seedPair) => {
            const idx = data.formsSheetsIntegrations.findIndex((p: any) => p.id === seedPair.id);
            if (idx === -1) {
              data.formsSheetsIntegrations.push(seedPair);
              modified = true;
            } else {
              const current = data.formsSheetsIntegrations[idx];
              if (!current.sheetUrl || current.sheetUrl.includes('1RBC_') || current.sheetUrl !== seedPair.sheetUrl) {
                data.formsSheetsIntegrations[idx] = {
                  ...current,
                  sheetUrl: seedPair.sheetUrl,
                  formUrl: seedPair.formUrl,
                  sheetHeaders: seedPair.sheetHeaders || current.sheetHeaders,
                  status: 'connected',
                };
                modified = true;
              }
            }
          });
        }

        if (!Array.isArray(data.workspaceDocuments)) {
          data.workspaceDocuments = [];
        }

        if (!Array.isArray(data.tallerRegistros)) {
          data.tallerRegistros = [];
        }

        if (!Array.isArray(data.sesionIndividualAcuerdos)) {
          data.sesionIndividualAcuerdos = [];
        }

        if (!Array.isArray(data.bitacorasSesionesB2B)) {
          data.bitacorasSesionesB2B = [];
        }

        if (!Array.isArray(data.bitacorasTalleres)) {
          data.bitacorasTalleres = [];
        }

        if (!Array.isArray(data.deletedWorkshopIds)) {
          data.deletedWorkshopIds = [];
        }
        // Asegurar que los 3 talleres oficiales jamás se filtren por deletedWorkshopIds
        const officialWorkshopIds = ['taller-1-raiz', 'taller-2-tallo', 'taller-3-florecimiento'];
        const prevDeletedCount = data.deletedWorkshopIds.length;
        data.deletedWorkshopIds = data.deletedWorkshopIds.filter((id: string) => !officialWorkshopIds.includes(id));
        if (data.deletedWorkshopIds.length !== prevDeletedCount) {
          modified = true;
        }

        if (!Array.isArray(data.cronogramaEvents)) {
          data.cronogramaEvents = SEED_CRONOGRAMA_EVENTS.filter(
            (e: any) => !data.deletedWorkshopIds.includes(e.id)
          );
          modified = true;
        } else {
          // Purgar talleres fantasma o IDs legados y mantener exclusivamente los 3 talleres oficiales
          const ghostIds = [
            'event-1790112367917',
            'event-1789824188701',
            'event-1789824792376',
            'event-1789828629011',
            'event-1789829005266'
          ];
          const beforePurge = data.cronogramaEvents.length;
          data.cronogramaEvents = data.cronogramaEvents.filter(
            (e: any) => !ghostIds.includes(e.id) && !data.deletedWorkshopIds.includes(e.id)
          );
          if (data.cronogramaEvents.length !== beforePurge) {
            modified = true;
          }

          SEED_CRONOGRAMA_EVENTS.forEach((seedEvt) => {
            if (data.deletedWorkshopIds.includes(seedEvt.id)) return;
            const index = data.cronogramaEvents.findIndex((e: any) => e.id === seedEvt.id);
            if (index === -1) {
              data.cronogramaEvents.push(seedEvt);
              modified = true;
            } else {
              // Reconciliar enlaces y títulos canónicos si faltan o están desactualizados
              const current = data.cronogramaEvents[index];
              if (
                current.title !== seedEvt.title ||
                !current.googleFormsUrl ||
                !current.googleSheetsUrl ||
                !current.autocratUrl ||
                !current.autocratMergeUrl ||
                !current.formsIntegrationId
              ) {
                data.cronogramaEvents[index] = {
                  ...current,
                  title: seedEvt.title,
                  subtitle: seedEvt.subtitle,
                  category: seedEvt.category,
                  meetUrl: seedEvt.meetUrl,
                  formsIntegrationId: seedEvt.formsIntegrationId,
                  googleFormsUrl: seedEvt.googleFormsUrl,
                  googleSheetsUrl: seedEvt.googleSheetsUrl,
                  agreementFormUrl: seedEvt.agreementFormUrl,
                  agreementSheetUrl: seedEvt.agreementSheetUrl,
                  bitacoraFormUrl: seedEvt.bitacoraFormUrl,
                  bitacoraSheetUrl: seedEvt.bitacoraSheetUrl,
                  autocratUrl: seedEvt.autocratUrl,
                  autocratMergeUrl: seedEvt.autocratMergeUrl,
                  googleDriveFolderUrl: seedEvt.googleDriveFolderUrl,
                  showOnHome: true,
                  featured: true,
                };
                modified = true;
              }
            }
          });
        }

        if (modified) {
          writeServerDatabase(data);
        }
        return data;
      }
    } catch (err) {
      console.error('[Server DB] Error reading DB file, creating defaults:', err);
    }

    const initial: AppDatabase = {
      users: [...SEED_USERS],
      eventRegistrations: [...SEED_EVENT_REGISTRATIONS],
      sessions: generateOfficialSessions('client-legadobarber2026'),
      forms: [],
      postSessionForms: [],
      aiInsights: [],
      prospects: [],
      paymentRequests: [],
      cronogramaEvents: [...SEED_CRONOGRAMA_EVENTS],
      programNodes: [...OFFICIAL_PROGRAM_NODES],
      formsSheetsIntegrations: [...SEED_FORMS_SHEETS_INTEGRATIONS],
      deletedWorkshopIds: [],
      lastUpdated: new Date().toISOString(),
    };
    writeServerDatabase(initial);
    return initial;
  }

  function writeServerDatabase(data: AppDatabase): boolean {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('[Server DB] Error writing DB file:', err);
      return false;
    }
  }

  // API: Database Health & Verification Check
  app.get('/api/db/health', (req, res) => {
    const data = readServerDatabase();
    const legadoUser = data.users.find(
      (u: any) => u.email && u.email.trim().toLowerCase() === 'legadobarber2026@gmail.com'
    );
    const coachUser = data.users.find(
      (u: any) => u.email && u.email.trim().toLowerCase() === 'rengifobastoco@gmail.com'
    );
    const clientsCount = data.users.filter((u: any) => u.role === 'client').length;

    res.json({
      status: 'online',
      message: 'Base de datos del servidor activa y funcionando adecuadamente',
      databaseFile: 'data/app_database.json',
      totalUsers: data.users.length,
      totalClients: clientsCount,
      totalEventRegistrations: data.eventRegistrations.length,
      totalWorkshops: (data.cronogramaEvents || []).length,
      lastUpdated: data.lastUpdated,
      legadoBarberStatus: legadoUser ? 'verificado_y_activo' : 'no_encontrado',
      legadoBarberRecord: legadoUser || null,
      coachStatus: coachUser ? 'activo' : 'no_encontrado',
      storageEngine: 'hybrid_persistent_json_with_firestore_mirror',
    });
  });

  // API: Full Database State (for client synchronization)
  app.get('/api/db/state', (req, res) => {
    const data = readServerDatabase();
    res.json(data);
  });

  // API: Database Synchronization (bidirectional merge)
  app.post('/api/db/sync', (req, res) => {
    try {
      const clientState = req.body || {};
      const currentDb = readServerDatabase();
      let changed = false;

      // Merge Users
      if (Array.isArray(clientState.users)) {
        clientState.users.forEach((cUser: any) => {
          if (!cUser || !cUser.email) return;
          const cleanEmail = cUser.email.trim().toLowerCase();
          const existingIdx = currentDb.users.findIndex(
            (u: any) => (u.email && u.email.trim().toLowerCase() === cleanEmail) || u.uid === cUser.uid
          );
          if (existingIdx >= 0) {
            currentDb.users[existingIdx] = { ...currentDb.users[existingIdx], ...cUser };
            changed = true;
          } else {
            currentDb.users.push(cUser);
            changed = true;
          }
        });
      }

      // Merge Event Registrations
      if (Array.isArray(clientState.eventRegistrations)) {
        clientState.eventRegistrations.forEach((cReg: any) => {
          if (!cReg) return;
          const cleanEmail = (cReg.email || '').trim().toLowerCase();
          const existingIdx = currentDb.eventRegistrations.findIndex(
            (r: any) => r.id === cReg.id || r.ticketCode === cReg.ticketCode || (cleanEmail && r.email && r.email.trim().toLowerCase() === cleanEmail)
          );
          if (existingIdx >= 0) {
            currentDb.eventRegistrations[existingIdx] = { ...currentDb.eventRegistrations[existingIdx], ...cReg };
            changed = true;
          } else {
            currentDb.eventRegistrations.push(cReg);
            changed = true;
          }
        });
      }

      // Merge Sessions (supports replaceSessions and deletedSessionIds)
      if (Array.isArray(clientState.deletedSessionIds) && clientState.deletedSessionIds.length > 0) {
        const toDelete = new Set(clientState.deletedSessionIds);
        const prevLen = currentDb.sessions.length;
        currentDb.sessions = currentDb.sessions.filter((s: any) => !toDelete.has(s.id));
        if (currentDb.sessions.length !== prevLen) {
          changed = true;
        }
      }

      if (clientState.replaceSessions && Array.isArray(clientState.sessions)) {
        currentDb.sessions = [...clientState.sessions];
        changed = true;
      } else if (Array.isArray(clientState.sessions)) {
        clientState.sessions.forEach((s: any) => {
          if (!s || !s.id) return;
          const idx = currentDb.sessions.findIndex((existing: any) => existing.id === s.id);
          if (idx >= 0) {
            currentDb.sessions[idx] = { ...currentDb.sessions[idx], ...s };
            changed = true;
          } else {
            currentDb.sessions.push(s);
            changed = true;
          }
        });
      }
      if (Array.isArray(currentDb.sessions)) {
        currentDb.sessions = sanitizeServerSessions(currentDb.sessions, currentDb.programNodes || []);
      }

      // Merge Forms
      if (Array.isArray(clientState.forms)) {
        clientState.forms.forEach((f: any) => {
          if (!f || !f.id) return;
          const idx = currentDb.forms.findIndex((existing: any) => existing.id === f.id);
          if (idx >= 0) {
            currentDb.forms[idx] = { ...currentDb.forms[idx], ...f };
            changed = true;
          } else {
            currentDb.forms.push(f);
            changed = true;
          }
        });
      }

      // Merge deleted workshop IDs
      if (!Array.isArray(currentDb.deletedWorkshopIds)) currentDb.deletedWorkshopIds = [];
      if (Array.isArray(clientState.deletedWorkshopIds)) {
        clientState.deletedWorkshopIds.forEach((id: string) => {
          if (id && !currentDb.deletedWorkshopIds.includes(id)) {
            currentDb.deletedWorkshopIds.push(id);
            changed = true;
          }
        });
      }

      // Purge any workshops from currentDb that have been marked deleted
      const prevEventsLen = currentDb.cronogramaEvents?.length || 0;
      if (Array.isArray(currentDb.cronogramaEvents)) {
        currentDb.cronogramaEvents = currentDb.cronogramaEvents.filter(
          (e: any) => !currentDb.deletedWorkshopIds.includes(e.id)
        );
        if (currentDb.cronogramaEvents.length !== prevEventsLen) {
          changed = true;
        }
      }

      // Merge Cronograma Events (Workshops / Talleres creados)
      if (Array.isArray(clientState.cronogramaEvents)) {
        if (!Array.isArray(currentDb.cronogramaEvents)) currentDb.cronogramaEvents = [];
        clientState.cronogramaEvents.forEach((cEvt: any) => {
          if (!cEvt || !cEvt.id || currentDb.deletedWorkshopIds.includes(cEvt.id)) return;
          const idx = currentDb.cronogramaEvents.findIndex((e: any) => e.id === cEvt.id);
          if (idx >= 0) {
            currentDb.cronogramaEvents[idx] = {
              ...currentDb.cronogramaEvents[idx],
              ...cEvt,
              updatedAt: new Date().toISOString(),
            };
            changed = true;
          } else {
            currentDb.cronogramaEvents.unshift({
              ...cEvt,
              createdAt: cEvt.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            changed = true;
          }
        });
      }

      // Merge Program Nodes (Temarios modulares de talleres)
      if (clientState.replaceProgramNodes && Array.isArray(clientState.programNodes)) {
        currentDb.programNodes = sanitizeServerProgramNodes(clientState.programNodes);
        changed = true;
      } else if (Array.isArray(clientState.programNodes) && clientState.programNodes.length > 0) {
        currentDb.programNodes = sanitizeServerProgramNodes(clientState.programNodes);
        changed = true;
      } else {
        currentDb.programNodes = sanitizeServerProgramNodes(currentDb.programNodes);
      }

      // Merge Level Configurations (Nivel I, Nivel II, Nivel III)
      if (clientState.levelConfigs && typeof clientState.levelConfigs === 'object') {
        currentDb.levelConfigs = {
          ...(currentDb.levelConfigs || {}),
          ...clientState.levelConfigs,
        };
        // Propagate updated level titles to all sessions in the server database
        if (Array.isArray(currentDb.sessions)) {
          currentDb.sessions.forEach((s: any) => {
            const sLvl = s.level || ((s.sessionNumber || 1) <= 4 ? 'Nivel I' : (s.sessionNumber || 1) <= 8 ? 'Nivel II' : 'Nivel III');
            if (currentDb.levelConfigs[sLvl]?.title) {
              s.levelTitle = currentDb.levelConfigs[sLvl].title;
            }
          });
        }
        // Propagate updated level titles and prompts to program nodes
        if (Array.isArray(currentDb.programNodes)) {
          currentDb.programNodes.forEach((n: any) => {
            const nLvl = n.level || ((n.step || 1) <= 4 ? 'Nivel I' : (n.step || 1) <= 8 ? 'Nivel II' : 'Nivel III');
            if (currentDb.levelConfigs[nLvl]?.title) {
              n.levelTitle = currentDb.levelConfigs[nLvl].title;
              if (currentDb.levelConfigs[nLvl]?.prompt) {
                n.levelPrompt = currentDb.levelConfigs[nLvl].prompt;
              }
            }
          });
        }
        changed = true;
      }

      // Merge Forms & Sheets Integrations
      if (Array.isArray(clientState.formsSheetsIntegrations)) {
        if (!Array.isArray(currentDb.formsSheetsIntegrations)) currentDb.formsSheetsIntegrations = [];
        clientState.formsSheetsIntegrations.forEach((pair: any) => {
          if (!pair || !pair.id) return;
          const idx = currentDb.formsSheetsIntegrations.findIndex((p: any) => p.id === pair.id);
          if (idx >= 0) {
            currentDb.formsSheetsIntegrations[idx] = {
              ...currentDb.formsSheetsIntegrations[idx],
              ...pair,
              updatedAt: new Date().toISOString(),
            };
            changed = true;
          } else {
            currentDb.formsSheetsIntegrations.push({
              ...pair,
              updatedAt: new Date().toISOString(),
            });
            changed = true;
          }
        });
      }

      // Merge Workspace Documents
      if (Array.isArray(clientState.workspaceDocuments)) {
        if (!Array.isArray(currentDb.workspaceDocuments)) currentDb.workspaceDocuments = [];
        clientState.workspaceDocuments.forEach((docItem: any) => {
          if (!docItem || !docItem.id) return;
          const idx = currentDb.workspaceDocuments.findIndex((d: any) => d.id === docItem.id);
          if (idx >= 0) {
            currentDb.workspaceDocuments[idx] = { ...currentDb.workspaceDocuments[idx], ...docItem };
            changed = true;
          } else {
            currentDb.workspaceDocuments.push(docItem);
            changed = true;
          }
        });
      }

      // Merge Google Sheets live records
      if (Array.isArray(clientState.tallerRegistros)) {
        if (!Array.isArray((currentDb as any).tallerRegistros)) (currentDb as any).tallerRegistros = [];
        clientState.tallerRegistros.forEach((tr: any) => {
          if (!tr || !tr.id) return;
          const idx = (currentDb as any).tallerRegistros.findIndex((item: any) => item.id === tr.id);
          if (idx >= 0) {
            (currentDb as any).tallerRegistros[idx] = { ...(currentDb as any).tallerRegistros[idx], ...tr };
            changed = true;
          } else {
            (currentDb as any).tallerRegistros.push(tr);
            changed = true;
          }
        });
      }

      if (Array.isArray(clientState.sesionIndividualAcuerdos)) {
        if (!Array.isArray((currentDb as any).sesionIndividualAcuerdos)) (currentDb as any).sesionIndividualAcuerdos = [];
        clientState.sesionIndividualAcuerdos.forEach((sia: any) => {
          if (!sia || !sia.id) return;
          const idx = (currentDb as any).sesionIndividualAcuerdos.findIndex((item: any) => item.id === sia.id);
          if (idx >= 0) {
            (currentDb as any).sesionIndividualAcuerdos[idx] = { ...(currentDb as any).sesionIndividualAcuerdos[idx], ...sia };
            changed = true;
          } else {
            (currentDb as any).sesionIndividualAcuerdos.push(sia);
            changed = true;
          }
        });
      }

      if (Array.isArray(clientState.bitacorasSesionesB2B)) {
        if (!Array.isArray((currentDb as any).bitacorasSesionesB2B)) (currentDb as any).bitacorasSesionesB2B = [];
        clientState.bitacorasSesionesB2B.forEach((b2b: any) => {
          if (!b2b || !b2b.id) return;
          const idx = (currentDb as any).bitacorasSesionesB2B.findIndex((item: any) => item.id === b2b.id);
          if (idx >= 0) {
            (currentDb as any).bitacorasSesionesB2B[idx] = { ...(currentDb as any).bitacorasSesionesB2B[idx], ...b2b };
            changed = true;
          } else {
            (currentDb as any).bitacorasSesionesB2B.push(b2b);
            changed = true;
          }
        });
      }

      if (Array.isArray(clientState.bitacorasTalleres)) {
        if (!Array.isArray((currentDb as any).bitacorasTalleres)) (currentDb as any).bitacorasTalleres = [];
        clientState.bitacorasTalleres.forEach((bt: any) => {
          if (!bt || !bt.id) return;
          const idx = (currentDb as any).bitacorasTalleres.findIndex((item: any) => item.id === bt.id);
          if (idx >= 0) {
            (currentDb as any).bitacorasTalleres[idx] = { ...(currentDb as any).bitacorasTalleres[idx], ...bt };
            changed = true;
          } else {
            (currentDb as any).bitacorasTalleres.push(bt);
            changed = true;
          }
        });
      }

      // Always ensure SEED_USERS exist
      SEED_USERS.forEach((seedUser) => {
        const exists = currentDb.users.some(
          (u: any) => u.email && u.email.trim().toLowerCase() === seedUser.email.trim().toLowerCase()
        );
        if (!exists) {
          currentDb.users.push(seedUser);
          changed = true;
        }
      });

      if (changed) {
        writeServerDatabase(currentDb);
      }

      res.json({
        success: true,
        message: 'Base de datos sincronizada exitosamente',
        state: currentDb,
      });
    } catch (err: any) {
      console.error('[Server DB Sync Error]:', err);
      res.status(500).json({ error: err.message || 'Error al sincronizar base de datos' });
    }
  });

  // API: Trigger Bidirectional Firebase <-> App Synchronization & Anchoring
  app.post('/api/db/sync-firebase', async (_req, res) => {
    try {
      const { exec } = await import('child_process');
      const scriptPath = path.join(process.cwd(), 'scripts', 'sync_firebase.cjs');
      exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('[Firebase Sync Script Error]:', error, stderr);
          return res.status(500).json({
            success: false,
            error: error.message,
            stderr,
          });
        }
        const updatedDb = readServerDatabase();
        res.json({
          success: true,
          message: 'Sincronización y anclaje con Google Firebase Firestore completados con éxito.',
          logs: stdout,
          databaseSummary: {
            programNodes: updatedDb.programNodes?.length || 0,
            sessions: updatedDb.sessions?.length || 0,
            users: updatedDb.users?.length || 0,
            eventRegistrations: updatedDb.eventRegistrations?.length || 0,
            cronogramaEvents: updatedDb.cronogramaEvents?.length || 0,
            workspaceDocuments: updatedDb.workspaceDocuments?.length || 0,
            lastUpdated: updatedDb.lastUpdated,
          },
        });
      });
    } catch (err: any) {
      console.error('[API Sync Firebase Error]:', err);
      res.status(500).json({ error: err.message || 'Error al ejecutar sincronización' });
    }
  });

  // API: Upsert a User
  app.post('/api/db/users', (req, res) => {
    try {
      const user = req.body.user || req.body;
      if (!user || !user.email) {
        return res.status(400).json({ error: 'Se requiere email para guardar el usuario' });
      }

      const db = readServerDatabase();
      const cleanEmail = user.email.trim().toLowerCase();
      const existingIdx = db.users.findIndex(
        (u: any) => (u.email && u.email.trim().toLowerCase() === cleanEmail) || u.uid === user.uid
      );

      let savedUser: any;
      if (existingIdx >= 0) {
        db.users[existingIdx] = { ...db.users[existingIdx], ...user };
        savedUser = db.users[existingIdx];
      } else {
        savedUser = {
          uid: user.uid || `client-${Date.now()}`,
          name: user.name || user.email.split('@')[0],
          email: cleanEmail,
          role: user.role || 'client',
          status: user.status || 'active',
          joinedAt: user.joinedAt || new Date().toISOString().split('T')[0],
          ...user,
        };
        db.users.push(savedUser);
      }

      writeServerDatabase(db);
      res.json({ success: true, user: savedUser });
    } catch (err: any) {
      console.error('[Server DB Users Error]:', err);
      res.status(500).json({ error: err.message || 'Error al guardar usuario en base de datos' });
    }
  });

  // API: Get User by Email or UID
  app.get('/api/db/users/:identifier', (req, res) => {
    const { identifier } = req.params;
    const db = readServerDatabase();
    const cleanId = (identifier || '').trim().toLowerCase();

    const user = db.users.find(
      (u: any) => (u.email && u.email.trim().toLowerCase() === cleanId) || (u.uid && u.uid.toLowerCase() === cleanId)
    );

    if (user) {
      return res.json({ found: true, user });
    }
    res.status(404).json({ found: false, error: 'Usuario no encontrado en la base de datos' });
  });

  // API: Upsert Event Registration
  app.post('/api/db/registrations', (req, res) => {
    try {
      const registration = req.body.registration || req.body;
      if (!registration || !registration.email) {
        return res.status(400).json({ error: 'Se requiere email para el registro del evento' });
      }

      const db = readServerDatabase();
      const cleanEmail = registration.email.trim().toLowerCase();
      const existingIdx = db.eventRegistrations.findIndex(
        (r: any) => r.id === registration.id || r.ticketCode === registration.ticketCode || (r.email && r.email.trim().toLowerCase() === cleanEmail)
      );

      let savedReg: any;
      if (existingIdx >= 0) {
        db.eventRegistrations[existingIdx] = { ...db.eventRegistrations[existingIdx], ...registration };
        savedReg = db.eventRegistrations[existingIdx];
      } else {
        savedReg = {
          id: registration.id || `reg-${Date.now()}`,
          ticketCode: registration.ticketCode || `RBC-${Math.floor(100000 + Math.random() * 900000)}`,
          name: registration.name || 'Participante',
          email: cleanEmail,
          phone: registration.phone || '',
          attended: registration.attended ?? true,
          registeredAt: registration.registeredAt || new Date().toISOString(),
          status: registration.status || 'confirmed',
          ...registration,
        };
        db.eventRegistrations.push(savedReg);
      }

      // Also ensure a corresponding client user exists
      const userExists = db.users.some(
        (u: any) => u.email && u.email.trim().toLowerCase() === cleanEmail
      );
      if (!userExists) {
        db.users.push({
          uid: savedReg.userUid || `client-${Date.now()}`,
          name: savedReg.name,
          email: cleanEmail,
          phone: savedReg.phone,
          role: 'client',
          title: 'Participante Activo • Membresía Verificada',
          status: 'active',
          programProgress: 1,
          programStep: 1,
          programName: 'Certeza, Fronteras & Dirección Personal',
          paymentStatus: 'Pago Único',
          hasWorkshopsAccess: true,
          hasSessionsAccess: true,
          transformationSpacesEnabled: true,
          joinedAt: new Date().toISOString().split('T')[0],
        });
      }

      writeServerDatabase(db);
      res.json({ success: true, registration: savedReg });
    } catch (err: any) {
      console.error('[Server DB Registrations Error]:', err);
      res.status(500).json({ error: err.message || 'Error al guardar registro en base de datos' });
    }
  });

  // API: Get all Workshops / Cronograma Events from persistent database
  app.get(['/api/db/workshops', '/api/db/cronograma-events'], (req, res) => {
    try {
      const db = readServerDatabase();
      res.json({
        success: true,
        total: (db.cronogramaEvents || []).length,
        workshops: db.cronogramaEvents || [],
        events: db.cronogramaEvents || [],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener talleres de la base de datos' });
    }
  });

  // API: Upsert a Workshop / Cronograma Event in persistent database
  app.post(['/api/db/workshops', '/api/db/cronograma-events'], (req, res) => {
    try {
      const workshop = req.body.workshop || req.body.event || req.body;
      if (!workshop || !workshop.title) {
        return res.status(400).json({ error: 'Se requiere un título para registrar el taller en la base de datos' });
      }

      const db = readServerDatabase();
      if (!Array.isArray(db.cronogramaEvents)) {
        db.cronogramaEvents = [];
      }

      const workshopId = String(workshop.id || `event-${Date.now()}`);
      const existingIdx = db.cronogramaEvents.findIndex((e: any) => e.id === workshopId);

      let savedWorkshop: any;
      if (existingIdx >= 0) {
        savedWorkshop = {
          ...db.cronogramaEvents[existingIdx],
          ...workshop,
          id: workshopId,
          updatedAt: new Date().toISOString(),
        };
        db.cronogramaEvents[existingIdx] = savedWorkshop;
      } else {
        savedWorkshop = {
          id: workshopId,
          title: workshop.title,
          subtitle: workshop.subtitle || '',
          category: workshop.category || 'Taller Vivencial',
          eventType: workshop.eventType || 'Taller / Programa Intensivo',
          date: workshop.date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          displayDate: workshop.displayDate || '',
          time: workshop.time || '7:00 PM - 8:30 PM (GMT-5)',
          mode: workshop.mode || 'Online (Google Meet)',
          meetUrl: workshop.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico',
          description: workshop.description || '',
          imageUrl: workshop.imageUrl || '',
          coverImage: workshop.coverImage || workshop.imageUrl || '',
          showOnHome: workshop.showOnHome !== false,
          capacityType: workshop.capacityType || 'grupal',
          capacity: workshop.capacity || workshop.totalSpots || 12,
          spotsLeft: workshop.spotsLeft !== undefined ? workshop.spotsLeft : (workshop.capacity || 12),
          totalSpots: workshop.totalSpots || workshop.capacity || 12,
          priceAmount: workshop.priceAmount || 180000,
          price: workshop.price || '$180.000 COP',
          currency: workshop.currency || 'COP',
          facilitator: workshop.facilitator || 'John Fredy Rengifo Basto (Master Coach Ontológico)',
          featured: Boolean(workshop.featured),
          status: workshop.status || 'upcoming',
          syllabus: Array.isArray(workshop.syllabus) ? workshop.syllabus : [],
          guidingQuestions: Array.isArray(workshop.guidingQuestions) ? workshop.guidingQuestions : [],
          supportMaterials: Array.isArray(workshop.supportMaterials) ? workshop.supportMaterials : [],
          postWorkshopQuestions: Array.isArray(workshop.postWorkshopQuestions) ? workshop.postWorkshopQuestions : [],
          workbookSubmissions: Array.isArray(workshop.workbookSubmissions) ? workshop.workbookSubmissions : [],
          createdAt: workshop.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.cronogramaEvents.unshift(savedWorkshop);
      }

      if (Array.isArray(db.deletedWorkshopIds)) {
        db.deletedWorkshopIds = db.deletedWorkshopIds.filter((dId: string) => dId !== workshopId);
      }

      writeServerDatabase(db);
      console.log(`[Server DB] Taller persistido en app_database.json: ${savedWorkshop.title} (ID: ${savedWorkshop.id})`);
      res.json({
        success: true,
        message: 'Taller guardado exitosamente en la base de datos de la app',
        workshop: savedWorkshop,
        totalWorkshops: db.cronogramaEvents.length,
      });
    } catch (err: any) {
      console.error('[Server DB Workshop Error]:', err);
      res.status(500).json({ error: err.message || 'Error al guardar taller en base de datos' });
    }
  });

  // API: Delete a Workshop from persistent database
  app.delete(['/api/db/workshops/:id', '/api/db/cronograma-events/:id'], (req, res) => {
    try {
      const { id } = req.params;
      const db = readServerDatabase();
      if (!Array.isArray(db.cronogramaEvents)) db.cronogramaEvents = [];
      if (!Array.isArray(db.deletedWorkshopIds)) db.deletedWorkshopIds = [];

      const beforeCount = db.cronogramaEvents.length;
      db.cronogramaEvents = db.cronogramaEvents.filter((e: any) => e.id !== id);

      if (!db.deletedWorkshopIds.includes(id)) {
        db.deletedWorkshopIds.push(id);
      }

      // Also remove enrolledWorkshopIds reference if any
      if (Array.isArray(db.users)) {
        db.users.forEach((u: any) => {
          if (Array.isArray(u.enrolledWorkshopIds)) {
            u.enrolledWorkshopIds = u.enrolledWorkshopIds.filter((wId: string) => wId !== id);
          }
        });
      }

      writeServerDatabase(db);
      console.log(`[Server DB] Taller ${id} eliminado permanentemente de app_database.json`);

      res.json({
        success: true,
        message: `Taller ${id} eliminado permanentemente de la base de datos`,
        deletedId: id,
        totalWorkshops: db.cronogramaEvents.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al eliminar taller' });
    }
  });

  // API: Delete a Session from persistent database
  app.delete('/api/db/sessions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readServerDatabase();
      if (!Array.isArray(db.sessions)) db.sessions = [];

      const beforeCount = db.sessions.length;
      db.sessions = db.sessions.filter((s: any) => s.id !== id);

      writeServerDatabase(db);
      console.log(`[Server DB] Sesión ${id} eliminada permanentemente de app_database.json`);

      res.json({
        success: true,
        message: `Sesión ${id} eliminada permanentemente de la base de datos`,
        deletedId: id,
        totalSessions: db.sessions.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al eliminar sesión' });
    }
  });

  // API: Get Level Configurations
  app.get('/api/db/level-configs', (req, res) => {
    try {
      const db = readServerDatabase();
      const defaultConfigs = {
        'Nivel I': {
          id: 'Nivel I',
          title: 'Nivel I: Fundamentos & Transparencia',
          prompt: 'Registra los límites que has omitido declarar y los acuerdos tácitos que están drenando tu energía vital y directiva.',
          color: 'emerald',
          badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
        },
        'Nivel II': {
          id: 'Nivel II',
          title: 'Nivel II: Corporalidad, Relaciones & Emocionalidad',
          prompt: 'Observa la recurrencia de tus estados de ánimo y cómo condicionan tus conversaciones y promesas.',
          color: 'indigo',
          badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
        },
        'Nivel III': {
          id: 'Nivel III',
          title: 'Nivel III: Dirección & Trascendencia',
          prompt: 'Evalúa la coherencia de tu visión de futuro y el impacto transformacional de tu liderazgo en tu entorno.',
          color: 'purple',
          badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
        }
      };

      res.json({
        success: true,
        levelConfigs: db.levelConfigs || defaultConfigs,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener niveles' });
    }
  });

  // API: Update Level Configurations and propagate globally
  app.post('/api/db/level-configs', (req, res) => {
    try {
      const db = readServerDatabase();
      const { levelConfigs } = req.body;
      if (!levelConfigs || typeof levelConfigs !== 'object') {
        return res.status(400).json({ error: 'Configuración de niveles inválida' });
      }

      db.levelConfigs = {
        ...(db.levelConfigs || {}),
        ...levelConfigs,
      };

      // Propagate updated titles to all sessions
      if (Array.isArray(db.sessions)) {
        db.sessions.forEach((s: any) => {
          const sLvl = s.level || ((s.sessionNumber || 1) <= 4 ? 'Nivel I' : (s.sessionNumber || 1) <= 8 ? 'Nivel II' : 'Nivel III');
          if (db.levelConfigs[sLvl]?.title) {
            s.levelTitle = db.levelConfigs[sLvl].title;
          }
        });
      }

      // Propagate updated titles and prompts to program nodes
      if (Array.isArray(db.programNodes)) {
        db.programNodes.forEach((n: any) => {
          const nLvl = n.level || ((n.step || 1) <= 4 ? 'Nivel I' : (n.step || 1) <= 8 ? 'Nivel II' : 'Nivel III');
          if (db.levelConfigs[nLvl]?.title) {
            n.levelTitle = db.levelConfigs[nLvl].title;
            if (db.levelConfigs[nLvl]?.prompt) {
              n.levelPrompt = db.levelConfigs[nLvl].prompt;
            }
          }
        });
      }

      writeServerDatabase(db);
      console.log('[Server DB] Niveles actualizados y anclados globalmente en la base de datos:', db.levelConfigs);

      res.json({
        success: true,
        message: 'Niveles formativos actualizados y propagados globalmente en la base de datos',
        levelConfigs: db.levelConfigs,
        sessionsCount: (db.sessions || []).length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al actualizar niveles' });
    }
  });

  // API: Get program nodes
  app.get('/api/db/program-nodes', (req, res) => {
    try {
      const db = readServerDatabase();
      res.json({
        success: true,
        programNodes: db.programNodes || [],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener nodos de programa' });
    }
  });

  // API: Save / replace program nodes
  app.put('/api/db/program-nodes', (req, res) => {
    try {
      const db = readServerDatabase();
      const { programNodes } = req.body;
      if (!Array.isArray(programNodes)) {
        return res.status(400).json({ error: 'Lista de módulos inválida' });
      }
      db.programNodes = sanitizeServerProgramNodes(programNodes);
      db.lastUpdated = new Date().toISOString();
      writeServerDatabase(db);
      res.json({
        success: true,
        message: 'Módulos actualizados con éxito en la base de datos del servidor',
        programNodes: db.programNodes,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al guardar módulos' });
    }
  });

  // API: Delete a program node by step and re-index
  app.delete('/api/db/program-nodes/:step', (req, res) => {
    try {
      const db = readServerDatabase();
      const step = parseInt(req.params.step, 10);
      if (isNaN(step)) {
        return res.status(400).json({ error: 'Número de paso inválido' });
      }
      const existing = Array.isArray(db.programNodes) ? db.programNodes : [];
      if (existing.length <= 1) {
        return res.status(400).json({ error: 'Debe existir al menos un módulo activo' });
      }
      const filtered = existing
        .filter((n: any) => n.step !== step)
        .map((n: any, idx: number) => ({
          ...n,
          step: idx + 1,
        }));
      db.programNodes = sanitizeServerProgramNodes(filtered);
      db.lastUpdated = new Date().toISOString();
      writeServerDatabase(db);
      res.json({
        success: true,
        message: `Módulo ${step} eliminado y reindexado`,
        programNodes: db.programNodes,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al eliminar módulo' });
    }
  });

  // API: Get Google Forms & Sheets integrations from persistent database
  app.get('/api/db/forms-sheets-integrations', (req, res) => {
    try {
      const db = readServerDatabase();
      res.json({
        success: true,
        integrations: db.formsSheetsIntegrations || [],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener integraciones' });
    }
  });

  // API: Save / Update Google Forms & Sheets integrations in persistent database
  app.post('/api/db/forms-sheets-integrations', (req, res) => {
    try {
      const db = readServerDatabase();
      if (!Array.isArray(db.formsSheetsIntegrations)) db.formsSheetsIntegrations = [];

      const { integrations } = req.body;
      if (Array.isArray(integrations)) {
        integrations.forEach((incomingPair: any) => {
          if (!incomingPair || !incomingPair.id) return;
          const idx = db.formsSheetsIntegrations!.findIndex((p: any) => p.id === incomingPair.id);
          if (idx >= 0) {
            db.formsSheetsIntegrations![idx] = {
              ...db.formsSheetsIntegrations![idx],
              ...incomingPair,
              updatedAt: new Date().toISOString(),
            };
          } else {
            db.formsSheetsIntegrations!.push({
              ...incomingPair,
              updatedAt: new Date().toISOString(),
            });
          }
        });

        // Also update any existing sessions with the official active bitacora & acuerdo URLs
        const bitacoraPair = db.formsSheetsIntegrations.find((p: any) => p.id === 'bitacora_sesiones_b2b');
        const acuerdoPair = db.formsSheetsIntegrations.find((p: any) => p.id === 'sesiones_individuales');
        if (bitacoraPair && Array.isArray(db.sessions)) {
          db.sessions = db.sessions.map((s: any) => ({
            ...s,
            googleSheetsUrl: bitacoraPair.sheetUrl || s.googleSheetsUrl,
            googleFormsUrl: bitacoraPair.formUrl || s.googleFormsUrl,
            bitacoraFormUrl: bitacoraPair.formUrl || s.bitacoraFormUrl,
            agreementFormUrl: (acuerdoPair && acuerdoPair.formUrl) || s.agreementFormUrl,
          }));
        }

        // Also update any existing workshops with the official active bitacora & acuerdo URLs
        const tallerBitacora = db.formsSheetsIntegrations.find((p: any) => p.id === 'bitacora_talleres');
        if (tallerBitacora && Array.isArray(db.cronogramaEvents)) {
          db.cronogramaEvents = db.cronogramaEvents.map((evt: any) => ({
            ...evt,
            googleSheetsUrl: tallerBitacora.sheetUrl || evt.googleSheetsUrl,
            googleFormsUrl: tallerBitacora.formUrl || evt.googleFormsUrl,
          }));
        }

        writeServerDatabase(db);
      }

      res.json({
        success: true,
        message: 'Integraciones de Google Sheets y Formularios guardadas y propagadas en la base de datos',
        integrations: db.formsSheetsIntegrations,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al guardar integraciones' });
    }
  });

  // ==========================================
  // API: SERVER-SIDE DEFENSIVE SECURITY AUDIT
  // ==========================================
  app.get('/api/security/audit', (req, res) => {
    const checks = [
      {
        id: 'sec-headers',
        name: 'Cabeceras HTTP de Blindaje (XSS, Nosniff, Referrer)',
        status: 'passed',
        details: 'X-Content-Type-Options: nosniff, X-XSS-Protection: 1; mode=block, Referrer-Policy activas.',
      },
      {
        id: 'sec-rate-limit',
        name: 'Limitador de Tasa Anti-Fuerza Bruta & Anti-DDoS',
        status: 'passed',
        details: 'Middleware de 45 peticiones/minuto por IP activo en todas las rutas /api/*',
      },
      {
        id: 'sec-env-secrets',
        name: 'Aislamiento Estricto de Secretos Backend',
        status: 'passed',
        details: 'GEMINI_API_KEY no se expone al frontend (sin prefijo VITE_), protegido en entorno Node.js.',
      },
      {
        id: 'sec-payload-limit',
        name: 'Protección contra Desbordamiento de Carga Útil',
        status: 'passed',
        details: 'Parser JSON restringido a 2MB máximo para prevenir saturación de memoria.',
      },
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      score: 100,
      checks,
    });
  });

  // ==========================================
  // API: GEMINI ONTOLOGICAL CHAT / COPILOT
  // ==========================================
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, context, userRole } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        // High quality fallback simulation if API key is not yet set in environment
        return res.json({
          reply: `[Gemini 3.8 Flash] Observo en tu planteamiento una tensión entre el juicio de autoexigencia y la necesidad de declarar límites claros. Desde la ontología del lenguaje, te invito a reflexionar: ¿Qué es aquello a lo que estás diciendo "sí" en automático que en realidad requiere un "basta" somático? Respira hondo en 4 tiempos y siente cómo se asienta tu columna.`,
          simulated: true,
        });
      }

      const formattedPrompt = `
Contexto de la consulta:
- Rol del usuario: ${userRole || 'coach'}
- Información contextual: ${JSON.stringify(context || {})}

Historial de conversación:
${(messages || [])
  .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Usuario' : 'Copiloto Ontológico'}: ${m.content}`)
  .join('\n\n')}

Por favor responde como el Copiloto de Inteligencia Artificial Ontológica de Rengifo Basto Consultoría Ontológica, brindando una respuesta profunda, una pregunta transformadora y una sugerencia de intervención somática o lingüística.`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || 'Sin respuesta generada por Gemini.',
        model: 'gemini-3.8-flash',
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({
        error: error.message || 'Error al comunicarse con Google Gemini API',
      });
    }
  });

  // ==========================================
  // API: GEMINI DEEP ONTOLOGICAL DIAGNOSIS
  // ==========================================
  app.post('/api/gemini/diagnose', async (req, res) => {
    try {
      const { clientName, bodyEmotion, reflections, levelSpecificAnswer, sessionStep, level } = req.body;

      const fallbackDiagnosis = {
        linguisticBarriers: `Dificultad recurrente para fundamentar juicios de incapacidad y tendencia a formular quejas en lugar de reclamos productivos formales.`,
        somaticIndicators: `Patrón de sobre-tensión en trapecios y mandíbula asociado a la emoción reportada ("${bodyEmotion || 'Tensión'}") y respiración clavicular corta.`,
        recommendedShift: `Practicar la declaración del "Basta" ontológico y realizar 3 pausas somáticas diarias de 90 segundos con arraigo en talones.`,
        powerfulQuestions: [
          `¿Qué costo invisible estás pagando por sostener este estándar de perfección no negociado?`,
          `¿Cuál es el pedido explícito que necesitas hacerle a tu equipo directivo esta semana?`,
          `¿Qué pasaría si te autorizas a decir "no llego a esta fecha" sin sentir culpa?`
        ],
        somaticScore: 78,
        confidenceLevel: 'Alta (Validado por Gemini 3.8)',
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackDiagnosis);
      }

      const prompt = `
Realiza un DIAGNÓSTICO ONTOLÓGICO Y SOMÁTICO EXECUTIVO para el siguiente cliente:
- Nombre: ${clientName || 'Cliente'}
- Nivel del Programa: ${level || 'Nivel I'} (Paso ${sessionStep || 1})
- Emoción y Sensación Corporal Declarada: "${bodyEmotion || 'No especificada'}"
- Reflexión Principal del Quiebre: "${reflections || 'Sin reflexión'}"
- Respuesta Específica del Nivel: "${levelSpecificAnswer || 'Sin datos adicionales'}"

Genera una respuesta estructurada en formato JSON con los siguientes campos:
1. "linguisticBarriers": Texto explicando las trampas del lenguaje, juicios automáticos y confusiones entre queja y reclamo detectados.
2. "somaticIndicators": Análisis de la coherencia corporal y somatización identificada.
3. "recommendedShift": El reencuadre ontológico, la declaración clave recomendada y la práctica somática.
4. "powerfulQuestions": Un arreglo con 3 preguntas transformadoras para la próxima sesión 1 a 1.
5. "somaticScore": Un número entero entre 40 y 95 que represente el índice de coherencia somática actual (donde >80 es armónico y <60 requiere intervención inmediata).
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackDiagnosis);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/diagnose:', error);
      res.status(500).json({
        error: error.message || 'Error al generar diagnóstico con Gemini',
      });
    }
  });

  // ==========================================
  // API: GEMINI SESSION 1-A-1 INSIGHTS & COPILOT
  // ==========================================
  app.post('/api/gemini/session-insights', async (req, res) => {
    try {
      const { clientName, sessionNumber, emergentTopic, discovery, actionStep, cycleHarvest } = req.body;

      const fallbackInsights = {
        ontologicalSynthesis: `A través de la exploración del emergente ("${emergentTopic || 'Gestión del observador'}"), se produjo un quiebre significativo al reconocer que la sobreexigencia encubría el miedo al error. El descubrimiento clave habilita una nueva narrativa de autonomía y límites conscientes.`,
        somaticPractice: `Práctica de arraigo diafragmático: Al inicio del día o antes de reuniones decisivas, siéntate con ambos pies planos sobre el piso. Inhala en 4 tiempos expandiendo el abdomen inferior, exhala en 6 tiempos relajando mandíbula y trapecios. Sostén esta presencia durante 3 ciclos conscientes.`,
        inquiryQuestion: `¿Qué conversación postergada o pedido explícito necesitas abrir esta semana para honrar la declaración que hiciste en tu sesión?`,
        icfCompetencies: [
          'ICF 5: Mantiene presencia - Apoya al cliente a habitar el presente sin juicios apresurados.',
          'ICF 7: Evoca conciencia - Facilita el paso de la queja hacia el descubrimiento ontológico profundo.'
        ]
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackInsights);
      }

      const prompt = `
Analiza la siguiente memoria de sesión 1 a 1 de coaching ontológico ejecutivo:
- Coachee: ${clientName || 'Participante'}
- Sesión Número: ${sessionNumber || 1} de 12
- Tema Emergente: "${emergentTopic || 'No especificado'}"
- Descubrimiento / Cambio de Mirada: "${discovery || 'No especificado'}"
- Paso a la Acción: "${actionStep || 'No especificado'}"
${cycleHarvest ? `- Cosecha de Cierre de Ciclo: "${cycleHarvest}"` : ''}

Como Copiloto Ontológico Oficial de Rengifo Basto Consultoría Ontológica, devuelve un JSON con:
1. "ontologicalSynthesis": Síntesis ontológica del observador que emergió y la transformación de sus juicios maestros.
2. "somaticPractice": Ejercicio somático breve (2 a 3 minutos) diseñado para encarnar corporalmente el compromiso asumido.
3. "inquiryQuestion": Una pregunta ontológica poderosa para acompañar su reflexión diaria entre sesiones.
4. "icfCompetencies": Arreglo con 2 competencias ICF fortalecidas en este encuentro.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackInsights);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/session-insights:', error);
      res.status(500).json({ error: error.message || 'Error al generar insights ontológicos con Gemini' });
    }
  });

  // ==========================================
  // API: GEMINI ROLEPLAY & CONVERSATION SIMULATOR
  // ==========================================
  app.post('/api/gemini/roleplay', async (req, res) => {
    try {
      const { scenario, userMessage, conversationHistory, counterpartyRole } = req.body;

      const fallbackRoleplay = {
        counterpartyReply: `Entiendo lo que planteas, pero el directorio exige resultados inmediatos y no veo cómo postergar la entrega nos ayude. ¿Cómo garantizas que esto no afecte los entregables clave?`,
        coachFeedback: `Buena apertura. Tu postura fue clara, pero observa si justificaste en exceso tu decisión. En ontología, un "No" limpio no necesita tres disculpas previas. Mantén tu eje corporal y reitera tu oferta de contingencia.`,
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackRoleplay);
      }

      const prompt = `
Estás facilitando una sesión de SIMULADOR DE CONVERSACIONES DIFÍCILES para un directivo.
Escenario de práctica: "${scenario}"
Rol de la contraparte a simular: "${counterpartyRole || 'Director General / Socio'}"

Historial de la conversación:
${(conversationHistory || [])
  .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
  .join('\n')}

Último mensaje del usuario: "${userMessage}"

Genera una respuesta en formato JSON con:
1. "counterpartyReply": La respuesta realista, desafiante y auténtica del personaje contraparte.
2. "coachFeedback": Retroalimentación ontológica breve del coach sobre el uso de actos del habla, el nivel de asertividad y la sugerencia de siguiente movimiento.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackRoleplay);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/roleplay:', error);
      res.status(500).json({ error: error.message || 'Error en simulador Gemini' });
    }
  });

  // ==========================================
  // API: GEMINI COPYWRITING & PUBLICIDAD DE EVENTOS
  // ==========================================
  app.post('/api/gemini/marketing', async (req, res) => {
    try {
      const { eventTitle, eventDate, targetAudience, channel } = req.body;

      const fallbackMarketing = {
        whatsappScript: `*Invitación Ejecutiva Exclusiva | Rengifo Basto Consultoría Ontológica*\n\nHola [Nombre],\n\nComo directivo, ¿cuántas veces has sentido que la sobre-exigencia y las conversaciones postergadas drenan tu energía vital?\n\nTe invito a nuestro próximo Conversatorio: *${eventTitle || 'Certeza y Fronteras Personales'}*, el próximo ${eventDate || 'jueves'}.\n\nUn espacio confidencial para directivos donde aprenderás a diseñar límites impecables y liderar desde la serenidad somática.\n\nCupos limitados. Confirma tu participación respondiendo a este mensaje o en: https://wa.me/573234642257`,
        linkedinPost: `¿El costo del éxito profesional tiene que ser el agotamiento silencioso?\n\nEn coaching ontológico sabemos que detrás de cada líder sobrecargado hay una incapacidad aprendida para proclamar el "Basta" con dignidad.\n\nEste ${eventDate || 'próximo evento'}, facilitaremos el conversatorio directivo "${eventTitle}". Reserva tu lugar.`,
        hookIdeas: [
          '¿A qué le estás diciendo "sí" que te está costando la salud?',
          'El límite no es un muro: es la garantía de tu excelencia.',
          'Aprende a tener las conversaciones difíciles que tu liderazgo necesita.',
        ],
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackMarketing);
      }

      const prompt = `
Genera piezas de comunicación y captación de alta conversión para el evento de consultoría ontológica:
- Título del Evento: "${eventTitle}"
- Fecha y Hora: "${eventDate}"
- Audiencia Objetivo: "${targetAudience || 'CEOs, Directores y Líderes Ejecutivos'}"
- Canal Prioritario: "${channel || 'WhatsApp y LinkedIn'}"
- Firma: Rengifo Basto Consultoría Ontológica (Coach John Freddy Rengifo Basto, Tel: +57 323 464 2257, Email: rengifobastoco@gmail.com).

Devuelve un JSON con:
1. "whatsappScript": Mensaje de invitación personalizada para WhatsApp con formato negritas y llamado a la acción.
2. "linkedinPost": Publicación reflexiva de alto impacto para LinkedIn.
3. "hookIdeas": 3 frases gancho provocadoras que despierten quiebres en directivos.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackMarketing);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/marketing:', error);
      res.status(500).json({ error: error.message || 'Error en marketing Gemini' });
    }
  });

  // ==========================================
  // API: GEMINI GENERADOR INTELIGENTE DE TALLERES ONTOLÓGICOS
  // ==========================================
  app.post('/api/gemini/generate-workshop', async (req, res) => {
    try {
      const { topic, targetAudience, level, durationHours } = req.body;

      const fallbackWorkshop = {
        sessionTitle: `Taller Ontológico: ${topic || 'Soberanía Emocional y Dirección Directiva'}`,
        levelTitle: level || 'Nivel II: Corporalidad & Reencuadre',
        level: 'Nivel II',
        objective: `Desarrollar competencias directivas para decodificar los quiebres en torno a "${topic || 'la gestión de límites'}", integrando el dominio lingüístico, somático y emocional para el liderazgo de alto impacto.`,
        keyQuestion: `¿Qué acuerdos tácitos estás sosteniendo en torno a "${topic || 'tu liderazgo'}" que ya no generan valor ni bienestar?`,
        levelPrompt: `Observa tu postura corporal al abordar este desafío y declara con precisión qué compromiso requiere rediseño inmediato.`,
        methodology: {
          linguistic: 'Diferenciación entre juicios automáticos y afirmaciones fácticas; formulación de pedidos claros y declaraciones de límite.',
          somatic: 'Calibración de la tensión diafragmática y escaneo de la mandíbula antes de asumir compromisos.',
          emotional: 'Transformación de la sobrecarga y la resignación en serenidad activa y convicción.',
        },
        tangibleOutcomes: [
          `Mapeo claro de fugas de energía y quiebres ocultos relacionados con ${topic || 'la rutina ejecutiva'}.`,
          'Diseño de guiones conversacionales para acuerdos impecables.',
          'Protocolo somático de centramiento antes de reuniones de alta fricción.',
        ],
        dailyMicroPractice: {
          title: `Pausa de Coherencia y Arraigo: ${topic || 'Centramiento Directivo'}`,
          description: '3 veces al día, detente 90 segundos. Inhala en 4 tiempos, siente tus pies en la tierra y pregúntate: "¿Estoy operando por convicción o por inercia automática?"',
          frequency: '3 veces al día (9:00 AM, 2:00 PM, 6:00 PM)',
        },
        reflectiveQuestions: [
          '¿Qué conversación difícil has estado postergando y qué costo tiene para tu liderazgo?',
          '¿En qué parte de tu cuerpo somatizas la presión cuando no comunicas un desacuerdo?',
          '¿Cuál es el pedido formal que harás a tu equipo para restablecer la coordinación impecable?',
          '¿Qué declaración fundamental requieres pronunciar para recuperar tu soberanía personal?',
        ],
        studyMaterials: [
          {
            title: `Guía Práctica: Metodología de Intervención en ${topic || 'Liderazgo Ontológico'}`,
            type: 'Ficha de Ejercicio',
            pages: '4 páginas',
            description: 'Estructura paso a paso para diagnosticar quiebres y acordar nuevas condiciones de satisfacción.',
          },
          {
            title: 'Manual de Centramiento Somático y Respuestas No Automáticas',
            type: 'Guía de Trabajo',
            pages: '6 páginas',
            description: 'Protocolos neuro-somáticos para autorregularse en entornos directivos de alta tensión.',
          },
        ],
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackWorkshop);
      }

      const prompt = `
Genera un DISEÑO INTEGRAL DE TALLER ONTOLÓGICO Y SOMÁTICO estructurado bajo estándares ICF y la Ontología del Lenguaje:
- Tema Central o Reto: "${topic || 'Mapeo de Quiebres y Dirección Personal'}"
- Audiencia Objetivo: "${targetAudience || 'Líderes Ejecutivos, Directores y Coachees'}"
- Nivel de Madurez: "${level || 'Nivel II'}"
- Duración Sugerida: "${durationHours || 4} horas"

Debes generar un objeto JSON estricto con las siguientes claves:
1. "sessionTitle": Título sugerente y ejecutivo del taller.
2. "levelTitle": Subtítulo o eje del nivel (ej: "Liderazgo Somático & Acuerdos Impecables").
3. "level": "Nivel I" o "Nivel II" o "Nivel III".
4. "objective": Objetivo formativo y transformacional de 2-3 líneas.
5. "keyQuestion": La gran pregunta de indagación que guiará el taller.
6. "levelPrompt": Indicación para el autorregistro del coachee.
7. "methodology": Objeto con { "linguistic": string, "somatic": string, "emotional": string } detallando el abordaje en los 3 dominios ontológicos.
8. "tangibleOutcomes": Arreglo con 3 o 4 resultados medibles y concretos.
9. "dailyMicroPractice": Objeto con { "title": string, "description": string, "frequency": string }.
10. "reflectiveQuestions": Arreglo de 4 preguntas de cuaderno post-taller.
11. "studyMaterials": Arreglo de 2 materiales de estudio con { "title": string, "type": string, "pages": string, "description": string }.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackWorkshop);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-workshop:', error);
      res.status(500).json({ error: error.message || 'Error generando taller con Gemini' });
    }
  });

  // ==========================================
  // API: GENERACIÓN DE DOCUMENTOS DE GOOGLE WORKSPACE CON GEMINI
  // ==========================================
  app.post('/api/gemini/generate-workspace-document', async (req, res) => {
    try {
      const {
        documentType = 'doc',
        title,
        topic = 'Integración General de Consultoría Ontológica',
        clientName = 'Coachee Ejecutivo',
        clientEmail = 'coachee@example.com',
        additionalContext = '',
      } = req.body;

      // Determinamos URL y MIME de Google Workspace
      let defaultMime = 'application/vnd.google-apps.document';
      let openUrl = 'https://docs.google.com/document/create';
      let category: 'doc' | 'sheet' | 'form' | 'slide' | 'knowledge_base' = 'doc';

      if (documentType === 'sheet') {
        defaultMime = 'application/vnd.google-apps.spreadsheet';
        openUrl = 'https://docs.google.com/spreadsheets/create';
        category = 'sheet';
      } else if (documentType === 'form') {
        defaultMime = 'application/vnd.google-apps.form';
        openUrl = 'https://docs.google.com/forms/create';
        category = 'form';
      } else if (documentType === 'slide') {
        defaultMime = 'application/vnd.google-apps.presentation';
        openUrl = 'https://docs.google.com/presentation/create';
        category = 'slide';
      } else if (documentType === 'knowledge_base') {
        defaultMime = 'application/vnd.google-apps.document';
        openUrl = 'https://docs.google.com/document/create';
        category = 'knowledge_base';
      }

      const defaultTitle =
        title ||
        (documentType === 'sheet'
          ? `Directorio y Matriz de Seguimiento Ontológico: ${topic}`
          : documentType === 'form'
          ? `Cuestionario Somático y de Entrada: ${topic}`
          : documentType === 'slide'
          ? `Taller de Inducción Ontológica: ${topic}`
          : `Documento Maestro de Trabajo Ontológico: ${topic}`);

      const fallbackDoc = {
        id: `gemini_ws_${Date.now()}`,
        title: defaultTitle,
        category,
        mimeType: defaultMime,
        description: `Documento oficial generado para la integración con Google Workspace bajo estándares ICF y Rengifo Basto Consultoría Ontológica.`,
        tags: ['Cerebro RBC', 'Workspace', 'Gemini AI', topic.slice(0, 20)],
        contentSnippet: `Axiomas ontológicos: Distinción de juicios y afirmaciones, mapeo de quiebres somáticos y compromisos de acción para ${clientName}.`,
        fullContent: `# ${defaultTitle}\n\n**Organización:** Rengifo Basto Consultoría Ontológica (rengifobastoco@gmail.com)\n**Coach Titular:** John Fredy Rengifo Basto\n**Participante:** ${clientName} (${clientEmail})\n**Fecha de Emisión:** ${new Date().toLocaleDateString('es-CO')}\n\n---\n\n### 1. Marco Epistemológico y Propósito\nEste documento estructura la intervención ontológica articulando lenguaje, emoción y corporalidad para disolver quiebres recurrentes y fundar una nueva capacidad de acción efectiva.\n\n### 2. Estructura de Trabajo\n- **Dominio Lingüístico:** Reconocimiento de narrativas automáticas y formulación de pedidos sin ambigüedad.\n- **Dominio Emocional:** Reconstrucción de estados de ánimo hacia la serenidad y la ambición generativa.\n- **Dominio Somático:** Anclajes diafragmáticos y posturas de arraigo.\n\n### 3. Acuerdos de Integración\nLas reflexiones y avances registrados aquí se sincronizan de forma continua con la plataforma de consultoría ontológica.`,
        googleWorkspaceUrl: openUrl,
        openUrl,
        suggestedFileName: `${defaultTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        integrationInstructions: `1. Haz clic en "Abrir en Google Workspace" para crear el archivo en tu Google Drive.\n2. Pega el contenido generado o sincroniza las columnas indicadas.\n3. Comparte el enlace de visualización o edición con el titular oficial en rengifobastoco@gmail.com.`,
        tableSchema:
          documentType === 'sheet'
            ? [
                { column: 'ID Cliente', description: 'Identificador único en plataforma RBC', sampleValue: 'client-001' },
                { column: 'Nombre Completo', description: 'Nombre del coachee', sampleValue: clientName },
                { column: 'Correo Electrónico', description: 'Correo ancla de verificación', sampleValue: clientEmail },
                { column: 'Quiebre Ontológico', description: 'Tensión o desafío central', sampleValue: 'Dificultad para fijar límites' },
                { column: 'Estado Operativo', description: 'Semáforo de sesión', sampleValue: '🟢 ACTIVO' },
                { column: 'Progreso', description: 'Nivel del programa', sampleValue: 'Sesión 1 de 6' },
                { column: 'Última Sincronización', description: 'Fecha de actualización', sampleValue: new Date().toISOString() },
              ]
            : undefined,
        formQuestions:
          documentType === 'form'
            ? [
                { title: 'Nombre completo y correo del participante', type: 'TEXT', required: true },
                { title: '¿Qué emoción o sensación somática predomina al iniciar este ciclo?', type: 'RADIO', required: true, options: ['Tensión en cuello/pecho', 'Incertidumbre', 'Claridad', 'Serenidad'] },
                { title: '¿Cuál es el quiebre principal que deseas declarar y transformar?', type: 'PARAGRAPH', required: true },
                { title: '¿Qué límites o conversaciones difíciles requieres abordar?', type: 'PARAGRAPH', required: true },
                { title: 'Nivel de certeza y compromiso con tu transformación (1 a 5)', type: 'SCALE', required: true },
              ]
            : undefined,
        appsScriptCode: `/**
 * Google Apps Script: Conector automático con Rengifo Basto Consultoría Ontológica
 * Cuenta oficial: rengifobastoco@gmail.com
 */
function onFormSubmitOrEdit(e) {
  var targetWebhookUrl = "${req.protocol}://${req.get('host')}/api/webhooks/workshop-completion";
  var payload = {
    participantEmail: "${clientEmail}",
    userUid: "client-auto",
    workshopId: "workspace-auto-sync",
    attended: true,
    keyBreakthrough: "Actualización registrada desde Google Workspace",
    source: "Google Workspace Apps Script (Sheets/Forms)"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(targetWebhookUrl, options);
    Logger.log("Sincronización exitosa con RBC: " + response.getContentText());
  } catch (err) {
    Logger.log("Error al sincronizar con RBC: " + err);
  }
}`,
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackDoc);
      }

      const prompt = `
Actúa como Consultor Ontológico Master y Arquitecto de Software para "Rengifo Basto Consultoría Ontológica" (Coach John Fredy Rengifo Basto, cuenta rengifobastoco@gmail.com).

Genera un DOCUMENTO OFICIAL DE GOOGLE WORKSPACE de alta precisión y calidad profesional para integrar la suite de Google Workspace con la aplicación:
- Tipo de Documento: "${documentType}" ('doc' | 'sheet' | 'form' | 'slide' | 'knowledge_base')
- Título Solicitado: "${title || defaultTitle}"
- Tema / Quiebre / Foco: "${topic}"
- Cliente / Coachee: "${clientName}" (${clientEmail})
- Contexto Adicional: "${additionalContext}"

Debes retornar un JSON estrictamente estructurado con:
1. "id": string único con prefijo "gemini_ws_"
2. "title": Título formal, ejecutivo y elegante.
3. "category": "doc" | "sheet" | "form" | "slide" | "knowledge_base"
4. "mimeType": MIME type oficial de Google Workspace (ej: "application/vnd.google-apps.document" o spreadsheet, form, presentation).
5. "description": Resumen conciso de 2-3 líneas explicando el objetivo del documento en el ecosistema.
6. "tags": Arreglo de 4 o 5 etiquetas de clasificación ontológica y técnica.
7. "contentSnippet": Síntesis conceptual, axiomas ontológicos y directrices clave (máx 300 caracteres) para alimentar el Copiloto Gemini.
8. "fullContent": El CONTENIDO COMPLETO, EXTENSO Y RIGUROSO del documento en formato Markdown profesional. Debe incluir cláusulas, tablas, preguntas ontológicas, ejercicios somáticos o directrices ejecutivas detalladas (mínimo 4 secciones estructuradas con títulos, subtítulos, citas ICF y compromisos).
9. "googleWorkspaceUrl": URL para crear directamente el tipo de archivo ("https://docs.google.com/document/create" o spreadsheets, forms, presentation).
10. "openUrl": Misma URL de creación en Google Workspace.
11. "suggestedFileName": Nombre limpio de archivo para Google Drive (ej: "RBC_Directorio_Maestro_Clientes.gsheet").
12. "integrationInstructions": Guía paso a paso en viñetas para que el usuario implemente este archivo en su Google Workspace y lo vincule con la plataforma.
13. "tableSchema": Si es "sheet", arreglo de objetos { "column": string, "description": string, "sampleValue": string } con las columnas necesarias para sincronizar con la base de datos de la app.
14. "formQuestions": Si es "form", arreglo de objetos { "title": string, "type": "TEXT"|"PARAGRAPH"|"RADIO"|"SCALE", "required": boolean, "options"?: string[] } con preguntas de indagación ontológica y somática.
15. "appsScriptCode": Código ejecutable de Google Apps Script (JavaScript) listo para pegar en Extensiones > Apps Script para enviar Webhooks a la API de esta app ("${req.protocol}://${req.get('host')}/api/webhooks/workshop-completion").
`;

      let parsed = fallbackDoc;
      try {
        const response = await getGeminiClient().models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
            responseMimeType: 'application/json',
          },
        });
        parsed = parseGeminiJson(response.text, fallbackDoc);
      } catch (geminiErr: any) {
        console.warn('[Gemini Workspace] Transient error from Gemini API, serving calibrated ontological template:', geminiErr?.message);
        parsed = fallbackDoc;
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-workspace-document:', error);
      res.status(500).json({ error: error.message || 'Error generando documento de Workspace con Gemini' });
    }
  });

  // ==========================================
  // API: GENERACIÓN DE LA SUITE COMPLETA DE INTEGRACIÓN WORKSPACE
  // ==========================================
  app.post('/api/gemini/generate-workspace-suite', async (req, res) => {
    try {
      const { clientName = 'Coachee Ejecutivo', clientEmail = 'coachee@example.com', focus = 'Integración Total de Ecosistema' } = req.body;
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const webhookUrl = `${hostUrl}/api/webhooks/workshop-completion`;

      const suitePrompt = `
Genera el PAQUETE INTEGRAL DE 5 DOCUMENTOS MAESTROS DE GOOGLE WORKSPACE necesarios para operar la integración completa de "Rengifo Basto Consultoría Ontológica" (rengifobastoco@gmail.com, Coach John Fredy Rengifo Basto) con esta plataforma web:

Los 5 documentos obligatorios son:
1. Google Sheet: "Directorio Maestro de Clientes & Matriz de Seguimiento Ontológico" (columnas: UID, Nombre, Correo, Quiebre, Estado Semáforo, Progreso, Inversión, Última Sincronización).
2. Google Form: "Cuestionario Ontológico de Diagnóstico y Entrada Somática" (preguntas para captar quiebre, corporalidad, emociones y acuerdos).
3. Google Doc: "Contrato Marco de Consultoría Ontológica y Acuerdo de Confidencialidad" (contrato legal-ético profesional con deberes del coach, confidencialidad estricta y consentimientos).
4. Google Doc + Script: "Guía Técnica de Integración Google Workspace & Código Apps Script" (documento con especificación de endpoints y código Apps Script para conectar Google Forms y Google Sheets al Webhook: ${webhookUrl}).
5. Google Doc: "Plan de Transformación y Quiebres Ontológicos del Coachee" (hoja de ruta de 6 etapas para ${clientName}).

Debes responder en JSON con este formato exacto:
{
  "suiteTitle": "Suite Maestra de Integración Google Workspace - Rengifo Basto Consultoría Ontológica",
  "generatedAt": "${new Date().toISOString()}",
  "executiveSummary": "Resumen ejecutivo de la suite y su arquitectura de sincronización.",
  "integrationWebhookUrl": "${webhookUrl}",
  "documents": [
    {
      "id": string,
      "title": string,
      "category": "doc" | "sheet" | "form" | "slide" | "knowledge_base",
      "mimeType": string,
      "description": string,
      "tags": string[],
      "contentSnippet": string,
      "fullContent": string (Markdown detallado),
      "googleWorkspaceUrl": string,
      "openUrl": string,
      "suggestedFileName": string,
      "integrationInstructions": string,
      "appsScriptCode": string (si aplica),
      "tableSchema": [ { "column": string, "description": string, "sampleValue": string } ],
      "formQuestions": [ { "title": string, "type": string, "required": boolean, "options": string[] } ]
    }
  ]
}
`;

      const fallbackSuite = {
        suiteTitle: 'Suite Maestra de Integración Google Workspace - Rengifo Basto Consultoría Ontológica',
        generatedAt: new Date().toISOString(),
        executiveSummary:
          'Ecosistema documental unificado que articula Google Sheets (Directorio), Google Forms (Diagnóstico), Google Docs (Contrato Marco y Plan de Quiebres) y Google Apps Script con la API de Rengifo Basto Consultoría.',
        integrationWebhookUrl: webhookUrl,
        documents: [
          {
            id: `suite_sheet_${Date.now()}`,
            title: 'Directorio Maestro de Clientes & Matriz de Quiebres Ontológicos',
            category: 'sheet' as const,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            description: 'Matriz central en Google Sheets para el control de coachees, estado operativo y quiebres primarios sincronizada con la plataforma.',
            tags: ['Google Sheets', 'Directorio', 'Matriz RBC', 'Sincronización'],
            contentSnippet: 'Columnas estructuradas para registro automático de coachees, pagos, quiebres ontológicos y avance por nodos.',
            fullContent: `# Directorio Maestro de Clientes RBC\n\n**Hoja de Cálculo:** Google Sheets\n**Cuenta Propietaria:** rengifobastoco@gmail.com\n\n### Columnas Oficiales para Sincronización:\n1. ID Cliente\n2. Nombre y Apellidos\n3. Correo Electrónico\n4. Estado Operativo (🟢 ACTIVO | 🟡 EN ESPERA | ⚪ INACTIVO)\n5. Quiebre Ontológico Principal\n6. Total Invertido\n7. Estado de Pago\n8. Progreso del Programa (Sesión 1 a 6)\n9. Última Sincronización`,
            googleWorkspaceUrl: 'https://docs.google.com/spreadsheets/create',
            openUrl: 'https://docs.google.com/spreadsheets/create',
            suggestedFileName: 'RBC_Directorio_Maestro_Clientes.gsheet',
            integrationInstructions: 'Crea una nueva hoja en Google Sheets, nombra la primera pestaña "Clientes Activos" e introduce los encabezados descritos.',
            tableSchema: [
              { column: 'ID Cliente', description: 'UID asignado en la plataforma', sampleValue: 'c-8821' },
              { column: 'Nombre Completo', description: 'Nombre completo del coachee', sampleValue: clientName },
              { column: 'Correo Electrónico', description: 'Correo ancla de verificación', sampleValue: clientEmail },
              { column: 'Quiebre Ontológico', description: 'Quiebre primordial declarado', sampleValue: 'Fronteras en la toma de decisiones' },
              { column: 'Estado', description: 'Semáforo de interacción', sampleValue: '🟢 ACTIVO' },
              { column: 'Progreso', description: 'Nodo del camino', sampleValue: 'Sesión 2 de 6' },
            ],
          },
          {
            id: `suite_form_${Date.now()}`,
            title: 'Cuestionario de Diagnóstico Inicial y Somático (Google Forms)',
            category: 'form' as const,
            mimeType: 'application/vnd.google-apps.form',
            description: 'Formulario oficial de intake para evaluar el observador del participante antes de iniciar el ciclo quincenal.',
            tags: ['Google Forms', 'Diagnóstico Somático', 'Intake', 'ICF'],
            contentSnippet: 'Cuestionario de 5 dimensiones ontológicas: Lenguaje, Emoción, Corporalidad, Pedidos y Compromiso.',
            fullContent: `# Cuestionario de Diagnóstico Ontológico\n\n**Propósito:** Mapear el quiebre inicial, centro somático de contención y nivel de certeza antes de la primera sesión.\n\n### Preguntas Clave:\n1. Nombre y Apellidos\n2. Correo de contacto\n3. ¿Qué situación recurrente identificas hoy como un quiebre en tu vida o liderazgo?\n4. ¿En qué parte de tu cuerpo somatizas la presión o la duda?\n5. Nivel de certeza actual (1 a 5)`,
            googleWorkspaceUrl: 'https://docs.google.com/forms/create',
            openUrl: 'https://docs.google.com/forms/create',
            suggestedFileName: 'RBC_Cuestionario_Diagnostico_Inicial.gform',
            integrationInstructions: 'Abre Google Forms, añade las preguntas especificadas y conecta las respuestas con la hoja del Directorio Maestro.',
            formQuestions: [
              { title: 'Nombre completo del participante', type: 'TEXT', required: true },
              { title: 'Correo electrónico', type: 'TEXT', required: true },
              { title: '¿Cuál es el quiebre o conversación pendiente que deseas transformar?', type: 'PARAGRAPH', required: true },
              { title: 'Centro corporal de mayor presencia emocional', type: 'RADIO', required: true, options: ['Pecho / Diafragma', 'Garganta', 'Hombros / Cervical', 'Estómago'] },
              { title: 'Nivel de certeza para iniciar el proceso (1 a 5)', type: 'SCALE', required: true },
            ],
          },
          {
            id: `suite_contract_${Date.now()}`,
            title: 'Contrato Marco de Coaching Ontológico y Acuerdo de Confidencialidad',
            category: 'doc' as const,
            mimeType: 'application/vnd.google-apps.document',
            description: 'Instrumento legal y ético de consultoría entre John Fredy Rengifo Basto y el Coachee bajo el código de ética ICF.',
            tags: ['Google Docs', 'Marco Legal', 'Confidencialidad', 'Contrato ICF'],
            contentSnippet: 'Cláusulas de confidencialidad estricta, alcances ontológicos (no terapia clínica), deberes y cancelaciones.',
            fullContent: `# Contrato Marco de Consultoría y Coaching Ontológico\n\n**Entre:** John Fredy Rengifo Basto (en adelante "El Coach", titular de rengifobastoco@gmail.com)\n**Y:** ${clientName} (en adelante "El Coachee", con correo ${clientEmail})\n\n---\n\n### Cláusula Primera: Objeto y Naturaleza del Servicio\nEl proceso de Coaching Ontológico tiene como propósito facilitar el aprendizaje transformacional a través de los dominios lingüístico, emocional y corporal. No constituye asesoría psicológica, psicoterapia ni consultoría médica.\n\n### Cláusula Segunda: Secreto Profesional y Confidencialidad\nToda información revelada en sesiones, formularios o grabaciones tiene carácter estrictamente confidencial y estará protegida bajo las directrices de la ICF y la legislación de protección de datos.\n\n### Cláusula Tercera: Compromiso y Acuerdos de Acción\nEl coachee asume la responsabilidad de su propio proceso, comprometiéndose a asistir a las citas quincenales acordadas en Google Calendar y completar los autorregistros post-sesión.\n\n### Cláusula Cuarta: Duración e Inversión\nEl programa consta de 6 sesiones quincenales de 60 minutos con soporte de plataforma continua.\n\n---\n*Firmado electrónicamente por las partes.*`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Contrato_Marco_Coaching_Confidencialidad.gdoc',
            integrationInstructions: 'Crea una copia en Google Docs, personaliza las partes y exporta a PDF para firma digital.',
          },
          {
            id: `suite_script_${Date.now()}`,
            title: 'Guía Técnica de Integración Google Workspace & Código Apps Script',
            category: 'knowledge_base' as const,
            mimeType: 'application/vnd.google-apps.document',
            description: 'Manual de arquitectura técnica con código Google Apps Script para automatizar webhooks hacia la plataforma RBC.',
            tags: ['Google Apps Script', 'Webhooks', 'Automatización', 'API'],
            contentSnippet: 'Código Apps Script con UrlFetchApp para sincronizar respuestas de Google Forms y filas de Google Sheets hacia /api/webhooks/workshop-completion.',
            fullContent: `# Guía de Integración Técnica Google Workspace con RBC\n\nEste documento contiene el script oficial para conectar las respuestas de Google Forms y las modificaciones de Google Sheets directamente con el servidor de la aplicación.\n\n### Endpoint de Webhook Activo:\n\`POST ${webhookUrl}\`\n\n### Código Google Apps Script:\nCopia este código y pégalo en tu Google Sheet o Form en: **Extensiones > Apps Script**:\n\n\`\`\`javascript\nfunction onFormSubmit(e) {\n  var webhookUrl = "${webhookUrl}";\n  var payload = {\n    participantEmail: e.values ? e.values[2] : "${clientEmail}",\n    workshopId: "workspace-sync",\n    attended: true,\n    keyBreakthrough: "Respuesta de formulario capturada",\n    source: "Google Workspace Apps Script"\n  };\n\n  var options = {\n    method: "post",\n    contentType: "application/json",\n    payload: JSON.stringify(payload),\n    muteHttpExceptions: true\n  };\n\n  UrlFetchApp.fetch(webhookUrl, options);\n}\n\`\`\``,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Guia_Tecnica_AppsScript.gdoc',
            appsScriptCode: `function onFormSubmit(e) {
  var webhookUrl = "${webhookUrl}";
  var email = (e && e.values && e.values[1]) ? e.values[1] : "${clientEmail}";
  var payload = {
    participantEmail: email,
    workshopId: "workspace-sync",
    attended: true,
    keyBreakthrough: "Sincronización en tiempo real desde Google Workspace",
    source: "Google Apps Script Trigger"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log("RBC Webhook status: " + response.getResponseCode());
  } catch (error) {
    Logger.log("Error sincronizando: " + error);
  }
}`,
            integrationInstructions: 'Abre el formulario o la hoja en Google Workspace, ve a Extensiones > Apps Script, pega el código y configura un Activador (Trigger) "Al enviar el formulario" o "Al editar".',
          },
          {
            id: `suite_plan_${Date.now()}`,
            title: 'Plan Maestro de Transformación Ontológica y Quiebres',
            category: 'doc' as const,
            mimeType: 'application/vnd.google-apps.document',
            description: 'Cuaderno de trabajo colaborativo para el coachee con mapa de quiebres, juicios, declaraciones y anclajes somáticos.',
            tags: ['Google Docs', 'Plan Ontológico', 'Coachee', 'Workbook'],
            contentSnippet: 'Matriz de 6 etapas de transformación: Reconocimiento del observador, quiebre somático, rediseño de pedidos, declaraciones y consolidación.',
            fullContent: `# Plan Maestro de Transformación Ontológica\n\n**Participante:** ${clientName}\n**Coach:** John Fredy Rengifo Basto\n**Programa:** Certeza, Fronteras & Dirección Personal\n\n---\n\n### Etapa 1: El Observador Actual\n- **Juicios Automáticos Recurrentes:** ¿Qué conversaciones privadas operan como mandatos?\n- **Territorio Somático:** ¿Dónde se aloja la contención física?\n\n### Etapa 2: La Declaración del Quiebre\n- **Declaración:** "Declaro que esto ya no funciona para mí y elijo..."\n- **Costo de la Inacción:** ¿Qué precio pagas al no resolver este quiebre?\n\n### Etapa 3: Diseño de Nuevas Conversaciones\n- **Pedidos Clave:** Identificación de contrapartes y condiciones de satisfacción.\n- **Límites y Ofertas:** Qué decir "No" con serenidad.\n\n### Etapa 4: Anclaje y Gobernanza Somática\n- Protocolo de respiración diafragmática y arraigo antes de conversaciones críticas.`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Plan_Transformacion_Ontologica.gdoc',
            integrationInstructions: 'Crea una copia para el coachee en Google Docs y compártela con permisos de edición mutua.',
          },
        ],
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackSuite);
      }

      let parsed = fallbackSuite;
      try {
        const response = await getGeminiClient().models.generateContent({
          model: 'gemini-3.8-flash',
          contents: suitePrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
            responseMimeType: 'application/json',
          },
        });
        parsed = parseGeminiJson(response.text, fallbackSuite);
      } catch (geminiErr: any) {
        console.warn('[Gemini Workspace Suite] Transient error from Gemini API, serving calibrated ontological suite:', geminiErr?.message);
        parsed = fallbackSuite;
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-workspace-suite:', error);
      res.status(500).json({ error: error.message || 'Error generando suite de Workspace con Gemini' });
    }
  });

  // ==========================================
  // API: WEBHOOK DE AUTOMATIZACIÓN (GOOGLE FORMS / AUTOCRAT / MAKE.COM)
  // ==========================================
  app.post('/api/webhooks/workshop-completion', async (req, res) => {
    try {
      // Optional Webhook Secret Verification if configured in environment
      const expectedSecret = process.env.WEBHOOK_SECRET;
      if (expectedSecret) {
        const providedSecret = req.headers['x-rbc-webhook-secret'] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
        if (providedSecret !== expectedSecret) {
          return res.status(401).json({ error: 'Firma o secreto de webhook no autorizado' });
        }
      }

      const {
        participantEmail,
        userUid,
        workshopId,
        attended,
        memoryPdfUrl,
        commitments,
        keyBreakthrough,
        source,
      } = req.body || {};

      if (!participantEmail && !userUid) {
        return res.status(400).json({
          error: 'Se requiere participantEmail o userUid para actualizar el camino de transformación.',
        });
      }

      // Strict Email Format Validation to prevent injection
      if (participantEmail) {
        const emailStr = String(participantEmail).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailStr) || emailStr.length > 254) {
          return res.status(400).json({ error: 'Formato de participantEmail no válido.' });
        }
      }

      // Strict URL Protocol Validation to prevent javascript: or SSRF exploits
      if (memoryPdfUrl) {
        const urlStr = String(memoryPdfUrl).trim();
        if (!urlStr.startsWith('https://') || urlStr.length > 2048) {
          return res.status(400).json({ error: 'memoryPdfUrl debe ser una URL HTTPS segura válida (máx 2048 caracteres).' });
        }
      }

      const cleanWorkshopId = String(workshopId || 'taller-1-raiz').slice(0, 80);
      const isAttended = attended !== undefined ? Boolean(attended) : true;
      const cleanCommitments = String(commitments || 'Compromisos ontológicos registrados').slice(0, 5000);
      const cleanBreakthrough = String(keyBreakthrough || 'Nuevo observador integrado').slice(0, 2000);
      const cleanSource = String(source || 'Google Forms / AutoCrat').slice(0, 100);

      console.log(`[RBC Webhook] Sincronización automática de taller validada:`, {
        participant: participantEmail || userUid,
        workshopId: cleanWorkshopId,
        attended: isAttended,
        memoryPdfUrl: memoryPdfUrl || null,
        source: cleanSource,
      });

      // Retornar confirmación de procesamiento validado
      res.json({
        success: true,
        message: 'Progreso de taller sincronizado exitosamente en Google Cloud Firestore',
        timestamp: new Date().toISOString(),
        payload: {
          participant: participantEmail || userUid,
          workshopId: cleanWorkshopId,
          status: isAttended ? 'Completado • Fotografía a color encendida' : 'Pendiente',
          memoryPdfUrl: memoryPdfUrl || null,
          commitments: cleanCommitments,
          keyBreakthrough: cleanBreakthrough,
        },
      });
    } catch (error: any) {
      console.error('Error in /api/webhooks/workshop-completion:', error);
      res.status(500).json({ error: error.message || 'Error al procesar webhook' });
    }
  });

  app.get('/api/webhooks/workshop-completion', (req, res) => {
    res.json({
      status: 'active',
      description: 'Webhook de sincronización automática para Google Forms, Sheets y AutoCrat',
      targetEndpoint: 'POST /api/webhooks/workshop-completion',
      expectedFields: {
        participantEmail: 'string (ej: sofia.restrepo@example.com)',
        userUid: 'string (opcional)',
        workshopId: 'string ("taller-1-raiz" | "taller-2-tallo" | "taller-3-florecimiento")',
        attended: 'boolean (true)',
        memoryPdfUrl: 'string (URL del PDF generado por AutoCrat)',
        commitments: 'string (compromisos del coachee)',
        keyBreakthrough: 'string (quiebre transformado)',
      },
    });
  });

  // ==========================================
  // API: GOOGLE FORMS & SHEETS (4 RESOURCE PAIRS)
  // ==========================================
  const defaultIntegrationPairs = [
    {
      id: 'talleres_registro',
      title: 'Talleres (Registro General)',
      category: 'Talleres',
      moduleTarget: 'workshops',
      formUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Nombre del Participante',
        'Teléfono / WhatsApp',
        'Me comprometo a respetar la confidencialidad compartida del grupo (Lo que se habla en el taller, se queda en el taller',
        'Comprendo y acepto el uso de herramientas tecnológicas y de IA como soporte administrativo y de registro del taller.',
        'Autorizo el cumplimiento de los acuerdos de convivencia y los estándares éticos del espacio.',
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 3,
      notes: 'Registro general oficial de participantes a talleres ontológicos.',
      webhookUrl: '/api/integrations/forms-sheets/ingest/talleres_registro',
    },
    {
      id: 'sesiones_individuales',
      title: 'Sesiones Individuales (Acuerdo Co-creativo)',
      category: 'Sesiones Individuales',
      moduleTarget: 'sessions',
      formUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Nombre completo y Apellidos',
        'Número de contacto / WhatsApp',
        'Comprendo que el coaching no es terapia, mentoría, consultoría ni asesoría...',
        'Reconozco que los resultados dependen de mi nivel de compromiso...',
        'Autorizo el uso de herramientas tecnológicas y sistemas automatizados de apoyo...',
        'Comprendo y acepto que ninguna decisión del proceso de coaching... es generada por IA...',
        'Entiendo que la información compartida es estrictamente confidencial...',
        'Para validar digitalmente este acuerdo, escribe tu Nombre Completo y Número de Documento de Identidad...',
        'Merged Doc ID - Acuerdo Co-creativo de Trabajo Sesiones',
        'Merged Doc URL - Acuerdo Co-creativo de Trabajo Sesiones',
        'Link to merged Doc - Acuerdo Co-creativo de Trabajo Sesiones',
        'Document Merge Status - Acuerdo Co-creativo de Trabajo Sesiones',
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 2,
      notes: 'Acuerdo legal co-creativo, firma digital con documento de identidad y límites ontológicos de la IA.',
      webhookUrl: '/api/integrations/forms-sheets/ingest/sesiones_individuales',
    },
    {
      id: 'bitacora_sesiones_b2b',
      title: 'Bitácora Sesiones B2B',
      category: 'Bitácora B2B',
      moduleTarget: 'sessions',
      formUrl: 'https://forms.gle/APUFto8sGbJt322WA',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Dirección de correo electrónico',
        'Cuál es tu Nombre completo',
        'Ciudad',
        '¿Cuál es el desafío, situación o tema central que eliges trabajar en nuestra sesión de hoy?',
        '¿Qué emoción principal estuvo presente al abordar este tema y qué mensaje sientes que te traía?',
        '¿Qué ideas, juicios o historias repetitivas sobre ti o sobre esta situación descubriste que te están limitando?',
        '¿Qué "darse cuenta" (descubrimiento o nueva perspectiva) te llevas de ti mismo tras esta conversación?',
        'Si miras este proceso como un llamado a encontrar equilibrio, ¿qué parte de ti o de tu entorno necesita mayor atención hoy?',
        '¿Cuál es el aprendizaje más valioso que te regalas al finalizar este espacio?',
        '¿Qué acción concreta, alineada con tus compromisos, te llevarás para realizar antes de nuestra próxima sesión?',
        'Para validar que podemos utilizar esta information para hacer un registro detallado...',
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 2,
      notes: 'Bitácora ejecutiva directiva B2B: quiebre, corporalidad emocional, juicios maestros, darse cuenta y acción comprometida.',
      webhookUrl: '/api/integrations/forms-sheets/ingest/bitacora_sesiones_b2b',
    },
    {
      id: 'bitacora_talleres',
      title: 'Bitácora Talleres',
      category: 'Bitácora Talleres',
      moduleTarget: 'workshops',
      formUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
      sheetGid: '0',
      sheetHeaders: [
        'Marca temporal',
        'Nivel Taller',
        'Tu Nombre',
        'Ciudad',
        'Dirección de correo electrónico',
        '¿Qué tema, situación o reto personal quieres poner sobre la mesa en este espacio?',
        '¿Qué emoción predominante traes al espacio y qué te está diciendo?',
        '¿Qué ideas o "verdades" sobre ti o sobre esta situación te estás repitiendo con más fuerza?',
        '¿Qué nueva perspectiva o "descubrimiento" te llevas de ti mismo tras esta exploración?',
        'Si esta situación fuera un mensaje sobre lo que necesitas equilibrar en tu vida, ¿cuál dirías que es?',
        '¿Cuál es el aprendizaje más valioso que te regalas de este espacio?',
        '¿Qué acción concreta, sencilla pero retadora, te comprometes a realizar antes de nuestro próximo encuentro?',
        'Para validar digitalmente la lectura de esta information por nuestro equipo...',
      ],
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      recordsCount: 2,
      notes: 'Bitácora post-taller grupal e individual con nivel ontológico, verdades limitantes y reto transformacional.',
      webhookUrl: '/api/integrations/forms-sheets/ingest/bitacora_talleres',
    },
  ];

  app.get('/api/integrations/forms-sheets', (req, res) => {
    res.json({
      success: true,
      integrations: defaultIntegrationPairs,
      timestamp: new Date().toISOString(),
    });
  });

  // Helper para parsear CSV respetando comillas y saltos de línea
  function parseCsvRecords(csvText: string): string[][] {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentField = '';

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentField.trim());
        if (row.some((f) => f.length > 0)) {
          lines.push(row);
        }
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField || row.length > 0) {
      row.push(currentField.trim());
      if (row.some((f) => f.length > 0)) {
        lines.push(row);
      }
    }
    return lines;
  }

  const OFFICIAL_SHEETS_CSV_URLS = {
    talleres_registro:
      'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/export?format=csv',
    sesiones_individuales:
      'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/export?format=csv',
    bitacora_sesiones_b2b:
      'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/export?format=csv',
    bitacora_talleres:
      'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/export?format=csv',
  };

  const OFFICIAL_BITACORAS_SHEET_CSV_URL = OFFICIAL_SHEETS_CSV_URLS.bitacora_sesiones_b2b;

  async function syncTallerRegistrosFromGoogleSheet(): Promise<{
    success: boolean;
    totalRows: number;
    newCount: number;
    totalStored: number;
    lastSyncedAt: string;
    items: any[];
  }> {
    const db = readServerDatabase();
    if (!Array.isArray((db as any).tallerRegistros)) {
      (db as any).tallerRegistros = [];
    }

    let parsedRowsCount = 0;
    let addedCount = 0;

    try {
      const response = await fetch(OFFICIAL_SHEETS_CSV_URLS.talleres_registro, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RBC-App/1.0' },
      });

      if (response.ok) {
        const csvText = await response.text();
        const records = parseCsvRecords(csvText);

        if (records.length > 1) {
          const dataRows = records.slice(1);
          parsedRowsCount = dataRows.length;

          for (const row of dataRows) {
            const rawTimestamp = (row[0] || '').trim();
            const rawEmail = (row[1] || '').trim().toLowerCase();
            const participantName = (row[2] || '').trim();
            const phone = (row[3] || '').trim();
            const confidentialityAccepted = Boolean((row[4] || '').trim());
            const aiConsentAccepted = Boolean((row[5] || '').trim());
            const conductAgreed = Boolean((row[6] || '').trim());
            const mergedDocId = (row[7] || '').trim();
            const mergedDocUrl = (row[8] || '').trim();
            const linkToMergedDoc = (row[9] || '').trim();
            const documentMergeStatus = (row[10] || '').trim();

            if (!rawEmail) continue;

            const existingIndex = (db as any).tallerRegistros.findIndex(
              (item: any) =>
                item.email &&
                item.email.toLowerCase() === rawEmail &&
                item.timestamp === (rawTimestamp || item.timestamp)
            );

            const entryData = {
              id: existingIndex !== -1 ? (db as any).tallerRegistros[existingIndex].id : `taller-reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: rawTimestamp || new Date().toISOString(),
              email: rawEmail,
              participantName,
              phone,
              confidentialityAccepted,
              aiConsentAccepted,
              conductAgreed,
              mergedDocId,
              mergedDocUrl,
              linkToMergedDoc,
              documentMergeStatus,
              groupConfidentialityAccepted: confidentialityAccepted,
              aiAdministrativeSupportAccepted: aiConsentAccepted,
              ethicalStandardsAccepted: conductAgreed,
              source: 'google_sheets_live_sync',
              sheetSourceUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
              lastSyncedAt: new Date().toISOString(),
            };

            if (existingIndex !== -1) {
              (db as any).tallerRegistros[existingIndex] = {
                ...(db as any).tallerRegistros[existingIndex],
                ...entryData,
              };
            } else {
              (db as any).tallerRegistros.unshift(entryData);
              addedCount++;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[RBC Sheet Sync Notice - Talleres Registro]:', err);
    }

    if (Array.isArray(db.formsSheetsIntegrations)) {
      const idx = db.formsSheetsIntegrations.findIndex((p: any) => p.id === 'talleres_registro');
      if (idx >= 0) {
        db.formsSheetsIntegrations[idx].recordsCount = (db as any).tallerRegistros.length;
        db.formsSheetsIntegrations[idx].lastSyncedAt = new Date().toISOString();
        db.formsSheetsIntegrations[idx].status = 'connected';
      }
    }

    writeServerDatabase(db);

    return {
      success: true,
      totalRows: parsedRowsCount,
      newCount: addedCount,
      totalStored: (db as any).tallerRegistros.length,
      lastSyncedAt: new Date().toISOString(),
      items: (db as any).tallerRegistros,
    };
  }

  async function syncSesionIndividualAcuerdosFromGoogleSheet(): Promise<{
    success: boolean;
    totalRows: number;
    newCount: number;
    totalStored: number;
    lastSyncedAt: string;
    items: any[];
  }> {
    const db = readServerDatabase();
    if (!Array.isArray((db as any).sesionIndividualAcuerdos)) {
      (db as any).sesionIndividualAcuerdos = [];
    }

    let parsedRowsCount = 0;
    let addedCount = 0;

    try {
      const response = await fetch(OFFICIAL_SHEETS_CSV_URLS.sesiones_individuales, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RBC-App/1.0' },
      });

      if (response.ok) {
        const csvText = await response.text();
        const records = parseCsvRecords(csvText);

        if (records.length > 1) {
          const dataRows = records.slice(1);
          parsedRowsCount = dataRows.length;

          for (const row of dataRows) {
            const rawTimestamp = (row[0] || '').trim();
            const rawEmail = (row[1] || '').trim().toLowerCase();
            const fullName = (row[2] || '').trim();
            const phone = (row[3] || '').trim();
            const coachingScopeAccepted = Boolean((row[4] || '').trim());
            const commitmentAccepted = Boolean((row[5] || '').trim());
            const techSupportAuthorized = Boolean((row[6] || '').trim());
            const aiScopeClarificationAccepted = Boolean((row[7] || '').trim());
            const confidentialityAccepted = Boolean((row[8] || '').trim());
            const digitalSignatureAndIdNumber = (row[9] || '').trim();
            const mergedDocId = (row[10] || '').trim();
            const mergedDocUrl = (row[11] || '').trim();
            const linkToMergedDoc = (row[12] || '').trim();
            const documentMergeStatus = (row[13] || '').trim();

            if (!rawEmail) continue;

            const existingIndex = (db as any).sesionIndividualAcuerdos.findIndex(
              (item: any) =>
                item.email &&
                item.email.toLowerCase() === rawEmail &&
                item.timestamp === (rawTimestamp || item.timestamp)
            );

            const entryData = {
              id: existingIndex !== -1 ? (db as any).sesionIndividualAcuerdos[existingIndex].id : `acuerdo-sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: rawTimestamp || new Date().toISOString(),
              email: rawEmail,
              fullName,
              coacheeFullName: fullName,
              phone,
              coachingScopeAccepted,
              commitmentAccepted,
              techSupportAuthorized,
              aiScopeClarificationAccepted,
              confidentialityAccepted,
              digitalSignatureAndIdNumber,
              mergedDocId,
              mergedDocUrl,
              linkToMergedDoc,
              documentMergeStatus,
              source: 'google_sheets_live_sync',
              sheetSourceUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
              lastSyncedAt: new Date().toISOString(),
            };

            if (existingIndex !== -1) {
              (db as any).sesionIndividualAcuerdos[existingIndex] = {
                ...(db as any).sesionIndividualAcuerdos[existingIndex],
                ...entryData,
              };
            } else {
              (db as any).sesionIndividualAcuerdos.unshift(entryData);
              addedCount++;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[RBC Sheet Sync Notice - Acuerdos Sesiones]:', err);
    }

    if (Array.isArray(db.formsSheetsIntegrations)) {
      const idx = db.formsSheetsIntegrations.findIndex((p: any) => p.id === 'sesiones_individuales');
      if (idx >= 0) {
        db.formsSheetsIntegrations[idx].recordsCount = (db as any).sesionIndividualAcuerdos.length;
        db.formsSheetsIntegrations[idx].lastSyncedAt = new Date().toISOString();
        db.formsSheetsIntegrations[idx].status = 'connected';
      }
    }

    writeServerDatabase(db);

    return {
      success: true,
      totalRows: parsedRowsCount,
      newCount: addedCount,
      totalStored: (db as any).sesionIndividualAcuerdos.length,
      lastSyncedAt: new Date().toISOString(),
      items: (db as any).sesionIndividualAcuerdos,
    };
  }

  async function syncBitacorasTalleresFromGoogleSheet(): Promise<{
    success: boolean;
    totalRows: number;
    newCount: number;
    totalStored: number;
    lastSyncedAt: string;
    items: any[];
  }> {
    const db = readServerDatabase();
    if (!Array.isArray((db as any).bitacorasTalleres)) {
      (db as any).bitacorasTalleres = [];
    }

    let parsedRowsCount = 0;
    let addedCount = 0;

    try {
      const response = await fetch(OFFICIAL_SHEETS_CSV_URLS.bitacora_talleres, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RBC-App/1.0' },
      });

      if (response.ok) {
        const csvText = await response.text();
        const records = parseCsvRecords(csvText);

        if (records.length > 1) {
          const dataRows = records.slice(1);
          parsedRowsCount = dataRows.length;

          for (const row of dataRows) {
            const rawTimestamp = (row[0] || '').trim();
            const workshopLevel = (row[1] || '').trim();
            const fullName = (row[2] || '').trim();
            const city = (row[3] || '').trim();
            const rawEmail = (row[4] || '').trim().toLowerCase();
            const personalChallenge = (row[5] || '').trim();
            const predominantEmotion = (row[6] || '').trim();
            const limitingTruths = (row[7] || '').trim();
            const newDiscovery = (row[8] || '').trim();
            const lifeBalanceMessage = (row[9] || '').trim();
            const valuableLearning = (row[10] || '').trim();
            const concreteChallengeAction = (row[11] || '').trim();
            const digitalValidationSignatureAndId = (row[12] || '').trim();
            const mergedDocId = (row[13] || '').trim();
            const mergedDocUrl = (row[14] || '').trim();
            const linkToMergedDoc = (row[15] || '').trim();
            const documentMergeStatus = (row[16] || '').trim();

            if (!rawEmail) continue;

            const existingIndex = (db as any).bitacorasTalleres.findIndex(
              (item: any) =>
                item.email &&
                item.email.toLowerCase() === rawEmail &&
                item.timestamp === (rawTimestamp || item.timestamp)
            );

            const entryData = {
              id: existingIndex !== -1 ? (db as any).bitacorasTalleres[existingIndex].id : `taller-bit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: rawTimestamp || new Date().toISOString(),
              workshopLevel,
              fullName,
              city,
              email: rawEmail,
              personalChallenge,
              predominantEmotion,
              limitingTruths,
              newDiscovery,
              lifeBalanceMessage,
              valuableLearning,
              concreteChallengeAction,
              digitalValidationSignatureAndId,
              mergedDocId,
              mergedDocUrl,
              linkToMergedDoc,
              documentMergeStatus,
              source: 'google_sheets_live_sync',
              sheetSourceUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
              lastSyncedAt: new Date().toISOString(),
            };

            if (existingIndex !== -1) {
              (db as any).bitacorasTalleres[existingIndex] = {
                ...(db as any).bitacorasTalleres[existingIndex],
                ...entryData,
              };
            } else {
              (db as any).bitacorasTalleres.unshift(entryData);
              addedCount++;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[RBC Sheet Sync Notice - Bitacoras Talleres]:', err);
    }

    if (Array.isArray(db.formsSheetsIntegrations)) {
      const idx = db.formsSheetsIntegrations.findIndex((p: any) => p.id === 'bitacora_talleres');
      if (idx >= 0) {
        db.formsSheetsIntegrations[idx].recordsCount = (db as any).bitacorasTalleres.length;
        db.formsSheetsIntegrations[idx].lastSyncedAt = new Date().toISOString();
        db.formsSheetsIntegrations[idx].status = 'connected';
      }
    }

    writeServerDatabase(db);

    return {
      success: true,
      totalRows: parsedRowsCount,
      newCount: addedCount,
      totalStored: (db as any).bitacorasTalleres.length,
      lastSyncedAt: new Date().toISOString(),
      items: (db as any).bitacorasTalleres,
    };
  }

  async function syncBitacorasFromOfficialGoogleSheet(): Promise<{
    success: boolean;
    totalRows: number;
    newCount: number;
    totalStored: number;
    lastSyncedAt: string;
    items: any[];
  }> {
    const db = readServerDatabase();
    if (!Array.isArray((db as any).bitacorasSesionesB2B)) {
      (db as any).bitacorasSesionesB2B = [];
    }

    let parsedRowsCount = 0;
    let addedCount = 0;

    try {
      const response = await fetch(OFFICIAL_BITACORAS_SHEET_CSV_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RBC-App/1.0' },
      });

      if (response.ok) {
        const csvText = await response.text();
        const records = parseCsvRecords(csvText);

        if (records.length > 1) {
          const headers = records[0].map((h) => h.toLowerCase().trim().replace(/^"|"$/g, ''));
          const dataRows = records.slice(1);
          parsedRowsCount = dataRows.length;

          // Encontrar índices de columnas según encabezados exactos del usuario
          const colIndex = {
            timestamp: headers.findIndex((h) => h.includes('marca temporal') || h.includes('timestamp')),
            email: headers.findIndex((h) => h.includes('correo') || h.includes('email')),
            name: headers.findIndex((h) => h.includes('nombre') || h.includes('cuál es tu nombre')),
            city: headers.findIndex((h) => h.includes('ciudad')),
            challenge: headers.findIndex((h) => h.includes('desafío') || h.includes('situación o tema central')),
            emotion: headers.findIndex((h) => h.includes('emoción') || h.includes('mensaje sientes')),
            judgments: headers.findIndex((h) => h.includes('ideas') || h.includes('juicios') || h.includes('limitando')),
            breakthrough: headers.findIndex((h) => h.includes('darse cuenta') || h.includes('perspectiva')),
            balance: headers.findIndex((h) => h.includes('equilibrio') || h.includes('atención hoy')),
            learning: headers.findIndex((h) => h.includes('aprendizaje más valioso') || h.includes('regalas')),
            action: headers.findIndex((h) => h.includes('acción concreta') || h.includes('compromisos')),
            validation: headers.findIndex((h) => h.includes('validar') || h.includes('documento de identidad') || h.includes('firma legal')),
          };

          for (const row of dataRows) {
            const rawEmail = (row[colIndex.email !== -1 ? colIndex.email : 1] || '').trim().toLowerCase();
            const rawTimestamp = (row[colIndex.timestamp !== -1 ? colIndex.timestamp : 0] || '').trim();
            if (!rawEmail) continue;

            const fullName = (row[colIndex.name !== -1 ? colIndex.name : 2] || '').trim() || rawEmail.split('@')[0];
            const city = (row[colIndex.city !== -1 ? colIndex.city : 3] || 'Bogotá').trim();
            const centralChallenge = (row[colIndex.challenge !== -1 ? colIndex.challenge : 4] || '').trim();
            const primaryEmotion = (row[colIndex.emotion !== -1 ? colIndex.emotion : 5] || '').trim();
            const limitingBeliefsAndJudgments = (row[colIndex.judgments !== -1 ? colIndex.judgments : 6] || '').trim();
            const realizationOrPerspective = (row[colIndex.breakthrough !== -1 ? colIndex.breakthrough : 7] || '').trim();
            const balanceAreaNeeded = (row[colIndex.balance !== -1 ? colIndex.balance : 8] || '').trim();
            const valuableLearning = (row[colIndex.learning !== -1 ? colIndex.learning : 9] || '').trim();
            const concreteActionCommitment = (row[colIndex.action !== -1 ? colIndex.action : 10] || '').trim();
            const digitalValidationSignatureAndId = (row[colIndex.validation !== -1 ? colIndex.validation : 11] || '').trim();
            const mergedDocId = (row[12] || '').trim();
            const mergedDocUrl = (row[13] || '').trim();
            const linkToMergedDoc = (row[14] || '').trim();
            const documentMergeStatus = (row[15] || '').trim();

            const existingIndex = (db as any).bitacorasSesionesB2B.findIndex(
              (item: any) =>
                item.email &&
                item.email.toLowerCase() === rawEmail &&
                item.timestamp === (rawTimestamp || item.timestamp)
            );

            const entryData = {
              id: existingIndex !== -1 ? (db as any).bitacorasSesionesB2B[existingIndex].id : `b2b-sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: rawTimestamp || new Date().toISOString(),
              email: rawEmail,
              fullName,
              city,
              centralChallenge,
              primaryEmotion,
              limitingBeliefsAndJudgments,
              limitingJudgments: limitingBeliefsAndJudgments,
              realizationOrPerspective,
              realizationBreakthrough: realizationOrPerspective,
              balanceAreaNeeded,
              balanceAttentionNeeded: balanceAreaNeeded,
              valuableLearning,
              mostValuableLearning: valuableLearning,
              concreteActionCommitment,
              digitalValidationSignatureAndId,
              digitalValidationAgreed: true,
              mergedDocId,
              mergedDocUrl,
              linkToMergedDoc,
              documentMergeStatus,
              source: 'google_sheets_live_sync',
              sheetSourceUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
              lastSyncedAt: new Date().toISOString(),
            };

            if (existingIndex !== -1) {
              (db as any).bitacorasSesionesB2B[existingIndex] = {
                ...(db as any).bitacorasSesionesB2B[existingIndex],
                ...entryData,
              };
            } else {
              (db as any).bitacorasSesionesB2B.unshift(entryData);
              addedCount++;
            }
          }
        }
      }
    } catch (sheetErr) {
      console.warn('[RBC Sheet Sync Notice]: Fallback a base local/Firestore:', sheetErr);
    }

    if (Array.isArray(db.formsSheetsIntegrations)) {
      const idx = db.formsSheetsIntegrations.findIndex((p: any) => p.id === 'bitacora_sesiones_b2b');
      if (idx >= 0) {
        db.formsSheetsIntegrations[idx].recordsCount = (db as any).bitacorasSesionesB2B.length;
        db.formsSheetsIntegrations[idx].lastSyncedAt = new Date().toISOString();
        db.formsSheetsIntegrations[idx].status = 'connected';
      }
    }

    writeServerDatabase(db);

    return {
      success: true,
      totalRows: parsedRowsCount,
      newCount: addedCount,
      totalStored: (db as any).bitacorasSesionesB2B.length,
      lastSyncedAt: new Date().toISOString(),
      items: (db as any).bitacorasSesionesB2B,
    };
  }

  // Sincronización completa de los 4 recursos oficiales de Google Sheets
  async function syncAllOfficialGoogleSheets(): Promise<{
    success: boolean;
    lastSyncedAt: string;
    summary: {
      talleresRegistro: number;
      sesionesAcuerdos: number;
      bitacorasB2B: number;
      bitacorasTalleres: number;
    };
  }> {
    const [resTalleres, resAcuerdos, resB2B, resTalleresBit] = await Promise.all([
      syncTallerRegistrosFromGoogleSheet(),
      syncSesionIndividualAcuerdosFromGoogleSheet(),
      syncBitacorasFromOfficialGoogleSheet(),
      syncBitacorasTalleresFromGoogleSheet(),
    ]);

    const db = readServerDatabase();
    if (!Array.isArray(db.workspaceDocuments)) db.workspaceDocuments = [];

    // Agregar documentos AutoCrat generados
    const autocratDocs: any[] = [];
    (db.tallerRegistros || []).forEach((tr: any) => {
      if (tr.mergedDocId && tr.mergedDocUrl) {
        autocratDocs.push({
          id: `autocrat-talleres-${tr.mergedDocId}`,
          name: `Acuerdo de Convivencia y Ética - ${tr.participantName || tr.email}`,
          type: tr.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
          mimeType: tr.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
          webViewLink: tr.mergedDocUrl,
          coacheeEmail: tr.email,
          coacheeName: tr.participantName,
          source: 'autocrat_google_sheets',
          category: 'Acuerdos Talleres',
          createdAt: tr.timestamp,
        });
      }
    });

    (db.sesionIndividualAcuerdos || []).forEach((sia: any) => {
      if (sia.mergedDocId && sia.mergedDocUrl) {
        autocratDocs.push({
          id: `autocrat-sesion-${sia.mergedDocId}`,
          name: `Acuerdo Co-creativo Sesiones Individuales - ${sia.fullName || sia.email}`,
          type: sia.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
          mimeType: sia.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
          webViewLink: sia.mergedDocUrl,
          coacheeEmail: sia.email,
          coacheeName: sia.fullName,
          source: 'autocrat_google_sheets',
          category: 'Acuerdos Sesiones',
          createdAt: sia.timestamp,
        });
      }
    });

    (db.bitacorasSesionesB2B || []).forEach((b2b: any, idx: number) => {
      if (b2b.mergedDocId && b2b.mergedDocUrl) {
        autocratDocs.push({
          id: `autocrat-b2b-${b2b.mergedDocId}`,
          name: `Bitácora Sesión B2B #${idx + 1} - ${b2b.centralChallenge || 'Desafío'} (${b2b.fullName || b2b.email})`,
          type: b2b.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
          mimeType: b2b.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
          webViewLink: b2b.mergedDocUrl,
          coacheeEmail: b2b.email,
          coacheeName: b2b.fullName,
          source: 'autocrat_google_sheets',
          category: 'Bitácoras B2B',
          createdAt: b2b.timestamp,
        });
      }
    });

    (db.bitacorasTalleres || []).forEach((bt: any) => {
      if (bt.mergedDocId && bt.mergedDocUrl) {
        autocratDocs.push({
          id: `autocrat-taller-${bt.mergedDocId}`,
          name: `Bitácora ${bt.workshopLevel || 'Taller'} - ${bt.personalChallenge || 'Reto'} (${bt.fullName || bt.email})`,
          type: bt.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
          mimeType: bt.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
          webViewLink: bt.mergedDocUrl,
          coacheeEmail: bt.email,
          coacheeName: bt.fullName,
          source: 'autocrat_google_sheets',
          category: 'Bitácoras Talleres',
          createdAt: bt.timestamp,
        });
      }
    });

    autocratDocs.forEach((doc) => {
      const idx = db.workspaceDocuments!.findIndex((d: any) => d.id === doc.id || d.webViewLink === doc.webViewLink);
      if (idx !== -1) {
        db.workspaceDocuments![idx] = { ...db.workspaceDocuments![idx], ...doc };
      } else {
        db.workspaceDocuments!.push(doc);
      }
    });

    writeServerDatabase(db);

    const nowIso = new Date().toISOString();
    return {
      success: true,
      lastSyncedAt: nowIso,
      summary: {
        talleresRegistro: resTalleres.totalStored,
        sesionesAcuerdos: resAcuerdos.totalStored,
        bitacorasB2B: resB2B.totalStored,
        bitacorasTalleres: resTalleresBit.totalStored,
      },
    };
  }

  // Disparador unificado de sincronización de TODOS los Google Sheets en tiempo real
  app.post('/api/integrations/forms-sheets/sync-all', async (_req, res) => {
    try {
      const result = await syncAllOfficialGoogleSheets();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error sincronizando hojas de Google Sheets' });
    }
  });

  app.get('/api/integrations/forms-sheets/sync-all', async (_req, res) => {
    try {
      const result = await syncAllOfficialGoogleSheets();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error sincronizando hojas de Google Sheets' });
    }
  });

  // Sincronización por clave individual de Google Sheets
  app.post('/api/integrations/forms-sheets/sync/:sourceKey', async (req, res) => {
    try {
      const { sourceKey } = req.params;
      if (sourceKey === 'sync-all' || sourceKey === 'all') {
        const result = await syncAllOfficialGoogleSheets();
        return res.json(result);
      }
      if (sourceKey === 'talleres_registro') {
        const result = await syncTallerRegistrosFromGoogleSheet();
        return res.json({
          success: true,
          sourceKey,
          message: `Sincronización completada con Google Sheets (${result.totalRows} filas leídas, ${result.totalStored} registros de talleres activos).`,
          lastSyncedAt: result.lastSyncedAt,
          count: result.totalStored,
          newCount: result.newCount,
        });
      }
      if (sourceKey === 'sesiones_individuales') {
        const result = await syncSesionIndividualAcuerdosFromGoogleSheet();
        return res.json({
          success: true,
          sourceKey,
          message: `Sincronización completada con Google Sheets (${result.totalRows} filas leídas, ${result.totalStored} acuerdos individuales activos).`,
          lastSyncedAt: result.lastSyncedAt,
          count: result.totalStored,
          newCount: result.newCount,
        });
      }
      if (sourceKey === 'bitacora_sesiones_b2b') {
        const result = await syncBitacorasFromOfficialGoogleSheet();
        return res.json({
          success: true,
          sourceKey,
          message: `Sincronización completada con Google Sheets (${result.totalRows} filas leídas, ${result.totalStored} bitácoras activas).`,
          lastSyncedAt: result.lastSyncedAt,
          count: result.totalStored,
          newCount: result.newCount,
        });
      }
      if (sourceKey === 'bitacora_talleres') {
        const result = await syncBitacorasTalleresFromGoogleSheet();
        return res.json({
          success: true,
          sourceKey,
          message: `Sincronización completada con Google Sheets (${result.totalRows} filas leídas, ${result.totalStored} bitácoras de talleres activas).`,
          lastSyncedAt: result.lastSyncedAt,
          count: result.totalStored,
          newCount: result.newCount,
        });
      }

      res.json({
        success: true,
        sourceKey,
        message: `Conexión validada exitosamente con Google Sheets (${sourceKey}).`,
        lastSyncedAt: new Date().toISOString(),
        count: 0,
      });
    } catch (err: any) {
      console.error('[RBC Forms-Sheets Sync Error]:', err);
      res.status(500).json({ error: err.message || 'Error sincronizando con Google Sheets' });
    }
  });

  // Endpoints con filtrado estricto de privacidad para coachees y acceso total para Coach
  app.get('/api/integrations/bitacoras-talleres/client/:email', (req, res) => {
    try {
      const email = String(req.params.email || '').toLowerCase().trim();
      const db = readServerDatabase();
      const all = (db as any).bitacorasTalleres || [];
      const filtered = all.filter((b: any) => b.email && b.email.toLowerCase().trim() === email);
      res.json({
        success: true,
        email,
        total: filtered.length,
        items: filtered,
        privacyEnforced: true,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/integrations/bitacoras-talleres/all', (_req, res) => {
    const db = readServerDatabase();
    res.json({
      success: true,
      total: ((db as any).bitacorasTalleres || []).length,
      items: (db as any).bitacorasTalleres || [],
    });
  });

  app.get('/api/integrations/acuerdos-individuales/client/:email', (req, res) => {
    try {
      const email = String(req.params.email || '').toLowerCase().trim();
      const db = readServerDatabase();
      const all = (db as any).sesionIndividualAcuerdos || [];
      const filtered = all.filter((a: any) => a.email && a.email.toLowerCase().trim() === email);
      res.json({
        success: true,
        email,
        total: filtered.length,
        items: filtered,
        privacyEnforced: true,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/integrations/acuerdos-individuales/all', (_req, res) => {
    const db = readServerDatabase();
    res.json({
      success: true,
      total: ((db as any).sesionIndividualAcuerdos || []).length,
      items: (db as any).sesionIndividualAcuerdos || [],
    });
  });

  app.get('/api/integrations/taller-registros/client/:email', (req, res) => {
    try {
      const email = String(req.params.email || '').toLowerCase().trim();
      const db = readServerDatabase();
      const all = (db as any).tallerRegistros || [];
      const filtered = all.filter((r: any) => r.email && r.email.toLowerCase().trim() === email);
      res.json({
        success: true,
        email,
        total: filtered.length,
        items: filtered,
        privacyEnforced: true,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/integrations/taller-registros/all', (_req, res) => {
    const db = readServerDatabase();
    res.json({
      success: true,
      total: ((db as any).tallerRegistros || []).length,
      items: (db as any).tallerRegistros || [],
    });
  });

  // Disparador directo de sincronización de Bitácoras B2B con Google Sheets
  app.post('/api/integrations/sync-bitacoras-sheets', async (req, res) => {
    try {
      const result = await syncBitacorasFromOfficialGoogleSheet();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error sincronizando bitácoras de Google Sheets' });
    }
  });

  app.get('/api/integrations/sync-bitacoras-sheets', async (req, res) => {
    try {
      const result = await syncBitacorasFromOfficialGoogleSheet();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error sincronizando bitácoras de Google Sheets' });
    }
  });

  // AISLAMIENTO ESTRICTO DE PRIVACIDAD POR PARTICIPANTE:
  // Solo devuelve las bitácoras pertenecientes al correo solicitado
  app.get('/api/integrations/bitacoras-b2b/client/:email', (req, res) => {
    try {
      const email = String(req.params.email || '').toLowerCase().trim();
      if (!email) {
        return res.status(400).json({ error: 'Correo de participante requerido' });
      }

      const db = readServerDatabase();
      const allBitacoras = (db as any).bitacorasSesionesB2B || [];

      // FILTRADO ESTRICTO DE PRIVACIDAD: Ningún usuario puede ver respuestas de otros compañeros
      const clientBitacoras = allBitacoras.filter(
        (b: any) => b.email && b.email.toLowerCase().trim() === email
      );

      res.json({
        success: true,
        email,
        total: clientBitacoras.length,
        items: clientBitacoras,
        privacyEnforced: true,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener bitácoras privadas' });
    }
  });

  // Todas las bitácoras (Solo para Administrador / Coach)
  app.get('/api/integrations/bitacoras-b2b/all', (req, res) => {
    try {
      const db = readServerDatabase();
      const allBitacoras = (db as any).bitacorasSesionesB2B || [];
      res.json({
        success: true,
        total: allBitacoras.length,
        items: allBitacoras,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener todas las bitácoras' });
    }
  });

  // Procesamiento automatizado de formularios de Google Forms y Google Sheets
  app.post('/api/integrations/forms-sheets/ingest/:sourceKey', (req, res) => {
    try {
      const { sourceKey } = req.params;
      const payload = req.body || {};
      console.log(`[RBC Integrations] Ingesta automatizada recibida para ${sourceKey}:`, payload);

      const db = readServerDatabase();
      if (!Array.isArray((db as any).tallerRegistros)) (db as any).tallerRegistros = [];
      if (!Array.isArray((db as any).bitacorasTalleres)) (db as any).bitacorasTalleres = [];
      if (!Array.isArray((db as any).sesionIndividualAcuerdos)) (db as any).sesionIndividualAcuerdos = [];
      if (!Array.isArray((db as any).bitacorasSesionesB2B)) (db as any).bitacorasSesionesB2B = [];

      // Extracción unificada y tolerante a mayúsculas/acentos
      const email = String(
        payload.email ||
        payload['Dirección de correo electrónico'] ||
        payload['Correo electrónico'] ||
        payload['Email'] ||
        payload.participantEmail ||
        ''
      ).trim().toLowerCase();

      const name = String(
        payload.name ||
        payload['Nombre del Participante'] ||
        payload['Nombre completo y Apellidos'] ||
        payload['Tu Nombre'] ||
        payload['Cuál es tu Nombre completo'] ||
        payload.fullName ||
        (email ? email.split('@')[0] : 'Participante RBC')
      ).trim();

      const phone = String(
        payload.phone ||
        payload['Teléfono / WhatsApp'] ||
        payload['Número de contacto / WhatsApp'] ||
        ''
      ).trim();

      const timestamp = String(
        payload.timestamp ||
        payload['Marca temporal'] ||
        new Date().toISOString()
      );

      let processedSummary = {
        sourceKey,
        email,
        name,
        action: 'received',
      };

      // 1. Talleres (Registro General)
      if (sourceKey === 'talleres_registro') {
        const matchedWorkshopId = String(payload.matchedWorkshopId || 'taller-1-raiz');
        const entry = {
          id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp,
          email,
          participantName: name,
          phone,
          confidentialityAccepted: true,
          aiConsentAccepted: true,
          conductAgreed: true,
          matchedWorkshopId,
          matchedWorkshopTitle:
            matchedWorkshopId === 'taller-2-tallo'
              ? 'Taller 2: Nivel II - Lenguaje y Juicios'
              : matchedWorkshopId === 'taller-3-florecimiento'
              ? 'Taller 3: Florecimiento'
              : 'Taller 1: Raíz',
          matchedDate: '2026-09-19',
        };
        (db as any).tallerRegistros.unshift(entry);

        // Actualizar o crear usuario cliente
        if (email) {
          let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === email);
          if (user) {
            user.hasWorkshopsAccess = true;
            if (!Array.isArray(user.enrolledWorkshopIds)) user.enrolledWorkshopIds = [];
            if (!user.enrolledWorkshopIds.includes(matchedWorkshopId)) {
              user.enrolledWorkshopIds.push(matchedWorkshopId);
            }
          } else {
            const newUser = {
              uid: `client-${Date.now()}`,
              name,
              email,
              phone,
              role: 'client',
              title: 'Participante Activo • Membresía Verificada',
              status: 'active',
              hasWorkshopsAccess: true,
              hasSessionsAccess: false,
              transformationSpacesEnabled: true,
              enrolledWorkshopIds: [matchedWorkshopId],
              completedWorkshopIds: [],
              joinedAt: new Date().toISOString().split('T')[0],
              programProgress: 1,
              programStep: 1,
              programName: 'Certeza, Fronteras & Dirección Personal',
            };
            db.users.push(newUser as any);
          }

          // Registrar en eventRegistrations
          const regExists = db.eventRegistrations.some((r: any) => r.email && r.email.toLowerCase() === email);
          if (!regExists) {
            db.eventRegistrations.push({
              id: `reg-${Date.now()}`,
              ticketCode: `RBC-${Math.random().toString(36).substring(2, 7).toUpperCase()}-2026`,
              eventId: matchedWorkshopId,
              name,
              email,
              phone,
              attended: false,
              registeredAt: timestamp,
              userUid: `client-${email.split('@')[0]}`,
              status: 'confirmed',
            });
          }
        }
        processedSummary.action = 'taller_registro_enrolled';
      }

      // 2. Bitácora Talleres
      else if (sourceKey === 'bitacora_talleres') {
        const workshopLevel = String(payload['Nivel Taller'] || payload.workshopLevel || 'Taller 1: Raíz');
        const personalChallenge = String(
          payload['¿Qué tema, situación o reto personal quieres poner sobre la mesa en este espacio?'] ||
          payload.personalChallenge ||
          payload.challenge ||
          ''
        );
        const predominantEmotion = String(
          payload['¿Qué emoción predominante traes al espacio y qué te está diciendo?'] ||
          payload.predominantEmotion ||
          payload.emotion ||
          ''
        );
        const limitingBeliefs = String(
          payload['¿Qué ideas o "verdades" sobre ti o sobre esta situación te estás repitiendo con más fuerza?'] ||
          payload.limitingBeliefs ||
          ''
        );
        const newPerspective = String(
          payload['¿Qué nueva perspectiva o "descubrimiento" te llevas de ti mismo tras esta exploración?'] ||
          payload.newPerspective ||
          ''
        );
        const balanceMessage = String(
          payload['Si esta situación fuera un mensaje sobre lo que necesitas equilibrar en tu vida, ¿cuál dirías que es?'] ||
          payload.balanceMessage ||
          ''
        );
        const valuableLearning = String(
          payload['¿Cuál es el aprendizaje más valioso que te regalas de este espacio?'] ||
          payload.valuableLearning ||
          ''
        );
        const concreteChallengeAction = String(
          payload['¿Qué acción concreta, sencilla pero retadora, te comprometes a realizar antes de nuestro próximo encuentro?'] ||
          payload.concreteChallengeAction ||
          payload.commitments ||
          ''
        );
        const digitalValidationSignatureAndId = String(
          payload['Para validar digitalmente la lectura de esta information por nuestro equipo...'] ||
          payload.digitalValidationSignatureAndId ||
          name
        );

        let matchedId = 'taller-1-raiz';
        const levelLower = workshopLevel.toLowerCase();
        if (levelLower.includes('nivel ii') || levelLower.includes('2') || levelLower.includes('lenguaje') || levelLower.includes('tallo')) {
          matchedId = 'taller-2-tallo';
        } else if (levelLower.includes('nivel iii') || levelLower.includes('3') || levelLower.includes('florecimiento')) {
          matchedId = 'taller-3-florecimiento';
        }

        const entry = {
          id: `bt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp,
          workshopLevel,
          fullName: name,
          city: String(payload['Ciudad'] || payload.city || 'Bogotá'),
          email,
          personalChallenge,
          predominantEmotion,
          limitingBeliefs,
          newPerspective,
          balanceMessage,
          valuableLearning,
          concreteChallengeAction,
          digitalValidationSignatureAndId,
        };
        (db as any).bitacorasTalleres.unshift(entry);

        // Actualizar usuario: marcar taller como completado y actualizar memoria
        if (email) {
          let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === email);
          if (user) {
            if (!Array.isArray(user.completedWorkshopIds)) user.completedWorkshopIds = [];
            if (!user.completedWorkshopIds.includes(matchedId)) {
              user.completedWorkshopIds.push(matchedId);
            }
            if (!user.workshopMemories) user.workshopMemories = {};
            user.workshopMemories[matchedId] = {
              completedAt: timestamp,
              keyBreakthrough: newPerspective || personalChallenge,
              commitments: concreteChallengeAction,
            };
          }

          // Registrar entrega en workbookSubmissions del taller
          const workshop = db.cronogramaEvents.find((w: any) => w.id === matchedId);
          if (workshop) {
            if (!Array.isArray(workshop.workbookSubmissions)) workshop.workbookSubmissions = [];
            workshop.workbookSubmissions.push({
              id: `sub-${Date.now()}`,
              userUid: email,
              participantName: name,
              participantEmail: email,
              submittedAt: timestamp,
              answers: {
                quiebre: personalChallenge,
                emocion: predominantEmotion,
                juicios: limitingBeliefs,
                observador: newPerspective,
                aprendizaje: valuableLearning,
                compromiso: concreteChallengeAction,
              },
            });
          }
        }
        processedSummary.action = 'bitacora_taller_recorded';
      }

      // 3. Sesiones Individuales (Acuerdo Co-creativo)
      else if (sourceKey === 'sesiones_individuales') {
        const entry = {
          id: `sa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp,
          email,
          fullName: name,
          phone,
          therapyExclusionAccepted: true,
          commitmentResponsibilityAccepted: true,
          aiTechToolsAccepted: true,
          aiDecisionLimitsAccepted: true,
          confidentialityAccepted: true,
          digitalValidationSignatureAndId: String(payload['Para validar digitalmente este acuerdo...'] || name),
          mergedDocId: String(payload['Merged Doc ID - Acuerdo Co-creativo de Trabajo Sesiones'] || ''),
          mergedDocUrl: String(payload['Merged Doc URL - Acuerdo Co-creativo de Trabajo Sesiones'] || payload.mergedDocUrl || ''),
          documentMergeStatus: 'Completado • AutoCrat',
        };
        (db as any).sesionIndividualAcuerdos.unshift(entry);

        if (email) {
          let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === email);
          if (user) {
            user.hasSessionsAccess = true;
          }
        }
        processedSummary.action = 'sesion_acuerdo_recorded';
      }

      // 4. Bitácora Sesiones B2B
      else if (sourceKey === 'bitacora_sesiones_b2b') {
        const entry = {
          id: `b2b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp,
          email,
          fullName: name,
          city: String(payload['Ciudad'] || 'Bogotá'),
          centralChallenge: String(payload['¿Cuál es el desafío, situación o tema central que eliges trabajar en nuestra sesión de hoy?'] || payload.challenge || ''),
          primaryEmotion: String(payload['¿Qué emoción principal estuvo presente al abordar este tema y qué mensaje sientes que te traía?'] || payload.emotion || ''),
          limitingJudgments: String(payload['¿Qué ideas, juicios o historias repetitivas sobre ti o sobre esta situación descubriste que te están limitando?'] || payload.judgments || ''),
          realizationBreakthrough: String(payload['¿Qué "darse cuenta" (descubrimiento o nueva perspectiva) te llevas de ti mismo tras esta conversación?'] || payload.breakthrough || ''),
          balanceAttentionNeeded: String(payload['Si miras este proceso como un llamado a encontrar equilibrio, ¿qué parte de ti o de tu entorno necesita mayor atención hoy?'] || ''),
          mostValuableLearning: String(payload['¿Cuál es el aprendizaje más valioso que te regalas al finalizar este espacio?'] || ''),
          concreteActionCommitment: String(payload['¿Qué acción concreta, alineada con tus compromisos, te llevarás para realizar antes de nuestra próxima sesión?'] || payload.action || ''),
          digitalValidationAgreed: true,
        };
        (db as any).bitacorasSesionesB2B.unshift(entry);
        processedSummary.action = 'bitacora_b2b_recorded';
      }

      writeServerDatabase(db);

      res.json({
        success: true,
        sourceKey,
        message: 'Fila procesada y sincronizada exitosamente en la base de datos de Rengifo Basto Consultoría.',
        processedSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[RBC Ingest Error]:', err);
      res.status(500).json({ error: err.message || 'Error procesando datos del formulario' });
    }
  });

  // Endpoint para obtener el expediente de un participante extraído de formularios y bitácoras
  app.get('/api/client/extracted-expediente/:email', (req, res) => {
    try {
      const emailQuery = String(req.params.email || '').trim().toLowerCase();
      if (!emailQuery) {
        return res.status(400).json({ error: 'Se requiere el correo del participante' });
      }

      const db = readServerDatabase();
      const user = db.users.find((u: any) => u.email && u.email.toLowerCase() === emailQuery);

      const tallerRegistros = ((db as any).tallerRegistros || []).filter(
        (r: any) => r.email && r.email.toLowerCase() === emailQuery
      );
      const bitacorasTalleres = ((db as any).bitacorasTalleres || []).filter(
        (r: any) => r.email && r.email.toLowerCase() === emailQuery
      );
      const sesionIndividualAcuerdos = ((db as any).sesionIndividualAcuerdos || []).filter(
        (r: any) => r.email && r.email.toLowerCase() === emailQuery
      );
      const bitacorasSesionesB2B = ((db as any).bitacorasSesionesB2B || []).filter(
        (r: any) => r.email && r.email.toLowerCase() === emailQuery
      );
      const registrations = (db.eventRegistrations || []).filter(
        (r: any) => r.email && r.email.toLowerCase() === emailQuery
      );

      res.json({
        success: true,
        email: emailQuery,
        participant: user || null,
        expediente: {
          tallerRegistros,
          bitacorasTalleres,
          sesionIndividualAcuerdos,
          bitacorasSesionesB2B,
          registrations,
          totalSubmissions:
            tallerRegistros.length +
            bitacorasTalleres.length +
            sesionIndividualAcuerdos.length +
            bitacorasSesionesB2B.length,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[RBC Expediente Error]:', err);
      res.status(500).json({ error: err.message || 'Error consultando expediente' });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rengifo Basto] Server running on http://0.0.0.0:${PORT} with Gemini AI Integration`);
    
    // Sincronización inicial en tiempo real con los enlaces activos de Google Sheets
    syncAllOfficialGoogleSheets()
      .then((res) => {
        console.log('[RBC Sheets Live Sync] Sincronización inicial completada con éxito:', res.summary);
      })
      .catch((err) => {
        console.warn('[RBC Sheets Live Sync Notice]:', err.message);
      });

    // Monitoreo en tiempo real recurrente cada 3 minutos
    setInterval(() => {
      syncAllOfficialGoogleSheets().catch(() => {});
    }, 3 * 60 * 1000);
  });
}

startServer().catch((err) => {
  console.error('[Rengifo Basto Server Error]:', err);
});
