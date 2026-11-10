/**
 * Sistema de coordenadas del plano
 * --------------------------------
 * 1 unidad de mundo (u) = 1 px de la imagen de referencia (1158 × 649).
 * La referencia no tiene cotas; se adopta una escala ESTIMADA de 1 u ≈ 0,10 m
 * (planta ≈ 110 m × 51 m), coherente con el tamaño de puertas (~2,5 m) y carros.
 * Eje X hacia la derecha (este del dibujo), eje Y hacia abajo (sur del dibujo).
 */
export type Pt = [number, number];

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Nivel de detalle. 1 = vista general … 4 = vista de detalle. */
export type Lod = 1 | 2 | 3 | 4;

export type LayerId =
  | 'estructura'
  | 'divisiones'
  | 'maquinaria'
  | 'agua'
  | 'residuos'
  | 'proceso'
  | 'personal'
  | 'senalizacion'
  | 'etiquetas';

export type RoomCategory =
  | 'produccion'
  | 'almacen'
  | 'servicios'
  | 'administracion'
  | 'laboratorio'
  | 'sanitario'
  | 'circulacion'
  | 'exterior';

export interface Room {
  id: string;
  name: string;
  /** Segunda línea del título (como aparece en la referencia). */
  sub?: string;
  /** Texto tal como se lee en la referencia (si difiere del nombre normalizado). */
  rotulo?: string;
  category: RoomCategory;
  poly: Pt[];
  /** Posición del título (centro). */
  label: Pt;
  labelSize?: number;
  /** El título se dibuja también en el nivel 1. */
  major?: boolean;
  descripcion: string;
  nota?: string;
  hideTitle?: boolean;
}

export type Confianza = 'alta' | 'media' | 'baja';

export type EquipKind =
  | 'bascula'
  | 'carro'
  | 'lavadora'
  | 'trituradora'
  | 'cortadora'
  | 'molinoMartillos'
  | 'reactor'
  | 'filtroPrensa'
  | 'tanquePrecipitacion'
  | 'secadorSpray'
  | 'ciclon'
  | 'molinoPines'
  | 'envasadora'
  | 'paletizado'
  | 'rack'
  | 'pilaPallets'
  | 'camion'
  | 'unidadPtar'
  | 'tanqueVertical'
  | 'caldera'
  | 'tablero'
  | 'campana'
  | 'mesadaLab'
  | 'islaLab'
  | 'equipoLab'
  | 'tarja'
  | 'estufaLab'
  | 'autoclave'
  | 'refrigerador'
  | 'computador'
  | 'passBox'
  | 'dique'
  | 'garrafa'
  | 'tambor'
  | 'lavamanos'
  | 'pediluvio';

export interface Equipment {
  id: string;
  /** Identificador técnico visible (si existe en la referencia). */
  tag?: string;
  name: string;
  kind: EquipKind;
  room: string;
  /** Centro del equipo en coordenadas de mundo. */
  x: number;
  y: number;
  /** Huella (ancho × alto) en el sistema local, antes de rotar. */
  w: number;
  h: number;
  rot?: number;
  rotulo?: string;
  descripcion: string;
  funcion: string;
  confianza: Confianza;
  nota?: string;
  /** Datos que aparecen literalmente en la referencia. */
  datos?: [string, string][];
  /** Variante de dibujo (p. ej. tipo de carro). */
  variant?: string;
  /** Texto corto para dibujar dentro/junto al equipo. */
  caption?: string;
}

export interface Door {
  /** Orientación del muro que contiene la puerta. */
  dir: 'h' | 'v';
  /** Inicio del vano (x para muros horizontales, y para verticales). */
  a: number;
  /** Fin del vano. */
  b: number;
  /** Coordenada del muro (y para horizontales, x para verticales). */
  at: number;
  /** Lado hacia el que abre: +1 (hacia +y / +x) o -1. */
  side: 1 | -1;
  /** Bisagra en el extremo inicial ('a') o final ('b'). Ignorado en dobles. */
  hinge?: 'a' | 'b';
  type?: 'simple' | 'doble' | 'enrollable' | 'vaiven';
}

export interface WallSeg {
  p: Pt;
  q: Pt;
  ext?: boolean;
}

export interface Window {
  dir: 'h' | 'v';
  a: number;
  b: number;
  at: number;
}

export type NetLayer = 'agua' | 'residuos' | 'proceso' | 'personal';

export interface NetLine {
  id: string;
  layer: NetLayer;
  pts: Pt[];
  /** Punta de flecha al final / al inicio. */
  arrowEnd?: boolean;
  arrowStart?: boolean;
  /** Flechas intermedias de sentido de flujo. */
  midArrows?: boolean;
  /** Estilo alternativo (p. ej. línea de etanol). */
  style?: 'etanol' | 'lavado' | 'gris';
  name: string;
  descripcion?: string;
  minLod?: Lod;
}

export interface TextLabel {
  id: string;
  text: string[];
  x: number;
  y: number;
  size: number;
  color?: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  rotate?: number;
  minLod: Lod;
  layer?: LayerId;
  italic?: boolean;
}
