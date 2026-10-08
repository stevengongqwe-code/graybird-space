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
- First scheduled evolution chip: 55s, then every 65s (formerly 30s / 45s). Ordinary kill chips require 24 kills (formerly 12), cannot appear before 35s and share a 24s drop cooldown with elite/supply chips. Boss victory still awards a chip; no changes to existing earned peanuts/equipment.
- Fire-rate progression: 2.5 / 3.3 / 4.3 / 5.5 shots/sec. Two evolutions per rate tier; six evolutions to reach the highest tier (formerly three).
- Opening normal enemies require two base-cannon hits, move 10% faster and spawn at 1.12s rather than 1.3s. Continuous health/speed growth and gradual type unlocks remain. Boss base health increases from 72 to 92; telegraphs, 120s random encounters, no overlapping Boss groups and post-victory relief are retained.
- Combo bonus grows by 20% each 18 kills and caps at 2×; random temporary supply chance starts at 4.5% instead of 7%. Shop prices and existing permanent equipment are retained.
- Twenty deterministic stationary-player simulations averaged 49s survival versus 55s before the change; this is a comparative fixture, not a real-player or Android benchmark. Early evolutions were reduced from 0–4 to 0–1 in that fixture. Further human feedback remains useful for balance.

## Verification

- `node scripts/test_game.mjs`: weapon patterns, splash, shop transaction validation, equipment, 15 enemies, 11 Boss AIs, random 120-second encounter, no overlapping Boss groups, all rewards, settlement-related state, pause/revive and 300-second simulation in both arena sizes.
- `python scripts/qa_play.py --base-url http://127.0.0.1:8040 --browser /usr/bin/chromium`: actual browser checks at 375/390/768/1280/1920, room/mail/passport regression coverage, purchases, selected weapon persistence, local balance, restart, pause, Boss bar, cards, no JS, denied storage, overflow and resource errors. Controller inspection is injected only into an intercepted QA response; production exposes no debug API.
- Additional touch/layout checks at 360 and 430. Simulated 430px Chromium with 4× CPU slowdown and a Boss plus seven regular enemies measured median 16.7ms / p95 16.7ms frame intervals over 2.5 seconds with the final cartoon sprites. Local network; not an Android hardware benchmark.

Long-term balance still benefits from real player feedback. Original Giscus remains pending its owner authorization; this upgrade does not change it.
