// Superpone el render vectorial (vista N1, sin minimapa) con la imagen de referencia.
import puppeteer from 'puppeteer-core';
const OUT = process.argv[2];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, defaultViewport: { width: 1920, height: 1080 } });
const p = await b.newPage();
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await p.click('button[title="Minimapa"]');
await p.addStyleTag({ content: '.canvas-hint,.scalebar{display:none!important}' });
await new Promise((r) => setTimeout(r, 800));
const t = await p.evaluate(() => {
  const g = document.querySelector('.plan > g');
  const r = document.querySelector('.plan').getBoundingClientRect();
  const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)/);
  return { left: r.left, top: r.top, x: +m[1], y: +m[2], k: +m[3] };
});
const clip = { x: t.left + t.x, y: t.top + t.y, width: 1158 * t.k, height: 649 * t.k };
await p.screenshot({ path: `${OUT}/render-n1.png`, clip });
console.log(JSON.stringify(t));
await b.close();
