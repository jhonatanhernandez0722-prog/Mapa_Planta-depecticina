import { memo, type ComponentType } from 'react';
import type { EquipKind, Equipment, Lod } from '../../model/types';
import {
  Bascula, Carro, Ciclon, Cortadora, Envasadora, FiltroPrensa, Lavadora, MolinoMartillos, MolinoPines,
  Paletizado, Reactor, SecadorSpray, TanquePrecipitacion, Trituradora, type EqProps,
} from './process';
import { Camion, Caldera, PilaPallets, Rack, Tablero, TanqueVertical, UnidadPtar } from './utilities';
import {
  Autoclave, Campana, Computador, Dique, EquipoLab, EstufaLab, Garrafa, IslaLab, Lavamanos, MesadaLab,
  PassBox, Pediluvio, Refrigerador, Tambor, Tarja,
} from './lab';

export const DRAWERS: Record<EquipKind, ComponentType<EqProps>> = {
  bascula: Bascula,
  carro: Carro,
  lavadora: Lavadora,
  trituradora: Trituradora,
  cortadora: Cortadora,
  molinoMartillos: MolinoMartillos,
  reactor: Reactor,
  filtroPrensa: FiltroPrensa,
  tanquePrecipitacion: TanquePrecipitacion,
  secadorSpray: SecadorSpray,
  ciclon: Ciclon,
  molinoPines: MolinoPines,
  envasadora: Envasadora,
  paletizado: Paletizado,
  rack: Rack,
  pilaPallets: PilaPallets,
  camion: Camion,
  unidadPtar: UnidadPtar,
  tanqueVertical: TanqueVertical,
  caldera: Caldera,
  tablero: Tablero,
  campana: Campana,
  mesadaLab: MesadaLab,
  islaLab: IslaLab,
  equipoLab: EquipoLab,
  tarja: Tarja,
  estufaLab: EstufaLab,
  autoclave: Autoclave,
  refrigerador: Refrigerador,
  computador: Computador,
  passBox: PassBox,
  dique: Dique,
  garrafa: Garrafa,
  tambor: Tambor,
  lavamanos: Lavamanos,
  pediluvio: Pediluvio,
};

/** Tipos cuyo dibujo ya no se muestra en la vista general (son pequeños). */
const MIN_LOD: Partial<Record<EquipKind, Lod>> = {
  equipoLab: 2, tarja: 2, computador: 2, refrigerador: 2, estufaLab: 2, garrafa: 2, tambor: 2, lavamanos: 2,
};

/** Equipos que no deben capturar clics en toda su huella (sólo en lo dibujado). */
const NO_HIT_RECT = new Set<EquipKind>(['mesadaLab']);

export function equipVisibleAt(e: Equipment, lod: Lod) {
  return lod >= (MIN_LOD[e.kind] ?? 1);
}

export const EquipNode = memo(function EquipNode({ e, lod }: { e: Equipment; lod: Lod }) {
  const Draw = DRAWERS[e.kind];
  return (
    <g
      className={`equip kind-${e.kind}`}
      data-id={e.id}
      transform={`translate(${e.x} ${e.y})${e.rot ? ` rotate(${e.rot})` : ''}`}
    >
      {!NO_HIT_RECT.has(e.kind) && (
        <rect className="hit" x={-e.w / 2 - 1} y={-e.h / 2 - 1} width={e.w + 2} height={e.h + 2} />
      )}
      <g className={lod >= 3 ? 'lod-fade' : undefined} key={lod}>
        <Draw e={e} lod={lod} />
      </g>
    </g>
  );
});

/**
 * Posición de la etiqueta de cada equipo (reproduce la de la referencia).
 * `false` = sin etiqueta (el rótulo ya forma parte del dibujo o de los textos libres).
 */
export const TAG_POS: Record<string, { x: number; y: number; anchor?: 'start' | 'middle' | 'end'; name?: boolean } | false> = {
  ln101: { x: 271.5, y: 188, name: true },
  cr101: { x: 281, y: 233, anchor: 'start', name: true },
  cr102: { x: 377, y: 212, name: false },
  m103: { x: 377, y: 274, name: false },
  r201a: { x: 447, y: 236, name: false },
  r201b: { x: 508, y: 236, name: false },
  f301: { x: 595, y: 234, name: true },
  ta401a: { x: 681, y: 177 },
  ta401b: { x: 681, y: 230 },
  ta401c: { x: 732, y: 230 },
  cd501: { x: 789, y: 238, name: true },
  co65h: { x: 846, y: 176, anchor: 'start', name: true },
  'molino-pines': { x: 924, y: 175, anchor: 'start', name: true },
  dol501: { x: 930, y: 214, anchor: 'start', name: true },
  paletizado: { x: 935, y: 258, anchor: 'start', name: true },
  hcl37: { x: 566, y: 422 },
  etanol: { x: 638, y: 422 },
};
