import { INITIAL_DEMO_ACCOUNTS, INITIAL_DEMO_MOVIES, type DemoAccount } from '../data/demoMovies';
import type {
  ApiErrorPayload,
  BackendMode,
  LoginRequest,
  LoginResponse,
  MovieRequest,
  MovieResponse,
  RegisterRequest,
  SpringPage,
} from '../types/film';
import {
  buildSpringPage,
  isLikelyHtmlResponse,
  isValidLoginResponse,
  isValidMovieResponse,
  isValidSpringPage,
  parseBackendError,
} from '../utils/filmLogic';

const BASE_URL = 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 2500;

export class ApiException extends Error {
  status: number;
  timestamp: string;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiException';
    this.status = payload.status;
    this.timestamp = payload.timestamp;
  }
}

class BackendUnreachableError extends Error {
  constructor(message = 'Backend at localhost:8080 is unreachable') {
    super(message);
    this.name = 'BackendUnreachableError';
  }
}

export interface ApiResult<T> {
  data: T;
  modeUsed: BackendMode;
  fellBackToDemo: boolean;
}

class DemoStore {
  private movies: MovieResponse[] = INITIAL_DEMO_MOVIES.map((m) => ({ ...m }));
  private accounts: DemoAccount[] = INITIAL_DEMO_ACCOUNTS.map((a) => ({ ...a }));
  private nextId = 9;

  getPage(pageIndex: number, pageSize: number): SpringPage<MovieResponse> {
    return buildSpringPage(this.movies, pageIndex, pageSize);
  }

  getAll(): MovieResponse[] {
    return [...this.movies];
  }

  getById(id: number): MovieResponse {
    const found = this.movies.find((m) => m.id === id);
    if (!found) {
      throw new ApiException({
        status: 404,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      });
    }
    return { ...found };
  }

  create(req: MovieRequest): MovieResponse {
    const created: MovieResponse = {
      id: this.nextId++,
      title: req.title.trim(),
      genre: req.genre.trim(),
      director: req.director.trim(),
      releaseYear: Number(req.releaseYear),
      description: req.description.trim(),
    };
    this.movies = [created, ...this.movies];
    return { ...created };
  }

  update(id: number, req: MovieRequest): MovieResponse {
    const index = this.movies.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new ApiException({
        status: 404,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      });
    }
    const updated: MovieResponse = {
      id,
      title: req.title.trim(),
      genre: req.genre.trim(),
      director: req.director.trim(),
      releaseYear: Number(req.releaseYear),
      description: req.description.trim(),
    };
    this.movies = [
      ...this.movies.slice(0, index),
      updated,
      ...this.movies.slice(index + 1),
    ];
    return { ...updated };
  }

  softDelete(id: number): void {
    const exists = this.movies.some((m) => m.id === id);
    if (!exists) {
      throw new ApiException({
        status: 404,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      });
    }
    this.movies = this.movies.filter((m) => m.id !== id);
  }

  register(req: RegisterRequest): string {
    const normalizedEmail = req.email.trim().toLowerCase();
    const exists = this.accounts.some(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );
    if (exists) {
      throw new ApiException({
        status: 409,
        message: 'Email is already registered',
        timestamp: new Date().toISOString(),
      });
    }
    this.accounts.push({
      userName: req.userName.trim(),
      email: normalizedEmail,
      password: req.password,
    });
    return 'User registered successfully';
  }

  login(req: LoginRequest): LoginResponse {
    const normalizedEmail = req.email.trim().toLowerCase();
    const account = this.accounts.find(
      (acc) =>
        acc.email.toLowerCase() === normalizedEmail &&
        acc.password === req.password
    );
    if (!account) {
      throw new ApiException({
        status: 401,
        message: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      });
    }
    return {
      message: `Login successful: ${account.userName}`,
    };
  }
}

export const demoStore = new DemoStore();

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function isNetworkUnreachable(error: unknown): boolean {
  if (error instanceof ApiException) return false;
  if (error instanceof BackendUnreachableError) return true;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof TypeError) return true;
  return false;
}

async function handleResponseJson<T>(
  response: Response,
  validator?: (parsed: unknown) => boolean
): Promise<T> {
  const contentType = response.headers.get('content-type');
  const raw = await response.text();

  if (isLikelyHtmlResponse(raw, contentType)) {
    throw new BackendUnreachableError('Received HTML instead of Spring Boot JSON');
  }

  if (!response.ok) {
    throw new ApiException(parseBackendError(response.status, raw));
  }

  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    throw new BackendUnreachableError('Invalid JSON response from localhost:8080');
  }

  if (validator && !validator(parsed)) {
    throw new BackendUnreachableError('Unexpected payload shape from localhost:8080');
  }

  return parsed as T;
}

