import React, { useState } from 'react';
import {
  Workflow,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Settings,
  RefreshCw,
  Sliders,
  Send,
  ShieldCheck,
  Check,
  Power,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { AutomatedTriggerConfig } from '../types';

export const AutomatedTriggersManager: React.FC = () => {
  const [triggers, setTriggers] = useState<AutomatedTriggerConfig[]>(() =>
    OntologicalStore.getAutomatedTriggers()
  );
  const [webhookUrl, setWebhookUrl] = useState(() => OntologicalStore.getWebhookUrl());
  const [isEditingWebhook, setIsEditingWebhook] = useState(false);
  const [tempWebhookUrl, setTempWebhookUrl] = useState(webhookUrl);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);
  const [executingTriggerId, setExecutingTriggerId] = useState<string | null>(null);

  const handleToggleTrigger = (id: string) => {
    OntologicalStore.toggleAutomatedTrigger(id);
    setTriggers(OntologicalStore.getAutomatedTriggers());
  };

  const handleExecuteTrigger = async (trigger: AutomatedTriggerConfig) => {
    setExecutingTriggerId(trigger.id);
    setTestResult(null);
    try {
      const res = await OntologicalStore.executeTrigger(trigger.id, {
        simulatedUser: 'Andrés Quintero',
        note: 'Prueba manual desde panel de control ontológico',
      });
      setTestResult(res);
      setTriggers(OntologicalStore.getAutomatedTriggers());
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Error ejecutando activador',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setExecutingTriggerId(null);
    }
  };

  const handleSaveWebhook = () => {
    OntologicalStore.saveWebhookUrl(tempWebhookUrl.trim());
    setWebhookUrl(tempWebhookUrl.trim());
    setIsEditingWebhook(false);
  };

  const handlePingWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      if (!webhookUrl || !webhookUrl.startsWith('http')) {
        throw new Error('Configure una URL HTTP/HTTPS válida para Make.com');
      }
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          source: 'Rengifo Basto Consultoría Ontológica - Test Ping',
          timestamp: new Date().toISOString(),
        }),
      });
      setTestResult({
        success: res.ok,
        message: res.ok
          ? 'Make.com respondió con éxito (HTTP ' + res.status + ')'
          : 'Make.com respondió con estado HTTP ' + res.status,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'No se pudo conectar con el endpoint de Make.com',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#141414] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
              <Workflow className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activadores Automáticos & Webhooks
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
            Orquestación de eventos ontológicos, análisis automático con Gemini AI y sincronización con Make.com.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Motor Ontológico Activo
          </div>
        </div>
      </div>

      {/* Webhook Connection Configuration */}
      <div className="bg-white dark:bg-[#141414] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Punto de Enlace Make.com (Webhook Principal)
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-neutral-400">
            Receptor de eventos en JSON
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {isEditingWebhook ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={tempWebhookUrl}
                onChange={(e) => setTempWebhookUrl(e.target.value)}
                placeholder="https://hook.us1.make.com/..."
                className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleSaveWebhook}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setTempWebhookUrl(webhookUrl);
                  setIsEditingWebhook(false);
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-gray-50 dark:bg-neutral-900 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 font-mono text-xs text-gray-700 dark:text-neutral-300 overflow-hidden text-ellipsis">
              <span className="truncate">{webhookUrl || 'No configurado'}</span>
              <button
                onClick={() => setIsEditingWebhook(true)}
                className="ml-2 text-xs font-medium text-black dark:text-white underline shrink-0 hover:opacity-80"
              >
                Editar
              </button>
            </div>
          )}

          <button
            onClick={handlePingWebhook}
            disabled={isTestingWebhook || !webhookUrl}
            className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-700 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isTestingWebhook ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Probar Conexión (Ping)
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{testResult.message}</p>
              <p className="text-[10px] opacity-75">
                Hora: {new Date(testResult.timestamp).toLocaleTimeString('es-CO')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Automated Triggers */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
          Disparadores Configurados en el Ecosistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {triggers.map((trigger) => (
            <div
              key={trigger.id}
              className={`p-5 rounded-xl border transition-all space-y-4 bg-white dark:bg-[#141414] ${
                trigger.enabled
                  ? 'border-gray-200 dark:border-neutral-800 shadow-xs'
                  : 'border-dashed border-gray-200 dark:border-neutral-800/60 opacity-70'
              }`}
            >
              {/* Trigger Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        trigger.enabled ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {trigger.name}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
                    {trigger.description}
                  </p>
                </div>

                {/* Enable/Disable Toggle Button */}
                <button
                  onClick={() => handleToggleTrigger(trigger.id)}
                  className={`p-2 rounded-lg transition-all ${
                    trigger.enabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={trigger.enabled ? 'Pausar Activador' : 'Activar Disparador'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Actions Chain */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                  Cadena de Ejecución:
                </span>
                <div className="space-y-1">
                  {trigger.actions.map((act, i) => (
                    <div
                      key={i}
                      className="text-xs text-gray-800 dark:text-neutral-200 flex items-center gap-1.5 bg-gray-50 dark:bg-neutral-900/60 px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-neutral-800/60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics & Test Button Footer */}
              <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400">
                <div className="flex items-center gap-3">
                  <span>
                    Ejecuciones: <strong className="text-gray-900 dark:text-white">{trigger.executionsCount}</strong>
                  </span>
                  {trigger.lastTriggeredAt && (
                    <span className="hidden sm:inline">
                      Última: {new Date(trigger.lastTriggeredAt).toLocaleDateString('es-CO')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleExecuteTrigger(trigger)}
                  disabled={!trigger.enabled || executingTriggerId === trigger.id}
                  className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-md font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  {executingTriggerId === trigger.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  Ejecutar Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
