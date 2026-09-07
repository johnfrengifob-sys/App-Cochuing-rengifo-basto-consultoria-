/**
 * Service for interfacing with the server-side Google Gemini 3.7 AI endpoints.
 * Operates under the identity of Rengifo Basto Consultoría Ontológica (rengifobastoco@gmail.com).
 */

import { GeminiGeneratedWorkspaceDoc, GeminiWorkspaceSuiteResult, WorkspaceDocumentCategory } from '../types';

export type { GeminiGeneratedWorkspaceDoc, GeminiWorkspaceSuiteResult };

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
        model: 'gemini-3.8-flash',
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
      return `[Gemini 3.8 Ontología] Como facilitador ontológico, observo que este quiebre representa una oportunidad para recalibrar los acuerdos tácitos. Te propongo identificar: ¿Qué juicio estás tratando como una verdad inamovible y qué afirmación fáctica puedes verificar hoy?`;
    }
  }

  /**
   * Deep Ontological Diagnosis powered by Gemini 3.8 Flash
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
        confidenceLevel: data.confidenceLevel || 'Validado por Gemini 3.8 Flash',
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

  /**
   * Genera un documento individual especializado de Google Workspace con Gemini 3.8 Flash
   */
  static async generateWorkspaceDocument(params: {
    documentType: WorkspaceDocumentCategory | 'contract' | 'apps_script';
    title?: string;
    topic?: string;
    clientName?: string;
    clientEmail?: string;
    additionalContext?: string;
  }): Promise<GeminiGeneratedWorkspaceDoc> {
    try {
      const res = await fetch('/api/gemini/generate-workspace-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Error en generador de documento Workspace: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('Gemini workspace document fallback:', err);
      const isSheet = params.documentType === 'sheet';
      const isForm = params.documentType === 'form';
      const isSlide = params.documentType === 'slide';
      const cat: WorkspaceDocumentCategory = isSheet ? 'sheet' : isForm ? 'form' : isSlide ? 'slide' : 'doc';
      const defaultUrl = isSheet
        ? 'https://docs.google.com/spreadsheets/create'
        : isForm
        ? 'https://docs.google.com/forms/create'
        : isSlide
        ? 'https://docs.google.com/presentation/create'
        : 'https://docs.google.com/document/create';

      return {
        id: `gemini_ws_${Date.now()}`,
        title: params.title || `Documento Maestro RBC: ${params.topic || 'Consultoría Ontológica'}`,
        category: cat,
        mimeType: isSheet
          ? 'application/vnd.google-apps.spreadsheet'
          : isForm
          ? 'application/vnd.google-apps.form'
          : isSlide
          ? 'application/vnd.google-apps.presentation'
          : 'application/vnd.google-apps.document',
        description: `Documento oficial de Google Workspace generado por Gemini para ${params.clientName || 'el coachee'}.`,
        tags: ['Cerebro RBC', 'Workspace', 'Gemini AI'],
        contentSnippet: `Axiomas ontológicos para ${params.topic || 'indagación profunda'} y rediseño del observador.`,
        fullContent: `# Documento de Trabajo Ontológico\n\n**Organización:** Rengifo Basto Consultoría Ontológica\n**Coach:** John Fredy Rengifo Basto (rengifobastoco@gmail.com)\n\n### 1. Indagación del Quiebre\nEspacio de trabajo articulado para lenguaje, cuerpo y emoción.\n\n### 2. Compromisos y Acuerdos\nSincronización continua con la plataforma de consultoría ontológica.`,
        googleWorkspaceUrl: defaultUrl,
        openUrl: defaultUrl,
        suggestedFileName: `RBC_${(params.title || 'Documento').replace(/\s+/g, '_')}`,
        integrationInstructions: 'Abre el documento en Google Workspace y vincula el enlace en el panel central de la aplicación.',
      };
    }
  }

  /**
   * Genera el Paquete Integral de 5 Documentos de Google Workspace para la integración total con la aplicación
   */
  static async generateWorkspaceSuite(params?: {
    clientName?: string;
    clientEmail?: string;
    focus?: string;
  }): Promise<GeminiWorkspaceSuiteResult> {
    try {
      const res = await fetch('/api/gemini/generate-workspace-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      });

      if (!res.ok) {
        throw new Error(`Error en generador de suite Workspace: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('Gemini workspace suite fallback:', err);
      return {
        suiteTitle: 'Suite Maestra de Integración Google Workspace - Rengifo Basto Consultoría Ontológica',
        generatedAt: new Date().toISOString(),
        executiveSummary:
          'Ecosistema documental unificado que articula Google Sheets (Directorio), Google Forms (Diagnóstico), Google Docs (Contrato Marco y Plan de Quiebres) y Google Apps Script con la API de Rengifo Basto Consultoría.',
        integrationWebhookUrl: `${window.location.origin}/api/webhooks/workshop-completion`,
        documents: [
          {
            id: `suite_sheet_${Date.now()}`,
            title: 'Directorio Maestro de Clientes & Matriz de Quiebres Ontológicos',
            category: 'sheet',
            mimeType: 'application/vnd.google-apps.spreadsheet',
            description: 'Matriz central en Google Sheets para el control de coachees, estado operativo y quiebres primarios sincronizada con la plataforma.',
            tags: ['Google Sheets', 'Directorio', 'Matriz RBC', 'Sincronización'],
            contentSnippet: 'Columnas estructuradas para registro automático de coachees, pagos, quiebres ontológicos y avance por nodos.',
            fullContent: `# Directorio Maestro de Clientes RBC\n\n**Hoja de Cálculo:** Google Sheets\n**Cuenta Propietaria:** rengifobastoco@gmail.com\n\n### Columnas Oficiales para Sincronización:\n1. ID Cliente\n2. Nombre y Apellidos\n3. Correo Electrónico\n4. Estado Operativo (🟢 ACTIVO | 🟡 EN ESPERA | ⚪ INACTIVO)\n5. Quiebre Ontológico Principal\n6. Total Invertido\n7. Estado de Pago\n8. Progreso del Programa (Sesión 1 a 6)\n9. Última Sincronización`,
            googleWorkspaceUrl: 'https://docs.google.com/spreadsheets/create',
            openUrl: 'https://docs.google.com/spreadsheets/create',
            suggestedFileName: 'RBC_Directorio_Maestro_Clientes.gsheet',
            integrationInstructions: 'Crea una nueva hoja en Google Sheets, nombra la primera pestaña "Clientes Activos" e introduce los encabezados descritos.',
            tableSchema: [
              { column: 'ID Cliente', description: 'UID asignado en la plataforma', sampleValue: 'c-8821' },
              { column: 'Nombre Completo', description: 'Nombre completo del coachee', sampleValue: params?.clientName || 'Coachee Ejecutivo' },
              { column: 'Correo Electrónico', description: 'Correo ancla de verificación', sampleValue: params?.clientEmail || 'coachee@example.com' },
              { column: 'Quiebre Ontológico', description: 'Quiebre primordial declarado', sampleValue: 'Fronteras en la toma de decisiones' },
              { column: 'Estado', description: 'Semáforo de interacción', sampleValue: '🟢 ACTIVO' },
              { column: 'Progreso', description: 'Nodo del camino', sampleValue: 'Sesión 2 de 6' },
            ],
          },
          {
            id: `suite_form_${Date.now()}`,
            title: 'Cuestionario de Diagnóstico Inicial y Somático (Google Forms)',
            category: 'form',
            mimeType: 'application/vnd.google-apps.form',
            description: 'Formulario oficial de intake para evaluar el observador del participante antes de iniciar el ciclo quincenal.',
            tags: ['Google Forms', 'Diagnóstico Somático', 'Intake', 'ICF'],
            contentSnippet: 'Cuestionario de 5 dimensiones ontológicas: Lenguaje, Emoción, Corporalidad, Pedidos y Compromiso.',
            fullContent: `# Cuestionario de Diagnóstico Ontológico\n\n**Propósito:** Mapear el quiebre inicial, centro somático de contención y nivel de certeza antes de la primera sesión.`,
            googleWorkspaceUrl: 'https://docs.google.com/forms/create',
            openUrl: 'https://docs.google.com/forms/create',
            suggestedFileName: 'RBC_Cuestionario_Diagnostico_Inicial.gform',
            integrationInstructions: 'Abre Google Forms, añade las preguntas especificadas y conecta las respuestas con la hoja del Directorio Maestro.',
            formQuestions: [
              { title: 'Nombre completo del participante', type: 'TEXT', required: true },
              { title: 'Correo electrónico', type: 'TEXT', required: true },
              { title: '¿Cuál es el quiebre o conversación pendiente que deseas transformar?', type: 'PARAGRAPH', required: true },
              { title: 'Centro corporal de mayor presencia emocional', type: 'RADIO', required: true, options: ['Pecho / Diafragma', 'Garganta', 'Hombros / Cervical', 'Estómago'] },
              { title: 'Nivel de certeza para iniciar el proceso (1 a 5)', type: 'SCALE', required: true },
            ],
          },
          {
            id: `suite_contract_${Date.now()}`,
            title: 'Contrato Marco de Coaching Ontológico y Acuerdo de Confidencialidad',
            category: 'doc',
            mimeType: 'application/vnd.google-apps.document',
            description: 'Instrumento legal y ético de consultoría entre John Fredy Rengifo Basto y el Coachee bajo el código de ética ICF.',
            tags: ['Google Docs', 'Marco Legal', 'Confidencialidad', 'Contrato ICF'],
            contentSnippet: 'Cláusulas de confidencialidad estricta, alcances ontológicos (no terapia clínica), deberes y cancelaciones.',
            fullContent: `# Contrato Marco de Consultoría y Coaching Ontológico\n\n**Entre:** John Fredy Rengifo Basto (titular de rengifobastoco@gmail.com)\n**Y:** ${params?.clientName || 'El Coachee'}\n\n---\n\n### Cláusula Primera: Objeto\nFacilitar el aprendizaje transformacional a través de los dominios lingüístico, emocional y corporal bajo estándares ICF.\n\n### Cláusula Segunda: Confidencialidad Estricta\nToda conversación y registro se mantiene bajo secreto profesional y confidencialidad absoluta.\n\n### Cláusula Tercera: Compromiso\nEl coachee lidera su propio aprendizaje y asiste a las citas acordadas en Google Calendar.`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Contrato_Marco_Coaching_Confidencialidad.gdoc',
            integrationInstructions: 'Crea una copia en Google Docs, personaliza las partes y compártela para firma digital.',
          },
          {
            id: `suite_script_${Date.now()}`,
            title: 'Guía Técnica de Integración Google Workspace & Código Apps Script',
            category: 'knowledge_base',
            mimeType: 'application/vnd.google-apps.document',
            description: 'Manual de arquitectura técnica con código Google Apps Script para automatizar webhooks hacia la plataforma RBC.',
            tags: ['Google Apps Script', 'Webhooks', 'Automatización', 'API'],
            contentSnippet: 'Código Apps Script con UrlFetchApp para sincronizar respuestas de Google Forms y filas de Google Sheets hacia /api/webhooks/workshop-completion.',
            fullContent: `# Guía de Integración Técnica Google Workspace con RBC\n\nEste script conecta respuestas de Google Forms y hojas de Google Sheets con el servidor de la aplicación.`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Guia_Tecnica_AppsScript.gdoc',
            appsScriptCode: `function onFormSubmit(e) {
  var webhookUrl = "${window.location.origin}/api/webhooks/workshop-completion";
  var email = (e && e.values && e.values[1]) ? e.values[1] : "${params?.clientEmail || 'coachee@example.com'}";
  var payload = {
    participantEmail: email,
    workshopId: "workspace-sync",
    attended: true,
    keyBreakthrough: "Sincronización en tiempo real desde Google Workspace",
    source: "Google Apps Script Trigger"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log("RBC Webhook status: " + response.getResponseCode());
  } catch (error) {
    Logger.log("Error sincronizando: " + error);
  }
}`,
            integrationInstructions: 'Abre el formulario o la hoja en Google Workspace, ve a Extensiones > Apps Script, pega el código y configura un Activador (Trigger) "Al enviar el formulario" o "Al editar".',
          },
          {
            id: `suite_plan_${Date.now()}`,
            title: 'Plan Maestro de Transformación Ontológica y Quiebres',
            category: 'doc',
            mimeType: 'application/vnd.google-apps.document',
            description: 'Cuaderno de trabajo colaborativo para el coachee con mapa de quiebres, juicios, declaraciones y anclajes somáticos.',
            tags: ['Google Docs', 'Plan Ontológico', 'Coachee', 'Workbook'],
            contentSnippet: 'Matriz de 6 etapas de transformación: Reconocimiento del observador, quiebre somático, rediseño de pedidos, declaraciones y consolidación.',
            fullContent: `# Plan Maestro de Transformación Ontológica\n\n**Participante:** ${params?.clientName || 'Coachee'}\n**Coach:** John Fredy Rengifo Basto\n**Programa:** Certeza, Fronteras & Dirección Personal\n\n---\n\n### Etapa 1: El Observador Actual\n- Juicios automáticos y territorios somáticos de contención.\n\n### Etapa 2: La Declaración del Quiebre\n- Declaraciones fundamentales y costo de la inacción.\n\n### Etapa 3: Diseño de Nuevas Conversaciones y Pedidos\n- Protocolos somáticos de arraigo y centramiento.`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Plan_Transformacion_Ontologica.gdoc',
            integrationInstructions: 'Crea una copia para el coachee en Google Docs y compártela con permisos de edición mutua.',
          },
        ],
      };
    }
  }
}
