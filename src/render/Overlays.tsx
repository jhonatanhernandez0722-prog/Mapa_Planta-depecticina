import { memo } from 'react';
import { ROOMS, ROOM_BY_ID, SHEET, polyBox } from '../model/architecture';
import { EQUIPMENT, EQUIP_BY_ID } from '../model/equipment';
import { NETWORKS, PIPES, TEXT_LABELS } from '../model/networks';
import type { Lod, NetLine, Pt } from '../model/types';
import { TAG_POS, equipVisibleAt } from './equipment';
import { Valve, px } from './prims';

/* ------------------------------------------------------------------ */
/*  Estilos de red                                                     */
/* ------------------------------------------------------------------ */
interface NetStyle {
  color: string;
  core?: string;
  px: number;
  min: number;
  arrowPx: number;
  arrowMin: number;
  dash?: string;
}

const NET_STYLE: Record<string, NetStyle> = {
  agua: { color: 'var(--c-agua)', core: '#a7e3b0', px: 2.4, min: 0.8, arrowPx: 10, arrowMin: 2.2 },
  personal: { color: 'var(--c-personal)', px: 2.2, min: 0.32, arrowPx: 11, arrowMin: 1.4 },
  proceso: { color: 'var(--c-proceso)', px: 2.2, min: 0.32, arrowPx: 11, arrowMin: 1.4 },
  residuos: { color: 'var(--c-residuos)', core: '#f2a3a3', px: 2.8, min: 0.9, arrowPx: 11, arrowMin: 2.4 },
  lavado: { color: 'var(--c-lavado)', core: '#b9d4f5', px: 1.9, min: 0.6, arrowPx: 9, arrowMin: 1.8 },
  etanol: { color: 'var(--c-etanol)', px: 1.6, min: 0.3, arrowPx: 9, arrowMin: 1.2, dash: '6 3' },
};

function shorten(pts: Pt[], atEnd: boolean, d: number): Pt[] {
  const p = pts.map((q) => [...q] as Pt);
  const [a, b] = atEnd ? [p[p.length - 1], p[p.length - 2]] : [p[0], p[1]];
  const L = Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (L < 1e-6) return p;
  const t = Math.min(d, L * 0.9) / L;
  a[0] -= (a[0] - b[0]) * t;
  a[1] -= (a[1] - b[1]) * t;
  return p;
}

function arrowHead(tip: Pt, from: Pt, len: number) {
  const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const w = len * 0.48;
  const bx = tip[0] - len * Math.cos(ang);
  const by = tip[1] - len * Math.sin(ang);
  const nx = -Math.sin(ang) * w, ny = Math.cos(ang) * w;
  return `M${tip[0]} ${tip[1]} L${bx + nx} ${by + ny} L${bx - nx} ${by - ny} Z`;
}

function NetPath({ n, lod, zq }: { n: NetLine; lod: Lod; zq: number }) {
  const st = NET_STYLE[n.style ?? n.layer];
  const sw = px(zq, st.px, st.min * (lod >= 3 ? 1 : 0.4));
  const aLen = px(zq, st.arrowPx, st.arrowMin * (lod >= 3 ? 1 : 0.45));
  let pts = n.pts;
  if (n.arrowEnd) pts = shorten(pts, true, aLen * 0.8);
  if (n.arrowStart) pts = shorten(pts, false, aLen * 0.8);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  const L = n.pts.length;
  // Chevrones intermedios de sentido de flujo
  const mids: string[] = [];
  if (n.midArrows && lod >= 2) {
    const step = Math.max(40, 160 / zq);
    for (let i = 0; i < L - 1; i++) {
      const a = n.pts[i], b = n.pts[i + 1];
      const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let s = step; s < segL - step * 0.5; s += step) {
        const t = s / segL;
        const tip: Pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        mids.push(arrowHead(tip, a, aLen * 0.7));
      }
    }
  }
  const pipeLook = st.core && lod >= 3;
  return (
    <g className="net" data-net={n.id}>
      <path d={d} fill="none" stroke={st.color} strokeWidth={sw} strokeLinejoin="round" strokeDasharray={st.dash ? st.dash.split(' ').map((v) => +v * sw).join(' ') : undefined} />
      {pipeLook && <path d={d} fill="none" stroke={st.core} strokeWidth={sw * 0.34} strokeLinejoin="round" opacity={0.9} />}
      {n.arrowEnd && <path d={arrowHead(n.pts[L - 1], n.pts[L - 2], aLen)} fill={st.color} />}
      {n.arrowStart && <path d={arrowHead(n.pts[0], n.pts[1], aLen)} fill={st.color} />}
      {mids.length > 0 && <path d={mids.join(' ')} fill={st.color} opacity={0.85} />}
    </g>
  );
}

