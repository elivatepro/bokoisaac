// Work section motion (docs/framer-animations.md):
// #17 title "compile" scramble and #18 before -> after metric diff, per card as it scrolls in;
// #19 stacking project deck (sticky cards that scale and dim as later cards slide over them).
import { onPageLoad, ready, reducedMotion, gsap, ScrollTrigger, getLenis } from '../motion/core';
import { compiler, type Compiler } from './scramble';

const TOP = 72; // condensed header height
const STEP = 14; // sliver of each earlier card
const METRIC_TOTAL = 320 + 420 + 450 + 80; // --dl + last delay + last duration + slack, ms

onPageLoad(() => {
  const section = document.querySelector<HTMLElement>('[data-work]');
  if (!section || reducedMotion()) return;
  const undo = [cardIntro(section), deck(section)];
  return () => undo.forEach((fn) => fn());
});

/** #17 + #18: fire per card when it intersects (rootMargin 0 0 -12% 0, threshold .12). */
function cardIntro(section: HTMLElement): () => void {
  const cards = [...section.querySelectorAll<HTMLElement>('[data-work-card]')];
  const compilers: Compiler[] = [];
  const timers: number[] = [];
  let io: IntersectionObserver | null = null;
  let dead = false;

  for (const card of cards) card.querySelector('[data-work-metric]')?.classList.add('is-armed');

  const play = (card: HTMLElement) => {
    const title = card.querySelector<HTMLElement>('[data-work-title]');
    if (title) {
      const c = compiler(title, { duration: 700, interval: 45 });
      compilers.push(c);
      c.play();
    }
    const metric = card.querySelector<HTMLElement>('[data-work-metric]');
    if (metric) {
      metric.classList.add('is-on');
      // Once it has played, drop the animation classes so the native line-through is back.
      timers.push(window.setTimeout(() => metric.classList.remove('is-armed', 'is-on'), METRIC_TOTAL));
    }
  };

  ready().then(() => {
    if (dead) return;
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io?.unobserve(e.target);
          play(e.target as HTMLElement);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    cards.forEach((c) => io!.observe(c));
  });

  return () => {
    dead = true;
    io?.disconnect();
    timers.forEach(clearTimeout);
    compilers.forEach((c) => c.destroy());
    section.querySelectorAll('[data-work-metric]').forEach((m) => m.classList.remove('is-armed', 'is-on'));
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** #19: the deck. Desktop and tablet only (>= 810px), and only when a card fits the viewport. */
function deck(section: HTMLElement): () => void {
  const list = section.querySelector<HTMLElement>('[data-work-deck]');
  if (!list) return () => {};
  const items = [...list.children] as HTMLElement[];
  const n = items.length;
  if (n < 2) return () => {};

  const mm = gsap.matchMedia();
  mm.add('(min-width: 810px)', () => {
    const cards = items.map((li) => li.querySelector<HTMLElement>('article')!);
    const dims = cards.map((c) => c.querySelector<HTMLElement>('[data-deck-dim]'));
    const texts = cards.map((c) => [...c.querySelectorAll<HTMLElement>('[data-deck-text]')]);
    let on = false;
    let k: number[] = new Array(n).fill(0);

    const reset = () => {
      list.classList.remove('is-deck');
      list.style.removeProperty('--deck-min');
      gsap.set(cards, { clearProps: 'transform' });
      dims.forEach((d) => d && (d.style.opacity = ''));
      items.forEach((li) => (li.style.pointerEvents = ''));
      texts.flat().forEach((t) => t.classList.remove('is-under'));
      k = new Array(n).fill(0);
    };

    // Runs before ScrollTrigger measures (refreshInit) so min-height changes are taken into account.
    const size = () => {
      const vh = window.innerHeight;
      const lg = window.matchMedia('(min-width: 1024px)').matches;
      list.classList.add('is-deck');
      if (lg) list.style.setProperty('--deck-min', `${clamp(vh - TOP - (n - 1) * STEP - 36, 440, 640)}px`);
      else list.style.setProperty('--deck-min', '0px');
      const tallest = Math.max(...items.map((li) => li.offsetHeight));
      on = tallest <= vh - TOP - (n - 1) * STEP - 12;
      if (!on) reset();
    };

    const update = () => {
      if (!on) return;
      // Reads first.
      const rects = items.map((li) => li.getBoundingClientRect());
      const textRects = texts.map((ts) => ts.map((t) => t.getBoundingClientRect().bottom));
      const next: number[] = new Array(n).fill(0);
      for (let m = 1; m < n; m++) {
        const c = clamp(1 - (rects[m].top - (TOP + m * STEP)) / (rects[m].height * 0.92), 0, 1);
        for (let i = 0; i < m; i++) next[i] += c;
      }
      // Writes.
      for (let i = 0; i < n; i++) {
        const ki = next[i];
        if (ki !== k[i]) {
          if (ki <= 0) gsap.set(cards[i], { clearProps: 'transform' });
          else gsap.set(cards[i], { scale: 1 - ki * 0.04, transformOrigin: '50% 0%' });
          const d = dims[i];
          if (d) d.style.opacity = ki > 0 ? String(Math.min(0.62, ki * 0.3)) : '';
          items[i].style.pointerEvents = ki > 0.985 ? 'none' : '';
        }
        const below = rects[i + 1]?.top;
        texts[i].forEach((t, j) => t.classList.toggle('is-under', below !== undefined && below < textRects[i][j]));
      }
      k = next;
    };

    // Tabbing into a covered card scrolls it back on top of the stack.
    const naturalTop = (i: number) => {
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      let y = list.getBoundingClientRect().top + window.scrollY;
      for (let j = 0; j < i; j++) y += items[j].offsetHeight + gap;
      return y;
    };
    const onFocus = (e: FocusEvent) => {
      if (!on) return;
      const i = items.findIndex((li) => li.contains(e.target as Node));
      if (i < 0 || k[i] < 0.02) return;
      const y = naturalTop(i) - (TOP + i * STEP);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo({ top: y, behavior: 'instant' });
    };

    size();
    ScrollTrigger.addEventListener('refreshInit', size);
    list.addEventListener('focusin', onFocus);
    const st = ScrollTrigger.create({
      trigger: list,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: update,
      onRefresh: update,
    });
    update();

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', size);
      list.removeEventListener('focusin', onFocus);
      st.kill();
      reset();
    };
  });

  return () => mm.revert();
}
