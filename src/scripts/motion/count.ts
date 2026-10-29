// #13 Count-up numbers: ease-out cubic from 0 to the element's own value. Keeps prefix/suffix,
// decimal places and thousands commas; screen readers get the real value the whole time.
import { gsap } from './core';

type Parsed = { prefix: string; value: number; decimals: number; commas: boolean; suffix: string };

function parse(text: string): Parsed | null {
  const m = text.trim().match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
  if (!m) return null;
  const raw = m[2];
  return {
    prefix: m[1],
    value: parseFloat(raw.replace(/,/g, '')),
    decimals: raw.includes('.') ? raw.split('.')[1].length : 0,
    commas: raw.includes(','),
    suffix: m[3],
  };
}

function format(p: Parsed, n: number): string {
  const s = n.toLocaleString('en-US', {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: p.commas,
  });
  return p.prefix + s + p.suffix;
}

export type Counter = { play: (delayMs?: number) => void; restore: () => void };

/**
 * Puts `el` at its zero state now (the real text stays in a visually hidden span) and returns
 * `play`, which counts up and then restores the original markup exactly.
 */
export function counter(el: HTMLElement, durationMs: number): Counter | null {
  const original = el.innerHTML;
  const p = parse(el.textContent ?? '');
  if (!p) return null;

  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  const real = document.createElement('span');
  real.className = 'sr-only';
  real.textContent = el.textContent;
  shown.textContent = format(p, 0);
  el.replaceChildren(shown, real);

  let tween: gsap.core.Tween | null = null;
  let done = false;
  const restore = () => {
    if (done) return;
    done = true;
    tween?.kill();
    el.innerHTML = original;
  };
  const play = (delayMs = 0) => {
    const o = { v: 0 };
    tween = gsap.to(o, {
      v: p.value,
      duration: durationMs / 1000,
      delay: delayMs / 1000,
      ease: 'power2.out', // GSAP power2 = cubic: 1 − (1 − t)³
      onUpdate: () => (shown.textContent = format(p, o.v)),
      onComplete: restore,
    });
  };
  return { play, restore };
}
