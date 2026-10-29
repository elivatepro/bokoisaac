// "Compile" scramble (docs/framer-animations.md #17 and #32): letters show as coral code symbols and
// resolve into the real text from left to right.
//
// The real characters stay in the DOM the whole time (only their colour is hidden), so layout never
// shifts and screen readers always get the real text. Symbols live in aria-hidden child spans. When the
// run ends, the element's original child nodes are put back, so the final DOM is exactly the static one.

export const SYMBOLS = '<>/{}[]()=+*#;:01';

const STYLE_ID = 'scramble-css';
const CSS = `
.scr-c{position:relative;transition:color var(--scr-fade,0s) linear}
.scr-c[data-st="hide"],.scr-c[data-st="scr"]{color:transparent}
.scr-s{position:absolute;left:50%;top:0;translate:-50% 0;font-family:var(--font-mono);font-weight:500;letter-spacing:0;color:var(--color-coral);opacity:0;pointer-events:none;transition:opacity var(--scr-fade,0s) linear}
.scr-c[data-st="scr"]>.scr-s{opacity:1}
`;

// Astro's ClientRouter replaces <head> contents on navigation, so check every time.
function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
}

export interface CompileOptions {
  /** Total time for the left-to-right resolve, ms. */
  duration: number;
  /** Symbol re-roll interval, ms. */
  interval: number;
  /** Symbol for character i on frame f. Default: random. */
  pick?: (i: number, frame: number) => string;
  /** Cross-fade when a character resolves, seconds (0 = instant). */
  fade?: number;
  /** Hide the characters (no symbols) until play() is called. */
  hidden?: boolean;
}

export interface Compiler {
  play(): Promise<void>;
  /** Stop and restore the original text immediately. */
  destroy(): void;
}

const random = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

export function compiler(el: HTMLElement, opts: CompileOptions): Compiler {
  ensureStyle();
  const original = [...el.childNodes];
  const text = el.textContent ?? '';
  const pick = opts.pick ?? random;
  const chars: { c: HTMLElement; s: HTMLElement }[] = [];
  let split = false;
  let timer = 0;
  let done: (() => void) | null = null;

  const doSplit = (state: 'hide' | 'scr') => {
    if (split) return;
    split = true;
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      if (/\s/.test(ch)) {
        frag.append(ch);
        continue;
      }
      const c = document.createElement('span');
      c.className = 'scr-c';
      c.dataset.st = state;
      c.append(ch);
      const s = document.createElement('span');
      s.className = 'scr-s';
      s.setAttribute('aria-hidden', 'true');
      c.append(s);
      frag.append(c);
      chars.push({ c, s });
    }
    if (opts.fade) el.style.setProperty('--scr-fade', `${opts.fade}s`);
    el.replaceChildren(frag);
  };

  const restore = () => {
    clearInterval(timer);
    timer = 0;
    if (split) {
      el.replaceChildren(...original);
      el.style.removeProperty('--scr-fade');
      split = false;
    }
    chars.length = 0;
    done?.();
    done = null;
  };

  if (opts.hidden) doSplit('hide');

  return {
    play() {
      if (timer) return Promise.resolve();
      doSplit('scr');
      return new Promise<void>((resolve) => {
        done = resolve;
        const n = chars.length;
        const t0 = performance.now();
        let frame = 0;
        const tick = () => {
          const p = Math.min(1, (performance.now() - t0) / opts.duration);
          const resolved = Math.floor(p * n);
          chars.forEach(({ c, s }, i) => {
            if (i < resolved) {
              c.dataset.st = 'done';
            } else {
              c.dataset.st = 'scr';
              s.textContent = pick(i, frame);
            }
          });
          frame++;
          if (p >= 1) {
            clearInterval(timer);
            // Let the last cross-fade finish before swapping the original nodes back.
            setTimeout(restore, (opts.fade ?? 0) * 1000 + 20);
          }
        };
        tick();
        timer = window.setInterval(tick, opts.interval);
      });
    },
    destroy: restore,
  };
}
