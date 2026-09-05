/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { User } from './types';
import { OntologicalStore } from './services/store';
import { ThemeManager } from './services/theme';
import { FirestoreSyncService } from './services/firestoreSync';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/Header';
import whiteWavesBg from './assets/images/white_waves_bg_1788461168119.jpg';

// Lazy load heavy dashboard views and secondary modals to prevent initial load freeze
const LoginView = lazy(() =>
  import('./components/LoginView').then((m) => ({ default: m.LoginView }))
);
const ClientDashboard = lazy(() =>
  import('./components/ClientDashboard').then((m) => ({ default: m.ClientDashboard }))
);
const CoachDashboard = lazy(() =>
  import('./components/CoachDashboard').then((m) => ({ default: m.CoachDashboard }))
);
const EventRegistrationLanding = lazy(() =>
  import('./components/EventRegistrationLanding').then((m) => ({
    default: m.EventRegistrationLanding,
  }))
);
const WebhookConfigModal = lazy(() =>
  import('./components/WebhookConfigModal').then((m) => ({
    default: m.WebhookConfigModal,
  }))
);
const VideoConferenceModal = lazy(() =>
  import('./components/VideoConferenceModal').then((m) => ({
    default: m.VideoConferenceModal,
  }))
);

function AppLoadingFallback({ message = 'Cargando Espacio de Trabajo...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        <div className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
      </div>
      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tracking-wider uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>(() => OntologicalStore.getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    OntologicalStore.getCurrentUser()
  );
  const [auditCoach, setAuditCoach] = useState<User | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVideoConferencesOpen, setIsVideoConferencesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'app' | 'register'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get('view') === 'registro' ||
        urlParams.get('view') === 'inscripcion' ||
        urlParams.get('registro') === 'true'
      ) {
        return 'register';
      }
    } catch {
      // fallback
    }
    return 'app';
  });

  useEffect(() => {
    ThemeManager.init();
    FirestoreSyncService.init().catch(() => {});

    // Listen for Firebase Auth user state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const email = firebaseUser.email.toLowerCase();
        const existing = OntologicalStore.getUserByEmail(email);
        if (existing) {
          OntologicalStore.setCurrentUser(existing.uid);
          setCurrentUser(existing);
        } else if (email === 'johnfrengifob@gmail.com') {
          const coach = OntologicalStore.getUsers().find((u) => u.role === 'coach');
          if (coach) {
            OntologicalStore.setCurrentUser(coach.uid);
            setCurrentUser(coach);
          }
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const refreshUsers = () => {
    const updated = OntologicalStore.getUsers();
    setAllUsers(updated);
    const active = OntologicalStore.getCurrentUser();
    if (active) setCurrentUser(active);
  };

  const handleNavigateHome = () => {
    setViewMode('app');
    setDashboardKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: User) => {
    OntologicalStore.setCurrentUser(user.uid);
    setCurrentUser(user);
    setViewMode('app');
    refreshUsers();
  };

  const handleLogout = () => {
    OntologicalStore.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleSwitchUser = (user: User) => {
    // Only coach or an active audit session can switch profiles
    const isCurrentlyCoach = currentUser?.role === 'coach';
    if (!isCurrentlyCoach && !auditCoach) {
      console.warn('Acceso denegado: sólo el administrador puede cambiar o supervisar perfiles.');
      return;
    }

    if (user.role === 'client') {
      // Retain coach identity in auditCoach when switching into client workspace
      if (isCurrentlyCoach && currentUser) {
        setAuditCoach(currentUser);
      }
      OntologicalStore.setCurrentUser(user.uid);
      setCurrentUser(user);
    } else if (user.role === 'coach') {
      // Returning to coach dashboard
      setAuditCoach(null);
      OntologicalStore.setCurrentUser(user.uid);
      setCurrentUser(user);
    }
    refreshUsers();
  };

  const handleReturnToAdmin = () => {
    const coach =
      auditCoach ||
      allUsers.find((u) => u.role === 'coach') ||
      OntologicalStore.getUsers().find((u) => u.role === 'coach');
    if (coach) {
      setAuditCoach(null);
      OntologicalStore.setCurrentUser(coach.uid);
      setCurrentUser(coach);
      refreshUsers();
    }
  };

  const renderContent = () => {
    const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
    const clients = safeAllUsers.filter((u) => u && u.role === 'client');
    const isCoach = currentUser?.role === 'coach';
    const canSwitchProfiles = isCoach || Boolean(auditCoach);

    return (
      <Suspense fallback={<AppLoadingFallback />}>
        {viewMode === 'register' ? (
          <EventRegistrationLanding
            onEnterPlatform={(user) => {
              if (user) {
                handleLogin(user);
              } else {
                setViewMode('app');
              }
            }}
            onNavigateToLogin={() => setViewMode('app')}
          />
        ) : !currentUser ? (
          <>
            <LoginView
              onLogin={handleLogin}
              availableUsers={allUsers}
              onNavigateToRegister={() => setViewMode('register')}
              onOpenVideoConferences={() => setIsVideoConferencesOpen(true)}
            />
            {isVideoConferencesOpen && (
              <VideoConferenceModal
                isOpen={isVideoConferencesOpen}
                onClose={() => setIsVideoConferencesOpen(false)}
                currentUser={null}
              />
            )}
          </>
        ) : (
          <>
            {/* Sticky banner when Master Coach is auditing/simulating a client workspace */}
            {auditCoach && (
              <aside
                aria-label="Modo Auditoría y Simulación"
                className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-amber-400/40"
              >
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                  <span>
                    <strong>Modo Auditoría & Simulación:</strong> Espacio de trabajo de{' '}
                    <u>{currentUser.name}</u>. Puedes interactuar, registrar bitácoras y simular el flujo del cliente.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReturnToAdmin}
                  className="px-3 py-1 rounded-lg bg-black/90 hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Volver a Consola Coach</span>
                </button>
              </aside>
            )}

            <Header
              currentUser={currentUser}
              onLogout={handleLogout}
              onSwitchUser={canSwitchProfiles ? handleSwitchUser : undefined}
              allUsers={canSwitchProfiles ? allUsers : []}
              isAuditMode={Boolean(auditCoach)}
              onReturnToAdmin={handleReturnToAdmin}
              onOpenSettings={isCoach ? () => setIsSettingsOpen(true) : undefined}
              onOpenRegistrationPortal={isCoach ? () => setViewMode('register') : undefined}
              onOpenVideoConferences={() => setIsVideoConferencesOpen(true)}
              onNavigateHome={handleNavigateHome}
              onUserUpdated={refreshUsers}
            />

            <div className="flex-1">
              {currentUser.role === 'coach' ? (
                <CoachDashboard
                  key={`coach-${currentUser.uid}-${dashboardKey}`}
                  coach={currentUser}
                  clients={clients}
                  onRefreshClients={refreshUsers}
                  onOpenRegistrationPortal={() => setViewMode('register')}
                />
              ) : (
                <ClientDashboard
                  key={`client-${currentUser.uid}-${dashboardKey}`}
                  client={currentUser}
                  onLogout={handleLogout}
                  onUserUpdated={refreshUsers}
                />
              )}
            </div>

            {isSettingsOpen && (
              <WebhookConfigModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
              />
            )}

            {isVideoConferencesOpen && (
              <VideoConferenceModal
                isOpen={isVideoConferencesOpen}
                onClose={() => setIsVideoConferencesOpen(false)}
                currentUser={currentUser}
              />
            )}
          </>
        )}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-neutral-100 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col transition-colors duration-200 relative isolate">
      {/* Full-space artistic sculptural white waves background image covering everything */}
      <div
        className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${whiteWavesBg})` }}
      >
        {/* Subtle layered adaptive overlay ensuring optimal contrast for text & dark mode */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/65 transition-colors duration-500 backdrop-blur-[0.5px]" />
      </div>

      {renderContent()}
    </div>
  );
}

