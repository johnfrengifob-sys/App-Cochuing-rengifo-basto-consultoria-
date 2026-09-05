import React, { useState, useEffect, useId } from 'react';
import {
  Check,
  Lock,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
  X,
  FileText,
  Clock,
  Video,
  Target,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { User, EventRegistration } from '../types';
import { OntologicalStore, PROGRAM_NODES } from '../services/store';
import { INITIAL_CRONOGRAMA_EVENTS } from '../data/raizBalanceWorkshops';
import jsPDF from 'jspdf';

interface TransformationJourneyMapProps {
  client: User;
  onSelectSessionStep?: (step: number) => void;
}

interface WorkshopStation {
  id: string;
  step: number;
  code: string;
  name: string;
  subtitle: string;
  focus: string;
  colorPhotoUrl: string;
  dateStr: string;
  meetUrl?: string;
  guidingQuestions: string[];
  defaultCommitment: string;
  defaultBreakthrough: string;
}

const WORKSHOP_STATIONS: WorkshopStation[] = [
  {
    id: 'taller-1-raiz',
    step: 1,
    code: 'ESTACIÓN 01',
    name: 'Raíz: Deconstrucción Somática & Emociones',
    subtitle: 'Reconocer la raíz corporal, mapeo de la transparencia y decodificación de límites.',
    focus: 'El cuerpo como testigo ontológico y proclamación del "Basta" como acto de soberanía.',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 12 de Septiembre de 2026 • 7:00 PM',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    guidingQuestions: [
      '¿En qué áreas de tu vida estás diciendo "Sí" por complacencia cuando tu cuerpo grita "Basta"?',
      '¿Cuál es el costo somático, emocional y relacional de intentar controlarlo todo?',
      '¿Qué emoción o mandato invisible te acompaña al iniciar este espacio?',
    ],
    defaultCommitment:
      'Pausas diarias de respiración consciente de 90 segundos y respeto riguroso a mis límites corporales.',
    defaultBreakthrough:
      'Comprendí que la sobre-exigencia era un juicio automático que me desconectaba de mi propia presencia.',
  },
  {
    id: 'taller-2-tallo',
    step: 2,
    code: 'ESTACIÓN 02',
    name: 'Tallo: Lenguaje, Juicios & Reencuadre',
    subtitle: 'Deconstrucción de narrativas limitantes, actos lingüísticos y diseño de conversaciones.',
    focus: 'El lenguaje como creador de realidades: disolver juicios maestros y pactar pedidos claros.',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 19 de Septiembre de 2026 • 7:00 PM',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    guidingQuestions: [
      '¿Qué frase o narrativa repetitiva sobre ti mismo está condicionando las decisiones que hoy evitas tomar?',
      '¿Cuál es el juicio maestro que subyace detrás de tu sensación de estancamiento?',
      '¿Qué declaración fundamental requiere pronunciar tu liderazgo en este momento?',
    ],
    defaultCommitment:
      'Diferenciar afirmaciones de juicios en cada reunión y sostener las conversaciones difíciles postergadas.',
    defaultBreakthrough:
      'Reconocí que mis narrativas de insuficiencia eran heredadas y no hechos comprobables.',
  },
  {
    id: 'taller-3-florecimiento',
    step: 3,
    code: 'ESTACIÓN 03',
    name: 'Florecimiento: Acción, Propósito & Coherencia',
    subtitle: 'Encarnar la transformación: mapa de decisiones conscientes y acuerdos innegociables.',
    focus: 'Integración tridimensional (Cuerpo, Emoción, Lenguaje) al servicio de un propósito trascendente.',
    colorPhotoUrl:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    dateStr: 'Sábado, 26 de Septiembre de 2026 • 7:00 PM',
    meetUrl: 'https://meet.google.com/rbc-conversatorio-ontologico',
    guidingQuestions: [
      '¿Qué decisiones coherentes con tu nuevo observador tomarás en los próximos 30 días?',
      '¿Cómo se manifiesta tu propósito cuando dejas de operar desde la reactividad automática?',
      '¿Cuáles son tus acuerdos innegociables para sostener tu florecimiento relacional?',
    ],
    defaultCommitment:
      'Liderar desde el arraigo y sostener acuerdos impecables con mi equipo y familia.',
    defaultBreakthrough:
      'Integré la serenidad activa como mi estado basal de liderazgo y toma de decisiones.',
  },
];

