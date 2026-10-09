# Graybird Universe — independent first prototype

A browser-local, data-driven exploration universe, companion and procedural Boss lab. All source changes are new files under `universe/`; official character and monster assets are referenced read-only. No root page, production game, deployment configuration or original artwork is modified. This branch must remain an unmerged Draft PR until the owner approves integration.

## Local preview

From repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/universe/`. Direct companion and lab aliases are `/universe/companion/` and `/universe/boss-lab/`; they open the same engine with a selected view. This is a static prototype, with no framework build, new runtime dependency, account, server database or external API.

## What works

- Seeded planets: six coordinates per sector, six biomes/civilizations/NPC identities/resource types, generated lazily; seed + coordinate + generator version reproduce the same planet. UI deliberately caps coordinates at 999,995 for numeric and practical safeguards. Different seeds produce further worlds. “Infinite” means expandable procedural content, not literally infinite unique authored narratives.
- Each planet has three interactive locations, unique pickups, NPC choices, persistent consequences and a hidden discovery unlocked by completing exploration and dialogue. Shared templates are intentional in this first version; NPC names/civilizations vary, but dialogue branches are currently shared.
- Random events have a 20-second cooldown and an action-triggered probability. Exploration records, inventory and NPC choices survive refresh. Switching world seeds requires confirmation and resets only exploration state.
- Official Graybird companion: hunger, mood, energy, affection, growth, feed/rest/talk/play interactions and bounded memories alter dialogue. Offline decay is capped at 24 hours; hunger/mood have safe floors and no permanent death. Companion feeding uses its own supply, not live game currency.
- Boss lab: Beijing-day seed, editable reproducible seed, 9 existing Boss illustrations, 3 attack types, 2 movement phases, telegraph, auto-fire, pointer drag and keyboard control, 3 HP and temporary invulnerability. Victory settles the sandbox reward once; restart abandons the prior run. No live `/play/` integration.
- Candidate workflow is generated -> parameter checked -> locally approved/rejected with a note. Approval cannot publish anything. Daily generation occurs when the page is opened; there is no unattended job.
- Optional short Web Audio interaction cue, disabled initially and enabled only by a user gesture.

## Modules and extension points

| File | Responsibility |
|---|---|
| `data.mjs` | Locations, items, events, civilization names and archetypes |
| `engine.mjs` | Pure seeded generation, save normalization, companion rules, Boss envelopes |
| `storage.mjs` | One versioned, isolated storage key and failure handling |
| `app.mjs` | DOM views, exploration consequences, bounded saves, local review |
| `combat.mjs` | Canvas combat and pointer/keyboard lifecycle |
| `style.css` | Existing Graybird palette, typography and mobile layout |

Add location/item/dialogue packs in `data.mjs`, then extend the pure engine. Keep generator labels (`world-v1`, `boss-v1`) stable for existing seeds; a future generator change needs a version migration. Introduce new attack types in data, validation and combat together. A future shared world needs an authenticated backend, concurrency rules, privacy choices and separate owner authorization; local storage is not presented as shared state.

## Persistence and safety

Only `graybird:universe:v1` is read/written. No production game keys are touched. Saves are version checked and normalized; malformed or inaccessible storage enters a temporary session and preserves the original data until explicit reset. Logs retain 30 entries; visits/world records retain 500; memories retain 12; reviews retain 100. The interface communicates these limits. Browser deletion/private mode can lose progress. No account or cross-device sync.

## Verification — 2026-10-09

```sh
node --test universe/tests/engine.test.mjs
# With local server running and existing Playwright + Chromium available:
BROWSER_EXECUTABLE=/path/to/chromium node universe/tests/browser.cjs
```

- Pure tests: **5 passed**, 0 failed. Includes 1,000 planets and **10,000 deterministic Boss seeds**; all generated Bosses obey health 90–150, damage 1, speed 65–100, cooldown 1.05–1.70 seconds, 3–5 projectiles/wave, reward 12–20, and all 3 archetypes occur. Rejects NaN and unsafe parameters. Tests Shanghai midnight, bounded offline companion behavior, memory limit and corrupt/blocked save behavior.
- Real headless Chromium interface tests: **375, 390, 768, 1280, 1920 px**, with touch capability emulated below 600 px and reduced-motion preference. All passed: discovery, collection, NPC choice, hidden unlock, refresh persistence, companion memory, sector navigation, keyboard/pointer Boss start and stop, review and reset; no horizontal overflow, active button height below 44 px, JS errors or failed resource loads. Corrupt save remains intact after interaction.
- Captured and visually inspected mobile/desktop evidence under `evidence/`. The test environment initially lacked Chinese fonts; a local QA font was configured outside the repository before final screenshots. No font dependency was added to the product.
- Static project: no app build step required; all `.mjs` files also pass `node --check`. Existing content-builder is unrelated to these new files and was not run to avoid regenerating protected routes.
- Boss checks are parameter envelopes and a documented survivability heuristic, not proof of fair/fun fights. Interface smoke tests exercised short fights, not every seed, victory/loss edge case, or every attack phase. Physical Android hardware, cross-device persistence, long-session performance and screen-reader output are not verified. No measured LCP/CLS claim is made.
- Visual review: **3/4**, usable first prototype; limited authored dialogue/world detail and sandbox-only combat remain deliberate limits. No deployment or HTTPS/Pages changes were performed.

Example reproducible Boss seeds: `2026-10-09`, `2026-10-10`, `2026-10-11`, `graybird-42`, `quiet-moon`.

## Future integration

After owner review, approved candidates could be exported as versioned definitions and adapted to the live game's combat/economy with regression tests in a separate authorized change. Do not copy sandbox balances straight into production or enable automatic publication. No production links have been added.
