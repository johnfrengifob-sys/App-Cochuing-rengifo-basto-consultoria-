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
  writeBatch
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

async function runSync() {
  console.log('--- INICIANDO ACTUALIZACIÓN COMPLETA DE FIREBASE FIRESTORE ---');
  console.log('Base de Datos:', config.firestoreDatabaseId);
  console.log('Proyecto:', config.projectId);

  const dbPath = path.resolve(__dirname, '../data/app_database.json');
  if (!fs.existsSync(dbPath)) {
    console.error('No se encontró data/app_database.json');
    process.exit(1);
  }

  const appData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. ACTUALIZAR PROGRAM NODES (12 Módulos Formativos Estándar)
  console.log('\n1. Actualizando coleccion `programNodes` en Firestore...');
  const nodes = appData.programNodes || [];
  let nodesCount = 0;
  for (const node of nodes) {
    const docId = `step-${node.step}`;
    await setDoc(doc(db, 'programNodes', docId), {
      ...node,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    nodesCount++;
    console.log(`  ✓ Nodo ${node.step} sincronizado: "${node.sessionTitle}"`);
  }

  // 2. ACTUALIZAR SESIONES (12 Sesiones Estándar)
  console.log('\n2. Actualizando coleccion `sessions` en Firestore...');
  const sessions = appData.sessions || [];
  let sessionsCount = 0;
  for (const sess of sessions) {
    await setDoc(doc(db, 'sessions', sess.id), {
      ...sess,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    sessionsCount++;
    console.log(`  ✓ Sesión #${sess.sessionNumber} sincronizada: "${sess.title}"`);
  }

  // 3. ACTUALIZAR USUARIOS
  console.log('\n3. Actualizando coleccion `users` en Firestore...');
  const users = appData.users || [];
  let usersCount = 0;
  for (const u of users) {
    await setDoc(doc(db, 'users', u.uid), {
      ...u,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    usersCount++;
    console.log(`  ✓ Usuario sincronizado: ${u.email} (${u.role})`);
  }

  // 4. ACTUALIZAR CONFIGURACIÓN DE NIVELES (levelConfigs)
  console.log('\n4. Actualizando coleccion `levelConfigs` en Firestore...');
  const levelConfigs = appData.levelConfigs || {};
  for (const [levelKey, cfg] of Object.entries(levelConfigs)) {
    await setDoc(doc(db, 'levelConfigs', levelKey), {
      ...cfg,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`  ✓ Configuración de nivel sincronizada: ${levelKey}`);
  }

  // 5. ACTUALIZAR INTEGRACIONES FORMS Y SHEETS
  console.log('\n5. Actualizando coleccion `formsSheetsIntegrations` en Firestore...');
  const integrations = appData.formsSheetsIntegrations || [];
  for (const pair of integrations) {
    const docId = pair.sourceKey || pair.id || `pair-${Math.random().toString(36).substring(2, 8)}`;
    await setDoc(doc(db, 'formsSheetsIntegrations', docId), {
      ...pair,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`  ✓ Integración Forms/Sheets sincronizada: ${pair.title}`);
  }

  // 6. ACTUALIZAR CRONOGRAMA DE EVENTOS Y TALLERES
  console.log('\n6. Actualizando coleccion `cronogramaEvents` en Firestore...');
  const workshops = appData.cronogramaEvents || [];
  for (const w of workshops) {
    if (!w.id) continue;
    await setDoc(doc(db, 'cronogramaEvents', w.id), {
      ...w,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
  console.log(`  ✓ ${workshops.length} eventos del cronograma sincronizados.`);

  console.log('\n======================================================');
  console.log('✅ ACTUALIZACIÓN EXITOSA EN GOOGLE FIREBASE FIRESTORE');
  console.log(`- Módulos (programNodes): ${nodesCount}`);
  console.log(`- Sesiones (sessions): ${sessionsCount}`);
  console.log(`- Usuarios (users): ${usersCount}`);
  console.log(`- Base de datos: ${config.firestoreDatabaseId}`);
  console.log('======================================================');

  process.exit(0);
}

runSync().catch((err) => {
  console.error('Error durante la sincronización con Firestore:', err);
  process.exit(1);
});
