// Pulls every curated artist's songs from iTunes once and writes catalog/<slug>.json, so the game reads a
// small static file per round instead of searching iTunes. Re-run to refresh: node build-catalog.mjs
// Previews are Apple's own files; we store only titles and links, never audio.
import { mkdir, writeFile } from 'node:fs/promises';
import { TRACKS } from './songs.js';
import { norm, cleanPool } from './game.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KEEP = ['trackId', 'trackName', 'artistName', 'previewUrl', 'artworkUrl100', 'trackViewUrl'];

async function search(artist) {
  const q = new URLSearchParams({ term: artist, entity: 'song', attribute: 'artistTerm', limit: 100, country: 'IN' });
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://itunes.apple.com/search?${q}`);
    if (res.ok) return (await res.json()).results;
    await sleep(2000 * 2 ** attempt); // back off if iTunes starts throttling
  }
  throw new Error(`iTunes kept refusing "${artist}"`);
}

const artists = [...new Map(TRACKS.flatMap((t) => t.artists).map((a) => [norm(a), a])).values()];
await mkdir('catalog', { recursive: true });

let songs = 0, failed = [];
for (const artist of artists) {
  try {
    const list = cleanPool(await search(artist), artist, 'custom').map((r) => Object.fromEntries(KEEP.map((k) => [k, r[k]])));
    if (!list.length) { failed.push(artist); continue; }
    await writeFile(`catalog/${norm(artist)}.json`, JSON.stringify(list));
    songs += list.length;
  } catch (e) { failed.push(artist); console.log('FAILED', artist, e.message); }
  await sleep(1200);
}
await writeFile('catalog/_meta.json', JSON.stringify({ builtAt: new Date().toISOString(), artists: artists.length - failed.length, songs }));
console.log(`${artists.length - failed.length}/${artists.length} artists, ${songs} songs${failed.length ? `, missing: ${failed.join(', ')}` : ''}`);
await import('./build-suggestions.mjs');
