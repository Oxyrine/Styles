// Run: node check.mjs  (exits non-zero if the game logic breaks)
import assert from 'node:assert/strict';
import { searchSongs } from './suggestion-search.js';
import { TRACKS, DIFFICULTIES } from './songs.js';
import { LADDER, MIXER_PER_DIFFICULTY, ROUNDS_PER_TRACK, norm, isCorrect, cleanPool, buildRounds, customRounds, buildMixer, buildClimb, alternates, score, firstLoud } from './game.js';

// norm / isCorrect
assert.equal(norm('Beyoncé — Crazy in Love (Remastered)'), norm('Beyonce — Crazy in Love'));
assert.equal(norm('Mr. Brightside - Remastered 2011'), norm('mr brightside'));
const song = { title: 'Crazy in Love (feat. Jay-Z)', artist: 'Beyoncé' };
assert.ok(isCorrect('crazy in love', song));
assert.ok(isCorrect('Crazy in Love — Beyoncé', song));
assert.ok(isCorrect('Crazy in Love — Beyoncé & JAY-Z', song)); // collaborator credit differs
assert.ok(!isCorrect('Crazy in Love — Rihanna', song));
assert.ok(!isCorrect('Crazy', song));
assert.ok(!isCorrect('', song));

// ladder is strictly increasing and starts at 0.1s
assert.equal(LADDER[0], 0.1);
assert.ok(LADDER.every((v, i) => i === 0 || v > LADDER[i - 1]));
assert.equal(score(0, false), LADDER.length);
assert.equal(score(LADDER.length - 1, false), 1);
assert.equal(score(0, true), 0);

// cleanPool: drops other artists, karaoke/live/remix, dupes and previewless; windows by difficulty
const mk = (trackName, artistName = 'Queen', previewUrl = 'p') => ({ trackName, artistName, previewUrl });
const raw = [
  mk('Bohemian Rhapsody'), mk('Bohemian Rhapsody - Remastered 2011'), mk('Queen', 'Loren Gray'),
  mk("Don't Stop Me Now (Live)"), mk('Somebody To Love - Karaoke Version'), mk('Radio Ga Ga', 'Queen', ''),
  mk('We Will Rock You'), mk('Under Pressure', 'Queen & David Bowie'), mk('Killer Queen'),
];
assert.deepEqual(cleanPool(raw, 'Queen').map((r) => r.trackName),
  ['Bohemian Rhapsody', 'We Will Rock You', 'Under Pressure', 'Killer Queen']);
const big = Array.from({ length: 70 }, (_, i) => mk(`Song ${i}`));
assert.equal(cleanPool(big, 'Queen', 'easy').length, 12);
assert.equal(cleanPool(big, 'Queen', 'hard')[0].trackName, 'Song 12'); // hard skips the biggest hits
assert.equal(cleanPool(big.slice(0, 10), 'Queen', 'hard').length, 10); // tiny catalogue falls back to everything
assert.equal(cleanPool([], 'Queen').length, 0);

// tracks have enough artists; buildRounds picks distinct artists from its own track
for (const t of TRACKS) {
  assert.ok(t.artists.length >= ROUNDS_PER_TRACK + 6, t.id);
  const r = buildRounds(t);
  assert.equal(r.length, ROUNDS_PER_TRACK);
  assert.ok(r.every((s) => s.difficulty === t.difficulty && t.artists.includes(s.artist)));
  assert.equal(new Set(r.map((s) => s.artist)).size, r.length);
}
assert.equal(customRounds('Coldplay').length, ROUNDS_PER_TRACK);

// mixer: easy -> medium -> hard, no repeated artists, genres alternate inside a difficulty
for (let n = 0; n < 50; n++) {
  const m = buildMixer(TRACKS);
  assert.equal(m.length, DIFFICULTIES.length * MIXER_PER_DIFFICULTY);
  assert.deepEqual(m.map((s) => s.difficulty), DIFFICULTIES.flatMap((d) => Array(MIXER_PER_DIFFICULTY).fill(d)));
  for (const d of DIFFICULTIES) {
    const g = m.filter((s) => s.difficulty === d).map((s) => s.genre);
    assert.ok(g.every((x, i) => i === 0 || x !== g[i - 1]), `adjacent genres repeat in ${d}`);
  }
}
const alts = alternates(TRACKS, { difficulty: 'hard' }, new Set([norm('Daft Punk')]));
assert.ok(alts.length > 0 && alts.every((s) => s.difficulty === 'hard' && s.artist !== 'Daft Punk'));

