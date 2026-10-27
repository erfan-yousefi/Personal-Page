# Erfan Yousefi — Personal Portfolio

A buildless, responsive portfolio for backend development, data science, and continuous learning. Uses semantic HTML, one stylesheet, and dependency-free JavaScript.

## Local preview

Run from this directory:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. No package installation or build is required.

## Structure

- `index.html`: content, icon symbols, certificate links, and metadata.
- `assets/Stylesheets/Main.css`: theme tokens, components, responsive layouts, reduced-motion and print styles.
- `assets/Scripts/Main.js`: themes, mobile navigation, certificate gallery/viewer, and native scroll observers.
- `assets/img/portrait.webp`: optimized portrait; original JPEG retained as fallback.
- `assets/img/thumbnails/`: small previews; full credentials remain in `assets/img/Certificates/`.
- `scripts/optimize-images.py`: optional asset regeneration with Python and Pillow.
- `CNAME`: existing domain configuration, preserved.

Relative asset paths support hosting under a repository subdirectory.

## Design and behavior

Charcoal and ivory themes with lime accents, editorial typography, a portrait-led introduction, structured experience rows, a skills grid, and filterable credentials.

The gallery initially shows six certificates; expand to see all 14 or filter by category. Original links work without JavaScript. The native dialog adds keyboard focus cycling, Escape/backdrop dismissal, focus restoration, loading feedback, and error recovery.

Themes persist when storage is available. Storage errors do not interrupt other functionality. Content and navigation remain available without JavaScript. Animations respect reduced-motion preferences.

## Code audit and optimization

The previous implementation loaded a blocking external ScrollReveal script. A failure in that script or local storage could prevent certificate initialization. Other issues included overlapping stylesheets, pointer-only certificate controls, missing modal focus management, and full viewport heights for every section.

Changes:

- Replaced ScrollReveal with native IntersectionObserver and visible-by-default content.
- Consolidated three stylesheets; shared tokens keep both themes consistent.
- Limited backdrop blur to the header; avoided continuous animation and scroll handlers.
- Added keyboard-accessible controls, semantic landmarks, focus styles, and error states.
- Reserved image space to avoid layout shifts.
- Added lazy thumbnails; full certificate images load only when opened.
- Removed external fonts, scripts, and style dependencies.
- Added page descriptions, social metadata, and a favicon.

The portrait is **15,334 bytes**, down from **141,489 bytes**: approximately **89% smaller**. All 14 thumbnails total **182,964 bytes**. Originals are preserved.

To regenerate derivatives after updating images:

```sh
python scripts/optimize-images.py
```

This optional development helper requires Pillow and reads certificate mappings from the HTML.

## Validation

Local headless Chrome checks covered 320, 360, 390, 600, 768, 1024, and 1440 pixels in both themes:

- No horizontal overflow.
- All local assets, original credentials, and section anchors resolve.
- Theme persistence, mobile navigation, filters, and expansion work.
- Keyboard activation, dialog focus cycling, dismissal, and focus restoration work.
- Blocked storage, image errors, reduced motion, and disabled JavaScript have usable fallbacks.
- No JavaScript errors, failed normal requests, or external runtime requests.

The local desktop cold load measured about **75 KB transferred**, including HTML and assets, with **0 initial cumulative layout shift**. These are local measurements, not a production performance score; hosting, caching, device, and viewport affect real-world results.

Screenshots and temporary QA tools are in ignored `.preview/`. Changes are local; no deployment or remote push was performed.
