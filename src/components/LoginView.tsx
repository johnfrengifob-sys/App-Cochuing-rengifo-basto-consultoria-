import React, { useState } from 'react';
import { User } from '../types';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { ThemeToggle } from './ThemeToggle';
import { AuthModal } from './AuthModal';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useTranslation } from '../services/i18n';

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
  const { language, setLanguage, t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User>(availableUsers[0]);
  const [authModalUser, setAuthModalUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAuth = (user: User) => {
    setSelectedUser(user);
    setAuthModalUser(user);
    setIsAuthModalOpen(true);
  };

  const handleSuccessfulAuth = (user: User) => {
    setIsAuthModalOpen(false);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0E] text-black dark:text-neutral-100 flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-12 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black space-y-12 transition-colors duration-200">
      {/* Subtle top branding mark & theme toggle & quick language */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs font-light text-gray-400 dark:text-neutral-500 tracking-wider uppercase">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block" />
          {t.brandTitle} {t.brandSubtitle}
        </span>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick language toggle pill */}
          <div className="flex items-center gap-1 bg-[#F9F9F9] dark:bg-[#18181B] border border-gray-200/80 dark:border-neutral-800 rounded-full p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-medium ${
                language === 'es'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                  : 'text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-medium ${
                language === 'en'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                  : 'text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <span className="hidden md:inline">
            {language === 'es' ? 'Coherencia & Transformación Ontológica' : 'Ontological Coherence & Transformation'}
          </span>
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
          {t.brandTitle}
          <span className="block font-light text-gray-400 dark:text-neutral-400 text-2xl sm:text-3xl lg:text-4xl mt-1">
            {t.brandSubtitle}
          </span>
        </h1>

        <p className="text-xs sm:text-sm font-light text-gray-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed mb-6">
          {language === 'es'
            ? 'Acompañamiento directivo de alta fidelidad, integración de la sabiduría emocional y rediseño de conversaciones profundas.'
            : 'High-fidelity executive coaching, emotional wisdom integration, and profound conversation redesign.'}
        </p>
      </div>

      {/* AI Advertising Banner for the Next Event in the Schedule with single primary Reservation Action */}
      <div className="w-full max-w-5xl mx-auto">
        <PromotionalEventBanner onRegisterInterest={onNavigateToRegister} />
      </div>

      {/* Main Authentication & Profile Selection Card */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Role & Account Selector Card with clean subtle Apple design */}
        <div className="w-full bg-[#F9F9F9] dark:bg-[#18181B] rounded-3xl p-6 sm:p-7 border border-gray-100/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-medium tracking-wider uppercase text-gray-400 dark:text-neutral-400 block">
                {t.selectProfile}
              </span>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 font-light">
                {language === 'es'
                  ? 'Haz doble clic en tu perfil para autenticarte con Google, Código OTP o Reconocimiento Facial.'
                  : 'Double-click your profile to authenticate with Google, OTP Code or Facial Recognition.'}
              </p>
            </div>
            <span className="text-[11px] font-light text-gray-400 dark:text-neutral-400 flex items-center gap-1 shrink-0 ml-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {language === 'es' ? 'Sesión Segura' : 'Secure Session'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {availableUsers.map((user) => {
              const isSelected = selectedUser.uid === user.uid;
              return (
                <div
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  onDoubleClick={() => handleOpenAuth(user)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-white dark:bg-[#242428] border-black dark:border-white shadow-xs ring-1 ring-black dark:ring-white'
                      : 'bg-white/60 dark:bg-[#202024] border-gray-100 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#27272D] hover:border-gray-200 dark:hover:border-neutral-700'
                  }`}
                  title={
                    language === 'es'
                      ? 'Doble clic para autenticar'
                      : 'Double click to authenticate'
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover shadow-xs"
                      />
                      {isSelected && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-black dark:text-white truncate tracking-tight">
                        {user.name}
                      </div>
                      <div className="text-[11px] font-light text-gray-400 dark:text-neutral-400 capitalize truncate">
                        {user.role === 'coach'
                          ? t.roleCoach
                          : language === 'es'
                          ? 'Cliente Directivo'
                          : 'Executive Client'}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-neutral-500 truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Direct action button per card */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 dark:text-neutral-500 font-light flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {language === 'es' ? 'Doble clic para entrar' : 'Double click to enter'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAuth(user);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{language === 'es' ? 'Autenticar' : 'Authenticate'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Factor Authentication Modal with Google, OTP and Facial Scan */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={authModalUser}
        onSuccessLogin={handleSuccessfulAuth}
      />

      {/* Footer */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-gray-400 dark:text-neutral-500 pt-8 border-t border-gray-100 dark:border-neutral-800">
        <div>
          © {new Date().getFullYear()} {t.brandTitle} {t.brandSubtitle}. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </div>
        <div className="flex items-center gap-6">
          <span>{language === 'es' ? 'Privacidad & Confidencialidad' : 'Privacy & Confidentiality'}</span>
          <span>ICF level 1</span>
        </div>
      </footer>
    </div>
  );
};


