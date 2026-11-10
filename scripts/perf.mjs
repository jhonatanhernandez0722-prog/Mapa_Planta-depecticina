// Mide la fluidez durante zoom y desplazamiento continuos (frames y tareas largas).
import puppeteer from 'puppeteer-core';
const URL = process.argv[2] ?? 'http://localhost:5173/';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, defaultViewport: { width: 1920, height: 1080 } });
const p = await b.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 800));
await p.evaluate(() => {
  window.__frames = [];
  window.__long = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ type: 'longtask', buffered: false });
  let last = performance.now();
  const loop = (t) => { window.__frames.push(t - last); last = t; window.__raf = requestAnimationFrame(loop); };
  window.__raf = requestAnimationFrame(loop);
});
const run = async (label, fn) => {
  await p.evaluate(() => { window.__frames = []; window.__long = []; });
  const t0 = Date.now();
  await fn();
  const r = await p.evaluate(() => {
    const f = window.__frames.slice(1).sort((a, b) => a - b);
    const q = (x) => f[Math.min(f.length - 1, Math.floor(f.length * x))] ?? 0;
    return { frames: f.length, p50: q(0.5).toFixed(1), p95: q(0.95).toFixed(1), max: (f[f.length - 1] ?? 0).toFixed(1), longTasks: window.__long.length, longMax: Math.max(0, ...window.__long).toFixed(0), nodes: document.querySelectorAll('.plan *').length };
  });
  console.log(label.padEnd(34), `${Date.now() - t0}ms`, JSON.stringify(r));
};
// Zoom continuo de N1 a N4 sobre hidrólisis
await run('zoom in N1->N4 (60 ticks)', async () => {
  await p.mouse.move(979, 390);
  for (let i = 0; i < 60; i++) { await p.mouse.wheel({ deltaY: -60 }); await new Promise((r) => setTimeout(r, 16)); }
});
await run('pan en N4 (arrastre 1200px)', async () => {
  await p.mouse.move(1200, 600); await p.mouse.down();
  for (let i = 0; i < 60; i++) { await p.mouse.move(1200 - i * 20, 600 - i * 3); await new Promise((r) => setTimeout(r, 16)); }
  await p.mouse.up();
});
await run('zoom out N4->N1 (60 ticks)', async () => {
  for (let i = 0; i < 60; i++) { await p.mouse.wheel({ deltaY: 60 }); await new Promise((r) => setTimeout(r, 16)); }
});
await run('pan en N1 (arrastre)', async () => {
  await p.mouse.move(900, 500); await p.mouse.down();
  for (let i = 0; i < 40; i++) { await p.mouse.move(900 + i * 10, 500); await new Promise((r) => setTimeout(r, 16)); }
  await p.mouse.up();
});
console.log('errores:', errs.length, errs.slice(0, 5));
await b.close();
