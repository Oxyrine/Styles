import { TRACKS } from './songs.js';
import { LADDER, ROUNDS_PER_TRACK, norm, isCorrect, cleanPool, buildRounds, customRounds, buildMixer, buildClimb, alternates, score, firstLoud, shuffle } from './game.js';

const $ = (id) => document.getElementById(id);
const MIXER = { id: 'mixer', name: 'The Mixer', genre: 'All genres', difficulty: 'mix' };
// ponytail: fixed storefront; the India store carried the same or more songs than the US one in every artist tried. Make it a setting if a region's catalogue matters.
const STORE = 'IN';
// One climb per genre: 12 rounds that start easy and end hard inside that genre.
const CLIMBS = TRACKS.map((t) => ({ id: `climb:${t.id}`, name: `${t.genre} Climb`, genre: t.genre, difficulty: 'mix', climbOf: t }));
const fmt = (s) => `${s}s`;
const option = (value) => Object.assign(document.createElement('option'), { value });

class NotFound extends Error {}

let ctx; // AudioContext, created on the first click (browsers block it before a gesture)
let source;
const buffers = new Map(); // previewUrl -> AudioBuffer
let g = null; // current game

// ---------- storage (per-viewer convenience only) ----------
const getBest = (id) => { try { return +localStorage.getItem(`earshot:best:${id}`) || 0; } catch { return 0; } };
const setBest = (id, v) => { try { localStorage.setItem(`earshot:best:${id}`, v); } catch { /* private mode */ } };

// ---------- iTunes ----------
async function itunes(term, { limit = 50, attribute, signal } = {}) {
  const p = new URLSearchParams({ term, entity: 'song', limit, country: STORE });
  if (attribute) p.set('attribute', attribute);
  const res = await fetch(`https://itunes.apple.com/search?${p}`, { signal });
  if (!res.ok) throw new Error(`iTunes search failed (${res.status})`);
  return (await res.json()).results;
}

// Curated artists ship as static files (see build-catalog.mjs), so a round costs one small CDN read, not an iTunes search.
async function fromCatalog(artist) {
  try {
    const res = await fetch(`catalog/${norm(artist)}.json`);
    if (!res.ok) return null;
    const songs = await res.json();
    songs.fromCatalog = true;
    return songs;
  } catch { return null; }
}

// An artist's songs, most popular first: catalog if we have them, live iTunes otherwise (any-artist box).
// Cached so repeat rounds don't refetch. `live` skips the catalog, used when its stored preview links have gone stale.
const pools = new Map();
function pool(artist, limit = 50, live = false) {
  const k = `${norm(artist)}:${limit}:${live}`;
  if (!pools.has(k)) {
    const p = (async () => (!live && await fromCatalog(artist)) || itunes(artist, { limit, attribute: 'artistTerm' }))();
    p.catch(() => pools.delete(k));
    pools.set(k, p);
  }
  return pools.get(k);
}

