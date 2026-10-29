// #11 Section reveal system (docs/framer-animations.md). Load once per page; it re-inits on every
// Astro page load. Markup API:
//   data-reveal                fade-rise (opacity .7s ease, rise 18px over .8s on the reveal curve)
//   data-reveal="eyebrow"      the "// label" reveal (opacity .7s, rise 10px over .8s on the UI curve)
//   data-reveal="words"        heading words rise out of clipped slots (60ms + 45ms × word); inner
//                              spans (coral words, line spans) are kept; the heading gets an aria-label
//   data-reveal-stagger="ms"   on a container: its direct children fade-rise in turn (default step 80ms)
//   data-reveal-delay="ms"     extra delay before the element / first child / first word (default 0)
//   data-reveal-y="px"         rise distance for fade-rise and stagger children (default 18, eyebrow 10)
//   data-reveal-max="n"        stagger: cap the step index, e.g. 20 for the 16-key board
// Each element plays once, when it scrolls into view, after the loader lifts (`ready()`, 9 s cap).
// Elements already scrolled past show instantly. Keyboard focus entering a section shows everything
// in it instantly. Reduced motion or no JS: nothing is ever hidden.
import './reveal.css';
import { reducedMotion } from './core';
import { onPage, readyCapped } from './page';

const DURATION = 800; // longest transition (transform .8s)
const ROOT_MARGIN = '0px 0px -40px 0px';
const num = (v: string | null | undefined, d: number) => (v != null && v !== '' && !isNaN(+v) ? +v : d);

/**
 * Calls `onEnter(el, instant)` once per element when it scrolls into view, after `ready()`.
 * `instant` is true when the element was already above the viewport. Returns a cancel function.
 */
export function observeOnce(els: Element[], onEnter: (el: Element, instant: boolean) => void): () => void {
  let io: IntersectionObserver | null = null;
  let alive = true;
  readyCapped().then(() => {
    if (!alive) return;
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const above = e.boundingClientRect.bottom <= 0;
          if (!e.isIntersecting && !above) continue;
          io?.unobserve(e.target);
          onEnter(e.target, above);
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 },
    );
    els.forEach((el) => io!.observe(el));
  });
  return () => {
    alive = false;
    io?.disconnect();
  };
}

/** Run `cb` once when `el` scrolls into view (same trigger and loader gating as the reveals). */
export function whenRevealed(el: Element, cb: (instant: boolean) => void): () => void {
  return observeOnce([el], (_el, instant) => cb(instant));
}

/** Wrap every word of `root` in a clipped slot, keeping inner elements. Returns the word count. */
function splitWords(root: HTMLElement, base: number): number {
  let i = 0;
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (child.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(part);
            continue;
          }
          const slot = document.createElement('span');
          slot.className = 'rv-w';
          slot.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.className = 'rv-wi';
          inner.style.setProperty('--rv-dl', `${base + 60 + 45 * i++}ms`);
          inner.textContent = part;
          slot.append(inner);
          frag.append(slot);
        }
        child.replaceWith(frag);
      } else if (child instanceof HTMLElement && !child.matches('.sr-only, br, svg')) {
        walk(child);
      }
    }
  };
  walk(root);
  return i;
}

type Pending = { finish: () => void; play: () => void };

onPage(() => {
  if (reducedMotion()) return;
  const els = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]')];
  if (!els.length) return;

  const html = document.documentElement;
  const pending = new Map<Element, Pending>();
  const timers = new Set<number>();

  for (const el of els) {
    const delay = num(el.dataset.revealDelay, 0);
    if (el.dataset.revealY) el.style.setProperty('--rv-y', `${num(el.dataset.revealY, 18)}px`);
    let total = delay + DURATION;
    let undo = () => {};

    if (el.hasAttribute('data-reveal-stagger')) {
      const step = num(el.dataset.revealStagger, 80);
      const max = num(el.dataset.revealMax, Infinity);
      const kids = [...el.children] as HTMLElement[];
      kids.forEach((k, i) => k.style.setProperty('--rv-dl', `${delay + step * Math.min(i, max)}ms`));
      total = delay + step * Math.min(Math.max(kids.length - 1, 0), max) + DURATION;
      undo = () => kids.forEach((k) => k.style.removeProperty('--rv-dl'));
    } else if (el.dataset.reveal === 'words') {
      if (el.querySelector('.rv-w')) continue; // already split (stale DOM)
      const original = el.innerHTML;
      const hadLabel = el.hasAttribute('aria-label');
      if (!hadLabel) el.setAttribute('aria-label', (el.textContent ?? '').replace(/\s+/g, ' ').trim());
      const n = splitWords(el, delay);
      total = delay + 60 + 45 * Math.max(n - 1, 0) + DURATION;
      // Once risen, put the original markup back so the heading ends exactly as designed.
      undo = () => {
        el.innerHTML = original;
        if (!hadLabel) el.removeAttribute('aria-label');
      };
    } else {
      el.style.setProperty('--rv-dl', `${delay}ms`);
      undo = () => el.style.removeProperty('--rv-dl');
    }

    const finish = () => {
      if (!pending.has(el)) return;
      pending.delete(el);
      el.classList.remove('rv-in');
      el.classList.add('rv-done');
      el.style.removeProperty('--rv-y');
      undo();
    };
    const play = () => {
      el.classList.add('rv-in');
      const t = window.setTimeout(() => {
        timers.delete(t);
        finish();
      }, total + 60);
      timers.add(t);
    };
    pending.set(el, { finish, play });
  }

  html.classList.add('rv-on');

  const cancel = observeOnce([...pending.keys()], (el, instant) => {
    const p = pending.get(el);
    if (!p) return;
    if (instant) p.finish();
    else requestAnimationFrame(() => p.play()); // let the hidden state paint before transitioning
  });

  // Keyboard: focus entering a section shows everything in it at once, so focus never lands on hidden content.
  const onFocus = (e: FocusEvent) => {
    const t = e.target as Element | null;
    if (!t || !pending.size) return;
    const section = t.closest('section');
    for (const [el, p] of pending) {
      if (el.contains(t) || (section && el.closest('section') === section)) p.finish();
    }
  };
  document.addEventListener('focusin', onFocus);

  return () => {
    cancel();
    document.removeEventListener('focusin', onFocus);
    timers.forEach((t) => clearTimeout(t));
    pending.forEach((p) => p.finish());
    html.classList.remove('rv-on');
  };
});
