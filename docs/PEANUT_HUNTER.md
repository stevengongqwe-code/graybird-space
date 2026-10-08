# Peanut Hunter armory and balance

The game is isolated in `/play/`. Original homepage, bird artwork, room, diary, mail, passport, wall configuration and hosting remain intact.

## Content

- 15 regular enemy types, including six new types: patrol drone, signal sniper, cache ghost, advertising mine, traffic leech and shield beetle.
- 11 Boss types: seven existing types plus cache ghost, clock crab, recycling king and data devourer. Each has a distinct attack routine.
- 26 transparent cartoon WebP textures under `assets/game/`, matching the owner’s uploaded clean ink/cel-shaded reference. `monster-atlas.webp` is the retained 4×7 source; rebuild slices with `python scripts/prepare_game_art.py` (Pillow). The atlas is not fetched by the game. Old SVGs and all official Graybird art remain preserved.
- Six weapons: caterpillar cannon, seed shotgun, firefly seeker, needle piercing cannon, pinecone explosive and ice crystal shot. Weapons have three permanent levels; chip evolutions still stack during a run.
- Five passive equipment lines: starting shield, movement, pickup radius, damage and peanut income. The shield has two levels; the others have three.
- Nine drop rewards: magnet, shield egg, rage, time dilation, double peanuts, rapid reload, repair, clearing pulse and fortune. Chips are separate.

## Currency and persistence

The existing `graybird.explorer.v2` record retains its original fields. Optional `armory` is sanitized during loading; old records start with the free caterpillar cannon. Spend settled bank peanuts, never unbanked run score. Death/revival settlement credits only the difference since the previous settlement. Upgrades and selected weapon apply on the next new run; buying while alive does not change the current loadout. Opening the shop pauses gameplay. No real money, account, backend or cross-device synchronization.

Prices and effects are in the exported `WEAPONS` and `EQUIPMENT` catalog in `play/game-core.mjs`. Shop UI is generated from those catalogs. Insufficient funds, maximum levels and invalid IDs cannot purchase. Small income bonuses retain fractional carry so a 5% benefit is not lost when collecting individual peanuts.

## Pacing

First Boss at 120 active gameplay seconds, preceded by a three-second warning. A Fisher–Yates shuffled bag chooses Bosses without repeating within that bag. Each new run uses a fresh random bag. Further encounters are scheduled 120 seconds apart, with no overlapping Boss groups and at least 30 seconds after a late victory before another encounter. Pauses and evolution menus stop the gameplay timer.

Enemy speeds and health increase gradually. Types unlock at 20/40/65/85/95 seconds. Normal spawn rate is lower while a Boss is active (1.45× interval) and for five seconds after victory. Boss death clears hostile projectiles and grants a magnet for the peanut payout; environment events wait at least 12 seconds. Shields cap at four. Combo income caps at 2×, excluding temporary double/fortune and permanent bonuses. Pools remain bounded: 64 enemies, 256 player shots, 1,024 hostile shots. No new framework or background animation loop.

## Owner feedback pass: slower progression, stronger opening

- Homepage has a dedicated entrance directly below navigation, above the original appeal notice. The full existing notice, hero and all sections remain intact. One tap opens the game anchor; all game entry URLs and game assets carry a new cache version.
- First scheduled evolution chip: 65s, then every 90s. Ordinary kill chips require 36 kills, cannot appear before 50s and share a 60s drop cooldown with elite/supply chips. Only one uncollected chip can be active; completed builds no longer spawn chips. Boss victory still awards a chip; no changes to existing earned peanuts/equipment.
- Fire-rate progression: 2.5 / 3.3 / 4.3 / 5.5 shots/sec. Two evolutions per rate tier; six evolutions to reach the highest tier (formerly three).
- Opening normal enemies require two base-cannon hits, move 10% faster and spawn at 1.12s rather than 1.3s. Continuous health/speed growth and gradual type unlocks remain. Boss base health increases from 72 to 92; telegraphs, 120s random encounters, no overlapping Boss groups and post-victory relief are retained.
- Combo bonus grows by 20% each 18 kills and caps at 2×; random temporary supply chance starts at 4.5% instead of 7%. Shop prices and existing permanent equipment are retained.
- The previous v5 pass’s twenty deterministic stationary-player simulations averaged 49s survival versus 55s before the change; this is a comparative fixture, not a real-player or Android benchmark. Early evolutions were reduced from 0–4 to 0–1 in that fixture. Further human feedback remains useful for balance.

