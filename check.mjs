// Run: node check.mjs  (exits non-zero if the game logic breaks)
import assert from 'node:assert/strict';
import { TRACKS, DIFFICULTIES } from './songs.js';
import { LADDER, MIXER_PER_DIFFICULTY, norm, isCorrect, pickResult, buildRounds, buildMixer, alternates, score, firstLoud } from './game.js';

// norm / isCorrect
assert.equal(norm('Beyoncé — Crazy in Love (Remastered)'), norm('Beyonce — Crazy in Love'));
assert.equal(norm('Mr. Brightside - Remastered 2011'), norm('mr brightside'));
const song = { title: 'Crazy in Love', artist: 'Beyoncé' };
assert.ok(isCorrect('crazy in love', song));
assert.ok(isCorrect('Crazy in Love — Beyoncé', song));
assert.ok(!isCorrect('Crazy in Love — Rihanna', song));
assert.ok(!isCorrect('Crazy', song));
assert.ok(!isCorrect('', song));

// ladder is strictly increasing and starts at 0.1s
assert.equal(LADDER[0], 0.1);
assert.ok(LADDER.every((v, i) => i === 0 || v > LADDER[i - 1]));
assert.equal(score(0, false), LADDER.length);
assert.equal(score(LADDER.length - 1, false), 1);
assert.equal(score(0, true), 0);

// pickResult prefers the right artist and skips results without a preview
const res = [
  { trackName: 'Stay', artistName: 'Karaoke Crew', previewUrl: 'a' },
  { trackName: 'Stay', artistName: 'The Kid LAROI & Justin Bieber', previewUrl: 'b' },
  { trackName: 'Stay', artistName: 'The Kid LAROI', previewUrl: '' },
];
assert.equal(pickResult(res, 'STAY', 'The Kid LAROI').previewUrl, 'b');
assert.equal(pickResult([], 'x', 'y'), null);

// every track has enough songs; buildRounds is a slice of its own pool
for (const t of TRACKS) {
  assert.ok(t.songs.length >= 12, t.id);
  const r = buildRounds(t);
  assert.ok(r.every((s) => s.difficulty === t.difficulty && t.songs.some(([ti]) => ti === s.title)));
  assert.equal(new Set(r.map((s) => s.title)).size, r.length);
}

// mixer: easy -> medium -> hard, no repeats, genres alternate inside a difficulty
for (let n = 0; n < 50; n++) {
  const m = buildMixer(TRACKS);
  assert.equal(m.length, DIFFICULTIES.length * MIXER_PER_DIFFICULTY);
  assert.deepEqual(m.map((s) => s.difficulty), DIFFICULTIES.flatMap((d) => Array(MIXER_PER_DIFFICULTY).fill(d)));
  assert.equal(new Set(m.map((s) => s.title + s.artist)).size, m.length);
  for (const d of DIFFICULTIES) {
    const g = m.filter((s) => s.difficulty === d).map((s) => s.genre);
    assert.ok(g.every((x, i) => i === 0 || x !== g[i - 1]), `adjacent genres repeat in ${d}`);
  }
}
const used = new Set(['a|b']);
const alts = alternates(TRACKS, { difficulty: 'hard' }, used);
assert.ok(alts.length > 0 && alts.every((s) => s.difficulty === 'hard'));

// firstLoud skips leading silence
const sr = 1000, buf = new Float32Array(sr).fill(0);
buf.fill(0.5, 400);
assert.ok(Math.abs(firstLoud(buf, sr) - 0.4) <= 0.05);
assert.equal(firstLoud(new Float32Array(sr), sr), 0);

console.log('check.mjs: all assertions passed');
