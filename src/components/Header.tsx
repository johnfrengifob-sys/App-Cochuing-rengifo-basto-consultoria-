import React from 'react';
import { User } from '../types';
import { LogOut, Sliders, Sparkles, ShieldCheck, Lock, Video } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchUser?: (user: User) => void;
  allUsers?: User[];
  onOpenSettings?: () => void;
  onOpenRegistrationPortal?: () => void;
  onOpenVideoConferences?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers = [],
  onOpenSettings,
  onOpenRegistrationPortal,
  onOpenVideoConferences,
  onNavigateHome,
}) => {
  const isCoach = currentUser.role === 'coach';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#0D0D0E]/85 backdrop-blur-xl border-b border-gray-100 dark:border-neutral-800 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <BrandLogo
            size="sm"
            onClick={onNavigateHome}
            className="transition-transform active:scale-95"
          />
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Client Private Space Badge: Visible exclusively to participants */}
          {!isCoach && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Espacio Privado & Confidencial ICF</span>
            </div>
          )}

          {/* Direct Video Conferences & Workshops Meet Link modal trigger */}
          {onOpenVideoConferences && (
            <button
              onClick={onOpenVideoConferences}
              title="Enlaces para Videoconferencias & Talleres (Google Meet)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-medium text-blue-700 dark:text-blue-400 transition-all cursor-pointer shadow-2xs"
            >
              <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Salas Meet & Talleres</span>
              <span className="sm:hidden">Meet</span>
            </button>
          )}

          {/* Quick Pre-Registration Portal trigger */}
          {onOpenRegistrationPortal && (
            <button
              onClick={onOpenRegistrationPortal}
              title="Abrir Portal de Pre-Inscripción de Evento"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-gray-200/80 dark:border-neutral-800 text-xs font-medium text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Portal de Registro</span>
            </button>
          )}

          {/* Role switcher: STRICTLY EXCLUSIVE to Coach / Administrator */}
          {isCoach && allUsers.length > 0 && onSwitchUser && (
            <div className="hidden xl:flex items-center gap-1.5 p-1 bg-[#F9F9F9] dark:bg-[#18181B] rounded-full border border-gray-100 dark:border-neutral-800 text-xs">
              <span className="text-[10px] uppercase font-medium tracking-wider text-gray-400 dark:text-neutral-500 px-2.5 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Supervisión Admin:
              </span>
              {allUsers.map((u) => {
                const isActive = u.uid === currentUser.uid;
                return (
                  <button
                    key={u.uid}
                    onClick={() => onSwitchUser(u)}
                    className={`px-3 py-1 rounded-full transition-all text-xs font-medium cursor-pointer ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {u.name.split(' ')[0]} ({u.role === 'coach' ? 'Coach' : 'Cliente'})
                  </button>
                );
              })}
            </div>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle variant="button" />

          {/* Automation & Make Settings: STRICTLY EXCLUSIVE to Coach / Administrator */}
          {isCoach && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Configuración de Automatizaciones & Make (Exclusivo Administrador)"
              className="p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-[#F9F9F9] dark:hover:bg-[#1E1E22] transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}

          {/* Active User Card */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-100 dark:border-neutral-800">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-xs ring-2 ring-gray-100 dark:ring-neutral-700"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-black dark:text-white tracking-tight leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] font-light text-gray-400 dark:text-neutral-400 capitalize">
                {currentUser.role === 'coach' ? 'Coach Administrador' : 'Participante (Espacio Personal)'}
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 sm:p-2.5 rounded-full text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E22] transition-all cursor-pointer ml-0.5"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

