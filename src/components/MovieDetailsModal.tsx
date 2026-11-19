import { useEffect } from 'react';
import { Calendar, Clapperboard, Film, Pencil, Trash2, X } from 'lucide-react';
import type { MovieResponse } from '../types/film';
import { MoviePoster } from './MoviePoster';

interface MovieDetailsModalProps {
  movie: MovieResponse | null;
  isLoading: boolean;
  onClose: () => void;
  onEdit: (movie: MovieResponse) => void;
  onDelete: (movie: MovieResponse) => void;
}

export function MovieDetailsModal({
  movie,
  isLoading,
  onClose,
  onEdit,
  onDelete,
}: MovieDetailsModalProps) {
  useEffect(() => {
    if (!movie && !isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, isLoading, onClose]);

  if (!movie && !isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-details-title"
        onClick={(e) => e.stopPropagation()}
        className="cinema-modal max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
            <Film className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <span>Film Record</span>
            {movie && (
              <>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  ID #{movie.id}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details modal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {isLoading || !movie ? (
          <div className="mt-6 flex flex-col gap-6 sm:flex-row">
            <div className="aspect-[3/4] w-full shrink-0 animate-pulse rounded-xl bg-slate-200 sm:w-48" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-5 w-1/2 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-24 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-6 sm:flex-row">
            <div className="aspect-[3/4] w-44 shrink-0 self-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm sm:w-52 sm:self-start">
              <MoviePoster movie={movie} />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h2
                  id="movie-details-title"
                  className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance"
                >
                  {movie.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-800 tabular-nums">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                    {movie.releaseYear}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {movie.genre}
                  </span>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <Clapperboard className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  Directed by <strong className="font-semibold text-slate-900">{movie.director}</strong>
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500">
                    Synopsis
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {movie.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => onDelete(movie)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(movie)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit Movie</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[40px] items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
