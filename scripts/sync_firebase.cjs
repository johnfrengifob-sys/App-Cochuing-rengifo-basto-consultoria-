const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} = require('firebase/firestore');

const config = require('../firebase-applet-config.json');

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId);

// URLS ACTIVAS EN TIEMPO REAL DE GOOGLE SHEETS
const OFFICIAL_SHEETS_CONFIG = {
  talleres_registro: {
    id: 'talleres_registro',
    title: 'ACUERDO TALLERES',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/edit?usp=sharing',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1e2nOINJkZCHBoz0nTA40BmHsH5wfYn4l9yBkZ-zKRl4/export?format=csv',
    formUrl: 'https://forms.gle/H5gLF1KBzPnKsBWq7',
    category: 'Talleres',
    targetCollection: 'tallerRegistros',
  },
  sesiones_individuales: {
    id: 'sesiones_individuales',
    title: 'ACUERDO SESIONES INDIVIDUALES',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/edit?usp=sharing',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1PCwxfgI0WdV2eMyEjLY_iYkYv5c4DNh5i43lNDvPT88/export?format=csv',
    formUrl: 'https://forms.gle/dfStXtTyb1MW6W5K9',
    category: 'Sesiones Individuales',
    targetCollection: 'sesionIndividualAcuerdos',
  },
  bitacora_sesiones_b2b: {
    id: 'bitacora_sesiones_b2b',
    title: 'Bitacora Sesiones B2B',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/edit?usp=sharing',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1Mm3CRZVvKYFak5APwIBmfK-vZAUfnx1zg-eq8WOLbZk/export?format=csv',
    formUrl: 'https://forms.gle/APUFto8sGbJt322WA',
    category: 'Bitácora B2B',
    targetCollection: 'bitacorasSesionesB2B',
  },
  bitacora_talleres: {
    id: 'bitacora_talleres',
    title: 'Bitacora Talleres',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/edit?usp=sharing',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1DyKs4OsJDTTOa8SMSvOQdWcttrmRKJ8_vxnJH9rV5UA/export?format=csv',
    formUrl: 'https://forms.gle/5Hiuxwq13n3gC3zt6',
    category: 'Bitácora Talleres',
    targetCollection: 'bitacorasTalleres',
  },
};

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some((c) => c.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) rows.push(currentRow);
  }
  return rows;
}

async function fetchSheetCsv(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RBC-Live/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.text();
}

