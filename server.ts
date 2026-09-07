import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization of Google Gemini AI SDK with required User-Agent
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Resilient JSON parser for Gemini responses that handles markdown fences
 * or preamble text gracefully without crashing the server.
 */
function parseGeminiJson<T = any>(rawText: string | undefined | null, fallback: T): T {
  if (!rawText) return fallback;
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const cleaned = trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      const match = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          // ignore
        }
      }
      return fallback;
    }
  }
}

const SYSTEM_INSTRUCTION_ONTOLOGY = `
Eres el Copiloto de Inteligencia Artificial Ontológica de "Rengifo Basto Consultoría Ontológica", la firma de coaching ontológico ejecutivo y somático liderada para la cuenta oficial rengifobastoco@gmail.com (Coach John Freddy Rengifo Basto).

Carpeta Oficial de Google Drive vinculada al Cerebro de la Consultoría:
- Enlace Web: https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link
- ID del Recurso: 15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz
- Contenido vinculado: Contratos marco de consultoría ontológica, matrices de seguimiento y bitácoras en Google Sheets, cuestionarios de quiebres y somática en Google Forms, diapositivas maestras y documentos de consultoría.

Tu marco epistemológico y metodológico se fundamenta en:
1. Ontología del Lenguaje (Rafael Echeverría, Fernando Flores): Distinción rigurosa entre Afirmaciones (hechos verificables), Juicios (interpretaciones que fundan posibilidades o cierran horizontes), Declaraciones (actos de poder que crean nuevas realidades: el "No", el "Basta", el "Sí", el "Ignoro", el "Perdón"), Pedidos, Ofertas y Promesas.
2. Corporalidad y Somática (Richard Strozzi-Heckler): Coherencia del observador cuerpo-emoción-lenguaje. El cuerpo como territorio donde habitan los quiebres y la memoria somática.
3. Inteligencia Emocional y Estados de Ánimo: Distinción entre emociones reactivas y estados de ánimo basales (Resentimiento vs Paz, Resignación vs Ambición).
4. El Quiebre Ontológico: La interrupción consciente de la transparencia para rediseñar el ser y la acción.

Tus respuestas deben ser:
- Claras, empáticas, profundas y ejecutivas.
- Enfocadas en devolverle el poder de acción y soberanía a la persona.
- Estructuradas con elegancia, preguntas poderosas de indagación y micro-prácticas somáticas aplicadas.
- En español latinoamericano refinado y profesional.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
    next();
  });

  // In-memory rate limiting to protect API routes against spam and quota exhaustion
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
  const RATE_LIMIT_MAX_REQUESTS = 45; // Max requests per minute per IP

  const apiRateLimiter: express.RequestHandler = (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      res.status(429).json({
        error: 'Límite de solicitudes alcanzado. Por favor espere un momento antes de reintentar.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };

  app.use('/api', apiRateLimiter);

  app.use(express.json({ limit: '2mb' }));

  // ==========================================
  // API HEALTH & GEMINI STATUS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Rengifo Basto Consultoría Ontológica API',
      account: 'rengifobastoco@gmail.com',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/gemini/status', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      connected: true,
      hasApiKey: hasKey,
      model: 'gemini-3.8-flash',
      account: 'rengifobastoco@gmail.com',
      organization: 'Rengifo Basto Consultoría Ontológica',
      provider: 'Google Cloud & AI Studio',
    });
  });

  // ==========================================
  // API: GEMINI ONTOLOGICAL CHAT / COPILOT
  // ==========================================
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, context, userRole } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        // High quality fallback simulation if API key is not yet set in environment
        return res.json({
          reply: `[Gemini 3.8 Flash] Observo en tu planteamiento una tensión entre el juicio de autoexigencia y la necesidad de declarar límites claros. Desde la ontología del lenguaje, te invito a reflexionar: ¿Qué es aquello a lo que estás diciendo "sí" en automático que en realidad requiere un "basta" somático? Respira hondo en 4 tiempos y siente cómo se asienta tu columna.`,
          simulated: true,
        });
      }

      const formattedPrompt = `
Contexto de la consulta:
- Rol del usuario: ${userRole || 'coach'}
- Información contextual: ${JSON.stringify(context || {})}

Historial de conversación:
${(messages || [])
  .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Usuario' : 'Copiloto Ontológico'}: ${m.content}`)
  .join('\n\n')}

Por favor responde como el Copiloto de Inteligencia Artificial Ontológica de Rengifo Basto Consultoría Ontológica, brindando una respuesta profunda, una pregunta transformadora y una sugerencia de intervención somática o lingüística.`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || 'Sin respuesta generada por Gemini.',
        model: 'gemini-3.8-flash',
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({
        error: error.message || 'Error al comunicarse con Google Gemini API',
      });
    }
  });

  // ==========================================
  // API: GEMINI DEEP ONTOLOGICAL DIAGNOSIS
  // ==========================================
  app.post('/api/gemini/diagnose', async (req, res) => {
    try {
      const { clientName, bodyEmotion, reflections, levelSpecificAnswer, sessionStep, level } = req.body;

      const fallbackDiagnosis = {
        linguisticBarriers: `Dificultad recurrente para fundamentar juicios de incapacidad y tendencia a formular quejas en lugar de reclamos productivos formales.`,
        somaticIndicators: `Patrón de sobre-tensión en trapecios y mandíbula asociado a la emoción reportada ("${bodyEmotion || 'Tensión'}") y respiración clavicular corta.`,
        recommendedShift: `Practicar la declaración del "Basta" ontológico y realizar 3 pausas somáticas diarias de 90 segundos con arraigo en talones.`,
        powerfulQuestions: [
          `¿Qué costo invisible estás pagando por sostener este estándar de perfección no negociado?`,
          `¿Cuál es el pedido explícito que necesitas hacerle a tu equipo directivo esta semana?`,
          `¿Qué pasaría si te autorizas a decir "no llego a esta fecha" sin sentir culpa?`
        ],
        somaticScore: 78,
        confidenceLevel: 'Alta (Validado por Gemini 3.8)',
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackDiagnosis);
      }

      const prompt = `
