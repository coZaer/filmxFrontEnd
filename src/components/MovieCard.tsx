import { Eye, Film, Pencil, Trash2 } from 'lucide-react';
import type { MovieResponse } from '../types/film';
import { MoviePoster } from './MoviePoster';

interface MovieCardProps {
  movie: MovieResponse;
  onViewDetails: (movie: MovieResponse) => void;
  onEdit: (movie: MovieResponse) => void;
  onDelete: (movie: MovieResponse) => void;
}

export function MovieCard({
  movie,
  onViewDetails,
  onEdit,
  onDelete,
}: MovieCardProps) {
  return (
    <article
      className="cinema-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/80"
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <MoviePoster
          movie={movie}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/55 via-slate-950/15 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md bg-white/95 px-2.5 py-1 font-mono text-xs font-semibold text-slate-900 shadow-sm tabular-nums backdrop-blur-xs">
            {movie.releaseYear}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
            {movie.genre}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-amber-700">
              {movie.title}
            </h2>
            <span className="mt-0.5 font-mono text-xs font-medium text-slate-400 tabular-nums shrink-0">
              #{movie.id}
            </span>
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Film className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Directed by {movie.director}</span>
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {movie.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onViewDetails(movie)}
            aria-label={`View details for ${movie.title}`}
            className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View Details</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(movie)}
              aria-label={`Edit ${movie.title}`}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(movie)}
              aria-label={`Delete ${movie.title}`}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
