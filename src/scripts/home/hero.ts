// Hero: stat count-up (#13), magnetic buttons (#15) and the portrait "source code" canvas (#14).
// The intro itself (#12) is CSS in Hero.astro. The hero's own lime cursor from the template is not
// ported: the site-wide cursor (#4) already covers the hero, as the catalogue recommends.
import { finePointer, gsap, reducedMotion } from '../motion/core';
import { counter } from '../motion/count';
import { onPage, readyCapped } from '../motion/page';

onPage(() => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || reducedMotion()) return;
  const cleanups: (() => void)[] = [];
  let alive = true;

  // #13: hero stats count up over 1400 ms, starting with each stat's intro (620 + 90i ms).
  const counters = [...hero.querySelectorAll<HTMLElement>('[data-count]')]
    .map((el) => counter(el, 1400))
    .filter((c) => c !== null);
  cleanups.push(() => counters.forEach((c) => c.restore()));
  readyCapped().then(() => {
    if (alive) counters.forEach((c, i) => c.play(620 + i * 90));
  });

  // #15: buttons lean toward the pointer, (dx × .16, dy × .22), fine pointers only.
  if (finePointer()) {
    hero.querySelectorAll<HTMLElement>('[data-magnet]').forEach((btn) => {
      const x = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'sh-ui' });
      const y = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'sh-ui' });
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        const r = btn.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.16);
        y((e.clientY - (r.top + r.height / 2)) * 0.22);
      };
      const leave = () => {
        x(0);
        y(0);
      };
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        btn.removeEventListener('pointermove', move);
        btn.removeEventListener('pointerleave', leave);
        gsap.killTweensOf(btn);
        gsap.set(btn, { clearProps: 'transform' });
      });
    });
  }

  // #14: the canvas module is loaded lazily, off the critical path.
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
  idle(
    () => {
      if (!alive) return;
      import('./source-canvas').then(({ startSourceCanvas }) => {
        if (alive) cleanups.push(startSourceCanvas(hero));
      });
    },
    { timeout: 1200 },
  );

  return () => {
    alive = false;
    cleanups.forEach((fn) => fn());
  };
});
