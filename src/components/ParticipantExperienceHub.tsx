import React, { useState, useEffect } from 'react';
import {
  Video,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Shield,
  Send,
  RotateCcw,
} from 'lucide-react';
import { User, OntologicalExperience, UniversalExperienceBlock } from '../types';
import { OntologicalStore } from '../services/store';
import { FirestoreSyncService } from '../services/firestoreSync';

interface ParticipantExperienceHubProps {
  client: User;
  onOpenWorkbook?: (step: number) => void;
}

export const ParticipantExperienceHub: React.FC<ParticipantExperienceHubProps> = ({
  client,
  onOpenWorkbook,
}) => {
  const [experiences, setExperiences] = useState<OntologicalExperience[]>(() =>
    OntologicalStore.getExperiences()
  );
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('');
  const [expandedInquiryIndex, setExpandedInquiryIndex] = useState<number | null>(0);
  const [participantNotes, setParticipantNotes] = useState<Record<string, string>>({});
  const [savedNoteSuccess, setSavedNoteSuccess] = useState<string | null>(null);

  // Carga inicial y suscripción reactiva a Firestore / Store
  useEffect(() => {
    // 1. Obtener del store
    const initialList = OntologicalStore.getExperiences();
    if (initialList.length > 0) {
      setExperiences(initialList);
      // Seleccionar por defecto la experiencia correspondiente al progreso del participante
      const matching =
        initialList.find(
          (e) => e.step === (client.programProgress || 1) && e.type === 'workshop'
        ) ||
        initialList.find((e) => e.isPublished) ||
        initialList[0];
      if (matching) setSelectedExperienceId(matching.id);
    }

    // 2. Suscribirse a eventos locales y sincronización entre pestañas
    const handleLocalUpdate = () => {
      const updated = OntologicalStore.getExperiences();
      setExperiences(updated);
    };
    window.addEventListener('rbc-experiences-updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // 3. Suscribirse a cambios en Firestore en tiempo real (si está autenticado)
    const unsubscribeFirestore = FirestoreSyncService.subscribeToExperiences((synced) => {
      if (Array.isArray(synced) && synced.length > 0) {
        setExperiences(synced);
      }
    });

    return () => {
      window.removeEventListener('rbc-experiences-updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      unsubscribeFirestore();
    };
  }, [client.programProgress]);

  // Experiencia actualmente activa
  const activeExperience: OntologicalExperience | null =
    experiences.find((e) => e.id === selectedExperienceId) ||
    experiences.find((e) => e.isPublished) ||
    experiences[0] ||
    null;

  // Filtrar las experiencias disponibles para el participante
  const availableExperiences = experiences.filter((e) => e.isPublished);

  // Guardar respuesta del ejercicio práctico
  const handleSaveParticipantActionNote = (blockId: string) => {
    const noteText = participantNotes[blockId];
    if (!noteText || !noteText.trim()) return;

    // Registrar como bitácora ontológica en el store
    OntologicalStore.submitForm({
      clientId: client.uid,
      sessionId: `exp-${activeExperience?.id || 'session'}`,
      sessionStep: activeExperience?.step || client.programProgress || 1,
      level: (activeExperience?.step || 1) <= 2 ? 'Nivel I' : 'Nivel II',
      bodyEmotion: 'Registro desde el Panel Minimalista del Participante',
      reflections: noteText,
      levelSpecificAnswer: `Respuesta al bloque de acción: ${activeExperience?.title}`,
    });

    setSavedNoteSuccess(blockId);
    setTimeout(() => setSavedNoteSuccess(null), 3000);
  };

  if (!activeExperience) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Selector Minimalista de Formatos (Pestañas Lineales Monocromáticas) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/15 dark:border-white/15 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {availableExperiences.map((exp) => {
            const isSelected = exp.id === activeExperience.id;
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => setSelectedExperienceId(exp.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{exp.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest shrink-0">
          {activeExperience.category || 'Experiencia Activa'}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* LIENZO DE ULTRA-MINIMALISMO Y ALTO CONTRASTE (B&W + FOTOGRAFÍA A COLOR)   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-black border border-black dark:border-white rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8 text-black dark:text-white shadow-sm transition-colors">
        {/* Encabezado Principal: Título, Encuadre y Fotografía Central */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Textos y Acceso Central (7 Columnas) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black dark:border-white text-[11px] font-mono uppercase tracking-wider font-semibold">
              <span>Paso Actual</span>
              <span className="w-1 h-1 rounded-full bg-black dark:bg-white" />
              <span>{activeExperience.dateStr || 'En Vivo'}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black dark:text-white leading-tight">
                {activeExperience.title}
              </h1>
              <p className="text-sm sm:text-base font-light text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                {activeExperience.subtitle}
              </p>
            </div>

            {/* Botón Principal "Ingresar a Sala" con Google Meet */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {activeExperience.meetUrl ? (
                <a
                  href={activeExperience.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-7 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2.5 shadow-md group cursor-pointer"
                >
                  <Video className="w-4 h-4 text-white dark:text-black group-hover:scale-110 transition-transform" />
                  <span>Ingresar a Sala Google Meet</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              ) : (
                <div className="px-5 py-3 rounded-2xl border border-dashed border-black/40 dark:border-white/40 text-xs font-mono text-neutral-500">
                  Enlace de sala en preparación por el facilitador
                </div>
              )}

              {onOpenWorkbook && (
                <button
                  type="button"
                  onClick={() => onOpenWorkbook(activeExperience.step || 1)}
                  className="px-5 py-3.5 rounded-2xl border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Abrir Bitácora de Trabajo
                </button>
              )}
            </div>
          </div>

          {/* FOTOGRAFÍA CENTRAL A COLOR: El ÚNICO elemento a color según la regla de marca RBC */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden border border-black dark:border-white shadow-xl group">
              <img
                src={activeExperience.colorPhotoUrl}
                alt={activeExperience.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Sutil viñeta para lectura del pie */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 block">
                  {activeExperience.category}
                </span>
                <p className="text-xs font-semibold leading-tight text-white mt-0.5">
                  John Fredy Rengifo Basto • Facilitación Ontológica
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PREGUNTAS GUÍA / INDAGACIÓN EN ACORDEÓN MINIMALISTA (SIN BORDES PESADOS) */}
        {/* ========================================================================= */}
        {activeExperience.guidingQuestions && activeExperience.guidingQuestions.length > 0 && (
          <div className="pt-6 border-t border-black/15 dark:border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                  Indagación Ontológica
                </span>
                <h3 className="text-base font-bold tracking-tight">
                  Preguntas Guía para Deconstruir el Quiebre
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {activeExperience.guidingQuestions.length} Preguntas
              </span>
            </div>

            <div className="space-y-2">
              {activeExperience.guidingQuestions.map((question, idx) => {
                const isExpanded = expandedInquiryIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-950/70 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedInquiryIndex(isExpanded ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-mono font-bold text-neutral-400 shrink-0 mt-0.5">
                          0{idx + 1}.
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-black dark:text-white leading-relaxed">
                          {question}
                        </span>
                      </div>
                      <span className="p-1 text-neutral-400 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-black/5 dark:border-white/5 space-y-3 animate-fadeIn">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                          Toma una respiración diafragmática. Observa qué resistencia o emoción surge en tu
                          cuerpo antes de emitir una respuesta intelectual.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULOS UNIVERSALES (BIENVENIDA, INDAGACIÓN, ACCIÓN)                     */}
        {/* ========================================================================= */}
        {activeExperience.blocks && activeExperience.blocks.length > 0 && (
          <div className="pt-6 border-t border-black/15 dark:border-white/15 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                  Estructura Universal
                </span>
                <h3 className="text-base font-bold tracking-tight">
                  Módulos de la Experiencia
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeExperience.blocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-2xl border border-black/20 dark:border-white/20 p-5 space-y-3 bg-white dark:bg-black flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-black/20 dark:border-white/20 text-[10px] font-mono font-semibold uppercase">
                      <span>
                        {block.type === 'welcome'
                          ? 'Bienvenida'
                          : block.type === 'inquiry'
                          ? 'Indagación'
                          : 'Acción'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-black dark:text-white leading-snug">
                      {block.title}
                    </h4>

                    {block.subtitle && (
                      <p className="text-xs font-medium text-neutral-500 leading-relaxed">
                        {block.subtitle}
                      </p>
                    )}

                    <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                      {block.content}
                    </p>
                  </div>

                  {/* Interacción práctica para bloques de acción */}
                  {block.type === 'action' && (
                    <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                      <textarea
                        rows={2}
                        value={participantNotes[block.id] || ''}
                        onChange={(e) =>
                          setParticipantNotes((prev) => ({
                            ...prev,
                            [block.id]: e.target.value,
                          }))
                        }
                        placeholder="Escribe aquí tu compromiso o micro-práctica..."
                        className="w-full p-2.5 rounded-xl border border-black/30 dark:border-white/30 bg-transparent text-xs focus:outline-none placeholder:text-neutral-400"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleSaveParticipantActionNote(block.id)}
                          className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold uppercase transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>{block.actionLabel || 'Registrar Acuerdo'}</span>
                        </button>

                        {savedNoteSuccess === block.id && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Guardado</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
