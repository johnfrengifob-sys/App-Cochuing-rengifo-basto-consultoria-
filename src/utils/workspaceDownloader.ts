import { GeminiGeneratedWorkspaceDoc } from '../types';

/**
 * Downloads arbitrary text content as a file directly in the user's browser.
 */
export const downloadText = (
  filename: string,
  content: string,
  mimeType: string = 'text/plain;charset=utf-8'
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Converts a table schema or structured data into clean CSV text.
 */
export const convertDocToCsv = (doc: GeminiGeneratedWorkspaceDoc): string => {
  if (doc.tableSchema && doc.tableSchema.length > 0) {
    const headers = doc.tableSchema.map((c) => `"${c.column.replace(/"/g, '""')}"`).join(',');
    const sample = doc.tableSchema.map((c) => `"${(c.sampleValue || '').replace(/"/g, '""')}"`).join(',');
    const descriptions = doc.tableSchema.map((c) => `"${(c.description || '').replace(/"/g, '""')}"`).join(',');
    return `${headers}\n${descriptions}\n${sample}\n`;
  }

  // Fallback spreadsheet CSV structure for ontological tracking
  return [
    '"ID Cliente","Nombre Completo","Correo Electrónico","Estado","Quiebre Ontológico","Total Invertido","Progreso (Sesiones)","Observaciones"',
    '"c-001","Sofia Restrepo","sofia.restrepo@example.com","🟢 ACTIVO","Fronteras en toma de decisiones","$1,200 USD","Sesión 2 de 6","Compromiso diafragmático"',
    '"c-002","Carlos Mendoza","carlos.mendoza@example.com","🟡 EN ESPERA","Exceso de control operativo","$1,200 USD","Sesión 4 de 6","Rediseño de pedidos"',
  ].join('\n');
};

/**
 * Formats a Google Form doc into a clean survey structure text file.
 */
export const convertFormToText = (doc: GeminiGeneratedWorkspaceDoc): string => {
  let out = `# ${doc.title.toUpperCase()}\n`;
  out += `Objetivo: ${doc.description}\n`;
  out += `Generado para: Rengifo Basto Consultoría Ontológica (rengifobastoco@gmail.com)\n`;
  out += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n\n`;
  out += `---\n\n`;

  if (doc.formQuestions && doc.formQuestions.length > 0) {
    doc.formQuestions.forEach((q, idx) => {
      out += `PREGUNTA ${idx + 1}: ${q.title}\n`;
      out += `Tipo: ${q.type} ${q.required ? '(Obligatoria)' : '(Opcional)'}\n`;
      if (q.options && q.options.length > 0) {
        out += `Opciones:\n`;
        q.options.forEach((opt) => {
          out += `  [ ] ${opt}\n`;
        });
      }
      out += `\n`;
    });
  } else {
    out += doc.fullContent;
  }

  return out;
};

/**
 * Downloads a single Gemini Workspace Document in the chosen format.
 */
export const downloadDocumentInFormat = (
  doc: GeminiGeneratedWorkspaceDoc,
  format: 'md' | 'txt' | 'csv' | 'gs' | 'json'
): void => {
  const cleanTitle = doc.title
    .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  switch (format) {
    case 'csv': {
      const csvContent = convertDocToCsv(doc);
      downloadText(`${cleanTitle}.csv`, csvContent, 'text/csv;charset=utf-8;');
      break;
    }
    case 'gs': {
      const scriptCode = doc.appsScriptCode || `// Google Apps Script para ${doc.title}\n${doc.fullContent}`;
      downloadText(`${cleanTitle}.gs`, scriptCode, 'application/javascript;charset=utf-8;');
      break;
    }
    case 'json': {
      const jsonContent = JSON.stringify(doc, null, 2);
      downloadText(`${cleanTitle}.json`, jsonContent, 'application/json;charset=utf-8;');
      break;
    }
    case 'txt': {
      let txtContent = doc.fullContent;
      if (doc.category === 'form') {
        txtContent = convertFormToText(doc);
      }
      downloadText(`${cleanTitle}.txt`, txtContent, 'text/plain;charset=utf-8;');
      break;
    }
    case 'md':
    default: {
      const mdContent = `# ${doc.title}\n\n> ${doc.description}\n\n` +
        `**Categoría:** ${doc.category}\n` +
        `**Etiquetas:** ${doc.tags.join(', ')}\n` +
        (doc.contentSnippet ? `**Axioma Clave:** ${doc.contentSnippet}\n\n` : '\n') +
        `---\n\n` +
        doc.fullContent +
        (doc.integrationInstructions ? `\n\n---\n### Instrucciones de Integración Workspace\n${doc.integrationInstructions}\n` : '');

      downloadText(`${cleanTitle}.md`, mdContent, 'text/markdown;charset=utf-8;');
      break;
    }
  }
};

