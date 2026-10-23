import { TRACKS } from './songs.js';
import { LADDER, norm, isCorrect, pickResult, buildRounds, buildMixer, alternates, score, firstLoud } from './game.js';

const $ = (id) => document.getElementById(id);
const MIXER = { id: 'mixer', name: 'The Mixer', genre: 'All genres', difficulty: 'mix' };
const key = (s) => `${s.title}|${s.artist}`;
const fmt = (s) => `${s}s`;

class NotFound extends Error {}

let ctx; // AudioContext, created on the first click (browsers block it before a gesture)
let source;
const buffers = new Map(); // previewUrl -> AudioBuffer
let g = null; // current game

// ---------- storage (per-viewer convenience only) ----------
const getBest = (id) => { try { return +localStorage.getItem(`earshot:best:${id}`) || 0; } catch { return 0; } };
const setBest = (id, v) => { try { localStorage.setItem(`earshot:best:${id}`, v); } catch { /* private mode */ } };

// ---------- iTunes ----------
async function lookup(song) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=15`);
  if (!res.ok) throw new Error(`iTunes search failed (${res.status})`);
  const hit = pickResult((await res.json()).results, song.title, song.artist);
  if (!hit) throw new NotFound(song.title);
  return {
    previewUrl: hit.previewUrl,
    art: hit.artworkUrl100.replace('100x100', '300x300'),
    link: hit.trackViewUrl,
    title: hit.trackName,
    artist: hit.artistName,
  };
}

async function decode(url) {
  if (buffers.has(url)) return buffers.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Preview download failed (${res.status})`);
  const buf = await ctx.decodeAudioData(await res.arrayBuffer());
  buffers.set(url, buf);
  return buf;
}

// Resolve round i to a playable song. Songs iTunes can't serve are swapped for an unused one of the same difficulty.
function prepare(i) {
  const my = g, r = g.rounds[i];
  if (r.promise) return r.promise;
  r.promise = (async () => {
    let candidates = [r.song];
    for (let tries = 0; ; tries++) {
      const song = candidates.shift();
      try {
        r.meta = await lookup(song);
        r.buffer = await decode(r.meta.previewUrl);
        r.song = song;
        my.used.add(key(song));
        r.offset = firstLoud(r.buffer.getChannelData(0), r.buffer.sampleRate);
        return r;
      } catch (e) {
        if (!(e instanceof NotFound) || tries >= 6) throw e;
        if (!candidates.length) candidates = alternates(TRACKS, song, my.used);
        my.used.add(key(song));
      }
    }
  })();
  r.promise.catch(() => { r.promise = null; }); // allow Retry
  return r.promise;
}

// ---------- views ----------
function show(view) {
  for (const v of ['home', 'game', 'results']) $(`view-${v}`).hidden = v !== view;
  $('home-btn').hidden = view === 'home';
  $('main').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function renderHome() {
  const box = $('tracks');
  box.replaceChildren();
  for (const t of [MIXER, ...TRACKS]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'listitem');
    b.className = 'card' + (t === MIXER ? ' mixer' : '');
    const badge = Object.assign(document.createElement('span'), {
      className: `badge ${t.difficulty}`,
      textContent: t === MIXER ? 'easy → hard' : t.difficulty,
    });
    const name = Object.assign(document.createElement('strong'), { textContent: t.name });
    const meta = Object.assign(document.createElement('small'), {
      textContent: (t === MIXER ? '12 rounds, every genre' : `${t.genre}, 8 rounds`) + (getBest(t.id) ? ` · best ${getBest(t.id)}` : ''),
    });
    b.append(badge, name, meta);
    b.addEventListener('click', () => start(t));
    box.append(b);
  }
}

function renderLadder() {
  const ol = $('ladder');
  ol.replaceChildren(...LADDER.map((s, i) => {
    const li = document.createElement('li');
    li.textContent = fmt(s);
    li.className = i < g.attempt ? 'open miss' : i === g.attempt ? 'open current' : '';
    return li;
  }));
}

function renderRounds(list, finalView = false) {
  list.replaceChildren(...g.rounds.map((r, i) => {
    const li = document.createElement('li');
    li.className = (r.done ? 'done ' : '') + (i === g.index && !finalView ? 'now' : '');
    const n = Object.assign(document.createElement('span'), { className: 'n', textContent: i + 1 });
    const badge = Object.assign(document.createElement('span'), { className: `badge ${r.song.difficulty}` });
    badge.append(r.song.difficulty, ' ');
    badge.append(Object.assign(document.createElement('span'), { className: 'genre', textContent: `· ${r.song.genre}` }));
    const name = Object.assign(document.createElement('span'), {
      className: 'name',
      textContent: r.done ? `${r.song.title} — ${r.song.artist}` : '???',
    });
    const pts = Object.assign(document.createElement('span'), {
      className: 'pts ' + (r.done ? (r.points ? 'good' : 'bad') : ''),
      textContent: r.done ? (r.points ? `+${r.points}` : '✗') : '',
    });
    li.append(n, badge, name, pts);
    return li;
  }));
}

function setStatus(text, cls = '') {
  const s = $('status');
  s.textContent = text;
  s.className = `status ${cls}`;
}

function setBusy(busy) {
  $('play').disabled = busy;
  $('play').classList.toggle('loading', busy);
  for (const id of ['guess', 'guess-btn', 'skip']) $(id).disabled = busy || g.revealed;
}

