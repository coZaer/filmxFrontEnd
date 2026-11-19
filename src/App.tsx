import { useCallback, useEffect, useMemo, useState } from 'react';
import { Film, Plus, RotateCcw } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { MovieCard } from './components/MovieCard';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { MovieFormModal } from './components/MovieFormModal';
import { Navbar } from './components/Navbar';
import { Pagination } from './components/Pagination';
import { ToastContainer } from './components/ToastContainer';
import { Toolbar } from './components/Toolbar';
import { ApiException, demoStore, filmApi } from './services/api';
import type {
  BackendMode,
  LoginRequest,
  MovieRequest,
  MovieResponse,
  RegisterRequest,
  SpringPage,
  ToastItem,
  ToastType,
  UserSession,
} from './types/film';
import {
  buildSpringPage,
  extractUniqueGenres,
  filterMovies,
  parseLoginUserName,
} from './utils/filmLogic';

const PAGE_SIZE = 6;

const EMPTY_PAGE: SpringPage<MovieResponse> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: PAGE_SIZE,
  first: true,
  last: true,
};

export default function App() {
  const [mode, setMode] = useState<BackendMode>('live');
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(true);
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(false);

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageData, setPageData] = useState<SpringPage<MovieResponse>>(EMPTY_PAGE);
  const [demoRefreshTick, setDemoRefreshTick] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const [session, setSession] = useState<UserSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);

  const [detailsMovie, setDetailsMovie] = useState<MovieResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<MovieResponse | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);

  const [deletingMovie, setDeletingMovie] = useState<MovieResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, title: string, message: string, statusCode?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message, statusCode }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4800);
    },
    [dismissToast]
  );

  const handleApiError = useCallback(
    (error: unknown, fallbackTitle: string) => {
      if (error instanceof ApiException) {
        pushToast('error', fallbackTitle, error.message, error.status);
        return;
      }
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred.';
      pushToast('error', fallbackTitle, message);
    },
    [pushToast]
  );

  const loadMovies = useCallback(
    async (
      targetMode: BackendMode,
      targetPage: number,
      notifyOnFallback = false
    ) => {
      setIsLoadingMovies(true);
      try {
        const result = await filmApi.getFilms(targetMode, targetPage, PAGE_SIZE);
        if (result.fellBackToDemo) {
          setMode('demo');
          if (notifyOnFallback) {
            pushToast(
              'info',
              'Demo Mode Active',
              'Backend at localhost:8080 is unreachable. Loaded 8 sample movies offline.'
            );
          }
        }
        setPageData(result.data);
        setPageIndex(result.data.number);
      } catch (error) {
        handleApiError(error, 'Failed to load movies');
      } finally {
        setIsLoadingMovies(false);
      }
    },
    [handleApiError, pushToast]
  );

  useEffect(() => {
    void loadMovies('live', 0, true);
  }, [loadMovies]);

  const handleToggleMode = async () => {
    if (mode === 'live') {
      setMode('demo');
      setPageIndex(0);
      await loadMovies('demo', 0, false);
      pushToast('info', 'Switched to Demo Mode', 'Using local in-memory movie catalog.');
      return;
    }

    setIsCheckingBackend(true);
    try {
      const result = await filmApi.getFilms('live', 0, PAGE_SIZE);
      if (result.fellBackToDemo) {
        setMode('demo');
        pushToast(
          'warning',
          'Live Backend Unreachable',
          'Could not connect to http://localhost:8080. Staying in Demo Mode.'
        );
      } else {
        setMode('live');
        setPageData(result.data);
        setPageIndex(result.data.number);
        pushToast(
          'success',
          'Connected to Live Backend',
          'Synced movie catalog from http://localhost:8080.'
        );
      }
    } catch (error) {
      handleApiError(error, 'Backend connection error');
    } finally {
      setIsCheckingBackend(false);
    }
  };

  const hasActiveFilter = searchQuery.trim().length > 0 || selectedGenre !== 'All';

  const availableGenres = useMemo(() => {
    const source = mode === 'demo' ? demoStore.getAll() : pageData.content;
    return extractUniqueGenres(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pageData.content, demoRefreshTick]);

  const activePageView = useMemo<SpringPage<MovieResponse>>(() => {
    if (mode === 'demo' && hasActiveFilter) {
      const allFiltered = filterMovies(demoStore.getAll(), searchQuery, selectedGenre);
      return buildSpringPage(allFiltered, pageIndex, PAGE_SIZE);
    }
    if (mode === 'live' && hasActiveFilter) {
      const filteredContent = filterMovies(pageData.content, searchQuery, selectedGenre);
      return {
        ...pageData,
        content: filteredContent,
      };
    }
    return pageData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasActiveFilter, searchQuery, selectedGenre, pageData, pageIndex, demoRefreshTick]);

  useEffect(() => {
    if (
      selectedGenre !== 'All' &&
      availableGenres.length > 0 &&
      !availableGenres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
    ) {
      setSelectedGenre('All');
    }
  }, [availableGenres, selectedGenre]);

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 0) return;
    if (mode === 'demo' && hasActiveFilter) {
      setPageIndex(nextPage);
    } else {
      await loadMovies(mode, nextPage, false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (mode === 'demo') setPageIndex(0);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    if (mode === 'demo') setPageIndex(0);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setPageIndex(0);
    if (mode === 'demo') {
      void loadMovies('demo', 0, false);
    }
  };

  const handleViewDetails = async (movie: MovieResponse) => {
    setDetailsMovie(movie);
    if (mode === 'live') {
      setIsLoadingDetails(true);
      try {
        const result = await filmApi.getFilmById('live', movie.id);
        if (result.fellBackToDemo) setMode('demo');
        setDetailsMovie(result.data);
      } catch (error) {
        setDetailsMovie(null);
        handleApiError(error, 'Failed to fetch movie details');
        await loadMovies('live', pageIndex, false);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleOpenAddMovie = () => {
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  const handleOpenEditMovie = (movie: MovieResponse) => {
    setDetailsMovie(null);
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleSubmitMovie = async (payload: MovieRequest, movieId?: number) => {
    setIsFormSubmitting(true);
    try {
      if (typeof movieId === 'number') {
        const result = await filmApi.updateFilm(mode, movieId, payload);
        if (result.fellBackToDemo) setMode('demo');
        pushToast('success', 'Movie Updated', `"${result.data.title}" has been updated.`);
        setIsFormOpen(false);
        setEditingMovie(null);
        setDemoRefreshTick((t) => t + 1);
        await loadMovies(result.modeUsed, pageIndex, false);
      } else {
        const result = await filmApi.createFilm(mode, payload);
        if (result.fellBackToDemo) setMode('demo');
        pushToast('success', 'Movie Added', `"${result.data.title}" is now in the catalog.`);
        setIsFormOpen(false);
        setSearchQuery('');
        setSelectedGenre('All');
        setDemoRefreshTick((t) => t + 1);
        await loadMovies(result.modeUsed, 0, false);
      }
    } catch (error) {
      handleApiError(
        error,
        typeof movieId === 'number' ? 'Update Failed' : 'Create Failed'
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async (movie: MovieResponse) => {
    setIsDeleting(true);
    try {
      const result = await filmApi.deleteFilm(mode, movie.id);
      if (result.fellBackToDemo) setMode('demo');
      pushToast('success', 'Movie Deleted', `"${movie.title}" was removed from the catalog.`);
      setDeletingMovie(null);
      setDetailsMovie(null);
      setDemoRefreshTick((t) => t + 1);

      const nextTargetPage =
        activePageView.content.length <= 1 && pageIndex > 0 ? pageIndex - 1 : pageIndex;
      await loadMovies(result.modeUsed, nextTargetPage, false);
    } catch (error) {
      handleApiError(error, 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogin = async (payload: LoginRequest): Promise<boolean> => {
    setIsAuthSubmitting(true);
    try {
      const result = await filmApi.login(mode, payload);
      if (result.fellBackToDemo) setMode('demo');
      const userName = parseLoginUserName(result.data.message, payload.email);
      setSession({ userName, email: payload.email });
      pushToast('success', 'Signed In', `Welcome back, ${userName}.`);
      return true;
    } catch (error) {
      handleApiError(error, 'Login Failed');
      return false;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleRegister = async (payload: RegisterRequest): Promise<boolean> => {
    setIsAuthSubmitting(true);
    try {
      const result = await filmApi.register(mode, payload);
      if (result.fellBackToDemo) setMode('demo');
      pushToast(
        'success',
        'Account Created',
        result.data || 'User registered successfully. You can now sign in.'
      );
      return true;
    } catch (error) {
      handleApiError(error, 'Registration Failed');
      return false;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    const name = session?.userName;
    setSession(null);
    pushToast(
      'info',
      'Signed Out',
      name ? `${name} has been logged out.` : 'You have been logged out.'
    );
  };

  return (
    <div id="top" className="cinema-canvas min-h-screen flex flex-col text-slate-900">
      <Navbar
        mode={mode}
        isCheckingBackend={isCheckingBackend}
        session={session}
        onToggleMode={() => void handleToggleMode()}
        onOpenAddMovie={handleOpenAddMovie}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Toolbar
          searchQuery={searchQuery}
          selectedGenre={selectedGenre}
          availableGenres={availableGenres}
          visibleCount={activePageView.content.length}
          totalElements={activePageView.totalElements}
          onSearchChange={handleSearchChange}
          onGenreChange={handleGenreChange}
        />

        {isLoadingMovies ? (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading movies"
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="cinema-card overflow-hidden rounded-2xl border border-slate-200/80"
              >
                <div className="aspect-[3/4] w-full animate-pulse bg-slate-200" />
                <div className="p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2.5 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activePageView.content.length === 0 ? (
          <div className="cinema-card flex flex-col items-center justify-center rounded-2xl border border-slate-200 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
              <Film className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
              {hasActiveFilter ? 'No matching films found' : 'Your film catalog is empty'}
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              {hasActiveFilter
                ? 'Try adjusting your search query or clearing the genre filter to view more titles.'
                : 'Add your first movie to start organizing titles, directors, and release records.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilter ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAddMovie}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add First Movie</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            data-testid="movie-grid"
          >
            {activePageView.content.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onViewDetails={(m) => void handleViewDetails(m)}
                onEdit={handleOpenEditMovie}
                onDelete={(m) => setDeletingMovie(m)}
              />
            ))}
          </div>
        )}

        <Pagination
          page={activePageView}
          onPageChange={(next) => void handlePageChange(next)}
          disabled={isLoadingMovies}
          isFiltered={mode === 'live' && hasActiveFilter}
        />
      </main>

      <MovieDetailsModal
        movie={detailsMovie}
        isLoading={isLoadingDetails}
        onClose={() => setDetailsMovie(null)}
        onEdit={handleOpenEditMovie}
        onDelete={(m) => setDeletingMovie(m)}
      />

      <MovieFormModal
        isOpen={isFormOpen}
        editingMovie={editingMovie}
        isSubmitting={isFormSubmitting}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMovie(null);
        }}
        onSubmit={handleSubmitMovie}
      />

      <ConfirmDeleteModal
        movie={deletingMovie}
        isDeleting={isDeleting}
        onCancel={() => setDeletingMovie(null)}
        onConfirm={handleConfirmDelete}
      />

      <AuthModal
        isOpen={isAuthOpen}
        mode={mode}
        isSubmitting={isAuthSubmitting}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
