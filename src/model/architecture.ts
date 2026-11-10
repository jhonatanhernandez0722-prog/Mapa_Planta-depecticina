import type { Door, Pt, Room, WallSeg, Window } from './types';

/**
 * Geometría arquitectónica trazada sobre la imagen de referencia
 * (coordenadas en px de la referencia; ver types.ts).
 * Los muros se definen por su eje; las puertas recortan automáticamente el muro
 * que las contiene (ver cutWalls).
 */

export const SHEET = { x: 0, y: 0, w: 1158, h: 649 };
export const WALL_EXT = 4.2;
export const WALL_INT = 3.0;
export const WALL_LIGHT = 1.3;

type Run = { p: Pt; q: Pt; ext?: boolean; light?: boolean };

const H = (y: number, x1: number, x2: number, ext = false): Run => ({ p: [x1, y], q: [x2, y], ext });
const V = (x: number, y1: number, y2: number, ext = false): Run => ({ p: [x, y1], q: [x, y2], ext });

/* ------------------------------------------------------------------ */
/*  Muros                                                             */
/* ------------------------------------------------------------------ */

export const WALL_RUNS: Run[] = [
  // Envolvente nave de producción
  H(105.5, 30, 1133, true),
  V(30, 105.5, 617, true),
  V(1133, 105.5, 305.5, true),
  H(305.5, 1003, 1133, true),
  // Envolvente bloque inferior
  H(617, 30, 545, true),
  V(545, 504.5, 617, true),
  H(505, 545, 1003, true),
  V(1003, 305.5, 505, true),

  // Frente de salas de producción hacia el pasillo
  H(305.5, 30, 1003),
  // Divisiones entre salas de producción
  V(111.5, 105.5, 305.5),
  V(213.5, 105.5, 305.5),
  V(334.5, 105.5, 305.5),
  V(420, 105.5, 305.5),
  V(545, 105.5, 305.5),
  V(647.5, 105.5, 305.5),
  V(761.5, 105.5, 305.5),
  V(874, 105.5, 305.5),
  V(1003, 105.5, 305.5),

  // Frente sur del pasillo (aberturas libres 235–281 y 662–701)
  H(363, 30, 235),
  H(363, 281, 662),
  H(363, 701, 1003),

  // Oficinas (planta en "L")
  V(235, 363, 465),
  H(465, 139, 235),
  V(139, 465, 504.5),
  // Fila inferior
  H(504.5, 30, 545),
  V(175, 504.5, 617),
  V(384, 504.5, 617),
  // Vestidores / antesala / esclusa
  V(281, 363, 504.5),
  H(450, 281, 420),
  // Muro divisorio entre el vestidor de damas y el de varones
  V(351, 363, 450),
  V(420, 363, 504.5),
  // Almacén de reactivos
  V(543, 363, 471),
  H(471, 543, 662),
  V(662, 363, 471),
  // Laboratorio y local contiguo
  V(701, 363, 505),
  V(923, 363, 505),
];

/** Tabiques ligeros (cabinas sanitarias). */
export const LIGHT_RUNS: Run[] = [
  { p: [281, 427], q: [312, 427], light: true },
  { p: [322, 427], q: [327, 427], light: true },
  { p: [327, 427], q: [327, 450], light: true },
  { p: [375, 427], q: [380, 427], light: true },
  { p: [390, 427], q: [420, 427], light: true },
  { p: [375, 427], q: [375, 450], light: true },
];

/* ------------------------------------------------------------------ */
/*  Puertas y accesos                                                 */
/* ------------------------------------------------------------------ */

