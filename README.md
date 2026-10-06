# Graybird — Earth Observation System

A framework-free, static website for the original Graybird IP. Deployed on GitHub Pages at https://graybird.space.

## Local preview

Run `python3 -m http.server 8000` in this directory and open http://localhost:8000. No build step or dependencies.

## Files

- `index.html`: page structure, metadata, initial accessible observation.
- `styles.css`: responsive layout; breakpoints at 600 / 900 / 1800 px; reduced motion.
- `script.js`: original editorial field notes, topic switching, shareable hash state, UTC clock, small footer interaction.
- `assets/`: compressed supplied Graybird artwork. Hero uses mobile and wide sources. GIF deliberately represented by a static first frame to avoid perpetual animation and cost.
- `404.html`, `robots.txt`, `sitemap.xml`: static hosting and search support.
- `CNAME`: existing production custom domain. **Do not change or remove.**

## Editorial maintenance

The observation entries are original website copy, not a live feed, not quotes from published X posts, and not scientific findings. Update the `observations` array in `script.js`. When changing the first record, also update its initial HTML so it stays readable without JavaScript. If adding topics, update the subject buttons and record total. Future project categories are explicitly marked as directions, not available products.

## Deployment / rollback

Retain the current GitHub Pages configuration and CNAME. Publish these static files using the existing repository branch deployment. No DNS, nameserver, HTTPS, workflow, or domain-setting changes are required. Revert the V2 commit to restore the previous site. No external scripts, trackers, fonts or X embeds are used.
