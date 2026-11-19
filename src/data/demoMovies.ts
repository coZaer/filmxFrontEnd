import type { MovieResponse } from '../types/film';

export const INITIAL_DEMO_MOVIES: MovieResponse[] = [
  {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    releaseYear: 2010,
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
  },
  {
    id: 2,
    title: 'Blade Runner 2049',
    genre: 'Sci-Fi',
    director: 'Denis Villeneuve',
    releaseYear: 2017,
    description:
      'Young Blade Runner K’s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who has been missing for thirty years.',
  },
  {
    id: 3,
    title: 'Parasite',
    genre: 'Thriller',
    director: 'Bong Joon-ho',
    releaseYear: 2019,
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
  },
  {
    id: 4,
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    director: 'Wes Anderson',
    releaseYear: 2014,
    description:
      'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel’s glorious years under an exceptional concierge.',
  },
  {
    id: 5,
    title: 'Whiplash',
    genre: 'Drama',
    director: 'Damien Chazelle',
    releaseYear: 2014,
    description:
      'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing.',
  },
  {
    id: 6,
    title: 'Mad Max: Fury Road',
    genre: 'Action',
    director: 'George Miller',
    releaseYear: 2015,
    description:
      'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners and a drifter named Max.',
  },
  {
    id: 7,
    title: 'The Dark Knight',
    genre: 'Action',
    director: 'Christopher Nolan',
    releaseYear: 2008,
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  },
  {
    id: 8,
    title: 'Everything Everywhere All at Once',
    genre: 'Adventure',
    director: 'Daniel Kwan',
    releaseYear: 2022,
    description:
      'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.',
  },
];

export interface DemoAccount {
  userName: string;
  email: string;
  password: string;
}

export const INITIAL_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    userName: 'Alex Mercer',
    email: 'alex@filmx.io',
    password: 'password123',
  },
];
