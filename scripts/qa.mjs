// Control de calidad automatizado: abre la app en Edge (headless), registra
// errores de consola y genera capturas en cada nivel de detalle.
// Uso: node scripts/qa.mjs [url] [carpeta_salida]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const URL = process.argv[2] ?? 'http://localhost:5173/';
const OUT = process.argv[3] ?? 'qa-out';
fs.mkdirSync(OUT, { recursive: true });

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--window-size=1920,1080'],
  defaultViewport: { width: 1920, height: 1080 },
});
const page = await browser.newPage();
// La guía de bienvenida se omite en las pruebas salvo QA_GUIDE=1.
if (!process.env.QA_GUIDE) await page.evaluateOnNewDocument(() => localStorage.setItem('plano-guia-v1', '1'));
const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));

await page.goto(URL, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 600));

const shot = async (name) => {
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  const info = await page.evaluate(() => ({
    lod: document.querySelector('.plan')?.getAttribute('data-lod'),
    nodes: document.querySelectorAll('.plan *').length,
  }));
  console.log(name, JSON.stringify(info));
};

const canvasCenter = await page.evaluate(() => {
  const r = document.querySelector('.plan').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, top: r.top };
});

// N1 · vista general
await shot('01-general');

// Navegación por teclado y búsqueda
const steps = JSON.parse(process.env.QA_STEPS ?? '[]');
for (const s of steps) {
  if (s.search) {
    await page.focus('.search-field input');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(s.search, { delay: 20 });
    await new Promise((r) => setTimeout(r, 250));
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 900));
  }
  if (s.key) {
    await page.keyboard.press(s.key);
    await new Promise((r) => setTimeout(r, 800));
  }
  if (s.wheel) {
    await page.mouse.move(s.wheel.x, s.wheel.y);
    for (let i = 0; i < s.wheel.n; i++) {
      await page.mouse.wheel({ deltaY: s.wheel.dy ?? -240 });
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  if (s.click) await page.mouse.click(s.click.x, s.click.y);
  if (s.dbl) {
    await page.mouse.click(s.dbl.x, s.dbl.y, { clickCount: 2 });
    await new Promise((r) => setTimeout(r, 800));
  }
  if (s.eval) await page.evaluate(s.eval);
  if (s.shot) await shot(s.shot);
}

console.log('CANVAS', JSON.stringify(canvasCenter));
console.log('PROBLEMS', problems.length);
for (const p of problems) console.log('  ', p);
await browser.close();
