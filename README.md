# Graybird — Interactive Earth Observation System / V3

A quiet, framework-free Earth observation experience at https://graybird.space, developed from the working V2. Official artwork, character, six original field notes and the Graybird world are retained.

## Development

Run `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root. No build, install, WebGL, remote font or external JavaScript dependency is required.

## Experience

Arrival is the original lunar scene, with separate CSS-masked depth layers using the same artwork. Pointer input adds a few pixels of parallax; touch and scroll provide restrained spatial feedback. Graybird is a keyboard-operable, touchable scene object and portrait, with short original observations.

The observation database has six channels and twelve editorial records. A brief, cancellable 140 ms signal read switches content inside the terminal. Arrow keys, Home/End and native Enter/Space activation work alongside touch. Each record has a stable hash (`#observation-001` through `#observation-012`); V2 subject links such as `#observation-ai` remain supported. Browser history restores the selected record. Copying a link has an accessible manual-copy fallback.

A sticky telemetry strip and a quiet signal line track arrival, observation, database, transmission and project as the reader moves through the system. A small number of hidden interactions exist; their activation is intentionally not documented here.

## Visual field notes

Five supplied finished scenes are embedded in the database: humans, internet, AI, life and curiosity. The existing lunar arrival and earlier official assets remain unchanged. The JPGs in `assets/earth-*.jpg` preserve the supplied bytes and full 4:3 composition.

The terminal and image index stay in sync. Previous/next controls and keyboard navigation are supported. Opening a scene shows its complete image in a native dialog; Escape, the close button or the backdrop dismiss it and restore scrolling/focus. Without dialog support, the original image link opens normally. Without JavaScript, all five figures remain readable. Images are lazy loaded below the fold; there is no autoplay or new continuous animation.

## Performance and fallbacks

Mobile disables the extra foreground layer, near-star layer and continuous scene motion. Scene updates run only in response to input, at most once per animation frame, and stop outside the viewport. Animations and the clock pause in the background. Reduced motion disables spatial and scan animation while retaining all controls. Without JavaScript, the complete website and initial V2 observation remain readable. If CSS masks or IntersectionObserver are unavailable, the original scene and database remain usable.

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

## Bird Nest and content archive

The site now has three connected entrances: the original homepage, `/nest/` (five forum rooms) and `/archive/` (filterable long-term records). Each record also has a real static `/archive/<id>/` page. GitHub Pages serves these directory indexes directly, including a redirect from `/nest` and `/archive`; no SPA rewrite or hosting changes are needed.

Content lives in `data/topics.json`. Four opening topics, twelve unchanged editorial field notes and the supplied Maomao story are initially archived. No comments, member activity or X threads are invented. The account-appeal notice remains visible; unbound discussion actions clearly wait for a real X post.

To add or update content:

1. Edit a topic in `data/topics.json`. Keep its `id` stable so existing links survive. Choose a `room` and `kind` from the existing IDs. `paragraphs` contains the readable full entry; `excerpt` appears in lists.
2. Set `publishedAt` only when the publication date is known. `archivedAt` is the date the content was collected here. Both use `YYYY-MM-DD`.
3. Set `discussionUrl` to the exact `https://x.com/<account>/status/<post-id>` URL when a real post is available. Leave it `null` while unavailable. No profile URL is used as a substitute discussion thread.
4. Mark up to five topics `featured: true` for the homepage. Add optional `image`, `imageWidth`, `imageHeight` and `imageAlt` for illustrated entries; retain the source artwork.
5. Run `python3 scripts/build_content.py` from this existing checkout, then review and commit the data and generated HTML together. The builder needs only Python's standard library and validates IDs, categories, dates and links. There is no install step.

`TopicCard`, `ForumSection` and `GarybirdHeader` are small serverless build functions in `scripts/build_content.py`; `templates/community.html` is the shared page shell. `community.css` follows the original palette. `community.js` only enhances filters/history/keyboard navigation; all records remain readable without it. Homepage generated content sits between the `BIRD NEST START/END` comments; everything outside that region is retained by the builder.

Maintenance limits: the initial opening topics are editorial prompts, not active X conversations. Submissions and comments remain unopened. Data edits require rerunning the builder before pushing; GitHub Pages does not run Python. Removing a topic from the data intentionally leaves its old generated entry available to avoid destroying a shared URL; retire records manually only with a deliberate content decision. Old entries' original publication dates are unknown and shown honestly as collection dates. No database, authentication, third-party runtime service or new account is required.
