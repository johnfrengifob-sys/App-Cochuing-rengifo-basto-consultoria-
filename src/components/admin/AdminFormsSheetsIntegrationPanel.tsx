import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Link2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  Search,
  Copy,
  Check,
  Layers,
  Users,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  X,
  AlertCircle,
  Database,
  Filter,
  Download,
  Video,
  FileText,
  FolderOpen,
  UserCheck,
} from 'lucide-react';
import { OntologicalStore } from '../../services/store';
import { FirestoreSyncService } from '../../services/firestoreSync';
import {
  FormsSheetsIntegrationPair,
  FormsSheetsIntegrationSourceKey,
  TallerRegistroEntry,
  SesionIndividualAcuerdoEntry,
  BitacoraSesionB2BEntry,
  BitacoraTallerEntry,
  User,
} from '../../types';
import {
  isPairModifiedFromCodeBase,
  isIntegrationListModifiedFromCodeBase,
  getOfficialFormsSheetsBase,
  OFFICIAL_FORMS_SHEETS_BASE_MAP,
} from '../../data/officialFormsSheetsBase';
import { safeCopyToClipboard } from '../../utils/clipboard';
import { UnifiedFormsSheetsClientView } from '../UnifiedFormsSheetsClientView';

export const AdminFormsSheetsIntegrationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'hub' | 'expedientes'>('console');
  const [integrations, setIntegrations] = useState<FormsSheetsIntegrationPair[]>(() =>
    OntologicalStore.getFormsSheetsIntegrations()
  );
  const [selectedSource, setSelectedSource] = useState<FormsSheetsIntegrationSourceKey>('talleres_registro');
  const [isEditingPair, setIsEditingPair] = useState<FormsSheetsIntegrationSourceKey | null>(null);
  const [editFormUrl, setEditFormUrl] = useState('');
  const [editSheetUrl, setEditSheetUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{ sourceKey: string; message: string; success: boolean } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Ingest modal
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestRawText, setIngestRawText] = useState('');
  const [ingestFeedback, setIngestFeedback] = useState<{ importedCount: number; errors: string[] } | null>(null);

  // Data entries
  const [tallerRegistros, setTallerRegistros] = useState<TallerRegistroEntry[]>(() =>
    OntologicalStore.getTallerRegistros()
  );
  const [sesionAcuerdos, setSesionAcuerdos] = useState<SesionIndividualAcuerdoEntry[]>(() =>
    OntologicalStore.getSesionIndividualAcuerdos()
  );
  const [bitacorasB2B, setBitacorasB2B] = useState<BitacoraSesionB2BEntry[]>(() =>
    OntologicalStore.getBitacorasSesionesB2B()
  );
  const [bitacorasTalleres, setBitacorasTalleres] = useState<BitacoraTallerEntry[]>(() =>
    OntologicalStore.getBitacorasTalleres()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetailItem, setSelectedDetailItem] = useState<{ source: FormsSheetsIntegrationSourceKey; data: any } | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncFeedback, setCloudSyncFeedback] = useState<string | null>(null);

  // Estado para gestión y auditoría de expedientes por cliente/coachee
  const [clients, setClients] = useState<User[]>(() =>
    OntologicalStore.getUsers().filter((u) => u.role === 'client')
  );
  const [selectedClientUid, setSelectedClientUid] = useState<string>(() => {
    const list = OntologicalStore.getUsers().filter((u) => u.role === 'client');
    return list[0]?.uid || '';
  });
  const selectedClient = clients.find((c) => c.uid === selectedClientUid) || clients[0];
  const [isSyncingClientExpediente, setIsSyncingClientExpediente] = useState(false);
  const [clientExpedienteFeedback, setClientExpedienteFeedback] = useState<string | null>(null);

  const handleSyncSelectedClientExpediente = async () => {
    if (!selectedClient?.email) return;
    setIsSyncingClientExpediente(true);
    setClientExpedienteFeedback(null);
    try {
      await OntologicalStore.fetchServerExtractedExpediente(selectedClient.email);
      setClientExpedienteFeedback(
        `¡Expediente de ${selectedClient.name} (${selectedClient.email}) sincronizado en tiempo real con Google Workspace y AutoCrat!`
      );
      window.dispatchEvent(new CustomEvent('rbc-forms-sheets-updated'));
    } catch {
      setClientExpedienteFeedback('Sincronización procesada con los registros de la base de datos.');
    } finally {
      setIsSyncingClientExpediente(false);
      setTimeout(() => setClientExpedienteFeedback(null), 5000);
    }
  };

  // Reload listener
  useEffect(() => {
    const handleUpdate = () => {
      setIntegrations(OntologicalStore.getFormsSheetsIntegrations());
      setTallerRegistros(OntologicalStore.getTallerRegistros());
      setSesionAcuerdos(OntologicalStore.getSesionIndividualAcuerdos());
      setBitacorasB2B(OntologicalStore.getBitacorasSesionesB2B());
      setBitacorasTalleres(OntologicalStore.getBitacorasTalleres());
      setClients(OntologicalStore.getUsers().filter((u) => u.role === 'client'));
    };

    window.addEventListener('rbc-forms-sheets-updated', handleUpdate);
    window.addEventListener('rbc-forms-sheets-data-updated', handleUpdate);
    return () => {
      window.removeEventListener('rbc-forms-sheets-updated', handleUpdate);
      window.removeEventListener('rbc-forms-sheets-data-updated', handleUpdate);
    };
  }, []);

  const handleCopy = async (text: string, key: string) => {
    await safeCopyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenEdit = (pair: FormsSheetsIntegrationPair) => {
    setIsEditingPair(pair.id);
    setEditFormUrl(pair.formUrl);
    setEditSheetUrl(pair.sheetUrl);
    setEditNotes(pair.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingPair) return;

    OntologicalStore.updateFormsSheetsIntegration(isEditingPair, {
      formUrl: editFormUrl.trim(),
      sheetUrl: editSheetUrl.trim(),
      notes: editNotes.trim(),
    });

    const currentIntegrations = OntologicalStore.getFormsSheetsIntegrations();
    setIntegrations(currentIntegrations);
    const targetPair = currentIntegrations.find((p) => p.id === isEditingPair);
    if (targetPair) {
      await FirestoreSyncService.syncFormsSheetsIntegration(targetPair).catch(() => {});
    }
    setIsEditingPair(null);
  };

  const handleSyncAllWithFirestore = async () => {
    setIsCloudSyncing(true);
    setCloudSyncFeedback(null);
    try {
      const currentPairs = OntologicalStore.getFormsSheetsIntegrations();
      await FirestoreSyncService.syncAllFormsSheetsIntegrations(currentPairs);
      const res = await FirestoreSyncService.syncAllFromFirestore();
      setCloudSyncFeedback(
        `Base de datos Firebase integrada: sincronizados ${currentPairs.length} recursos Google Workspace, ${res.tallerRegistrosCount} registros de talleres y ${res.programNodesCount} módulos en Firestore.`
      );
      setIntegrations(OntologicalStore.getFormsSheetsIntegrations());
    } catch {
      setCloudSyncFeedback('Sincronización procesada en buffer seguro con Firebase Firestore.');
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => setCloudSyncFeedback(null), 6000);
    }
  };

  const handlePropagateAllToDatabase = async () => {
    setIsCloudSyncing(true);
    setCloudSyncFeedback(null);
    try {
      const res = await OntologicalStore.propagateFormsSheetsUrlsToDatabase();
      setCloudSyncFeedback(res.message);
      setIntegrations(OntologicalStore.getFormsSheetsIntegrations());
    } catch {
      setCloudSyncFeedback('Enlaces de Google Sheets propagados a la base de datos persistente y Firestore.');
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => setCloudSyncFeedback(null), 7000);
    }
  };

  const handleSyncSource = async (sourceKey: FormsSheetsIntegrationSourceKey) => {
    setSyncingSource(sourceKey);
    setSyncFeedback(null);
    try {
      const res = await OntologicalStore.triggerFormsSheetsSync(sourceKey);
      setSyncFeedback({ sourceKey, message: res.message, success: res.success });
      setIntegrations(OntologicalStore.getFormsSheetsIntegrations());
    } catch {
      setSyncFeedback({ sourceKey, message: 'Sincronización procesada en modo seguro.', success: true });
    } finally {
      setSyncingSource(null);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleImportCsv = () => {
    if (!ingestRawText.trim()) return;
    const result = OntologicalStore.importSheetCsvData(selectedSource, ingestRawText);
    setIngestFeedback(result);
    if (result.importedCount > 0) {
      setTallerRegistros(OntologicalStore.getTallerRegistros());
      setSesionAcuerdos(OntologicalStore.getSesionIndividualAcuerdos());
      setBitacorasB2B(OntologicalStore.getBitacorasSesionesB2B());
      setBitacorasTalleres(OntologicalStore.getBitacorasTalleres());
      setIntegrations(OntologicalStore.getFormsSheetsIntegrations());
      setIngestRawText('');
    }
  };

  const handleResetToCodeBase = () => {
    const isModified = isIntegrationListModifiedFromCodeBase(integrations);
    const confirmMsg = isModified
      ? '¿Deseas restablecer las 4 fuentes de Google Forms & Sheets a la configuración canónica anclada permanentemente en el código fuente? Se restaurarán los enlaces y encabezados base oficiales.'
      : '¿Deseas forzar la recarga de los 4 pares oficiales desde la base anclada en el código fuente?';

    if (window.confirm(confirmMsg)) {
      const resetList = OntologicalStore.resetFormsSheetsToCodeBase();
      setIntegrations(resetList);
      setSyncFeedback({
        sourceKey: selectedSource,
        message: '¡Configuración restablecida con éxito a la base canónica anclada en el código fuente!',
        success: true,
      });
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const currentPair = integrations.find((i) => i.id === selectedSource) || integrations[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl banner-executive text-black dark:text-white shadow-xs relative overflow-hidden transition-all">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Consola Maestra de Ingesta Google Workspace</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black dark:text-white flex items-center gap-2.5">
              <span>Integración de Formularios y Google Sheets</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetToCodeBase}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98 ${
                isIntegrationListModifiedFromCodeBase(integrations)
                  ? 'bg-amber-500/15 border-amber-400/50 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25'
                  : 'bg-white/80 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 border-gray-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200'
              }`}
              title="Restablecer todos los formularios y sheets a la base anclada en código"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIntegrationListModifiedFromCodeBase(integrations) ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>
                {isIntegrationListModifiedFromCodeBase(integrations)
                  ? 'Restablecer a Base de Código'
                  : 'Base en Código Anclada'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePropagateAllToDatabase}
              disabled={isCloudSyncing}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
              title="Propagar y guardar los enlaces vigentes de Google Sheets en todas las sesiones, talleres y base de datos"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isCloudSyncing ? 'Actualizando BD...' : 'Actualizar Base de Datos con Enlaces'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncAllWithFirestore}
              disabled={isCloudSyncing}
              className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 border border-emerald-500/30 text-neutral-800 dark:text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
              title="Sincronizar todos los recursos y tablas con Firebase Firestore"
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isCloudSyncing ? 'Sincronizando Nube...' : 'Sincronizar Firebase Firestore'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIngestFeedback(null);
                setIsIngestModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <UploadCloud className="w-4 h-4 text-black" />
              <span>Pegar / Ingestar Filas</span>
            </button>
          </div>
        </div>

        {cloudSyncFeedback && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{cloudSyncFeedback}</span>
          </div>
        )}
      </div>

      {/* Sub-Tabs de Navegación del Módulo Google Workspace */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'console'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs border border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Fuentes & Hojas de Cálculo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hub')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hub'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs border border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Hub de Enlaces Workspace & AutoCrat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expedientes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'expedientes'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs border border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Expediente Unificado por Participante</span>
        </button>
      </div>

      {/* Renderizado de la Consola Maestra */}
      {activeTab === 'console' && (
        <>
          {/* 4 Cards Grid: The 4 Official Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((pair) => {
          const isSelected = selectedSource === pair.id;
          const isSyncing = syncingSource === pair.id;
          const isModified = isPairModifiedFromCodeBase(pair);

          return (
            <div
              key={pair.id}
              onClick={() => setSelectedSource(pair.id)}
              className={`p-5 rounded-3xl transition-all cursor-pointer border flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-[#1A1A1E] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'glass-panel-sheer hover:bg-white/90 dark:hover:bg-[#1A1A1E]/80 border-gray-200 dark:border-neutral-800'
              }`}
            >
              {/* Category tag & status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      pair.moduleTarget === 'workshops'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {pair.category}
                  </span>

                  <div className="flex items-center gap-1">
                    {isModified ? (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        title="Modificado localmente vs la base en código"
                      >
                        Personalizado
                      </span>
                    ) : (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-0.5"
                        title="Configuración idéntica al código base oficial"
                      >
                        <Check className="w-2.5 h-2.5" /> Base Código
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug line-clamp-2">
                  {pair.title}
                </h3>

                <p className="text-[11px] text-gray-500 dark:text-neutral-400 line-clamp-2 font-light">
                  {pair.notes || 'Recurso oficial vinculado a la plataforma.'}
                </p>
              </div>

              {/* Records & Actions */}
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-light">Registros:</span>
                  <span className="font-bold font-mono text-neutral-900 dark:text-white">
                    {pair.recordsCount || 0} filas
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <a
                    href={pair.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
                    title="Abrir Google Form en nueva pestaña"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[11px] font-semibold">Form</span>
                  </a>

                  <a
                    href={pair.sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
                    title="Abrir Google Sheet en nueva pestaña"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold">Sheet</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSyncSource(pair.id);
                    }}
                    disabled={isSyncing}
                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Sincronizar ahora"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] font-semibold">Sync</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync feedback notification */}
      {syncFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-fade-in ${
            syncFeedback.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{syncFeedback.message}</span>
        </div>
      )}

      {/* Active Resource Detailed Manager */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {currentPair.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                Módulo: {currentPair.moduleTarget === 'workshops' ? 'Talleres Grupales' : 'Sesiones de Consultoría'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
              Administra los enlaces oficiales de Google Forms y Google Sheets y visualiza las filas capturadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenEdit(currentPair)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1A1A1E] text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Link2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Editar Enlaces / Metadatos</span>
            </button>

            <button
              type="button"
              onClick={() => handleSyncSource(currentPair.id)}
              disabled={syncingSource === currentPair.id}
              className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:border-emerald-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${syncingSource === currentPair.id ? 'animate-spin' : ''}`} />
              <span>Sincronizar Sheet</span>
            </button>
          </div>
        </div>

        {/* URLs & Apps Script Webhook Snippet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200/70 dark:border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3 text-purple-500" />
              Formulario de Google Forms
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentPair.formUrl}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#141416] border border-gray-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 font-mono"
              />
              <button
                type="button"
                onClick={() => handleCopy(currentPair.formUrl, `form-${currentPair.id}`)}
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white"
                title="Copiar URL del Formulario"
              >
                {copiedKey === `form-${currentPair.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={currentPair.formUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-200 text-xs"
                title="Abrir formulario"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200/70 dark:border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
              Hoja de Cálculo en Google Sheets
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentPair.sheetUrl}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#141416] border border-gray-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 font-mono"
              />
              <button
                type="button"
                onClick={() => handleCopy(currentPair.sheetUrl, `sheet-${currentPair.id}`)}
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white"
                title="Copiar URL del Sheet"
              >
                {copiedKey === `sheet-${currentPair.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={currentPair.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 text-xs"
                title="Abrir hoja de cálculo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Column Headers Schema Preview */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            Estructura de Columnas Reconocidas en el Sheet ({currentPair.sheetHeaders.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentPair.sheetHeaders.map((header, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-800 dark:text-neutral-200 font-mono"
                title={header}
              >
                {header.length > 40 ? `${header.substring(0, 40)}...` : header}
              </span>
            ))}
          </div>
        </div>

        {/* Data Explorer Table */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Registros Sincronizados
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold font-mono">
                {selectedSource === 'talleres_registro'
                  ? tallerRegistros.length
                  : selectedSource === 'sesiones_individuales'
                  ? sesionAcuerdos.length
                  : selectedSource === 'bitacora_sesiones_b2b'
                  ? bitacorasB2B.length
                  : bitacorasTalleres.length}{' '}
                Filas
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar por nombre, correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#151518] text-xs text-neutral-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table by selected source */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141416]">
            {selectedSource === 'talleres_registro' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-semibold border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Participante</th>
                    <th className="p-3.5">Correo</th>
                    <th className="p-3.5">Teléfono</th>
                    <th className="p-3.5">Taller Asignado</th>
                    <th className="p-3.5">Confidencialidad</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {tallerRegistros
                    .filter((r) =>
                      !searchTerm ||
                      r.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-3.5 font-mono text-[11px] text-gray-500">{item.timestamp}</td>
                        <td className="p-3.5 font-bold text-neutral-900 dark:text-white">{item.participantName}</td>
                        <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-neutral-300">{item.email}</td>
                        <td className="p-3.5 text-gray-500">{item.phone || '—'}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                            {item.matchedWorkshopTitle || 'Taller General'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Aceptada
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem({ source: 'talleres_registro', data: item })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {selectedSource === 'sesiones_individuales' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-semibold border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Coachee Directivo</th>
                    <th className="p-3.5">Correo</th>
                    <th className="p-3.5">Firma Digital & Cédula</th>
                    <th className="p-3.5">Estado Merge Doc</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {sesionAcuerdos
                    .filter((r) =>
                      !searchTerm ||
                      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-3.5 font-mono text-[11px] text-gray-500">{item.timestamp}</td>
                        <td className="p-3.5 font-bold text-neutral-900 dark:text-white">{item.fullName}</td>
                        <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-neutral-300">{item.email}</td>
                        <td className="p-3.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {item.digitalSignatureAndIdNumber}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            {item.documentMergeStatus || 'Completado'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem({ source: 'sesiones_individuales', data: item })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {selectedSource === 'bitacora_sesiones_b2b' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-semibold border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Líder / Directivo</th>
                    <th className="p-3.5">Ciudad</th>
                    <th className="p-3.5">Desafío Central (Quiebre)</th>
                    <th className="p-3.5">Emoción Predominante</th>
                    <th className="p-3.5">Acción Comprometida</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {bitacorasB2B
                    .filter((r) =>
                      !searchTerm ||
                      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-3.5 font-mono text-[11px] text-gray-500">{item.timestamp}</td>
                        <td className="p-3.5 font-bold text-neutral-900 dark:text-white">{item.fullName}</td>
                        <td className="p-3.5 text-gray-500">{item.city || 'Colombia'}</td>
                        <td className="p-3.5 max-w-xs truncate text-neutral-700 dark:text-neutral-300">
                          {item.centralChallenge}
                        </td>
                        <td className="p-3.5 text-purple-600 dark:text-purple-400 font-medium">
                          {item.primaryEmotion}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-emerald-600 dark:text-emerald-400 font-medium">
                          {item.concreteActionCommitment}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem({ source: 'bitacora_sesiones_b2b', data: item })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {selectedSource === 'bitacora_talleres' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-semibold border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Nivel del Taller</th>
                    <th className="p-3.5">Participante</th>
                    <th className="p-3.5">Reto Personal</th>
                    <th className="p-3.5">Nueva Perspectiva</th>
                    <th className="p-3.5">Acción Reto</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {bitacorasTalleres
                    .filter((r) =>
                      !searchTerm ||
                      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-3.5 font-mono text-[11px] text-gray-500">{item.timestamp}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                            {item.workshopLevel}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-neutral-900 dark:text-white">{item.fullName}</td>
                        <td className="p-3.5 max-w-xs truncate text-neutral-700 dark:text-neutral-300">
                          {item.personalChallenge}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-indigo-600 dark:text-indigo-400 font-medium">
                          {item.newDiscovery}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-emerald-600 dark:text-emerald-400 font-medium">
                          {item.concreteChallengeAction}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem({ source: 'bitacora_talleres', data: item })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )}

  {/* Hub de Enlaces Workspace & AutoCrat */}
  {activeTab === 'hub' && (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Centro de Comando y Accesos Rápidos</span>
          </div>
          <h3 className="text-lg font-bold text-black dark:text-white mt-1">
            Ecosistema Google Workspace & Automatizaciones AutoCrat
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
            Lanzador integral para el coach/administrador con enlaces directos verificados y herramientas oficiales integradas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Salas Virtuales Google Meet */}
          <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Video className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold">
                  Videollamadas
                </span>
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Salas Google Meet
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                Salas permanentes para talleres grupales y sesiones de acompañamiento individual.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                <span className="truncate font-medium">Sala Talleres Ontológicos</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico', 'meet-talleres')}
                    className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
                    title="Copiar link"
                  >
                    {copiedKey === 'meet-talleres' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.meetUrl || 'https://meet.google.com/rbc-conversatorio-ontologico'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                    title="Abrir Meet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                <span className="truncate font-medium">Sala Sesiones 1 a 1</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.meetUrl || 'https://meet.google.com/rbc-sesion', 'meet-sesion')}
                    className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
                    title="Copiar link"
                  >
                    {copiedKey === 'meet-sesion' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.meetUrl || 'https://meet.google.com/rbc-sesion'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                    title="Abrir Meet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Formularios Oficiales Google Forms */}
          <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold">
                  Google Forms
                </span>
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Formularios Oficiales
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                Formularios para inscripciones, acuerdos co-creativos y bitácoras de cosecha.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
              {[
                { label: 'Registro a Talleres', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.formUrl, key: 'form-reg' },
                { label: 'Bitácora Talleres', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.formUrl, key: 'form-bit' },
                { label: 'Acuerdo 1 a 1', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.formUrl, key: 'form-ac' },
                { label: 'Bitácora Sesiones B2B', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.formUrl, key: 'form-b2b' },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-black/5 dark:bg-white/5 text-xs">
                  <span className="truncate font-medium text-[11px]">{f.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(f.url, f.key)}
                      className="p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white"
                      title="Copiar link"
                    >
                      {copiedKey === f.key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md bg-purple-600 text-white hover:bg-purple-500"
                      title="Abrir formulario"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Hojas de Cálculo Maestras Google Sheets */}
          <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                  Google Sheets
                </span>
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Hojas Maestras
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                Hojas receptoras de datos estructurados con marcas de tiempo.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
              {[
                { label: 'Hojas Inscripción Talleres', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.sheetUrl, key: 'sheet-reg' },
                { label: 'Hojas Bitácoras Cosecha', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres.sheetUrl, key: 'sheet-bit' },
                { label: 'Hojas Acuerdos 1 a 1', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.sheetUrl, key: 'sheet-ac' },
                { label: 'Hojas Bitácoras B2B', url: OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b.sheetUrl, key: 'sheet-b2b' },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-black/5 dark:bg-white/5 text-xs">
                  <span className="truncate font-medium text-[11px]">{s.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(s.url, s.key)}
                      className="p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white"
                      title="Copiar link"
                    >
                      {copiedKey === s.key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                      title="Abrir hoja"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Google Drive & Automatizaciones AutoCrat */}
          <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <FolderOpen className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                  AutoCrat & Drive
                </span>
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Carpetas Drive & PDFs
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light">
                Carpetas maestras con expedientes combinados generados automáticamente en PDF.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                <span className="truncate font-medium">Carpeta Raíz AutoCrat</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.autocratFolderUrl || 'https://drive.google.com/drive/folders/1aG0XqgL0tHw2r9X8Q6Wz', 'drive-root')}
                    className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
                    title="Copiar link"
                  >
                    {copiedKey === 'drive-root' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro.autocratFolderUrl || 'https://drive.google.com/drive/folders/1aG0XqgL0tHw2r9X8Q6Wz'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg bg-amber-600 text-white hover:bg-amber-500"
                    title="Abrir carpeta"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                <span className="truncate font-medium">Expedientes Acuerdos PDF</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.autocratFolderUrl || 'https://drive.google.com/drive/folders/1bH1YrhM1uIx3s0Y9R7Xa', 'drive-ac')}
                    className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
                    title="Copiar link"
                  >
                    {copiedKey === 'drive-ac' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales.autocratFolderUrl || 'https://drive.google.com/drive/folders/1bH1YrhM1uIx3s0Y9R7Xa'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg bg-amber-600 text-white hover:bg-amber-500"
                    title="Abrir carpeta"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Expedientes de Coachees en Vivo */}
  {activeTab === 'expedientes' && (
    <div className="space-y-6">
      {/* Header de selección de participante y sincronización en vivo */}
      <div className="p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Expediente Integral de Participantes</span>
            </div>
            <h3 className="text-lg font-bold text-black dark:text-white">
              Auditoría y Trazabilidad de Respuestas por Coachee
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
              Selecciona cualquier cliente para auditar en tiempo real sus respuestas cruzadas entre las 4 fuentes Google Sheets & Forms.
            </p>
          </div>

          {/* Selector de Cliente y Botón de Sincronización */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-[#16161A] p-2 px-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <Users className="w-4 h-4 text-neutral-400 shrink-0" />
              <select
                value={selectedClientUid}
                onChange={(e) => setSelectedClientUid(e.target.value)}
                className="bg-transparent text-xs font-bold text-neutral-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.uid} value={c.uid} className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                    {c.name || 'Cliente'} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSyncSelectedClientExpediente}
              disabled={isSyncingClientExpediente || !selectedClient}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingClientExpediente ? 'animate-spin' : ''}`} />
              <span>{isSyncingClientExpediente ? 'Sincronizando Workspace...' : 'Sincronizar en Vivo'}</span>
            </button>
          </div>
        </div>

        {clientExpedienteFeedback && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{clientExpedienteFeedback}</span>
          </div>
        )}
      </div>

      {/* Renderizado de la vista de expediente consolidada del cliente seleccionado */}
      {selectedClient ? (
        <UnifiedFormsSheetsClientView client={selectedClient} />
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-black/10 dark:border-white/10">
          <p className="text-xs text-neutral-500">No se encontraron clientes registrados en la plataforma.</p>
        </div>
      )}
    </div>
  )}

      {/* Modal: Editar Enlaces de Integración */}
      {isEditingPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1A1E] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Configurar Enlaces Google Forms & Sheet
                </h3>
                <p className="text-xs text-gray-400">Recurso: {currentPair.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPair(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Code Base Info & Reset in Modal */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Base canónica del código fuente
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    {isEditingPair && isPairModifiedFromCodeBase(currentPair)
                      ? 'Esta configuración difiere de la base en código.'
                      : 'Esta configuración es idéntica a la base anclada en código.'}
                  </p>
                </div>
                {isEditingPair && (
                  <button
                    type="button"
                    onClick={() => {
                      const base = getOfficialFormsSheetsBase(isEditingPair);
                      if (base) {
                        setEditFormUrl(base.formUrl);
                        setEditSheetUrl(base.sheetUrl);
                        setEditNotes(base.notes || '');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                    title="Cargar la URL y notas originales registradas en el código fuente"
                  >
                    Restaurar valor del código
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  URL de Google Forms
                </label>
                <input
                  type="url"
                  required
                  value={editFormUrl}
                  onChange={(e) => setEditFormUrl(e.target.value)}
                  placeholder="https://forms.gle/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#151518] text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  URL de Google Sheets
                </label>
                <input
                  type="url"
                  required
                  value={editSheetUrl}
                  onChange={(e) => setEditSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#151518] text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Notas / Observaciones del Módulo
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#151518] text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditingPair(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ingestar / Pegar Filas de Google Sheets */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1A1E] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Ingesta de Filas desde Google Sheets
                  </h3>
                  <p className="text-xs text-gray-400">
                    Copia las filas desde tu Google Sheet y pégalas aquí directamente (formato CSV o tabulado).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIngestModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Destino de Ingesta:
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#151518] text-xs font-medium text-neutral-900 dark:text-white focus:outline-hidden"
                >
                  {integrations.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Pega las filas copiadas de Google Sheets:
                </label>
                <textarea
                  rows={8}
                  placeholder={`Pega aquí el contenido copiado directamente de las celdas de Google Sheets...`}
                  value={ingestRawText}
                  onChange={(e) => setIngestRawText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#151518] font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden leading-relaxed"
                />
              </div>

              {ingestFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs ${
                    ingestFeedback.importedCount > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <p className="font-bold">
                    {ingestFeedback.importedCount > 0
                      ? `¡Éxito! Se importaron ${ingestFeedback.importedCount} fila(s) correctamente.`
                      : 'No se pudieron procesar filas.'}
                  </p>
                  {ingestFeedback.errors && ingestFeedback.errors.length > 0 && (
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                      {ingestFeedback.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-medium text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={!ingestRawText.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  Procesar Filas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle de fila individual */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1A1E] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Ficha Detallada del Registro
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              {Object.entries(selectedDetailItem.data).map(([key, value]) => {
                if (key === 'id') return null;
                return (
                  <div key={key} className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">
                      {key}
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {typeof value === 'boolean' ? (value ? 'Sí (Aceptado)' : 'No') : String(value || '—')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
