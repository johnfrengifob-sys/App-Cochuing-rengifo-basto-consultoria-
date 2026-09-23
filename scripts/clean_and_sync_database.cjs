const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/app_database.json');
const STORE_PATH = path.join(__dirname, '../src/services/store.ts');

console.log('--- RBC Database Sanitizer & Synchronization Engine ---');

// 1. Extract official PROGRAM_NODES from store.ts
const storeContent = fs.readFileSync(STORE_PATH, 'utf8');
const lines = storeContent.split('\n');
const programLines = lines.slice(107, 636);
const code = programLines.join('\n').replace(/^export let PROGRAM_NODES: ProgramNodeInfo\[\] = /, '');
const officialProgramNodes = eval(code);

console.log(`[1] Extracted ${officialProgramNodes.length} official Program Nodes from curriculum source.`);

// 2. Read existing database
const existingDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// 3. Clean cronogramaEvents: Keep ONLY the 3 official workshops
const OFFICIAL_WORKSHOP_IDS = ['taller-1-raiz', 'taller-2-tallo', 'taller-3-florecimiento'];
const obsoleteEvents = (existingDb.cronogramaEvents || []).filter(
  e => !OFFICIAL_WORKSHOP_IDS.includes(e.id)
);
console.log(`[2] Removing ${obsoleteEvents.length} obsolete workshops:`, obsoleteEvents.map(e => `${e.id} (${e.title})`));

const cleanedEvents = (existingDb.cronogramaEvents || []).filter(
  e => OFFICIAL_WORKSHOP_IDS.includes(e.id)
);

// Normalize titles and dates for the 3 official workshops
cleanedEvents.forEach(evt => {
  if (evt.id === 'taller-1-raiz') {
    evt.title = 'Taller 1: Raíz (Nivel I) – Deconstrucción Somática & Sabiduría Emocional';
    evt.subtitle = 'Reconocer la raíz: Corporalidad, límites y descodificación de las emociones fundamentales.';
    evt.date = '2026-10-17T09:00:00.000-05:00';
    evt.displayDate = 'Sábado, 17 de Octubre de 2026';
    evt.time = '9:00 AM - 1:00 PM (GMT-5)';
  } else if (evt.id === 'taller-2-tallo') {
    evt.title = 'Taller 2: Tallo (Nivel II) – Lenguaje, Juicios y Rediseño de Relaciones';
    evt.subtitle = 'Estructurar el tallo: Deconstrucción de juicios automáticos, actos lingüísticos y nuevos acuerdos de convivencia.';
    evt.date = '2026-10-31T09:00:00.000-05:00';
    evt.displayDate = 'Sábado, 31 de Octubre de 2026';
    evt.time = '9:00 AM - 1:00 PM (GMT-5)';
  } else if (evt.id === 'taller-3-florecimiento') {
    evt.title = 'Taller 3: Florecimiento (Nivel III) – Acción, Propósito y Coherencia';
    evt.subtitle = 'Encarnar la transformación: Mapa de decisiones conscientes, diseño de futuros y contribución relacional.';
    evt.date = '2026-11-14T09:00:00.000-05:00';
    evt.displayDate = 'Sábado, 14 de Noviembre de 2026';
    evt.time = '9:00 AM - 1:00 PM (GMT-5)';
  }
  evt.status = 'upcoming';
  evt.capacity = 12;
  evt.totalSpots = 12;
  evt.spotsLeft = 12;
});

// 4. Clean programNodes
const cleanedProgramNodes = officialProgramNodes.map(node => ({
  id: `node-${node.step}`,
  step: node.step,
  level: node.level,
  levelTitle: node.levelTitle,
  sessionTitle: node.sessionTitle,
  weekLabel: node.weekLabel,
  objective: node.objective,
  tangibleOutcomes: node.tangibleOutcomes,
  keyQuestion: node.keyQuestion,
  levelPrompt: node.levelPrompt,
  methodology: node.methodology,
  dailyMicroPractice: node.dailyMicroPractice,
  reinforcementPack: node.reinforcementPack,
  studyMaterials: node.studyMaterials,
  googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
  googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
  agreementSheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
  agreementFormUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
  bitacoraSheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
  bitacoraFormUrl: 'https://forms.gle/APUFto8sGbJt322WA',
  formsIntegrationId: 'bitacora_sesiones_b2b',
  updatedAt: new Date().toISOString(),
}));

console.log(`[3] Generated ${cleanedProgramNodes.length} sanitized program nodes.`);

// 5. Clean sessions for active participant (client-legadobarber2026)
const baseStartDate = new Date('2026-09-23T10:00:00.000-05:00');
const cleanedSessions = cleanedProgramNodes.map((node, idx) => {
  const sessionDate = new Date(baseStartDate.getTime() + idx * 14 * 24 * 60 * 60 * 1000);
  const dateStr = sessionDate.toISOString();
  const yyyy = sessionDate.getFullYear();
  const mm = String(sessionDate.getMonth() + 1).padStart(2, '0');
  const dd = String(sessionDate.getDate()).padStart(2, '0');
  const scheduledDate = `${yyyy}-${mm}-${dd}`;
  const isCierre = node.step % 4 === 0;

  return {
    id: `sess-client-legadobarber2026-${node.step}`,
    clientId: 'client-legadobarber2026',
    sessionNumber: node.step,
    title: `Sesión ${node.step}: ${node.sessionTitle}`,
    sessionType: isCierre ? 'cierre_ciclo' : 'sesion',
    level: node.level,
    levelTitle: node.levelTitle,
    weekLabel: node.weekLabel,
    weekNumber: node.step,
    date: dateStr,
    scheduledDate,
    scheduledTime: '10:00',
    meetLink: `https://meet.google.com/rbc-conversatorio-ontologico`,
    status: node.step === 1 ? 'completed' : 'scheduled',
    isPaid: true,
    durationMinutes: 60,
    sessionGoal: node.objective,
    openingQuestion: node.keyQuestion,
    ontologicalFocus: node.sessionTitle,
    notes: `Sesión ${node.step}: ${node.level} • ${node.sessionTitle}`,
    programNodeStep: node.step,
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    googleFormsUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    agreementFormUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
    agreementSheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
    bitacoraFormUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    bitacoraSheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    formsIntegrationId: 'bitacora_sesiones_b2b',
    expedienteSyncStatus: 'synced',
  };
});

