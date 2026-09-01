import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'es' | 'en';

const LANGUAGE_STORAGE_KEY = 'rbc_app_language_v1';

export interface Translations {
  // Brand & Header
  brandTitle: string;
  brandSubtitle: string;
  adminView: string;
  registrationPortal: string;
  settingsTitle: string;
  logout: string;
  roleCoach: string;
  roleClient: string;

  // Settings Modal
  settingsModalTitle: string;
  settingsModalSubtitle: string;
  tabLanguage: string;
  tabAppearance: string;
  tabAutomations: string;
  languageSelectTitle: string;
  languageSelectDesc: string;
  spanishTitle: string;
  spanishDesc: string;
  englishTitle: string;
  englishDesc: string;
  preferenceSavedAlert: string;
  currentLanguageBadge: string;
  close: string;
  save: string;

  // Theme Settings
  themeTitle: string;
  themeDesc: string;
  themeLight: string;
  themeDark: string;

  // Login View
  loginTitle: string;
  loginSubtitle: string;
  selectProfile: string;
  demoProfiles: string;
  accessAsCoach: string;
  accessAsClient: string;
  upcomingEventBadge: string;
  reserveSpot: string;
  securedSpot: string;

  // Navigation & Tabs (Client)
  tabRoadmap: string;
  tabBreakthrough: string;
  tabInsights: string;
  tabSessions: string;
  tabResources: string;

  // Navigation & Tabs (Coach)
  tabCoachClients: string;
  tabCoachCrm: string;
  tabCoachSchedule: string;
  tabCoachDiagnostics: string;

  // Client Dashboard
  welcomeBack: string;
  journeyTitle: string;
  progressTitle: string;
  currentNode: string;
  sessionOf: string;
  advanceJourney: string;
  exportProgress: string;
  scheduleSession: string;
  registerBreakthrough: string;
  somaticMapping: string;
  emotionalWisdom: string;
  limitingBeliefs: string;
  accompanyingAgreements: string;
  viewDetails: string;
  completed: string;
  inProgress: string;
  locked: string;
  paymentStatus: string;
  paymentCompleted: string;
  paymentPending: string;

  // Coach Dashboard
  coachingProgramTitle: string;
  coachingProgramSubtitle: string;
  clientOverview: string;
  advanceStep: string;
  newSession: string;
  evaluateBreakthrough: string;
  exportClientProgress: string;
  prospectsPipeline: string;
  eventSchedule: string;
  createEvent: string;
  totalClients: string;
  activeSessions: string;
  registeredLeads: string;

  // General Actions
  cancel: string;
  confirm: string;
  downloadPdf: string;
  downloadCsv: string;
  copied: string;
  search: string;
  filter: string;
}

