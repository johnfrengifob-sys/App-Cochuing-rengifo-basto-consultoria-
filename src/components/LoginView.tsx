import React, { useState } from 'react';
import { User } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { AuthenticationSpace } from './AuthenticationSpace';
import { BrandLogo } from './BrandLogo';
import { OntologicalStore, COMPANY_INFO, ADMIN_EMAIL, ADMIN_SECURITY_CODE } from '../services/store';
import { signInWithGoogle } from '../services/firebase';
import { FirestoreSyncService } from '../services/firestoreSync';
import { SocialLinksBar } from './SocialLinksBar';
import { PromotionalEventBanner } from './PromotionalEventBanner';
import {
  Sparkles,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  availableUsers: User[];
  onNavigateToRegister?: (email?: string) => void;
  onOpenVideoConferences?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  availableUsers,
  onNavigateToRegister,
}) => {
  // Navigation mode: 'participant' or 'admin'
  const [activeTab, setActiveTab] = useState<'participant' | 'admin'>('participant');

  // Participant mode: 'login' (Ingreso estándar) vs 'register' (Crear cuenta nueva)
  const [participantMode, setParticipantMode] = useState<'login' | 'register'>('login');

  // Email input and verification state
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Independent Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [showRegPin, setShowRegPin] = useState(false);
  const [regInterest, setRegInterest] = useState('Certeza, Fronteras & Dirección Personal');
  const [regSaveForFuture, setRegSaveForFuture] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [createdAccountUser, setCreatedAccountUser] = useState<User | null>(null);

  // Authenticating user target for MFA modal
  const [authenticatingUser, setAuthenticatingUser] = useState<User | null>(null);

  // Master Coach / Admin user
  const coachUser = availableUsers.find((u) => u.role === 'coach') || {
    uid: 'coach-1',
    name: 'John Fredy Rengifo Basto',
    email: ADMIN_EMAIL,
    role: 'coach' as const,
    title: 'Consultor Ontológico Senior & Master Coach',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    joinedAt: '2023-01-10',
  };

  // Direct Admin Security Code state
  const [adminQuickCode, setAdminQuickCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminQuickError, setAdminQuickError] = useState<string | null>(null);

  // Handle participant email and optional PIN verification
  const handleVerifyEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setAuthError('Por favor ingresa tu correo electrónico para continuar.');
      return;
    }

    // If user enters the admin email, route seamlessly to admin tab
    if (OntologicalStore.isAdminEmail(trimmed)) {
      setActiveTab('admin');
      setAdminQuickError(null);
      return;
    }

    setIsVerifying(true);

    try {
      let foundUser = OntologicalStore.getUserByEmail(trimmed);
      if (!foundUser) {
        foundUser = await FirestoreSyncService.findUserInFirestoreByEmail(trimmed);
        if (foundUser) {
          OntologicalStore.mergeUsersFromFirestore([foundUser]);
        }
      }

      if (!foundUser) {
        setIsVerifying(false);
        setAuthError(
          `El correo "${trimmed}" no se encuentra registrado. Puedes crear tu cuenta gratis a continuación.`
        );
        return;
      }

      // If user provided their personal PIN directly in the form
      if (pinInput.trim()) {
        const pinAuth = OntologicalStore.authenticateWithPin(trimmed, pinInput.trim());
        setIsVerifying(false);
        if (!pinAuth.success || !pinAuth.user) {
          setAuthError(pinAuth.error || 'PIN de seguridad incorrecto.');
          return;
        }
        onLogin(pinAuth.user);
        return;
      }

      // If no PIN provided, open the verification modal (Google, OTP, PIN)
      setIsVerifying(false);
      setAuthenticatingUser(foundUser);
    } catch {
      setIsVerifying(false);
      setAuthError('Ocurrió un error al verificar la cuenta. Por favor intenta de nuevo.');
    }
  };

  // Unified Google User Authentication Processor
  const processSuccessfulGoogleUser = async (
    emailRaw: string,
    displayName?: string | null,
    photoURL?: string | null,
    uid?: string,
    phoneNumber?: string | null
  ) => {
    const email = emailRaw.trim().toLowerCase();
    setIsVerifying(false);
    setAuthError(null);

    // 1. If Admin / Master Coach:
    if (OntologicalStore.isAdminEmail(email)) {
      onLogin(coachUser);
      return;
    }

    // 2. If attempting to access Admin tab with a non-admin Google account:
    if (activeTab === 'admin') {
      setAuthError(
        `La cuenta Google ("${email}") no corresponde al administrador autorizado. Solo el titular oficial puede ingresar al panel de dirección.`
      );
      return;
    }

    // 3. For any client or participant:
    // A. Check existing locally or in Firestore
    let existing = OntologicalStore.getUserByEmail(email);
    if (!existing) {
      existing = await FirestoreSyncService.findUserInFirestoreByEmail(email);
      if (existing) {
        OntologicalStore.mergeUsersFromFirestore([existing]);
      }
    }
    if (existing && existing.role === 'client') {
      onLogin(existing);
      return;
    }

    // B. Check event registrations
    const registrations = OntologicalStore.getEventRegistrations();
    const reg = registrations.find((r) => r.email.toLowerCase() === email);
    if (reg) {
      const registeredClient = OntologicalStore.getUsers().find((u) => u.email.toLowerCase() === email);
      if (registeredClient && registeredClient.role === 'client') {
        onLogin(registeredClient);
        return;
      }
    }

    // C. New participant authenticated with Google: auto-register and enter
    const upcomingEvent = OntologicalStore.getUpcomingEvent();
    const regResult = OntologicalStore.registerForEvent({
      eventId: upcomingEvent.id,
      name: displayName || email.split('@')[0],
      email: email,
      phone: phoneNumber || '',
      googleAuthConnected: true,
      avatarUrl: photoURL || undefined,
      userUid: uid,
    });

    // Confirm ticket and attendance access
    OntologicalStore.confirmEventAttendance(regResult.registration.ticketCode);

    // Persist new user and registration permanently to Firestore
    await FirestoreSyncService.syncUserProfile(regResult.user).catch((e) => {
      console.warn('Google sign-in user firestore sync notice:', e);
    });
    await FirestoreSyncService.syncEventRegistration(regResult.registration).catch((e) => {
      console.warn('Google sign-in reg firestore sync notice:', e);
    });

    // Broadcast store update events
    window.dispatchEvent(new CustomEvent('rbc-users-updated'));
    window.dispatchEvent(new CustomEvent('rbc-event-registrations-updated'));

    onLogin(regResult.user);
  };

  // Real Firebase Google Sign-In with auto-registration and auto-login
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsVerifying(true);

    try {
      const googleUser = await signInWithGoogle();
      if (googleUser && googleUser.email) {
        await processSuccessfulGoogleUser(
          googleUser.email,
          googleUser.displayName,
          googleUser.photoURL,
          googleUser.uid,
          googleUser.phoneNumber
        );
        return;
      }
      setIsVerifying(false);
      setAuthError('La ventana de Google se cerró antes de completar el acceso.');
    } catch (popupErr: unknown) {
      console.warn('Google sign-in notice:', popupErr);
      setIsVerifying(false);
      setAuthError('No se pudo abrir la ventana de Google (puede estar bloqueada por el navegador). Autoriza las ventanas emergentes o ingresa con tu correo y PIN registrado.');
    }
  };

  // Handle Independent Client Registration
  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegistrationSuccess(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();
    const cleanPin = regPin.trim();

    if (!cleanName || !cleanEmail) {
      setAuthError('Por favor ingresa tu nombre completo y tu correo electrónico.');
      return;
    }

    if (OntologicalStore.isAdminEmail(cleanEmail)) {
      setAuthError('El correo ingresado corresponde al administrador. Ingrese en la pestaña de Administración.');
      return;
    }

    setIsRegistering(true);

    try {
      // 1. Check if user already exists
      let existingUser = OntologicalStore.getUserByEmail(cleanEmail);
      if (!existingUser) {
        existingUser = await FirestoreSyncService.findUserInFirestoreByEmail(cleanEmail);
      }

      if (existingUser) {
        setIsRegistering(false);
        setRegistrationSuccess(
          `¡El correo "${cleanEmail}" ya se encuentra registrado y activo! Puedes ingresar con tu PIN de inmediato.`
        );
        setCreatedAccountUser(existingUser);
        return;
      }

      // 2. Register user in store & event with personal security PIN
      const upcomingEvent = OntologicalStore.getUpcomingEvent();
      const regResult = OntologicalStore.registerForEvent({
        eventId: upcomingEvent.id,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        securityPin: cleanPin || '1234',
        googleAuthConnected: cleanEmail.endsWith('@gmail.com'),
      });

      // Update program interest if custom
      if (regInterest && regInterest !== 'Certeza, Fronteras & Dirección Personal') {
        regResult.user.programName = regInterest;
        const currentUsers = OntologicalStore.getUsers();
        const updatedUsers = currentUsers.map((u) => (u.uid === regResult.user.uid ? regResult.user : u));
        OntologicalStore.saveUsers(updatedUsers);
      }

      // Confirm attendance & ticket
      OntologicalStore.confirmEventAttendance(regResult.registration.ticketCode);

      // 3. Persist permanently to Firestore for future logins
      if (regSaveForFuture) {
        await FirestoreSyncService.syncUserProfile(regResult.user).catch((err) => {
          console.warn('Direct user firestore sync notice:', err);
        });
        await FirestoreSyncService.syncEventRegistration(regResult.registration).catch((err) => {
          console.warn('Direct reg firestore sync notice:', err);
        });
      }

      // 4. Dispatch store update events
      window.dispatchEvent(new CustomEvent('rbc-users-updated'));
      window.dispatchEvent(new CustomEvent('rbc-event-registrations-updated'));

      setIsRegistering(false);
      setRegistrationSuccess(
        `¡Cuenta creada exitosamente! Tu registro con "${cleanEmail}" y tu PIN han quedado guardados de forma segura.`
      );
      setCreatedAccountUser(regResult.user);
    } catch (err) {
      console.error('Registration error:', err);
      setIsRegistering(false);
      setAuthError('Ocurrió un error al guardar tu registro. Por favor intenta de nuevo.');
    }
  };

  // Handle Coach / Admin Login
  const handleAdminLogin = () => {
    setAuthenticatingUser(coachUser);
  };

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-neutral-100 flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black space-y-8 transition-colors duration-200">
      {/* Top branding mark & theme toggle */}
      <div className="w-full max-w-4xl flex justify-between items-center text-xs font-light text-gray-700 dark:text-neutral-300 tracking-wider uppercase bg-white/45 dark:bg-black/35 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 dark:border-white/10 shadow-xs">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block" />
          Consultoría Ontológica
        </span>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden md:inline">Coherencia & Transformación Ontológica</span>
          <ThemeToggle variant="pill" showLabel />
        </div>
      </div>

      {/* Hero Header */}
      <div className="w-full max-w-xl mx-auto text-center flex flex-col items-center">
        <div className="w-full flex items-center justify-center mb-2 sm:mb-3">
          <BrandLogo layout="hero" className="hover:opacity-95 transition-opacity" />
        </div>
        <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
          Acompañamiento ontológico profesional & Espacio Privado Confidencial
        </p>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TALLER ONTOLÓGICO EN CURSO (PromotionalEventBanner)                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="w-full max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black dark:text-white">
              Taller Ontológico en Curso • Acceso Abierto
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Sábado 28 de Marzo • 9:00 AM
          </span>
        </div>

        <PromotionalEventBanner
          variant="landing"
          onRegisterInterest={() => {
            setActiveTab('participant');
            setParticipantMode('register');
            const targetEl = document.getElementById('login-card-container');
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </div>

      {/* Main Authentication Card - Matched Width (max-w-4xl) & Transparent Glass Container */}
      <div id="login-card-container" className="w-full max-w-4xl mx-auto">
        <div className="w-full rounded-3xl p-6 sm:p-8 md:p-10 border border-white/40 dark:border-white/10 shadow-2xl bg-white/40 dark:bg-[#0D0D0E]/60 backdrop-blur-2xl transition-all">
          {activeTab === 'participant' ? (
            participantMode === 'login' ? (
              /* ------------------------------------------------------------------- */
              /* MODE 1: STANDARD CLIENT LOGIN (GOOGLE FIRST OR REGISTERED EMAIL)   */
              /* ------------------------------------------------------------------- */
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
                  {/* Left Column: Welcome & Google Fast Sign-In */}
                  <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Espacio de Consultoría & Bitácoras</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                        Iniciar Sesión
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-300 mt-1.5 font-light leading-relaxed">
                        Accede con un clic a tus sesiones ontológicas, bitácoras de aprendizaje y compromisos activos.
                      </p>
                    </div>

                    {/* Primary Google Sign-In Button */}
                    <div className="space-y-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isVerifying}
                        id="btn-google-sign-in"
                        className="w-full py-3.5 px-5 rounded-2xl border border-gray-300/80 dark:border-neutral-700 bg-white/90 dark:bg-[#1C1C20]/90 hover:bg-white dark:hover:bg-[#25252A] text-black dark:text-white font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-50"
                      >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
                        </div>
                        <span>Continuar con Google (1 Clic)</span>
                      </button>
                    </div>

                    {/* Value Pill */}
                    <div className="p-3.5 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/5 text-xs text-gray-600 dark:text-neutral-400 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Autenticación directa y confidencial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Bitácora personalizada sincronizada en tiempo real</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Email Form Card */}
                  <div className="md:col-span-6 p-5 sm:p-6 rounded-2xl bg-white/50 dark:bg-[#18181B]/50 border border-white/60 dark:border-white/10 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white">
                        O ingresa con tu correo registrado
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                        Escribe tu correo y tu PIN personal de acceso
                      </p>
                    </div>

                    {/* Email & PIN Form */}
                    <form onSubmit={handleVerifyEmail} className="space-y-3">
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => {
                            setEmailInput(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          placeholder="tu-correo@ejemplo.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      </div>

                      <div className="relative">
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={pinInput}
                          onChange={(e) => {
                            setPinInput(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          placeholder="PIN de seguridad (4 dígitos)"
                          maxLength={6}
                          className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        />
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3.5 top-3.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {authError && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1.5 animate-fade-in">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <p className="font-light">{authError}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRegEmail(emailInput.trim());
                              setParticipantMode('register');
                              setAuthError(null);
                            }}
                            className="text-xs font-semibold underline text-rose-800 dark:text-rose-200 hover:opacity-80 block pl-6 cursor-pointer"
                          >
                            ¿Deseas registrar este correo ahora mismo?
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isVerifying ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent" />
                            <span>Verificando credenciales...</span>
                          </>
                        ) : (
                          <>
                            <span>Ingresar a mi cuenta</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Switch to Register Mode */}
                    <div className="pt-3 border-t border-gray-200/60 dark:border-neutral-800 text-center text-xs text-gray-500 dark:text-neutral-400 font-light">
                      ¿No tienes una cuenta aún?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setParticipantMode('register');
                          setAuthError(null);
                        }}
                        className="font-semibold text-black dark:text-white underline hover:opacity-80 cursor-pointer"
                      >
                        Regístrate aquí gratis
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar inside Card */}
                <div className="pt-4 border-t border-white/20 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-neutral-400 font-light">
                  <span>RBC Consultoría Ontológica • Portal de Acceso</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      setAuthError(null);
                    }}
                    className="hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Acceso administrativo RBC</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ------------------------------------------------------------------- */
              /* MODE 2: CLIENT REGISTRATION FORM (NO INVITATION LINK NEEDED)        */
              /* ------------------------------------------------------------------- */
              <div className="space-y-6 animate-fade-in">
                {registrationSuccess && createdAccountUser ? (
                  <div className="p-8 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/30 text-center space-y-4 max-w-lg mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                        ¡Registro Guardado con Éxito!
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 font-light mt-1">
                        {registrationSuccess}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLogin(createdAccountUser)}
                      className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
                    >
                      Ingresar a mi Espacio Ahora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                    {/* Left Column: Register Overview & Google 1-Click */}
                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Registro Libre y Gratuito</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                          Crear Cuenta Nueva
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-300 mt-1.5 font-light leading-relaxed">
                          Regístrate en segundos para tener tu bitácora personal y acceder a los talleres ontológicos.
                        </p>
                      </div>

                      {/* Quick Register with Google */}
                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isVerifying}
                          className="w-full py-3.5 px-4 rounded-2xl border border-gray-300/80 dark:border-neutral-700 bg-white/90 dark:bg-[#1C1C20]/90 hover:bg-white dark:hover:bg-[#25252A] text-black dark:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
                          <span>Registrarme con Google (1 Clic)</span>
                        </button>
                      </div>

                      {/* Switch back to Login Mode */}
                      <div className="pt-2 text-xs text-gray-500 dark:text-neutral-400 font-light">
                        ¿Ya tienes una cuenta registrada?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setParticipantMode('login');
                            setAuthError(null);
                          }}
                          className="font-semibold text-black dark:text-white underline hover:opacity-80 cursor-pointer"
                        >
                          Inicia sesión aquí
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Manual Form */}
                    <div className="md:col-span-7 p-5 sm:p-6 rounded-2xl bg-white/50 dark:bg-[#18181B]/50 border border-white/60 dark:border-white/10 shadow-sm space-y-3.5">
                      <h3 className="text-sm font-bold text-black dark:text-white">
                        O completa tus datos de registro
                      </h3>

                      <form onSubmit={handleDirectRegister} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Tu nombre y apellido"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="tu-correo@ejemplo.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">
                            WhatsApp / Teléfono
                          </label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+57 300 123 4567"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">
                            Crea tu PIN de Seguridad (4 dígitos)
                          </label>
                          <div className="relative">
                            <input
                              type={showRegPin ? 'text' : 'password'}
                              value={regPin}
                              onChange={(e) => setRegPin(e.target.value)}
                              placeholder="Ej: 1234 (para tus futuros ingresos)"
                              maxLength={6}
                              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPin(!showRegPin)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                              {showRegPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-xs text-gray-600 dark:text-neutral-400">
                          <input
                            type="checkbox"
                            id="chk-save-future"
                            checked={regSaveForFuture}
                            onChange={(e) => setRegSaveForFuture(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black dark:focus:ring-white cursor-pointer"
                          />
                          <label htmlFor="chk-save-future" className="cursor-pointer">
                            Guardar mi registro para futuros accesos
                          </label>
                        </div>

                        {authError && (
                          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{authError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isRegistering}
                          className="w-full py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isRegistering ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent" />
                              <span>Creando cuenta...</span>
                            </>
                          ) : (
                            <>
                              <span>Crear Cuenta y Entrar</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* ------------------------------------------------------------------- */
            /* MODE 3: ADMINISTRATOR / MASTER COACH ACCESS                         */
            /* ------------------------------------------------------------------- */
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
                {/* Left Column: Admin Identity & Google Verification */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Dirección & Administración RBC</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                      Acceso Administrador
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-300 mt-1 font-light">
                      Exclusivo Master Coach John Fredy Rengifo Basto • Cuenta Oficial RBC
                    </p>
                  </div>

                  {/* Admin Google verification button */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isVerifying}
                      id="btn-admin-google-login"
                      className="w-full py-3.5 px-4 rounded-2xl border border-gray-300/80 dark:border-neutral-700 bg-white/90 dark:bg-[#1C1C20]/90 hover:bg-white dark:hover:bg-[#25252A] text-black dark:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
                      </div>
                      <span>Verificar con Google Oficial</span>
                    </button>

                    {/* Biometric / Face ID */}
                    <button
                      type="button"
                      onClick={handleAdminLogin}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/50 dark:bg-[#202024]/50 border border-gray-200 dark:border-neutral-800 text-xs text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#25252A] transition-all cursor-pointer flex items-center justify-center gap-2"
                      id="btn-admin-login"
                    >
                      <Fingerprint className="w-4 h-4 text-emerald-500" />
                      <span>Autenticación Biométrica (Face ID / PIN)</span>
                    </button>
                  </div>

                  {/* Switch back to participant */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('participant');
                        setAuthError(null);
                      }}
                      className="text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      <span>Volver al acceso general</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Security Code */}
                <div className="md:col-span-6 p-5 sm:p-6 rounded-2xl bg-white/50 dark:bg-[#18181B]/50 border border-white/60 dark:border-white/10 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">
                      Código de Seguridad Maestro
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 font-light mt-0.5">
                      Ingresa el código PIN numérico de administración
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAdminQuickError(null);
                      if (adminQuickCode.trim() !== ADMIN_SECURITY_CODE) {
                        setAdminQuickError('Código de seguridad maestro incorrecto.');
                        return;
                      }
                      onLogin(coachUser);
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input
                        type={showAdminCode ? 'text' : 'password'}
                        inputMode="numeric"
                        maxLength={8}
                        value={adminQuickCode}
                        onChange={(e) => {
                          setAdminQuickCode(e.target.value.replace(/[^0-9]/g, ''));
                          if (adminQuickError) setAdminQuickError(null);
                        }}
                        placeholder="••••"
                        className="w-full py-2.5 pl-4 pr-11 text-center tracking-widest text-lg font-mono font-bold rounded-xl bg-white/90 dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        id="input-admin-security-code"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminCode(!showAdminCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer p-1"
                      >
                        {showAdminCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {adminQuickError && (
                      <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-[11px] text-red-800 dark:text-red-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>{adminQuickError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      id="btn-admin-code-submit"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Ingresar con Código de Seguridad</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
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
      <footer className="w-full max-w-4xl flex flex-col items-center gap-5 pt-6 pb-2 border-t border-gray-100 dark:border-neutral-800 text-center">
        {/* Contact info bar */}
        <div className="w-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-600 dark:text-neutral-300">
            {/* Dirección */}
            <a
              href={COMPANY_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group hover:underline cursor-pointer"
              title="Abrir ubicación en Google Maps (Manizales, Colombia)"
            >
              <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-500 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              </span>
              <span className="font-light">
                <strong className="font-medium text-black dark:text-white">Dirección:</strong>{' '}
                {COMPANY_INFO.address}, Manizales
              </span>
              <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100" />
            </a>

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

        {/* Social channels */}
        <div className="w-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-black dark:text-white">
              Canales & Redes Oficiales
            </div>
            <div className="text-xs font-light text-gray-500 dark:text-neutral-400">
              Sigue a Rengifo Basto en redes para transmisiones y reflexiones ontológicas.
            </div>
          </div>
          <SocialLinksBar variant="pills" />
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center gap-2 text-xs font-light text-gray-500 dark:text-neutral-400">
          <div className="font-medium text-gray-700 dark:text-neutral-300">
            © 2026 Rengifo Basto Consultoría Ontológica. Todos los derechos reservados.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              ICF Level 1 Accredited
            </span>
            <span>•</span>
            <span>Privacidad & Confidencialidad Profesional</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
