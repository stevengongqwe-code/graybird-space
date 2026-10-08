# Peanut Patrol v7 — counter and first-run pacing

## Baseline audit and scope

The v6 game is a native Canvas simulator and an isolated controller in `/play/`, not a framework application. Its real loop is movement + automatic caterpillar fire → kills, grazing and peanuts → pooled chip pickups and three evolution routes → random Boss encounters → browser-local settlement, revival and permanent armory. Existing content includes 15 ordinary enemy types, 11 Bosses with 22 telegraphed signature abilities and three phases, six weapons, five equipment lines, nine temporary rewards, fullscreen and foreground hitch recovery. There was no active counter, hybrid evolution or run supply purchase.

The five primary gaps were reliable first evolution around 70s; graze without an active payoff; mostly numeric route upgrades and unstable tracking; weak ordinary combat / deceptive peanut feedback; and count-only spawning plus limited revival protection. This change retains the stack, official art, monster textures, pools, original weapons/equipment/levels, all Boss identities and original attacks, room exploration and existing wallet key. Homepage, Nest, Archive, shared site CSS and assets are unchanged. `CNAME` remains exactly `graybird.space`.

## Implemented changes

- One accessible first chip at 28s, then ordinary-chip cooldown 65s and scheduled interval 90s. Only one chip can exist; max route level remains three. Two evolutions still raise one fire-rate tier, preventing early runaway acceleration. Elite signal at 50s, environment at 65s, six-second warning before a random first Boss at 90s. Subsequent Boss spacing is 120s with no simultaneous groups or environment overlap.
- Active caterpillar counter: stable major-threat aiming, eight bounded hits, path-only ordinary bullet clearing, no invulnerability. Space (remappable to E) and a separate touch button. P pauses. Touch movement places the bird 45 world pixels above the finger. Short foreground hitches still discard excess time, never request a manual resume; hidden pages pause.
- Capped consecutive pierce bonus, close-range scatter reward and stable threat-weighted tracking. Three explicit hybrids: a bounded retarget, one extra pierce for the storm, and neighboring targets for existing side shots. No recursively spawned projectiles. Cards show actual equipped-weapon numbers; unlocked hybrids appear in the HUD.
- Boss arrival has 1.2s contact grace and a dashed ring. First base health 72; subsequent health follows the existing scaling. Original three phases, visible telegraphs and safe gaps remain. Counter interrupts have an eight-second group cooldown. Victory gives one shield, original peanut/chip rewards and a safe supply choice.
- Repair / random 15-second boost / save at Boss victory. Spending is restricted to uncredited run earnings. `spent` and `credited` ledger fields prevent double banking across deaths and revivals. Four paid revivals per run maximum; existing permanent upgrade prices are unchanged.
- Continuous fake-peanut cross marker; visibly labelled energy pickup; hit rings, bounded particles, graze / ready / damage rings and damage-source arrow. Synthesized sound cues are opt-in, gesture unlocked, six-voice capped and suspended in background. Volume, shake, hit-flash and key preferences persist. Reduced motion suppresses shake, flash and the ready pulse.
- Context hints are recorded with the existing visitor save; players can reset hints. Results show route, graze, Boss, counter and spending metrics, contextual bird commentary and direct restart. Enter restarts after death.

## Tuning table

| Parameter | Value |
|---|---|
| First chip / observed stationary proxy pickup | 28s / 28.37s |
| Ordinary chip cooldown / scheduled interval | 65s / 90s |
| First elite / environment | 50s / 65s |
| First Boss warning / appearance / later spacing | 84s / 90s / 120s |
| First Boss base HP / arrival contact grace | 72 / 1.2s |
| Counter energy max / graze / elite / special peanut | 100 / 12 / 20 / 15 |
| High-threat normal kill energy | 5 (dash, sniper, mine) |
| Counter damage / Boss damage / energy cost | 12 / 18 / 100 |
| Counter hits / clear radius / interrupt | 8 / 28 plus bullet radius / 0.55s |
| Boss interrupt cooldown | 8s per group |
| Pierce successive bonus / ceiling / Boss coefficient | 8% / 30% / 0.35 |
| Scatter close range / damage bonus | 170 world pixels / 20% |
| Boomerang / storm / hunter | pierce2+track1 / spread2+pierce1 / track2+spread1 |
| Threat limit | 7+t/12, max26; Boss ×0.55, event ×0.8, shieldless ×0.85; minimum5 |
| Threat weights | ad1, headline1.5, army1, elite6, splitter2, small0.5, dash3, tank4, healer3, drone2, sniper4, ghost2, mine3, leech2.5, beetle3 |
| Hostile projectile cap | 180; spawning eases above 90 normal / 140 Boss bullets |
| Repair / random boost | 18 / 24 uncredited run peanuts |
| Revival costs / limit | 50,150,400,1000 / four per run |

