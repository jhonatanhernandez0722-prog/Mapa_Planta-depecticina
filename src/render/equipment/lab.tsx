import { Callout, Shadow, T } from '../prims';
import type { EqProps } from './process';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ---------------- Campana de extracción ---------------- */
export function Campana({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      {lod >= 2 && (
        <Shadow>
          <rect x={-w} y={-h + 4} width={e.w} height={e.h - 4} />
        </Shadow>
      )}
      <rect x={-w} y={-h + 4} width={e.w} height={e.h - 4} fill="url(#g-ss)" className="k-h" />
      <path d={`M${-w} ${-h + 4} L-3 ${-h + 9} M${w} ${-h + 4} L3 ${-h + 9} M${-w} ${h} L-3 ${-h + 13} M${w} ${h} L3 ${-h + 13}`} className="k-l" stroke="#5c6670" />
      <rect x={-3} y={-h + 9} width={6} height={4} fill="#a9b3bc" className="k-m" />
      {lod >= 3 && (
        <>
          <rect x={-w + 1.5} y={h - 3.5} width={e.w - 3} height={2} fill="url(#g-glass)" className="k-x" opacity={0.8} />
          {range(5).map((i) => <line key={i} x1={-w + 4 + i * 5} y1={-h + 6} x2={-w + 4 + i * 5} y2={-h + 8} className="k-x" stroke="#7d8790" />)}
        </>
      )}
      {lod >= 4 && (
        <>
          <Callout from={[0, -h + 11]} to={[w + 8, -h + 2]} text="Conducto de extracción" />
          <Callout from={[0, h - 2.5]} to={[w + 8, h + 2]} text="Guillotina de vidrio" />
        </>
      )}
    </g>
  );
}

/* ---------------- Mesadas perimetrales (coordenadas relativas al centro del laboratorio) ---------------- */
const BENCHES: [number, number, number, number][] = [
  [-64, -69, 155, 17],
  [90, -69, 16, 45],
  [-107, -46, 17, 82],
  [-65, 51, 171, 18],
];
export function MesadaLab({ lod }: EqProps) {
  return (
    <g>
      {BENCHES.map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill="#eef1f3" className="k-m" />
          {lod >= 3 && (
            <rect
              x={x + (w > h ? 0 : 0.8)}
              y={y + (w > h ? 0.8 : 0)}
              width={w - (w > h ? 0 : 1.6)}
              height={h - (w > h ? 1.6 : 0)}
              fill="none"
              className="k-x k-hid"
              stroke="#8a949e"
            />
          )}
        </g>
      ))}
      {lod >= 4 && <Callout from={[-20, -60]} to={[-30, -80]} text="Mesada perimetral (encimera)" anchor="end" />}
    </g>
  );
}

export function IslaLab({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      {lod >= 2 && (
        <Shadow>
          <rect x={-w} y={-h} width={e.w} height={e.h} />
        </Shadow>
      )}
      <rect x={-w} y={-h} width={e.w} height={h} fill="#eef1f3" className="k-m" />
      <rect x={-w} y={0} width={e.w} height={h} fill="#eef1f3" className="k-m" />
      {lod >= 3 && <rect x={-w + 6} y={-1.3} width={e.w - 12} height={2.6} fill="#d5dbe0" className="k-l" />}
      {lod >= 4 &&
        range(6).map((i) => (
          <g key={i}>
            <rect x={-w + 12 + i * 14} y={-0.7} width={2} height={1.4} rx={0.2} fill="#fff" className="k-x" />
          </g>
        ))}
      {lod >= 4 && <Callout from={[w - 10, 0]} to={[w + 6, h + 6]} text="Estante central de reactivos" />}
    </g>
  );
}

/* ---------------- Equipos de mesa genéricos ---------------- */
export function EquipoLab({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  if (e.variant === 'round')
    return (
      <g>
        <rect x={-w} y={-h} width={e.w} height={e.h} rx={1.2} fill="#e3e7ea" className="k-m" />
        <circle r={Math.min(w, h) - 1.2} fill="url(#g-dome)" className="k-m" />
        {lod >= 3 && <circle r={Math.min(w, h) - 3} fill="none" className="k-x" stroke="#76818c" />}
      </g>
    );
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={0.8} fill="url(#g-panel)" className="k-m" />
      {e.variant === 'display' && lod >= 3 && <rect x={-w + 1.4} y={-h + 1.4} width={e.w * 0.45} height={e.h * 0.4} fill="#1d3b57" className="k-x" />}
      {e.variant === 'oven' && lod >= 3 && (
        <>
          <rect x={-w + 1.2} y={-h + 1.2} width={e.w - 4.5} height={e.h - 2.4} fill="none" className="k-x" stroke="#5b6670" />
          <rect x={w - 2.6} y={-h + 1.5} width={1.6} height={e.h - 3} fill="#1d3b57" className="k-x" />
        </>
      )}
      {e.variant === 'bench' && lod >= 3 && (
        <>
          <rect x={-w + 1.5} y={-h + 1.5} width={8} height={e.h - 3} fill="#fff" className="k-x" />
          <circle cx={w - 5} cy={0} r={2.6} fill="none" className="k-x" stroke="#5b6670" />
          <circle cx={w - 9.5} cy={-2} r={1.2} fill="none" className="k-x" stroke="#5b6670" />
        </>
      )}
      {lod >= 4 && <Callout from={[0, 0]} to={[0, -h - 7]} text="Equipo no identificado" anchor="middle" />}
    </g>
  );
}

