import React from 'react';
import {
  BookOpen,
  ChevronDown,
  CheckCircle2,
  Smartphone,
  Copy,
  Check,
  MessageCircle,
  Download,
  Video,
  ExternalLink,
  FileSpreadsheet,
  ShieldCheck,
  Brain,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { BRE_B_NU_CONFIG } from '../../services/store';
import { OFFICIAL_FORMS_SHEETS_BASE_MAP } from '../../data/officialFormsSheetsBase';

export interface CoreWorkshopTrack {
  id: string;
  matchIds: string[];
  stageName: string;
  phase: string;
  levelBadge: string;
  accentColor: 'emerald' | 'amber' | 'indigo';
  title: string;
  subtitle: string;
  thematicFocus: string;
  guidingQuestion: string;
  somaticPractice: string;
  meetLink: string;
  defaultDate: string;
  defaultBreakthrough: string;
  defaultCommitments: string;
}

interface ParticipantTalleresModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  accreditedWorkshopsCount: number;
  coreWorkshops: CoreWorkshopTrack[];
  selectedWorkshopId: string;
  onSelectWorkshopId: (id: string) => void;
  isWorkshopAttended: (ws: CoreWorkshopTrack) => boolean;
  getWorkshopMemoryDetails: (ws: CoreWorkshopTrack) => {
    completedAt?: string;
    keyBreakthrough: string;
    commitments: string;
    pdfUrl?: string;
    answers?: Record<string, string | number>;
  };
  onDownloadWorkshopMemory: (ws: CoreWorkshopTrack) => void;
  onCopyPaymentKey: () => void;
  copiedPaymentKey: boolean;
  hasWorkshopsAccess?: boolean;
  enrolledWorkshopIds?: string[];
  onGoToIntegrations?: () => void;
}