// Session color artworks for the 6 individual sessions
const SESSION_COLOR_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
  2: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1000&auto=format&fit=crop&q=80',
  3: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80',
  4: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80',
  5: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80',
  6: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80',
};

export const TransformationJourneyMap: React.FC<TransformationJourneyMapProps> = ({
  client,
  onSelectSessionStep,
}) => {
  const headingId = useId();
  const [activeRoute, setActiveRoute] = useState<'workshops' | 'sessions'>('workshops');
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopStation | null>(null);
  const [selectedSessionStep, setSelectedSessionStep] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(client);

  // Reload data from store and registrations
  const reloadData = () => {
    setIsSyncing(true);
    const allUsers = OntologicalStore.getUsers();
    const updatedClient =
      allUsers.find((u) => u.uid === client.uid || u.email.toLowerCase() === client.email.toLowerCase()) || client;
    setCurrentUser(updatedClient);

    const allRegs = OntologicalStore.getEventRegistrations();
    const userRegs = allRegs.filter(
      (r) =>
        r.email.toLowerCase() === client.email.toLowerCase() ||
        (r.userUid && r.userUid === client.uid)
    );
    setRegistrations(userRegs);
    setTimeout(() => setIsSyncing(false), 300);
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener('rbc-workshops-updated', handleUpdate);
    window.addEventListener('rbc-sessions-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('rbc-workshops-updated', handleUpdate);
      window.removeEventListener('rbc-sessions-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [client.uid, client.email]);

  // Helper: check if a workshop is completed
  const isWorkshopCompleted = (workshopId: string) => {
    if (currentUser.completedWorkshopIds?.includes(workshopId)) return true;
    if (currentUser.workshopMemories?.[workshopId]) return true;
    const match = registrations.find((r) => r.eventId === workshopId && r.attendedEvent);
    return Boolean(match);
  };

  // Helper: check if workshop is registered
  const isWorkshopRegistered = (workshopId: string) => {
    return registrations.some((r) => r.eventId === workshopId);
  };

  // Helper: get memory for workshop
  const getWorkshopMemory = (workshopId: string) => {
    const memory = currentUser.workshopMemories?.[workshopId];
    const reg = registrations.find((r) => r.eventId === workshopId && r.attendedEvent);
    return {
      pdfUrl: memory?.pdfUrl || reg?.memoryPdfUrl,
      completedAt: memory?.completedAt || reg?.completedAt || 'Septiembre de 2026',
      commitments: memory?.commitments || reg?.commitments,
      keyBreakthrough: memory?.keyBreakthrough || reg?.keyBreakthrough,
    };
  };

  // Helper: check if individual session is completed
  const isSessionCompleted = (step: number) => {
    const userProgress = currentUser.programProgress || 1;
    return step < userProgress;
  };

  // Calculate completed count
  const completedWorkshopsCount = WORKSHOP_STATIONS.filter((s) => isWorkshopCompleted(s.id)).length;
  const completedSessionsCount = PROGRAM_NODES.filter((n) => isSessionCompleted(n.step)).length;

  // Generate official Cuaderno de Memorias PDF using jsPDF
  const handleDownloadMemoryPdf = (workshop: WorkshopStation) => {
    const memory = getWorkshopMemory(workshop.id);

    // If external AutoCrat URL exists, open it in new window
    if (memory.pdfUrl && memory.pdfUrl.startsWith('http') && !memory.pdfUrl.includes('rbc.edu.co/memorias/')) {
      window.open(memory.pdfUrl, '_blank');
      return;
    }

    // Generate formal, elegant B&W ICF-compliant PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dark minimalist header
    doc.setFillColor(15, 15, 18);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RENGIFO BASTO • CONSULTORÍA ONTOLÓGICA', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('CUADERNO DE MEMORIAS ONTOLÓGICAS • SISTEMA DE SEGUIMIENTO INTEGRAL', 20, 27);
    doc.text('Acreditación y Estándares de Ética ICF • Master Coach John Fredy Rengifo Basto', 20, 33);

    // Body container
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(workshop.name, 20, 60);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(workshop.subtitle, 20, 68);

    // Divider line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 74, 190, 74);

    // Participant Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('DATOS DEL PARTICIPANTE', 20, 84);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Nombre: ${currentUser.name}`, 20, 92);
    doc.text(`Correo Electrónico: ${currentUser.email}`, 20, 98);
    doc.text(`Programa: ${currentUser.programName || 'Raíz y Balance / Consultoría Directiva'}`, 20, 104);
    doc.text(`Fecha de Certificación: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 110);

    // Box: Quiebre y Aprendizaje
    doc.setFillColor(248, 248, 248);
    doc.rect(20, 120, 170, 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 120, 170, 35, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('QUIEBRE ONTOLÓGICO TRANSFORMADO & NUEVO OBSERVADOR:', 25, 128);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const breakthroughText =
      memory.keyBreakthrough || workshop.defaultBreakthrough;
    const splitBreakthrough = doc.splitTextToSize(breakthroughText, 160);
    doc.text(splitBreakthrough, 25, 136);

    // Box: Compromisos de Acción
    doc.setFillColor(248, 248, 248);
    doc.rect(20, 163, 170, 42, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 163, 170, 42, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('COMPROMISOS DE ACCIÓN ASUMIDOS:', 25, 171);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const commitmentText = memory.commitments || workshop.defaultCommitment;
    const splitCommitment = doc.splitTextToSize(commitmentText, 160);
    doc.text(splitCommitment, 25, 179);

    // Guiding Inquiries
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('PREGUNTAS DE AUTOINDAGACIÓN PROFUNDA:', 20, 218);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    let qY = 226;
    workshop.guidingQuestions.forEach((q, idx) => {
      const qLines = doc.splitTextToSize(`${idx + 1}. ${q}`, 170);
      doc.text(qLines, 20, qY);
      qY += qLines.length * 6 + 2;
    });

    // Signature line
    doc.setDrawColor(180, 180, 180);
    doc.line(20, 270, 90, 270);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('John Fredy Rengifo Basto', 20, 275);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Master Coach Ontológico • Acreditación ICF', 20, 280);

    // Save PDF
    doc.save(`Cuaderno-Memorias-${workshop.id}-${currentUser.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div
      id="camino-transformacion-panel"
      className="bg-white dark:bg-black text-black dark:text-white rounded-3xl border border-black/10 dark:border-white/15 p-5 sm:p-7 lg:p-8 space-y-6 sm:space-y-8 shadow-sm transition-all"
    >
      {/* ========================================================================= */}
      {/* CABECERA MINIMALISTA EN ALTO CONTRASTE (BLANCO Y NEGRO) */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-black/10 dark:border-white/15 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-500 dark:text-neutral-400">
              PANEL DE USUARIO • MAPA ONTOLÓGICO
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
            Tu Camino de Transformación
          </h2>

          {/* Mensaje de bienvenida personalizado humano e inspirador */}
          <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
            {currentUser.welcomeMessage ||
              `Hola ${currentUser.name}. Este mapa es tu lienzo vivo de evolución ontológica. Cada estación transitada se enciende como testimonio de tu nuevo observador.`}
          </p>
        </div>

        {/* Sync status and Refresh button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-gray-50 dark:bg-neutral-900 text-[11px] font-medium text-gray-700 dark:text-neutral-300 flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronizado con Firestore</span>
          </div>

          <button
            id="btn-sync-camino"
            type="button"
            onClick={reloadData}
            disabled={isSyncing}
            className="p-2 rounded-full border border-black/15 dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
            title="Recargar estado de transformación en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SELECTOR DE RUTAS: TALLERES MAESTROS VS SESIONES 1 A 1 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-2xl bg-gray-100 dark:bg-neutral-900 border border-black/10 dark:border-white/15 self-start">
          <button
            id="btn-route-workshops"
            type="button"
            onClick={() => setActiveRoute('workshops')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeRoute === 'workshops'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>Ruta de Talleres "Raíz y Balance"</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeRoute === 'workshops'
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                  : 'bg-black/10 dark:bg-white/10'
              }`}
            >
              {completedWorkshopsCount}/3
            </span>
          </button>

          <button
            id="btn-route-sessions"
            type="button"
            onClick={() => setActiveRoute('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeRoute === 'sessions'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>Ruta de Sesiones 1 a 1</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeRoute === 'sessions'
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                  : 'bg-black/10 dark:bg-white/10'
              }`}
            >
              {completedSessionsCount}/6
            </span>
          </button>
        </div>

        {/* Legend Explaining the B&W Color Rule */}
        <div className="text-[11px] font-light text-gray-500 dark:text-neutral-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-gray-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 inline-block" />
            Lienzo en blanco: Estación pendiente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            Fotografía a color: Estación encendida y completada
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: RUTA DE TALLERES "RAÍZ Y BALANCE" (3 ESTACIONES MAESTRAS) */}
      {/* ========================================================================= */}
      {activeRoute === 'workshops' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {WORKSHOP_STATIONS.map((station, index) => {
              const completed = isWorkshopCompleted(station.id);
              const memory = getWorkshopMemory(station.id);
              const registered = isWorkshopRegistered(station.id);

              return (
                <div
                  key={station.id}
                  id={`station-card-${station.id}`}
                  onClick={() => setSelectedWorkshop(station)}
                  className={`group rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative ${
                    completed
                      ? 'border-black/20 dark:border-white/30 bg-white dark:bg-[#121214] shadow-md hover:shadow-xl hover:-translate-y-1'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0B0B0D] hover:border-black/30 dark:hover:border-white/40'
                  }`}
                >
                  {/* Top Image Banner: ONLY colored when station is completed! */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-100 dark:bg-neutral-900">
                    {completed ? (
                      <>
                        <img
                          src={station.colorPhotoUrl}
                          alt={station.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Subtle dark gradient overlay for legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white text-black dark:bg-black dark:text-white font-bold text-[10px] tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Completada</span>
                        </div>
                      </>
                    ) : (
                      // Station NOT completed: Pure minimal white/dark canvas with subtle line art
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 border-b border-gray-100 dark:border-neutral-800">
                        <div className="w-10 h-10 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-center text-gray-400 dark:text-neutral-500">
                          <Lock className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-neutral-500">
                          Estación en Blanco
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light max-w-[200px]">
                          La fotografía a color se revelará al registrar tu asistencia y reporte.
                        </p>
                      </div>
                    )}

                    {/* Step label pill */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider">
                      {station.code}
                    </div>
                  </div>

                  {/* Content info */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-black dark:text-white leading-snug group-hover:underline">
                        {station.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-neutral-400 font-light leading-relaxed line-clamp-2">
                        {station.subtitle}
                      </p>
                    </div>

                    {/* Status footer inside card */}
                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
                      {completed ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-black dark:text-white flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            Memorias listas
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                            • Clic para ver
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {registered ? 'Inscrito • Próximo' : 'Pendiente de cursar'}
                        </span>
                      )}

                      <div className="w-7 h-7 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: RUTA DE SESIONES INDIVIDUALES 1 A 1 (6 ESTACIONES) */}
      {/* ========================================================================= */}
      {activeRoute === 'sessions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAM_NODES.map((node) => {
              const completed = isSessionCompleted(node.step);
              const isCurrent = (currentUser.programProgress || 1) === node.step;
              const photoUrl = SESSION_COLOR_PHOTOS[node.step];

              return (
                <div
                  key={node.step}
                  id={`session-card-${node.step}`}
                  onClick={() => {
                    setSelectedSessionStep(node.step);
                    if (onSelectSessionStep) {
                      onSelectSessionStep(node.step);
                    }
                  }}
                  className={`group rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative ${
                    completed
                      ? 'border-black/20 dark:border-white/30 bg-white dark:bg-[#121214] shadow-md hover:shadow-xl hover:-translate-y-1'
                      : isCurrent
                      ? 'border-black dark:border-white bg-white dark:bg-[#151518] ring-2 ring-black/20 dark:ring-white/30'
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0B0B0D] opacity-80'
                  }`}
                >
                  {/* Photo Banner: only color if completed */}
                  <div className="relative h-36 w-full overflow-hidden bg-gray-100 dark:bg-neutral-900">
                    {completed ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={node.sessionTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white text-black dark:bg-black dark:text-white font-bold text-[9px] uppercase tracking-wide flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Completada</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-b border-gray-100 dark:border-neutral-800">
                        {isCurrent ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] tracking-wider uppercase inline-block">
                              Estación Actual
                            </span>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                              En curso con John Fredy Rengifo
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-gray-400 dark:text-neutral-500">
                            <Lock className="w-4 h-4 mx-auto stroke-[1.5]" />
                            <span className="text-[10px] uppercase font-mono tracking-widest block">
                              Por cursar
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[9px] font-mono font-bold">
                      SESIÓN 0{node.step}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 font-semibold">
                        {node.levelTitle}
                      </div>
                      <h4 className="text-sm font-bold text-black dark:text-white mt-1 group-hover:underline">
                        {node.sessionTitle}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 line-clamp-2">
                        {node.objective}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 dark:text-neutral-400 font-light">
                        {node.weekLabel}
                      </span>
                      <span className="font-semibold text-black dark:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Ver bitácora
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE ESTACIÓN DE TALLER: ACCESO A MEMORIAS PDF & COMPROMISOS */}
      {/* ========================================================================= */}
      {selectedWorkshop && (
        <div
          id="modal-workshop-station"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div
            className="bg-white dark:bg-[#121214] text-black dark:text-white rounded-3xl border border-black/15 dark:border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-gray-500 dark:text-neutral-400">
                  {selectedWorkshop.code} • DETALLE DE LA ESTACIÓN
                </span>
                <h3 id={headingId} className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mt-0.5">
                  {selectedWorkshop.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-light mt-1">
                  {selectedWorkshop.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWorkshop(null)}
                className="p-2 rounded-full border border-black/10 dark:border-white/15 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo View: Full color in modal */}
            <div className="relative rounded-2xl overflow-hidden h-52 sm:h-60 w-full border border-black/10 dark:border-white/15">
              <img
                src={selectedWorkshop.colorPhotoUrl}
                alt={selectedWorkshop.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="px-2.5 py-0.5 rounded-md bg-white text-black text-[10px] font-bold uppercase tracking-wider inline-block">
                  {isWorkshopCompleted(selectedWorkshop.id)
                    ? '✓ Estación Completada'
                    : 'Estación en Preparación'}
                </span>
                <p className="text-xs font-light text-white/90">
                  {selectedWorkshop.focus}
                </p>
              </div>
            </div>

            {/* If completed: Actions & Download */}
            {isWorkshopCompleted(selectedWorkshop.id) ? (
              <div className="space-y-5">
                {/* Cuaderno de Memorias PDF Download Card */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-black dark:text-white" />
                      <h4 className="text-sm font-bold text-black dark:text-white">
                        Cuaderno de Memorias Oficial (PDF)
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                      Generado automáticamente con tus compromisos, aprendizajes ontológicos y acreditación ICF.
                    </p>
                  </div>

                  <button
                    id={`btn-download-memory-${selectedWorkshop.id}`}
                    type="button"
                    onClick={() => handleDownloadMemoryPdf(selectedWorkshop)}
                    className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>

                {/* Compromisos de Acción & Quiebre */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-black/10 dark:border-white/15 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-500 block">
                      Tus Compromisos de Acción Asumidos
                    </span>
                    <p className="text-xs sm:text-sm text-black dark:text-white font-light leading-relaxed">
                      {getWorkshopMemory(selectedWorkshop.id).commitments ||
                        selectedWorkshop.defaultCommitment}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-black/10 dark:border-white/15 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-500 block">
                      Quiebre Transformado & Nuevo Observador
                    </span>
                    <p className="text-xs sm:text-sm text-black dark:text-white font-light leading-relaxed">
                      {getWorkshopMemory(selectedWorkshop.id).keyBreakthrough ||
                        selectedWorkshop.defaultBreakthrough}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* If not completed: Guidance for upcoming workshop */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Fecha de Encuentro en Vivo
                    </span>
                    <span className="text-xs font-mono font-medium text-gray-600 dark:text-neutral-400">
                      {selectedWorkshop.dateStr}
                    </span>
                  </div>

                  {selectedWorkshop.meetUrl && (
                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-light text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Google Meet
                      </span>
                      <a
                        href={selectedWorkshop.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-black dark:text-white underline hover:opacity-80 inline-flex items-center gap-1"
                      >
                        <span>Abrir enlace de sesión</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Guiding Questions */}
                <div className="p-4 rounded-2xl border border-black/10 dark:border-white/15 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                    Preguntas Guía para tu Corporalidad y Lenguaje:
                  </h4>
                  <ul className="space-y-2">
                    {selectedWorkshop.guidingQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 dark:text-neutral-300 font-light flex items-start gap-2"
                      >
                        <span className="font-mono font-bold text-black dark:text-white shrink-0">
                          0{i + 1}.
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-light">
                Facilitador: John Fredy Rengifo Basto (Master Coach ICF)
              </span>
              <button
                type="button"
                onClick={() => setSelectedWorkshop(null)}
                className="px-4 py-1.5 rounded-xl border border-black/15 dark:border-white/20 text-xs font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
