import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastItem } from '../types/film';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        const borderColor = isError
          ? 'border-rose-200 bg-white'
          : isSuccess
            ? 'border-emerald-200 bg-white'
            : isWarning
              ? 'border-amber-200 bg-white'
              : 'border-slate-200 bg-white';

        const Icon = isError
          ? AlertCircle
          : isSuccess
            ? CheckCircle2
            : Info;

        const iconColor = isError
          ? 'text-rose-600'
          : isSuccess
            ? 'text-emerald-600'
            : isWarning
              ? 'text-amber-600'
              : 'text-sky-600';

        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${borderColor}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {typeof toast.statusCode === 'number' && (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-rose-700 tabular-nums">
                    {toast.statusCode}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={`Dismiss ${toast.title} notification`}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
