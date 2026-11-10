// Prueba en móvil emulado (390×844, táctil): guía, menú desplegable, búsqueda, hoja inferior y doble toque.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
const URL = process.argv[2] ?? 'http://localhost:5173/';
const OUT = process.argv[3] ?? 'qa-out/mobile';
fs.mkdirSync(OUT, { recursive: true });
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const p = await b.newPage();
await p.emulate({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
});
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (n) => { await wait(700); await p.screenshot({ path: path.join(OUT, `${n}.png`) }); console.log('shot', n, await p.evaluate(() => document.querySelector('.plan').dataset.lod)); };
await p.goto(URL, { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await shot('m1-guia');
await p.click('.guide .btn.primary');
await shot('m2-plano');
await p.tap('.menu-btn');
await shot('m3-menu');
await p.tap('.search-field input');
await p.keyboard.type('R-201 A', { delay: 20 });
await wait(300);
await p.keyboard.press('Enter');
await wait(900);
await shot('m4-seleccion');
const visible = await p.evaluate(() => {
  const s = document.querySelector('.sidebar').getBoundingClientRect();
  const info = document.querySelector('.info')?.getBoundingClientRect();
  return { drawerRight: Math.round(s.right), infoTop: info && Math.round(info.top) };
});
console.log('estado', JSON.stringify(visible));
await p.tap('.info .icon-btn');
await wait(300);
// doble toque en el centro del plano
const c = await p.evaluate(() => { const r = document.querySelector('.plan').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
const k0 = await p.evaluate(() => document.querySelector('.plan > g').getAttribute('transform'));
await p.touchscreen.tap(c.x, c.y);
await wait(90);
await p.touchscreen.tap(c.x, c.y);
await wait(900);
const k1 = await p.evaluate(() => document.querySelector('.plan > g').getAttribute('transform'));
console.log('doble toque cambia zoom:', k0 !== k1);
await shot('m5-doble-toque');
console.log('errores:', errs.length, errs.slice(0, 5));
await b.close();