export function Tarja({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={1} fill="#e9edf0" className="k-m" />
      <rect x={-w + 2} y={-h + 2.6} width={e.w - 4} height={e.h - 4} rx={1.6} fill="url(#g-ss)" className="k-m" />
      <circle cx={0} cy={1} r={0.8} fill="#6b7682" />
      {lod >= 3 && <path d={`M0 ${-h + 0.6} v2.6`} className="k-m" stroke="#5b6670" />}
      {lod >= 4 && <Callout from={[0, 1]} to={[w + 6, h + 4]} text="Tarja con desagüe" />}
    </g>
  );
}

export function EstufaLab({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <Shadow>
        <rect x={-w} y={-h} width={e.w} height={e.h} />
      </Shadow>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={0.6} fill="url(#g-panel)" className="k-m" />
      {range(lod >= 3 ? 6 : 3).map((i) => (
        <line key={i} x1={-w + 2} y1={-h + 3 + i * ((e.h - 6) / (lod >= 3 ? 5 : 2))} x2={w - 2} y2={-h + 3 + i * ((e.h - 6) / (lod >= 3 ? 5 : 2))} className="k-l" stroke="#5c6670" />
      ))}
      {lod >= 4 && <Callout from={[0, 0]} to={[w + 6, -h - 4]} text="Rejilla frontal" />}
    </g>
  );
}

export function Autoclave({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <Shadow>
        <rect x={-w} y={-h} width={e.w} height={e.h} />
      </Shadow>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={0.8} fill="url(#g-panel)" className="k-h" />
      <circle cx={0} cy={1.2} r={w - 3.2} fill="url(#g-dome)" className="k-m" />
      {lod >= 3 && (
        <>
          <circle cx={0} cy={1.2} r={w - 5.2} fill="none" className="k-x" stroke="#76818c" />
          <rect x={-w + 2} y={-h + 1} width={e.w - 4} height={2.4} fill="#1d3b57" className="k-x" />
          <rect x={w - 4.6} y={-0.6} width={1.6} height={3.6} fill="#5b6570" />
        </>
      )}
      {lod >= 4 && <Callout from={[0, 1.2]} to={[w + 6, -h - 4]} text="Puerta circular (carga frontal)" />}
    </g>
  );
}

export function Refrigerador({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <Shadow>
        <rect x={-w} y={-h} width={e.w} height={e.h} />
      </Shadow>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={0.6} fill="#f3f5f7" className="k-h" />
      <line x1={-w} y1={h - 3} x2={w} y2={h - 3} className="k-l" stroke="#5c6670" />
      {lod >= 3 && (
        <>
          <rect x={w - 2.4} y={-h + 3} width={0.9} height={6} fill="#5b6570" />
          {range(3).map((i) => <line key={i} x1={-w + 2} y1={-h + 2 + i * 1.2} x2={w - 4} y2={-h + 2 + i * 1.2} className="k-x" stroke="#8a949e" />)}
        </>
      )}
    </g>
  );
}

export function Computador({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      {/* Monitor */}
      <rect x={-w + 4} y={h - 4} width={e.w - 8} height={2} rx={0.5} fill="#2c3440" className="k-m" />
      <rect x={-2} y={h - 6} width={4} height={2.2} fill="#5b6570" />
      {/* Teclado */}
      <rect x={-w + 3} y={-h + 1.5} width={e.w - 9} height={4.4} rx={0.4} fill="#e5e8eb" className="k-m" />
      {lod >= 4 &&
        range(3).map((r) =>
          range(10).map((c) => <rect key={`${r}${c}`} x={-w + 3.5 + c * 1.55} y={-h + 2 + r * 1.3} width={1.2} height={0.95} fill="#fff" className="k-x" />),
        )}
      {/* Ratón */}
      {lod >= 3 && <ellipse cx={w - 3.4} cy={-h + 3.6} rx={1} ry={1.5} fill="#e5e8eb" className="k-l" />}
    </g>
  );
}

