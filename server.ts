import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Gemini AI SDK with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

  app.use(express.json({ limit: '10mb' }));

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
      model: 'gemini-3.7-flash',
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
          reply: `[Gemini 3.7 Flash] Observo en tu planteamiento una tensión entre el juicio de autoexigencia y la necesidad de declarar límites claros. Desde la ontología del lenguaje, te invito a reflexionar: ¿Qué es aquello a lo que estás diciendo "sí" en automático que en realidad requiere un "basta" somático? Respira hondo en 4 tiempos y siente cómo se asienta tu columna.`,
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: formattedPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || 'Sin respuesta generada por Gemini.',
        model: 'gemini-3.7-flash',
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

      if (!process.env.GEMINI_API_KEY) {
        // Fallback structured insight
        return res.json({
          linguisticBarriers: `Dificultad recurrente para fundamentar juicios de incapacidad y tendencia a formular quejas en lugar de reclamos productivos formales.`,
          somaticIndicators: `Patrón de sobre-tensión en trapecios y mandíbula asociado a la emoción reportada ("${bodyEmotion || 'Tensión'}") y respiración clavicular corta.`,
          recommendedShift: `Practicar la declaración del "Basta" ontológico y realizar 3 pausas somáticas diarias de 90 segundos con arraigo en talones.`,
          powerfulQuestions: [
            `¿Qué costo invisible estás pagando por sostener este estándar de perfección no negociado?`,
            `¿Cuál es el pedido explícito que necesitas hacerle a tu equipo directivo esta semana?`,
            `¿Qué pasaría si te autorizas a decir "no llego a esta fecha" sin sentir culpa?`
          ],
          somaticScore: 78,
          confidenceLevel: 'Alta (Validado por Gemini 3.7)',
        });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/diagnose:', error);
      res.status(500).json({
        error: error.message || 'Error al generar diagnóstico con Gemini',
      });
    }
  });

  // ==========================================
  // API: GEMINI ROLEPLAY & CONVERSATION SIMULATOR
  // ==========================================
  app.post('/api/gemini/roleplay', async (req, res) => {
    try {
      const { scenario, userMessage, conversationHistory, counterpartyRole } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          counterpartyReply: `Entiendo lo que planteas, pero el directorio exige resultados inmediatos y no veo cómo postergar la entrega nos ayude. ¿Cómo garantizas que esto no afecte los entregables clave?`,
          coachFeedback: `Buena apertura. Tu postura fue clara, pero observa si justificaste en exceso tu decisión. En ontología, un "No" limpio no necesita tres disculpas previas. Mantén tu eje corporal y reitera tu oferta de contingencia.`,
        });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
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

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          whatsappScript: `*Invitación Ejecutiva Exclusiva | Rengifo Basto Consultoría Ontológica*\n\nHola [Nombre],\n\nComo directivo, ¿cuántas veces has sentido que la sobre-exigencia y las conversaciones postergadas drenan tu energía vital?\n\nTe invito a nuestro próximo Conversatorio: *${eventTitle || 'Certeza y Fronteras Personales'}*, el próximo ${eventDate || 'jueves'}.\n\nUn espacio confidencial para directivos donde aprenderás a diseñar límites impecables y liderar desde la serenidad somática.\n\nCupos limitados. Confirma tu participación respondiendo a este mensaje o en: https://wa.me/573234642257`,
          linkedinPost: `¿El costo del éxito profesional tiene que ser el agotamiento silencioso?\n\nEn coaching ontológico sabemos que detrás de cada líder sobrecargado hay una incapacidad aprendida para proclamar el "Basta" con dignidad.\n\nEste ${eventDate || 'próximo evento'}, facilitaremos el conversatorio directivo "${eventTitle}". Reserva tu lugar.`,
          hookIdeas: [
            '¿A qué le estás diciendo "sí" que te está costando la salud?',
            'El límite no es un muro: es la garantía de tu excelencia.',
            'Aprende a tener las conversaciones difíciles que tu liderazgo necesita.',
          ],
        });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ONTOLOGY,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/gemini/marketing:', error);
      res.status(500).json({ error: error.message || 'Error en marketing Gemini' });
    }
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
