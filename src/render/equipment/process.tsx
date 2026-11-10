import type { Equipment, Lod } from '../../model/types';
import { Anchors, BoltCircle, Callout, Motor, Nozzle, Shadow, T, Valve, deg } from '../prims';

export interface EqProps {
  e: Equipment;
  lod: Lod;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ================================================================== */
/*  Báscula de plataforma                                             */
/* ================================================================== */
export function Bascula({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  if (lod === 1) return <rect x={-w + 2} y={-h + 4} width={e.w - 4} height={e.h - 8} fill="#d7dce0" className="k-m" />;
  return (
    <g>
      {/* Foso / marco */}
      <rect x={-w} y={-h + 5} width={e.w} height={e.h - 10} fill={lod >= 3 ? 'url(#p-concrete)' : '#d4d6d3'} className="k-l" />
      {/* Rampas */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${-w + 2} ${s * (h - 5)} L${-w + 4} ${s * h} H${w - 4} L${w - 2} ${s * (h - 5)} Z`} fill="#c2c7cb" className="k-m" />
          {lod >= 3 &&
            range(7).map((i) => (
              <line key={i} x1={-w + 6 + i * 5.5} y1={s * (h - 4.4)} x2={-w + 6 + i * 5.5} y2={s * (h - 0.8)} className="k-x" stroke="#7b848c" />
            ))}
        </g>
      ))}
      {/* Plataforma */}
      <rect x={-w + 3.5} y={-h + 6.5} width={e.w - 7} height={e.h - 13} fill={lod >= 3 ? 'url(#p-checker)' : '#e1e5e8'} className="k-h" />
      {/* Juntas de módulos */}
      {[-30.5, 0, 30.5].map((yy) => (
        <line key={yy} x1={-w + 3.5} y1={yy} x2={w - 3.5} y2={yy} className="k-m" stroke="#59636d" />
      ))}
      {/* Bordillos laterales */}
      {lod >= 3 &&
        [-1, 1].map((s) => (
          <rect key={s} x={s > 0 ? w - 3.5 : -w + 2.2} y={-h + 6.5} width={1.3} height={e.h - 13} fill="url(#g-safety)" className="k-x" />
        ))}
      {/* Celdas de carga en esquinas (bloques de la referencia) */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
        <g key={i} transform={`translate(${sx * (w - 6.5)} ${sy * (h - 13)})`}>
          <rect x={-3} y={-3.6} width={6} height={7.2} fill="#f4f6f7" className="k-m" />
          {lod >= 3 && (
            <>
              <circle r={1.7} fill="#c9d0d6" className="k-l" />
              <circle r={0.6} fill="#58626c" />
            </>
          )}
          {lod >= 4 && <BoltCircle cx={0} cy={0} r={2.4} n={4} br={0.25} a0={45} />}
        </g>
      ))}
      {/* Caja de conexiones */}
      {lod >= 3 && (
        <g>
          <rect x={w - 2.3} y={38} width={3.2} height={4.4} fill="#e8eaec" className="k-l" />
          <path d={`M${w - 0.7} 42.4 V50`} className="k-l k-hid" stroke="#3a4450" />
        </g>
      )}
      <T x={0} y={0} s={5.2} rotate={-90} weight={700}>BÁSCULA</T>
      {lod >= 4 && (
        <>
          <Callout from={[-w + 6.5, -h + 13]} to={[-w - 4, -h + 2]} text="Celda de carga" anchor="end" />
          <Callout from={[8, -45]} to={[w + 6, -50]} text="Placa antideslizante" />
          <Callout from={[0, -h + 2.5]} to={[w + 6, -h - 2]} text="Rampa de acceso" />
          <Callout from={[-10, 30.5]} to={[-w - 4, 26]} text="Junta de módulos" anchor="end" />
          <Callout from={[w - 0.7, 40]} to={[w + 6, 44]} text="Caja de conexiones" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Carro de plataforma                                               */
/* ================================================================== */
export function Carro({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  const dx = -w + 4; // borde de la plataforma (el asa ocupa 4 u a la izquierda)
  const dw = e.w - 4;
  if (lod === 1) return <rect x={dx} y={-h} width={dw} height={e.h} fill="#c7cdd3" className="k-m" />;
  return (
    <g>
      <Shadow d={0.6}>
        <rect x={dx} y={-h} width={dw} height={e.h} rx={1} />
      </Shadow>
      {/* Ruedas (asoman bajo la plataforma) */}
      {lod >= 3 &&
        [[dx + 4, -h], [dx + dw - 4, -h], [dx + 4, h], [dx + dw - 4, h]].map(([x, y], i) => (
          <rect key={i} x={x - 2} y={y - 0.9} width={4} height={1.8} rx={0.8} fill="#2a2f35" />
        ))}
      {/* Plataforma */}
      <rect x={dx} y={-h} width={dw} height={e.h} rx={1} fill="url(#g-ss)" className="k-m" />
      <rect x={dx + 1} y={-h + 1} width={dw - 2} height={e.h - 2} rx={0.6} fill="none" className="k-x" stroke="#7a858f" />
      {lod >= 3 &&
        range(Math.floor((dw - 4) / 2.4)).map((i) => (
          <line key={i} x1={dx + 2.5 + i * 2.4} y1={-h + 2} x2={dx + 2.5 + i * 2.4} y2={h - 2} className="k-x" stroke="#a3adb6" />
        ))}
      {/* Asa */}
      <path d={`M${dx} ${-h + 2} H${-w + 1} V${h - 2} H${dx}`} fill="none" className="k-h" stroke="#2d3740" />
      <rect x={-w + 0.2} y={-h + 3} width={1.6} height={e.h - 6} rx={0.7} fill="#3a7bd5" className="k-x" />
      {lod >= 4 &&
        [[dx + 4, -h + 2.5], [dx + dw - 4, -h + 2.5], [dx + 4, h - 2.5], [dx + dw - 4, h - 2.5]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={1.3} className="k-x k-hid" stroke="#4b5563" />
            <circle cx={x} cy={y} r={0.25} fill="#4b5563" />
          </g>
        ))}
      {e.caption && lod >= 3 && (
        <T x={dx + dw / 2} y={0} s={3.2} weight={700} fill="#33414e">
          {e.caption}
        </T>
      )}
    </g>
  );
}

/* ================================================================== */
/*  LN-101 Lavadora de cáscaras                                       */
/* ================================================================== */
export function Lavadora({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  if (lod === 1)
    return (
      <g>
        <rect x={-w} y={-h} width={e.w} height={e.h} fill="#cfe1ec" className="k-m" />
        <rect x={25.5} y={16} width={23} height={22.5} fill="#dde3e8" className="k-m" />
      </g>
    );
  const sprayX = [-32, -16, 0, 16];
  return (
    <g>
      <Shadow>
        <rect x={-w} y={-h} width={e.w} height={e.h} rx={1.2} />
        <rect x={25.5} y={16} width={23} height={22.5} />
      </Shadow>
      {/* Tina */}
      <rect x={-w} y={-h} width={e.w} height={e.h} rx={1.2} fill="url(#g-ss)" className="k-h" />
      <rect x={-w + 2} y={-17} width={e.w - 4} height={46} fill={lod >= 3 ? 'url(#p-water)' : '#cfe3ef'} className="k-m" />
      {/* Franja de alimentación */}
      <rect x={-w + 2} y={-h + 2} width={e.w - 4} height={12} fill="#e9edf0" className="k-l" />
      {/* Tolva de alimentación inclinada (rayado como en la referencia) */}
      <path d={`M${-w + 2} ${-h + 2} H-26 L-36 -17 H${-w + 2} Z`} fill="#dfe4e8" className="k-m" />
      {range(lod >= 3 ? 9 : 5).map((i) => {
        const t = (i + 1) / (lod >= 3 ? 10 : 6);
        const x0 = -w + 2 + t * (22.5 - 0);
        return <line key={i} x1={x0} y1={-h + 2} x2={x0 - 9} y2={-17} className="k-x" stroke="#68737d" />;
      })}
      {/* Tambor de paletas (oculto bajo el agua) */}
      {lod >= 3 && (
        <g>
          <rect x={-40} y={-6} width={62} height={22} rx={10} fill="none" className="k-l k-hid" stroke="#36546b" />
          <line x1={-44} y1={5} x2={26} y2={5} className="k-x k-cen" stroke="#36546b" />
          {range(11).map((i) => (
            <line key={i} x1={-36 + i * 5.6} y1={-4} x2={-36 + i * 5.6} y2={14} className="k-x" stroke="#5a7f99" strokeOpacity={0.7} />
          ))}
        </g>
      )}
      {/* Barras de aspersión */}
      {lod >= 3 &&
        sprayX.map((x) => (
          <g key={x}>
            <rect x={x - 0.6} y={-19} width={1.2} height={44} fill="url(#g-cyl-y)" className="k-x" />
            {lod >= 4 && range(8).map((j) => <circle key={j} cx={x} cy={-14 + j * 5.2} r={0.35} fill="#1e5f8a" />)}
          </g>
        ))}
      {/* Colector de agua de lavado */}
      <rect x={-24} y={-22} width={68} height={2} fill="url(#g-cyl-x)" className="k-l" />
      {lod >= 3 && sprayX.map((x) => <rect key={x} x={x - 1} y={-22.6} width={2} height={3.2} fill="#b9c2ca" className="k-x" />)}
      <Nozzle x={-3.5} y={-22} ang={-90} len={9} d={1.8} lod={lod} />
      {/* Motorreductor del tambor */}
      <rect x={30} y={-28} width={7} height={8} rx={0.6} fill="url(#g-paint-green)" className="k-m" />
      <Motor x={42} y={-24} len={10} w={5.6} lod={lod} rot={180} frame={false} />
      {/* Tolva de descarga */}
      <rect x={25.5} y={16} width={23} height={22.5} fill="url(#g-ss)" className="k-h" />
      <path d="M25.5 16 L35 27.5 M48.5 16 L39 27.5 M25.5 38.5 L35 31.5 M48.5 38.5 L39 31.5" className="k-l" stroke="#5c6670" />
      <rect x={35} y={27.5} width={4} height={4} fill="#9aa4ad" className="k-m" />
      {/* Vertedero de rebose y drenaje */}
      {lod >= 3 && <rect x={-w - 1.2} y={6} width={1.8} height={7} fill="#c3cbd2" className="k-l" />}
      <Nozzle x={-w} y={24} ang={180} len={4.5} d={1.6} lod={lod} />
      {lod >= 3 && <Valve x={-w - 2.6} y={24} s={2.4} />}
      {/* Pernos del borde */}
      {lod >= 4 &&
        range(12).map((i) => (
          <g key={i}>
            <circle cx={-w + 4 + i * 8} cy={-h + 0.9} r={0.28} fill="#56606a" />
            <circle cx={-w + 4 + i * 8} cy={h - 0.9} r={0.28} fill="#56606a" />
          </g>
        ))}
      {lod >= 4 && (
        <>
          <Callout from={[-38, -24]} to={[-w - 6, -h - 5]} text="Tolva de alimentación" anchor="end" />
          <Callout from={[0, -21]} to={[8, -h - 6]} text="Colector de agua de lavado" />
          <Callout from={[16, 10]} to={[w + 8, 4]} text="Barras de aspersión" />
          <Callout from={[-20, 12]} to={[-w - 6, 20]} text="Tambor de paletas (oculto)" anchor="end" />
          <Callout from={[37, 29]} to={[w + 8, 32]} text="Tolva de descarga" />
          <Callout from={[42, -24]} to={[w + 8, -18]} text="Motorreductor" />
          <Callout from={[-w - 2.6, 24]} to={[-w - 6, 32]} text="Válvula de drenaje" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  CR-101 Trituradora                                                */
/* ================================================================== */
export function Trituradora({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-16} y={-18} width={32} height={18} fill="#9fb3a5" className="k-m" />
        <rect x={-11} y={0} width={22} height={18} fill="#d7dde2" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow>
        <rect x={-16} y={-18} width={32} height={18} />
        <rect x={-11} y={0} width={22} height={18} />
      </Shadow>
      {/* Tolva de descarga inferior (cono) */}
      <rect x={-11} y={-1} width={22} height={19} fill="url(#g-ss)" className="k-h" />
      <path d="M-11 -1 L-2.5 10 M11 -1 L2.5 10 M-11 18 L-2.5 14 M11 18 L2.5 14" className="k-l" stroke="#5c6670" />
      <rect x={-2.5} y={10} width={5} height={4} fill="#9aa4ad" className="k-m" />
      {/* Bastidor */}
      <rect x={-16} y={-18} width={32} height={17} rx={0.8} fill="url(#g-paint-green)" className="k-h" />
      {lod >= 3 && <Anchors x={-16} y={-18} w={32} h={17} />}
      {/* Cámara de rotor */}
      <rect x={-3} y={-16} width={17} height={13} rx={1} fill="#6f8a77" className="k-m" />
      {/* Tolva de alimentación */}
      <rect x={-2} y={-15} width={15} height={11} fill="#dfe5e9" className="k-m" />
      <path d="M-2 -15 L2.5 -11 M13 -15 L8.5 -11 M-2 -4 L2.5 -7.5 M13 -4 L8.5 -7.5" className="k-l" stroke="#5c6670" />
      <rect x={2.5} y={-11} width={6} height={3.5} fill="#7b8792" className="k-m" />
      {lod >= 3 && <line x1={-4} y1={-9.5} x2={15} y2={-9.5} className="k-x k-cen" stroke="#203040" />}
      {/* Motor + guarda de transmisión */}
      <Motor x={-10} y={-9.5} len={10} w={6.6} lod={lod} frame={false} />
      <rect x={-5.2} y={-12} width={2.4} height={5} fill="url(#g-safety)" className="k-l" />
      {lod >= 4 && (
        <>
          <BoltCircle cx={0} cy={12} r={3.8} n={8} br={0.2} />
          <Callout from={[-10, -9.5]} to={[-24, -20]} text="Motor" anchor="end" />
          <Callout from={[5.5, -9]} to={[22, -22]} text="Tolva de alimentación" />
          <Callout from={[-4, -11]} to={[-24, -14]} text="Acoplamiento (guarda)" anchor="end" />
          <Callout from={[0, 12]} to={[-24, 14]} text="Descarga triturado" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  CR-102 Cortadora                                                  */
/* ================================================================== */
export function Cortadora({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-18} y={-1} width={38} height={23} fill="#9fb3a5" className="k-m" />
        <rect x={-21} y={-16} width={22} height={9} transform="rotate(48 -9 -11)" fill="#c7cdd3" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow>
        <rect x={-18} y={-1} width={38} height={23} />
      </Shadow>
      {/* Transportador de alimentación inclinado */}
      <g transform="translate(-8 -11) rotate(52)">
        <rect x={-14} y={-5} width={26} height={10} rx={0.6} fill="#b3bcc4" className="k-m" />
        <rect x={-13} y={-3.6} width={24} height={7.2} fill={lod >= 3 ? 'url(#p-belt)' : '#4a5056'} className="k-l" />
        {lod >= 3 && (
          <>
            <circle cx={-13} cy={0} r={0.6} fill="#ccd3d9" className="k-x" />
            <circle cx={11} cy={0} r={0.6} fill="#ccd3d9" className="k-x" />
            {range(6).map((i) => (
              <line key={i} x1={-11 + i * 4} y1={-3.6} x2={-11 + i * 4} y2={3.6} className="k-x" stroke="#9aa3ab" />
            ))}
          </>
        )}
      </g>
      {/* Cuerpo */}
      <rect x={-18} y={-1} width={38} height={23} rx={1} fill="url(#g-paint-green)" className="k-h" />
      {lod >= 3 && <Anchors x={-18} y={-1} w={38} h={23} />}
      {/* Cabezal de corte */}
      <circle cx={2} cy={10} r={8} fill="url(#g-dome)" className="k-m" />
      <path d="M2 2 A8 8 0 0 1 10 10" fill="none" className="k-h" stroke="#d9a514" />
      {lod >= 3 &&
        range(6).map((i) => {
          const a = deg(i * 60 + 15);
          return (
            <line key={i} x1={2 + 2 * Math.cos(a)} y1={10 + 2 * Math.sin(a)} x2={2 + 6.6 * Math.cos(a)} y2={10 + 6.6 * Math.sin(a)} className="k-l" stroke="#3a4651" />
          );
        })}
      <circle cx={2} cy={10} r={1.4} fill="#5d6873" className="k-l" />
      {/* Motor (círculo izquierdo de la referencia) */}
      <Motor x={-12} y={10} len={9} w={7} lod={lod} frame={false} />
      {/* Volante (círculo derecho de la referencia) */}
      <circle cx={15.5} cy={14} r={3.6} fill="#d6dce1" className="k-m" />
      {lod >= 3 &&
        range(4).map((i) => {
          const a = deg(i * 45);
          return <line key={i} x1={15.5 - 3.2 * Math.cos(a)} y1={14 - 3.2 * Math.sin(a)} x2={15.5 + 3.2 * Math.cos(a)} y2={14 + 3.2 * Math.sin(a)} className="k-x" stroke="#5b6670" />;
        })}
      {/* Descarga */}
      <path d="M-2 22 h8 l-1.5 3 h-5 z" fill="#c8cfd5" className="k-m" />
      {lod >= 4 && (
        <>
          <Callout from={[-14, -18]} to={[-27, -24]} text="Banda de alimentación" anchor="end" />
          <Callout from={[6, 6]} to={[27, -6]} text="Cabezal de cuchillas" />
          <Callout from={[-12, 10]} to={[-27, 12]} text="Motor" anchor="end" />
          <Callout from={[15.5, 14]} to={[27, 18]} text="Volante" />
          <Callout from={[2, 24]} to={[-27, 26]} text="Descarga" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  M-103 Molino                                                      */
/* ================================================================== */
export function MolinoMartillos({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-14} y={-6} width={30} height={22} fill="#9fb3a5" className="k-m" />
        <circle cx={-3} cy={5} r={8.5} fill="#b9c4bd" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow>
        <rect x={-14} y={-6} width={30} height={22} />
        <circle cx={-3} cy={5} r={8.5} />
      </Shadow>
      {/* Bastidor */}
      <rect x={-14} y={-6} width={30} height={22} rx={0.8} fill="#7d9585" className="k-h" />
      {lod >= 3 && <Anchors x={-14} y={-6} w={30} h={22} />}
      {/* Cámara de molienda */}
      <circle cx={-3} cy={5} r={8.5} fill="url(#g-dome-warm)" className="k-h" />
      {lod >= 3 && (
        <g>
          <circle cx={-3} cy={5} r={6} fill="none" className="k-l k-hid" stroke="#3b4a56" />
          {range(4).map((i) => {
            const a = deg(i * 90 + 20);
            return (
              <line key={i} x1={-3 + 1.5 * Math.cos(a)} y1={5 + 1.5 * Math.sin(a)} x2={-3 + 5.4 * Math.cos(a)} y2={5 + 5.4 * Math.sin(a)} className="k-l k-hid" stroke="#3b4a56" />
            );
          })}
        </g>
      )}
      <circle cx={-3} cy={5} r={1.5} fill="#7a8692" className="k-l" />
      {lod >= 4 && <BoltCircle cx={-3} cy={5} r={7.6} n={12} br={0.22} />}
      {/* Acoplamiento y motor */}
      <rect x={5} y={2.5} width={2.6} height={5} fill="url(#g-safety)" className="k-l" />
      <Motor x={11.5} y={5} len={9} w={6.4} rot={180} lod={lod} frame={false} />
      {/* Tolva de alimentación inclinada */}
      <g transform="translate(-4 -10) rotate(-18)">
        <rect x={-7.5} y={-6} width={15} height={11} fill="#e2e7ea" className="k-h" />
        <path d="M-7.5 -6 L-2.5 -2 M7.5 -6 L2.5 -2 M-7.5 5 L-2.5 1.5 M7.5 5 L2.5 1.5" className="k-l" stroke="#5c6670" />
        <rect x={-2.5} y={-2} width={5} height={3.5} fill="#8d98a2" className="k-m" />
      </g>
      {lod >= 4 && (
        <>
          <Callout from={[-4, -12]} to={[-24, -16]} text="Tolva de alimentación" anchor="end" />
          <Callout from={[-6, 9]} to={[-24, 12]} text="Rotor (oculto)" anchor="end" />
          <Callout from={[11.5, 5]} to={[24, -2]} text="Motor" />
          <Callout from={[6, 5]} to={[24, 12]} text="Acoplamiento" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  R-201 Reactor agitado con chaqueta                                */
/* ================================================================== */
export function Reactor({ e, lod }: EqProps) {
  const R = 15.5;
  const mirror = e.id.endsWith('b') ? -1 : 1;
  if (lod === 1)
    return (
      <g>
        <circle r={R + 1} fill="#dfe4e9" className="k-m" />
        <rect x={-3.5} y={-3.5} width={7} height={7} fill="#4f6d89" />
      </g>
    );
  // Boquilla de alimentación conectada al colector (ver networks.ts)
  const feed: [number, number] = mirror > 0 ? [10, -11] : [12, -9];
  return (
    <g>
      <Shadow d={1.1}>
        <circle r={R + 1.2} />
      </Shadow>
      {/* Orejetas de soporte */}
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <rect x={R} y={-1.6} width={3.6} height={3.2} fill="#c3cad1" className="k-m" />
          {lod >= 3 && <circle cx={R + 2.3} cy={0} r={0.5} fill="#fff" className="k-x" />}
        </g>
      ))}
      {/* Chaqueta de calentamiento */}
      <circle r={R + 1.2} fill={lod >= 3 ? 'url(#p-insul)' : '#d8d2c4'} className="k-m" />
      {lod >= 3 && <circle r={R + 1.2} fill="#e9e1cf" opacity={0.55} />}
      {/* Cabezal toriesférico */}
      <circle r={R} fill="url(#g-dome)" className="k-h" />
      {lod >= 3 && <circle r={R * 0.78} fill="none" className="k-x" stroke="#8792a0" />}
      {/* Internos ocultos: bafles e impulsor */}
      {lod >= 4 && (
        <g stroke="#2d5f86">
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a + 22})`}>
              <rect x={R - 3.6} y={-0.7} width={2.6} height={1.4} fill="none" className="k-x k-hid" />
            </g>
          ))}
          {[0, 120, 240].map((a) => (
            <g key={a} transform={`rotate(${a + 10})`}>
              <path d={`M3.5 -1.2 L${R * 0.58} -2.2 L${R * 0.6} 1.6 L3.5 1.2 Z`} fill="none" className="k-x k-hid" />
            </g>
          ))}
        </g>
      )}
      {/* Boca de hombre */}
      <g transform={`translate(${-8 * mirror} 7)`}>
        <circle r={3.6} fill="#e7ebee" className="k-m" />
        <circle r={2.6} fill="url(#g-dome)" className="k-l" />
        {lod >= 3 && <rect x={mirror > 0 ? -5 : 3.6} y={-0.8} width={1.4} height={1.6} fill="#8d97a1" className="k-x" />}
        {lod >= 4 && <BoltCircle cx={0} cy={0} r={3.1} n={12} br={0.17} />}
      </g>
      {/* Boquillas del cabezal */}
      {lod >= 3 && (
        <g>
          <circle cx={feed[0]} cy={feed[1]} r={1.9} fill="#d6dce1" className="k-m" />
          <circle cx={feed[0]} cy={feed[1]} r={1.1} fill="#7c8791" className="k-x" />
          {/* Venteo */}
          <circle cx={-2 * mirror} cy={-11} r={1.4} fill="#d6dce1" className="k-m" />
          {/* Visor con vidrio */}
          <circle cx={11 * mirror} cy={4} r={1.6} fill="url(#g-glass)" className="k-m" />
          {/* Termopozo */}
          <circle cx={3 * mirror} cy={11} r={1} fill="#d6dce1" className="k-m" />
          {/* Válvula de seguridad */}
          <circle cx={-11.5 * mirror} cy={-3} r={1.5} fill="#d6dce1" className="k-m" />
          {lod >= 4 && <rect x={-11.5 * mirror - 0.6} y={-5.6} width={1.2} height={2.6} fill="#c0392b" className="k-x" />}
        </g>
      )}
      {/* Conexiones de chaqueta (vapor / condensado) */}
      {lod >= 3 && (
        <>
          <Nozzle x={(R + 1) * Math.cos(deg(200)) * mirror} y={(R + 1) * Math.sin(deg(200))} ang={mirror > 0 ? 200 : -20} len={3.2} d={1.4} lod={lod} />
          <Nozzle x={(R + 1) * Math.cos(deg(160)) * mirror} y={(R + 1) * Math.sin(deg(160))} ang={mirror > 0 ? 160 : 20} len={3.2} d={1.4} lod={lod} />
        </>
      )}
      {/* Accionamiento del agitador: brida, reductor y motor vertical */}
      {lod >= 3 && <circle r={5.6} fill="#c9d0d6" className="k-m" />}
      {lod >= 4 && <BoltCircle cx={0} cy={0} r={5} n={8} br={0.22} a0={22.5} />}
      <rect x={-4} y={-4} width={8} height={8} rx={0.8} fill="url(#g-motor)" className="k-h" />
      <circle r={3.1} fill="url(#g-dome-dark)" className="k-m" />
      {lod >= 3 && (
        <g stroke="#c9d6e2">
          <circle r={2.1} fill="none" className="k-x" />
          <path d="M-1.8 0 H1.8 M0 -1.8 V1.8 M-1.3 -1.3 L1.3 1.3 M-1.3 1.3 L1.3 -1.3" className="k-x" />
        </g>
      )}
      {lod >= 3 && <rect x={3.4} y={-1.1} width={2.2} height={2.2} fill="#5b7894" className="k-x" />}
      {lod >= 4 && (
        <>
          <Callout from={[0, -2.5]} to={[-26 * mirror, -24]} text="Motorreductor del agitador" anchor={mirror > 0 ? 'end' : 'start'} />
          <Callout from={[-8 * mirror, 7]} to={[-26 * mirror, 14]} text="Boca de hombre" anchor={mirror > 0 ? 'end' : 'start'} />
          <Callout from={[feed[0], feed[1]]} to={[24 * mirror, -24]} text="Alimentación" anchor={mirror > 0 ? 'start' : 'end'} />
          <Callout from={[11 * mirror, 4]} to={[26 * mirror, 8]} text="Visor" anchor={mirror > 0 ? 'start' : 'end'} />
          <Callout from={[(R + 0.6) * Math.cos(deg(250)), (R + 0.6) * Math.sin(deg(250))]} to={[-14 * mirror, -24]} text="Chaqueta" anchor={mirror > 0 ? 'end' : 'start'} />
          <Callout from={[R * 0.55, 3]} to={[24 * mirror, 20]} text="Impulsor / bafles (oculto)" anchor={mirror > 0 ? 'start' : 'end'} />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  F-301 Filtro prensa                                               */
/* ================================================================== */
export function FiltroPrensa({ e: _e, lod }: EqProps) {
  const plates = 18;
  const p0 = -25, pw = 2;
  if (lod === 1)
    return (
      <g>
        <rect x={-33} y={-15} width={66} height={30} fill="#d5dbe0" className="k-m" />
        <rect x={p0} y={-11} width={plates * pw} height={22} fill="#bfc8d0" />
      </g>
    );
  return (
    <g>
      <Shadow>
        <rect x={-33} y={-15} width={66} height={30} />
      </Shadow>
      {/* Bandeja de goteo (oculta) */}
      {lod >= 3 && <rect x={-27} y={-14} width={50} height={28} fill="none" className="k-l k-hid" stroke="#4b5563" />}
      {/* Patas */}
      {[[-31, -15], [-31, 15], [31, -15], [31, 15]].map(([x, y], i) => (
        <rect key={i} x={x - 1.8} y={y - 1.8} width={3.6} height={3.6} fill="#3f4a55" />
      ))}
      {/* Vigas laterales */}
      {[-1, 1].map((s) => (
        <rect key={s} x={-30} y={s * 12.5 - 1.3} width={62} height={2.6} fill="url(#g-cyl-x)" className="k-m" />
      ))}
      {/* Cabezal fijo */}
      <rect x={-31.5} y={-15} width={6.5} height={30} rx={0.6} fill="url(#g-motor-y)" className="k-h" />
      {/* Paquete de placas */}
      {range(plates).map((i) => (
        <g key={i}>
          <rect x={p0 + i * pw} y={-11} width={pw} height={22} fill={i % 2 ? '#d3dbe2' : '#e8edf1'} className={lod >= 3 ? 'k-l' : 'k-x'} />
          {lod >= 3 && (
            <>
              <rect x={p0 + i * pw + 0.3} y={-14} width={pw - 0.6} height={3.2} rx={0.3} fill="#9aa6b1" className="k-x" />
              <rect x={p0 + i * pw + 0.3} y={10.8} width={pw - 0.6} height={3.2} rx={0.3} fill="#9aa6b1" className="k-x" />
            </>
          )}
          {lod >= 4 && <circle cx={p0 + i * pw + 1} cy={9} r={0.35} fill="#2f6f9a" />}
        </g>
      ))}
      {lod === 2 && <rect x={p0} y={-11} width={plates * pw} height={22} fill="none" className="k-m" />}
      {/* Cabezal móvil */}
      <rect x={11} y={-14.5} width={3.6} height={29} rx={0.5} fill="url(#g-motor-y)" className="k-h" />
      {/* Cilindro hidráulico */}
      <rect x={14.6} y={-1} width={4} height={2} fill="#dfe5ea" className="k-l" />
      <rect x={18.5} y={-3.2} width={11} height={6.4} rx={1.2} fill="url(#g-cyl-x)" className="k-m" />
      {/* Cabezal trasero */}
      <rect x={29.5} y={-15} width={3.5} height={30} rx={0.5} fill="url(#g-motor-y)" className="k-h" />
      {/* Canal de filtrado */}
      {lod >= 3 && <rect x={-25} y={15.6} width={36} height={1.8} fill="url(#g-cyl-x)" className="k-l" />}
      {/* Alimentación */}
      <Nozzle x={-31.5} y={0} ang={180} len={3.2} d={2} lod={lod} />
      {lod >= 3 && <Valve x={-34} y={0} rot={0} s={2.2} />}
      {/* Descarga a residuos (conecta con la tubería roja) */}
      <Nozzle x={33} y={-3} ang={0} len={2.6} d={1.6} lod={lod} />
      {/* Grupo hidráulico */}
      {lod >= 3 && (
        <g>
          <rect x={20} y={6} width={8.5} height={5.6} rx={0.4} fill="#e5e8eb" className="k-m" />
          <Motor x={24.2} y={8.8} len={5.4} w={3.2} lod={lod} frame={false} />
        </g>
      )}
      {lod >= 4 && (
        <>
          <Callout from={[-28, -10]} to={[-36, -22]} text="Cabezal fijo" anchor="end" />
          <Callout from={[-8, -5]} to={[-6, -24]} text="Paquete de placas" />
          <Callout from={[12.8, -12]} to={[14, -24]} text="Cabezal móvil" />
          <Callout from={[24, 0]} to={[38, -14]} text="Cilindro hidráulico" />
          <Callout from={[24, 8.8]} to={[38, 12]} text="Grupo hidráulico" />
          <Callout from={[-10, 16.5]} to={[-36, 22]} text="Canal de filtrado" anchor="end" />
          <Callout from={[-34, 0]} to={[-40, 8]} text="Alimentación" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  TA-401 Tanque de precipitación                                    */
/* ================================================================== */
export function TanquePrecipitacion({ e: _e, lod }: EqProps) {
  const R = 15;
  if (lod === 1) return <circle r={R} fill="#e3e6e2" className="k-m" />;
  return (
    <g>
      <Shadow>
        <circle r={R} />
      </Shadow>
      {[45, 135, 225, 315].map((a) => (
        <rect key={a} transform={`rotate(${a})`} x={R - 0.6} y={-1.3} width={3.2} height={2.6} fill="#c3cad1" className="k-m" />
      ))}
      {/* Boquillas cardinales */}
      {lod >= 3 && [0, 90, 180, 270].map((a) => <Nozzle key={a} x={R * Math.cos(deg(a))} y={R * Math.sin(deg(a))} ang={a} len={2} d={1.8} lod={lod} />)}
      <circle r={R} fill="url(#g-dome-warm)" className="k-h" />
      {lod >= 3 && <circle r={R * 0.74} fill="none" className="k-x" stroke="#8a948f" />}
      {/* Boca de hombre */}
      <g transform="translate(-7.5 7.5)">
        <circle r={3} fill="#eceeec" className="k-m" />
        {lod >= 4 && <BoltCircle cx={0} cy={0} r={2.45} n={10} br={0.16} />}
      </g>
      {/* Venteo */}
      {lod >= 3 && (
        <g transform="translate(6.5 -8)">
          <circle r={1.6} fill="#d6dbd8" className="k-m" />
          <path d="M0 0 h2.6" className="k-m" stroke="#56606a" />
        </g>
      )}
      {/* Transmisor de nivel */}
      {lod >= 3 && (
        <g transform="translate(9 6)">
          <circle r={1.3} fill="#2f6f9a" className="k-l" />
          <rect x={-0.9} y={1.2} width={1.8} height={1.4} fill="#e1e6ea" className="k-x" />
        </g>
      )}
      {lod >= 4 && (
        <>
          <Callout from={[-7.5, 7.5]} to={[-24, 16]} text="Boca de hombre" anchor="end" />
          <Callout from={[6.5, -8]} to={[22, -18]} text="Venteo" />
          <Callout from={[9, 6]} to={[22, 14]} text="Transmisor de nivel" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  CD-501 Secador spray                                              */
/* ================================================================== */
export function SecadorSpray({ e: _e, lod }: EqProps) {
  const R = 20, S = 23;
  if (lod === 1)
    return (
      <g>
        <circle r={R} fill="#e4e8ec" className="k-m" />
        <circle r={4} fill="#4f6d89" />
      </g>
    );
  return (
    <g>
      {/* Estructura soporte + plataforma */}
      {lod >= 3 && (
        <g>
          <path
            d={`M${-S} ${-S} H${S} V${S} H${-S} Z M${R + 1.2} 0 A${R + 1.2} ${R + 1.2} 0 1 0 ${-R - 1.2} 0 A${R + 1.2} ${R + 1.2} 0 1 0 ${R + 1.2} 0 Z`}
            fill="url(#p-grating)"
            fillRule="evenodd"
            className="k-l"
          />
          <rect x={-S + 0.8} y={-S + 0.8} width={2 * S - 1.6} height={2 * S - 1.6} fill="none" className="k-m" stroke="#d9a514" />
        </g>
      )}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
        <rect key={i} x={sx * S - 1.6} y={sy * S - 1.6} width={3.2} height={3.2} fill="#3e4a56" />
      ))}
      {lod === 2 && <rect x={-S} y={-S} width={2 * S} height={2 * S} fill="none" className="k-x k-hid" stroke="#56606a" />}
      <Shadow d={1.2}>
        <circle r={R} />
      </Shadow>
      {/* Cámara (techo) */}
      <circle r={R} fill="url(#g-dome)" className="k-h" />
      <circle r={R * 0.8} fill="none" className="k-l" stroke="#8b96a2" />
      {/* Dispersor de aire con álabes */}
      <circle r={9} fill="#d3d9df" className="k-m" />
      {lod >= 3 &&
        range(18).map((i) => {
          const a = deg(i * 20);
          return <line key={i} x1={9 * Math.cos(a)} y1={9 * Math.sin(a)} x2={15.6 * Math.cos(a + 0.2)} y2={15.6 * Math.sin(a + 0.2)} className="k-x" stroke="#6b7682" />;
        })}
      {/* Atomizador rotativo */}
      <circle r={4.4} fill="url(#g-dome-dark)" className="k-h" />
      {lod >= 3 && (
        <g stroke="#c9d6e2">
          <circle r={2.8} fill="none" className="k-x" />
          <path d="M-2.4 0 H2.4 M0 -2.4 V2.4" className="k-x" />
        </g>
      )}
      {lod >= 4 && <BoltCircle cx={0} cy={0} r={6.8} n={12} br={0.24} />}
      {/* Cono inferior (oculto) */}
      {lod >= 3 && <circle r={R * 0.3} fill="none" className="k-x k-hid" stroke="#2d5f86" />}
      {/* Mirilla y puerta de inspección */}
      {lod >= 3 && (
        <>
          <circle cx={-R * 0.7} cy={R * 0.45} r={1.6} fill="url(#g-glass)" className="k-m" />
          <rect x={R * 0.52} y={R * 0.38} width={4} height={2.8} rx={0.4} fill="#e8ecef" className="k-m" />
        </>
      )}
      {lod >= 4 && (
        <>
          <Callout from={[0, 0]} to={[-30, -26]} text="Atomizador rotativo" anchor="end" />
          <Callout from={[12 * Math.cos(deg(30)), 12 * Math.sin(deg(30))]} to={[30, 16]} text="Dispersor de aire" />
          <Callout from={[-R * 0.7, R * 0.45]} to={[-30, 20]} text="Mirilla" anchor="end" />
          <Callout from={[R * 0.6, R * 0.44]} to={[30, 26]} text="Puerta de inspección" />
          <Callout from={[-S + 2, S - 2]} to={[-30, 28]} text="Plataforma de servicio (rejilla)" anchor="end" />
          <Callout from={[S, -S]} to={[30, -26]} text="Columna de soporte" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  CO-65H Ciclón                                                     */
/* ================================================================== */
export function Ciclon({ e: _e, lod }: EqProps) {
  const R = 9.5;
  if (lod === 1) return <circle r={R} fill="#e1e6ea" className="k-m" />;
  return (
    <g>
      <Shadow>
        <circle r={R} />
      </Shadow>
      {[45, 135, 225, 315].map((a) => (
        <rect key={a} transform={`rotate(${a})`} x={R - 0.4} y={-1.1} width={3} height={2.2} fill="#c3cad1" className="k-m" />
      ))}
      {/* Entrada tangencial */}
      <path d={`M-12 -15.5 H0 A${R} ${R} 0 0 0 -${R - 1} -3.5 H-12 Z`} fill="url(#g-ss)" className="k-m" />
      <circle r={R} fill="url(#g-dome)" className="k-h" />
      {/* Cono (oculto) y descarga */}
      {lod >= 3 && <circle r={2.6} fill="none" className="k-l k-hid" stroke="#2d5f86" />}
      {/* Buscador de vórtice */}
      <circle r={4.6} fill="#d1d8de" className="k-m" />
      {lod >= 4 && <BoltCircle cx={0} cy={0} r={5.4} n={10} br={0.18} />}
      {lod >= 3 && <path d="M-7 4 A7.5 7.5 0 0 0 4 7" fill="none" className="k-x" stroke="#5d6a76" markerEnd="" />}
      {lod >= 4 && (
        <>
          <Callout from={[-7, -12]} to={[-18, -22]} text="Entrada tangencial" anchor="end" />
          <Callout from={[0, 4]} to={[16, 18]} text="Buscador de vórtice" />
          <Callout from={[-1.8, 1.8]} to={[-18, 16]} text="Cono de descarga (oculto)" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Molino (rótulo «Molinos pilos»)                                   */
/* ================================================================== */
export function MolinoPines({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-20} y={-6} width={14} height={12} fill="#6f8aa5" />
        <circle cx={6} cy={0} r={10.5} fill="#cdd5dc" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow>
        <rect x={-20} y={-12} width={37} height={24} />
      </Shadow>
      <rect x={-20} y={-12} width={37} height={24} rx={0.8} fill="#c9d0d6" className="k-m" />
      {lod >= 3 && <Anchors x={-20} y={-12} w={37} h={24} />}
      <Motor x={-11.5} y={0} len={14} w={9} lod={lod} frame={false} />
      <rect x={-4.4} y={-3.2} width={2.6} height={6.4} fill="url(#g-safety)" className="k-l" />
      {/* Carcasa circular con puerta abatible */}
      <circle cx={6} cy={0} r={10.5} fill="url(#g-dome)" className="k-h" />
      <circle cx={6} cy={0} r={8} fill="none" className="k-m" stroke="#6b7682" />
      {lod >= 3 && (
        <g>
          <circle cx={6} cy={0} r={5.2} fill="none" className="k-x k-hid" stroke="#2d5f86" />
          {range(16).map((i) => {
            const a = deg(i * 22.5);
            return <circle key={i} cx={6 + 3.9 * Math.cos(a)} cy={3.9 * Math.sin(a)} r={0.28} fill="none" className="k-x" stroke="#2d5f86" />;
          })}
        </g>
      )}
      {lod >= 4 && <BoltCircle cx={6} cy={0} r={9.2} n={16} br={0.22} />}
      <rect x={15.8} y={-2.4} width={2.2} height={4.8} fill="#8f9aa4" className="k-l" />
      {/* Entrada de producto (desde el ciclón) */}
      <circle cx={5} cy={-3} r={3.2} fill="#dfe4e8" className="k-m" />
      {lod >= 3 && <circle cx={5} cy={-3} r={2} fill="#7d8893" className="k-x" />}
      {lod >= 4 && (
        <>
          <Callout from={[-11.5, 0]} to={[-26, -16]} text="Motor" anchor="end" />
          <Callout from={[-3, 0]} to={[-26, 16]} text="Acoplamiento" anchor="end" />
          <Callout from={[6, 5.2]} to={[26, 16]} text="Rotor de pines (oculto)" />
          <Callout from={[17, 0]} to={[26, 4]} text="Bisagra de puerta" />
          <Callout from={[5, -3]} to={[26, -14]} text="Entrada de producto" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  DOL-501 Envasadora automática                                     */
/* ================================================================== */
export function Envasadora({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-19} y={-12} width={34} height={25} fill="#d4dae0" className="k-m" />
        <rect x={-8} y={-15} width={16} height={16} fill="#e7ebee" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow>
        <rect x={-19} y={-12} width={34} height={25} />
      </Shadow>
      {/* Bastidor (perfiles) */}
      <rect x={-19} y={-12} width={34} height={25} fill="#eef1f3" className="k-h" />
      {lod >= 3 && (
        <g stroke="#8b96a0">
          <path d="M-19 -12 L15 13 M15 -12 L-19 13" className="k-x" />
          <rect x={-18} y={-11} width={32} height={23} fill="none" className="k-x" />
        </g>
      )}
      {/* Transportador de salida */}
      <rect x={-5} y={6} width={10} height={10.5} fill={lod >= 3 ? 'url(#p-belt)' : '#4a5056'} className="k-l" />
      {/* Saco en llenado */}
      {lod >= 3 && <rect x={-4.2} y={3} width={8.4} height={11} rx={1.4} fill="url(#g-kraft)" className="k-l" />}
      {/* Pinza de saco y boquilla */}
      <rect x={-4.5} y={1.4} width={9} height={2.6} fill="#9aa4ad" className="k-m" />
      {lod >= 3 && (
        <>
          <rect x={-6} y={1.2} width={1.6} height={3} fill="#2f343a" />
          <rect x={4.4} y={1.2} width={1.6} height={3} fill="#2f343a" />
        </>
      )}
      {/* Tolva de producto */}
      <rect x={-8} y={-15} width={16} height={15.5} fill="url(#g-ss)" className="k-h" />
      <path d="M-8 -15 L-2.6 -9.6 M8 -15 L2.6 -9.6 M-8 0.5 L-2.6 -4.4 M8 0.5 L2.6 -4.4" className="k-l" stroke="#5c6670" />
      {/* Dosificador de tornillo (motor vertical) */}
      <circle cx={0} cy={-7} r={3.2} fill="url(#g-dome-dark)" className="k-m" />
      {lod >= 3 && <path d="M-2 -7 H2 M0 -9 V-5" className="k-x" stroke="#c9d6e2" />}
      {/* Cosedora */}
      {lod >= 3 && <rect x={6} y={6} width={5} height={4} rx={0.5} fill="#5b7894" className="k-l" />}
      {/* Panel de control */}
      <rect x={15} y={-7} width={5} height={11} rx={0.5} fill="url(#g-panel)" className="k-m" />
      {lod >= 3 && <rect x={15.8} y={-5.8} width={3.4} height={3.6} fill="#1d3b57" className="k-x" />}
      {lod >= 4 && (
        <>
          <circle cx={16.6} cy={0.6} r={0.5} fill="#27ae60" />
          <circle cx={18.4} cy={0.6} r={0.5} fill="#c0392b" />
          <circle cx={17.5} cy={2.6} r={0.5} fill="#f1c40f" />
          <Callout from={[0, -12]} to={[-28, -20]} text="Tolva de producto" anchor="end" />
          <Callout from={[0, -7]} to={[24, -18]} text="Dosificador de tornillo" />
          <Callout from={[-5, 2.6]} to={[-28, 2]} text="Pinza porta-saco" anchor="end" />
          <Callout from={[8.5, 8]} to={[24, 10]} text="Cosedora" />
          <Callout from={[17.5, -4]} to={[24, -8]} text="Panel de control" />
          <Callout from={[0, 14]} to={[-28, 14]} text="Transportador de sacos" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Línea de paletizado                                               */
/* ================================================================== */
export function Paletizado({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-13} y={-23} width={12} height={38} fill="#c7cdd3" className="k-m" />
        <rect x={1} y={3} width={18} height={19} fill="#d9c49a" className="k-m" />
      </g>
    );
  const sack = (x: number, y: number, w: number, h: number, k: string) => (
    <rect key={k} x={x} y={y} width={w} height={h} rx={1.2} fill="url(#g-kraft)" className="k-l" />
  );
  return (
    <g>
      <Shadow>
        <rect x={-13} y={-23} width={12} height={45} />
        <rect x={1} y={3} width={18} height={19} />
      </Shadow>
      {/* Transportador de rodillos */}
      <rect x={-13} y={-23} width={12} height={37} fill={lod >= 3 ? 'url(#p-rollers)' : '#cfd5db'} className="k-m" />
      <rect x={-13.6} y={-23} width={1.2} height={37} fill="#5b7894" className="k-x" />
      <rect x={-1.6} y={-23} width={1.2} height={37} fill="#5b7894" className="k-x" />
      {lod >= 3 && (
        <>
          {sack(-11.6, -19, 9.2, 6.4, 's1')}
          {sack(-11.6, -6, 9.2, 6.4, 's2')}
        </>
      )}
      {/* Mesa de transferencia */}
      <rect x={-13} y={14} width={12} height={8} fill="#dfe4e8" className="k-m" />
      {lod >= 3 && <path d="M-7 15.5 V20 M-9 18 L-7 20.4 L-5 18" fill="none" className="k-l" stroke="#2f6f9a" />}
      {/* Base (riel inferior de la referencia) */}
      <rect x={-14} y={21.5} width={33.5} height={1.6} fill="#3f4a55" />
      {/* Tarima con sacos */}
      <rect x={1} y={3} width={18} height={19} fill="url(#g-wood)" className="k-m" />
      {lod >= 3 && range(5).map((i) => <line key={i} x1={1} y1={4.9 + i * 3.8} x2={19} y2={4.9 + i * 3.8} className="k-x" stroke="#8c6a3f" />)}
      {lod >= 3 && (
        <g>
          {sack(1.6, 3.6, 8.2, 5.6, 'p1')}
          {sack(10.2, 3.6, 8.2, 5.6, 'p2')}
          {sack(1.6, 9.7, 5.6, 8.2, 'p3')}
          {sack(7.6, 9.7, 5.6, 8.2, 'p4')}
          {sack(13.4, 9.7, 5, 8.2, 'p5')}
        </g>
      )}
      {lod >= 4 && (
        <>
          <Callout from={[-7, -10]} to={[-22, -18]} text="Transportador de rodillos" anchor="end" />
          <Callout from={[-7, 18]} to={[-22, 10]} text="Mesa de transferencia" anchor="end" />
          <Callout from={[10, 20]} to={[24, 26]} text="Tarima con sacos" />
        </>
      )}
    </g>
  );
}
