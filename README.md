# Earshot

Guess the song from a split second. You hear 0.1s, and every miss unlocks a longer clip (0.1, 0.5, 1, 2, 4, 8, 15 seconds) until the song is revealed.

- Seven genre tracks across three difficulties, plus **The Mixer** (4 easy, 4 medium, 4 hard).
- Audio comes from the keyless iTunes Search API. Spotify removed preview clips for new apps in 2024.
- Static site, no build step: `py -m http.server` in this folder, or any static host.
- `node check.mjs` runs the logic assertions; `node verify-songs.mjs` confirms every curated song still resolves (slow, rate-limited).

Live: https://earshot-zeta.vercel.app
