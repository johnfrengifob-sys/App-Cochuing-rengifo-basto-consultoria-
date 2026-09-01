import React, { useState } from 'react';
import { User } from '../types';
import { LiquidGlassButton } from './LiquidGlassButton';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { ThemeToggle } from './ThemeToggle';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(selectedUser);
    }, 650);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-12 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black space-y-12 transition-colors duration-200">
      {/* Subtle top branding mark & theme toggle */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs font-light text-gray-400 dark:text-neutral-500 tracking-wider uppercase">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block" />
          RBC Ontología del Lenguaje
        </span>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Norberto Levý Framework</span>
          <ThemeToggle variant="pill" showLabel />
        </div>
      </div>

      {/* Hero Header */}
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center pt-4">
        {/* Monogram emblem */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-medium text-lg tracking-widest mb-6 sm:mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.05)] transition-colors">
          RB
        </div>

        {/* Minimalist Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-black dark:text-white leading-tight max-w-2xl mb-3">
          Rengifo Basto
          <span className="block font-light text-gray-400 dark:text-neutral-400 text-2xl sm:text-3xl lg:text-4xl mt-1">
            Consultoría Ontológica
          </span>
        </h1>

        <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed mb-6">
          Acompañamiento directivo de alta fidelidad, integración de la sabiduría emocional y rediseño de conversaciones profundas.
        </p>
      </div>

      {/* AI Advertising Banner for the Next Event in the Schedule */}
      <div className="w-full max-w-5xl mx-auto">
        <PromotionalEventBanner onRegisterInterest={onNavigateToRegister} />
      </div>

      {/* Main Authentication & Profile Selection Card */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Registration callout for new users */}
        {onNavigateToRegister && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-gray-200/60 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-xs font-semibold text-black dark:text-white block">
                ¿Aún no te has inscrito al próximo conversatorio?
              </span>
              <span className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                Reserva tu cupo rápido con tu cuenta de Google antes del evento.
              </span>
            </div>
            <button
              onClick={onNavigateToRegister}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>Reservar Cupo Rápido</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Liquid Glass Google Login Button */}
        <div className="w-full max-w-xs mb-8">
          <LiquidGlassButton
            onClick={handleGoogleAuth}
            isLoading={isAuthenticating}
            className="w-full py-4 text-base"
            icon={
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            }
          >
            Acceder al Portal
          </LiquidGlassButton>
        </div>

        {/* Role & Account Selector Card with clean subtle Apple design */}
        <div className="w-full bg-[#F9F9F9] dark:bg-[#18181B] rounded-3xl p-6 border border-gray-100/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium tracking-wider uppercase text-gray-400 dark:text-neutral-400">
              Seleccionar Perfil de Acceso
            </span>
            <span className="text-[11px] font-light text-gray-400 dark:text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-black dark:text-white" />
              Sesión Segura
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableUsers.map((user) => {
              const isSelected = selectedUser.uid === user.uid;
              return (
                <div
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-white dark:bg-[#242428] border-black dark:border-white shadow-xs ring-1 ring-black dark:ring-white'
                      : 'bg-white/60 dark:bg-[#202024] border-gray-100 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#27272D] hover:border-gray-200 dark:hover:border-neutral-700'
                  }`}
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black dark:text-white truncate tracking-tight">
                      {user.name}
                    </div>
                    <div className="text-[11px] font-light text-gray-400 dark:text-neutral-400 capitalize truncate">
                      {user.role === 'coach' ? 'Coach Consultor' : 'Cliente Directivo'}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0 stroke-[2]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 font-light">
            <span>Perfil activo: <strong className="font-semibold text-black dark:text-white">{selectedUser.name}</strong> ({selectedUser.role.toUpperCase()})</span>
            <button
              onClick={() => onLogin(selectedUser)}
              className="text-black dark:text-white font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              Entrar directo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-gray-400 dark:text-neutral-500 pt-8 border-t border-gray-100 dark:border-neutral-800">
        <div>
          © {new Date().getFullYear()} Rengifo Basto Consultoría Ontológica. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6">
          <span>Privacidad & Confidencialidad</span>
          <span>Ética ICF & FICOP</span>
        </div>
      </footer>
    </div>
  );
};

