import { memo } from 'react';
import {
  BUILDING_OUTLINE, DOORS, LIGHT_WALLS, ROOMS, WALLS, WALL_EXT, WALL_INT, WALL_LIGHT, WINDOWS,
} from '../model/architecture';
import type { Door, Lod, Pt, WallSeg } from '../model/types';

const segPath = (ws: WallSeg[]) => ws.map((w) => `M${w.p[0]} ${w.p[1]} L${w.q[0]} ${w.q[1]}`).join(' ');
const polyPath = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join(' ') + ' Z';

const EXT = WALLS.filter((w) => w.ext);
const INT = WALLS.filter((w) => !w.ext);

/* ------------------------------------------------------------------ */
/*  Fondos de áreas                                                    */
/* ------------------------------------------------------------------ */
export const RoomFills = memo(function RoomFills({ lod }: { lod: Lod }) {
  return (
    <g>
      <path d={polyPath(BUILDING_OUTLINE)} transform="translate(1.6 2)" fill="#000" opacity={0.07} />
      <path d={polyPath(BUILDING_OUTLINE)} fill="var(--c-floor)" />
      {ROOMS.map((r) => (
        <path key={r.id} d={polyPath(r.poly)} className={`room-fill cat-${r.category}`} />
      ))}
      {lod >= 3 && <path d={polyPath(BUILDING_OUTLINE)} fill="url(#p-tile)" pointerEvents="none" />}
    </g>
  );
});

