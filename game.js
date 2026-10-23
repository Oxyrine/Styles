// Pure game logic, no DOM or network, so check.mjs can run it under Node.
import { DIFFICULTIES } from './songs.js';

export const LADDER = [0.1, 0.5, 1, 2, 4, 8, 15]; // seconds revealed per attempt
export const ROUNDS_PER_TRACK = 8;
export const MIXER_PER_DIFFICULTY = 4;

export const norm = (s) =>
  String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/\s-\s.*$/, ' ') // "- Remastered 2011", "- Single Version"
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '');

// Guess is either "Title" or "Title — Artist" (what the datalist inserts).
export function isCorrect(guess, song) {
  const [t, a] = guess.split(' — ');
  if (norm(t) !== norm(song.title)) return false;
  return a === undefined || norm(a) === norm(song.artist);
}

// iTunes returns near-misses (covers, karaoke), so require the title to match and prefer the artist too.
export function pickResult(results, title, artist) {
  const playable = results.filter((r) => r.previewUrl && norm(r.trackName) === norm(title));
  const a = norm(artist);
  return (
    playable.find((r) => { const n = norm(r.artistName); return n.includes(a) || a.includes(n); }) ||
    playable[0] || null
  );
}

export const shuffle = (arr, rng = Math.random) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const tag = (t, [title, artist]) => ({ title, artist, genre: t.genre, difficulty: t.difficulty });

export const buildRounds = (track, rng = Math.random) =>
  shuffle(track.songs, rng).slice(0, ROUNDS_PER_TRACK).map((s) => tag(track, s));

// Easy, then medium, then hard; inside a difficulty alternate genres round-robin.
export function buildMixer(tracks, rng = Math.random) {
  const rounds = [];
  for (const d of DIFFICULTIES) {
    const pools = shuffle(tracks.filter((t) => t.difficulty === d), rng)
      .map((t) => shuffle(t.songs, rng).map((s) => tag(t, s)));
    for (let i = 0; i < MIXER_PER_DIFFICULTY; i++) rounds.push(pools[i % pools.length].shift());
  }
  return rounds;
}

// Songs iTunes can't serve get swapped for an unused song of the same difficulty.
export function alternates(tracks, round, used, rng = Math.random) {
  const all = tracks.filter((t) => t.difficulty === round.difficulty)
    .flatMap((t) => t.songs.map((s) => tag(t, s)));
  return shuffle(all, rng).filter((s) => !used.has(`${s.title}|${s.artist}`));
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
