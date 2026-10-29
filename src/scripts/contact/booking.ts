// Intro-call picker on /contact (Paper "Book a Call"). It shows Boko's usual intro-call hours and hands the
// chosen time to Cal.com, which holds the real calendar: Confirm opens cal.com/bokox/intro on that day and slot.
// Hours: Tue–Thu, 09:00 / 10:30 / 13:00 / 15:30 / 16:00 in Boko's time (GMT+1, Africa/Lagos, no DST),
// from tomorrow up to eight weeks ahead, shown in the visitor's own time zone.
import { onPageLoad } from '../motion/core';

const HOST_OFFSET = 1; // hours east of UTC
const DAYS = new Set([2, 3, 4]); // Tue, Wed, Thu (getUTCDay of the host-local date)
const SLOTS = ['09:00', '10:30', '13:00', '15:30', '16:00'];
const WEEKS = 8;

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Slot start times (as Dates) for a host-local calendar date. */
function slotsFor(y: number, m: number, d: number): Date[] {
  return SLOTS.map((t) => {
    const [h, min] = t.split(':').map(Number);
    return new Date(Date.UTC(y, m, d, h - HOST_OFFSET, min));
  });
}

function setup(root: HTMLElement, signal: AbortSignal) {
  const cal = root.dataset.cal!;
  const monthEl = root.querySelector<HTMLElement>('[data-cal-month]')!;
  const daysEl = root.querySelector<HTMLElement>('[data-cal-days]')!;
  const slotsEl = root.querySelector<HTMLElement>('[data-cal-slots]')!;
  const dateEl = root.querySelector<HTMLElement>('[data-cal-date]')!;
  const tzEl = root.querySelector<HTMLElement>('[data-cal-tz]')!;
  const prev = root.querySelector<HTMLButtonElement>('[data-cal-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-cal-next]')!;

  // Every bookable slot in the window, grouped by the visitor's local date.
  const now = new Date();
  const end = new Date(now.getTime() + WEEKS * 7 * 864e5);
  const byDay = new Map<string, Date[]>();
  for (let t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1); t <= end.getTime(); t += 864e5) {
    const host = new Date(t);
    if (!DAYS.has(host.getUTCDay())) continue;
    for (const s of slotsFor(host.getUTCFullYear(), host.getUTCMonth(), host.getUTCDate())) {
      if (s.getTime() < now.getTime() + 12 * 36e5) continue; // at least 12 hours' notice
      const key = ymd(s);
      byDay.set(key, [...(byDay.get(key) ?? []), s]);
    }
  }
  const days = [...byDay.keys()].sort();
  if (!days.length) return;

  let selected = days[0];
  let slot: Date | null = null;
  const first = new Date(`${days[0]}T00:00`);
  const last = new Date(`${days[days.length - 1]}T00:00`);
  let view = new Date(first.getFullYear(), first.getMonth(), 1);

  const tzName = new Intl.DateTimeFormat('en-GB', { timeZoneName: 'shortOffset' }).formatToParts(now).find((p) => p.type === 'timeZoneName')?.value ?? '';
  tzEl.textContent = tzName === 'GMT' ? 'GMT+0' : tzName;
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  const renderDays = () => {
    monthEl.textContent = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    prev.disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
    next.disabled = view >= new Date(last.getFullYear(), last.getMonth(), 1);
    const lead = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7; // Monday first
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: HTMLElement[] = [];
    for (let i = 0; i < lead; i++) cells.push(Object.assign(document.createElement('span'), { className: 'cal-day' }));
    for (let d = 1; d <= count; d++) {
      const key = ymd(new Date(view.getFullYear(), view.getMonth(), d));
      const label = new Date(view.getFullYear(), view.getMonth(), d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      if (byDay.has(key)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cal-day';
        b.textContent = String(d);
        b.dataset.day = key;
        b.setAttribute('aria-pressed', String(key === selected));
        b.setAttribute('aria-label', `${label}, ${byDay.get(key)!.length} times free`);
        cells.push(b);
      } else {
        const s = document.createElement('span');
        s.className = 'cal-day';
        s.textContent = String(d);
        s.setAttribute('aria-label', `${label}, unavailable`);
        cells.push(s);
      }
    }
    daysEl.replaceChildren(...cells);
  };

  const renderSlots = () => {
    const d = new Date(`${selected}T00:00`);
    dateEl.textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    slotsEl.replaceChildren(
      ...(byDay.get(selected) ?? []).map((s) => {
        const li = document.createElement('li');
        const on = slot?.getTime() === s.getTime();
        if (on) {
          // Chosen slot: a coral row with the time and a link to finish booking on Cal.com.
          const row = document.createElement('div');
          row.className = 'cal-slot is-on';
          const t = document.createElement('span');
          t.textContent = time.format(s);
          const confirm = document.createElement('a');
          confirm.className = 'cal-confirm';
          confirm.textContent = 'Confirm';
          confirm.href = `${cal}?month=${selected.slice(0, 7)}&date=${selected}&slot=${encodeURIComponent(s.toISOString())}`;
          confirm.target = '_blank';
          confirm.rel = 'noopener';
          confirm.setAttribute('aria-label', `Confirm ${time.format(s)} on Cal.com (opens in a new tab)`);
          row.append(t, confirm);
          li.append(row);
        } else {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'cal-slot';
          b.dataset.slot = s.toISOString();
          b.textContent = time.format(s);
          li.append(b);
        }
        return li;
      }),
    );
  };

  daysEl.addEventListener(
    'click',
    (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-day]');
      if (!b) return;
      selected = b.dataset.day!;
      slot = null;
      renderDays();
      renderSlots();
      daysEl.querySelector<HTMLButtonElement>(`[data-day="${selected}"]`)?.focus();
    },
    { signal },
  );
  slotsEl.addEventListener(
    'click',
    (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-slot]');
      if (!b) return;
      slot = new Date(b.dataset.slot!);
      renderSlots();
      slotsEl.querySelector<HTMLElement>('.cal-confirm')?.focus();
    },
    { signal },
  );
  prev.addEventListener('click', () => ((view = new Date(view.getFullYear(), view.getMonth() - 1, 1)), renderDays()), { signal });
  next.addEventListener('click', () => ((view = new Date(view.getFullYear(), view.getMonth() + 1, 1)), renderDays()), { signal });

  renderDays();
  renderSlots();
}

onPageLoad(() => {
  const root = document.querySelector<HTMLElement>('[data-cal]');
  if (!root) return;
  const ac = new AbortController();
  setup(root, ac.signal);
  return () => ac.abort();
});
