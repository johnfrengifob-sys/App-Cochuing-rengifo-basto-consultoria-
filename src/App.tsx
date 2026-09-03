/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from './types';
import { OntologicalStore } from './services/store';
import { ThemeManager } from './services/theme';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { ClientDashboard } from './components/ClientDashboard';
import { CoachDashboard } from './components/CoachDashboard';
import { WebhookConfigModal } from './components/WebhookConfigModal';
import { EventRegistrationLanding } from './components/EventRegistrationLanding';
import { VideoConferenceModal } from './components/VideoConferenceModal';

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>(() => OntologicalStore.getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    OntologicalStore.getCurrentUser()
  );
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
    // Strict isolation: only the coach/administrator has access to switch or supervise workspaces
    if (currentUser?.role !== 'coach') {
      console.warn('Acceso denegado: sólo el administrador puede cambiar de perfil.');
      return;
    }
    OntologicalStore.setCurrentUser(user.uid);
    setCurrentUser(user);
    refreshUsers();
  };

  // If user requested the dedicated Pre-Event Registration Landing Page
  if (viewMode === 'register') {
    return (
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
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          availableUsers={allUsers}
          onNavigateToRegister={() => setViewMode('register')}
          onOpenVideoConferences={() => setIsVideoConferencesOpen(true)}
        />
        <VideoConferenceModal
          isOpen={isVideoConferencesOpen}
          onClose={() => setIsVideoConferencesOpen(false)}
          currentUser={null}
        />
      </>
    );
  }

  const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
  const clients = safeAllUsers.filter((u) => u && u.role === 'client');
  const isCoach = currentUser.role === 'coach';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col transition-colors duration-200">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={isCoach ? handleSwitchUser : undefined}
        allUsers={isCoach ? allUsers : []}
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

      <WebhookConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <VideoConferenceModal
        isOpen={isVideoConferencesOpen}
        onClose={() => setIsVideoConferencesOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

