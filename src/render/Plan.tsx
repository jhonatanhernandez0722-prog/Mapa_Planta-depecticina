import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import { easeCubicInOut } from 'd3-ease';
import { SHEET, ROOM_BY_ID, polyBox } from '../model/architecture';
import { EQUIPMENT, EQUIP_BY_ID } from '../model/equipment';
import type { Box, LayerId, Lod } from '../model/types';
import {
  K_MAX, LOD_THRESHOLDS, cameraStore, cursorStore, deriveView, intersects, sameView, type RenderView,
} from '../engine/camera';
import { Defs } from './Defs';
import { Doors, Envelope, Furniture, RoomFills, RoomHits, Walls } from './Architecture';
import { EquipNode, equipVisibleAt } from './equipment';
import {
  EquipTags, FreeLabels, Networks, Pipes, RoomTitles, SelectionOverlay, SheetBack, SheetFrame, Signage, type Selection,
} from './Overlays';
import { RenderCtx } from './prims';

export interface PlanController {
  fit: (animate?: boolean) => void;
  zoomBy: (f: number) => void;
  zoomToBox: (b: Box, opts?: { pad?: number; maxK?: number; duration?: number }) => void;
  zoomToLod: (l: Lod) => void;
  focusEquip: (id: string) => void;
  focusRoom: (id: string) => void;
  panTo: (x: number, y: number) => void;
}

const LW: Record<Lod, number> = { 1: 0.85, 2: 1, 3: 1.2, 4: 1.45 };

