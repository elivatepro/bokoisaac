// #4 Coral cursor with labels. Fine pointers only (mouse/pen), never with reduced motion or on touch.
//
// Convention for every component: add `data-cursor="Label"` to any element (usually a link, button or
// card) to show that label in a pill next to the dot while the pointer is over it, e.g.
//   <a href="/work/x" data-cursor="Open case">…</a>   <button data-cursor="Expand">…</button>
// Nested elements inherit the nearest ancestor's label; `data-cursor=""` suppresses an inherited one.
// Over anything clickable the dot shrinks. The native cursor is hidden while this runs, except in text
// fields (global.css keeps the I-beam there and the dot hides).
//
// The #cursor element is `transition:persist`ed in Base.astro, so this module initialises once and
// survives ClientRouter navigations; the html.has-cursor class is carried across swaps.
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

const PRESS = 'a,button,[role=button],summary,label,input,select,textarea,[data-cursor]';
const FIELD = 'input:not([type=checkbox],[type=radio],[type=range],[type=submit],[type=button]),textarea,select,[contenteditable=true]';
const html = document.documentElement;
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const calm = matchMedia('(prefers-reduced-motion: reduce)');

let el: HTMLElement | null = null;
let label: HTMLElement | null = null;
let enabled = false;
let x = 0,
  y = 0,
  tx = 0,
  ty = 0,
  frame = 0,
  seen = false,
  lastLabel = '';

const step = () => {
  x += (tx - x) * 0.28;
  y += (ty - y) * 0.28;
  if (Math.abs(tx - x) <= 0.3 && Math.abs(ty - y) <= 0.3) {
    x = tx;
    y = ty;
    frame = 0;
  } else frame = requestAnimationFrame(step);
  el!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
};

const show = (on: boolean) => el?.classList.toggle('is-on', on);

const setTarget = (t: Element | null) => {
  if (!el || !label) return;
  const field = !!t?.closest(FIELD);
  show(seen && !field);
  el.classList.toggle('is-press', !!t?.closest(PRESS));
  const text = t?.closest('[data-cursor]')?.getAttribute('data-cursor')?.trim() ?? '';
  if (text) {
    if (text !== lastLabel) label.textContent = text;
    lastLabel = text;
  }
  el.classList.toggle('has-label', !!text);
};

const onMove = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return;
  tx = e.clientX;
  ty = e.clientY;
  if (!seen) {
    seen = true;
    x = tx;
    y = ty;
  }
  setTarget(e.target as Element);
  if (!frame) frame = requestAnimationFrame(step);
};
const onOver = (e: PointerEvent) => e.pointerType !== 'touch' && setTarget(e.target as Element);
const onLeave = (e: MouseEvent) => {
  if (!e.relatedTarget) show(false);
};
const hide = () => show(false);

function enable() {
  el = document.getElementById('cursor');
  label = el?.querySelector('.cur-label') ?? null;
  if (!el || enabled) return;
  enabled = true;
  html.classList.add('has-cursor');
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('mouseout', onLeave);
  window.addEventListener('blur', hide);
}

function disable() {
  if (!enabled) return;
  enabled = false;
  seen = false;
  html.classList.remove('has-cursor');
  show(false);
  cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener('pointermove', onMove);
  document.removeEventListener('pointerover', onOver);
  document.removeEventListener('mouseout', onLeave);
  window.removeEventListener('blur', hide);
}

const sync = () => (fine.matches && !calm.matches ? enable() : disable());
fine.addEventListener('change', sync);
calm.addEventListener('change', sync);
sync();

// ClientRouter replaces <html> attributes on swap: keep the class; the hovered element is gone, so reset.
document.addEventListener('astro:before-swap', (ev) => {
  if (!enabled) return;
  (ev as TransitionBeforeSwapEvent).newDocument.documentElement.classList.add('has-cursor');
  el?.classList.remove('has-label', 'is-press');
});
