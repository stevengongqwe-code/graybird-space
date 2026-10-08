# Graybird V3 verification

## Baseline and protection

- Started from the clean, deployed V2 main commit `5bfe110aa1cb8c65ef9ee28ae8cc5bb3197e18be`; production HTML matched that checkout.
- Official artwork, favicon, social image, original character and six V2 field notes retained. No asset regeneration or source-image edits.
- `CNAME` remains the exact bytes `graybird.space`; no DNS, nameserver, GoDaddy, Pages custom-domain, deployment-source or HTTPS-setting changes.

## Local verification

- Chromium passed widths 360, 390, 412, 430, 768, 1024, 1440, 1920 and 2560 px. Mobile tests used touch/viewport emulation; desktop tests exercised pointer parallax.
- No horizontal overflow, clipped controls, failed image loads, asset errors, JavaScript exceptions or error-level console messages in those runs.
- Scene and portrait interaction, six channels/twelve records, cancellable scanning, rapid-selection races, clear active state, next-record cycling, numbered and legacy deep links, browser history, keyboard arrows/Home/End/Enter and manual-copy fallback passed.
- Mobile scene controls and channel buttons meet at least 44px targets; visible focus, semantic headings/landmarks, status announcements and skip navigation are provided.
- Reduced motion from initial load and after preference change passed. No-JavaScript content, custom 404, absent IntersectionObserver/CSS mask fallback and safe return from hidden content passed.
- Internal anchors, IDs, exact local resource responses and declared image paths checked. Desktop and mobile screenshots inspected.
- Stage telemetry, offscreen animation pause, simulated visibility-event pause/resume and hidden-interaction recovery checked. Headless Chromium does not provide a physical Android background/thermal measurement.

## V3 baseline performance evidence (before the image archive addition)

390px Chromium; cold cache; 4x CPU slowdown; approximately 1.6Mbps download and 100ms latency:

- FCP: 1012ms; LCP: 1240ms.
- First-view subresources: 190449 bytes across 5 requests (document is additional); unchanged mobile hero artwork is about 119KB.
- Initial CLS: 0; measured scrolling/interaction CLS: approximately 0.00011.
- A 60-frame scroll sample averaged 17ms per frame, maximum 21ms.
- One initialization long task measured 218ms under CPU throttling; no additional long tasks in the sampled scroll/terminal interaction.
- No framework, particle loop, Canvas/WebGL or new image payload. CSS/JS/HTML total approximately 51KB uncompressed.

These values are controlled development measurements, not guarantees for every device or connection.

## Supplied artwork integration checks

- Five new `assets/earth-*.jpg` files match the original uploads byte-for-byte, with no cropping, retouching or character regeneration. Each is 1280x960; total source JPG payload is 885131 bytes, below the fold and lazy loaded.
- Local Chromium checks passed at 360, 390, 412, 430, 768 and 1440 px. No new image was requested on the first screen in these runs.
- Every picture was selected, decoded and opened in the full-image dialog at every tested width. Four-to-three aspect ratios, all asset URLs, touch/keyboard input, 44px-or-larger index targets, terminal synchronization, previous/next wraparound, deep links and browser history passed.
- Closing via Escape and the button restores page scrolling. Reduced motion, no-JavaScript five-picture browsing and unsupported-dialog link fallback passed.
- No JavaScript exceptions, error-level console messages, failed resource requests or horizontal overflow were observed. Mobile and desktop archive screenshots inspected.
- CSS/JavaScript URLs now carry a release query to avoid using an older cached V3 control/style bundle.
- Existing official assets and CNAME are unchanged. Production delivery and interaction are checked separately after the Pages deployment.

## Production acceptance

Production verification is performed after the code commit is deployed, against https://graybird.space. The deployment report records the final commit and GitHub Pages run. Static file bytes, actual HTTPS page behavior, records and viewport checks must match the tested code; documentation-only updates do not change runtime assets.

## Known limitations

- Physical Android hardware, iPhone Safari, battery/thermal behavior and screen-reader hardware have not been tested. Chromium mobile/touch emulation and CPU/network throttling provide the available evidence.
- Existing Pages `https_enforced` is false: HTTPS works, while HTTP is also available without a forced redirect. This setting is intentionally preserved.
- Without JavaScript the initial observation and all narrative content remain readable; interactive database controls require JavaScript, as explained in the page.
- No severe known functional issue was found in completed local checks. Production status is verified separately after publishing.

## Bird Nest extension

