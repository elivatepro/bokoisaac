// #18 before -> after metric (components/work/Metric.astro): plays once per metric as it scrolls into view,
// with the template's observer settings (rootMargin 0 0 -12% 0, threshold .12). Skipped for reduced motion.
import { onPageLoad, ready, reducedMotion } from '../motion/core';

onPageLoad(() => {
  const metrics = [...document.querySelectorAll<HTMLElement>('[data-metric]')];
  if (!metrics.length || reducedMotion()) return;
  metrics.forEach((m) => m.classList.add('is-armed'));
  let io: IntersectionObserver | null = null;
  let dead = false;
  ready().then(() => {
    if (dead) return;
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io?.unobserve(e.target);
          e.target.classList.add('is-on');
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    metrics.forEach((m) => io!.observe(m));
  });
  return () => {
    dead = true;
    io?.disconnect();
    metrics.forEach((m) => m.classList.remove('is-armed', 'is-on'));
  };
});
