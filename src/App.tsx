/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User } from './types';
import { OntologicalStore, ADMIN_EMAIL, ADMIN_SECURITY_CODE } from './services/store';
import { getEmailAvatarUrl } from './utils/avatar';
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
  const [registerInitialEmail, setRegisterInitialEmail] = useState<string>('');
  const [viewMode, setViewMode] = useState<'app' | 'register'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      if (
        urlParams.get('view') === 'registro' ||
        urlParams.get('view') === 'inscripcion' ||
        urlParams.get('view') === 'portal' ||
        urlParams.get('registro') === 'true' ||
        path.includes('/registro') ||
        path.includes('/inscripcion') ||
        path.includes('/portal') ||
        hash.includes('registro') ||
        hash.includes('inscripcion')
      ) {
        return 'register';
      }
    } catch {
      // fallback
    }
    return 'app';
  });

  const handleOpenRegistrationPortal = (prefillEmail?: string) => {
    if (prefillEmail) setRegisterInitialEmail(prefillEmail);
    setViewMode('register');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'registro');
      window.history.pushState({ view: 'register' }, '', url.toString());
    } catch {}
  };

  const handleBackFromRegistrationPortal = () => {
    setViewMode('app');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('registro');
      url.searchParams.delete('inscripcion');
      url.searchParams.delete('portal');
      const cleanPath = url.pathname === '/registro' || url.pathname === '/portal' ? '/' : url.pathname;
      window.history.pushState({ view: 'app' }, '', cleanPath + (url.search ? url.search : ''));
    } catch {}
  };

  useEffect(() => {
    ThemeManager.init();
    FirestoreSyncService.init().catch(() => {});

    // Listen to browser navigation back/forward for portal view
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const path = (window.location.pathname || '').toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        if (
          urlParams.get('view') === 'registro' ||
          urlParams.get('view') === 'inscripcion' ||
          urlParams.get('view') === 'portal' ||
          urlParams.get('registro') === 'true' ||
          path.includes('/registro') ||
          path.includes('/inscripcion') ||
          path.includes('/portal') ||
          hash.includes('registro') ||
          hash.includes('inscripcion')
        ) {
          setViewMode('register');
        } else {
          setViewMode('app');
        }
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);

    // Listen for custom broadcast events when store updates
    const handleStoreUsersUpdated = () => {
      refreshUsers();
    };
    const handleStoreRegsUpdated = () => {
      refreshUsers();
    };
    window.addEventListener('rbc-users-updated', handleStoreUsersUpdated);
    window.addEventListener('rbc-event-registrations-updated', handleStoreRegsUpdated);

    // Subscribe to real-time Firestore users & event registrations
    const unsubUsers = FirestoreSyncService.subscribeToUsers((remoteUsers) => {
      OntologicalStore.mergeUsersFromFirestore(remoteUsers);
      refreshUsers();
    });

    const unsubRegs = FirestoreSyncService.subscribeToEventRegistrations((remoteRegs) => {
      OntologicalStore.mergeEventRegistrationsFromFirestore(remoteRegs);
      refreshUsers();
    });

    const unsubFormsSheets = FirestoreSyncService.subscribeToFormsSheetsIntegrations((remoteIntegrations) => {
      OntologicalStore.mergeFormsSheetsIntegrationsFromFirestore(remoteIntegrations);
    });

    const unsubTalleres = FirestoreSyncService.subscribeToTallerRegistros((remoteTalleres) => {
      OntologicalStore.mergeTallerRegistrosFromFirestore(remoteTalleres);
    });

    const unsubProgramNodes = FirestoreSyncService.subscribeToProgramNodes((remoteNodes) => {
      OntologicalStore.mergeProgramNodesFromFirestore(remoteNodes);
    });

    // Initial sync sweep from Firestore and persistent server database
    FirestoreSyncService.syncAllFromFirestore()
      .then(({ usersCount, regsCount }) => {
        if (usersCount > 0 || regsCount > 0) {
          refreshUsers();
        }
      })
      .catch(() => {});

    OntologicalStore.syncWithServerDatabase()
      .then(() => {
        refreshUsers();
      })
      .catch(() => {});

    // Listen for Firebase Auth user state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const email = firebaseUser.email.toLowerCase().trim();

        // 1. If Coach / Admin Google Account
        if (OntologicalStore.isAdminEmail(email)) {
          await FirestoreSyncService.syncAllFromFirestore().catch(() => {});
          const coach = OntologicalStore.getUsers().find((u) => u.role === 'coach');
          if (coach) {
            OntologicalStore.setCurrentUser(coach.uid);
            setCurrentUser(coach);
            setAllUsers(OntologicalStore.getUsers());
            return;
          }
        }

        // 2. If Existing Participant / Client (local or remote)
        let existing = OntologicalStore.getUserByEmail(email);
        if (!existing && firebaseUser.uid) {
          existing = OntologicalStore.getUserById(firebaseUser.uid);
        }
        if (!existing) {
          existing = await FirestoreSyncService.findUserInFirestoreByEmail(email, firebaseUser.uid);
          if (existing) {
            OntologicalStore.mergeUsersFromFirestore([existing]);
          }
        }

        if (existing && existing.role === 'client') {
          // Cargar progreso remoto (sesiones y bitácoras) desde Firestore
          try {
            const [cloudSessions, cloudForms] = await Promise.all([
              FirestoreSyncService.fetchClientSessions(existing.uid),
              FirestoreSyncService.fetchClientPostForms(existing.uid),
            ]);
            if (cloudSessions.length > 0) {
              const allSessions = OntologicalStore.getSessions();
              const merged = [...allSessions.filter((s) => s.clientId !== existing.uid), ...cloudSessions];
              OntologicalStore.saveSessions(merged);
            }
            if (cloudForms.length > 0) {
              const allForms = OntologicalStore.getPostSessionForms();
              const merged = [...allForms.filter((f) => f.clientId !== existing.uid), ...cloudForms];
              OntologicalStore.savePostSessionForms(merged);
            }
          } catch (e) {
            console.warn('App auth state load remote progress notice:', e);
          }

          // Auto-assign any pending workshop token or invitation code from session
          try {
            const pendingWorkshopId = sessionStorage.getItem('rbc_active_workshop_id');
            const pendingTicketCode = sessionStorage.getItem('rbc_active_ticket_code');
            if (pendingWorkshopId && (!existing.enrolledWorkshopIds || !existing.enrolledWorkshopIds.includes(pendingWorkshopId))) {
              const updatedWorkshops = Array.from(new Set([...(existing.enrolledWorkshopIds || ['taller-1-raiz']), pendingWorkshopId]));
              existing.enrolledWorkshopIds = updatedWorkshops;
              OntologicalStore.updateUser(existing.uid, { enrolledWorkshopIds: updatedWorkshops });
              FirestoreSyncService.syncUserProfile(existing).catch(console.warn);
            }
            if (pendingTicketCode) {
              OntologicalStore.confirmEventAttendance(pendingTicketCode);
            }
          } catch {
            // Ignore
          }

          const emailAvatar = getEmailAvatarUrl(email, firebaseUser.displayName || existing.name, firebaseUser.photoURL);
          if (emailAvatar && (!existing.avatarUrl || existing.avatarUrl.includes('unsplash') || (firebaseUser.photoURL && existing.avatarUrl !== firebaseUser.photoURL))) {
            existing.avatarUrl = emailAvatar;
            OntologicalStore.updateUser(existing.uid, { avatarUrl: emailAvatar });
            FirestoreSyncService.syncUserProfile(existing).catch(console.warn);
          }
          OntologicalStore.setCurrentUser(existing.uid);
          setCurrentUser(existing);
          setAllUsers(OntologicalStore.getUsers());
          return;
        }

        // 3. Alta Automática: Registrar como "Participante Activo" con expediente en blanco
        let sessionInviteCode: string | null = null;
        let sessionWorkshopId = 'taller-1-raiz';
        let sessionGroupName = 'Certeza, Fronteras & Dirección Personal';
        let sessionTicketCode: string | null = null;

        try {
          sessionInviteCode = sessionStorage.getItem('rbc_active_invitation_code');
          const sWid = sessionStorage.getItem('rbc_active_workshop_id');
          if (sWid) sessionWorkshopId = sWid;
          const sGName = sessionStorage.getItem('rbc_active_group_name');
          if (sGName) sessionGroupName = sGName;
          sessionTicketCode = sessionStorage.getItem('rbc_active_ticket_code');
        } catch {
          // Ignore
        }

        const upcomingEvent = OntologicalStore.getUpcomingEvent();
        const resolvedAvatar = getEmailAvatarUrl(email, firebaseUser.displayName, firebaseUser.photoURL);
        const regResult = OntologicalStore.registerForEvent({
          eventId: upcomingEvent.id,
          name: firebaseUser.displayName || email.split('@')[0],
          email: email,
          phone: firebaseUser.phoneNumber || '',
          googleAuthConnected: true,
          avatarUrl: resolvedAvatar,
          userUid: firebaseUser.uid,
        });

        const newParticipantProfile: Partial<User> = {
          title: 'Participante Activo',
          role: 'client',
          status: 'active',
          primaryBreakdown: '',
          notes: sessionInviteCode ? `Auto-asignado con código/enlace: ${sessionInviteCode}` : '',
          company: '',
          programProgress: 1,
          programStep: 1,
          transformationSpacesEnabled: true,
          hasWorkshopsAccess: true,
          hasSessionsAccess: true,
          completedWorkshopIds: [],
          enrolledWorkshopIds: Array.from(new Set(['taller-1-raiz', sessionWorkshopId])),
          workshopMemories: {},
          welcomeMessage: 'Bienvenido a tu Espacio Ontológico de Consultoría RBC.',
          paymentStatus: 'Pago Único',
          programAccessLevel: 'premium',
          programName: sessionGroupName,
          programFee: '$1.500.000 COP',
        };

        OntologicalStore.updateUser(regResult.user.uid, newParticipantProfile);
        const updatedNewUser: User = {
          ...regResult.user,
          ...newParticipantProfile,
        };

        OntologicalStore.confirmEventAttendance(sessionTicketCode || regResult.registration.ticketCode);
        await FirestoreSyncService.syncUserProfile(updatedNewUser).catch(console.warn);
        await FirestoreSyncService.syncEventRegistration(regResult.registration).catch(console.warn);

        OntologicalStore.setCurrentUser(updatedNewUser.uid);
        setCurrentUser(updatedNewUser);
        setAllUsers(OntologicalStore.getUsers());
      }
    });

    return () => {
      window.removeEventListener('rbc-users-updated', handleStoreUsersUpdated);
      window.removeEventListener('rbc-event-registrations-updated', handleStoreRegsUpdated);
      unsubUsers();
      unsubRegs();
      unsubFormsSheets();
      unsubTalleres();
      unsubProgramNodes();
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
            initialEmail={registerInitialEmail}
            isCoachPreview={Boolean(currentUser && currentUser.role === 'coach')}
            onBackToAdmin={handleBackFromRegistrationPortal}
            onEnterPlatform={(user) => {
              if (user) {
                handleLogin(user);
              } else {
                handleBackFromRegistrationPortal();
              }
            }}
            onNavigateToLogin={handleBackFromRegistrationPortal}
          />
        ) : !currentUser ? (
          <>
            <LoginView
              onLogin={handleLogin}
              availableUsers={allUsers}
              onNavigateToRegister={handleOpenRegistrationPortal}
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
              onOpenRegistrationPortal={isCoach ? handleOpenRegistrationPortal : undefined}
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
                  onOpenRegistrationPortal={handleOpenRegistrationPortal}
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

