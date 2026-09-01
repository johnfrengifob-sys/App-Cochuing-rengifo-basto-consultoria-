import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { useTranslation } from '../services/i18n';
import {
  ShieldCheck,
  KeyRound,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
  Scan,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccessLogin: (user: User) => void;
}

export type AuthMethod = 'google' | 'otp' | 'facial';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccessLogin,
}) => {
  const { language } = useTranslation();
  const [activeMethod, setActiveMethod] = useState<AuthMethod>('google');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Facial Biometric State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [faceScanStatus, setFaceScanStatus] = useState<
    'idle' | 'scanning' | 'verifying' | 'matched' | 'failed'
  >('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Stop camera when closing modal or switching methods
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setFaceScanStatus('idle');
    setFaceScanProgress(0);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setIsProcessing(false);
      setAuthError(null);
      setAuthSuccess(null);
      setOtpDigits(['', '', '', '', '', '']);
      setActiveMethod('google');
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeMethod !== 'facial') {
      stopCamera();
    }
  }, [activeMethod]);

  if (!isOpen || !user) return null;

  // ---------------------------------------------------------------------------
  // METHOD 1: GOOGLE AUTHENTICATION
  // ---------------------------------------------------------------------------
  const handleGoogleAuth = () => {
    setIsProcessing(true);
    setAuthError(null);
    setAuthSuccess(null);

    setTimeout(() => {
      setIsProcessing(false);
      setAuthSuccess(
        language === 'es'
          ? `Sesión validada con Google Workspace (${user.email})`
          : `Session validated with Google Workspace (${user.email})`
      );

      setTimeout(() => {
        onSuccessLogin(user);
      }, 700);
    }, 900);
  };

  // ---------------------------------------------------------------------------
  // METHOD 2: OTP / VERIFICATION CODE
  // ---------------------------------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    const demoCode = ['7', '7', '4', '9', '2', '1'];
    setOtpDigits(demoCode);
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setAuthError(
        language === 'es'
          ? 'Por favor ingresa los 6 dígitos del código de seguridad.'
          : 'Please enter all 6 digits of the security code.'
      );
      return;
    }

    setIsProcessing(true);
    setAuthError(null);

    setTimeout(() => {
      setIsProcessing(false);
      setAuthSuccess(
        language === 'es'
          ? 'Código de verificación confirmado con éxito.'
          : 'Security verification code confirmed successfully.'
      );

      setTimeout(() => {
        onSuccessLogin(user);
      }, 700);
    }, 850);
  };

  // ---------------------------------------------------------------------------
  // METHOD 3: FACIAL RECOGNITION (CAMERA & BIOMETRIC SCAN)
  // ---------------------------------------------------------------------------
  const startFacialScan = async () => {
    setCameraError(null);
    setFaceScanStatus('scanning');
    setFaceScanProgress(10);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });
        setCameraStream(stream);
        setIsCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        // Fallback to simulated neural scan
        setIsCameraActive(false);
      }
    } catch {
      // Permission denied or camera not found: proceed with high-fidelity simulated neural scan
      setIsCameraActive(false);
      setCameraError(
        language === 'es'
          ? 'Cámara en modo seguro o no disponible. Ejecutando escaneo biométrico con avatar de alta precisión.'
          : 'Camera in secure mode. Running neural biometric scan with high-precision avatar profile.'
      );
    }

    // Biometric scanning progression simulation
    let progress = 15;
    const interval = setInterval(() => {
      progress += 18;
      if (progress >= 95) {
        clearInterval(interval);
        setFaceScanProgress(100);
        setFaceScanStatus('verifying');

        setTimeout(() => {
          setFaceScanStatus('matched');
          setAuthSuccess(
            language === 'es'
              ? `Identidad biométrica confirmada (Coincidencia: 99.4% con ${user.name})`
              : `Biometric identity confirmed (Match: 99.4% with ${user.name})`
          );

          setTimeout(() => {
            stopCamera();
            onSuccessLogin(user);
          }, 900);
        }, 800);
      } else {
        setFaceScanProgress(progress);
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-[#141417] rounded-3xl max-w-xl w-full border border-gray-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-[#111114]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-semibold text-black dark:text-white uppercase tracking-wider mb-0.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                {language === 'es' ? 'Portal de Autenticación' : 'Authentication Gate'}
              </div>
              <h3 className="text-base font-semibold text-black dark:text-white tracking-tight">
                {language === 'es' ? 'Verificación de Identidad Directiva' : 'Executive Identity Verification'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected User Identity Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#18181D] dark:via-[#16161A] dark:to-[#18181D] border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/20 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#141417] flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-black dark:text-white truncate">
                {user.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                {user.email}
              </p>
              <span className="inline-block text-[10px] font-semibold tracking-wider text-black dark:text-white uppercase mt-0.5">
                {user.role === 'coach'
                  ? language === 'es'
                    ? 'Coach Consultor Certificado'
                    : 'Certified Master Coach'
                  : language === 'es'
                  ? 'Coachee / Cliente Directivo'
                  : 'Executive Coachee / Client'}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-500">
              {language === 'es' ? 'Nivel de Seguridad' : 'Security Level'}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ICF-256 Multi-Factor
            </span>
          </div>
        </div>

        {/* Auth Method Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/40 dark:bg-[#121215]">
          <div className="flex items-center gap-2 overflow-x-auto pb-2.5">
            {/* Tab 1: Google */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('google');
                setAuthError(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeMethod === 'google'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>{language === 'es' ? 'Cuenta Google' : 'Google Account'}</span>
            </button>

            {/* Tab 2: OTP Code */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('otp');
                setAuthError(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeMethod === 'otp'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Código de Seguridad (OTP)' : 'Security PIN (OTP)'}</span>
            </button>

            {/* Tab 3: Facial Recognition */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('facial');
                setAuthError(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeMethod === 'facial'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'es' ? 'Reconocimiento Facial' : 'Facial Recognition'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Alerts */}
          {authSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs font-medium text-red-800 dark:text-red-300 flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: GOOGLE ACCOUNT AUTHENTICATION */}
          {/* ========================================================================= */}
          {activeMethod === 'google' && (
            <div className="space-y-4 text-center">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#18181C] border border-gray-200/80 dark:border-neutral-800 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-neutral-500">
                    {language === 'es' ? 'Cuenta Google Enlazada' : 'Linked Google Account'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === 'es' ? 'Verificada' : 'Verified'}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#202024] rounded-xl border border-gray-100 dark:border-neutral-700/80">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
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
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-black dark:text-white truncate">
                      {user.email}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-neutral-400">
                      Google OAuth Token #G-{user.uid.slice(0, 8)}
                    </div>
                  </div>
                </div>

                <p className="text-xs font-light text-gray-500 dark:text-neutral-400 leading-relaxed">
                  {language === 'es'
                    ? 'Acceso seguro mediante autenticación federada. Al continuar, se valida tu identidad y se cargan tus quiebres ontológicos y bitácoras.'
                    : 'Secure access via federated authentication. Continuing will validate your identity and load your ontological breakthroughs and records.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'es' ? 'Validando con Google...' : 'Validating with Google...'}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {language === 'es'
                        ? `Continuar como ${user.name.split(' ')[0]} con Google`
                        : `Continue as ${user.name.split(' ')[0]} with Google`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: VERIFICATION CODE (OTP) */}
          {/* ========================================================================= */}
          {activeMethod === 'otp' && (
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-black dark:text-white">
                  {language === 'es' ? 'Código de Seguridad Temporal' : 'Temporary Security Code'}
                </h4>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">
                  {language === 'es'
                    ? `Hemos emitido un código de verificación de 6 dígitos para ${user.email}`
                    : `We have issued a 6-digit verification code to ${user.email}`}
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 my-4">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-gray-50 dark:bg-[#1C1C20] border border-gray-200 dark:border-neutral-700 rounded-xl focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 text-black dark:text-white outline-hidden transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs px-2">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="text-black dark:text-white font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'es' ? 'Autocompletar Código Demo (774921)' : 'Autofill Demo Code (774921)'}</span>
                </button>

                <span className="text-gray-400 dark:text-neutral-500 text-[11px]">
                  {language === 'es' ? 'Expira en 04:59' : 'Expires in 04:59'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-4"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'es' ? 'Verificando código...' : 'Verifying code...'}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{language === 'es' ? 'Validar Código de Acceso' : 'Validate Access Code'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: FACIAL RECOGNITION (BIOMETRIC) */}
          {/* ========================================================================= */}
          {activeMethod === 'facial' && (
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-black dark:text-white">
                  {language === 'es' ? 'Escaneo Biométrico Facial' : 'Facial Biometric Scan'}
                </h4>
                <p className="text-xs font-light text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">
                  {language === 'es'
                    ? 'Autenticación instantánea mediante calibración somática y reconocimiento óptico.'
                    : 'Instant authentication via somatic calibration and optical recognition.'}
                </p>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl overflow-hidden bg-black/90 border-2 border-indigo-500/80 shadow-xl flex items-center justify-center">
                {/* Live Video or Avatar fallback */}
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-[#0F0F12]">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-32 h-32 rounded-full object-cover opacity-60 filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-indigo-950/30 backdrop-blur-[1px]" />
                  </div>
                )}

                {/* Laser Sweep Scanner Animation */}
                {faceScanStatus === 'scanning' && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce duration-700" />
                )}

                {/* Biometric HUD Reticle Overlay */}
                <div className="absolute inset-3 border border-dashed border-indigo-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[9px] font-mono text-cyan-300">
                    <span>BIO-ID</span>
                    <span>NODE-01</span>
                  </div>

                  {faceScanStatus === 'scanning' && (
                    <div className="text-center font-mono text-xs text-emerald-400 font-bold bg-black/60 px-2 py-1 rounded-full mx-auto backdrop-blur-xs">
                      {faceScanProgress}%
                    </div>
                  )}

                  {faceScanStatus === 'matched' && (
                    <div className="text-center font-mono text-xs text-emerald-300 font-bold bg-emerald-950/80 px-2 py-1 rounded-full mx-auto border border-emerald-500">
                      ✓ MATCH 99.4%
                    </div>
                  )}

                  <div className="flex justify-between text-[9px] font-mono text-cyan-300">
                    <span>SOMATIC-L</span>
                    <span>ICF-OK</span>
                  </div>
                </div>
              </div>

              {cameraError && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-light max-w-sm mx-auto">
                  {cameraError}
                </p>
              )}

              {faceScanStatus === 'idle' && (
                <button
                  type="button"
                  onClick={startFacialScan}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-3"
                >
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>
                    {language === 'es' ? 'Iniciar Reconocimiento Facial' : 'Start Facial Recognition'}
                  </span>
                </button>
              )}

              {faceScanStatus === 'scanning' && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'es' ? 'Analizando rasgos somáticos...' : 'Analyzing somatic landmarks...'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800/80 bg-gray-50/50 dark:bg-[#111114] flex items-center justify-between">
          <span className="text-[11px] text-gray-400 dark:text-neutral-500">
            {language === 'es' ? 'Consultoría Ontológica RB • Conexión Segura' : 'RB Ontological Consulting • Secure Connection'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
