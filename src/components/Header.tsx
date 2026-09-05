import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import {
  LogOut,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronRight,
  UserX,
  CalendarX,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  X,
  Users,
  Search,
  ArrowLeft,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { OntologicalStore } from '../services/store';
import { SocialLinksBar } from './SocialLinksBar';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchUser?: (user: User) => void;
  allUsers?: User[];
  isAuditMode?: boolean;
  onReturnToAdmin?: () => void;
  onOpenSettings?: () => void;
  onOpenRegistrationPortal?: () => void;
  onOpenVideoConferences?: () => void;
  onNavigateHome?: () => void;
  onUserUpdated?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers = [],
  isAuditMode = false,
  onReturnToAdmin,
  onOpenSettings,
  onOpenRegistrationPortal,
  onOpenVideoConferences,
  onNavigateHome,
  onUserUpdated,
}) => {
  const isCoach = currentUser.role === 'coach';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelReason, setCancelReason] = useState('Ajuste de tiempos y compromisos laborales');
  const [cancelConsentAcknowledged, setCancelConsentAcknowledged] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteAcknowledge, setDeleteAcknowledge] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const clientsDropdownRef = useRef<HTMLDivElement>(null);
  const [isClientsDropdownOpen, setIsClientsDropdownOpen] = useState(false);
  const [clientFilterQuery, setClientFilterQuery] = useState('');

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (clientsDropdownRef.current && !clientsDropdownRef.current.contains(event.target as Node)) {
        setIsClientsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsClientsDropdownOpen(false);
        setIsCancelModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleSubscription = () => {
    setIsMenuOpen(false);
    setCancelStep(1);
    setCancelReason('Ajuste de tiempos y compromisos laborales');
    setCancelConsentAcknowledged(false);
    setIsCancelModalOpen(true);
  };

  const handleConfirmToggleSubscription = () => {
    if (currentUser.status === 'inactive') {
      OntologicalStore.reactivateUserSubscription(currentUser.uid);
      setNotification({
        message: '¡Suscripción reactivada con éxito! Tu plan formativo vuelve a estar activo.',
        type: 'success',
      });
    } else {
      OntologicalStore.cancelUserSubscription(currentUser.uid);
      setNotification({
        message: 'Suscripción cancelada. Tu estado se ha marcado como pausado/inactivo.',
        type: 'info',
      });
    }
    setIsCancelModalOpen(false);
    onUserUpdated?.();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteAccountClick = () => {
    setIsMenuOpen(false);
    setDeleteStep(1);
    setDeleteAcknowledge(false);
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAccount = () => {
    OntologicalStore.deleteUserAccount(currentUser.uid);
    setIsDeleteModalOpen(false);
    onLogout();
  };

  const isInactive = currentUser.status === 'inactive';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-[#0D0D0E]/70 backdrop-blur-xl border-b border-white/50 dark:border-white/10 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <BrandLogo
            size="sm"
            onClick={onNavigateHome}
            className="transition-transform active:scale-95 cursor-pointer"
          />
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Client Private Space Badge: Visible exclusively to participants */}
          {!isCoach && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Espacio Privado & Confidencial</span>
            </div>
          )}

          {/* Quick Pre-Registration Portal trigger: STRICTLY FOR COACH ONLY */}
          {isCoach && onOpenRegistrationPortal && (
            <button
              id="header-register-portal-coach-button"
              onClick={onOpenRegistrationPortal}
              title="Abrir Portal de Pre-Inscripción de Evento"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-gray-200/80 dark:border-neutral-800 text-xs font-medium text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Portal de Registro</span>
            </button>
          )}

          {/* Dropdown "Clientes" - Synthesized client list for navigation and direct inspection */}
          {(isCoach || isAuditMode) && allUsers.length > 0 && onSwitchUser && (
            <div ref={clientsDropdownRef} className="relative">
              <button
                type="button"
                id="header-clients-dropdown-button"
                onClick={() => setIsClientsDropdownOpen(!isClientsDropdownOpen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shadow-2xs border ${
                  isClientsDropdownOpen || isAuditMode
                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                    : 'bg-white/70 dark:bg-[#18181B]/70 hover:bg-white dark:hover:bg-[#202024] text-neutral-800 dark:text-neutral-200 border-gray-200/80 dark:border-white/10'
                }`}
                title="Menú desplegable de clientes para inspección de espacios"
                aria-expanded={isClientsDropdownOpen}
              >
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">Clientes</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isClientsDropdownOpen || isAuditMode
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {allUsers.filter((u) => u.role === 'client').length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isClientsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isClientsDropdownOpen && (
                <div
                  role="menu"
                  aria-label="Directorio de clientes para supervisión"
                  className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-2xl border border-gray-200/90 dark:border-neutral-700 shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-gray-100 dark:divide-neutral-800"
                >
                  {/* Header info */}
                  <div className="p-3.5 bg-gray-50/60 dark:bg-neutral-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Directorio & Auditoría</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                        Selecciona un cliente para inspeccionar su espacio y simular respuestas.
                      </p>
                    </div>
                    {isAuditMode && onReturnToAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onReturnToAdmin();
                          setIsClientsDropdownOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-semibold hover:opacity-90 transition-all cursor-pointer shrink-0"
                      >
                        Salir de Auditoría
                      </button>
                    )}
                  </div>

                  {/* Search box */}
                  <div className="p-2.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o empresa..."
                        value={clientFilterQuery}
                        onChange={(e) => setClientFilterQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-100/70 dark:bg-neutral-800/70 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-light"
                      />
                    </div>
                  </div>

                  {/* Clients List */}
                  <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                    {/* Coach Option: Return to Coach Console */}
                    {allUsers
                      .filter((u) => u.role === 'coach')
                      .map((coach) => {
                        const isSelected = currentUser.uid === coach.uid;
                        return (
                          <button
                            key={coach.uid}
                            type="button"
                            onClick={() => {
                              onSwitchUser(coach);
                              setIsClientsDropdownOpen(false);
                            }}
                            className={`w-full p-2 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/20'
                                : 'hover:bg-gray-100/80 dark:hover:bg-neutral-800/80'
                            }`}
                          >
                            <img
                              src={coach.avatarUrl}
                              alt={coach.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-black dark:text-white truncate">
                                  {coach.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider">
                                  Master Coach
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 truncate block">
                                Consola Principal de Administración
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}

                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                      Clientes Registrados ({allUsers.filter((u) => u.role === 'client').length})
                    </div>

                    {allUsers
                      .filter((u) => u.role === 'client')
                      .filter(
                        (u) =>
                          u.name.toLowerCase().includes(clientFilterQuery.toLowerCase()) ||
                          (u.company && u.company.toLowerCase().includes(clientFilterQuery.toLowerCase())) ||
                          (u.title && u.title.toLowerCase().includes(clientFilterQuery.toLowerCase()))
                      )
                      .map((client) => {
                        const isSelected = currentUser.uid === client.uid;
                        const statusDotColor =
                          client.status === 'inactive'
                            ? 'bg-rose-500'
                            : client.status === 'waiting'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500';
                        return (
                          <button
                            key={client.uid}
                            type="button"
                            onClick={() => {
                              onSwitchUser(client);
                              setIsClientsDropdownOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500/40'
                                : 'hover:bg-gray-100/80 dark:hover:bg-neutral-800/80'
                            }`}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={client.avatarUrl}
                                alt={client.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-neutral-900 ${statusDotColor}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold text-black dark:text-white truncate">
                                  {client.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md font-mono bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 shrink-0">
                                  Sesión {client.programProgress || 1}/12
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-0.5 font-light">
                                {client.title || client.programName || 'Proceso Ontológico'}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                              <span>Inspeccionar</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle variant="button" />

          {/* Active User Card with Dropdown Menu for Participants */}
          <div ref={menuRef} className="relative pl-2 sm:pl-3 border-l border-gray-100 dark:border-neutral-800">
            <button
              id="participant-profile-menu-trigger"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-gray-100/70 dark:hover:bg-[#1C1C20] transition-all cursor-pointer text-left group"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              title="Menú de cuenta y opciones de participante"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-xs ring-2 ring-gray-100 dark:ring-neutral-700 group-hover:ring-black dark:group-hover:ring-white transition-all"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0D0D0E] ${
                    isInactive ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  title={isInactive ? 'Suscripción Pausada' : 'Suscripción Activa'}
                />
              </div>

              <div className="hidden sm:block text-left pr-0.5">
                <div className="text-xs font-semibold text-black dark:text-white tracking-tight leading-tight flex items-center gap-1">
                  <span>{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 transition-transform duration-200 ${
                      isMenuOpen ? 'rotate-180 text-black dark:text-white' : ''
                    }`}
                  />
                </div>
                <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400 capitalize">
                  {currentUser.role === 'coach' ? 'Coach Admin' : 'Participante'}
                </div>
              </div>

              {/* Mobile chevron trigger */}
              <div className="sm:hidden p-1 text-gray-400 dark:text-neutral-500">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180 text-black dark:text-white' : ''
                  }`}
                />
              </div>
            </button>

            {/* FLOATING DROPDOWN MENU */}
            {isMenuOpen && (
              <div
                id="participant-account-dropdown"
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white/85 dark:bg-[#18181B]/85 backdrop-blur-2xl border border-white/80 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden animate-fade-in text-black dark:text-white"
              >
                {/* User details header inside dropdown */}
                <div className="p-4 bg-gray-50/70 dark:bg-[#1E1E22]/60 border-b border-gray-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-neutral-700 shadow-2xs"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="text-xs font-bold text-black dark:text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isInactive
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {isInactive ? 'Suscripción Inactiva' : 'Suscripción Activa'}
                        </span>
                        <span className="text-[9px] font-medium text-gray-400 dark:text-neutral-500">
                          {currentUser.role === 'coach' ? 'Coach' : '12 Semanas'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="p-2 space-y-1">
                  {/* Option 1: Cerrar Sesión */}
                  <button
                    id="dropdown-logout-button"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#222226] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#26262B] flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-black dark:text-white">
                        Cerrar Sesión
                      </div>
                      <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400">
                        Salir de tu espacio personal
                      </div>
                    </div>
                  </button>

                  {/* Actions for Participants */}
                  {!isCoach && (
                    <>
                      {/* Option 2: Cancelar Suscripción */}
                      <button
                        id="dropdown-cancel-subscription-button"
                        type="button"
                        onClick={handleToggleSubscription}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50/80 dark:hover:bg-amber-950/20 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <CalendarX className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-black dark:text-white">
                            {isInactive ? 'Reactivar Suscripción' : 'Cancelar Suscripción'}
                          </div>
                          <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400">
                            {isInactive
                              ? 'Reanudar programa y talleres'
                              : 'Pausar cobros y plan del programa'}
                          </div>
                        </div>
                      </button>

                      {/* Option 3: Eliminar Cuenta */}
                      <button
                        id="dropdown-delete-account-button"
                        type="button"
                        onClick={handleDeleteAccountClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/20 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <UserX className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                            Eliminar Cuenta
                          </div>
                          <div className="text-[10px] font-light text-gray-500 dark:text-neutral-400">
                            Borrar usuario y registros personales
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>

                {/* Social Channels in Dropdown */}
                <div className="p-3 border-t border-gray-100 dark:border-neutral-800/80 bg-gray-50/40 dark:bg-[#18181B]/40">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-400 mb-2 px-1 flex items-center justify-between">
                    <span>Redes Oficiales</span>
                    <span className="text-[9px] lowercase opacity-60">Facebook • TikTok • YouTube</span>
                  </div>
                  <SocialLinksBar variant="pills" className="w-full justify-start" />
                </div>

                {/* Footer security note */}
                <div className="px-4 py-2.5 bg-gray-50/50 dark:bg-[#141417] border-t border-gray-100 dark:border-neutral-800 text-[10px] font-light text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>RBC Coaching Ontológico • Confidencial</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IN-APP STATUS NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="px-4 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-xl border border-gray-800 dark:border-gray-200 flex items-center gap-3 text-xs max-w-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <p className="leading-snug">{notification.message}</p>
          </div>
        </div>
      )}

      {/* MODAL 1: CANCELAR O REACTIVAR SUSCRIPCIÓN EN DOS PASOS */}
      {isCancelModalOpen && (
        <div
          id="cancel-subscription-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-5 text-black dark:text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isInactive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                }`}>
                  {isInactive ? <CheckCircle2 className="w-6 h-6" /> : <CalendarX className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                    {isInactive ? 'Reactivación' : `Paso ${cancelStep} de 2 • Verificación`}
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white mt-0.5">
                    {isInactive
                      ? 'Reactivar Suscripción al Programa'
                      : cancelStep === 1
                      ? 'Paso 1: Motivo de la Pausa'
                      : 'Paso 2: Confirmar Pausa Definitiva'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isInactive ? (
              <div className="space-y-4">
                <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                  Tu suscripción se encuentra pausada. Al reactivarla, reanudarás tu acceso normal a las convocatorias de talleres, sesiones quincenales 1 a 1 y seguimiento continuo con tu coach.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    id="confirm-toggle-subscription-button"
                    type="button"
                    onClick={handleConfirmToggleSubscription}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs"
                  >
                    Sí, Reactivar Suscripción
                  </button>
                </div>
              </div>
            ) : cancelStep === 1 ? (
              /* PASO 1: MOTIVO Y ACEPTACIÓN DE CONDICIONES */
              <div className="space-y-4">
                <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                  Lamentamos que decidas pausar tu plan formativo. Ayúdanos a entender el motivo y revisa las condiciones antes de continuar al paso de confirmación final:
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-neutral-300 block">
                    Motivo principal de la pausa / cancelación:
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="Ajuste de tiempos y compromisos laborales">Ajuste de tiempos y compromisos laborales</option>
                    <option value="Pausa temporal por motivos personales">Pausa temporal por motivos personales</option>
                    <option value="Fin de objetivos para este ciclo formativo">Fin de objetivos para este ciclo formativo</option>
                    <option value="Motivos financieros o presupuesto">Motivos financieros o presupuesto</option>
                    <option value="Otro motivo">Otro motivo</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 text-[11px] text-gray-600 dark:text-neutral-400 space-y-1">
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Tus derechos como participante:
                  </div>
                  <p>• Conservarás acceso de consulta a los <strong>Cuadernos de Trabajo y Bitácoras</strong> que ya hayas diligenciado.</p>
                  <p>• No se generarán nuevas cuotas automáticas durante la pausa.</p>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelConsentAcknowledged}
                    onChange={(e) => setCancelConsentAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-amber-950 dark:text-amber-200 font-light leading-snug">
                    He leído las condiciones y confirmo mi deseo de avanzar hacia la pausa de mi suscripción.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    Mantener Suscripción Activa
                  </button>
                  <button
                    type="button"
                    disabled={!cancelConsentAcknowledged}
                    onClick={() => setCancelStep(2)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      cancelConsentAcknowledged
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Continuar al Paso 2</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* PASO 2: CONFIRMACIÓN DEFINITIVA */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>¿Confirmas la pausa definitiva de tu plan formativo?</span>
                  </div>
                  <p className="text-[11px] font-light leading-relaxed">
                    Motivo registrado: <strong>{cancelReason}</strong>. Al aplicar este paso, tu estado pasará inmediatamente a <strong>Inactivo / Pausado</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelStep(1)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    ← Volver al Paso 1
                  </button>
                  <button
                    id="confirm-toggle-subscription-button"
                    type="button"
                    onClick={handleConfirmToggleSubscription}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CalendarX className="w-3.5 h-3.5" />
                    <span>Confirmar Pausa Definitiva</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ELIMINAR CUENTA DEFINITIVAMENTE EN DOS PASOS */}
      {isDeleteModalOpen && (
        <div
          id="delete-account-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-2xl rounded-3xl border border-rose-200/80 dark:border-rose-900/60 shadow-2xl p-6 sm:p-7 space-y-5 text-black dark:text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    Paso {deleteStep} de 2 • Verificación Crítica
                  </span>
                  <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                    {deleteStep === 1 ? 'Paso 1: Advertencia de Borrado' : 'Paso 2: Escribe ELIMINAR'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteStep === 1 ? (
              /* PASO 1: ADVERTENCIA DE PÉRDIDA IRREVERSIBLE */
              <div className="space-y-4">
                <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar permanentemente tu cuenta de participante (<strong>{currentUser.name}</strong>)?
                </p>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Esta acción es irreversible:
                  </div>
                  <ul className="list-disc list-inside text-[11px] font-light space-y-0.5 pl-1 text-rose-900/90 dark:text-rose-200/90">
                    <li>Se borrarán tus cuestionarios, bitácoras y reflexiones ontológicas.</li>
                    <li>Perderás el acceso a tus cuadernos de trabajo en la plataforma.</li>
                    <li>Se cancelará tu perfil de participante y se cerrará tu sesión de inmediato.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteAcknowledge}
                    onChange={(e) => setDeleteAcknowledge(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-neutral-300 font-light leading-snug">
                    Comprendo que el borrado de mi cuenta es permanente y no podré recuperar mis datos.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    Cancelar y Mantener
                  </button>
                  <button
                    type="button"
                    disabled={!deleteAcknowledge}
                    onClick={() => setDeleteStep(2)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      deleteAcknowledge
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Continuar al Paso 2</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* PASO 2: VERIFICACIÓN CON PALABRA CLAVE */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                  <p className="font-semibold">
                    Para confirmar y evitar errores involuntarios, por favor escribe la palabra <span className="font-mono font-bold bg-rose-200/80 dark:bg-rose-900 px-1.5 py-0.5 rounded text-rose-900 dark:text-rose-100">ELIMINAR</span> abajo:
                  </p>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Escribe ELIMINAR"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F9F9F9] dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-center tracking-widest uppercase"
                  />
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 text-center block">
                    Debes escribir exactamente la palabra <strong>ELIMINAR</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium text-black dark:text-white transition-colors cursor-pointer"
                  >
                    ← Volver al Paso 1
                  </button>
                  <button
                    id="confirm-delete-account-button"
                    type="button"
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR'}
                    onClick={handleConfirmDeleteAccount}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                      deleteConfirmText.trim().toUpperCase() === 'ELIMINAR'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Eliminar Definitivamente</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


