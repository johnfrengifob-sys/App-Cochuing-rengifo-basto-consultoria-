import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Smartphone,
  Copy,
  Check,
  MessageCircle,
  Download,
  Video,
  ExternalLink,
  ShieldCheck,
  Brain,
  Sparkles,
  Calendar,
  Table,
  FileText,
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
  hideBanner?: boolean;
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
  isExpanded?: boolean;
  onToggle?: () => void;
  onGoToIntegrations?: () => void;
}

export const ParticipantTalleresModule: React.FC<ParticipantTalleresModuleProps> = ({
  hideBanner = false,
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
}) => {
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
    <div className="space-y-6">
      {/* Encabezado Principal del Módulo de Talleres */}
      {!hideBanner && (
        <div className="p-5 sm:p-6 rounded-3xl border border-black/10 dark:border-white/15 bg-white/20 dark:bg-neutral-950/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm font-sans">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white uppercase tracking-wider">
                  Talleres Ontológicos Troncales
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {accreditedWorkshopsCount} de 3 Acreditados
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-1">
                3 inmersiones vivenciales grupales en vivo: Raíz (Ciclo 1), Tallo (Ciclo 2) y Florecimiento (Ciclo 3).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] px-3 py-1 rounded-xl bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium">
              Encuentros de 3 Horas
            </span>
          </div>
        </div>
      )}

      {/* Selector de los 3 Talleres Troncales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
        {coreWorkshops.map((ws, idx) => {
          const wsAttended = isWorkshopAttended(ws);
          const wsEnrolled =
            hasWorkshopsAccess ||
            enrolledWorkshopIds.some((id) => ws.matchIds.includes(id) || ws.id === id);
          const isSelected = selectedWorkshopId === ws.id;

          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => onSelectWorkshopId(ws.id)}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-white/85 dark:bg-white/95 text-black dark:text-neutral-950 border-white/90 dark:border-white shadow-xl shadow-black/5 dark:shadow-white/10 ring-2 ring-black/10 dark:ring-white/30 backdrop-blur-2xl'
                  : 'bg-white/35 dark:bg-neutral-900/40 hover:bg-white/60 dark:hover:bg-neutral-800/60 border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      isSelected
                        ? 'bg-black/10 text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Taller {idx + 1} • {ws.stageName}
                  </span>
                  <span className="text-[10px] opacity-80 font-medium">{ws.levelBadge}</span>
                </div>

                <div className="font-bold text-sm tracking-tight leading-tight">
                  {ws.title}
                </div>

                <div className="text-xs opacity-75 font-light line-clamp-1">
                  {ws.subtitle}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-current/10">
                <span className="text-[10px] opacity-70 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{ws.defaultDate}</span>
                </span>

                {wsAttended ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    ✓ Acreditado
                  </span>
                ) : wsEnrolled ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    ● En Tu Ruta
                  </span>
                ) : (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isSelected
                        ? 'bg-black/10 text-neutral-800'
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

      {/* Detalle Integral del Taller Seleccionado */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white/25 dark:bg-neutral-950/30 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-sm space-y-6 font-sans">
        {/* Cabecera del Taller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-black dark:text-white">
                {activeWorkshop.title}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 font-medium">
                {activeWorkshop.levelBadge}
              </span>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {activeWorkshop.defaultDate}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
              {activeWorkshop.subtitle}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {attended ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                <span>Asistencia Acreditada</span>
              </span>
            ) : isEnrolled ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 px-3.5 py-1 rounded-full">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Cupo Incluido en tu Membresía</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 bg-white/40 dark:bg-neutral-800/40 border border-black/10 dark:border-white/10 px-3.5 py-1 rounded-full font-medium">
                <span>○ Taller No Adquirido</span>
              </span>
            )}
          </div>
        </div>

        {/* Si el usuario tiene acceso (Acreditado o Inscrito) */}
        {attended || isEnrolled ? (
          <div className="space-y-5 text-xs">
            {/* Quiebre Ontológico & Declaraciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-neutral-900/50 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Quiebre Ontológico Central:
                </span>
                <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                  {details.keyBreakthrough || activeWorkshop.defaultBreakthrough}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-neutral-900/50 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Compromisos Adquiridos & Declaraciones:
                </span>
                <p className="text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                  {details.commitments || activeWorkshop.defaultCommitments}
                </p>
              </div>
            </div>

            {/* Foco Temático & Somática */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Foco Temático y Práctica Somática:
                </span>
                <p className="text-neutral-700 dark:text-neutral-300 font-light leading-relaxed mt-1">
                  {activeWorkshop.thematicFocus}
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <span className="text-neutral-600 dark:text-neutral-400 font-light">
                  <strong className="font-semibold text-black dark:text-white">Anclaje somático:</strong>{' '}
                  {activeWorkshop.somaticPractice}
                </span>
                <span className="text-neutral-600 dark:text-neutral-400 font-light">
                  <strong className="font-semibold text-black dark:text-white">Pregunta guía:</strong>{' '}
                  {activeWorkshop.guidingQuestion}
                </span>
              </div>
            </div>

            {/* Acciones del Taller: Sala Meet, Memoria PDF y Accesos Google Workspace */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={activeWorkshop.meetLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Video className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Ingresar a Sala Virtual (Meet)</span>
              </a>

              <a
                href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Ver Base de Datos de Acuerdos de Talleres en Google Sheets"
              >
                <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ver en Sheets (Acuerdos)</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <a
                href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Ver Base de Datos de Bitácoras de Talleres en Google Sheets"
              >
                <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Ver en Sheets (Bitácoras)</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <button
                type="button"
                onClick={() => onDownloadWorkshopMemory(activeWorkshop)}
                className="px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/60 backdrop-blur-xs text-xs font-semibold hover:bg-white/80 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>Memoria PDF</span>
              </button>
            </div>

            {/* Formularios Oficiales del Taller (Registro y Bitácora) */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-neutral-900/50 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Google Workspace Oficial:
                </span>
                <a
                  href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Formulario Oficial de Registro y Acuerdo"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Acuerdo Convivencia (Forms)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <a
                  href={OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Bitácora Oficial de Cosecha del Taller"
                >
                  <Brain className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bitácora Coach (Forms)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>

              <div className="text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1 text-[10px] select-none font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Expediente Confidencial RBC</span>
              </div>
            </div>
          </div>
        ) : (
          /* Taller No Acreditado / No Enrolado: Muestra Pago Bre-B Nu */
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-white/40 dark:bg-neutral-900/50 backdrop-blur-xs border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                  <span className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">
                    Taller No Adquirido • Cupo Individual
                  </span>
                </div>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Formaliza tu cupo para acceder a la sala virtual y compendio vivencial
                </span>
              </div>

              {/* Inversión */}
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-800/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Inversión Taller Individual Vivencial ({activeWorkshop.title})
                </span>
                <div className="text-lg font-bold text-black dark:text-white">
                  $350.000 COP
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                  Incluye acceso en vivo a la sala virtual de 3 horas, cuaderno de trabajo somático y memoria integral en PDF.
                </p>
              </div>

              {/* Llave Bre-B Nu */}
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-800/50 space-y-3">
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
                    <span className="px-3 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-xs tracking-wider">
                      {BRE_B_NU_CONFIG.llave}
                    </span>
                    <button
                      type="button"
                      onClick={onCopyPaymentKey}
                      className="px-3 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white/60 dark:bg-neutral-700 text-black dark:text-white font-semibold text-[11px] hover:bg-white dark:hover:bg-neutral-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Copiar llave de pago"
                    >
                      {copiedPaymentKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
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

              {/* Confirmación por WhatsApp */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
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
    </div>
  );
};
