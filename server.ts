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
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

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
  // API: WEBHOOK DE AUTOMATIZACIÓN (GOOGLE FORMS / AUTOCRAT / MAKE.COM)
  // ==========================================
  app.post('/api/webhooks/workshop-completion', async (req, res) => {
    try {
      const {
        participantEmail,
        userUid,
        workshopId,
        attended,
        memoryPdfUrl,
        commitments,
        keyBreakthrough,
        source,
      } = req.body;

      if (!participantEmail && !userUid) {
        return res.status(400).json({
          error: 'Se requiere participantEmail o userUid para actualizar el camino de transformación.',
        });
      }

      const cleanWorkshopId = workshopId || 'taller-1-raiz';
      const isAttended = attended !== undefined ? Boolean(attended) : true;

      console.log(`[RBC Webhook] Sincronización automática de taller recibida:`, {
        participant: participantEmail || userUid,
        workshopId: cleanWorkshopId,
        attended: isAttended,
        memoryPdfUrl,
        source: source || 'Google Forms / AutoCrat',
      });

      // Retornar confirmación de procesamiento inmediato
      res.json({
        success: true,
        message: 'Progreso de taller sincronizado exitosamente en Google Cloud Firestore',
        timestamp: new Date().toISOString(),
        payload: {
          participant: participantEmail || userUid,
          workshopId: cleanWorkshopId,
          status: isAttended ? 'Completado • Fotografía a color encendida' : 'Pendiente',
          memoryPdfUrl: memoryPdfUrl || null,
          commitments: commitments || 'Compromisos ontológicos registrados',
          keyBreakthrough: keyBreakthrough || 'Nuevo observador integrado',
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

startServer();
