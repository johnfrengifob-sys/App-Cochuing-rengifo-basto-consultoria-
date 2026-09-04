import React from 'react';
import { Facebook, Youtube, Music2, ExternalLink } from 'lucide-react';
import { COMPANY_INFO } from '../services/store';

export interface SocialLinksBarProps {
  variant?: 'compact' | 'pills' | 'cards' | 'footer';
  className?: string;
  showLabels?: boolean;
}

export const SOCIAL_CHANNELS = [
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Rengifo Basto Consultoría Ontológica',
    shortHandle: 'Rengifo Basto',
    url: COMPANY_INFO.socialLinks.facebook,
    icon: Facebook,
    colorClass: 'text-[#1877F2]',
    hoverBorder: 'hover:border-[#1877F2]/50',
    hoverBg: 'hover:bg-[#1877F2]/10',
    activeBadge: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30',
    description: 'Artículos, reflexiones ontológicas y eventos comunitarios.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@rengifobastoco',
    shortHandle: '@rengifobastoco',
    url: COMPANY_INFO.socialLinks.tiktok,
    icon: Music2,
    colorClass: 'text-neutral-900 dark:text-neutral-100 hover:text-cyan-600 dark:hover:text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/50',
    hoverBg: 'hover:bg-cyan-500/10',
    activeBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    description: 'Cápsulas de coaching, decodificación somática y micropensamientos.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Rengifobastoco',
    shortHandle: '@Rengifobastoco',
    url: COMPANY_INFO.socialLinks.youtube,
    icon: Youtube,
    colorClass: 'text-[#FF0000]',
    hoverBorder: 'hover:border-[#FF0000]/50',
    hoverBg: 'hover:bg-[#FF0000]/10',
    activeBadge: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/30',
    description: 'Clases maestras, conversatorios en vivo y conferencias ejecutivas.',
  },
];

export const SocialLinksBar: React.FC<SocialLinksBarProps> = ({
  variant = 'compact',
  className = '',
  showLabels = false,
}) => {
  if (variant === 'compact') {
    return (
      <div
        id="social-links-compact"
        className={`inline-flex items-center gap-1.5 ${className}`}
        aria-label="Redes sociales oficiales"
      >
        {SOCIAL_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              key={channel.id}
              id={`social-link-${channel.id}`}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl border border-gray-200/80 dark:border-neutral-700/80 bg-white/70 dark:bg-neutral-800/70 text-gray-700 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xs group flex items-center gap-1.5 ${channel.hoverBorder} ${channel.hoverBg}`}
              title={`Ir a ${channel.name} (${channel.handle})`}
              aria-label={`Visitar canal oficial de ${channel.name}`}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${channel.colorClass}`} />
              {showLabels && (
                <span className="text-xs font-medium text-black dark:text-white group-hover:underline">
                  {channel.name}
                </span>
              )}
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div
        id="social-links-pills"
        className={`flex flex-wrap items-center gap-2.5 ${className}`}
        aria-label="Canales y Redes Sociales Oficiales"
      >
        {SOCIAL_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              key={channel.id}
              id={`social-pill-${channel.id}`}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 text-gray-800 dark:text-neutral-200 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group ${channel.hoverBorder} ${channel.hoverBg}`}
              title={`Seguir en ${channel.name}: ${channel.handle}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${channel.activeBadge}`}>
                <Icon className={`w-3.5 h-3.5 ${channel.colorClass}`} />
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-black dark:text-white leading-tight flex items-center gap-1">
                  <span>{channel.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono leading-tight">
                  {channel.shortHandle}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div
        id="social-links-cards"
        className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 ${className}`}
        aria-label="Canales oficiales de contenido"
      >
        {SOCIAL_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              key={channel.id}
              id={`social-card-${channel.id}`}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group p-4 rounded-2xl border border-gray-200/90 dark:border-neutral-700/80 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${channel.hoverBorder}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${channel.activeBadge}`}>
                    <Icon className={`w-4 h-4 ${channel.colorClass}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-black dark:text-white leading-tight">
                      {channel.name}
                    </h4>
                    <span className="text-xs font-mono text-gray-500 dark:text-neutral-400">
                      {channel.shortHandle}
                    </span>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-700/60 flex items-center justify-center text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:scale-110 transition-all">
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs font-light text-gray-600 dark:text-neutral-300 leading-relaxed mb-3">
                {channel.description}
              </p>
              <div className="pt-2 border-t border-gray-100 dark:border-neutral-700/50 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Conectar en {channel.name}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  // variant === 'footer'
  return (
    <div
      id="social-links-footer"
      className={`space-y-3 ${className}`}
      aria-label="Redes Sociales Rengifo Basto"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
        <span>Redes Sociales Oficiales</span>
      </div>
      <p className="text-xs font-light text-gray-600 dark:text-neutral-400 leading-relaxed">
        Sigue nuestras publicaciones, transmisiones en vivo y cápsulas de transformación ontológica:
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {SOCIAL_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              key={channel.id}
              id={`social-footer-btn-${channel.id}`}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 text-xs font-medium text-black dark:text-white shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer group ${channel.hoverBorder} ${channel.hoverBg}`}
              title={`Abrir ${channel.name} (${channel.handle})`}
            >
              <Icon className={`w-4 h-4 ${channel.colorClass} group-hover:scale-110 transition-transform`} />
              <span>{channel.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
