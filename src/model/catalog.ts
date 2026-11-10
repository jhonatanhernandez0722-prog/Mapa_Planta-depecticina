import { ROOMS, ROOM_BY_ID } from './architecture';
import { AREA_NAMES_EXTRA, EQUIPMENT } from './equipment';
import { NETWORKS, PIPES } from './networks';
import type { EquipKind, Equipment, LayerId, Pt, RoomCategory } from './types';

export const LAYERS: { id: LayerId; name: string; swatch: string; kind: 'fill' | 'line' | 'arrow' | 'text' }[] = [
  { id: 'estructura', name: 'Estructura arquitectónica', swatch: '#7d848b', kind: 'fill' },
  { id: 'divisiones', name: 'Divisiones y habitaciones', swatch: '#b7bdc3', kind: 'fill' },
  { id: 'maquinaria', name: 'Maquinaria', swatch: '#5d7c99', kind: 'fill' },
  { id: 'agua', name: 'Tuberías de agua potable', swatch: 'var(--c-agua)', kind: 'line' },
  { id: 'residuos', name: 'Tuberías de residuos', swatch: 'var(--c-residuos)', kind: 'arrow' },
  { id: 'proceso', name: 'Flujo de proceso', swatch: 'var(--c-proceso)', kind: 'arrow' },
  { id: 'personal', name: 'Recorridos de personal', swatch: 'var(--c-personal)', kind: 'arrow' },
  { id: 'senalizacion', name: 'Señalización', swatch: '#f2c230', kind: 'fill' },
  { id: 'etiquetas', name: 'Etiquetas e identificadores', swatch: '#1f2933', kind: 'text' },
];

export const CATEGORY_LABEL: Record<RoomCategory, string> = {
  produccion: 'Producción',
  almacen: 'Almacenamiento',
  servicios: 'Servicios',
  administracion: 'Administración',
  laboratorio: 'Laboratorio',
  sanitario: 'Sanitario',
  circulacion: 'Circulación',
  exterior: 'Exterior',
};

export const KIND_LABEL: Record<EquipKind, string> = {
  bascula: 'Pesaje',
  carro: 'Transporte interno',
  lavadora: 'Lavado',
  trituradora: 'Reducción de tamaño',
  cortadora: 'Reducción de tamaño',
  molinoMartillos: 'Reducción de tamaño',
  reactor: 'Reactor',
  filtroPrensa: 'Separación sólido-líquido',
  tanquePrecipitacion: 'Tanque de proceso',
  secadorSpray: 'Secado',
  ciclon: 'Separación gas-sólido',
  molinoPines: 'Molienda',
  envasadora: 'Envasado',
  paletizado: 'Manejo de producto',
  rack: 'Almacenamiento',
  pilaPallets: 'Almacenamiento',
  camion: 'Vehículo',
  unidadPtar: 'Tratamiento de aguas',
  tanqueVertical: 'Tanque de almacenamiento',
  caldera: 'Servicios térmicos',
  tablero: 'Auxiliar',
  campana: 'Laboratorio',
  mesadaLab: 'Laboratorio',
  islaLab: 'Laboratorio',
  equipoLab: 'Laboratorio',
  tarja: 'Laboratorio',
  estufaLab: 'Laboratorio',
  autoclave: 'Laboratorio',
  refrigerador: 'Laboratorio',
  computador: 'Laboratorio',
  passBox: 'Laboratorio',
  dique: 'Contención',
  garrafa: 'Reactivo',
  tambor: 'Insumo',
  lavamanos: 'Sanitario',
  pediluvio: 'Sanitario',
};

export function areaName(id: string) {
  return ROOM_BY_ID[id]?.name ?? AREA_NAMES_EXTRA[id] ?? id;
}

/** Conexiones deducidas geométricamente: redes/tuberías con algún vértice dentro de la huella del equipo. */
export function connectionsOf(e: Equipment) {
  const m = 4;
  const inside = (p: Pt) =>
    p[0] >= e.x - e.w / 2 - m && p[0] <= e.x + e.w / 2 + m && p[1] >= e.y - e.h / 2 - m && p[1] <= e.y + e.h / 2 + m;
  const out: { id: string; name: string; color: string }[] = [];
  const seen = new Set<string>();
  for (const n of NETWORKS) {
    // Se excluyen flechas indicativas (tránsito, carros, sentido) que no son conexiones físicas.
    if (n.layer === 'personal' || (n.id.startsWith('pr-') && !n.style) || n.id.startsWith('res-ind')) continue;
    if (n.pts.some(inside) && !seen.has(n.name)) {
      seen.add(n.name);
      const color = n.style === 'lavado' ? 'var(--c-lavado)' : n.style === 'etanol' ? 'var(--c-etanol)' : `var(--c-${n.layer})`;
      out.push({ id: n.id, name: n.name, color });
    }
  }
  for (const p of PIPES) {
    if (p.pts.some(inside) && !seen.has(p.name)) {
      seen.add(p.name);
      out.push({ id: p.id, name: p.name, color: '#8a95a1' });
    }
  }
  return out;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface SearchHit {
  type: 'equip' | 'room';
  id: string;
  title: string;
  sub: string;
  tag?: string;
}

type Indexed = SearchHit & { key: string; hay: string };

/** key = campos principales (nombre, tag, rótulo); hay = todo el texto buscable. */
const INDEX: Indexed[] = [
  ...ROOMS.map((r) => ({
    type: 'room' as const, id: r.id, title: r.name, sub: CATEGORY_LABEL[r.category],
    key: norm([r.name, r.sub, r.rotulo].filter(Boolean).join(' ')),
    hay: norm([r.name, r.sub, r.rotulo, r.descripcion, CATEGORY_LABEL[r.category]].filter(Boolean).join(' ')),
  })),
  ...EQUIPMENT.map((e) => ({
    type: 'equip' as const, id: e.id, title: e.name, sub: areaName(e.room), tag: e.tag,
    key: norm([e.tag, e.tag?.replace('-', ''), e.name, e.rotulo].filter(Boolean).join(' ')),
    hay: norm([e.tag, e.tag?.replace('-', ''), e.name, e.rotulo, e.funcion, KIND_LABEL[e.kind], areaName(e.room)].filter(Boolean).join(' ')),
  })),
];

const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordStart = (h: string, t: string) => new RegExp(`(^|[^a-z0-9])${escapeRe(t)}`).test(h);

export function search(q: string): SearchHit[] {
  const toks = norm(q).split(/\s+/).filter(Boolean);
  if (!toks.length) return [];
  const scored: { h: Indexed; s: number }[] = [];
  for (const h of INDEX) {
    let s = 0;
    let ok = true;
    for (const t of toks) {
      if (h.key.includes(t)) s += wordStart(h.key, t) ? 6 : 3;
      else if (h.hay.includes(t)) s += wordStart(h.hay, t) ? 1.5 : 0.5;
      else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const t0 = toks.join(' ');
    if (h.tag && norm(h.tag).startsWith(t0)) s += 8;
    if (norm(h.title).startsWith(t0)) s += 4;
    scored.push({ h, s });
  }
  scored.sort((a, b) => b.s - a.s || a.h.title.localeCompare(b.h.title));
  return scored.slice(0, 14).map(({ h }) => ({ type: h.type, id: h.id, title: h.title, sub: h.sub, tag: h.tag }));
}

export function polyArea(poly: Pt[]) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}
