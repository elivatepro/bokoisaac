# Framer "Soren Hale" template: motion catalogue

Source: https://wild-hours-611915.framer.app/ (Home). Values come from the published HTML's inline CSS and from the code-component bundles (`toplevel-deps` holds ShLoader, ShSmooth (the cursor), ShHeader and ShFooter; `Pqt8…mjs` holds Hero, Marks, Work, About, Bench, Stack, Services, Log, Lab and Writing; ShReviews, ShFaq and ShCta each have their own file). Anything marked *inferred* was not read directly from code. Headless screenshots confirmed the loader lift (scan line mid-screen at 500 ms) and the settled hero.

Flags: **D** = purely decorative · **U** = can hurt usability or accessibility · **P** = costs performance (continuous rAF, canvas or scroll work).

## Summary

| # | Name | Where (template → ours) | Trigger | Effort | Flags |
|---|------|------------------------|---------|--------|-------|
| 1 | Boot loader (typed line + bar + lift) | ShLoader → `Base.astro` | First load, once per session | M | D, U |
| 2 | Page-transition wipe | ShLoader → `Base.astro` | Internal link click / arrival | M | D, U |
| 3 | Smooth scroll (Lenis) | ShSmooth → `Base.astro` | Continuous (wheel) | S | U, P |
| 4 | Lime cursor with label | ShSmooth → `Base.astro` | Pointer move | M | D, U, P |
| 5 | Header condenses on scroll | ShHeader → `site/Header.astro` | scrollY > 40 | S | |
| 6 | Nav underline draw | ShHeader → Header | Hover / focus / current page | S | |
| 7 | Mobile menu sheet | ShHeader → Header | Burger click | S | |
| 8 | Pulse dot and blinking caret | Header, About, Bench, Reviews → same | Continuous | S | D |
| 9 | Button arrow swap / download drop | All `.sh-btn` → `ui/Button.astro` | Hover / focus | S | |
| 10 | "More" link underline draw | All sections → same | Hover / focus | S | |
| 11 | Section reveal system (eyebrow, word-rise heading, fade-rise stagger) | All sections → all | Scroll into view, once | M | |
| 12 | Hero intro | ShHero → `Hero.astro` | Hydration (page load) | S | |
| 13 | Count-up numbers | Hero stats, Bench rings → Hero, Numbers | Load / in view | S | |
| 14 | Portrait "source code" canvas | ShHero → Hero | Load, hover, toggle, idle | L | D, P |
| 15 | Hero local cursor + magnetic buttons | ShHero → Hero | Pointer move over hero | M | D, U |
| 16 | Client marquee | ShMarks → `ShippedFor.astro` | Continuous | S | D |
| 17 | Title "compile" scramble | Work card titles, footer wordmark → Work, Footer | In view | S | D |
| 18 | Before → after metric diff | ShWork → `Work.astro` | In view | S | |
| 19 | Stacking project deck | ShWork → Work | Scroll position | L | P |
| 20 | Card image hover zoom | ShWork → Work | Hover | S | D |
| 21 | Statement words light up on scroll | ShAbout → `About.astro` | Scroll position | M | P |
| 22 | Score rings + vitals bars draw | ShBench → `Numbers.astro` | In view | M | |
| 23 | Keycap board press + readout swap | ShStack → `Keys.astro` | Hover / focus / click | S | |
| 24 | Services accordion | ShServices → `Services.astro` | Click | S | |
| 25 | Career branch line draws on scroll | ShLog → `Timeline.astro` | Scroll position | M | P |
| 26 | Lab rail: drag, inertia, wheel, progress bar | ShLab → `Lab.astro` | Drag / wheel / arrows | M | U |
| 27 | Card hover lift | Lab, Writing, hero commit → same | Hover / focus | S | |
| 28 | Review "diff line" hover | ShReviews → `Reviews.astro` | Hover | S | D |
| 29 | Writing row slide | ShWriting → `Writing.astro` | Hover / focus | S | |
| 30 | FAQ accordion | ShFaq → `Faq.astro` | Click | S | |
| 31 | Brief value flash | ShCta → `Contact.astro` | Picking a chip | S | D |
| 32 | Footer wordmark compile + link underlines | ShFooter → `site/Footer.astro` | In view / hover | S | D |

Global reduced motion: every section ships `@media (prefers-reduced-motion:reduce){.sh-sec *,.sh-sec *::before,.sh-sec *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0ms!important}}`. JS features also check `matchMedia('(prefers-reduced-motion: reduce)')`: with it on, the loader, page transition, Lenis, both cursors, the portrait canvas, count-ups, scrubs and the deck are all skipped, and content renders in its final state.

---

## Site-wide