// climb: one genre, 4 easy -> 4 medium -> 4 hard, distinct artists, rank windows that don't overlap
for (const t of TRACKS) {
  const c = buildClimb(t);
  assert.equal(c.length, DIFFICULTIES.length * MIXER_PER_DIFFICULTY, t.id);
  assert.deepEqual(c.map((s) => s.difficulty), DIFFICULTIES.flatMap((d) => Array(MIXER_PER_DIFFICULTY).fill(d)));
  assert.ok(c.every((s) => s.genre === t.genre && s.climb && s.depth === `climb-${s.difficulty}` && t.artists.includes(s.artist)));
  assert.equal(new Set(c.map((s) => s.artist)).size, c.length);
}
const ranked = Array.from({ length: 70 }, (_, i) => mk(`Song ${i}`));
const slice = (d) => cleanPool(ranked, 'Queen', d).map((r) => +r.trackName.slice(5));
assert.deepEqual([slice('climb-easy')[0], slice('climb-easy').at(-1)], [0, 7]);
assert.deepEqual([slice('climb-medium')[0], slice('climb-medium').at(-1)], [8, 23]);
assert.deepEqual([slice('climb-hard')[0], slice('climb-hard').at(-1)], [24, 59]);
const swap = alternates(TRACKS, buildClimb(TRACKS[2])[5], new Set())[0]; // a medium-step climb round in Rock
assert.ok(swap.climb && swap.difficulty === 'medium' && swap.depth === 'climb-medium' && TRACKS[2].artists.includes(swap.artist));

// firstLoud skips leading silence
const sr = 1000, buf = new Float32Array(sr).fill(0);
buf.fill(0.5, 400);
assert.ok(Math.abs(firstLoud(buf, sr) - 0.4) <= 0.05);
assert.equal(firstLoud(new Float32Array(sr), sr), 0);

// catalog (built by build-catalog.mjs): every curated artist has a file the app can play 8+ rounds from
import { existsSync, readFileSync } from 'node:fs';
if (existsSync('catalog/_meta.json')) {
  const thin = [];
  for (const a of new Set(TRACKS.flatMap((t) => t.artists))) {
    const f = `catalog/${norm(a)}.json`;
    if (!existsSync(f)) { thin.push(`${a} (no file; the app will use live iTunes)`); continue; }
    const songs = JSON.parse(readFileSync(f, 'utf8'));
    assert.ok(songs.length >= ROUNDS_PER_TRACK, `${a} has only ${songs.length} songs`);
    assert.ok(songs.every((s) => s.trackId && s.trackName && s.previewUrl && s.artworkUrl100 && s.trackViewUrl), `${a} has incomplete rows`);
    assert.equal(cleanPool(songs, a, 'custom').length, songs.length, `${a} file is not pre-cleaned`);
  }
  if (thin.length) console.log('catalog gaps:', thin.join('; '));
}

// Suggestions match titles and artists, rank exact titles first, and collapse release variants.
const searchFixture = [
  { trackName: 'Love Story', artistName: 'Taylor Swift' },
  { trackName: 'Love Story (Remastered)', artistName: 'Taylor Swift' },
  { trackName: 'Lover', artistName: 'Taylor Swift' },
  { trackName: 'Crazy in Love', artistName: 'Beyoncé' },
  { trackName: '<script>Love</script>', artistName: 'A & B' },
];
assert.equal(searchSongs(searchFixture, 'love story')[0].trackName, 'Love Story');
assert.equal(searchSongs(searchFixture, 'love story').length, 1);
assert.equal(searchSongs(searchFixture, 'taylor love').length, 2);
assert.equal(searchSongs(searchFixture, 'beyonce')[0].artistName, 'Beyoncé');
assert.equal(searchSongs(searchFixture, 'love', 2).length, 2);
assert.deepEqual(searchSongs(searchFixture, 'unmatched'), []);
assert.deepEqual(searchSongs(searchFixture, ' '), []);
console.log('check.mjs: all assertions passed');
