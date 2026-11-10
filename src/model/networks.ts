import type { NetLine, Pt, TextLabel } from './types';

/**
 * Redes y recorridos trazados sobre la referencia.
 * Colores según la leyenda original:
 *   agua potable = verde (línea)   · tránsito de personal = verde (flecha)
 *   flujo de proceso = azul        · flujo de residuos = rojo
 */

export const NETWORKS: NetLine[] = [
  /* ---------------- Agua potable ---------------- */
  {
    id: 'ap-principal', layer: 'agua', name: 'Tubería principal de agua potable', midArrows: true, arrowEnd: true,
    pts: [[72, 338], [938, 338], [938, 357]],
    descripcion: 'Recorre el pasillo de transporte de oeste a este.',
  },
  { id: 'ap-muelle', layer: 'agua', name: 'Derivación agua potable → muelle', pts: [[72, 338], [72, 311]], arrowEnd: true },
  { id: 'ap-mp', layer: 'agua', name: 'Derivación agua potable → almacén MP', pts: [[162, 338], [162, 311]], arrowEnd: true },
  {
    id: 'ap-vestidores', layer: 'agua', name: 'Tubería de agua potable → vestidores', pts: [[258, 338], [258, 473], [412, 473]], arrowEnd: true,
    descripcion: 'Baja por el pasillo de personal y alimenta los vestidores y la esclusa.',
  },
  { id: 'ap-v1', layer: 'agua', name: 'Alimentación vestidores', pts: [[314, 473], [314, 455]], arrowEnd: true },
  { id: 'ap-v2', layer: 'agua', name: 'Alimentación vestidores', pts: [[351, 473], [351, 455]], arrowEnd: true },
  { id: 'ap-v3', layer: 'agua', name: 'Alimentación vestidores', pts: [[389, 473], [389, 455]], arrowEnd: true },
  {
    id: 'ap-esclusa', layer: 'agua', name: 'Tubería de agua potable → esclusa', pts: [[684, 338], [684, 479], [532, 479], [532, 403]], arrowEnd: true,
    descripcion: 'Derivación por el pasillo de servicio hasta la esclusa sanitaria.',
  },

  /* ---------------- Residuos ---------------- */
  {
    id: 'res-hidro-tk', layer: 'residuos', name: 'Tubería de residuos: hidrólisis → tanque de aguas de hidrólisis', arrowEnd: true,
    pts: [[487, 228], [487, 162], [538, 162], [538, 44], [520, 44]],
  },
  {
    id: 'res-hidro-pasillo', layer: 'residuos', name: 'Tubería de residuos: hidrólisis → pasillo', arrowEnd: true,
    pts: [[538, 162], [538, 350], [567, 350]],
  },
  { id: 'res-tk-ptar', layer: 'residuos', name: 'Residuos: tanque de hidrólisis → PTAR', pts: [[486, 61], [353, 61]], arrowEnd: true },
  {
    id: 'res-filtr-hcl', layer: 'residuos', name: 'Tubería de residuos: filtración → tanque de residuos HCl', arrowEnd: true,
    pts: [[631, 204], [638, 204], [638, 104], [697, 104], [697, 44], [707, 44]],
  },
  { id: 'res-bagazo', layer: 'residuos', name: 'Salida de bagazo a tratamiento / alimento animal', pts: [[596, 108], [596, 76]], arrowEnd: true },
  { id: 'res-ind-1', layer: 'residuos', name: 'Indicador de sentido', pts: [[531, 95], [531, 75]], arrowEnd: true, minLod: 2 },
  { id: 'res-ind-2', layer: 'residuos', name: 'Indicador de sentido', pts: [[703, 95], [703, 75]], arrowEnd: true, minLod: 2 },
  { id: 'res-reactores', layer: 'residuos', name: 'Interconexión de reactores', pts: [[462, 233], [494, 233]], arrowEnd: true, arrowStart: true, minLod: 2 },

  /* ---------------- Flujo de proceso ---------------- */
  { id: 'pr-1', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[247, 321], [302, 321]], arrowEnd: true },
  { id: 'pr-2', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[357, 321], [402, 321]], arrowEnd: true },
  { id: 'pr-3', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[466, 321], [507, 321]], arrowEnd: true },
  { id: 'pr-4', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[561, 321], [607, 321]], arrowEnd: true },
  { id: 'pr-5', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[675, 321], [722, 321]], arrowEnd: true },
  { id: 'pr-6', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[788, 321], [839, 321]], arrowEnd: true },
  { id: 'pr-7', layer: 'proceso', name: 'Flujo de proceso (carros)', pts: [[895, 321], [950, 321]], arrowEnd: true },
  {
    id: 'pr-agua-lavado', layer: 'proceso', style: 'lavado', name: 'Agua de lavado (PTAR → sala de lavado)', arrowEnd: true,
    pts: [[257, 61], [217, 61], [217, 143], [236, 143], [244, 152]],
    descripcion: 'Línea azul rotulada «Agua de lavado» en la referencia.',
  },
  {
    id: 'pr-drenaje', layer: 'proceso', style: 'lavado', name: 'Drenaje de la sala de lavado', pts: [[217, 143], [217, 312]],
    descripcion: 'Bajante con sumidero rotulado «Drenaje de PTAR».',
  },
  {
    id: 'pr-ptar-lavado', layer: 'proceso', style: 'lavado', name: 'Línea PTAR → lavadora LN-101', arrowEnd: true,
    pts: [[268, 73], [268, 147]],
  },
  { id: 'pr-drenaje-ptar', layer: 'proceso', style: 'lavado', name: 'Drenaje de PTAR', pts: [[268, 94], [287, 94]], arrowEnd: true },
  { id: 'pr-agua-lav-2', layer: 'proceso', style: 'lavado', name: 'Agua de lavado', pts: [[224, 256], [224, 276]], minLod: 2 },
  {
    id: 'pr-etanol', layer: 'proceso', style: 'etanol', name: 'Etanol para recuperar', arrowEnd: true,
    pts: [[772, 196], [751, 196], [751, 277], [681, 277], [681, 258]],
    descripcion: 'Línea verde rotulada «Etamol para recuperar» que conecta el área spray con el lazo de los TA-401.',
  },

  /* ---------------- Tránsito de personal ---------------- */
  { id: 'pe-1', layer: 'personal', name: 'Tránsito de personal: oficinas → servicios', pts: [[185, 485], [248, 485]], arrowEnd: true },
  { id: 'pe-2', layer: 'personal', name: 'Tránsito de personal → laboratorio', pts: [[612, 488], [670, 488]], arrowEnd: true },
  { id: 'pe-3', layer: 'personal', name: 'Tránsito de personal → andén', pts: [[961, 335], [991, 335]], arrowEnd: true },
];

