import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Session,
  GoogleWorkspaceConfig,
  DriveExportedFile,
  WorkspaceDocumentCategory,
} from '../types';
import {
  GoogleWorkspaceService,
  OFFICIAL_CEREBRO_DRIVE_FOLDER_ID,
  OFFICIAL_CEREBRO_DRIVE_FOLDER_URL,
  OFFICIAL_CEREBRO_DRIVE_DOCUMENTS,
} from '../services/googleWorkspace';
import { FirestoreSyncService } from '../services/firestoreSync';
import { safeCopyToClipboard } from '../utils/clipboard';
import {
  Folder,
  FileSpreadsheet,
  FileText,
  Calendar,
  Video,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Search,
  Brain,
  Link2,
  Edit3,
  Filter,
  X,
  LayoutGrid,
  List,
  Eye,
  BookOpen,
  Database,
  Users,
  Send,
  Sparkles,
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
  // Config & documents state
  const [config, setConfig] = useState<GoogleWorkspaceConfig>(() =>
    GoogleWorkspaceService.getConfig()
  );
  const [documents, setDocuments] = useState<DriveExportedFile[]>(() =>
    GoogleWorkspaceService.getExportedFiles()
  );

  // UI state
  const [activeTab, setActiveTab] = useState<
    'documents' | 'matrix' | 'form' | 'calendar' | 'firebase'
  >('documents');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [readingDoc, setReadingDoc] = useState<DriveExportedFile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DriveExportedFile | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DriveExportedFile | null>(null);

  // New document form state
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<WorkspaceDocumentCategory>('doc');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocTags, setNewDocTags] = useState('');
  const [newDocAxiom, setNewDocAxiom] = useState('');

  // Calendar scheduling form state
  const [scheduleClientId, setScheduleClientId] = useState<string>(
    clients[0]?.uid || ''
  );
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleStep, setScheduleStep] = useState<number>(1);
  const [scheduleNotes, setScheduleNotes] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore sync listener
  useEffect(() => {
    // Initial fetch from Firestore to ensure synchronization
    FirestoreSyncService.fetchWorkspaceDocuments()
      .then((remoteDocs) => {
        if (remoteDocs && remoteDocs.length > 0) {
          // Merge remote with clean official
          const map = new Map<string, DriveExportedFile>();
          for (const d of OFFICIAL_CEREBRO_DRIVE_DOCUMENTS) {
            map.set(d.id, d);
          }
          for (const d of remoteDocs) {
            if (d && d.id) {
              map.set(d.id, { ...(map.get(d.id) || {}), ...d });
            }
          }
          const merged = Array.from(map.values());
          setDocuments(merged);
          GoogleWorkspaceService.saveExportedFiles(merged);
        }
      })
      .catch((err) => {
        console.warn('Firestore initial workspace fetch notice:', err);
      });

    // Subscribe to changes
    const unsubscribe = FirestoreSyncService.subscribeToWorkspaceDocuments((remoteDocs) => {
      if (remoteDocs && remoteDocs.length > 0) {
        const map = new Map<string, DriveExportedFile>();
        for (const d of OFFICIAL_CEREBRO_DRIVE_DOCUMENTS) {
          map.set(d.id, d);
        }
        for (const d of remoteDocs) {
          if (d && d.id) {
            map.set(d.id, { ...(map.get(d.id) || {}), ...d });
          }
        }
        const merged = Array.from(map.values());
        setDocuments(merged);
        GoogleWorkspaceService.saveExportedFiles(merged);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.axiomaClave || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'doc' && doc.category === 'doc') ||
        (selectedCategory === 'sheet' && doc.category === 'sheet') ||
        (selectedCategory === 'form' && doc.category === 'form') ||
        (selectedCategory === 'folder' && doc.category === 'folder');

      return matchesSearch && matchesCat;
    });
  }, [documents, searchQuery, selectedCategory]);

  // Copy link handler
  const handleCopyLink = (url: string, id: string) => {
    safeCopyToClipboard(url);
    setCopiedId(id);
    showToast('¡Enlace de Google Drive copiado al portapapeles!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy document full content
  const handleCopyContent = (doc: DriveExportedFile) => {
    const textToCopy = doc.fullContent || `${doc.name}\n\n${doc.description || ''}`;
    safeCopyToClipboard(textToCopy);
    showToast(`¡Contenido de "${doc.name}" copiado!`);
  };

  // Reset workspace to clean official state
  const handleResetWorkspace = async () => {
    setIsResetting(true);
    try {
      const clean = await GoogleWorkspaceService.resetWorkspaceToCleanOfficialState();
      setDocuments(clean);
      showToast('¡Workspace reiniciado! Sincronizado con Google Drive y Firebase Firestore.');
    } catch (e) {
      console.error(e);
      showToast('Error al reiniciar workspace.');
    } finally {
      setIsResetting(false);
    }
  };

  // Force sync with Firebase Firestore
  const handleForceSyncFirebase = async () => {
    setIsSyncing(true);
    try {
      const count = await FirestoreSyncService.syncAllWorkspaceDocuments(documents);
      showToast(`¡${count} documentos sincronizados exitosamente con Firebase Firestore!`);
    } catch (e) {
      console.error(e);
      showToast('Error de sincronización con Firebase.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add new document
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocUrl.trim()) {
      showToast('Por favor ingresa un título y la URL del documento.');
      return;
    }

    const tagsArray = newDocTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = GoogleWorkspaceService.addCustomDocument({
      name: newDocTitle.trim(),
      webViewLink: newDocUrl.trim(),
      category: newDocCategory,
      description: newDocDescription.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Cerebro RBC', 'Drive Sync'],
      isBrainDocument: true,
      contentSnippet: newDocAxiom.trim() || newDocDescription.trim().substring(0, 120),
    });

    // Add axiomaClave and fullContent if provided
    if (newDocAxiom) {
      created.axiomaClave = newDocAxiom.trim();
    }

    setDocuments(GoogleWorkspaceService.getExportedFiles());
    setIsAddModalOpen(false);
    setNewDocTitle('');
    setNewDocUrl('');
    setNewDocDescription('');
    setNewDocTags('');
    setNewDocAxiom('');
    showToast(`¡Documento "${created.name}" vinculado y sincronizado con Firebase!`);
  };

  // Save edited document
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    GoogleWorkspaceService.updateCustomDocument(editingDoc.id, {
      name: editingDoc.name,
      webViewLink: editingDoc.webViewLink,
      description: editingDoc.description,
      axiomaClave: editingDoc.axiomaClave,
      tags: editingDoc.tags,
      category: editingDoc.category,
    });

    setDocuments(GoogleWorkspaceService.getExportedFiles());
    setEditingDoc(null);
    showToast('¡Documento actualizado y respaldado en Firebase Firestore!');
  };

  // Delete document
  const handleDeleteConfirm = () => {
    if (!deletingDoc) return;
    GoogleWorkspaceService.deleteExportedFile(deletingDoc.id);
    setDocuments(GoogleWorkspaceService.getExportedFiles());
    setDeletingDoc(null);
    showToast('¡Documento desvinculado de la plataforma!');
  };

  // Schedule Calendar Session
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.uid === scheduleClientId);
    if (!targetClient) {
      showToast('Selecciona un coachee válido.');
      return;
    }
    if (!scheduleDate) {
      showToast('Selecciona la fecha y hora de la sesión.');
      return;
    }

    setIsScheduling(true);
    try {
      await GoogleWorkspaceService.scheduleCoachingCalendarEvent(
        targetClient,
        new Date(scheduleDate).toISOString(),
        scheduleStep,
        scheduleNotes
      );
      showToast(`¡Sesión con ${targetClient.name} agendada en Google Calendar con Google Meet!`);
      setScheduleNotes('');
      setScheduleDate('');
    } catch (e) {
      console.error(e);
      showToast('Error al agendar la sesión.');
    } finally {
      setIsScheduling(false);
    }
  };

  // Category badge helper
  const getCategoryBadge = (cat: WorkspaceDocumentCategory) => {
    switch (cat) {
      case 'doc':
        return {
          label: 'Google Docs',
          icon: <FileText className="w-3.5 h-3.5" />,
          color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        };
      case 'sheet':
        return {
          label: 'Google Sheets',
          icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        };
      case 'form':
        return {
          label: 'Google Forms',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
        };
      case 'folder':
        return {
          label: 'Carpeta Drive',
          icon: <Folder className="w-3.5 h-3.5" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        };
      default:
        return {
          label: 'Cerebro RBC',
          icon: <Brain className="w-3.5 h-3.5" />,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          id="workspace-toast"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Clean Header */}
      <div
        id="workspace-clean-header"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Firebase Firestore Cerebro Activo
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Carpeta ID: {OFFICIAL_CEREBRO_DRIVE_FOLDER_ID}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Workspace & Cerebro RBC
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Repositorio centralizado de consultoría ontológica en Google Drive sincronizado en tiempo real con <strong>Firebase Firestore</strong> como cerebro principal de la aplicación.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              id="btn-open-official-drive-folder"
              href={OFFICIAL_CEREBRO_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 transition-colors shadow-sm"
            >
              <Folder className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              <span>Abrir Carpeta en Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              id="btn-add-document-modal-trigger"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Vincular Documento</span>
            </button>

            <button
              id="btn-clean-reset-workspace"
              onClick={handleResetWorkspace}
              disabled={isResetting}
              title="Restablece y sincroniza los documentos oficiales de la carpeta con Firebase"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Sincronizando...' : 'Resincronizar'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
          <button
            id="tab-btn-documents"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'documents'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentos en Drive ({documents.length})</span>
          </button>

          <button
            id="tab-btn-matrix"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Matriz Directiva (Sheets)</span>
          </button>

          <button
            id="tab-btn-form"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'form'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            <span>Cuestionario Somático (Forms)</span>
          </button>

          <button
            id="tab-btn-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Agenda & Google Meet</span>
          </button>

          <button
            id="tab-btn-firebase"
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'firebase'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cerebro Firebase (Base General)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Documentos Oficiales en Drive */}
      {activeTab === 'documents' && (
        <div id="tab-content-documents" className="space-y-6">
          {/* Controls bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-documents-input"
                type="text"
                placeholder="Buscar por título, contenido, axioma o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips & View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'doc', label: 'Docs' },
                  { id: 'sheet', label: 'Sheets' },
                  { id: 'form', label: 'Forms' },
                  { id: 'folder', label: 'Carpetas' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    id={`filter-chip-${chip.id}`}
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategory === chip.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  id="btn-view-grid"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Vista Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  id="btn-view-table"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Vista Tabla"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => {
                const badge = getCategoryBadge(doc.category);
                return (
                  <div
                    key={doc.id}
                    id={`doc-card-${doc.id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm group"
                  >
                    <div className="space-y-4">
                      {/* Badge & Category */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            id={`btn-edit-${doc.id}`}
                            onClick={() => setEditingDoc({ ...doc })}
                            title="Editar información"
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-${doc.id}`}
                            onClick={() => setDeletingDoc(doc)}
                            title="Desvincular documento"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {doc.name}
                      </h3>

                      {/* Axiom if available */}
                      {doc.axiomaClave && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Axioma:</span>{' '}
                          {doc.axiomaClave}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {doc.description || 'Documento oficial vinculado a la carpeta de Google Drive.'}
                      </p>

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {doc.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-read-doc-${doc.id}`}
                          onClick={() => setReadingDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Leer / Ver</span>
                        </button>

                        <button
                          id={`btn-copy-doc-${doc.id}`}
                          onClick={() => handleCopyLink(doc.webViewLink, doc.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copiar enlace"
                        >
                          {copiedId === doc.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === doc.id ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      <a
                        id={`btn-open-link-${doc.id}`}
                        href={doc.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60 transition-colors"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Documento</th>
                      <th className="px-6 py-3.5">Tipo</th>
                      <th className="px-6 py-3.5">Axioma / Resumen</th>
                      <th className="px-6 py-3.5">Etiquetas</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDocs.map((doc) => {
                      const badge = getCategoryBadge(doc.category);
                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs">
                            <div className="truncate font-semibold">{doc.name}</div>
                            <div className="text-xs text-slate-400 font-normal truncate mt-0.5">
                              {doc.webViewLink}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-sm truncate">
                            {doc.axiomaClave || doc.description}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(doc.tags || []).slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                            <button
                              onClick={() => setReadingDoc(doc)}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            >
                              Ver
                            </button>
                            <a
                              href={doc.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
                            >
                              <span>Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Matriz Directiva (Google Sheets) */}
      {activeTab === 'matrix' && (
        <div id="tab-content-matrix" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Sincronizado con Google Sheets & Firebase
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Matriz Directiva de Quiebres & Directorio de Clientes
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Control gerencial de los coachees con sus quiebres declarados, semáforo de sesiones y seguimiento.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={OFFICIAL_CEREBRO_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Abrir en Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Table of coachees */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">ID Cliente</th>
                    <th className="px-6 py-3.5">Nombre Completo</th>
                    <th className="px-6 py-3.5">Correo Electrónico</th>
                    <th className="px-6 py-3.5">Quiebre Ontológico Declarado</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">Progreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {/* Exemplar Coachee row */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      c-8821
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      Cliente Ejecutivo
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      coachee@empresa.com
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      Fronteras en la toma de decisiones
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        🟢 ACTIVO
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      Sesión 2 de 6
                    </td>
                  </tr>

                  {/* Registered coachees from platform */}
                  {clients
                    .filter((c) => c.role === 'client' && c.uid !== 'c-8821')
                    .map((client) => (
                      <tr
                        key={client.uid}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {client.uid.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {client.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {client.email}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {client.primaryBreakdown || 'Quiebre en proceso de calibración'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            🟢 ACTIVO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          Sesión {client.programStep || 1} de 6
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>
                💡 Los datos de los clientes se sincronizan automáticamente con Firebase Firestore y pueden exportarse a la hoja Google Sheets vinculada.
              </span>
              <button
                onClick={handleForceSyncFirebase}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Sincronizar a Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cuestionario Somático (Google Forms) */}
      {activeTab === 'form' && (
        <div id="tab-content-form" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Instrumento de Intake Oficial
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Cuestionario de Diagnóstico Inicial y Somático
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Mapeo del quiebre inicial, centro somático de contención y nivel de certeza antes de iniciar el ciclo.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={OFFICIAL_CEREBRO_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Abrir Google Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Questions preview */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estructura de las 5 Preguntas Clave:
              </h4>

              {[
                {
                  num: '1',
                  title: 'Nombre y Apellidos',
                  desc: 'Identificación nominal del coachee en la plataforma.',
                  type: 'Texto breve',
                },
                {
                  num: '2',
                  title: 'Correo de contacto',
                  desc: 'Cuenta ancla para el seguimiento de tareas y enlaces de Google Meet.',
                  type: 'Correo electrónico',
                },
                {
                  num: '3',
                  title: '¿Qué situación recurrente identificas hoy como un quiebre en tu vida o liderazgo?',
                  desc: 'Exploración del observador, límites, conversaciones postergadas y expectativas.',
                  type: 'Párrafo reflexivo',
                },
                {
                  num: '4',
                  title: '¿En qué parte de tu cuerpo somatizas la presión o la duda?',
                  desc: 'Tensión cervical, diafragma, mandíbula, plexo solar, respiración corta.',
                  type: 'Selección somática',
                },
                {
                  num: '5',
                  title: 'Nivel de certeza actual (1 a 5)',
                  desc: 'Escala de autopercepción de dirección personal y claridad estratégica.',
                  type: 'Escala lineal (1 a 5)',
                },
              ].map((q) => (
                <div
                  key={q.num}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-4"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {q.num}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {q.title}
                      </h5>
                      <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                        {q.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{q.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/50">
              <span className="text-xs text-purple-800 dark:text-purple-300 font-medium">
                ¿Deseas enviar el cuestionario a un nuevo coachee?
              </span>
              <button
                onClick={() => {
                  safeCopyToClipboard(OFFICIAL_CEREBRO_DRIVE_FOLDER_URL);
                  showToast('¡Enlace del cuestionario copiado para compartir!');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Copiar Enlace para Coachee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Agenda & Google Meet */}
      {activeTab === 'calendar' && (
        <div id="tab-content-calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scheduling Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Agendar Sesión 1 a 1
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crea el evento en Google Calendar y genera la sala de Google Meet automáticamente.
              </p>

              <form onSubmit={handleScheduleSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coachee
                  </label>
                  <select
                    value={scheduleClientId}
                    onChange={(e) => setScheduleClientId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.uid} value={c.uid}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paso / Número de Sesión
                  </label>
                  <select
                    value={scheduleStep}
                    onChange={(e) => setScheduleStep(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={`gw-session-opt-${num}`} value={num}>
                        Sesión {num} de 6
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notas Ontológicas / Foco
                  </label>
                  <textarea
                    rows={2}
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    placeholder="Ej: Calibración de quiebre y límites somáticos..."
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isScheduling}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>{isScheduling ? 'Agendando...' : 'Crear Evento en Calendar'}</span>
                </button>
              </form>
            </div>

            {/* Calendar Preview & Events */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Próximas Sesiones Programadas
                </h3>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Abrir Google Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-3">
                {sessions.length > 0 ? (
                  sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {sess.title || `Sesión Ontológica #${sess.sessionNumber || 1}`}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                            {sess.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(sess.date).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {sess.meetLink && (
                        <a
                          href={sess.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Google Meet</span>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <Calendar className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs">No hay sesiones pendientes agendadas hoy.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Cerebro Firebase (Base General) */}
      {activeTab === 'firebase' && (
        <div id="tab-content-firebase" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
                  <Database className="w-3.5 h-3.5" />
                  Cerebro Principal de la Aplicación
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Base de Datos General: Firebase Firestore
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Todos los documentos de Workspace, perfiles de coachees, quiebres ontológicos y bitácoras se almacenan y replican con persistencia duradera en Firestore.
                </p>
              </div>

              <button
                onClick={handleForceSyncFirebase}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Total'}</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Documentos Sincronizados
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {documents.length}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>En colección 'workspaceDocuments'</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Coachees en Directorio
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {clients.length}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>En colección 'users'</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Estado de Conexión
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Conectado en Vivo</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  onSnapshot activo y seguro
                </div>
              </div>
            </div>

            {/* Clean reset box */}
            <div className="p-6 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  ¿Deseas reiniciar toda la información de Workspace?
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-xl">
                  Esta acción elimina cualquier documento obsoleto o de prueba y restaura estrictamente los 4 documentos oficiales sincronizados con la carpeta de Google Drive y Firestore.
                </p>
              </div>

              <button
                onClick={handleResetWorkspace}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0"
              >
                {isResetting ? 'Reiniciando...' : 'Reiniciar a Estado Oficial Limpio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Document Reader Modal */}
      {readingDoc && (
        <div
          id="modal-document-reader"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setReadingDoc(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Documento Sincronizado
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {readingDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Reader */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              {readingDoc.axiomaClave && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Axioma Clave:</span>{' '}
                  {readingDoc.axiomaClave}
                </div>
              )}

              {/* Formatted body */}
              <div className="whitespace-pre-wrap font-mono text-xs p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                {readingDoc.fullContent || readingDoc.description || 'Sin contenido adicional.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <button
                onClick={() => handleCopyContent(readingDoc)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Contenido</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={readingDoc.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <span>Abrir en Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Link Document Modal */}
      {isAddModalOpen && (
        <div
          id="modal-add-document"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Vincular Documento de Google Workspace
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace o URL de Google Drive / Docs / Sheets / Forms
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/... o https://drive.google.com/..."
                  value={newDocUrl}
                  onChange={(e) => {
                    setNewDocUrl(e.target.value);
                    const detected = GoogleWorkspaceService.detectDocumentTypeFromUrl(e.target.value);
                    if (detected) setNewDocCategory(detected);
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Contrato Marco, Cuestionario Intake, Matriz..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as WorkspaceDocumentCategory)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="doc">Google Docs</option>
                    <option value="sheet">Google Sheets</option>
                    <option value="form">Google Forms</option>
                    <option value="slide">Google Slides</option>
                    <option value="folder">Carpeta Drive</option>
                    <option value="pdf_report">PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="ICF, Somática, Quiebres"
                    value={newDocTags}
                    onChange={(e) => setNewDocTags(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Axioma Clave / Subtítulo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cláusulas de confidencialidad estricta y alcance ontológico..."
                  value={newDocAxiom}
                  onChange={(e) => setNewDocAxiom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve descripción del propósito y uso del documento..."
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Vincular y Guardar en Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Document Modal */}
      {editingDoc && (
        <div
          id="modal-edit-document"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingDoc(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Documento
              </h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL de Google Drive
                </label>
                <input
                  type="url"
                  required
                  value={editingDoc.webViewLink}
                  onChange={(e) => setEditingDoc({ ...editingDoc, webViewLink: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Axioma Clave
                </label>
                <input
                  type="text"
                  value={editingDoc.axiomaClave || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, axiomaClave: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={editingDoc.description || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deletingDoc && (
        <div
          id="modal-delete-confirm"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeletingDoc(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ¿Desvincular documento?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              ¿Estás seguro de desvincular <strong>"{deletingDoc.name}"</strong>? El archivo original en tu Google Drive no será borrado, solo dejará de mostrarse en esta plataforma.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Sí, Desvincular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
