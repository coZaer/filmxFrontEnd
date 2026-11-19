import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpringPage, MovieResponse } from '../types/film';
import { getPaginationRange } from '../utils/filmLogic';

interface PaginationProps {
  page: SpringPage<MovieResponse>;
  onPageChange: (nextPage: number) => void;
  disabled?: boolean;
  isFiltered?: boolean;
}

export function Pagination({
  page,
  onPageChange,
  disabled = false,
  isFiltered = false,
}: PaginationProps) {
  const { number, totalPages, totalElements, size, first, last, content } = page;
  if (totalElements === 0) return null;

  const pageNumbers = getPaginationRange(number, totalPages);
  const startItem = content.length === 0 ? 0 : number * size + 1;
  const endItem = content.length === 0 ? 0 : number * size + content.length;

  return (
    <nav
      aria-label="Movie pagination"
      className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/90 pt-6 sm:flex-row"
    >
      <p className="text-xs sm:text-sm text-slate-600 tabular-nums" data-testid="pagination-summary">
        {isFiltered ? (
          <>
            Showing <span className="font-semibold text-slate-900">{content.length}</span>{' '}
            matching {content.length === 1 ? 'movie' : 'movies'} on page{' '}
            <span className="font-semibold text-slate-900">{number + 1}</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-semibold text-slate-900">{totalElements}</span> total in scope
          </>
        ) : (
          <>
            Showing <span className="font-semibold text-slate-900">{startItem}</span>–
            <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalElements}</span> total{' '}
            {totalElements === 1 ? 'movie' : 'movies'}
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            Page <span className="font-semibold text-slate-900">{number + 1}</span> of{' '}
            <span className="font-semibold text-slate-900">{Math.max(1, totalPages)}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(number - 1)}
          disabled={disabled || first}
          aria-label="Previous page"
          className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageIdx) => {
            const isCurrent = pageIdx === number;
            return (
              <button
                key={pageIdx}
                type="button"
                onClick={() => onPageChange(pageIdx)}
                disabled={disabled}
                aria-label={`Page ${pageIdx + 1}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2.5 font-mono text-xs font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {pageIdx + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(number + 1)}
          disabled={disabled || last}
          aria-label="Next page"
          className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
