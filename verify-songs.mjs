// Dev helper: confirms every curated artist still has enough playable songs on iTunes. Run: node verify-songs.mjs
import { TRACKS } from './songs.js';
import { cleanPool } from './game.js';

const MIN = 15;
let bad = 0, total = 0;
for (const t of TRACKS) for (const artist of t.artists) {
  const q = new URLSearchParams({ term: artist, entity: 'song', attribute: 'artistTerm', limit: 50, country: 'IN' });
  const { results } = await (await fetch(`https://itunes.apple.com/search?${q}`)).json();
  const n = cleanPool(results, artist, 'custom').length;
  total++;
  if (n < MIN) { bad++; console.log(`LOW ${t.id} | ${artist}: ${n} playable songs`); }
  await new Promise((res) => setTimeout(res, 3200)); // iTunes allows ~20 req/min
}
console.log(`${total} artists checked, ${bad} below ${MIN} songs`);
