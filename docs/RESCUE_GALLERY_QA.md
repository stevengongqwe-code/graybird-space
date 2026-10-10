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