async function decode(url) {
  if (buffers.has(url)) return buffers.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Preview download failed (${res.status})`);
  const buf = await ctx.decodeAudioData(await res.arrayBuffer());
  buffers.set(url, buf);
  return buf;
}

// Turn round i's slot (an artist) into a playable song. Artists with nothing playable are swapped for another of the same difficulty.
function prepare(i) {
  const my = g, r = my.rounds[i];
  if (r.promise) return r.promise;
  r.promise = (async () => {
    let slot = r.slot, live = false;
    for (let swaps = 0; ; swaps++) {
      const results = await pool(slot.artist, my.custom ? 100 : 50, live);
      const fresh = shuffle(cleanPool(results, slot.artist, slot.depth || slot.difficulty).filter((x) => !my.usedIds.has(x.trackId)));
      let err;
      for (const hit of fresh.slice(0, 3)) {
        try {
          r.buffer = await decode(hit.previewUrl);
        } catch (e) { err = e; continue; }
        my.usedIds.add(hit.trackId);
        r.slot = slot;
        r.song = { title: hit.trackName, artist: hit.artistName };
        r.meta = { previewUrl: hit.previewUrl, art: hit.artworkUrl100.replace('100x100', '300x300'), link: hit.trackViewUrl, title: hit.trackName, artist: hit.artistName };
        r.offset = firstLoud(r.buffer.getChannelData(0), r.buffer.sampleRate);
        return r;
      }
      if (fresh.length) {
        // songs existed but every download failed: stale catalog links get one live retry, otherwise it's the network
        if (results.fromCatalog && !live) { live = true; continue; }
        throw err;
      }
      if (my.custom || swaps >= 6) throw new NotFound(slot.artist);
      my.usedArtists.add(norm(slot.artist));
      slot = alternates(TRACKS, slot, my.usedArtists)[0];
      if (!slot) throw new NotFound();
      live = false;
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
  $('climbs').replaceChildren();
  for (const t of [MIXER, ...TRACKS, ...CLIMBS]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'card' + (t === MIXER ? ' mixer' : '');
    const ramp = t === MIXER || t.climbOf;
    const badge = Object.assign(document.createElement('span'), {
      className: `badge ${t.difficulty}`,
      textContent: ramp ? 'easy → hard' : t.difficulty,
    });
    const name = Object.assign(document.createElement('strong'), { textContent: t.name });
    const meta = Object.assign(document.createElement('small'), {
      textContent: (t === MIXER ? '12 rounds, every genre' : t.climbOf ? `12 rounds, all ${t.genre}, getting harder` : `${t.artists.length} artists, every song they have`) + (getBest(t.id) ? ` · best ${getBest(t.id)}` : ''),
    });
    const arrow = Object.assign(document.createElement('span'), { className: 'track-arrow', textContent: '↗' });
    arrow.setAttribute('aria-hidden', 'true');
    b.append(name, badge, meta, arrow);
    if (t === MIXER) {
      const record = document.createElement('span');
      record.className = 'record';
      record.setAttribute('aria-hidden', 'true');
      record.innerHTML = '<svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="137" fill="currentColor"/><g fill="none" stroke="#42433f" stroke-width="1"><circle cx="140" cy="140" r="123"/><circle cx="140" cy="140" r="114"/><circle cx="140" cy="140" r="105"/><circle cx="140" cy="140" r="96"/><circle cx="140" cy="140" r="87"/><circle cx="140" cy="140" r="78"/></g><circle cx="140" cy="140" r="63" fill="#f5b7c5"/><circle cx="140" cy="140" r="7" fill="#20221f"/></svg>';
      const label = Object.assign(document.createElement('span'), { className: 'record-label', textContent: '0.1s' });
      record.append(label);
      const cta = Object.assign(document.createElement('span'), { className: 'mixer-cta', textContent: 'Play the Mixer' });
      b.prepend(record);
      b.append(cta);
    }
    b.addEventListener('click', () => start(t));
    if (t === MIXER) $('featured-track').replaceChildren(b);
    else {
      const item = document.createElement('div');
      item.setAttribute('role', 'listitem');
      item.append(b);
      (t.climbOf ? $('climbs') : box).append(item);
    }
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
    const badge = Object.assign(document.createElement('span'), { className: `badge ${r.slot.difficulty}` });
    badge.append(r.slot.difficulty, ' ');
    badge.append(Object.assign(document.createElement('span'), { className: 'genre', textContent: `· ${r.slot.genre}` }));
    const name = Object.assign(document.createElement('span'), {
      className: 'name',
      textContent: r.done ? `${r.song.title} — ${r.song.artist}` : '???',
    });
    const pts = Object.assign(document.createElement('span'), {
      className: 'pts ' + (r.done ? (r.points ? 'good' : 'bad') : ''),
      textContent: r.done ? (r.points ? `+${r.points}` : '0') : '',
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
  const slots = track === MIXER ? buildMixer(TRACKS) : track.climbOf ? buildClimb(track.climbOf) : track.custom ? customRounds(track.custom) : buildRounds(track);
  g = {
    track, index: -1, attempt: 0, total: 0, revealed: false, custom: !!track.custom,
    usedIds: new Set(),
    usedArtists: new Set(slots.map((s) => norm(s.artist))),
    rounds: slots.map((slot) => ({ slot, done: false, points: 0 })),
  };
  $('game-title').textContent = track.name;
  $('song-list').replaceChildren();
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
    $('play').classList.remove('loading');
    $('error-msg').textContent = e instanceof NotFound
      ? 'Could not find a playable clip for this round.'
      : 'Network problem while loading the clip. Check your connection and try again.';
    $('error').hidden = false;
    setStatus('');
    return;
  }
  if (stale()) return;
  renderRounds($('rounds')); // the artist may have been swapped for an alternate
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

// ---------- any artist ----------
async function playArtist(e) {
  e.preventDefault();
  const name = $('artist-input').value.trim();
  const msg = $('artist-msg');
  if (name.length < 2) return;
  const btn = $('artist-btn');
  btn.disabled = true;
  msg.textContent = 'Looking up songs…';
  try {
    const songs = cleanPool(await pool(name, 100), name, 'custom');
    if (songs.length < ROUNDS_PER_TRACK) {
      msg.textContent = `Only ${songs.length} playable song${songs.length === 1 ? '' : 's'} found for "${name}". Check the spelling or try another artist.`;
      return;
    }
    // collaborations ("X & Y") show up in the pool, so the shortest credit near the top is the artist's own name
    const display = songs.slice(0, 10).map((s) => s.artistName).sort((a, b) => a.length - b.length)[0];
    msg.textContent = '';
    start({ id: `artist:${norm(name)}`, name: display, genre: 'Any artist', difficulty: 'custom', custom: name });
  } catch {
    msg.textContent = 'Network problem while searching. Try again.';
  } finally {
    btn.disabled = false;
  }
}

// ---------- autocomplete: searches the whole iTunes catalogue as you type ----------
let suggestTimer, suggestCtl;
$('guess').addEventListener('input', () => {
  clearTimeout(suggestTimer);
  const term = $('guess').value.trim();
  if (term.length < 2 || term.includes(' — ')) return; // " — " means an option was just picked
  suggestTimer = setTimeout(async () => {
    suggestCtl?.abort();
    suggestCtl = new AbortController();
    try {
      const res = await itunes(term, { limit: 20, signal: suggestCtl.signal });
      const values = new Set(res.filter((r) => r.trackName).map((r) => `${r.trackName} — ${r.artistName}`));
      $('song-list').replaceChildren(...[...values].map(option));
    } catch { /* aborted or rate-limited: keep the previous suggestions */ }
  }, 300);
});

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
$('artist-form').addEventListener('submit', playArtist);
const home = () => { stop(); g = null; show('home'); renderHome(); };
$('home-btn').addEventListener('click', home);
$('back').addEventListener('click', home);
$('again').addEventListener('click', () => start(g.track));

renderHome();
