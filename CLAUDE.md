# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static multi-page website for a fictional pet grooming business (Snazzy Paws Grooming, Hamilton NZ). Built as BIT607 Web Development Assessment 2. No build step — open any `.html` file directly in a browser.

## Running the site

```bash
# Quick local server (Python, no install needed)
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just open any `.html` file directly in a browser.

## Architecture

**No framework, no bundler, no package manager.** Everything is vanilla HTML/CSS/JS.

- **Tailwind CSS** is loaded via CDN (`https://cdn.tailwindcss.com`) — no local build or `node_modules`. The brand colour palette is defined inline in a `tailwind.config` block inside each page's `<head>`, and is **duplicated across all five HTML files** — if you change a colour, update it in every page.
- **`styles.css`** handles anything Tailwind can't express declaratively: scroll-reveal animation keyframes, mobile nav open/close transitions, lightbox overlay, hamburger-to-X transform, form validation states, and the `section h2::after` decorator line.
- **`script.js`** is a single DOMContentLoaded module covering: mobile hamburger menu, active nav link highlighting (matches `window.location.pathname`), header shadow on scroll, scroll-reveal via `IntersectionObserver`, gallery lightbox, client-side form validation (blur + submit), and smooth anchor scroll.

**Page structure** — all five pages share an identical copy-pasted header and footer. There is no templating or component system; structural changes (nav items, footer copy, contact details) must be applied to each file manually.

## Brand colours

| Token | Hex |
|---|---|
| `brand-navy` | `#1A2A4F` |
| `brand-dark` | `#2a3a5f` |
| `brand-pink` | `#F7A5A5` |
| `brand-peach` | `#FFDBB6` |
| `brand-cream` | `#FFF2EF` |

## Key CSS classes (defined in `styles.css`, not Tailwind)

| Class | Purpose |
|---|---|
| `.scroll-animate` / `.visible` | Fade-up reveal; toggled by `IntersectionObserver` in `script.js` |
| `.scroll-animate-delay-{1,2,3}` | Staggered 0.1–0.3 s delays for cards |
| `.gallery-item` | Clickable image tile; `script.js` wires up lightbox |
| `.hamburger` / `.hamburger.active` | Mobile nav toggle; CSS animates spans to X |
| `.nav-links` / `.nav-links.active` | Mobile dropdown; hidden via `max-height: 0` |
| `.active-nav` | Current-page underline highlight; set by `script.js` |
| `.field-error` / `.field-success` | Inline validation feedback spans |
| `.form-success` | Post-submit success panel (hidden by default, shown via `.show`) |

## Accessibility features in place

- Skip-to-content link (`.skip-link`) on every page
- `aria-expanded` toggled on hamburger button
- Gallery items get `role="button"` and `tabindex="0"` via JS for keyboard access
- Lightbox sets `role="dialog"` and `aria-modal="true"`; Escape closes it
- `*:focus-visible` outline using brand-pink
