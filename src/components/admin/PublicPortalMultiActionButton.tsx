import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Share2,
  Copy,
  Check,
  ChevronDown,
  MessageCircle,
  Mail,
  QrCode,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { safeCopyToClipboard } from '../../utils/clipboard';
import { getPublicPortalUrl, isAiStudioDevEnvironment } from '../../utils/urlHelper';

interface PublicPortalMultiActionButtonProps {
  onOpenPortal: () => void;
  className?: string;
  variant?: 'default' | 'compact';
  eventTitle?: string;
}

export const PublicPortalMultiActionButton: React.FC<PublicPortalMultiActionButtonProps> = ({
  onOpenPortal,
  className = '',
  variant = 'default',
  eventTitle = 'Certeza, Fronteras & Dirección Personal',
}) => {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Canonical public shareable URL (always resolves to public ais-pre- domain)
  const portalUrl = getPublicPortalUrl('registro');
  const isAiStudioDev = isAiStudioDevEnvironment();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Copiar enlace directo
  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await safeCopyToClipboard(portalUrl);
    if (success) {
      setCopied(true);
      setShareSuccessMessage('¡Enlace del portal copiado al portapapeles!');
      setTimeout(() => {
        setCopied(false);
        setShareSuccessMessage(null);
      }, 2500);
    }
  };

  // Copiar mensaje completo con formato para WhatsApp o invitaciones
  const handleCopyInvitationText = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const invitationText = `✨ *Invitación Oficial • Consultoría Ontológica RBC* ✨\n\nTe invito a explorar el portal oficial de talleres y seminarios ontológicos:\n\n🔗 *Accede aquí:* ${portalUrl}\n\n• Registro rápido en un clic\n• Talleres ontológicos y bitácora personal de compromisos\n• Temarios y cuadernos de trabajo descargables`;
    const success = await safeCopyToClipboard(invitationText);
    if (success) {
      setCopied(true);
      setShareSuccessMessage('¡Invitación completa copiada para enviar!');
      setTimeout(() => {
        setCopied(false);
        setShareSuccessMessage(null);
        setShowDropdown(false);
      }, 2500);
    }
  };

  // Compartir mediante Web Share API o fallback a WhatsApp
  const handleShare = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Portal Público • Consultoría Ontológica RBC',
          text: `Te invito a conocer el Portal Público de talleres y seminarios ontológicos de Consultoría RBC:`,
          url: portalUrl,
        });
        setShareSuccessMessage('¡Compartido con éxito!');
        setTimeout(() => setShareSuccessMessage(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Si no está disponible Web Share o hubo error, alternar dropdown con opciones
    setShowDropdown((prev) => !prev);
  };

  // Abrir en WhatsApp directamente
  const handleShareWhatsApp = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = encodeURIComponent(
      `Hola! Te invito a conocer el Portal de Talleres y Seminarios Ontológicos de Consultoría RBC: ${portalUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    setShowDropdown(false);
  };

  // Abrir por correo
  const handleShareEmail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const subject = encodeURIComponent('Invitación: Portal de Talleres Ontológicos RBC');
    const body = encodeURIComponent(
      `Te comparto el enlace directo al Portal de Talleres y Seminarios de Consultoría Ontológica RBC:\n\n${portalUrl}\n\nAllí podrás consultar los próximos eventos, temarios y reservar tu cupo.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowDropdown(false);
  };

  // Abrir portal en nueva pestaña
  const handleOpenInNewTab = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(portalUrl, '_blank', 'noopener,noreferrer');
    setShowDropdown(false);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      {/* Segmented Container con diseño de alta calidad */}
      <div className="inline-flex items-stretch rounded-xl border border-gray-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-md shadow-sm hover:shadow transition-all overflow-hidden divide-x divide-gray-200/80 dark:divide-neutral-700/80">
        
        {/* 1. OPCIÓN DE INGRESO: Ver Portal Público */}
        <button
          type="button"
          onClick={onOpenPortal}
          title="Abrir e ingresar al Portal Público de Registro"
          id="btn-admin-open-public-portal"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="tracking-tight">Ver Portal Público</span>
        </button>

        {/* 2. OPCIÓN DE COMPARTIR */}
        <button
          type="button"
          onClick={handleShare}
          title="Compartir enlace oficial del portal (WhatsApp, Redes, etc.)"
          id="btn-admin-share-public-portal"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Compartir</span>
        </button>

        {/* 3. OPCIÓN DE COPIAR */}
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copiar enlace directo al portapapeles"
          id="btn-admin-copy-public-portal"
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer group ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
              : 'text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Copiar</span>
            </>
          )}
        </button>

        {/* 4. SELECTOR DESPLEGABLE DE ACCIONES RÁPIDAS */}
        <button
          type="button"
          onClick={() => setShowDropdown((prev) => !prev)}
          title="Más opciones del portal público"
          id="btn-admin-dropdown-public-portal"
          className="inline-flex items-center px-2 py-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showDropdown ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
            }`}
          />
        </button>
      </div>

      {/* Notificación flotante de confirmación */}
      {shareSuccessMessage && (
        <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium shadow-lg whitespace-nowrap">
            <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{shareSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Menú contextual desplegable */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-gray-200/90 dark:border-neutral-700/90 bg-white/98 dark:bg-[#1C1C20]/98 backdrop-blur-xl shadow-xl z-50 p-2 text-xs divide-y divide-gray-100 dark:divide-neutral-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header del dropdown */}
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-black dark:text-white text-xs">
                Portal Público Oficial
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-light truncate mt-0.5">
              {portalUrl}
            </p>
          </div>

          {/* Opciones Principales */}
          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                onOpenPortal();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Ingresar al Portal</div>
                <div className="text-[10px] text-gray-500 font-light">Abrir la landing en este panel</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Abrir en Pestaña Nueva</div>
                <div className="text-[10px] text-gray-500 font-light">Probar como participante externo</div>
              </div>
            </button>
          </div>

          {/* Opciones de Difusión y Compartir */}
          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Copiar Enlace Directo</div>
                <div className="text-[10px] text-gray-500 font-light">Para chats, correos o campañas</div>
              </div>
              {copied && <span className="text-[10px] font-bold text-emerald-600">✓ Listo</span>}
            </button>

            <button
              type="button"
              onClick={handleCopyInvitationText}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Copiar Invitación Formateada</div>
                <div className="text-[10px] text-gray-500 font-light">Con emojis y llamado a la acción</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-gray-700 dark:text-neutral-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Enviar por WhatsApp</div>
                <div className="text-[10px] opacity-80 font-light">Abre chat directo con mensaje preparado</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleShareEmail}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Compartir por Correo</div>
                <div className="text-[10px] text-gray-500 font-light">Redacta plantilla de correo institucional</div>
              </div>
            </button>
          </div>

          {/* Footer de seguridad y asistencia */}
          <div className="pt-2 px-3 pb-1 border-t border-gray-100 dark:border-neutral-800 space-y-1.5">
            {isAiStudioDev && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-900 dark:text-emerald-300 leading-normal space-y-1">
                <div className="font-semibold flex items-center gap-1 text-emerald-800 dark:text-emerald-200">
                  <span>🌐 Enlace Público Universal Configurado</span>
                </div>
                <p>
                  El botón <strong>Copiar</strong> genera automáticamente la dirección pública (<em>ais-pre</em>) que funciona en <strong>cualquier navegador, ventana de incógnito o teléfono móvil</strong> sin solicitar acceso a Google AI Studio.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-neutral-500 font-light">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Acceso público habilitado
              </span>
              <span>RBC 2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