console.log(`[4] Generated ${cleanedSessions.length} sanitized official sessions for client.`);

// 6. Clean eventRegistrations: associate with official workshop
const cleanedRegistrations = [
  {
    id: 'reg-legadobarber2026',
    ticketCode: 'RBC-LEGADO-2026',
    eventId: 'taller-1-raiz',
    name: 'legadobarber2026',
    email: 'legadobarber2026@gmail.com',
    phone: '+57 323 464 2257',
    attended: true,
    registeredAt: '2026-09-20T10:00:00.000-05:00',
    userUid: 'client-legadobarber2026',
    status: 'aprobado',
    securityPin: '1234',
    eventTitle: 'Taller 1: Raíz (Nivel I) – Deconstrucción Somática & Sabiduría Emocional',
    eventDate: '2026-10-17T09:00:00.000-05:00',
    attendedEvent: true,
    icfTermsAccepted: true,
    privacyTermsAccepted: true,
    workshopName: 'Taller 1: Raíz (Nivel I) – Deconstrucción Somática & Sabiduría Emocional',
  }
];

// 7. Deleted workshops blacklist to prevent re-synchronization
const deletedWorkshopIds = Array.from(new Set([
  ...(existingDb.deletedWorkshopIds || []),
  ...obsoleteEvents.map(e => e.id),
  'event-1790125282554',
]));

// 8. Official users
const cleanedUsers = [
  {
    uid: 'coach-1',
    name: 'John Fredy Rengifo Basto',
    email: 'rengifobastoco@gmail.com',
    role: 'coach',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    phone: '+57 323 464 2257',
    status: 'active',
    programProgress: 100,
    programStep: 12,
    company: 'Rengifo Basto Consultoría',
    primaryBreakdown: 'Master Coach Ontológico Senior',
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'client-legadobarber2026',
    name: 'legadobarber2026',
    email: 'legadobarber2026@gmail.com',
    role: 'client',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    phone: '+57 323 464 2257',
    status: 'active',
    programProgress: 10,
    programStep: 1,
    company: 'Legado Barber 2026',
    primaryBreakdown: 'Mapeo de la Transparencia y Quiebres Inconscientes',
    updatedAt: new Date().toISOString(),
  }
];

// Build sanitized database object
const sanitizedDb = {
  users: cleanedUsers,
  eventRegistrations: cleanedRegistrations,
  sessions: cleanedSessions,
  forms: [],
  postSessionForms: [],
  aiInsights: [],
  prospects: [],
  paymentRequests: [],
  cronogramaEvents: cleanedEvents,
  programNodes: cleanedProgramNodes,
  levelConfigs: existingDb.levelConfigs || {
    "Nivel I": {
      id: "Nivel I",
      title: "Nivel I: Fundamentos & Transparencia",
      prompt: "Registra los límites que has omitido declarar y los acuerdos tácitos que están drenando tu energía vital y directiva.",
      focus: "Fundamentos del observador ontológico, quiebres cotidianos, juicios automáticos y coherencia básica.",
      description: "Bases del observador ontológico, quiebres, juicios y coherencia básica.",
      color: "emerald",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    },
    "Nivel II": {
      id: "Nivel II",
      title: "Nivel II: Corporalidad, Relaciones & Emocionalidad",
      prompt: "Observa la recurrencia de tus estados de ánimo y cómo condicionan tus conversaciones y promesas.",
      focus: "Diseño conversacional, gestión de emocionalidad, corporalidad y coordinación de acciones.",
      description: "Diseño conversacional, gestión de emocionalidad, corporalidad y coordinación de acciones.",
      color: "indigo",
      badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
    },
    "Nivel III": {
      id: "Nivel III",
      title: "Nivel III: Dirección & Trascendencia",
      prompt: "Evalúa la coherencia de tu visión de futuro y el impacto transformacional de tu liderazgo en tu entorno.",
      focus: "Liderazgo ontológico, visión compartida, maestría en la acción directiva y trascendencia.",
      description: "Liderazgo ontológico, visión compartida, maestría en la acción directiva y trascendencia.",
      color: "purple",
      badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
    }
  },
  formsSheetsIntegrations: existingDb.formsSheetsIntegrations || [],
  deletedWorkshopIds: deletedWorkshopIds,
  lastUpdated: new Date().toISOString(),
};

fs.writeFileSync(DB_PATH, JSON.stringify(sanitizedDb, null, 2), 'utf8');

console.log('[5] Database app_database.json cleanly written and normalized!');
console.log('Summary:');
console.log(' - Users:', sanitizedDb.users.length);
console.log(' - Workshops:', sanitizedDb.cronogramaEvents.length, sanitizedDb.cronogramaEvents.map(e => e.id));
console.log(' - Program Nodes:', sanitizedDb.programNodes.length);
console.log(' - Sessions:', sanitizedDb.sessions.length);
console.log(' - Event Registrations:', sanitizedDb.eventRegistrations.length);
console.log(' - Deleted IDs blacklisted:', sanitizedDb.deletedWorkshopIds);
