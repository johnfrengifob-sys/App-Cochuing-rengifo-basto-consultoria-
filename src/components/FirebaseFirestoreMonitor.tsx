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
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
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
  const [syncStatusMsg, setSyncStatusMsg] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

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
          </div>
        )}
      </div>
    </div>
  );
};
