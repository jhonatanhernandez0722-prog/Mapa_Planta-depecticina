# Planta de Extracción de Pectina Cítrica — Plano industrial 2D

Reconstrucción vectorial e interactiva de la planta de `referencia.png`. Todo es SVG en 2D:
la imagen de referencia **no** se usa en la aplicación; solo sirve para el control de calidad.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # compilación de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

## Plano para AutoCAD (DXF)

`public/planta-pectina-citrica.dxf` (también con el botón **DXF · AutoCAD** de la app) se abre
directamente en AutoCAD con *Abrir*. Formato DXF R2018, **unidades en metros** (escala estimada:
1 px de la referencia = 0,10 m; la planta mide ≈ 116 × 65 m con la lámina). Si se necesita otra escala,
usar `ESCALA` con base en el origen.

| Capa | Contenido |
|---|---|
| `A-MURO` / `A-MURO-RELLENO` | Contorno de muros (polilíneas cerradas unidas) y su relleno sólido |
| `A-PUERTA`, `A-VENTANA`, `A-COLUMNA`, `A-LIMITE` | Puertas con arco de abatimiento, ventanas, columnas, límites discontinuos |
| `A-AREA` (no imprime) / `A-AREA-NOMBRE` | Contorno de cada área (útil para `AREA`) y su nombre |
| `A-MOBILIARIO(-RELLENO)` | Mobiliario y sanitarios |
| `M-EQUIPO(-RELLENO)` | Maquinaria: **59 bloques** `EQ_<tag>` con atributos TAG, NOMBRE, AREA, FUNCION, CONFIANZA (extraíbles con `EXTRAERDATOS`) |
| `M-EQUIPO-NOTAS` | Llamadas técnicas de detalle (**apagada** por defecto) |
| `M-TUBERIA(-RELLENO)` | Tuberías y ductos físicos con válvulas |
| `P-AGUA-POTABLE`, `P-RESIDUOS`, `P-PROCESO`, `P-PERSONAL` | Redes con flechas de sentido, colores de la leyenda original |
| `G-SENALIZACION`, `G-ETIQUETA`, `G-TEXTO`, `A-LAMINA` | Señalización, tags, rótulos, marco/leyenda/cajetín |

Para un plano sólo de líneas, inutilizar las capas `*-RELLENO`. Regenerar tras cambiar el plano
(con `npm run dev` en marcha): `npm run export:dxf` (requiere Python con `ezdxf` y `shapely`).

## Arquitectura

| Decisión | Motivo |
|---|---|
| **SVG puro** para todo el plano | Cada muro, puerta, equipo y tubería es un elemento independiente, escalable y editable. Con LOD + culling el volumen (≈900 nodos en N1, ≈1 700–2 000 en N3/N4) no justifica PixiJS ni Canvas. |
| **React** para estructura y UI | Componentes por capa y por tipo de equipo, memoizados por nivel de detalle. |
| **d3-zoom** solo para la cámara | Rueda centrada en el cursor, arrastre, transiciones. La transformación se aplica **directamente al DOM**: React no se re-renderiza en cada frame. |
| Store externo de cámara | El HUD (zoom %, escala, coordenadas, minimapa) se suscribe sin re-renderizar el plano. El plano solo se actualiza al cruzar un umbral de LOD, un paso de escala (×1,35) o una celda de culling. |
| Sin Web Workers | No hay cálculo pesado: la geometría es estática y el culling es una intersección de cajas. |

Grosores de línea CAD constantes en pantalla (`vector-effect: non-scaling-stroke`, ajustados por nivel);
muros con grosor real (poché: contorno + relleno); redes y flechas con grosor casi constante mediante la escala cuantizada.

### Sistema de coordenadas

1 unidad = 1 px de la referencia (1158 × 649). La referencia no tiene cotas: se adopta una
**escala estimada** de 1 u ≈ 0,10 m (planta ≈ 110 × 51 m). Toda medida en metros que muestra
la aplicación está marcada como estimada.

