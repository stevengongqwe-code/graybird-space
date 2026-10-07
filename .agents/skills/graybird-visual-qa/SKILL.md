---
name: graybird-visual-qa
description: Evidence-based Graybird visual and functional acceptance across required viewports.
---
Start a real local server and browser. Verify 375/390/768/1280/1920px, capturing first screens and relevant reading/filter states. Inspect screenshots, not only DOM sizes. Pause or mask moving layers before visual comparisons; don't repeatedly tune animation frames.

Use a short 0–4 review: 0 unusable, 1 major problems, 2 functional with important visual defects, 3 acceptable with minor limitations, 4 ready in the tested scope. Fix up to six material findings by priority. Maximum three attempts on one issue; keep a safe fallback and report a remaining issue. No forced infinite scoring loop or redundant passed tests.

Verify navigation, topic cards, search/filter/URL history, empty state, image sizes/loading, visible keyboard focus, >=44px active controls, reduced motion, console/resource errors, local links, build and static route aliases. Measure LCP/CLS with a stated CPU/network profile. Check live HTTPS, Pages status and exact CNAME after authorized deployment. Don't modify deployment settings to improve a score. Distinguish warnings from errors and platform warnings from application defects; don't conceal findings or disable verification.

Report commands, results, screenshots and unavailable physical-device coverage. Real unpublished discussion states are allowed; fake engagement, fabricated dates and unfinished placeholder copy are not.
