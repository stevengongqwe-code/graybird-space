# Current deployment verification

- Supplied V2 deployed to `main` in commit `24bcb81`; GitHub Pages run [37522972213](https://github.com/stevengongqwe-code/graybird-space/actions/runs/37522972213) completed build, report-build-status and deploy successfully.
- Original `CNAME` bytes remain `graybird.space`. No DNS, nameserver, GoDaddy or GitHub Pages domain/settings changes were made.
- Chromium checks passed at widths 360, 390, 412, 430, 768, 1024, 1440, 1920 and 2560 px: no horizontal overflow, valid image loading, six channels, exclusive selection, next-record wraparound, deep links and footer interaction.
- Internal anchors and local asset paths passed; all six images decode. The repository server returns the deployed HTML, CSS, JavaScript, images, robots, sitemap and 404 page with HTTP 200 and appropriate content types.
- No-JavaScript content and 404 return link passed; reduced-motion preference was exercised. Desktop and mobile screenshots were visually inspected.
- Minimal corrections: ignore initial whitespace when toggling the footer note; adjust only the mobile hero image position to keep Graybird in view. Supplied artwork, copy and design were retained.
- Production verification completed: `https://graybird.space/` and all referenced static assets return HTTP 200 and match deployed file bytes. A nonexistent URL returns the custom page with HTTP 404. The X destination responds with HTTP 200.
- The same nine-width Chromium checks passed directly on the production HTTPS domain, including images, all channel controls, deep links, the footer, no-JavaScript fallback and the 404 page. No JavaScript exceptions or failed resource requests were observed. Existing platform proxy CA trust was used; certificate verification was not disabled. Chromium required access to the environment NSS database outside the filesystem sandbox.
- GitHub Pages reports `built`, branch `main`, path `/`, custom domain `graybird.space`, and `https_enforced: false`. HTTPS requests pass the environment trust validation (TLS 1.3 through the platform proxy); HTTP currently also returns 200 without an HTTPS redirect. Pages settings were preserved.
- Real iPhone Safari and Android devices have not been tested; viewport and touch emulation were performed in Chromium.

## Original package verification notes (historical)

The notes below were included in the uploaded ZIP. Their blocked-browser and failed-push statements describe that earlier preparation, not this deployment.

# V2 verification status

## Completed
- Inspected public production homepage and cloned repository main at f06d369.
- Verified original deployment source contains index.html and CNAME only.
- Preserved exact CNAME bytes; no DNS, Pages configuration, nameserver, or HTTPS changes.
- JS syntax check; internal anchor targets; asset references; unique IDs; image alt and explicit dimensions; Graybird naming; git whitespace validation.
- Exercised all six channel handlers, exclusive active selection, initial deep-link loading, next-record wraparound and footer interaction using a lightweight DOM stub. This is logic verification, not browser rendering verification.
- Main HTML/CSS/JS are approximately 27 KB before compression; hero images approximately 120 KB each, selected by viewport. No frontend dependencies or third-party requests.
- Reduced-motion styles, native keyboard-operable buttons, focus styles, skip link and no-JS initial record provided.

## Blocked / still required before production acceptance
- Cloud browser rejected localhost:8000 (ERR_BLOCKED_BY_CLIENT). Actual V2 visual rendering, touch interaction and screenshots remain unverified.
- Test viewport widths 360, 390, 412, 430, 768, 1024, 1440, 1920 and 2560. Check horizontal overflow, hero crop, text contrast over art, controls, keyboard focus, reduced motion and JavaScript disabled.
- Check Android Chrome and iPhone Safari; actual frame rate and Lighthouse performance have not been measured.
- Validate X destination from a reachable client and inspect social preview after deployment; no claim of a live X feed.
- Git push dry-run failed because no GitHub write credentials are available. No remote code or live site was changed.
- Once connected, inspect Pages source settings, publish using the existing branch, wait for deployment, and re-open https://graybird.space to verify V2 assets, terminal, 404 and HTTPS.

## Content
Six original website field notes are editorial copy, not historical X posts or live data. All future product directions are explicitly marked as not launched.
