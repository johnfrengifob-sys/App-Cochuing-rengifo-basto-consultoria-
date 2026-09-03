/**
 * ============================================================================
 * GCP & FIREBASE TO GOOGLE DRIVE ARCHIVAL PIPELINE
 * Rengifo Basto Consultoría Ontológica
 * ============================================================================
 *
 * Arquitectura de Integración:
 * 1. Cloud Storage: Almacenamiento rápido (hot tier) de cuestionarios PDF recientes.
 * 2. Cloud Firestore: Base de datos no relacional de usuarios, perfiles y metadatos de documentos.
 * 3. Google Drive API (v3): Repositorio organizacional a largo plazo estructurado por carpetas de coachees.
 *
 * Requisitos de IAM en Google Cloud Platform:
 * - Service Account con roles:
 *   - roles/datastore.user (Lectura/Escritura en Firestore)
 *   - roles/storage.objectAdmin (Acceso y gestión de ciclo de vida en Cloud Storage)
 * - Para Google Drive API:
 *   - Habilitar Google Drive API en Google Cloud Console.
 *   - Opción A: Permiso de 'Organizador' en una Carpeta Compartida (Shared Drive) de Google Workspace.
 *   - Opción B: Delegación de autoridad a nivel de dominio (Domain-Wide Delegation) con scopes:
 *     ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
 */

