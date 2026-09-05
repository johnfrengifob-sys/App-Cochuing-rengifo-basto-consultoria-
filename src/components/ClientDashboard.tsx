import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Video,
  Download,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Layers,
  BookOpen,
  Check,
  Circle,
} from 'lucide-react';
import { User, Session, PostSessionForm } from '../types';
import { OntologicalStore, COMPANY_INFO } from '../services/store';
import { FirestoreSyncService } from '../services/firestoreSync';
import { PDFGenerator } from '../utils/pdfGenerator';
import { PostSessionWorkbookModal } from './PostSessionWorkbookModal';
import { PaymentPortalModal } from './PaymentPortalModal';
import { CURATED_EXPERIENCE_PHOTOS } from '../data/initialExperiences';
import coachAvatarImg from '../assets/images/regenerated_image_1788287101599.jpg';

interface ClientDashboardProps {
  client: User;
  onLogout?: () => void;
  onUserUpdated?: () => void;
  onViewSessionForm?: (session: Session) => void;
  onOpenDiagnosticWorkspace?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  onLogout,
  onUserUpdated,
}) => {
  // 1. Estados de Datos: Sesiones y Cuestionarios Posteriores
  const [sessions, setSessions] = useState<Session[]>(() =>
    OntologicalStore.getSessionsForClient(client.uid)
  );
  const [postForms, setPostForms] = useState<PostSessionForm[]>(() =>
    OntologicalStore.getPostSessionFormsForClient(client.uid)
  );

  // Estados interactivos
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeSessionForModal, setActiveSessionForModal] = useState<Session | null>(null);
  const [isPaymentPortalOpen, setIsPaymentPortalOpen] = useState<boolean>(false);

  // Sincronización en tiempo real (Local Store + Firestore)
  useEffect(() => {
    const reloadData = () => {
      const currentSessions = OntologicalStore.getSessionsForClient(client.uid);
      const currentForms = OntologicalStore.getPostSessionFormsForClient(client.uid);
      setSessions(currentSessions);
      setPostForms(currentForms);
    };

    window.addEventListener('rbc-sessions-updated', reloadData);
    window.addEventListener('rbc-forms-updated', reloadData);
    window.addEventListener('storage', reloadData);

    const unsubSessions = FirestoreSyncService.subscribeToClientSessions(client.uid, (syncedSessions) => {
      if (Array.isArray(syncedSessions) && syncedSessions.length > 0) {
        setSessions(syncedSessions);
      }
    });

    const unsubForms = FirestoreSyncService.subscribeToClientPostForms(client.uid, (syncedForms) => {
      if (Array.isArray(syncedForms) && syncedForms.length > 0) {
        setPostForms(syncedForms);
      }
    });

    return () => {
      window.removeEventListener('rbc-sessions-updated', reloadData);
      window.removeEventListener('rbc-forms-updated', reloadData);
      window.removeEventListener('storage', reloadData);
      unsubSessions();
      unsubForms();
    };
  }, [client.uid]);

  // Cálculo del momento actual y ciclo
  const currentSessionNumber = client.programProgress || 1;
  const currentCycle = Math.ceil(currentSessionNumber / 4); // Ciclo 1 (1-4), Ciclo 2 (5-8), Ciclo 3 (9-12)
  const isCycleMilestone =
    currentSessionNumber === 4 || currentSessionNumber === 8 || currentSessionNumber === 12;

  const cyclePhaseLabel = isCycleMilestone
    ? 'Fase de Consolidación • Cierre de Ciclo'
    : 'Fase de Exploración Libre';

  // Sesión actual
  const currentSession: Session = useMemo(() => {
    const found = sessions.find((s) => s.sessionNumber === currentSessionNumber);
    if (found) return found;

    return {
      id: `sess-${client.uid}-${currentSessionNumber}`,
      sessionNumber: currentSessionNumber,
      clientId: client.uid,
      clientName: client.name,
      date: new Date().toISOString(),
      status: 'scheduled',
      durationMinutes: 60,
      meetLink: `https://meet.google.com/rbc-${(client.name || 'sesion').toLowerCase().replace(/[^a-z0-9]/g, '')}-s${currentSessionNumber}`,
      notes: isCycleMilestone
        ? 'Cierre de ciclo: integración de descubrimientos, patrones recurrentes y cambios de perspectiva observados.'
        : 'Pregunta de apertura: "¿Qué es importante para ti traer a este espacio hoy?". Espacio abierto al emergente.',
      keyInsights: [],
      actionAgreements: [],
      somaticFocus: '',
      programNodeStep: currentSessionNumber,
    };
  }, [sessions, currentSessionNumber, client, isCycleMilestone]);

  // Cuestionario asociado al momento actual
  const currentPostForm: PostSessionForm | undefined = useMemo(() => {
    return (
      postForms.find((f) => f.sessionId === currentSession.id) ||
      postForms.find((f) => f.sessionNumber === currentSessionNumber)
    );
  }, [postForms, currentSession.id, currentSessionNumber]);

  // Selección de fotografía a color curada según el ciclo (único elemento a color)
  const currentPhoto = useMemo(() => {
    if (currentSessionNumber === 4 || currentSessionNumber === 8) {
      return CURATED_EXPERIENCE_PHOTOS[2]; // Florecimiento (Cierre de ciclo)
    }
    if (currentSessionNumber >= 9) {
      return CURATED_EXPERIENCE_PHOTOS[5]; // Montaña y horizonte
    }
    if (currentSessionNumber >= 5) {
      return CURATED_EXPERIENCE_PHOTOS[1]; // Tallo lingüístico
    }
    return CURATED_EXPERIENCE_PHOTOS[0]; // Raíz somática y presencia
  }, [currentSessionNumber]);

  // Historial condensado de cuestionarios finalizados
  const pastForms = useMemo(() => {
    return postForms
      .slice()
      .sort((a, b) => b.sessionNumber - a.sessionNumber);
  }, [postForms]);

  const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Próximamente por agendar';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenBitacora = (sessionToEdit: Session) => {
    setActiveSessionForModal(sessionToEdit);
    setIsModalOpen(true);
  };

  const handleDownloadMemory = (form: PostSessionForm, sess?: Session) => {
    PDFGenerator.generateSessionWorkbookPDF(form, client, sess || currentSession);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* ========================================================================= */}
      {/* 1. CABECERA UNIFICADA Y SIN RUIDO (UX/UI MINIMALISTA)                      */}
      {/* ========================================================================= */}
      <header className="border-b border-black/10 dark:border-white/10 pb-6 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Fotografía a color del participante (Único punto cromático del usuario) */}
            <img
              src={
                client.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
              }
              alt={client.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-black/15 dark:border-white/15 shrink-0 shadow-xs"
            />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                Rengifo Basto Consultoría Ontológica
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-black dark:text-white">
                Hola, {client.name}
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                Acompañamiento Individual 1 a 1 • Espacio confidencial y orgánico
              </p>
            </div>
          </div>

          {/* Acciones de la Cabecera */}
          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsPaymentPortalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Portal de Pagos & Progreso</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>

        {/* UN SOLO BLOQUE CENTRAL UNIFICADO DE PROGRESO */}
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/60 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0" />
            <span className="font-bold text-black dark:text-white">
              Ciclo {currentCycle} de 3
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
              Encuentro {currentSessionNumber} de 12
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <span className="font-semibold text-black dark:text-white">
              {cyclePhaseLabel}
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            {isCycleMilestone ? '★ Cosecha del Ciclo' : 'Lienzo en Blanco'}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. EL LIENZO CENTRAL: "TU MOMENTO ACTUAL" (UNA SOLA TARJETA ACTIVA)       */}
      {/* ========================================================================= */}
      <main className="space-y-8">
        <section
          id="tu-momento-actual"
          className="rounded-3xl border border-black/15 dark:border-white/15 bg-white dark:bg-black overflow-hidden shadow-xs"
        >
          {/* FOTOGRAFÍA A COLOR (Único elemento cromático de la experiencia) */}
          <div className="relative h-60 sm:h-72 w-full overflow-hidden border-b border-black/10 dark:border-white/10">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
            />
            {/* Pill minimalista en B&W superpuesta */}
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xs">
              Tu momento actual
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md text-white p-3.5 rounded-2xl border border-white/15">
              <span className="text-[10px] uppercase tracking-widest text-neutral-300 block font-mono">
                {currentPhoto.title}
              </span>
              <p className="text-xs font-light text-neutral-200 mt-0.5 leading-snug">
                {currentPhoto.description}
              </p>
            </div>
          </div>

          {/* CONTENIDO INTERIOR DEL LIENZO */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* PREGUNTA DE APERTURA ONTOLÓGICA / ESPACIO LIBRE */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                Pregunta de Apertura Ontológica
              </span>
              <h2 className="text-base sm:text-lg font-normal text-black dark:text-white leading-snug">
                {isCycleMilestone
                  ? '«¿Qué grandes descubrimientos o patrones has notado en estas semanas y cómo sientes que tu perspectiva ha cambiado?»'
                  : '«¿Qué es importante para ti traer a este espacio hoy?»'}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Este espacio nace completamente abierto a tu emergente. No hay temas predeterminados ni respuestas correctas. Conversaremos sobre lo que esté vivo en ti.
              </p>
            </div>

            {/* SECCIÓN CONDICIONAL: COSECHA DE CICLO (CADA 4 SESIONES) */}
            {isCycleMilestone && (
              <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-black dark:text-white" />
                  <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                    Cosecha del Ciclo {currentCycle}
                  </h3>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Hemos completado 4 encuentros. Este espacio está dedicado a integrar la siembra:
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-800 dark:text-neutral-200 space-y-1 font-light">
                  <li>¿Qué descubrimientos o patrones recurrentes has identificado?</li>
                  <li>¿Cómo se ha transformado tu manera de observar tus quiebres y decisiones?</li>
                </ul>
                {currentPostForm?.cycleHarvest && (
                  <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-black border border-black/15 dark:border-white/15 text-xs text-neutral-800 dark:text-neutral-200 font-light">
                    <strong className="font-semibold text-black dark:text-white block mb-0.5">
                      Tu cosecha registrada:
                    </strong>
                    {currentPostForm.cycleHarvest}
                  </div>
                )}
              </div>
            )}

            {/* INFORMACIÓN ESENCIAL DEL PRÓXIMO PASO */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block font-mono">
                Información Esencial del Próximo Paso
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Próximo Encuentro */}
                <div className="p-5 rounded-2xl border border-black/15 dark:border-white/15 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                    <Clock className="w-4 h-4" />
                    <span>Tu Próxima Sesión</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    {formatHumanDate(currentSession.date)}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href={currentSession.meetLink || 'https://meet.google.com/new'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Unirme por Meet</span>
                    </a>

                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Reprogramar</span>
                    </a>
                  </div>
                </div>

                {/* Memoria de Sesión & Cuestionario Posterior */}
                <div className="p-5 rounded-2xl border border-black/15 dark:border-white/15 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                    <FileText className="w-4 h-4" />
                    <span>Memoria y Bitácora Posterior</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    {currentPostForm
                      ? 'Tu memoria de sesión está registrada y lista para consultar.'
                      : 'Registra el emergente y el paso a la acción tras tu encuentro.'}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {currentPostForm ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadMemory(currentPostForm, currentSession)}
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Memoria (PDF)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenBitacora(currentSession)}
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Registrar Bitácora</span>
                      </button>
                    )}

                    {currentPostForm && (
                      <button
                        type="button"
                        onClick={() => handleOpenBitacora(currentSession)}
                        className="px-3.5 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Editar registro
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tema Emergente y Paso a la Acción Registrado */}
              {currentPostForm && (
                <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/60 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      El tema emergente de este encuentro:
                    </span>
                    <p className="text-xs font-medium text-black dark:text-white mt-0.5">
                      {currentPostForm.emergentTopic || currentPostForm.masterJudgmentAndNarrative}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      El paso a la acción acordado:
                    </span>
                    <p className="text-xs font-medium text-black dark:text-white mt-0.5">
                      {currentPostForm.actionStep || currentPostForm.agreedActionItems?.[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. MÓDULO DE PROGRESO INTEGRAL (ESPACIO DEDICADO Y ESTRUCTURADO)          */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-black/15 dark:border-white/15 bg-white dark:bg-black p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                  Módulo de Progreso Integral
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                Tu avance gráfico en el Camino de Transformación, histórico de cuestionarios y material propio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPaymentPortalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Ver Seguimiento Financiero →
            </button>
          </div>

          {/* PARTE A: AVANCE GRÁFICO EN EL "CAMINO DE TRANSFORMACIÓN" (3 CICLOS, 12 ESTACIONES) */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono block">
              1. Tu Ruta Gráfica (12 Estaciones en 3 Ciclos)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((stepNum) => {
                const cycleNum = Math.ceil(stepNum / 4);
                const isMilestone = stepNum === 4 || stepNum === 8 || stepNum === 12;
                const isCompleted = stepNum < currentSessionNumber;
                const isCurrent = stepNum === currentSessionNumber;
                const hasForm = postForms.some((f) => f.sessionNumber === stepNum);

                return (
                  <div
                    key={stepNum}
                    className={`p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                        : isCompleted
                        ? 'bg-neutral-50 dark:bg-neutral-900 border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200'
                        : 'bg-neutral-50/40 dark:bg-neutral-900/30 border-black/5 dark:border-white/5 text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase">
                          E{stepNum.toString().padStart(2, '0')}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-white dark:bg-black animate-pulse" />
                        ) : (
                          <Circle className="w-3 h-3 shrink-0 opacity-40" />
                        )}
                      </div>
                      <div className="font-semibold text-xs mt-1">
                        {isMilestone ? `Cierre C${cycleNum}` : `Sesión ${stepNum}`}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-mono opacity-80">
                      {isCompleted
                        ? (hasForm ? 'Memoria OK' : 'Completada')
                        : isCurrent
                        ? 'Lienzo Activo'
                        : 'Por recorrer'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PARTE B: HISTÓRICO COMPLETO DE RESPUESTAS A CUESTIONARIOS POSTERIORES */}
          <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono block">
                2. Histórico Completo de Respuestas a Cuestionarios ({pastForms.length})
              </span>
            </div>

            {pastForms.length === 0 ? (
              <p className="text-xs text-neutral-500 font-light italic p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10">
                Aún no has finalizado encuentros individuales. Tras tu primera sesión y el llenado del cuestionario posterior, tus reflexiones aparecerán aquí.
              </p>
            ) : (
              <div className="space-y-3">
                {pastForms.map((item) => {
                  const cycleNum = Math.ceil(item.sessionNumber / 4);
                  const isMilestone =
                    item.sessionNumber === 4 || item.sessionNumber === 8 || item.sessionNumber === 12;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/60 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black dark:text-white">
                            Sesión {item.sessionNumber}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Ciclo {cycleNum} {isMilestone ? '(★ Cierre de Ciclo)' : ''}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('es-ES') : 'Registrado'}
                          </span>
                        </div>

                        {/* Botón de descarga de PDF AutoCrat */}
                        <button
                          type="button"
                          onClick={() => handleDownloadMemory(item)}
                          className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar PDF</span>
                        </button>
                      </div>

                      <div className="space-y-1 text-neutral-700 dark:text-neutral-300 font-light">
                        <p>
                          <strong className="font-semibold text-black dark:text-white">Tema Emergente:</strong>{' '}
                          {item.emergentTopic || item.masterJudgmentAndNarrative}
                        </p>
                        {item.discovery && (
                          <p>
                            <strong className="font-semibold text-black dark:text-white">Descubrimiento:</strong>{' '}
                            {item.discovery}
                          </p>
                        )}
                        {item.actionStep && (
                          <p>
                            <strong className="font-semibold text-black dark:text-white">Acción:</strong>{' '}
                            {item.actionStep}
                          </p>
                        )}
                        {item.cycleHarvest && (
                          <div className="mt-1.5 p-2.5 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 text-neutral-900 dark:text-neutral-100">
                            <strong className="font-semibold block text-[11px]">★ Cosecha del Ciclo:</strong>
                            <span>{item.cycleHarvest}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. ACOMPAÑAMIENTO CERCANO: CONTACTO DIRECTO CON EL FACILITADOR           */}
        {/* ========================================================================= */}
        <footer className="p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            {/* Fotografía a color del coach (Único punto cromático) */}
            <img
              src={coachAvatarImg}
              alt="John Fredy Rengifo Basto"
              className="w-12 h-12 rounded-full object-cover border border-black/15 dark:border-white/15 shrink-0"
            />
            <div>
              <div className="font-bold text-black dark:text-white">
                John Fredy Rengifo Basto
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                Master Coach Ontológico • Acompañamiento entre encuentros
              </div>
            </div>
          </div>

          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Mensaje directo por WhatsApp</span>
          </a>
        </footer>
      </main>

      {/* ========================================================================= */}
      {/* 5. MODAL DE CUESTIONARIO POSTERIOR / BITÁCORA                             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <PostSessionWorkbookModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          session={activeSessionForModal}
          client={client}
          isParticipant={true}
          onFormSaved={() => {
            const updatedForms = OntologicalStore.getPostSessionFormsForClient(client.uid);
            setPostForms(updatedForms);
            if (onUserUpdated) onUserUpdated();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE PORTAL DE PAGOS Y SEGUIMIENTO FINANCIERO                      */}
      {/* ========================================================================= */}
      {isPaymentPortalOpen && (
        <PaymentPortalModal
          isOpen={isPaymentPortalOpen}
          onClose={() => setIsPaymentPortalOpen(false)}
          client={client}
          onUserUpdated={() => {
            if (onUserUpdated) onUserUpdated();
          }}
          initialTab="overview"
        />
      )}
    </div>
  );
};
