import { Search, X } from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  selectedGenre: string;
  availableGenres: string[];
  visibleCount: number;
  totalElements: number;
  onSearchChange: (value: string) => void;
  onGenreChange: (genre: string) => void;
}

export function Toolbar({
  searchQuery,
  selectedGenre,
  availableGenres,
  visibleCount,
  totalElements,
  onSearchChange,
  onGenreChange,
}: ToolbarProps) {
  const genres = ['All', ...availableGenres];

  return (
    <section
      aria-label="Catalog filters"
      className="mb-8 flex flex-col gap-5 border-b border-slate-200/90 pb-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Curated Cinema Directory
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
            Now Showing &amp; Film Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse posters, synopses, and studio records with live Spring Data pagination.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <label htmlFor="movie-search-input" className="sr-only">
              Filter movies by title, genre, or director
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="movie-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by title, genre, or director..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter by genre"
        >
          {genres.map((genre) => {
            const isActive = selectedGenre.toLowerCase() === genre.toLowerCase();
            return (
              <button
                key={genre}
                type="button"
                onClick={() => onGenreChange(genre)}
                aria-pressed={isActive}
                className={`min-h-[34px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 tabular-nums" data-testid="catalog-count">
          Showing <span className="font-semibold text-slate-900">{visibleCount}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalElements}</span>{' '}
          {totalElements === 1 ? 'film' : 'films'}
        </p>
      </div>
    </section>
  );
}
