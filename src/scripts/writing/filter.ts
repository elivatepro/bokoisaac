// Filter chips on /writing (topic) and /work (kind): show only rows whose data-topic matches, and keep the
// count in step (zero-padded when the count element has data-pad, e.g. "08 projects").
import { onPageLoad } from '../motion/core';

onPageLoad(() => {
  const chips = [...document.querySelectorAll<HTMLButtonElement>('button[data-filter]')];
  if (!chips.length) return;
  const rows = [...document.querySelectorAll<HTMLElement>('li[data-topic]')];
  const count = document.querySelector<HTMLElement>('[data-filter-count]');
  const ac = new AbortController();

  for (const chip of chips) {
    chip.addEventListener(
      'click',
      () => {
        const topic = chip.dataset.filter ?? '';
        for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
        let shown = 0;
        for (const row of rows) {
          const match = !topic || row.dataset.topic === topic;
          row.hidden = !match;
          if (match) shown++;
        }
        if (count) count.textContent = String(shown).padStart(Number(count.dataset.pad ?? 0), '0');
      },
      { signal: ac.signal },
    );
  }
  return () => ac.abort();
});
