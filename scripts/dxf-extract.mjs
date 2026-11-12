// Paso 1 de la exportación a AutoCAD: abre la app en modo exportación (N4 completo),
// recorre la geometría SVG renderizada y la guarda en JSON junto con los datos del modelo.
// Uso: node scripts/dxf-extract.mjs [url] [salida.json]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const URL = process.argv[2] ?? 'http://localhost:5173/';
const OUT = process.argv[3] ?? 'export/plano-data.json';

const b = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  defaultViewport: { width: 1600, height: 1000 },
});
const p = await b.newPage();
await p.evaluateOnNewDocument(() => localStorage.setItem('plano-guia-v1', '1'));
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(URL + (URL.includes('?') ? '&' : '?') + 'export', { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 800));

const data = await p.evaluate(async () => {
  /* ---------------- utilidades ---------------- */
  const world = document.querySelector('.plan > g');
  const rel = (el, ref) => ref.getCTM().inverse().multiply(el.getCTM());
  const ap = (m, x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
  const scaleOf = (m) => Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
  const isSimilar = (m) => Math.abs(m.a - m.d) < 1e-6 && Math.abs(m.b + m.c) < 1e-6;
  const r3 = (v) => Math.round(v * 1000) / 1000;

  const parseColor = (s) => {
    if (!s || s === 'none' || s === 'transparent') return null;
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (v.length >= 4 && v[3] === 0) return null;
    return [v[0], v[1], v[2]];
  };
  const paintCache = new Map();
  const paint = (val) => {
    if (!val || val === 'none') return null;
    const u = val.match(/url\(["']?#([^"')]+)["']?\)/);
    if (!u) return parseColor(val);
    if (paintCache.has(u[1])) return paintCache.get(u[1]);
    const def = document.getElementById(u[1]);
    let c = null;
    if (def) {
      const stops = [...def.querySelectorAll('stop')];
      if (stops.length) {
        // color representativo: parada central del degradado
        c = parseColor(getComputedStyle(stops[Math.floor((stops.length - 1) / 2)]).stopColor);
      } else {
        const first = def.querySelector('rect[fill]');
        const f = first ? first.getAttribute('fill') : null;
        c = f && f.startsWith('url') ? paint(getComputedStyle(first).fill) : parseColor(first ? getComputedStyle(first).fill : null);
      }
    }
    paintCache.set(u[1], c);
    return c;
  };
  const effOpacity = (el, stop) => {
    let o = 1;
    for (let n = el; n && n !== stop.parentNode; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity || '1');
    return o;
  };

  /* ---------------- trayectos SVG ---------------- */
  const NUM = /[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
  const ARGS = { M: 2, L: 2, H: 1, V: 1, Z: 0, A: 7, Q: 4, C: 6, S: 4, T: 2 };
  function parsePath(d) {
    const toks = d.match(NUM) || [];
    const subs = [];
    let cur = [0, 0], start = [0, 0], sub = null, i = 0, cmd = null;
    const open = (pt) => {
      sub = { pts: [pt], closed: false, curve: false, dAbs: `M${pt[0]} ${pt[1]}` };
      subs.push(sub);
    };
    while (i < toks.length) {
      if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
      else if (cmd === 'M') cmd = 'L';
      else if (cmd === 'm') cmd = 'l';
      const U = cmd.toUpperCase();
      const relc = cmd !== U;
      const n = ARGS[U];
      const a = toks.slice(i, i + n).map(Number);
      i += n;
      if (U === 'Z') {
        if (sub) { sub.closed = true; sub.dAbs += ' Z'; }
        cur = [...start];
        continue;
      }
      if (U === 'M') {
        cur = relc ? [cur[0] + a[0], cur[1] + a[1]] : [a[0], a[1]];
        start = [...cur];
        open([...cur]);
        continue;
      }
      if (!sub) open([...cur]);
      const ox = relc ? cur[0] : 0, oy = relc ? cur[1] : 0;
      let next;
      if (U === 'L') next = [ox + a[0], oy + a[1]];
      else if (U === 'H') next = [relc ? cur[0] + a[0] : a[0], cur[1]];
      else if (U === 'V') next = [cur[0], relc ? cur[1] + a[0] : a[0]];
      else {
        sub.curve = true;
        if (U === 'A') { next = [ox + a[5], oy + a[6]]; sub.dAbs += ` A${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${next[0]} ${next[1]}`; }
        else if (U === 'Q') { next = [ox + a[2], oy + a[3]]; sub.dAbs += ` Q${ox + a[0]} ${oy + a[1]} ${next[0]} ${next[1]}`; }
        else if (U === 'C') { next = [ox + a[4], oy + a[5]]; sub.dAbs += ` C${ox + a[0]} ${oy + a[1]} ${ox + a[2]} ${oy + a[3]} ${next[0]} ${next[1]}`; }
        else if (U === 'S') { next = [ox + a[2], oy + a[3]]; sub.dAbs += ` S${ox + a[0]} ${oy + a[1]} ${next[0]} ${next[1]}`; }
        else if (U === 'T') { next = [ox + a[0], oy + a[1]]; sub.dAbs += ` T${next[0]} ${next[1]}`; }
        cur = next;
        sub.pts.push([...next]);
        continue;
      }
      sub.dAbs += ` L${next[0]} ${next[1]}`;
      cur = next;
      sub.pts.push([...next]);
    }
    return subs;
  }
  const NS = 'http://www.w3.org/2000/svg';
  function sampleD(parent, dAbs) {
    const tmp = document.createElementNS(NS, 'path');
    tmp.setAttribute('d', dAbs);
    parent.appendChild(tmp);
    const len = tmp.getTotalLength();
    const n = Math.max(8, Math.min(240, Math.ceil(len / 0.2)));
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const q = tmp.getPointAtLength((len * k) / n);
      pts.push([q.x, q.y]);
    }
    tmp.remove();
    return pts;
  }
  function sampleEl(el) {
    const len = el.getTotalLength();
    const n = Math.max(12, Math.min(240, Math.ceil(len / 0.2)));
    const pts = [];
    for (let k = 0; k < n; k++) {
      const q = el.getPointAtLength((len * k) / n);
      pts.push([q.x, q.y]);
    }
    return pts;
  }

  /* ---------------- conversión de elementos ---------------- */
  const SKIP = '.hit, .room-hit, .shadow, .sel, .grid';
  function extract(root, ref) {
    const items = [];
    const els = root.querySelectorAll('rect, circle, ellipse, line, polyline, polygon, path, text');
    for (const el of els) {
      if (el.closest(SKIP)) continue;
      const cs = getComputedStyle(el);
      if (el.closest('[style*="display: none"]') || cs.display === 'none' || cs.visibility === 'hidden') continue;
      const op = effOpacity(el, root);
      if (op < 0.2) continue;
      const m = rel(el, ref);
      const sc = scaleOf(m);
      const role = el.closest('.callout') ? 'nota' : 'dib';

      if (el.tagName === 'text') {
        const parts = el.querySelectorAll('tspan').length ? [...el.querySelectorAll('tspan')] : [el];
        for (const t of parts) {
          const str = t.textContent;
          if (!str || !str.trim()) continue;
          const tcs = getComputedStyle(t);
          let pos;
          try { pos = t.getStartPositionOfChar(0); } catch { continue; }
          const [x, y] = ap(m, pos.x, pos.y);
          let len = 0;
          try { len = t.getComputedTextLength() * sc; } catch { /* */ }
          items.push({
            k: 'text', role, s: str, x: r3(x), y: r3(y), h: r3(parseFloat(tcs.fontSize) * sc),
            rot: r3((Math.atan2(m.b, m.a) * 180) / Math.PI), bold: parseInt(tcs.fontWeight, 10) >= 600,
            mono: /Mono/.test(tcs.fontFamily), c: parseColor(tcs.fill), len: r3(len),
          });
        }
        continue;
      }

      const sw = parseFloat(cs.strokeWidth) || 0;
      const stroke = cs.stroke !== 'none' && sw > 0 ? paint(cs.stroke) : null;
      const nonScaling = cs.vectorEffect === 'non-scaling-stroke';
      const width = stroke && !nonScaling ? r3(sw * sc) : 0;
      const dash = cs.strokeDasharray && cs.strokeDasharray !== 'none';
      const fillOp = parseFloat(cs.fillOpacity || '1') * op;
      const fill = cs.fill !== 'none' && fillOp > 0.25 ? paint(cs.fill) : null;
      if (!stroke && !fill) continue;
      const base = { role, sc: stroke, w: width, dash, fc: fill };

      const tag = el.tagName;
      let rings = [];
      if (tag === 'circle' && isSimilar(m)) {
        const [cx, cy] = ap(m, el.cx.baseVal.value, el.cy.baseVal.value);
        items.push({ ...base, k: 'circle', x: r3(cx), y: r3(cy), r: r3(el.r.baseVal.value * sc) });
        continue;
      }
      if (tag === 'line') {
        rings.push({ pts: [[el.x1.baseVal.value, el.y1.baseVal.value], [el.x2.baseVal.value, el.y2.baseVal.value]], closed: false });
      } else if (tag === 'rect') {
        const x = el.x.baseVal.value, y = el.y.baseVal.value, w = el.width.baseVal.value, h = el.height.baseVal.value;
        if (w <= 0 || h <= 0) continue;
        const rx = el.rx.baseVal.value || el.ry.baseVal.value;
        if (rx > 0.01) rings.push({ pts: sampleEl(el), closed: true });
        else rings.push({ pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], closed: true });
      } else if (tag === 'polyline' || tag === 'polygon') {
        rings.push({ pts: [...el.points].map((q) => [q.x, q.y]), closed: tag === 'polygon' });
      } else if (tag === 'circle' || tag === 'ellipse') {
        rings.push({ pts: sampleEl(el), closed: true });
      } else if (tag === 'path') {
        for (const s of parsePath(el.getAttribute('d') || '')) {
          if (s.curve) rings.push({ pts: sampleD(el.parentNode, s.dAbs), closed: s.closed });
          else rings.push({ pts: s.pts, closed: s.closed });
        }
      }
      for (const rg of rings) {
        if (rg.pts.length < 2) continue;
        items.push({ ...base, k: 'poly', closed: rg.closed, pts: rg.pts.map(([x, y]) => ap(m, x, y).map(r3)) });
      }
    }
    return items;
  }

  /* ---------------- equipos (bloques, coordenadas locales) ---------------- */
  const blocks = {};
  for (const g of document.querySelectorAll('.L-maquinaria .equip[data-id]')) {
    blocks[g.getAttribute('data-id')] = extract(g, g);
  }

  /* ---------------- capas en coordenadas de mundo ---------------- */
  const layers = {
    mobiliario: extract(document.querySelector('.furn'), world),
    senalizacion: extract(document.querySelector('.L-senalizacion'), world),
  };

  /* ---------------- datos del modelo ---------------- */
  const arch = await import('/src/model/architecture.ts');
  const eq = await import('/src/model/equipment.ts');
  const net = await import('/src/model/networks.ts');
  const cat = await import('/src/model/catalog.ts');
  const ov = await import('/src/render/Overlays.tsx');
  const eqr = await import('/src/render/equipment/index.tsx');
  const model = {
    sheet: arch.SHEET,
    wallExt: arch.WALL_EXT, wallInt: arch.WALL_INT, wallLight: arch.WALL_LIGHT,
    walls: arch.WALLS, lightWalls: arch.LIGHT_WALLS, doors: arch.DOORS, windows: arch.WINDOWS,
    rooms: arch.ROOMS, outline: arch.BUILDING_OUTLINE,
    equipment: eq.EQUIPMENT, networks: net.NETWORKS, pipes: net.PIPES, labels: net.TEXT_LABELS,
    tagPos: eqr.TAG_POS, titleLines: ov.TITLE_LINES, short: ov.SHORT,
    areaNames: Object.fromEntries([...arch.ROOMS.map((r) => [r.id, r.name]), ['exterior', cat.areaName('exterior')]]),
  };
  return { blocks, layers, model };
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data));
const nb = Object.keys(data.blocks).length;
const ni = Object.values(data.blocks).reduce((a, v) => a + v.length, 0);
console.log(`bloques: ${nb} · entidades en bloques: ${ni} · mobiliario: ${data.layers.mobiliario.length} · señalización: ${data.layers.senalizacion.length}`);
console.log('errores:', errs.length, errs.slice(0, 3));
await b.close();
