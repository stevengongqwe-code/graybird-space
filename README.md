# Graybird — Interactive Earth Observation System / V3

A quiet, framework-free Earth observation experience at https://graybird.space, developed from the working V2. Official artwork, character, six original field notes and the Graybird world are retained.

## Development

Run `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root. No build, install, WebGL, remote font or external JavaScript dependency is required.

## Experience

Arrival is the original lunar scene, with separate CSS-masked depth layers using the same artwork. Pointer input adds a few pixels of parallax; touch and scroll provide restrained spatial feedback. Graybird is a keyboard-operable, touchable scene object and portrait, with short original observations.

The observation database has six channels and twelve editorial records. A brief, cancellable 140 ms signal read switches content inside the terminal. Arrow keys, Home/End and native Enter/Space activation work alongside touch. Each record has a stable hash (`#observation-001` through `#observation-012`); V2 subject links such as `#observation-ai` remain supported. Browser history restores the selected record. Copying a link has an accessible manual-copy fallback.

A sticky telemetry strip and a quiet signal line track arrival, observation, database, transmission and project as the reader moves through the system. A small number of hidden interactions exist; their activation is intentionally not documented here.

## Performance and fallbacks

Mobile disables the extra foreground layer, near-star layer and continuous Earth motion. Scene updates run only in response to input, at most once per animation frame, and stop outside the viewport. Animations and the clock pause in the background. Reduced motion disables spatial and scan animation while retaining all controls. Without JavaScript, the complete website and initial V2 observation remain readable. If CSS masks or IntersectionObserver are unavailable, the original scene and database remain usable.

## Files and maintenance

- `index.html`: semantic structure, initial accessible record, metadata and original content.
- `styles.css`: V2 visual foundation plus responsive scene, signal and terminal styling.
- `script.js`: V2 records, added records, database state, sharing, character feedback and event-driven scene.
- `assets/`: unchanged official V2 artwork, favicon and social image.
- `404.html`, `robots.txt`, `sitemap.xml`: retained static hosting and search support.
- `QA.md`: measured verification and limits.
- `CNAME`: exact production domain; do not change or remove.

Field notes are original editorial copy, not scientific findings or a live X feed. Update the first HTML record when editing its matching JavaScript data. Future project directions remain explicitly unlaunched.

## Deployment and rollback

Publish on the existing GitHub Pages `main` branch, root directory. Retain `CNAME` bytes `graybird.space` and all existing DNS, nameserver, GoDaddy and Pages domain/HTTPS settings. A revert of the V3 code commit restores V2; no hosting or infrastructure migration is required.
