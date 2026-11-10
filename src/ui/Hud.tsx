import { useRef, useSyncExternalStore, type PointerEvent as RPointerEvent } from 'react';
import { BUILDING_OUTLINE, ROOMS, SHEET, WALLS } from '../model/architecture';
import { EQUIPMENT } from '../model/equipment';
import type { Lod } from '../model/types';
import { LOD_NAMES, METERS_PER_UNIT, cameraStore, cursorStore, lodFor, viewRect } from '../engine/camera';
import type { PlanController } from '../render/Plan';
import { Icon } from './Icon';

const useCamera = () => useSyncExternalStore(cameraStore.subscribe, cameraStore.get);
const useCursor = () => useSyncExternalStore(cursorStore.subscribe, cursorStore.get);

function fitK(vw: number, vh: number) {
  return Math.min((vw - 56) / SHEET.w, (vh - 56) / SHEET.h);
}

/* ---------------- Indicador de zoom ---------------- */
export function ZoomReadout() {
  const c = useCamera();
  const pct = Math.round((c.k / fitK(c.vw, c.vh)) * 100);
  return <span className="zoom-readout mono">{pct}%</span>;
}

/* ---------------- Indicador de nivel de detalle ---------------- */
export function LodIndicator({ controller }: { controller: React.MutableRefObject<PlanController | null> }) {
  const c = useCamera();
  const lod = lodFor(c.k);
  return (
    <div className="lod-ind" role="group" aria-label="Nivel de detalle">
      {([1, 2, 3, 4] as Lod[]).map((l) => (
        <button
          key={l}
          className={`lod-seg ${l === lod ? 'on' : ''} ${l < lod ? 'past' : ''}`}
          onClick={() => controller.current?.zoomToLod(l)}
          title={`N${l} · ${LOD_NAMES[l]}`}
        >
          <span className="mono">N{l}</span>
        </button>
      ))}
      <span className="lod-name">{LOD_NAMES[lod]}</span>
    </div>
  );
}

/* ---------------- Barra de escala ---------------- */
const NICE = [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100];
export function ScaleBar() {
  const c = useCamera();
  const mPerPx = METERS_PER_UNIT / c.k;
  const target = 120 * mPerPx;
  const m = NICE.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), NICE[0]);
  const wpx = m / mPerPx;
  return (
    <div className="scalebar">
      <div className="scalebar-bar" style={{ width: wpx }}>
        <span />
        <span />
      </div>
      <div className="scalebar-txt mono">
        {m.toLocaleString('es')} m <em>escala estimada</em>
      </div>
    </div>
  );
}

/* ---------------- Barra de estado ---------------- */
export function StatusBar({ selectionLabel }: { selectionLabel: string }) {
  const c = useCamera();
  const cur = useCursor();
  const lod = lodFor(c.k);
  const r = viewRect(c);
  const visibleCount = EQUIPMENT.filter((e) => e.x > r.x && e.x < r.x + r.w && e.y > r.y && e.y < r.y + r.h).length;
  return (
    <footer className="statusbar">
      <span className="sb-item mono" title="Coordenadas del cursor (unidades de plano y metros estimados)">
        <Icon name="crosshair" />
        {cur ? (
          <>
            X {cur.x.toFixed(1)} · Y {cur.y.toFixed(1)} u <span className="dim">≈ {(cur.x * METERS_PER_UNIT).toFixed(2)} m, {(cur.y * METERS_PER_UNIT).toFixed(2)} m</span>
          </>
        ) : (
          <span className="dim">—</span>
        )}
      </span>
      <span className="sb-sep" />
      <span className="sb-item mono">k {c.k.toFixed(2)} px/u</span>
      <span className="sb-sep" />
      <span className="sb-item">
        N{lod} · {LOD_NAMES[lod]}
      </span>
      <span className="sb-sep" />
      <span className="sb-item">{visibleCount} equipos en vista</span>
      <span className="sb-grow" />
      <span className="sb-item sel-label">{selectionLabel}</span>
    </footer>
  );
}

/* ---------------- Minimapa ---------------- */
const MM_W = 232;
const MM_H = (MM_W * SHEET.h) / SHEET.w;
const outline = BUILDING_OUTLINE.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ') + ' Z';
const wallsD = WALLS.map((w) => `M${w.p[0]} ${w.p[1]} L${w.q[0]} ${w.q[1]}`).join(' ');

export function Minimap({ controller }: { controller: React.MutableRefObject<PlanController | null> }) {
  const c = useCamera();
  const r = viewRect(c);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const go = (ev: RPointerEvent) => {
    const b = ref.current!.getBoundingClientRect();
    const x = ((ev.clientX - b.left) / b.width) * SHEET.w;
    const y = ((ev.clientY - b.top) / b.height) * SHEET.h;
    controller.current?.panTo(x, y);
  };
  return (
    <div className="minimap">
      <div className="mm-head">
        <span>Vista general</span>
        <button className="icon-btn sm" title="Ajustar a planta" onClick={() => controller.current?.fit()}>
          <Icon name="fit" />
        </button>
      </div>
      <svg
        ref={ref}
        width={MM_W}
        height={MM_H}
        viewBox={`0 0 ${SHEET.w} ${SHEET.h}`}
        onPointerDown={(ev) => {
          drag.current = true;
          (ev.target as Element).setPointerCapture?.(ev.pointerId);
          go(ev);
        }}
        onPointerMove={(ev) => drag.current && go(ev)}
        onPointerUp={() => (drag.current = false)}
      >
        <rect width={SHEET.w} height={SHEET.h} fill="#f4f4f1" />
        <path d={outline} fill="#e6e8ea" />
        {ROOMS.map((rm) => (
          <path key={rm.id} d={rm.poly.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ') + 'Z'} className={`mm-room cat-${rm.category}`} />
        ))}
        <path d={wallsD} stroke="#4a525b" strokeWidth={3} fill="none" />
        {EQUIPMENT.filter((e) => e.w * e.h > 300).map((e) => (
          <rect key={e.id} x={e.x - e.w / 2} y={e.y - e.h / 2} width={e.w} height={e.h} fill="#6c8fb0" opacity={0.55} />
        ))}
        <rect
          x={Math.max(-50, r.x)}
          y={Math.max(-50, r.y)}
          width={Math.min(SHEET.w + 100, r.w)}
          height={Math.min(SHEET.h + 100, r.h)}
          className="mm-view"
        />
      </svg>
    </div>
  );
}