import { initializeApp, cert, getApps, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { google } from 'googleapis';
import { Readable } from 'stream';

// ============================================================================
// 1. TIPOS Y ESTRUCTURAS DE DATOS (SCHEMAS)
// ============================================================================

export type DocumentArchiveStatus =
  | 'STAGED_STORAGE'      // Documento recién subido a Cloud Storage
  | 'ARCHIVING_TO_DRIVE'   // Proceso de transferencia en curso
  | 'ARCHIVED_DRIVE'       // Archivado exitosamente en Google Drive
  | 'ARCHIVAL_FAILED';     // Error en la sincronización

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  organization?: string;
  driveFolderId?: string;       // ID de la carpeta principal del coachee en Drive
  driveQuestionnairesFolderId?: string; // ID de la subcarpeta de cuestionarios
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QuestionnaireDocumentMetadata {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  sessionNumber?: number;
  questionnaireType: 'SOMATIC_ONTOLOGICAL' | 'COACHEE_INTAKE' | 'SESSION_FEEDBACK' | 'CUSTOM';
  
  // Nivel 1: Cloud Storage (Hot Storage)
  storageBucket: string;
  storagePath: string;
  storageDownloadUrl?: string;
  uploadedAt: Timestamp;

  // Nivel 2: Google Drive (Cold / Long-Term Organizational Archive)
  status: DocumentArchiveStatus;
  driveFileId?: string;
  driveFolderId?: string;
  driveWebViewLink?: string;
  driveArchivedAt?: Timestamp;
  driveError?: string;

  // Configuración de retención
  deleteFromStorageAfterArchive?: boolean;
}

// ============================================================================
// 2. CONFIGURACIÓN E INICIALIZACIÓN DE SERVICIOS GCP / FIREBASE
// ============================================================================

export interface ArchivalPipelineConfig {
  projectId: string;
  storageBucketName: string;
  serviceAccountKeyPath?: string;
  delegatedUserEmail?: string; // Email del administrador de Google Workspace (si se usa Domain-Wide Delegation)
  rootDriveFolderId: string;   // ID de la carpeta raíz de la Consultoría en Google Drive
}

export class FirebaseToDriveArchiver {
  private db: ReturnType<typeof getFirestore>;
  private storage: ReturnType<typeof getStorage>;
  private drive: ReturnType<typeof google.drive>;
  private config: ArchivalPipelineConfig;

  constructor(config: ArchivalPipelineConfig) {
    this.config = config;

    // Inicializar Firebase Admin SDK (idempotente)
    if (getApps().length === 0) {
      if (config.serviceAccountKeyPath) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require(config.serviceAccountKeyPath) as ServiceAccount;
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: config.storageBucketName,
          projectId: config.projectId,
        });
      } else {
        // Usa Application Default Credentials (ADC) en Cloud Functions o Cloud Run
        initializeApp({
          storageBucket: config.storageBucketName,
          projectId: config.projectId,
        });
      }
    }

    this.db = getFirestore();
    this.storage = getStorage();

    // Inicializar cliente Google Drive v3 con Service Account / JWT
    const auth = new google.auth.GoogleAuth({
      keyFile: config.serviceAccountKeyPath,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
      clientOptions: config.delegatedUserEmail
        ? { subject: config.delegatedUserEmail }
        : undefined,
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  // ============================================================================
  // FASE 1: INGESTA Y REGISTRO EN CLOUD STORAGE & FIRESTORE
  // ============================================================================

  /**
   * Registra un cuestionario subido a Cloud Storage y crea el documento de seguimiento en Firestore.
   */
  public async registerUploadedQuestionnaire(params: {
    userId: string;
    fileName: string;
    fileBuffer: Buffer;
    contentType?: string;
    sessionNumber?: number;
    questionnaireType?: QuestionnaireDocumentMetadata['questionnaireType'];
  }): Promise<QuestionnaireDocumentMetadata> {
    const {
      userId,
      fileName,
      fileBuffer,
      contentType = 'application/pdf',
      sessionNumber,
      questionnaireType = 'SOMATIC_ONTOLOGICAL',
    } = params;

    // 1. Obtener información del coachee desde Firestore
    const userDocRef = this.db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throw new Error(`[Firestore] Usuario con UID "${userId}" no encontrado.`);
    }

    const userData = userDoc.data() as UserProfile;
    const sanitizedFileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
    const storagePath = `questionnaires/${userId}/${sanitizedFileName}`;

    // 2. Almacenar temporalmente en Google Cloud Storage (Hot Storage)
    const bucket = this.storage.bucket(this.config.storageBucketName);
    const file = bucket.file(storagePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType,
        metadata: {
          uploadedByUserId: userId,
          userName: userData.name,
          userEmail: userData.email,
          sessionNumber: sessionNumber?.toString() || '1',
          questionnaireType,
        },
      },
      resumable: false,
    });

    // 3. Crear documento de metadatos en Firestore
    const questionnaireRef = this.db.collection('questionnaires').doc();
    const metadata: QuestionnaireDocumentMetadata = {
      id: questionnaireRef.id,
      userId,
      userEmail: userData.email,
      userName: userData.name,
      fileName: sanitizedFileName,
      contentType,
      fileSizeBytes: fileBuffer.length,
      sessionNumber,
      questionnaireType,
      storageBucket: this.config.storageBucketName,
      storagePath,
      uploadedAt: Timestamp.now(),
      status: 'STAGED_STORAGE',
      deleteFromStorageAfterArchive: false, // Cambiar a true si se desea liberar espacio en Cloud Storage tras archivar
    };

    await questionnaireRef.set(metadata);
    console.log(`✅ [Storage & Firestore] Cuestionario registrado: ${questionnaireRef.id} (${storagePath})`);

    return metadata;
  }

  // ============================================================================
  // FASE 2: GESTIÓN DE CARPETAS EN GOOGLE DRIVE (JERARQUÍA ORGANIZACIONAL)
  // ============================================================================

  /**
   * Resuelve o crea de forma idempotente la jerarquía de carpetas del coachee en Google Drive:
   * [Carpeta Raíz RBC]
   *   └── Coachees
   *         └── [Nombre del Coachee]
   *               └── Cuestionarios y Evaluaciones
   */
  public async ensureUserDriveFolders(userId: string): Promise<{
    userRootFolderId: string;
    questionnairesFolderId: string;
  }> {
    const userDocRef = this.db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data() as UserProfile;

    // Si ya tiene carpetas registradas en Firestore, validar existencia o reutilizar
    if (userData.driveFolderId && userData.driveQuestionnairesFolderId) {
      return {
        userRootFolderId: userData.driveFolderId,
        questionnairesFolderId: userData.driveQuestionnairesFolderId,
      };
    }

    const folderName = `${userData.name} (${userData.email})`;
    console.log(`📁 [Google Drive] Resolviendo estructura para coachee: ${folderName}`);

    // 1. Buscar o crear carpeta del coachee dentro de la raíz de la consultoría
    const userFolderId = await this.findOrCreateFolder(folderName, this.config.rootDriveFolderId);

    // 2. Crear subcarpeta específica para cuestionarios
    const questionnairesFolderId = await this.findOrCreateFolder('Cuestionarios y Evaluaciones', userFolderId);

    // 3. Persistir IDs en Firestore para acelerar transferencias futuras
    await userDocRef.update({
      driveFolderId: userFolderId,
      driveQuestionnairesFolderId: questionnairesFolderId,
      updatedAt: Timestamp.now(),
    });

    return {
      userRootFolderId: userFolderId,
      questionnairesFolderId,
    };
  }

  /**
   * Busca una carpeta por nombre dentro de un padre específico o la crea si no existe.
   */
  private async findOrCreateFolder(folderName: string, parentFolderId: string): Promise<string> {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${parentFolderId}' in parents and trashed=false`;
    
    const res = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }

    // Crear carpeta
    const createRes = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    return createRes.data.id!;
  }

  // ============================================================================
  // FASE 3: ARCHIVADO (STREAMING DESDE CLOUD STORAGE A GOOGLE DRIVE)
  // ============================================================================

  /**
   * Transfiere el archivo desde Cloud Storage hacia Google Drive en streaming
   * (sin almacenar en memoria ni escribir en disco) y actualiza Firestore.
   */
  public async archiveQuestionnaireToDrive(questionnaireId: string): Promise<{
    driveFileId: string;
    webViewLink: string;
  }> {
    const docRef = this.db.collection('questionnaires').doc(questionnaireId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new Error(`[Firestore] Cuestionario con ID "${questionnaireId}" no encontrado.`);
    }

    const item = snapshot.data() as QuestionnaireDocumentMetadata;

    if (item.status === 'ARCHIVED_DRIVE' && item.driveFileId) {
      console.log(`ℹ️ [Archiver] Cuestionario ${questionnaireId} ya se encuentra archivado en Drive.`);
      return {
        driveFileId: item.driveFileId,
        webViewLink: item.driveWebViewLink || '',
      };
    }

    // Marcar estado en progreso
    await docRef.update({
      status: 'ARCHIVING_TO_DRIVE',
      updatedAt: Timestamp.now(),
    });

    try {
      // 1. Asegurar carpeta de destino en Google Drive
      const { questionnairesFolderId } = await this.ensureUserDriveFolders(item.userId);

      // 2. Obtener stream de lectura desde Cloud Storage
      const bucket = this.storage.bucket(item.storageBucket);
      const file = bucket.file(item.storagePath);
      const [exists] = await file.exists();

      if (!exists) {
        throw new Error(`[Cloud Storage] El objeto "${item.storagePath}" no existe en el bucket "${item.storageBucket}".`);
      }

      const storageReadStream = file.createReadStream();

      // 3. Nombre con formato corporativo para Google Drive
      const sessionTag = item.sessionNumber ? `_Sesion_${item.sessionNumber}` : '';
      const driveFileName = `Cuestionario_${item.questionnaireType}${sessionTag}_${item.userName}.pdf`;

      // 4. Subir por streaming a Google Drive API v3
      console.log(`🚀 [Drive API] Subiendo por stream "${driveFileName}" a carpeta ${questionnairesFolderId}...`);
      const driveResponse = await this.drive.files.create({
        requestBody: {
          name: driveFileName,
          parents: [questionnairesFolderId],
          description: `Cuestionario Ontológico archivado desde Firebase Cloud Storage. Subido por: ${item.userEmail}`,
          properties: {
            firestoreQuestionnaireId: questionnaireId,
            userId: item.userId,
            originalStoragePath: item.storagePath,
          },
        },
        media: {
          mimeType: item.contentType || 'application/pdf',
          body: storageReadStream,
        },
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true,
      });

      const driveFileId = driveResponse.data.id!;
      const webViewLink = driveResponse.data.webViewLink || `https://drive.google.com/file/d/${driveFileId}/view`;

      // 5. Actualizar estado y enlaces en Firestore
      await docRef.update({
        status: 'ARCHIVED_DRIVE',
        driveFileId,
        driveFolderId: questionnairesFolderId,
        driveWebViewLink: webViewLink,
        driveArchivedAt: Timestamp.now(),
        driveError: FieldValue.delete(),
      });

      console.log(`✅ [Google Drive] Archivado con éxito: ${driveFileName} (ID: ${driveFileId})`);

      // 6. Política de retención en Cloud Storage (opcional)
      if (item.deleteFromStorageAfterArchive) {
        await file.delete({ ignoreNotFound: true });
        console.log(`🧹 [Cloud Storage] Objeto temporal eliminado tras archivado: ${item.storagePath}`);
      }

      return { driveFileId, webViewLink };
    } catch (error: any) {
      console.error(`❌ [Archiver Error] Fallo al archivar cuestionario ${questionnaireId}:`, error);

      // Registrar error en Firestore para reintentos posteriores
      await docRef.update({
        status: 'ARCHIVAL_FAILED',
        driveError: error?.message || 'Error desconocido durante la transferencia a Google Drive.',
        failedAt: Timestamp.now(),
      });

      throw error;
    }
  }

  // ============================================================================
  // FASE 4: PROCESADOR BATCH / CRON DE DOCUMENTOS PENDIENTES
  // ============================================================================

  /**
   * Ejecuta el procesamiento de todos los cuestionarios que se encuentren en estado STAGED_STORAGE o ARCHIVAL_FAILED.
   * Ideal para ser ejecutado vía Cloud Scheduler (cron job) cada hora o diario.
   */
  public async processPendingArchives(batchLimit = 25): Promise<{
    processed: number;
    successes: number;
    failures: number;
  }> {
    const snapshot = await this.db
      .collection('questionnaires')
      .where('status', 'in', ['STAGED_STORAGE', 'ARCHIVAL_FAILED'])
      .limit(batchLimit)
      .get();

    console.log(`🔍 [Batch Archiver] Documentos pendientes encontrados: ${snapshot.size}`);

    let successes = 0;
    let failures = 0;

    for (const doc of snapshot.docs) {
      try {
        await this.archiveQuestionnaireToDrive(doc.id);
        successes++;
      } catch (err) {
        failures++;
      }
    }

    return {
      processed: snapshot.size,
      successes,
      failures,
    };
  }
}

// ============================================================================
// 3. EJEMPLO DE USO / RUNNER CLI
// ============================================================================

async function main() {
  // Configuración de entorno
  const config: ArchivalPipelineConfig = {
    projectId: process.env.GCP_PROJECT_ID || 'gen-lang-client-0839558425',
    storageBucketName: process.env.FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0839558425.firebasestorage.app',
    serviceAccountKeyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    delegatedUserEmail: process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL || 'rengifobastoco@gmail.com',
    rootDriveFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || 'root',
  };

  const archiver = new FirebaseToDriveArchiver(config);

  console.log('--- INICIANDO PIPELINE DE ARCHIVADO FIREBASE -> DRIVE ---');
  
  // Procesar cola de cuestionarios pendientes
  const result = await archiver.processPendingArchives(10);
  console.log('--- REPORTE DE EJECUCIÓN ---', result);
}

if (process.env.RUN_ARCHIVER_CLI === 'true') {
  main().catch(console.error);
}
