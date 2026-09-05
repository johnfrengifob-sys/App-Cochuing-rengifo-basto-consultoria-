import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Save,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  Compass,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  HelpCircle,
  FolderPlus,
  Sliders,
  Check,
} from 'lucide-react';
import { OntologicalStore } from '../../services/store';
import {
  OntologicalExperience,
  UniversalExperienceBlock,
  UniversalBlockType,
  ExperienceFormat,
} from '../../types';
import {
  CURATED_EXPERIENCE_PHOTOS,
  DEFAULT_UNIVERSAL_BLOCK_TEMPLATES,
} from '../../data/initialExperiences';

interface ExperienceEditorManagerProps {
  onOpenPreview?: (experience: OntologicalExperience) => void;
}

export const ExperienceEditorManager: React.FC<ExperienceEditorManagerProps> = ({
  onOpenPreview,
}) => {
  const [experiences, setExperiences] = useState<OntologicalExperience[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>('');
  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'workshop' | 'session_1on1' | 'new_formats'
  >('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Modal para clonar plantilla
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState<string>('');
  const [cloneNewTitle, setCloneNewTitle] = useState<string>('');

  // Modal para vista previa
  const [previewExperience, setPreviewExperience] = useState<OntologicalExperience | null>(null);

  // Cargar experiencias
  const reloadExperiences = () => {
    const list = OntologicalStore.getExperiences();
    setExperiences(list);
    if (!selectedExpId && list.length > 0) {
      setSelectedExpId(list[0].id);
    }
  };

  useEffect(() => {
    reloadExperiences();
    const handleUpdate = () => reloadExperiences();
    window.addEventListener('rbc-experiences-updated', handleUpdate);
    return () => window.removeEventListener('rbc-experiences-updated', handleUpdate);
  }, []);

  const currentExp =
    experiences.find((e) => e.id === selectedExpId) || experiences[0] || null;

  // Filtrado de experiencias
  const filteredExperiences = experiences.filter((exp) => {
    if (activeTabFilter === 'all') return true;
    if (activeTabFilter === 'workshop') return exp.type === 'workshop';
    if (activeTabFilter === 'session_1on1') return exp.type === 'session_1on1';
    if (activeTabFilter === 'new_formats')
      return exp.type === 'retreat' || exp.type === 'circle' || exp.isTemplate;
    return true;
  });

  // Modificación del objeto actual
  const updateCurrentExp = (updates: Partial<OntologicalExperience>) => {
    if (!currentExp) return;
    const updated: OntologicalExperience = {
      ...currentExp,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  // Guardar en Firestore y Store
  const handleSave = async () => {
    if (!currentExp) return;
    setIsSaving(true);
    try {
      OntologicalStore.saveExperience(currentExp);
      setSaveSuccessMessage('Guardado y publicado en Firestore en tiempo real');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Clonar plantilla
  const handleCloneConfirm = () => {
    if (!cloneSourceId) return;
    const newExp = OntologicalStore.cloneExperienceTemplate(
      cloneSourceId,
      cloneNewTitle.trim() || undefined
    );
    reloadExperiences();
    setSelectedExpId(newExp.id);
    setIsCloneModalOpen(false);
    setCloneSourceId('');
    setCloneNewTitle('');
    setSaveSuccessMessage(`Plantilla clonada con éxito: "${newExp.title}"`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Eliminar experiencia
  const handleDeleteExperience = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este formato de experiencia?')) {
      OntologicalStore.deleteExperience(id);
      const remaining = experiences.filter((e) => e.id !== id);
      setExperiences(remaining);
      if (selectedExpId === id && remaining.length > 0) {
        setSelectedExpId(remaining[0].id);
      }
    }
  };

  // Gestión de Bloques Universales
  const handleAddUniversalBlock = (blockType: UniversalBlockType) => {
    if (!currentExp) return;
    const template =
      DEFAULT_UNIVERSAL_BLOCK_TEMPLATES[
        blockType === 'custom' ? 'inquiry' : blockType
      ] || DEFAULT_UNIVERSAL_BLOCK_TEMPLATES.welcome;

    const newBlock: UniversalExperienceBlock = {
      id: `blk-${Date.now()}`,
      type: blockType,
      title:
        blockType === 'welcome'
          ? 'Bloque de Bienvenida: Apertura & Encuadre'
          : blockType === 'inquiry'
          ? 'Bloque de Indagación: Preguntas de Quiebre'
          : blockType === 'action'
          ? 'Bloque de Acción: Compromiso & Práctica'
          : 'Bloque Personalizado',
      subtitle: template.subtitle,
      content: template.content,
      questions: template.questions ? [...template.questions] : undefined,
      actionLabel: template.actionLabel,
    };

    const currentBlocks = currentExp.blocks || [];
    updateCurrentExp({ blocks: [...currentBlocks, newBlock] });
  };

  const handleUpdateBlock = (
    blockId: string,
    blockUpdates: Partial<UniversalExperienceBlock>
  ) => {
    if (!currentExp) return;
    const updatedBlocks = (currentExp.blocks || []).map((b) =>
      b.id === blockId ? { ...b, ...blockUpdates } : b
    );
    updateCurrentExp({ blocks: updatedBlocks });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!currentExp) return;
    const updatedBlocks = (currentExp.blocks || []).filter((b) => b.id !== blockId);
    updateCurrentExp({ blocks: updatedBlocks });
  };

  // Preguntas Guía del Facilitador
  const handleAddGuidingQuestion = () => {
    if (!currentExp) return;
    const questions = [...(currentExp.guidingQuestions || [])];
    questions.push('¿Qué quiebre ontológico no declarado emerge en esta conversación?');
    updateCurrentExp({ guidingQuestions: questions });
  };

  const handleUpdateGuidingQuestion = (index: number, text: string) => {
    if (!currentExp) return;
    const questions = [...(currentExp.guidingQuestions || [])];
    questions[index] = text;
    updateCurrentExp({ guidingQuestions: questions });
  };

  const handleDeleteGuidingQuestion = (index: number) => {
    if (!currentExp) return;
    const questions = (currentExp.guidingQuestions || []).filter((_, i) => i !== index);
    updateCurrentExp({ guidingQuestions: questions });
  };

  return (
    <div className="space-y-6 text-black dark:text-white">
      {/* Banner Superior Monocromático de Alto Contraste */}
      <div className="bg-white dark:bg-black border border-black dark:border-white p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black dark:border-white text-[11px] font-mono uppercase tracking-wider font-semibold">
              <span>Lienzo de Arquitectura</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              <span>Sincronización en Vivo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
              Editor de Experiencias Ontológicas
            </h1>
            <p className="text-xs sm:text-sm font-light text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Constructor visual para modular la interfaz, estructuras y textos de Talleres Grupales,
              Sesiones 1 a 1 y nuevos formatos (Retiros y Círculos). Estética de minimalismo absoluto
              en blanco y negro, reservando el color únicamente para la fotografía central.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCloneSourceId(currentExp?.id || experiences[0]?.id || '');
                setCloneNewTitle(currentExp ? `${currentExp.title} (Nuevo Formato)` : '');
                setIsCloneModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>Clonar Plantilla Base</span>
            </button>

            {currentExp && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenPreview) {
                    onOpenPreview(currentExp);
                  } else {
                    setPreviewExperience(currentExp);
                  }
                }}
                className="px-4 py-2.5 rounded-2xl border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>Vista Previa (Preview)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando en Firestore...' : 'Guardar y Publicar'}</span>
            </button>
          </div>
        </div>

        {/* Toast Notificación */}
        {saveSuccessMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Selector de Experiencias y Filtro por Formato */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/20 dark:border-white/20 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'Todas las Experiencias' },
            { key: 'workshop', label: 'Talleres Grupales' },
            { key: 'session_1on1', label: 'Sesiones 1 a 1' },
            { key: 'new_formats', label: 'Retiros & Círculos' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTabFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                activeTabFilter === tab.key
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:border-black/30 dark:hover:border-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-neutral-500">
          {filteredExperiences.length} Experiencia(s) configurada(s)
        </span>
      </div>

      {/* Carrusel / Lista de Píldoras de Experiencias */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {filteredExperiences.map((exp) => {
          const isSelected = exp.id === selectedExpId;
          return (
            <button
              key={exp.id}
              type="button"
              onClick={() => setSelectedExpId(exp.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                  : 'bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'
              }`}
            >
              {/* Imagen a color miniatura (el único elemento con color) */}
              <img
                src={exp.colorPhotoUrl}
                alt={exp.title}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-black/30 dark:ring-white/30 shrink-0"
              />
              <div className="text-xs max-w-[200px] truncate">
                <div className="font-semibold truncate">{exp.title}</div>
                <div
                  className={`text-[10px] font-mono truncate ${
                    isSelected
                      ? 'text-neutral-300 dark:text-neutral-700'
                      : 'text-neutral-500'
                  }`}
                >
                  {exp.category}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lienzo Principal del Editor */}
      {currentExp ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda (7 Cols): Campos Centrales, Enlaces y Preguntas */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tarjeta de Datos Centrales */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 rounded-3xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <h3 className="text-sm font-bold tracking-tight uppercase font-mono">
                  1. Configuración de Textos & Identidad
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-black dark:border-white">
                  {currentExp.type}
                </span>
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Título de la Experiencia
                </label>
                <input
                  type="text"
                  value={currentExp.title}
                  onChange={(e) => updateCurrentExp({ title: e.target.value })}
                  placeholder="Ej: Raíz: Deconstrucción Somática & Emociones"
                  className="w-full px-4 py-2.5 rounded-xl border border-black dark:border-white bg-transparent text-black dark:text-white text-sm focus:outline-none font-medium"
                />
              </div>

              {/* Subtítulo / Objetivo Ontológico */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Subtítulo / Objetivo Ontológico Central
                </label>
                <textarea
                  rows={2}
                  value={currentExp.subtitle}
                  onChange={(e) => updateCurrentExp({ subtitle: e.target.value })}
                  placeholder="Objetivo humano y transformacional de la sesión..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black dark:border-white bg-transparent text-black dark:text-white text-xs leading-relaxed focus:outline-none"
                />
              </div>

              {/* Enlace Google Meet y Horario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Enlace de Google Meet
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={currentExp.meetUrl}
                      onChange={(e) => updateCurrentExp({ meetUrl: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-black dark:border-white bg-transparent text-xs font-mono focus:outline-none"
                    />
                    {currentExp.meetUrl && (
                      <a
                        href={currentExp.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
                        title="Probar sala en Google Meet"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Fecha / Horario Visible
                  </label>
                  <input
                    type="text"
                    value={currentExp.dateStr}
                    onChange={(e) => updateCurrentExp({ dateStr: e.target.value })}
                    placeholder="Sábado, 12 de Septiembre • 7:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-black dark:border-white bg-transparent text-xs focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Categoría y Formato */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={currentExp.category}
                    onChange={(e) => updateCurrentExp({ category: e.target.value })}
                    placeholder="Taller Vivencial Grupal"
                    className="w-full px-3.5 py-2 rounded-xl border border-black dark:border-white bg-transparent text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Formato de Experiencia
                  </label>
                  <select
                    value={currentExp.type}
                    onChange={(e) =>
                      updateCurrentExp({ type: e.target.value as ExperienceFormat })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-xs focus:outline-none"
                  >
                    <option value="workshop">Taller Grupal en Vivo</option>
                    <option value="session_1on1">Sesión Individual 1 a 1</option>
                    <option value="retreat">Retiro Ontológico de Inmersión</option>
                    <option value="circle">Círculo de Liderazgo Directivo</option>
                    <option value="masterclass">Masterclass Especial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preguntas Guía para el Facilitador */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase font-mono">
                    2. Preguntas Guía para el Facilitador
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-light">
                    Indagaciones clave para destrabar quiebres y abrir la corporalidad.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddGuidingQuestion}
                  className="px-3 py-1.5 rounded-xl border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Pregunta</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(currentExp.guidingQuestions || []).map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[11px] font-mono font-bold mt-2 text-neutral-400 w-5">
                      0{idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => handleUpdateGuidingQuestion(idx, e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-black dark:border-white bg-transparent text-xs text-black dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteGuidingQuestion(idx)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Módulos Universales Apilables */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 rounded-3xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase font-mono">
                    3. Módulos Universales (Bloques Apilables)
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-light">
                    Apila Bloques de Bienvenida, Indagación y Acción para crear nuevos formatos.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddUniversalBlock('welcome')}
                    className="px-2.5 py-1.5 rounded-lg border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-semibold transition-colors"
                  >
                    + Bienvenida
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddUniversalBlock('inquiry')}
                    className="px-2.5 py-1.5 rounded-lg border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-semibold transition-colors"
                  >
                    + Indagación
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddUniversalBlock('action')}
                    className="px-2.5 py-1.5 rounded-lg border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-semibold transition-colors"
                  >
                    + Acción
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(currentExp.blocks || []).map((block, bIdx) => (
                  <div
                    key={block.id}
                    className="p-4 rounded-2xl border border-black/30 dark:border-white/30 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-black dark:border-white font-semibold">
                          {block.type === 'welcome'
                            ? 'Bloque Bienvenida'
                            : block.type === 'inquiry'
                            ? 'Bloque Indagación'
                            : 'Bloque Acción'}
                        </span>
                        <span className="text-xs font-bold">{block.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        title="Eliminar bloque"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                      placeholder="Título del bloque..."
                      className="w-full px-3 py-1.5 rounded-lg border border-black/40 dark:border-white/40 bg-transparent text-xs font-semibold focus:outline-none"
                    />

                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) =>
                        handleUpdateBlock(block.id, { content: e.target.value })
                      }
                      placeholder="Contenido pedagógico y encuadre..."
                      className="w-full px-3 py-2 rounded-lg border border-black/40 dark:border-white/40 bg-transparent text-xs leading-relaxed focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha (5 Cols): Gestión de la Fotografía Central a Color y Acciones */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fotografía Central a Color (El único elemento a color según la regla de identidad de marca) */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 rounded-3xl space-y-4">
              <div className="pb-3 border-b border-black/10 dark:border-white/10">
                <h3 className="text-sm font-bold tracking-tight uppercase font-mono">
                  Fotografía Central a Color
                </h3>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  Regla de Marca RBC: Minimalismo absoluto en blanco y negro; el color se reserva{' '}
                  <strong>exclusivamente</strong> para la fotografía que evoca la presencia.
                </p>
              </div>

              {/* Previsualización de la Fotografía */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-black dark:border-white group shadow-sm">
                <img
                  src={currentExp.colorPhotoUrl}
                  alt={currentExp.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-300 block">
                    {currentExp.category}
                  </span>
                  <p className="text-xs font-bold leading-tight mt-0.5">{currentExp.title}</p>
                </div>
              </div>

              {/* Input URL directa */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  URL de la Fotografía (Alta Resolución)
                </label>
                <input
                  type="url"
                  value={currentExp.colorPhotoUrl}
                  onChange={(e) => updateCurrentExp({ colorPhotoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-black dark:border-white bg-transparent text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Galería Rápida de Fotos Curadas */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Fotografías Curadas RBC (Selección en 1 Clic):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {CURATED_EXPERIENCE_PHOTOS.map((photo, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => updateCurrentExp({ colorPhotoUrl: photo.url })}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-black/30 dark:border-white/30 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all cursor-pointer"
                      title={photo.title}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      {currentExp.colorPhotoUrl === photo.url && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de Estado y Publicación */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold tracking-tight uppercase font-mono pb-2 border-b border-black/10 dark:border-white/10">
                Estado & Sincronización
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold block">Visibilidad para Participantes</span>
                  <span className="text-[11px] text-neutral-500">
                    {currentExp.isPublished ? 'Publicada en el lienzo en vivo' : 'En borrador (privada)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateCurrentExp({ isPublished: !currentExp.isPublished })}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    currentExp.isPublished
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent text-neutral-500 border-neutral-400'
                  }`}
                >
                  {currentExp.isPublished ? 'Publicada' : 'Borrador'}
                </button>
              </div>

              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>Última actualización:</span>
                <span>{new Date(currentExp.updatedAt).toLocaleTimeString()}</span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(currentExp.id)}
                  className="w-full py-2 rounded-xl border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Formato</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-black dark:border-white rounded-3xl">
          <p className="text-sm text-neutral-500">No hay experiencias seleccionadas.</p>
        </div>
      )}

      {/* MODAL CLONAR PLANTILLA BASE */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-black dark:border-white w-full max-w-lg rounded-3xl p-6 space-y-5 text-black dark:text-white shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase font-mono">Clonar Plantilla Base</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCloneModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
              Crea un nuevo formato de Taller, Retiro Ontológico o Círculo de Liderazgo duplicando la
              arquitectura de una plantilla base. Sin re-programar nada.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Selecciona la Plantilla de Origen
              </label>
              <select
                value={cloneSourceId}
                onChange={(e) => setCloneSourceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-xs focus:outline-none"
              >
                {experiences.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Nombre del Nuevo Formato / Taller
              </label>
              <input
                type="text"
                value={cloneNewTitle}
                onChange={(e) => setCloneNewTitle(e.target.value)}
                placeholder="Ej: Retiro Ontológico: Silencio & Arraigo en las Montañas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black dark:border-white bg-transparent text-xs focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsCloneModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-black/30 dark:border-white/30 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloneConfirm}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 cursor-pointer"
              >
                Clonar y Abrir en Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA (PREVIEW DEL PARTICIPANTE) */}
      {previewExperience && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-950 border border-black dark:border-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-6 text-black dark:text-white shadow-2xl relative my-auto animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold">
                <Eye className="w-4 h-4" />
                <span>Simulación de Pantalla del Participante (Ultra-Minimalismo)</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewExperience(null)}
                className="p-1.5 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lienzo participante simulado */}
            <div className="p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-black space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  Tu Próximo Paso Inmediato
                </span>
                <h2 className="text-2xl font-bold tracking-tight">{previewExperience.title}</h2>
                <p className="text-xs font-light text-neutral-600 dark:text-neutral-400">
                  {previewExperience.subtitle}
                </p>
              </div>

              {/* Fotografía a color iluminada */}
              <div className="aspect-16/9 max-w-2xl mx-auto rounded-2xl overflow-hidden border border-black dark:border-white shadow-lg">
                <img
                  src={previewExperience.colorPhotoUrl}
                  alt={previewExperience.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Botón de acceso a Meet */}
              <div className="text-center pt-2">
                <a
                  href={previewExperience.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs transition-opacity hover:opacity-90 shadow-md"
                >
                  <Video className="w-4 h-4" />
                  <span>Ingresar a Sala Google Meet</span>
                </a>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setPreviewExperience(null)}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
