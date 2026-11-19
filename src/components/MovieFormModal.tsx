import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { MovieRequest, MovieResponse } from '../types/film';
import { validateMovieRequest, type MovieValidationErrors } from '../utils/filmLogic';

interface MovieFormModalProps {
  isOpen: boolean;
  editingMovie: MovieResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MovieRequest, movieId?: number) => Promise<void>;
}

const GENRE_SUGGESTIONS = [
  'Sci-Fi',
  'Drama',
  'Thriller',
  'Action',
  'Comedy',
  'Adventure',
  'Crime',
  'Horror',
];

export function MovieFormModal({
  isOpen,
  editingMovie,
  isSubmitting,
  onClose,
  onSubmit,
}: MovieFormModalProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [releaseYear, setReleaseYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<MovieValidationErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingMovie) {
      setTitle(editingMovie.title);
      setGenre(editingMovie.genre);
      setDirector(editingMovie.director);
      setReleaseYear(String(editingMovie.releaseYear));
      setDescription(editingMovie.description);
    } else {
      setTitle('');
      setGenre('');
      setDirector('');
      setReleaseYear(String(new Date().getFullYear()));
      setDescription('');
    }
    setErrors({});
  }, [isOpen, editingMovie]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingMovie);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: MovieRequest = {
      title: title.trim(),
      genre: genre.trim(),
      director: director.trim(),
      releaseYear: Number(releaseYear),
      description: description.trim(),
    };

    const validationErrors = validateMovieRequest(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSubmit(payload, editingMovie?.id);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-form-title"
        onClick={(e) => e.stopPropagation()}
        className="cinema-modal max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2
              id="movie-form-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              {isEditing ? 'Edit Movie' : 'Add New Movie'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? `Updating catalog record #${editingMovie?.id}`
                : 'Create a new entry in the Filmx catalog.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close movie form"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="movie-title"
              className="block text-xs font-semibold text-slate-700"
            >
              Title
            </label>
            <input
              id="movie-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Dune: Part Two"
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="movie-genre"
                className="block text-xs font-semibold text-slate-700"
              >
                Genre
              </label>
              <input
                id="movie-genre"
                type="text"
                list="genre-suggestions"
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  if (errors.genre) setErrors((prev) => ({ ...prev, genre: undefined }));
                }}
                placeholder="e.g. Sci-Fi"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <datalist id="genre-suggestions">
                {GENRE_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {errors.genre && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.genre}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="movie-year"
                className="block text-xs font-semibold text-slate-700"
              >
                Release Year
              </label>
              <input
                id="movie-year"
                type="number"
                min={1888}
                max={new Date().getFullYear() + 5}
                value={releaseYear}
                onChange={(e) => {
                  setReleaseYear(e.target.value);
                  if (errors.releaseYear) {
                    setErrors((prev) => ({ ...prev, releaseYear: undefined }));
                  }
                }}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 font-mono text-sm text-slate-900 tabular-nums focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              {errors.releaseYear && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.releaseYear}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="movie-director"
              className="block text-xs font-semibold text-slate-700"
            >
              Director
            </label>
            <input
              id="movie-director"
              type="text"
              value={director}
              onChange={(e) => {
                setDirector(e.target.value);
                if (errors.director) setErrors((prev) => ({ ...prev, director: undefined }));
              }}
              placeholder="e.g. Denis Villeneuve"
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {errors.director && (
              <p className="mt-1 text-xs text-rose-600" role="alert">
                {errors.director}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="movie-description"
              className="block text-xs font-semibold text-slate-700"
            >
              Description
            </label>
            <textarea
              id="movie-description"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="Brief synopsis of the film..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[40px] items-center rounded-lg bg-amber-500 px-5 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
