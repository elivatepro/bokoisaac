// #1 Boot loader: first visit of a session only. The pre-paint script in Base.astro adds html.shl-go +
// is-holding (skipped for reduced motion, sessionStorage['bi-loaded'], and with a 5s failsafe); this module
// types the line, fills the bar and lifts the panel. Runs once per document (not per ClientRouter swap).
import { lift, panel } from './panel';

const SYMBOLS = '<>/{}[]()=+*#;:01';
const html = document.documentElement;

function boot() {
  const el = panel();
  try {
    sessionStorage.setItem('bi-loaded', '1');
  } catch {}
  if (!el) return lift();
  // Arrived late (slow boot): don't start a loader now.
  if (performance.now() >= 3500) return lift();

  const text = el.querySelector<HTMLElement>('[data-shl-text]');
  const sub = el.querySelector<HTMLElement>('[data-shl-sub]');
  const skip = el.querySelector<HTMLButtonElement>('[data-shl-skip]');
  const real = text?.textContent ?? '';
  el.removeAttribute('aria-hidden');

  const t = 900;
  const i = Math.max(500, Math.min(t, t + 400 - performance.now()));
  const scrambleMs = Math.min(820, i * 0.72);
  el.style.setProperty('--shl-ms', `${i}ms`);
  el.classList.add('is-run');

  const timers: number[] = [];
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    timers.forEach((id) => window.clearTimeout(id));
    window.clearInterval(roll);
    if (text) text.textContent = real;
    el.removeEventListener('click', finish);
    window.removeEventListener('keydown', onKey, true);
    lift();
  };

  // Scramble: resolves left to right over scrambleMs; unresolved characters re-roll every 45ms.
  const start = performance.now();
  const paint = () => {
    if (!text) return;
    const p = Math.min(1, (performance.now() - start) / scrambleMs);
    const n = Math.floor(p * real.length);
    let out = real.slice(0, n);
    for (let k = n; k < real.length; k++) out += real[k] === ' ' ? ' ' : SYMBOLS[(Math.random() * SYMBOLS.length) | 0];
    text.textContent = out;
    if (p >= 1) window.clearInterval(roll);
  };
  paint();
  const roll = window.setInterval(paint, 45);

  timers.push(
    window.setTimeout(() => sub && (sub.textContent = 'ready'), i),
    window.setTimeout(finish, i + 100),
    window.setTimeout(finish, Math.max(0, 4000 - performance.now())), // hard fallback
  );

  // Skip: click anywhere on the panel, any key except Tab, or the Skip button.
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') finish();
  };
  el.addEventListener('click', finish);
  window.addEventListener('keydown', onKey, true);
  skip?.addEventListener('click', finish, { once: true });
}

if (html.classList.contains('shl-go')) boot();
