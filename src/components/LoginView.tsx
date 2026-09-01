import React, { useState } from 'react';
import { User } from '../types';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { ThemeToggle } from './ThemeToggle';
import { AuthenticationSpace } from './AuthenticationSpace';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ScanFace,
  KeyRound,
  Fingerprint,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  availableUsers: User[];
  onNavigateToRegister?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  availableUsers,
  onNavigateToRegister,
}) => {
  const [selectedUser, setSelectedUser] = useState<User>(availableUsers[0]);
  const [authenticatingUser, setAuthenticatingUser] = useState<User | null>(null);

  const handleOpenAuth = (user: User) => {
    setSelectedUser(user);
    setAuthenticatingUser(user);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-12 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black space-y-10 transition-colors duration-200">
      {/* Subtle top branding mark & theme toggle */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs font-light text-gray-400 dark:text-neutral-500 tracking-wider uppercase">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block" />
          RBC Ontología del Lenguaje
        </span>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Coherencia & Transformación Ontológica</span>
          <ThemeToggle variant="pill" showLabel />
        </div>
      </div>

      {/* Hero Header */}
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center pt-2">
        {/* Monogram emblem */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-medium text-lg tracking-widest mb-5 sm:mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.05)] transition-colors">
          RB
        </div>

        {/* Minimalist Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-black dark:text-white leading-tight max-w-2xl mb-3">
          Rengifo Basto
          <span className="block font-light text-gray-400 dark:text-neutral-400 text-2xl sm:text-3xl lg:text-4xl mt-1">
            Consultoría Ontológica
          </span>
        </h1>

        <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed mb-4">
          Acompañamiento directivo de alta fidelidad, integración de la sabiduría emocional y rediseño de conversaciones profundas.
        </p>
      </div>

      {/* AI Advertising Banner for the Next Event in the Schedule */}
      <div className="w-full max-w-5xl mx-auto">
        <PromotionalEventBanner onRegisterInterest={onNavigateToRegister} />
      </div>

      {/* Main Authentication & Profile Selection Card */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Role & Account Selector Card with clean subtle Apple design */}
        <div className="w-full bg-[#F9F9F9] dark:bg-[#18181B] rounded-3xl p-6 sm:p-7 border border-gray-100/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-400 block">
                Perfiles de Acceso Ontológico
              </span>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                Haz <strong className="font-semibold text-black dark:text-white">doble clic</strong> en tu perfil para autenticarte.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-medium text-gray-600 dark:text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Acceso Multi-Factor</span>
              </span>
            </div>
          </div>

          {/* Authentication methods preview badges */}
          <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-2xl bg-white/70 dark:bg-[#1F1F23] border border-gray-100 dark:border-neutral-800 text-[11px] text-gray-600 dark:text-neutral-300 font-light">
            <div className="flex items-center gap-1.5 justify-center">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Cuenta Google</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center border-x border-gray-200/60 dark:border-neutral-700">
              <KeyRound className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Código OTP</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <ScanFace className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Face ID Facial</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {availableUsers.map((user) => {
              const isSelected = selectedUser.uid === user.uid;
              return (
                <div
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  onDoubleClick={() => handleOpenAuth(user)}
                  title="Haz doble clic para abrir el espacio de autenticación"
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 select-none relative ${
                    isSelected
                      ? 'bg-white dark:bg-[#242428] border-black dark:border-white shadow-xs ring-2 ring-black/10 dark:ring-white/20'
                      : 'bg-white/60 dark:bg-[#202024] border-gray-100 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#27272D] hover:border-gray-200 dark:hover:border-neutral-700'
                  }`}
                  id={`profile-card-${user.uid}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover shadow-xs ring-1 ring-black/5 dark:ring-white/10"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[9px] font-bold">
                        {user.role === 'coach' ? 'C' : 'U'}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-black dark:text-white truncate tracking-tight">
                        {user.name}
                      </div>
                      <div className="text-[11px] font-light text-gray-400 dark:text-neutral-400 capitalize truncate">
                        {user.role === 'coach' ? 'Coach Consultor' : 'Cliente Directivo'}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-neutral-500 truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Action trigger button inside card for clear interaction */}
                  <div className="pt-2.5 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-light text-gray-400 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Doble clic para autenticar
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAuth(user);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium hover:opacity-90 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      id={`auth-btn-${user.uid}`}
                    >
                      <Fingerprint className="w-3 h-3" />
                      <span>Autenticar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 font-light">
            <span>Seguridad biométrica e identidad federada Google Workspace</span>
            <span>Versión 2.4</span>
          </div>
        </div>
      </div>

      {/* Authentication Space Modal */}
      {authenticatingUser && (
        <AuthenticationSpace
          user={authenticatingUser}
          onSuccess={(user) => {
            setAuthenticatingUser(null);
            onLogin(user);
          }}
          onBack={() => setAuthenticatingUser(null)}
        />
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-gray-400 dark:text-neutral-500 pt-8 border-t border-gray-100 dark:border-neutral-800">
        <div>
          © {new Date().getFullYear()} Rengifo Basto Consultoría Ontológica. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6">
          <span>Privacidad & Confidencialidad</span>
          <span>ICF level 1</span>
        </div>
      </footer>
    </div>
  );
};


