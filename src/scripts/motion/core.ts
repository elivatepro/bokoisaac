// Shared motion setup. Every animation script imports from here so GSAP, ScrollTrigger and the
// smooth-scroll instance are registered once, and so all motion respects reduced-motion and the loader.
//
// Contract (see docs/framer-animations.md for the specs):
// - Pages use Astro's <ClientRouter />, so scripts must start on `onPageLoad(fn)` (runs on every
//   navigation) and undo listeners/tweens in the cleanup function fn returns.
// - While the boot loader or page-transition panel covers the page, <html> has class `is-holding`.
//   Call `await ready()` before starting entrance animations; it resolves when the page is uncovered.
// - `reducedMotion()` true => skip animations and leave elements in their final state.
// - Smooth scroll: site/smooth.ts creates Lenis and calls setLenis(); others read getLenis() (may be null).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

/** Resolves once no loader/transition panel covers the page. */
export function ready(): Promise<void> {
  if (!document.documentElement.classList.contains('is-holding')) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener('site:ready', () => resolve(), { once: true }));
}

/** Call when the loader/transition panel has lifted. */
export function release(): void {
  document.documentElement.classList.remove('is-holding');
  window.dispatchEvent(new Event('site:ready'));
}

/** Run `setup` on every page load (initial + client-side navigations); its return value runs before the next swap. */
export function onPageLoad(setup: () => void | (() => void)): void {
  let cleanup: void | (() => void);
  document.addEventListener('astro:page-load', () => {
    cleanup = setup();
  });
  document.addEventListener('astro:before-swap', () => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = undefined;
  });
}