export const DOORS: (Door & { id: string; name: string })[] = [
  // Fachada norte
  { id: 'd-porton-mp', name: 'Portón de recepción de materia prima', dir: 'h', at: 105.5, a: 141, b: 184, side: 1, type: 'doble' },
  { id: 'd-limpieza', name: 'Acceso a zona de limpieza', dir: 'h', at: 105.5, a: 422, b: 444, side: -1, hinge: 'a' },
  // Salas de producción → pasillo
  { id: 'd-muelle', name: 'Cortina enrollable del muelle de descarga', dir: 'h', at: 305.5, a: 42, b: 103, side: -1, type: 'enrollable' },
  { id: 'd-mp', name: 'Puerta doble almacén MP', dir: 'h', at: 305.5, a: 141, b: 185, side: -1, type: 'doble' },
  { id: 'd-lavado', name: 'Puerta sala de lavado', dir: 'h', at: 305.5, a: 304, b: 330, side: -1, hinge: 'b' },
  { id: 'd-cortado', name: 'Puerta área de cortado', dir: 'h', at: 305.5, a: 338, b: 362, side: -1, hinge: 'a' },
  { id: 'd-hidro', name: 'Puerta área de hidrólisis', dir: 'h', at: 305.5, a: 513, b: 538, side: -1, hinge: 'b' },
  { id: 'd-filtr', name: 'Puerta área de filtración', dir: 'h', at: 305.5, a: 619, b: 643, side: -1, hinge: 'b' },
  { id: 'd-precip', name: 'Puerta área de precipitación', dir: 'h', at: 305.5, a: 651, b: 675, side: -1, hinge: 'a' },
  { id: 'd-spray', name: 'Puerta área spray dry', dir: 'h', at: 305.5, a: 842, b: 866, side: -1, hinge: 'b' },
  { id: 'd-molienda', name: 'Puerta sala de molienda', dir: 'h', at: 305.5, a: 877, b: 902, side: -1, hinge: 'a' },
  { id: 'd-pt-anden', name: 'Paso almacén PT → andén', dir: 'h', at: 305.5, a: 1040, b: 1068, side: 1, type: 'enrollable' },
  // Comunicaciones entre salas
  { id: 'd-muelle-mp', name: 'Paso muelle → almacén MP', dir: 'v', at: 111.5, a: 145, b: 168, side: 1, hinge: 'b' },
  { id: 'd-lav-cort', name: 'Paso lavado → cortado', dir: 'v', at: 334.5, a: 138, b: 163, side: 1, hinge: 'b' },
  { id: 'd-cort-hidro', name: 'Paso cortado ↔ hidrólisis', dir: 'v', at: 420, a: 140, b: 165, side: -1, hinge: 'b' },
  { id: 'd-prec-spray', name: 'Paso precipitación → spray dry', dir: 'v', at: 761.5, a: 137, b: 166, side: 1, hinge: 'b' },
  { id: 'd-mol-pt', name: 'Paso molienda → almacén PT', dir: 'v', at: 1003, a: 270, b: 302, side: 1, hinge: 'b' },
  { id: 'd-pasillo-anden', name: 'Puerta doble pasillo → andén de carga', dir: 'v', at: 1003, a: 310, b: 357, side: 1, type: 'doble' },
  // Bloque inferior
  { id: 'd-esclusa', name: 'Puerta de vaivén esclusa → planta', dir: 'h', at: 363, a: 452, b: 515, side: -1, type: 'vaiven' },
  { id: 'd-local-e', name: 'Puerta local sin rótulo', dir: 'h', at: 363, a: 927, b: 952, side: 1, hinge: 'a' },
  { id: 'd-oficinas', name: 'Puerta oficinas', dir: 'v', at: 139, a: 478, b: 503, side: -1, hinge: 'a' },
  { id: 'd-juntas', name: 'Puerta sala de juntas', dir: 'h', at: 504.5, a: 145, b: 170, side: 1, hinge: 'b' },
  { id: 'd-cafe', name: 'Puerta cafetería', dir: 'h', at: 504.5, a: 179, b: 204, side: 1, hinge: 'a' },
  { id: 'd-caldera', name: 'Puerta sala de caldera', dir: 'h', at: 504.5, a: 388, b: 412, side: 1, hinge: 'a' },
  { id: 'd-antesala', name: 'Puerta antesala de vestidores', dir: 'v', at: 281, a: 453, b: 483, side: 1, hinge: 'a' },
  { id: 'd-vest-d', name: 'Puerta vestidor (damas)', dir: 'h', at: 450, a: 328, b: 348, side: -1, hinge: 'a' },
  { id: 'd-vest-v', name: 'Puerta vestidor (varones)', dir: 'h', at: 450, a: 354, b: 374, side: -1, hinge: 'b' },
  { id: 'd-ante-esclusa', name: 'Puerta doble antesala → esclusa', dir: 'v', at: 420, a: 457, b: 500, side: 1, type: 'doble' },
  { id: 'd-lab', name: 'Puerta laboratorio', dir: 'v', at: 701, a: 478, b: 503, side: 1, hinge: 'a' },
];

