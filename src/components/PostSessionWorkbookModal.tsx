import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Download,
  Save,
  CheckCircle2,
  Shield,
  HelpCircle,
  Plus,
  Trash2,
  Activity,
  Compass,
  Eye,
  Award,
} from 'lucide-react';
import { Session, User, PostSessionForm } from '../types';
import { OntologicalStore } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';

interface PostSessionWorkbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  client: User | null;
  onFormSaved?: (savedForm: PostSessionForm) => void;
  isParticipant?: boolean;
}

export const PostSessionWorkbookModal: React.FC<PostSessionWorkbookModalProps> = ({
  isOpen,
  onClose,
  session,
  client,
  onFormSaved,
  isParticipant = false,
}) => {
  const [existingForm, setExistingForm] = useState<PostSessionForm | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [workbookTitle, setWorkbookTitle] = useState('');
  const [q1Emotion, setQ1Emotion] = useState('');
  const [q2Judgment, setQ2Judgment] = useState('');
  const [q3Perspective, setQ3Perspective] = useState('');
  const [q4Directiveness, setQ4Directiveness] = useState('');
  const [keyDeclaration, setKeyDeclaration] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([
    'Sostener la presencia reflexiva ante situaciones de sobrecarga.',
    'Registrar en la bitácora somática los impulsos de control o resistencia.',
    'Realizar una pausa de centramiento de 3 minutos antes de comités clave.',
  ]);
  const [newActionItem, setNewActionItem] = useState('');
  const [somaticHomework, setSomaticHomework] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing form data or initialize
  useEffect(() => {
    if (!isOpen || !client) return;

    const currentSessionNum = session?.sessionNumber || client.programProgress || 1;
    setSessionNumber(currentSessionNum);

    const sessionIdToQuery = session?.id || `sess-${client.uid}-${currentSessionNum}`;
    let foundForm = OntologicalStore.getPostSessionFormForSession(sessionIdToQuery);

    // If not found by session id, search by client and session number
    if (!foundForm) {
      const clientForms = OntologicalStore.getPostSessionFormsForClient(client.uid);
      foundForm = clientForms.find((f) => f.sessionNumber === currentSessionNum);
    }

    if (foundForm) {
      setExistingForm(foundForm);
      setWorkbookTitle(foundForm.workbookTitle || `Sesión ${foundForm.sessionNumber}: Arquitectura y Dominio Ontológico`);
      setQ1Emotion(foundForm.coacheeEmotionAndOpenness || '');
      setQ2Judgment(foundForm.masterJudgmentAndNarrative || '');
      setQ3Perspective(foundForm.perspectiveShiftEvidence || '');
      setQ4Directiveness(foundForm.directivenessAndIcfCompetency || '');
      setKeyDeclaration(foundForm.coacheeKeyDeclaration || '');
      setActionItems(
        foundForm.agreedActionItems && foundForm.agreedActionItems.length > 0
          ? foundForm.agreedActionItems
          : [
              'Sostener la presencia reflexiva ante situaciones de sobrecarga.',
              'Registrar en la bitácora somática los impulsos de control o resistencia.',
            ]
      );
      setSomaticHomework(foundForm.somaticHomework || '');
    } else {
      setExistingForm(null);
      // Sensible defaults tailored to the client
      const defaultTitle = client.name.includes('Andrés')
        ? `Sesión ${currentSessionNum}: Deconstrucción de la Autoexigencia & Arquitectura de Confianza`
        : `Sesión ${currentSessionNum}: Reencuadre y Dominio Ontológico`;
      setWorkbookTitle(defaultTitle);
      setQ1Emotion('');
      setQ2Judgment('');
      setQ3Perspective('');
      setQ4Directiveness('');
      setKeyDeclaration('');
      setSomaticHomework('5 minutos diarios de centramiento y respiración consciente al iniciar la jornada.');
    }
    setSavedSuccess(false);
  }, [isOpen, session, client]);

  if (!isOpen || !client) return null;

  const effectiveSession: Session = session || {
    id: `sess-${client.uid}-${sessionNumber}`,
    sessionNumber: sessionNumber,
    clientId: client.uid,
    date: new Date().toISOString(),
    meetLink: 'https://meet.google.com/rbc-sesion',
    status: 'Completada',
    durationMinutes: 60,
    notes: '',
    keyInsights: [],
    actionAgreements: [],
    somaticFocus: '',
    programNodeStep: sessionNumber,
  };

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, newActionItem.trim()]);
    setNewActionItem('');
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleLoadTemplateExample = () => {
    if (client.name.includes('Andrés')) {
      setWorkbookTitle('Deconstrucción de la Omnipotencia & Arquitectura de Confianza Directiva');
      setQ1Emotion(
        'Habitó una fuerte ansiedad encubierta en hiper-racionalización y urgencia operativa. En los primeros 20 minutos mostró resistencia somática (mandíbula apretada, hombros tensos y tendencia a justificar su sobrecarga con métricas). Al espejarle su agotamiento, tuvo una apertura profunda y vulnerable para explorar el origen de su autoexigencia.'
      );
      setQ2Judgment(
        'Juicio Maestro: "Si yo no controlo y resuelvo todo en la empresa, el proyecto colapsará y perderé mi valor como líder". Esta narrativa de omnipotencia estructuraba su resistencia radical a delegar en su equipo directivo.'
      );
      setQ3Perspective(
        'Hacia el cierre de la sesión reconoció conmovido: "Pensaba que delegar era abandonar, pero ahora veo que exigir perfección absoluta es una forma de protegerme del miedo a no ser suficiente". Soltó la tensión visiblemente y acordó ceder el liderazgo del comité operativo de los martes.'
      );
      setQ4Directiveness(
        'En el minuto 43 sentí el impulso de sugerirle una herramienta de gestión de equipos en lugar de sostener el silencio para que él descubriera su propio diseño. Debo cuidar especialmente la Competencia ICF 5 (Mantiene la Presencia) y Competencia 7 (Evoca Conciencia), evitando rescatar al coachee desde el rol de consultor.'
      );
      setKeyDeclaration('Declaro que mi valor como líder radica en habilitar la autonomía de otros y no en cargar con el peso del resultado solitario.');
      setActionItems([
        'Delegar la entrega del informe semanal de operaciones sin intervenir en los borradores intermedios.',
        'Realizar 3 pausas somáticas de centramiento de 3 minutos al día antes de ingresar a comités directivos.',
        'Anotar en la bitácora somática cada vez que surja el impulso automático de microgestión.',
      ]);
      setSomaticHomework('Práctica de enraizamiento: 5 minutos al inicio del día conectando los pies al suelo, soltando el diafragma y la mandíbula antes de encender el ordenador.');
    } else {
      setWorkbookTitle(`Sesión ${sessionNumber}: Claridad Ontológica y Fronteras de Poder Personal`);
      setQ1Emotion(
        'Habitó una emoción de incertidumbre y pesadez en el pecho. Presentó una inicial resistencia racional que se transformó en apertura genuina tras conectar con su respiración diafragmática.'
      );
      setQ2Judgment(
        'Juicio Maestro: "No tengo permiso para decir no sin poner en riesgo mis relaciones profesionales y familiares".'
      );
      setQ3Perspective(
        'El coachee reconoció que poner un límite no es un acto de rechazo sino un acto de cuidado del vínculo y de su propia energía vital.'
      );
      setQ4Directiveness(
        'Estuve cerca de adelantarme a responder su pregunta sobre cómo formular un límite. Debo cuidar la Competencia ICF 6 (Escucha Activa) y otorgar más espacio al silencio.'
      );
      setKeyDeclaration('Declaro mi soberanía para cuidar mi tiempo con límites impecables y amorosos.');
      setActionItems([
        'Practicar la declaración del "No" reflexivo en al menos 2 situaciones cotidianas.',
        'Registrar las sensaciones corporales asociadas al temor al juicio ajeno.',
      ]);
      setSomaticHomework('Pausa somática de 3 minutos al mediodía para relajar hombros y garganta.');
    }
  };

  const buildFormData = (): PostSessionForm => {
    return {
      id: existingForm?.id || `psf-${effectiveSession.id}-${Date.now()}`,
      sessionId: effectiveSession.id,
      sessionNumber: sessionNumber,
      clientId: client.uid,
      clientName: client.name,
      sessionDate: effectiveSession.date,
      submittedAt: existingForm?.submittedAt || new Date().toISOString(),
      coacheeEmotionAndOpenness: q1Emotion,
      masterJudgmentAndNarrative: q2Judgment,
      perspectiveShiftEvidence: q3Perspective,
      directivenessAndIcfCompetency: q4Directiveness,
      workbookTitle: workbookTitle || `Sesión ${sessionNumber}: Cuaderno de Trabajo Ontológico`,
      coacheeKeyDeclaration: keyDeclaration,
      agreedActionItems: actionItems,
      somaticHomework: somaticHomework,
    };
  };

  const handleSave = () => {
    const formData = buildFormData();
    OntologicalStore.savePostSessionForm(formData);
    setExistingForm(formData);
    setSavedSuccess(true);
    if (onFormSaved) {
      onFormSaved(formData);
    }
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleGeneratePDF = () => {
    const formData = buildFormData();
    // Save first to ensure persistence
    OntologicalStore.savePostSessionForm(formData);
    setExistingForm(formData);
    if (onFormSaved) {
      onFormSaved(formData);
    }
    // Trigger PDF generation
    PDFGenerator.generateSessionWorkbookPDF(formData, client, effectiveSession);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white/90 dark:bg-[#151518]/90 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-start justify-between gap-4 bg-white/40 dark:bg-neutral-900/40 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                Sesión Individual {sessionNumber}
              </span>
              {isParticipant ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Cuestionario para Construir tu Cuaderno
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Taller 100% Pagado ({client.totalInvested || '$1.500.000 COP'})
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600" />
                Consultoría Ontológica 1 a 1
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700 dark:text-neutral-300" />
              {isParticipant
                ? 'Cuestionario de Sesión • Construye tu Cuaderno de Trabajo'
                : 'Espacio Post-Sesión & Generación de Cuaderno de Trabajo'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              {isParticipant
                ? 'Responde estas preguntas tras tu sesión 1 a 1 para estructurar tus aprendizajes y descargar tu Cuaderno en PDF.'
                : `Coachee: ${client.name} • ${client.title || 'Participante'} • Sesión ${sessionNumber}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadTemplateExample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-medium cursor-pointer transition-colors"
              title="Cargar ejemplo ontológico sugerido para facilitar el llenado"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Cargar Ejemplo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Cuestionario guardado con éxito. Ya puedes descargar tu Cuaderno de Trabajo en PDF con tus respuestas integradas.
                </span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
                <span>Descargar Cuaderno PDF</span>
              </button>
            </div>
          )}

          {/* Eje Temático del Cuaderno */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 space-y-2">
            <label className="block text-xs font-semibold text-black dark:text-white">
              {isParticipant
                ? 'Título o Eje Temático de tu Sesión'
                : 'Título o Eje Temático del Cuaderno de Trabajo (Para el Coachee)'}
            </label>
            <input
              type="text"
              value={workbookTitle}
              onChange={(e) => setWorkbookTitle(e.target.value)}
              placeholder="Ej: Deconstrucción de la Omnipotencia & Arquitectura de Confianza Directiva"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Las 4 Preguntas Específicas Post-Sesión */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2">
              <h3 className="font-semibold text-sm text-black dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>{isParticipant ? 'Preguntas Ontológicas de tu Sesión' : 'Formulario Ontológico de Evaluación Post-Sesión'}</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-light">4 Preguntas Clave RBC</span>
            </div>

            {/* PREGUNTA 1 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <label className="text-xs font-semibold text-black dark:text-white leading-relaxed">
                  {isParticipant
                    ? '¿Qué emoción principal te habitó hoy y cuál fue tu nivel de resistencia o apertura para explorarla?'
                    : '¿Qué emoción principal habitó al coachee hoy y cuál fue su nivel de resistencia o apertura para explorarla?'}
                </label>
              </div>
              <p className="text-[11px] text-gray-400 font-light pl-7">
                {isParticipant
                  ? 'Indaga tu clima emocional predominante (ansiedad, frustración, culpa, miedo, liviandad, expansión) y cómo respondió tu cuerpo o respiración.'
                  : 'Indaga el clima emocional predominante (ansiedad, frustración, culpa, miedo, resignación) y la disposición corporal para entrar en vulnerabilidad.'}
              </p>
              <textarea
                rows={3}
                value={q1Emotion}
                onChange={(e) => setQ1Emotion(e.target.value)}
                placeholder={isParticipant ? "Describe la emoción que sentiste, cómo se manifestó en tu cuerpo y cómo transitaste hacia una mayor apertura o calma..." : "Describe la emoción que habitó en el encuentro, las manifestaciones somáticas del coachee y cómo transitó de la resistencia a la apertura..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* PREGUNTA 2 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <label className="text-xs font-semibold text-black dark:text-white leading-relaxed">
                  {isParticipant
                    ? '¿Cuál fue tu juicio maestro, la narrativa o la creencia limitante que estructuró tu conversación?'
                    : '¿Cuál fue el juicio maestro, la narrativa o la creencia limitante que estructuró su discurso durante la sesión?'}
                </label>
              </div>
              <p className="text-[11px] text-gray-400 font-light pl-7">
                {isParticipant
                  ? 'Identifica tus mandatos o interpretaciones automáticas (ej: "Si no lo hago yo, nadie lo hará", "Decir no es defraudar", "No puedo fallar") que condicionaron tus explicaciones.'
                  : 'Identifica el mandato de certeza o transparencia (ej: "Si no lo hago yo, nadie lo hará bien", "Decir no es defraudar") que determinó sus explicaciones.'}
              </p>
              <textarea
                rows={3}
                value={q2Judgment}
                onChange={(e) => setQ2Judgment(e.target.value)}
                placeholder={isParticipant ? "Escribe la creencia medular o mandato que reconoces que ha estado limitando tu accionar o generando sobrecarga..." : "Escribe la frase textual o la creencia medular que sirvió de marco a sus dificultades u obstáculos..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* PREGUNTA 3 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <label className="text-xs font-semibold text-black dark:text-white leading-relaxed">
                  {isParticipant
                    ? '¿Qué cambio de observador experimentaste hoy y qué nueva posibilidad se abre para ti?'
                    : '¿Qué evidencia de cambio de perspectiva o nuevo nivel de consciencia demostró el coachee al finalizar el encuentro?'}
                </label>
              </div>
              <p className="text-[11px] text-gray-400 font-light pl-7">
                {isParticipant
                  ? 'Describe tu momento de "darse cuenta" o quiebre lúcido, los cambios en tu estado de ánimo o las decisiones nuevas que ahora puedes tomar.'
                  : 'Describe el momento de "insight" o quiebre lúcido, cambios en el tono de voz, relajación corporal o compromisos nuevos de acción.'}
              </p>
              <textarea
                rows={3}
                value={q3Perspective}
                onChange={(e) => setQ3Perspective(e.target.value)}
                placeholder={isParticipant ? "¿Qué reconoces hoy que antes no podías ver? ¿Qué nueva acción o postura es posible ahora para ti?..." : "¿Qué declaró el coachee hacia el cierre? ¿Qué nueva posibilidad reconoció que antes era invisible para él/ella?..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* PREGUNTA 4 */}
            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <label className="text-xs font-semibold text-amber-950 dark:text-amber-200 leading-relaxed">
                  {isParticipant
                    ? 'Foco de Aprendizaje Ontológico & Presencia en la Sesión'
                    : '¿En qué momento de la sesión fui más directivo de lo necesario y qué competencia ICF debo cuidar más en nuestro próximo encuentro?'}
                </label>
              </div>
              <p className="text-[11px] text-amber-800/70 dark:text-amber-400/80 font-light pl-7">
                {isParticipant
                  ? '¿Qué momento de silencio, pregunta reflexiva de John Fredy o indagación corporal sentiste que abrió tu mayor entendimiento?'
                  : 'Auto-observación y supervisión ética del Coach: Presencia, silencio fértil, indagación poderosa vs. dar consejos o imponer soluciones.'}
              </p>
              <textarea
                rows={3}
                value={q4Directiveness}
                onChange={(e) => setQ4Directiveness(e.target.value)}
                placeholder={isParticipant ? "Reflexiona sobre el acompañamiento ontológico: ¿Qué distinción o pregunta tuvo el impacto más profundo en ti?..." : "Reflexiona sobre tu postura como coach: ¿Cuándo sentiste la urgencia de rescatar al coachee? ¿Qué competencia (ICF 5: Mantiene la presencia, ICF 7: Evoca conciencia) requiere mayor impecabilidad?..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-amber-300 dark:border-amber-800/60 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Sección: Plan y Cuaderno Práctico para el Coachee */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-2">
              <h3 className="font-semibold text-sm text-black dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{isParticipant ? 'Tu Plan y Acuerdos de Acción' : 'Cuaderno Práctico de Integración (Para el Coachee)'}</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-light">Se incluye en tu PDF descargable</span>
            </div>

            {/* Declaración Central */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black dark:text-white">
                {isParticipant
                  ? 'Declaración Clave de tu Sesión (Tu Quiebre o Compromiso Central)'
                  : 'Declaración Ontológica Central de Aprendizaje'}
              </label>
              <input
                type="text"
                value={keyDeclaration}
                onChange={(e) => setKeyDeclaration(e.target.value)}
                placeholder="Ej: Declaro que mi valor como líder radica en habilitar a otros y no en la sobrecarga solitaria."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Lista de Acciones y Compromisos */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-black dark:text-white">
                {isParticipant ? 'Tus Compromisos de Acción & Conversaciones Comprometidas' : 'Compromisos de Acción & Conversaciones Comprometidas'}
              </label>

              <div className="space-y-1.5">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300"
                  >
                    <span className="flex-1 font-light leading-relaxed">
                      <strong className="font-medium mr-1 text-black dark:text-white">{idx + 1}.</strong> {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActionItem())}
                  placeholder="Escribir nuevo compromiso o práctica..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-hidden focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 text-xs font-medium text-black dark:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            {/* Protocolo Somático */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>{isParticipant ? 'Tu Práctica Somática y Corporal de Anclaje Quincenal' : 'Protocolo Somático y Corporal de Anclaje Quincenal'}</span>
              </label>
              <textarea
                rows={2}
                value={somaticHomework}
                onChange={(e) => setSomaticHomework(e.target.value)}
                placeholder="Ej: Pausa somática de enraizamiento de 5 minutos antes de iniciar la jornada..."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tus respuestas quedan guardadas y se integran automáticamente en tu Cuaderno PDF.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-xs font-semibold text-black dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-gray-600 dark:text-neutral-400" />
              <span>{isParticipant ? 'Guardar Cuestionario' : 'Guardar Formulario'}</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePDF}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
              <span>Descargar Cuaderno PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
