import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Brain,
  HeartPulse,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { User, UnifiedClientOntologicalCrossData } from '../types';

interface UnifiedFormsSheetsClientViewProps {
  client: User;
  onRefreshParent?: () => void;
}

export const UnifiedFormsSheetsClientView: React.FC<UnifiedFormsSheetsClientViewProps> = ({
  client,
  onRefreshParent,
}) => {
  const [crossData, setCrossData] = useState<UnifiedClientOntologicalCrossData>(() =>
    OntologicalStore.getUnifiedClientOntologicalCrossData(client.email, client.uid, client.name)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setCrossData(
        OntologicalStore.getUnifiedClientOntologicalCrossData(client.email, client.uid, client.name)
      );
    };

    window.addEventListener('rbc-forms-sheets-data-updated', handleUpdate);
    window.addEventListener('rbc-forms-sheets-updated', handleUpdate);
    return () => {
      window.removeEventListener('rbc-forms-sheets-data-updated', handleUpdate);
      window.removeEventListener('rbc-forms-sheets-updated', handleUpdate);
    };
  }, [client.email, client.uid, client.name]);

  const hasAnyData =
    crossData.workshopRegistrations.length > 0 ||
    crossData.individualSessionAgreements.length > 0 ||
    crossData.b2bSessionLogs.length > 0 ||
    crossData.workshopLogs.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Summary Banner */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-500/20 bg-linear-to-b from-emerald-50/15 via-transparent to-transparent space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Expediente Consolidado Google Workspace (4 Fuentes)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {crossData.totalCrossRecords} Registro(s)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                Trazabilidad ontológica cruzada entre formularios de inscripción, acuerdos de sesiones 1 a 1 y bitácoras de aprendizaje.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400">
              ID Coachee: <strong className="text-neutral-800 dark:text-neutral-200">{client.email}</strong>
            </span>
          </div>
        </div>

        {/* Strategic Cross-Source Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* 1. Talleres Registrados */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-500" />
              1. Registro Talleres
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {crossData.workshopRegistrations.length}
              </span>
              <span className="text-[11px] text-gray-500">inscripciones</span>
            </div>
          </div>

          {/* 2. Acuerdos Sesiones 1 a 1 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              2. Acuerdos 1 a 1
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {crossData.individualSessionAgreements.length}
              </span>
              <span className="text-[11px] text-gray-500">firmas legales</span>
            </div>
          </div>

          {/* 3. Bitácoras Sesiones B2B */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Brain className="w-3 h-3 text-indigo-500" />
              3. Bitácoras B2B
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {crossData.b2bSessionLogs.length}
              </span>
              <span className="text-[11px] text-gray-500">sesiones grabadas</span>
            </div>
          </div>

          {/* 4. Bitácoras Talleres */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-amber-500" />
              4. Bitácoras Talleres
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {crossData.workshopLogs.length}
              </span>
              <span className="text-[11px] text-gray-500">cosechas completas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis of Declared Breakdowns and Primary Emotions */}
      {(crossData.synthesis.primaryEmotions.length > 0 ||
        crossData.synthesis.declaredChallenges.length > 0 ||
        crossData.synthesis.committedActions.length > 0) && (
        <div className="glass-panel-opal rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Sintaxis Ontológica Unificada del Coachee (Desde Google Forms & Sheets)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Emociones Predominantes */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-gray-100 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <HeartPulse className="w-3 h-3" />
                Emociones Predominantes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {crossData.synthesis.primaryEmotions.map((emo, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                  >
                    {emo}
                  </span>
                ))}
              </div>
            </div>

            {/* Quiebres y Retos */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-gray-100 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Quiebres & Retos Declarados
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {crossData.synthesis.declaredChallenges.slice(0, 3).map((chal, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 line-clamp-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{chal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compromisos Declarados */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-gray-100 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Acciones Comprometidas
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {crossData.synthesis.committedActions.slice(0, 3).map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 line-clamp-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: REGISTRO A TALLERES */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                1. Registros a Talleres (General)
              </h4>
              <p className="text-[11px] text-gray-500 font-light">
                Formulario de inscripción oficial a eventos y talleres de Rengifo Basto Consultoría.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            {crossData.workshopRegistrations.length} registro(s)
          </span>
        </div>

        {crossData.workshopRegistrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crossData.workshopRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      {reg.matchedWorkshopTitle || 'Taller General Registrado'}
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-white mt-1">
                      {reg.participantName}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{reg.timestamp}</span>
                </div>

                <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                  <p>
                    <strong className="text-gray-400 font-normal">Teléfono:</strong> {reg.phone || 'No registrado'}
                  </p>
                  <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acuerdo de confidencialidad y convivencia aceptado</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-light italic py-2">
            No se registran inscripciones a talleres para este correo en el Sheet correspondiente.
          </p>
        )}
      </div>

      {/* SECTION 2: ACUERDOS SESIONES INDIVIDUALES (1 A 1) */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                2. Acuerdos de Sesiones Individuales & Firma Digital
              </h4>
              <p className="text-[11px] text-gray-500 font-light">
                Acuerdo co-creativo formal con aceptación de términos, firma digital y documento legal.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {crossData.individualSessionAgreements.length} acuerdo(s)
          </span>
        </div>

        {crossData.individualSessionAgreements.length > 0 ? (
          <div className="space-y-3">
            {crossData.individualSessionAgreements.map((agr) => (
              <div
                key={agr.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {agr.fullName}
                    </h5>
                    <span className="text-[11px] font-mono text-gray-500">
                      Fecha de Firma: {agr.timestamp}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold font-mono">
                    Merge Doc: {agr.documentMergeStatus || 'Completado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Firma Digital & Documento / Cédula:
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {agr.digitalSignatureAndIdNumber || 'Firma Registrada'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Autorización de Sesiones Grabadas / IA:
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {agr.audioConsentAccepted ? 'Autorizado para Diagnóstico' : 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-light italic py-2">
            El coachee aún no ha diligenciado el Acuerdo de Sesiones Individuales en Google Forms.
          </p>
        )}
      </div>

      {/* SECTION 3: BITÁCORA SESIONES B2B */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                3. Bitácoras de Sesiones B2B (Liderazgo Directivo)
              </h4>
              <p className="text-[11px] text-gray-500 font-light">
                Indagación de quiebres, decodificación de juicios y compromisos de acompañamiento corporativo.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {crossData.b2bSessionLogs.length} sesión(es)
          </span>
        </div>

        {crossData.b2bSessionLogs.length > 0 ? (
          <div className="space-y-4">
            {crossData.b2bSessionLogs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      {log.city || 'Sesión B2B'}
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {log.fullName}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Desafío Central (Quiebre Ontológico):
                    </span>
                    <p className="text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                      &ldquo;{log.centralChallenge}&rdquo;
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                      Emoción Primaria y Corporalidad:
                    </span>
                    <p className="text-purple-900 dark:text-purple-200 font-medium">
                      {log.primaryEmotion}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      El "Darse Cuenta" (Momento Eureka):
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                      {log.realizationMoment}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Acción y Compromiso Concreto:
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200 font-semibold leading-relaxed">
                      {log.concreteActionCommitment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-light italic py-2">
            No se registran bitácoras de sesiones B2B para este coachee en la hoja de cálculo.
          </p>
        )}
      </div>

      {/* SECTION 4: BITÁCORA TALLERES */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                4. Bitácoras de Talleres (Cosecha Post-Taller)
              </h4>
              <p className="text-[11px] text-gray-500 font-light">
                Evaluaciones de resonancia, quiebres de taller y nueva perspectiva del participante.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {crossData.workshopLogs.length} bitácora(s)
          </span>
        </div>

        {crossData.workshopLogs.length > 0 ? (
          <div className="space-y-4">
            {crossData.workshopLogs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#16161A] border border-gray-200/80 dark:border-neutral-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[10px] font-bold">
                      {log.workshopLevel}
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {log.fullName}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Reto Personal Reconocido:
                    </span>
                    <p className="text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                      {log.personalChallenge}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                      Nueva Perspectiva / Aprendizaje Revelador:
                    </span>
                    <p className="text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                      {log.newDiscovery}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                      Emoción Predominante en el Taller:
                    </span>
                    <p className="text-purple-900 dark:text-purple-200 font-medium">
                      {log.primaryEmotion}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Acción Reto Comprometida:
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200 font-semibold leading-relaxed">
                      {log.concreteChallengeAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-light italic py-2">
            No se registran bitácoras de cosecha de talleres para este participante.
          </p>
        )}
      </div>
    </div>
  );
};