/**
 * Downloads an entire array of documents sequentially with small pauses
 * to prevent browser popup blockers from suppressing multiple downloads.
 */
export const downloadBatchDocuments = async (
  docs: GeminiGeneratedWorkspaceDoc[],
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    onProgress?.(i + 1, docs.length);

    // Pick natural format based on category
    if (doc.category === 'sheet') {
      downloadDocumentInFormat(doc, 'csv');
    } else if (doc.appsScriptCode || doc.category === 'knowledge_base') {
      downloadDocumentInFormat(doc, 'gs');
    } else {
      downloadDocumentInFormat(doc, 'md');
    }

    // Small delay between file triggers
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
};

/**
 * Provides the official baseline catalogue of ready-to-download Rengifo Basto Consultoría documents.
 */
export const getOfficialWorkspaceTemplates = (
  clientName: string = 'Cliente Ejecutivo',
  clientEmail: string = 'coachee@empresa.com'
): GeminiGeneratedWorkspaceDoc[] => {
  const dynamicWebhookUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/api/webhooks/workshop-completion`
      : 'https://ais-dev-nmcd6fpha6b6y4ant7fglm-857201102660.us-east1.run.app/api/webhooks/workshop-completion';

  return [
    {
      id: 'doc_rbc_contract_icf',
      title: 'Contrato Marco de Consultoría Ontológica y Confidencialidad ICF',
      category: 'doc',
      mimeType: 'application/vnd.google-apps.document',
      description: 'Instrumento legal y ético de consultoría entre John Fredy Rengifo Basto y el Coachee bajo el código de ética ICF.',
      tags: ['Google Docs', 'Contrato Marco', 'Confidencialidad', 'Ética ICF'],
      contentSnippet: 'Cláusulas de confidencialidad estricta, alcances ontológicos (no terapia clínica), deberes, cancelaciones y acuerdos de acción.',
      fullContent: `# Contrato Marco de Consultoría y Coaching Ontológico\n\n**Entre:** John Fredy Rengifo Basto (en adelante "El Coach", titular de rengifobastoco@gmail.com)\n**Y:** ${clientName} (en adelante "El Coachee", con correo ${clientEmail})\n\n---\n\n### Cláusula Primera: Objeto y Naturaleza del Servicio\nEl proceso de Coaching Ontológico tiene como propósito facilitar el aprendizaje transformacional a través de los dominios lingüístico, emocional y corporal. No constituye asesoría psicológica, psicoterapia ni consultoría médica.\n\n### Cláusula Segunda: Secreto Profesional y Confidencialidad\nToda información revelada en sesiones, formularios o grabaciones tiene carácter estrictamente confidencial y estará protegida bajo las directrices de la ICF y la legislación de protección de datos.\n\n### Cláusula Tercera: Compromiso y Acuerdos de Acción\nEl coachee asume la responsabilidad de su propio proceso, comprometiéndose a asistir a las citas quincenales acordadas en Google Calendar y completar los autorregistros post-sesión.\n\n### Cláusula Cuarta: Duración e Inversión\nEl programa consta de 6 sesiones quincenales de 60 minutos con soporte de plataforma continua.\n\n---\n*Firmado electrónicamente por las partes.*`,
      googleWorkspaceUrl: 'https://docs.google.com/document/create',
      openUrl: 'https://docs.google.com/document/create',
      suggestedFileName: 'RBC_Contrato_Marco_Coaching_Confidencialidad.gdoc',
      integrationInstructions: '1. Descarga el archivo Markdown o Texto.\n2. Abre Google Docs y pega el contenido.\n3. Personaliza datos del cliente y exporta a PDF para firma digital.',
    },
    {
      id: 'sheet_rbc_matrix_quiebres',
      title: 'Directorio Maestro de Clientes & Matriz de Quiebres Ontológicos',
      category: 'sheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      description: 'Matriz central en Google Sheets para el control de coachees, estado operativo y quiebres primarios sincronizada con la plataforma.',
      tags: ['Google Sheets', 'Directorio', 'Matriz RBC', 'CSV Descargable'],
      contentSnippet: 'Columnas estructuradas para registro automático de coachees, pagos, quiebres ontológicos y avance por nodos.',
      fullContent: `# Directorio Maestro de Clientes RBC\n\n**Hoja de Cálculo:** Google Sheets\n**Cuenta Propietaria:** rengifobastoco@gmail.com\n\n### Columnas Oficiales para Sincronización:\n1. ID Cliente\n2. Nombre y Apellidos\n3. Correo Electrónico\n4. Estado Operativo (🟢 ACTIVO | 🟡 EN ESPERA | ⚪ INACTIVO)\n5. Quiebre Ontológico Principal\n6. Total Invertido\n7. Estado de Pago\n8. Progreso del Programa (Sesión 1 a 6)\n9. Última Sincronización`,
      googleWorkspaceUrl: 'https://docs.google.com/spreadsheets/create',
      openUrl: 'https://docs.google.com/spreadsheets/create',
      suggestedFileName: 'RBC_Directorio_Maestro_Clientes.csv',
      integrationInstructions: '1. Descarga el archivo CSV con un clic.\n2. Ábrelo directamente en Excel o impórtalo en Google Sheets (Archivo > Importar).\n3. Sincronízalo con la base de datos de la app.',
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
      id: 'form_rbc_intake_somatico',
      title: 'Cuestionario de Diagnóstico Inicial y Somático (Google Forms)',
      category: 'form',
      mimeType: 'application/vnd.google-apps.form',
      description: 'Formulario oficial de intake para evaluar el observador del participante antes de iniciar el ciclo quincenal.',
      tags: ['Google Forms', 'Diagnóstico Somático', 'Intake', 'ICF'],
      contentSnippet: 'Cuestionario de 5 dimensiones ontológicas: Lenguaje, Emoción, Corporalidad, Pedidos y Compromiso.',
      fullContent: `# Cuestionario de Diagnóstico Ontológico\n\n**Propósito:** Mapear el quiebre inicial, centro somático de contención y nivel de certeza antes de la primera sesión.\n\n### Preguntas Clave:\n1. Nombre y Apellidos\n2. Correo de contacto\n3. ¿Qué situación recurrente identificas hoy como un quiebre en tu vida o liderazgo?\n4. ¿En qué parte de tu cuerpo somatizas la presión o la duda?\n5. Nivel de certeza actual (1 a 5)`,
      googleWorkspaceUrl: 'https://docs.google.com/forms/create',
      openUrl: 'https://docs.google.com/forms/create',
      suggestedFileName: 'RBC_Cuestionario_Diagnostico_Inicial.txt',
      integrationInstructions: '1. Descarga el archivo con las preguntas estructuradas.\n2. Abre Google Forms y pega cada bloque de pregunta con sus opciones.\n3. Vincula las respuestas con la hoja de Google Sheets.',
      formQuestions: [
        { title: 'Nombre completo del participante', type: 'TEXT', required: true },
        { title: 'Correo electrónico', type: 'TEXT', required: true },
        { title: '¿Cuál es el quiebre o conversación pendiente que deseas transformar?', type: 'PARAGRAPH', required: true },
        { title: 'Centro corporal de mayor presencia emocional', type: 'RADIO', required: true, options: ['Pecho / Diafragma', 'Garganta', 'Hombros / Cervical', 'Estómago'] },
        { title: 'Nivel de certeza para iniciar el proceso (1 a 5)', type: 'SCALE', required: true },
      ],
    },
    {
      id: 'doc_rbc_plan_transformacion',
      title: 'Plan Maestro de Transformación Ontológica y Quiebres',
      category: 'doc',
      mimeType: 'application/vnd.google-apps.document',
      description: 'Cuaderno de trabajo colaborativo para el coachee con mapa de quiebres, juicios, declaraciones y anclajes somáticos.',
      tags: ['Google Docs', 'Plan Ontológico', 'Coachee', 'Workbook'],
      contentSnippet: 'Matriz de 6 etapas de transformación: Reconocimiento del observador, quiebre somático, rediseño de pedidos, declaraciones y consolidación.',
      fullContent: `# Plan Maestro de Transformación Ontológica\n\n**Participante:** ${clientName}\n**Coach:** John Fredy Rengifo Basto\n**Programa:** Certeza, Fronteras & Dirección Personal\n\n---\n\n### Etapa 1: El Observador Actual\n- **Juicios Automáticos Recurrentes:** ¿Qué conversaciones privadas operan como mandatos?\n- **Territorio Somático:** ¿Dónde se aloja la contención física?\n\n### Etapa 2: La Declaración del Quiebre\n- **Declaración:** "Declaro que esto ya no funciona para mí y elijo..."\n- **Costo de la Inacción:** ¿Qué precio pagas al no resolver este quiebre?\n\n### Etapa 3: Diseño de Nuevas Conversaciones\n- **Pedidos Clave:** Identificación de contrapartes y condiciones de satisfacción.\n- **Límites y Ofertas:** Qué decir "No" con serenidad.\n\n### Etapa 4: Anclaje y Gobernanza Somática\n- Protocolo de respiración diafragmática y arraigo antes de conversaciones críticas.`,
      googleWorkspaceUrl: 'https://docs.google.com/document/create',
      openUrl: 'https://docs.google.com/document/create',
      suggestedFileName: 'RBC_Plan_Transformacion_Ontologica.gdoc',
      integrationInstructions: '1. Descarga el Plan en formato Markdown o Texto.\n2. Cópialo a Google Docs y compártelo con permisos de edición para el coachee.',
    },
    {
      id: 'script_rbc_webhook_apps_script',
      title: 'Guía Técnica de Integración Google Workspace & Código Apps Script',
      category: 'knowledge_base',
      mimeType: 'application/vnd.google-apps.script',
      description: 'Código ejecutable de Google Apps Script para sincronizar Google Forms y Sheets directamente con el Webhook de la aplicación.',
      tags: ['Apps Script', 'Webhook API', 'Automatización', 'JavaScript'],
      contentSnippet: 'Script en JavaScript que detecta envíos de Google Forms o ediciones en Google Sheets y despacha una llamada POST segura.',
      fullContent: `/**
 * RENGIFO BASTO CONSULTORÍA ONTOLÓGICA
 * Automatización Google Apps Script -> RBC Webhook
 */
function onFormSubmitOrEdit(e) {
  var targetWebhookUrl = "${dynamicWebhookUrl}";
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
      appsScriptCode: `function onFormSubmitOrEdit(e) {
  var targetWebhookUrl = "${dynamicWebhookUrl}";
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
    Logger.log("Sincronización exitosa: " + response.getContentText());
  } catch (err) {
    Logger.log("Error: " + err);
  }
}`,
      googleWorkspaceUrl: 'https://script.google.com',
      openUrl: 'https://script.google.com',
      suggestedFileName: 'RBC_AppsScript_Webhook.gs',
      integrationInstructions: '1. Descarga el archivo de script .gs con un clic.\n2. Abre tu Hoja o Formulario en Google Workspace > Extensiones > Apps Script.\n3. Pega el código y crea un Activador (Trigger) "Al enviar formulario".',
    },
  ];
};