export function Plan({
  hidden, selection, onSelect, controller, grid,
}: {
  hidden: Set<LayerId>;
  selection: Selection;
  onSelect: (s: Selection) => void;
  controller: React.MutableRefObject<PlanController | null>;
  grid: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const viewRef = useRef<RenderView>({ lod: 1, zq: 1, cull: { x: 0, y: 0, w: 0, h: 0 } });
  const [view, setView] = useState<RenderView>(viewRef.current);
  const sizeRef = useRef({ w: 1, h: 1 });
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  /* ---------------- Cámara ---------------- */
  useLayoutEffect(() => {
    const svg = svgRef.current!;
    const world = worldRef.current!;
    const sel = select(svg);
    let raf = 0;
    let pending: ZoomTransform | null = null;

    const apply = (t: ZoomTransform) => {
      world.setAttribute('transform', `translate(${t.x} ${t.y}) scale(${t.k})`);
      pending = t;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          const tt = pending!;
          const cam = { k: tt.k, x: tt.x, y: tt.y, vw: sizeRef.current.w, vh: sizeRef.current.h };
          cameraStore.set(cam);
          const v = deriveView(cam);
          if (!sameView(v, viewRef.current)) {
            viewRef.current = v;
            setView(v);
          }
        });
      }
    };

    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, K_MAX])
      .wheelDelta((ev: WheelEvent) => -ev.deltaY * (ev.deltaMode === 1 ? 0.05 : ev.deltaMode ? 1 : 0.0022) * (ev.ctrlKey ? 8 : 1))
      .clickDistance(4)
      .on('zoom', (ev) => apply(ev.transform));
    sel.call(z).on('dblclick.zoom', null);
    zoomRef.current = z;

    const fitTransform = () => {
      const { w, h } = sizeRef.current;
      const pad = 28;
      const k = Math.min((w - pad * 2) / SHEET.w, (h - pad * 2) / SHEET.h);
      return zoomIdentity.translate((w - SHEET.w * k) / 2, (h - SHEET.h * k) / 2).scale(k);
    };

    const resize = () => {
      const r = svg.getBoundingClientRect();
      sizeRef.current = { w: Math.max(1, r.width), h: Math.max(1, r.height) };
      const fk = fitTransform().k;
      z.scaleExtent([fk * 0.5, K_MAX]);
      z.translateExtent([[-SHEET.w * 0.6, -SHEET.h * 0.6], [SHEET.w * 1.6, SHEET.h * 1.6]]);
    };
    resize();
    sel.call(z.transform, fitTransform());

    // Destino de la transición en curso (para encadenar órdenes sin saltos).
    let target: ZoomTransform | null = null;

    // Al cambiar el tamaño del lienzo (p. ej. al abrir el panel contextual) se
    // conserva el punto de mundo situado en el centro de la vista.
    const ro = new ResizeObserver(() => {
      const before = sizeRef.current;
      resize();
      if (before.w <= 1) return sel.call(z.transform, fitTransform());
      const dw = (sizeRef.current.w - before.w) / 2;
      const dh = (sizeRef.current.h - before.h) / 2;
      if (!dw && !dh) return;
      const shift = (t: ZoomTransform) => zoomIdentity.translate(t.x + dw, t.y + dh).scale(t.k);
      if (target) animate(shift(target), 450);
      else sel.call(z.transform, shift(zoomTransformOf(svg)));
    });
    ro.observe(svg);
    const current = () => target ?? zoomTransformOf(svg);
    const animate = (t: ZoomTransform, duration = 650) => {
      sel.interrupt();
      if (duration <= 0) {
        target = null;
        sel.call(z.transform, t);
        return;
      }
      target = t;
      sel
        .transition()
        .duration(duration)
        .ease(easeCubicInOut)
        .call(z.transform, t)
        .on('end interrupt', () => {
          if (target === t) target = null;
        });
    };

    const toBox = (b: Box, opts: { pad?: number; maxK?: number; duration?: number } = {}) => {
      const { w, h } = sizeRef.current;
      const pad = opts.pad ?? 0.12;
      const k = Math.min(opts.maxK ?? K_MAX, (w * (1 - pad * 2)) / b.w, (h * (1 - pad * 2)) / b.h);
      const t = zoomIdentity.translate(w / 2 - (b.x + b.w / 2) * k, h / 2 - (b.y + b.h / 2) * k).scale(k);
      animate(t, opts.duration);
    };

    controller.current = {
      fit: (a = true) => animate(fitTransform(), a ? 650 : 0),
      zoomBy: (f) => {
        const cur = current();
        const { w, h } = sizeRef.current;
        const k = Math.max(z.scaleExtent()[0], Math.min(K_MAX, cur.k * f));
        const cx = (w / 2 - cur.x) / cur.k, cy = (h / 2 - cur.y) / cur.k;
        animate(zoomIdentity.translate(w / 2 - cx * k, h / 2 - cy * k).scale(k), 280);
      },
      zoomToBox: toBox,
      zoomToLod: (l) => {
        const targets: Record<Lod, number> = {
          1: fitTransform().k,
          2: (LOD_THRESHOLDS[0] + LOD_THRESHOLDS[1]) / 2,
          3: (LOD_THRESHOLDS[1] + LOD_THRESHOLDS[2]) / 2,
          4: LOD_THRESHOLDS[2] * 1.3,
        };
        if (l === 1) return animate(fitTransform());
        const cur = current();
        const { w, h } = sizeRef.current;
        const cx = (w / 2 - cur.x) / cur.k, cy = (h / 2 - cur.y) / cur.k;
        const k = targets[l];
        animate(zoomIdentity.translate(w / 2 - cx * k, h / 2 - cy * k).scale(k));
      },
      focusEquip: (id) => {
        const e = EQUIP_BY_ID[id];
        if (!e) return;
        const { w, h } = sizeRef.current;
        const m = Math.max(e.w, e.h) * 0.45 + 8;
        // Encuadre con margen; como mínimo nivel 3 si el equipo cabe en pantalla.
        const kBox = Math.min((w * 0.76) / (e.w + 2 * m), (h * 0.76) / (e.h + 2 * m));
        const kFit = 0.86 * Math.min(w / e.w, h / e.h);
        const k = Math.min(26, Math.max(kBox, Math.min(LOD_THRESHOLDS[1] * 1.08, kFit)));
        animate(zoomIdentity.translate(w / 2 - e.x * k, h / 2 - e.y * k).scale(k));
      },
      focusRoom: (id) => {
        const r = ROOM_BY_ID[id];
        if (r) toBox(polyBox(r.poly), { pad: 0.08 });
      },
      panTo: (x, y) => {
        target = null;
        const cur = zoomTransformOf(svg);
        const { w, h } = sizeRef.current;
        sel.interrupt();
        sel.call(z.transform, zoomIdentity.translate(w / 2 - x * cur.k, h / 2 - y * cur.k).scale(cur.k));
      },
    };

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      sel.on('.zoom', null);
    };
  }, [controller]);

  /* ---------------- Eventos de puntero ---------------- */
  useEffect(() => {
    const svg = svgRef.current!;
    let raf = 0;
    const toWorld = (ev: MouseEvent) => {
      const r = svg.getBoundingClientRect();
      const t = zoomTransformOf(svg);
      return [(ev.clientX - r.left - t.x) / t.k, (ev.clientY - r.top - t.y) / t.k] as const;
    };
    const move = (ev: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const [x, y] = toWorld(ev);
        cursorStore.set({ x, y });
      });
    };
    const leave = () => cursorStore.set(null);
    const click = (ev: MouseEvent) => {
      const el = ev.target as Element;
      const eq = el.closest('[data-id]');
      if (eq) return onSelectRef.current({ type: 'equip', id: eq.getAttribute('data-id')! });
      const rm = el.closest('[data-room]');
      if (rm) return onSelectRef.current({ type: 'room', id: rm.getAttribute('data-room')! });
      onSelectRef.current(null);
    };
    const dbl = (ev: MouseEvent) => {
      ev.preventDefault();
      const c = controller.current!;
      const el = ev.target as Element;
      const eq = el.closest('[data-id]');
      const t = zoomTransformOf(svg);
      if (eq) {
        const id = eq.getAttribute('data-id')!;
        const e = EQUIP_BY_ID[id];
        const r = svg.getBoundingClientRect();
        const m = Math.max(e.w, e.h) * 0.45 + 8;
        const kBox = Math.min((r.width * 0.76) / (e.w + 2 * m), (r.height * 0.76) / (e.h + 2 * m));
        const kFit = 0.86 * Math.min(r.width / e.w, r.height / e.h);
        const focusK = Math.min(26, Math.max(kBox, Math.min(LOD_THRESHOLDS[1] * 1.08, kFit)));
        onSelectRef.current({ type: 'equip', id });
        // Primer doble clic: encuadra el equipo. Siguientes: acercamiento progresivo al cursor.
        if (t.k < focusK * 0.92) return c.focusEquip(id);
      }
      const rm = el.closest('[data-room]');
      if (rm) {
        const id = rm.getAttribute('data-room')!;
        const b = polyBox(ROOM_BY_ID[id].poly);
        const r = svg.getBoundingClientRect();
        const fitK = Math.min((r.width * 0.84) / b.w, (r.height * 0.84) / b.h);
        onSelectRef.current({ type: 'room', id });
        // Primer doble clic: encuadra el área. Siguientes: acercamiento progresivo al cursor.
        if (t.k < fitK * 0.92) return c.zoomToBox(b, { pad: 0.08 });
      }
      const [wx, wy] = toWorld(ev);
      const r = svg.getBoundingClientRect();
      const k = Math.min(K_MAX, t.k * 2.2);
      const sx = ev.clientX - r.left, sy = ev.clientY - r.top;
      select(svg)
        .interrupt()
        .transition()
        .duration(450)
        .ease(easeCubicInOut)
        .call(zoomRef.current!.transform, zoomIdentity.translate(sx - wx * k, sy - wy * k).scale(k));
    };
    svg.addEventListener('mousemove', move);
    svg.addEventListener('mouseleave', leave);
    svg.addEventListener('click', click);
    svg.addEventListener('dblclick', dbl);
    return () => {
      svg.removeEventListener('mousemove', move);
      svg.removeEventListener('mouseleave', leave);
      svg.removeEventListener('click', click);
      svg.removeEventListener('dblclick', dbl);
      cancelAnimationFrame(raf);
    };
  }, [controller]);

  /* ---------------- Render ---------------- */
  const { lod, zq, cull } = view;
  const ctx = useMemo(() => ({ lod, zq }), [lod, zq]);

  const equipNodes = useMemo(
    () =>
      EQUIPMENT.filter((e) => equipVisibleAt(e, lod)).map((e) => {
        let l: Lod = lod;
        if (lod >= 3) {
          const b = { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h };
          if (!intersects(b, cull)) l = 1;
        }
        return <EquipNode key={e.id} e={e} lod={l} />;
      }),
    [lod, cull],
  );

  const hiddenCls = [...hidden].map((h) => `hide-${h}`).join(' ');
  const isSel = selection?.type === 'equip' ? selection.id : null;

  return (
    <RenderCtx.Provider value={ctx}>
      <svg
        ref={svgRef}
        className={`plan lod-${lod} ${hiddenCls} ${isSel ? 'has-sel' : ''}`}
        style={{ ['--lw' as string]: LW[lod] }}
        data-lod={lod}
      >
        <Defs />
        <g ref={worldRef}>
          <SheetBack grid={grid} lod={lod} />
          <g className="L L-divisiones">
            <RoomFills lod={lod} />
            <RoomHits />
          </g>
          <g className="L L-estructura">
            <Envelope lod={lod} />
          </g>
          <g className="L L-divisiones">
            <Walls which="int" />
            <Doors lod={lod} />
            <Furniture lod={lod} />
          </g>
          <g className="L L-estructura">
            <Walls which="ext" />
          </g>
          <g className="L L-maquinaria">{equipNodes}</g>
          <g className="L L-maquinaria no-hit">
            <Pipes lod={lod} />
          </g>
          {(['proceso', 'agua', 'residuos', 'personal'] as const).map((l) => (
            <g key={l} className={`L L-${l} no-hit`}>
              <Networks layer={l} lod={lod} zq={zq} />
            </g>
          ))}
          <g className="L L-senalizacion no-hit">
            <Signage lod={lod} />
          </g>
          <g className="L L-etiquetas no-hit">
            <RoomTitles lod={lod} zq={zq} />
            <FreeLabels lod={lod} zq={zq} />
            <EquipTags lod={lod} zq={zq} />
          </g>
          <SheetFrame />
          <SelectionOverlay sel={selection} zq={zq} />
        </g>
      </svg>
    </RenderCtx.Provider>
  );
}

function zoomTransformOf(svg: SVGSVGElement): ZoomTransform {
  // d3-zoom guarda el estado en la propiedad __zoom del nodo.
  return ((svg as unknown as { __zoom?: ZoomTransform }).__zoom ?? zoomIdentity) as ZoomTransform;
}
