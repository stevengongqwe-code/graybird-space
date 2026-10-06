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