// ---------- game flow ----------
function start(track) {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  const songs = track === MIXER ? buildMixer(TRACKS) : buildRounds(track);
  g = {
    track, index: -1, attempt: 0, total: 0, revealed: false,
    used: new Set(songs.map(key)),
    rounds: songs.map((song) => ({ song, done: false, points: 0 })),
  };
  $('game-title').textContent = track.name;
  show('game');
  nextRound();
}

async function nextRound() {
  stop();
  g.index++;
  if (g.index >= g.rounds.length) return finish();
  g.attempt = 0;
  g.revealed = false;
  $('reveal').hidden = true;
  $('error').hidden = true;
  $('guess').value = '';
  $('round-label').textContent = `Round ${g.index + 1} of ${g.rounds.length}`;
  $('score').textContent = g.total;
  renderLadder();
  renderRounds($('rounds'));
  await load();
}

async function load() {
  const my = g, i = g.index;
  const stale = () => g !== my || i !== g.index; // user left the game or moved on mid-load
  $('error').hidden = true;
  setStatus('Finding the clip…');
  setBusy(true);
  try {
    await prepare(i);
  } catch (e) {
    if (stale()) return;
    $('error-msg').textContent = e instanceof NotFound
      ? 'Could not find a playable clip for this round.'
      : 'Network problem while loading the clip. Check your connection and try again.';
    $('error').hidden = false;
    setStatus('');
    return;
  }
  if (stale()) return;
  renderRounds($('rounds')); // the song may have been swapped for an alternate
  setBusy(false);
  setStatus('Press play, then guess.');
  play();
  $('guess').focus({ preventScroll: true });
  if (g.rounds[i + 1]) prepare(i + 1).catch(() => {}); // warm the next round
}

function stop() {
  try { source?.stop(); } catch { /* already stopped */ }
  source = null;
  $('play').classList.remove('playing');
  const fill = $('bar-fill');
  fill.style.transition = 'none';
  fill.style.width = '0';
}

function play() {
  const r = g.rounds[g.index];
  if (!r.buffer) return;
  ctx.resume();
  stop();
  const dur = LADDER[Math.min(g.attempt, LADDER.length - 1)];
  source = ctx.createBufferSource();
  source.buffer = r.buffer;
  source.connect(ctx.destination);
  source.start(0, r.offset, dur);
  const mine = source;
  mine.onended = () => { if (source === mine) stop(); };
  $('play').classList.add('playing');
  const fill = $('bar-fill');
  void fill.offsetWidth; // restart the transition
  fill.style.transition = `width ${dur}s linear`;
  fill.style.width = '100%';
}

function miss(message) {
  g.attempt++;
  if (g.attempt >= LADDER.length) return reveal(false);
  renderLadder();
  setStatus(`${message} Now ${fmt(LADDER[g.attempt])} of the song.`, 'bad');
  play();
  $('guess').value = '';
  $('guess').focus({ preventScroll: true });
}

function reveal(correct) {
  stop();
  const r = g.rounds[g.index];
  g.revealed = true;
  r.done = true;
  r.points = score(g.attempt, !correct);
  g.total += r.points;
  $('score').textContent = g.total;
  setBusy(false);
  for (const id of ['guess', 'guess-btn', 'skip']) $(id).disabled = true;
  $('play').disabled = true;
  const v = $('reveal-verdict');
  v.textContent = correct ? `Got it! +${r.points} point${r.points === 1 ? '' : 's'}` : 'It was…';
  v.className = `verdict ${correct ? 'good' : 'bad'}`;
  $('reveal-title').textContent = r.meta.title;
  $('reveal-artist').textContent = r.meta.artist;
  $('art').src = r.meta.art;
  $('art').alt = `Album art for ${r.meta.title}`;
  $('full').src = r.meta.previewUrl;
  $('reveal-link').href = r.meta.link;
  $('next').textContent = g.index === g.rounds.length - 1 ? 'See results →' : 'Next song →';
  $('reveal').hidden = false;
  setStatus('');
  renderLadder();
  renderRounds($('rounds'));
  $('next').focus({ preventScroll: true });
}

function finish() {
  stop();
  const max = g.rounds.length * LADDER.length;
  const best = getBest(g.track.id);
  setBest(g.track.id, Math.max(best, g.total));
  $('final-score').textContent = g.total;
  $('final-max').textContent = max;
  $('final-note').textContent = g.total > best
    ? (best ? `New best on ${g.track.name}! Previous: ${best}.` : `First score on ${g.track.name}. It's now your best.`)
    : `Best on ${g.track.name}: ${best}.`;
  renderRounds($('results-rounds'), true);
  show('results');
}

// ---------- events ----------
$('play').addEventListener('click', play);
$('retry').addEventListener('click', load);
$('next').addEventListener('click', nextRound);
$('skip').addEventListener('click', () => miss('Skipped.'));
$('guess-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const guess = $('guess').value.trim();
  if (!guess || g.revealed) return;
  const r = g.rounds[g.index];
  isCorrect(guess, r.song) ? reveal(true) : miss('Not it.');
});
const home = () => { stop(); g = null; show('home'); renderHome(); };
$('home-btn').addEventListener('click', home);
$('back').addEventListener('click', home);
$('again').addEventListener('click', () => start(g.track));

// datalist spans every track so the options never hint at the answer's genre
$('song-list').replaceChildren(...[...new Set(TRACKS.flatMap((t) => t.songs.map(([a, b]) => `${a} — ${b}`)))]
  .sort((a, b) => norm(a).localeCompare(norm(b)))
  .map((v) => Object.assign(document.createElement('option'), { value: v })));

renderHome();
