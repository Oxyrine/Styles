// Pure game logic, no DOM or network, so check.mjs can run it under Node.
import { DIFFICULTIES } from './songs.js';

export const LADDER = [0.1, 0.5, 1, 2, 4, 8, 15]; // seconds revealed per attempt
export const ROUNDS_PER_TRACK = 8;
export const MIXER_PER_DIFFICULTY = 4;
// iTunes returns an artist's songs most-popular first, so a rank window is the difficulty lever.
export const DEPTH = { easy: [0, 12], medium: [0, 30], hard: [12, 60], custom: [0, 60] };

export const norm = (s) =>
  String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/\s-\s.*$/, ' ') // "- Remastered 2011", "- Single Version"
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '');

const sameArtist = (a, b) => {
  const x = norm(a), y = norm(b);
  return !!x && !!y && (x.includes(y) || y.includes(x));
};

// Guess is either "Title" or "Title — Artist" (what the autocomplete inserts).
export function isCorrect(guess, song) {
  const [t, a] = guess.split(' — ');
  if (norm(t) !== norm(song.title)) return false;
  return a === undefined || sameArtist(a, song.artist);
}

const VARIANT = /karaoke|tribute|instrumental|originally performed|lullaby|[(\[-]\s*(live|remix|acoustic|demo|extended|radio edit|sped up|slowed)/i;

// Raw iTunes results -> playable, de-duplicated songs by this artist, inside the difficulty's rank window.
// Falls back to the whole list when the window is nearly empty (artists with few songs).
export function cleanPool(results, artist, difficulty = 'custom') {
  const seen = new Set();
  const all = results.filter((r) => {
    if (!r.previewUrl || !r.trackName || !sameArtist(r.artistName, artist) || VARIANT.test(r.trackName)) return false;
    const k = norm(r.trackName);
    return !seen.has(k) && seen.add(k);
  });
  const [from, to] = DEPTH[difficulty] || DEPTH.custom;
  const windowed = all.slice(from, to);
  return windowed.length >= 3 ? windowed : all;
}

export const shuffle = (arr, rng = Math.random) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// A slot is a round before its song is picked: which artist, and the genre/difficulty badge.
const slot = (t, artist) => ({ artist, genre: t.genre, difficulty: t.difficulty });

export const buildRounds = (track, rng = Math.random) =>
  shuffle(track.artists, rng).slice(0, ROUNDS_PER_TRACK).map((a) => slot(track, a));

export const customRounds = (artist, n = ROUNDS_PER_TRACK) =>
  Array.from({ length: n }, () => ({ artist, genre: 'Any artist', difficulty: 'custom' }));

// Easy, then medium, then hard; inside a difficulty alternate genres round-robin.
export function buildMixer(tracks, rng = Math.random) {
  const rounds = [];
  for (const d of DIFFICULTIES) {
    const pools = shuffle(tracks.filter((t) => t.difficulty === d), rng)
      .map((t) => shuffle(t.artists, rng).map((a) => slot(t, a)));
    for (let i = 0; i < MIXER_PER_DIFFICULTY; i++) rounds.push(pools[i % pools.length].shift());
  }
  return rounds;
}

// If an artist can't be served, swap in an unused artist of the same difficulty.
export function alternates(tracks, round, usedArtists, rng = Math.random) {
  const all = tracks.filter((t) => t.difficulty === round.difficulty)
    .flatMap((t) => t.artists.map((a) => slot(t, a)));
  return shuffle(all, rng).filter((s) => !usedArtists.has(norm(s.artist)));
}

export const score = (attempt, revealed) => (revealed ? 0 : LADDER.length - attempt);

// First 50ms window that isn't near-silence, so a 0.1s clip never lands in a fade-in.
// ponytail: plain RMS threshold; per-song hand-picked hook offsets if it picks dull spots.
export function firstLoud(data, sampleRate, threshold = 0.03) {
  const win = Math.floor(sampleRate * 0.05);
  for (let i = 0; i + win <= data.length; i += win) {
    let sum = 0;
    for (let j = i; j < i + win; j++) sum += data[j] * data[j];
    if (Math.sqrt(sum / win) > threshold) return i / sampleRate;
  }
  return 0;
}
