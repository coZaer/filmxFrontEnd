import type { MovieResponse } from '../types/film';

const POSTER_ASSETS = {
  scifiCity: '/src/assets/images/poster_scifi_city_1795089053388.jpg',
  cyberHorizon: '/src/assets/images/poster_cyber_horizon_1795089053071.jpg',
  thrillerVilla: '/src/assets/images/poster_thriller_villa_1795089053551.jpg',
  comedyHotel: '/src/assets/images/poster_comedy_hotel_1795089053633.jpg',
  dramaJazz: '/src/assets/images/poster_drama_jazz_1795089052819.jpg',
  actionFury: '/src/assets/images/poster_action_fury_1795089053458.jpg',
} as const;

const TITLE_POSTER_MAP: Record<string, string> = {
  inception: POSTER_ASSETS.scifiCity,
  'blade runner 2049': POSTER_ASSETS.cyberHorizon,
  parasite: POSTER_ASSETS.thrillerVilla,
  'the grand budapest hotel': POSTER_ASSETS.comedyHotel,
  whiplash: POSTER_ASSETS.dramaJazz,
  'mad max: fury road': POSTER_ASSETS.actionFury,
  'the dark knight': POSTER_ASSETS.thrillerVilla,
  'everything everywhere all at once': POSTER_ASSETS.scifiCity,
};

const GENRE_POSTER_MAP: Record<string, string> = {
  'sci-fi': POSTER_ASSETS.cyberHorizon,
  thriller: POSTER_ASSETS.thrillerVilla,
  comedy: POSTER_ASSETS.comedyHotel,
  drama: POSTER_ASSETS.dramaJazz,
  action: POSTER_ASSETS.actionFury,
  adventure: POSTER_ASSETS.scifiCity,
  crime: POSTER_ASSETS.thrillerVilla,
  horror: POSTER_ASSETS.thrillerVilla,
};

const FALLBACK_POSTERS = [
  POSTER_ASSETS.scifiCity,
  POSTER_ASSETS.cyberHorizon,
  POSTER_ASSETS.thrillerVilla,
  POSTER_ASSETS.comedyHotel,
  POSTER_ASSETS.dramaJazz,
  POSTER_ASSETS.actionFury,
];

export function resolveMoviePoster(movie: Pick<MovieResponse, 'id' | 'title' | 'genre'>): string {
  const titleKey = movie.title.trim().toLowerCase();
  if (TITLE_POSTER_MAP[titleKey]) {
    return TITLE_POSTER_MAP[titleKey];
  }

  const genreKey = movie.genre.trim().toLowerCase();
  if (GENRE_POSTER_MAP[genreKey]) {
    return GENRE_POSTER_MAP[genreKey];
  }

  const index = Math.abs(movie.id) % FALLBACK_POSTERS.length;
  return FALLBACK_POSTERS[index];
}