/**
 * Tuberías y ductos físicos entre equipos (capa Maquinaria).
 * d = diámetro aparente en unidades de mundo.
 */
export interface PipeRun {
  id: string;
  pts: Pt[];
  d: number;
  kind: 'acero' | 'ducto' | 'canal';
  name: string;
  minLod?: number;
  valves?: { at: Pt; rot: number }[];
}

export const PIPES: PipeRun[] = [
  {
    id: 'col-hidrolizado', kind: 'acero', d: 2.4, name: 'Colector de hidrolizado (hidrólisis → precipitación)',
    pts: [[457, 199], [457, 150], [681, 150], [681, 160]],
    valves: [{ at: [600, 150], rot: 0 }, { at: [668, 150], rot: 0 }],
  },
  { id: 'col-r-b', kind: 'acero', d: 1.8, name: 'Bajante a reactor R-201 B', pts: [[520, 150], [520, 201]], valves: [{ at: [520, 172], rot: 90 }] },
  { id: 'col-centro', kind: 'acero', d: 1.6, name: 'Bajante central (válvulas)', pts: [[478, 150], [478, 214]], valves: [{ at: [478, 207], rot: 90 }] },
  { id: 'col-centro-2', kind: 'acero', d: 1.6, name: 'Bajante central (válvulas)', pts: [[471, 160], [471, 214]], valves: [{ at: [471, 207], rot: 90 }] },
  { id: 'ta-ab', kind: 'acero', d: 2, name: 'Línea de alcohol TA-401 → TA-401', pts: [[681, 194], [681, 213]] },
  {
    id: 'ta-retorno', kind: 'acero', d: 2, name: 'Retorno de etanol al TA-401 superior', pts: [[732, 213], [732, 177], [698, 177]],
    valves: [{ at: [732, 196], rot: 90 }],
  },
  {
    id: 'ta-lazo', kind: 'acero', d: 2, name: 'Lazo inferior de tanques TA-401', pts: [[664, 177], [655, 177], [655, 255], [732, 255], [732, 247]],
    valves: [{ at: [700, 255], rot: 0 }],
  },
  { id: 'ta-lazo-b', kind: 'acero', d: 2, name: 'Lazo inferior de tanques TA-401', pts: [[681, 247], [681, 255]] },
  {
    id: 'lavado-canal', kind: 'canal', d: 4, name: 'Canal / transportador de la lavadora (sin rótulo)',
    pts: [[323, 156], [323, 251], [278, 251]],
  },
  { id: 'lavado-cr101', kind: 'acero', d: 1.8, name: 'Conexión lavadora → trituradora', pts: [[235, 210], [235, 232], [246, 232]] },
  { id: 'ducto-cd-co', kind: 'ducto', d: 7, name: 'Ducto secador spray → ciclón', pts: [[789, 191], [789, 151], [823, 151]] },
  { id: 'ducto-co-mol', kind: 'ducto', d: 7, name: 'Ducto ciclón → molino', pts: [[845, 151], [907, 151], [907, 181]] },
  { id: 'ducto-humedad', kind: 'ducto', d: 7, name: 'Ducto de humedad (salida a cubierta)', pts: [[834, 163], [834, 92]] },
  { id: 'ptar-1-2', kind: 'acero', d: 2.2, name: 'Conexión unidades PTAR 1 → 2', pts: [[280.5, 61], [293.5, 61]] },
  { id: 'ptar-2-3', kind: 'acero', d: 2.2, name: 'Conexión unidades PTAR 2 → 3', pts: [[316.5, 61], [328, 61]] },
  { id: 'ducto-campana', kind: 'ducto', d: 5, name: 'Ducto de la campana de extracción', pts: [[736, 372], [736, 344]] },
];