export function PassBox({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} fill="#f5f9fb" className="k-m k-hid" stroke="#1f2933" />
      <rect x={-w + 2.5} y={-h + 2.5} width={e.w - 5} height={e.h - 5} fill="none" className="k-l k-hid" stroke="#1f2933" />
      <path d={`M${-w - 6} ${h + 7} L${-2} ${2}`} className="k-m" stroke="#1f2933" />
      <path d="M-2 2 l-3.2 0.4 l1.2 -1.2 z" fill="#1f2933" className="k-m" />
      {lod >= 3 &&
        [-1, 1].map((s) => <line key={s} x1={s * (w - 0.8)} y1={-h + 3} x2={s * (w - 0.8)} y2={h - 3} className="k-m" stroke="#2f6f9a" />)}
      {lod >= 4 && (
        <>
          <line x1={-w + 4} y1={-h + 4} x2={w - 4} y2={-h + 4} className="k-l" stroke="#8e44ad" />
          <Callout from={[0, -h + 4]} to={[w + 6, -h - 4]} text="Lámpara UV" />
          <Callout from={[w - 0.8, 0]} to={[w + 6, 4]} text="Puertas enclavadas" />
        </>
      )}
    </g>
  );
}

/* ---------------- Reactivos ---------------- */
export function Dique({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  const t = 2.6;
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} fill={lod >= 3 ? 'url(#p-hatch)' : 'none'} className="k-x" stroke="#9aa3ab" />
      <path
        d={`M${-w} ${-h} V${h} H${w} V${-h} H${w - t} V${h - t} H${-w + t} V${-h} Z`}
        fill="#1f3fa8"
        className="k-m"
        stroke="#0f2366"
      />
      <T x={0} y={h - 6} s={3.8} weight={600}>Dique de contención</T>
      {lod >= 4 && <Callout from={[w - t / 2, 0]} to={[w + 6, -h]} text="Bordillo de contención" />}
    </g>
  );
}

export function Garrafa({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <Shadow d={0.6}>
        <rect x={-w} y={-h} width={e.w} height={e.h} rx={3} />
      </Shadow>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={3} fill="url(#g-dome-warm)" className="k-h" />
      {lod >= 3 && <rect x={-w + 2} y={-h + 2} width={e.w - 4} height={e.h - 4} rx={2} fill="none" className="k-x" stroke="#9aa3ab" />}
      <circle cx={0} cy={0} r={2.6} fill={e.variant === 'hcl' ? '#d0d7de' : '#d0d7de'} className="k-m" />
      <circle cx={0} cy={0} r={1.5} fill={e.variant === 'hcl' ? '#c0392b' : '#2f6f9a'} className="k-l" />
      {lod >= 3 && <path d={`M-4 ${-h + 1.2} Q0 ${-h - 2} 4 ${-h + 1.2}`} fill="none" className="k-m" stroke="#56606a" />}
      {lod >= 4 && <Callout from={[0, 0]} to={[w + 5, h + 3]} text="Tapón" />}
    </g>
  );
}

export function Tambor({ e, lod }: EqProps) {
  const R = e.w / 2;
  return (
    <g>
      <Shadow d={0.6}>
        <circle r={R} />
      </Shadow>
      <circle r={R} fill="url(#g-dome)" className="k-h" />
      <circle r={R - 1} fill="none" className="k-l" stroke="#7d8893" />
      {lod >= 3 && (
        <>
          <circle cx={-R * 0.45} cy={-R * 0.3} r={1.1} fill="#9aa4ad" className="k-l" />
          <circle cx={R * 0.5} cy={R * 0.35} r={0.8} fill="#9aa4ad" className="k-l" />
        </>
      )}
      {lod >= 4 && <Callout from={[-R * 0.45, -R * 0.3]} to={[-R - 6, -R - 3]} text="Tapón (bung)" anchor="end" />}
    </g>
  );
}

/* ---------------- Sanitarios de la esclusa ---------------- */
export function Lavamanos({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={1} fill="#f6f8f9" className="k-m" />
      <ellipse cx={0.8} cy={0} rx={w - 2.2} ry={h - 2.2} fill="url(#g-dome)" className="k-m" />
      <circle cx={0.8} cy={0} r={0.6} fill="#6b7682" />
      {lod >= 3 && <path d={`M${-w + 0.8} 0 h2.4`} className="k-m" stroke="#56606a" />}
    </g>
  );
}

export function Pediluvio({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  const foot = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0 -4.2 C2 -4.2 2.2 -1 1.8 1 C1.5 3 1.2 4.2 0 4.2 C-1.2 4.2 -1.6 3 -1.8 1 C-2.1 -1 -2 -4.2 0 -4.2 Z" fill="none" className="k-l" stroke="#3d4a56" />
    </g>
  );
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={1.4} fill="#e9eef1" className="k-h" />
      <rect x={-w + 1.6} y={-h + 1.6} width={e.w - 3.2} height={e.h - 3.2} rx={1} fill={lod >= 3 ? '#cfe8e4' : '#dbe9ec'} className="k-l" />
      {foot(-3.2, -6, -8)}
      {foot(3.2, -6, 8)}
      {foot(-3.2, 7, -8)}
      {foot(3.2, 7, 8)}
      {lod >= 4 && <Callout from={[0, 0]} to={[w + 6, h + 4]} text="Solución desinfectante" />}
    </g>
  );
}
