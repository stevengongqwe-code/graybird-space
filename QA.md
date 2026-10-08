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