export const WINDOWS: Window[] = [
  { dir: 'v', at: 30, a: 538, b: 592 },
  { dir: 'h', at: 617, a: 76, b: 130 },
  { dir: 'h', at: 617, a: 216, b: 266 },
  { dir: 'h', at: 617, a: 300, b: 332 },
  { dir: 'h', at: 363, a: 797, b: 842 },
  { dir: 'h', at: 505, a: 758, b: 790 },
  { dir: 'h', at: 505, a: 822, b: 857 },
];

/** Recorta los muros en los vanos de las puertas. */
function cutWalls(runs: Run[]): WallSeg[] {
  const out: WallSeg[] = [];
  const eps = 0.6;
  for (const r of runs) {
    const horiz = r.p[1] === r.q[1];
    const at = horiz ? r.p[1] : r.p[0];
    let s0 = horiz ? Math.min(r.p[0], r.q[0]) : Math.min(r.p[1], r.q[1]);
    const s1 = horiz ? Math.max(r.p[0], r.q[0]) : Math.max(r.p[1], r.q[1]);
    const gaps = DOORS.filter((d) => (d.dir === 'h') === horiz && Math.abs(d.at - at) < eps && d.b > s0 && d.a < s1)
      .map((d) => [d.a, d.b] as [number, number])
      .sort((a, b) => a[0] - b[0]);
    for (const [ga, gb] of gaps) {
      if (ga > s0) out.push(seg(horiz, at, s0, ga, r.ext));
      s0 = Math.max(s0, gb);
    }
    if (s1 > s0) out.push(seg(horiz, at, s0, s1, r.ext));
  }
  return out;
}

function seg(horiz: boolean, at: number, a: number, b: number, ext?: boolean): WallSeg {
  return horiz ? { p: [a, at], q: [b, at], ext } : { p: [at, a], q: [at, b], ext };
}

export const WALLS: WallSeg[] = cutWalls(WALL_RUNS);
export const LIGHT_WALLS: WallSeg[] = LIGHT_RUNS.map((r) => ({ p: r.p, q: r.q }));

/** Contorno exterior de la edificación (para sombra y fondo). */
export const BUILDING_OUTLINE: Pt[] = [
  [30, 105.5], [1133, 105.5], [1133, 305.5], [1003, 305.5], [1003, 505], [545, 505],
  [545, 617], [30, 617],
];

/* ------------------------------------------------------------------ */
/*  Áreas / habitaciones                                              */
/* ------------------------------------------------------------------ */

const rect = (x1: number, y1: number, x2: number, y2: number): Pt[] => [
  [x1, y1], [x2, y1], [x2, y2], [x1, y2],
];

