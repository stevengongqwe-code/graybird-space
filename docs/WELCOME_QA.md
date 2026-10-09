# First-visit and game sharing acceptance

Tested locally using Chromium with Chinese fonts, without CPU or network throttling. Mobile testing uses browser touch emulation, not a physical Android device.

- 375, 390, 768, 1280 and 1920px: first-visit navigation, about page, game guide, movement, pause, deterministic death, duplicate-finish guard, retry and retained guide acknowledgement passed.
- Score PNG generation and copied challenge text passed at all five widths. At 390px, system file sharing, cancelled sharing and clipboard failure/manual-copy fallback passed with browser API stubs. Actual Android system share targets remain a device-level check.
- No application page errors or local HTTP resource failures. Screenshots inspected for home, about, first guide, results and score card. Original official assets, combat engine, economy, nest and archive retained.
- Existing game, patrol upgrade, combat audio and six locale contract tests passed. Internal link/resource checker passed: 22 existing HTML pages, 62 resources/links, 74 fragments. New about route additionally exercised in browser tests.
- Fixed GoatCounter event calls exercised with a local stub; no analytics traffic generated during tests. Receipt in the private production dashboard has not been checked. Events are aggregate counts and do not imply unique players or a user-level funnel.
- Existing public site performance has not been benchmarked with a throttled device profile in this change. New pages use existing local images, fonts and styles; no runtime framework added.

Run `QA_BROWSER=/path/to/chromium node scripts/qa_welcome.cjs` with a local server at port 8000; `QA_BASE` and `QA_OUTPUT` override the server and screenshot directory.
