// #5 Header condenses once the page scrolls past 40px (rAF-throttled). CSS in global.css (.site-header).
import { onPageLoad } from '../motion/core';

onPageLoad(() => {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    header.classList.toggle('is-moved', window.scrollY > 40);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(frame);
  };
});
