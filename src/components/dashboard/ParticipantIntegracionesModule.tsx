import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  Brain,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Info,
  Calendar,
  Eye,
} from 'lucide-react';
import {
  OFFICIAL_FORMS_SHEETS_BASE_LIST,
  OfficialFormsSheetsRecord,
} from '../../data/officialFormsSheetsBase';
import { UnifiedFormsSheetsClientView } from '../UnifiedFormsSheetsClientView';
import { User, Session, PostSessionForm } from '../../types';

interface ParticipantIntegracionesModuleProps {
  activeUser: User;
  sessions?: Session[];
  postForms?: PostSessionForm[];
  onRefresh?: () => void;
  onSelectSession?: (session: Session) => void;
}

export const ParticipantIntegracionesModule: React.FC<ParticipantIntegracionesModuleProps> = ({
  activeUser,
  sessions = [],
  postForms = [],
  onRefresh,
  onSelectSession,
}) => {
  const [activeSubView, setActiveSubView] = useState<'expediente' | 'fuentes'>('expediente');
  const [selectedRecordKey, setSelectedRecordKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Banner de Integraciones Google Workspace */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-950/35 backdrop-blur-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                  Integraciones Google Forms & Google Sheets
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                  4 Bases Oficiales en Vivo
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                Expediente consolidado y trazabilidad de respuestas de talleres, sesiones individuales, acuerdos legales y bitácoras de avance.
              </p>
            </div>
          </div>

          {/* Subview Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveSubView('expediente')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubView === 'expediente'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Mi Expediente Cruzado
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('fuentes')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubView === 'fuentes'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Las 4 Bases Oficiales
            </button>
          </div>
        </div>

        {/* Resumen de los 4 canales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          {OFFICIAL_FORMS_SHEETS_BASE_LIST.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 space-y-1"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase truncate">
                  {item.category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <div className="text-xs font-bold text-black dark:text-white truncate">
                {item.title}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono truncate">
                {item.recordsCount} respuestas auditadas
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vista 1: Mi Expediente Cruzado */}
      {activeSubView === 'expediente' && (
        <div className="space-y-4">
          <UnifiedFormsSheetsClientView
            client={activeUser}
            onRefreshParent={onRefresh}
          />
        </div>
      )}

      {/* Vista 2: Las 4 Bases Oficiales en Vivo */}
      {activeSubView === 'fuentes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_FORMS_SHEETS_BASE_LIST.map((record: OfficialFormsSheetsRecord) => {
            const isTalleres = record.category.toLowerCase().includes('taller');
            const isAcuerdo = record.title.toLowerCase().includes('acuerdo');

            return (
              <div
                key={record.id}
                className="p-5 sm:p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/25 dark:bg-neutral-950/30 backdrop-blur-md space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isTalleres
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {isAcuerdo ? (
                          <ShieldCheck className="w-4.5 h-4.5" />
                        ) : (
                          <Brain className="w-4.5 h-4.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                            {record.category}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                            Conectado
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-black dark:text-white font-mono leading-tight">
                          {record.title}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      Base Oficial
                    </span>
                  </div>

                  {/* Nombre Oficial de la Base */}
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider block">
                      Nombre en Google Drive / Workspace
                    </span>
                    <p className="text-xs font-medium text-black dark:text-white font-mono">
                      {record.officialDatabaseName}
                    </p>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light mt-1">
                      {record.notes}
                    </p>
                  </div>

                  {/* Encabezados auditados */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                      Estructura de Datos ({record.sheetHeaders.length} columnas verificadas)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {record.sheetHeaders.slice(0, 4).map((header, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]"
                          title={header}
                        >
                          {header}
                        </span>
                      ))}
                      {record.sheetHeaders.length > 4 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          +{record.sheetHeaders.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones directas a Google Forms y Sheets */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
                  <a
                    href={record.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Diligenciar en Forms</span>
                  </a>

                  <a
                    href={record.sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ver Hoja en Sheets</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
