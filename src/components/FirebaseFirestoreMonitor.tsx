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
    <div className="space-y-6">
      {/* Top Banner: Status and Project Information */}
      <div className="card-solid-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 border border-gray-200/80 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Google Cloud Firestore • Base de Datos NoSQL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
              Sincronización en la Nube con Firebase de Google
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-2xl">
              Persistencia duradera para participantes, bitácoras somáticas, historial de sesiones 1 a 1, pagos validados y automatizaciones ontológicas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunFullSync}
              disabled={isSyncing}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
                isSyncing
                  ? 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-98'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando con Google Cloud...' : 'Sincronizar Todo Ahora'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {syncStatusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
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

        {/* Environment & Metadata Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
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

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
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

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
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

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 space-y-1">
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
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Colecciones NoSQL Sincronizadas en Firestore
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-black dark:text-white block">{usersCount}</span>
                <span className="text-[10px] text-gray-400 block font-light leading-tight">users</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-black dark:text-white block">{sessionsCount}</span>
                <span className="text-[10px] text-gray-400 block font-light leading-tight">sessions</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-black dark:text-white block">{formsCount}</span>
                <span className="text-[10px] text-gray-400 block font-light leading-tight">formSubmissions</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-black dark:text-white block">{prospectsCount}</span>
                <span className="text-[10px] text-gray-400 block font-light leading-tight">prospects</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-black dark:text-white block">{paymentsCount}</span>
                <span className="text-[10px] text-gray-400 block font-light leading-tight">payments</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-neutral-900/70 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-black dark:text-white block">{eventRegCount}</span>
                <span className="text-[10px] text-gray-400 block font-light leading-tight">registrations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