export const ParticipantTalleresModule: React.FC<ParticipantTalleresModuleProps> = ({
  isExpanded,
  onToggle,
  accreditedWorkshopsCount,
  coreWorkshops,
  selectedWorkshopId,
  onSelectWorkshopId,
  isWorkshopAttended,
  getWorkshopMemoryDetails,
  onDownloadWorkshopMemory,
  onCopyPaymentKey,
  copiedPaymentKey,
  hasWorkshopsAccess = true,
  enrolledWorkshopIds = [],
  onGoToIntegrations,
}) => {
  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Botón General Largo de Apertura/Cierre */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/30 dark:hover:bg-neutral-900/30 transition-colors select-none group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                Panel de Talleres Ontológicos Vivenciales
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30">
                {accreditedWorkshopsCount} de 3 Talleres Acreditados
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
              Raíz, Tallo y Florecimiento • Integración con Google Meet, Formularios de Inscripción y Hojas de Cálculo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
            {isExpanded ? 'Contraer' : 'Expandir módulo'}
          </span>
          <div
            className={`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Contenido Desplegable */}
      {isExpanded && (
        <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-2 border-t border-black/5 dark:border-white/5 space-y-6">
          {/* Banner de Integración con Google Forms & Sheets */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-neutral-900/50 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-black dark:text-white font-mono uppercase tracking-wider block">
                  Bases Oficiales de Talleres en Google Workspace
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-light">
                  Acuerdos de confidencialidad y bitácoras de cosecha sincronizadas en tiempo real.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir Formulario Oficial de Acuerdo Talleres"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Formulario Acuerdo</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <a
                href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir Bitácora de Cosecha Talleres"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Bitácora Cosecha</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              {onGoToIntegrations && (
                <button
                  type="button"
                  onClick={onGoToIntegrations}
                  className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer hover:opacity-90 shadow-2xs"
                >
                  <span>Ver Expediente Sheets</span>
                </button>
              )}
            </div>
          </div>

          {/* Selector de los 3 Talleres Troncales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coreWorkshops.map((ws) => {
              const attended = isWorkshopAttended(ws);
              const isEnrolled =
                hasWorkshopsAccess ||
                enrolledWorkshopIds.some((id) => ws.matchIds.includes(id) || ws.id === id);
              const isSelected = selectedWorkshopId === ws.id;

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => onSelectWorkshopId(ws.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md ring-2 ring-black/20 dark:ring-white/20'
                      : 'bg-white/40 dark:bg-neutral-900/50 hover:bg-white/70 dark:hover:bg-neutral-800/70 border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {ws.phase}
                      </span>
                      <span className="text-[10px] font-mono opacity-80">{ws.levelBadge}</span>
                    </div>

                    <div className="font-bold text-xs sm:text-sm font-mono tracking-wide leading-tight">
                      {ws.title}
                    </div>

                    <div className="text-[11px] opacity-75 font-light line-clamp-1">
                      {ws.stageName === 'Raíz'
                        ? 'Balance Ontológico'
                        : ws.stageName === 'Tallo'
                        ? 'Soberanía Relacional'
                        : 'Integración & Cosecha'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-current/10">
                    <span className="text-[10px] font-mono opacity-70 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ws.defaultDate}
                    </span>

                    {attended ? (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white text-black dark:bg-black dark:text-white'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        ✓ Acreditado
                      </span>
                    ) : isEnrolled ? (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        ● En Tu Ruta
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-neutral-100/70 dark:bg-neutral-800/70 text-neutral-500'
                        }`}
                      >
                        ○ Por Adquirir
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detalle y Memoria del Taller Seleccionado */}
          {(() => {
            const activeWorkshop =
              coreWorkshops.find((w) => w.id === selectedWorkshopId) || coreWorkshops[0];
            const attended = isWorkshopAttended(activeWorkshop);
            const isEnrolled =
              hasWorkshopsAccess ||
              enrolledWorkshopIds.some(
                (id) => activeWorkshop.matchIds.includes(id) || activeWorkshop.id === id
              );
            const details = getWorkshopMemoryDetails(activeWorkshop);

            return (
              <div className="p-5 sm:p-6 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-black dark:text-white">
                        {activeWorkshop.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-neutral-100/70 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10">
                        {activeWorkshop.levelBadge}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {activeWorkshop.defaultDate}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
                      {activeWorkshop.subtitle}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {attended ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Asistencia Acreditada
                      </span>
                    ) : isEnrolled ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Cupo Incluido en tu Membresía
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono bg-white/20 dark:bg-neutral-800/30 border border-black/10 dark:border-white/10 px-3 py-1 rounded-full">
                        ○ Taller No Adquirido
                      </span>
                    )}
                  </div>
                </div>

                {/* Si el usuario tiene acceso (acreditado o inscrito en programa) */}
                {attended || isEnrolled ? (
                  <div className="space-y-4 text-xs">
                    {/* Tarjetas de Contenido Ontológico */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Quiebre Ontológico Central:
                        </span>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                          {details.keyBreakthrough || activeWorkshop.defaultBreakthrough}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/25 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Compromisos Adquiridos & Declaraciones:
                        </span>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                          {details.commitments || activeWorkshop.defaultCommitments}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xs border border-black/5 dark:border-white/5 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Foco Temático y Práctica Somática:
                        </span>
                        <p className="text-neutral-700 dark:text-neutral-300 font-light leading-relaxed mt-0.5">
                          {activeWorkshop.thematicFocus}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-neutral-600 dark:text-neutral-400 font-light italic text-[11px]">
                          <strong>Anclaje somático:</strong> {activeWorkshop.somaticPractice}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 font-light text-[11px]">
                          <strong>Pregunta guía:</strong> {activeWorkshop.guidingQuestion}
                        </span>
                      </div>
                    </div>

                    {/* Enlaces a Formularios y Google Sheets del Taller */}
                    <div className="p-3.5 rounded-xl bg-neutral-500/5 dark:bg-neutral-500/10 border border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-[11px] flex-wrap">
                        <span className="font-mono text-neutral-500 font-bold uppercase tracking-wider">
                          Integraciones Google:
                        </span>
                        <a
                          href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white inline-flex items-center gap-1 font-mono hover:underline"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Acuerdo Convivencia (Forms)</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <a
                          href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white inline-flex items-center gap-1 font-mono hover:underline"
                        >
                          <Brain className="w-3 h-3 text-indigo-500" />
                          <span>Bitácora Cosecha (Forms)</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Respuestas Sheets</span>
                        </a>
                      </div>
                    </div>

                    {/* Botones de Acción del Taller */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onDownloadWorkshopMemory(activeWorkshop)}
                        className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                        <span>Descargar Memoria del Taller (PDF)</span>
                      </button>

                      <a
                        href={activeWorkshop.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Sala Virtual de Talleres (Meet)</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Taller No Acreditado / No Enrolado: Muestra Pago Bre-B Nu */
                  <div className="space-y-4 text-xs">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/20 dark:bg-neutral-950/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                          <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[11px] font-mono">
                            Taller No Acreditado • Cupo Individual
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                          Formaliza tu cupo para acceder a la sala virtual y compendio vivencial
                        </span>
                      </div>

                      {/* Inversión del Taller */}
                      <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-1 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                          Inversión Taller Individual Vivencial ({activeWorkshop.title})
                        </span>
                        <div className="text-base font-bold text-black dark:text-white">
                          $350.000 COP
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                          Incluye acceso en vivo a la sala virtual de 3 horas, cuaderno de trabajo somático y memoria integral en PDF.
                        </p>
                      </div>

                      {/* Canales Oficiales de Pago */}
                      <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Smartphone className="w-4 h-4 text-black dark:text-white shrink-0" />
                            <div>
                              <div className="text-xs font-semibold text-black dark:text-white">
                                {BRE_B_NU_CONFIG.title} ({BRE_B_NU_CONFIG.bank})
                              </div>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                                Llave oficial para transferencias sin costo desde cualquier entidad
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                              {BRE_B_NU_CONFIG.llave}
                            </span>
                            <button
                              type="button"
                              onClick={onCopyPaymentKey}
                              className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-black dark:text-white font-semibold text-[11px] hover:bg-white/70 dark:hover:bg-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Copiar llave de pago"
                            >
                              {copiedPaymentKey ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span>¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                          Entidades compatibles: Nu, Bancolombia, Nequi, Daviplata, Dale, BBVA, Davivienda y Banco de Bogotá.
                        </div>
                      </div>

                      {/* Botón de Confirmación / Envío de Comprobante por WhatsApp */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                          Envía tu comprobante para reservar tu cupo y habilitar tus accesos:
                        </span>
                        <a
                          href={`https://wa.me/${BRE_B_NU_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                            `Hola Coach John Fredy, adjunto comprobante de pago para reservar cupo en el Taller ${activeWorkshop.title} del programa Certeza.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          <span>Validar Cupo por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