async function handleResponseText(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type');
  const raw = await response.text();

  if (isLikelyHtmlResponse(raw, contentType)) {
    throw new BackendUnreachableError('Received HTML instead of Spring Boot text');
  }

  if (!response.ok) {
    throw new ApiException(parseBackendError(response.status, raw));
  }

  return raw;
}

export const filmApi = {
  async getFilms(
    mode: BackendMode,
    pageIndex: number,
    pageSize: number
  ): Promise<ApiResult<SpringPage<MovieResponse>>> {
    if (mode === 'demo') {
      return {
        data: demoStore.getPage(pageIndex, pageSize),
        modeUsed: 'demo',
        fellBackToDemo: false,
      };
    }

    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/films?page=${pageIndex}&size=${pageSize}`,
        { method: 'GET' }
      );
      const data = await handleResponseJson<SpringPage<MovieResponse>>(
        response,
        isValidSpringPage
      );
      return { data, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        return {
          data: demoStore.getPage(pageIndex, pageSize),
          modeUsed: 'demo',
          fellBackToDemo: true,
        };
      }
      throw error;
    }
  },

  async getFilmById(
    mode: BackendMode,
    id: number
  ): Promise<ApiResult<MovieResponse>> {
    if (mode === 'demo') {
      return {
        data: demoStore.getById(id),
        modeUsed: 'demo',
        fellBackToDemo: false,
      };
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/films/${id}`, {
        method: 'GET',
      });
      const data = await handleResponseJson<MovieResponse>(
        response,
        isValidMovieResponse
      );
      return { data, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        return {
          data: demoStore.getById(id),
          modeUsed: 'demo',
          fellBackToDemo: true,
        };
      }
      throw error;
    }
  },

  async createFilm(
    mode: BackendMode,
    payload: MovieRequest
  ): Promise<ApiResult<MovieResponse>> {
    if (mode === 'demo') {
      return {
        data: demoStore.create(payload),
        modeUsed: 'demo',
        fellBackToDemo: false,
      };
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/films`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await handleResponseJson<MovieResponse | null>(response);
      const resolved: MovieResponse =
        data && isValidMovieResponse(data)
          ? data
          : { id: Date.now(), ...payload };
      return { data: resolved, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        return {
          data: demoStore.create(payload),
          modeUsed: 'demo',
          fellBackToDemo: true,
        };
      }
      throw error;
    }
  },

  async updateFilm(
    mode: BackendMode,
    id: number,
    payload: MovieRequest
  ): Promise<ApiResult<MovieResponse>> {
    if (mode === 'demo') {
      return {
        data: demoStore.update(id, payload),
        modeUsed: 'demo',
        fellBackToDemo: false,
      };
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/films/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await handleResponseJson<MovieResponse | null>(response);
      const resolved: MovieResponse =
        data && isValidMovieResponse(data) ? data : { id, ...payload };
      return { data: resolved, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        return {
          data: demoStore.update(id, payload),
          modeUsed: 'demo',
          fellBackToDemo: true,
        };
      }
      throw error;
    }
  },

  async deleteFilm(
    mode: BackendMode,
    id: number
  ): Promise<ApiResult<void>> {
    if (mode === 'demo') {
      demoStore.softDelete(id);
      return { data: undefined, modeUsed: 'demo', fellBackToDemo: false };
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/films/${id}`, {
        method: 'DELETE',
      });
      await handleResponseText(response);
      return { data: undefined, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        demoStore.softDelete(id);
        return { data: undefined, modeUsed: 'demo', fellBackToDemo: true };
      }
      throw error;
    }
  },

  async register(
    mode: BackendMode,
    payload: RegisterRequest
  ): Promise<ApiResult<string>> {
    if (mode === 'demo') {
      return {
        data: demoStore.register(payload),
        modeUsed: 'demo',
        fellBackToDemo: false,
      };
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const message = await handleResponseText(response);
      return { data: message, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        return {
          data: demoStore.register(payload),
          modeUsed: 'demo',
          fellBackToDemo: true,
        };
      }
      throw error;
    }
  },

  async login(
    mode: BackendMode,
    payload: LoginRequest
  ): Promise<ApiResult<LoginResponse>> {
    if (mode === 'demo') {
      return {
        data: demoStore.login(payload),
        modeUsed: 'demo',
        fellBackToDemo: false,
      };
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await handleResponseJson<LoginResponse>(
        response,
        isValidLoginResponse
      );
      return { data, modeUsed: 'live', fellBackToDemo: false };
    } catch (error) {
      if (isNetworkUnreachable(error)) {
        return {
          data: demoStore.login(payload),
          modeUsed: 'demo',
          fellBackToDemo: true,
        };
      }
      throw error;
    }
  },
};