- Existing deployment remains GitHub Pages/main/root, exact CNAME `graybird.space`; no domain, DNS, nameserver, GoDaddy or HTTPS setting changes.
- New static routes: `/nest/`, `/archive/` and seventeen `/archive/<id>/` entries. Extensionless directory requests redirect correctly with the local static server. Deployment compatibility is checked on production after publishing.
- Four homepage opening topics; five forum rooms; filters for five archive types; stable topic addresses; truthful pending discussion actions where no verified X post is available.
- Local Chromium/touch checks cover 360, 390, 412, 430 and 1440 px. Homepage, nest, archive, story image, all filters, keyboard navigation, shareable filter hashes, history and reload pass. No horizontal overflow, errors or failed image resources were observed.
- Original observation selection, full-image dialog, notice image and reduced-motion behavior remain functional. No rotating Earth is reintroduced. Original official images, original character and original terminal/scene scripts are unchanged.
- All static entry routes respond; exact X-post action rendering/safe external attributes and pending state verified. Rebuilding twice produces identical HTML and sitemap. The extension uses no framework, external font, API or client fetch.
- No-JavaScript browsing works on nest/archive/entries. Unknown publication dates are not fabricated. Discussion posts must be bound manually once real links exist.
- Physical Android hardware, thermal behavior and assistive-technology hardware are not available; checks use Chromium emulation. Existing HTTPS enforcement configuration is preserved. Production acceptance is reported with the deployed commit.
- Extension performance sample: Chromium 390px, 4x CPU slowdown, 1.6Mbps download, 100ms latency, cache disabled. Nest LCP 772ms; archive LCP 628ms; measured CLS 0 on both. First-view subresources about 69.8KB on each (HTML additional). These are controlled local measurements, not physical Android results.
- Link audit covered 21 actual HTML pages, 38 unique local resource/link targets and 65 internal fragment references. All passed. Header brand/navigation do not overlap at the four mobile widths or desktop width.

## Adapted capability pack and Bird Nest discovery

- Read all requested files in the uploaded pack. Integrated adapted local skills, repository instructions, a current round/fluffy 2D Character Lock and DESIGN.md. Obsolete slim-bird/single-page rules, mandatory prototypes/font migration and forced GSAP/Lenis/Three.js are removed. No global skill installation or package installer was run.
- `python3 scripts/build_content.py`: seventeen entries generated with no errors. Existing topic data, official images, main scene/terminal scripts and CNAME preserved.
- `python3 scripts/qa_frontend.py --base-url http://127.0.0.1:8025 --output /tmp/graybird-pack-qa`: PASS at 375/390/768/1280/1920px, five page types each. Zero console errors, warnings or resource failures. Native mobile touch reset, Chinese search, combined category/search, URL/reload/history, keyboard arrows/focus, >=44px controls, empty-state recovery, actual related entries and no-JavaScript browsing pass.
- Captured and visually inspected required viewports with motion paused. Review score 4/4 for the tested extension: clear hierarchy, retained palette/character, no clipping/overlap, usable mobile filters and focus states. No visual rework or animation-frame chasing required.
- One QA assertion was corrected: Maomao has one actual related night record, so it correctly shows one link instead of padding a second fictitious record. Runtime content was already correct; the test now checks actual content availability.
- `python3 scripts/check_links.py --base-url http://127.0.0.1:8025`: PASS, 21 HTML pages, 38 unique resource/link targets, 65 internal fragments including validated observation hashes.
- Chromium 390px, cache disabled, 4x CPU, 1.6Mbps/100ms network: nest LCP 820ms, archive LCP 672ms; measured CLS 0; subresource transfer 73544 bytes per page (HTML additional). Controlled local measurements, not physical Android guarantees.
- Three.js: not applicable; no WebGL dependency or rotating globe is present. Preserve the original Earth in the scene illustration. No extra particle or rendering loop introduced.
- Remaining limits: physical Android hardware unavailable; X discussion URLs still await real posts; submissions/comments intentionally unopened. Search covers titles and introductions, not an external full-text database. Production deployment and HTTPS are checked separately after the code commit.


## 2026-10-08 original image restoration

- Added all ten PNGs supplied by the owner, SHA-256 checked against the uploads without conversion or cropping. Existing JPG/WebP assets, notice, lunar hero, observation terminal, nest/archive routes and exact CNAME are preserved.
- Extended the existing visual archive from five to eleven frames (ten supplied originals plus the existing life scene), with a visible thumbnail index and direct homepage gallery link. Wide and portrait images retain their complete compositions; inactive images remain fully visible. Archive count follows the actual frame count.
- Full original integration checks passed at 375, 390, 768, 1280 and 1920px: every picture decoded and opened/closed (55 modal checks), keyboard navigation, mobile touch, at least 44px controls, no overflow, reduced motion and all eleven images without JavaScript. Screenshots inspected at mobile and desktop widths, including the loaded thumbnail index and portrait art.
- Existing frontend QA passed at all five widths across homepage, nest, archive and entry routes, including search/filter/history, original terminal and dialog. Analytics requests were mocked in this local functional test because the test environment returned empty responses from the external GoatCounter script; production analytics code remains unchanged. No site JavaScript or local resource errors.
- Internal link audit: 21 HTML pages, 47 unique resources/links and 66 fragments, PASS. JavaScript syntax and git whitespace checks passed.
- Physical Android hardware and screen readers are unavailable. Mobile testing uses Chromium touch emulation. Production delivery is checked separately after publication.

