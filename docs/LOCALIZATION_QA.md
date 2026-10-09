# Additive English and Japanese homepages

## Hard constraint: existing website is read-only

Steven explicitly prohibited deleting or modifying the original website. Baseline commit: `4ea2c94c589a7731c03c8a4dd79d7c21cb53e009`.

All changes are new files. No existing homepage, archive, nest, game, script, stylesheet, official artwork, CNAME, robots.txt, sitemap.xml or deployment configuration is changed. Tests compare every baseline file byte-for-byte using SHA-256. Keep this constraint for further work on this branch.

## Result

- `/en/` and `/ja/`: generated static translations of the existing homepage, including account status, topic cards, image descriptions, accessible labels and all twelve interactive observation records.
- 241 bilingual copy entries in `i18n/home-copy.json`; source copy locations across the original HTML, JS and JSON in `i18n/copy-inventory.json`.
- One generated shared interaction script `i18n/home-runtime.js`, derived from the unchanged original script. No independently maintained language-specific behavior or artwork.
- Locale-only, keyboard-accessible language picker: Chinese/EN/JA. Explicit selections save a preference; browser language or saved preferences are suggested without automatic redirection. Storage failure is nonfatal.
- Canonical, Open Graph URL, JSON-LD language and zh/en/ja/x-default alternates on the new pages. Additive `i18n/sitemap.xml` lists locale pages. Original sitemap and Chinese metadata stay unchanged; Chinese-to-locale reciprocal hreflang and a homepage picker cannot be added under the read-only constraint.
- Existing nest/archive/article/game destinations remain Chinese; links explicitly label this. This scope is homepage localization, not localization of the entire game or archive.
- Japanese uses a system fallback stack including locally available Noto Sans JP, Hiragino, Yu Gothic and Meiryo. No Google Fonts request, API, runtime dependency or package manifest is introduced. Actual installed-font coverage remains a browser/device acceptance item.
- Official images retain original bytes, including any Chinese lettering painted into the artwork. The Chinese language endonym `中文` is deliberately retained in the chooser. Japanese kanji are legitimate Japanese text, not automatically Chinese remnants.

## Commands actually run

- `python3 scripts/build_locales.py`: PASS. Idempotent, all generated resources/fragment references resolve in repository.
- `python3 scripts/test_locales.py`: PASS, five test groups; baseline file hashes, complete translations, embedded dictionaries/newline records, canonical/hreflang, local resources/anchors, shared runtime syntax and reproducible build.
- `node scripts/test_locale_runtime.mjs`: PASS. Actual localized record definitions evaluated in VM; six channels/twelve records, preference writes, blocked-storage fallback, recommendations without redirects, Escape focus. Language chooser uses DOM substitutes; this is not real browser coverage.
- `node scripts/test_game.mjs`: PASS.
- `node scripts/test_patrol_upgrade.mjs`: PASS.
- `git diff --exit-code HEAD --` and `git diff --check`: PASS before staging additions; no modified/deleted baseline files.
- In-process Python static HTTP server + urllib: `/en` and `/ja` redirect to trailing slash; `/en/`, `/ja/`, `/` and `/play/` return HTTP 200 locally.

## Not verified

No screenshots are supplied. Playwright's installed JS tooling has no installed Chromium binary. Attempting its browser install returned invalid/truncated ZIP data and failed. Browser layout, console/resource errors in a browser, keyboard/touch behavior in a real DOM, image dialog interaction, reduced motion, font/tofu coverage, overflow, LCP/CLS and physical Android are therefore unverified. The new code is a Draft PR, not merged or deployed. Local HTTP checks do not prove live production availability.

Before marking ready, run a static server in the repository and inspect `/`, `/en/`, `/ja/` at 375, 390, 768, 1280 and 1920px. Capture actual screenshots. Test language selection/reload, blocked localStorage, Escape/outside dismissal, all six terminal channels and next/copy controls, both character interactions, gallery dialog/navigation, anchor/history restoration, reduced motion and >=44px interactive targets. Check all local assets and browser console; repeat on physical Android. Preserve the read-only baseline throughout.

## Maintenance

Edit `i18n/home-copy.json`, run `python3 scripts/build_locales.py`, then both locale tests. Do not edit generated pages or runtime manually. Changes to the upstream homepage can be consumed only after explicitly authorized upstream work; missing translated script strings fail the locale build. No publishing step is included in the builder.
