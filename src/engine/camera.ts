import type { Box, Lod } from '../model/types';

/**
 * Estado de cámara.
 *   k  = escala en px de pantalla por unidad de mundo
 *   x,y = traslación (px)
 * Pantalla = mundo * k + (x, y)
 */
export interface Camera {
  k: number;
  x: number;
  y: number;
  vw: number;
  vh: number;
}

/** Umbrales de nivel de detalle (px por unidad de mundo). */
export const LOD_THRESHOLDS: [number, number, number] = [2.6, 6, 14];
export const K_MAX = 72;

export const LOD_NAMES: Record<Lod, string> = {
  1: 'Vista general',
  2: 'Vista de áreas',
  3: 'Vista de maquinaria',
  4: 'Vista de detalle',
};

export function lodFor(k: number): Lod {
  if (k < LOD_THRESHOLDS[0]) return 1;
  if (k < LOD_THRESHOLDS[1]) return 2;
  if (k < LOD_THRESHOLDS[2]) return 3;
  return 4;
}

/** Escala cuantizada (pasos geométricos de 1,35×) para grosores "casi constantes" en pantalla. */
const ZQ_STEP = Math.log(1.35);
export function quantizeK(k: number) {
  return Math.exp(Math.round(Math.log(k) / ZQ_STEP) * ZQ_STEP);
}

/** Rectángulo visible en coordenadas de mundo. */
export function viewRect(c: Camera, margin = 0): Box {
  const x = -c.x / c.k;
  const y = -c.y / c.k;
  const w = c.vw / c.k;
  const h = c.vh / c.k;
  return { x: x - w * margin, y: y - h * margin, w: w * (1 + 2 * margin), h: h * (1 + 2 * margin) };
}

export function intersects(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* ------------------------------------------------------------------ */
/*  Store externo (useSyncExternalStore) para HUD de alta frecuencia   */
/* ------------------------------------------------------------------ */

type Listener = () => void;

class Store<T> {
  private v: T;
  private ls = new Set<Listener>();
  constructor(v: T) {
    this.v = v;
  }
  get = () => this.v;
  set(v: T) {
    this.v = v;
    this.ls.forEach((l) => l());
  }
  subscribe = (l: Listener) => {
    this.ls.add(l);
    return () => {
      this.ls.delete(l);
    };
  };
}

export const cameraStore = new Store<Camera>({ k: 1, x: 0, y: 0, vw: 1, vh: 1 });
export const cursorStore = new Store<{ x: number; y: number } | null>(null);

/**
 * Estado derivado de la cámara que SÍ provoca re-render del plano:
 * cambia sólo al cruzar un umbral de LOD, un paso de zq o una celda de culling.
 */
export interface RenderView {
  lod: Lod;
  zq: number;
  /** Ventana de culling (mundo), ajustada a una rejilla para estabilidad. */
  cull: Box;
}

const CULL_GRID = 40;

export function deriveView(c: Camera): RenderView {
  const lod = lodFor(c.k);
  const zq = quantizeK(c.k);
  // En niveles 1-2 todo el plano se dibuja simplificado: no hace falta culling
  // (evita re-renders al desplazarse).
  if (lod <= 2) return { lod, zq, cull: { x: -1e5, y: -1e5, w: 2e5, h: 2e5 } };
  const r = viewRect(c, 0.35);
  const x0 = Math.floor(r.x / CULL_GRID) * CULL_GRID;
  const y0 = Math.floor(r.y / CULL_GRID) * CULL_GRID;
  const x1 = Math.ceil((r.x + r.w) / CULL_GRID) * CULL_GRID;
  const y1 = Math.ceil((r.y + r.h) / CULL_GRID) * CULL_GRID;
  return { lod, zq, cull: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } };
}

export function sameView(a: RenderView, b: RenderView) {
  return (
    a.lod === b.lod &&
    a.zq === b.zq &&
    a.cull.x === b.cull.x &&
    a.cull.y === b.cull.y &&
    a.cull.w === b.cull.w &&
    a.cull.h === b.cull.h
  );
}

/** Escala estimada: 1 unidad ≈ 0,1 m. */
export const METERS_PER_UNIT = 0.1;
