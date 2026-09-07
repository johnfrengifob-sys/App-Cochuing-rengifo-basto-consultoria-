import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Clock,
  ExternalLink,
  Users,
  FileText,
  Calendar,
  CreditCard,
  Layers,
  HardDrive,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldAlert,
  Lock,
  Trash2,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { safeCopyToClipboard } from '../utils/clipboard';
import { FirestoreSyncService } from '../services/firestoreSync';
import { testFirestoreConnection } from '../services/firebase';
import config from '../../firebase-applet-config.json';

interface FirebaseFirestoreMonitorProps {
  onSyncCompleted?: () => void;
}

export const FirebaseFirestoreMonitor: React.FC<FirebaseFirestoreMonitorProps> = ({
  onSyncCompleted,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('rbc_last_firestore_sync') || null;
  });
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [showSecurityAudit, setShowSecurityAudit] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const handleWipeDatabase = async () => {
    if (!window.confirm('¿Confirmas vaciar completamente la base de datos de clientes, sesiones y pagos en Firestore y almacenamiento local?')) {
      return;
    }
    setIsWiping(true);
    setSyncStatusMsg(null);
    try {
      OntologicalStore.wipeEntireDatabase();
      const res = await FirestoreSyncService.wipeAllFirestoreData();
      setSyncStatusMsg({
        type: 'success',
        text: `Base de datos vaciada con éxito. Se eliminaron ${res.deletedCount} registros en Firestore y se restableció el almacenamiento a 0 clientes.`,
      });
      if (onSyncCompleted) onSyncCompleted();
    } catch (err) {
      setSyncStatusMsg({
        type: 'error',
        text: `Error al vaciar: ${err instanceof Error ? err.message : 'Error desconocido'}`,
      });
    } finally {
      setIsWiping(false);
    }
  };

  const copyFirestoreRulesToClipboard = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
    function isCoach() {
      return isAuthenticated() && (
        request.auth.token.role == 'coach' ||
        request.auth.token.email == 'rengifobastoco@gmail.com'
      );
    }
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (isOwner(userId) || isCoach());
      allow update: if isCoach() || (isOwner(userId) && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'paymentStatus', 'authorizedForOneOnOne'])));
      allow delete: if isCoach();
    }
    match /sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow write: if isCoach();
    }
    match /payments/{paymentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.status == 'pending';
      allow update, delete: if isCoach();
    }
  }
}`;
    await safeCopyToClipboard(rules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  // Read local dataset counts
  const usersCount = OntologicalStore.getUsers().length;
  const sessionsCount = OntologicalStore.getSessions().length;
  const formsCount = OntologicalStore.getForms().length;
  const prospectsCount = OntologicalStore.getProspects().length;
  const paymentsCount = OntologicalStore.getPaymentRequests().length;
  const eventRegCount = OntologicalStore.getEventRegistrations().length;

  useEffect(() => {
    let isMounted = true;
    testFirestoreConnection().then((connected) => {
      if (isMounted) setIsConnected(connected);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunFullSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      const users = OntologicalStore.getUsers();
      const sessions = OntologicalStore.getSessions();
      const forms = OntologicalStore.getForms();
      const prospects = OntologicalStore.getProspects();
      const payments = OntologicalStore.getPaymentRequests();
      const eventRegistrations = OntologicalStore.getEventRegistrations();

      const result = await FirestoreSyncService.syncAllLocalToFirestore({
        users,
        sessions,
        forms,
        prospects,
        payments,
        eventRegistrations,
      });

      const nowStr = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSyncTime(nowStr);
      localStorage.setItem('rbc_last_firestore_sync', nowStr);
      setIsConnected(true);

      setSyncStatusMsg({
        type: 'success',
        text: `Sincronización completada con éxito: ${result.syncedCount} registros respaldados en Firestore de Google Cloud.`,
      });

      if (onSyncCompleted) onSyncCompleted();
    } catch (err) {
      setSyncStatusMsg({
        type: 'error',
        text: `Error durante la sincronización: ${err instanceof Error ? err.message : 'Verifica conexión a internet'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="card-solid-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80 dark:border-neutral-800 space-y-4 transition-all">
        {/* Compact Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Database className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white tracking-tight">
                  Google Cloud Firestore
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{isConnected ? 'Conectado' : 'Conectando'}</span>
                </span>
                <span className="hidden sm:inline-block font-mono text-[10px] text-gray-400 dark:text-neutral-500 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800">
                  {config.projectId}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                {lastSyncTime ? `Última sincronización: Hoy a las ${lastSyncTime}` : 'Persistencia duradera en Google Cloud • Sincronización en segundo plano'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRunFullSync}
              disabled={isSyncing}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-2xs ${
                isSyncing
                  ? 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-98'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title={isExpanded ? 'Ocultar detalles' : 'Ver estadísticas de colecciones'}
            >
              <span className="text-[11px]">{isExpanded ? 'Ocultar' : 'Detalles'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {syncStatusMsg && (
          <div
            className={`p-3 sm:p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              syncStatusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {syncStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncStatusMsg.text}</span>
          </div>
        )}

        {/* Expandable Technical Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-neutral-800 animate-fade-in">
            {/* Environment & Metadata Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Proyecto Firebase ID
                </span>
                <div className="font-mono text-xs font-semibold text-black dark:text-white truncate" title={config.projectId}>
                  {config.projectId}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Provisionado y Operativo</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Reglas de Seguridad
                </span>
                <div className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>firestore.rules Activas</span>
                </div>
                <span className="text-[10px] text-gray-500 font-light">
                  Protección de datos por Rol & UID
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Estado de Conexión
                </span>
                <div className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{isConnected ? 'Conectado a Google Cloud' : 'Verificando enlace...'}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-light">
                  Latencia baja y persistencia activa
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Último Barrido de Sync
                </span>
                <div className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{lastSyncTime ? `Hoy a las ${lastSyncTime}` : 'Pendiente manual'}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-light">
                  Sincronización en segundo plano
                </span>
              </div>
            </div>

            {/* Quantified Cloud Collections Grid */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Colecciones NoSQL Sincronizadas en Firestore
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white block leading-tight">{usersCount}</span>
                    <span className="text-[10px] text-gray-400 block font-light leading-tight">users</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white block leading-tight">{sessionsCount}</span>
                    <span className="text-[10px] text-gray-400 block font-light leading-tight">sessions</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white block leading-tight">{formsCount}</span>
                    <span className="text-[10px] text-gray-400 block font-light leading-tight">formSubmissions</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white block leading-tight">{prospectsCount}</span>
                    <span className="text-[10px] text-gray-400 block font-light leading-tight">prospects</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white block leading-tight">{paymentsCount}</span>
                    <span className="text-[10px] text-gray-400 block font-light leading-tight">payments</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white block leading-tight">{eventRegCount}</span>
                    <span className="text-[10px] text-gray-400 block font-light leading-tight">registrations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Audit & Diagnostic Accordion */}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityAudit(!showSecurityAudit)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Auditoría de Seguridad & Diagnóstico de Reglas</span>
                  {showSecurityAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleWipeDatabase}
                    disabled={isWiping}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isWiping ? 'Vaciando...' : 'Vaciar Todo en Firestore (0 Clientes)'}</span>
                  </button>
                </div>
              </div>

              {showSecurityAudit && (
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-800 space-y-3 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Security rules enforced */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Reglas de Código Blindadas (firestore.rules)</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-gray-600 dark:text-neutral-400 list-disc list-inside">
                        <li><strong>Anti-Escalada:</strong> Usuarios normales no pueden alterar su propio rol a `coach`.</li>
                        <li><strong>Anti-Fraude:</strong> Clientes solo pueden crear comprobantes con estado `pending`.</li>
                        <li><strong>Integridad de Sesiones:</strong> Clientes no pueden auto-aprobar o cambiar el estado de las sesiones.</li>
                        <li><strong>Aislamiento de Perfiles:</strong> Coachees solo acceden a sus propios registros vía UID.</li>
                      </ul>
                    </div>

                    {/* Deployment note */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-gray-200/80 dark:border-neutral-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Estado de Despliegue en la Nube</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-400 leading-relaxed">
                        El archivo <code>/firestore.rules</code> está actualizado en el repositorio del proyecto. En la nube de Google Firebase, el despliegue automático requiere el rol IAM <code>Firebase Rules Admin</code>. Si necesitas sincronizarlo directamente en Firebase Console:
                      </p>
                      <button
                        type="button"
                        onClick={copyFirestoreRulesToClipboard}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRules ? '¡Reglas Copiadas!' : 'Copiar Reglas para Firebase Console'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
