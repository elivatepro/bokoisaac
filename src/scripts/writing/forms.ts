// Newsletter + comment forms on /writing. Both post JSON to their /api endpoint and switch between the states
// designed in Paper: sending (button dims, spinner in the icon tile), sent, field errors and a general error.
import { onPageLoad } from '../motion/core';
import { guard } from '../turnstile';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Result = { ok: true } | { ok: false; error: string };

async function post(url: string, body: Record<string, string>): Promise<Result> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body) });
    return (await res.json()) as Result;
  } catch {
    return { ok: false, error: 'server' };
  }
}

/** Dims the submit button and swaps its arrow for a spinner while a request runs. */
function busy(button: HTMLButtonElement, on: boolean) {
  const label = button.querySelector<HTMLElement>('span.whitespace-nowrap');
  if (label) {
    button.dataset.label ??= label.textContent ?? '';
    label.textContent = on ? (button.dataset.busyLabel ?? 'Sending…') : button.dataset.label;
  }
  button.disabled = on;
  button.toggleAttribute('aria-busy', on);
}

function fieldError(input: HTMLInputElement | HTMLTextAreaElement, msg: HTMLElement | null, text: string | null) {
  // Tailwind's aria-invalid: variant matches [aria-invalid="true"], so the value has to be set.
  if (text) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  if (!msg) return;
  msg.textContent = text ?? '';
  msg.classList.toggle('hidden', !text);
}

function newsletter(root: HTMLElement, signal: AbortSignal) {
  const form = root.querySelector<HTMLFormElement>('[data-newsletter-form]')!;
  const input = form.querySelector<HTMLInputElement>('input[name="email"]')!;
  const msg = root.querySelector<HTMLElement>('[data-newsletter-msg]');
  const done = root.querySelector<HTMLElement>('[data-newsletter-done]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const turnstile = guard(form, root.querySelector('[data-turnstile]'), signal);

  const show = (state: string | null) => {
    if (state === 'ok') {
      form.hidden = true;
      msg?.classList.add('hidden');
      done.hidden = false;
    } else if (state === 'invalid') fieldError(input, msg, 'That email doesn’t look right. Check for a typo.');
    else if (state === 'error') fieldError(input, msg, 'Couldn’t subscribe. Try again in a moment.');
  };
  show(new URLSearchParams(location.search).get('newsletter'));

  input.addEventListener('input', () => input.hasAttribute('aria-invalid') && fieldError(input, msg, null), { signal });
  form.addEventListener(
    'submit',
    async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!EMAIL.test(email)) return show('invalid'), input.focus();
      busy(button, true);
      const res = await post('/api/subscribe', { email, website: (form.elements.namedItem('website') as HTMLInputElement).value, turnstile: await turnstile() });
      busy(button, false);
      show(res.ok ? 'ok' : res.error === 'invalid_email' ? 'invalid' : 'error');
    },
    { signal },
  );
}

function comments(form: HTMLFormElement, signal: AbortSignal) {
  const card = form.closest<HTMLElement>('[data-comment-card]')!;
  const sent = card.querySelector<HTMLElement>('[data-comment-sent]')!;
  const banner = form.querySelector<HTMLElement>('[data-comment-error]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const name = form.elements.namedItem('name') as HTMLInputElement;
  const email = form.elements.namedItem('email') as HTMLInputElement;
  const comment = form.elements.namedItem('comment') as HTMLTextAreaElement;
  const turnstile = guard(form, form.querySelector('[data-turnstile]'), signal);
  const msg = (el: HTMLElement) => form.querySelector<HTMLElement>(`#${el.getAttribute('aria-describedby')?.split(' ').pop()}`);

  const showSent = (on: boolean) => {
    form.hidden = on;
    form.previousElementSibling?.toggleAttribute('hidden', on);
    sent.hidden = !on;
  };
  const state = new URLSearchParams(location.search).get('comment');
  if (state === 'ok') showSent(true);
  if (state === 'error') banner.hidden = false;

  for (const el of [name, email, comment]) el.addEventListener('input', () => el.hasAttribute('aria-invalid') && fieldError(el, msg(el), null), { signal });

  sent.querySelector('[data-comment-again]')?.addEventListener(
    'click',
    () => {
      form.reset();
      showSent(false);
      name.focus();
    },
    { signal },
  );

  form.addEventListener(
    'submit',
    async (e) => {
      e.preventDefault();
      banner.hidden = true;
      const errors: [HTMLInputElement | HTMLTextAreaElement, string][] = [];
      if (!name.value.trim()) errors.push([name, 'Add a name so I know who’s talking']);
      if (email.value.trim() && !EMAIL.test(email.value.trim())) errors.push([email, 'That email doesn’t look right']);
      if (!comment.value.trim()) errors.push([comment, 'Write a comment first']);
      for (const [el, text] of errors) fieldError(el, msg(el), text);
      if (errors.length) return errors[0][0].focus();

      busy(button, true);
      const res = await post('/api/comments', {
        post: (form.elements.namedItem('post') as HTMLInputElement).value,
        slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
        name: name.value.trim(),
        email: email.value.trim(),
        comment: comment.value.trim(),
        website: (form.elements.namedItem('website') as HTMLInputElement).value,
        turnstile: await turnstile(),
      });
      busy(button, false);
      if (res.ok) {
        showSent(true);
        sent.querySelector<HTMLElement>('[data-comment-again]')?.focus();
      } else banner.hidden = false;
    },
    { signal },
  );
}

function copyButtons(signal: AbortSignal) {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    btn.addEventListener(
      'click',
      async () => {
        const code = btn.closest('figure')?.querySelector('code')?.textContent ?? '';
        const label = btn.querySelector<HTMLElement>('[data-copy-label]')!;
        try {
          await navigator.clipboard.writeText(code);
          label.textContent = 'Copied';
          btn.dataset.copied = '';
        } catch {
          label.textContent = 'Press ⌘C';
        }
        setTimeout(() => {
          label.textContent = 'Copy';
          delete btn.dataset.copied;
        }, 1800);
      },
      { signal },
    );
  }
}

onPageLoad(() => {
  const ac = new AbortController();
  for (const root of document.querySelectorAll<HTMLElement>('[data-newsletter]')) newsletter(root, ac.signal);
  for (const form of document.querySelectorAll<HTMLFormElement>('form[data-comment-form]')) comments(form, ac.signal);
  copyButtons(ac.signal);
  return () => ac.abort();
});
