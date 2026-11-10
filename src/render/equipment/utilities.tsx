import { Anchors, BoltCircle, Callout, Shadow, T, Valve, deg } from '../prims';
import type { EqProps } from './process';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ================================================================== */
/*  Estantería de carga paletizada                                    */
/* ================================================================== */
export function Rack({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  const bays = 5;
  const bh = e.h / bays;
  if (lod === 1) return <rect x={-w} y={-h} width={e.w} height={e.h} fill="#d8dde2" className="k-m" />;
  return (
    <g>
      <Shadow d={0.6}>
        <rect x={-w} y={-h} width={e.w} height={e.h} />
      </Shadow>
      <rect x={-w} y={-h} width={e.w} height={e.h} fill="#f2f4f6" className="k-l" />
      {range(bays).map((i) => {
        const y0 = -h + i * bh;
        return (
          <g key={i}>
            {lod >= 3 ? (
              <g>
                <rect x={-w + 1.4} y={y0 + 1.2} width={e.w - 2.8} height={bh - 2.4} fill="url(#g-wood)" className="k-x" />
                {[0, 1].map((r) =>
                  [0, 1, 2].map((c) => (
                    <rect
                      key={`${r}${c}`}
                      x={-w + 1.8 + r * ((e.w - 3.6) / 2)}
                      y={y0 + 1.6 + c * ((bh - 3.2) / 3)}
                      width={(e.w - 3.6) / 2 - 0.3}
                      height={(bh - 3.2) / 3 - 0.3}
                      rx={0.9}
                      fill="url(#g-kraft)"
                      className="k-x"
                    />
                  )),
                )}
                {/* Arriostramiento en cruz (como la referencia) */}
                <path d={`M${-w + 1} ${y0 + 1} L${w - 1} ${y0 + bh - 1} M${w - 1} ${y0 + 1} L${-w + 1} ${y0 + bh - 1}`} className="k-x" stroke="#33506d" strokeOpacity={0.55} />
              </g>
            ) : (
              <path d={`M${-w + 1} ${y0 + 1} L${w - 1} ${y0 + bh - 1} M${w - 1} ${y0 + 1} L${-w + 1} ${y0 + bh - 1}`} className="k-l" stroke="#4b5563" />
            )}
          </g>
        );
      })}
      {/* Largueros (naranja) */}
      <rect x={-w} y={-h} width={1} height={e.h} fill="#e07b24" className="k-x" />
      <rect x={w - 1} y={-h} width={1} height={e.h} fill="#e07b24" className="k-x" />
      {/* Bastidores (azul) */}
      {range(bays + 1).map((i) => (
        <g key={i}>
          <rect x={-w - 0.3} y={-h + i * bh - 0.8} width={1.8} height={1.6} fill="#2f5d8a" />
          <rect x={w - 1.5} y={-h + i * bh - 0.8} width={1.8} height={1.6} fill="#2f5d8a" />
          <line x1={-w} y1={-h + i * bh} x2={w} y2={-h + i * bh} className="k-l" stroke="#2f5d8a" />
        </g>
      ))}
      {lod >= 4 && (
        <>
          <Callout from={[-w, -h + bh * 0.5]} to={[-w - 6, -h + bh * 0.3]} text="Larguero" anchor="end" />
          <Callout from={[w, -h + bh]} to={[w + 6, -h + bh - 3]} text="Bastidor" />
          <Callout from={[0, -h + bh * 1.5]} to={[w + 6, -h + bh * 1.6]} text="Tarima con sacos" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Pila de tarimas                                                   */
/* ================================================================== */
export function PilaPallets({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  if (lod === 1) return <rect x={-w} y={-h} width={e.w} height={e.h} fill="#d9c49a" className="k-m" />;
  return (
    <g>
      <Shadow>
        <rect x={-w} y={-h} width={e.w} height={e.h} />
      </Shadow>
      {lod >= 3 &&
        [2, 1].map((o) => (
          <rect key={o} x={-w + o * 0.7} y={-h + o * 0.7} width={e.w} height={e.h} fill="#b8925e" className="k-x" opacity={0.7} />
        ))}
      <rect x={-w} y={-h} width={e.w} height={e.h} fill="url(#g-wood)" className="k-m" />
      {range(7).map((i) => (
        <rect key={i} x={-w + 0.6} y={-h + 0.6 + i * ((e.h - 1.2) / 7)} width={e.w - 1.2} height={(e.h - 1.2) / 7 - 0.9} fill="#e3c99b" className="k-x" />
      ))}
      {lod >= 3 && [-w + 3, 0, w - 3].map((x) => <line key={x} x1={x} y1={-h} x2={x} y2={h} className="k-x k-hid" stroke="#6b4f2a" />)}
      {lod >= 4 && range(7).map((i) => [-w + 3, 0, w - 3].map((x) => <circle key={`${i}${x}`} cx={x} cy={-h + 2 + i * ((e.h - 1.2) / 7)} r={0.22} fill="#5a4426" />))}
    </g>
  );
}

/* ================================================================== */
/*  Camión                                                            */
/* ================================================================== */
export function Camion({ e: _e, lod }: EqProps) {
  if (lod === 1)
    return (
      <g>
        <rect x={-46} y={-14} width={66} height={28} fill="#e6eaee" className="k-m" />
        <rect x={22} y={-12.5} width={22} height={25} rx={3} fill="#c9d3dc" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow d={1.3}>
        <rect x={-46} y={-14} width={66} height={28} />
        <rect x={22} y={-12.5} width={22} height={25} rx={3} />
      </Shadow>
      {/* Ruedas */}
      {lod >= 3 &&
        [-38, -31, 34].map((x) =>
          [-1, 1].map((s) => <rect key={`${x}${s}`} x={x - 3} y={s * 14.4 - 1.1} width={6} height={2.2} rx={0.8} fill="#23272b" />),
        )}
      {/* Caja */}
      <rect x={-46} y={-14} width={66} height={28} rx={0.8} fill="url(#g-truck)" className="k-h" />
      {lod >= 3 && range(15).map((i) => <line key={i} x1={-42 + i * 4.2} y1={-13.4} x2={-42 + i * 4.2} y2={13.4} className="k-x" stroke="#aab3bc" />)}
      {lod >= 3 && (
        <g stroke="#55606b">
          <line x1={-45.2} y1={0} x2={-42} y2={0} className="k-l" />
          <path d="M-45.4 -12 v3 M-45.4 9 v3" className="k-m" />
        </g>
      )}
      {/* Cabina */}
      <rect x={22} y={-12.5} width={22} height={25} rx={3} fill="#2f6f9a" className="k-h" />
      <rect x={24} y={-10.5} width={11} height={21} rx={1.2} fill="#3f86b8" className="k-l" />
      <path d="M37 -11 Q42.5 -9.5 42.8 0 Q42.5 9.5 37 11 Z" fill="url(#g-glass)" className="k-m" />
      {/* Espejos */}
      <rect x={36.5} y={-15.4} width={2.4} height={2.4} rx={0.4} fill="#1f2933" />
      <rect x={36.5} y={13} width={2.4} height={2.4} rx={0.4} fill="#1f2933" />
      {lod >= 3 && <rect x={27} y={-3} width={5} height={6} rx={0.6} fill="#5c9bc7" className="k-x" />}
      {lod >= 4 && (
        <>
          {[-12, 12].map((y) => <rect key={y} x={-46.4} y={y - 0.8} width={0.8} height={1.6} fill="#e67e22" />)}
          <Callout from={[-20, 0]} to={[-20, -22]} text="Caja cerrada" />
          <Callout from={[30, 0]} to={[30, -22]} text="Cabina" />
          <Callout from={[-45.4, -10.5]} to={[-52, -20]} text="Puertas traseras" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Unidad de tratamiento PTAR                                        */
/* ================================================================== */
export function UnidadPtar({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  if (lod === 1) return <rect x={-w} y={-h} width={e.w} height={e.h} fill="#cfdde6" className="k-m" />;
  return (
    <g>
      <rect x={-w} y={-h} width={e.w} height={e.h} fill={lod >= 3 ? 'url(#p-concrete)' : '#d6d6d1'} className="k-h" />
      <rect x={-w + 2} y={-h + 2} width={e.w - 4} height={e.h - 4} fill={lod >= 3 ? 'url(#p-water)' : '#cfe3ef'} className="k-m" />
      {/* Vertederos de entrada / salida */}
      {lod >= 3 &&
        [-1, 1].map((s) => <rect key={s} x={s * (w - 1) - 0.7} y={-2} width={1.4} height={4} fill="#e8ecef" className="k-l" />)}
      {lod >= 4 && <rect x={-w - 0.8} y={-h - 0.8} width={e.w + 1.6} height={e.h + 1.6} fill="none" className="k-x k-hid" stroke="#d9a514" />}
      {lod >= 4 && <Callout from={[0, 4]} to={[0, h + 6]} text="Lámina de agua" anchor="middle" />}
    </g>
  );
}

/* ================================================================== */
/*  Tanque vertical exterior                                          */
/* ================================================================== */
export function TanqueVertical({ e, lod }: EqProps) {
  const R = e.w / 2 - 2.2;
  if (lod === 1) return <circle r={R} fill="#ebedea" className="k-m" />;
  return (
    <g>
      {/* Cimentación */}
      <circle r={R + 1.8} fill={lod >= 3 ? 'url(#p-concrete)' : '#dadad5'} className="k-l k-hid" stroke="#6b7280" />
      <Shadow d={1.2}>
        <circle r={R} />
      </Shadow>
      {/* Escalera con jaula */}
      <g transform={`rotate(205) translate(${R} 0)`}>
        <rect x={0} y={-1.6} width={2.4} height={3.2} fill="#f2c230" className="k-m" />
        {lod >= 3 && <path d="M0.6 -1.6 V1.6 M1.8 -1.6 V1.6" className="k-x" stroke="#5c4a10" />}
      </g>
      <circle r={R} fill="url(#g-dome-warm)" className="k-h" />
      {/* Costuras de techo cónico */}
      {lod >= 3 &&
        range(12).map((i) => {
          const a = deg(i * 30);
          return <line key={i} x1={R * 0.16 * Math.cos(a)} y1={R * 0.16 * Math.sin(a)} x2={R * Math.cos(a)} y2={R * Math.sin(a)} className="k-x" stroke="#97a09b" />;
        })}
      {lod >= 3 && <circle r={R * 0.16} fill="#dfe3e0" className="k-l" />}
      {/* Barandal de techo */}
      {lod >= 3 && (
        <path
          d={`M${(R - 1.2) * Math.cos(deg(180))} ${(R - 1.2) * Math.sin(deg(180))} A${R - 1.2} ${R - 1.2} 0 0 1 ${(R - 1.2) * Math.cos(deg(240))} ${(R - 1.2) * Math.sin(deg(240))}`}
          fill="none"
          className="k-m"
          stroke="#d9a514"
        />
      )}
      {/* Venteo */}
      <circle r={1.6} fill="#c8cecb" className="k-m" />
      {lod >= 3 && <path d="M0 0 h2.8" className="k-m" stroke="#56606a" />}
      {/* Boca de hombre de techo */}
      <g transform={`translate(${R * 0.48} ${R * 0.42})`}>
        <circle r={2.8} fill="#eceeec" className="k-m" />
        {lod >= 4 && <BoltCircle cx={0} cy={0} r={2.3} n={10} br={0.16} />}
      </g>
      {lod >= 4 && (
        <>
          <Callout from={[0, 0]} to={[R + 8, -R]} text="Venteo" />
          <Callout from={[R * 0.48, R * 0.42]} to={[R + 8, R]} text="Boca de hombre" />
          <Callout from={[(R + 1) * Math.cos(deg(205)), (R + 1) * Math.sin(deg(205))]} to={[-R - 8, -R]} text="Escalera con jaula" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Caldera pirotubular                                               */
/* ================================================================== */
export function Caldera({ e: _e, lod }: EqProps) {
  const x0 = -42, x1 = 29;
  if (lod === 1)
    return (
      <g>
        <rect x={x0 - 3} y={-14} width={x1 - x0 + 6} height={28} rx={12} fill="#dfe4e9" className="k-m" />
      </g>
    );
  return (
    <g>
      <Shadow d={1.2}>
        <rect x={x0 - 4} y={-14} width={x1 - x0 + 8} height={28} rx={12} />
      </Shadow>
      {/* Bancada */}
      {[-1, 1].map((s) => (
        <rect key={s} x={x0 + 2} y={s * 15 - 1.2} width={x1 - x0 - 4} height={2.4} fill="#46525e" />
      ))}
      {lod >= 3 && [x0 + 6, x1 - 8].map((x) => <Anchors key={x} x={x - 2} y={-16.5} w={4} h={33} r={0.35} inset={0.8} />)}
      {/* Fondos abombados */}
      <path d={`M${x0} -14 Q${x0 - 7} 0 ${x0} 14 Z`} fill="url(#g-cyl-x)" className="k-h" />
      <path d={`M${x1} -14 Q${x1 + 7} 0 ${x1} 14 Z`} fill="url(#g-cyl-x)" className="k-h" />
      {/* Cuerpo cilíndrico */}
      <rect x={x0} y={-14} width={x1 - x0} height={28} fill="url(#g-cyl-x)" className="k-h" />
      {lod >= 3 && [x0 + 17, x0 + 35, x0 + 53].map((x) => <line key={x} x1={x} y1={-14} x2={x} y2={14} className="k-x" stroke="#7d8893" />)}
      {/* Quemador */}
      {lod >= 3 && (
        <g>
          <rect x={x0 - 8.5} y={-4.5} width={4} height={9} rx={0.8} fill="#c0392b" className="k-m" />
          <circle cx={x0 - 6.5} cy={0} r={2.2} fill="#e3e6e9" className="k-l" />
        </g>
      )}
      {/* Chimenea */}
      <circle cx={-27} cy={-6} r={4.6} fill="#6b7480" className="k-h" />
      <circle cx={-27} cy={-6} r={3.2} fill="#1f2328" className="k-l" />
      {/* Boca de hombre */}
      {lod >= 3 && (
        <g>
          <ellipse cx={-8} cy={2} rx={3.4} ry={4.4} fill="#e8ecef" className="k-m" />
          {lod >= 4 && range(10).map((i) => <circle key={i} cx={-8 + 2.9 * Math.cos(deg(i * 36))} cy={2 + 3.8 * Math.sin(deg(i * 36))} r={0.18} fill="#5b6570" />)}
        </g>
      )}
      {/* Válvulas de seguridad */}
      {lod >= 3 &&
        [10, 15].map((x) => (
          <g key={x}>
            <circle cx={x} cy={-7} r={1.6} fill="#d6dce1" className="k-m" />
            <rect x={x - 0.6} y={-9.8} width={1.2} height={2.4} fill="#c0392b" className="k-x" />
          </g>
        ))}
      {/* Columna de nivel */}
      {lod >= 3 && (
        <g>
          <rect x={14} y={13.2} width={8} height={2.2} fill="#d6dce1" className="k-l" />
          <rect x={16} y={13.6} width={4} height={1.4} fill="url(#g-glass)" className="k-x" />
        </g>
      )}
      {/* Salida de vapor */}
      <circle cx={4} cy={-2} r={2.4} fill="#d6dce1" className="k-m" />
      <rect x={4} y={-3.1} width={44} height={2.2} fill="url(#g-cyl-x)" className="k-m" />
      <rect x={47} y={-4} width={1} height={4} fill="#c8cfd6" className="k-m" />
      <Valve x={37} y={-2} s={2.8} />
      <T x={-12} y={6.5} s={3.6} weight={700}>CALDERA</T>
      <T x={-12} y={10.8} s={3.6} weight={700}>PIROTUBULAR</T>
      {lod >= 4 && (
        <>
          <Callout from={[-27, -6]} to={[-50, -22]} text="Chimenea" anchor="end" />
          <Callout from={[x0 - 6.5, 3]} to={[-50, 22]} text="Quemador" anchor="end" />
          <Callout from={[12.5, -8]} to={[18, -22]} text="Válvulas de seguridad" />
          <Callout from={[37, -2]} to={[44, -14]} text="Válvula principal de vapor" />
          <Callout from={[18, 14.3]} to={[30, 22]} text="Columna de nivel" />
          <Callout from={[-8, 2]} to={[-30, 22]} text="Boca de hombre" anchor="end" />
        </>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Equipo auxiliar / tablero                                         */
/* ================================================================== */
export function Tablero({ e, lod }: EqProps) {
  const w = e.w / 2, h = e.h / 2;
  return (
    <g>
      {lod >= 2 && (
        <Shadow>
          <rect x={-w} y={-h} width={e.w} height={e.h} />
        </Shadow>
      )}
      <rect x={-w} y={-h} width={e.w} height={e.h} fill="url(#g-panel)" className="k-h" />
      {lod >= 3 && (
        <>
          <rect x={-w + 1.5} y={-h + 1.5} width={e.w - 3} height={e.h - 3} fill="none" className="k-x" stroke="#6b7682" />
          <rect x={w - 3} y={-1.5} width={0.9} height={3} fill="#4b5563" />
        </>
      )}
      {lod >= 4 && <Callout from={[0, 0]} to={[w + 6, -h]} text="Función no especificada" />}
    </g>
  );
}
