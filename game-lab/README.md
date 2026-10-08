# Graybird Game Lab — Pipeline V1

This is a planning-only workspace. Production site and `main` are untouched.

## Sources of truth
- Character: existing official Graybird artwork only. Do not infer body shape from "fat" or "thin" descriptions.
- Production: https://graybird.space/play/
- Game entry: `play/index.html`; gameplay code: `play/play.js`; styles: `play/play.css`.
- Notion backlog: https://app.notion.com/p/2fcd38c646544d939ccd5594983d0470
- Canva: editable visual board is prepared separately; only approved original assets can enter the game.

## Workflow
1. Backlog in Notion: requirement, acceptance criteria, owner, priority.
2. Design: mockups and asset placeholders in Canva; Steven approves official character artwork.
3. Development: feature branches only; no direct changes to main.
4. QA: mobile/desktop, touch/keyboard, collision, balance, accessibility, performance.
5. Release: Steven explicitly approves merge and production deployment.

## V1 backlog
- P0: inventory current game systems and assets; no assumptions about deployed state.
- P1: enemy roster and per-enemy 2D art, including ads, popups and new variants.
- P1: weapon tiers using caterpillar projectiles, fire-rate and spread upgrades.
- P1: peanut economy, shop pricing and permanent/temporary upgrades.
- P1: at least three distinct boss concepts with telegraphed attack patterns.
- P1: progressive difficulty and fair restart loop.
- P0: verify all sprites against approved official reference before integration.

## Release gate
Do not modify `CNAME`, DNS, production domain, deployment settings or the `main` branch without explicit approval.