/** Rótulos libres del plano (tal como aparecen, con ortografía corregida). */
export const TEXT_LABELS: TextLabel[] = [
  { id: 't-ap', text: ['AGUA POTABLE'], x: 118, y: 331, size: 5.75, color: 'var(--c-agua-txt)', weight: 700, minLod: 1, layer: 'agua' },
  { id: 't-ap2', text: ['TUBERÍA DE AGUA POTABLE'], x: 348, y: 348.5, size: 5.5, color: 'var(--c-agua-txt)', weight: 700, minLod: 1, layer: 'agua' },
  { id: 't-ap3', text: ['TUBERÍA DE AGUA POTABLE'], x: 832, y: 348.5, size: 5.5, color: 'var(--c-agua-txt)', weight: 700, minLod: 1, layer: 'agua' },
  { id: 't-ap4', text: ['TUBERÍA DE AGUA POTABLE'], x: 251, y: 412, size: 5.25, color: 'var(--c-agua-txt)', weight: 700, rotate: -90, minLod: 2, layer: 'agua' },
  { id: 't-ap5', text: ['TUBERÍA DE AGUA POTABLE'], x: 692, y: 418, size: 5.25, color: 'var(--c-agua-txt)', weight: 700, rotate: -90, minLod: 2, layer: 'agua' },
  { id: 't-carro1', text: ['CARRO DE', 'TRANSPORTACIÓN'], x: 432, y: 320, size: 5.25, weight: 700, minLod: 2, layer: 'proceso', color: 'var(--c-proceso-txt)' },
  { id: 't-carro2', text: ['CARRO DE', 'TRANSPORTACIÓN'], x: 765, y: 320, size: 5.25, weight: 700, minLod: 2, layer: 'proceso', color: 'var(--c-proceso-txt)' },
  { id: 't-res1', text: ['TUBERÍA DE', 'RESIDUOS'], x: 573, y: 168, size: 5.5, weight: 700, color: 'var(--c-res-txt)', minLod: 2, layer: 'residuos' },
  { id: 't-res2', text: ['TUBERÍA DE', 'RESIDUOS'], x: 597, y: 347, size: 5.5, weight: 700, color: 'var(--c-res-txt)', minLod: 1, layer: 'residuos' },
  { id: 't-res3', text: ['TUBERÍA DE', 'RESIDUOS'], x: 732, y: 83, size: 5.5, weight: 700, color: 'var(--c-res-txt)', minLod: 1, layer: 'residuos' },
  { id: 't-bagazo', text: ['A TRATAMIENTO DE', 'RESIDUOS (BAGAZO) /', 'ALIMENTO ANIMAL'], x: 648, y: 79, size: 4.62, weight: 700, minLod: 1, layer: 'residuos' },
  { id: 't-tk1', text: ['RESIDUOS DE', 'AGUAS DE', 'HIDRÓLISIS'], x: 494, y: 78, size: 5.25, weight: 700, minLod: 1 },
  { id: 't-tk2', text: ['RESIDUOS DE ÁCIDO', 'CLORHÍDRICO', '(HCl)'], x: 803, y: 36, size: 5.5, weight: 700, minLod: 1 },
  { id: 't-humedad', text: ['DUCTOS DE', 'HUMEDAD'], x: 870, y: 82, size: 5.0, weight: 700, minLod: 1 },
  { id: 't-lavado1', text: ['AGUA DE LAVADO'], x: 226, y: 94, size: 4.75, weight: 700, minLod: 2, layer: 'proceso', color: 'var(--c-proceso-txt)' },
  { id: 't-lavado2', text: ['DRENAJE DE PTAR'], x: 290, y: 95.5, size: 4.75, weight: 700, minLod: 2, anchor: 'start', layer: 'proceso', color: 'var(--c-proceso-txt)' },
  { id: 't-lavado3', text: ['AGUA DE LAVADO'], x: 228, y: 272, size: 4.75, weight: 700, minLod: 2, anchor: 'start', layer: 'proceso', color: 'var(--c-proceso-txt)' },
  { id: 't-lavado4', text: ['DRENAJE DE PTAR'], x: 222, y: 297, size: 4.75, weight: 700, minLod: 2, anchor: 'start', layer: 'proceso', color: 'var(--c-proceso-txt)' },
  { id: 't-etanol1', text: ['ETANOL', 'RECUPERACIÓN'], x: 727, y: 159, size: 4.5, weight: 700, minLod: 2 },
  { id: 't-alcohol', text: ['ALCOHOL'], x: 708, y: 206, size: 4.5, weight: 700, minLod: 2 },
  { id: 't-etanol2', text: ['ETANOL PARA', 'RECUPERAR'], x: 716, y: 268, size: 4.5, weight: 700, minLod: 2, layer: 'proceso' },
  { id: 't-pectina', text: ['PECTINA', '(51 Mg)'], x: 1067, y: 190, size: 6.25, weight: 700, minLod: 1 },
  { id: 't-muelle-desp', text: ['MUELLE DE DESPACHO'], x: 1078, y: 297, size: 4.75, weight: 700, minLod: 2 },
  { id: 't-lavamanos', text: ['LAVAMANOS'], x: 474, y: 398, size: 4.75, weight: 700, minLod: 2 },
  { id: 't-pediluvio', text: ['PEDILUVIO', '(desinfección', 'de calzado)'], x: 482, y: 425, size: 4.75, weight: 700, minLod: 2 },
  { id: 't-indumentaria', text: ['CAMBIO DE', 'INDUMENTARIA', '(ropa de calle /', 'ropa de planta)'], x: 482, y: 465, size: 4.5, weight: 700, minLod: 2 },
  { id: 't-bancas', text: ['Bancas'], x: 362, y: 497.5, size: 4.25, minLod: 3 },
  { id: 't-transfer', text: ['TRANSFER DE', 'MUESTRAS'], x: 892, y: 452, size: 4.5, weight: 700, minLod: 2 },
  { id: 't-vapor', text: ['Vapor'], x: 490, y: 591, size: 4.75, weight: 600, anchor: 'start', minLod: 2 },
];
