/**
 * Cloud Functions for Firebase (2nd Gen)
 * Trigger de Eventarc: google.cloud.storage.object.v1.finalized
 *
 * Cada vez que un usuario o la app sube un PDF a Cloud Storage en la ruta:
 * `questionnaires/{userId}/{filename}.pdf`
 * Esta función se dispara automáticamente, transmite el archivo por streaming a Google Drive,
 * crea la estructura de carpetas del coachee y actualiza Firestore en tiempo real.
 */

import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { FirebaseToDriveArchiver } from './firebase-gcs-drive-archiver';
import { getFirestore } from 'firebase-admin/firestore';

export const archiveQuestionnaireOnUpload = onObjectFinalized(
  {
    bucket: process.env.FIREBASE_STORAGE_BUCKET,
    memory: '512MiB',
    timeoutSeconds: 300,
    region: 'us-central1',
  },
  async (event) => {
    const filePath = event.data.name; // e.g. questionnaires/user_123/1739000000_cuestionario.pdf
    const contentType = event.data.contentType;

    // Solo procesar PDFs de la carpeta questionnaires
    if (!filePath.startsWith('questionnaires/') || contentType !== 'application/pdf') {
      console.log(`[Skip] Archivo no objetivo: ${filePath}`);
      return;
    }

    console.log(`⚡ [Eventarc] Nuevo archivo detectado en Storage: ${filePath}`);

    // Instanciar pipeline
    const archiver = new FirebaseToDriveArchiver({
      projectId: process.env.GCP_PROJECT_ID || event.data.bucket,
      storageBucketName: event.data.bucket,
      rootDriveFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || 'root',
      delegatedUserEmail: process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL || 'rengifobastoco@gmail.com',
    });

    const db = getFirestore();

    // Buscar el documento en Firestore por storagePath
    const snapshot = await db
      .collection('questionnaires')
      .where('storagePath', '==', filePath)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn(`⚠️ [Firestore] No se encontró registro para ${filePath}. Creando registro ad-hoc...`);
      // Si la subida fue directa sin metadatos previos, extraer userId del path
      const parts = filePath.split('/');
      const userId = parts[1];

      const newDocRef = await db.collection('questionnaires').add({
        userId,
        fileName: parts[parts.length - 1],
        storageBucket: event.data.bucket,
        storagePath: filePath,
        contentType,
        status: 'STAGED_STORAGE',
        uploadedAt: new Date(),
      });

      await archiver.archiveQuestionnaireToDrive(newDocRef.id);
    } else {
      const docId = snapshot.docs[0].id;
      await archiver.archiveQuestionnaireToDrive(docId);
    }
  }
);
