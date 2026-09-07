/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User } from './types';
import { OntologicalStore, ADMIN_EMAIL, ADMIN_SECURITY_CODE } from './services/store';
import { ThemeManager } from './services/theme';
import { FirestoreSyncService } from './services/firestoreSync';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { EventRegistrationLanding } from './components/EventRegistrationLanding';
import whiteWavesBg from './assets/images/white_waves_bg_1788461168119.jpg';

// Lazy load heavy authenticated dashboard views and secondary modals
const ClientDashboard = lazy(() =>
  import('./components/ClientDashboard').then((m) => ({ default: m.ClientDashboard }))
);
const CoachDashboard = lazy(() =>
  import('./components/CoachDashboard').then((m) => ({ default: m.CoachDashboard }))
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
  const [pendingCoachAuth, setPendingCoachAuth] = useState<User | null>(null);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [showModalCode, setShowModalCode] = useState(false);
  const [adminCodeError, setAdminCodeError] = useState<string | null>(null);
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
          if (existing.role === 'coach' && existing.email.toLowerCase() !== ADMIN_EMAIL) {
            console.warn('Usuario no autorizado para rol de administrador:', email);
            OntologicalStore.setCurrentUser(null);
            setCurrentUser(null);
            return;
          }
          OntologicalStore.setCurrentUser(existing.uid);
          setCurrentUser(existing);
        } else if (email === ADMIN_EMAIL) {
          const coach = OntologicalStore.getUsers().find(
            (u) => u.role === 'coach' && u.email.toLowerCase() === ADMIN_EMAIL
          );
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
      // Returning to coach dashboard - must be ADMIN_EMAIL and verified with code 4658
      if (user.email.toLowerCase() !== ADMIN_EMAIL) {
        console.warn(`Acceso denegado: Únicamente ${ADMIN_EMAIL} puede acceder al panel administrador.`);
        return;
      }
      setPendingCoachAuth(user);
      setAdminCodeInput('');
      setAdminCodeError(null);
      return;
    }
    refreshUsers();
  };

  const handleReturnToAdmin = () => {
    const coach =
      auditCoach ||
      allUsers.find((u) => u.role === 'coach' && u.email.toLowerCase() === ADMIN_EMAIL) ||
      OntologicalStore.getUsers().find((u) => u.role === 'coach' && u.email.toLowerCase() === ADMIN_EMAIL);
    if (coach) {
      setPendingCoachAuth(coach);
      setAdminCodeInput('');
      setAdminCodeError(null);
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

      {/* Admin Verification Modal with Confidential Security Code */}
      {pendingCoachAuth && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#141416] text-black dark:text-neutral-100 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Acceso Panel Administrador
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-mono">
                  {ADMIN_EMAIL}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
              Por protocolo de seguridad estricto, ingrese su código confidencial de administrador para autorizar el acceso exclusivo a la consola directiva.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAdminCodeError(null);
                if (adminCodeInput.trim() !== ADMIN_SECURITY_CODE) {
                  setAdminCodeError('Código de seguridad incorrecto. Verifique sus credenciales autorizadas.');
                  return;
                }
                setAuditCoach(null);
                OntologicalStore.setCurrentUser(pendingCoachAuth.uid);
                setCurrentUser(pendingCoachAuth);
                setPendingCoachAuth(null);
                refreshUsers();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <input
                  type={showModalCode ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={8}
                  autoFocus
                  value={adminCodeInput}
                  onChange={(e) => {
                    setAdminCodeInput(e.target.value.replace(/[^0-9]/g, ''));
                    if (adminCodeError) setAdminCodeError(null);
                  }}
                  placeholder="••••"
                  className="w-full py-2.5 pl-4 pr-11 text-center tracking-widest text-xl font-mono font-bold rounded-xl bg-[#F9F9FB] dark:bg-[#1F1F23] border border-gray-200 dark:border-neutral-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  id="app-admin-security-code-input"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowModalCode(!showModalCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer p-1"
                  title={showModalCode ? 'Ocultar código' : 'Ver código'}
                  aria-label="Alternar visibilidad del código"
                >
                  {showModalCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {adminCodeError && (
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-[11px] text-red-800 dark:text-red-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{adminCodeError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingCoachAuth(null);
                    setAdminCodeInput('');
                    setAdminCodeError(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  id="btn-confirm-admin-security-code"
                >
                  Confirmar Acceso Directivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

