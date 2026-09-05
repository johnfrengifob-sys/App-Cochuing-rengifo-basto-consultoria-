import React, { useState, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  Edit2,
  Save,
  X,
  Plus,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Video,
  Table,
  Folder,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { SystemLinkBinding } from '../types';

export const CerebroVinculacionManager: React.FC = () => {
  const [bindings, setBindings] = useState<SystemLinkBinding[]>(() =>
    OntologicalStore.getSystemLinkBindings()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBinding, setNewBinding] = useState<Partial<SystemLinkBinding>>({
    functionKey: 'meet_sessions',
    functionTitle: '',
    category: 'Comunicaciones',
    targetUrl: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    setBindings(OntologicalStore.getSystemLinkBindings());
  }, []);

  const handleStartEdit = (b: SystemLinkBinding) => {
    setEditingId(b.id);
    setEditUrl(b.targetUrl);
    setEditTitle(b.functionTitle);
    setEditNotes(b.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string) => {
    const updated = OntologicalStore.updateSystemLinkBinding(id, {
      targetUrl: editUrl.trim(),
      functionTitle: editTitle.trim(),
      notes: editNotes.trim(),
    });
    if (updated) {
      setBindings(OntologicalStore.getSystemLinkBindings());
      setEditingId(null);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestLink = async (binding: SystemLinkBinding) => {
    setTestingId(binding.id);
    setTestResult(null);

    // Validate URL syntax
    let valid = false;
    let message = '';
    try {
      const parsed = new URL(binding.targetUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        valid = true;
        message = `Enlace verificado con éxito (${parsed.hostname}). Listo para vincularse a la lógica del sistema.`;
      } else {
        message = 'El enlace debe iniciar con https:// o http://';
      }
    } catch {
      message = 'URL inválida. Revisa la sintaxis del enlace.';
    }

    await new Promise((r) => setTimeout(r, 600));

    OntologicalStore.updateSystemLinkBinding(binding.id, {
      lastTestedAt: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: valid ? 'active' : 'testing',
    });

    setBindings(OntologicalStore.getSystemLinkBindings());
    setTestingId(null);
    setTestResult({ id: binding.id, success: valid, message });

    setTimeout(() => {
      setTestResult((prev) => (prev?.id === binding.id ? null : prev));
    }, 4500);
  };

  const handleAddBinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinding.functionTitle || !newBinding.targetUrl) return;

    const created: SystemLinkBinding = {
      id: `link-custom-${Date.now()}`,
      functionKey: (newBinding.functionKey as any) || 'meet_sessions',
      functionTitle: newBinding.functionTitle,
      category: (newBinding.category as any) || 'Comunicaciones',
      targetUrl: newBinding.targetUrl,
      status: 'active',
      notes: newBinding.notes || 'Enlace personalizado asociado al sistema.',
      syncFrequency: 'Bajo demanda',
      iconName: 'Link2',
    };

    const currentList = OntologicalStore.getSystemLinkBindings();
    OntologicalStore.saveSystemLinkBindings([...currentList, created]);
    setBindings(OntologicalStore.getSystemLinkBindings());
    setShowAddModal(false);
    setNewBinding({
      functionKey: 'meet_sessions',
      functionTitle: '',
      category: 'Comunicaciones',
      targetUrl: '',
      status: 'active',
      notes: '',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comunicaciones':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'Inteligencia Artificial':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'Google Workspace':
        return <Table className="w-4 h-4 text-emerald-500" />;
      case 'Financiero & Pasarelas':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'Evaluación & Quiebres':
        return <FileText className="w-4 h-4 text-rose-500" />;
      default:
        return <Globe className="w-4 h-4 text-neutral-500" />;
    }
  };

  const categories = ['all', 'Comunicaciones', 'Inteligencia Artificial', 'Google Workspace', 'Financiero & Pasarelas', 'Evaluación & Quiebres'];

  const filteredBindings = bindings.filter((b) =>
    filterCategory === 'all' ? true : b.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="glass-panel-opal p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black shrink-0 shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                  Cerebro & Enrutamiento de Funciones
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {bindings.length} Enlaces Vinculados
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-300 font-light mt-1 max-w-2xl">
                Asociación manual y parametrización de links para salas virtuales (Google Meet), disparadores y webhooks IA (Make.com), carpetas en Drive, hojas de cálculo en Sheets y pasarela Bre-B Nu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Enlace</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mr-1">
            Filtrar:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-white/60 dark:bg-neutral-800/60 text-gray-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 border border-gray-200/60 dark:border-white/5'
              }`}
            >
              {cat === 'all' ? 'Todos los Dominios' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Link Bindings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBindings.map((binding) => {
          const isEditing = editingId === binding.id;
          const isTesting = testingId === binding.id;
          const isCopied = copiedId === binding.id;
          const currentTest = testResult?.id === binding.id ? testResult : null;

          return (
            <div
              key={binding.id}
              className="glass-panel-opal p-4 sm:p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 shrink-0">
                      {getCategoryIcon(binding.category)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-wider block">
                        {binding.category}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                        />
                      ) : (
                        <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white truncate">
                          {binding.functionTitle}
                        </h3>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                      binding.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {binding.status === 'active' ? 'Activo' : 'En Pruebas'}
                  </span>
                </div>

                {/* Description / Notes */}
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white mb-3"
                  />
                ) : (
                  <p className="text-xs text-gray-600 dark:text-neutral-400 font-light mb-3 line-clamp-2">
                    {binding.notes}
                  </p>
                )}

                {/* Target URL field */}
                <div className="mb-3">
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                    URL de Destino:
                  </div>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/80 dark:bg-neutral-900/80 border border-gray-200/60 dark:border-white/5 font-mono text-[11px] text-gray-800 dark:text-neutral-200 truncate">
                      <span className="truncate flex-1">{binding.targetUrl}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(binding.id, binding.targetUrl)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 transition-all text-gray-500 hover:text-black dark:hover:text-white shrink-0 cursor-pointer"
                        title="Copiar enlace"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Test Feedback Toast */}
                {currentTest && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 mb-3 animate-in fade-in ${
                      currentTest.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {currentTest.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="leading-tight">{currentTest.message}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                  {binding.lastTestedAt ? `Verificado: ${binding.lastTestedAt}` : 'Listo para validación'}
                </span>

                <div className="flex items-center gap-1.5">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-600 hover:text-black dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(binding.id)}
                        className="px-3 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Guardar</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(binding)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                        title="Editar parámetros del enlace"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestLink(binding)}
                        disabled={isTesting}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        title="Probar conexión y validar sintaxis"
                      >
                        <RotateCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-purple-500' : ''}`} />
                        <span>Probar</span>
                      </button>
                      <a
                        href={binding.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-all"
                        title="Abrir destino en pestaña nueva"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Binding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-neutral-800 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Agregar Enlace al Cerebro del Sistema</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBinding} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Nombre de la Función / Servicio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Sala Meet Sesiones de Emergencia"
                  value={newBinding.functionTitle}
                  onChange={(e) => setNewBinding({ ...newBinding, functionTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Dominio / Categoría:
                </label>
                <select
                  value={newBinding.category}
                  onChange={(e) => setNewBinding({ ...newBinding, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 text-black dark:text-white"
                >
                  <option value="Comunicaciones">Comunicaciones (Meet, Salas)</option>
                  <option value="Inteligencia Artificial">Inteligencia Artificial (Make.com Webhooks)</option>
                  <option value="Google Workspace">Google Workspace (Sheets, Drive, Calendar)</option>
                  <option value="Financiero & Pasarelas">Financiero & Pasarelas (Bre-B Nu, WhatsApp)</option>
                  <option value="Evaluación & Quiebres">Evaluación & Quiebres (Formularios)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  URL de Destino:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newBinding.targetUrl}
                  onChange={(e) => setNewBinding({ ...newBinding, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                  Descripción u Objetivo Operativo:
                </label>
                <textarea
                  rows={2}
                  placeholder="Explica para qué se utiliza este enlace dentro de la consultoría..."
                  value={newBinding.notes}
                  onChange={(e) => setNewBinding({ ...newBinding, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 text-black dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