## Verification

- `node scripts/test_game.mjs`: weapon patterns, splash, shop transaction validation, equipment, 15 enemies, 11 Boss AIs, random 120-second encounter, no overlapping Boss groups, all rewards, settlement-related state, pause/revive and 300-second simulation in both arena sizes.
- `python scripts/qa_play.py --base-url http://127.0.0.1:8040 --browser /usr/bin/chromium`: actual browser checks at 375/390/768/1280/1920, room/mail/passport regression coverage, purchases, selected weapon persistence, local balance, restart, pause, Boss bar, cards, no JS, denied storage, overflow and resource errors. Controller inspection is injected only into an intercepted QA response; production exposes no debug API.
- Additional touch/layout checks at 360 and 430. Simulated 430px Chromium with 4× CPU slowdown and a Boss plus seven regular enemies measured median 16.7ms / p95 16.7ms frame intervals over 2.5 seconds with the final cartoon sprites. Local network; not an Android hardware benchmark.

Long-term balance still benefits from real player feedback. Original Giscus remains pending its owner authorization; this upgrade does not change it.


## Flight controller and battle usability (v6)

- Foreground frames simulate at most 50ms each, discarding overdue wall time after a hitch; no 300ms automatic pause threshold. Actual `visibilitychange` to hidden or `pagehide`, manual pause and deliberate shop opening still pause. Returning from background requires explicit continuation. Combat time does not fast-forward through lag.
- Battle HUD, pause and touch controls share a self-contained shell. A user gesture requests native Fullscreen API when available; CSS viewport focus mode is the fallback. Escape/exit returns to the original scroll position without resetting the run. Canvas keeps its original aspect ratio, with pointer coordinates corrected for letterboxing. Rules/shop remains accessible from the toolbar.
- Full rules are retained inside a collapsed reference. First kill, first five-kill combo (+3 peanuts), first fake peanut, first graze (+2) and first chip each get a short, non-blocking prompt once per run. At 18s a short survival reminder provides early feedback without awarding a power upgrade.
- `weaponStats()` is shared by firing damage and armory numbers. Cards show per-projectile damage, base fire rate, projectile count, current/next levels and piercing/explosion/slow/track effects. Equipment shows current/next percentages or counts. One optional ballistic preview runs at a time, only while visible; it stops in background, offscreen, on shop close and under reduced motion. Preview art is schematic, not replacement Graybird imagery.
- All 11 Bosses retain their original attack and gain two signature skills (22 total): locked danger lanes, delayed target zones, expanding rings with a safe angular opening, descending walls with a marked safe gap, and telegraphed reinforcements. Health thresholds 65%/30% advance through three stages and shorten secondary-skill cooldowns. Warnings last 1.35s, are harmless, and hazards clear on victory. At most two simultaneous hazards and a fixed pool of 12; splitting Bosses share one skill clock. First Boss timing remains 120s random, with no overlap.
- `python scripts/qa_game_flight.py`: real Chromium controller tests with 850ms/4s/600ms synthetic frame gaps, simulated visibility events, native fullscreen (1280px), forced API-unavailable fallback, inside-battle HUD, touch mapping, actual animated previews and reduced motion. Checked 360/375/390/430/768/1280/1920px. Simulated events are not physical Android device tests.

- Final full-screen stress fixture at 430px with 4× Chromium CPU slowdown, phase-3 Boss, seven ordinary enemies and two telegraphed skills: 150 sampled frames over 2.5s, median 16.7ms / p95 16.8ms; the run remained active. This is local simulated-device evidence, not a physical Android benchmark.