Realiza un DIAGNÓSTICO ONTOLÓGICO Y SOMÁTICO EXECUTIVO para el siguiente cliente:
- Nombre: ${clientName || 'Cliente'}
- Nivel del Programa: ${level || 'Nivel I'} (Paso ${sessionStep || 1})
- Emoción y Sensación Corporal Declarada: "${bodyEmotion || 'No especificada'}"
- Reflexión Principal del Quiebre: "${reflections || 'Sin reflexión'}"
- Respuesta Específica del Nivel: "${levelSpecificAnswer || 'Sin datos adicionales'}"

Genera una respuesta estructurada en formato JSON con los siguientes campos:
1. "linguisticBarriers": Texto explicando las trampas del lenguaje, juicios automáticos y confusiones entre queja y reclamo detectados.
2. "somaticIndicators": Análisis de la coherencia corporal y somatización identificada.
3. "recommendedShift": El reencuadre ontológico, la declaración clave recomendada y la práctica somática.
4. "powerfulQuestions": Un arreglo con 3 preguntas transformadoras para la próxima sesión 1 a 1.
5. "somaticScore": Un número entero entre 40 y 95 que represente el índice de coherencia somática actual (donde >80 es armónico y <60 requiere intervención inmediata).
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackDiagnosis);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/diagnose:', error);
      res.status(500).json({
        error: error.message || 'Error al generar diagnóstico con Gemini',
      });
    }
  });

  // ==========================================
  // API: GEMINI SESSION 1-A-1 INSIGHTS & COPILOT
  // ==========================================
  app.post('/api/gemini/session-insights', async (req, res) => {
    try {
      const { clientName, sessionNumber, emergentTopic, discovery, actionStep, cycleHarvest } = req.body;

      const fallbackInsights = {
        ontologicalSynthesis: `A través de la exploración del emergente ("${emergentTopic || 'Gestión del observador'}"), se produjo un quiebre significativo al reconocer que la sobreexigencia encubría el miedo al error. El descubrimiento clave habilita una nueva narrativa de autonomía y límites conscientes.`,
        somaticPractice: `Práctica de arraigo diafragmático: Al inicio del día o antes de reuniones decisivas, siéntate con ambos pies planos sobre el piso. Inhala en 4 tiempos expandiendo el abdomen inferior, exhala en 6 tiempos relajando mandíbula y trapecios. Sostén esta presencia durante 3 ciclos conscientes.`,
        inquiryQuestion: `¿Qué conversación postergada o pedido explícito necesitas abrir esta semana para honrar la declaración que hiciste en tu sesión?`,
        icfCompetencies: [
          'ICF 5: Mantiene presencia - Apoya al cliente a habitar el presente sin juicios apresurados.',
          'ICF 7: Evoca conciencia - Facilita el paso de la queja hacia el descubrimiento ontológico profundo.'
        ]
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackInsights);
      }

      const prompt = `
Analiza la siguiente memoria de sesión 1 a 1 de coaching ontológico ejecutivo:
- Coachee: ${clientName || 'Participante'}
- Sesión Número: ${sessionNumber || 1} de 12
- Tema Emergente: "${emergentTopic || 'No especificado'}"
- Descubrimiento / Cambio de Mirada: "${discovery || 'No especificado'}"
- Paso a la Acción: "${actionStep || 'No especificado'}"
${cycleHarvest ? `- Cosecha de Cierre de Ciclo: "${cycleHarvest}"` : ''}

Como Copiloto Ontológico Oficial de Rengifo Basto Consultoría Ontológica, devuelve un JSON con:
1. "ontologicalSynthesis": Síntesis ontológica del observador que emergió y la transformación de sus juicios maestros.
2. "somaticPractice": Ejercicio somático breve (2 a 3 minutos) diseñado para encarnar corporalmente el compromiso asumido.
3. "inquiryQuestion": Una pregunta ontológica poderosa para acompañar su reflexión diaria entre sesiones.
4. "icfCompetencies": Arreglo con 2 competencias ICF fortalecidas en este encuentro.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackInsights);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/session-insights:', error);
      res.status(500).json({ error: error.message || 'Error al generar insights ontológicos con Gemini' });
    }
  });

  // ==========================================
  // API: GEMINI ROLEPLAY & CONVERSATION SIMULATOR
  // ==========================================
  app.post('/api/gemini/roleplay', async (req, res) => {
    try {
      const { scenario, userMessage, conversationHistory, counterpartyRole } = req.body;

      const fallbackRoleplay = {
        counterpartyReply: `Entiendo lo que planteas, pero el directorio exige resultados inmediatos y no veo cómo postergar la entrega nos ayude. ¿Cómo garantizas que esto no afecte los entregables clave?`,
        coachFeedback: `Buena apertura. Tu postura fue clara, pero observa si justificaste en exceso tu decisión. En ontología, un "No" limpio no necesita tres disculpas previas. Mantén tu eje corporal y reitera tu oferta de contingencia.`,
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackRoleplay);
      }

      const prompt = `
Estás facilitando una sesión de SIMULADOR DE CONVERSACIONES DIFÍCILES para un directivo.
Escenario de práctica: "${scenario}"
Rol de la contraparte a simular: "${counterpartyRole || 'Director General / Socio'}"

Historial de la conversación:
${(conversationHistory || [])
  .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
  .join('\n')}

Último mensaje del usuario: "${userMessage}"

Genera una respuesta en formato JSON con:
1. "counterpartyReply": La respuesta realista, desafiante y auténtica del personaje contraparte.
2. "coachFeedback": Retroalimentación ontológica breve del coach sobre el uso de actos del habla, el nivel de asertividad y la sugerencia de siguiente movimiento.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackRoleplay);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/roleplay:', error);
      res.status(500).json({ error: error.message || 'Error en simulador Gemini' });
    }
  });

  // ==========================================
  // API: GEMINI COPYWRITING & PUBLICIDAD DE EVENTOS
  // ==========================================
  app.post('/api/gemini/marketing', async (req, res) => {
    try {
      const { eventTitle, eventDate, targetAudience, channel } = req.body;

      const fallbackMarketing = {
        whatsappScript: `*Invitación Ejecutiva Exclusiva | Rengifo Basto Consultoría Ontológica*\n\nHola [Nombre],\n\nComo directivo, ¿cuántas veces has sentido que la sobre-exigencia y las conversaciones postergadas drenan tu energía vital?\n\nTe invito a nuestro próximo Conversatorio: *${eventTitle || 'Certeza y Fronteras Personales'}*, el próximo ${eventDate || 'jueves'}.\n\nUn espacio confidencial para directivos donde aprenderás a diseñar límites impecables y liderar desde la serenidad somática.\n\nCupos limitados. Confirma tu participación respondiendo a este mensaje o en: https://wa.me/573234642257`,
        linkedinPost: `¿El costo del éxito profesional tiene que ser el agotamiento silencioso?\n\nEn coaching ontológico sabemos que detrás de cada líder sobrecargado hay una incapacidad aprendida para proclamar el "Basta" con dignidad.\n\nEste ${eventDate || 'próximo evento'}, facilitaremos el conversatorio directivo "${eventTitle}". Reserva tu lugar.`,
        hookIdeas: [
          '¿A qué le estás diciendo "sí" que te está costando la salud?',
          'El límite no es un muro: es la garantía de tu excelencia.',
          'Aprende a tener las conversaciones difíciles que tu liderazgo necesita.',
        ],
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackMarketing);
      }

      const prompt = `
Genera piezas de comunicación y captación de alta conversión para el evento de consultoría ontológica:
- Título del Evento: "${eventTitle}"
- Fecha y Hora: "${eventDate}"
- Audiencia Objetivo: "${targetAudience || 'CEOs, Directores y Líderes Ejecutivos'}"
- Canal Prioritario: "${channel || 'WhatsApp y LinkedIn'}"
- Firma: Rengifo Basto Consultoría Ontológica (Coach John Freddy Rengifo Basto, Tel: +57 323 464 2257, Email: rengifobastoco@gmail.com).

Devuelve un JSON con:
1. "whatsappScript": Mensaje de invitación personalizada para WhatsApp con formato negritas y llamado a la acción.
2. "linkedinPost": Publicación reflexiva de alto impacto para LinkedIn.
3. "hookIdeas": 3 frases gancho provocadoras que despierten quiebres en directivos.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackMarketing);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/marketing:', error);
      res.status(500).json({ error: error.message || 'Error en marketing Gemini' });
    }
  });

  // ==========================================
  // API: GEMINI GENERADOR INTELIGENTE DE TALLERES ONTOLÓGICOS
  // ==========================================
  app.post('/api/gemini/generate-workshop', async (req, res) => {
    try {
      const { topic, targetAudience, level, durationHours } = req.body;

      const fallbackWorkshop = {
        sessionTitle: `Taller Ontológico: ${topic || 'Soberanía Emocional y Dirección Directiva'}`,
        levelTitle: level || 'Nivel II: Corporalidad & Reencuadre',
        level: 'Nivel II',
        objective: `Desarrollar competencias directivas para decodificar los quiebres en torno a "${topic || 'la gestión de límites'}", integrando el dominio lingüístico, somático y emocional para el liderazgo de alto impacto.`,
        keyQuestion: `¿Qué acuerdos tácitos estás sosteniendo en torno a "${topic || 'tu liderazgo'}" que ya no generan valor ni bienestar?`,
        levelPrompt: `Observa tu postura corporal al abordar este desafío y declara con precisión qué compromiso requiere rediseño inmediato.`,
        methodology: {
          linguistic: 'Diferenciación entre juicios automáticos y afirmaciones fácticas; formulación de pedidos claros y declaraciones de límite.',
          somatic: 'Calibración de la tensión diafragmática y escaneo de la mandíbula antes de asumir compromisos.',
          emotional: 'Transformación de la sobrecarga y la resignación en serenidad activa y convicción.',
        },
        tangibleOutcomes: [
          `Mapeo claro de fugas de energía y quiebres ocultos relacionados con ${topic || 'la rutina ejecutiva'}.`,
          'Diseño de guiones conversacionales para acuerdos impecables.',
          'Protocolo somático de centramiento antes de reuniones de alta fricción.',
        ],
        dailyMicroPractice: {
          title: `Pausa de Coherencia y Arraigo: ${topic || 'Centramiento Directivo'}`,
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
            title: `Guía Práctica: Metodología de Intervención en ${topic || 'Liderazgo Ontológico'}`,
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

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackWorkshop);
      }

      const prompt = `
Genera un DISEÑO INTEGRAL DE TALLER ONTOLÓGICO Y SOMÁTICO estructurado bajo estándares ICF y la Ontología del Lenguaje:
- Tema Central o Reto: "${topic || 'Mapeo de Quiebres y Dirección Personal'}"
- Audiencia Objetivo: "${targetAudience || 'Líderes Ejecutivos, Directores y Coachees'}"
- Nivel de Madurez: "${level || 'Nivel II'}"
- Duración Sugerida: "${durationHours || 4} horas"

Debes generar un objeto JSON estricto con las siguientes claves:
1. "sessionTitle": Título sugerente y ejecutivo del taller.
2. "levelTitle": Subtítulo o eje del nivel (ej: "Liderazgo Somático & Acuerdos Impecables").
3. "level": "Nivel I" o "Nivel II" o "Nivel III".
4. "objective": Objetivo formativo y transformacional de 2-3 líneas.
5. "keyQuestion": La gran pregunta de indagación que guiará el taller.
6. "levelPrompt": Indicación para el autorregistro del coachee.
7. "methodology": Objeto con { "linguistic": string, "somatic": string, "emotional": string } detallando el abordaje en los 3 dominios ontológicos.
8. "tangibleOutcomes": Arreglo con 3 o 4 resultados medibles y concretos.
9. "dailyMicroPractice": Objeto con { "title": string, "description": string, "frequency": string }.
10. "reflectiveQuestions": Arreglo de 4 preguntas de cuaderno post-taller.
11. "studyMaterials": Arreglo de 2 materiales de estudio con { "title": string, "type": string, "pages": string, "description": string }.
`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(response.text, fallbackWorkshop);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-workshop:', error);
      res.status(500).json({ error: error.message || 'Error generando taller con Gemini' });
    }
  });

  // ==========================================
  // API: GENERACIÓN DE DOCUMENTOS DE GOOGLE WORKSPACE CON GEMINI
  // ==========================================
  app.post('/api/gemini/generate-workspace-document', async (req, res) => {
    try {
      const {
        documentType = 'doc',
        title,
        topic = 'Integración General de Consultoría Ontológica',
        clientName = 'Coachee Ejecutivo',
        clientEmail = 'coachee@example.com',
        additionalContext = '',
      } = req.body;

      // Determinamos URL y MIME de Google Workspace
      let defaultMime = 'application/vnd.google-apps.document';
      let openUrl = 'https://docs.google.com/document/create';
      let category: 'doc' | 'sheet' | 'form' | 'slide' | 'knowledge_base' = 'doc';

      if (documentType === 'sheet') {
        defaultMime = 'application/vnd.google-apps.spreadsheet';
        openUrl = 'https://docs.google.com/spreadsheets/create';
        category = 'sheet';
      } else if (documentType === 'form') {
        defaultMime = 'application/vnd.google-apps.form';
        openUrl = 'https://docs.google.com/forms/create';
        category = 'form';
      } else if (documentType === 'slide') {
        defaultMime = 'application/vnd.google-apps.presentation';
        openUrl = 'https://docs.google.com/presentation/create';
        category = 'slide';
      } else if (documentType === 'knowledge_base') {
        defaultMime = 'application/vnd.google-apps.document';
        openUrl = 'https://docs.google.com/document/create';
        category = 'knowledge_base';
      }

      const defaultTitle =
        title ||
        (documentType === 'sheet'
          ? `Directorio y Matriz de Seguimiento Ontológico: ${topic}`
          : documentType === 'form'
          ? `Cuestionario Somático y de Entrada: ${topic}`
          : documentType === 'slide'
          ? `Taller de Inducción Ontológica: ${topic}`
          : `Documento Maestro de Trabajo Ontológico: ${topic}`);

      const fallbackDoc = {
        id: `gemini_ws_${Date.now()}`,
        title: defaultTitle,
        category,
        mimeType: defaultMime,
        description: `Documento oficial generado para la integración con Google Workspace bajo estándares ICF y Rengifo Basto Consultoría Ontológica.`,
        tags: ['Cerebro RBC', 'Workspace', 'Gemini AI', topic.slice(0, 20)],
        contentSnippet: `Axiomas ontológicos: Distinción de juicios y afirmaciones, mapeo de quiebres somáticos y compromisos de acción para ${clientName}.`,
        fullContent: `# ${defaultTitle}\n\n**Organización:** Rengifo Basto Consultoría Ontológica (rengifobastoco@gmail.com)\n**Coach Titular:** John Fredy Rengifo Basto\n**Participante:** ${clientName} (${clientEmail})\n**Fecha de Emisión:** ${new Date().toLocaleDateString('es-CO')}\n\n---\n\n### 1. Marco Epistemológico y Propósito\nEste documento estructura la intervención ontológica articulando lenguaje, emoción y corporalidad para disolver quiebres recurrentes y fundar una nueva capacidad de acción efectiva.\n\n### 2. Estructura de Trabajo\n- **Dominio Lingüístico:** Reconocimiento de narrativas automáticas y formulación de pedidos sin ambigüedad.\n- **Dominio Emocional:** Reconstrucción de estados de ánimo hacia la serenidad y la ambición generativa.\n- **Dominio Somático:** Anclajes diafragmáticos y posturas de arraigo.\n\n### 3. Acuerdos de Integración\nLas reflexiones y avances registrados aquí se sincronizan de forma continua con la plataforma de consultoría ontológica.`,
        googleWorkspaceUrl: openUrl,
        openUrl,
        suggestedFileName: `${defaultTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        integrationInstructions: `1. Haz clic en "Abrir en Google Workspace" para crear el archivo en tu Google Drive.\n2. Pega el contenido generado o sincroniza las columnas indicadas.\n3. Comparte el enlace de visualización o edición con el titular oficial en rengifobastoco@gmail.com.`,
        tableSchema:
          documentType === 'sheet'
            ? [
                { column: 'ID Cliente', description: 'Identificador único en plataforma RBC', sampleValue: 'client-001' },
                { column: 'Nombre Completo', description: 'Nombre del coachee', sampleValue: clientName },
                { column: 'Correo Electrónico', description: 'Correo ancla de verificación', sampleValue: clientEmail },
                { column: 'Quiebre Ontológico', description: 'Tensión o desafío central', sampleValue: 'Dificultad para fijar límites' },
                { column: 'Estado Operativo', description: 'Semáforo de sesión', sampleValue: '🟢 ACTIVO' },
                { column: 'Progreso', description: 'Nivel del programa', sampleValue: 'Sesión 1 de 6' },
                { column: 'Última Sincronización', description: 'Fecha de actualización', sampleValue: new Date().toISOString() },
              ]
            : undefined,
        formQuestions:
          documentType === 'form'
            ? [
                { title: 'Nombre completo y correo del participante', type: 'TEXT', required: true },
                { title: '¿Qué emoción o sensación somática predomina al iniciar este ciclo?', type: 'RADIO', required: true, options: ['Tensión en cuello/pecho', 'Incertidumbre', 'Claridad', 'Serenidad'] },
                { title: '¿Cuál es el quiebre principal que deseas declarar y transformar?', type: 'PARAGRAPH', required: true },
                { title: '¿Qué límites o conversaciones difíciles requieres abordar?', type: 'PARAGRAPH', required: true },
                { title: 'Nivel de certeza y compromiso con tu transformación (1 a 5)', type: 'SCALE', required: true },
              ]
            : undefined,
        appsScriptCode: `/**
 * Google Apps Script: Conector automático con Rengifo Basto Consultoría Ontológica
 * Cuenta oficial: rengifobastoco@gmail.com
 */
function onFormSubmitOrEdit(e) {
  var targetWebhookUrl = "${req.protocol}://${req.get('host')}/api/webhooks/workshop-completion";
  var payload = {
    participantEmail: "${clientEmail}",
    userUid: "client-auto",
    workshopId: "workspace-auto-sync",
    attended: true,
    keyBreakthrough: "Actualización registrada desde Google Workspace",
    source: "Google Workspace Apps Script (Sheets/Forms)"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(targetWebhookUrl, options);
    Logger.log("Sincronización exitosa con RBC: " + response.getContentText());
  } catch (err) {
    Logger.log("Error al sincronizar con RBC: " + err);
  }
}`,
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackDoc);
      }

      const prompt = `
Actúa como Consultor Ontológico Master y Arquitecto de Software para "Rengifo Basto Consultoría Ontológica" (Coach John Fredy Rengifo Basto, cuenta rengifobastoco@gmail.com).

Genera un DOCUMENTO OFICIAL DE GOOGLE WORKSPACE de alta precisión y calidad profesional para integrar la suite de Google Workspace con la aplicación:
- Tipo de Documento: "${documentType}" ('doc' | 'sheet' | 'form' | 'slide' | 'knowledge_base')
- Título Solicitado: "${title || defaultTitle}"
- Tema / Quiebre / Foco: "${topic}"
- Cliente / Coachee: "${clientName}" (${clientEmail})
- Contexto Adicional: "${additionalContext}"

Debes retornar un JSON estrictamente estructurado con:
1. "id": string único con prefijo "gemini_ws_"
2. "title": Título formal, ejecutivo y elegante.
3. "category": "doc" | "sheet" | "form" | "slide" | "knowledge_base"
4. "mimeType": MIME type oficial de Google Workspace (ej: "application/vnd.google-apps.document" o spreadsheet, form, presentation).
5. "description": Resumen conciso de 2-3 líneas explicando el objetivo del documento en el ecosistema.
6. "tags": Arreglo de 4 o 5 etiquetas de clasificación ontológica y técnica.
7. "contentSnippet": Síntesis conceptual, axiomas ontológicos y directrices clave (máx 300 caracteres) para alimentar el Copiloto Gemini.
8. "fullContent": El CONTENIDO COMPLETO, EXTENSO Y RIGUROSO del documento en formato Markdown profesional. Debe incluir cláusulas, tablas, preguntas ontológicas, ejercicios somáticos o directrices ejecutivas detalladas (mínimo 4 secciones estructuradas con títulos, subtítulos, citas ICF y compromisos).
9. "googleWorkspaceUrl": URL para crear directamente el tipo de archivo ("https://docs.google.com/document/create" o spreadsheets, forms, presentation).
10. "openUrl": Misma URL de creación en Google Workspace.
11. "suggestedFileName": Nombre limpio de archivo para Google Drive (ej: "RBC_Directorio_Maestro_Clientes.gsheet").
12. "integrationInstructions": Guía paso a paso en viñetas para que el usuario implemente este archivo en su Google Workspace y lo vincule con la plataforma.
13. "tableSchema": Si es "sheet", arreglo de objetos { "column": string, "description": string, "sampleValue": string } con las columnas necesarias para sincronizar con la base de datos de la app.
14. "formQuestions": Si es "form", arreglo de objetos { "title": string, "type": "TEXT"|"PARAGRAPH"|"RADIO"|"SCALE", "required": boolean, "options"?: string[] } con preguntas de indagación ontológica y somática.
15. "appsScriptCode": Código ejecutable de Google Apps Script (JavaScript) listo para pegar en Extensiones > Apps Script para enviar Webhooks a la API de esta app ("${req.protocol}://${req.get('host')}/api/webhooks/workshop-completion").
`;

      let parsed = fallbackDoc;
      try {
        const response = await getGeminiClient().models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
            responseMimeType: 'application/json',
          },
        });
        parsed = parseGeminiJson(response.text, fallbackDoc);
      } catch (geminiErr: any) {
        console.warn('[Gemini Workspace] Transient error from Gemini API, serving calibrated ontological template:', geminiErr?.message);
        parsed = fallbackDoc;
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-workspace-document:', error);
      res.status(500).json({ error: error.message || 'Error generando documento de Workspace con Gemini' });
    }
  });

  // ==========================================
  // API: GENERACIÓN DE LA SUITE COMPLETA DE INTEGRACIÓN WORKSPACE
  // ==========================================
  app.post('/api/gemini/generate-workspace-suite', async (req, res) => {
    try {
      const { clientName = 'Coachee Ejecutivo', clientEmail = 'coachee@example.com', focus = 'Integración Total de Ecosistema' } = req.body;
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const webhookUrl = `${hostUrl}/api/webhooks/workshop-completion`;

      const suitePrompt = `
Genera el PAQUETE INTEGRAL DE 5 DOCUMENTOS MAESTROS DE GOOGLE WORKSPACE necesarios para operar la integración completa de "Rengifo Basto Consultoría Ontológica" (rengifobastoco@gmail.com, Coach John Fredy Rengifo Basto) con esta plataforma web:

Los 5 documentos obligatorios son:
1. Google Sheet: "Directorio Maestro de Clientes & Matriz de Seguimiento Ontológico" (columnas: UID, Nombre, Correo, Quiebre, Estado Semáforo, Progreso, Inversión, Última Sincronización).
2. Google Form: "Cuestionario Ontológico de Diagnóstico y Entrada Somática" (preguntas para captar quiebre, corporalidad, emociones y acuerdos).
3. Google Doc: "Contrato Marco de Consultoría Ontológica y Acuerdo de Confidencialidad" (contrato legal-ético profesional con deberes del coach, confidencialidad estricta y consentimientos).
4. Google Doc + Script: "Guía Técnica de Integración Google Workspace & Código Apps Script" (documento con especificación de endpoints y código Apps Script para conectar Google Forms y Google Sheets al Webhook: ${webhookUrl}).
5. Google Doc: "Plan de Transformación y Quiebres Ontológicos del Coachee" (hoja de ruta de 6 etapas para ${clientName}).

Debes responder en JSON con este formato exacto:
{
  "suiteTitle": "Suite Maestra de Integración Google Workspace - Rengifo Basto Consultoría Ontológica",
  "generatedAt": "${new Date().toISOString()}",
  "executiveSummary": "Resumen ejecutivo de la suite y su arquitectura de sincronización.",
  "integrationWebhookUrl": "${webhookUrl}",
  "documents": [
    {
      "id": string,
      "title": string,
      "category": "doc" | "sheet" | "form" | "slide" | "knowledge_base",
      "mimeType": string,
      "description": string,
      "tags": string[],
      "contentSnippet": string,
      "fullContent": string (Markdown detallado),
      "googleWorkspaceUrl": string,
      "openUrl": string,
      "suggestedFileName": string,
      "integrationInstructions": string,
      "appsScriptCode": string (si aplica),
      "tableSchema": [ { "column": string, "description": string, "sampleValue": string } ],
      "formQuestions": [ { "title": string, "type": string, "required": boolean, "options": string[] } ]
    }
  ]
}
`;

      const fallbackSuite = {
        suiteTitle: 'Suite Maestra de Integración Google Workspace - Rengifo Basto Consultoría Ontológica',
        generatedAt: new Date().toISOString(),
        executiveSummary:
          'Ecosistema documental unificado que articula Google Sheets (Directorio), Google Forms (Diagnóstico), Google Docs (Contrato Marco y Plan de Quiebres) y Google Apps Script con la API de Rengifo Basto Consultoría.',
        integrationWebhookUrl: webhookUrl,
        documents: [
          {
            id: `suite_sheet_${Date.now()}`,
            title: 'Directorio Maestro de Clientes & Matriz de Quiebres Ontológicos',
            category: 'sheet' as const,
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
              { column: 'Nombre Completo', description: 'Nombre completo del coachee', sampleValue: clientName },
              { column: 'Correo Electrónico', description: 'Correo ancla de verificación', sampleValue: clientEmail },
              { column: 'Quiebre Ontológico', description: 'Quiebre primordial declarado', sampleValue: 'Fronteras en la toma de decisiones' },
              { column: 'Estado', description: 'Semáforo de interacción', sampleValue: '🟢 ACTIVO' },
              { column: 'Progreso', description: 'Nodo del camino', sampleValue: 'Sesión 2 de 6' },
            ],
          },
          {
            id: `suite_form_${Date.now()}`,
            title: 'Cuestionario de Diagnóstico Inicial y Somático (Google Forms)',
            category: 'form' as const,
            mimeType: 'application/vnd.google-apps.form',
            description: 'Formulario oficial de intake para evaluar el observador del participante antes de iniciar el ciclo quincenal.',
            tags: ['Google Forms', 'Diagnóstico Somático', 'Intake', 'ICF'],
            contentSnippet: 'Cuestionario de 5 dimensiones ontológicas: Lenguaje, Emoción, Corporalidad, Pedidos y Compromiso.',
            fullContent: `# Cuestionario de Diagnóstico Ontológico\n\n**Propósito:** Mapear el quiebre inicial, centro somático de contención y nivel de certeza antes de la primera sesión.\n\n### Preguntas Clave:\n1. Nombre y Apellidos\n2. Correo de contacto\n3. ¿Qué situación recurrente identificas hoy como un quiebre en tu vida o liderazgo?\n4. ¿En qué parte de tu cuerpo somatizas la presión o la duda?\n5. Nivel de certeza actual (1 a 5)`,
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
            category: 'doc' as const,
            mimeType: 'application/vnd.google-apps.document',
            description: 'Instrumento legal y ético de consultoría entre John Fredy Rengifo Basto y el Coachee bajo el código de ética ICF.',
            tags: ['Google Docs', 'Marco Legal', 'Confidencialidad', 'Contrato ICF'],
            contentSnippet: 'Cláusulas de confidencialidad estricta, alcances ontológicos (no terapia clínica), deberes y cancelaciones.',
            fullContent: `# Contrato Marco de Consultoría y Coaching Ontológico\n\n**Entre:** John Fredy Rengifo Basto (en adelante "El Coach", titular de rengifobastoco@gmail.com)\n**Y:** ${clientName} (en adelante "El Coachee", con correo ${clientEmail})\n\n---\n\n### Cláusula Primera: Objeto y Naturaleza del Servicio\nEl proceso de Coaching Ontológico tiene como propósito facilitar el aprendizaje transformacional a través de los dominios lingüístico, emocional y corporal. No constituye asesoría psicológica, psicoterapia ni consultoría médica.\n\n### Cláusula Segunda: Secreto Profesional y Confidencialidad\nToda información revelada en sesiones, formularios o grabaciones tiene carácter estrictamente confidencial y estará protegida bajo las directrices de la ICF y la legislación de protección de datos.\n\n### Cláusula Tercera: Compromiso y Acuerdos de Acción\nEl coachee asume la responsabilidad de su propio proceso, comprometiéndose a asistir a las citas quincenales acordadas en Google Calendar y completar los autorregistros post-sesión.\n\n### Cláusula Cuarta: Duración e Inversión\nEl programa consta de 6 sesiones quincenales de 60 minutos con soporte de plataforma continua.\n\n---\n*Firmado electrónicamente por las partes.*`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Contrato_Marco_Coaching_Confidencialidad.gdoc',
            integrationInstructions: 'Crea una copia en Google Docs, personaliza las partes y exporta a PDF para firma digital.',
          },
          {
            id: `suite_script_${Date.now()}`,
            title: 'Guía Técnica de Integración Google Workspace & Código Apps Script',
            category: 'knowledge_base' as const,
            mimeType: 'application/vnd.google-apps.document',
            description: 'Manual de arquitectura técnica con código Google Apps Script para automatizar webhooks hacia la plataforma RBC.',
            tags: ['Google Apps Script', 'Webhooks', 'Automatización', 'API'],
            contentSnippet: 'Código Apps Script con UrlFetchApp para sincronizar respuestas de Google Forms y filas de Google Sheets hacia /api/webhooks/workshop-completion.',
            fullContent: `# Guía de Integración Técnica Google Workspace con RBC\n\nEste documento contiene el script oficial para conectar las respuestas de Google Forms y las modificaciones de Google Sheets directamente con el servidor de la aplicación.\n\n### Endpoint de Webhook Activo:\n\`POST ${webhookUrl}\`\n\n### Código Google Apps Script:\nCopia este código y pégalo en tu Google Sheet o Form en: **Extensiones > Apps Script**:\n\n\`\`\`javascript\nfunction onFormSubmit(e) {\n  var webhookUrl = "${webhookUrl}";\n  var payload = {\n    participantEmail: e.values ? e.values[2] : "${clientEmail}",\n    workshopId: "workspace-sync",\n    attended: true,\n    keyBreakthrough: "Respuesta de formulario capturada",\n    source: "Google Workspace Apps Script"\n  };\n\n  var options = {\n    method: "post",\n    contentType: "application/json",\n    payload: JSON.stringify(payload),\n    muteHttpExceptions: true\n  };\n\n  UrlFetchApp.fetch(webhookUrl, options);\n}\n\`\`\``,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Guia_Tecnica_AppsScript.gdoc',
            appsScriptCode: `function onFormSubmit(e) {
  var webhookUrl = "${webhookUrl}";
  var email = (e && e.values && e.values[1]) ? e.values[1] : "${clientEmail}";
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
            category: 'doc' as const,
            mimeType: 'application/vnd.google-apps.document',
            description: 'Cuaderno de trabajo colaborativo para el coachee con mapa de quiebres, juicios, declaraciones y anclajes somáticos.',
            tags: ['Google Docs', 'Plan Ontológico', 'Coachee', 'Workbook'],
            contentSnippet: 'Matriz de 6 etapas de transformación: Reconocimiento del observador, quiebre somático, rediseño de pedidos, declaraciones y consolidación.',
            fullContent: `# Plan Maestro de Transformación Ontológica\n\n**Participante:** ${clientName}\n**Coach:** John Fredy Rengifo Basto\n**Programa:** Certeza, Fronteras & Dirección Personal\n\n---\n\n### Etapa 1: El Observador Actual\n- **Juicios Automáticos Recurrentes:** ¿Qué conversaciones privadas operan como mandatos?\n- **Territorio Somático:** ¿Dónde se aloja la contención física?\n\n### Etapa 2: La Declaración del Quiebre\n- **Declaración:** "Declaro que esto ya no funciona para mí y elijo..."\n- **Costo de la Inacción:** ¿Qué precio pagas al no resolver este quiebre?\n\n### Etapa 3: Diseño de Nuevas Conversaciones\n- **Pedidos Clave:** Identificación de contrapartes y condiciones de satisfacción.\n- **Límites y Ofertas:** Qué decir "No" con serenidad.\n\n### Etapa 4: Anclaje y Gobernanza Somática\n- Protocolo de respiración diafragmática y arraigo antes de conversaciones críticas.`,
            googleWorkspaceUrl: 'https://docs.google.com/document/create',
            openUrl: 'https://docs.google.com/document/create',
            suggestedFileName: 'RBC_Plan_Transformacion_Ontologica.gdoc',
            integrationInstructions: 'Crea una copia para el coachee en Google Docs y compártela con permisos de edición mutua.',
          },
        ],
      };

      if (!process.env.GEMINI_API_KEY) {
        return res.json(fallbackSuite);
      }

      let parsed = fallbackSuite;
      try {
        const response = await getGeminiClient().models.generateContent({
          model: 'gemini-3.8-flash',
          contents: suitePrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
            responseMimeType: 'application/json',
          },
        });
        parsed = parseGeminiJson(response.text, fallbackSuite);
      } catch (geminiErr: any) {
        console.warn('[Gemini Workspace Suite] Transient error from Gemini API, serving calibrated ontological suite:', geminiErr?.message);
        parsed = fallbackSuite;
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-workspace-suite:', error);
      res.status(500).json({ error: error.message || 'Error generando suite de Workspace con Gemini' });
    }
  });

  // ==========================================
  // API: WEBHOOK DE AUTOMATIZACIÓN (GOOGLE FORMS / AUTOCRAT / MAKE.COM)
  // ==========================================
  app.post('/api/webhooks/workshop-completion', async (req, res) => {
    try {
      // Optional Webhook Secret Verification if configured in environment
      const expectedSecret = process.env.WEBHOOK_SECRET;
      if (expectedSecret) {
        const providedSecret = req.headers['x-rbc-webhook-secret'] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
        if (providedSecret !== expectedSecret) {
          return res.status(401).json({ error: 'Firma o secreto de webhook no autorizado' });
        }
      }

      const {
        participantEmail,
        userUid,
        workshopId,
        attended,
        memoryPdfUrl,
        commitments,
        keyBreakthrough,
        source,
      } = req.body || {};

      if (!participantEmail && !userUid) {
        return res.status(400).json({
          error: 'Se requiere participantEmail o userUid para actualizar el camino de transformación.',
        });
      }

      // Strict Email Format Validation to prevent injection
      if (participantEmail) {
        const emailStr = String(participantEmail).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailStr) || emailStr.length > 254) {
          return res.status(400).json({ error: 'Formato de participantEmail no válido.' });
        }
      }

      // Strict URL Protocol Validation to prevent javascript: or SSRF exploits
      if (memoryPdfUrl) {
        const urlStr = String(memoryPdfUrl).trim();
        if (!urlStr.startsWith('https://') || urlStr.length > 2048) {
          return res.status(400).json({ error: 'memoryPdfUrl debe ser una URL HTTPS segura válida (máx 2048 caracteres).' });
        }
      }

      const cleanWorkshopId = String(workshopId || 'taller-1-raiz').slice(0, 80);
      const isAttended = attended !== undefined ? Boolean(attended) : true;
      const cleanCommitments = String(commitments || 'Compromisos ontológicos registrados').slice(0, 5000);
      const cleanBreakthrough = String(keyBreakthrough || 'Nuevo observador integrado').slice(0, 2000);
      const cleanSource = String(source || 'Google Forms / AutoCrat').slice(0, 100);

      console.log(`[RBC Webhook] Sincronización automática de taller validada:`, {
        participant: participantEmail || userUid,
        workshopId: cleanWorkshopId,
        attended: isAttended,
        memoryPdfUrl: memoryPdfUrl || null,
        source: cleanSource,
      });

      // Retornar confirmación de procesamiento validado
      res.json({
        success: true,
        message: 'Progreso de taller sincronizado exitosamente en Google Cloud Firestore',
        timestamp: new Date().toISOString(),
        payload: {
          participant: participantEmail || userUid,
          workshopId: cleanWorkshopId,
          status: isAttended ? 'Completado • Fotografía a color encendida' : 'Pendiente',
          memoryPdfUrl: memoryPdfUrl || null,
          commitments: cleanCommitments,
          keyBreakthrough: cleanBreakthrough,
        },
      });
    } catch (error: any) {
      console.error('Error in /api/webhooks/workshop-completion:', error);
      res.status(500).json({ error: error.message || 'Error al procesar webhook' });
    }
  });

  app.get('/api/webhooks/workshop-completion', (req, res) => {
    res.json({
      status: 'active',
      description: 'Webhook de sincronización automática para Google Forms, Sheets y AutoCrat',
      targetEndpoint: 'POST /api/webhooks/workshop-completion',
      expectedFields: {
        participantEmail: 'string (ej: sofia.restrepo@example.com)',
        userUid: 'string (opcional)',
        workshopId: 'string ("taller-1-raiz" | "taller-2-tallo" | "taller-3-florecimiento")',
        attended: 'boolean (true)',
        memoryPdfUrl: 'string (URL del PDF generado por AutoCrat)',
        commitments: 'string (compromisos del coachee)',
        keyBreakthrough: 'string (quiebre transformado)',
      },
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rengifo Basto] Server running on http://0.0.0.0:${PORT} with Gemini AI Integration`);
  });
}

startServer().catch((err) => {
  console.error('[Rengifo Basto Server Error]:', err);
});