### 1. Boot loader (typed line + bar + lift) — D, U
**What you see:** on the first visit of a session, a dark full-screen panel shows `> soren hale — frontend developer` resolving out of random code symbols, with a lime progress bar. The panel then drains downward behind a glowing lime scan line to reveal the page.
- **Where:** ShLoader layer "③ LOADER + page transition" → our `Base.astro`.
- **Trigger:** page load, first visit only. An inline `<head>` script adds `html.shl-go.sh-hold-ld` before first paint, but skips this when: the path is `/start-here`, reduced motion is on, `sessionStorage['sh-loaded']` is set, or a page-transition flag exists. A 5000 ms failsafe removes the classes if JS never runs. JS then sets `sessionStorage['sh-loaded']='1'`, and only shows the loader if `performance.now() < 3500`.
- **Parameters:**
  - Bar duration: `t = 900ms` (prop `duration` 0.9 s, clamped 0.6–1 s), then `i = max(500, min(t, t + 400 − performance.now()))`, so a slow boot shortens the bar. The bar fill is `shl-fill` (scaleX 0→1, origin left) over `i` ms with `cubic-bezier(.3,.1,.3,1)`, a 2px lime line on a 1px 16% ink track.
  - Text scramble: it resolves left to right over `min(820, i × 0.72)` ms. Unresolved characters re-roll every 45 ms from the set `<>/{}[]()=+*#;:01`, and resolved text shows through. Block caret: `shl-blink 1s steps(1) infinite`.
  - At `i` ms the sub-line shows "ready". At `i + 100` ms the panel lifts, with a hard fallback lift at 4000 ms.
  - Lift: `.shl-wipe` `shl-open` scaleY 1→0, `transform-origin:50% 100%` (the top edge travels down), 0.5 s `cubic-bezier(.65,0,.25,1)`. The scan line (2px lime, `box-shadow:0 0 18px` lime 70%) runs `shl-run` translateY −2px→100% with the same timing. The panel is removed 560 ms later.
  - Skip: click anywhere on the panel, press any key except Tab, or use the Skip button (bottom-right, 44px tall).
  - Page scroll is locked while it runs (`overflow:hidden!important`). `html[class*="sh-hold"]` pauses the h1 CSS rise and delays all section reveals until the panel lifts.
