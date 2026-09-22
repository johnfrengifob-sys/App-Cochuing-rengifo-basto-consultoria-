import { FormsSheetsIntegrationPair, FormsSheetsIntegrationSourceKey } from '../types';

/**
 * ============================================================================
 * BASE DE DATOS MAESTRA OFICIAL: GOOGLE FORMS & GOOGLE SHEETS
 * RENGIFO BASTO CONSULTORÍA (RBC) - CODIGO BASE ANCLADO DE MANERA PERMANENTE
 * ============================================================================
 * Esta definición en código fuente constituye la base oficial de referencia.
 * Puede ser editada en caliente desde la interfaz administrativa o sincronizada
 * con Firebase Firestore, pero siempre conservará esta base como fuente canónica
 * de restablecimiento y anclaje seguro.
 */

export interface OfficialFormsSheetsRecord extends FormsSheetsIntegrationPair {
  readonly isCodeBaseAnchor: true;
  readonly officialDatabaseName: string;
  readonly defaultGid: string;
  readonly autocratFolderUrl?: string;
  readonly driveFolderUrl?: string;
}

export const OFFICIAL_FORMS_SHEETS_BASE_MAP: Record<FormsSheetsIntegrationSourceKey, OfficialFormsSheetsRecord> = {
  // 1. ACUERDO TALLERES
  talleres_registro: {
    id: 'talleres_registro',
    title: 'ACUERDO TALLERES',
    category: 'Talleres',
    moduleTarget: 'workshops',
    formUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
    sheetGid: '0',
    officialDatabaseName: 'Base de datos Acuerdos Talleres Sheets',
    defaultGid: '0',
    isCodeBaseAnchor: true,
    autocratFolderUrl: 'https://drive.google.com/drive/folders/1aG0XqgL0tHw2r9X8Q6Wz',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1aG0XqgL0tHw2r9X8Q6Wz',
    sheetHeaders: [
      'Marca temporal',
      'Dirección de correo electrónico',
      'Nombre del Participante',
      'Teléfono / WhatsApp',
      'Me comprometo a respetar la confidencialidad compartida del grupo (Lo que se habla en el taller, se queda en el taller',
      'Comprendo y acepto el uso de herramientas tecnológicas y de IA como soporte administrativo y de registro del taller.',
      'Autorizo el cumplimiento de los acuerdos de convivencia y los estándares éticos del espacio.',
    ],
    status: 'connected',
    recordsCount: 3,
    notes: 'Base de datos Acuerdos Talleres Sheets: registro oficial, aceptación de confidencialidad compartida de grupo, herramientas tecnológicas/IA y estándares éticos.',
    webhookUrl: '/api/integrations/forms-sheets/ingest/talleres_registro',
  },

  // 2. ACUERDO SESIONES INDIVIDUALES
  sesiones_individuales: {
    id: 'sesiones_individuales',
    title: 'ACUERDO SESIONES INDIVIDUALES',
    category: 'Sesiones Individuales',
    moduleTarget: 'sessions',
    formUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
    sheetGid: '0',
    officialDatabaseName: 'Base de datos acuerdos sesiones B2B Sheets',
    defaultGid: '0',
    isCodeBaseAnchor: true,
    autocratFolderUrl: 'https://drive.google.com/drive/folders/1bH1YrhM1uIx3s0Y9R7Xa',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1bH1YrhM1uIx3s0Y9R7Xa',
    sheetHeaders: [
      'Marca temporal',
      'Dirección de correo electrónico',
      'Nombre completo y Apellidos',
      'Número de contacto / WhatsApp',
      'Comprendo que el coaching no es terapia, mentoría, consultoría ni asesoría, sino un proceso de asociación creativa que busca maximizar mi potencial personal y profesional.',
      'Reconozco que los resultados dependen de mi nivel de compromiso, apertura e implementación de las acciones que co-cree durante las sesiones.',
      'Autorizo el uso de herramientas tecnológicas y sistemas automatizados de apoyo (generación de bitácoras, resúmenes o actas de seguimiento) bajo estricta confidencialidad.',
      'Comprendo y acepto que ninguna decisión del proceso de coaching, análisis reflexivo profundo o intervención de valor es generada o sustitida por Inteligencia Artificial; la IA se limita exclusivamente a funciones de soporte administrativo, transcripción o gestión documental.',
      'Entiendo que la información compartida es estrictamente confidencial entre el coach y el participante. Las únicas excepciones aplican bajo riesgo inminente para la vida del participante o de terceros, o por mandato legal explícito',
      'Para validar digitalmente este acuerdo, escribe tu Nombre Completo y Número de Documento de Identidad, lo cual equivaldrá a tu firma legal y aceptación de los términos aquí expuestos.',
      'Merged Doc ID - Acuerdo Co-creativo de Trabajo Sesiones',
      'Merged Doc URL - Acuerdo Co-creativo de Trabajo Sesiones',
      'Link to merged Doc - Acuerdo Co-creativo de Trabajo Sesiones',
      'Document Merge Status - Acuerdo Co-creativo de Trabajo Sesiones',
    ],
    status: 'connected',
    recordsCount: 2,
    notes: 'Base de datos acuerdos sesiones B2B Sheets: acuerdo co-creativo legal, firma digital con documento de identidad, límites de IA y estado del documento combinado.',
    webhookUrl: '/api/integrations/forms-sheets/ingest/sesiones_individuales',
  },

  // 3. BITÁCORA SESIONES B2B
  bitacora_sesiones_b2b: {
    id: 'bitacora_sesiones_b2b',
    title: 'Bitacora Sesiones B2B',
    category: 'Bitácora B2B',
    moduleTarget: 'sessions',
    formUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    sheetGid: '0',
    officialDatabaseName: 'Base de datos bitácoras sesiones B2B Sheets',
    defaultGid: '0',
    isCodeBaseAnchor: true,
    autocratFolderUrl: 'https://drive.google.com/drive/folders/1cI2ZsiN2vJy4t1Z0S8Yb',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1cI2ZsiN2vJy4t1Z0S8Yb',
    sheetHeaders: [
      'Marca temporal',
      'Dirección de correo electrónico',
      'Cuál es tu Nombre completo',
      'Ciudad',
      '¿Cuál es el desafío, situación o tema central que eliges trabajar en nuestra sesión de hoy?',
      '¿Qué emoción principal estuvo presente al abordar este tema y qué mensaje sientes que te traía? ',
      '¿Qué ideas, juicios o historias repetitivas sobre ti o sobre esta situación descubriste que te están limitando? ',
      '¿Qué "darse cuenta" (descubrimiento o nueva perspectiva) te llevas de ti mismo tras esta conversación? ',
      'Si miras este proceso como un llamado a encontrar equilibrio, ¿qué parte de ti o de tu entorno necesita mayor atención hoy? ',
      '¿Cuál es el aprendizaje más valioso que te regalas al finalizar este espacio? ',
      '¿Qué acción concreta, alineada con tus compromisos, te llevarás para realizar antes de nuestra próxima sesión? ',
      'Para validar que podemos utilizar esta information para hacer un registro detallado de tu progreso, escribe tu Nombre Completo y Número de Documento de Identidad, lo cual equivaldrá a tu firma legal y aceptación de los términos aquí expuestos.',
    ],
    status: 'connected',
    recordsCount: 2,
    notes: 'Base de datos bitácoras sesiones B2B Sheets: quiebre directivo, emoción presente, juicios limitantes, darse cuenta, equilibrio y compromisos de acción.',
    webhookUrl: '/api/integrations/forms-sheets/ingest/bitacora_sesiones_b2b',
  },

  // 4. BITÁCORA TALLERES
  bitacora_talleres: {
    id: 'bitacora_talleres',
    title: 'Bitacora Talleres',
    category: 'Bitácora Talleres',
    moduleTarget: 'workshops',
    formUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
    sheetGid: '0',
    officialDatabaseName: 'Base de datos bitácoras talleres Sheets',
    defaultGid: '0',
    isCodeBaseAnchor: true,
    autocratFolderUrl: 'https://drive.google.com/drive/folders/1dJ3AtjO3wKz5u2a1T9Zc',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1dJ3AtjO3wKz5u2a1T9Zc',
    sheetHeaders: [
      'Marca temporal',
      'Nivel Taller ',
      'Tu Nombre',
      'Ciudad ',
      'Dirección de correo electrónico',
      '¿Qué tema, situación o reto personal quieres poner sobre la mesa en este espacio?',
      '¿Qué emoción predominante traes al espacio y qué te está diciendo?',
      '¿Qué ideas o "verdades" sobre ti o sobre esta situación te estás repitiendo con más fuerza?',
      '¿Qué nueva perspectiva o "descubrimiento" te llevas de ti mismo tras esta exploración?',
      'Si esta situación fuera un mensaje sobre lo que necesitas equilibrar en tu vida, ¿cuál dirías que es?',
      '¿Cuál es el aprendizaje más valioso que te regalas de este espacio?',
      '¿Qué acción concreta, sencilla pero retadora, te comprometes a realizar antes de nuestro próximo encuentro?',
      'Para validar digitalmente la lectura de esta information por nuestro equipo, escribe tu Nombre Completo y Número de Documento de Identidad, lo cual equivaldrá a tu firma legal y aceptación de los términos aquí expuestos.',
    ],
    status: 'connected',
    recordsCount: 2,
    notes: 'Base de datos bitácoras talleres Sheets: nivel del taller, reto personal, emoción predominante, verdades limitantes, nueva perspectiva, equilibrio y reto transformacional.',
    webhookUrl: '/api/integrations/forms-sheets/ingest/bitacora_talleres',
  },
};