### Niveles de detalle (px de pantalla por unidad)

| Nivel | k | Contenido |
|---|---|---|
| N1 · Vista general | < 2,6 | Edificación, áreas, siluetas de maquinaria, redes principales, títulos de áreas |
| N2 · Vista de áreas | 2,6 – 6 | Puertas con abatimiento, equipos individuales, tags, mobiliario, todos los rótulos y redes |
| N3 · Vista de maquinaria | 6 – 14 | Ilustración técnica completa: motores, tolvas, placas, chaquetas, boquillas, válvulas, texturas de material |
| N4 · Vista de detalle | ≥ 14 | Pernos, bridas, internos ocultos (trazo discontinuo), llamadas técnicas con línea guía |

En N3/N4 solo se dibuja en detalle lo que está dentro de la vista (con margen); el resto queda como silueta.

## Interacción

Rueda: zoom al cursor · Arrastrar: desplazar · Clic: seleccionar equipo o área · Doble clic: encuadrar
el área/equipo (repetir para seguir acercando) · `F` ver toda la planta · `+`/`−` · `1`–`4` ir a un nivel ·
`/` buscar · `G` rejilla · `Esc` quitar selección.

Al entrar por primera vez se muestra una **guía rápida** (gestos de ratón o táctiles según el dispositivo);
se puede volver a abrir con el botón **Cómo usar** de la barra superior. Hasta la primera interacción
aparece además un aviso destacado con los gestos básicos.

**Móvil (≤ 760 px):** el plano ocupa toda la pantalla; búsqueda, áreas y capas se abren desde el menú ☰;
la información del equipo aparece en un panel inferior y el equipo se encuadra en la mitad visible.
Pellizcar para zoom, arrastrar para moverse, tocar para seleccionar y doble toque para acercar. Panel lateral con búsqueda, árbol de áreas y 9 capas
conmutables (con «solo»); panel contextual con descripción, función, rótulo original, conexiones
dibujadas y nivel de confianza.

## Fidelidad y aproximaciones

Cada equipo guarda el **rótulo tal como aparece en la referencia** y un nivel de confianza
(alta / media / baja). La referencia contiene numerosas erratas; las interpretaciones son:

- «Cíisceras de naninis» → cáscaras de naranja · «51 Hg» → 51 Mg · «efonol» → etanol ·
  «Filtron Franse» → filtro prensa · «Locadora de Trezher (CR-101)» → trituradora (por el nombre de la sala).
- El área se rotula **R-301** y los reactores **R-201**: se conservan ambos. Los dos reactores comparten
  tag; se distinguen como A y B. Los tres tanques comparten el tag **TA-401**.
- **CO-65H** se identifica como ciclón por su geometría; el texto descriptivo bajo él es ilegible.
- «Área cortado GAEDARAS»: la segunda palabra es ilegible y se omite.
- Sin rótulo en la referencia (representados de forma aproximada): las 3 unidades de la PTAR,
  el canal junto a la lavadora, el recuadro auxiliar de la caldera, el local contiguo al laboratorio
  y varios equipos de mesa del laboratorio.
- Vestidores: la referencia dibuja un único recinto «Damas y Varones» con dos puertas y equipamiento
  simétrico; se ha cerrado con un muro divisorio. Damas al oeste y varones al este es una suposición.
- No se muestran capacidades ni especificaciones que no figuren en la referencia.

## Control de calidad

`scripts/` contiene las herramientas usadas (puppeteer-core + Edge):

- `qa.mjs` — errores de consola y capturas por nivel / interacción.
- `overlay-check.mjs` — render N1 para superponerlo a la referencia (muros, puertas, redes y equipos coinciden).
- `mobile.mjs` — móvil emulado (390×844, táctil): guía, menú, panel inferior y doble toque.
- `perf.mjs` — tiempos de frame en zoom y desplazamiento continuos. Compilación de producción:
  p95 = 16,9 ms (60 fps), sin tareas largas.
