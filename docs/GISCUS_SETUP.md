# Real Bird Nest comments

The independent page's wall code is ready, but the external service is deliberately disabled until configuration is verified. No fabricated comments, secret token, local-only message storage or unverified repository/category identifier is shipped.

Current known blocker: the existing site repository does not have GitHub Discussions enabled. The connected GitHub tools cannot enable repository Discussions or grant the giscus app access. Browser fallback and the external app grant require user authorization. Enabling this optional service must not alter the existing Pages/domain/HTTPS configuration.

Before activating, revisit the owner's public identity separation rule: a GitHub-backed wall can reveal its hosting repository and GitHub account. Prefer a brand-only hosting account/repository, or get the owner's explicit approval for the existing account association. Never display Steven's personal name, school, photograph or private profile in the website.

After approval:

1. Enable GitHub Discussions on the approved public repository.
2. Install the official giscus app with access restricted to that repository. Its necessary grant is Discussions read/write.
3. Use `https://giscus.app/zh-CN` to verify all prerequisites, select an appropriate discussion category and copy the exact repository/category IDs.
4. Set `data/giscus.json` to `enabled: true` with these verified values. Keep mapping `specific` and term `Graybird 鸟友留言墙` so the thread remains stable under route/query changes.
5. Publish the same existing website. Check read-only widget loading on mobile and desktop. Have a consenting signed-in person post a genuine first message; do not fabricate a test visitor or post as the owner without an instruction.

The wall loads only when a visitor clicks its button. Anonymous visitors can read; posting uses the official GitHub authorization screen. Environment audio and personal passport do not require sign-in. Public names and messages must be rendered by giscus, not injected as HTML from site-owned storage.
