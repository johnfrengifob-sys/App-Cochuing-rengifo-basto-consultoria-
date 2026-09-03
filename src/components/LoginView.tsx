import React, { useState } from 'react';
import { User } from '../types';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import { ThemeToggle } from './ThemeToggle';
import { AuthenticationSpace } from './AuthenticationSpace';
import { BrandLogo } from './BrandLogo';
import { OntologicalStore, COMPANY_INFO } from '../services/store';
import {
  Sparkles,
  ShieldCheck,
  ScanFace,
  KeyRound,
  Fingerprint,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  ChevronRight,
  FileSpreadsheet,
  HelpCircle,
  Video,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  availableUsers: User[];
  onNavigateToRegister?: () => void;
  onOpenVideoConferences?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  availableUsers,
  onNavigateToRegister,
  onOpenVideoConferences,
}) => {
  // Tabs: 'participant' (by email verified in Google Sheets) or 'admin' (Master Coach)
  const [activeTab, setActiveTab] = useState<'participant' | 'admin'>('participant');

  // Participant email authentication state
  const [emailInput, setEmailInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifiedClient, setVerifiedClient] = useState<User | null>(null);

  // Authenticating user target for MFA modal
  const [authenticatingUser, setAuthenticatingUser] = useState<User | null>(null);

  // Coach/Admin user
  const coachUser = availableUsers.find((u) => u.role === 'coach') || {
    uid: 'coach-1',
    name: 'John Fredy Rengifo Basto',
    email: 'johnfrengifob@gmail.com',
    role: 'coach' as const,
    title: 'Consultor Ontológico Senior & Master Coach',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2023-01-10',
  };

  // Sample client emails already in the Google Sheets database for easy preview testing
  const registeredClients = availableUsers.filter((u) => u.role === 'client');

  // Handle participant email verification against Google Sheets / Database
  const handleVerifyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setAuthError('Por favor ingresa tu correo electrónico para verificar tu acceso.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const foundUser = OntologicalStore.getUserByEmail(trimmed);

      if (!foundUser) {
        setIsVerifying(false);
        setVerifiedClient(null);
        setAuthError(
          `El correo "${trimmed}" no se encuentra en el Directorio Maestro de Google Sheets ni en la base de datos de participantes registrados. Verifica que sea el correo con el que te registraste en el conversatorio o solicita tu inscripción.`
        );
        return;
      }

      // If user is a client, strictly grant them access ONLY to their own profile
      setIsVerifying(false);
      setVerifiedClient(foundUser);
      // Launch MFA / Biometric verification for this specific participant
      setAuthenticatingUser(foundUser);
    }, 450);
  };

  // Quick Google Sign-In button simulation (autocompletes email or verifies)
  const handleGoogleSignIn = () => {
    setAuthError(null);
    if (!emailInput) {
      // Pick first registered client or suggest Sofía
      const defaultEmail = registeredClients[0]?.email || 'sofia.restrepo@example.com';
      setEmailInput(defaultEmail);
    }
    setIsVerifying(true);
    setTimeout(() => {
      const emailToSearch = emailInput.trim() || registeredClients[0]?.email || 'sofia.restrepo@example.com';
      const foundUser = OntologicalStore.getUserByEmail(emailToSearch);
      setIsVerifying(false);
      if (foundUser) {
        setVerifiedClient(foundUser);
        setAuthenticatingUser(foundUser);
      } else {
        setAuthError(
          `La cuenta de Google vinculada (${emailToSearch}) no tiene un cupo asignado en Google Sheets. Por favor regístrate en el conversatorio.`
        );
      }
    }, 400);
  };

  // Handle Coach / Admin Login
  const handleAdminLogin = () => {
    setAuthenticatingUser(coachUser);
  };

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-neutral-100 flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-12 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black space-y-10 transition-colors duration-200">
      {/* Subtle top branding mark & theme toggle */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs font-light text-gray-700 dark:text-neutral-300 tracking-wider uppercase bg-white/45 dark:bg-black/35 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 dark:border-white/10 shadow-xs">
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
      <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center pt-2">
        <div className="w-full flex items-center justify-center mb-3 sm:mb-4 transition-all">
          <BrandLogo layout="hero" className="hover:opacity-95 transition-opacity" />
        </div>

        <p className="text-sm sm:text-base font-normal tracking-wide text-gray-700 dark:text-neutral-200 max-w-lg mx-auto leading-relaxed mb-4">
          Acompañamiento ontológico profesional & Espacio Privado Confidencial
        </p>
      </div>

      {/* Advertising Banner for the Next Event in the Schedule */}
      <div className="w-full max-w-5xl mx-auto">
        <PromotionalEventBanner onRegisterInterest={onNavigateToRegister} />
      </div>

      {/* Main Authentication Card - Translucent glass container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full bg-white/75 dark:bg-[#18181B]/75 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/80 dark:border-white/10 shadow-2xl text-left transition-colors">
          {/* Segmented Tab Switcher */}
          <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-2xl mb-8 max-w-md border border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('participant');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'participant'
                  ? 'bg-white/95 dark:bg-[#27272A]/95 text-black dark:text-white shadow-xs font-semibold backdrop-blur-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Acceso de Participante</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white/95 dark:bg-[#27272A]/95 text-black dark:text-white shadow-xs font-semibold backdrop-blur-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Administración RBC</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PARTICIPANT ACCESS (STRICT PRIVACY BY VERIFIED EMAIL)              */}
          {/* ========================================================================= */}
          {activeTab === 'participant' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-fade-in">
              {/* Left Column: Input Form & Verification */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Aislamiento de Perfil & Privacidad ICF</span>
                  </div>
                  <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                    Ingresa con tu Correo Registrado
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 leading-relaxed">
                    Tu acceso valida tu identidad contra el Directorio de Google Sheets. Cada participante accede de forma individual y privada a su propio espacio.
                  </p>
                </div>

                {/* Form Input */}
                <form onSubmit={handleVerifyEmail} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-white mb-1.5">
                      Correo Electrónico (Registrado en Google Sheets)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        placeholder="ejemplo: sofia.restrepo@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs sm:text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                      />
                      <Mail className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Error Banner */}
                  {authError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-2 animate-fade-in">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-semibold block">Acceso Restringido</span>
                          <p className="font-light leading-relaxed">{authError}</p>
                        </div>
                      </div>

                      {onNavigateToRegister && (
                        <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
                          <span className="text-[11px] text-rose-700 dark:text-rose-300">
                            ¿No tienes cupo aún?
                          </span>
                          <button
                            type="button"
                            onClick={onNavigateToRegister}
                            className="px-3 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Inscribirme en el Taller</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Primary Enter Button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    id="btn-verify-participant-email"
                  >
                    {isVerifying ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent" />
                        <span>Verificando en Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Ingresar a mi Espacio Personal</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  {/* Secondary Google SSO Button */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-neutral-500 justify-center">
                      <span className="h-px bg-gray-200 dark:bg-neutral-800 flex-1" />
                      <span>Autenticación federada</span>
                      <span className="h-px bg-gray-200 dark:bg-neutral-800 flex-1" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isVerifying}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#25252A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      <span>Continuar con Cuenta de Google</span>
                    </button>
                  </div>
                </form>

                {/* Verified Client Info Card preview before MFA */}
                {verifiedClient && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202024] border border-emerald-500/30 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                      <img
                        src={verifiedClient.avatarUrl}
                        alt={verifiedClient.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                      />
                      <div>
                        <div className="text-xs font-semibold text-black dark:text-white">
                          {verifiedClient.name}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                          {verifiedClient.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium">
                      Autorizado
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Demo Accounts & Security Features */}
              <div className="lg:col-span-5 space-y-4">
                {/* Discrete testing helper: Quick fill with existing accounts in Google Sheets */}
                {registeredClients.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-[#202024]/60 backdrop-blur-xl border border-white/65 dark:border-white/10 shadow-sm space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Participantes de Demostración (Google Sheets):</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light leading-relaxed">
                      Haz clic en cualquier perfil para autocompletar el correo y probar el ingreso inmediato con aislamiento de datos:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {registeredClients.map((client) => (
                        <button
                          key={client.uid}
                          type="button"
                          onClick={() => {
                            setEmailInput(client.email);
                            setAuthError(null);
                          }}
                          className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                            emailInput.toLowerCase() === client.email.toLowerCase()
                              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-semibold'
                              : 'bg-white/50 dark:bg-[#18181B]/50 backdrop-blur-xs text-gray-700 dark:text-neutral-300 border-white/60 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500'
                          }`}
                          title={`Haz clic para probar el acceso con ${client.name}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-medium truncate">{client.name}</span>
                          </div>
                          <span className="font-mono text-[10px] opacity-75 shrink-0 ml-2">
                            {client.email.split('@')[0]}@...
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidentiality & Platform Benefits */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 backdrop-blur-md border border-emerald-500/20 text-xs text-gray-700 dark:text-neutral-300 space-y-2">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Espacio Privado & Beneficios del Participante</span>
                  </div>
                  <ul className="text-[11px] font-light list-disc list-inside space-y-1 text-gray-600 dark:text-neutral-400">
                    <li>Cuadernos de trabajo en PDF integrados automáticamente.</li>
                    <li>Acceso directo a salas de Google Meet para sesiones en vivo.</li>
                    <li>Historial reflexivo, quiebres ontológicos y metas personales.</li>
                    <li>Acompañamiento confidencial certificado según estándares ICF.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* TAB 2: ADMINISTRATOR ACCESS (MASTER COACH JOHN FREDY RENGIFO BASTO)      */
            /* ========================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-fade-in">
              {/* Left Column: Coach Identity & Authentication */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Control General & Gestión de Clientes</span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                    Acceso Exclusivo Administrador
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-1 leading-relaxed">
                    Solo el Consultor Master Coach tiene acceso al directorio de participantes, sincronización con Google Sheets, quiebres ontológicos y panel de supervisión.
                  </p>
                </div>

                {/* Coach identity card */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#202024]/70 backdrop-blur-xl border border-white/75 dark:border-white/10 flex items-center gap-3.5 shadow-sm">
                  <img
                    src={coachUser.avatarUrl}
                    alt={coachUser.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-black dark:text-white truncate">
                      {coachUser.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                      {coachUser.title}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 truncate mt-0.5">
                      {coachUser.email}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold tracking-wider uppercase">
                    Admin
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="w-full py-3.5 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  id="btn-admin-login"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Autenticar como Master Coach Administrador</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Right Column: Administrative Powers & Capacities */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-[#202024]/60 backdrop-blur-xl border border-white/65 dark:border-white/10 shadow-sm space-y-2.5 text-xs text-gray-600 dark:text-neutral-300">
                  <div className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Facultades de la Consola RBC:</span>
                  </div>
                  <ul className="text-[11px] font-light list-disc list-inside space-y-1.5 text-gray-500 dark:text-neutral-400">
                    <li>Directorio Maestro de Clientes & CRM de Conversatorios</li>
                    <li>Sincronización bidireccional con Google Sheets</li>
                    <li>Supervisión pedagógica y planes de trabajo personalizados</li>
                    <li>Configuración de webhooks en Make / Google Workspace</li>
                    <li>Google Workspace Hub (Sheets, Drive, Meet, Calendar)</li>
                    <li>Copiloto Ontológico Gemini 3.7</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-md border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>Credencial de Demostración:</strong> Acceso pre-configurado para validación integral de la plataforma de consultoría.
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400 dark:text-neutral-500 font-light">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Seguridad Encriptada Google Cloud & Protocolo OAuth 2.0
            </span>
            <span>Versión 2.5 • ICF Accredited</span>
          </div>
        </div>
      </div>

      {/* Authentication Space Modal (MFA, Google, Face ID, OTP) */}
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

      {/* Bottom Information & Footer */}
      <footer className="w-full max-w-5xl flex flex-col items-center gap-6 pt-6 pb-2 border-t border-gray-100 dark:border-neutral-800 text-center">
        {/* Dedicated Contact Information Block */}
        <div className="w-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-3">
            Información de Contacto & Sede
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-600 dark:text-neutral-300">
            {/* Dirección */}
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-black dark:text-white" />
              </span>
              <span className="font-light">
                <strong className="font-medium text-black dark:text-white">Dirección:</strong> {COMPANY_INFO.address}, Bogotá, Colombia
              </span>
            </div>

            {/* Teléfono / WhatsApp */}
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <span className="font-light">
                <strong className="font-medium text-black dark:text-white">Celular:</strong>{' '}
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="hover:underline font-mono text-black dark:text-white font-medium"
                >
                  {COMPANY_INFO.phone}
                </a>
              </span>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                title="Escribir por WhatsApp"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Correo Electrónico */}
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </span>
              <span className="font-light">
                <strong className="font-medium text-black dark:text-white">Correo:</strong>{' '}
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="hover:underline text-gray-600 dark:text-neutral-300"
                >
                  {COMPANY_INFO.email}
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Copyright & Legal Block */}
        <div className="flex flex-col items-center gap-2 text-xs font-light text-gray-500 dark:text-neutral-400">
          <div className="font-medium text-gray-700 dark:text-neutral-300">
            © 2026 Rengifo Basto Consultoría Ontológica. Todos los derechos reservados.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-gray-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              ICF Level 1 Accredited
            </span>
            <span>•</span>
            <span>Privacidad & Confidencialidad Profesional</span>
            <span>•</span>
            <span>Coherencia & Transformación Ontológica</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
