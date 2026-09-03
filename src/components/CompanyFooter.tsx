import React from 'react';
import { BrandLogo } from './BrandLogo';
import { MapPin, Phone, MessageSquare, ShieldCheck, Mail, ExternalLink } from 'lucide-react';
import { COMPANY_INFO } from '../services/store';

interface CompanyFooterProps {
  minimal?: boolean;
  className?: string;
  onOpenRegistrationPortal?: () => void;
}

export const CompanyFooter: React.FC<CompanyFooterProps> = ({
  minimal = false,
  className = '',
  onOpenRegistrationPortal,
}) => {
  if (minimal) {
    return (
      <footer className={`py-6 px-4 bg-white/40 dark:bg-[#0D0D0E]/40 backdrop-blur-md border-t border-white/50 dark:border-white/10 text-xs text-gray-500 dark:text-neutral-400 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="xs" layout="full" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-light">
            <a
              href={COMPANY_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline text-gray-600 dark:text-neutral-300 group cursor-pointer"
              title="Abrir ubicación en Google Maps (Manizales, Colombia)"
            >
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{COMPANY_INFO.address}, Manizales</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
            </a>
            <span className="opacity-40">•</span>
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-black dark:text-white font-medium hover:underline"
            >
              <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Cel: {COMPANY_INFO.phone}
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-white/60 dark:bg-[#0D0D0E]/60 backdrop-blur-xl border-t border-white/60 dark:border-white/10 py-10 px-6 sm:px-8 transition-colors ${className}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo & Manifesto */}
          <div className="space-y-3">
            <BrandLogo size="md" layout="full" />
            <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              Acompañamiento directivo y ontológico de alta gama. Mapeo de la transparencia, límites legítimos, sabiduría somática de las emociones y diseño de conversaciones generativas.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-[10px] font-medium text-neutral-700 dark:text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Marco Ético y Confidencialidad ICF</span>
            </div>
          </div>

          {/* Sede & Datos de Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
              Sede Principal & Contacto
            </h4>
            <ul className="space-y-2.5 text-xs font-light text-gray-600 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <a
                  href={COMPANY_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Abrir ubicación exacta en Google Maps (Manizales)"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-medium text-black dark:text-white block group-hover:underline flex items-center gap-1.5">
                      <span>Dirección Corporativa</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-70 group-hover:opacity-100" />
                    </span>
                    <span className="text-gray-500 dark:text-neutral-400 block">{COMPANY_INFO.address}</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                      Manizales, Colombia • Clic para ver mapa
                    </span>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-black dark:text-white block">Línea Directa / Celular</span>
                  <a
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="hover:underline text-black dark:text-white font-mono text-xs"
                  >
                    {COMPANY_INFO.phone} ({COMPANY_INFO.formattedPhone})
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-black dark:text-white block">Correo Electrónico</span>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="hover:underline text-gray-500 dark:text-neutral-400"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Canales y Conversatorio */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
              Atención & Conversatorios
            </h4>
            <p className="text-xs font-light text-gray-600 dark:text-neutral-400">
              Atención personalizada previa cita para procesos de coaching 1 a 1 y conversatorios ontológicos quincenales.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Escribir al WhatsApp ({COMPANY_INFO.phone})</span>
              </a>

              {onOpenRegistrationPortal && (
                <button
                  type="button"
                  onClick={onOpenRegistrationPortal}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-xs font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all cursor-pointer"
                >
                  <span>Portal de Pre-Inscripción de Evento</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200/60 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-light text-gray-500 dark:text-neutral-400">
          <div>
            &copy; 2026 {COMPANY_INFO.fullName}. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-3">
            <span>Bogotá, Colombia</span>
            <span>&bull;</span>
            <span>ICF Level 1</span>
            <span>&bull;</span>
            <span>Confidencialidad Ontológica</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
