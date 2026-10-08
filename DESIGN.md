# Graybird design contract

## Direction

A gray bird's handmade corner of the internet: the existing dark observation station opens into a small forum and archive. Keep the original lunar scene and official bird; extend its left-aligned editorial typography and fine dividers. The visitor recognizes the bird, reads its questions, then follows real discussion links when available.

## Existing tokens

| Token | Current value | Role |
|---|---|---|
| `--bg` | `#090b0d` | page / quiet space |
| `--ink` | `#eeefed` | primary text |
| `--muted` | `#a0a5aa` | secondary text |
| `--line` | `#2a2e32` | restrained dividers |
| `--blue` | `#a6cbe3` | focus and small signal accents |
| `--mono` | system monospace stack | record labels / dates |

These are actual `styles.css` variables, not a new palette. Retain Arial/PingFang SC/Microsoft YaHei body text and existing monospace annotations. No remote fonts or imposed font bans.

## Layout and reading

```
home: preserved notice + original lunar hero → current questions → original observation sections
nest: bird identity → five rooms → search / room filters → topic rows
archive: archive identity → search / type filters → records → full entry → related records
```

Keep article text at a readable maximum width; use horizontal editorial rows, not a rounded SaaS card wall. Existing small bird avatars are the author cue. No fictional votes, online users or comment counts. Pending discussion states remain explicit. New topics should be maintained through data, not layout edits.

The owner-approved interactive nest now sits between the nest introduction and the existing forum rooms: a quiet room with window, journal, computer and paper-note hotspots, the unchanged original bird, optional peanut feeding, then an earth visitor passport. The room uses code-native scenery, muted wood/paper accents and the existing dark palette. The passport is warm paper with six earned/locked personal exploration stamps. Its nickname and progress are local to the visitor's browser; it is not a public membership system. Mobile uses the same scene with larger relative bird proportions and stacked passport controls. Two-tap and keyboard feeding are equivalent to dragging. The original homepage, editorial forum, archive and account notice remain intact.

## Motion and feedback

Native scrolling remains intact. Transform/opacity only for spatial movement; brief focus/press feedback on controls; no animation delays before reading. Reduced motion is a fully visible static state. No background loops for search/filter UI. The removed rotating globe stays absent; no Three.js/GSAP/Lenis dependency is necessary for the present product.

## Spacing and adaptation

Use existing 23px mobile gutters, 7% desktop gutters and 8/12/16/24/32px spacing. Square edges and fine dividers; avoid glass, neon and large radii. Primary touch controls are at least 44px. Reuse current 600/900px breakpoints; verify 375/390/768/1280/1920px without replacing working breakpoints to match a template.

## Source priorities

Latest owner instruction → current official character lock → current implemented product → adapted capability skills. Imported old single-page/globe/slim-character rules are retired. Read `docs/FRONTEND_CAPABILITIES.md` for the integration record.
