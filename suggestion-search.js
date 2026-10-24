import { norm } from './game.js';

export function searchSongs(songs, query, limit = 6) {
  const term = norm(query);
  const words = query.trim().split(/\s+/).map(norm).filter(Boolean);
  if (!term || !words.length) return [];
  const matches = new Map();
  for (const song of songs) {
    if (!song.trackName || !song.artistName) continue;
    const title = norm(song.trackName), artist = norm(song.artistName);
    if (!words.every((word) => `${title} ${artist}`.includes(word))) continue;
    const key = `${title}|${artist}`;
    if (matches.has(key)) continue;
    const rank = title === term ? 0 : title.startsWith(term) ? 1 : title.includes(term) ? 2 : 3;
    matches.set(key, { song, rank });
  }
  return [...matches.values()].sort((a, b) => a.rank - b.rank || a.song.trackName.localeCompare(b.song.trackName))
    .slice(0, limit).map(({ song }) => song);
}
