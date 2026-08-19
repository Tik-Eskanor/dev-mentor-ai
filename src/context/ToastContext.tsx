'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  success: (title: string, description?: string, duration?: number) => string;
  error: (title: string, description?: string, duration?: number) => string;
  warning: (title: string, description?: string, duration?: number) => string;
  info: (title: string, description?: string, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, duration = 4500 }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 simultaneous toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) =>
      showToast({ type: 'success', title, description, duration }),
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) =>
      showToast({ type: 'error', title, description, duration: duration || 5500 }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) =>
      showToast({ type: 'warning', title, description, duration }),
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) =>
      showToast({ type: 'info', title, description, duration }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const configs: Record<
    ToastType,
    {
      icon: React.ComponentType<{ className?: string }>;
      bg: string;
      border: string;
      iconColor: string;
      titleColor: string;
      progressColor: string;
    }
  > = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-950/95',
      border: 'border-emerald-500/40 shadow-emerald-900/30',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-200',
      progressColor: 'bg-emerald-500',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-950/95',
      border: 'border-rose-500/40 shadow-rose-900/30',
      iconColor: 'text-rose-400',
      titleColor: 'text-rose-200',
      progressColor: 'bg-rose-500',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-950/95',
      border: 'border-amber-500/40 shadow-amber-900/30',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-200',
      progressColor: 'bg-amber-500',
    },
    info: {
      icon: Info,
      bg: 'bg-slate-900/95',
      border: 'border-indigo-500/40 shadow-indigo-900/30',
      iconColor: 'text-indigo-400',
      titleColor: 'text-indigo-200',
      progressColor: 'bg-indigo-500',
    },
  };

  const config = configs[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.bg} ${config.border} p-3.5 shadow-xl backdrop-blur-md text-slate-100 flex items-start gap-3`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h4 className={`text-xs sm:text-sm font-semibold tracking-tight ${config.titleColor}`}>
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/10 transition"
        title="Dismiss notification"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-dismiss progress line */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 ${config.progressColor} opacity-75`}
        />
      )}
    </motion.div>
  );
};