export const ROOMS: Room[] = [
  {
    id: 'muelle', name: 'Muelle de descarga y pesaje', category: 'almacen', major: true,
    poly: rect(30, 105.5, 111.5, 305.5), label: [71, 120],
    descripcion: 'Recepción de la materia prima (cáscara cítrica). Dispone de una báscula de plataforma para el pesaje de entrada y de cortina enrollable hacia el pasillo de transporte.',
  },
  {
    id: 'almacen-mp', name: 'Almacenamiento MP', sub: '(Cáscaras de naranja, 100,00 Mg)', category: 'almacen', major: true,
    rotulo: 'ALMACENAMIENTO MP (Cíisceras de naninis, 100.00 Mg)',
    poly: rect(111.5, 105.5, 213.5, 305.5), label: [162.5, 200],
    descripcion: 'Almacén de materia prima: cáscara cítrica a la espera de proceso. Capacidad rotulada en la referencia: 100,00 Mg.',
    nota: 'El texto del material es parcialmente ilegible en la referencia («Cíisceras de naninis»); se interpreta como cáscaras de naranja.',
  },
  {
    id: 'lavado', name: 'Sala de lavado y triturado', category: 'produccion', major: true,
    rotulo: 'SALA DE LAVADO Y YRITURADO',
    poly: rect(213.5, 105.5, 334.5, 305.5), label: [274, 117],
    descripcion: 'Lavado de la cáscara para retirar impurezas, azúcares y aceites, seguido de la reducción de tamaño en la trituradora CR-101. Recibe agua de lavado y drena hacia la PTAR.',
  },
  {
    id: 'cortado', name: 'Área de cortado', category: 'produccion', major: true,
    rotulo: 'ÁREA CORTADO GAEDARAS',
    poly: rect(334.5, 105.5, 420, 305.5), label: [377, 117],
    descripcion: 'Acondicionamiento mecánico de la cáscara: cortadora CR-102 y molino M-103.',
    nota: 'La segunda palabra del rótulo («GAEDARAS») es ilegible; se omite del nombre normalizado.',
  },
  {
    id: 'hidrolisis', name: 'Área de hidrólisis ácida', sub: '(R-301) · Zona caliente 70 °C', category: 'produccion', major: true,
    rotulo: 'ÁREA HIDRÓLISIS ÁCIDA (R-301) (ZONA CALIENTE 70°C)',
    poly: rect(420, 105.5, 545, 305.5), label: [482.5, 117],
    descripcion: 'Extracción de la pectina por hidrólisis ácida en reactores agitados. Zona caliente señalizada a 70 °C.',
    nota: 'El área se rotula «R-301» mientras que los reactores se rotulan «R-201»; se conservan ambos identificadores tal como aparecen.',
  },
  {
    id: 'filtracion', name: 'Área de filtración', sub: '(F-301)', category: 'produccion', major: true,
    rotulo: 'ÁREA FILTRACIÓN (F-301)',
    poly: rect(545, 105.5, 647.5, 305.5), label: [596, 117],
    descripcion: 'Separación sólido-líquido del hidrolizado mediante filtro prensa. El residuo sólido (bagazo) sale hacia tratamiento de residuos / alimento animal.',
  },
  {
    id: 'precipitacion', name: 'Área de precipitación', sub: '(TA-401)', category: 'produccion', major: true,
    rotulo: 'ÁREA PRECIPITACIÓN (TA-401)',
    poly: rect(647.5, 105.5, 761.5, 305.5), label: [704.5, 117],
    descripcion: 'Precipitación de la pectina con alcohol (etanol) en tanques TA-401, con circuito de recuperación de etanol.',
  },
  {
    id: 'spray', name: 'Área spray dry', category: 'produccion', major: true,
    rotulo: 'ÁREA SPRAY DRY',
    poly: rect(761.5, 105.5, 874, 305.5), label: [833, 117],
    descripcion: 'Secado por aspersión (secador spray CD-501) y separación del polvo en ciclón CO-65H. Ducto de salida de humedad hacia cubierta.',
  },
  {
    id: 'molienda', name: 'Sala de molienda y envasado', category: 'produccion', major: true,
    poly: rect(874, 105.5, 1003, 305.5), label: [948, 117],
    descripcion: 'Molienda del producto seco, envasado automático en sacos (DOL-501) y línea de paletizado.',
  },
  {
    id: 'almacen-pt', name: 'Almacén de producto terminado y despacho', category: 'almacen', major: true,
    poly: rect(1003, 105.5, 1133, 305.5), label: [1068, 117],
    descripcion: 'Almacenamiento en estanterías de la pectina envasada (rotulado: 51 Mg) y preparación de despacho.',
    nota: 'Capacidad rotulada «51 Hg» en la referencia; se interpreta como 51 Mg por coherencia con la unidad usada en el almacén de MP.',
  },
  {
    id: 'anden', name: 'Andén de carga', category: 'exterior',
    poly: rect(1003, 305.5, 1133, 363), label: [1068, 312], hideTitle: true,
    descripcion: 'Bahía de carga de camiones conectada con el pasillo de transporte y el almacén de producto terminado.',
    nota: 'Espacio sin rótulo en la referencia; denominación aproximada a partir del camión dibujado y del «Muelle de despacho» contiguo.',
  },
  {
    id: 'pasillo', name: 'Pasillo de transporte', category: 'circulacion', major: false,
    poly: rect(30, 305.5, 1003, 363), label: [520, 334], hideTitle: true,
    descripcion: 'Corredor principal este-oeste que conecta todas las salas de producción. Circulación de carros de transporte en el sentido del proceso y trazado de la tubería principal de agua potable.',
  },
  {
    id: 'oficinas', name: 'Oficinas administrativas', category: 'administracion', major: true,
    poly: [[30, 363], [235, 363], [235, 465], [139, 465], [139, 504.5], [30, 504.5]], label: [137, 436],
    descripcion: 'Oficinas administrativas con tres puestos de trabajo, recepción y puesto auxiliar.',
  },
  {
    id: 'pasillo-personal', name: 'Pasillo de personal', category: 'circulacion',
    poly: [[235, 363], [281, 363], [281, 504.5], [139, 504.5], [139, 465], [235, 465]], label: [210, 494], hideTitle: true,
    descripcion: 'Circulación del personal entre oficinas, servicios (juntas, cafetería, caldera) y vestidores.',
    nota: 'Espacio sin rótulo en la referencia.',
  },
  {
    id: 'vest-damas', name: 'Vestidor y baño · Damas', category: 'sanitario', major: true,
    rotulo: 'VESTIERES Y BAÑOS (Domas y Vinenas)',
    poly: rect(281, 363, 351, 450), label: [316, 404], labelSize: 5,
    descripcion: 'Vestidor con taquillas, dos lavamanos e inodoro, con acceso propio desde la antesala.',
    nota: 'La referencia dibuja un único recinto «Damas y Varones» con dos puertas, dos pares de lavamanos y dos inodoros simétricos; se ha cerrado con un muro divisorio. La asignación damas (oeste) / varones (este) es una suposición.',
  },
  {
    id: 'vest-varones', name: 'Vestidor y baño · Varones', category: 'sanitario', major: true,
    rotulo: 'VESTIERES Y BAÑOS (Domas y Vinenas)',
    poly: rect(351, 363, 420, 450), label: [385.5, 404], labelSize: 5,
    descripcion: 'Vestidor con taquillas, dos lavamanos e inodoro, con acceso propio desde la antesala.',
    nota: 'La referencia dibuja un único recinto «Damas y Varones» con dos puertas, dos pares de lavamanos y dos inodoros simétricos; se ha cerrado con un muro divisorio. La asignación damas (oeste) / varones (este) es una suposición.',
  },
  {
    id: 'antesala', name: 'Antesala de vestidores', category: 'sanitario',
    poly: rect(281, 450, 420, 504.5), label: [351, 462], hideTitle: true,
    descripcion: 'Antesala con bancas y taquillas entre el pasillo de personal, los vestidores y la esclusa sanitaria.',
    nota: 'Sin rótulo de sala en la referencia; sólo se rotula «Bancas».',
  },
  {
    id: 'esclusa', name: 'Esclusa sanitaria', sub: '(obligatoria)', category: 'sanitario', major: true,
    rotulo: 'ESCLUSA SANITARIA (bhligistorio)',
    poly: rect(420, 363, 543, 504.5), label: [484, 374], labelSize: 5.4,
    descripcion: 'Paso sanitario obligatorio hacia planta: lavado de manos, pediluvio (desinfección de calzado) y cambio de indumentaria.',
  },
  {
    id: 'reactivos', name: 'Almacén de reactivos e insumos', category: 'almacen', major: true,
    poly: rect(543, 363, 662, 471), label: [598, 382], labelSize: 5.4,
    descripcion: 'Almacén de reactivos químicos con dique de contención: ácido clorhídrico 37 % y etanol.',
  },
  {
    id: 'pasillo-servicio', name: 'Pasillo de servicio', category: 'circulacion',
    poly: [[662, 363], [701, 363], [701, 505], [543, 505], [543, 471], [662, 471]], label: [620, 494], hideTitle: true,
    descripcion: 'Conexión entre el pasillo de transporte, la esclusa sanitaria y el laboratorio.',
    nota: 'Espacio sin rótulo en la referencia.',
  },
  {
    id: 'laboratorio', name: 'Laboratorio de calidad', sub: '(y microbiología)', category: 'laboratorio', major: true,
    poly: rect(701, 363, 923, 505), label: [815, 397],
    descripcion: 'Control de calidad y microbiología: mesadas perimetrales, mesa central, campana de extracción y ventana de transferencia de muestras.',
  },
  {
    id: 'local-e', name: 'Local sin rótulo', category: 'servicios',
    poly: rect(923, 363, 1003, 505), label: [963, 430],
    descripcion: 'Local contiguo al laboratorio con acceso desde el pasillo de transporte.',
    nota: 'La referencia no indica su uso; se representa vacío.',
  },
  {
    id: 'juntas', name: 'Sala de juntas', category: 'administracion', major: true,
    poly: rect(30, 504.5, 175, 617), label: [102, 521],
    descripcion: 'Sala de reuniones con mesa para doce personas.',
  },
  {
    id: 'cafeteria', name: 'Cafetería', category: 'servicios', major: true,
    poly: rect(175, 504.5, 384, 617), label: [222, 521],
    descripcion: 'Comedor del personal con mesas de cuatro plazas, mesa larga y cocineta.',
  },
  {
    id: 'caldera', name: 'Sala de caldera', category: 'servicios', major: true,
    poly: rect(384, 504.5, 545, 617), label: [466, 521],
    descripcion: 'Generación de vapor mediante caldera pirotubular para los servicios térmicos de la planta.',
  },
  {
    id: 'ptar', name: 'Planta de tratamiento de aguas residuales', sub: '(PTAR)', category: 'exterior', major: true,
    rotulo: 'PLANTA DE TRATAMIENTO DE AQUAR RESIUUALES (PTAR)',
    poly: rect(233, 14, 377, 80), label: [305, 25], labelSize: 5.4,
    descripcion: 'Tratamiento de las aguas residuales de proceso antes de su reutilización como agua de lavado o su vertido.',
  },
  {
    id: 'zona-limpieza', name: 'Zona de limpieza', category: 'exterior',
    poly: rect(377, 14, 443, 105.5), label: [410, 44],
    descripcion: 'Zona exterior delimitada (línea discontinua) junto a la PTAR, con acceso desde la nave.',
  },
];

export const ROOM_BY_ID: Record<string, Room> = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

export function polyBox(poly: Pt[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of poly) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Grupos de navegación del panel lateral. */
export const ZONE_GROUPS: { name: string; rooms: string[] }[] = [
  { name: 'Recepción y materia prima', rooms: ['muelle', 'almacen-mp'] },
  { name: 'Proceso', rooms: ['lavado', 'cortado', 'hidrolisis', 'filtracion', 'precipitacion', 'spray', 'molienda'] },
  { name: 'Producto terminado', rooms: ['almacen-pt', 'anden'] },
  { name: 'Calidad y reactivos', rooms: ['laboratorio', 'reactivos'] },
  { name: 'Personal y sanitarios', rooms: ['vest-damas', 'vest-varones', 'antesala', 'esclusa'] },
  { name: 'Administración y servicios', rooms: ['oficinas', 'juntas', 'cafeteria', 'caldera', 'local-e'] },
  { name: 'Circulaciones', rooms: ['pasillo', 'pasillo-personal', 'pasillo-servicio'] },
  { name: 'Exterior', rooms: ['ptar', 'zona-limpieza'] },
];
