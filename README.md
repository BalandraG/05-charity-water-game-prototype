# Helo-Swamps

A browser helicopter game inspired by [charity: water](https://www.charitywater.org/). Pilot a helicopter over a large scrolling swamp, clean contaminated ponds, deliver water to village communities for cash, pay to refuel, collect health crates, and dodge enemy helicopters. Fully clean all **20** ponds to finish the mission, or keep flying until health or fuel runs out. Choose **Easy** or **Hard** on the start screen.

This prototype is built with HTML, CSS, and beginner-friendly vanilla JavaScript only. It does not use Canvas, a game engine, or extra JavaScript libraries.

## Game objective

Fly around the swamp and score as many points as you can:

1. Hover over an orange **contaminated** pond and collect a load of clean water.
2. Fly to a blue **village** pond. There are two of them in the swamp.
3. Deliver the water to the community. Each unit pays **$10** and still scores **25 points**.
4. Refuel at a **fuel** island when the tank gets low. Each fill costs **$10** for up to **10** fuel. There are two stations.
5. Collect **health crates**. Fully cleaning a pond drops a small **+10** crate. Every **700** score points still drops a large **+50** crate.
6. Avoid rocks, logs, trees, and **enemy helicopters**. A damaging hit costs **20** health, **$50**, and **10** score.
7. Fully clean all **20** ponds to win **MISSION COMPLETE**, or keep flying until health or fuel runs out.

The swamp is larger than the screen (about **20×** the original playable area). The camera follows the helicopter. Each new game places **20** contaminated ponds (7 small, 7 medium, 6 large), **2** village ponds, and **2** fuel stations in a new layout. A compact map in the corner shows your location; expand it for a larger view.

**Easy** (default) uses **72** obstacles and **4** enemy helicopters (one per quadrant). Fuel drains at **0.5** per second while moving.

**Hard** uses **144** obstacles and **8** enemy helicopters (two per quadrant). Enemies fly **1.5×** Easy speed, and fuel drains at **1** per second while moving.

Play Again keeps the same difficulty. Main Menu lets you pick again.

A run ends on **MISSION COMPLETE** (all 20 ponds fully cleaned), **OUT OF HEALTH**, or **OUT OF FUEL**. You do not need to deliver leftover water to win. Each ending shows final score, zones cleaned (`X / 20`), money earned, money remaining, elapsed flight time, and difficulty. You can save one pilot name to this browser's Hall of Fame.

## Keyboard controls

| Key | Action |
| --- | --- |
| `W` `A` `S` `D` or arrow keys | Move the helicopter |
| `Space` | Clean water, deliver water, or refuel |
| `P` | Pause or resume |

Diagonal movement is supported when two direction keys are held together.

## Touch controls

On phones, tablets, foldables, and other touchscreens, an on-screen overlay appears over the swamp. It stays available when a foldable unfolds or the window is wider than 768px. Mouse-only desktops hide the overlay. Keyboard controls still work while the overlay is visible.

The game looks for a coarse pointer (`any-pointer: coarse`) rather than a device name or a narrow width.

- **D-pad** (bottom left) — move
- **Action** (bottom right) — same as Space. The label reads **CLEAN**, **DELIVER**, or **FUEL $10** based on where you are hovering
- **Pause** — same action as the HUD Pause button

## Cleaning, delivering, and refueling

- Fly so the helicopter is over a **contaminated** pond, then press Space (or Clean). Each successful clean adds **10 points**, fills one slot in the water tank, and removes **1** contamination unit from that pond.
- Pond sizes hold **5**, **10**, or **15** contamination units. Partial progress stays on the pond after you leave to deliver water. A fully cleaned pond cannot be cleaned again. Game Over counts **zones cleaned** only when a pond reaches 0 contamination, shown as `X / 20`. Cleaning units without finishing a pond does not raise that count.
- The tank holds **5** loads. If it is full, fly to a delivery pond first.
- Fly over a **clean water** village pond (or the village houses beside it), then press Space (or Deliver). Each carried unit is worth **25 points** plus **$10**, and the tank is emptied. Cleaning ponds does not pay money.
- Fly over a **fuel** island, then press Space (or Fuel $10). Each successful refuel costs **$10** and restores up to **10** fuel, to a maximum of **100**. If you have less than $10, the pump shows **NEED $10**. If the tank is already full, it shows **FUEL FULL** and does not charge you. Stations never run out of fuel.
- Fuel starts at **100** and decreases only while the helicopter is moving. Easy drains **0.5** per second. Hard drains **1** per second. Reaching **0** fuel ends the game.
- **Money** starts at **$0** and is separate from score. Each delivered unit adds **$10** to both the current wallet and **total money earned**. Fuel purchases and collision fines reduce only the current wallet. Money cannot go below $0. Play Again and a new game reset both money values.

## Scoring, health, enemies, pause, and restart

- **Score** starts at 0. Cleaning adds 10 points. Delivering adds 25 points per unit. A damaging collision subtracts **10** points. Score cannot go below 0.
- Crossing each multiple of **700** score (700, 1400, 2100, …) earns a **large health crate** somewhere in the swamp. Only one large crate is out at a time; extra large crates wait in a queue. Fly into it to restore **50** health (capped at 100). If a crash drops you below a milestone you already earned, reaching that score again does **not** award another crate. The next crate waits for the next unused threshold (1400, 2100, …).
- Fully cleaning a contaminated pond (its remaining contamination hitting 0) also drops a **small +10 health crate** at a random safe spot. Partial cleaning does not spawn one. Up to **20** small crates can be earned in a game, one per pond. Several small crates can sit on the map at once. They do not wait behind the large-crate queue.
- Both crate types are collected by flying into them. They restore health only, never score or money. Health still cannot go above **100**.
- **Health** starts at 100%. Hitting a rock, log, tree, or enemy helicopter costs **20** health, **$50**, and **10** score, with a short cooldown so one scrape does not drain everything at once. A hit that does not deal health (still in cooldown) does not take money or score. If you have less than $50 or 10 points, those values drop to 0. The penalties still apply on a fatal hit.
- Enemy helicopters patrol the four quadrants of the swamp. Easy has one per quadrant. Hard has two per quadrant and they move **1.5×** as fast as Easy enemies.
- Decorative scenery (trees, bushes, grass, the house, and the dock) does not cause damage.
- Fully cleaning the 20th pond ends the flight immediately with **MISSION COMPLETE**. Health or fuel reaching 0 still ends the flight with Game Over. After any ending, movement, fuel drain, enemies, and helicopter audio stop.
- The HUD **Time** clock starts at `00:00`, counts only active flight time, ignores pause and tab-away time, and freezes on every ending. Times longer than one hour stay in `MM:SS` (for example `75:03`).
- **Pause** freezes movement, enemy patrols, the timer, and damage/clean timers. Press Pause or `P` again to resume. Switching away from the browser also pauses.
- **Play Again** starts a new flight on the same difficulty and resets the timer.
- **Main Menu** returns to the start screen so you can choose Easy or Hard.

## Hall of Fame

Leaderboards are stored in this browser with `localStorage`. They are not online or global.

After a run, enter a **1–20 character** pilot name and press **Save Score**. One save writes that run to every board it qualifies for. You can skip saving. Duplicate saves of the same run are blocked.

Easy and Hard never mix. Each difficulty has three top-10 lists:

- **Richest Pilots** — highest money remaining (current wallet, not total earned). Every finished run can qualify.
- **Top Scorers** — highest final score, after collision penalties. Every finished run can qualify.
- **Fastest Cleanups** — shortest active flight time to **MISSION COMPLETE**. Unfinished runs never appear.

Open **Hall of Fame** from the start screen or any ending screen. Use **Back** to return. If storage is blocked or corrupted, the game still plays and empty lists say so.

## How to run locally

Open the project with the **Live Server** / Live Preview extension (the same setup used in GitHub Codespaces):

1. Open this folder in Visual Studio Code, Cursor, or a GitHub Codespace.
2. Open `index.html`.
3. Start Live Server / Live Preview so the page is served over `http`, not opened as a `file://` URL.

The game files are `index.html`, `styles.css`, `script.js`, `audio.js`, and the images in `img/`.

## Sound

Helo-Swamps plays short arcade sound effects. There is no music.

The project did not include licensed helicopter recordings, so every effect is **synthesized in the browser** with the Web Audio API. These are not recorded rotor, splash, or crash samples.

| Control | What it does |
| --- | --- |
| **Sound On / Muted** | Mutes or unmutes all audio immediately |
| **Sound effects** | Volume for cleaning, delivery, fuel, health, collisions, and Game Over |
| **Helicopters** | Volume for the player loop and the nearby-enemy loop |

Settings are saved in `localStorage` when the browser allows it.

Browsers block sound until a real click or tap. Press **Start Game** (or use a sound control) to unlock audio. Switching away from the tab pauses the game and silences the helicopters; they return only after you resume play.

One quiet player rotor loop runs during flight. A second, slightly lower enemy loop gets louder when enemies are close and quieter when they are far. Hard Mode still uses that single enemy layer so eight helicopters do not stack eight full-volume engines.

There is no `sounds/` folder and no third-party audio URLs. `audio.js` generates all eight categories locally: player rotor, enemy rotor, collision, cleaning, delivery, fuel, health pickup, and Game Over. Safari and older WebKit builds use `webkitAudioContext` when `AudioContext` is missing. If the browser blocks or suspends audio, the game keeps playing silently.

## Educational purpose

Helo-Swamps is a class prototype meant to introduce charity: water’s mission in a simple game. Real communities around the world still lack safe drinking water.

- Website: [charitywater.org](https://www.charitywater.org/)
- Donate: [charitywater.org/donate](https://www.charitywater.org/donate)

The Start and Game Over screens link to those pages. Donations are handled on charity: water’s website, not inside the game.

Typography uses the system stack `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`. The official charity: water wordmark is the included logo image. No licensed brand typeface (such as Whitney) is bundled with this project.
