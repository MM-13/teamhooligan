---
name: Team Hooligan Website Art Bible
description: "Use when creating or changing Team Hooligan website pages, HTML, CSS, layout, imagery, typography, or responsive presentation."
applyTo: ["**/*.html", "**/*.css"]
---

# Team Hooligan Website Art Bible

## Identity

The website is the home of an independent studio making atmospheric, mischievous, sometimes unsettling games. Keep it confident, tactile, cinematic, and game-focused; never corporate or generic. Every page may express its own game's identity, but must still feel part of the same studio website.

## Visual Rules

- Treat `Assets/css/styles.css` as the source of truth for shared colors and components. Preserve near-black brown (`--bg-color: #0c0302`), deep brown (`--sidebar-bg: #190400`), warm gold (`--accent: #e0c487`), and rust red (`--accent-2: #bd3c01`). Reuse existing variables; add colors only for a clear functional or artwork-specific reason.
- Use real Team Hooligan and game artwork from `Assets/Images/` and `Assets/Videos/` as the visual focus. Preserve aspect ratio and intentional crop. Never replace game art with stock imagery or decorative gradients.
- Reuse the established logo, navigation, buttons, typography, spacing, and page structure where appropriate. Keep sections clear and mostly unframed; use existing cards only when the content calls for them. Do not create a new design system or apply card treatments to every section.
- Maintain readable warm-white body text, gold secondary emphasis, and restrained rust-red actions. Keep visible keyboard focus and never use color alone to convey state.
- Make every page work from mobile to desktop: prevent clipping and overlap, reflow media and text, and preserve usable touch targets. Respect `prefers-reduced-motion` and provide meaningful image alt text.

## Before Finishing

- Inspect the relevant page, shared styles, and available assets before editing; prefer small, scoped changes over new global rules.
- For a new or substantially changed page, ask the Website Art Direction agent to review visual consistency and address its relevant findings. If that agent is unavailable, check the rules above directly and report any visual checks not performed.
- Check the page at narrow and wide layouts when possible, including contrast, image crop, focus visibility, and local links/assets.
