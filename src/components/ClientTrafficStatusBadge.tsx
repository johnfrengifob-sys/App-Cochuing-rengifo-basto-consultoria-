import React, { useState, useRef, useEffect } from 'react';
import { ClientStatus } from '../types';
import { ChevronDown, Check, Circle } from 'lucide-react';

interface ClientTrafficStatusBadgeProps {
  status?: ClientStatus;
  onChangeStatus?: (newStatus: ClientStatus) => void;
  interactive?: boolean;
  size?: 'sm' | 'md';
}

export const ClientTrafficStatusBadge: React.FC<ClientTrafficStatusBadgeProps> = ({
  status = 'active',
  onChangeStatus,
  interactive = true,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const config = {
    active: {
      label: 'Activo',
      dotColor: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      description: 'En proceso regular de sesiones activas',
    },
    waiting: {
      label: 'En Espera',
      dotColor: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      description: 'Pendiente de agendamiento o pago',
    },
    inactive: {
      label: 'Inactivo / Pausado',
      dotColor: 'bg-gray-400 dark:bg-neutral-500',
      pingColor: 'bg-gray-300 dark:bg-neutral-600',
      bgClass: 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700',
      description: 'Programa finalizado o suspendido',
    },
  };

  const current = config[status] || config.active;
  const isSm = size === 'sm';

  const handleSelect = (newStatus: ClientStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeStatus?.(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={!interactive || !onChangeStatus}
        onClick={(e) => {
          if (interactive && onChangeStatus) {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }
        }}
        className={`inline-flex items-center gap-1.5 ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } rounded-full border font-medium transition-all ${current.bgClass} ${
          interactive && onChangeStatus ? 'cursor-pointer hover:opacity-90 shadow-2xs' : 'cursor-default'
        }`}
        title={`Estado del cliente: ${current.label}. ${interactive && onChangeStatus ? 'Haz clic para cambiar' : ''}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {status === 'active' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.pingColor} opacity-75`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
        </span>
        <span className="font-semibold">{current.label}</span>
        {interactive && onChangeStatus && (
          <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
        )}
      </button>

      {/* Interactive Dropdown */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 mt-1.5 w-52 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-gray-200 dark:border-neutral-700 shadow-xl z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 border-b border-gray-100 dark:border-neutral-800 mb-1">
            Cambiar Estado del Cliente
          </div>

          {(['active', 'waiting', 'inactive'] as ClientStatus[]).map((st) => {
            const item = config[st];
            const isSelected = status === st;

            return (
              <button
                key={st}
                type="button"
                onClick={(e) => handleSelect(st, e)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-gray-100 dark:bg-neutral-800 font-medium text-black dark:text-white'
                    : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                  <div>
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-light">
                      {item.description}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