- **Reduced motion:** never shown.
- **Implementation:** an inline `is:inline` head script (class on `<html>` + sessionStorage check, so there's no flash), CSS keyframes for wipe, bar and caret, and about 40 lines of vanilla JS for the scramble and timing. GSAP isn't needed. Gotchas: keep the failsafe timeout; total time is about 1.5 s, which is a cost on every first visit (U), so keep Skip and key-to-skip; set `aria-hidden` when not loading. The hero intro (#12) is **not** gated on the loader in the template (*inferred from code: no hold check*), so it mostly plays under the panel. Gate ours on `sh-hold` removal.

### 2. Page-transition wipe — D, U
**What you see:** clicking an internal link drops a dark panel down the screen behind a lime scan line. The next page opens with the same panel draining downward.
- **Where:** ShLoader → `Base.astro`.
- **Trigger:** a click on a same-origin `<a href>` to a different path. Skipped for modifier keys, non-left clicks, `target` other than `_self`, `download`, `#hash`, `mailto:`/`tel:`/`sms:`/`javascript:`, `[data-no-trans]`, `/start-here`, and reduced motion.
- **Parameters:** leave: `html.shl-leave`, `shl-close` scaleY 0→1 (origin top) 0.5 s `cubic-bezier(.65,0,.25,1)` with the scan line; navigation happens at 520 ms. It writes `sessionStorage['sh-pt']={p:targetPath}`. Arrival: the head script sees `sh-pt` matching the current path, adds `shl-arrive` (full cover, no text), and the lift (#1) runs 70 ms after hydration, with a 3000 ms failsafe. `pageshow` with `persisted` (bfcache) clears everything. While leaving, the cover takes pointer events with `cursor:progress`.
- **Implementation:** with Astro `<ClientRouter />`, use `astro:before-preparation` to play the close (await about 500 ms) and `astro:after-swap` to play the lift, or define custom `::view-transition-old/new` animations. Gotcha: under ClientRouter every script must re-init on `astro:page-load`. This adds about 1 s to every navigation (U); consider a shorter version.

### 3. Smooth scroll (Lenis) — U, P
**What you see:** mouse-wheel scrolling glides with inertia instead of stepping.
- **Where:** ShSmooth "Smooth scroll + cursor (keep)" → `Base.astro`.
- **Trigger:** continuous, but only when `(hover: hover) and (pointer: fine)` matches and reduced motion is off (never on touch screens).
- **Parameters:** Lenis 1.1.x, lazy-imported: `{ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true }` (editor range 0.03–0.2, "lower = more glide"). Its rAF runs on the shared ticker. Same-page `#anchor` clicks use `lenis.scrollTo(el, { offset: -72 })` and `history.pushState`. The menu sheet calls `lenis.stop()` and `start()`. CSS: `html.lenis,html.lenis body{height:auto} .lenis.lenis-smooth{scroll-behavior:auto!important} .lenis.lenis-stopped{overflow:hidden}`.
- **Implementation:** add the `lenis` package (about 3 KB) and drive it from `gsap.ticker` if GSAP ScrollTrigger is used (`lenis.on('scroll', ScrollTrigger.update)`). Gotchas: it fights native `scroll-behavior:smooth`; nested scrollers need `data-lenis-prevent`; it is reported to annoy some trackpad users (U). With ClientRouter, destroy and recreate it on swaps or keep a single instance.

### 4. Lime cursor with label — D, U, P
**What you see:** the system cursor disappears over page sections. A 12px lime dot follows the mouse, and over links a small light pill appears next to it with a verb ("open case", "say hello", "open menu", "write email"…). The dot shrinks when over anything clickable.
- **Where:** ShSmooth → `Base.astro`. Labels come from `data-cur` attributes on links and buttons site-wide.
- **Trigger:** `pointermove` (mouse and pen only). Enabled only for `(hover:hover) and (pointer:fine)` and without reduced motion.
- **Parameters:** fixed div, `z-index:9990`. Position lerp `x += (target − x) × 0.28` per frame, applied as `translate3d`; the rAF stops when the remaining distance is ≤ 0.3px. Dot 12×12, `margin:-6px`, lime with a 1.5px night ring. "Press" state over `a,button,[role=button],summary,label,input,select,textarea`: `scale:.6` (0.25 s `cubic-bezier(.2,.8,.2,1)`). Label: 6px 9px padding, radius 7px, ink background, night text, 12px/500 mono. Show/hide is an opacity fade, 0.25 s; it hides when the pointer leaves the document, the window blurs, or the pointer is outside a `.sh-sec`. It sets `html.sh-has-cur .sh-sec, .sh-sec *{cursor:none}`.
- **Implementation:** a small vanilla script (about 50 lines) or `gsap.quickTo(el,'x',{duration:.3})`. Gotchas: hiding the system cursor breaks text-selection I-beams and the cursor shown in form fields (U), so keep the native cursor on inputs and textareas. Add `data-cur` to links. Skip it on touch screens.

### 5. Header condenses on scroll
**What you see:** at the top the header floats transparently over the hero. Once you scroll, it shrinks a little, gains a solid dark background, and a hairline draws across its bottom from the left.
- **Where:** ShHeader → `site/Header.astro`.
- **Trigger:** `scrollY > 40` (rAF-throttled scroll listener) toggles `.is-moved`.
- **Parameters:** height `--bar` 88→72px (phone ≤809px: 68→60px), `transition:height .35s cubic-bezier(.2,.8,.2,1)`. Background `::before` opacity 0→1, 0.3 s ease. Hairline `::after` scaleX 0→1 (origin left), 0.6 s `cubic-bezier(.2,.8,.2,1)`, 14% ink. Before `is-moved` the header bar is `pointer-events:none` (its children stay clickable).
- **Reduced motion:** transitions off; the state still toggles.
- **Implementation:** CSS plus a 10-line script (or an IntersectionObserver on a 40px sentinel). S.

### 6. Nav underline draw
**What you see:** hovering a nav item draws a lime underline from the left, and its number ("01") turns lime. The current page keeps the underline.
- **Parameters:** `::after` 1px lime at `bottom:9px`, scaleX 0→1, origin left, 0.35 s `cubic-bezier(.2,.7,.2,1)`. Number colour 0.25 s. Same for `:focus-visible` and `[aria-current]`.
- **Implementation:** CSS only.

### 7. Mobile menu sheet
**What you see:** below 1100px the burger's two lines rotate into an X, and a full-screen dark sheet fades in while its big links rise in one after another.
- **Parameters:** burger lines `translate:0 ±4.5px; rotate:±45deg`, 0.35 s `cubic-bezier(.2,.8,.2,1)`. Sheet `shhd-in` opacity 0→1, 0.32 s ease. Items `shhd-li` (opacity 0→1, translate 14px→0) 0.5 s `cubic-bezier(.2,.8,.2,1)`, delay `60ms + i × 35ms`. It locks scroll, stops Lenis, traps focus, closes on Esc or when the viewport reaches ≥1100px, and on close restores the scroll position and focus.
- **Reduced motion:** sheet and item animations off.
- **Implementation:** CSS keyframes plus a small script. `<dialog>` handles the focus trap for free.

### 8. Pulse dot and blinking caret — D
- Status dot (header "Open to work", About "Now", Bench note, review avatars with `.is-live`): `sh-pulse 2.2s ease-out infinite`, a box-shadow ring growing to 9px and fading (`70%{box-shadow:0 0 0 9px transparent}`), starting at 60% accent.
- Block caret after the logo and in headings: `sh-blink 1.15s steps(1) infinite` (opacity 0 at 50%).
- **Implementation:** CSS only. Both are infinite animations, so pause them under reduced motion (the global rule caps them at one iteration).

### 9. Button arrow swap / download drop
**What you see:** on hover, a button's arrow slides out to the right and a fresh one slides in from the left. On "Download CV" the icon drops out of the bottom and falls back in from the top. The fill colour also changes.
- **Parameters:** `.sh-btn` `transition: translate .35s cubic-bezier(.2,.8,.2,1), background-color .3s, border-color .3s, color .3s, scale .12s`. Arrow: two stacked SVGs; on hover the first goes to `translateX(34px)` and the second from −34px to 0, 0.45 s `cubic-bezier(.3,.9,.2,1)`. Download: `sh-drop .6s cubic-bezier(.3,.9,.2,1)` (40%: +22px, 41%: −22px, 100%: 0). Solid button hover background: lime → ink.
- **Implementation:** CSS only, in `ui/Button.astro`.

### 10. "More" link underline draw
- `.sh-more-l::after` 1px accent, scaleX 0→1 from the left, 0.35 s `cubic-bezier(.2,.7,.2,1)`. The number turns accent (0.25 s). The arrow nudges `translateX(3px)` (0.3 s). CSS only.

---

## Shared section reveal (applies to every section below)

### 11. Section reveal system
**What you see:** as each section scrolls in, a small `// eyebrow` fades up, the heading's words rise one by one out of invisible slots, and the lead text, links and items fade up after it in a short cascade.
- **Trigger:** an IntersectionObserver on the section root, which fires once. `threshold = clamp(0.005, min(T, 80 / sectionHeight))`, `rootMargin: 0px`. T is 0.16 by default, 0.1 for Work, 0.3 for the marquee and 0.08 for the footer. Reveals wait until `<html>` has no `sh-hold*` class (loader or transition), with a 9 s cap. **Keyboard:** if focus enters a section that hasn't revealed yet, it reveals instantly and all transitions inside are disabled (`[data-kb] *{transition:none!important}`), so tabbing never lands on invisible content.
- **Parameters:**
  - Eyebrow `.sh-eb`: opacity 0→1 0.7 s ease; translate 10px→0 0.8 s `cubic-bezier(.2,.8,.2,1)`.
  - Heading `.sh-hd`: each word sits in an `overflow:hidden` inline-block (padding `.08em .03em .16em`, negative margins). The inner span goes `translate: 0 110%` → 0, 0.8 s `cubic-bezier(.16,.84,.24,1)`, delay `60ms + 45ms × wordIndex` across lines. Words wrapped in `*…*` are lime. Lines are split on `|`.
  - Fade-rise helper (used for everything else): opacity 0→1 0.7 s ease, translate `Npx`→0 0.8 s `cubic-bezier(.16,.84,.24,1)`, with N = 18 by default.
  - Standard cascade: lead 200 ms · side block / "more" link 260 ms · lists start at about 300 ms (per-section staggers are listed below).
- **Reduced motion:** final state immediately (`.sh-hd-i{translate:0 0!important}`, `.sh-eb{opacity:1!important}`).
- **Implementation:** one shared `reveal.ts` (an IntersectionObserver that adds `.is-on` to `[data-reveal]` roots) plus CSS custom properties for the delays (`style="--dl:200ms"`). The word split can happen at build time in Astro, which avoids SplitText and layout shift. GSAP isn't needed. Gotcha: build the `aria-label` from the full sentence and mark the word spans `aria-hidden`, as the template does.

---

## Hero → `Hero.astro`

### 12. Hero intro
**What you see:** the big headline's words rise up one after another, then the tagline and buttons, then the three stats, and finally the "View source" button and the commit card fade in.
- **Trigger:** first animation frame after hydration (`.shh.is-live` gets `.is-in`). It doesn't wait for the loader (*see #1*).
- **Parameters:** words `.shh-wi` translateY 108%→0 over 1 s and opacity 0→1 over 0.6 s ease, both with `cubic-bezier(.16,.84,.24,1)` on the transform; delay `120 + 70 × wordIndex` ms; words sit in masks with padding `.06em .02em .12em`. Eyebrow, row and stats: opacity 0.8 s ease and translate 18px→0 0.9 s `cubic-bezier(.16,.84,.24,1)`. Delays: eyebrow 50 ms, row (sub + buttons) 500 ms, stats `620 + i × 90` ms. Toggle button opacity 0.8 s at 700 ms; commit card opacity 0.8 s at 900 ms.
- **Reduced motion:** `.shh *{animation:none!important;transition:none!important}`.
- **Implementation:** CSS transitions plus a class added by a small script. Our headline is server-rendered, so a pure CSS keyframe on load (like the template's `sh-hd-rise`, paused while `html[class*=sh-hold]`) works without waiting for JS.

### 13. Count-up numbers
**What you see:** stat numbers tick up from 0 to their value.
- **Parameters:** ease-out cubic `1 − (1 − t)³`. Hero stats: 1400 ms starting with the hero intro. Bench scores: 900 ms on reveal. It parses a prefix, number and suffix, keeps the decimal places and thousands commas, and puts the real value in `aria-label`.
- **Reduced motion:** final value.
- **Implementation:** about 20 lines of vanilla JS, or `gsap.to(obj,{val, duration:1.4, ease:'power3.out', snap:{val:1}})`. Reserve width with `font-variant-numeric: tabular-nums` to avoid jitter.

### 14. Portrait "source code" canvas — D, P (signature effect)
**What you see:** the portrait starts as a field of code characters shaped like the photo. A lime scan line sweeps down and "compiles" it into the real photograph. Moving the mouse over the picture turns a soft circle of it back into code. "View source" turns the whole picture into code with another sweep. When nobody touches it, a diagonal shimmer of code crosses the picture now and then.
- **Trigger:** image and mono font loaded (initial sweep); pointer move (lens); button click (toggle); idle timer (glint). It only runs while the hero is ≥5% visible (IntersectionObserver `threshold: .05`); otherwise the rAF stops.
- **Parameters:**
  - Grid: cell width 10px (6px if the picture is under 520px wide) × twice that in height. Canvas at DPR capped at 1.5. Glyphs are `700 (cell×1.55)px` mono, taken in order from a TSX code string (prop `code`).
  - Luminance: the image is drawn cover-fit to the grid (focus 50% / 18%), luma = .299R + .587G + .114B, normalised to min–max, then `^0.62`. Each cell paints a bone block at alpha ≤ 0.84, then a glyph: ink if luma > 0.66 or on the scan row, lime otherwise; glyph alpha `0.1 + 0.9 × luma`.
  - Sweep: easeInOutCubic over 2400 ms initially and 900 ms on toggle. Rows flip state as the line passes and fade at a lerp of `min(1, dt × 9)`. Line: 1.5px lime at 0.9 alpha.
  - Hover lens: radius 136px (80px on small screens), strength `min(1, (1 − d²/r²) × 1.6)`, decaying at 1.05 per second; it stays active for 2400 ms after the last move. Touch: `pointerdown` shows the lens for 500 ms.
  - Idle glint: after 5200 ms with nothing animating (render mode only), a diagonal band 5 cells wide (strength 0.85) crosses the grid in about 1.5 s, then the timer re-arms, so it repeats indefinitely.
  - Toggle button: `aria-pressed`, label "View source" / "View render", cursor label "decompile" / "compile".
- **Reduced motion:** canvas not started; plain photo.
- **Implementation:** a standalone vanilla canvas module (about 200 lines), loaded with `client:visible`-style lazy init. The image must be same-origin or CORS-enabled for `getImageData`; the template falls back to noise. Gotchas: every frame redraws every cell (about 2,800 cells at 1440px) whenever anything is moving (P). Stop the rAF when idle or offscreen, as the template does. Wait for `document.fonts.load` before drawing.

### 15. Hero local cursor + magnetic buttons — D, U
**What you see:** inside the hero the same lime-dot-and-label cursor appears, and the two main buttons lean toward the pointer as it moves over them.
- **Parameters:** the follower is local to the hero (absolute, z 9) with the same 0.28 lerp; `.shh.is-fine` hides the system cursor. Magnet: on the `.shh-key` under the pointer, `translate = ((x − cx) × 0.16, (y − cy) × 0.22)` px, reset on leave, smoothed by the button's `translate .35s cubic-bezier(.2,.8,.2,1)` transition.
- **Implementation:** if #4 is adopted, skip the duplicate hero cursor; the magnet is about 15 lines (or `gsap.quickTo`). Fine pointer only.

The hero commit card's hover lift is covered in #27.

---

## Shipped for → `ShippedFor.astro`

### 16. Client marquee — D
**What you see:** client names glide slowly and endlessly to the left, fading out at both edges, and pause when hovered.
- **Parameters:** the list is repeated until it has ≥10 items (8 defaults → 16), and two identical halves slide `translate3d(0→−50%)` linearly and infinitely. Duration = `items × 26 / speed` s with speed 5, so **83.2 s** for the default 16. Edge mask: `linear-gradient(90deg, transparent 0, #000 9%, …)`. `:hover` → `animation-play-state:paused`. Name colour → fg on hover (0.3 s). Reveal threshold 0.3: the track fades up 10px at 120 ms and the facts row at 220 ms.
- **Reduced motion:** static, wrapped row (`animation:none`).
- **Implementation:** CSS only. Gotcha: duplicate the set with `aria-hidden="true"` on the copy, and offer a pause control if the motion runs longer than 5 s (WCAG 2.2.2).

---

## Work → `Work.astro`

### 17. Title "compile" scramble — D
**What you see:** a project title briefly appears as lime code symbols that resolve into the real name from left to right.
- **Parameters:** same algorithm as the loader: 700 ms, re-roll every 45 ms, symbols `<>/{}[]()=+*#;:01`, scrambled part in mono and accent colour over the hidden real text (so there's no layout shift). Fires per card when that card intersects (`rootMargin: 0px 0px -12% 0px`, `threshold: .12`).
- **Implementation:** a shared vanilla `scramble(el, ms)`. GSAP's ScrambleText plugin is an alternative, but it changes the text node (keep the real text for screen readers).

### 18. Before → after metric diff
**What you see:** on each card the old number gets struck through by a violet line, an arrow fades in, then the new number rises in lime.
- **Parameters:** base delay `--dl: 320ms`. Strike `s::after` 2px violet, scaleX 0→1, 0.45 s `cubic-bezier(.2,.8,.2,1)` at `--dl`. Arrow opacity 0.3 s at `--dl + .3s`. New value opacity 0.35 s and translate `.3em`→0 0.45 s at `--dl + .42s`. Screen-reader words "from"/"to" are injected.
- **Implementation:** CSS only (toggle `.is-on`).

### 19. Stacking project deck — P
**What you see:** project cards pin near the top of the screen as you scroll. Each new card slides up over the previous one, which shrinks slightly and darkens, with a 14px sliver of each earlier card peeking out above.
- **Trigger:** scroll position. Enabled only when there is more than one card, not on phones, and when a card fits the viewport (`cardHeight ≤ innerHeight − 72 − (n−1)×14 − 12`).
- **Parameters:** `li{position:sticky; top: calc(72px + i × 14px); z-index: 1 + i}` (`--top` 72px, `--step` 14px). For card n, `k = Σ over later cards m of clamp(1 − (top_m − stickyTop_m) / (height_m × 0.92))`. Card `scale: 1 − k × 0.04` (origin top centre). Dim overlay `opacity: min(.62, k × .3)`. Text blocks of a card hide (`opacity 0`, 0.12 s) as soon as the next card's top passes their bottom edge (avoids see-through overlaps) and come back with 0.25 s. Cards that are fully covered (`k > .985`) get `pointer-events:none`. Tabbing into a covered card jumps the scroll so it's on top. Card min height = `clamp(440, vh − 72 − (n−1)×14 − 36, 640)` (760 on tablet). Cards also fade up 24px at `min(i,2) × 90` ms.
- **Reduced motion:** `scale:1`, no dim; a normal list.
- **Implementation:** CSS `position:sticky` does the pinning. Scale and dim need a scroll-linked script: GSAP ScrollTrigger with `scrub` per card, or CSS `animation-timeline: view()` (not in Safari yet, so it needs a fallback). The template reads layout in a shared rAF loop that runs every frame. Gotcha: don't put `overflow:hidden` on any ancestor (it breaks sticky); the template uses a flex column, not a grid.

### 20. Card image hover zoom — D
- `.shwk-media:hover img{scale:1.03}`, 0.9 s `cubic-bezier(.2,.8,.2,1)`. CSS only.

---

## About + Now → `About.astro`

### 21. Statement words light up on scroll — P
**What you see:** the big About sentence starts dim grey, and words turn white (accent words lime) one by one as you scroll through it.
- **Trigger:** scroll position, while the block is within `rootMargin: 20% 0px 20% 0px`.
- **Parameters:** progress `p = clamp((0.78·vh − top) / (0.78·vh − 0.46·vh + height))`, so lighting starts when the block's top reaches 78% of the viewport and finishes when its bottom reaches 46%. `litCount = round(p × words)`. Unlit colour `color-mix(ink 56%, bone)`. Each word's colour transitions 0.45 s ease. It is reversible (it un-lights when scrolling back up). The statement fades up 14px at 80 ms, the photo 22px at 240 ms, and the Now list at 320 ms.
- **Reduced motion:** all words at full colour.
- **Implementation:** split words at build time, then use GSAP ScrollTrigger (`start:'top 78%'`, `end:'bottom 46%'`, `scrub`) or a small scroll handler. Toggle classes rather than tweening colour, to keep per-frame work tiny.

---

## Numbers → `Numbers.astro`

### 22. Score rings + vitals bars draw
**What you see:** on the lime band, each Lighthouse score's ring arc sweeps round to its value while the number counts up. Then the Core Web Vitals bars grow from the left in turn.
- **Parameters:** SVG circle r=82, `pathLength=100`, `stroke-dasharray:100 100`, `stroke-dashoffset` 100 → `100 − score`, 0.9 s `cubic-bezier(.2,.8,.2,1)`, delay `200 + i × 110` ms. Cells fade up at `120 + i × 80` ms. Number count-up is 900 ms (#13). The vitals plate fades in at 380 ms. Each bar `scaleX(0→1)` (origin left), 0.9 s same curve, delay `460 + i × 120` ms, width = value/budget (min 1.5%), with `.is-over` when it exceeds budget.
- **Reduced motion:** final state (`.is-rm` kills transitions).
- **Implementation:** CSS transitions keyed off `.is-on`, plus the count-up script.

---

## Keys → `Keys.astro`

### 23. Keycap board press + readout swap
**What you see:** keys fade up in a fast ripple. Pointing at, tabbing to or tapping a key "presses" it (it turns lime and sinks 2px), and the side panel crossfades to that tool's name, years bar and note.
- **Parameters:** key entrance: fade-rise 10px at `300 + min(i,20) × 14` ms. Key transitions: background and colour 0.2 s, translate 0.2 s `cubic-bezier(.2,.8,.2,1)`. Selected: lime, `translate:0 2px`, inset lip shadow. `:active` sinks 3px. Selection follows `pointerenter` (mouse only), `focus` and `click`. Readout: all panels stacked in one grid cell (`.sh-swap`), opacity crossfade 0.25 s with visibility. Readout plate fades in at 380 ms.
- **Implementation:** CSS plus about 15 lines of JS. Gotcha: the stacked-cell technique reserves the tallest panel's height, so there's no layout jump.

---

## Services → `Services.astro`

### 24. Services accordion
**What you see:** clicking a service row smoothly opens its details, the plus icon turns into an X on a lime square, and the row number turns lime. Only one row is open at a time, and the first starts open.
- **Parameters:** panel `grid-template-rows: 0fr → 1fr`, 0.55 s `cubic-bezier(.2,.8,.2,1)`, with visibility hidden while closed (removes it from the tab order). Content opacity 0.35 s ease and translate −8px→0 0.5 s, delayed 0.12 s on open. Icon `rotate:45deg` 0.45 s; icon background, colour and border 0.3 s. Rows fade up at `300 + i × 80` ms.
- **Reduced motion:** instant.
- **Implementation:** CSS only, plus a toggle script, or `<details name="services">` for native exclusivity (the grid-rows animation needs a wrapper, because `<details>` content can't animate height without `::details-content` / `interpolate-size`).

---

## Timeline → `Timeline.astro`

### 25. Career branch line draws on scroll — P
**What you see:** a vertical "git branch" line fills with lime as you scroll down the career list, and each commit dot pops and fills lime as the line reaches it.
- **Parameters:** progress `p = clamp((0.64·vh − top) / height)` (forced to 1 at the page bottom). It is **monotonic** (never un-draws: `s = max(s, p)`), smoothed at `o += (s − o) × 0.14` per frame. Line fill `transform: scaleY(var(--lg))` (origin top). A node lights when the fill reaches its offset: lime fill, 5px 16% halo, `scale 1.12`, with background and shadow 0.35 s and scale 0.45 s `cubic-bezier(.2,1.6,.4,1)` (overshoot). Rows fade up 12px at `300/340/380 + i × 70` ms.
- **Reduced motion / no JS:** `.is-final`, fully drawn and all nodes lit.
- **Implementation:** GSAP ScrollTrigger `scrub` on scaleY plus `onUpdate` for the node classes, or a small rAF handler. CSS `animation-timeline: view()` covers the line where supported.

---

## Lab → `Lab.astro`

### 26. Lab rail: drag, inertia, wheel, progress bar — U
**What you see:** a horizontal row of project cards you can drag with the mouse (it keeps gliding after you let go), scroll sideways with a trackpad, or step through with arrow buttons. A thin lime bar shows where you are. Cards cut off at the screen edge hide their text.
- **Parameters:**
  - Drag (mouse only): it starts after 6px of movement (`.is-drag`, `cursor:grabbing`, snapping off). Release velocity (px/ms, valid if the last move was under 80 ms ago and speed > 0.25) × 16 sets the initial step, which decays ×0.93 per frame until below 0.4px. Clicks within 350 ms after a drag are swallowed; native image drag is prevented.
  - Wheel: a mostly horizontal delta (or Shift + wheel) scrolls the rail; vertical wheel passes to the page.
  - Arrows: `scrollBy(cardWidth + 20, smooth)` and disabled at the ends (opacity .38); hover turns lime; `:active scale .96`.
  - Snap: `scroll-snap-type:x mandatory` on coarse pointers and phones only.
  - Progress: `--f = clientWidth / scrollWidth` (thumb width), `--p = scrollLeft / max`; the thumb is translated, not animated. Hidden when everything fits.
  - Edge cards: `.is-cut` when the card crosses 4px from the viewport edge, so its body and kind label go to opacity 0 (0.25 s).
  - Cards fade up at `300 + min(i,5) × 70` ms.
- **Implementation:** native `overflow-x:auto` plus about 80 lines of vanilla JS (GSAP Draggable + InertiaPlugin is an alternative). Gotcha: hijacking wheel events (`passive:false`) can feel wrong on some trackpads (U). Keep keyboard focus scrolling: ShSmooth keeps a focused element 24px inside any horizontal scroller.

### 27. Card hover lift
- Lab cards, Writing feature card and hero commit card: `translate:0 −4px` (0.45–0.5 s `cubic-bezier(.2,.8,.2,1)`) plus an accent inset 1px ring (0.3 s). Lab image filter `grayscale(.55) brightness(.62) contrast(1.08)` → `grayscale(.1) brightness(.84) contrast(1.04)` with the night veil fading out (0.5 s). Card arrow nudges 3–4px (0.3 s). CSS only; reduced motion disables the lift.

---

## Reviews → `Reviews.astro`

### 28. Review "diff line" hover — D
**What you see:** reviews sit in a code-file sheet with line numbers. Hovering one draws a lime bar down its left edge and gives it a faint lime wash, like an added line in a diff.
- **Parameters:** `::after` 2px accent, scaleY 0→1 (origin top), 0.45 s `cubic-bezier(.2,.8,.2,1)`; background `color-mix(accent 5%)` 0.3 s. Hover-capable devices only. The sheet fades up at 260 ms.
- **Implementation:** CSS only.

---

## Writing → `Writing.astro`

### 29. Writing row slide
- Rows: `padding-left` 4→14px (0.4 s `cubic-bezier(.2,.8,.2,1)`) plus a `cloud 70%` background (0.3 s); the arrow turns accent. The feature card lifts (#27). Reveal: list plate at 300 ms, feature at 340 ms, rows at `380 + i × 60` ms. CSS only.

---

## FAQ → `Faq.astro`

### 30. FAQ accordion
- Same pattern as #24. Answer `grid-template-rows 0fr→1fr` 0.5 s `cubic-bezier(.2,.8,.2,1)`; text opacity 0.35 s on close and 0.5 s with a .12 s delay on open. The plus folds to a minus (the second bar `rotate→0deg`, 0.45 s), and its square goes lime when open. Question text nudges `translate:6px 0` on hover (0.4 s; off on phones). One open at a time, first open by default. Rows fade up at `240 + i × 50` ms.

---

## Contact brief → `Contact.astro`

### 31. Brief value flash — D
**What you see:** choosing a project type or budget chip turns it lime, and the value appears in the code-style brief preview with a brief violet highlight that fades out.
- **Parameters:** chip background, colour and ring 0.25 s. Preview value re-mounts on change (keyed) and plays `shct-set .7s ease-out 1`: from a violet 55% background + 3px ring to transparent. Inputs: ring colour on hover, 0.25 s.
- **Implementation:** CSS keyframe; restart it by removing and re-adding the class (`el.offsetWidth` reflow) or by replacing the node.

---

## Footer → `site/Footer.astro`

### 32. Footer wordmark compile + link underlines — D
**What you see:** the giant name across the bottom is sized to fill the width exactly. When it scrolls into view, each letter flickers as a lime code symbol and the real letters resolve left to right.
- **Parameters:** fit: `fontSize = floor(containerWidth / measuredWidth × currentSize × 10) / 10`, min 12px, re-run on resize and `document.fonts.ready`. Compile: IntersectionObserver `threshold: .3`, once (or on `focusin`), 850 ms linear, symbol frames every 55 ms (deterministic index `(i×7 + frame×5 + (i×frame)%3) % 17` into `<>/{}[]()=+*#;:01`), real letter cross-fade 0.18 s. Letters are hidden (`opacity:0`) until triggered. Footer blocks fade up at 0 and 120 ms.
  - Links: underline grows via `background-size 0→100% 1px`, 0.35 s `cubic-bezier(.2,.8,.2,1)`. The email underline thickens 1px→3px (0.4 s). The external-link arrow nudges `2px,−2px`. The local clock updates each minute (no motion).
- **Reduced motion / no JS:** letters shown immediately.
- **Implementation:** CSS plus the shared scramble. Gotcha: with `opacity:0` before the trigger, the name is invisible without JS, so add the hidden state only from JS.

---

## Present in the CSS but not used on Home
- `.sh-rev` "curtain" (a section stays sticky while the next one lifts off it, with shadow and darkening via `--rv`): CSS ships, but no element uses it on Home.
- `.sh-um` image unmask (clip-path 0.9 s `cubic-bezier(.7,0,.2,1)`, scale 1.04→1) with parallax `translate: (--sp − .5) × −7%`: never instantiated on Home, and `--sp` is static.
- `.sh-roll` odometer digits (0.55 s `cubic-bezier(.3,.9,.3,1)`) and `.sh-rule-x/y` drawing hairlines (0.9 s): defined, not used on Home.
- SoloFoundry demo bar (keyframes `rise`, `kb`, `sfp`, `ctin`/`ctout`, `wb`, `br`/`brs`, `sh`, `nd`): the vendor's "Get template" sales bar, which only appears on the template's demo host. **Not part of the template; ignore.**

## Cross-cutting notes for our build
- **One ticker.** The template runs a single global rAF loop (`window.__ovTick`) that never stops once any scroll effect subscribes (deck, About scrub, timeline, Lenis), which costs performance. With GSAP, use `gsap.ticker` and ScrollTrigger, which sleep when idle; with vanilla, only run rAF while something changes.
- **Gate on the loader.** Reveals check for `html[class*="sh-hold"]` before firing. Mirror this so first-visit reveals don't play under the cover.
- **Lazy image warm-up (not motion):** ShSmooth switches up to 8 `loading="lazy"` images within 2.5 viewports to eager on idle (first run at 900 ms, then on scroll) so cards are decoded before they slide in. Astro `<Image loading="eager">` on the first deck cards does the same job.
- **Shared curves:** `cubic-bezier(.2,.8,.2,1)` (UI, hovers), `cubic-bezier(.16,.84,.24,1)` (reveals), `cubic-bezier(.65,0,.25,1)` (wipes), `cubic-bezier(.3,.9,.2,1)` (button icons). Define them once as CSS variables / GSAP `CustomEase`.
