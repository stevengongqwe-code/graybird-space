# Graybird project instructions

Read this file before working in this existing checkout. User instructions and the current repository take precedence over imported capability packs. Do not create replacement sites or worktrees without a request.

## Current product and protected boundaries

Graybird.space is Garybird's personal internet territory: the original observation experience, Bird Nest (`/nest/`), and a long-term content archive (`/archive/`). X is the external discussion layer. Keep the original homepage, account-appeal notice, official images, working animations and static routes.

Keep `main`, GitHub Pages/root deployment, exact `CNAME` bytes `graybird.space`, custom domain and HTTPS configuration. Never change DNS, nameservers or GoDaddy as routine development. Never generate replacement bird art. Read `GRAYBIRD_MASTER_VISUAL_CHARACTER_LOCK.md` and `DESIGN.md` before visual changes.

## Local capabilities

Read relevant adapted skills under `.agents/skills/`:

- `graybird-design-director/SKILL.md`: preserve and extend the actual visual foundation.
- `graybird-motion/SKILL.md`: lightweight motion and input feedback.
- `graybird-earth/SKILL.md`: optional effects and fallback policy; the rotating globe was explicitly removed and stays removed unless requested.
- `graybird-visual-qa/SKILL.md`: actual browser checks, screenshots and evidence.

These supersede the uploaded pack's obsolete character, single-page scope, forced prototypes, font bans and mandatory animation libraries. No global Codex configuration or upstream package installation is required.

## Development and maintenance

Run `python3 -m http.server 8000 --bind 127.0.0.1` in the repository. No runtime framework/install is needed. Edit `data/topics.json` for content; run `python3 scripts/build_content.py` and commit generated pages with the data. Do not hand-edit generated nest/archive entries. Use real X post URLs only; missing URLs have an explicit pending state. Never invent comments, users, engagement, publication dates or submissions.

Keep changes scoped. Use system fonts already in the site; no forced typography migration. Native scrolling, CSS and small JavaScript are the default; GSAP, Lenis and Three.js are optional only when a concrete benefit justifies their cost. Do not run the original pack installer or copy obsolete global instructions.

## Verification

Actually run and inspect 375, 390, 768, 1280 and 1920px. Include mobile touch, overflow, navigation, search/filter/history, Topic Cards, original terminal and images, keyboard focus, >=44px interactive targets, reduced motion, console/resource errors, links, static route aliases, HTTPS and CNAME. Pause or mask moving layers for screenshot comparisons instead of chasing animation frames. Measure performance with a stated environment; distinguish simulated Android from physical hardware.

Report verification commands/results and material limitations. Fix important regressions before publishing. Limit attempts on one issue to three; retain a safe fallback and report unresolved issues rather than looping. Low-risk choices do not require user confirmation when already authorized. Commit/push/deploy only within the user's authorized scope.