## 2026-10-08 independent interactive explorer

- Added `/play/` with owner-requested worm feeding, labelled original-scene hotspots, a nine-stamp browser-local passport and PNG/share output, 30 prewritten daily letters with UTC+8 midnight rollover and local history, a real 30-second canvas signal game with three-hit loss/pause/score card, manual night/lamp controls and two opt-in Web Audio modes. Official bird and scene images are reused unchanged.
- Preservation audit: 32 existing asset/style/script/domain/data files byte-identical to parent `5e26f42`; homepage and nest HTML differ only by their new explorer links. Seventeen archive entry pages, original observations, original gallery and original scene animations remain intact. Existing content generator preserves the gallery link and generates the new entry link; two builds are checked for stability.
- `scripts/qa_play.py`: PASS at 375, 390, 768, 1280 and 1920px. Genuine desktop pointer drag, mobile two-tap feeding, rapid-feed rejection and fourth-feed annoyance, nine earned stamps, safe nickname text, persistence, PNG visitor/score cards, two opt-in audio modes, original asset decoding, 30-second completion and paused time, >=44px controls, no overflow, denied storage and no-JavaScript fallback. Zero page or local resource errors. Deterministic browser-clock/random inputs exercise the real game loop without a production test API.
- Additional 390/1280px checks: new SVG icons decode, UTC+8 next-day unlock with two saved letters, actual three-collision early loss, background pause without auto-resume, and normal-motion meteor/night states PASS. Final mobile and desktop first screen, room, passport and game screenshots visually inspected; score 4/4 within tested scope.
- Existing full frontend regression PASS at all five widths for five old page types, including filters/search/history, original terminal, original photo modal, related content and no-JavaScript browsing. No old global CSS or animation script changes.
- Link audit: 22 HTML pages, 52 resources/links, 72 fragments, PASS. JavaScript syntax/whitespace PASS. SVG artwork has no active script, remote image or event attributes and retains licensing notices.
- Constrained local performance: Chromium 390px/touch emulation, 4x CPU, 1.6Mbps download, 100ms latency, cache disabled; LCP 2496ms and CLS 0. This is not a physical Android measurement. Audio/game are idle until the visitor starts them; meteor rendering pauses offscreen/hidden and is disabled under reduced motion.
- Giscus configuration/loader is implemented but the live shared wall is NOT enabled or claimed as functional. The existing repository has Discussions disabled; the separate giscus app grant is not available through connected tools. `data/giscus.json` stays disabled with no unverified IDs or personal-account association. Owner authorization for browser fallback, external app access and the approved public hosting identity remains necessary. No test/fake visitor message is published.
- Local tests mock external GoatCounter to avoid polluting visit counts; the deployed analytics script remains unchanged. Physical Android, Safari and assistive hardware are unavailable. Production source/resource delivery is checked after the new commit deploys.

## 2026-10-08 caterpillar shooter upgrade

- Owner-requested scope: automatic caterpillar shots destroy obstacles and drop peanuts; collecting peanuts earns the same reward currency. Four fire rates (2.5/4/6/8 per second), blue upgrade pickups, one-hit failure, five increasing difficulty stages, restart, a browser-local peanut bank and a ten-peanut 30-second survival bonus. Cards now report peanuts, survival and shooting results. Existing progress migrates without converting legacy signal records to peanuts.
- `node scripts/test_game.mjs` PASS: all three hazard contacts end play immediately; shots destroy obstacles and drop collectible peanuts; four firing rates, upgrade cap, pause, exact 30-second end, rising speed/density, restart and mobile/desktop simulation.
- Updated `scripts/qa_play.py` PASS at 375/390/768/1280/1920px: real game loop, upgraded shots, one-contact loss via actual pointer/touch movement, full survival, single reward settlement, persisted bank/best, reset gun, exported cards, no overflow and no JavaScript/resource errors. Existing room/feed/audio/mail/passport checks and denied storage/no-JavaScript checks also PASS. Corrected an old ambiguous image test selector to target the unchanged room photograph specifically.
- Original frontend regression PASS across five widths and five original page types, including images, terminal, filters/history and no-JavaScript. Internal links PASS: 22 pages, 52 resources, 72 fragments. Protected original page/assets/domain files have no changes.
- Separate live browser simulations confirm hidden-tab pause without automatic resume. Active mobile/desktop game screenshots inspected: 4/4 within tested scope. Normal-motion and reduced-motion contexts checked; gameplay motion only runs after explicit Start.
- Constrained local performance: Chromium 390px touch emulation, 4x CPU, 1.6Mbps download, 100ms latency, cache off: LCP 2528ms, CLS 0. Physical Android and Safari are unavailable. External analytics mocked in acceptance tests; deployed analytics unchanged.
