import React, { useState } from 'react';
import { useTranslation, Language } from '../services/i18n';
import { ThemeManager, ThemeMode } from '../services/theme';
import { User } from '../types';
import {
  Settings,
  Globe,
  Sun,
  Moon,
  Workflow,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Laptop,
} from 'lucide-react';
import { WebhookConfigModal } from './WebhookConfigModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => ThemeManager.getTheme());
  const [activeTab, setActiveTab] = useState<'language' | 'appearance' | 'automations'>('language');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCoach = currentUser?.role === 'coach';

  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setSaveFeedback(
      newLang === 'es'
        ? 'Idioma cambiado a Español y guardado localmente.'
        : 'Language changed to English and saved locally.'
    );
    setTimeout(() => {
      setSaveFeedback(null);
    }, 3000);
  };

  const handleSelectTheme = (newTheme: ThemeMode) => {
    ThemeManager.applyTheme(newTheme);
    setCurrentTheme(newTheme);
    setSaveFeedback(
      language === 'es'
        ? `Tema cambiado a modo ${newTheme === 'dark' ? 'oscuro' : 'claro'}.`
        : `Theme set to ${newTheme === 'dark' ? 'dark' : 'light'} mode.`
    );
    setTimeout(() => {
      setSaveFeedback(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-[#141417] rounded-3xl max-w-2xl w-full border border-gray-100 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white tracking-tight">
                {t.settingsModalTitle}
              </h3>
              <p className="text-xs font-light text-gray-500 dark:text-neutral-400">
                {t.settingsModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-gray-100 dark:border-neutral-800/80 bg-gray-50/50 dark:bg-[#111114]">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('language')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'language'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.tabLanguage}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.tabAppearance}</span>
            </button>

            {isCoach && (
              <button
                type="button"
                onClick={() => setActiveTab('automations')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'automations'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-neutral-800'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>{t.tabAutomations}</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Toast / Notification Banner */}
          {saveFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* TAB 1: LANGUAGE SELECTOR */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-black dark:text-white">
                  {t.languageSelectTitle}
                </h4>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-0.5">
                  {t.languageSelectDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option: Español */}
                <div
                  onClick={() => handleSelectLanguage('es')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    language === 'es'
                      ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.05] shadow-xs'
                      : 'border-gray-200/80 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-[#18181C]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇪🇸</span>
                      <div>
                        <div className="text-sm font-semibold text-black dark:text-white">
                          {t.spanishTitle}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-500">
                          ES / Español
                        </span>
                      </div>
                    </div>

                    {language === 'es' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold">
                        <Check className="w-3 h-3" />
                        <span>{t.currentLanguageBadge}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    {t.spanishDesc}
                  </p>
                </div>

                {/* Option: English */}
                <div
                  onClick={() => handleSelectLanguage('en')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    language === 'en'
                      ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.05] shadow-xs'
                      : 'border-gray-200/80 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-[#18181C]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇺🇸</span>
                      <div>
                        <div className="text-sm font-semibold text-black dark:text-white">
                          {t.englishTitle}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-500">
                          EN / English
                        </span>
                      </div>
                    </div>

                    {language === 'en' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold">
                        <Check className="w-3 h-3" />
                        <span>{t.currentLanguageBadge}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                    {t.englishDesc}
                  </p>
                </div>
              </div>

              {/* Information pill */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1E] border border-gray-100 dark:border-neutral-800 flex items-start gap-3 mt-4">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                  {language === 'es' ? (
                    <span>
                      Al cambiar de idioma, los encabezados, botones, tarjetas de progreso y diagnósticos ejecutivos se adaptan de inmediato preservando tus datos guardados.
                    </span>
                  ) : (
                    <span>
                      When switching language, headings, navigation buttons, progress cards, and executive insights update immediately while keeping your data intact.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE (THEME) */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-black dark:text-white">
                  {t.themeTitle}
                </h4>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400 mt-0.5">
                  {t.themeDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Light Theme */}
                <div
                  onClick={() => handleSelectTheme('light')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentTheme === 'light'
                      ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.05] shadow-xs'
                      : 'border-gray-200/80 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-[#18181C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-black dark:text-white">
                        {t.themeLight}
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                        {language === 'es' ? 'Fondo blanco puro & alto contraste' : 'Pure white high-contrast background'}
                      </span>
                    </div>
                  </div>

                  {currentTheme === 'light' && (
                    <Check className="w-4 h-4 text-black dark:text-white" />
                  )}
                </div>

                {/* Dark Theme */}
                <div
                  onClick={() => handleSelectTheme('dark')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentTheme === 'dark'
                      ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.05] shadow-xs'
                      : 'border-gray-200/80 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-[#18181C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-black dark:text-white">
                        {t.themeDark}
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                        {language === 'es' ? 'Fondo carbón obsidiana oscuro' : 'Obsidian dark charcoal background'}
                      </span>
                    </div>
                  </div>

                  {currentTheme === 'dark' && (
                    <Check className="w-4 h-4 text-black dark:text-white" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMATIONS (FOR COACH / ADMIN) */}
          {activeTab === 'automations' && isCoach && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0F172A] text-white space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    {language === 'es' ? 'Centro de Automatizaciones Make.com' : 'Make.com Automation Center'}
                  </h4>
                </div>
                <p className="text-xs font-light text-slate-300 leading-relaxed">
                  {language === 'es'
                    ? 'Para configurar los webhooks de embudo WhatsApp, reservas de Calendly, notificaciones de pago y diagnósticos IA, accede al panel especializado de automatizaciones.'
                    : 'To configure WhatsApp funnel webhooks, Calendly bookings, high-ticket payment alerts, and AI diagnostics, access the specialized automation workspace.'}
                </p>
              </div>

              {/* Embedded Webhook configuration trigger */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181C] border border-gray-200/80 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-black dark:text-white">
                    {language === 'es' ? 'Editor Avanzado de Webhooks' : 'Advanced Webhook Editor'}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {language === 'es' ? '4 Fases de Automatización y simulador en vivo' : '4 Automation phases and live payload simulator'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Open the Webhook modal directly
                    setActiveTab('language');
                  }}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shadow-xs"
                >
                  {language === 'es' ? 'Ver Webhooks' : 'View Webhooks'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800/80 bg-gray-50/50 dark:bg-[#111114] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-neutral-500">
            <Globe className="w-3.5 h-3.5" />
            <span>
              {language === 'es' ? 'Preferencia activa: Español (ES)' : 'Active preference: English (EN)'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
