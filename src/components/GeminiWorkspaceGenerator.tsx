import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  FileSpreadsheet,
  FileText,
  Presentation,
  Brain,
  Code,
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Folder,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  FileDown,
  Archive,
} from 'lucide-react';
import {
  User,
  WorkspaceDocumentCategory,
  GeminiGeneratedWorkspaceDoc,
  GeminiWorkspaceSuiteResult,
  DriveExportedFile,
} from '../types';
import { GeminiService } from '../services/geminiService';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import { GeminiWorkspaceDocModal } from './GeminiWorkspaceDocModal';
import { WorkspaceConfirmationModal } from './WorkspaceConfirmationModal';
import {
  downloadDocumentInFormat,
  downloadBatchDocuments,
  getOfficialWorkspaceTemplates,
} from '../utils/workspaceDownloader';
import { safeCopyToClipboard } from '../utils/clipboard';

interface GeminiWorkspaceGeneratorProps {
  clients: User[];
  onDocumentSaved: (doc: DriveExportedFile) => void;
  onSuiteSaved: (docs: DriveExportedFile[]) => void;
  onShowNotice: (msg: string) => void;
  onNavigateTab: (tab: 'brain' | 'drive' | 'sheets' | 'forms' | 'calendar') => void;
}

export const GeminiWorkspaceGenerator: React.FC<GeminiWorkspaceGeneratorProps> = ({
  clients,
  onDocumentSaved,
  onSuiteSaved,
  onShowNotice,
  onNavigateTab,
}) => {
  // Generation States
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isGeneratingSuite, setIsGeneratingSuite] = useState(false);

  // Form State for Single Doc
  const [docType, setDocType] = useState<WorkspaceDocumentCategory | 'contract' | 'apps_script'>('doc');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Contrato Marco de Consultoría Ontológica y Confidencialidad ICF');
  const [selectedClientUid, setSelectedClientUid] = useState<string>(clients[0]?.uid || '');
  const [additionalContext, setAdditionalContext] = useState('');

  // Form State for Suite
  const [suiteClientUid, setSuiteClientUid] = useState<string>(clients[0]?.uid || '');
  const [suiteFocus, setSuiteFocus] = useState('Liderazgo Ejecutivo, Fronteras & Integración Ontológica');

  // Results State
  const [generatedDoc, setGeneratedDoc] = useState<GeminiGeneratedWorkspaceDoc | null>(null);
  const [generatedSuite, setGeneratedSuite] = useState<GeminiWorkspaceSuiteResult | null>(null);
  const [savedDocIds, setSavedDocIds] = useState<Record<string, boolean>>({});
  const [customDocsList, setCustomDocsList] = useState<GeminiGeneratedWorkspaceDoc[]>([]);

  // Download Center State
  const [downloadFilter, setDownloadFilter] = useState<
    'all' | 'doc' | 'sheet' | 'form' | 'knowledge_base'
  >('all');
  const [downloadSearch, setDownloadSearch] = useState('');
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Modals
  const [inspectingDoc, setInspectingDoc] = useState<GeminiGeneratedWorkspaceDoc | null>(null);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    action: () => {},
  });

  const selectedClient = clients.find((c) => c.uid === selectedClientUid);
  const suiteClient = clients.find((c) => c.uid === suiteClientUid);

  // Quick Preset Templates
  const presets = [
    {
      label: '📄 Contrato Marco de Consultoría',
      type: 'contract' as const,
      topic: 'Contrato Marco de Consultoría y Confidencialidad bajo Estándares ICF',
      title: 'Contrato Marco de Consultoría Ontológica',
      context: 'Estipular cláusulas de confidencialidad estricta, alcances no clínicos, y puntualidad en sesiones de Google Meet.',
    },
    {
      label: '📊 Matriz de Quiebres en Sheets',
      type: 'sheet' as const,
      topic: 'Directorio Maestro de Coachees y Semáforo de Quiebres Directivos',
      title: 'Matriz Maestra de Seguimiento y Quiebres Ontológicos',
      context: 'Incluir columnas para ID, coachee, quiebre primario, nivel de tensión somática, compromisos asumidos y fecha de revisión.',
    },
    {
      label: '📝 Cuestionario Diagnóstico Forms',
      type: 'form' as const,
      topic: 'Intake Inicial y Diagnóstico Somático del Observador',
      title: 'Cuestionario de Indagación Inicial y Escaneo Somático',
      context: 'Diseñar 5 preguntas ontológicas sobre corporalidad (tensión diafragmática), lenguaje (juicios vs afirmaciones) y pedidos.',
    },
    {
      label: '⚡ Script Webhook de Automatización',
      type: 'apps_script' as const,
      topic: 'Sincronización Webhook de Google Forms y Sheets con RBC API',
      title: 'Google Apps Script para Sincronización Automática con RBC',
      context: 'Función onFormSubmit y onEdit conectando con /api/webhooks/workshop-completion usando UrlFetchApp.',
    },
    {
      label: '🎯 Plan de Quiebres y Dirección',
      type: 'doc' as const,
      topic: 'Plan de Transformación Ontológica: Certeza, Fronteras & Declaraciones',
      title: 'Plan Maestro de Transformación Ontológica para el Coachee',
      context: 'Articular 6 etapas de indagación ontológica con reflexiones semanales y compromisos de liderazgo.',
    },
    {
      label: '🖼️ Taller Inducción Slides',
      type: 'slide' as const,
      topic: 'Taller de Inducción: El Observador, el Cuerpo y la Acción Eficaz',
      title: 'Diapositivas de Taller Ontológico: Rediseño del Observador',
      context: 'Estructura de 8 láminas para presentación en Google Meet con ejercicios de centramiento somático y escucha activa.',
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setDocType(preset.type);
    setTitle(preset.title);
    setTopic(preset.topic);
    setAdditionalContext(preset.context);
  };

  // Generate Single Document
  const handleGenerateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGeneratingDoc) return;

    setIsGeneratingDoc(true);
    try {
      const doc = await GeminiService.generateWorkspaceDocument({
        documentType: docType,
        title: title.trim() || undefined,
        topic: topic.trim() || undefined,
        clientName: selectedClient?.name,
        clientEmail: selectedClient?.email,
        additionalContext: additionalContext.trim() || undefined,
      });

      setGeneratedDoc(doc);
      setCustomDocsList((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
      setInspectingDoc(doc);
      onShowNotice(`¡"${doc.title}" redactado exitosamente por Gemini 3.8 Flash!`);
    } catch (err: any) {
      onShowNotice(`Error: ${err.message || 'No se pudo generar el documento'}`);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Generate 5-Doc Suite
  const handleGenerateSuite = async () => {
    if (isGeneratingSuite) return;

    setIsGeneratingSuite(true);
    try {
      const suite = await GeminiService.generateWorkspaceSuite({
        clientName: suiteClient?.name,
        clientEmail: suiteClient?.email,
        focus: suiteFocus.trim() || undefined,
      });

      setGeneratedSuite(suite);
      setCustomDocsList((prev) => [
        ...suite.documents,
        ...prev.filter((d) => !suite.documents.some((sd) => sd.id === d.id)),
      ]);
      onShowNotice(`¡Suite de 5 documentos de Google Workspace generada por Gemini!`);
    } catch (err: any) {
      onShowNotice(`Error generando suite: ${err.message || 'Error de conexión'}`);
    } finally {
      setIsGeneratingSuite(false);
    }
  };

  // Base Official Templates
  const defaultTemplates = useMemo(() => {
    return getOfficialWorkspaceTemplates(
      selectedClient?.name || suiteClient?.name || 'Cliente Ejecutivo',
      selectedClient?.email || suiteClient?.email || 'coachee@empresa.com'
    );
  }, [selectedClient?.name, selectedClient?.email, suiteClient?.name, suiteClient?.email]);

  // Combined List: Custom Generated Documents + Base Official Templates
  const allDownloadableDocs = useMemo(() => {
    const combined = [...customDocsList];
    defaultTemplates.forEach((template) => {
      if (!combined.some((d) => d.id === template.id || d.title === template.title)) {
        combined.push(template);
      }
    });
    return combined;
  }, [customDocsList, defaultTemplates]);

  // Filtered List based on Active Category and Search Query
  const filteredDownloadDocs = useMemo(() => {
    return allDownloadableDocs.filter((doc) => {
      const matchesCategory =
        downloadFilter === 'all' ||
        doc.category === downloadFilter ||
        (downloadFilter === 'knowledge_base' && !!doc.appsScriptCode);

      const q = downloadSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allDownloadableDocs, downloadFilter, downloadSearch]);

  // Batch Download Trigger
  const handleDownloadBatch = async (docsToDownload: GeminiGeneratedWorkspaceDoc[]) => {
    if (isBatchDownloading || docsToDownload.length === 0) return;
    setIsBatchDownloading(true);
    setBatchProgress({ current: 0, total: docsToDownload.length });
    onShowNotice(`Iniciando descarga de ${docsToDownload.length} documentos...`);

    try {
      await downloadBatchDocuments(docsToDownload, (current, total) => {
        setBatchProgress({ current, total });
      });
      onShowNotice(`¡${docsToDownload.length} documentos descargados exitosamente!`);
    } catch (err: any) {
      onShowNotice(`Error en la descarga: ${err?.message || 'Error del navegador'}`);
    } finally {
      setIsBatchDownloading(false);
      setTimeout(() => setBatchProgress(null), 3500);
    }
  };

  // Copy Content with Feedback
  const handleCopyDocContent = async (doc: GeminiGeneratedWorkspaceDoc) => {
    const text = doc.appsScriptCode || doc.fullContent || doc.contentSnippet || doc.description;
    await safeCopyToClipboard(text);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2500);
    onShowNotice(`¡Contenido de "${doc.title}" copiado al portapapeles!`);
  };

  // Save Single Doc with Confirmation Dialog
  const requestSaveDoc = (doc: GeminiGeneratedWorkspaceDoc) => {
    setConfirmationState({
      isOpen: true,
      title: 'Guardar Documento en Cerebro RBC & Drive',
      description: `¿Confirmas que deseas registrar "${doc.title}" en la base de conocimiento ontológico y catálogo Workspace de la aplicación?`,
      confirmLabel: 'Guardar Documento',
      action: () => {
        const saved = GoogleWorkspaceService.importGeminiGeneratedDocument(
          doc,
          selectedClient?.uid,
          selectedClient?.name
        );
        onDocumentSaved(saved);
        setSavedDocIds((prev) => ({ ...prev, [doc.id]: true }));
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        onShowNotice(`¡"${doc.title}" guardado en el Cerebro de la App!`);
      },
    });
  };

  // Save Entire Suite with Confirmation Dialog
  const requestSaveSuite = () => {
    if (!generatedSuite) return;

    setConfirmationState({
      isOpen: true,
      title: 'Guardar Suite Completa en Cerebro RBC (5 Documentos)',
      description: `¿Confirmas que deseas registrar los 5 documentos oficiales de la Suite de Integración en el Cerebro de la aplicación y Google Drive?`,
      confirmLabel: 'Guardar los 5 Documentos',
      action: () => {
        const savedList = GoogleWorkspaceService.importGeminiGeneratedSuite(
          generatedSuite.documents,
          suiteClient?.uid,
          suiteClient?.name
        );
        onSuiteSaved(savedList);
        const updatedIds: Record<string, boolean> = { ...savedDocIds };
        generatedSuite.documents.forEach((d) => {
          updatedIds[d.id] = true;
        });
        setSavedDocIds(updatedIds);
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        onShowNotice(`¡Los 5 documentos han sido incorporados al Cerebro de la App!`);
      },
    });
  };

  const getDocIcon = (cat: WorkspaceDocumentCategory) => {
    switch (cat) {
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'form':
        return <FileText className="w-5 h-5 text-fuchsia-500" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'knowledge_base':
        return <Code className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-purple-950/20 dark:via-neutral-950 dark:to-indigo-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Gemini 3.8 Flash • Generador Oficial de Documentos Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Generación de Documentos Workspace con IA
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 max-w-2xl font-light leading-relaxed">
              La IA de Gemini redacta y estructura los documentos oficiales de Google Workspace
              (Google Docs, Google Sheets, Google Forms, Google Slides y Google Apps Script)
              calibrados ontológicamente con el marco de{' '}
              <span className="font-semibold text-black dark:text-white">
                Rengifo Basto Consultoría
              </span>{' '}
              para operar de forma fluida con la plataforma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleGenerateSuite}
              disabled={isGeneratingSuite}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-amber-300 ${isGeneratingSuite ? 'animate-spin' : ''}`} />
              <span>
                {isGeneratingSuite ? 'Redactando Suite (5 Documentos)...' : 'Generar Suite en 1-Clic'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('brain')}
              className="px-4 py-3 rounded-2xl border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Ver Cerebro de la App</span>
            </button>
          </div>
        </div>

        {/* Integration Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-gray-200/80 dark:border-neutral-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 block">
              Cuenta Ancla Master
            </span>
            <span className="font-mono font-bold text-black dark:text-white">
              rengifobastoco@gmail.com
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-gray-200/80 dark:border-neutral-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 block">
              Webhook de Sincronización
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              /api/webhooks/workshop-completion
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-gray-200/80 dark:border-neutral-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 block">
              Motor de Inferencia
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Gemini 3.8 Flash (Server-Side)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN DESTACADA: DOCUMENTOS DISPONIBLES PARA DESCARGAR                  */}
      {/* ========================================================================= */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 dark:from-emerald-950/20 dark:via-neutral-950 dark:to-teal-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <FileDown className="w-3.5 h-3.5" />
              <span>Centro de Descargas Oficial RBC & Gemini</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
              Documentos Disponibles para Descargar
            </h3>
            <p className="text-xs text-gray-600 dark:text-neutral-400 font-light max-w-2xl">
              Selecciona cualquier documento para descargarlo en tu ordenador en formato{' '}
              <span className="font-semibold text-black dark:text-white">.MD, .CSV, .TXT o .GS</span>,
              o descarga el paquete completo para Google Workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleDownloadBatch(filteredDownloadDocs)}
              disabled={isBatchDownloading || filteredDownloadDocs.length === 0}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isBatchDownloading ? 'animate-bounce' : ''}`} />
              <span>
                {isBatchDownloading
                  ? `Descargando (${batchProgress?.current}/${batchProgress?.total})...`
                  : `Descargar Todos los Filtrados (${filteredDownloadDocs.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'Todos los Documentos', count: allDownloadableDocs.length },
              {
                key: 'doc',
                label: 'Google Docs (.MD)',
                count: allDownloadableDocs.filter((d) => d.category === 'doc').length,
              },
              {
                key: 'sheet',
                label: 'Google Sheets (.CSV)',
                count: allDownloadableDocs.filter((d) => d.category === 'sheet').length,
              },
              {
                key: 'form',
                label: 'Google Forms (.TXT)',
                count: allDownloadableDocs.filter((d) => d.category === 'form').length,
              },
              {
                key: 'knowledge_base',
                label: 'Apps Script (.GS)',
                count: allDownloadableDocs.filter((d) => d.category === 'knowledge_base' || !!d.appsScriptCode).length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setDownloadFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  downloadFilter === tab.key
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    downloadFilter === tab.key
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={downloadSearch}
              onChange={(e) => setDownloadSearch(e.target.value)}
              placeholder="Buscar por título o etiqueta..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-black dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Document Cards Grid */}
        {filteredDownloadDocs.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 text-xs">
            No se encontraron documentos con el filtro o término de búsqueda aplicado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDownloadDocs.map((doc) => {
              const isCustom = customDocsList.some((c) => c.id === doc.id);
              const isSaved = savedDocIds[doc.id];
              const isCopied = copiedDocId === doc.id;
              const defaultExt =
                doc.category === 'sheet'
                  ? 'csv'
                  : doc.appsScriptCode || doc.category === 'knowledge_base'
                  ? 'gs'
                  : 'md';

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-neutral-800">
                          {getDocIcon(doc.category)}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            defaultExt === 'csv'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : defaultExt === 'gs'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          .{defaultExt.toUpperCase()}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCustom
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                        }`}
                      >
                        {isCustom ? '⚡ Generado por Gemini' : '🏛️ Plantilla RBC'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white leading-snug">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {doc.tableSchema && doc.tableSchema.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                          {doc.tableSchema.length} Columnas CSV
                        </span>
                      )}
                      {doc.formQuestions && doc.formQuestions.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200/50 dark:border-fuchsia-800/40">
                          {doc.formQuestions.length} Preguntas
                        </span>
                      )}
                      {doc.suggestedFileName && (
                        <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 truncate max-w-[200px]">
                          📁 {doc.suggestedFileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
                    {/* Primary Download Button */}
                    <button
                      type="button"
                      onClick={() => {
                        downloadDocumentInFormat(doc, defaultExt);
                        onShowNotice(`Descargando "${doc.title}.${defaultExt}"...`);
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar .{defaultExt.toUpperCase()}</span>
                    </button>

                    {/* Format Alternative Chips */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 pt-1">
                      <span className="text-[10px]">Otros formatos:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => downloadDocumentInFormat(doc, 'md')}
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-gray-600 dark:text-neutral-300 font-mono text-[10px] cursor-pointer"
                          title="Descargar en Markdown"
                        >
                          .md
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadDocumentInFormat(doc, 'txt')}
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 font-mono text-[10px] cursor-pointer"
                          title="Descargar en Texto Plano"
                        >
                          .txt
                        </button>
                        {doc.category === 'sheet' && (
                          <button
                            type="button"
                            onClick={() => downloadDocumentInFormat(doc, 'csv')}
                            className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] cursor-pointer"
                            title="Descargar en CSV"
                          >
                            .csv
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => downloadDocumentInFormat(doc, 'json')}
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 font-mono text-[10px] cursor-pointer"
                          title="Descargar en JSON"
                        >
                          .json
                        </button>
                      </div>
                    </div>

                    {/* Secondary Navigation Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyDocContent(doc)}
                        className="flex-1 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInspectingDoc(doc)}
                        className="py-1.5 px-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                        title="Ver contenido detallado"
                      >
                        Ver Detalle
                      </button>

                      {doc.openUrl && (
                        <a
                          href={doc.openUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs transition-colors"
                          title="Abrir en Google Workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => requestSaveDoc(doc)}
                        disabled={isSaved}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                            : 'border border-gray-200 dark:border-neutral-800 hover:bg-purple-50 text-purple-600 dark:text-purple-400'
                        }`}
                        title={isSaved ? 'Registrado en el Cerebro' : 'Guardar en Cerebro RBC'}
                      >
                        {isSaved ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Brain className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SUITE COMPLETA DE 5 DOCUMENTOS DE INTEGRACIÓN                   */}
      {/* ========================================================================= */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 border border-gray-200 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-3.5 h-3.5" />
              <span>Ecosistema Completo</span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white tracking-tight">
              Suite Maestra de Integración con Google Workspace
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-2xl">
              Genera con un solo clic los 5 documentos necesarios para operar la consultoría:
              Directorio en Google Sheets, Cuestionario en Google Forms, Contrato Marco en Google Docs,
              Código Apps Script y Plan Maestro de Quiebres.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Target Client Dropdown */}
            <select
              value={suiteClientUid}
              onChange={(e) => setSuiteClientUid(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-semibold focus:ring-1 focus:ring-purple-500 outline-none"
            >
              <option value="">Para todos los coachees (Plantilla)</option>
              {clients.map((c) => (
                <option key={c.uid} value={c.uid}>
                  Para: {c.name} ({c.email})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleGenerateSuite}
              disabled={isGeneratingSuite}
              className="px-5 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSuite ? 'animate-spin' : ''}`} />
              <span>{isGeneratingSuite ? 'Redactando con Gemini...' : 'Generar Suite de 5 Documentos'}</span>
            </button>
          </div>
        </div>

        {/* Generated Suite Output */}
        {generatedSuite && (
          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-neutral-800">
            {/* Executive Summary Card */}
            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    {generatedSuite.suiteTitle}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 font-light mt-1">
                    {generatedSuite.executiveSummary}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadBatch(generatedSuite.documents)}
                    disabled={isBatchDownloading}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isBatchDownloading ? 'animate-bounce' : ''}`} />
                    <span>
                      {isBatchDownloading
                        ? `Descargando (${batchProgress?.current}/${batchProgress?.total})...`
                        : 'Descargar los 5 Archivos'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={requestSaveSuite}
                    className="px-4.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-200" />
                    <span>Guardar los 5 en Cerebro RBC</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5 Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedSuite.documents.map((doc) => {
                const isSaved = savedDocIds[doc.id];
                const defaultExt =
                  doc.category === 'sheet'
                    ? 'csv'
                    : doc.appsScriptCode || doc.category === 'knowledge_base'
                    ? 'gs'
                    : 'md';

                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-neutral-800/60">
                          {getDocIcon(doc.category)}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
                          {doc.category === 'sheet'
                            ? 'Google Sheets (.CSV)'
                            : doc.category === 'form'
                            ? 'Google Forms (.TXT)'
                            : doc.category === 'slide'
                            ? 'Google Slides'
                            : doc.appsScriptCode
                            ? 'Apps Script (.GS)'
                            : 'Google Docs (.MD)'}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-black dark:text-white leading-snug">
                          {doc.title}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      </div>

                      {doc.contentSnippet && (
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40 text-[11px] text-gray-600 dark:text-neutral-400 font-mono line-clamp-2 border border-gray-100 dark:border-neutral-800">
                          {doc.contentSnippet}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                      {/* Direct Download Button */}
                      <button
                        type="button"
                        onClick={() => {
                          downloadDocumentInFormat(doc, defaultExt);
                          onShowNotice(`Descargando "${doc.title}.${defaultExt}"...`);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar .{defaultExt.toUpperCase()}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          Ver y Copiar
                        </button>

                        {doc.openUrl && (
                          <a
                            href={doc.openUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors"
                            title="Abrir en Google Workspace"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => requestSaveDoc(doc)}
                          disabled={isSaved}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                              : 'border border-gray-200 dark:border-neutral-800 hover:bg-purple-50 text-purple-600 dark:text-purple-400'
                          }`}
                          title={isSaved ? 'Registrado en el Cerebro' : 'Guardar en Cerebro'}
                        >
                          {isSaved ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Brain className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: GENERADOR A LA CARTA CON PLANTILLAS Y PERSONALIZACIÓN           */}
      {/* ========================================================================= */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 border border-gray-200 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generador Específico a la Carta</span>
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white tracking-tight">
            Diseña un Documento Individual con Gemini
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-2xl">
            Selecciona el tipo de herramienta de Google Workspace, elige una plantilla rápida o
            personaliza los objetivos para que Gemini genere la estructura y el contenido formal.
          </p>
        </div>

        {/* Quick Presets Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
            Plantillas Rápidas Pre-calibradas
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-2xl bg-gray-100 hover:bg-purple-50 hover:text-purple-700 dark:bg-neutral-800/80 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 text-xs font-semibold transition-all cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleGenerateDoc} className="space-y-5 pt-2">
          {/* Document Type Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-2">
              Tipo de Documento en Google Workspace *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'doc', label: 'Google Docs', icon: FileText, desc: 'Marco / Contrato' },
                { id: 'sheet', label: 'Google Sheets', icon: FileSpreadsheet, desc: 'Matriz / Directorio' },
                { id: 'form', label: 'Google Forms', icon: FileText, desc: 'Cuestionario / Intake' },
                { id: 'slide', label: 'Google Slides', icon: Presentation, desc: 'Taller / Inducción' },
                { id: 'apps_script', label: 'Apps Script', icon: Code, desc: 'Automatización' },
              ].map((item) => {
                const Icon = item.icon;
                const active = docType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDocType(item.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-1 ring-purple-600'
                        : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${active ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-light">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                Coachee / Destinatario
              </label>
              <select
                value={selectedClientUid}
                onChange={(e) => setSelectedClientUid(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
              >
                <option value="">General / Uso Institucional RBC</option>
                {clients.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                Título del Documento (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Contrato Marco de Consultoría Ontológica"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
              Tema, Quiebre Ontológico o Propósito *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Matriz de quiebres directivos, pedidos impecables y compromisos somáticos"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
              Instrucciones Específicas o Contexto Adicional
            </label>
            <textarea
              rows={2}
              placeholder="Instrucciones para Gemini: enfoque específico, columnas deseadas para Sheets, tipo de preguntas para Forms..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isGeneratingDoc}
              className="px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingDoc ? 'animate-spin' : ''}`} />
              <span>{isGeneratingDoc ? 'Redactando con Gemini 3.8 Flash...' : 'Redactar Documento con Gemini'}</span>
            </button>
          </div>
        </form>

        {/* Last Generated Doc Preview */}
        {generatedDoc && (
          <div className="p-5 rounded-3xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Último Documento Generado por Gemini</span>
              </span>
              <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">
                {generatedDoc.id}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-black dark:text-white">
                  {generatedDoc.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-neutral-400 font-light mt-0.5">
                  {generatedDoc.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => {
                    const ext =
                      generatedDoc.category === 'sheet'
                        ? 'csv'
                        : generatedDoc.appsScriptCode || generatedDoc.category === 'knowledge_base'
                        ? 'gs'
                        : 'md';
                    downloadDocumentInFormat(generatedDoc, ext);
                    onShowNotice(`Descargando "${generatedDoc.title}.${ext}"...`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Descargar .
                    {generatedDoc.category === 'sheet'
                      ? 'CSV'
                      : generatedDoc.appsScriptCode || generatedDoc.category === 'knowledge_base'
                      ? 'GS'
                      : 'MD'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingDoc(generatedDoc)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-bold text-black dark:text-white hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ver Detalle & Copiar</span>
                </button>

                {generatedDoc.openUrl && (
                  <a
                    href={generatedDoc.openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Abrir en Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => requestSaveDoc(generatedDoc)}
                  disabled={savedDocIds[generatedDoc.id]}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    savedDocIds[generatedDoc.id]
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>
                    {savedDocIds[generatedDoc.id]
                      ? 'Registrado en Cerebro'
                      : 'Guardar en Cerebro'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Inspector Modal */}
      <GeminiWorkspaceDocModal
        doc={inspectingDoc}
        onClose={() => setInspectingDoc(null)}
        onSaveToBrain={(doc) => {
          requestSaveDoc(doc);
        }}
        isSaved={inspectingDoc ? !!savedDocIds[inspectingDoc.id] : false}
      />

      {/* Confirmation Modal */}
      <WorkspaceConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        description={confirmationState.description}
        confirmLabel={confirmationState.confirmLabel}
        onConfirm={confirmationState.action}
        onCancel={() => setConfirmationState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
