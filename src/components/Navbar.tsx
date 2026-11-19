import { Clapperboard, LogIn, LogOut, Plus, RefreshCw, Server, Sparkles, User } from 'lucide-react';
import type { BackendMode, UserSession } from '../types/film';

interface NavbarProps {
  mode: BackendMode;
  isCheckingBackend: boolean;
  session: UserSession | null;
  onToggleMode: () => void;
  onOpenAddMovie: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Navbar({
  mode,
  isCheckingBackend,
  session,
  onToggleMode,
  onOpenAddMovie,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  const isLive = mode === 'live';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#top"
            className="flex items-center gap-2.5 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 rounded-md whitespace-nowrap shrink-0"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-xs">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              Filmx
            </span>
          </a>

          <button
            type="button"
            onClick={onToggleMode}
            disabled={isCheckingBackend}
            aria-label={
              isLive
                ? 'Connected to Live Backend at localhost:8080. Click to switch to Demo Mode.'
                : 'Running in Demo Mode. Click to retry Live Backend at localhost:8080.'
            }
            title={
              isLive
                ? 'Click to switch to offline Demo Mode'
                : 'Click to attempt connection to http://localhost:8080'
            }
            className={`inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
              isLive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isCheckingBackend ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : isLive ? (
              <Server className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            )}
            <span>
              {isLive ? 'Live Backend (localhost:8080)' : 'Demo Mode'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {session ? (
            <div className="flex items-center gap-2">
              <div
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 whitespace-nowrap"
                data-testid="authenticated-user"
              >
                <User className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{session.userName}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddMovie}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow-xs transition-colors hover:bg-amber-400 active:bg-amber-600 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
            <span>Add Movie</span>
          </button>
        </div>
      </div>
    </header>
  );
}
