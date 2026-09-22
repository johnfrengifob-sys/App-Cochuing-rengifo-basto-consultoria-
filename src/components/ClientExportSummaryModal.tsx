import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { User, Session, FormSubmission, AIInsight, PostSessionForm } from '../types';
import { OntologicalStore } from '../services/store';
import { safeCopyToClipboard } from '../utils/clipboard';

interface ClientExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: User;
  clients?: User[];
  onSelectClient?: (clientId: string) => void;
  sessions?: Session[];
  forms?: FormSubmission[];
  insights?: AIInsight[];
}

export const ClientExportSummaryModal: React.FC<ClientExportSummaryModalProps> = ({
  isOpen,
  onClose,
  client,
  clients = [],
  onSelectClient,
  sessions: propSessions,
  forms: propForms,
  insights: propInsights,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'json'>('text');
  const [copiedType, setCopiedType] = useState<'text' | 'json' | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Fetch or resolve client-related data
  const currentSessions = useMemo(() => {
    if (propSessions && propSessions.length > 0) return propSessions;
    return client?.uid ? OntologicalStore.getSessionsForClient(client.uid) : [];
  }, [propSessions, client?.uid]);

  const currentForms = useMemo(() => {
    if (propForms && propForms.length > 0) return propForms;
    return client?.uid ? OntologicalStore.getFormsForClient(client.uid) : [];
  }, [propForms, client?.uid]);

  const currentInsights = useMemo(() => {
    if (propInsights && propInsights.length > 0) return propInsights;
    return client?.uid ? OntologicalStore.getInsightsForClient(client.uid) : [];
  }, [propInsights, client?.uid]);

  const postSessionForms = useMemo(() => {
    return client?.uid ? OntologicalStore.getPostSessionFormsForClient(client.uid) : [];
  }, [client?.uid]);

  // Compute calculated metrics
  const completedSessions = currentSessions.filter((s) => s.status === 'completed' || s.status === 'Completada');
  const scheduledSessions = currentSessions.filter((s) => s.status === 'scheduled');
  const otherSessions = currentSessions.filter((s) => s.status !== 'completed' && s.status !== 'Completada' && s.status !== 'scheduled');
  const progressRatio = client?.programProgress || (completedSessions.length > 0 ? completedSessions.length : 1);
  const progressPercent = Math.min(100, Math.round((progressRatio / 6) * 100));

  // Build Structured JSON Object
  const exportJsonObject = useMemo(() => {
    const now = new Date().toISOString();
    return {
      sistema: 'Rengifo Basto Consultoría Ontológica',
      exportadoEl: now,
      coachee: {
        id: client.uid,
        nombre: client.name,
        email: client.email,
        telefono: client.phone || 'No registrado',
        empresa: client.company || 'Particular',
        cargo: client.title || 'Coachee Ejecutivo',
        estado: client.status || 'active',
        fechaIngreso: client.joinedAt || 'No especificada',
        ultimaActividad: client.lastActivityAt || now,
        quiebrePrincipal: client.primaryBreakdown || 'No especificado aún',
        inversionTotal: client.totalInvested || client.programFee || '$1.500.000 COP',
        estadoPago: client.paymentStatus || 'Pago Único',
        nivelAcceso: client.programAccessLevel || 'premium',
        progresoPrograma: {
          etapaActual: progressRatio,
          etapaTotal: 6,
          porcentaje: `${progressPercent}%`,
          sesionesTotales: currentSessions.length,
          sesionesCompletadas: completedSessions.length,
          sesionesProgramadas: scheduledSessions.length,
          sesionesOtras: otherSessions.length,
        },
        talleresAcreditados: client.completedWorkshopIds || client.attendedWorkshopIds || [],
        seguimientoSemanalActivo: client.weeklyFollowupActive ?? true,
      },
      sesiones: currentSessions.map((s, idx) => {
        const postForm = postSessionForms.find((pf) => pf.sessionId === s.id || pf.sessionNumber === (s.sessionNumber || idx + 1));
        return {
          id: s.id,
          numeroSesion: s.sessionNumber || idx + 1,
          tipo: s.sessionType || 'sesion_1_a_1',
          titulo: s.title || `Sesión #${s.sessionNumber || idx + 1}`,
          fecha: s.date || s.scheduledDate || 'Por agendar',
          hora: s.scheduledTime || '',
          duracionMinutos: s.durationMinutes || 60,
          estado: s.status,
          focoOntologico: s.ontologicalFocus || s.sessionGoal || 'Exploración de quiebres y coherencia',
          notasEjecutivas: s.notes || '',
          compromisosAcordados: s.actionAgreements || [],
          insightsClave: s.keyInsights || [],
          enlaceMeet: s.meetLink || '',
          estaPagada: s.isPaid ?? true,
          bitacoraPostSesion: postForm
            ? {
                fechaEvaluacion: postForm.sessionDate,
                quiebreTrascendido: postForm.keyBreakthrough || postForm.discovery || '',
                temaEmergente: postForm.emergentTopic || '',
                emocionYApertura: postForm.coacheeEmotionAndOpenness || '',
                juicioMaestro: postForm.masterJudgmentAndNarrative || '',
                compromisoAccion: postForm.actionCommitment || postForm.actionStep || '',
                cambioPerspectiva: postForm.perspectiveShiftEvidence || '',
                tareaSomatica: postForm.somaticHomework || '',
              }
            : null,
        };
      }),
      diagnosticoOntologico: currentInsights.length > 0
        ? currentInsights.map((ins) => ({
            id: ins.id,
            fechaGenerado: ins.generatedAt,
            indicadoresSomaticos: ins.somaticIndicators || '',
            patronesSomaticos: ins.somaticPatterns || [],
            barrerasLinguisticas: ins.linguisticBarriers,
            creenciasLimitantes: ins.limitingBeliefs || [],
            sabiduriaEmocional: ins.emotionalWisdom || '',
            cambioRecomendado: ins.recommendedShift || '',
            preguntasPoderosas: ins.powerfulQuestions || [],
            preguntasAccion: ins.actionQuestions || [],
          }))
        : null,
      formulariosIngresoYReflexion: currentForms.map((f) => ({
        id: f.id,
        nivel: f.level,
        pasoSesion: f.sessionStep,
        fechaEnvio: f.submittedAt,
        emocionCorporal: f.bodyEmotion,
        reflexiones: f.reflections,
        areaQuiebre: f.breakdownArea || '',
        juicioMaestro: f.masterJudgment || '',
        creenciaLimitante: f.limitingBelief || '',
        compromisoAccion: f.actionCommitment || '',
      })),
    };
  }, [client, currentSessions, completedSessions, scheduledSessions, otherSessions, progressRatio, progressPercent, postSessionForms, currentInsights, currentForms]);

  const jsonString = useMemo(() => {
    return JSON.stringify(exportJsonObject, null, 2);
  }, [exportJsonObject]);

  // Build Formatted Text Snippet
  const formattedTextSnippet = useMemo(() => {
    const dividerMajor = '======================================================================';
    const dividerMinor = '----------------------------------------------------------------------';
    const nowFormatted = new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const lines: string[] = [
      dividerMajor,
      'REPORTE EJECUTIVO DE PROGRESO Y SESIONES • RBC ONTOLOGÍA',
      'Rengifo Basto Consultoría Ontológica • Coherencia Lenguaje, Emoción y Cuerpo',
      dividerMajor,
      `Fecha de Emisión: ${nowFormatted}`,
      `Coachee: ${client.name}`,
      `Correo Electrónico: ${client.email}`,
      `Teléfono: ${client.phone || 'No registrado'}`,
      `Organización / Empresa: ${client.company || 'Particular'}`,
      `Cargo: ${client.title || 'Coachee Ejecutivo'}`,
      `Estado: ${client.status === 'active' ? 'ACTIVO (En Acompañamiento)' : client.status === 'waiting' ? 'EN ESPERA' : 'INACTIVO'}`,
      '',
      dividerMinor,
      '1. RESUMEN DE PROGRESO DEL PROGRAMA ONTOLÓGICO',
      dividerMinor,
      `• Nivel / Etapa Actual: Sesión ${progressRatio} de 6 (${progressPercent}% completado)`,
      `• Quiebre Ontológico Central: ${client.primaryBreakdown || 'No especificado aún'}`,
      `• Inversión Acumulada: ${client.totalInvested || client.programFee || '$1.500.000 COP'}`,
      `• Estado de Pago: ${client.paymentStatus || 'Pago Único'}`,
      `• Sesiones Totales Registradas: ${currentSessions.length}`,
      `  - Completadas: ${completedSessions.length}`,
      `  - Programadas: ${scheduledSessions.length}`,
      `  - Otras / En curso: ${otherSessions.length}`,
      `• Talleres Acreditados: ${(client.completedWorkshopIds || client.attendedWorkshopIds || []).length} completados`,
      '',
      dividerMinor,
      '2. HISTORIAL Y BITÁCORA DETALLADA DE SESIONES (1 a 1)',
      dividerMinor,
    ];

    if (currentSessions.length === 0) {
      lines.push('  (No hay sesiones registradas actualmente para este coachee)');
    } else {
      currentSessions.forEach((s, idx) => {
        const num = s.sessionNumber || idx + 1;
        const dateStr = s.date || s.scheduledDate || 'Fecha por coordinar';
        const postForm = postSessionForms.find((pf) => pf.sessionId === s.id || pf.sessionNumber === num);

        lines.push('');
        lines.push(`[SESIÓN #${num}] • ${dateStr} • ESTADO: ${s.status.toUpperCase()}`);
        lines.push(`  • Foco Ontológico: ${s.ontologicalFocus || s.sessionGoal || 'Sesión de exploración y diseño de acciones'}`);
        if (s.notes) {
          lines.push(`  • Observaciones del Coach: ${s.notes}`);
        }
        if (s.actionAgreements && s.actionAgreements.length > 0) {
          lines.push('  • Compromisos de Acción Acordados:');
          s.actionAgreements.forEach((agr) => lines.push(`    - ${agr}`));
        }
        if (s.keyInsights && s.keyInsights.length > 0) {
          lines.push('  • Quiebres e Insights Clave:');
          s.keyInsights.forEach((ins) => lines.push(`    * ${ins}`));
        }
        if (postForm) {
          lines.push('  • Bitácora Post-Sesión:');
          if (postForm.keyBreakthrough) lines.push(`    - Quiebre Trascendido: ${postForm.keyBreakthrough}`);
          if (postForm.emergentTopic) lines.push(`    - Tema Emergente: ${postForm.emergentTopic}`);
          if (postForm.actionCommitment || postForm.actionStep) {
            lines.push(`    - Compromiso Coachee: ${postForm.actionCommitment || postForm.actionStep}`);
          }
          if (postForm.masterJudgmentAndNarrative) {
            lines.push(`    - Juicio Maestro: ${postForm.masterJudgmentAndNarrative}`);
          }
        }
        if (s.meetLink) {
          lines.push(`  • Google Meet: ${s.meetLink}`);
        }
      });
    }

    if (currentInsights.length > 0) {
      const latest = currentInsights[0];
      lines.push('');
      lines.push(dividerMinor);
      lines.push('3. DIAGNÓSTICO ONTOLÓGICO IA MÁS RECIENTE');
      lines.push(dividerMinor);
      if (latest.somaticIndicators) lines.push(`• Indicadores Somáticos / Corporales: ${latest.somaticIndicators}`);
      if (latest.linguisticBarriers) {
        const barriers = Array.isArray(latest.linguisticBarriers) ? latest.linguisticBarriers.join(', ') : latest.linguisticBarriers;
        lines.push(`• Barreras Lingüísticas / Juicios: ${barriers}`);
      }
      if (latest.emotionalWisdom) lines.push(`• Sabiduría Emocional: ${latest.emotionalWisdom}`);
      if (latest.recommendedShift) lines.push(`• Desplazamiento Recomendado: ${latest.recommendedShift}`);
      if (latest.powerfulQuestions && latest.powerfulQuestions.length > 0) {
        lines.push('• Preguntas Poderosas para Próximas Sesiones:');
        latest.powerfulQuestions.forEach((q) => lines.push(`  ? ${q}`));
      }
    }

    lines.push('');
    lines.push(dividerMajor);
    lines.push('Documento de confidencialidad directiva • Rengifo Basto Consultoría Ontológica');
    lines.push(dividerMajor);

    return lines.join('\n');
  }, [client, progressRatio, progressPercent, currentSessions, completedSessions, scheduledSessions, otherSessions, postSessionForms, currentInsights]);

  if (!isOpen) return null;

  // File download helper
  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccessMessage(`¡Archivo "${filename}" descargado con éxito!`);
      setTimeout(() => setDownloadSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Error al descargar archivo:', err);
    }
  };

  // Safe slug for filename
  const safeClientName = client.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');
  const dateSlug = new Date().toISOString().split('T')[0];

  const handleDownloadJson = () => {
    const filename = `reporte_progreso_${safeClientName}_${dateSlug}.json`;
    handleDownloadFile(jsonString, filename, 'application/json');
  };

  const handleDownloadText = () => {
    const filename = `reporte_progreso_${safeClientName}_${dateSlug}.txt`;
    handleDownloadFile(formattedTextSnippet, filename, 'text/plain');
  };

  const handleCopyText = async () => {
    const ok = await safeCopyToClipboard(formattedTextSnippet);
    if (ok) {
      setCopiedType('text');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyJson = async () => {
    const ok = await safeCopyToClipboard(jsonString);
    if (ok) {
      setCopiedType('json');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div
      id="client-export-summary-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="client-export-summary-modal-card"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141417] text-neutral-900 dark:text-neutral-100 rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-neutral-900/30">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-sm shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-black dark:text-white">
                  Exportar Informe de Progreso y Sesiones
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/40">
                  {client.status === 'active' ? 'Coachee Activo' : client.status === 'waiting' ? 'En Espera' : 'Inactivo'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Genera el resumen integral para <strong className="font-semibold text-black dark:text-white">{client.name}</strong> en formato JSON estructurado o texto formateado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Client Switcher if multiple clients available */}
            {clients.length > 1 && onSelectClient && (
              <div className="relative">
                <select
                  value={client.uid}
                  onChange={(e) => onSelectClient(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 cursor-pointer shadow-2xs pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  title="Cambiar Coachee a exportar"
                >
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip of this Client */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:px-6 bg-white dark:bg-[#18181c] border-b border-gray-100 dark:border-neutral-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Avance Programa</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-black dark:text-white">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Etapa {progressRatio} de 6 ({progressPercent}%)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Sesiones 1 a 1</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-black dark:text-white">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>{completedSessions.length} comp. / {currentSessions.length} tot.</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Quiebre Central</span>
            <span className="font-semibold text-black dark:text-white truncate block mt-1" title={client.primaryBreakdown}>
              {client.primaryBreakdown || 'En definición'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Talleres Acreditados</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-black dark:text-white">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{(client.completedWorkshopIds || client.attendedWorkshopIds || []).length} / 3 Talleres</span>
            </div>
          </div>
        </div>

        {/* Feedback message banner if downloaded */}
        {downloadSuccessMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/70 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">{downloadSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccessMessage(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Selector & Main Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 pt-4 pb-2">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl border border-gray-200/60 dark:border-neutral-700/60 self-start">
            <button
              type="button"
              id="tab-export-text"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white dark:bg-[#121214] text-black dark:text-white shadow-2xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resumen en Texto (.txt)</span>
            </button>

            <button
              type="button"
              id="tab-export-json"
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-[#121214] text-black dark:text-white shadow-2xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Archivo Estructurado (.json)</span>
            </button>
          </div>

          {/* Action buttons corresponding to active tab */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'text' ? (
              <>
                <button
                  type="button"
                  id="btn-copy-text-snippet"
                  onClick={handleCopyText}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Copiar reporte en texto al portapapeles"
                >
                  {copiedType === 'text' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">¡Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar al Portapapeles</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-download-text-file"
                  onClick={handleDownloadText}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Descargar como archivo de texto plano"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar TXT</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  id="btn-copy-json-snippet"
                  onClick={handleCopyJson}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-xs font-semibold text-black dark:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Copiar JSON al portapapeles"
                >
                  {copiedType === 'json' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">¡JSON Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-download-json-file"
                  onClick={handleDownloadJson}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Descargar archivo JSON completo para copias de seguridad o integraciones"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo JSON</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto min-h-[280px]">
          {activeTab === 'text' ? (
            <div className="relative rounded-2xl bg-neutral-900 text-neutral-200 p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto border border-neutral-800 shadow-inner max-h-[460px]">
              <div className="absolute top-3 right-3 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                Texto Formateado • {formattedTextSnippet.split('\n').length} líneas
              </div>
              <pre className="whitespace-pre font-mono text-[11px] sm:text-xs selection:bg-emerald-500/30">
                {formattedTextSnippet}
              </pre>
            </div>
          ) : (
            <div className="relative rounded-2xl bg-neutral-950 text-emerald-400 p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto border border-neutral-800 shadow-inner max-h-[460px]">
              <div className="absolute top-3 right-3 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
                Estructura JSON Validada
              </div>
              <pre className="whitespace-pre font-mono text-[11px] sm:text-xs text-neutral-300 selection:bg-emerald-500/30">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-neutral-800/80 bg-gray-50/70 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 dark:text-neutral-400 font-light">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Incluye quiebre ontológico, bitácoras post-sesión, notas directivas e historial completo de sesiones 1 a 1.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer self-end sm:self-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