export const Networks = memo(function Networks({ layer, lod, zq }: { layer: string; lod: Lod; zq: number }) {
  return (
    <g>
      {NETWORKS.filter((n) => n.layer === layer && lod >= (n.minLod ?? 1)).map((n) => (
        <NetPath key={n.id} n={n} lod={lod} zq={zq} />
      ))}
      {layer === 'proceso' && lod >= 2 && (
        // Sumidero del drenaje de la sala de lavado
        <g transform="translate(217 313.5)">
          <circle r={2.2} fill="#fff" stroke="var(--c-lavado)" strokeWidth={0.5} />
          <path d="M-1.4 0 H1.4 M0 -1.4 V1.4" stroke="var(--c-lavado)" strokeWidth={0.4} />
        </g>
      )}
      {layer === 'agua' && lod >= 2 && (
        // Nodos de derivación
        <g fill="var(--c-agua)">
          {[[72, 338], [162, 338], [258, 338], [684, 338], [314, 473], [351, 473], [389, 473]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={px(zq, 3.4, 0.9)} />
          ))}
        </g>
      )}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Tuberías y ductos físicos                                          */
/* ------------------------------------------------------------------ */
export const Pipes = memo(function Pipes({ lod }: { lod: Lod }) {
  return (
    <g className="pipes">
      {PIPES.filter((p) => lod >= (p.minLod ?? 1)).map((p) => {
        const d = p.pts.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join(' ');
        const outline = p.kind === 'ducto' ? '#5d6976' : p.kind === 'canal' ? '#5f6b76' : '#46525e';
        const body = p.kind === 'ducto' ? '#dfe4e9' : p.kind === 'canal' ? '#e9edf0' : '#c9d0d7';
        return (
          <g key={p.id} data-pipe={p.id}>
            <path d={d} fill="none" stroke={outline} strokeWidth={p.d + (lod >= 3 ? 0.55 : 0.3)} strokeLinejoin={p.kind === 'acero' ? 'round' : 'miter'} />
            <path d={d} fill="none" stroke={body} strokeWidth={p.d} strokeLinejoin={p.kind === 'acero' ? 'round' : 'miter'} />
            {lod >= 2 && <path d={d} fill="none" stroke="#fff" strokeWidth={p.d * 0.28} strokeLinejoin="round" opacity={0.75} transform={`translate(${-p.d * 0.12} ${-p.d * 0.12})`} />}
            {p.kind === 'canal' && lod >= 3 && <path d={d} fill="none" stroke="#9fb6c6" strokeWidth={p.d * 0.45} strokeDasharray="1.2 0.8" />}
            {lod >= 3 && p.valves?.map((v, i) => <Valve key={i} x={v.at[0]} y={v.at[1]} rot={v.rot} s={p.d * 1.3} />)}
          </g>
        );
      })}
      {/* Remate en cuello de cisne del ducto de humedad */}
      <path d="M829.6 92 V88 A4.4 4.4 0 0 1 838.4 88 V92" fill="none" stroke="#5d6976" strokeWidth={7.6} strokeLinejoin="round" />
      <path d="M829.6 92 V88 A4.4 4.4 0 0 1 838.4 88 V92" fill="none" stroke="#dfe4e9" strokeWidth={7} strokeLinejoin="round" />
      {lod >= 3 && (
        <>
          {/* Compuerta en el ducto ciclón → molino */}
          <circle cx={861} cy={151} r={2.6} fill="#f3f5f7" stroke="#2b3036" strokeWidth={0.35} />
          <line x1={859} y1={153} x2={863} y2={149} stroke="#2b3036" strokeWidth={0.45} />
        </>
      )}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Señalización                                                       */
/* ------------------------------------------------------------------ */
function GhsDiamond({ x, y, s, kind }: { x: number; y: number; s: number; kind: 'corrosivo' | 'inflamable' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 10})`}>
      <rect x={-3.6} y={-3.6} width={7.2} height={7.2} transform="rotate(45)" fill="#fff" stroke="#d0021b" strokeWidth={0.9} />
      {kind === 'inflamable' ? (
        <path d="M0 2.8 C-2.2 2.8 -2.6 0.6 -1.4 -0.8 C-1.2 0.2 -0.6 0.4 -0.4 0 C-0.6 -1.4 0.2 -2.6 1 -3 C0.8 -1.6 2.4 -0.6 2 1.2 C1.8 2.2 1 2.8 0 2.8 Z M-2.6 3.2 H2.6" fill="#111" stroke="#111" strokeWidth={0.2} />
      ) : (
        <g fill="#111" stroke="#111" strokeWidth={0.25}>
          <path d="M-2.4 -2.4 l0.8 1.6 M-1.2 -2.6 l0.6 1.4" fill="none" />
          <path d="M-2.4 -0.4 q0.3 0.7 0 1 q-0.3 -0.3 0 -1z M-0.8 -0.6 q0.3 0.7 0 1 q-0.3 -0.3 0 -1z" />
          <path d="M-3 2.2 H3 V3 H-3 Z" />
          <path d="M0.6 0.6 h2.2 v1.2 h-2.2 z" />
        </g>
      )}
    </g>
  );
}

function Warning({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 10})`}>
      <path d="M0 -4.6 L5 4 H-5 Z" fill="#f2c230" stroke="#111" strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M0 -1.6 V1.4" stroke="#111" strokeWidth={0.8} strokeLinecap="round" />
      <circle cx={0} cy={2.7} r={0.45} fill="#111" />
    </g>
  );
}

export const Signage = memo(function Signage({ lod }: { lod: Lod }) {
  if (lod === 1) return null;
  return (
    <g>
      {/* Zona caliente 70 °C (área de hidrólisis) */}
      <rect x={425.5} y={140} width={115} height={124} fill="none" stroke="url(#p-hazard)" strokeWidth={1.3} />
      {lod >= 3 && (
        <g>
          <Warning x={431.5} y={256} s={7} />
          <text x={436.5} y={258} fontSize={2.8} fontWeight={700} className="t" fill="#7a1f12">ZONA CALIENTE 70 °C</text>
        </g>
      )}
      {/* Borde del andén de carga */}
      <rect x={1024} y={358.6} width={108} height={2.4} fill="url(#p-hazard)" />
      {lod >= 3 && (
        <>
          <GhsDiamond x={584} y={437} s={6.5} kind="corrosivo" />
          <GhsDiamond x={620} y={437} s={6.5} kind="inflamable" />
          <GhsDiamond x={758} y={62} s={8} kind="corrosivo" />
        </>
      )}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Rótulos                                                            */
/* ------------------------------------------------------------------ */
export const TITLE_LINES: Record<string, { lines: string[]; sub?: string[]; size?: number }> = {
  muelle: { lines: ['MUELLE DE', 'DESCARGA Y', 'PESAJE'] },
  'almacen-mp': { lines: ['ALMACENAMIENTO', 'MP'], sub: ['(Cáscaras de naranja,', '100,00 Mg)'] },
  lavado: { lines: ['SALA DE LAVADO', 'Y TRITURADO'] },
  cortado: { lines: ['ÁREA DE', 'CORTADO'] },
  hidrolisis: { lines: ['ÁREA HIDRÓLISIS ÁCIDA'], sub: ['(R-301)', '(ZONA CALIENTE 70 °C)'] },
  filtracion: { lines: ['ÁREA FILTRACIÓN'], sub: ['(F-301)'] },
  precipitacion: { lines: ['ÁREA PRECIPITACIÓN'], sub: ['(TA-401)'] },
  spray: { lines: ['ÁREA SPRAY DRY'] },
  molienda: { lines: ['SALA DE MOLIENDA Y', 'ENVASADO'] },
  'almacen-pt': { lines: ['ALMACÉN DE PRODUCTO', 'TERMINADO Y DESPACHO'] },
  oficinas: { lines: ['OFICINAS', 'ADMINISTRATIVAS'] },
  'vest-damas': { lines: ['VESTIDOR', 'Y BAÑO'], sub: ['DAMAS'], size: 5.4 },
  'vest-varones': { lines: ['VESTIDOR', 'Y BAÑO'], sub: ['VARONES'], size: 5.4 },
  esclusa: { lines: ['ESCLUSA SANITARIA'], sub: ['(obligatoria)'], size: 5.8 },
  reactivos: { lines: ['ALMACÉN DE', 'REACTIVOS E', 'INSUMOS'], size: 6 },
  laboratorio: { lines: ['LABORATORIO DE CALIDAD'], sub: ['(y microbiología)'], size: 6.6 },
  'local-e': { lines: ['LOCAL', 'SIN RÓTULO'], size: 5 },
  juntas: { lines: ['SALA DE JUNTAS'], size: 6.6 },
  cafeteria: { lines: ['CAFETERÍA'], size: 6.6 },
  caldera: { lines: ['SALA DE CALDERA'], size: 6.6 },
  ptar: { lines: ['PLANTA DE TRATAMIENTO DE', 'AGUAS RESIDUALES (PTAR)'], size: 5.6 },
  'zona-limpieza': { lines: ['ZONA DE', 'LIMPIEZA'], size: 5.4 },
};

export const RoomTitles = memo(function RoomTitles({ lod, zq }: { lod: Lod; zq: number }) {
  return (
    <g className={`room-titles ${lod >= 4 ? 'faint' : ''}`}>
      {ROOMS.filter((r) => !r.hideTitle && (lod >= 2 || r.major)).map((r) => {
        const cfg = TITLE_LINES[r.id] ?? { lines: [r.name.toUpperCase()] };
        const s = Math.min(cfg.size ?? 7.3, 46 / zq);
        const ss = s * 0.78;
        const [x, y] = r.label;
        const muted = r.id === 'local-e';
        return (
          <text key={r.id} x={x} y={y} textAnchor="middle" className={`t room-title ${muted ? 'muted' : ''}`} fontSize={s}>
            {cfg.lines.map((l, i) => (
              <tspan key={i} x={x} dy={i === 0 ? s * 0.35 : s * 1.08}>
                {l}
              </tspan>
            ))}
            {lod >= 2 &&
              cfg.sub?.map((l, i) => (
                <tspan key={`s${i}`} x={x} dy={i === 0 ? s * 1.12 : ss * 1.12} fontSize={ss} className="room-sub">
                  {l}
                </tspan>
              ))}
          </text>
        );
      })}
    </g>
  );
});

export const FreeLabels = memo(function FreeLabels({ lod, zq }: { lod: Lod; zq: number }) {
  return (
    <g>
      {TEXT_LABELS.filter((t) => lod >= t.minLod).map((t0) => {
        const t = { ...t0, size: Math.min(t0.size, 24 / zq) };
        return (
        <g key={t.id} className={t.layer ? `L L-${t.layer}` : undefined}>
          <text
            x={t.x}
            y={t.y}
            fontSize={t.size}
            textAnchor={t.anchor ?? 'middle'}
            fontWeight={t.weight ?? 600}
            fill={t.color ?? 'var(--ink)'}
            className="t free-label"
            transform={t.rotate ? `rotate(${t.rotate} ${t.x} ${t.y})` : undefined}
          >
            {t.text.map((l, i) => (
              <tspan key={i} x={t.x} dy={i === 0 ? t.size * 0.35 - ((t.text.length - 1) * t.size * 1.08) / 2 : t.size * 1.08}>
                {l}
              </tspan>
            ))}
          </text>
        </g>
        );
      })}
    </g>
  );
});

export const SHORT: Record<string, string[]> = {
  hcl37: ['HCl 37 %'],
  etanol: ['Etanol'],
  paletizado: ['LÍNEA PARA', 'PALETIZADO', 'DE SACOS'],
  'molino-pines': ['MOLINO'],
};

export const EquipTags = memo(function EquipTags({ lod, zq }: { lod: Lod; zq: number }) {
  if (lod === 1) return null;
  const fs = px(zq, 11.5, 1.5, 4.4);
  return (
    <g className="equip-tags">
      {EQUIPMENT.filter((e) => TAG_POS[e.id] && equipVisibleAt(e, lod)).map((e) => {
        const pos = TAG_POS[e.id];
        if (!pos) return null;
        const anchor = pos.anchor ?? 'middle';
        const lines: { t: string; cls: string; s: number }[] = [];
        if (SHORT[e.id]) SHORT[e.id].forEach((t) => lines.push({ t, cls: 'tag-name strong', s: fs * 0.9 }));
        else {
          if (e.tag) lines.push({ t: e.tag, cls: 'tag-code', s: fs });
          if (pos.name && lod >= 2) lines.push({ t: e.name, cls: 'tag-name', s: fs * 0.82 });
        }
        return (
          <text key={e.id} x={pos.x} y={pos.y} textAnchor={anchor} className="t equip-tag" fontSize={lines[0]?.s ?? fs}>
            {lines.map((l, i) => {
              const v = i === 0 ? l.s * 0.35 : lines[i - 1].s * 0.32 + l.s * 0.98;
              return (
                <tspan key={i} x={pos.x} dy={v} fontSize={l.s} className={l.cls}>
                  {l.t}
                </tspan>
              );
            })}
          </text>
        );
      })}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Lámina: fondo, rejilla, marco, leyenda y cajetín                   */
/* ------------------------------------------------------------------ */
export const SheetBack = memo(function SheetBack({ grid, lod }: { grid: boolean; lod: Lod }) {
  return (
    <g>
      <rect x={SHEET.x - 400} y={SHEET.y - 300} width={SHEET.w + 800} height={SHEET.h + 600} fill="var(--c-desk)" />
      <rect x={SHEET.x + 2} y={SHEET.y + 3} width={SHEET.w} height={SHEET.h} fill="#000" opacity={0.18} />
      <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill="var(--paper)" />
      {grid && (
        <g className="grid" pointerEvents="none">
          {lod >= 3 && (
            <path
              d={Array.from({ length: Math.floor(SHEET.w / 10) }, (_, i) => `M${i * 10} 0 V${SHEET.h}`).join(' ') +
                Array.from({ length: Math.floor(SHEET.h / 10) }, (_, i) => ` M0 ${i * 10} H${SHEET.w}`).join('')}
              className="grid-minor"
            />
          )}
          <path
            d={Array.from({ length: Math.floor(SHEET.w / 50) + 1 }, (_, i) => `M${i * 50} 0 V${SHEET.h}`).join(' ') +
              Array.from({ length: Math.floor(SHEET.h / 50) + 1 }, (_, i) => ` M0 ${i * 50} H${SHEET.w}`).join('')}
            className="grid-major"
          />
        </g>
      )}
    </g>
  );
});

export const SheetFrame = memo(function SheetFrame() {
  const lg = { x: 1033, y: 470, w: 110, h: 95 };
  const tb = { x: 956, y: 571, w: 192, h: 67 };
  const items: { label: string; color: string; arrow: boolean }[] = [
    { label: 'Tubería de agua potable', color: 'var(--c-agua)', arrow: false },
    { label: 'Tránsito de personal', color: 'var(--c-personal)', arrow: true },
    { label: 'Flujo de proceso', color: 'var(--c-proceso)', arrow: true },
    { label: 'Flujo de residuos', color: 'var(--c-residuos)', arrow: true },
  ];
  return (
    <g className="sheet-frame" pointerEvents="none">
      <rect x={4} y={4} width={SHEET.w - 8} height={SHEET.h - 8} fill="none" stroke="#2b3036" strokeWidth={0.9} />
      <rect x={6.5} y={6.5} width={SHEET.w - 13} height={SHEET.h - 13} fill="none" stroke="#2b3036" strokeWidth={0.3} />
      {/* Leyenda */}
      <rect x={lg.x} y={lg.y} width={lg.w} height={lg.h} fill="var(--paper)" stroke="#2b3036" strokeWidth={0.6} />
      <text x={lg.x + lg.w / 2} y={lg.y + 10} textAnchor="middle" fontSize={5.6} fontWeight={700} className="t">LEYENDA</text>
      <line x1={lg.x} y1={lg.y + 15} x2={lg.x + lg.w} y2={lg.y + 15} stroke="#2b3036" strokeWidth={0.3} />
      {items.map((it, i) => {
        const y = lg.y + 26 + i * 18;
        return (
          <g key={it.label}>
            <line x1={lg.x + 6} y1={y} x2={lg.x + (it.arrow ? 22 : 26)} y2={y} stroke={it.color} strokeWidth={1.6} />
            {it.arrow && <path d={`M${lg.x + 27} ${y} l-5.5 -2.8 v5.6 z`} fill={it.color} />}
            <text x={lg.x + 32} y={y + 1.6} fontSize={4.2} className="t" fill="#1f2933">{it.label}</text>
          </g>
        );
      })}
      {/* Cajetín */}
      <rect x={tb.x} y={tb.y} width={tb.w} height={tb.h} fill="var(--paper)" stroke="#2b3036" strokeWidth={0.6} />
      <rect x={tb.x + 3} y={tb.y + 3} width={tb.w - 6} height={tb.h - 6} fill="none" stroke="#2b3036" strokeWidth={0.35} />
      <text x={tb.x + tb.w / 2} y={tb.y + 15} textAnchor="middle" fontSize={7.4} fontWeight={700} className="t">PLANTA DE EXTRACCIÓN</text>
      <text x={tb.x + tb.w / 2} y={tb.y + 24.5} textAnchor="middle" fontSize={7.4} fontWeight={700} className="t">DE PECTINA CÍTRICA</text>
      <line x1={tb.x + 3} y1={tb.y + 30} x2={tb.x + tb.w - 3} y2={tb.y + 30} stroke="#2b3036" strokeWidth={0.35} />
      <text x={tb.x + 6} y={tb.y + 37} fontSize={3.8} className="t" fill="#33414e">Autoría</text>
      <line x1={tb.x + 3} y1={tb.y + 50} x2={tb.x + tb.w - 3} y2={tb.y + 50} stroke="#2b3036" strokeWidth={0.25} />
      <text x={tb.x + 6} y={tb.y + 56.5} fontSize={3.2} className="t" fill="#4b5563">Reconstrucción vectorial 2D de la referencia · Escala estimada 1 u ≈ 0,10 m</text>
      <text x={tb.x + 6} y={tb.y + 61.5} fontSize={3.2} className="t" fill="#4b5563">Planta general · Hoja 1/1</text>
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Selección                                                          */
/* ------------------------------------------------------------------ */
export type Selection = { type: 'equip'; id: string } | { type: 'room'; id: string } | null;

export function SelectionOverlay({ sel, zq }: { sel: Selection; zq: number }) {
  if (!sel) return null;
  const g = px(zq, 7, 0.25);
  if (sel.type === 'room') {
    const r = ROOM_BY_ID[sel.id];
    if (!r) return null;
    const d = r.poly.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join(' ') + ' Z';
    return (
      <g className="sel" pointerEvents="none">
        <path d={d} className="sel-room-fill" />
        <path d={d} className="sel-room-line" />
        {r.poly.map((q, i) => (
          <rect key={i} x={q[0] - g / 2} y={q[1] - g / 2} width={g} height={g} className="sel-grip" />
        ))}
      </g>
    );
  }
  const e = EQUIP_BY_ID[sel.id];
  if (!e) return null;
  const pad = px(zq, 6, 0.6, 3);
  const x = e.x - e.w / 2 - pad, y = e.y - e.h / 2 - pad, w = e.w + 2 * pad, h = e.h + 2 * pad;
  const corners: Pt[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]];
  return (
    <g className="sel" pointerEvents="none">
      <rect x={x} y={y} width={w} height={h} className="sel-box-glow" />
      <rect x={x} y={y} width={w} height={h} className="sel-box" />
      {corners.map((q, i) => (
        <rect key={i} x={q[0] - g / 2} y={q[1] - g / 2} width={g} height={g} className="sel-grip" />
      ))}
      <g>
        <line x1={e.x} y1={e.y - g * 0.9} x2={e.x} y2={e.y + g * 0.9} className="sel-cross" />
        <line x1={e.x - g * 0.9} y1={e.y} x2={e.x + g * 0.9} y2={e.y} className="sel-cross" />
      </g>
    </g>
  );
}

export function roomBox(id: string) {
  const r = ROOM_BY_ID[id];
  return r ? polyBox(r.poly) : null;
}
