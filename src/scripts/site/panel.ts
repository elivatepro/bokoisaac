// The full-screen panel (#shl in layouts/Base.astro) shared by the boot loader (#1) and the page-transition
// wipe (#2). It is `transition:persist`ed, so it survives ClientRouter swaps.
import { release } from '../motion/core';

export const LIFT_MS = 500; // shl-open / shl-run, cubic-bezier(.65,0,.25,1)
export const CLOSE_MS = 520; // navigation happens 520ms into the 500ms close
const REMOVE_MS = 560; // panel removed 560ms after the lift starts

export const panel = () => document.getElementById('shl');

let liftTimer = 0;

/** Drain the panel downward behind the scan line, uncover the page and release `is-holding`. */
export function lift(onDone?: () => void): void {
  const el = panel();
  const html = document.documentElement;
  if (!el) {
    html.classList.remove('shl-go');
    release();
    onDone?.();
    return;
  }
  window.clearTimeout(liftTimer);
  // Keep the boot look (text + bar) while it drains; shl-go is removed so scroll unlocks.
  if (html.classList.contains('shl-go')) el.classList.add('is-boot');
  html.classList.remove('shl-go');
  el.classList.remove('is-leave', 'is-cover');
  el.classList.add('is-lift');
  el.setAttribute('aria-hidden', 'true');
  release();
  liftTimer = window.setTimeout(() => {
    el.classList.remove('is-lift', 'is-boot', 'is-run');
    onDone?.();
  }, REMOVE_MS);
}

/** Reset everything (bfcache restore, failsafes). */
export function clearPanel(): void {
  window.clearTimeout(liftTimer);
  document.documentElement.classList.remove('shl-go');
  panel()?.classList.remove('is-lift', 'is-boot', 'is-run', 'is-leave', 'is-cover');
  panel()?.setAttribute('aria-hidden', 'true');
  release();
}
