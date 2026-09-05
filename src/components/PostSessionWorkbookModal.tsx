import React, { useState, useEffect } from 'react';
import { User, Session, PostSessionForm } from '../types';
import { OntologicalStore } from '../services/store';
import { PDFGenerator } from '../utils/pdfGenerator';
import {
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  Download,
  Save,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  HelpCircle,
  Clock,
  Sparkle,
} from 'lucide-react';

interface PostSessionWorkbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Session | null;
  client: User;
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

  // Formulario Simplificado 1 a 1 (Estructura Orgánica sin objetivos forzados)
  const [emergentTopic, setEmergentTopic] = useState('');
  const [actionStep, setActionStep] = useState('');
  const [cycleHarvest, setCycleHarvest] = useState('');

  // Diagnóstico Complementario ICF / Somático
  const [showAdvancedIcf, setShowAdvancedIcf] = useState(false);
  const [q1Emotion, setQ1Emotion] = useState('');
  const [q2Judgment, setQ2Judgment] = useState('');
  const [q3Perspective, setQ3Perspective] = useState('');
  const [q4Directiveness, setQ4Directiveness] = useState('');
  const [somaticHomework, setSomaticHomework] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Reglas de Ciclos (Cada 4 encuentros)
  const isCycleMilestone = sessionNumber === 4 || sessionNumber === 8 || sessionNumber === 12;
  const currentCycleNumber = Math.ceil(sessionNumber / 4);
  const cyclePhaseLabel = isCycleMilestone ? 'Fase de Consolidación (Cierre de Ciclo)' : 'Fase de Exploración Libre';

  // Load existing form data or initialize
  useEffect(() => {
    if (!isOpen || !client) return;

    const currentSessionNum = session?.sessionNumber || client.programProgress || 1;
    setSessionNumber(currentSessionNum);

    const sessionIdToQuery = session?.id || `sess-${client.uid}-${currentSessionNum}`;
    let foundForm = OntologicalStore.getPostSessionFormForSession(sessionIdToQuery);

    if (!foundForm) {
      const clientForms = OntologicalStore.getPostSessionFormsForClient(client.uid);
      foundForm = clientForms.find((f) => f.sessionNumber === currentSessionNum);
    }

    if (foundForm) {
      setExistingForm(foundForm);
      setWorkbookTitle(foundForm.workbookTitle || `Sesión ${foundForm.sessionNumber} • Registro Ontológico 1 a 1`);
      setEmergentTopic(foundForm.emergentTopic || foundForm.masterJudgmentAndNarrative || '');
      setActionStep(foundForm.actionStep || (foundForm.agreedActionItems?.[0]) || '');
      setCycleHarvest(foundForm.cycleHarvest || '');
      setQ1Emotion(foundForm.coacheeEmotionAndOpenness || '');
      setQ2Judgment(foundForm.masterJudgmentAndNarrative || '');
      setQ3Perspective(foundForm.perspectiveShiftEvidence || '');
      setQ4Directiveness(foundForm.directivenessAndIcfCompetency || '');
      setSomaticHomework(foundForm.somaticHomework || '');
    } else {
      setExistingForm(null);
      const defaultTitle = isCycleMilestone
        ? `Sesión ${currentSessionNum} • Cierre del Ciclo ${currentCycleNumber} & Cosecha Ontológica`
        : `Sesión ${currentSessionNum} • Encuentro Individual 1 a 1`;
      setWorkbookTitle(defaultTitle);
      setEmergentTopic('');
      setActionStep('');
      setCycleHarvest('');
      setQ1Emotion('');
      setQ2Judgment('');
      setQ3Perspective('');
      setQ4Directiveness('');
      setSomaticHomework('Pausa reflexiva de 3 minutos al iniciar el día para enraizar presencia.');
    }
    setSavedSuccess(false);
  }, [isOpen, session, client, sessionNumber]);

  if (!isOpen || !client) return null;

  const effectiveSession: Session = session || {
    id: `sess-${client.uid}-${sessionNumber}`,
    sessionNumber: sessionNumber,
    clientId: client.uid,
    date: new Date().toISOString(),
    status: 'scheduled',
    meetLink: 'https://meet.google.com/new',
    durationMinutes: 60,
    notes: '',
    keyInsights: [],
    actionAgreements: [],
    somaticFocus: '',
    programNodeStep: sessionNumber,
  };

  const handleLoadTemplateExample = () => {
    if (client.name.includes('Andrés')) {
      setWorkbookTitle('Deconstrucción de la Omnipotencia & Arquitectura de Confianza Directiva');
      setEmergentTopic('La dificultad para soltar el control en comités directivos y la sensación de que pedir perfección protege contra el miedo a no ser suficiente.');
      setActionStep('Ceder la conducción del comité operativo de los martes a la líder de operaciones y realizar una pausa de 3 minutos antes de entrar a reuniones complejas.');
      if (isCycleMilestone) {
        setCycleHarvest('Grandes descubrimientos: Noté el patrón recurrente de querer resolverlo todo en soledad. Mi forma de ver las cosas ha cambiado: ahora entiendo que poner límites y delegar no es abandono, sino una forma de habilitar la autonomía de otros y cuidar el vínculo.');
      }
      setQ1Emotion('Ansiedad encubierta en hiper-racionalización. Apertura vulnerable tras notar el agotamiento corporal.');
      setQ2Judgment('Juicio Maestro: "Si yo no controlo todo, el proyecto colapsará y perderé mi valor como líder".');
      setQ3Perspective('Reconoció que exigir perfección es protegerse del miedo. Delegar es habilitar autonomía.');
      setQ4Directiveness('Sostener presencia y el silencio sin buscar rescatar con soluciones antes de tiempo (ICF 5 y 7).');
    } else {
      setWorkbookTitle(
        isCycleMilestone
          ? `Sesión ${sessionNumber} • Cierre del Ciclo ${currentCycleNumber} & Cosecha Ontológica`
          : `Sesión ${sessionNumber} • Exploración del Emergente Ontológico`
      );
      setEmergentTopic('La incomodidad al decir que "no" en peticiones laborales y el temor a deteriorar las relaciones profesionales clave.');
      setActionStep('Practicar la declaración del "No reflexivo" en al menos 2 situaciones cotidianas y observar la respuesta corporal.');
      if (isCycleMilestone) {
        setCycleHarvest('He descubierto que el temor al juicio de los demás me mantenía en sobreexigencia constante. Hoy observo mis compromisos desde el autocuidado y la soberanía personal.');
      }
      setQ1Emotion('Incertidumbre y tensión en el pecho que cedió al respirar conscientemente.');
      setQ2Judgment('Juicio Maestro: "Decir no es poner en riesgo mis relaciones".');
      setQ3Perspective('Poner límites es un acto de cuidado del vínculo y no de rechazo.');
      setQ4Directiveness('Cuidar la escucha activa y brindar mayor tiempo al silencio (ICF 6).');
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
      // Campos simplificados 1 a 1
      emergentTopic: emergentTopic || 'Exploración abierta del observador y el emergente del encuentro',
      actionStep: actionStep || 'Sostener la presencia reflexiva y acuerdos acordados en la sesión',
      cycleHarvest: isCycleMilestone ? cycleHarvest : undefined,
      isCycleMilestone: isCycleMilestone,
      cycleNumber: currentCycleNumber,
      sessionPhase: isCycleMilestone ? 'consolidation' : 'exploration',
      openingQuestion: '¿Qué es importante para ti traer a este espacio hoy?',
      // Compatibilidad con diagnósticos ontológicos
      coacheeEmotionAndOpenness: q1Emotion || 'Apertura y presencia durante la conversación ontológica.',
      masterJudgmentAndNarrative: q2Judgment || emergentTopic || 'Narrativa examinada durante la sesión.',
      perspectiveShiftEvidence: q3Perspective || actionStep || 'Distinción y cambio de observador alcanzado.',
      directivenessAndIcfCompetency: q4Directiveness || 'Presencia plena y escucha activa sin directividad forzada (ICF).',
      workbookTitle: workbookTitle || (isCycleMilestone ? `Sesión ${sessionNumber} • Cierre Ciclo ${currentCycleNumber}` : `Sesión ${sessionNumber} • Memoria 1 a 1`),
      coacheeKeyDeclaration: actionStep || 'Compromiso reflexivo y presencia consciente.',
      agreedActionItems: actionStep ? [actionStep] : ['Pausa de centramiento reflexivo'],
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
    OntologicalStore.savePostSessionForm(formData);
    setExistingForm(formData);
    if (onFormSaved) {
      onFormSaved(formData);
    }
    PDFGenerator.generateSessionWorkbookPDF(formData, client, effectiveSession);
  };

  return (
    <div id="post-session-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-black border border-black shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Strict B&W Minimalist */}
        <div className="px-6 py-5 border-b border-black flex items-start justify-between gap-4 bg-white shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white">
                Sesión {sessionNumber} de 12
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-medium tracking-wide border border-black text-black">
                Ciclo {currentCycleNumber} • {cyclePhaseLabel}
              </span>
              {isCycleMilestone && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-black text-white">
                  ★ Hito de Cierre de Ciclo
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-black flex items-center gap-2 pt-1">
              <FileText className="w-5 h-5 text-black" />
              <span>Bitácora de Sesión 1 a 1</span>
            </h2>
            <p className="text-xs text-neutral-600 font-light">
              Participante: <strong>{client.name}</strong> • Espacio orgánico sin objetivos forzados
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadTemplateExample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-black text-black text-xs font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Cargar ejemplo ontológico sugerido"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ejemplo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {savedSuccess && (
            <div className="p-3 border border-black bg-neutral-50 text-black text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Registro guardado con éxito y sincronizado en Firestore.</span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="px-3 py-1 bg-black text-white text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3 h-3 text-white" />
                <span>Descargar Memoria PDF</span>
              </button>
            </div>
          )}

          {/* Guía del Facilitador: Apertura y Presencia */}
          <div className="p-4 border border-black/30 bg-neutral-50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Guía del Facilitador • Enfoque en Presencia
              </span>
              <span className="text-[10px] text-neutral-500">Sin objetivos predeterminados</span>
            </div>
            <p className="text-xs font-semibold text-black italic">
              "¿Qué es importante para ti traer a este espacio hoy?"
            </p>
            <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
              El espacio se configura como un lienzo en blanco para acompañar el emergente del participante, respetando su ritmo y lo que traiga vivo al encuentro.
            </p>
          </div>

          {/* FORMULARIO SIMPLIFICADO: 3 CAMPOS PRINCIPALES */}
          <div className="space-y-4">
            {/* Campo 1: Número de Sesión */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-black">
                Campo 1: Número de Sesión (1 a 12)
              </label>
              <select
                value={sessionNumber}
                onChange={(e) => setSessionNumber(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-black text-xs text-black focus:outline-hidden focus:ring-1 focus:ring-black cursor-pointer font-medium"
              >
                <optgroup label="Ciclo 1 (Semanas 1 a 4)">
                  <option value={1}>Sesión 1 • Ciclo 1 (Exploración Libre)</option>
                  <option value={2}>Sesión 2 • Ciclo 1 (Exploración Libre)</option>
                  <option value={3}>Sesión 3 • Ciclo 1 (Exploración Libre)</option>
                  <option value={4}>Sesión 4 • Ciclo 1 (★ Cierre de Ciclo & Cosecha)</option>
                </optgroup>
                <optgroup label="Ciclo 2 (Semanas 5 a 8)">
                  <option value={5}>Sesión 5 • Ciclo 2 (Exploración Libre)</option>
                  <option value={6}>Sesión 6 • Ciclo 2 (Exploración Libre)</option>
                  <option value={7}>Sesión 7 • Ciclo 2 (Exploración Libre)</option>
                  <option value={8}>Sesión 8 • Ciclo 2 (★ Cierre de Ciclo & Cosecha)</option>
                </optgroup>
                <optgroup label="Ciclo 3 (Semanas 9 a 12)">
                  <option value={9}>Sesión 9 • Ciclo 3 (Exploración Libre)</option>
                  <option value={10}>Sesión 10 • Ciclo 3 (Exploración Libre)</option>
                  <option value={11}>Sesión 11 • Ciclo 3 (Exploración Libre)</option>
                  <option value={12}>Sesión 12 • Ciclo 3 (★ Cierre de Ciclo & Cosecha Final)</option>
                </optgroup>
              </select>
            </div>

            {/* Campo 2: El Tema Emergente */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Campo 2: El Tema Emergente
                </label>
                <span className="text-[11px] text-neutral-500">¿De qué eligió hablar el cliente hoy?</span>
              </div>
              <textarea
                rows={3}
                value={emergentTopic}
                onChange={(e) => setEmergentTopic(e.target.value)}
                placeholder="Registra lo que el participante trajo vivo a este espacio (quiebre, narrativa, situación o pregunta central)..."
                className="w-full px-3.5 py-2.5 bg-white border border-black text-xs text-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black leading-relaxed"
              />
            </div>

            {/* Campo 3: El Paso a la Acción */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Campo 3: El Paso a la Acción
                </label>
                <span className="text-[11px] text-neutral-500">¿Qué decidió hacer con lo que descubrió?</span>
              </div>
              <textarea
                rows={2}
                value={actionStep}
                onChange={(e) => setActionStep(e.target.value)}
                placeholder="Compromiso concreto, conversación comprometida o práctica reflexiva acordada para su vida cotidiana..."
                className="w-full px-3.5 py-2.5 bg-white border border-black text-xs text-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black leading-relaxed"
              />
            </div>

            {/* LÓGICA CONDICIONAL: CIERRE DE CICLO (SESIONES 4, 8 Y 12) */}
            {isCycleMilestone && (
              <div className="p-4 border-2 border-black bg-neutral-50 space-y-3 animate-fade-in">
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-black/20">
                  <div>
                    <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest inline-block mb-1">
                      Campo Condicional Activado
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-black flex items-center gap-1.5">
                      <span>Cosecha del Ciclo {currentCycleNumber} (Sesión {sessionNumber})</span>
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-600 font-medium">Consolidación</span>
                </div>

                <div className="space-y-1.5 text-neutral-700 bg-white p-3 border border-black/20">
                  <p className="text-[11px] font-semibold text-black">Preguntas de Cosecha para el Participante:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] font-light text-neutral-800">
                    <li>"¿Qué grandes descubrimientos o patrones has notado en estas últimas semanas?"</li>
                    <li>"¿Cómo sientes que tu forma de ver las cosas ha cambiado desde que empezamos este ciclo?"</li>
                  </ul>
                </div>

                <textarea
                  rows={4}
                  value={cycleHarvest}
                  onChange={(e) => setCycleHarvest(e.target.value)}
                  placeholder="Registra aquí la cosecha del ciclo: patrones descubiertos, cambios en la forma de mirar y aprendizajes consolidados..."
                  className="w-full px-3.5 py-2.5 bg-white border border-black text-xs text-black placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-black leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Acordeón Opcional: Supervisión ICF & Diagnóstico Somático Complementario */}
          <div className="border border-neutral-300">
            <button
              type="button"
              onClick={() => setShowAdvancedIcf(!showAdvancedIcf)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-black" />
                <span>Supervisión ICF y Observación Somática (Opcional)</span>
              </span>
              {showAdvancedIcf ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvancedIcf && (
              <div className="p-4 space-y-3 bg-white border-t border-neutral-200">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-800 mb-1">
                    Emoción somática y nivel de apertura del participante:
                  </label>
                  <input
                    type="text"
                    value={q1Emotion}
                    onChange={(e) => setQ1Emotion(e.target.value)}
                    placeholder="Ej: Ansiedad encubierta en prisa; apertura sensible tras silenciar el juicio."
                    className="w-full px-3 py-1.5 border border-neutral-400 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-800 mb-1">
                    Juicio maestro o narrativa limitante identificada:
                  </label>
                  <input
                    type="text"
                    value={q2Judgment}
                    onChange={(e) => setQ2Judgment(e.target.value)}
                    placeholder="Ej: 'Si no lo controlo yo, nadie lo hará bien'."
                    className="w-full px-3 py-1.5 border border-neutral-400 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-800 mb-1">
                    Evidencia de nuevo nivel de conciencia / cambio de observador:
                  </label>
                  <input
                    type="text"
                    value={q3Perspective}
                    onChange={(e) => setQ3Perspective(e.target.value)}
                    placeholder="Ej: Distinguió delegar de abandonar; asumió la soberanía de poner límites."
                    className="w-full px-3 py-1.5 border border-neutral-400 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-800 mb-1">
                    Supervisión de presencia del facilitador (Competencias ICF):
                  </label>
                  <input
                    type="text"
                    value={q4Directiveness}
                    onChange={(e) => setQ4Directiveness(e.target.value)}
                    placeholder="Ej: Sostener silencio fértil sin rescatar al cliente desde el rol de consultor."
                    className="w-full px-3 py-1.5 border border-neutral-400 text-xs text-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Strict B&W */}
        <div className="px-6 py-4 border-t border-black bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-neutral-600">
            Sincronización invisible con Google Cloud Firestore y Google Drive.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-black bg-white text-black font-semibold text-xs hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Bitácora</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePDF}
              className="px-4 py-2 bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Descargar Memoria (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
