# Earshot

Earshot is a browser song-recognition game. The player identifies a title from a tiny audio excerpt, with longer excerpts available after a wrong guess or skip. It requires JavaScript, network access to iTunes search and preview media, and browser audio support. The current app has no sign-up flow.

## Game truth

- Each song starts with 0.1 seconds. The seven attempt lengths are 0.1, 0.5, 1, 2, 4, 8, and 15 seconds.
- A correct answer earns 7 points on the first attempt, decreasing to 1 on the seventh. Exhausting the seven attempts earns zero. A skip consumes an attempt.
- Genre tracks contain eight rounds, with a maximum score of 56. The Mixer contains twelve rounds, four each at easy, medium, and hard, with a maximum of 84. Any-artist games contain eight rounds.
- A round loads and starts its clip automatically after the player starts a game. The play button replays the currently unlocked length. Increasing clip length replays automatically.
- A guess may be a title alone or the title and artist supplied by autocomplete. Matching normalizes case, accents, punctuation, parenthetical variants, and common suffixes; it is not fuzzy title matching.
- After a round, the player sees title, artist, album artwork, points, preview playback, and an Apple Music link. Results show every round and support replay or return to tracks.

## Catalogue and difficulty

The seven authored tracks are Pop Hits and Bollywood Blockbusters (easy); Rock Classics, Hip-Hop, and 2000s Throwbacks (medium); Indie & Alt Deep Cuts and Electronic (hard). Tracks curate artists rather than fixed songs. Rounds shuffle artists and choose playable songs from fetched iTunes results, avoiding repeated track IDs within a game.

Difficulty combines artist selection with rank windows in the returned catalogue: easy 0–12, medium 0–30, hard 12–60, and custom 0–60. A window with fewer than three songs falls back to the cleaned pool. Standard tracks currently request up to 50 search results, so an upper window boundary does not guarantee that many returned songs. Known live, remix, acoustic, karaoke, tribute, instrumental, and other variants are filtered by the implemented title pattern; this is a heuristic.

The Mixer draws across genres in easy-to-hard order. If an authored artist has no playable songs, the app may substitute an unused artist of the same difficulty, including another genre. Any-artist lookup requires at least eight playable songs from up to 100 results and does not substitute a different artist. Availability depends on the current service response; home-page wording about an artist's catalogue does not guarantee every release is available.

## Audio, storage, and recovery

The app searches the India iTunes storefront (`IN`). Audio previews are fetched and decoded with Web Audio. Clip position begins at the first 50ms window above the implemented loudness threshold, rather than a hand-picked hook. Playback uses excerpts of the available preview, rather than full songs. The reveal's native audio player exposes the service preview.

Best scores are stored per track or normalized artist name in this browser's localStorage. Storage failure is tolerated; there is no account synchronization or leaderboard. Search pools and decoded audio are cached in memory for the current page session. The next round is prefetched when possible. Loading errors provide Retry; unavailable artist searches report a message in the form.

## Product voice and boundaries

Copy is playful, brief, and music-literate. It should explain the seven chances, progressive clip lengths, and earlier-answer scoring clearly. Genre and artist entry are equal ways to begin; the Mixer is the featured mixed challenge in the current surface.

The record-store listening-station identity is documented in DESIGN.md. Home-page composition belongs to the surface implementation. Future features such as daily challenges, sharing, profiles, accounts, global leaderboards, or offline play are not implemented product claims.

This document was inferred from `game.js`, `songs.js`, `app.js`, and `index.html`.
