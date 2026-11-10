import { createContext, useContext, type ReactNode } from 'react';
import type { Lod } from '../model/types';

/** Contexto de render: nivel de detalle y escala cuantizada (px por unidad). */
export const RenderCtx = createContext<{ lod: Lod; zq: number }>({ lod: 1, zq: 1 });
export const useRender = () => useContext(RenderCtx);

/** Tamaño en mundo equivalente a `px` píxeles de pantalla, acotado. */
export function px(zq: number, p: number, min = 0, max = Infinity) {
  return Math.min(max, Math.max(min, p / zq));
}

/* Clases de grosor de línea (vector-effect: non-scaling-stroke en CSS):
   k-h pesada · k-m media · k-l fina · k-x muy fina · k-hid oculta (trazos) · k-cen eje */

export const deg = (r: number) => (r * Math.PI) / 180;

/** Motor eléctrico en planta. Eje a lo largo de +x; el eje de salida apunta a +x. */
export function Motor({
  x, y, len, w, rot = 0, lod, frame = true,
}: { x: number; y: number; len: number; w: number; rot?: number; lod: Lod; frame?: boolean }) {
  const fan = len * 0.24;
  const body0 = -len / 2 + fan;
  const body1 = len / 2 - len * 0.1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} className="motor">
      {lod >= 3 && frame && (
        <rect x={-len * 0.32} y={-w * 0.62} width={len * 0.62} height={w * 1.24} className="k-x" fill="#c9d0d6" />
      )}
      {/* Tapa del ventilador */}
      <rect x={-len / 2} y={-w * 0.44} width={fan + 0.4} height={w * 0.88} rx={w * 0.3} fill="#46617b" className="k-m" />
      {lod >= 3 && (
        <path
          d={Array.from({ length: 4 }, (_, i) => {
            const yy = -w * 0.3 + (i * w * 0.6) / 3;
            return `M${-len / 2 + fan * 0.25} ${yy} H${-len / 2 + fan * 0.9}`;
          }).join(' ')}
          stroke="#c3d2df"
          className="k-x"
        />
      )}
      {/* Carcasa */}
      <rect x={body0} y={-w / 2} width={body1 - body0} height={w} rx={w * 0.12} fill="url(#g-motor)" className="k-m" />
      {lod >= 3 && (
        <path
          d={Array.from({ length: 7 }, (_, i) => {
            const yy = -w / 2 + ((i + 1) * w) / 8;
            return `M${body0 + 0.6} ${yy} H${body1 - 0.6}`;
          }).join(' ')}
          stroke="#2b4157"
          strokeOpacity={0.55}
          className="k-x"
        />
      )}
      {/* Caja de bornes */}
      {lod >= 3 && (
        <rect
          x={(body0 + body1) / 2 - w * 0.22}
          y={-w * 0.22}
          width={w * 0.44}
          height={w * 0.44}
          rx={0.2}
          fill="#5b7894"
          stroke="#1d2e3e"
          className="k-l"
        />
      )}
      {/* Eje */}
      <rect x={body1} y={-w * 0.09} width={len * 0.1} height={w * 0.18} fill="#b8c0c8" className="k-l" />
    </g>
  );
}

