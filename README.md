# Earshot

**Name the song from just 0.1 seconds of sound.**

Earshot is a browser music-guessing game. Listen to a tiny clip, guess the title, or unlock a longer excerpt. Earlier answers earn more points. Choose a genre, work through an easy-to-hard challenge, or test yourself on a favorite artist.

[Play Earshot](https://earshot-zeta.vercel.app)

## How to play

1. Pick a track, The Mixer, a Genre Climb, or enter an artist.
2. Listen to the opening clip. Use the play button to hear it again.
3. Type at least two letters of a song title or artist to see suggestions. Choose a match, then press **Guess**. You can also enter a title directly.
4. A wrong guess or **Skip** unlocks a longer clip and uses one of your seven chances.
5. After a correct answer or the final attempt, see the song, artist, artwork, and preview, with a link to Apple Music.
6. Finish the run to see your results and personal best for that track.

The suggestion picker supports mouse and touch. On a keyboard, use **Up/Down** to navigate, **Enter** to select, and **Escape** to dismiss. Selecting a suggestion fills the field; it does not submit your guess.

### Clip lengths and scoring

| Attempt | Clip length | Points for a correct answer |
| --- | --- | --- |
| 1 | 0.1 seconds | 7 |
| 2 | 0.5 seconds | 6 |
| 3 | 1 second | 5 |
| 4 | 2 seconds | 4 |
| 5 | 4 seconds | 3 |
| 6 | 8 seconds | 2 |
| 7 | 15 seconds | 1 |

Running out of chances earns zero points for that song. Replaying the current clip does not use an attempt.

## Game modes

| Mode | Rounds | What changes | Maximum score |
| --- | --- | --- | --- |
| Genre track | 8 | Random artists from one curated genre at its assigned difficulty | 56 |
| The Mixer | 12 | Four easy, four medium, then four hard rounds across genres | 84 |
| Genre Climb | 12 | One genre, with four rounds at each difficulty and progressively deeper catalogue selections | 84 |
| Any artist | 8 | Songs from the artist you enter | 56 |

The seven genre tracks are:

- **Easy:** Pop Hits; Bollywood Blockbusters.
- **Medium:** Rock Classics; Hip-Hop; 2000s Throwbacks.
- **Hard:** Indie & Alt Deep Cuts; Electronic.

Each genre also has its own Climb. Tracks curate artists rather than a fixed playlist, so repeat runs can contain different songs. An artist challenge requires at least eight playable songs in the available results.

## Run locally

The app is plain HTML, CSS, and JavaScript modules. There is no framework, application server, package-install step, or frontend build step.

Clone the repository and serve its root over HTTP:

```sh
git clone https://github.com/Oxyrine/Styles.git
cd Styles
```

On Windows with Python installed:

```sh
py -m http.server 4400 --bind 127.0.0.1
```

On macOS or Linux:

```sh
python3 -m http.server 4400 --bind 127.0.0.1
```

Open [localhost:4400](http://localhost:4400). Another static HTTP server works too. Opening `index.html` directly with `file://` will not reliably load the modules and catalogue files.

Use a modern browser with JavaScript and Web Audio support. Internet access is still needed for preview audio and live searches. Node.js 20 or newer is suitable for the maintenance and checking scripts below; it is not needed to serve the game with Python.

## Where the music comes from

Earshot uses song metadata and preview URLs from the iTunes Search API, configured for the **India storefront (`IN`)**. No API key is required by the current implementation.

- **Curated rounds:** load an artist's metadata from `catalog/<normalized-artist>.json`. The checked-in snapshot records 186 artists and 9,596 songs in [`catalog/_meta.json`](catalog/_meta.json).
- **Song suggestions:** search the bundled [`catalog/_suggestions.json`](catalog/_suggestions.json) title/artist index first, then supplement it with live iTunes matches. Local matches remain usable if live search fails.
- **Custom artists:** use the stored catalogue when available, otherwise search iTunes live. The app remembers fetched songs for suggestions during the current session.
- **Audio:** streams from Apple's preview URLs and is decoded with Web Audio. The repository stores metadata and links, not audio files.
- **Stale links:** if stored preview links fail, the round tries a live artist lookup before reporting a loading error.

The game removes duplicate titles and filters common karaoke, tribute, live, remix, and other variants. Difficulty uses rank windows within the returned catalogue; it is not a hand-rated difficulty score for every song. Small catalogues fall back to a broader pool when a difficulty window has too few tracks.

Clips start at the first detected non-silent part of the preview, rather than a manually chosen chorus or hook. Availability depends on the storefront, search results, and preview service; the game cannot guarantee every release by an artist.

## Maintain the catalogue

Run these commands from the repository root.

### Refresh artist metadata from iTunes

```sh
node build-catalog.mjs
```

This fetches the artists defined in [`songs.js`](songs.js), cleans their song lists, writes the artist JSON files and snapshot metadata, and rebuilds the suggestion index. It deliberately spaces out requests and backs off after failed requests, so allow several minutes. Check its output for failed artists before committing the refreshed files.

### Rebuild suggestions without network access

```sh
node build-suggestions.mjs
```

Use this after editing existing artist JSON files. It generates the deduplicated title/artist index from `catalog/` without downloading audio or querying iTunes.

### Check game logic and stored data

```sh
node check.mjs
```

The assertions cover title matching, clip lengths, scoring, song filtering, round generation, Mixer and Climb behavior, suggestion matching, and catalogue consistency. A failed assertion exits with an error. This is a local logic/data check, not a browser or live-audio test.

### Audit live artist availability

```sh
node verify-songs.mjs
```

This queries iTunes for the curated artist entries and reports those with fewer than 15 playable songs. It waits between requests and can take several minutes. It checks live results without refreshing the stored catalogue.

## Project structure

| File or directory | Purpose |
| --- | --- |
| [`index.html`](index.html) | Track picker, game, suggestion panel, and results markup |
| [`style.css`](style.css) | Responsive visual system, control states, animations, and reduced-motion styles |
| [`app.js`](app.js) | Views, catalogue/search requests, audio playback, suggestions, and local scores |
| [`game.js`](game.js) | Pure matching, filtering, scoring, and round-generation logic |
| [`songs.js`](songs.js) | Curated artists, genres, and assigned difficulties |
| [`suggestion-search.js`](suggestion-search.js) | Title/artist matching, ranking, and deduplication |
| [`catalog/`](catalog/) | Artist metadata, snapshot information, and generated suggestion index |
| [`build-catalog.mjs`](build-catalog.mjs) | Live catalogue refresh script |
| [`build-suggestions.mjs`](build-suggestions.mjs) | Local suggestion-index generator |
| [`check.mjs`](check.mjs) | Logic and catalogue assertions |
| [`verify-songs.mjs`](verify-songs.mjs) | Live artist availability audit |
| [`fonts/`](fonts/) | Self-hosted Space Grotesk and its bundled font license |
| [`DESIGN.md`](DESIGN.md) | Visual tokens, component behavior, and design guidance |
| [`PRODUCT.md`](PRODUCT.md) | Product behavior and implementation boundaries |
| [`vercel.json`](vercel.json) | Hosting security headers and allowed resource origins |
| [`404.html`](404.html) | Missing-page fallback |

## Storage and accessibility

Best scores are saved in this browser's `localStorage`, per track or normalized artist name. They are not synchronized between devices. Private browsing or blocked storage may prevent persistence; the game handles storage failures without requiring an account.

The interface includes keyboard-accessible controls, a skip-to-content link, visible focus states, live status messages, a combobox/listbox suggestion picker, responsive layouts, and reduced-motion styles. These features are implemented in the app; they do not constitute a claim of complete accessibility certification.

## Hosting

Deploy the repository root to a static host. Publish the HTML, CSS, JavaScript modules, `catalog/`, and `fonts/` together; no frontend build command is needed for an unchanged checkout.

The included Vercel configuration supplies a Content Security Policy and other security headers. If you add another API, media host, or remote asset source, update the permitted origins accordingly. Other hosting providers need equivalent header configuration if you want the same policy.

## Troubleshooting

- **No sound:** check device volume, browser audio permissions, and the connection to Apple's preview service. Use **Retry** when a round reports a loading error.
- **No suggestion matches:** try another title or artist, or enter the title directly. Live search may be unavailable even when local suggestions work.
- **Artist challenge cannot start:** check the artist spelling and whether the storefront returns at least eight playable songs.
- **Edited catalogue is missing from suggestions:** run `node build-suggestions.mjs`, publish the generated index, and reload the page.
- **Scores disappeared:** scores belong to the current browser and origin. Clearing site data, switching browsers, or moving between localhost and the hosted site changes which scores are available.

Music metadata, artwork, and preview audio are provided through Apple's services. Space Grotesk is distributed with its [SIL Open Font License](fonts/OFL.txt).
