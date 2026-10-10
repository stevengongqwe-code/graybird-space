# Rescue gallery / issue #10

## Change

Publish the owner's existing graybird-rescue-ready.zip as /rescue/ with seven original optimized WebP images, preserving their bytes and story order. Add a single link to the Chinese homepage's existing first-visit navigation. Show 漫画原作者：老泥鳅 · @JokerLiu1119 beside the introduction and in the closing credits; both link to the owner-supplied https://x.com/JokerLiu1119. No original-post URL or license grant was supplied or invented. Publication is requested by the site owner in the current conversation; creator permission was not independently verified and this page makes no licensing claim.

## Verification actually performed

- Real headless Chromium 153 through Playwright, local Node HTTP server; widths 375, 390, 768, 1280, 1920, height 900. Touch-capable/mobile contexts for 375/390; reduced-motion enabled.
- Seven images decode at every width, seven distinct hashes, source WebP bytes preserved. Correct intrinsic dimensions (1450 × 622 for landscape, 1147 × 1536 for portrait).
- All seven lightboxes open and close; Enter opens, Escape closes, focus returns to the image button. Header/author/footer interactive target heights >=44px.
- Homepage entrance visible and navigates to /rescue/; homepage and gallery have no horizontal overflow at tested widths. Gallery has zero page errors and zero failed local resources.
- Chinese-font screenshots inspected for all five widths. Chinese fonts installed only in temporary QA environment, not shipped to the site. Representative screenshots under docs/rescue-evidence/.
- Inline JS syntax and git diff whitespace checks pass. All local gallery asset/navigation paths exist. Exact CNAME bytes preserved; other existing files unchanged except the single additive homepage link.

## Limits

This is simulated mobile Chromium, not a physical Android test. No new runtime dependencies, deployment settings, DNS changes, or game modifications. Existing PR #2 CI workflow is not part of this change and remains unmerged; Pages build/deploy status and live HTTP/resources must be checked after merge.

## Alex artwork addition — 2026-10-10

Three further owner-uploaded artworks are added in an independent section #alex-gallery after the seven original chapters. Attribution: Alex_理想主义版 · @Alexvhyn, read from the supplied account screenshot, linked at the section introduction and closing credits. The seven original comics remain credited to 老泥鳅 · @JokerLiu1119. The screenshot itself is not published. New images use WebP quality 92 at unchanged dimensions; compositions and the visible Alex watermark remain intact. Source mapping: 1000047570.jpg → alex-01-shield.webp; 1000047572.jpg → alex-02-fleet.webp; 1000047571.jpg → alex-03-frontier.webp. Image titles are editorial captions, not claimed creator titles.

Real Chromium rechecked at 375/390/768/1280/1920px: all ten images decode, ten lightboxes open/close, mobile tap on simulated touch contexts works, Enter/Escape and focus return work, reduced-motion rendering, author links, homepage navigation and no horizontal overflow pass. Gallery JS errors and failed local resources: zero. Syntax and diff whitespace checks pass. Original seven image bytes and CNAME unchanged. Physical Android remains untested. Publication explicitly requested by the owner; no license claim or original-post URL invented.
