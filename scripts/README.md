# Pipeline de Integración GCP: Firebase Storage + Firestore + Google Drive API

Este módulo implementa una arquitectura híbrida de dos niveles (**Two-Tier Storage Strategy**) para **Rengifo Basto Consultoría Ontológica**:

1. **Nivel Caliente / Reciente (Cloud Storage & Firestore)**:
   - Los cuestionarios PDF subidos por coachees o coaches se alojan de forma inmediata en Firebase Cloud Storage (`gs://.../questionnaires/{userId}/...`).
   - Firestore gestiona el estado transicional (`STAGED_STORAGE` ➔ `ARCHIVING_TO_DRIVE` ➔ `ARCHIVED_DRIVE`), metadatos de usuario y enlaces de acceso.
2. **Nivel Frío / Historial Organizacional (Google Drive API v3)**:
   - Transmisión en streaming directo (Memory-Safe Readable Stream) hacia Google Drive.
   - Creación automática e idempotente de carpetas por coachee:
     `Rengifo Basto Consultoría / Coachees / [Nombre Coachee] / Cuestionarios y Evaluaciones /`.
   - Registro de `driveFileId` y `driveWebViewLink` en el perfil del usuario en Firestore.

---

## 🛠️ Requisitos de Google Cloud Platform (IAM)

1. **Service Account**:
   - Asignar roles en GCP Console:
     - `roles/datastore.user` (Cloud Datastore / Firestore User)
     - `roles/storage.objectAdmin` (Storage Object Admin)
2. **Habilitación de Google Drive API**:
   - Activar **Google Drive API** en el proyecto GCP (`gen-lang-client-0839558425`).
3. **Autenticación con Google Drive / Workspace**:
   - **Opción A (Recomendada para Shared Drive / Google Workspace)**:
     Crear una Carpeta Compartida en Drive y añadir el correo de la Service Account (`...-compute@developer.gserviceaccount.com` o custom) con rol de **Organizador de Contenido**.
   - **Opción B (Domain-Wide Delegation)**:
     Configurar delegación en Google Workspace Admin Console autorizando los scopes:
     - `https://www.googleapis.com/auth/drive`
     - `https://www.googleapis.com/auth/drive.file`

---

## 🚀 Modos de Ejecución

### 1. Script Independiente / Cron Job
```bash
cd scripts
npm install
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
export GOOGLE_DRIVE_ROOT_FOLDER_ID="ID_CARPETA_RAIZ_DRIVE"
export FIREBASE_STORAGE_BUCKET="gen-lang-client-0839558425.firebasestorage.app"
export RUN_ARCHIVER_CLI="true"

npm run archive:cron
```

### 2. Event-Driven Cloud Function (2nd Gen)
El archivo `cloud-function-drive-archiver.ts` implementa el trigger `onObjectFinalized` de Cloud Storage para archivar automáticamente en Google Drive tan pronto como se completa la subida del PDF.
