import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  Check,
  FileText,
  FileSpreadsheet,
  Video,
  Presentation,
  Link as LinkIcon,
  Upload,
  ExternalLink,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  CronogramaEvent,
  SyllabusBlock,
  SupportMaterial,
  SupportMaterialType,
} from '../../../types';

interface EventContentSyllabusSectionProps {
  event: Partial<CronogramaEvent>;
  onChange: (updates: Partial<CronogramaEvent>) => void;
}

const PRESET_GUIDING_QUESTIONS = [
  '¿En qué áreas de tu vida estás diciendo "Sí" por complacencia cuando tu cuerpo y tu energía reclaman un "Basta"?',
  '¿Cuál es el costo somático, emocional y relacional de intentar controlarlo todo por desconfianza en el entorno?',
  '¿Cómo cambiaría tu serenidad y autoridad si comunicaras tus límites con calma y sin justificaciones?',
  '¿Qué juicio maestro sobre ti mismo se activa cuando sientes que no cumples con las expectativas del entorno?',
  '¿De qué te está protegiendo la autoexigencia implacable y a qué le teme tu vulnerabilidad?',
];

export const EventContentSyllabusSection: React.FC<EventContentSyllabusSectionProps> = ({
  event,
  onChange,
}) => {
  const syllabus = event.syllabus || [];
  const guidingQuestions = event.guidingQuestions || [];
  const supportMaterials = event.supportMaterials || [];

  // Form states for new items
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockDuration, setNewBlockDuration] = useState('30 min');
  const [newBlockDesc, setNewBlockDesc] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatType, setNewMatType] = useState<SupportMaterialType>('pdf');
  const [newMatUrl, setNewMatUrl] = useState('');
  const [newMatSize, setNewMatSize] = useState('');
  const [newMatDesc, setNewMatDesc] = useState('');
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  // --- SYLLABUS HANDLERS ---
  const handleAddOrUpdateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim()) return;

    if (editingBlockId) {
      const updated = syllabus.map((b) =>
        b.id === editingBlockId
          ? {
              ...b,
              title: newBlockTitle,
              duration: newBlockDuration,
              description: newBlockDesc,
            }
          : b
      );
      onChange({ syllabus: updated });
      setEditingBlockId(null);
    } else {
      const newBlock: SyllabusBlock = {
        id: 'syl-' + Date.now(),
        title: newBlockTitle,
        duration: newBlockDuration,
        description: newBlockDesc,
      };
      onChange({ syllabus: [...syllabus, newBlock] });
    }

    setNewBlockTitle('');
    setNewBlockDuration('30 min');
    setNewBlockDesc('');
  };

  const handleStartEditBlock = (block: SyllabusBlock) => {
    setEditingBlockId(block.id);
    setNewBlockTitle(block.title);
    setNewBlockDuration(block.duration || '30 min');
    setNewBlockDesc(block.description);
  };

  const handleDeleteBlock = (id: string) => {
    onChange({ syllabus: syllabus.filter((b) => b.id !== id) });
    if (editingBlockId === id) {
      setEditingBlockId(null);
      setNewBlockTitle('');
      setNewBlockDesc('');
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= syllabus.length) return;
    const reordered = [...syllabus];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange({ syllabus: reordered });
  };

  // --- SUPPORT MATERIALS HANDLERS ---
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;

    const newMaterial: SupportMaterial = {
      id: 'mat-' + Date.now(),
      title: newMatTitle.trim(),
      type: newMatType,
      url: newMatUrl.trim(),
      sizeOrDuration: newMatSize.trim() || undefined,
      description: newMatDesc.trim() || undefined,
    };

    onChange({ supportMaterials: [...supportMaterials, newMaterial] });
    setNewMatTitle('');
    setNewMatUrl('');
    setNewMatSize('');
    setNewMatDesc('');
    setIsAddingMaterial(false);
  };

  const handleDeleteMaterial = (id: string) => {
    onChange({ supportMaterials: supportMaterials.filter((m) => m.id !== id) });
  };

  const getMaterialIcon = (type: SupportMaterialType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'presentation':
        return <Presentation className="w-4 h-4 text-amber-500" />;
      case 'guide':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado descriptivo de la sección */}
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Sección 2: Contenido y Temario</span>
        </div>
        <h3 className="text-lg font-bold text-black dark:text-white mt-1">
          Bloques Temáticos & Estructuras de Indagación de la Sesión
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
          Organiza los bloques temáticos y las estructuras de indagación de la sesión con preguntas ontológicas clave y suministros didácticos.
        </p>
      </div>

      {/* SUB-SECCIÓN 1: TEMARIO / ESTRUCTURA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
              A
            </span>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Temario y Bloques de la Sesión
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              ({syllabus.length} {syllabus.length === 1 ? 'bloque' : 'bloques'})
            </span>
          </div>
        </div>

        {/* Lista de bloques actuales */}
        {syllabus.length > 0 ? (
          <div className="space-y-2.5">
            {syllabus.map((block, idx) => (
              <div
                key={block.id}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-4 shadow-2xs hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-xs font-bold text-black dark:text-white truncate">
                        {block.title}
                      </h5>
                      {block.duration && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono font-medium">
                          <Clock className="w-3 h-3" />
                          {block.duration}
                        </span>
                      )}
                    </div>
                    {block.description && (
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-1 line-clamp-2">
                        {block.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones del bloque */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveBlock(idx, 'up')}
                    disabled={idx === 0}
                    title="Mover arriba"
                    className="p-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveBlock(idx, 'down')}
                    disabled={idx === syllabus.length - 1}
                    title="Mover abajo"
                    className="p-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartEditBlock(block)}
                    title="Editar bloque"
                    className="p-1 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    title="Eliminar bloque"
                    className="p-1 rounded-md text-gray-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 text-center text-xs text-gray-400">
            No has agregado bloques temáticos al temario aún.
          </div>
        )}

        {/* Formulario para agregar / editar bloque */}
        <form
          onSubmit={handleAddOrUpdateBlock}
          className="p-4 rounded-2xl border border-indigo-100 dark:border-neutral-800 bg-indigo-50/30 dark:bg-neutral-900/40 space-y-3"
        >
          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
            {editingBlockId ? 'Editar Bloque Temático' : '+ Añadir Bloque al Temario'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                Título del Bloque
              </label>
              <input
                type="text"
                required
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                placeholder="Ej: Bloque 1: Mapeo de la Transparencia y Quiebres"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                Duración Estimada
              </label>
              <input
                type="text"
                value={newBlockDuration}
                onChange={(e) => setNewBlockDuration(e.target.value)}
                placeholder="Ej: 30 min"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
              Descripción y Enfoque del Bloque
            </label>
            <textarea
              rows={2}
              value={newBlockDesc}
              onChange={(e) => setNewBlockDesc(e.target.value)}
              placeholder="Detalla los conceptos, ejercicios prácticos o distinciones que se explorarán..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {editingBlockId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBlockId(null);
                  setNewBlockTitle('');
                  setNewBlockDesc('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingBlockId ? 'Guardar Cambios' : 'Añadir Bloque'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SUB-SECCIÓN 2: PREGUNTAS GUÍA (EXTRAÍDAS DESDE GOOGLE SHEETS) */}
      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
              B
            </span>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Preguntas Guía de Indagación y Conversación Ontológica
            </h4>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Extraídas vía Google Sheets</span>
          </span>
        </div>

        {/* Panel de sincronización automatizada desde Google Sheets */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-black dark:text-white">
                    Sincronización de Preguntas con Google Sheets
                  </h5>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200">
                    <Check className="w-3 h-3" />
                    Flujo Automatizado
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                  Las preguntas detonantes, de apertura e indagación ontológica para este taller se extraen y sincronizan directamente desde la Hoja de Google Sheets del taller (Bitácora de Talleres / Acuerdos). No se configuran manualmente en este editor.
                </p>
              </div>
            </div>

            <a
              href={event.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-50 dark:hover:bg-neutral-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Abrir Hoja de Preguntas</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Vista previa de preguntas sincronizadas (Solo Lectura) */}
          {guidingQuestions.length > 0 ? (
            <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Preguntas extraídas actualmente ({guidingQuestions.length}):</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Modo solo lectura</span>
              </div>
              <div className="space-y-1.5">
                {guidingQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-emerald-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-2 text-xs"
                  >
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">
                      Q{idx + 1}.
                    </span>
                    <p className="text-black dark:text-neutral-200 font-medium italic">
                      "{q}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30 text-[11px] text-emerald-800/80 dark:text-emerald-300/80 italic">
              Las preguntas registradas en el archivo de Google Sheets se cargarán automáticamente durante la sesión y en la bitácora del participante.
            </div>
          )}
        </div>
      </div>

      {/* SUB-SECCIÓN 3: MATERIALES DE APOYO (SUMINISTROS) */}
      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              C
            </span>
            <h4 className="text-sm font-bold text-black dark:text-white">
              Materiales de Apoyo (Suministros)
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              ({supportMaterials.length} {supportMaterials.length === 1 ? 'recurso' : 'recursos'})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingMaterial(!isAddingMaterial)}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adjuntar Recurso</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-neutral-400 font-light">
          Adjunta archivos PDF, enlaces a videos, presentaciones y guías didácticas para los participantes.
        </p>

        {/* Lista de suministros */}
        {supportMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-3 shadow-2xs hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 shrink-0">
                    {getMaterialIcon(mat.type)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      {mat.type}
                    </span>
                    <h5 className="text-xs font-bold text-black dark:text-white truncate">
                      {mat.title}
                    </h5>
                    {mat.sizeOrDuration && (
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {mat.sizeOrDuration}
                      </span>
                    )}
                    {mat.url && (
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-1 truncate max-w-full"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{mat.url}</span>
                      </a>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteMaterial(mat.id)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-md cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 text-center text-xs text-gray-400">
            No hay recursos o materiales adjuntos registrados aún.
          </div>
        )}

        {/* Modal / Formulario desplegable para agregar material */}
        {isAddingMaterial && (
          <form
            onSubmit={handleAddMaterial}
            className="p-4 rounded-2xl border border-blue-100 dark:border-neutral-800 bg-blue-50/40 dark:bg-neutral-900/50 space-y-3"
          >
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
              Nuevo Recurso o Suministro de Apoyo
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                  Tipo de Material
                </label>
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as SupportMaterialType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
                >
                  <option value="pdf">Documento PDF</option>
                  <option value="video">Enlace a Video</option>
                  <option value="presentation">Presentación Diapositivas</option>
                  <option value="guide">Guía de Práctica / Didáctica</option>
                  <option value="link">Enlace Externo</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                  Título del Recurso
                </label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="Ej: Guía de Trabajo: Protocolo de Soberanía"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                  URL / Enlace al Recurso
                </label>
                <input
                  type="url"
                  required
                  value={newMatUrl}
                  onChange={(e) => setNewMatUrl(e.target.value)}
                  placeholder="https://drive.google.com/... o https://vimeo.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                  Peso o Duración
                </label>
                <input
                  type="text"
                  value={newMatSize}
                  onChange={(e) => setNewMatSize(e.target.value)}
                  placeholder="Ej: 2.4 MB o 25 min"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 dark:text-neutral-400 mb-1 font-medium">
                Descripción / Instrucción
              </label>
              <input
                type="text"
                value={newMatDesc}
                onChange={(e) => setNewMatDesc(e.target.value)}
                placeholder="Instrucciones para la lectura o visualización previa..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingMaterial(false)}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Guardar Recurso
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
