// #14 Portrait "source code" canvas (docs/framer-animations.md). The photo starts as a field of code
// glyphs shaped by its brightness; a coral scan line "compiles" it into the photo. Pointer = a lens of
// code, "View source" = sweep to code and back, idle = an occasional diagonal glint.
// Cost control: the loop runs on gsap.ticker only while something moves, stops off-screen
// (IntersectionObserver ≥ 5%), and the module is never loaded with reduced motion.
import { gsap } from '../motion/core';
import { readyCapped } from '../motion/page';

const CODE = `export default function Engineer() { const stack = ['TypeScript', 'Node.js', 'PostgreSQL', 'React']; const [shipping, setShipping] = useState(true); useEffect(() => { if (!tests.pass) return rollback(); deploy({ env: 'production', reviewed: true }); }, [main]); return ( <Profile name="Boko Isaac" role="full-stack engineer" years={6} languages={['en', 'fr']}> {stack.map((tool) => <Key key={tool} label={tool} />)} <Status open={shipping}>just works.</Status> </Profile> ); } `;

const BG = '#0b0c0e';
const INK = '#f1f2ec';
const CORAL = '#ff7f50';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function startSourceCanvas(hero: HTMLElement): () => void {
  const box = hero.querySelector<HTMLElement>('[data-portrait]');
  const img = box?.querySelector('img');
  const toggle = hero.querySelector<HTMLButtonElement>('[data-source-toggle]');
  const label = toggle?.querySelector<HTMLElement>('[data-source-label]');
  if (!box || !img) return () => {};

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  img.after(canvas);
  const ctx = canvas.getContext('2d')!;

  let alive = true;
  let visible = true;
  let running = false;
  let introPending = true;
  let last = 0;

  // Grid
  let W = 0, H = 0, dpr = 1, cw = 10, ch = 20, cols = 0, rows = 0, radius = 136, font = '';
  let luma = new Float32Array(0);
  let lens = new Float32Array(0);
  let amt = new Float32Array(0);
  let rowVal = new Float32Array(0);
  let rowTarget = new Float32Array(0);

  // State: mode 0 = photo ("render"), 1 = code ("source").
  let mode = 0;
  let sweep: { t0: number; dur: number; target: number } | null = null;
  let scanY = -1;
  let px = 0, py = 0, lensUntil = 0, lensAny = false;
  let glint: { t0: number } | null = null;
  let glintTimer = 0;

  const fontFor = (cell: number) => `500 ${cell * 1.55}px "JetBrains Mono", ui-monospace, monospace`;

  function sampleLuma() {
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const o = off.getContext('2d', { willReadFrequently: true })!;
    luma = new Float32Array(cols * rows);
    try {
      // Same cover fit and focus as the <img> (object-position), so the code lines up with the photo.
      const iw = img!.naturalWidth, ih = img!.naturalHeight;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s, dh = ih * s;
      const [fx, fy] = getComputedStyle(img!).objectPosition.split(' ').map((v) => (parseFloat(v) || 0) / 100);
      o.drawImage(img!, ((W - dw) * fx) / cw, ((H - dh) * (fy ?? 0.5)) / ch, dw / cw, dh / ch);
      const d = o.getImageData(0, 0, cols, rows).data;
      let min = 1, max = 0;
      for (let i = 0; i < luma.length; i++) {
        const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
        luma[i] = l;
        min = Math.min(min, l);
        max = Math.max(max, l);
      }
      const span = max - min || 1;
      for (let i = 0; i < luma.length; i++) luma[i] = Math.pow((luma[i] - min) / span, 0.62);
    } catch {
      for (let i = 0; i < luma.length; i++) luma[i] = Math.random(); // tainted canvas: noise, as the template
    }
  }

  function build() {
    const r = box!.getBoundingClientRect();
    W = Math.round(r.width);
    H = Math.round(r.height);
    if (!W || !H) return false;
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const small = W < 520;
    cw = small ? 6 : 10;
    ch = cw * 2;
    radius = small ? 80 : 136;
    font = fontFor(cw);
    cols = Math.ceil(W / cw);
    rows = Math.ceil(H / ch);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    // Before the intro the whole grid is code; after a resize it snaps to the current mode.
    const state = introPending ? 1 : sweep ? sweep.target : mode;
    sweep = null;
    rowVal = new Float32Array(rows).fill(state);
    rowTarget = new Float32Array(rows).fill(state);
    lens = new Float32Array(cols * rows);
    amt = new Float32Array(cols * rows);
    sampleLuma();
    return true;
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    let gc = -1, gw = 5 * cw;
    if (glint) gc = -gw + ((now - glint.t0) / 1500) * (W + H + 2 * gw);
    let any = false;
    for (let r = 0; r < rows; r++) {
      const base = rowVal[r];
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        let a = base + (1 - 2 * base) * lens[i];
        if (gc > -gw) {
          const g = 0.85 * (1 - Math.abs(c * cw + r * ch - gc) / (2.5 * cw));
          if (g > a) a = g;
        }
        amt[i] = a;
        if (a > 0.004) any = true;
      }
    }
    if (!any) return;

    ctx.fillStyle = BG;
    for (let i = 0; i < amt.length; i++) {
      if (amt[i] <= 0.004) continue;
      ctx.globalAlpha = 0.84 * amt[i];
      ctx.fillRect((i % cols) * cw, Math.floor(i / cols) * ch, cw, ch);
    }
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const scanRow = scanY >= 0 ? Math.floor(scanY / ch) : -1;
    for (const ink of [true, false]) {
      ctx.fillStyle = ink ? INK : CORAL;
      for (let i = 0; i < amt.length; i++) {
        const a = amt[i];
        if (a <= 0.004) continue;
        const r = Math.floor(i / cols);
        if ((luma[i] > 0.66 || r === scanRow) !== ink) continue;
        const g = CODE[i % CODE.length];
        if (g === ' ') continue;
        ctx.globalAlpha = (0.1 + 0.9 * luma[i]) * a;
        ctx.fillText(g, (i % cols) * cw + cw / 2, r * ch + ch / 2);
      }
    }
    if (scanY >= 0) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = CORAL;
      ctx.fillRect(0, scanY - 0.75, W, 1.5);
    }
  }

  function tick() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let busy = false;

    scanY = -1;
    if (sweep) {
      const t = (now - sweep.t0) / sweep.dur;
      if (t >= 1) {
        rowTarget.fill(sweep.target);
        sweep = null;
      } else {
        scanY = easeInOutCubic(Math.max(0, t)) * H;
        const passed = Math.min(rows, Math.floor(scanY / ch));
        for (let r = 0; r < passed; r++) rowTarget[r] = sweep.target;
      }
      busy = true;
    }

    const k = Math.min(1, dt * 9);
    for (let r = 0; r < rows; r++) {
      const d = rowTarget[r] - rowVal[r];
      if (Math.abs(d) < 0.003) rowVal[r] = rowTarget[r];
      else {
        rowVal[r] += d * k;
        busy = true;
      }
    }

    const pointerOn = now < lensUntil;
    if (pointerOn || lensAny) {
      const decay = 1.05 * dt;
      lensAny = false;
      for (let i = 0; i < lens.length; i++) {
        if (lens[i] > 0) {
          lens[i] = Math.max(0, lens[i] - decay);
          if (lens[i] > 0) lensAny = true;
        }
      }
      if (pointerOn) {
        const r2 = radius * radius;
        const c0 = Math.max(0, Math.floor((px - radius) / cw)), c1 = Math.min(cols - 1, Math.ceil((px + radius) / cw));
        const r0 = Math.max(0, Math.floor((py - radius) / ch)), r1 = Math.min(rows - 1, Math.ceil((py + radius) / ch));
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const dx = c * cw + cw / 2 - px, dy = r * ch + ch / 2 - py;
            const s = Math.min(1, (1 - (dx * dx + dy * dy) / r2) * 1.6);
            const i = r * cols + c;
            if (s > lens[i]) {
              lens[i] = s;
              lensAny = true;
            }
          }
        }
      }
      busy ||= pointerOn || lensAny;
    }

    if (glint) {
      if (now - glint.t0 > 1500) glint = null;
      else busy = true;
    }

    draw();
    if (!busy) stop();
  }

  function wake() {
    if (running || !visible || !alive || !W) return;
    running = true;
    clearTimeout(glintTimer);
    last = performance.now();
    gsap.ticker.add(tick);
  }
  function stop() {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
    armGlint();
  }
  function armGlint() {
    clearTimeout(glintTimer);
    if (!visible || !alive) return;
    glintTimer = window.setTimeout(() => {
      if (mode === 0 && !running && !sweep && visible && !introPending) {
        glint = { t0: performance.now() };
        wake();
      } else armGlint();
    }, 5200);
  }

  function startSweep(target: number, dur: number) {
    glint = null;
    sweep = { t0: performance.now(), dur, target };
    wake();
  }

  // Pointer lens (mouse/pen: follows; touch: a 500 ms tap).
  const local = (e: PointerEvent) => {
    const r = box.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
    return px >= -radius && py >= -radius && px <= r.width + radius && py <= r.height + radius;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || introPending) return;
    if (!local(e)) return;
    lensUntil = performance.now() + 2400;
    wake();
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch' || introPending) return;
    if (!local(e)) return;
    lensUntil = performance.now() + 500;
    wake();
  };
  const onLeave = () => (lensUntil = 0);

  const onToggle = () => {
    if (introPending) return;
    mode = mode ? 0 : 1;
    toggle!.setAttribute('aria-pressed', String(mode === 1));
    toggle!.dataset.cursor = mode ? 'Compile' : 'Decompile';
    if (label) label.textContent = mode ? 'View render' : 'View source';
    startSweep(mode, 900);
  };

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (!visible) {
        if (running) {
          running = false;
          gsap.ticker.remove(tick);
        }
        clearTimeout(glintTimer);
      } else if (introPending && W) {
        introPending = false;
        startSweep(0, 2400);
      } else if (sweep || lensAny || rowVal.some((v, r) => v !== rowTarget[r])) wake();
      else armGlint();
    },
    { threshold: 0.05 },
  );

  let resizeFrame = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const r = box.getBoundingClientRect();
      if (!alive || !W || (Math.round(r.width) === W && Math.round(r.height) === H)) return;
      if (build()) draw();
    });
  });

  (async () => {
    await Promise.all([img.decode().catch(() => {}), document.fonts.load(fontFor(10)).catch(() => {})]);
    if (!alive || !build()) return;
    // Paint the code field now (under the loader if it is still up), then compile once uncovered.
    const covered = document.documentElement.classList.contains('is-holding');
    if (!covered) {
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity .4s ease';
      requestAnimationFrame(() => (canvas.style.opacity = '1'));
    }
    draw();
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerdown', onDown);
    hero.addEventListener('pointerleave', onLeave);
    if (toggle) {
      toggle.removeAttribute('aria-hidden');
      toggle.removeAttribute('tabindex');
      toggle.style.pointerEvents = 'auto';
      toggle.addEventListener('click', onToggle);
    }
    ro.observe(box);
    await readyCapped();
    if (!alive) return;
    io.observe(hero); // first callback starts the intro sweep if the hero is on screen
  })();

  return () => {
    alive = false;
    gsap.ticker.remove(tick);
    clearTimeout(glintTimer);
    cancelAnimationFrame(resizeFrame);
    io.disconnect();
    ro.disconnect();
    hero.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerdown', onDown);
    hero.removeEventListener('pointerleave', onLeave);
    if (toggle) {
      toggle.removeEventListener('click', onToggle);
      toggle.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('tabindex', '-1');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.style.pointerEvents = '';
    }
    canvas.remove();
  };
}
