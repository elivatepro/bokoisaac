// Contact brief: mirrors the picks into the brief.ts preview and keeps them in sessionStorage for the
// contact form. A value that changes re-mounts with a short coral flash (docs/framer-animations.md #31).
import { onPageLoad } from '../motion/core';

const KEY = 'brief';
const label = { need: 'kind', budget: 'budget', name: 'name' } as const;
type Field = keyof typeof label;

onPageLoad(() => {
  const ac = new AbortController();
  for (const form of document.querySelectorAll<HTMLFormElement>('form[data-brief]')) setup(form, ac.signal);
  return () => ac.abort();
});

function setup(form: HTMLFormElement, signal: AbortSignal) {
  const lines = Object.fromEntries(
    [...form.querySelectorAll<HTMLElement>('[data-brief-line]')].map((el) => [el.dataset.briefLine!, el]),
  ) as Record<Field, HTMLElement>;
  const shown: Partial<Record<Field, string>> = {};
  let first = true;

  const render = () => {
    const data = new FormData(form);
    const brief = {
      need: data.getAll('need').map(String),
      budget: (data.get('budget') as string | null) ?? null,
      name: String(data.get('name') ?? '').trim() || null,
    };
    for (const key of Object.keys(label) as Field[]) {
      const value = brief[key];
      const empty = value === null || (Array.isArray(value) && value.length === 0);
      const text = empty ? 'null' : Array.isArray(value) ? `[${value.map((v) => JSON.stringify(v)).join(', ')}]` : JSON.stringify(value);
      if (shown[key] === text) continue;
      shown[key] = text;
      const val = document.createElement('span');
      val.textContent = text;
      if (!first) val.className = 'brief-flash';
      lines[key].replaceChildren(`${label[key]}: `, val, empty ? (key === 'name' ? ', // not typed yet' : ', // not picked yet') : ',');
    }
    first = false;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(brief));
    } catch {}
  };

  // Restore picks from earlier in this tab.
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (saved) {
      for (const input of form.querySelectorAll<HTMLInputElement>('input[name="need"]')) input.checked = saved.need?.includes(input.value);
      for (const input of form.querySelectorAll<HTMLInputElement>('input[name="budget"]')) input.checked = saved.budget === input.value;
      const name = form.querySelector<HTMLInputElement>('input[name="name"]');
      if (name && saved.name) name.value = saved.name;
    }
  } catch {}

  form.addEventListener('input', render, { signal });
  form.addEventListener('change', render, { signal });
  render();
}
