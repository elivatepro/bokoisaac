// Footer wordmark compile (docs/framer-animations.md #32): the letters are hidden until the wordmark is
// 30% in view (or focus enters the footer), then each shows as a coral code symbol and the real letters
// resolve left to right over 850ms. The hidden state is only applied from JS, so no-JS shows the name.
import { onPageLoad, ready, reducedMotion } from '../motion/core';
import { compiler, SYMBOLS } from './scramble';

onPageLoad(() => {
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  const mark = footer?.querySelector<HTMLElement>('[data-wordmark]');
  if (!footer || !mark || reducedMotion()) return;

  const c = compiler(mark, {
    duration: 850,
    interval: 55,
    fade: 0.18,
    hidden: true,
    pick: (i, f) => SYMBOLS[(i * 7 + f * 5 + ((i * f) % 3)) % SYMBOLS.length],
  });
  let io: IntersectionObserver | null = null;
  let fired = false;
  let dead = false;
  const fire = () => {
    if (fired || dead) return;
    fired = true;
    io?.disconnect();
    footer.removeEventListener('focusin', fire);
    c.play();
  };

  ready().then(() => {
    if (dead) return;
    io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && fire(), { threshold: 0.3 });
    io.observe(mark);
  });
  footer.addEventListener('focusin', fire);

  return () => {
    dead = true;
    io?.disconnect();
    footer.removeEventListener('focusin', fire);
    c.destroy();
  };
});
