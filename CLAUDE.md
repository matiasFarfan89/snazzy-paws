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

- **Tailwind CSS** is loaded via CDN (`https://cdn.tailwindcss.com`) — no local build or `node_modules`. The brand colour palette and font families are defined inline in a `tailwind.config` block inside each page's `<head>`, and are **duplicated across all five HTML files** — if you change a colour, update it in every page. The same palette is also mirrored as CSS variables in `:root` at the top of `styles.css`.
- **Fonts**: Google Fonts via `<link>` in each head — Poppins (headings), Inter (body), Lora (testimonial quotes).
- **`styles.css`** handles anything Tailwind can't express declaratively: design tokens (`:root` variables), scroll-reveal keyframes, hero load animations, mobile nav transitions, the masonry gallery grid + hover overlays + badges, the lightbox (nav arrows, counter, blur backdrop), the `.btn-cta` slide-in arrow button, testimonial/info-card/services-table styling, form validation states (incl. shake animation), page fade transitions, and `prefers-reduced-motion` support.
- **`script.js`** is a single DOMContentLoaded module covering: mobile hamburger menu, active nav link highlighting (matches `window.location.pathname`), header `.scrolled` class toggle (rAF-debounced), scroll-reveal via `IntersectionObserver` (`rootMargin: -100px`), gallery image lazy fade-in, lightbox with prev/next + arrow-key navigation + "n of m" counter, client-side form validation (blur + submit, shake on new errors), animated success panel, smooth anchor scroll, and cross-page fade transitions (skipped under reduced motion).

**Page structure** — all five pages share an identical copy-pasted header and footer. There is no templating or component system; structural changes (nav items, footer copy, contact details) must be applied to each file manually.

## Brand colours

| Token | Hex | Use |
|---|---|---|
| `brand-navy` | `#0F1B2E` | Hero/header/footer gradients, headings |
| `brand-dark` | `#2D3E5F` | Gradient end for navy surfaces |
| `brand-pink` | `#E89B9B` | CTA gradient start, focus rings |
| `brand-rose` | `#D4878F` | CTA gradient end, accents, borders, prices |
| `brand-peach` | `#F4D5C4` | Callout boxes, card borders, hover fills |
| `brand-cream` | `#FAF6F3` | Page background, alternating table rows |
| `brand-gold` | `#C9A876` | Accent lines (h2 underline, footer top border) |
| `brand-sage` | `#A8B8A8` | Trust line in footer, success-panel border |
| `brand-charcoal` | `#2C2C2C` | Body text, labels |

## Key CSS classes (defined in `styles.css`, not Tailwind)

| Class | Purpose |
|---|---|
| `.site-header` / `.scrolled` | Blurred sticky header; `script.js` adds `.scrolled` past 20 px for elevation |
| `.btn-cta` / `.btn-arrow` | Rose-gradient pill button; arrow slides in on hover |
| `.scroll-animate` / `.visible` | Fade-up reveal; toggled by `IntersectionObserver` in `script.js` |
| `.scroll-animate-delay-{1,2,3}` | Staggered 0.1–0.3 s delays for cards |
| `.gallery-grid` / `.gi-tall` / `.gi-wide` | Masonry grid; span classes only apply at `lg` |
| `.gallery-item` / `.gallery-overlay` / `.gallery-badge` | Clickable tile, rose-tint hover overlay, corner label (fades in once `img.loaded`) |
| `.lightbox-*` (`-nav`, `-prev`, `-next`, `-counter`, `-close`) | Lightbox built by `script.js` |
| `.hamburger` / `.hamburger.active` | Mobile nav toggle; CSS animates spans to X |
| `.nav-links` / `.nav-links.active` | Mobile dropdown; hidden via `max-height: 0` |
| `.active-nav` | Current-page underline highlight; set by `script.js` |
| `.testimonial` | Quote card with watermark `“` and rose left border |
| `.info-card` | Contact info card, rose top border, lift on hover |
| `.form-card` | White form container with thin rose border |
| `.services-table` | Alternating rows + rose left-border hover highlight |
| `.field-error` / `.field-success` / `.shake` | Inline validation feedback; shake plays on newly errored fields |
| `.form-success` | Post-submit success panel (hidden by default, shown via `.show`) |
| `.page-exit` | Body fade-out before internal navigation (set by `script.js`) |

## Accessibility features in place

- Skip-to-content link (`.skip-link`) on every page
- `aria-expanded` toggled on hamburger button
- Gallery items get `role="button"` and `tabindex="0"` via JS for keyboard access
- Lightbox sets `role="dialog"` and `aria-modal="true"`; Escape closes, arrow keys navigate, focus returns to the opening tile on close
- `*:focus-visible` outline using brand-pink
- `prefers-reduced-motion: reduce` disables animations, parallax, and page transitions
