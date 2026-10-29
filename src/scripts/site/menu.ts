// #7 Mobile menu sheet: a modal <dialog> (focus trap, Esc and inert page for free). Locks page scroll,
// stops Lenis, closes at the lg breakpoint or when a link is followed, and returns focus to the burger.
// Animations (sheet fade, burger -> X, staggered rows) are CSS in global.css (.menu).
import { getLenis, onPageLoad } from '../motion/core';

onPageLoad(() => {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !opener) return;
  const html = document.documentElement;
  const wide = matchMedia('(min-width: 64rem)');

  const open = () => {
    if (dialog.open || wide.matches) return;
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
    html.classList.add('menu-open');
    getLenis()?.stop();
  };
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const onClose = () => {
    opener.setAttribute('aria-expanded', 'false');
    html.classList.remove('menu-open');
    getLenis()?.start();
  };
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    if (t.closest('[data-menu-close]')) return close();
    // Following a link (including the current page) closes the sheet first.
    if (t.closest('a[href]')) close();
  };
  const onWide = () => wide.matches && close();

  opener.addEventListener('click', open);
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', onClose);
  wide.addEventListener('change', onWide);
  document.addEventListener('astro:before-preparation', close);

  return () => {
    close();
    opener.removeEventListener('click', open);
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('close', onClose);
    wide.removeEventListener('change', onWide);
    document.removeEventListener('astro:before-preparation', close);
  };
});