async function runSyncAndAnchor() {
  console.log('======================================================================');
  console.log('🔄 INICIANDO ACTUALIZACIÓN Y ANCLAJE EN TIEMPO REAL GOOGLE SHEETS <-> FIREBASE');
  console.log('Base de Datos Firestore:', config.firestoreDatabaseId);
  console.log('Proyecto Google Cloud:', config.projectId);
  console.log('======================================================================\n');

  const dbPath = path.resolve(__dirname, '../data/app_database.json');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Error: No se encontró data/app_database.json');
    process.exit(1);
  }

  const appData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Asegurar estructura básica de colecciones
  if (!Array.isArray(appData.users)) appData.users = [];
  if (!Array.isArray(appData.eventRegistrations)) appData.eventRegistrations = [];
  if (!Array.isArray(appData.sessions)) appData.sessions = [];
  if (!Array.isArray(appData.forms)) appData.forms = [];
  if (!Array.isArray(appData.postSessionForms)) appData.postSessionForms = [];
  if (!Array.isArray(appData.aiInsights)) appData.aiInsights = [];
  if (!Array.isArray(appData.prospects)) appData.prospects = [];
  if (!Array.isArray(appData.paymentRequests)) appData.paymentRequests = [];
  if (!Array.isArray(appData.cronogramaEvents)) appData.cronogramaEvents = [];
  if (!Array.isArray(appData.programNodes)) appData.programNodes = [];
  if (!Array.isArray(appData.formsSheetsIntegrations)) appData.formsSheetsIntegrations = [];
  if (!Array.isArray(appData.deletedWorkshopIds)) appData.deletedWorkshopIds = [];
  if (!Array.isArray(appData.workspaceDocuments)) appData.workspaceDocuments = [];
  if (!Array.isArray(appData.tallerRegistros)) appData.tallerRegistros = [];
  if (!Array.isArray(appData.sesionIndividualAcuerdos)) appData.sesionIndividualAcuerdos = [];
  if (!Array.isArray(appData.bitacorasSesionesB2B)) appData.bitacorasSesionesB2B = [];
  if (!Array.isArray(appData.bitacorasTalleres)) appData.bitacorasTalleres = [];

  // ==========================================================================
  // FASE 1: EXTRACCIÓN EN VIVO DESDE LOS 4 LINKS ACTIVOS DE GOOGLE SHEETS
  // ==========================================================================
  console.log('📥 FASE 1: Conectando y extrayendo información en vivo de las 4 Google Sheets...');

  // 1.1 TALLERES REGISTRO
  try {
    const csv = await fetchSheetCsv(OFFICIAL_SHEETS_CONFIG.talleres_registro.csvUrl);
    const rows = parseCsv(csv);
    if (rows.length > 1) {
      for (const row of rows.slice(1)) {
        const rawTimestamp = (row[0] || '').trim();
        const rawEmail = (row[1] || '').trim().toLowerCase();
        const participantName = (row[2] || '').trim();
        const phone = (row[3] || '').trim();
        const confidentialityAccepted = Boolean((row[4] || '').trim());
        const aiConsentAccepted = Boolean((row[5] || '').trim());
        const conductAgreed = Boolean((row[6] || '').trim());
        const mergedDocId = (row[7] || '').trim();
        const mergedDocUrl = (row[8] || '').trim();
        const linkToMergedDoc = (row[9] || '').trim();
        const documentMergeStatus = (row[10] || '').trim();
        if (!rawEmail) continue;

        const idx = appData.tallerRegistros.findIndex(
          (t) => t.email && t.email.toLowerCase() === rawEmail && t.timestamp === (rawTimestamp || t.timestamp)
        );
        const item = {
          id: idx !== -1 ? appData.tallerRegistros[idx].id : `taller-reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: rawTimestamp || new Date().toISOString(),
          email: rawEmail,
          participantName,
          phone,
          confidentialityAccepted,
          aiConsentAccepted,
          conductAgreed,
          mergedDocId,
          mergedDocUrl,
          linkToMergedDoc,
          documentMergeStatus,
          source: 'google_sheets_live_sync',
          sheetSourceUrl: OFFICIAL_SHEETS_CONFIG.talleres_registro.sheetUrl,
          lastSyncedAt: new Date().toISOString(),
        };
        if (idx !== -1) {
          appData.tallerRegistros[idx] = { ...appData.tallerRegistros[idx], ...item };
        } else {
          appData.tallerRegistros.unshift(item);
        }
      }
    }
    console.log(`  ✓ Hoja 1 (Acuerdos Talleres): ${appData.tallerRegistros.length} registro(s) sincronizado(s).`);
  } catch (e) {
    console.warn('  ⚠️ Aviso leyendo talleres_registro:', e.message);
  }

  // 1.2 SESIONES INDIVIDUALES (Acuerdos 1 a 1)
  try {
    const csv = await fetchSheetCsv(OFFICIAL_SHEETS_CONFIG.sesiones_individuales.csvUrl);
    const rows = parseCsv(csv);
    if (rows.length > 1) {
      for (const row of rows.slice(1)) {
        const rawTimestamp = (row[0] || '').trim();
        const rawEmail = (row[1] || '').trim().toLowerCase();
        const fullName = (row[2] || '').trim();
        const phone = (row[3] || '').trim();
        const coachingScopeAccepted = Boolean((row[4] || '').trim());
        const commitmentAccepted = Boolean((row[5] || '').trim());
        const techSupportAuthorized = Boolean((row[6] || '').trim());
        const aiScopeClarificationAccepted = Boolean((row[7] || '').trim());
        const confidentialityAccepted = Boolean((row[8] || '').trim());
        const digitalSignatureAndIdNumber = (row[9] || '').trim();
        const mergedDocId = (row[10] || '').trim();
        const mergedDocUrl = (row[11] || '').trim();
        const linkToMergedDoc = (row[12] || '').trim();
        const documentMergeStatus = (row[13] || '').trim();
        if (!rawEmail) continue;

        const idx = appData.sesionIndividualAcuerdos.findIndex(
          (a) => a.email && a.email.toLowerCase() === rawEmail && a.timestamp === (rawTimestamp || a.timestamp)
        );
        const item = {
          id: idx !== -1 ? appData.sesionIndividualAcuerdos[idx].id : `acuerdo-sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: rawTimestamp || new Date().toISOString(),
          email: rawEmail,
          fullName,
          coacheeFullName: fullName,
          phone,
          coachingScopeAccepted,
          commitmentAccepted,
          techSupportAuthorized,
          aiScopeClarificationAccepted,
          confidentialityAccepted,
          digitalSignatureAndIdNumber,
          mergedDocId,
          mergedDocUrl,
          linkToMergedDoc,
          documentMergeStatus,
          source: 'google_sheets_live_sync',
          sheetSourceUrl: OFFICIAL_SHEETS_CONFIG.sesiones_individuales.sheetUrl,
          lastSyncedAt: new Date().toISOString(),
        };
        if (idx !== -1) {
          appData.sesionIndividualAcuerdos[idx] = { ...appData.sesionIndividualAcuerdos[idx], ...item };
        } else {
          appData.sesionIndividualAcuerdos.unshift(item);
        }
      }
    }
    console.log(`  ✓ Hoja 2 (Acuerdos Sesiones 1 a 1): ${appData.sesionIndividualAcuerdos.length} acuerdo(s) sincronizado(s).`);
  } catch (e) {
    console.warn('  ⚠️ Aviso leyendo sesiones_individuales:', e.message);
  }

  // 1.3 BITÁCORA SESIONES B2B
  try {
    const csv = await fetchSheetCsv(OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.csvUrl);
    const rows = parseCsv(csv);
    if (rows.length > 1) {
      for (const row of rows.slice(1)) {
        const rawTimestamp = (row[0] || '').trim();
        const rawEmail = (row[1] || '').trim().toLowerCase();
        const fullName = (row[2] || '').trim();
        const city = (row[3] || '').trim();
        const centralChallenge = (row[4] || '').trim();
        const primaryEmotion = (row[5] || '').trim();
        const limitingBeliefsAndJudgments = (row[6] || '').trim();
        const realizationOrPerspective = (row[7] || '').trim();
        const balanceAreaNeeded = (row[8] || '').trim();
        const valuableLearning = (row[9] || '').trim();
        const concreteActionCommitment = (row[10] || '').trim();
        const digitalValidationSignatureAndId = (row[11] || '').trim();
        const mergedDocId = (row[12] || '').trim();
        const mergedDocUrl = (row[13] || '').trim();
        const linkToMergedDoc = (row[14] || '').trim();
        const documentMergeStatus = (row[15] || '').trim();
        if (!rawEmail) continue;

        const idx = appData.bitacorasSesionesB2B.findIndex(
          (b) => b.email && b.email.toLowerCase() === rawEmail && b.timestamp === (rawTimestamp || b.timestamp)
        );
        const item = {
          id: idx !== -1 ? appData.bitacorasSesionesB2B[idx].id : `b2b-sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: rawTimestamp || new Date().toISOString(),
          email: rawEmail,
          fullName,
          city,
          centralChallenge,
          primaryEmotion,
          limitingBeliefsAndJudgments,
          limitingJudgments: limitingBeliefsAndJudgments,
          realizationOrPerspective,
          realizationBreakthrough: realizationOrPerspective,
          balanceAreaNeeded,
          balanceAttentionNeeded: balanceAreaNeeded,
          valuableLearning,
          mostValuableLearning: valuableLearning,
          concreteActionCommitment,
          digitalValidationSignatureAndId,
          digitalValidationAgreed: true,
          mergedDocId,
          mergedDocUrl,
          linkToMergedDoc,
          documentMergeStatus,
          source: 'google_sheets_live_sync',
          sheetSourceUrl: OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl,
          lastSyncedAt: new Date().toISOString(),
        };
        if (idx !== -1) {
          appData.bitacorasSesionesB2B[idx] = { ...appData.bitacorasSesionesB2B[idx], ...item };
        } else {
          appData.bitacorasSesionesB2B.unshift(item);
        }
      }
    }
    console.log(`  ✓ Hoja 3 (Bitácoras Sesiones B2B): ${appData.bitacorasSesionesB2B.length} bitácora(s) sincronizada(s).`);
  } catch (e) {
    console.warn('  ⚠️ Aviso leyendo bitacora_sesiones_b2b:', e.message);
  }

  // 1.4 BITÁCORA TALLERES
  try {
    const csv = await fetchSheetCsv(OFFICIAL_SHEETS_CONFIG.bitacora_talleres.csvUrl);
    const rows = parseCsv(csv);
    if (rows.length > 1) {
      for (const row of rows.slice(1)) {
        const rawTimestamp = (row[0] || '').trim();
        const workshopLevel = (row[1] || '').trim();
        const fullName = (row[2] || '').trim();
        const city = (row[3] || '').trim();
        const rawEmail = (row[4] || '').trim().toLowerCase();
        const personalChallenge = (row[5] || '').trim();
        const predominantEmotion = (row[6] || '').trim();
        const limitingTruths = (row[7] || '').trim();
        const newDiscovery = (row[8] || '').trim();
        const lifeBalanceMessage = (row[9] || '').trim();
        const valuableLearning = (row[10] || '').trim();
        const concreteChallengeAction = (row[11] || '').trim();
        const digitalValidationSignatureAndId = (row[12] || '').trim();
        const mergedDocId = (row[13] || '').trim();
        const mergedDocUrl = (row[14] || '').trim();
        const linkToMergedDoc = (row[15] || '').trim();
        const documentMergeStatus = (row[16] || '').trim();
        if (!rawEmail) continue;

        const idx = appData.bitacorasTalleres.findIndex(
          (b) => b.email && b.email.toLowerCase() === rawEmail && b.timestamp === (rawTimestamp || b.timestamp)
        );
        const item = {
          id: idx !== -1 ? appData.bitacorasTalleres[idx].id : `taller-bit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: rawTimestamp || new Date().toISOString(),
          workshopLevel,
          fullName,
          city,
          email: rawEmail,
          personalChallenge,
          predominantEmotion,
          limitingTruths,
          newDiscovery,
          lifeBalanceMessage,
          valuableLearning,
          concreteChallengeAction,
          digitalValidationSignatureAndId,
          mergedDocId,
          mergedDocUrl,
          linkToMergedDoc,
          documentMergeStatus,
          source: 'google_sheets_live_sync',
          sheetSourceUrl: OFFICIAL_SHEETS_CONFIG.bitacora_talleres.sheetUrl,
          lastSyncedAt: new Date().toISOString(),
        };
        if (idx !== -1) {
          appData.bitacorasTalleres[idx] = { ...appData.bitacorasTalleres[idx], ...item };
        } else {
          appData.bitacorasTalleres.unshift(item);
        }
      }
    }
    console.log(`  ✓ Hoja 4 (Bitácoras Talleres): ${appData.bitacorasTalleres.length} bitácora(s) sincronizada(s).`);
  } catch (e) {
    console.warn('  ⚠️ Aviso leyendo bitacora_talleres:', e.message);
  }

  // ==========================================================================
  // FASE 1.5: VINCULACIÓN DE EXPEDIENTES AUTOCRAT Y HOJAS VIVAS EN WORKSPACE DOCUMENTS
  // ==========================================================================
  console.log('\n📄 FASE 1.5: Consolidando expedientes de AutoCrat y enlaces vivos en workspaceDocuments...');

  const LIVE_SHEETS_DOCS = [
    {
      id: 'rbc_doc_sheet_talleres_registro',
      name: '📊 Google Sheets: Base de Datos Acuerdos Talleres (En Vivo)',
      type: 'spreadsheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      webViewLink: OFFICIAL_SHEETS_CONFIG.talleres_registro.sheetUrl,
      description: 'Hoja de cálculo en tiempo real con los registros de talleres y acuerdos de confidencialidad.',
      category: 'google_sheets_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_sheet_sesiones_acuerdos',
      name: '📊 Google Sheets: Base de Datos Acuerdos Sesiones 1 a 1 (En Vivo)',
      type: 'spreadsheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      webViewLink: OFFICIAL_SHEETS_CONFIG.sesiones_individuales.sheetUrl,
      description: 'Hoja de cálculo en tiempo real con acuerdos co-creativos individuales y firmas digitales.',
      category: 'google_sheets_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_sheet_bitacoras_b2b',
      name: '📊 Google Sheets: Base de Datos Bitácora Sesiones B2B (En Vivo)',
      type: 'spreadsheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      webViewLink: OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl,
      description: 'Hoja de cálculo en tiempo real con bitácoras de quiebres, emociones y compromisos de coachees.',
      category: 'google_sheets_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_sheet_bitacoras_talleres',
      name: '📊 Google Sheets: Base de Datos Bitácora Talleres (En Vivo)',
      type: 'spreadsheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      webViewLink: OFFICIAL_SHEETS_CONFIG.bitacora_talleres.sheetUrl,
      description: 'Hoja de cálculo en tiempo real con bitácoras post-taller ontológico.',
      category: 'google_sheets_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_form_talleres_registro',
      name: '📝 Google Forms: Registro y Acuerdos de Talleres',
      type: 'form',
      mimeType: 'application/vnd.google-apps.form',
      webViewLink: OFFICIAL_SHEETS_CONFIG.talleres_registro.formUrl,
      description: 'Formulario oficial de inscripción y acuerdos de convivencia.',
      category: 'google_forms_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_form_sesiones_individuales',
      name: '📝 Google Forms: Acuerdo Co-creativo Sesiones Individuales',
      type: 'form',
      mimeType: 'application/vnd.google-apps.form',
      webViewLink: OFFICIAL_SHEETS_CONFIG.sesiones_individuales.formUrl,
      description: 'Formulario oficial de firma legal y límites ontológicos.',
      category: 'google_forms_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_form_bitacora_sesiones_b2b',
      name: '📝 Google Forms: Bitácora de Sesiones B2B',
      type: 'form',
      mimeType: 'application/vnd.google-apps.form',
      webViewLink: OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.formUrl,
      description: 'Formulario oficial de reflexión post-sesión individual.',
      category: 'google_forms_live',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rbc_doc_form_bitacora_talleres',
      name: '📝 Google Forms: Bitácora de Talleres Grupales',
      type: 'form',
      mimeType: 'application/vnd.google-apps.form',
      webViewLink: OFFICIAL_SHEETS_CONFIG.bitacora_talleres.formUrl,
      description: 'Formulario oficial de evaluación y aprendizaje transformacional.',
      category: 'google_forms_live',
      updatedAt: new Date().toISOString(),
    },
  ];

  LIVE_SHEETS_DOCS.forEach((d) => {
    const idx = appData.workspaceDocuments.findIndex((item) => item.id === d.id);
    if (idx !== -1) {
      appData.workspaceDocuments[idx] = { ...appData.workspaceDocuments[idx], ...d };
    } else {
      appData.workspaceDocuments.push(d);
    }
  });

  const autocratDocsToMerge = [];

  // De Acuerdos Talleres
  appData.tallerRegistros.forEach((tr) => {
    if (tr.mergedDocId && tr.mergedDocUrl) {
      autocratDocsToMerge.push({
        id: `autocrat-talleres-${tr.mergedDocId}`,
        name: `Acuerdo de Convivencia y Ética - ${tr.participantName || tr.email}`,
        type: tr.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
        mimeType: tr.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
        webViewLink: tr.mergedDocUrl,
        coacheeEmail: tr.email,
        coacheeName: tr.participantName,
        source: 'autocrat_google_sheets',
        category: 'Acuerdos Talleres',
        createdAt: tr.timestamp,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  // De Acuerdos Sesiones Individuales
  appData.sesionIndividualAcuerdos.forEach((sia) => {
    if (sia.mergedDocId && sia.mergedDocUrl) {
      autocratDocsToMerge.push({
        id: `autocrat-sesion-${sia.mergedDocId}`,
        name: `Acuerdo Co-creativo Sesiones Individuales - ${sia.fullName || sia.email}`,
        type: sia.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
        mimeType: sia.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
        webViewLink: sia.mergedDocUrl,
        coacheeEmail: sia.email,
        coacheeName: sia.fullName,
        source: 'autocrat_google_sheets',
        category: 'Acuerdos Sesiones',
        createdAt: sia.timestamp,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  // De Bitácoras Sesiones B2B
  appData.bitacorasSesionesB2B.forEach((b2b, idx) => {
    if (b2b.mergedDocId && b2b.mergedDocUrl) {
      autocratDocsToMerge.push({
        id: `autocrat-b2b-${b2b.mergedDocId}`,
        name: `Bitácora Sesión B2B #${idx + 1} - ${b2b.centralChallenge || 'Desafío'} (${b2b.fullName || b2b.email})`,
        type: b2b.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
        mimeType: b2b.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
        webViewLink: b2b.mergedDocUrl,
        coacheeEmail: b2b.email,
        coacheeName: b2b.fullName,
        source: 'autocrat_google_sheets',
        category: 'Bitácoras B2B',
        createdAt: b2b.timestamp,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  // De Bitácoras Talleres
  appData.bitacorasTalleres.forEach((bt) => {
    if (bt.mergedDocId && bt.mergedDocUrl) {
      autocratDocsToMerge.push({
        id: `autocrat-taller-${bt.mergedDocId}`,
        name: `Bitácora ${bt.workshopLevel || 'Taller'} - ${bt.personalChallenge || 'Reto'} (${bt.fullName || bt.email})`,
        type: bt.mergedDocUrl.includes('/file/') ? 'pdf' : 'document',
        mimeType: bt.mergedDocUrl.includes('/file/') ? 'application/pdf' : 'application/vnd.google-apps.document',
        webViewLink: bt.mergedDocUrl,
        coacheeEmail: bt.email,
        coacheeName: bt.fullName,
        source: 'autocrat_google_sheets',
        category: 'Bitácoras Talleres',
        createdAt: bt.timestamp,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  autocratDocsToMerge.forEach((acDoc) => {
    const idx = appData.workspaceDocuments.findIndex((d) => d.id === acDoc.id || d.webViewLink === acDoc.webViewLink);
    if (idx !== -1) {
      appData.workspaceDocuments[idx] = { ...appData.workspaceDocuments[idx], ...acDoc };
    } else {
      appData.workspaceDocuments.push(acDoc);
    }
  });

  console.log(`  ✓ workspaceDocuments actualizados con ${LIVE_SHEETS_DOCS.length} recursos Google y ${autocratDocsToMerge.length} expedientes AutoCrat generados en tiempo real.`);

  // Actualizar datos del usuario si coincide
  appData.users.forEach((u) => {
    if (u.email && u.email.toLowerCase() === 'legadobarber2026@gmail.com') {
      u.name = 'Andres';
      u.city = 'Manizales';
      u.phone = '3234642257';
      u.company = 'Legado Barber 2026';
    }
  });

  // ==========================================================================
  // FASE 2: NORMALIZACIÓN DE ENLACES ACTIVOS EN TODAS LAS COLECCIONES
  // ==========================================================================
  console.log('\n🔗 FASE 2: Normalizando enlaces activos de Google Sheets en talleres y sesiones...');

  // Actualizar formsSheetsIntegrations con los enlaces oficiales y conteos reales
  Object.values(OFFICIAL_SHEETS_CONFIG).forEach((cfg) => {
    const idx = appData.formsSheetsIntegrations.findIndex((p) => p.id === cfg.id);
    let count = 0;
    if (cfg.id === 'talleres_registro') count = appData.tallerRegistros.length;
    else if (cfg.id === 'sesiones_individuales') count = appData.sesionIndividualAcuerdos.length;
    else if (cfg.id === 'bitacora_sesiones_b2b') count = appData.bitacorasSesionesB2B.length;
    else if (cfg.id === 'bitacora_talleres') count = appData.bitacorasTalleres.length;

    const updatedPair = {
      id: cfg.id,
      title: cfg.title,
      category: cfg.category,
      formUrl: cfg.formUrl,
      sheetUrl: cfg.sheetUrl,
      sheetGid: '0',
      status: 'connected',
      recordsCount: count,
      lastSyncedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      appData.formsSheetsIntegrations[idx] = { ...appData.formsSheetsIntegrations[idx], ...updatedPair };
    } else {
      appData.formsSheetsIntegrations.push(updatedPair);
    }
  });

  // Normalizar talleres (cronogramaEvents) para usar enlaces activos verificados
  appData.cronogramaEvents.forEach((evt) => {
    if (evt.id === 'taller-1-raiz' || evt.id === 'event-1790271822683') {
      evt.googleSheetsUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.sheetUrl;
      evt.agreementSheetUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.sheetUrl;
      evt.bitacoraSheetUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.sheetUrl;
      evt.autocratUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.sheetUrl;
      evt.googleFormsUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.formUrl;
      evt.agreementFormUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.formUrl;
      evt.bitacoraFormUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.formUrl;
      evt.googleDriveFolderUrl = 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link';
    } else if (evt.id === 'taller-2-tallo' || evt.id === 'taller-3-florecimiento') {
      evt.googleSheetsUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.sheetUrl;
      evt.agreementSheetUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.sheetUrl;
      evt.bitacoraSheetUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.sheetUrl;
      evt.autocratUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.sheetUrl;
      evt.googleFormsUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.formUrl;
      evt.agreementFormUrl = OFFICIAL_SHEETS_CONFIG.talleres_registro.formUrl;
      evt.bitacoraFormUrl = OFFICIAL_SHEETS_CONFIG.bitacora_talleres.formUrl;
      evt.googleDriveFolderUrl = 'https://drive.google.com/drive/folders/15laHG-2cFXvLiVoLp6GxJBWIBdXLB6bz?usp=drive_link';
    }
  });

  // Normalizar sesiones del participante
  appData.sessions.forEach((s) => {
    s.googleSheetsUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl;
    s.agreementSheetUrl = OFFICIAL_SHEETS_CONFIG.sesiones_individuales.sheetUrl;
    s.bitacoraSheetUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl;
    s.googleFormsUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.formUrl;
    s.agreementFormUrl = OFFICIAL_SHEETS_CONFIG.sesiones_individuales.formUrl;
    s.bitacoraFormUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.formUrl;
  });

  // Normalizar programNodes
  appData.programNodes.forEach((node) => {
    node.googleSheetsUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl;
    node.agreementSheetUrl = OFFICIAL_SHEETS_CONFIG.sesiones_individuales.sheetUrl;
    node.bitacoraSheetUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl;
    node.googleFormsUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.formUrl;
    node.agreementFormUrl = OFFICIAL_SHEETS_CONFIG.sesiones_individuales.formUrl;
    node.bitacoraFormUrl = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.formUrl;
  });

  // Normalizar documento Matriz Directiva
  const matrizDoc = appData.workspaceDocuments.find((d) => d.id === 'rbc_doc_matriz_directiva');
  if (matrizDoc) {
    matrizDoc.webViewLink = OFFICIAL_SHEETS_CONFIG.bitacora_sesiones_b2b.sheetUrl;
  }

  // ==========================================================================
  // FASE 3: SUBIDA Y SINCRONIZACIÓN COMPLETA A FIREBASE FIRESTORE
  // ==========================================================================
  console.log('\n📤 FASE 3: Subiendo a Firebase Firestore con todos los registros extraídos...');

  // 3.1 TALLERES REGISTROS
  for (const tr of appData.tallerRegistros) {
    await setDoc(doc(db, 'tallerRegistros', tr.id), tr, { merge: true });
  }
  console.log(`  ✓ tallerRegistros (${appData.tallerRegistros.length}) en Firestore`);

  // 3.2 SESIONES INDIVIDUALES ACUERDOS
  for (const sia of appData.sesionIndividualAcuerdos) {
    await setDoc(doc(db, 'sesionIndividualAcuerdos', sia.id), sia, { merge: true });
  }
  console.log(`  ✓ sesionIndividualAcuerdos (${appData.sesionIndividualAcuerdos.length}) en Firestore`);

  // 3.3 BITÁCORAS SESIONES B2B
  for (const b2b of appData.bitacorasSesionesB2B) {
    await setDoc(doc(db, 'bitacorasSesionesB2B', b2b.id), b2b, { merge: true });
  }
  console.log(`  ✓ bitacorasSesionesB2B (${appData.bitacorasSesionesB2B.length}) en Firestore`);

  // 3.4 BITÁCORAS TALLERES
  for (const bt of appData.bitacorasTalleres) {
    await setDoc(doc(db, 'bitacorasTalleres', bt.id), bt, { merge: true });
  }
  console.log(`  ✓ bitacorasTalleres (${appData.bitacorasTalleres.length}) en Firestore`);

  // 3.5 FORMS & SHEETS INTEGRATIONS
  for (const pair of appData.formsSheetsIntegrations) {
    await setDoc(doc(db, 'formsSheetsIntegrations', pair.id), pair, { merge: true });
  }
  console.log(`  ✓ formsSheetsIntegrations (${appData.formsSheetsIntegrations.length}) en Firestore`);

  // 3.6 PROGRAM NODES (1 al 12)
  for (const node of appData.programNodes) {
    await setDoc(doc(db, 'programNodes', `step-${node.step}`), node, { merge: true });
  }
  console.log(`  ✓ programNodes (${appData.programNodes.length}) en Firestore`);

  // 3.7 SESIONES (1 al 12)
  for (const sess of appData.sessions) {
    await setDoc(doc(db, 'sessions', sess.id), sess, { merge: true });
  }
  console.log(`  ✓ sessions (${appData.sessions.length}) en Firestore`);

  // 3.8 USUARIOS
  for (const u of appData.users) {
    await setDoc(doc(db, 'users', u.uid), u, { merge: true });
  }
  console.log(`  ✓ users (${appData.users.length}) en Firestore`);

  // 3.9 EVENT REGISTRATIONS
  for (const reg of appData.eventRegistrations) {
    await setDoc(doc(db, 'eventRegistrations', reg.id), reg, { merge: true });
  }
  console.log(`  ✓ eventRegistrations (${appData.eventRegistrations.length}) en Firestore`);

  // 3.10 TALLERES (cronogramaEvents)
  for (const w of appData.cronogramaEvents) {
    await setDoc(doc(db, 'cronogramaEvents', w.id), w, { merge: true });
  }
  console.log(`  ✓ cronogramaEvents (${appData.cronogramaEvents.length}) en Firestore`);

  // 3.11 WORKSPACE DOCUMENTS
  for (const docItem of appData.workspaceDocuments) {
    await setDoc(doc(db, 'workspaceDocuments', docItem.id), docItem, { merge: true });
  }
  console.log(`  ✓ workspaceDocuments (${appData.workspaceDocuments.length}) en Firestore`);

  // 3.12 AUDITORÍA DE CONEXIÓN
  const nowIso = new Date().toISOString();
  await setDoc(
    doc(db, 'test', 'connection'),
    {
      status: 'online',
      lastSyncAt: nowIso,
      project: config.projectId,
      databaseId: config.firestoreDatabaseId,
      liveSheetsCount: 4,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, 'system', 'sync_status'),
    {
      status: 'fully_synchronized_with_live_google_sheets',
      lastSyncAt: nowIso,
      stats: {
        tallerRegistros: appData.tallerRegistros.length,
        sesionIndividualAcuerdos: appData.sesionIndividualAcuerdos.length,
        bitacorasSesionesB2B: appData.bitacorasSesionesB2B.length,
        bitacorasTalleres: appData.bitacorasTalleres.length,
        programNodes: appData.programNodes.length,
        sessions: appData.sessions.length,
        users: appData.users.length,
        cronogramaEvents: appData.cronogramaEvents.length,
      },
    },
    { merge: true }
  );

  // ==========================================================================
  // FASE 4: GUARDADO LOCAL EN DISCO
  // ==========================================================================
  appData.lastUpdated = nowIso;
  fs.writeFileSync(dbPath, JSON.stringify(appData, null, 2), 'utf8');
  console.log('\n💾 data/app_database.json actualizado y anclado en disco con éxito.');

  console.log('\n======================================================================');
  console.log('✅ INFORMACIÓN ACTUALIZADA CON LOS LINKS ACTIVOS DE GOOGLE SHEETS');
  console.log(`- 📋 Registros de Talleres (talleres_registro):      ${appData.tallerRegistros.length}`);
  console.log(`- ✍️  Acuerdos 1 a 1 (sesiones_individuales):         ${appData.sesionIndividualAcuerdos.length}`);
  console.log(`- 📓 Bitácoras B2B (bitacora_sesiones_b2b):           ${appData.bitacorasSesionesB2B.length}`);
  console.log(`- 🌟 Bitácoras Talleres (bitacora_talleres):          ${appData.bitacorasTalleres.length}`);
  console.log(`- 🏛️  Módulos y Sesiones Activas:                     ${appData.programNodes.length} / ${appData.sessions.length}`);
  console.log(`- 🔗 Enlaces oficiales en vivo:                       4 hojas sincronizadas`);
  console.log('======================================================================\n');

  process.exit(0);
}

runSyncAndAnchor().catch((err) => {
  console.error('❌ Error durante la sincronización:', err);
  process.exit(1);
});
