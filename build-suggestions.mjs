import { readdir, readFile, writeFile } from 'node:fs/promises';
import { norm } from './game.js';

const songs = new Map();
for (const name of await readdir('catalog')) {
  if (!name.endsWith('.json') || name.startsWith('_')) continue;
  for (const { trackName, artistName } of JSON.parse(await readFile(`catalog/${name}`, 'utf8'))) {
    songs.set(`${norm(trackName)}|${norm(artistName)}`, { trackName, artistName });
  }
}
await writeFile('catalog/_suggestions.json', JSON.stringify([...songs.values()]));
console.log(`Suggestion index: ${songs.size} songs`);
