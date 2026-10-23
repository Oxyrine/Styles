// Dev helper: confirms every curated song resolves to an iTunes preview. Run: node verify-songs.mjs
import { TRACKS } from './songs.js';
import { pickResult } from './game.js';

let bad = 0;
for (const t of TRACKS) for (const [title, artist] of t.songs) {
  const q = encodeURIComponent(`${title} ${artist}`);
  const r = await (await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=15`)).json();
  if (!pickResult(r.results, title, artist)) { bad++; console.log('MISS', t.id, '|', title, '-', artist); }
  await new Promise((res) => setTimeout(res, 3200)); // iTunes allows ~20 req/min
}
console.log(bad ? `${bad} unresolved` : 'all resolved');
