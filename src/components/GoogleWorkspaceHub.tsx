import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Session,
  GoogleWorkspaceConfig,
  DriveExportedFile,
  GoogleCalendarEventItem,
  WorkspaceDocumentCategory,
} from '../types';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import { OntologicalStore } from '../services/store';
import {
  Folder,
  FileSpreadsheet,
  FileText,
  Calendar,
  Video,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Copy,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Sparkles,
  Search,
  Brain,
  Link2,
  Edit3,
  Presentation,
  Filter,
  X,
  BookOpen,
  Tag,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface GoogleWorkspaceHubProps {
  clients: User[];
  sessions?: Session[];
  onOpenClient?: (clientId: string) => void;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  clients,
  sessions = [],
  onOpenClient,
}) => {
  const [config, setConfig] = useState<GoogleWorkspaceConfig>(() =>
    GoogleWorkspaceService.getConfig()
  );
  const [exportedFiles, setExportedFiles] = useState<DriveExportedFile[]>(() =>
    GoogleWorkspaceService.getExportedFiles()
  );
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [activeTab, setActiveTab] = useState<'brain' | 'drive' | 'sheets' | 'forms' | 'calendar'>('brain');

  // Loading & notification states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isCreatingDrive, setIsCreatingDrive] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSchedulingEvent, setIsSchedulingEvent] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | WorkspaceDocumentCategory>('all');

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DriveExportedFile | null>(null);

  // Form state for Generating New Document
  const [genType, setGenType] = useState<WorkspaceDocumentCategory>('doc');
  const [genTitle, setGenTitle] = useState('');
  const [genDescription, setGenDescription] = useState('');
  const [genTags, setGenTags] = useState('');
  const [genClientUid, setGenClientUid] = useState<string>('');
  const [genIsBrain, setGenIsBrain] = useState(true);
  const [genSnippet, setGenSnippet] = useState('');

  // Form state for Linking Existing Document
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkCategory, setLinkCategory] = useState<WorkspaceDocumentCategory>('doc');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkTags, setLinkTags] = useState('');
  const [linkClientUid, setLinkClientUid] = useState<string>('');
  const [linkIsBrain, setLinkIsBrain] = useState(true);
  const [linkSnippet, setLinkSnippet] = useState('');

  // Calendar Event Form State
  const [selectedClientForEvent, setSelectedClientForEvent] = useState<string>(
    clients[0]?.uid || ''
  );
  const [eventDate, setEventDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [eventStep, setEventStep] = useState<number>(1);
  const [eventNotes, setEventNotes] = useState<string>('');

  useEffect(() => {
    loadCalendarEvents();
  }, [config.isConnected]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showNotice(`¡Enlace copiado al portapapeles: ${label}!`);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const copyKnowledgeSnippet = (doc: DriveExportedFile) => {
    const textToCopy = `[DOCUMENTO CEREBRO ONTOLÓGICO: ${doc.name}]\nCategoría: ${doc.category}\nEnlace: ${doc.webViewLink}\nDescripción: ${doc.description || ''}\nContenido / Axiomas: ${doc.contentSnippet || ''}\nEtiquetas: ${(doc.tags || []).join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    showNotice(`¡Axiomas de "${doc.name}" copiados para nutrir al Copiloto Gemini o coachee!`);
  };

  const loadCalendarEvents = async () => {
    try {
      const events = await GoogleWorkspaceService.fetchUpcomingCalendarEvents();
      setCalendarEvents(events);
    } catch {
      // ignore
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await GoogleWorkspaceService.connectGoogleAccount();
      const newConfig = GoogleWorkspaceService.getConfig();
      setConfig(newConfig);
      showNotice(`¡Google Workspace sincronizado exitosamente con ${res.email}!`);
      loadCalendarEvents();
    } catch (err: any) {
      showNotice(`Sesión activa en ${config.accountEmail}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSetupDrive = async () => {
    setIsCreatingDrive(true);
    try {
      await GoogleWorkspaceService.setupDriveStructure();
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice('¡Estructura de carpetas verificada en Google Drive para ' + config.accountEmail + '!');
    } catch (err: any) {
      showNotice(`Error en Google Drive: ${err.message}`);
    } finally {
      setIsCreatingDrive(false);
    }
  };

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const currentClients = OntologicalStore.getUsers();
      const res = await GoogleWorkspaceService.syncClientsToGoogleSheet(currentClients);
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice(`¡${res.rowCount} clientes sincronizados en Google Sheets!`);
    } catch (err: any) {
      showNotice(`Error al sincronizar Sheets: ${err.message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCreateForm = async () => {
    setIsCreatingForm(true);
    try {
      await GoogleWorkspaceService.createOntologicalForm();
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice('¡Cuestionario ontológico oficial generado en Google Forms!');
    } catch (err: any) {
      showNotice(`Error en Google Forms: ${err.message}`);
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.uid === selectedClientForEvent);
    if (!targetClient) return;

    setIsSchedulingEvent(true);
    try {
      await GoogleWorkspaceService.scheduleCoachingCalendarEvent(
        targetClient,
        new Date(eventDate).toISOString(),
        eventStep,
        eventNotes
      );
      const updated = GoogleWorkspaceService.getConfig();
      setConfig(updated);
      await loadCalendarEvents();
      showNotice(
        `¡Sesión ${eventStep} agendada en Google Calendar para ${targetClient.name} con sala Google Meet!`
      );
      setEventNotes('');
    } catch (err: any) {
      showNotice(`Error en Calendar: ${err.message}`);
    } finally {
      setIsSchedulingEvent(false);
    }
  };

  const handleDeleteFile = (id: string, name: string) => {
    if (window.confirm(`¿Deseas retirar "${name}" del Ecosistema Workspace?`)) {
      GoogleWorkspaceService.deleteExportedFile(id);
      setExportedFiles(GoogleWorkspaceService.getExportedFiles());
      showNotice(`Documento retirado: ${name}`);
    }
  };

  // Autodetect link category when user pastes URL
  const handleLinkUrlChange = (url: string) => {
    setLinkUrl(url);
    if (url) {
      const detected = GoogleWorkspaceService.detectDocumentTypeFromUrl(url);
      setLinkCategory(detected);
    }
  };

  // Submit Handler: Linking Existing Document
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkTitle.trim()) {
      showNotice('Por favor ingresa al menos el título y el enlace.');
      return;
    }

    const targetClient = clients.find((c) => c.uid === linkClientUid);
    const parsedTags = linkTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newDoc = GoogleWorkspaceService.addCustomDocument({
      name: linkTitle.trim(),
      webViewLink: linkUrl.trim(),
      category: linkCategory,
      description: linkDescription.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['Cerebro RBC', 'Workspace'],
      clientId: targetClient?.uid,
      clientName: targetClient?.name,
      isBrainDocument: linkIsBrain,
      contentSnippet: linkSnippet.trim(),
    });

    setExportedFiles(GoogleWorkspaceService.getExportedFiles());
    setShowLinkModal(false);

    // Reset Form
    setLinkUrl('');
    setLinkTitle('');
    setLinkDescription('');
    setLinkTags('');
    setLinkClientUid('');
    setLinkSnippet('');
    setLinkIsBrain(true);

    showNotice(`¡"${newDoc.name}" vinculado con éxito al Cerebro de la App!`);
  };

  // Submit Handler: Generating New Document in Google Workspace
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) {
      showNotice('Por favor asigna un título para el nuevo documento.');
      return;
    }

    const targetClient = clients.find((c) => c.uid === genClientUid);
    const parsedTags = genTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { doc, openUrl } = GoogleWorkspaceService.generateNewWorkspaceDocument({
      type: genType,
      title: genTitle.trim(),
      description: genDescription.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['Cerebro RBC', 'Nuevo Documento'],
      clientId: targetClient?.uid,
      clientName: targetClient?.name,
      isBrainDocument: genIsBrain,
      contentSnippet: genSnippet.trim(),
    });

    setExportedFiles(GoogleWorkspaceService.getExportedFiles());
    setShowGenerateModal(false);

    // Reset Form
    setGenTitle('');
    setGenDescription('');
    setGenTags('');
    setGenClientUid('');
    setGenSnippet('');
    setGenIsBrain(true);

    // Open newly created Google tool in new tab
    window.open(openUrl, '_blank');

    showNotice(`¡"${doc.name}" generado y registrado en el Cerebro de la App!`);
  };

  // Apply template pre-fill to Generate Form
  const applyTemplate = (template: {
    title: string;
    type: WorkspaceDocumentCategory;
    desc: string;
    tags: string;
    snippet: string;
  }) => {
    setGenType(template.type);
    setGenTitle(template.title);
    setGenDescription(template.desc);
    setGenTags(template.tags);
    setGenSnippet(template.snippet);
  };

  // Submit Handler: Edit Document Modal
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    GoogleWorkspaceService.updateCustomDocument(editingDoc.id, {
      name: editingDoc.name,
      webViewLink: editingDoc.webViewLink,
      category: editingDoc.category,
      description: editingDoc.description,
      tags: editingDoc.tags,
      isBrainDocument: editingDoc.isBrainDocument,
      contentSnippet: editingDoc.contentSnippet,
    });

    setExportedFiles(GoogleWorkspaceService.getExportedFiles());
    setEditingDoc(null);
    showNotice(`¡Ficha de "${editingDoc.name}" actualizada con éxito!`);
  };

  // Filtered lists
  const brainDocuments = useMemo(() => {
    return exportedFiles.filter((f) => f.isBrainDocument || f.category === 'knowledge_base');
  }, [exportedFiles]);

  const filteredFiles = useMemo(() => {
    return exportedFiles.filter((file) => {
      const matchesCategory =
        selectedCategoryFilter === 'all'
          ? true
          : file.category === selectedCategoryFilter;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        file.name.toLowerCase().includes(q) ||
        (file.description && file.description.toLowerCase().includes(q)) ||
        (file.contentSnippet && file.contentSnippet.toLowerCase().includes(q)) ||
        (file.clientName && file.clientName.toLowerCase().includes(q)) ||
        (file.tags && file.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesQuery;
    });
  }, [exportedFiles, selectedCategoryFilter, searchQuery]);

  const getCategoryBadge = (category: WorkspaceDocumentCategory) => {
    switch (category) {
      case 'knowledge_base':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <Brain className="w-3 h-3" />
            <span>Cerebro RBC</span>
          </span>
        );
      case 'doc':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <FileText className="w-3 h-3" />
            <span>Google Doc</span>
          </span>
        );
      case 'sheet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <FileSpreadsheet className="w-3 h-3" />
            <span>Google Sheet</span>
          </span>
        );
      case 'slide':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Presentation className="w-3 h-3" />
            <span>Google Slide</span>
          </span>
        );
      case 'form':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800/60">
            <FileText className="w-3 h-3" />
            <span>Google Form</span>
          </span>
        );
      case 'folder':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
            <Folder className="w-3 h-3" />
            <span>Carpeta Drive</span>
          </span>
        );
      case 'pdf_report':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <FileText className="w-3 h-3" />
            <span>Informe PDF</span>
          </span>
        );
    }
  };

  const getCategoryIcon = (category: WorkspaceDocumentCategory) => {
    switch (category) {
      case 'knowledge_base':
        return <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'form':
        return <FileText className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      default:
        return <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fade-in text-left">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white dark:bg-white dark:text-black px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold tracking-wide border border-neutral-700 dark:border-neutral-200 animate-slide-up">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Header / Ecosystem Brain Banner */}
      <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cerebro Operativo & Ecosistema Workspace Activo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Cerebro de la App & Google Workspace
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 max-w-2xl font-light leading-relaxed">
              Espacio central para generar nuevos documentos o vincular enlaces de Google Docs,
              Sheets, Slides, Forms y Drive, construyendo la base de conocimiento ontológico de{' '}
              <span className="font-semibold text-black dark:text-white">
                Rengifo Basto Consultoría
              </span>{' '}
              ({config.accountEmail}).
            </p>
          </div>

          {/* Primary Action Buttons: Generar + Vincular */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGenerateModal(true)}
              className="px-4.5 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Generar Nuevo Documento</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="px-4.5 py-2.5 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Vincular por Enlace</span>
            </button>

            <a
              href="https://drive.google.com/drive/u/0/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Abrir Google Drive en nueva pestaña"
            >
              <HardDrive className="w-3.5 h-3.5 text-sky-500" />
              <span>Abrir Drive</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Ecosystem Health Barometer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800/80">
          <div className="p-3.5 rounded-2xl glass-panel-opal">
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
              Cerebro Ontológico
            </span>
            <div className="text-xl font-black text-black dark:text-white mt-1 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>{brainDocuments.length} Bases Activas</span>
            </div>
            <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
              Marcos, axiomas y protocolos
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-opal">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Total Archivos Workspace
            </span>
            <div className="text-xl font-black text-black dark:text-white mt-1">
              {exportedFiles.length}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
              Docs, Sheets, Slides y Forms
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-opal">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Directorio Sheets
            </span>
            <div className="text-xl font-black text-black dark:text-white mt-1">
              {clients.length} Clientes
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Matriz lista para sync</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-opal">
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">
              Cuenta Ancla Master
            </span>
            <div className="text-xs font-mono font-bold text-black dark:text-white mt-1 truncate">
              {config.accountEmail}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              🟢 Estado Operativo Activo
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Services */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-neutral-800 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('brain')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'brain'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>🧠 Cerebro de la App ({brainDocuments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drive')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Google Drive & Todos ({exportedFiles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets (Directorio)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Google Forms (Reflexiones)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Google Calendar & Meet</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: CEREBRO DE LA APP (BASE DE CONOCIMIENTO ONTOLÓGICO)                 */}
      {/* ========================================================================= */}
      {activeTab === 'brain' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Description & Search */}
          <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5 border-purple-200/70 dark:border-purple-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  <Brain className="w-3 h-3" />
                  <span>Base de Conocimiento Central RBC</span>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white">
                  Cerebro Operativo de la Consultoría
                </h3>
                <p className="text-xs text-gray-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
                  Todos los documentos, enlaces y axiomas aquí vinculados componen el corpus
                  metodológico del modelo ontológico (OSAR, distinciones lingüísticas, matrices y
                  cuestionarios somáticos). Puedes abrir cada documento, editar sus notas o copiar
                  sus axiomas para el Copiloto Gemini.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Nuevo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="px-4 py-2.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-neutral-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Vincular Link</span>
                </button>
              </div>
            </div>

            {/* Quick Search & Filters for Brain Documents */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en el cerebro por título, etiqueta, axioma o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-400 hover:text-black dark:hover:text-white px-2 py-1"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          </div>

          {/* Brain Knowledge Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brainDocuments
              .filter((doc) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return (
                  doc.name.toLowerCase().includes(q) ||
                  (doc.description && doc.description.toLowerCase().includes(q)) ||
                  (doc.contentSnippet && doc.contentSnippet.toLowerCase().includes(q)) ||
                  (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q)))
                );
              })
              .map((doc) => (
                <div
                  key={doc.id}
                  className="card-solid-white rounded-3xl p-5 hover:border-purple-300 dark:hover:border-purple-700/60 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category Badge + Options */}
                    <div className="flex items-center justify-between gap-2">
                      {getCategoryBadge(doc.category)}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingDoc(doc)}
                          className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                          title="Editar ficha del documento"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(doc.id, doc.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Desvincular del cerebro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Type Icon */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex-shrink-0 mt-0.5">
                        {getCategoryIcon(doc.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white line-clamp-2 leading-tight">
                          {doc.name}
                        </h4>
                        {doc.clientName && (
                          <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-normal">
                            Cliente: {doc.clientName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <p className="text-xs text-gray-600 dark:text-neutral-400 font-light line-clamp-3 leading-relaxed">
                        {doc.description}
                      </p>
                    )}

                    {/* Content Snippet / Axiomas */}
                    {doc.contentSnippet && (
                      <div className="p-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300 font-normal italic space-y-1">
                        <div className="font-bold uppercase tracking-wider text-[9px] text-purple-700 dark:text-purple-400 flex items-center gap-1 not-italic">
                          <Sparkles className="w-3 h-3" />
                          <span>Axioma / Resumen para IA:</span>
                        </div>
                        <p className="line-clamp-3 leading-snug">{doc.contentSnippet}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {doc.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                    <a
                      href={doc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-[11px] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Abrir en Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1">
                      {doc.contentSnippet && (
                        <button
                          type="button"
                          onClick={() => copyKnowledgeSnippet(doc)}
                          className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors"
                          title="Copiar axiomas y resumen para nutrir al Copiloto Gemini"
                        >
                          <Brain className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(doc.webViewLink, doc.name)}
                        className="p-2 text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                        title="Copiar enlace directo"
                      >
                        {copiedUrl === doc.webViewLink ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GOOGLE DRIVE & TODOS LOS ARCHIVOS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'drive' && (
        <div className="space-y-6 animate-fade-in">
          {/* Drive Folders Architecture Card */}
          <div className="glass-panel-sheer rounded-3xl p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Estructura en la Nube
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Jerarquía de Carpetas en Drive
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Organización centralizada en Google Drive ({config.accountEmail}).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSetupDrive}
                  disabled={isCreatingDrive}
                  className="px-4 py-2 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCreatingDrive ? 'animate-spin' : ''}`} />
                  <span>{isCreatingDrive ? 'Verificando...' : 'Verificar Estructura'}</span>
                </button>

                <a
                  href="https://drive.google.com/drive/u/0/my-drive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Abrir Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Folder Branches Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl glass-panel-opal space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                    PDFs
                  </span>
                </div>
                <div className="font-bold text-xs text-black dark:text-white">
                  01_Reportes_e_Informes_PDF
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Archivado automático al emitir diagnósticos ontológicos por sesión.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel-opal space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Sheets
                  </span>
                </div>
                <div className="font-bold text-xs text-black dark:text-white">
                  02_Directorio_y_Matriz_Maestra
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Hoja de cálculo bidireccional con estados semáforo y quiebres.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel-opal space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                    Forms
                  </span>
                </div>
                <div className="font-bold text-xs text-black dark:text-white">
                  03_Cuestionarios_y_Reflexiones
                </div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                  Formularios para registro somático y compromisos de coachees.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Category Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, cliente, categoría o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#151518] border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                }`}
              >
                Todos ({exportedFiles.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('knowledge_base')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === 'knowledge_base'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                }`}
              >
                Cerebro
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('doc')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === 'doc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                Docs
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('sheet')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === 'sheet'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                Sheets
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('slide')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === 'slide'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                }`}
              >
                Slides
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('form')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  selectedCategoryFilter === 'form'
                    ? 'bg-fuchsia-600 text-white'
                    : 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300'
                }`}
              >
                Forms
              </button>
            </div>
          </div>

          {/* Exported Documents Table */}
          <div className="glass-panel-sheer rounded-3xl shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-black dark:text-white">
                  Inventario de Archivos Sincronizados ({filteredFiles.length})
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                  Documentos vinculados y almacenados para la consultoría.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 font-semibold text-xs text-black dark:text-white flex items-center gap-1"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Vincular</span>
                </button>
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-neutral-500 space-y-2">
                <Folder className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No se encontraron documentos con los filtros actuales.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 border-b border-gray-100 dark:border-neutral-800">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Nombre del Documento</th>
                      <th className="py-3.5 px-4 font-semibold">Tipo / Categoría</th>
                      <th className="py-3.5 px-4 font-semibold">Cerebro</th>
                      <th className="py-3.5 px-4 font-semibold">Cliente</th>
                      <th className="py-3.5 px-4 font-semibold">Fecha</th>
                      <th className="py-3.5 px-6 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            {getCategoryIcon(file.category)}
                            <div>
                              <span className="font-semibold text-black dark:text-white line-clamp-1">
                                {file.name}
                              </span>
                              {file.description && (
                                <span className="text-[11px] text-gray-400 dark:text-neutral-500 line-clamp-1">
                                  {file.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getCategoryBadge(file.category)}
                        </td>
                        <td className="py-3.5 px-4">
                          {file.isBrainDocument ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                              🧠 Sí
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-neutral-600 text-[10px]">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-300">
                          {file.clientName || 'General / Master'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 dark:text-neutral-500 font-mono text-[11px]">
                          {new Date(file.uploadedAt).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <span>Abrir</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setEditingDoc(file)}
                              className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                              title="Editar ficha"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOOGLE SHEETS (DIRECTORIO MAESTRO)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'sheets' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Matriz Central de Datos
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Directorio Maestro en Google Sheets
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Sincroniza en tiempo real los {clients.length} clientes, quiebres ontológicos y
                  montos invertidos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSyncSheets}
                  disabled={isSyncingSheets}
                  className="px-5 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncingSheets
                      ? 'Sincronizando...'
                      : `Sincronizar ${clients.length} Clientes`}
                  </span>
                </button>

                <a
                  href={
                    config.sheets.masterSpreadsheetUrl ||
                    'https://docs.google.com/spreadsheets/u/0/'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Abrir en Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Sync Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">
                    Sincronización Bidireccional Habilitada
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-light text-[11px]">
                    Última sincronización:{' '}
                    {config.sheets.lastSyncedAt
                      ? new Date(config.sheets.lastSyncedAt).toLocaleString('es-CO')
                      : 'Reciente'}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold">
                {clients.length} Registros Activos
              </span>
            </div>

            {/* Live Table Preview of Google Sheet Data */}
            <div className="rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-neutral-900 px-5 py-3 border-b border-gray-200/80 dark:border-neutral-800 text-xs font-bold text-black dark:text-white flex items-center justify-between">
                <span>Vista Previa de Columnas en Google Sheets</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  Hoja: "Clientes Activos"
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white dark:bg-[#151518] text-gray-400 border-b border-gray-100 dark:border-neutral-800 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Cliente</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-4">Quiebre Ontológico Principal</th>
                      <th className="py-2.5 px-3">Total Invertido</th>
                      <th className="py-2.5 px-3">Progreso</th>
                      <th className="py-2.5 px-3">Cuenta Google</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 bg-white dark:bg-[#151518]">
                    {clients.map((c) => (
                      <tr
                        key={c.uid}
                        className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-black dark:text-white">
                          {c.name}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {c.email}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : c.status === 'waiting'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {c.status === 'active'
                              ? '🟢 ACTIVO'
                              : c.status === 'waiting'
                              ? '🟡 EN ESPERA'
                              : '⚪ INACTIVO'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-neutral-300 max-w-xs truncate">
                          {c.primaryBreakdown || 'En indagación inicial'}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-black dark:text-white">
                          {c.totalInvested || c.programFee || '$1.500.000 COP'}
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-medium">
                          Sesión {c.programProgress || 1}/6
                        </td>
                        <td className="py-3 px-3 text-[10px] font-mono text-gray-400">
                          {config.accountEmail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GOOGLE FORMS (REFLEXIONES & CUESTIONARIOS)                          */}
      {/* ========================================================================= */}
      {activeTab === 'forms' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Indagación & Calibración Somática
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Cuestionario Ontológico en Google Forms
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Formularios para el registro somático, declaraciones y quiebres de cada coachee.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateForm}
                  disabled={isCreatingForm}
                  className="px-5 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingForm ? 'Generando...' : 'Crear Nuevo Formulario'}</span>
                </button>
              </div>
            </div>

            {/* Active Form Card with Links */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-neutral-900 border border-purple-200/60 dark:border-purple-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">
                      Cuestionario Ontológico Post-Sesión (Certeza & Fronteras)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light">
                      5 preguntas clave: Mapeo somático, quiebre lingüístico, compromisos y escala
                      de certeza.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 self-start sm:self-auto">
                  ✓ Formulario Oficial Activo
                </span>
              </div>

              {/* Action Buttons: Open, Edit, Copy */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={config.forms.activeFormUrl || 'https://docs.google.com/forms/u/0/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Formulario (Vista Coachee)</span>
                </a>

                <a
                  href={config.forms.activeFormEditUrl || 'https://docs.google.com/forms/u/0/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-black dark:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Editar en Google Forms</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      config.forms.activeFormUrl || 'https://docs.google.com/forms/u/0/',
                      'Enlace del Formulario para WhatsApp'
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-black dark:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? '¡Copiado!' : 'Copiar Enlace para Enviar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GOOGLE CALENDAR & GOOGLE MEET                                       */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Schedule Session Form */}
          <div className="bg-white dark:bg-[#151518] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold block">
                  Agendamiento Directo
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">
                  Programar Sesión en Google Calendar & Google Meet
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                  Crea el evento en el calendario de {config.accountEmail}, genera la sala de Google
                  Meet e invita al cliente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <a
                  href={OntologicalStore.getCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Página de agendamiento de sesiones 1 a 1 en Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Agendamiento 1 a 1</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>

                <a
                  href="https://calendar.google.com/calendar/u/0/r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-black dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Abrir Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Cliente Coachee
                </label>
                <select
                  value={selectedClientForEvent}
                  onChange={(e) => setSelectedClientForEvent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Fecha & Hora de la Sesión
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Nodo / Sesión del Programa
                </label>
                <select
                  value={eventStep}
                  onChange={(e) => setEventStep(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                >
                  <option value={1}>Sesión 1: Mapeo de la Transparencia</option>
                  <option value={2}>Sesión 2: Deconstrucción de Creencias</option>
                  <option value={3}>Sesión 3: Re-configuración Lingüística</option>
                  <option value={4}>Sesión 4: Arquitectura de Fronteras</option>
                  <option value={5}>Sesión 5: Sabiduría y Disposición Corporal</option>
                  <option value={6}>Sesión 6: Cierre y Dirección Personal</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Foco de Indagación u Observaciones
                </label>
                <input
                  type="text"
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Ej: Trabajar quiebre de reactividad con subordinados y acuerdos de límites..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSchedulingEvent}
                  className="px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Video className="w-4 h-4" />
                  <span>
                    {isSchedulingEvent
                      ? 'Agendando...'
                      : 'Crear Evento en Google Calendar & Generar Meet'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-white dark:bg-[#151518] rounded-3xl border border-gray-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-black dark:text-white">
                  Próximas Sesiones Agendadas ({calendarEvents.length})
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
                  Eventos vinculados en el calendario de {config.accountEmail}.
                </p>
              </div>
              <button
                type="button"
                onClick={loadCalendarEvents}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                title="Actualizar eventos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {calendarEvents.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-neutral-500 space-y-2">
                <Calendar className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No hay sesiones próximas agendadas.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <h5 className="font-bold text-xs sm:text-sm text-black dark:text-white">
                          {evt.summary}
                        </h5>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 font-light flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {evt.start.dateTime
                            ? new Date(evt.start.dateTime).toLocaleString('es-CO', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Fecha programada'}
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-light line-clamp-1 max-w-xl">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      {evt.hangoutLink && (
                        <a
                          href={evt.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Entrar a Google Meet</span>
                        </a>
                      )}
                      <a
                        href={evt.htmlLink || 'https://calendar.google.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <span>Ver en Calendar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: GENERAR NUEVO DOCUMENTO EN GOOGLE WORKSPACE                      */}
      {/* ========================================================================= */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-6 relative my-8">
            <button
              type="button"
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Creación Asistida</span>
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Generar Nuevo Documento en Workspace
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1">
                Crea un nuevo archivo en Google Workspace oficial y regístralo inmediatamente en el
                cerebro de la consultoría.
              </p>
            </div>

            {/* Quick Templates Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                Plantillas Ontológicas Recomendadas (1 Clic):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: 'Marco Teórico RBC: Modelo OSAR & Distinciones Lingüísticas',
                      type: 'knowledge_base',
                      desc: 'Compendio teórico de la consultoría ontológica: Observador, Sistema, Acciones y Resultados.',
                      tags: 'Cerebro RBC, OSAR, Distinciones, ICF',
                      snippet:
                        'El lenguaje es generativo: crea realidades a través de declaraciones, peticiones, ofertas y promesas.',
                    })
                  }
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-purple-400 dark:hover:border-purple-600 text-left transition-colors bg-gray-50/60 dark:bg-neutral-900/60"
                >
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-500" />
                    <span>Marco Teórico OSAR</span>
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-1">Google Doc • Cerebro</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: 'Protocolo de Sesión 1 a 1 & Acuerdos de Fronteras',
                      type: 'doc',
                      desc: 'Secuencia estructurada de intervención ontológica y delimitación de acuerdos.',
                      tags: 'Protocolo, Sesión 1 a 1, Límites',
                      snippet:
                        'Estructura de sesión: 1. Acuerdos de contexto. 2. Identificación del quiebre. 3. Intervención somática. 4. Compromisos verificables.',
                    })
                  }
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-colors bg-gray-50/60 dark:bg-neutral-900/60"
                >
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Protocolo de Sesión 1 a 1</span>
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-1">Google Doc • Guía</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: 'Matriz Directiva de Quiebres & Seguimiento de Metas',
                      type: 'sheet',
                      desc: 'Tablero de control en hoja de cálculo con semáforos de cumplimiento por coachee.',
                      tags: 'Matriz, Seguimiento, Quiebres, Metas',
                      snippet: 'Registro dinámico de quiebres resueltos y progreso medible por nivel.',
                    })
                  }
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-emerald-400 dark:hover:border-emerald-600 text-left transition-colors bg-gray-50/60 dark:bg-neutral-900/60"
                >
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Matriz de Quiebres</span>
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-1">Google Sheet • Métricas</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: 'Diapositivas Masterclass: Certeza, Fronteras & Dirección Personal',
                      type: 'slide',
                      desc: 'Presentación oficial para talleres online transmitidos por Google Meet.',
                      tags: 'Taller, Masterclass, Meet, Diapositivas',
                      snippet: '6 módulos visuales sobre soberanía personal y diseño de conversaciones complejas.',
                    })
                  }
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 text-left transition-colors bg-gray-50/60 dark:bg-neutral-900/60"
                >
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-amber-500" />
                    <span>Diapositivas de Taller</span>
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-1">Google Slide • Taller</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              {/* Type Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1.5">
                  Herramienta de Google Workspace
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenType('knowledge_base')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      genType === 'knowledge_base'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-[10px]">Cerebro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenType('doc')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      genType === 'doc'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px]">Docs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenType('sheet')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      genType === 'sheet'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px]">Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenType('slide')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      genType === 'slide'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    <Presentation className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px]">Slides</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenType('form')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      genType === 'form'
                        ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300 font-bold'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-fuchsia-600" />
                    <span className="text-[10px]">Forms</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenType('folder')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      genType === 'folder'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-sky-600" />
                    <span className="text-[10px]">Carpeta</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Guía de Preguntas Poderosas para Quiebres de Liderazgo"
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Descripción / Propósito
                </label>
                <textarea
                  rows={2}
                  placeholder="Sintetiza qué aporta este documento a los coachees o al proceso ontológico..."
                  value={genDescription}
                  onChange={(e) => setGenDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Content Snippet for AI Brain */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>Axiomas o Puntos Clave para el Cerebro de la App</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Pega las distinciones, axiomas o conceptos ontológicos que el Copiloto Gemini debe recordar..."
                  value={genSnippet}
                  onChange={(e) => setGenSnippet(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Tags & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="OSAR, Liderazgo, ICF, Sesión 1"
                    value={genTags}
                    onChange={(e) => setGenTags(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                    Asociar a Cliente (Opcional)
                  </label>
                  <select
                    value={genClientUid}
                    onChange={(e) => setGenClientUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                  >
                    <option value="">General / Cerebro Master</option>
                    {clients.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox Brain */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="genBrainCheck"
                  checked={genIsBrain}
                  onChange={(e) => setGenIsBrain(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="genBrainCheck"
                  className="text-xs font-semibold text-black dark:text-white cursor-pointer select-none flex items-center gap-1.5"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                  <span>Incorporar este documento al Cerebro de la App</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generar y Abrir en Google Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VINCULAR DOCUMENTO EXISTENTE POR LINK (URL)                       */}
      {/* ========================================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-6 relative my-8">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Link2 className="w-3.5 h-3.5" />
                <span>Vincular por Enlace</span>
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Vincular Documento por Link
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1">
                Pega la URL de cualquier Google Doc, Sheet, Slide, Form, carpeta de Drive o archivo
                en la nube para integrarlo a la base de conocimiento.
              </p>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              {/* URL with Autodetect */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Enlace / URL del Documento *
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://docs.google.com/document/d/... o drive.google.com/..."
                    value={linkUrl}
                    onChange={(e) => handleLinkUrlChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
                  El sistema detectará automáticamente si se trata de un Doc, Sheet, Slide, Form o
                  carpeta de Drive.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Título / Nombre del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bitácora de Observaciones Ontológicas y Acuerdos ICF"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Categoría en Workspace
                </label>
                <select
                  value={linkCategory}
                  onChange={(e) => setLinkCategory(e.target.value as WorkspaceDocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                >
                  <option value="knowledge_base">🧠 Cerebro Ontológico (Base de Conocimiento)</option>
                  <option value="doc">📄 Google Docs (Guías, Protocolos y Modelos)</option>
                  <option value="sheet">📊 Google Sheets (Matrices y CRM)</option>
                  <option value="slide">🖥️ Google Slides (Presentaciones y Diapositivas)</option>
                  <option value="form">📝 Google Forms (Cuestionarios y Evaluaciones)</option>
                  <option value="folder">📁 Carpeta en Google Drive</option>
                  <option value="pdf_report">📑 Informe / Diagnóstico PDF</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Descripción / Propósito
                </label>
                <textarea
                  rows={2}
                  placeholder="¿De qué trata este documento? ¿Para qué etapas del coaching es relevante?"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Snippet / Axioms */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>Resumen / Axiomas para el Cerebro de la App (Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Sintetiza aquí los aprendizajes o axiomas para alimentar las respuestas del Copiloto de IA..."
                  value={linkSnippet}
                  onChange={(e) => setLinkSnippet(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Tags & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    placeholder="Liderazgo, Conversaciones, 2026"
                    value={linkTags}
                    onChange={(e) => setLinkTags(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                    Cliente Asociado (Opcional)
                  </label>
                  <select
                    value={linkClientUid}
                    onChange={(e) => setLinkClientUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                  >
                    <option value="">General / Cerebro Master</option>
                    {clients.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox Brain */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="linkBrainCheck"
                  checked={linkIsBrain}
                  onChange={(e) => setLinkIsBrain(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="linkBrainCheck"
                  className="text-xs font-semibold text-black dark:text-white cursor-pointer select-none flex items-center gap-1.5"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                  <span>Vincular al Cerebro de la App</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar en el Cerebro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDITAR FICHA DE DOCUMENTO                                        */}
      {/* ========================================================================= */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#151518] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 dark:border-neutral-800 shadow-2xl space-y-6 relative my-8">
            <button
              type="button"
              onClick={() => setEditingDoc(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Editar Ficha del Documento
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1">
                Actualiza el nombre, enlace o axiomas asociados a este componente del cerebro.
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Nombre del Documento
                </label>
                <input
                  type="text"
                  required
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Enlace Web
                </label>
                <input
                  type="url"
                  required
                  value={editingDoc.webViewLink}
                  onChange={(e) => setEditingDoc({ ...editingDoc, webViewLink: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Categoría
                </label>
                <select
                  value={editingDoc.category}
                  onChange={(e) =>
                    setEditingDoc({
                      ...editingDoc,
                      category: e.target.value as WorkspaceDocumentCategory,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                >
                  <option value="knowledge_base">🧠 Cerebro Ontológico (Base de Conocimiento)</option>
                  <option value="doc">📄 Google Docs (Guías, Protocolos y Modelos)</option>
                  <option value="sheet">📊 Google Sheets (Matrices y CRM)</option>
                  <option value="slide">🖥️ Google Slides (Presentaciones y Diapositivas)</option>
                  <option value="form">📝 Google Forms (Cuestionarios y Evaluaciones)</option>
                  <option value="folder">📁 Carpeta en Google Drive</option>
                  <option value="pdf_report">📑 Informe / Diagnóstico PDF</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={editingDoc.description || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Axiomas / Resumen para Cerebro IA
                </label>
                <textarea
                  rows={2}
                  value={editingDoc.contentSnippet || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, contentSnippet: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editBrainCheck"
                  checked={editingDoc.isBrainDocument || false}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, isBrainDocument: e.target.checked })
                  }
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="editBrainCheck"
                  className="text-xs font-semibold text-black dark:text-white cursor-pointer select-none"
                >
                  Marcar como documento del Cerebro de la App
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
