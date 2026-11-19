import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiException, filmApi } from './api';
import { INITIAL_DEMO_MOVIES } from '../data/demoMovies';
import { resolveMoviePoster } from '../utils/posterResolver';
import { buildSpringPage } from '../utils/filmLogic';

test('resolveMoviePoster returns valid local asset URLs for all demo movies and custom genres', () => {
  for (const movie of INITIAL_DEMO_MOVIES) {
    const src = resolveMoviePoster(movie);
    assert.ok(src.startsWith('/src/assets/images/'), `Unexpected poster path: ${src}`);
    assert.ok(src.endsWith('.jpg'));
  }

  const customGenreSrc = resolveMoviePoster({ id: 99, title: 'Unknown Film', genre: 'Drama' });
  assert.ok(customGenreSrc.includes('poster_drama_jazz'));

  const unknownGenreSrc = resolveMoviePoster({ id: 100, title: 'Mystery Film', genre: 'Documentary' });
  assert.ok(unknownGenreSrc.startsWith('/src/assets/images/'));
});

test('filmApi live mode handles Spring Boot JSON responses, 404 errors, and HTML fallback', async () => {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Valid Spring Data Page response
    const mockPage = buildSpringPage(INITIAL_DEMO_MOVIES, 0, 6);
    globalThis.fetch = async (input) => {
      assert.equal(String(input), 'http://localhost:8080/films?page=0&size=6');
      return new Response(JSON.stringify(mockPage), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const liveRes = await filmApi.getFilms('live', 0, 6);
    assert.equal(liveRes.modeUsed, 'live');
    assert.equal(liveRes.fellBackToDemo, false);
    assert.equal(liveRes.data.content.length, 6);

    // 2. Spring Boot 404 error payload throws ApiException without falling back to Demo Mode
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: 404,
          message: 'Movie not found',
          timestamp: '2026-11-19T12:00:00Z',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );

    await assert.rejects(
      () => filmApi.getFilmById('live', 999),
      (err: unknown) => {
        assert.ok(err instanceof ApiException);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Movie not found');
        return true;
      }
    );

    // 3. HTML response triggers Demo Mode fallback
    globalThis.fetch = async () =>
      new Response('<!doctype html><html><body>Proxy</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });

    const fallbackRes = await filmApi.getFilms('live', 0, 6);
    assert.equal(fallbackRes.modeUsed, 'demo');
    assert.equal(fallbackRes.fellBackToDemo, true);
    assert.equal(fallbackRes.data.totalElements, 8);

    // 4. Live DELETE returning 204 No Content succeeds
    globalThis.fetch = async () => new Response(null, { status: 204 });
    const delRes = await filmApi.deleteFilm('live', 1);
    assert.equal(delRes.modeUsed, 'live');

    // 5. Live register (plain text) & login (JSON)
    globalThis.fetch = async () =>
      new Response('User registered successfully', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    const regRes = await filmApi.register('live', {
      userName: 'Leyla',
      email: 'leyla@filmx.io',
      password: 'secret123',
    });
    assert.equal(regRes.data, 'User registered successfully');

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: 'Login successful: Leyla' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    const loginRes = await filmApi.login('live', {
      email: 'leyla@filmx.io',
      password: 'secret123',
    });
    assert.equal(loginRes.data.message, 'Login successful: Leyla');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
