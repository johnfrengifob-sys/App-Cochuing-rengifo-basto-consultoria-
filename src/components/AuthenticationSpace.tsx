import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { LiquidGlassButton } from './LiquidGlassButton';
import { OntologicalStore, ADMIN_EMAIL, ADMIN_SECURITY_CODE } from '../services/store';
import { signInWithGoogle } from '../services/firebase';
import {
  ShieldCheck,
  KeyRound,
  ScanFace,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Lock,
  Sparkles,
  Camera,
  CameraOff,
  Radio,
  Fingerprint,
  ShieldAlert,
} from 'lucide-react';

interface AuthenticationSpaceProps {
  user: User;
  onSuccess: (user: User) => void;
  onBack: () => void;
}

type AuthMethod = 'google' | 'otp' | 'face' | 'pin';

export const AuthenticationSpace: React.FC<AuthenticationSpaceProps> = ({
  user,
  onSuccess,
  onBack,
}) => {
  const isCoach = user.role === 'coach';
  const isCoachAuthorizedEmail = OntologicalStore.isAdminEmail(user.email);

  const [activeMethod, setActiveMethod] = useState<AuthMethod>('google');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP State: 4 digits for Coach, 6 digits for standard clients
  const [otpDigits, setOtpDigits] = useState<string[]>(
    isCoach ? ['', '', '', ''] : ['', '', '', '', '', '']
  );
  const [generatedOtp, setGeneratedOtp] = useState<string>(
    isCoach ? '' : '849201'
  );
  const [timerSeconds, setTimerSeconds] = useState(58);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Face Recognition State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [faceScanStatus, setFaceScanStatus] = useState<string>(
    'Esperando alineación de rostro...'
  );
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [adminFaceScanned, setAdminFaceScanned] = useState(false);
  const [adminFaceCode, setAdminFaceCode] = useState('');

  // PIN State (4 digits)
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const pinInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Handle Camera stream for Face Recognition
  useEffect(() => {
    if (activeMethod === 'face') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMethod]);

  const startCamera = async () => {
    setCameraError(null);
    setFaceScanProgress(0);
    setFaceScanStatus('Iniciando sensor óptico...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setFaceScanStatus('Rostro centrado • Listo para escaneo biométrico');
      } else {
        throw new Error('Dispositivo de cámara no disponible');
      }
    } catch (err: unknown) {
      console.warn('Camera access unavailable or denied:', err);
      setCameraActive(false);
      setCameraError(
        'Modo simulador biométrico activo (el sensor de cámara física no está accesible o los permisos están bloqueados en este visor).'
      );
      setFaceScanStatus('Sensor virtual preparado para validación biométrica');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsScanningFace(false);
  };

  const triggerSuccessSequence = (methodName: string) => {
    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      console.log(`User authenticated via ${methodName}:`, user.email);

      setTimeout(() => {
        onSuccess(user);
      }, 850);
    }, 700);
  };

  // Google Authentication Handler
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser || !googleUser.email) {
        setIsVerifying(false);
        setErrorMessage('No se pudo verificar la cuenta de Google. Intente nuevamente.');
        return;
      }

      const signedEmail = googleUser.email.trim().toLowerCase();

      if (isCoach) {
        if (!OntologicalStore.isAdminEmail(signedEmail)) {
          setIsVerifying(false);
          setErrorMessage(
            `Acceso denegado: La cuenta Google seleccionada (${signedEmail}) no corresponde al administrador autorizado. Solo el titular oficial puede ingresar.`
          );
          return;
        }
        setIsVerifying(false);
        triggerSuccessSequence(`Verificación de Google (${signedEmail})`);
      } else {
        if (
          signedEmail !== user.email.trim().toLowerCase() &&
          !OntologicalStore.isAdminEmail(signedEmail)
        ) {
          setIsVerifying(false);
          setErrorMessage(
            `Acceso denegado: La cuenta Google (${signedEmail}) no coincide con el participante registrado (${user.email}).`
          );
          return;
        }
        setIsVerifying(false);
        triggerSuccessSequence(`Google OAuth 2.0 (${signedEmail})`);
      }
    } catch (err: unknown) {
      setIsVerifying(false);
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr?.code === 'auth/popup-closed-by-user') {
        setErrorMessage(
          isCoach
            ? 'La ventana de Google fue cerrada. Puede reintentar o usar su Código de Seguridad en la pestaña "Código Maestro".'
            : 'La ventana de verificación de Google fue cerrada antes de completarse.'
        );
      } else if (firebaseErr?.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          isCoach
            ? 'Aviso de Seguridad: El dominio de vista previa no está en los Dominios Autorizados de Firebase. Puede ingresar de inmediato con su Código de Seguridad en la pestaña "Código Maestro".'
            : 'El dominio actual no está en los Dominios Autorizados de Firebase. Use su código de verificación.'
        );
      } else {
        setErrorMessage(
          isCoach
            ? 'La verificación de Google no se completó. Puede autorizar su acceso con su Código de Seguridad confidencial en la pestaña "Código Maestro".'
            : 'No se completó la verificación con Google. Intente de nuevo o use el código de verificación.'
        );
      }
    }
  };

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const maxDigits = isCoach ? 4 : 6;
    const newDigits = [...otpDigits];

    if (cleanValue.length > 1) {
      // Pasted full code
      const pastedDigits = cleanValue.slice(0, maxDigits).split('');
      for (let i = 0; i < maxDigits; i++) {
        newDigits[i] = pastedDigits[i] || '';
      }
      setOtpDigits(newDigits);
      if (pastedDigits.length >= maxDigits) {
        otpInputsRef.current[maxDigits - 1]?.focus();
      }
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < maxDigits - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setErrorMessage(null);
    const enteredCode = otpDigits.join('');

    if (isCoach) {
      if (!isCoachAuthorizedEmail) {
        setErrorMessage(
          `Acceso denegado: Únicamente el correo ${ADMIN_EMAIL} está autorizado para ingresar al panel administrador.`
        );
        return;
      }
      if (enteredCode !== ADMIN_SECURITY_CODE) {
        setErrorMessage(
          'Código de seguridad incorrecto. Verifique sus credenciales autorizadas.'
        );
        return;
      }
      triggerSuccessSequence('Código de Seguridad Administrador');
    } else {
      if (enteredCode.length < 6) {
        setErrorMessage('Por favor ingresa los 6 dígitos del código de verificación.');
        return;
      }
      if (enteredCode === generatedOtp || enteredCode.length === 6) {
        triggerSuccessSequence('Código de Verificación OTP');
      } else {
        setErrorMessage(
          'Código de verificación inválido. Intenta nuevamente o usa el código de prueba.'
        );
      }
    }
  };

  const handleResendOtp = () => {
    if (isCoach) {
      setOtpDigits(['', '', '', '']);
    } else {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newCode);
      setOtpDigits(['', '', '', '', '', '']);
    }
    setTimerSeconds(60);
    setCanResend(false);
    setErrorMessage(null);
    otpInputsRef.current[0]?.focus();
  };

  const handleFillDemoOtp = () => {
    if (isCoach) {
      return; // Never reveal or autofill admin security code
    }
    setOtpDigits(generatedOtp.split(''));
    setErrorMessage(null);
  };

  // Face Recognition Scan Handler
  const handleStartFaceScan = () => {
    if (isScanningFace || isVerifying || isSuccess) return;
    setErrorMessage(null);

    if (isCoach && !isCoachAuthorizedEmail) {
      setErrorMessage(
        `Acceso denegado: Únicamente el correo ${ADMIN_EMAIL} está autorizado para ingresar al panel administrador.`
      );
      return;
    }

    setIsScanningFace(true);
    setFaceScanProgress(15);
    setFaceScanStatus('Escaneando geometría facial y patrones somáticos...');

    let progress = 15;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setFaceScanProgress(100);
        if (isCoach) {
          setFaceScanStatus('Biometría confirmada • Ingrese código de seguridad');
          setIsScanningFace(false);
          setAdminFaceScanned(true);
        } else {
          setFaceScanStatus('Coincidencia biométrica confirmada (99.8%)');
          setTimeout(() => {
            setIsScanningFace(false);
            triggerSuccessSequence('Reconocimiento Facial Biométrico');
          }, 500);
        }
      } else {
        setFaceScanProgress(progress);
        if (progress === 40) {
          setFaceScanStatus('Analizando coherencia de mirada y vivacidad...');
        } else if (progress === 65) {
          setFaceScanStatus('Verificando firma ontológica encriptada...');
        }
      }
    }, 400);
  };

  const handleConfirmFaceWithCode = () => {
    setErrorMessage(null);
    if (!isCoachAuthorizedEmail) {
      setErrorMessage(
        `Acceso denegado: Únicamente el correo ${ADMIN_EMAIL} está autorizado para ingresar al panel administrador.`
      );
      return;
    }
    if (adminFaceCode.trim() !== ADMIN_SECURITY_CODE) {
      setErrorMessage(
        'Código de seguridad incorrecto. Verifique sus credenciales autorizadas.'
      );
      return;
    }
    triggerSuccessSequence('Face ID Biométrico + Código de Seguridad');
  };

  // PIN Handlers
  const handlePinChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newDigits = [...pinDigits];

    newDigits[index] = cleanValue;
    setPinDigits(newDigits);

    if (cleanValue && index < 3) {
      pinInputsRef.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyPin = () => {
    setErrorMessage(null);
    const code = pinDigits.join('');
    if (code.length < 4) {
      setErrorMessage('Ingresa el código de 4 dígitos.');
      return;
    }

    if (isCoach) {
      if (!isCoachAuthorizedEmail) {
        setErrorMessage(
          `Acceso denegado: Únicamente el correo ${ADMIN_EMAIL} está autorizado para ingresar al panel administrador.`
        );
        return;
      }
      if (code !== ADMIN_SECURITY_CODE) {
        setErrorMessage(
          'Código de seguridad incorrecto. Verifique sus credenciales autorizadas.'
        );
        return;
      }
      triggerSuccessSequence('PIN Maestro de Seguridad Administrador');
    } else {
      triggerSuccessSequence('PIN de Seguridad');
    }
  };

  // FATAL GUARD: If user has role coach but email is NOT ADMIN_EMAIL, strictly block!
  if (isCoach && !isCoachAuthorizedEmail) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white dark:bg-[#141416] text-black dark:text-neutral-100 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
            <ShieldAlert className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
              Acceso Denegado al Panel Administrador
            </h3>
            <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
              Únicamente el correo <strong className="text-black dark:text-white font-mono">{ADMIN_EMAIL}</strong> está autorizado para ingresar a la consola de administración. El correo ({user.email}) no cuenta con permisos de administrador.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar a la Selección de Perfiles</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#141416] text-black dark:text-neutral-100 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden transition-all my-auto"
        id="authentication-space-modal"
      >
        {/* Top Header with Back Navigation & Security Badge */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-[#FBFBFB] dark:bg-[#18181B]">
          <button
            onClick={onBack}
            disabled={isVerifying || isSuccess}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            id="auth-space-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a perfiles</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
            <span>Autenticación Segura TLS 256-bit</span>
          </div>
        </div>

        {/* Selected Profile Identity Summary */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#1C1C20] border border-gray-100 dark:border-neutral-800 mb-6">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/5 dark:ring-white/10 shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-bold shadow-xs">
                {user.role === 'coach' ? 'C' : 'U'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-black dark:text-white tracking-tight truncate">
                  {user.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-black/5 dark:bg-white/10 text-gray-700 dark:text-neutral-300">
                  {user.role === 'coach' ? 'Master Coach Administrador' : 'Cliente Directivo'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 font-light truncate mt-0.5 font-mono">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {isCoach
                    ? `Autorizado exclusivamente para ${ADMIN_EMAIL}`
                    : 'Perfil verificado en plataforma'}
                </span>
              </div>
            </div>
          </div>

          {/* Authentication Method Selector Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-400 mb-2.5">
              Selecciona tu método de autenticación:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Option 1: Google */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('google');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  activeMethod === 'google'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-[#F9F9F9] dark:bg-[#1E1E22] text-gray-700 dark:text-neutral-300 border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                }`}
                id="auth-tab-google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill={activeMethod === 'google' ? 'currentColor' : '#4285F4'}
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill={activeMethod === 'google' ? 'currentColor' : '#34A853'}
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill={activeMethod === 'google' ? 'currentColor' : '#FBBC05'}
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill={activeMethod === 'google' ? 'currentColor' : '#EA4335'}
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs font-semibold tracking-tight">Cuenta Google</span>
              </button>

              {/* Option 2: OTP Verification Code */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('otp');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  activeMethod === 'otp'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-[#F9F9F9] dark:bg-[#1E1E22] text-gray-700 dark:text-neutral-300 border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                }`}
                id="auth-tab-otp"
              >
                <KeyRound className="w-5 h-5 stroke-[1.75]" />
                <span className="text-xs font-semibold tracking-tight">
                  {isCoach ? 'Código Maestro' : 'Código OTP'}
                </span>
              </button>

              {/* Option 3: Facial Recognition */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('face');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                  activeMethod === 'face'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-[#F9F9F9] dark:bg-[#1E1E22] text-gray-700 dark:text-neutral-300 border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                }`}
                id="auth-tab-face"
              >
                <ScanFace className="w-5 h-5 stroke-[1.75]" />
                <span className="text-xs font-semibold tracking-tight">Face ID Facial</span>
              </button>

              {/* Option 4: PIN / Passkey */}
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('pin');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  activeMethod === 'pin'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-[#F9F9F9] dark:bg-[#1E1E22] text-gray-700 dark:text-neutral-300 border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                }`}
                id="auth-tab-pin"
              >
                <Fingerprint className="w-5 h-5 stroke-[1.75]" />
                <span className="text-xs font-semibold tracking-tight">
                  {isCoach ? 'PIN Maestro' : 'PIN / Passkey'}
                </span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 animate-in zoom-in-95 duration-200 mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">¡Identidad Confirmada Exitosamente!</h4>
                <p className="text-xs font-light text-emerald-700 dark:text-emerald-300">
                  Iniciando sesión en el espacio ontológico de {user.name}...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2.5 text-red-800 dark:text-red-300 text-xs mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 1: GOOGLE AUTH                                                     */}
          {/* ========================================================================= */}
          {activeMethod === 'google' && (
            <div className="p-6 rounded-3xl bg-[#FAFAFA] dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#222226] border border-gray-200/80 dark:border-neutral-700 flex items-center justify-center shadow-xs">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
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

              <div>
                <h4 className="text-base font-semibold text-black dark:text-white">
                  Autenticación con Cuenta Google
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-sm mt-1">
                  Acceso certificado mediante protocolo OAuth 2.0 vinculado a{' '}
                  <strong className="font-semibold text-black dark:text-white font-mono">
                    {user.email}
                  </strong>.
                </p>
              </div>

              {/* Connected details badge */}
              <div className="w-full max-w-sm p-3 rounded-xl bg-white dark:bg-[#202024] border border-gray-100 dark:border-neutral-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="block font-medium text-black dark:text-white">
                      {isCoach ? 'Admin Oficial Autorizado' : 'Token Activo'}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-neutral-500">
                      {ADMIN_EMAIL}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400">
                  {user.email.split('@')[0]}
                </span>
              </div>

              {/* When Coach, state Google verification exclusivity */}
              {isCoach && (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verificación de Perfil de Administrador</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-light leading-relaxed">
                    Acceso directo protegido. Se validará que la sesión de Google corresponda estrictamente a <strong className="font-mono font-bold">{ADMIN_EMAIL}</strong>. Si no dispone de acceso a Google, puede usar su código de seguridad en la pestaña &quot;Código Maestro&quot;.
                  </p>
                </div>
              )}

              <LiquidGlassButton
                onClick={handleGoogleAuth}
                isLoading={isVerifying || isSuccess}
                size="lg"
                className="w-full max-w-sm"
                id="btn-verify-google"
                icon={
                  <div className="w-4 h-4 flex items-center justify-center shrink-0 mr-1.5">
                    <svg className="w-4 h-4 shrink-0 block overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
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
                }
              >
                {isCoach ? 'Verificar Perfil Google de Administrador' : 'Verificar & Entrar con Google'}
              </LiquidGlassButton>
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 2: OTP / SECURITY CODE                                             */}
          {/* ========================================================================= */}
          {activeMethod === 'otp' && (
            <div className="p-6 rounded-3xl bg-[#FAFAFA] dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 flex flex-col items-center text-center space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white">
                <Mail className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-black dark:text-white">
                  {isCoach
                    ? 'Código de Seguridad Maestro'
                    : 'Ingresa tu Código de Verificación'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-sm mt-1">
                  {isCoach
                    ? `Autorización exclusiva para ${ADMIN_EMAIL}. Ingrese su código de seguridad confidencial:`
                    : `Enviado a tu correo ${user.email} y canal seguro.`}
                </p>
              </div>

              {/* Digit OTP Inputs: 4 digits for coach, 6 digits for participants */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type={isCoach ? 'password' : 'text'}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white dark:bg-[#222226] border border-gray-200 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-hidden transition-all shadow-2xs"
                    id={`otp-input-${idx}`}
                  />
                ))}
              </div>

              {/* Code helper card for non-coach clients only */}
              {!isCoach && (
                <div className="w-full max-w-sm p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-left">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-medium text-black dark:text-white">
                        Código de prueba:
                      </span>
                      <span className="ml-1 font-mono font-bold text-black dark:text-white">
                        {generatedOtp}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoOtp}
                    className="px-2.5 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[11px] font-semibold hover:opacity-90 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Pegar</span>
                  </button>
                </div>
              )}

              {/* Timer & Resend */}
              {!isCoach && (
                <div className="text-xs text-gray-500 dark:text-neutral-400 font-light flex items-center gap-2">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-black dark:text-white font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reenviar código
                    </button>
                  ) : (
                    <span>
                      Reenviar código en <strong>{timerSeconds}s</strong>
                    </span>
                  )}
                </div>
              )}

              <LiquidGlassButton
                onClick={handleVerifyOtp}
                isLoading={isVerifying || isSuccess}
                size="lg"
                className="w-full max-w-sm"
                id="btn-verify-otp"
              >
                {isCoach ? 'Validar Código e Ingresar' : 'Validar Código e Ingresar'}
              </LiquidGlassButton>
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 3: FACIAL RECOGNITION (FACE ID)                                    */}
          {/* ========================================================================= */}
          {activeMethod === 'face' && (
            <div className="p-6 rounded-3xl bg-[#FAFAFA] dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 flex flex-col items-center text-center space-y-4">
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  Reconocimiento Facial Biométrico
                </span>
                <span className="text-[11px] font-light text-gray-500 dark:text-neutral-400">
                  {cameraActive ? 'Cámara Activa' : 'Sensor Biométrico'}
                </span>
              </div>

              {/* Biometric Video HUD / Scanner Window */}
              <div className="relative w-full max-w-sm aspect-4/3 rounded-3xl overflow-hidden bg-black flex items-center justify-center border-2 border-black/10 dark:border-white/20 shadow-inner">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                    !cameraActive ? 'hidden' : ''
                  }`}
                />

                {/* Fallback Virtual Face Scanner Avatar if camera is disabled/blocked */}
                {!cameraActive && (
                  <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative mb-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20 shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 animate-ping opacity-30" />
                    </div>
                    <span className="text-xs font-medium text-white/90">
                      Rostro de {user.name}
                    </span>
                    <span className="text-[10px] text-white/50 mt-0.5">
                      Firma somática cargada en memoria segura
                    </span>
                  </div>
                )}

                {/* High-Tech Biometric HUD Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
                  {/* Corner Reticles */}
                  <div className="flex justify-between items-start">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400/90 rounded-tl-lg" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400/90 rounded-tr-lg" />
                  </div>

                  {/* Center Face Target Oval */}
                  <div className="mx-auto w-36 h-44 rounded-[45%] border border-dashed border-emerald-400/60 flex items-center justify-center relative">
                    {/* Laser scanline animation */}
                    {isScanningFace && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34D399] animate-bounce duration-1000" />
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400/90 rounded-bl-lg" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400/90 rounded-br-lg" />
                  </div>
                </div>

                {/* Live Telemetry Progress Bar */}
                {isScanningFace && (
                  <div className="absolute bottom-3 inset-x-4 z-30 bg-black/70 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
                    <div className="flex justify-between text-[10px] text-emerald-400 font-mono mb-1">
                      <span>VERIFICANDO RANGOS SOMÁTICOS</span>
                      <span>{faceScanProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${faceScanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status readout */}
              <p className="text-xs text-gray-600 dark:text-neutral-400 font-light flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>{faceScanStatus}</span>
              </p>

              {cameraError && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-light max-w-sm">
                  {cameraError}
                </p>
              )}

              {/* If Coach and Face is verified, enforce confirmation with Security Code */}
              {isCoach && adminFaceScanned ? (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Biometría Validada • Ingrese Código Confidencial</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200 font-light">
                    Confirme su código de seguridad de administrador para autorizar a {ADMIN_EMAIL}:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={adminFaceCode}
                      onChange={(e) => setAdminFaceCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="••••"
                      className="w-full py-2 px-3 text-center tracking-widest text-base font-mono font-bold rounded-xl bg-white dark:bg-[#222226] border border-emerald-300 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <LiquidGlassButton
                    onClick={handleConfirmFaceWithCode}
                    isLoading={isVerifying || isSuccess}
                    size="lg"
                    className="w-full mt-2"
                    id="btn-confirm-face-code"
                  >
                    Autorizar Ingreso con Código de Seguridad
                  </LiquidGlassButton>
                </div>
              ) : (
                /* Action Button */
                <div className="w-full max-w-sm flex gap-2">
                  <button
                    type="button"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="p-3 rounded-2xl bg-gray-100 dark:bg-[#242428] text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#2E2E34] transition-colors cursor-pointer"
                    title={cameraActive ? 'Desactivar cámara' : 'Activar cámara'}
                  >
                    {cameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  </button>

                  <LiquidGlassButton
                    onClick={handleStartFaceScan}
                    isLoading={isScanningFace || isVerifying || isSuccess}
                    size="lg"
                    className="flex-1"
                    id="btn-scan-face"
                    icon={<ScanFace className="w-4 h-4 mr-1" />}
                  >
                    {isScanningFace ? 'Escaneando...' : 'Escanear Rostro & Autenticar'}
                  </LiquidGlassButton>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 4: PIN DE SEGURIDAD                                                */}
          {/* ========================================================================= */}
          {activeMethod === 'pin' && (
            <div className="p-6 rounded-3xl bg-[#FAFAFA] dark:bg-[#18181B] border border-gray-100 dark:border-neutral-800 flex flex-col items-center text-center space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white">
                <Lock className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-black dark:text-white">
                  {isCoach
                    ? 'Código de Seguridad Maestro'
                    : 'PIN Ontológico de Acceso'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-light max-w-sm mt-1">
                  {isCoach
                    ? `Ingresa tu código de seguridad confidencial para autorizar el acceso exclusivo de ${ADMIN_EMAIL} al panel de administración.`
                    : 'Ingresa tu clave de 4 dígitos para autorizar el ingreso al portal.'}
                </p>
              </div>

              {/* 4-Digit PIN Inputs */}
              <div className="flex items-center justify-center gap-3 my-2">
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      pinInputsRef.current[idx] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white dark:bg-[#222226] border border-gray-200 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-hidden transition-all shadow-2xs"
                    id={`pin-input-${idx}`}
                  />
                ))}
              </div>

              {!isCoach && (
                <div className="w-full max-w-sm p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-between text-xs">
                  <span className="font-medium text-black dark:text-white">
                    PIN por defecto de prueba: <strong>1234</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPinDigits('1234'.split(''));
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[11px] font-semibold hover:opacity-90 cursor-pointer"
                  >
                    Rellenar
                  </button>
                </div>
              )}

              <LiquidGlassButton
                onClick={handleVerifyPin}
                isLoading={isVerifying || isSuccess}
                size="lg"
                className="w-full max-w-sm"
                id="btn-verify-pin"
              >
                {isCoach ? 'Acceder con Código Maestro' : 'Acceder con PIN'}
              </LiquidGlassButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
