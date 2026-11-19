import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import type { MovieResponse } from '../types/film';
import { resolveMoviePoster } from '../utils/posterResolver';

interface MoviePosterProps {
  movie: Pick<MovieResponse, 'id' | 'title' | 'genre' | 'releaseYear'>;
  className?: string;
}

export function MoviePoster({ movie, className = '' }: MoviePosterProps) {
  const [hasError, setHasError] = useState(false);
  const posterSrc = resolveMoviePoster(movie);

  useEffect(() => {
    setHasError(false);
  }, [posterSrc]);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-slate-100 to-slate-200 p-6 text-center text-slate-700 ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-amber-600 shadow-sm">
          <Film className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-3 font-display text-sm font-bold text-slate-900 line-clamp-2">
          {movie.title}
        </p>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {movie.releaseYear} · {movie.genre}
        </p>
      </div>
    );
  }

  return (
    <img
      src={posterSrc}
      alt={`${movie.title} (${movie.releaseYear}) movie poster`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
