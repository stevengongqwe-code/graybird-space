# 拯救小灰鸟

Route: https://graybird.space/save-graybird/ — static HTML/CSS/ES modules, no runtime packages or backend. Links appear in the Chinese homepage and rescue gallery. Existing Pages configuration, CNAME and other games are unchanged.

## Story and assets

The game adapts the seven rescue comics by 老泥鳅 (@JokerLiu1119): infiltration, final decision, activation, midnight, resurrection, breakthrough and afterglow. Alex_理想主义版 (@Alexvhyn)'s shield artwork supplies the final fleet encounter. Original attribution and links remain visible. The other two Alex artworks remain in the gallery.

User supplied nine reference sheets: the banana-donkey sheet was duplicated. This build therefore uses seven distinct companions and Graybird, without fabricating a missing eighth companion. The supplied originals are stored unchanged in assets/save-graybird. Front-view crops and boundary-connected neutral-background removal happen in the browser. The seven temporary companion names and abilities are gameplay adaptations, not assertions about the authors' character canon. Graybird unlocks only after resurrection.

## Gameplay

- Collect three signal fragments while avoiding patrols, then enter the upper-right doorway.
- Connect terminals in moon → star → sun order; mistakes reset the sequence.
- Activate three rescue devices under incoming fire.
- Accumulate 24 seconds inside the central signal ring; moving out retains progress.
- Connect three light nodes to resurrect Graybird.
- Open the lower-right gate and escort Graybird to the upper-right exit.
- Activate three barrier nodes, then counter the fleet from the central ring or with abilities.

Keyboard: WASD/arrows, E, Space, 1–8, P. Pointer: drag arena or hold directional buttons, tap actions and roster. Health resets each chapter. Shield, remote connection, sprint, stealth, healing and projectile clearing give companions distinct roles. Story mode lowers detection and hazard frequency and increases protection after damage. Audio is opt-in. Device reduced-motion preferences suppress flashing feedback.

Native dialogs suspend simulation for story, pause and retry. Losing retries the same chapter. localStorage saves the current chapter, total active time, retries and mode; continuation starts that chapter again. Save read/write errors are caught; no accounts or network persistence. Completion includes replay and a clipboard share card with text fallback.

## Verification — 2026-10-10

- `node --check save-graybird/engine.js`, `node --check save-graybird/game.js`, `node tests/rescue-engine.mjs`, `git diff --check`: pass.
- Chromium 153 + Playwright: 375, 390, 768, 1280, 1920px, 900px height; screenshots inspected. Start, story, pause/resume, roster, ability, title continuation, reduced motion, no document overflow, no JS/resource errors: pass.
- Browser keyboard playthrough of all seven acts in both standard and story modes: pass, approximately 93 seconds of simulated active time on an optimized route. This is a functional path test, not typical human playtime. No browser state teleportation; real keys and click/tap controls drive the game. Pure engine tests separately exercise objective transitions, wall collision, wrong sequence, abilities/cooldowns, escort, failure/retry and frozen terminal state.
- Mobile-context pointer hold/release, touchscreen actions, corrupt storage fallback, refresh continuation, failure dialog and same-chapter retry: pass.
- Existing homepage and ten-image rescue gallery: five widths, no overflow, all images and modal keyboard navigation, attribution and resource/console checks: pass.
- Local unthrottled Chromium at 390×844, loopback HTTP, no CPU/network slowdown: LCP 68ms, CLS 0, preloaded asset bodies 3,360,811 bytes; ready plus the 500ms observation delay 1,259ms. These are local measurements, not mobile-network or physical-device guarantees.
- Evidence: docs/game-evidence. Scoped visual review: 4/4, ready in the tested browser scope. Physical Android/iOS and Safari were unavailable.

Browser QA scripts are `tests/rescue-browser.cjs` and `tests/rescue-recovery.cjs`. They require development-only Playwright and @sparticuz/chromium, run their own local static server and place screenshots in RESCUE_QA_OUTPUT or the OS temporary directory. Neither dependency is shipped to visitors.