New tuning is in `play/game-config.mjs`; the established permanent catalog and shared weapon statistics remain in `game-core.mjs`.

## Verification evidence

Automated:

- `node scripts/test_game.mjs`: all existing catalog, pooled 300-second simulations at both arena sizes, Boss roster/skills/phases/gaps, shared armory values, pause/revive and chip cooldown checks pass. Test encounter timing can be overridden explicitly; the new suite separately checks current defaults.
- `node scripts/test_patrol_upgrade.mjs`: swept distance, graze deduplication, energy cap and release guards, path clearing, Boss damage/interrupt cooldown, three unique hybrid unlocks, threat limit and contact-spawn rejection, exact spend/settle/revive ledger, first evolution, old loadout/preferences, stable tracking and Boss arrival protection pass.
- `python scripts/check_links.py --base-url http://127.0.0.1:8042`: 22 HTML pages, 54 unique resources/links and 73 internal fragments pass.
- Native modules pass `node --check`; there is no bundler or install/build dependency.

Actual Chromium UI automation:

- `scripts/qa_patrol_upgrade.py`: 360,375,390,412,430,768,1280,1920px and 844×390 landscape; device scale factor2. Actual movement/autofire, simultaneous touch movement+counter, keyboard/remapping, first chip through the normal schedule, Boss display, supply purchase, exact death banking, clean restart, background/hitch recovery, old-save preservation, preference persistence, reduced motion, no overflow, page errors or resource 404s. Survival and Boss/death fixtures are explicitly labelled; this is not human play.
- `scripts/qa_game_flight.py`: 390 and1280px retained hitch recovery, real native desktop fullscreen and CSS fallback, hidden-page pause, HUD, armory animation and reduced-motion checks pass.
- `scripts/qa_play.py`: original room, nine stamps, two environmental audio modes, daily mail, personal card/score PNG export, permanent purchases, old local storage and denied-storage fallback pass at375,390,768,1280,1920px.
- Captured gameplay screenshots were visually inspected. CPU×4 Chromium mobile emulation with a Boss and100 enemy bullets measured173 sampled frames, median16.7ms, p95 16.7ms, no automatic pause or page error. This short desktop-hosted stress sample does not establish physical Android performance or long-run memory usage.

Simulation:

`node scripts/simulate_patrol.mjs` uses seed37, four strategy proxies, three builds and ability on/off (24 runs, up to180 active seconds). It records first growth/damage/death, income, kills, grazes, counters, Boss timing, active counts and threat. It uses no invulnerability. Output: `/tmp/patrol-simulation.json`. Passive/dodge/collector cases reaching growth collect around28.1–28.4s. The intentionally aggressive graze proxy can die before growth. Some runs reach a90s Boss; these simplistic agents do not establish Boss clear-time balance. Full route results and on/off comparisons are available in the generated JSON; do not infer a human win rate from them.

## Known limits / next evaluation

- Physical Android, subjective touch feel, audio listening and human A/B fun/clear-time testing remain unverified. Counter input and damage are tested, but improved retention or average survival is not claimed.
- Strategy proxies choose simplistic paths. High-risk agents can die at24.47s after eight grazes (96 energy); an early evolution is not promised to reckless players. Do not silently grant a level or reduce energy cost solely to force this bot to survive.
- No real multiplayer/comment store or new runtime dependency. Browser-local save still depends on storage availability and user retention of browser data.
- A retained rotating-globe removal and protected site/domain settings are unrelated and remain untouched.

## Run, inspect and roll back

```
python3 -m http.server 8042 --bind 127.0.0.1
node scripts/test_game.mjs
node scripts/test_patrol_upgrade.mjs
node scripts/simulate_patrol.mjs
python scripts/qa_patrol_upgrade.py --base-url http://127.0.0.1:8042
python scripts/qa_play.py --base-url http://127.0.0.1:8042 --browser /usr/bin/chromium
```

Open `/play/?v=7-counter#game`. For a development A/B toggle set `GAME_CONFIG.counter.enabled` to false in source; no console/debug interface is shipped. GitHub Pages remains main/root; changed runtime URLs use `v=7-counter` to invalidate browser caches. Revert the upgrade commit and push main to restore v6; preserve wallet storage and `CNAME`, never adjust DNS/Pages configuration.
