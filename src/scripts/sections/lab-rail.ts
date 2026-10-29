// Lab rail (docs/framer-animations.md #26): arrows, progress thumb, mouse drag with inertia,
// and sideways wheel / Shift + wheel scrolling. Vertical wheel passes through to the page.
import { onPageLoad, reducedMotion } from '../motion/core';

onPageLoad(() => {
  const undo = [...document.querySelectorAll<HTMLElement>('[data-lab]')].map(setup);
  return () => undo.forEach((fn) => fn());
});

function setup(section: HTMLElement): () => void {
  const rail = section.querySelector<HTMLElement>('[data-lab-rail]');
  if (!rail) return () => {};
  const prev = section.querySelector<HTMLButtonElement>('[data-lab-prev]');
  const next = section.querySelector<HTMLButtonElement>('[data-lab-next]');
  const track = section.querySelector<HTMLElement>('[data-lab-track]');
  const ac = new AbortController();
  const on = { signal: ac.signal };

  const max = () => rail.scrollWidth - rail.clientWidth;

  const update = () => {
    const m = max();
    if (track) {
      track.style.setProperty('--f', String(Math.min(1, rail.clientWidth / rail.scrollWidth)));
      track.style.setProperty('--p', String(m > 0 ? Math.min(1, Math.max(0, rail.scrollLeft / m)) : 0));
      track.classList.toggle('is-fit', m <= 1);
    }
    if (prev) prev.disabled = rail.scrollLeft <= 1;
    if (next) next.disabled = rail.scrollLeft >= m - 1;
  };

  // Arrows: one card + gap per click.
  const step = () => {
    const card = rail.querySelector('li');
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : rail.clientWidth;
  };
  const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth';
  prev?.addEventListener('click', () => (stopGlide(), rail.scrollBy({ left: -step(), behavior })), on);
  next?.addEventListener('click', () => (stopGlide(), rail.scrollBy({ left: step(), behavior })), on);

  rail.addEventListener('scroll', update, { passive: true, signal: ac.signal });
  const ro = new ResizeObserver(update);
  ro.observe(rail);

  // Inertia: release velocity (px/ms) x 16 is the first step, decaying x0.93 per frame until < 0.4px.
  let raf = 0;
  const stopGlide = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    rail.classList.remove('is-glide');
  };
  const glide = (v: number) => {
    let s = v * 16;
    rail.classList.add('is-glide');
    const tick = () => {
      const before = rail.scrollLeft;
      rail.scrollLeft += s;
      s *= 0.93;
      if (Math.abs(s) < 0.4 || rail.scrollLeft === before) return stopGlide();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  // Wheel: a mostly horizontal delta, or Shift + wheel, scrolls the rail. Stopping propagation keeps
  // the page's smooth scroll (Lenis, listening on window) from also moving the page.
  rail.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && !e.shiftKey) return;
      let d = horizontal ? e.deltaX : e.deltaY || e.deltaX;
      if (e.deltaMode === 1) d *= 16;
      else if (e.deltaMode === 2) d *= rail.clientWidth;
      const m = max();
      if ((d < 0 && rail.scrollLeft <= 0) || (d > 0 && rail.scrollLeft >= m - 1)) return;
      e.preventDefault();
      e.stopPropagation();
      stopGlide();
      rail.scrollBy({ left: d, behavior: 'instant' });
    },
    { passive: false, signal: ac.signal },
  );

  // Drag (mouse only). Starts after 6px; clicks within 350ms of a drag are swallowed.
  let down = false;
  let dragging = false;
  let startX = 0;
  let startLeft = 0;
  let lastX = 0;
  let lastT = 0;
  let v = 0;
  let dragEnd = -Infinity;

  rail.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide();
      down = true;
      dragging = false;
      startX = lastX = e.clientX;
      startLeft = rail.scrollLeft;
      lastT = e.timeStamp;
      v = 0;
    },
    on,
  );
  window.addEventListener(
    'pointermove',
    (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6) return;
        dragging = true;
        rail.classList.add('is-drag');
        window.getSelection()?.removeAllRanges();
      }
      const dt = e.timeStamp - lastT;
      if (dt > 0) v = -(e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = e.timeStamp;
      rail.scrollLeft = startLeft - dx;
    },
    on,
  );
  const release = (e: PointerEvent) => {
    if (!down) return;
    down = false;
    if (!dragging) return;
    dragging = false;
    rail.classList.remove('is-drag');
    dragEnd = performance.now();
    if (e.timeStamp - lastT < 80 && Math.abs(v) > 0.25 && !reducedMotion()) glide(v);
  };
  window.addEventListener('pointerup', release, on);
  window.addEventListener('pointercancel', release, on);
  rail.addEventListener(
    'click',
    (e) => {
      if (performance.now() - dragEnd < 350) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true, signal: ac.signal },
  );
  rail.addEventListener('dragstart', (e) => e.preventDefault(), on);

  update();

  return () => {
    ac.abort();
    ro.disconnect();
    stopGlide();
    rail.classList.remove('is-drag');
  };
}
