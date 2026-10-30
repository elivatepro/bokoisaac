// Cloudflare Turnstile for the newsletter, comment and contact forms (checked server-side by lib/api.ts human()).
// The script only loads the first time someone focuses a form, the check runs while they type, and the widget
// stays hidden unless Cloudflare wants a click. Submit waits for the token. Empty SITE_KEY = Turnstile off.
export const SITE_KEY = '';

interface Turnstile {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
    onTurnstileLoad?: () => void;
  }
}

let loading: Promise<Turnstile> | null = null;

function load(): Promise<Turnstile> {
  return (loading ??= new Promise((resolve, reject) => {
    window.onTurnstileLoad = () => resolve(window.turnstile!);
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    s.async = true;
    s.onerror = () => ((loading = null), reject());
    document.head.append(s);
  }));
}

/**
 * Starts Turnstile for a form on first focus and returns a function that resolves to a fresh token on submit
 * ('' when Turnstile is off or failed; the server then answers "blocked" and the form shows its error state).
 * `box` is a hidden element the widget renders into; it is only shown if Cloudflare asks for a click.
 */
export function guard(form: HTMLFormElement, box: HTMLElement | null, signal: AbortSignal): () => Promise<string> {
  if (!SITE_KEY || !box) return async () => '';
  let id: string | null = null;
  let started = false;
  let token = '';
  const waiting: ((t: string) => void)[] = [];
  const settle = (t: string) => {
    token = t;
    for (const done of waiting.splice(0)) done(t);
  };

  const start = () => {
    if (started) return;
    started = true;
    load()
      .then((ts) => {
        if (signal.aborted) return;
        id = ts.render(box, {
          sitekey: SITE_KEY,
          appearance: 'interaction-only',
          callback: settle,
          'error-callback': () => settle(''),
          'expired-callback': () => (token = ''),
          'before-interactive-callback': () => (box.hidden = false),
          'after-interactive-callback': () => (box.hidden = true),
        });
      })
      .catch(() => ((started = false), settle('')));
  };

  form.addEventListener('focusin', start, { signal, once: true });
  signal.addEventListener('abort', () => id && window.turnstile?.remove(id));

  return async () => {
    start();
    const t = token || (await Promise.race([new Promise<string>((r) => waiting.push(r)), new Promise<string>((r) => setTimeout(() => r(''), 30_000))]));
    // Tokens are single use: get the next one ready for a second submit.
    token = '';
    if (id) window.turnstile?.reset(id);
    return t;
  };
}
