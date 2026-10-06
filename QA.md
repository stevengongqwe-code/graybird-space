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

## Performance evidence

390px Chromium; cold cache; 4x CPU slowdown; approximately 1.6Mbps download and 100ms latency:

- FCP: 1012ms; LCP: 1240ms.
- First-view subresources: 190449 bytes across 5 requests (document is additional); unchanged mobile hero artwork is about 119KB.
- Initial CLS: 0; measured scrolling/interaction CLS: approximately 0.00011.
- A 60-frame scroll sample averaged 17ms per frame, maximum 21ms.
- One initialization long task measured 218ms under CPU throttling; no additional long tasks in the sampled scroll/terminal interaction.
- No framework, particle loop, Canvas/WebGL or new image payload. CSS/JS/HTML total approximately 51KB uncompressed.

These values are controlled development measurements, not guarantees for every device or connection.

## Production acceptance

Production verification is performed after the code commit is deployed, against https://graybird.space. The deployment report records the final commit and GitHub Pages run. Static file bytes, actual HTTPS page behavior, records and viewport checks must match the tested code; documentation-only updates do not change runtime assets.

## Known limitations

- Physical Android hardware, iPhone Safari, battery/thermal behavior and screen-reader hardware have not been tested. Chromium mobile/touch emulation and CPU/network throttling provide the available evidence.
- Existing Pages `https_enforced` is false: HTTPS works, while HTTP is also available without a forced redirect. This setting is intentionally preserved.
- Without JavaScript the initial observation and all narrative content remain readable; interactive database controls require JavaScript, as explained in the page.
- No severe known functional issue was found in completed local checks. Production status is verified separately after publishing.
