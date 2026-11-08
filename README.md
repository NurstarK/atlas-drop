# Tetropolis

Tetris, but the blocks are cities. Group cities into countries, group countries
into continents, and clear the board geographically.

**Play:** https://nurstark.github.io/tetropolis/

## How it works

Every falling tetromino belongs to **one country** — each of its cells is a city
tile (country colour, a real 3-letter city code). Stack them and three things can
happen:

1. **Classic clears** — fill a full row for the usual 100 / 300 / 500 / 800 points.
2. **City merge** — connect **4 or more** cities of the *same country* and they
   collapse into a single **country tile** (its flag on a gold-bordered cell).
   Worth `250 × group size`.
3. **Continent clear** — connect **3 or more** country tiles of the *same
   continent* and the whole group clears. Worth `1000 × tiles`.

After any clear or merge, gravity pulls tiles down and the rules re-check, so
chains **cascade** — and each cascade step doubles its score (×2, ×4, …). Every
score pops up on the board as a floating callout (`+1000`, `CONTINENT!`,
`TETRIS!`), a **×N CHAIN** banner flashes when a cascade runs two or more steps,
and the sidebar **Chain** counter lights up with how deep the combo went.

The sidebar **Next** preview shows the upcoming **3 pieces** stacked (next-up on
top), so you can line up merges a few moves ahead. Stuck with the wrong piece?
Press **C** to **hold** it in the sidebar and swap in the piece you had stashed —
one swap per piece, so plan it. The held piece keeps its country and comes back
in its spawn orientation.

For the full, exact rules of play — board, pieces, all three clearing mechanics
with precise scoring, cascade multipliers, gravity, leveling, and controls — see
**[RULES.md](RULES.md)**.

The world is 43 countries across 6 continents, coloured by continent hue:

- **Europe** (blues / indigos): Italy, France, Germany, Spain, Portugal, Greece, Belgium, Netherlands, United Kingdom
- **Asia** (reds / oranges): Japan, South Korea, China, India, Thailand, Vietnam, Russia
- **North & Central America** (greens): USA, Canada, Mexico, Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama
- **South America** (teals / cyans): Brazil, Argentina, Colombia, Peru, Chile, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Guyana, Suriname
- **Africa** (golds): Nigeria, Egypt, South Africa
- **Oceania** (purples): Australia, New Zealand, Fiji

**Every game deals a rotating roster of 20 countries** (4 from Europe, 4 from
Asia, 3 from each of the others), shown in the sidebar under *This game's
countries*, so each game has a different map while merges stay as reachable as
ever. The Daily Challenge deals the same roster to everyone. Study mode covers
the whole world. City tiles show only the city code (knowing that ROM is Italy is
the game); a country's flag appears once its cities merge. Each game gives the
countries in play clearly distinct shades of their continent's colour.

New pieces spawn weighted toward countries already on the board, so same-country
merges stay reachable.

Level goes up every 8 clears/merges, and gravity speeds up with it.

## Study the world

Open **Study** from the start screen (or from pause / game over) to learn the
geography behind the tiles. Browse every continent, country, and city — each
3-letter code expanded to its real city name (`ROM` → Rome) — or flip on
**Quiz** mode: a shuffled grid of bare codes you click to reveal the city,
country, and continent. The roster is generated from the game's own dataset, so
it always matches what you're playing. Study never touches your game — close it
with **Back** or **Esc** and a paused game resumes exactly where you left it.

## Daily Challenge

Hit **Daily** on the start screen for a deterministic run that's the **same for
everyone** on a given calendar day — the identical sequence of piece types and
countries falls for every player, so the day's scores are comparable. The seed is
just today's local date (`YYYY-MM-DD`): no network, no account, nothing leaves the
page, and a new day is a new puzzle. The piece stream is board-independent (so
your moves can't change what you're dealt) but still favours recent countries so
merges stay reachable; the city labels are cosmetic and stay random. Your best for
the day is kept separately from the endless leaderboard and shown on the start
screen. Endless play stays the default — switch between the two from the start or
game-over screen.

Keep coming back and you build a **🔥 streak** — the number of consecutive days
you've played a Daily, shown on the start screen and when a Daily ends (any run
counts; miss a day and it restarts). When a Daily ends, a **Share result** button
copies a spoiler-free card to your clipboard — the date, your score and level, a
little row of continent-hue squares for the continents you leaned on, and your
streak — ready to paste to a friend. It's clipboard-only (no network), and works
even from a `file://` page.

## Sprint