/** Zonas de clic de las áreas (debajo de los equipos). */
export const RoomHits = memo(function RoomHits() {
  return (
    <g className="room-hits">
      {ROOMS.map((r) => (
        <path key={r.id} d={polyPath(r.poly)} className="room-hit" data-room={r.id} />
      ))}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Muros                                                              */
/* ------------------------------------------------------------------ */
export const Walls = memo(function Walls({ which }: { which: 'ext' | 'int' }) {
  if (which === 'int') {
    return (
      <g className="walls">
        <path d={segPath(INT)} className="wall-outline" strokeWidth={WALL_INT + 0.7} />
        <path d={segPath(LIGHT_WALLS)} className="wall-outline" strokeWidth={WALL_LIGHT + 0.5} />
        <path d={segPath(INT)} className="wall-fill" strokeWidth={WALL_INT} />
        <path d={segPath(LIGHT_WALLS)} className="wall-fill light" strokeWidth={WALL_LIGHT} />
      </g>
    );
  }
  return (
    <g className="walls">
      <path d={segPath(EXT)} className="wall-outline" strokeWidth={WALL_EXT + 0.8} />
      <path d={segPath(EXT)} className="wall-fill ext" strokeWidth={WALL_EXT} />
      {/* Recinto de la PTAR (muro doble) */}
      <rect x={233} y={14} width={144} height={66} className="wall-outline" strokeWidth={3.6} fill="none" />
      <rect x={233} y={14} width={144} height={66} className="wall-fill ext" strokeWidth={2.9} fill="none" />
    </g>
  );
});

/** Elementos de fachada: ventanas, columnas, línea de andén, zona de limpieza. */
export const Envelope = memo(function Envelope({ lod }: { lod: Lod }) {
  return (
    <g>
      {/* Zona de limpieza (línea discontinua de la referencia) */}
      <path d="M377 14 H443 V103" fill="none" className="k-m dash-l" stroke="#3b4148" />
      {/* Andén de carga: borde abierto */}
      <path d="M1023 363 H1133 V305.5" fill="none" className="k-m dash-l" stroke="#3b4148" />
      <rect x={1003} y={361.2} width={20} height={3.6} className="wall-solid" />
      {/* Ventanas */}
      {WINDOWS.map((w, i) => {
        const t = w.at === 363 ? WALL_INT : WALL_EXT;
        const [x, y, ww, hh] = w.dir === 'h' ? [w.a, w.at - t / 2, w.b - w.a, t] : [w.at - t / 2, w.a, t, w.b - w.a];
        return (
          <g key={i}>
            <rect x={x} y={y} width={ww} height={hh} fill="#f7fbfd" className="k-l" stroke="#2b3036" />
            {w.dir === 'h' ? (
              <path d={`M${x} ${w.at - 0.45} H${x + ww} M${x} ${w.at + 0.45} H${x + ww}`} className="k-x" stroke="#4a7fa6" />
            ) : (
              <path d={`M${w.at - 0.45} ${y} V${y + hh} M${w.at + 0.45} ${y} V${y + hh}`} className="k-x" stroke="#4a7fa6" />
            )}
          </g>
        );
      })}
      {/* Columnas estructurales en los encuentros de la fachada norte */}
      {lod >= 3 &&
        [30, 111.5, 213.5, 334.5, 420, 545, 647.5, 761.5, 874, 1003, 1133].map((x) => (
          <rect key={x} x={x - 2.6} y={105.5 - 2.6} width={5.2} height={5.2} fill="#5a6169" className="k-l" stroke="#1f2328" />
        ))}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Puertas                                                            */
/* ------------------------------------------------------------------ */
function leafAndArc(hx: number, hy: number, lx: number, ly: number, ex: number, ey: number, sweep: 0 | 1) {
  // hinge (hx,hy), leaf tip (lx,ly), latch (ex,ey)
  const r = Math.hypot(lx - hx, ly - hy);
  return {
    leaf: `M${hx} ${hy} L${lx} ${ly}`,
    arc: `M${lx} ${ly} A${r} ${r} 0 0 ${sweep} ${ex} ${ey}`,
  };
}

function doorGeometry(d: Door) {
  const out: { leaf: string; arc: string }[] = [];
  const s = d.side;
  const single = (hingeAt: number, latchAt: number) => {
    const len = Math.abs(latchAt - hingeAt);
    if (d.dir === 'h') {
      const hx = hingeAt, hy = d.at;
      const lx = hx, ly = hy + s * len;
      const sweepSign = (latchAt > hingeAt ? 1 : -1) * s;
      out.push(leafAndArc(hx, hy, lx, ly, latchAt, d.at, sweepSign > 0 ? 0 : 1));
    } else {
      const hx = d.at, hy = hingeAt;
      const lx = hx + s * len, ly = hy;
      const sweepSign = (latchAt > hingeAt ? 1 : -1) * s;
      out.push(leafAndArc(hx, hy, lx, ly, d.at, latchAt, sweepSign > 0 ? 1 : 0));
    }
  };
  if (d.type === 'doble' || d.type === 'vaiven') {
    const m = (d.a + d.b) / 2;
    single(d.a, m);
    single(d.b, m);
  } else if (d.type !== 'enrollable') {
    if (d.hinge === 'b') single(d.b, d.a);
    else single(d.a, d.b);
  }
  return out;
}

export const Doors = memo(function Doors({ lod }: { lod: Lod }) {
  return (
    <g className="doors">
      {DOORS.map((d) => {
        if (d.type === 'enrollable') {
          const p = d.dir === 'h' ? `M${d.a} ${d.at} H${d.b}` : `M${d.at} ${d.a} V${d.b}`;
          const guides =
            d.dir === 'h'
              ? [[d.a, d.at], [d.b, d.at]]
              : [[d.at, d.a], [d.at, d.b]];
          return (
            <g key={d.id} data-door={d.id}>
              <path d={p} className="k-m dash-s" stroke="#2b3036" fill="none" />
              {guides.map(([x, y], i) => (
                <rect key={i} x={x - 1.1} y={y - 1.1} width={2.2} height={2.2} fill="#5a6169" />
              ))}
            </g>
          );
        }
        const g = doorGeometry(d);
        return (
          <g key={d.id} data-door={d.id}>
            {g.map((x, i) => (
              <g key={i}>
                {lod >= 2 && <path d={x.arc} fill="none" className="k-x door-arc" />}
                <path d={x.leaf} fill="none" className="door-leaf" strokeWidth={lod >= 3 ? 0.55 : 0.9} />
              </g>
            ))}
            {d.type === 'vaiven' && lod >= 3 && (
              <path
                d={d.dir === 'h' ? `M${d.a} ${d.at + 1.6} H${d.b}` : `M${d.at + 1.6} ${d.a} V${d.b}`}
                className="k-x dash-s"
                stroke="#6b7280"
              />
            )}
          </g>
        );
      })}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Mobiliario (no seleccionable)                                     */
/* ------------------------------------------------------------------ */
function Chair({ x, y, r = 0, lod }: { x: number; y: number; r?: number; lod: Lod }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x={-2.6} y={-2.4} width={5.2} height={4.8} rx={1.3} fill="#eef0f2" className="k-l" />
      {lod >= 3 && <path d="M-2.6 -1.2 Q0 -3.6 2.6 -1.2" fill="none" className="k-m" stroke="#3a4450" />}
    </g>
  );
}

function OfficeChair({ x, y, r = 0, lod }: { x: number; y: number; r?: number; lod: Lod }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      {lod >= 3 && (
        <path
          d={Array.from({ length: 5 }, (_, i) => {
            const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            return `M0 0 L${3.6 * Math.cos(a)} ${3.6 * Math.sin(a)}`;
          }).join(' ')}
          className="k-x"
          stroke="#55606b"
        />
      )}
      <rect x={-2.6} y={-2.4} width={5.2} height={5} rx={1.6} fill="#e7eaee" className="k-l" />
      <rect x={-2.8} y={-3.6} width={5.6} height={1.6} rx={0.7} fill="#5c6670" className="k-l" />
    </g>
  );
}

function Monitor({ x, y, lod }: { x: number; y: number; lod: Lod }) {
  return (
    <g>
      <rect x={x - 6} y={y - 1} width={12} height={1.8} rx={0.4} fill="#2c3440" className="k-l" />
      {lod >= 3 && <rect x={x - 1.5} y={y + 0.8} width={3} height={1.6} fill="#5b6570" />}
      {lod >= 3 && <rect x={x - 5} y={y + 3.6} width={10} height={3.2} rx={0.4} fill="#e5e8eb" className="k-x" />}
      {lod >= 4 && <ellipse cx={x + 7.5} cy={y + 5} rx={0.8} ry={1.2} fill="#e5e8eb" className="k-x" />}
    </g>
  );
}

function Locker({ x, y, w, h, lod }: { x: number; y: number; w: number; h: number; lod: Lod }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#dfe5ea" className="k-l" />
      {lod >= 3 && <rect x={x + 0.8} y={y + 0.8} width={w - 1.6} height={h - 1.6} fill="url(#p-lockers)" className="k-x" />}
    </g>
  );
}

function WC({ x, y, r, lod }: { x: number; y: number; r: number; lod: Lod }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x={-4} y={-6.5} width={8} height={3.2} rx={0.6} fill="#f6f8f9" className="k-m" />
      <path d="M-3 -3.3 Q-3.6 4.2 0 4.6 Q3.6 4.2 3 -3.3 Z" fill="#f6f8f9" className="k-m" />
      {lod >= 3 && <path d="M-1.8 -2.4 Q-2.2 2.8 0 3.2 Q2.2 2.8 1.8 -2.4 Z" fill="none" className="k-x" stroke="#6b7682" />}
    </g>
  );
}

function Sink({ x, y, w, h, lod }: { x: number; y: number; w: number; h: number; lod: Lod }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={0.8} fill="#f4f6f8" className="k-l" />
      <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 1.6} ry={h / 2 - 1.4} fill="url(#g-dome)" className="k-l" />
      {lod >= 3 && <circle cx={x + w / 2} cy={y + h / 2} r={0.45} fill="#6b7682" />}
    </g>
  );
}

function TableSet4({ x, y, lod }: { x: number; y: number; lod: Lod }) {
  return (
    <g>
      {lod >= 2 && (
        <>
          <Chair x={x} y={y - 8.4} lod={lod} />
          <Chair x={x} y={y + 8.4} r={180} lod={lod} />
          <Chair x={x - 8.4} y={y} r={-90} lod={lod} />
          <Chair x={x + 8.4} y={y} r={90} lod={lod} />
        </>
      )}
      <rect x={x - 5.2} y={y - 5.2} width={10.4} height={10.4} rx={0.8} fill="#f3efe8" className="k-m" />
    </g>
  );
}

export const Furniture = memo(function Furniture({ lod }: { lod: Lod }) {
  return (
    <g className="furn">
      {/* ---------- Oficinas ---------- */}
      {[63.5, 134.5, 197].map((cx) => (
        <g key={cx}>
          {lod >= 2 && <Chair x={cx} y={378} r={180} lod={lod} />}
          {lod >= 2 && <OfficeChair x={cx} y={412} r={180} lod={lod} />}
          <rect x={cx - 21.5} y={387} width={43} height={16} fill="#f3efe8" className="k-m" />
          {lod >= 2 && <Monitor x={cx} y={392} lod={lod} />}
          {lod >= 3 && <circle cx={cx + 12} cy={396} r={1} fill="#3a4450" />}
        </g>
      ))}
      {/* Recepción (mueble en L) */}
      <path d="M33 425 H44 V452 H85 V463 H33 Z" fill="#f3efe8" className="k-m" />
      {lod >= 2 && <OfficeChair x={63} y={442} r={0} lod={lod} />}
      {/* Puesto auxiliar (mueble en L) */}
      <path d="M228 425 H217 V452 H183 V463 H228 Z" fill="#f3efe8" className="k-m" />
      {lod >= 2 && <OfficeChair x={200} y={442} r={0} lod={lod} />}
      {/* Puesto inferior con equipo */}
      <rect x={33} y={468} width={24} height={32} fill="#f3efe8" className="k-m" />
      {lod >= 2 && (
        <>
          <g transform="rotate(-90 45 484)">
            <Monitor x={45} y={480} lod={lod} />
          </g>
          <OfficeChair x={66} y={484} r={90} lod={lod} />
        </>
      )}

      {/* ---------- Sala de juntas ---------- */}
      {lod >= 2 &&
        [72, 87.5, 103, 118.5, 134].map((x) => (
          <g key={x}>
            <Chair x={x} y={547.5} lod={lod} />
            <Chair x={x} y={585.5} r={180} lod={lod} />
          </g>
        ))}
      {lod >= 2 && (
        <>
          <Chair x={57} y={566.5} r={-90} lod={lod} />
          <Chair x={149} y={566.5} r={90} lod={lod} />
        </>
      )}
      <rect x={63} y={553} width={80} height={27} rx={5} fill="#f3efe8" className="k-m" />

      {/* ---------- Cafetería ---------- */}
      {[[203, 557], [253, 557], [203, 592], [253, 592]].map(([x, y]) => (
        <TableSet4 key={`${x}${y}`} x={x} y={y} lod={lod} />
      ))}
      {lod >= 2 &&
        [527, 540, 553, 566].map((y) => (
          <g key={y}>
            <Chair x={297} y={y} r={-90} lod={lod} />
            <Chair x={326} y={y} r={90} lod={lod} />
          </g>
        ))}
      <rect x={302} y={521} width={19} height={52} rx={1} fill="#f3efe8" className="k-m" />
      {/* Cocineta */}
      <rect x={366} y={507} width={16.5} height={90} fill="#e9ecef" className="k-m" />
      {lod >= 2 && (
        <>
          <rect x={368} y={528} width={12.5} height={18} rx={0.6} fill="#f7f8f9" className="k-l" />
          {[[371, 532.5], [377.5, 532.5], [371, 541], [377.5, 541]].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <circle cx={x} cy={y} r={2.2} fill="none" className="k-l" stroke="#2b3036" />
              {lod >= 3 && <circle cx={x} cy={y} r={1.1} fill="none" className="k-x" stroke="#2b3036" />}
            </g>
          ))}
          <Sink x={368} y={562} w={12.5} h={9.5} lod={lod} />
          <Sink x={368} y={573} w={12.5} h={9.5} lod={lod} />
        </>
      )}
      <rect x={294} y={594} width={21} height={19} fill="#e9ecef" className="k-m" />
      <rect x={329} y={596} width={23} height={17} fill="#f3f5f7" className="k-m" />
      {lod >= 3 && [0, 1, 2, 3, 4].map((i) => <line key={i} x1={332} y1={599 + i * 2.6} x2={349} y2={599 + i * 2.6} className="k-x" stroke="#4b5563" />)}

      {/* ---------- Vestidores ---------- */}
      {Array.from({ length: 4 }, (_, i) => (
        <Locker key={`d${i}`} x={284 + i * 16.2} y={366} w={16.2} h={11.5} lod={lod} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <Locker key={`v${i}`} x={353 + i * 16} y={366} w={16} h={11.5} lod={lod} />
      ))}
      <Sink x={283.5} y={391} w={11} h={11} lod={lod} />
      <Sink x={283.5} y={403} w={11} h={11} lod={lod} />
      <Sink x={407.5} y={391} w={11} h={11} lod={lod} />
      <Sink x={407.5} y={403} w={11} h={11} lod={lod} />
      <WC x={291} y={438.5} r={-90} lod={lod} />
      <WC x={411} y={438.5} r={90} lod={lod} />
      {/* Antesala: taquillas y banca */}
      {Array.from({ length: 3 }, (_, i) => (
        <Locker key={i} x={284 + i * 17} y={489} w={17} h={14} lod={lod} />
      ))}
      <rect x={335} y={490} width={51} height={12.5} fill="#f3efe8" className="k-m" />
      {lod >= 3 && <line x1={337} y1={496.25} x2={384} y2={496.25} className="k-x k-hid" stroke="#6b5a40" />}
    </g>
  );
});
