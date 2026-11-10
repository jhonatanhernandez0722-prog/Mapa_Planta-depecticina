import type { Equipment } from './types';

/**
 * Inventario de equipos identificados en la referencia.
 * - `rotulo`: texto tal como se lee en la imagen (con sus erratas).
 * - `confianza`: alta = rótulo y forma coinciden; media = identificado por forma o
 *   rótulo parcialmente ilegible; baja = representación técnica aproximada.
 * No se incluyen capacidades ni especificaciones que no figuren en la referencia.
 */

const carro = (id: string, room: string, x: number, y: number, extra: Partial<Equipment> = {}): Equipment => ({
  id, name: 'Carro de transporte', kind: 'carro', room, x, y, w: 38, h: 19,
  descripcion: 'Carro de plataforma con ruedas giratorias para el traslado de material entre áreas.',
  funcion: 'Transporte interno de materia prima, producto intermedio o producto envasado.',
  confianza: 'alta', ...extra,
});

export const EQUIPMENT: Equipment[] = [
  /* ---------------- Recepción ---------------- */
  {
    id: 'bascula', name: 'Báscula de plataforma', kind: 'bascula', room: 'muelle', x: 72.5, y: 216, w: 45, h: 136,
    rotulo: 'BÁSCULA / RASCULA',
    descripcion: 'Plataforma de pesaje de gran longitud con apoyos en los cuatro extremos.',
    funcion: 'Pesaje de la materia prima a su llegada a planta.',
    confianza: 'alta',
    nota: 'La referencia rotula «BÁSCULA» en la plataforma y «RASCULA» (errata) bajo ella.',
  },
  carro('carro-mp', 'almacen-mp', 159, 267),

  /* ---------------- Lavado y triturado ---------------- */
  {
    id: 'ln101', tag: 'LN-101', name: 'Lavadora de cáscaras', kind: 'lavadora', room: 'lavado', x: 271.5, y: 178.5, w: 97, h: 62,
    rotulo: 'Área de Lavado de Cíissaras (LN-101)',
    descripcion: 'Tina de lavado rectangular con tolva de alimentación inclinada y tolva de descarga cónica.',
    funcion: 'Lavado de la cáscara cítrica con agua para retirar impurezas antes de la reducción de tamaño.',
    confianza: 'alta',
    nota: 'Recibe la línea «Agua de lavado» procedente de la PTAR según la referencia.',
  },
  {
    id: 'cr101', tag: 'CR-101', name: 'Trituradora', kind: 'trituradora', room: 'lavado', x: 261, y: 238, w: 34, h: 38,
    rotulo: 'Locadora de Trecher (CR-101)',
    descripcion: 'Equipo con cuerpo motorizado y tolva cónica inferior, alimentado desde la lavadora LN-101.',
    funcion: 'Reducción de tamaño (triturado) de la cáscara lavada.',
    confianza: 'media',
    nota: 'Rótulo ilegible; la función se deduce del nombre de la sala («lavado y triturado») y de la forma del equipo.',
  },

  /* ---------------- Cortado ---------------- */
  {
    id: 'cr102', tag: 'CR-102', name: 'Cortadora', kind: 'cortadora', room: 'cortado', x: 376, y: 181, w: 42, h: 50,
    rotulo: 'CR-102',
    descripcion: 'Máquina con tolva inclinada de alimentación, cuerpo de corte y motor lateral.',
    funcion: 'Corte de la cáscara en fragmentos de tamaño uniforme.',
    confianza: 'media',
    nota: 'Función deducida del nombre del área («Área cortado»).',
  },
  {
    id: 'm103', tag: 'M-103', name: 'Molino', kind: 'molinoMartillos', room: 'cortado', x: 377, y: 250, w: 36, h: 36,
    rotulo: 'M-103',
    descripcion: 'Molino con tolva de alimentación inclinada, cámara de molienda y bastidor.',
    funcion: 'Reducción adicional del tamaño de partícula antes de la hidrólisis.',
    confianza: 'media',
    nota: 'El prefijo «M» y la forma sugieren un molino; el tipo exacto no se indica.',
  },
  carro('carro-cortado', 'cortado', 390, 292, { rotulo: 'CARIAD DE (ilegible)', w: 34, h: 17 }),

  /* ---------------- Hidrólisis ---------------- */
  {
    id: 'r201a', tag: 'R-201 A', name: 'Reactor agitado', kind: 'reactor', room: 'hidrolisis', x: 447, y: 210, w: 36, h: 36,
    rotulo: 'Reactores agitados motores de agitación (R-201)',
    descripcion: 'Reactor vertical con chaqueta, cabezal con motor de agitación y agitador de palas.',
    funcion: 'Hidrólisis ácida de la cáscara para solubilizar la pectina (zona caliente, 70 °C).',
    confianza: 'alta',
    datos: [['Temperatura de zona', '70 °C (rótulo del área)']],
    nota: 'La referencia muestra dos reactores con un único tag «R-201»; se distinguen como A y B.',
  },
  {
    id: 'r201b', tag: 'R-201 B', name: 'Reactor agitado', kind: 'reactor', room: 'hidrolisis', x: 508, y: 210, w: 36, h: 36,
    rotulo: 'Reactores agitados motores de agitación (R-201)',
    descripcion: 'Reactor vertical con chaqueta, cabezal con motor de agitación y agitador de palas.',
    funcion: 'Hidrólisis ácida de la cáscara para solubilizar la pectina (zona caliente, 70 °C).',
    confianza: 'alta',
    datos: [['Temperatura de zona', '70 °C (rótulo del área)']],
    nota: 'La referencia muestra dos reactores con un único tag «R-201»; se distinguen como A y B.',
  },
  carro('carro-hidro', 'hidrolisis', 460, 292, { w: 36, h: 18 }),

  /* ---------------- Filtración ---------------- */
  {
    id: 'f301', tag: 'F-301', name: 'Filtro prensa', kind: 'filtroPrensa', room: 'filtracion', x: 595, y: 207, w: 70, h: 36,
    rotulo: 'Filtron Franse (F-301)',
    descripcion: 'Filtro prensa de placas con cabezal fijo, cabezal móvil, vigas laterales y paquete de placas.',
    funcion: 'Separación del extracto líquido (con pectina) del residuo sólido de cáscara (bagazo).',
    confianza: 'alta',
    nota: 'Rótulo con errata («Filtron Franse»); la forma corresponde inequívocamente a un filtro prensa.',
  },
  carro('carro-filtr', 'filtracion', 583, 292, { caption: 'CARRO', w: 36, h: 18 }),

  /* ---------------- Precipitación ---------------- */
  {
    id: 'ta401a', tag: 'TA-401', name: 'Tanque de precipitación', kind: 'tanquePrecipitacion', room: 'precipitacion', x: 681, y: 177, w: 34, h: 34,
    rotulo: 'TA-401',
    descripcion: 'Tanque vertical de sección circular con alimentación superior desde el colector de hidrolizado.',
    funcion: 'Precipitación de la pectina por adición de alcohol (etanol).',
    confianza: 'alta',
    nota: 'Los tres tanques del área llevan el mismo tag «TA-401» en la referencia.',
  },
  {
    id: 'ta401b', tag: 'TA-401', name: 'Tanque de precipitación', kind: 'tanquePrecipitacion', room: 'precipitacion', x: 681, y: 230, w: 34, h: 34,
    rotulo: 'TA-401',
    descripcion: 'Tanque vertical de sección circular conectado al tanque superior por la línea de alcohol.',
    funcion: 'Precipitación de la pectina con alcohol.',
    confianza: 'alta',
    nota: 'Los tres tanques del área llevan el mismo tag «TA-401» en la referencia.',
  },
  {
    id: 'ta401c', tag: 'TA-401', name: 'Tanque de precipitación / etanol', kind: 'tanquePrecipitacion', room: 'precipitacion', x: 732, y: 230, w: 34, h: 34,
    rotulo: 'TA-401 · ETANOL RE SECURON',
    descripcion: 'Tanque vertical en el lazo de retorno de etanol hacia el tanque superior.',
    funcion: 'Manejo del etanol en el circuito de precipitación / recuperación.',
    confianza: 'media',
    nota: 'Rótulo del lazo parcialmente ilegible («ETANOL RE SECURON»); se interpreta como retorno/recuperación de etanol.',
  },

  /* ---------------- Spray dry ---------------- */
  {
    id: 'cd501', tag: 'CD-501', name: 'Secador spray', kind: 'secadorSpray', room: 'spray', x: 789, y: 205, w: 46, h: 46,
    rotulo: 'CD-501 · Secador apray',
    descripcion: 'Cámara de secado cilíndrica con fondo cónico, atomizador central y entrada de aire caliente.',
    funcion: 'Secado por aspersión del precipitado de pectina hasta obtener polvo.',
    confianza: 'alta',
  },
  {
    id: 'co65h', tag: 'CO-65H', name: 'Ciclón separador', kind: 'ciclon', room: 'spray', x: 834, y: 163, w: 26, h: 26,
    rotulo: 'CO-65H · «Dusarior Desria cheqnish»',
    descripcion: 'Ciclón con entrada tangencial, tubo buscador de vórtice y cono inferior de descarga.',
    funcion: 'Separación del polvo de pectina de la corriente de aire de secado.',
    confianza: 'media',
    nota: 'El texto descriptivo bajo el equipo es ilegible; la identificación como ciclón se basa en su geometría característica.',
  },
  carro('carro-spray', 'spray', 801, 291, { w: 36, h: 18 }),

  /* ---------------- Molienda y envasado ---------------- */
  {
    id: 'molino-pines', name: 'Molino', kind: 'molinoPines', room: 'molienda', x: 902, y: 184, w: 40, h: 28,
    rotulo: 'MOLINOS PILOS',
    descripcion: 'Molino de carcasa circular con motor acoplado lateralmente, alimentado por el ducto procedente del ciclón.',
    funcion: 'Molienda del polvo seco para homogeneizar la granulometría antes del envasado.',
    confianza: 'media',
    nota: 'Rótulo «MOLINOS PILOS» (posible «molino de pines»); el tipo exacto no puede confirmarse.',
  },
  {
    id: 'dol501', tag: 'DOL-501', name: 'Envasadora automática', kind: 'envasadora', room: 'molienda', x: 907, y: 222, w: 40, h: 32,
    rotulo: 'ENVAEARORA AUTOMÁTICA DE RNE. DOL-501',
    descripcion: 'Envasadora con tolva de producto, dosificador y estación de llenado de sacos.',
    funcion: 'Dosificación y llenado automático del producto en sacos.',
    confianza: 'alta',
  },
  {
    id: 'paletizado', name: 'Línea de paletizado de sacos', kind: 'paletizado', room: 'molienda', x: 912, y: 261, w: 38, h: 46,
    rotulo: 'LÍNEA PARA PALETIZADO DE SACOS',
    descripcion: 'Transportador de sacos desde la envasadora hasta la posición de paletizado.',
    funcion: 'Conducción y acomodo de los sacos llenos sobre tarimas.',
    confianza: 'alta',
  },

  /* ---------------- Almacén PT ---------------- */
  ...[1017.5, 1037, 1096, 1116].map((x, i): Equipment => ({
    id: `rack-${i + 1}`, name: `Estantería de carga paletizada ${i + 1}`, kind: 'rack', room: 'almacen-pt', x, y: 190.5, w: 18.5, h: 105,
    descripcion: 'Estantería de bastidores con travesaños y arriostramiento en cruz, cargada con tarimas de sacos.',
    funcion: 'Almacenamiento de la pectina envasada (rotulado en la referencia: «PECTINA 51 Mg»).',
    confianza: 'alta',
    datos: [['Producto', 'Pectina'], ['Capacidad del almacén (rótulo)', '51 Mg']],
  })),
  carro('carro-pt', 'almacen-pt', 1059, 274),
  {
    id: 'pila-pallets', name: 'Pila de tarimas', kind: 'pilaPallets', room: 'almacen-pt', x: 1105.5, y: 275, w: 35, h: 25,
    rotulo: 'MUELLE DE DESPACOO',
    descripcion: 'Tarimas apiladas junto a la salida hacia el andén de carga.',
    funcion: 'Preparación de cargas para despacho.',
    confianza: 'media',
  },

  /* ---------------- Pasillo y andén ---------------- */
  carro('carro-p1', 'pasillo', 330, 320, { name: 'Carro de transportación', rotulo: 'CARRO DE TRANSPORTACIÓN' }),
  carro('carro-p2', 'pasillo', 644, 320, { name: 'Carro de transportación', rotulo: 'CARRO DE TRANSPORTACIÓN' }),
  carro('carro-p3', 'pasillo', 867, 320, { name: 'Carro de transportación', rotulo: 'CARRO DE TRANSPORTACIÓN' }),
  {
    id: 'camion', name: 'Camión de despacho', kind: 'camion', room: 'anden', x: 1079, y: 339.5, w: 92, h: 30,
    descripcion: 'Camión rígido con caja cerrada estacionado en el andén de carga.',
    funcion: 'Expedición del producto terminado.',
    confianza: 'alta',
  },

  /* ---------------- Exterior norte ---------------- */
  ...[269, 305, 339.5].map((x, i): Equipment => ({
    id: `ptar-${i + 1}`, name: `Unidad de tratamiento ${i + 1}`, kind: 'unidadPtar', room: 'ptar', x, y: 61, w: 23, h: 24,
    descripcion: 'Depósito rectangular de la planta de tratamiento, conectado en serie con las unidades contiguas.',
    funcion: 'Etapa de tratamiento de aguas residuales (la referencia no especifica el tipo de tratamiento).',
    confianza: 'baja',
    nota: 'La referencia dibuja tres recuadros sin rótulo; se representan como depósitos en serie.',
  })),
  {
    id: 'tk-hidrolisis', name: 'Tanque de residuos de aguas de hidrólisis', kind: 'tanqueVertical', room: 'exterior', x: 494, y: 42, w: 46, h: 46,
    rotulo: 'RESIDUOS DE AGUAS DE HIDRÓLISIS',
    descripcion: 'Tanque vertical exterior que recibe los residuos líquidos del área de hidrólisis.',
    funcion: 'Acumulación de aguas residuales de hidrólisis antes de enviarlas a la PTAR.',
    confianza: 'alta',
  },
  {
    id: 'tk-hcl', name: 'Tanque de residuos de ácido clorhídrico', kind: 'tanqueVertical', room: 'exterior', x: 731, y: 45, w: 44, h: 44,
    rotulo: 'RESIDUOS DE ÁCIDO CLORHÍDRICO (HCl)', variant: 'hcl',
    descripcion: 'Tanque vertical exterior conectado a la tubería de residuos procedente del área de filtración.',
    funcion: 'Acumulación de residuos ácidos (HCl).',
    confianza: 'alta',
  },

  /* ---------------- Caldera ---------------- */
  {
    id: 'caldera', name: 'Caldera pirotubular', kind: 'caldera', room: 'caldera', x: 437, y: 584, w: 100, h: 40,
    rotulo: 'Caldera Pirotubular · Vopar',
    descripcion: 'Caldera horizontal de cuerpo cilíndrico con chimenea y salida de vapor.',
    funcion: 'Generación de vapor para servicios térmicos de la planta.',
    confianza: 'alta',
  },
  {
    id: 'aux-caldera', name: 'Equipo auxiliar de caldera', kind: 'tablero', room: 'caldera', x: 531, y: 565, w: 18, h: 20,
    rotulo: 'Caldera Pirotubular (flecha hacia el recuadro)',
    descripcion: 'Recuadro señalado con una flecha junto a la caldera.',
    funcion: 'No especificada en la referencia.',
    confianza: 'baja',
    nota: 'La referencia repite el rótulo «Caldera Pirotubular» señalando este recuadro; su función real no puede determinarse.',
  },

  /* ---------------- Reactivos ---------------- */
  {
    id: 'dique', name: 'Dique de contención', kind: 'dique', room: 'reactivos', x: 602.5, y: 448, w: 111, h: 38,
    rotulo: 'Diquoso contención',
    descripcion: 'Cubeto de contención perimetral bajo los recipientes de reactivos.',
    funcion: 'Retener derrames de los reactivos almacenados.',
    confianza: 'alta',
  },
  {
    id: 'hcl37', name: 'Ácido clorhídrico 37 %', kind: 'garrafa', room: 'reactivos', x: 566, y: 437, w: 17, h: 17, variant: 'hcl',
    rotulo: 'HCl 37%',
    descripcion: 'Garrafa de ácido clorhídrico concentrado dentro del dique de contención.',
    funcion: 'Reactivo para la hidrólisis ácida.',
    confianza: 'alta',
    datos: [['Concentración (rótulo)', '37 %']],
  },
  {
    id: 'etanol', name: 'Etanol', kind: 'garrafa', room: 'reactivos', x: 638, y: 437, w: 17, h: 17, variant: 'etanol',
    rotulo: 'efonol',
    descripcion: 'Garrafa de etanol dentro del dique de contención.',
    funcion: 'Alcohol para la precipitación de la pectina.',
    confianza: 'media',
    nota: 'Rótulo «efonol» interpretado como etanol, coherente con el área de precipitación.',
  },
  {
    id: 'tambor', name: 'Tambor de insumos', kind: 'tambor', room: 'reactivos', x: 646, y: 392, w: 17, h: 17,
    descripcion: 'Recipiente cilíndrico sin rótulo junto al muro del almacén.',
    funcion: 'No especificada en la referencia.',
    confianza: 'baja',
  },

  /* ---------------- Laboratorio ---------------- */
  {
    id: 'campana', name: 'Campana de extracción', kind: 'campana', room: 'laboratorio', x: 736, y: 376, w: 28, h: 24,
    descripcion: 'Campana con conducto de extracción que atraviesa el muro norte.',
    funcion: 'Extracción de vapores durante ensayos.',
    confianza: 'alta',
  },
  {
    id: 'mesadas-lab', name: 'Mesadas perimetrales', kind: 'mesadaLab', room: 'laboratorio', x: 812, y: 434, w: 214, h: 140,
    descripcion: 'Mesadas de trabajo adosadas a los muros del laboratorio.',
    funcion: 'Superficie de trabajo y apoyo de equipos de laboratorio.',
    confianza: 'alta',
  },
  {
    id: 'isla-lab', name: 'Mesa central de trabajo', kind: 'islaLab', room: 'laboratorio', x: 811, y: 433, w: 92, h: 30,
    descripcion: 'Mesa central doble de laboratorio.',
    funcion: 'Superficie de trabajo central.',
    confianza: 'alta',
  },
  {
    id: 'lab-eq1', name: 'Equipo de mesa', kind: 'equipoLab', room: 'laboratorio', x: 770, y: 374, w: 13, h: 9, variant: 'display',
    descripcion: 'Equipo pequeño con pantalla sobre la mesada norte.', funcion: 'No especificada en la referencia.', confianza: 'baja',
  },
  {
    id: 'lab-eq2', name: 'Equipo de mesa circular', kind: 'equipoLab', room: 'laboratorio', x: 787, y: 373, w: 12, h: 11, variant: 'round',
    descripcion: 'Equipo de mesa de planta circular sobre la mesada norte.', funcion: 'No especificada en la referencia.', confianza: 'baja',
  },
  {
    id: 'tarja-lab', name: 'Tarja de laboratorio', kind: 'tarja', room: 'laboratorio', x: 819, y: 374, w: 18, h: 13,
    descripcion: 'Fregadero empotrado en la mesada norte.', funcion: 'Lavado de material de laboratorio.', confianza: 'alta',
  },
  {
    id: 'estufa-lab', name: 'Estufa / horno de laboratorio', kind: 'estufaLab', room: 'laboratorio', x: 876, y: 375, w: 22, h: 16,
    descripcion: 'Equipo con rejilla frontal sobre la mesada norte.', funcion: 'Tratamientos térmicos de muestras (identificación aproximada).',
    confianza: 'baja', nota: 'Identificado por la rejilla dibujada; puede tratarse de otro equipo térmico.',
  },
  {
    id: 'lab-eq3', name: 'Equipo de mesa', kind: 'equipoLab', room: 'laboratorio', x: 715, y: 430, w: 12, h: 15, variant: 'display',
    descripcion: 'Equipo sobre la mesada oeste.', funcion: 'No especificada en la referencia.', confianza: 'baja',
  },
  {
    id: 'lab-eq4', name: 'Equipo de mesa', kind: 'equipoLab', room: 'laboratorio', x: 715, y: 458, w: 13, h: 15, variant: 'oven',
    descripcion: 'Equipo con puerta frontal sobre la mesada oeste.', funcion: 'No especificada en la referencia.', confianza: 'baja',
  },
  {
    id: 'pc-lab', name: 'Estación de cómputo', kind: 'computador', room: 'laboratorio', x: 775, y: 491, w: 25, h: 15,
    descripcion: 'Puesto con monitor y teclado sobre la mesada sur.', funcion: 'Registro de resultados.', confianza: 'alta',
  },
  {
    id: 'lab-eq5', name: 'Equipo de mesa con accesorios', kind: 'equipoLab', room: 'laboratorio', x: 811, y: 492, w: 25, h: 13, variant: 'bench',
    descripcion: 'Equipo rectangular con accesorios sobre la mesada sur.', funcion: 'No especificada en la referencia.', confianza: 'baja',
  },
  {
    id: 'refri-lab', name: 'Equipo vertical', kind: 'refrigerador', room: 'laboratorio', x: 843.5, y: 491, w: 13, h: 20,
    descripcion: 'Equipo de pie con puerta frontal.', funcion: 'Posible refrigerador o incubadora (no rotulado).', confianza: 'baja',
  },
  {
    id: 'autoclave', name: 'Equipo de carga frontal', kind: 'autoclave', room: 'laboratorio', x: 874, y: 489, w: 27, h: 28,
    descripcion: 'Equipo de planta cuadrada con puerta circular frontal.', funcion: 'Posible autoclave de esterilización (identificación aproximada).',
    confianza: 'baja', nota: 'La puerta circular es característica de autoclaves; la referencia no lo rotula.',
  },
  {
    id: 'passbox', name: 'Ventana de transferencia de muestras', kind: 'passBox', room: 'laboratorio', x: 913, y: 426.5, w: 20, h: 23,
    rotulo: 'TRANSFER DE MOESTRAS',
    descripcion: 'Compartimento de paso (línea discontinua) en el muro este del laboratorio.',
    funcion: 'Recepción de muestras sin acceso directo de personas.',
    confianza: 'alta',
  },

  /* ---------------- Esclusa ---------------- */
  {
    id: 'lavamanos-1', name: 'Lavamanos', kind: 'lavamanos', room: 'esclusa', x: 428.5, y: 388, w: 11, h: 13,
    rotulo: 'LAVAMANOS', descripcion: 'Lavamanos adosado al muro oeste de la esclusa.', funcion: 'Lavado de manos obligatorio antes de ingresar a planta.', confianza: 'alta',
  },
  {
    id: 'lavamanos-2', name: 'Lavamanos', kind: 'lavamanos', room: 'esclusa', x: 428.5, y: 404, w: 11, h: 13,
    rotulo: 'LAVAMANOS', descripcion: 'Lavamanos adosado al muro oeste de la esclusa.', funcion: 'Lavado de manos obligatorio antes de ingresar a planta.', confianza: 'alta',
  },
  {
    id: 'pediluvio', name: 'Pediluvio', kind: 'pediluvio', room: 'esclusa', x: 433, y: 434, w: 20, h: 30,
    rotulo: 'PEDILUVIO (desinfección do salcudo)',
    descripcion: 'Bandeja de desinfección de calzado.', funcion: 'Desinfección del calzado del personal al ingresar a planta.', confianza: 'alta',
  },
];

export const EQUIP_BY_ID: Record<string, Equipment> = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e]));

export const AREA_NAMES_EXTRA: Record<string, string> = {
  exterior: 'Exterior norte (patio de tanques)',
};
