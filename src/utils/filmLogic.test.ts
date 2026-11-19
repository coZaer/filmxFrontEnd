import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_DEMO_MOVIES } from '../data/demoMovies';
import {
  buildSpringPage,
  extractUniqueGenres,
  filterMovies,
  getPaginationRange,
  isLikelyHtmlResponse,
  isValidLoginResponse,
  isValidMovieResponse,
  isValidSpringPage,
  parseBackendError,
  parseLoginUserName,
  validateAuthForm,
  validateMovieRequest,
} from './filmLogic';

test('buildSpringPage computes Spring Data Page metadata accurately', () => {
  const page0 = buildSpringPage(INITIAL_DEMO_MOVIES, 0, 6);
  assert.equal(page0.content.length, 6);
  assert.equal(page0.totalElements, 8);
  assert.equal(page0.totalPages, 2);
  assert.equal(page0.number, 0);
  assert.equal(page0.size, 6);
  assert.equal(page0.first, true);
  assert.equal(page0.last, false);

  const page1 = buildSpringPage(INITIAL_DEMO_MOVIES, 1, 6);
  assert.equal(page1.content.length, 2);
  assert.equal(page1.number, 1);
  assert.equal(page1.first, false);
  assert.equal(page1.last, true);
});

test('buildSpringPage clamps out-of-bounds pages and handles empty lists', () => {
  const emptyPage = buildSpringPage([], 0, 6);
  assert.equal(emptyPage.content.length, 0);
  assert.equal(emptyPage.totalPages, 0);
  assert.equal(emptyPage.totalElements, 0);
  assert.equal(emptyPage.first, true);
  assert.equal(emptyPage.last, true);

  const clamped = buildSpringPage(INITIAL_DEMO_MOVIES, 99, 6);
  assert.equal(clamped.number, 1);
  assert.equal(clamped.last, true);
});

test('filterMovies matches title, genre, director, and year case-insensitively', () => {
  const byDirector = filterMovies(INITIAL_DEMO_MOVIES, 'nolan');
  assert.equal(byDirector.length, 2);

  const byGenrePill = filterMovies(INITIAL_DEMO_MOVIES, '', 'Sci-Fi');
  assert.equal(byGenrePill.length, 2);

  const combined = filterMovies(INITIAL_DEMO_MOVIES, 'blade', 'Sci-Fi');
  assert.equal(combined.length, 1);
  assert.equal(combined[0].title, 'Blade Runner 2049');
});

test('extractUniqueGenres returns sorted unique genres', () => {
  const genres = extractUniqueGenres(INITIAL_DEMO_MOVIES);
  assert.deepEqual(genres, ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller']);
});

test('parseLoginUserName extracts username from Spring Boot login message', () => {
  assert.equal(
    parseLoginUserName('Login successful: Alex Mercer'),
    'Alex Mercer'
  );
  assert.equal(
    parseLoginUserName('Unexpected message', 'director@filmx.io'),
    'director'
  );
});

test('validateMovieRequest rejects empty or invalid fields and accepts valid MovieRequest', () => {
  const invalid = validateMovieRequest({
    title: '',
    genre: 'A',
    director: '',
    releaseYear: 1800,
    description: 'Too short',
  });
  assert.ok(invalid.title);
  assert.ok(invalid.genre);
  assert.ok(invalid.director);
  assert.ok(invalid.releaseYear);
  assert.ok(invalid.description);

  const valid = validateMovieRequest({
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    director: 'Denis Villeneuve',
    releaseYear: 2024,
    description: 'Paul Atreides unites with the Fremen while on a warpath of revenge.',
  });
  assert.deepEqual(valid, {});
});

test('validateAuthForm checks userName and rejects whitespace-only passwords', () => {
  const loginValid = validateAuthForm('login', {
    email: 'alex@filmx.io',
    password: 'password123',
  });
  assert.deepEqual(loginValid, {});

  const whitespacePass = validateAuthForm('login', {
    email: 'alex@filmx.io',
    password: '      ',
  });
  assert.ok(whitespacePass.password);

  const registerInvalid = validateAuthForm('register', {
    userName: 'A',
    email: 'not-an-email',
    password: '123',
  });
  assert.ok(registerInvalid.userName);
  assert.ok(registerInvalid.email);
  assert.ok(registerInvalid.password);
});

test('parseBackendError parses Spring Boot error JSON and text fallbacks', () => {
  const jsonErr = parseBackendError(
    404,
    JSON.stringify({
      status: 404,
      message: 'Movie not found',
      timestamp: '2026-11-19T10:00:00Z',
    })
  );
  assert.equal(jsonErr.status, 404);
  assert.equal(jsonErr.message, 'Movie not found');

  const textErr = parseBackendError(500, 'Internal server failure');
  assert.equal(textErr.status, 500);
  assert.equal(textErr.message, 'Internal server failure');
});

test('getPaginationRange returns 0-indexed page indices', () => {
  assert.deepEqual(getPaginationRange(0, 3), [0, 1, 2]);
  assert.deepEqual(getPaginationRange(0, 0), []);
});

test('isLikelyHtmlResponse detects HTML responses from non-API servers', () => {
  assert.equal(isLikelyHtmlResponse('<!doctype html><html></html>', 'text/html'), true);
  assert.equal(isLikelyHtmlResponse('<html><body>Not Found</body></html>'), true);
  assert.equal(isLikelyHtmlResponse('{"content":[]}', 'application/json'), false);
  assert.equal(isLikelyHtmlResponse('User registered successfully', 'text/plain'), false);
});

test('isValidSpringPage, isValidMovieResponse, and isValidLoginResponse validate payloads', () => {
  const valid = buildSpringPage(INITIAL_DEMO_MOVIES, 0, 6);
  assert.equal(isValidSpringPage(valid), true);
  assert.equal(isValidSpringPage({ foo: 'bar' }), false);
  assert.equal(isValidSpringPage(null), false);

  assert.equal(isValidMovieResponse({ id: 1, title: 'Inception' }), true);
  assert.equal(isValidMovieResponse({ title: 'No ID' }), false);

  assert.equal(isValidLoginResponse({ message: 'Login successful: Alex' }), true);
  assert.equal(isValidLoginResponse({ status: 200 }), false);
});
