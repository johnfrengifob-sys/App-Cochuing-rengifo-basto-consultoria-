import React from 'react';
import { PulseFlag } from '../types';

interface PulseBadgeProps {
  flag: PulseFlag;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PulseBadge: React.FC<PulseBadgeProps> = ({
  flag,
  size = 'md',
  showLabel = true,
}) => {
  const config = {
    Green: {
      colorClass: 'bg-emerald-500',
      glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
      borderClass: 'border-emerald-200/40 dark:border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-950 dark:text-emerald-300',
      label: 'Pulso Estable (Verde)',
      desc: 'Recursos adaptativos en equilibrio',
    },
    Yellow: {
      colorClass: 'bg-amber-500',
      glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
      borderClass: 'border-amber-200/40 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-amber-950 dark:text-amber-300',
      label: 'Pulso en Tensión (Amarillo)',
      desc: 'Señales somáticas de sobre-exigencia o control',
    },
    Red: {
      colorClass: 'bg-rose-500',
      glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
      borderClass: 'border-rose-200/40 dark:border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/15 text-rose-950 dark:text-rose-300',
      label: 'Pulso Crítico (Rojo)',
      desc: 'Quiebre ontológico o angustia aguda',
    },
  }[flag];

  const dotSize =
    size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs font-medium';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.borderClass} transition-all`}
      title={config.desc}
    >
      <span
        className={`rounded-full ${dotSize} ${config.colorClass} ${config.glowClass} animate-pulse`}
      />
      {showLabel && (
        <span className={`${textSize} tracking-tight font-sans`}>
          {config.label}
        </span>
      )}
    </div>
  );
};
