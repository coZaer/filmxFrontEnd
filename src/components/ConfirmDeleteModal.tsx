import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { MovieResponse } from '../types/film';

interface ConfirmDeleteModalProps {
  movie: MovieResponse | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: (movie: MovieResponse) => Promise<void>;
}

export function ConfirmDeleteModal({
  movie,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!movie) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, isDeleting, onCancel]);

  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(e) => e.stopPropagation()}
        className="cinema-modal w-full max-w-md rounded-2xl border border-slate-200 p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Cancel deletion"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="confirm-delete-title"
          className="mt-4 font-display text-lg font-bold text-slate-900"
        >
          Delete &ldquo;{movie.title}&rdquo;?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This will archive the movie from the active Filmx catalog (soft delete on backend). You can add it again later if needed.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(movie)}
            disabled={isDeleting}
            className="inline-flex min-h-[40px] items-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-rose-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete Movie'}
          </button>
        </div>
      </div>
    </div>
  );
}
