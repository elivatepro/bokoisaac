// #3 Smooth scroll (Lenis), fine pointers only and never with reduced motion.
// Lenis is created per page (ClientRouter swaps destroy it in the cleanup) and driven from gsap.ticker,
// but the ticker callback is only attached while Lenis is actually animating (it sleeps between scrolls),
// so there's no forever-running rAF. ScrollTrigger is refreshed after every page load.
import Lenis from 'lenis';
import { finePointer, gsap, onPageLoad, ready, reducedMotion, ScrollTrigger, setLenis } from '../motion/core';

gsap.ticker.lagSmoothing(0);

onPageLoad(() => {
  const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
  if (!finePointer() || reducedMotion()) return () => cancelAnimationFrame(refresh);

  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  setLenis(lenis);
  lenis.on('scroll', ScrollTrigger.update);

  let awake = false;
  const tick = (time: number) => {
    lenis.raf(time * 1000);
    if (lenis.isScrolling !== 'smooth') sleep();
  };
  const wake = () => {
    if (awake) return;
    awake = true;
    lenis.time = 0; // first frame after waking gets deltaTime 0 instead of the idle gap
    // Attach after Lenis has handled the wheel event: a sleeping gsap.ticker ticks synchronously on add(),
    // which would see isScrolling === false and put us straight back to sleep.
    queueMicrotask(() => awake && gsap.ticker.add(tick));
  };
  const sleep = () => {
    if (!awake) return;
    awake = false;
    gsap.ticker.remove(tick);
  };
  lenis.on('virtual-scroll', wake);

  // Hold scroll while the loader / transition panel covers the page.
  if (document.documentElement.classList.contains('is-holding')) {
    lenis.stop();
    ready().then(() => lenis.start());
  }

  // Same-page #anchor links glide (offset for the fixed header) and keep history in sync.
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href*="#"]');
    if (!(a instanceof HTMLAnchorElement)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    history.pushState(history.state, '', url.hash);
    lenis.scrollTo(target, { offset: -72 });
    wake();
    if (!target.matches('a,button,input,select,textarea,[tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };
  document.addEventListener('click', onClick, true);

  return () => {
    document.removeEventListener('click', onClick, true);
    sleep();
    lenis.destroy();
    setLenis(null);
    cancelAnimationFrame(refresh);
  };
});