export const translations: Record<Language, Translations> = {
  es: {
    // Brand & Header
    brandTitle: 'Rengifo Basto',
    brandSubtitle: 'Consultoría Ontológica',
    adminView: 'Vista Admin:',
    registrationPortal: 'Portal de Registro',
    settingsTitle: 'Configuración & Preferencias',
    logout: 'Cerrar Sesión',
    roleCoach: 'Coach Consultor',
    roleClient: 'Cliente',

    // Settings Modal
    settingsModalTitle: 'Configuración de la Plataforma',
    settingsModalSubtitle: 'Gestiona tu idioma, preferencias visuales y automatizaciones.',
    tabLanguage: 'Idioma & Región',
    tabAppearance: 'Apariencia',
    tabAutomations: 'Automatizaciones Make',
    languageSelectTitle: 'Selecciona el Idioma de la Interfaz',
    languageSelectDesc: 'Tu preferencia se almacenará automáticamente en este dispositivo.',
    spanishTitle: 'Español (Latinoamérica)',
    spanishDesc: 'Idioma nativo para el acompañamiento y diagnósticos ontológicos.',
    englishTitle: 'English (International)',
    englishDesc: 'Full interface in English for global executives and international coachees.',
    preferenceSavedAlert: 'Preferencia de idioma guardada correctamente.',
    currentLanguageBadge: 'Activo',
    close: 'Cerrar',
    save: 'Guardar Cambios',

    // Theme Settings
    themeTitle: 'Tema Visual',
    themeDesc: 'Personaliza la tonalidad de la interfaz de usuario.',
    themeLight: 'Modo Claro (Minimalista)',
    themeDark: 'Modo Oscuro (Obsidiana)',

    // Login View
    loginTitle: 'Plataforma de Consultoría Ontológica',
    loginSubtitle: 'Espacio exclusivo para el rediseño de liderazgo, coherencia y transformación directiva.',
    selectProfile: 'Selecciona tu Perfil de Ingreso',
    demoProfiles: 'Perfiles de Demostración',
    accessAsCoach: 'Ingresar como Coach Administrador',
    accessAsClient: 'Ingresar como Coachee / Cliente',
    upcomingEventBadge: 'Próximo Conversatorio Ontológico',
    reserveSpot: 'Reserva tu cupo',
    securedSpot: 'Cupo Confirmado',

    // Navigation & Tabs (Client)
    tabRoadmap: 'Ruta de Transformación',
    tabBreakthrough: 'Mapeo de Quiebres',
    tabInsights: 'Diagnósticos IA',
    tabSessions: 'Sesiones 1 a 1',
    tabResources: 'Metodología & Guías',

    // Navigation & Tabs (Coach)
    tabCoachClients: 'Gestión de Clientes',
    tabCoachCrm: 'Pipeline CRM & Leads',
    tabCoachSchedule: 'Cronograma & Eventos IA',
    tabCoachDiagnostics: 'Diagnósticos Globales',

    // Client Dashboard
    welcomeBack: 'Bienvenido de nuevo',
    journeyTitle: 'Tu Programa Certeza (12 Semanas)',
    progressTitle: 'Progreso General',
    currentNode: 'Nodo Actual',
    sessionOf: 'Sesión {current} de {total}',
    advanceJourney: 'Avanzar al Siguiente Nodo',
    exportProgress: 'Exportar Expediente',
    scheduleSession: 'Agendar Sesión',
    registerBreakthrough: 'Declarar Quiebre',
    somaticMapping: 'Mapeo Somático y Emocional',
    emotionalWisdom: 'Sabiduría Emocional',
    limitingBeliefs: 'Creencias Limitantes',
    accompanyingAgreements: 'Acuerdos & Compromisos',
    viewDetails: 'Ver Detalle',
    completed: 'Completado',
    inProgress: 'En Proceso',
    locked: 'Bloqueado',
    paymentStatus: 'Estado de Pago',
    paymentCompleted: 'Completado',
    paymentPending: 'Pendiente',

    // Coach Dashboard
    coachingProgramTitle: 'Centro de Comando Ontológico',
    coachingProgramSubtitle: 'Acompañamiento 1 a 1, calibración somática y automatizaciones directivas.',
    clientOverview: 'Expediente del Cliente',
    advanceStep: 'Avanzar de Sesión',
    newSession: 'Programar Sesión',
    evaluateBreakthrough: 'Emitir Diagnóstico',
    exportClientProgress: 'Exportar Progreso',
    prospectsPipeline: 'Prospectos del Embudo',
    eventSchedule: 'Agenda de Eventos',
    createEvent: 'Crear Nuevo Evento',
    totalClients: 'Clientes Activos',
    activeSessions: 'Sesiones Agendadas',
    registeredLeads: 'Prospectos Registrados',

    // General Actions
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    downloadPdf: 'Descargar PDF',
    downloadCsv: 'Descargar CSV',
    copied: 'Copiado al portapapeles',
    search: 'Buscar...',
    filter: 'Filtrar',
  },
  en: {
    // Brand & Header
    brandTitle: 'Rengifo Basto',
    brandSubtitle: 'Ontological Consulting',
    adminView: 'Admin View:',
    registrationPortal: 'Registration Portal',
    settingsTitle: 'Settings & Preferences',
    logout: 'Log Out',
    roleCoach: 'Executive Coach',
    roleClient: 'Client',

    // Settings Modal
    settingsModalTitle: 'Platform Settings',
    settingsModalSubtitle: 'Manage your language, visual preferences, and automations.',
    tabLanguage: 'Language & Region',
    tabAppearance: 'Appearance',
    tabAutomations: 'Make Automations',
    languageSelectTitle: 'Select Interface Language',
    languageSelectDesc: 'Your preference is saved locally on this device.',
    spanishTitle: 'Español (Latin America)',
    spanishDesc: 'Native language for ontological coaching and diagnostic models.',
    englishTitle: 'English (International)',
    englishDesc: 'Full interface in English for global executives and international coachees.',
    preferenceSavedAlert: 'Language preference successfully saved.',
    currentLanguageBadge: 'Active',
    close: 'Close',
    save: 'Save Changes',

    // Theme Settings
    themeTitle: 'Visual Theme',
    themeDesc: 'Customize the aesthetic theme of the user interface.',
    themeLight: 'Light Mode (Minimalist)',
    themeDark: 'Dark Mode (Obsidian)',

    // Login View
    loginTitle: 'Ontological Consulting Platform',
    loginSubtitle: 'Exclusive executive space for leadership redesign, somatic coherence, and transformation.',
    selectProfile: 'Select Login Profile',
    demoProfiles: 'Demo Profiles',
    accessAsCoach: 'Enter as Master Coach / Admin',
    accessAsClient: 'Enter as Coachee / Client',
    upcomingEventBadge: 'Upcoming Ontological Seminar',
    reserveSpot: 'Reserve your spot',
    securedSpot: 'Spot Confirmed',

    // Navigation & Tabs (Client)
    tabRoadmap: 'Transformation Roadmap',
    tabBreakthrough: 'Breakthrough Mapping',
    tabInsights: 'AI Diagnostics',
    tabSessions: '1-on-1 Sessions',
    tabResources: 'Methodology & Guides',

    // Navigation & Tabs (Coach)
    tabCoachClients: 'Client Management',
    tabCoachCrm: 'CRM & Leads Pipeline',
    tabCoachSchedule: 'AI Event Schedule',
    tabCoachDiagnostics: 'Global Diagnostics',

    // Client Dashboard
    welcomeBack: 'Welcome back',
    journeyTitle: 'Your Certainty Program (12 Weeks)',
    progressTitle: 'Overall Progress',
    currentNode: 'Current Node',
    sessionOf: 'Session {current} of {total}',
    advanceJourney: 'Advance to Next Node',
    exportProgress: 'Export Dossier',
    scheduleSession: 'Schedule Session',
    registerBreakthrough: 'Log Breakthrough',
    somaticMapping: 'Somatic & Emotional Mapping',
    emotionalWisdom: 'Emotional Wisdom',
    limitingBeliefs: 'Limiting Beliefs',
    accompanyingAgreements: 'Agreements & Commitments',
    viewDetails: 'View Details',
    completed: 'Completed',
    inProgress: 'In Progress',
    locked: 'Locked',
    paymentStatus: 'Payment Status',
    paymentCompleted: 'Completed',
    paymentPending: 'Pending',

    // Coach Dashboard
    coachingProgramTitle: 'Ontological Command Center',
    coachingProgramSubtitle: '1-on-1 coaching, somatic calibration, and executive automations.',
    clientOverview: 'Client Dossier',
    advanceStep: 'Advance Session',
    newSession: 'Schedule Session',
    evaluateBreakthrough: 'Run Diagnostic',
    exportClientProgress: 'Export Progress',
    prospectsPipeline: 'Funnel Prospects',
    eventSchedule: 'Event Agenda',
    createEvent: 'Create New Event',
    totalClients: 'Active Clients',
    activeSessions: 'Scheduled Sessions',
    registeredLeads: 'Registered Leads',

    // General Actions
    cancel: 'Cancel',
    confirm: 'Confirm',
    downloadPdf: 'Download PDF',
    downloadCsv: 'Download CSV',
    copied: 'Copied to clipboard',
    search: 'Search...',
    filter: 'Filter',
  },
};

export class LanguageManager {
  static getLanguage(): Language {
    if (typeof window === 'undefined') return 'es';
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'es' || stored === 'en') return stored;
      // Check browser preference
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) return 'en';
    } catch {
      // fallback
    }
    return 'es';
  }

  static setLanguage(lang: Language): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('rbc-language-changed', { detail: { language: lang } }));
    } catch {
      // ignore
    }
  }

  static getTranslations(lang?: Language): Translations {
    const selected = lang || this.getLanguage();
    return translations[selected] || translations.es;
  }
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: translations.es,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => LanguageManager.getLanguage());

  useEffect(() => {
    document.documentElement.lang = language;

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: Language }>;
      if (customEvent.detail && customEvent.detail.language) {
        setLanguageState(customEvent.detail.language);
      }
    };

    window.addEventListener('rbc-language-changed', handleLanguageChange);
    return () => window.removeEventListener('rbc-language-changed', handleLanguageChange);
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    LanguageManager.setLanguage(lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
