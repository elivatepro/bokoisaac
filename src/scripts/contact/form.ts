// Contact form (pages/contact.astro). States from Paper: draft → sending (fields dim, "sending" chip, spinner)
// → sent (thank-you panel) or error (red banner, text kept, bad field ringed). Prefills the picks made in the
// home page's "Start a project" section, from the query string (?need=&budget=&name=) or sessionStorage "brief".
import { onPageLoad } from '../motion/core';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="flex-shrink:0"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5v5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>';

/** Why an email is wrong, in plain words (Paper: "Add the part after the dot, like .com"). */
function emailProblem(v: string): string | null {
  if (!v) return 'Add your email so I can reply';
  if (EMAIL.test(v)) return null;
  if (!v.includes('@')) return 'An email needs an @, like ada@company.com';
  const domain = v.split('@').pop() ?? '';
  if (!domain || !domain.includes('.')) return 'Add the part after the dot, like .com';
  return 'That email doesn’t look right. Check for a typo.';
}

function prefill(form: HTMLFormElement) {
  const q = new URLSearchParams(location.search);
  let need = q.getAll('need');
  let budget = q.get('budget');
  let name = q.get('name');
  if (!need.length && !budget && !name) {
    try {
      const saved = JSON.parse(sessionStorage.getItem('brief') ?? 'null');
      need = saved?.need ?? [];
      budget = saved?.budget ?? null;
      name = saved?.name ?? null;
    } catch {}
  }
  for (const input of form.querySelectorAll<HTMLInputElement>('input[name="need"]')) if (need.includes(input.value)) input.checked = true;
  for (const input of form.querySelectorAll<HTMLInputElement>('input[name="budget"]')) if (input.value === budget) input.checked = true;
  const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
  if (nameInput && name && !nameInput.value) nameInput.value = name;
}

function setup(form: HTMLFormElement, signal: AbortSignal) {
  const card = form.closest<HTMLElement>('[data-contact-card]')!;
  const banner = card.querySelector<HTMLElement>('[data-contact-error]')!;
  const bannerText = card.querySelector<HTMLElement>('[data-contact-error-text]')!;
  const sent = card.querySelector<HTMLElement>('[data-contact-sent]')!;
  const thanks = card.querySelector<HTMLElement>('[data-contact-thanks]')!;
  const statusText = card.querySelector<HTMLElement>('[data-contact-status-text]')!;
  const statusChip = card.querySelector<HTMLElement>('[data-contact-status]')!;
  const statusDot = card.querySelector<HTMLElement>('[data-contact-status-dot]')!;
  const note = card.querySelector<HTMLElement>('[data-contact-note]')!;
  const noteDefault = note.textContent ?? '';
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const fields = {
    name: form.elements.namedItem('name') as HTMLInputElement,
    email: form.elements.namedItem('email') as HTMLInputElement,
    message: form.elements.namedItem('message') as HTMLTextAreaElement,
  };
  const msgFor = (el: HTMLElement) => card.querySelector<HTMLElement>(`#${el.getAttribute('aria-describedby')}`);

  const fieldError = (el: HTMLInputElement | HTMLTextAreaElement, text: string | null) => {
    // Tailwind's aria-invalid: variant matches [aria-invalid="true"], so set the value explicitly.
    if (text) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    const msg = msgFor(el);
    if (!msg) return;
    msg.innerHTML = text ? `${ICON}<span></span>` : '';
    if (text) msg.querySelector('span')!.textContent = text;
    msg.classList.toggle('hidden', !text);
    msg.classList.toggle('flex', !!text);
  };

  const status = (state: 'draft' | 'sending' | 'sent') => {
    statusText.textContent = state;
    statusDot.classList.toggle('hidden', state !== 'sent');
    statusChip.classList.toggle('text-coral', state === 'sent');
    statusChip.classList.toggle('text-muted', state !== 'sent');
    statusChip.style.boxShadow = state === 'sent' ? 'inset 0 0 0 1px #ff7f5066' : '';
  };

  const busy = (on: boolean) => {
    const label = button.querySelector<HTMLElement>('span.whitespace-nowrap')!;
    button.dataset.label ??= label.textContent ?? '';
    label.textContent = on ? (button.dataset.busyLabel ?? 'Sending…') : button.dataset.label;
    button.disabled = on;
    button.toggleAttribute('aria-busy', on);
    card.classList.toggle('is-sending', on);
    note.textContent = on ? 'Hold on, this takes a second. Don’t close the tab.' : noteDefault;
    status(on ? 'sending' : 'draft');
  };

  const showSent = (name: string) => {
    thanks.textContent = name ? `Thanks, ${name.split(/\s+/)[0]}.` : 'Thanks.';
    form.hidden = true;
    sent.hidden = false;
    status('sent');
    try {
      sessionStorage.removeItem('brief');
    } catch {}
  };

  const showError = (emailBad: boolean) => {
    bannerText.textContent = emailBad ? 'Your text is kept. Fix the email below and try again,' : 'Your text is kept. Try again in a moment,';
    banner.hidden = false;
  };

  prefill(form);
  const state = new URLSearchParams(location.search).get('sent');
  if (state === 'ok') showSent('');
  else if (state === 'invalid') {
    showError(true);
    fieldError(fields.email, 'That email doesn’t look right. Check for a typo.');
  } else if (state === 'error') showError(false);

  for (const el of Object.values(fields)) el.addEventListener('input', () => el.hasAttribute('aria-invalid') && fieldError(el, null), { signal });

  form.addEventListener(
    'submit',
    async (e) => {
      e.preventDefault();
      banner.hidden = true;
      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const message = fields.message.value.trim();
      const errors: [HTMLInputElement | HTMLTextAreaElement, string][] = [];
      if (!name) errors.push([fields.name, 'Add your name so I know who’s writing']);
      const ep = emailProblem(email);
      if (ep) errors.push([fields.email, ep]);
      if (!message) errors.push([fields.message, 'Write a few lines about the project']);
      for (const [el, text] of errors) fieldError(el, text);
      if (errors.length) {
        if (errors.length === 1 && errors[0][0] === fields.email && email) showError(true);
        return errors[0][0].focus();
      }

      busy(true);
      const data = new FormData(form);
      let res: { ok: boolean; error?: string } = { ok: false, error: 'server' };
      try {
        const r = await fetch(form.action, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({
            name,
            email,
            message,
            need: data.getAll('need').join('|'),
            budget: (data.get('budget') as string | null) ?? '',
            website: (data.get('website') as string | null) ?? '',
          }),
        });
        res = await r.json();
      } catch {}
      busy(false);
      if (res.ok) {
        showSent(name);
        card.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else {
        const emailBad = res.error === 'invalid_email';
        if (emailBad) fieldError(fields.email, 'That email doesn’t look right. Check for a typo.');
        showError(emailBad);
        banner.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    },
    { signal },
  );
}

onPageLoad(() => {
  const form = document.querySelector<HTMLFormElement>('form[data-contact-form]');
  if (!form) return;
  const ac = new AbortController();
  setup(form, ac.signal);
  return () => ac.abort();
});
