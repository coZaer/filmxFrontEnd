import type {
  ApiErrorPayload,
  MovieRequest,
  MovieResponse,
  RegisterRequest,
  SpringPage,
} from '../types/film';

export interface MovieValidationErrors {
  title?: string;
  genre?: string;
  director?: string;
  releaseYear?: string;
  description?: string;
}

export interface AuthValidationErrors {
  userName?: string;
  email?: string;
  password?: string;
}

/**
 * Slices an array of movies into a Spring Data Page<MovieResponse> structure.
 */
export function buildSpringPage<T>(
  items: T[],
  pageIndex: number,
  pageSize: number
): SpringPage<T> {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const totalElements = items.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);

  const clampedPage =
    totalPages === 0
      ? 0
      : Math.min(Math.max(0, Math.floor(pageIndex)), totalPages - 1);

  const start = clampedPage * safeSize;
  const content = items.slice(start, start + safeSize);

  return {
    content,
    totalPages,
    totalElements,
    number: clampedPage,
    size: safeSize,
    first: clampedPage === 0,
    last: totalPages === 0 ? true : clampedPage >= totalPages - 1,
  };
}

/**
 * Client-side filter matching title, genre, or director, plus optional genre pill filter.
 */
export function filterMovies(
  movies: MovieResponse[],
  query: string,
  selectedGenre = 'All'
): MovieResponse[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedGenre = selectedGenre.trim().toLowerCase();

  return movies.filter((movie) => {
    const matchesGenre =
      normalizedGenre === '' ||
      normalizedGenre === 'all' ||
      movie.genre.toLowerCase() === normalizedGenre;

    if (!matchesGenre) return false;
    if (!normalizedQuery) return true;

    return (
      movie.title.toLowerCase().includes(normalizedQuery) ||
      movie.genre.toLowerCase().includes(normalizedQuery) ||
      movie.director.toLowerCase().includes(normalizedQuery) ||
      String(movie.releaseYear).includes(normalizedQuery)
    );
  });
}

/**
 * Extracts unique sorted genres from movies list.
 */
export function extractUniqueGenres(movies: MovieResponse[]): string[] {
  const seen = new Set<string>();
  for (const movie of movies) {
    const trimmed = movie.genre.trim();
    if (trimmed) seen.add(trimmed);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

/**
 * Extracts userName from Spring Boot LoginResponse:
 * { "message": "Login successful: <userName>" }
 */
export function parseLoginUserName(message: string, fallbackEmail = ''): string {
  const prefix = 'Login successful:';
  const idx = message.indexOf(prefix);
  if (idx !== -1) {
    const extracted = message.slice(idx + prefix.length).trim();
    if (extracted.length > 0) return extracted;
  }
  if (fallbackEmail.includes('@')) {
    return fallbackEmail.split('@')[0];
  }
  return 'Studio Member';
}

/**
 * Validates MovieRequest form fields before POST / PUT.
 */
export function validateMovieRequest(
  input: Partial<MovieRequest>
): MovieValidationErrors {
  const errors: MovieValidationErrors = {};
  const maxYear = new Date().getFullYear() + 5;

  if (!input.title || input.title.trim().length < 1) {
    errors.title = 'Movie title is required.';
  } else if (input.title.trim().length > 140) {
    errors.title = 'Title must be 140 characters or fewer.';
  }

  if (!input.genre || input.genre.trim().length < 2) {
    errors.genre = 'Genre is required (at least 2 characters).';
  }

  if (!input.director || input.director.trim().length < 2) {
    errors.director = 'Director name is required.';
  }

  const year = Number(input.releaseYear);
  if (!Number.isInteger(year) || year < 1888 || year > maxYear) {
    errors.releaseYear = `Release year must be between 1888 and ${maxYear}.`;
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }

  return errors;
}

/**
 * Validates Login / Register form fields.
 */
export function validateAuthForm(
  mode: 'login' | 'register',
  input: Partial<RegisterRequest>
): AuthValidationErrors {
  const errors: AuthValidationErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (mode === 'register') {
    if (!input.userName || input.userName.trim().length < 2) {
      errors.userName = 'Username must be at least 2 characters.';
    }
  }

  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!input.password || input.password.length < 6 || input.password.trim().length === 0) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

/**
 * Safely parses a Spring Boot error payload `{ status, message, timestamp }`
 * or falls back cleanly when body is text or malformed.
 */
export function parseBackendError(
  status: number,
  rawBody: string
): ApiErrorPayload {
  const fallbackTimestamp = new Date().toISOString();
  if (!rawBody || !rawBody.trim()) {
    return {
      status,
      message: `Request failed with status ${status}`,
      timestamp: fallbackTimestamp,
    };
  }

  try {
    const parsed = JSON.parse(rawBody) as Partial<ApiErrorPayload>;
    return {
      status: typeof parsed.status === 'number' ? parsed.status : status,
      message:
        typeof parsed.message === 'string' && parsed.message.trim()
          ? parsed.message
          : `Request failed with status ${status}`,
      timestamp:
        typeof parsed.timestamp === 'string'
          ? parsed.timestamp
          : fallbackTimestamp,
    };
  } catch {
    return {
      status,
      message: rawBody.trim(),
      timestamp: fallbackTimestamp,
    };
  }
}

/**
 * Generates visible page numbers around the current 0-indexed page.
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number
): number[] {
  if (totalPages <= 0) return [];
  const pages: number[] = [];
  for (let i = 0; i < totalPages; i += 1) {
    pages.push(i);
  }
  return pages;
}

/**
 * Detects if a server response is an HTML page (e.g. a dev proxy fallback)
 * rather than a Spring Boot JSON/text API response.
 */
export function isLikelyHtmlResponse(
  rawBody: string,
  contentType?: string | null
): boolean {
  if (contentType && contentType.toLowerCase().includes('text/html')) {
    return true;
  }
  const trimmed = rawBody.trim().toLowerCase();
  return (
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<head')
  );
}

/**
 * Validates that a parsed JSON payload matches Spring Data Page<T>.
 */
export function isValidSpringPage(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;
  return (
    Array.isArray(candidate.content) &&
    typeof candidate.totalElements === 'number' &&
    typeof candidate.totalPages === 'number' &&
    typeof candidate.number === 'number'
  );
}

/**
 * Validates that a parsed JSON payload matches MovieResponse.
 */
export function isValidMovieResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string'
  );
}

/**
 * Validates that a parsed JSON payload matches LoginResponse.
 */
export function isValidLoginResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;
  return typeof candidate.message === 'string';
}