/**
 * Lista de los 4 pares canónicos para iteraciones o sembrado inicial.
 */
export const OFFICIAL_FORMS_SHEETS_BASE_LIST: OfficialFormsSheetsRecord[] = [
  OFFICIAL_FORMS_SHEETS_BASE_MAP.talleres_registro,
  OFFICIAL_FORMS_SHEETS_BASE_MAP.sesiones_individuales,
  OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_sesiones_b2b,
  OFFICIAL_FORMS_SHEETS_BASE_MAP.bitacora_talleres,
];

/**
 * Obtiene la configuración base anclada en código de un recurso específico.
 */
export function getOfficialFormsSheetsBase(sourceKey: FormsSheetsIntegrationSourceKey): OfficialFormsSheetsRecord {
  return OFFICIAL_FORMS_SHEETS_BASE_MAP[sourceKey];
}

/**
 * Determina si un par configurado actualmente difiere de la base en código fuente.
 */
export function isPairModifiedFromCodeBase(current: FormsSheetsIntegrationPair): boolean {
  const base = OFFICIAL_FORMS_SHEETS_BASE_MAP[current.id];
  if (!base) return false;
  return (
    current.formUrl.trim() !== base.formUrl.trim() ||
    current.sheetUrl.trim() !== base.sheetUrl.trim() ||
    current.title.trim() !== base.title.trim()
  );
}

/**
 * Determina si la lista de integraciones tiene alguna diferencia con la base en código.
 */
export function isIntegrationListModifiedFromCodeBase(currentList: FormsSheetsIntegrationPair[]): boolean {
  return currentList.some((pair) => isPairModifiedFromCodeBase(pair));
}
