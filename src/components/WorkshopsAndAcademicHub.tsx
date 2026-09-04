import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ListOrdered,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  Download,
  Save,
  Compass,
  HeartPulse,
  MessageSquare,
  Flame,
  Shield,
  RefreshCw,
  Copy,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { OntologicalStore } from '../services/store';
import { AdminTemariosManager } from './admin/AdminTemariosManager';
import { AdminCoursesManager } from './admin/AdminCoursesManager';
import { AdminRoadmapStepsManager } from './admin/AdminRoadmapStepsManager';
import { AdminQuestionnairesManager } from './admin/AdminQuestionnairesManager';

export type WorkshopAcademicSubTab =
  | 'generator'
  | 'temarios'
  | 'courses'
  | 'steps'
  | 'questionnaires';

interface GeneratedWorkshopState {
  sessionTitle: string;
  levelTitle: string;
  level: 'Nivel I' | 'Nivel II' | 'Nivel III';
  objective: string;
  keyQuestion: string;
  levelPrompt: string;
  methodology: {
    linguistic: string;
    somatic: string;
    emotional: string;
  };
  tangibleOutcomes: string[];
  dailyMicroPractice: {
    title: string;
    description: string;
    frequency: string;
  };
  reflectiveQuestions: string[];
  studyMaterials: {
    title: string;
    type: string;
    pages: string;
    description: string;
  }[];
}

export const WorkshopsAndAcademicHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<WorkshopAcademicSubTab>('generator');

  // Workshop Generator State
  const [topic, setTopic] = useState('Mapeo de la Transparencia, Quiebres y Límites');
  const [targetAudience, setTargetAudience] = useState('Directores Ejecutivos y Socios');
  const [selectedLevel, setSelectedLevel] = useState<'Nivel I' | 'Nivel II' | 'Nivel III'>('Nivel II');
  const [durationHours, setDurationHours] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [generatedWorkshop, setGeneratedWorkshop] = useState<GeneratedWorkshopState>({
    sessionTitle: 'Mapeo de Transparencia, Quiebres Ocultos y Soberanía Directiva',
    levelTitle: 'Nivel II: Corporalidad, Reencuadre & Fronteras',
    level: 'Nivel II',
    objective:
      'Identificar fugas de energía y automatismos en la rutina ejecutiva mediante el mapeo de quiebres ocultos y el rediseño de acuerdos tácitos no consensuados.',
    keyQuestion: '¿A qué acuerdos tácitos estás asintiendo con tu cuerpo que drenan tu liderazgo y bienestar?',
    levelPrompt:
      'Detecta en qué momento de tu jornada asumes compromisos sin observar la tensión muscular en tu diafragma.',
    methodology: {
      linguistic:
        'Diferenciación entre el fluir transparente y la declaración explícita de quiebre como interrupción deliberada.',
      somatic:
        'Calibración de la tensión muscular postural y diafragmática al momento de asumir compromisos automáticos.',
      emotional:
        'Reconocimiento temprano de la resignación y la sobrecarga como señales fácticas de falta de límites.',
    },
    tangibleOutcomes: [
      'Identificación precisa de las fugas de energía y automatismos en la rutina ejecutiva.',
      'Mapeo estructurado de quiebres ocultos y acuerdos tácitos no consensuados.',
      'Recuperación de la capacidad de pausar y observar antes de reaccionar compulsivamente.',
    ],
    dailyMicroPractice: {
      title: 'Pausa de Coherencia y Mapeo en 3 Tiempos',
      description:
        '3 veces al día, detente 90 segundos. Inhala profundo en 4 tiempos, escanea tu cuerpo y pregúntate: "¿Estoy operando por convicción o por inercia automática?" Registra cualquier quiebre que emerja.',
      frequency: 'Diaria (3 veces al día: 9:00 AM, 2:00 PM, 6:00 PM)',
    },
    reflectiveQuestions: [
      '¿Qué conversación difícil has pospuesto y qué consecuencias somáticas está teniendo en ti?',
      '¿Cuáles son los acuerdos tácitos en tu equipo que hoy funcionan como frenos invisibles?',
      '¿Qué declaración de "Basta" necesitas pronunciar para salvaguardar tu soberanía personal?',
      '¿Cómo cambia tu postura física cuando hablas desde la convicción en lugar de la complacencia?',
    ],
    studyMaterials: [
      {
        title: 'Ficha Ontológica: Matriz de Quiebres y Acuerdos Tácitos',
        type: 'Ficha de Ejercicio Práctico',
        pages: '4 páginas',
        description: 'Herramienta de diagnóstico para evaluar las fugas operativas y la carga mental oculta.',
      },
      {
        title: 'Guía Somática: Protocolo de Centramiento y Pausa de Coherencia',
        type: 'Manual de Práctica Neuro-Somática',
        pages: '6 páginas',
        description: 'Ejercicios de autorregulación del sistema nervioso para líderes sometidos a alta presión.',
      },
    ],
  });

  const presetTopics = [
    'Mapeo de la Transparencia, Quiebres y Límites',
    'Conversaciones Difíciles y Acuerdos Impecables',
    'Gestión de la Reactividad y Centramiento Somático',
    'Autoexigencia Directiva y Prevención del Burnout',
    'Soberanía Personal y Declaraciones Fundamentales',
  ];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setSaveSuccess(false);
    try {
      const result = await GeminiService.generateWorkshop({
        topic,
        targetAudience,
        level: selectedLevel,
        durationHours,
      });
      if (result) {
        setGeneratedWorkshop(result as GeneratedWorkshopState);
      }
    } catch (e) {
      console.error('Error generating workshop:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToProgramNodes = () => {
    const nodes = OntologicalStore.getProgramNodes();
    const targetNode = nodes.find((n) => n.level === generatedWorkshop.level) || nodes[0];
    if (targetNode) {
      OntologicalStore.updateProgramNode(targetNode.step, {
        sessionTitle: generatedWorkshop.sessionTitle,
        title: generatedWorkshop.sessionTitle,
        objective: generatedWorkshop.objective,
        methodology: generatedWorkshop.methodology,
        tangibleOutcomes: generatedWorkshop.tangibleOutcomes,
        dailyMicroPractice: generatedWorkshop.dailyMicroPractice,
        reflectiveQuestions: generatedWorkshop.reflectiveQuestions,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleCopySummary = () => {
    const text = `
TALLER ONTOLÓGICO: ${generatedWorkshop.sessionTitle}
NIVEL: ${generatedWorkshop.level} - ${generatedWorkshop.levelTitle}

OBJETIVO FORMATIVO:
${generatedWorkshop.objective}

PREGUNTA DE INDAGACIÓN:
${generatedWorkshop.keyQuestion}

METODOLOGÍA EN LOS 3 DOMINIOS:
- 🗣️ Lingüístico: ${generatedWorkshop.methodology.linguistic}
- 🫀 Somático: ${generatedWorkshop.methodology.somatic}
- 🌊 Emocional: ${generatedWorkshop.methodology.emotional}

CAPACIDADES & RESULTADOS TANGIBLES:
${generatedWorkshop.tangibleOutcomes.map((o) => `• ${o}`).join('\n')}

MICRO-PRÁCTICA DE ANCLAJE COTIDIANO:
${generatedWorkshop.dailyMicroPractice.title}
Frecuencia: ${generatedWorkshop.dailyMicroPractice.frequency}
${generatedWorkshop.dailyMicroPractice.description}

PREGUNTAS REFLEXIVAS:
${generatedWorkshop.reflectiveQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Rengifo Basto Consultoría Ontológica
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#141414] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-black dark:text-white" />
            Academia & Talleres Ontológicos
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Diseño pedagógico con Gemini AI, temarios estructurados ICF y gestión de cursos vivenciales.
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 dark:bg-neutral-900 p-1.5 rounded-lg border border-gray-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveSubTab('generator')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'generator'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generador IA (Gemini)
          </button>
          <button
            onClick={() => setActiveSubTab('temarios')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'temarios'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Temarios & Nodos
          </button>
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'courses'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Programas Activos
          </button>
          <button
            onClick={() => setActiveSubTab('steps')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'steps'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Fases Metodológicas
          </button>
          <button
            onClick={() => setActiveSubTab('questionnaires')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'questionnaires'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Cuestionarios Dinámicos
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'generator' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-[#141414] p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Generador Ontológico de Talleres & Fichas con IA
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Construye programas ejecutivos alineados a los 3 dominios ontológicos y la micro-práctica de coherencia.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md">
                Modelo: Gemini 3.7 Flash
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                Temas Clave Pre-diseñados:
              </label>
              <div className="flex flex-wrap gap-2">
                {presetTopics.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTopic(p)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      topic === p
                        ? 'bg-black text-white dark:bg-white dark:text-black border-transparent font-medium'
                        : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:border-gray-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Tema Central o Quiebre Directivo:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Mapeo de Transparencia y Acuerdos Tácitos"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Nivel Ontológico:
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="Nivel I">Nivel I: Auto-observación & Quiebres</option>
                  <option value="Nivel II">Nivel II: Corporalidad & Reencuadre</option>
                  <option value="Nivel III">Nivel III: Soberanía & Dirección</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                  Duración / Modalidad:
                </label>
                <div className="flex gap-2">
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value={2}>2 Horas (Focalizado)</option>
                    <option value={4}>4 Horas (Media Jornada)</option>
                    <option value={8}>8 Horas (Intensivo)</option>
                  </select>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generar con IA
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Workshop Presentation */}
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            {/* Header / Actions */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-neutral-900 dark:to-[#141414] border-b border-gray-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded-md">
                    {generatedWorkshop.level}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
                    {generatedWorkshop.levelTitle}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {generatedWorkshop.sessionTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedText ? '¡Copiado!' : 'Copiar Síntesis'}
                </button>
                <button
                  onClick={handleSaveToProgramNodes}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveSuccess ? '¡Guardado en Nodos!' : 'Guardar en Programa'}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Objective & Key Question */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-100 dark:border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-neutral-300">
                    <Compass className="w-4 h-4 text-amber-500" />
                    Propósito & Objetivo Transformacional:
                  </div>
                  <p className="text-sm text-gray-800 dark:text-neutral-200 leading-relaxed">
                    {generatedWorkshop.objective}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-100 dark:border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-neutral-300">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                    Pregunta Indagatoria Central:
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white italic">
                    "{generatedWorkshop.keyQuestion}"
                  </p>
                </div>
              </div>

              {/* Capacidades & Resultados Tangibles */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Capacidades & Resultados Tangibles:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {generatedWorkshop.tangibleOutcomes.map((outcome, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50 dark:bg-neutral-900/40 rounded-lg border border-gray-200 dark:border-neutral-800 text-xs font-medium text-gray-800 dark:text-neutral-200 leading-relaxed flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metodología en los 3 Dominios Ontológicos */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  Metodología de Trabajo en los 3 Dominios Ontológicos:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Lingüístico */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-300">
                      <span>🗣️</span>
                      <span>Dominio Lingüístico</span>
                    </div>
                    <p className="text-xs text-blue-950 dark:text-neutral-200 leading-relaxed">
                      {generatedWorkshop.methodology.linguistic}
                    </p>
                  </div>

                  {/* Somático */}
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-rose-900 dark:text-rose-300">
                      <span>🫀</span>
                      <span>Dominio Somático</span>
                    </div>
                    <p className="text-xs text-rose-950 dark:text-neutral-200 leading-relaxed">
                      {generatedWorkshop.methodology.somatic}
                    </p>
                  </div>

                  {/* Emocional */}
                  <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/30 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-teal-900 dark:text-teal-300">
                      <span>🌊</span>
                      <span>Dominio Emocional</span>
                    </div>
                    <p className="text-xs text-teal-950 dark:text-neutral-200 leading-relaxed">
                      {generatedWorkshop.methodology.emotional}
                    </p>
                  </div>
                </div>
              </div>

              {/* Micro-Práctica de Anclaje Cotidiano (Diaria 3 veces al día) */}
              <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Micro-Práctica de Anclaje Cotidiano: {generatedWorkshop.dailyMicroPractice.title}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-md">
                    {generatedWorkshop.dailyMicroPractice.frequency}
                  </span>
                </div>
                <p className="text-xs text-amber-950 dark:text-neutral-200 leading-relaxed">
                  {generatedWorkshop.dailyMicroPractice.description}
                </p>
              </div>

              {/* Preguntas Reflexivas & Materiales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                    Preguntas de Cuaderno & Auto-observación:
                  </h4>
                  <ul className="space-y-2">
                    {generatedWorkshop.reflectiveQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-800 dark:text-neutral-300 flex items-start gap-2 bg-gray-50 dark:bg-neutral-900/30 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800/60"
                      >
                        <span className="text-gray-400 font-bold">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                    Fichas & Materiales de Estudio Sugeridos:
                  </h4>
                  <div className="space-y-2">
                    {generatedWorkshop.studyMaterials.map((mat, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 dark:bg-neutral-900/30 rounded-lg border border-gray-100 dark:border-neutral-800/60 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {mat.title}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium">
                            {mat.pages} • {mat.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-neutral-400">
                          {mat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab: Temarios & Nodos */}
      {activeSubTab === 'temarios' && <AdminTemariosManager />}

      {/* Sub-tab: Cursos */}
      {activeSubTab === 'courses' && <AdminCoursesManager />}

      {/* Sub-tab: Pasos y Fases */}
      {activeSubTab === 'steps' && <AdminRoadmapStepsManager />}

      {/* Sub-tab: Cuestionarios Dinámicos */}
      {activeSubTab === 'questionnaires' && <AdminQuestionnairesManager />}
    </div>
  );
};