/** Válvula (símbolo de corbatín con volante) en planta. */
export function Valve({ x, y, rot = 0, s = 2.4, color = '#c0392b' }: { x: number; y: number; rot?: number; s?: number; color?: string }) {
  const h = s * 0.55;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M${-s / 2} ${-h} L${s / 2} ${h} V${-h} L${-s / 2} ${h} Z`} fill="#fff" className="k-m" stroke="#1f2933" />
      <line x1={0} y1={0} x2={0} y2={-h * 1.7} className="k-l" stroke="#1f2933" />
      <ellipse cx={0} cy={-h * 1.7} rx={s * 0.45} ry={s * 0.16} fill="none" stroke={color} className="k-m" />
    </g>
  );
}

/** Boquilla con brida. Dirección `ang` (grados) desde el punto (x, y). */
export function Nozzle({ x, y, ang, len = 2.4, d = 1.6, lod }: { x: number; y: number; ang: number; len?: number; d?: number; lod: Lod }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <rect x={0} y={-d / 2} width={len} height={d} fill="url(#g-cyl-x)" className="k-l" />
      <rect x={len - 0.25} y={-d * 0.85} width={0.6} height={d * 1.7} fill="#c8cfd6" className="k-m" />
      {lod >= 4 && (
        <>
          <circle cx={len + 0.05} cy={-d * 0.62} r={0.12} fill="#4b5563" />
          <circle cx={len + 0.05} cy={d * 0.62} r={0.12} fill="#4b5563" />
        </>
      )}
    </g>
  );
}

/** Círculo de pernos. */
export function BoltCircle({ cx, cy, r, n, br = 0.22, a0 = 0 }: { cx: number; cy: number; r: number; n: number; br?: number; a0?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = deg(a0) + (i * 2 * Math.PI) / n;
        return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={br} fill="#5b6570" />;
      })}
    </g>
  );
}

/** Pernos de anclaje en las esquinas de un rectángulo. */
export function Anchors({ x, y, w, h, r = 0.3, inset = 0.9 }: { x: number; y: number; w: number; h: number; r?: number; inset?: number }) {
  const pts = [
    [x + inset, y + inset], [x + w - inset, y + inset], [x + w - inset, y + h - inset], [x + inset, y + h - inset],
  ];
  return (
    <g>
      {pts.map(([a, b], i) => (
        <g key={i}>
          <circle cx={a} cy={b} r={r} fill="#fff" className="k-x" />
          <circle cx={a} cy={b} r={r * 0.45} fill="#4b5563" />
        </g>
      ))}
    </g>
  );
}

/** Llamada con línea guía (sólo nivel 4). `to` es la posición del texto. */
export function Callout({
  from, to, text, anchor = 'start',
}: { from: [number, number]; to: [number, number]; text: string; anchor?: 'start' | 'end' | 'middle' }) {
  const { zq } = useRender();
  const fs = px(zq, 12, 0.5, 1.6);
  const dx = anchor === 'end' ? fs * 0.3 : anchor === 'start' ? -fs * 0.3 : 0;
  return (
    <g className="callout">
      <circle cx={from[0]} cy={from[1]} r={fs * 0.16} fill="#0b6aa2" />
      <polyline points={`${from[0]},${from[1]} ${to[0] + dx},${to[1]}`} fill="none" stroke="#0b6aa2" className="k-x" />
      <text
        x={to[0]}
        y={to[1] + fs * 0.34}
        fontSize={fs}
        textAnchor={anchor}
        className="callout-text"
      >
        {text}
      </text>
    </g>
  );
}

/** Texto técnico simple (centrado por defecto). */
export function T({
  x, y, s, children, anchor = 'middle', weight = 600, fill = '#1f2933', rotate, cls = '',
}: {
  x: number; y: number; s: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end';
  weight?: number; fill?: string; rotate?: number; cls?: string;
}) {
  return (
    <text
      x={x}
      y={y + s * 0.35}
      fontSize={s}
      textAnchor={anchor}
      fontWeight={weight}
      fill={fill}
      className={`t ${cls}`}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/** Sombra 2D discreta (desplazamiento + opacidad). */
export function Shadow({ children, d = 0.9 }: { children: ReactNode; d?: number }) {
  return (
    <g transform={`translate(${d} ${d * 1.15})`} className="shadow" fill="#1b2430" opacity={0.13} stroke="none">
      {children}
    </g>
  );
}

/** Rueda/rodaja vista en planta. */
export function Caster({ x, y, w = 1.4, l = 2.6, lod }: { x: number; y: number; w?: number; l?: number; lod: Lod }) {
  return (
    <g>
      <rect x={x - l / 2} y={y - w / 2} width={l} height={w} rx={w * 0.45} fill="#2f343a" />
      {lod >= 4 && <line x1={x - l / 2 + 0.4} y1={y} x2={x + l / 2 - 0.4} y2={y} stroke="#8a939c" className="k-x" />}
    </g>
  );
}

/** Polilínea → atributo `d`. */
export const pathOf = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
