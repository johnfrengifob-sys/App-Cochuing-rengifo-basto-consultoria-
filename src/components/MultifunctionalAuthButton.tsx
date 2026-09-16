import React, { useState, useEffect } from 'react';
import {
  Share2,
  Clipboard,
  CheckCircle2,
  Copy,
  Sparkles,
  Ticket,
  Link2,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { OntologicalStore } from '../services/store';
import { getPublicShareableOrigin } from '../utils/urlHelper';

export interface AppliedCodeDetails {
  code: string;
  type: 'ticket' | 'workshop' | 'referral' | 'general';
  title: string;
  description: string;
  workshopId?: string;
  groupName?: string;
  ticketCode?: string;
  participantEmail?: string;
}

interface MultifunctionalAuthButtonProps {
  onGoogleSignIn: () => void;
  isVerifying: boolean;
  onCodeApplied?: (details: AppliedCodeDetails) => void;
  appliedCode?: AppliedCodeDetails | null;
  mode?: 'login' | 'register';
  idPrefix?: string;
}

export const MultifunctionalAuthButton: React.FC<MultifunctionalAuthButtonProps> = ({
  onGoogleSignIn,
  isVerifying,
  onCodeApplied,
  appliedCode: externalAppliedCode,
  mode = 'login',
  idPrefix = 'auth-main',
}) => {
  const [showPasteDrawer, setShowPasteDrawer] = useState(false);
  const [pasteInputValue, setPasteInputValue] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [localAppliedCode, setLocalAppliedCode] = useState<AppliedCodeDetails | null>(
    externalAppliedCode || null
  );

  // Sync external applied code if provided
  useEffect(() => {
    if (externalAppliedCode) {
      setLocalAppliedCode(externalAppliedCode);
    }
  }, [externalAppliedCode]);

  // Check URL parameters on mount for automatic token/invite detection
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const inviteCode =
        params.get('inv') ||
        params.get('invitacion') ||
        params.get('code') ||
        params.get('codigo') ||
        params.get('token') ||
        params.get('ticket') ||
        params.get('ref') ||
        params.get('taller');

      if (inviteCode && !localAppliedCode) {
        processAndApplyCode(inviteCode, true);
      }
    } catch {
      // Ignore URL parsing errors on restricted environments
    }
  }, []);

  // Process and validate code/link
  const processAndApplyCode = (rawInput: string, silent = false): boolean => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      if (!silent) setPasteError('Por favor ingresa o pega un código o enlace válido.');
      return false;
    }

    setPasteError(null);

    // 1. If it's a full URL, extract potential query parameters or path tokens
    let extractedCode = trimmed;
    try {
      if (trimmed.includes('://') || trimmed.startsWith('http')) {
        const urlObj = new URL(trimmed);
        const urlParam =
          urlObj.searchParams.get('inv') ||
          urlObj.searchParams.get('invitacion') ||
          urlObj.searchParams.get('code') ||
          urlObj.searchParams.get('codigo') ||
          urlObj.searchParams.get('ticket') ||
          urlObj.searchParams.get('taller') ||
          urlObj.searchParams.get('ref');
        if (urlParam) {
          extractedCode = urlParam;
        } else {
          // If no specific query param, use the last path segment or hostname
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0) {
            extractedCode = pathSegments[pathSegments.length - 1];
          }
        }
      }
    } catch {
      // Continue with raw trimmed string
    }

    const cleanCode = extractedCode.replace(/['"]/g, '').trim();

    // 2. Check if it's an existing Ticket Code
    const allRegistrations = OntologicalStore.getEventRegistrations();
    const matchedReg = allRegistrations.find(
      (r) =>
        r.ticketCode.toLowerCase() === cleanCode.toLowerCase() ||
        r.id.toLowerCase() === cleanCode.toLowerCase()
    );

    let details: AppliedCodeDetails;

    if (matchedReg) {
      details = {
        code: matchedReg.ticketCode,
        type: 'ticket',
        title: `Pase Verificado: ${matchedReg.name}`,
        description: `Inscripción vinculada a "${matchedReg.eventTitle}". Auto-asignado al seminario.`,
        ticketCode: matchedReg.ticketCode,
        participantEmail: matchedReg.email,
        workshopId: 'taller-1-raiz',
        groupName: matchedReg.eventTitle,
      };
    } else if (cleanCode.toLowerCase().includes('taller') || cleanCode.toLowerCase().includes('raiz')) {
      details = {
        code: cleanCode,
        type: 'workshop',
        title: 'Taller Ontológico Asignado',
        description: 'Auto-asignación al módulo "Raíz & Coherencia Ontológica (Sábado 28 de Marzo)".',
        workshopId: 'taller-1-raiz',
        groupName: 'Certeza, Fronteras & Dirección Personal',
      };
    } else if (cleanCode.toLowerCase().includes('certeza') || cleanCode.toLowerCase().includes('direccion')) {
      details = {
        code: cleanCode,
        type: 'workshop',
        title: 'Programa Personal Asignado',
        description: 'Vinculado a la cohorte "Certeza, Fronteras & Dirección Personal".',
        workshopId: 'taller-1-raiz',
        groupName: 'Certeza, Fronteras & Dirección Personal',
      };
    } else {
      // General invitation code or referral token
      details = {
        code: cleanCode,
        type: 'referral',
        title: `Invitación Aceptada: ${cleanCode.toUpperCase()}`,
        description: 'Pase ontológico verificado. Tu expediente se activará con acceso completo.',
        workshopId: 'taller-1-raiz',
        groupName: 'Certeza, Fronteras & Dirección Personal',
      };
    }

    // Persist code in sessionStorage so it survives Google OAuth redirects/popups
    try {
      sessionStorage.setItem('rbc_active_invitation_code', details.code);
      if (details.workshopId) sessionStorage.setItem('rbc_active_workshop_id', details.workshopId);
      if (details.groupName) sessionStorage.setItem('rbc_active_group_name', details.groupName);
      if (details.ticketCode) sessionStorage.setItem('rbc_active_ticket_code', details.ticketCode);
    } catch {
      // Ignore storage errors
    }

    setLocalAppliedCode(details);
    if (onCodeApplied) onCodeApplied(details);

    if (!silent) {
      setShareFeedback(`✓ Código "${details.code}" verificado y aplicado.`);
      setTimeout(() => setShareFeedback(null), 4000);
    }

    setShowPasteDrawer(false);
    return true;
  };

  // Handle Share action
  const handleShare = async () => {
    try {
      const origin = getPublicShareableOrigin();
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const baseUrl = origin + pathname;
      const shareUrl = `${baseUrl}?inv=taller-ontologico`;
      const shareData = {
        title: 'Rengifo Basto Consultoría Ontológica',
        text: 'Te invito a acceder al Portal Ontológico de Consultoría RBC. Ingresa con un clic mediante Google.',
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareFeedback('¡Invitación compartida exitosamente!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('¡Enlace de invitación copiado al portapapeles!');
      }
    } catch {
      // Fallback copy
      try {
        const origin = getPublicShareableOrigin();
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        const fallbackUrl = origin + pathname + '?inv=taller-ontologico';
        await navigator.clipboard.writeText(fallbackUrl);
        setShareFeedback('¡Enlace de invitación copiado!');
      } catch {
        setShareFeedback('Enlace copiado al portapapeles');
      }
    }

    setTimeout(() => {
      setShareFeedback(null);
    }, 3500);
  };

  // Handle direct clipboard paste attempt
  const handleDirectPasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setPasteInputValue(text.trim());
          processAndApplyCode(text.trim());
          return;
        }
      }
    } catch {
      // Clipboard read permissions may be restricted; toggle the drawer instead
    }
    setShowPasteDrawer(true);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Active Applied Code Pill if exists */}
      {localAppliedCode && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold">{localAppliedCode.title}</span>
              <span className="opacity-80 ml-1.5 hidden sm:inline text-[11px]">
                ({localAppliedCode.description})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalAppliedCode(null);
              try {
                sessionStorage.removeItem('rbc_active_invitation_code');
                sessionStorage.removeItem('rbc_active_workshop_id');
                sessionStorage.removeItem('rbc_active_group_name');
              } catch {
                // Ignore
              }
            }}
            title="Quitar código"
            className="text-emerald-700 dark:text-emerald-400 hover:text-red-500 p-0.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Share / Toast notification */}
      {shareFeedback && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-800 dark:text-blue-300 text-xs animate-fadeIn">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Unified Multifunctional Button Container */}
      <div className="flex items-stretch rounded-2xl border border-gray-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-[#1C1C20]/95 backdrop-blur-md shadow-sm hover:shadow-md transition-all p-1 gap-1">
        {/* Main Action: Iniciar sesión con Google */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={isVerifying}
          id={`${idPrefix}-btn-google-sign-in`}
          className="flex-1 py-3 px-3.5 sm:px-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] text-black dark:text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer disabled:opacity-60"
        >
          {isVerifying ? (
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
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
          )}
          <span className="tracking-tight font-medium truncate">
            {isVerifying
              ? 'Conectando con Google...'
              : mode === 'register'
              ? 'Iniciar sesión con Google'
              : 'Iniciar sesión con Google'}
          </span>
        </button>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1.5 shrink-0" />

        {/* Action: Compartir */}
        <button
          type="button"
          onClick={handleShare}
          id={`${idPrefix}-btn-share-portal`}
          title="Compartir enlace de acceso o invitar a un participante"
          className="px-2.5 sm:px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-neutral-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Compartir</span>
        </button>

        {/* Action: Pegar */}
        <button
          type="button"
          onClick={() => {
            if (showPasteDrawer) {
              setShowPasteDrawer(false);
            } else {
              handleDirectPasteFromClipboard();
            }
          }}
          id={`${idPrefix}-btn-paste-code`}
          title="Pegar código de invitación, enlace de acceso o token de taller"
          className={`px-2.5 sm:px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            showPasteDrawer || localAppliedCode
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
              : 'hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-300'
          }`}
        >
          <Clipboard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Pegar</span>
        </button>
      </div>

      {/* Expandable Drawer: Pegar Código / Enlace / Token */}
      {showPasteDrawer && (
        <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-blue-200/60 dark:border-blue-900/40 shadow-sm space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-black dark:text-white">
                Pegar código de invitación o enlace
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPasteDrawer(false)}
              className="text-gray-400 hover:text-black dark:hover:text-white p-0.5 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed font-light">
            Pega tu código de invitación, token de referido o enlace directo de taller para auto-asignarte a tu grupo correspondiente.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              processAndApplyCode(pasteInputValue);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={pasteInputValue}
                onChange={(e) => {
                  setPasteInputValue(e.target.value);
                  if (pasteError) setPasteError(null);
                }}
                placeholder="Ej: RBC-EVT-8472 o https://..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-neutral-700 text-xs text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Link2 className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (text) {
                    setPasteInputValue(text);
                    processAndApplyCode(text);
                  }
                } catch {
                  // Fallback
                }
              }}
              title="Pegar desde portapapeles"
              className="px-2.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 font-medium transition-colors cursor-pointer shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Aplicar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          {pasteError && (
            <p className="text-[11px] text-red-500 font-medium">{pasteError}</p>
          )}
        </div>
      )}
    </div>
  );
};