Hit **Sprint** for a race: reach **10,000 points** as fast as you can. A timer
runs on the board next to your score-vs-goal progress, counting only active play
(paused and backgrounded time don't count). Reach the goal and the run ends with
your finishing time; top out short of it and it's a did-not-finish with no time
recorded. Your **best time** is kept locally, separate from the endless
leaderboard and the Daily record — lower is better. Like the Daily, Sprint always
starts at level 1 so times stay comparable, and like every mode it's switchable
from the start or game-over screen (no mode is a dead end).

## Settings

A **⚙** gear button next to **Study** on the overlays opens a small **Settings**
panel. Toggle the **ghost piece** (the landing-position outline), the **merge
hint** (see below), and the **grid lines** on or off, and set a **starting level
(1–10)** for endless play so veterans can skip the slow open — it takes effect on
your next game, and the Daily Challenge always starts at level 1 so its scores
stay comparable. Every choice is remembered locally (no account, no network); the
toggles only change what's drawn and the starting level only changes where an
endless game begins — nothing about the rules or scoring. Close it with **Back**
or **Esc**.

The **merge hint** glows a piece's landing cells whenever hard-dropping it right
now would pay off: a soft glow in the **country's colour** if the drop completes a
four-plus city merge, or in the **continent's hue** if that merge would cascade
into a continent clear. It is a pure look-ahead — the game drops a copy of the
board and runs the same merge/continent checks the real resolve loop uses, so it
never nudges the board, the piece, or your score. Strong help, so it's on by
default; turn it off here for a cleaner challenge.

## High scores

End an **endless** run and, if it cracks the **top 10**, you're asked for a name —
your score joins a local leaderboard that greets you on the start screen (and shows
again on game over, your fresh entry highlighted). Scores, levels, and names live
only in your own browser via `localStorage`: no account, no network, nothing leaves
the page. Clear your browser storage and the board of champions starts fresh.
(Daily Challenge and Sprint runs keep their own separate records, so each mode's
results stay comparable.)

## Run stats

Every game-over screen opens with a **This run** panel summarising how the run
went: time played (paused and backgrounded stretches don't count), how many
merges, continent clears and rows you pulled off, your single **biggest merge**,
the **deepest cascade** you chained, and your **top continent** (the one you
placed the most cities from). It sits above the high-score table (and the Daily
result), so a finished run always feels earned and gives you a number to beat.
The tallies are just read-outs — they're counted as those events already happen
and never affect scoring or play.

## Music

An original upbeat chiptune loop and subtle merge / continent / row cues, all
synthesised live with the Web Audio API — no audio files, no network. The music
thickens and nudges faster as you level up (capped), pauses with the game, and
starts only after your first input (browser autoplay rules). Toggle it with the
**M** key or the speaker button in the sidebar; the choice is saved locally.

## Controls

| Key | Action |
| --- | --- |
| ← / → | Move |
| ↑ or X | Rotate |
| ↓ | Soft drop |
| Space | Hard drop |
| C | Hold / swap piece |
| P | Pause |
| R | Restart |
| M | Mute music |
| Esc | Close Study / Settings |

On a phone or tablet, an **on-screen control pad** appears below the board:
**◀ ▶** to move (press and hold to repeat), **⟳** rotate, **▼** soft drop (hold
to keep dropping), **⤓** hard drop, **⤵** hold, and **⏸** pause/resume. Each
button does exactly what its keyboard key does. You can also play by gesture on
the board — **drag** left/right to move, **tap** to rotate, **swipe down** to
drop (a long swipe or fast flick hard-drops). The board scales to fit the
screen, and desktop keyboard play is unchanged (the pad never shows for a mouse).

Phones that support it get a short **vibration** on each big moment — hard drop,
city merge, continent clear, row clear — with a 📳 on/off toggle beside the mute
button (remembered locally, on by default; silently absent where the browser has
no vibration, e.g. iOS Safari). If the tab or app is backgrounded mid-game (a
call, a lock, an app switch) the game **auto-pauses** so nothing is lost.

## Layout & accessibility

- The board scales to the window height (classic three-column layout: score, hold and controls on the left; next queue and continent legend on the right). Canvas buffers are resized to the on-screen size × `devicePixelRatio`, so tiles and city codes stay sharp at any size.
- On a phone the whole game fits **one screen with no scrolling**: a slim score bar on top, **Hold** and **Next** flanking the board, and the control pad below it. The board is sized off both the viewport width and height so it keeps its 10×18 shape and always fits; safe-area insets keep the pad clear of the iOS home indicator and URL bar. The tagline, keyboard list, legend and chain read-out move off the play screen (reachable via the start / pause overlay).
- Text colours meet WCAG AA contrast against the panels; labels and controls use larger type.
- The ghost piece is drawn as a dashed outline in the falling piece's own colour, so the landing spot is easy to see.
- CSS animations respect the OS "reduce motion" setting.

## Running locally

No build step, no dependencies, no network. Just open `index.html` in a browser
(or serve the folder with any static server).

## Tech

Vanilla HTML, CSS, and JavaScript rendered to a single `<canvas>`. No frameworks,
no external fonts, no runtime network requests.

---

Built autonomously by [Aeon](https://aeon.fun).
