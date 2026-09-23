import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Read config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const firebaseConfig = {
  apiKey: rawConfig.apiKey,
  authDomain: rawConfig.authDomain,
  projectId: rawConfig.projectId,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
  appId: rawConfig.appId,
};

const app = initializeApp(firebaseConfig);
const db = rawConfig.firestoreDatabaseId
  ? getFirestore(app, rawConfig.firestoreDatabaseId)
  : getFirestore(app);

// Read app database
const dbFilePath = path.join(process.cwd(), 'data', 'app_database.json');
const localDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

// Read default 12 program nodes
const defaultNodesPath = path.join(process.cwd(), 'scripts', 'default-nodes.json');
const defaultNodes = JSON.parse(fs.readFileSync(defaultNodesPath, 'utf-8'));

async function syncAllToFirestore() {
  console.log(`Starting Firestore sync to database: ${rawConfig.firestoreDatabaseId || '(default)'} in project: ${rawConfig.projectId}...`);

  // Ensure programNodes has the full 12 steps
  let programNodes = localDb.programNodes || [];
  if (programNodes.length < 12) {
    const existingMap = new Map(programNodes.map((n: any) => [n.step, n]));
    const mergedNodes = defaultNodes.map((defNode: any) => {
      const existing = existingMap.get(defNode.step);
      return existing ? { ...defNode, ...existing } : defNode;
    });
    programNodes = mergedNodes;
    localDb.programNodes = mergedNodes;
    fs.writeFileSync(dbFilePath, JSON.stringify(localDb, null, 2), 'utf-8');
    console.log(`[db] Sincronizados los 12 módulos en data/app_database.json.`);
  }

  // 1. Sincronizar Usuarios Activos (users)
  console.log('\n--- 1. Sincronizando Usuarios Activos (users) ---');
  const users = localDb.users || [];
  const uSnap = await getDocs(collection(db, 'users'));
  const currentUids = new Set(users.map((u: any) => String(u.uid)));
  for (const docSnap of uSnap.docs) {
    if (!currentUids.has(docSnap.id)) {
      await deleteDoc(docSnap.ref);
      console.log(`[users] Eliminado usuario obsoleto: ${docSnap.id}`);
    }
  }
  for (const user of users) {
    const userRef = doc(db, 'users', String(user.uid));
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[users] Guardado usuario: ${user.name} (${user.email}) - Rol: ${user.role}`);
  }

  // 2. Sincronizar Nodos de Programa (programNodes) - 1 al 12
  console.log('\n--- 2. Sincronizando Nodos de Programa (programNodes) ---');
  const pSnap = await getDocs(collection(db, 'programNodes'));
  const currentStepIds = new Set(programNodes.map((n: any) => String(n.step)));
  for (const docSnap of pSnap.docs) {
    if (!currentStepIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref);
      console.log(`[programNodes] Eliminado nodo obsoleto: ${docSnap.id}`);
    }
  }
  for (const node of programNodes) {
    const nodeRef = doc(db, 'programNodes', String(node.step));
    await setDoc(nodeRef, {
      ...node,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[programNodes] Guardado Módulo ${node.step}: ${node.sessionTitle} (${node.level})`);
  }

  // 3. Sincronizar Sesiones Individuales Activas (sessions)
  console.log('\n--- 3. Sincronizando Sesiones de Coachees Vigentes (sessions) ---');
  const sessions = localDb.sessions || [];
  const sSnap = await getDocs(collection(db, 'sessions'));
  const currentSessionIds = new Set(sessions.map((s: any) => String(s.id)));
  for (const docSnap of sSnap.docs) {
    if (!currentSessionIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref);
      console.log(`[sessions] Eliminada sesión obsoleta: ${docSnap.id}`);
    }
  }
  for (const s of sessions) {
    const sRef = doc(db, 'sessions', String(s.id));
    await setDoc(sRef, {
      ...s,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[sessions] Guardada Sesión ${s.sessionNumber || ''}: ${s.title}`);
  }

  // 4. Sincronizar Talleres y Eventos del Cronograma (cronogramaEvents)
  console.log('\n--- 4. Sincronizando Cronograma de Talleres (cronogramaEvents) ---');
  const workshops = localDb.cronogramaEvents || [];
  const wSnap = await getDocs(collection(db, 'cronogramaEvents'));
  const currentWorkshopIds = new Set(workshops.map((w: any) => String(w.id)));
  for (const docSnap of wSnap.docs) {
    if (!currentWorkshopIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref);
      console.log(`[cronogramaEvents] Eliminado evento obsoleto: ${docSnap.id}`);
    }
  }
  for (const w of workshops) {
    const wRef = doc(db, 'cronogramaEvents', String(w.id));
    await setDoc(wRef, {
      ...w,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[cronogramaEvents] Guardado Evento: ${w.title}`);
  }

  // 5. Sincronizar Integraciones Google Forms & Sheets (formsSheetsIntegrations)
  console.log('\n--- 5. Sincronizando Integraciones Google Forms & Sheets ---');
  const integrations = localDb.formsSheetsIntegrations || [];
  const iSnap = await getDocs(collection(db, 'formsSheetsIntegrations'));
  const currentIntIds = new Set(integrations.map((i: any) => String(i.id)));
  for (const docSnap of iSnap.docs) {
    if (!currentIntIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref);
      console.log(`[formsSheetsIntegrations] Eliminada integración obsoleta: ${docSnap.id}`);
    }
  }
  for (const item of integrations) {
    const iRef = doc(db, 'formsSheetsIntegrations', String(item.id));
    await setDoc(iRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[formsSheetsIntegrations] Guardada integración: ${item.title}`);
  }

  // 6. Sincronizar Pre-Registros de Eventos Vigentes (eventRegistrations)
  console.log('\n--- 6. Sincronizando Registros de Eventos (eventRegistrations) ---');
  const registrations = localDb.eventRegistrations || [];
  const rSnap = await getDocs(collection(db, 'eventRegistrations'));
  const currentRegIds = new Set(registrations.map((r: any) => String(r.id)));
  for (const docSnap of rSnap.docs) {
    if (!currentRegIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref);
      console.log(`[eventRegistrations] Eliminado registro obsoleto: ${docSnap.id}`);
    }
  }
  for (const reg of registrations) {
    const rRef = doc(db, 'eventRegistrations', String(reg.id));
    await setDoc(rRef, {
      ...reg,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[eventRegistrations] Guardado ticket: ${reg.id} (${reg.participantEmail})`);
  }

  // 7. Status doc
  const testRef = doc(db, 'test', 'status');
  await setDoc(testRef, {
    status: 'fully_synchronized',
    lastSync: new Date().toISOString(),
    project: rawConfig.projectId,
    syncedCollections: [
      'users',
      'programNodes',
      'sessions',
      'cronogramaEvents',
      'formsSheetsIntegrations',
      'eventRegistrations'
    ]
  });

  console.log('\n======================================================');
  console.log('✅ BASE DE DATOS DE FIREBASE ACTUALIZADA COMPLETAMENTE');
  console.log('   - Usuarios activos: ' + users.length);
  console.log('   - Módulos de Sesiones (1 al 12): ' + programNodes.length);
  console.log('   - Sesiones Programadas Coachee: ' + sessions.length);
  console.log('   - Eventos/Talleres Vigentes: ' + workshops.length);
  console.log('   - Integraciones Google Forms/Sheets: ' + integrations.length);
  console.log('   - Registros Oficiales de Eventos: ' + registrations.length);
  console.log('======================================================\n');
  process.exit(0);
}

syncAllToFirestore().catch((err) => {
  console.error('Error durante la sincronización a Firestore:', err);
  process.exit(1);
});
