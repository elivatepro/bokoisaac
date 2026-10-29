// #2 Page-transition wipe on ClientRouter navigations: a dark panel drops down behind a coral scan line,
// the page swaps underneath, then the panel drains downward (same lift as the loader).
// Only for link clicks to another path; skipped for reduced motion, back/forward, [data-no-trans] and
// anything ClientRouter itself ignores (modifier keys, target, download, data-astro-reload, other origins).
import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';
import { reducedMotion } from '../motion/core';
import { CLOSE_MS, clearPanel, lift, panel } from './panel';

const html = document.documentElement;
let covering = false;
let navigated = false;
let failsafe = 0;

document.addEventListener('astro:before-preparation', (ev) => {
  const e = ev as TransitionBeforePreparationEvent;
  navigated = true;
  const src = e.sourceElement;
  const el = panel();
  if (
    !el ||
    reducedMotion() ||
    e.navigationType === 'traverse' ||
    !(src instanceof HTMLAnchorElement) ||
    src.closest('[data-no-trans]') ||
    e.to.pathname === e.from.pathname
  )
    return;

  const load = e.loader;
  e.loader = async () => {
    covering = true;
    html.classList.add('is-holding');
    el.classList.remove('is-lift', 'is-boot', 'is-cover');
    void el.offsetWidth; // restart the close animation
    el.classList.add('is-leave');
    await Promise.all([load(), new Promise((r) => window.setTimeout(r, CLOSE_MS))]);
  };
});

document.addEventListener('astro:before-swap', (ev) => {
  if (!covering) return;
  // The new <html> attributes replace ours on swap: carry is-holding over so reveals keep waiting.
  (ev as TransitionBeforeSwapEvent).newDocument.documentElement.classList.add('is-holding');
  // Fully covered and static (moving the persisted node would restart the close animation).
  const el = panel();
  el?.classList.remove('is-leave');
  el?.classList.add('is-cover');
});

document.addEventListener('astro:page-load', () => {
  if (navigated) {
    // Move focus to the new page's content (ClientRouter leaves it on the old link / body).
    if (!location.hash) document.getElementById('main')?.focus({ preventScroll: true });
  }
  if (!covering) return;
  window.clearTimeout(failsafe);
  const done = () => {
    window.clearTimeout(failsafe);
    if (!covering) return;
    covering = false;
    lift();
  };
  window.setTimeout(done, 70);
  failsafe = window.setTimeout(done, 3000);
});

// Navigation failed or was aborted while covering: uncover.
document.addEventListener('astro:after-preparation', () => {
  if (!covering) return;
  window.clearTimeout(failsafe);
  failsafe = window.setTimeout(() => {
    if (covering) {
      covering = false;
      lift();
    }
  }, 3000);
});

// Back/forward cache restore: clear everything.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    covering = false;
    clearPanel();
  }
});
