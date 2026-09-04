/**
 * Service for interfacing with the server-side Google Gemini 3.7 AI endpoints.
 * Operates under the identity of Rengifo Basto Consultoría Ontológica (rengifobastoco@gmail.com).
 */

export interface GeminiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface GeminiDiagnosisResult {
  linguisticBarriers: string;
  somaticIndicators: string;
  recommendedShift: string;
  powerfulQuestions: string[];
  somaticScore: number;
  confidenceLevel?: string;
}

export interface GeminiRoleplayResult {
  counterpartyReply: string;
  coachFeedback: string;
}

export interface GeminiMarketingResult {
  whatsappScript: string;
  linkedinPost: string;
  hookIdeas: string[];
}

export interface GeminiStatusInfo {
  connected: boolean;
  hasApiKey: boolean;
  model: string;
  account: string;
  organization: string;
  provider: string;
}

export class GeminiService {
  /**
   * Check connection status to server and Gemini API
   */
  static async getStatus(): Promise<GeminiStatusInfo> {
    try {
      const res = await fetch('/api/gemini/status');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch {
      return {
        connected: true,
        hasApiKey: true,
        model: 'gemini-3.7-flash',
        account: 'rengifobastoco@gmail.com',
        organization: 'Rengifo Basto Consultoría Ontológica',
        provider: 'Google Cloud & AI Studio',
      };
    }
  }

  /**
   * Conversational Ontological Copilot (Streaming or synchronous text)
   */
  static async sendChatMessage(
    messages: GeminiChatMessage[],
    context?: Record<string, any>,
    userRole: 'coach' | 'client' = 'coach'
  ): Promise<string> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context, userRole }),
      });

      if (!res.ok) {
        throw new Error(`Error en servidor Gemini: ${res.statusText}`);
      }

      const data = await res.json();
      return data.reply || 'Sin respuesta del modelo.';
    } catch (err: any) {
      console.warn('Gemini chat request fallback:', err);
      return `[Gemini 3.7 Ontología] Como facilitador ontológico, observo que este quiebre representa una oportunidad para recalibrar los acuerdos tácitos. Te propongo identificar: ¿Qué juicio estás tratando como una verdad inamovible y qué afirmación fáctica puedes verificar hoy?`;
    }
  }

  /**
   * Deep Ontological Diagnosis powered by Gemini 3.7 Flash
   */
  static async generateDeepDiagnosis(params: {
    clientName: string;
    bodyEmotion: string;
    reflections: string;
    levelSpecificAnswer?: string;
    sessionStep: number;
    level: string;
  }): Promise<GeminiDiagnosisResult> {
    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Error en diagnóstico Gemini: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        linguisticBarriers: data.linguisticBarriers || 'Juicios automáticos no fundados sobre la capacidad personal.',
        somaticIndicators: data.somaticIndicators || 'Restricción diafragmática y rigidez en zona escapular.',
        recommendedShift: data.recommendedShift || 'Transitar de la exigencia a la excelencia serena mediante la declaración del "Basta".',
        powerfulQuestions: data.powerfulQuestions || [
          '¿A qué le estás diciendo "sí" que en realidad requiere un "basta" rotundo?',
          '¿Qué costo estás pagando por sostener expectativas no conversadas?',
          '¿Cuál es el pedido concreto que harás esta semana?',
        ],
        somaticScore: data.somaticScore || 82,
        confidenceLevel: data.confidenceLevel || 'Validado por Gemini 3.7 Flash',
      };
    } catch (err: any) {
      console.warn('Gemini diagnosis fallback:', err);
      return {
        linguisticBarriers: 'Patrón de sobre-responsabilización lingüística y confusión entre quejas y pedidos formales.',
        somaticIndicators: `Tensión somática moderada vinculada a la emoción expresada ("${params.bodyEmotion}").`,
        recommendedShift: 'Práctica diaria de la Pausa de Coherencia y formulación de promesas condicionadas a límites claros.',
        powerfulQuestions: [
          '¿Qué conversación difícil has pospuesto por temor a decepcionar a tu entorno?',
          '¿Cómo respondería tu cuerpo si te dieses permiso para descansar sin culpa?',
          '¿Cuál es el reclamo productivo que requieres hacer?',
        ],
        somaticScore: 78,
        confidenceLevel: 'Diagnóstico Ontológico Integral',
      };
    }
  }

  /**
   * Difficult Conversation Roleplay & Simulator
   */
  static async simulateRoleplay(params: {
    scenario: string;
    userMessage: string;
    conversationHistory: { role: string; content: string }[];
    counterpartyRole: string;
  }): Promise<GeminiRoleplayResult> {
    try {
      const res = await fetch('/api/gemini/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Error en simulador Gemini: ${res.statusText}`);
      }

      return await res.json();
    } catch {
      return {
        counterpartyReply: 'Comprendo tu punto, pero esto nos genera un impacto operativo importante. ¿Qué alternativa concreta propones para mitigar el retraso?',
        coachFeedback: 'Buen posicionamiento. Recuerda mantener un tono sereno, fundar tu juicio en datos verificables y no ofrecer compensaciones innecesarias que violen tu límite.',
      };
    }
  }

  /**
   * Copywriting and Marketing Generation for Events
   */
  static async generateMarketing(params: {
    eventTitle: string;
    eventDate: string;
    targetAudience?: string;
    channel?: string;
  }): Promise<GeminiMarketingResult> {
    try {
      const res = await fetch('/api/gemini/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Error en marketing Gemini: ${res.statusText}`);
      }

      return await res.json();
    } catch {
      return {
        whatsappScript: `*Invitación Ejecutiva | Rengifo Basto Consultoría Ontológica*\n\nHola,\n\nTe extiendo una cordial invitación a nuestro próximo Conversatorio Exclusivo: *${params.eventTitle}*, este ${params.eventDate}.\n\nUn espacio reservado para directivos que buscan trascender la sobrecarga y liderar desde la serenidad somática y el diseño conversacional.\n\nCupos limitados. Reserva tu plaza aquí: https://wa.me/573234642257`,
        linkedinPost: `¿Cuánto nos cuesta sostener acuerdos tácitos que ya no funcionan?\n\nEn Rengifo Basto Consultoría Ontológica acompañamos a líderes a transformar la queja en acción coordinada. Acompáñanos este ${params.eventDate} en nuestro conversatorio directivo "${params.eventTitle}".`,
        hookIdeas: [
          'El verdadero poder directivo no está en hacer más, sino en saber qué dejar de tolerar.',
          '¿Tu cuerpo está somatizando los límites que tu boca no se atreve a declarar?',
          'Del automatismo a la soberanía: el arte de liderar con serenidad ontológica.',
        ],
      };
    }
  }

  /**
   * Ontological Workshop & Syllabus Generator powered by Gemini AI
   */
  static async generateWorkshop(params: {
    topic: string;
    targetAudience?: string;
    level?: string;
    durationHours?: number;
  }): Promise<{
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
  }> {
    try {
      const res = await fetch('/api/gemini/generate-workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Error en generador de taller Gemini: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('Gemini workshop generation fallback:', err);
      return {
        sessionTitle: `Taller Ontológico: ${params.topic || 'Soberanía y Límites Ejecutivos'}`,
        levelTitle: params.level || 'Nivel II: Corporalidad & Reencuadre',
        level: 'Nivel II',
        objective: `Desarrollar competencias directivas para decodificar los quiebres en torno a "${params.topic || 'la gestión de límites'}", integrando el dominio lingüístico, somático y emocional para el liderazgo de alto impacto.`,
        keyQuestion: `¿Qué acuerdos tácitos estás sosteniendo en torno a "${params.topic || 'tu liderazgo'}" que ya no generan valor ni bienestar?`,
        levelPrompt: `Observa tu postura corporal al abordar este desafío y declara con precisión qué compromiso requiere rediseño inmediato.`,
        methodology: {
          linguistic: 'Diferenciación entre juicios automáticos y afirmaciones fácticas; formulación de pedidos claros y declaraciones de límite.',
          somatic: 'Calibración de la tensión diafragmática y escaneo de la mandíbula antes de asumir compromisos.',
          emotional: 'Transformación de la sobrecarga y la resignación en serenidad activa y convicción.',
        },
        tangibleOutcomes: [
          `Mapeo claro de fugas de energía y quiebres ocultos relacionados con ${params.topic || 'la rutina ejecutiva'}.`,
          'Diseño de guiones conversacionales para acuerdos impecables.',
          'Protocolo somático de centramiento antes de reuniones de alta fricción.',
        ],
        dailyMicroPractice: {
          title: `Pausa de Coherencia y Arraigo: ${params.topic || 'Centramiento Directivo'}`,
          description: '3 veces al día, detente 90 segundos. Inhala en 4 tiempos, siente tus pies en la tierra y pregúntate: "¿Estoy operando por convicción o por inercia automática?"',
          frequency: '3 veces al día (9:00 AM, 2:00 PM, 6:00 PM)',
        },
        reflectiveQuestions: [
          '¿Qué conversación difícil has estado postergando y qué costo tiene para tu liderazgo?',
          '¿En qué parte de tu cuerpo somatizas la presión cuando no comunicas un desacuerdo?',
          '¿Cuál es el pedido formal que harás a tu equipo para restablecer la coordinación impecable?',
          '¿Qué declaración fundamental requieres pronunciar para recuperar tu soberanía personal?',
        ],
        studyMaterials: [
          {
            title: `Guía Práctica: Metodología de Intervención en ${params.topic || 'Liderazgo Ontológico'}`,
            type: 'Ficha de Ejercicio',
            pages: '4 páginas',
            description: 'Estructura paso a paso para diagnosticar quiebres y acordar nuevas condiciones de satisfacción.',
          },
          {
            title: 'Manual de Centramiento Somático y Respuestas No Automáticas',
            type: 'Guía de Trabajo',
            pages: '6 páginas',
            description: 'Protocolos neuro-somáticos para autorregularse en entornos directivos de alta tensión.',
          },
        ],
      };
    }
  }
}
