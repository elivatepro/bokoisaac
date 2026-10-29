// Helpers shared by the reveal system and the Home section scripts.
import { CustomEase } from 'gsap/CustomEase';
import { gsap, onPageLoad, ready } from './core';

gsap.registerPlugin(CustomEase);

// The template's curves (docs/framer-animations.md, "Shared curves").
export const EASE_UI = CustomEase.create('sh-ui', '.2,.8,.2,1');
export const EASE_REVEAL = CustomEase.create('sh-reveal', '.16,.84,.24,1');

/**
 * `onPageLoad` from core, plus a fallback for pages rendered without <ClientRouter />,
 * where `astro:page-load` never fires.
 */
export function onPage(setup: () => void | (() => void)): void {
  if (document.querySelector('meta[name="astro-view-transitions-enabled"]')) return onPageLoad(setup);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setup(), { once: true });
  else setup();
}

/** `ready()` with the template's 9 s cap, so a stuck loader never leaves content hidden. */
export function readyCapped(cap = 9000): Promise<void> {
  return Promise.race([ready(), new Promise<void>((r) => setTimeout(r, cap))]);
}
