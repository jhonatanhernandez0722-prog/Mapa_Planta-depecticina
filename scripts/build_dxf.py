"""
Paso 2 de la exportación a AutoCAD: construye el DXF a partir de export/plano-data.json.

  python scripts/build_dxf.py [entrada.json] [salida.dxf] [vista_previa.png]

- Unidades: metros (escala estimada 1 u de la referencia = 0,10 m). Origen en la esquina
  inferior izquierda de la lámina; eje Y hacia arriba.
- Muros: contornos unidos (polilíneas cerradas) + relleno sólido en capa aparte.
- Puertas con arco real, ventanas, límites de área, rótulos MTEXT.
- Cada equipo es un BLOQUE con atributos (TAG, NOMBRE, AREA, FUNCION, CONFIANZA).
- Redes como polilíneas por capa con flechas de sentido.
"""
import json
import math
import re
import sys
from collections import Counter

import ezdxf
from ezdxf import colors as dxfcolors
from ezdxf.enums import MTextEntityAlignment, TextEntityAlignment
from ezdxf.fonts import fonts
from shapely.geometry import LineString, Polygon, box
from shapely.ops import unary_union

SRC = sys.argv[1] if len(sys.argv) > 1 else 'export/plano-data.json'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/planta-pectina-citrica.dxf'
PREVIEW = sys.argv[3] if len(sys.argv) > 3 else None

data = json.load(open(SRC, encoding='utf-8'))
M = data['model']
S = 0.1  # metros por unidad de plano (estimado)
H = M['sheet']['h']


def W(x, y):
    """Mundo (px de referencia, Y abajo) -> DXF (m, Y arriba)."""
    return (round(x * S, 4), round((H - y) * S, 4))


def L(x, y):
    """Local de bloque (Y abajo) -> bloque DXF (m, Y arriba)."""
    return (round(x * S, 4), round(-y * S, 4))


# ---------------------------------------------------------------------------
# Documento, capas y estilos
# ---------------------------------------------------------------------------
doc = ezdxf.new('R2018', setup=True)
doc.units = ezdxf.units.M
doc.header['$INSUNITS'] = 6
doc.header['$MEASUREMENT'] = 1
doc.header['$LTSCALE'] = 1.0
doc.header['$PSLTSCALE'] = 0
doc.header['$LWDISPLAY'] = 1
msp = doc.modelspace()

doc.styles.new('PLANO', dxfattribs={'font': 'arial.ttf'})
doc.styles.new('PLANO_N', dxfattribs={'font': 'arialbd.ttf'})
FONT = {False: fonts.make_font('arial.ttf', cap_height=1.0), True: fonts.make_font('arialbd.ttf', cap_height=1.0)}


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


LAYERS = [
    # nombre, ACI, color verdadero, tipo de línea, grosor (1/100 mm), imprimir, descripción
    ('A-LAMINA', 8, None, 'Continuous', 35, True, 'Marco, leyenda y cajetín'),
    ('A-MURO', 7, None, 'Continuous', 50, True, 'Muros (contorno)'),
    ('A-MURO-RELLENO', 8, '#8d949b', 'Continuous', 0, True, 'Relleno de muros'),
    ('A-COLUMNA', 7, None, 'Continuous', 35, True, 'Columnas de fachada'),
    ('A-PUERTA', 41, None, 'Continuous', 25, True, 'Puertas y abatimientos'),
    ('A-VENTANA', 4, None, 'Continuous', 18, True, 'Ventanas'),
    ('A-LIMITE', 8, None, 'DASHED', 25, True, 'Zona de limpieza y borde de andén'),
    ('A-AREA', 8, None, 'DASHED', 13, False, 'Límites de áreas (no se imprime)'),
    ('A-AREA-NOMBRE', 7, None, 'Continuous', 25, True, 'Nombres de áreas'),
    ('A-MOBILIARIO', 9, None, 'Continuous', 18, True, 'Mobiliario y sanitarios'),
    ('A-MOBILIARIO-RELLENO', 9, None, 'Continuous', 0, True, 'Relleno de mobiliario'),
    ('M-EQUIPO', 7, None, 'Continuous', 25, True, 'Maquinaria (bloques)'),
    ('M-EQUIPO-RELLENO', 8, None, 'Continuous', 0, True, 'Rellenos de material de la maquinaria'),
    ('M-EQUIPO-NOTAS', 150, None, 'Continuous', 13, True, 'Llamadas técnicas de detalle'),
    ('M-TUBERIA', 8, None, 'Continuous', 25, True, 'Tuberías y ductos físicos'),
    ('M-TUBERIA-RELLENO', 9, None, 'Continuous', 0, True, 'Relleno de tuberías y ductos'),
    ('P-AGUA-POTABLE', 3, '#3aa84f', 'Continuous', 35, True, 'Tubería de agua potable'),
    ('P-RESIDUOS', 1, '#b3121b', 'Continuous', 35, True, 'Tubería / flujo de residuos'),
    ('P-PROCESO', 5, '#1d4ed8', 'Continuous', 35, True, 'Flujo de proceso'),
    ('P-PERSONAL', 94, '#13692c', 'Continuous', 35, True, 'Tránsito de personal'),
    ('G-SENALIZACION', 2, None, 'Continuous', 25, True, 'Señalización'),
    ('G-ETIQUETA', 4, None, 'Continuous', 18, True, 'Tags de equipos'),
    ('G-TEXTO', 7, None, 'Continuous', 18, True, 'Rótulos generales'),
]
for name, aci, tc, lt, lw, plot, desc in LAYERS:
    ly = doc.layers.add(name, color=aci, linetype=lt)
    if tc:
        ly.rgb = hexrgb(tc)
    ly.dxf.lineweight = lw
    ly.dxf.plot = 1 if plot else 0
    ly.description = desc
# Las llamadas técnicas de detalle saturan la vista general: capa apagada por defecto.
doc.layers.get('M-EQUIPO-NOTAS').off()

NET_LAYER = {'agua': 'P-AGUA-POTABLE', 'residuos': 'P-RESIDUOS', 'proceso': 'P-PROCESO', 'personal': 'P-PERSONAL'}
VAR_COLORS = {
    'var(--c-agua-txt)': '#22803a', 'var(--c-proceso-txt)': '#1e3fae', 'var(--c-res-txt)': '#a1121a',
    'var(--c-agua)': '#3aa84f', 'var(--c-proceso)': '#1d4ed8', 'var(--c-residuos)': '#b3121b',
    'var(--c-personal)': '#13692c', 'var(--c-lavado)': '#2167c4', 'var(--c-etanol)': '#3a9d4a',
    'var(--ink)': None,
}


def lum(rgb):
    r, g, b = (v / 255 for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def stroke_attribs(rgb):
    """Trazos oscuros -> PorCapa (blanco/negro adaptable en AutoCAD); el resto, color verdadero."""
    if rgb is None or lum(rgb) < 0.35:
        return {}
    return {'true_color': dxfcolors.rgb2int(tuple(int(v) for v in rgb))}


def text_wf(s, bold, cap_h, target_len):
    """Factor de ancho para que el texto ocupe lo mismo que en el plano web (fuente condensada)."""
    if not target_len or cap_h <= 0:
        return 0.85
    w = FONT[bold].text_width(s) * cap_h
    return max(0.55, min(1.25, target_len / w)) if w > 0 else 0.85


# ---------------------------------------------------------------------------
# Conversión genérica de la geometría extraída del SVG
# ---------------------------------------------------------------------------
def add_hatch(space, pts, rgb, layer, circle=None):
    h = space.add_hatch(dxfattribs={'layer': layer})
    h.set_solid_fill(color=7, rgb=tuple(int(v) for v in rgb))
    if circle:
        ep = h.paths.add_edge_path()
        ep.add_arc(circle[0], circle[1], 0, 360)
    else:
        h.paths.add_polyline_path(pts, is_closed=True)
    return h


def emit_items(space, items, tf, layer_line, layer_fill, layer_note, hidden_lt_scale=0.15):
    for it in items:
        k = it['k']
        note = it.get('role') == 'nota'
        if k == 'text':
            rgb = it.get('c')
            cap = it['h'] * 0.716 * S
            if cap <= 0:
                continue
            attrs = {
                'layer': layer_note if note else layer_line,
                'style': 'PLANO_N' if it.get('bold') else 'PLANO',
                'height': round(cap, 4),
                'rotation': -it.get('rot', 0),
                'width': round(text_wf(it['s'], bool(it.get('bold')), cap, it.get('len', 0) * S), 3),
            }
            attrs.update(stroke_attribs(rgb))
            t = space.add_text(it['s'], dxfattribs=attrs)
            t.set_placement(tf(it['x'], it['y']))
            continue
        lay = layer_note if note else layer_line
        if k == 'circle':
            c = tf(it['x'], it['y'])
            r = it['r'] * S
            if r <= 0:
                continue
            if it.get('fc') and not note:
                add_hatch(space, None, it['fc'], layer_fill, circle=(c, r))
            if it.get('sc'):
                a = {'layer': lay, **stroke_attribs(it['sc'])}
                if it.get('dash'):
                    a.update(linetype='HIDDEN', ltscale=hidden_lt_scale)
                space.add_circle(c, r, dxfattribs=a)
            continue
        pts = [tf(x, y) for x, y in it['pts']]
        # quitar vértices duplicados consecutivos
        clean = [pts[0]]
        for q in pts[1:]:
            if abs(q[0] - clean[-1][0]) > 1e-5 or abs(q[1] - clean[-1][1]) > 1e-5:
                clean.append(q)
        if len(clean) < 2:
            continue
        closed = it.get('closed', False)
        if it.get('fc') and len(clean) >= 3 and not note:
            add_hatch(space, clean, it['fc'], layer_fill)
        if it.get('sc'):
            a = {'layer': lay, **stroke_attribs(it['sc'])}
            w = it.get('w', 0) * S
            if w >= 0.004:
                a['const_width'] = round(w, 4)
            if it.get('dash'):
                a.update(linetype='HIDDEN', ltscale=hidden_lt_scale)
            space.add_lwpolyline(clean, close=closed, dxfattribs=a)


# ---------------------------------------------------------------------------
# Muros: unión de rectángulos (encuentros limpios), con huecos de ventana
# ---------------------------------------------------------------------------
def on_segment(pt, seg, tol=0.7):
    (x1, y1), (x2, y2) = seg['p'], seg['q']
    px, py = pt
    if abs(y1 - y2) < 1e-6:  # horizontal
        return abs(py - y1) <= tol + 2.2 and min(x1, x2) - tol <= px <= max(x1, x2) + tol
    return abs(px - x1) <= tol + 2.2 and min(y1, y2) - tol <= py <= max(y1, y2) + tol


def wall_poly(seg, t, others):
    (x1, y1), (x2, y2) = seg['p'], seg['q']
    horiz = abs(y1 - y2) < 1e-6
    a, b = (min(x1, x2), max(x1, x2)) if horiz else (min(y1, y2), max(y1, y2))
    at = y1 if horiz else x1
    p_a = (a, at) if horiz else (at, a)
    p_b = (b, at) if horiz else (at, b)
    # Se prolonga medio espesor sólo donde el extremo toca otro muro (no en jambas de puerta)
    ea = t / 2 if any(o is not seg and on_segment(p_a, o) for o in others) else 0
    eb = t / 2 if any(o is not seg and on_segment(p_b, o) for o in others) else 0
    if horiz:
        return box(a - ea, at - t / 2, b + eb, at + t / 2)
    return box(at - t / 2, a - ea, at + t / 2, b + eb)


segs = [dict(w, t=M['wallExt'] if w.get('ext') else M['wallInt']) for w in M['walls']]
light = [dict(w, t=M['wallLight']) for w in M['lightWalls']]
allsegs = segs + light
polys = [wall_poly(s, s['t'], allsegs) for s in allsegs]
# recinto de la PTAR (muro doble) y bloque macizo del andén
polys.append(box(233 - 1.45, 14 - 1.45, 377 + 1.45, 80 + 1.45).difference(box(233 + 1.45, 14 + 1.45, 377 - 1.45, 80 - 1.45)))
polys.append(box(1003, 361.2, 1023, 364.8))
walls = unary_union(polys)
win_boxes = []
for wnd in M['windows']:
    t = M['wallInt'] if wnd['at'] == 363 else M['wallExt']
    if wnd['dir'] == 'h':
        win_boxes.append((box(wnd['a'], wnd['at'] - t / 2 - 0.2, wnd['b'], wnd['at'] + t / 2 + 0.2), wnd, t))
    else:
        win_boxes.append((box(wnd['at'] - t / 2 - 0.2, wnd['a'], wnd['at'] + t / 2 + 0.2, wnd['b']), wnd, t))
walls = walls.difference(unary_union([b for b, _, _ in win_boxes])).simplify(0.02)

wall_geoms = [walls] if walls.geom_type == 'Polygon' else list(walls.geoms)

# ---------------------------------------------------------------------------
# Construcción del espacio modelo
# ---------------------------------------------------------------------------
# 1. Límites de áreas
for r in M['rooms']:
    msp.add_lwpolyline([W(*q) for q in r['poly']], close=True, dxfattribs={'layer': 'A-AREA'})

# 2. Mobiliario
emit_items(msp, data['layers']['mobiliario'], W, 'A-MOBILIARIO', 'A-MOBILIARIO-RELLENO', 'A-MOBILIARIO')

# 3. Muros (relleno y contorno)
for g in wall_geoms:
    h = msp.add_hatch(dxfattribs={'layer': 'A-MURO-RELLENO'})
    h.set_solid_fill(color=8, rgb=hexrgb('#8d949b'))
    h.paths.add_polyline_path([W(*c) for c in list(g.exterior.coords)[:-1]], is_closed=True, flags=ezdxf.const.BOUNDARY_PATH_EXTERNAL)
    for hole in g.interiors:
        h.paths.add_polyline_path([W(*c) for c in list(hole.coords)[:-1]], is_closed=True)
for g in wall_geoms:
    msp.add_lwpolyline([W(*c) for c in list(g.exterior.coords)[:-1]], close=True, dxfattribs={'layer': 'A-MURO'})
    for hole in g.interiors:
        msp.add_lwpolyline([W(*c) for c in list(hole.coords)[:-1]], close=True, dxfattribs={'layer': 'A-MURO'})

# Columnas de fachada norte
for x in [30, 111.5, 213.5, 334.5, 420, 545, 647.5, 761.5, 874, 1003, 1133]:
    pts = [W(x - 2.6, 102.9), W(x + 2.6, 102.9), W(x + 2.6, 108.1), W(x - 2.6, 108.1)]
    add_hatch(msp, pts, (90, 97, 105), 'A-COLUMNA')
    msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': 'A-COLUMNA'})

# 4. Ventanas
for _, wnd, t in win_boxes:
    a, b, at = wnd['a'], wnd['b'], wnd['at']
    if wnd['dir'] == 'h':
        msp.add_lwpolyline([W(a, at - t / 2), W(b, at - t / 2), W(b, at + t / 2), W(a, at + t / 2)], close=True, dxfattribs={'layer': 'A-VENTANA'})
        for o in (-0.45, 0.45):
            msp.add_line(W(a, at + o), W(b, at + o), dxfattribs={'layer': 'A-VENTANA'})
    else:
        msp.add_lwpolyline([W(at - t / 2, a), W(at + t / 2, a), W(at + t / 2, b), W(at - t / 2, b)], close=True, dxfattribs={'layer': 'A-VENTANA'})
        for o in (-0.45, 0.45):
            msp.add_line(W(at + o, a), W(at + o, b), dxfattribs={'layer': 'A-VENTANA'})

# 5. Límites discontinuos (zona de limpieza, borde del andén)
msp.add_lwpolyline([W(377, 14), W(443, 14), W(443, 103)], dxfattribs={'layer': 'A-LIMITE', 'ltscale': 0.4})
msp.add_lwpolyline([W(1023, 363), W(1133, 363), W(1133, 305.5)], dxfattribs={'layer': 'A-LIMITE', 'ltscale': 0.4})

# 6. Puertas (hoja + arco real)
def door_leaves(d):
    out = []
    s = d['side']

    def single(hinge_at, latch_at):
        ln = abs(latch_at - hinge_at)
        if d['dir'] == 'h':
            hx, hy = hinge_at, d['at']
            out.append(((hx, hy), (hx, hy + s * ln), (latch_at, d['at'])))
        else:
            hx, hy = d['at'], hinge_at
            out.append(((hx, hy), (hx + s * ln, hy), (d['at'], latch_at)))

    t = d.get('type')
    if t in ('doble', 'vaiven'):
        m = (d['a'] + d['b']) / 2
        single(d['a'], m)
        single(d['b'], m)
    elif t != 'enrollable':
        if d.get('hinge') == 'b':
            single(d['b'], d['a'])
        else:
            single(d['a'], d['b'])
    return out


for d in M['doors']:
    if d.get('type') == 'enrollable':
        p1, p2 = ((d['a'], d['at']), (d['b'], d['at'])) if d['dir'] == 'h' else ((d['at'], d['a']), (d['at'], d['b']))
        msp.add_line(W(*p1), W(*p2), dxfattribs={'layer': 'A-PUERTA', 'linetype': 'DASHED', 'ltscale': 0.1})
        for (x, y) in (p1, p2):
            pts = [W(x - 1.1, y - 1.1), W(x + 1.1, y - 1.1), W(x + 1.1, y + 1.1), W(x - 1.1, y + 1.1)]
            msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': 'A-PUERTA'})
        continue
    for hinge, tip, latch in door_leaves(d):
        H0, T0, E0 = W(*hinge), W(*tip), W(*latch)
        msp.add_lwpolyline([H0, T0], dxfattribs={'layer': 'A-PUERTA', 'const_width': 0.05})
        r = math.dist(H0, T0)
        a1 = math.degrees(math.atan2(T0[1] - H0[1], T0[0] - H0[0])) % 360
        a2 = math.degrees(math.atan2(E0[1] - H0[1], E0[0] - H0[0])) % 360
        start, end = (a1, a2) if (a2 - a1) % 360 <= 180 else (a2, a1)
        msp.add_arc(H0, r, start, end, dxfattribs={'layer': 'A-PUERTA', 'lineweight': 13})

# 7. Equipos como bloques con atributos
def safe(n):
    return re.sub(r'[<>/\\":;?*|=`,\s]+', '_', n).strip('_')


used = Counter()
ATTRS = [('TAG', 'Tag'), ('NOMBRE', 'Nombre'), ('AREA', 'Área'), ('FUNCION', 'Función'), ('CONFIANZA', 'Identificación')]
for e in M['equipment']:
    items = data['blocks'].get(e['id'])
    if not items:
        continue
    base = safe('EQ_' + (e.get('tag') or e['id']))
    used[base] += 1
    name = base if used[base] == 1 else f"{base}_{used[base]}"
    blk = doc.blocks.new(name=name, dxfattribs={'description': e['name']})
    emit_items(blk, items, L, 'M-EQUIPO', 'M-EQUIPO-RELLENO', 'M-EQUIPO-NOTAS')
    for i, (tag, prompt) in enumerate(ATTRS):
        blk.add_attdef(tag, insert=(0, -0.25 * i), dxfattribs={
            'height': 0.15, 'layer': 'G-ETIQUETA', 'prompt': prompt, 'flags': ezdxf.const.ATTRIB_INVISIBLE, 'style': 'PLANO',
        })
    ref = msp.add_blockref(name, W(e['x'], e['y']), dxfattribs={'layer': 'M-EQUIPO', 'rotation': -(e.get('rot') or 0)})
    ref.add_auto_attribs({
        'TAG': e.get('tag') or '',
        'NOMBRE': e['name'],
        'AREA': M['areaNames'].get(e['room'], e['room']),
        'FUNCION': e['funcion'],
        'CONFIANZA': e['confianza'],
    })

# 8. Tuberías y ductos físicos
BODY = {'acero': (201, 208, 215), 'ducto': (223, 228, 233), 'canal': (233, 237, 240)}
for pr in M['pipes']:
    ls = LineString(pr['pts'])
    poly = ls.buffer(pr['d'] / 2, cap_style='flat', join_style='round' if pr['kind'] == 'acero' else 'mitre')
    ext = [W(*c) for c in list(poly.exterior.coords)[:-1]]
    add_hatch(msp, ext, BODY[pr['kind']], 'M-TUBERIA-RELLENO')
    msp.add_lwpolyline(ext, close=True, dxfattribs={'layer': 'M-TUBERIA'})
    if pr['kind'] == 'ducto':
        msp.add_lwpolyline([W(*q) for q in pr['pts']], dxfattribs={'layer': 'M-TUBERIA', 'linetype': 'CENTER', 'ltscale': 0.25, 'lineweight': 9})
    for v in pr.get('valves') or []:
        (vx, vy), rot, s = v['at'], math.radians(v['rot']), pr['d'] * 1.3
        h = s * 0.55

        def R(px_, py_):
            return W(vx + px_ * math.cos(rot) - py_ * math.sin(rot), vy + px_ * math.sin(rot) + py_ * math.cos(rot))

        bow = [R(-s / 2, -h), R(s / 2, h), R(s / 2, -h), R(-s / 2, h)]
        add_hatch(msp, bow, (255, 255, 255), 'M-TUBERIA-RELLENO')
        msp.add_lwpolyline(bow, close=True, dxfattribs={'layer': 'M-TUBERIA'})
        msp.add_line(R(0, 0), R(0, -h * 1.7), dxfattribs={'layer': 'M-TUBERIA'})
        msp.add_lwpolyline([R(s * 0.45 * math.cos(a), -h * 1.7 + s * 0.16 * math.sin(a)) for a in [i * math.pi / 12 for i in range(24)]],
                           close=True, dxfattribs={'layer': 'M-TUBERIA', 'true_color': dxfcolors.rgb2int((192, 57, 43))})
# cuello de cisne del ducto de humedad y compuerta
arc_pts = [(829.6, 92), (829.6, 88)] + [(834 - 4.4 * math.cos(a), 88 - 4.4 * math.sin(a)) for a in [i * math.pi / 16 for i in range(1, 16)]] + [(838.4, 88), (838.4, 92)]
gn = LineString(arc_pts).buffer(3.5, cap_style='flat', join_style='round')
ext = [W(*c) for c in list(gn.exterior.coords)[:-1]]
add_hatch(msp, ext, BODY['ducto'], 'M-TUBERIA-RELLENO')
msp.add_lwpolyline(ext, close=True, dxfattribs={'layer': 'M-TUBERIA'})
msp.add_circle(W(861, 151), 0.26, dxfattribs={'layer': 'M-TUBERIA'})
msp.add_line(W(859, 153), W(863, 149), dxfattribs={'layer': 'M-TUBERIA'})

# 9. Redes (polilíneas + flechas de sentido)
ARROW_LEN, ARROW_HALF = 6.0, 2.6


def arrow(tip, frm, layer, scale=1.0, attrs=None):
    ang = math.atan2(tip[1] - frm[1], tip[0] - frm[0])
    ln, hw = ARROW_LEN * scale, ARROW_HALF * scale
    bx, by = tip[0] - ln * math.cos(ang), tip[1] - ln * math.sin(ang)
    nx, ny = -math.sin(ang) * hw, math.cos(ang) * hw
    msp.add_solid([W(*tip), W(bx + nx, by + ny), W(bx - nx, by - ny)], dxfattribs={'layer': layer, **(attrs or {})})


def shorten(pts, at_end, d):
    pts = [list(p) for p in pts]
    a, b = (pts[-1], pts[-2]) if at_end else (pts[0], pts[1])
    ln = math.dist(a, b)
    if ln > 1e-6:
        t = min(d, ln * 0.9) / ln
        a[0] -= (a[0] - b[0]) * t
        a[1] -= (a[1] - b[1]) * t
    return pts


for n in M['networks']:
    layer = NET_LAYER[n['layer']]
    attrs = {}
    if n.get('style') == 'lavado':
        attrs['true_color'] = dxfcolors.rgb2int(hexrgb('#2167c4'))
    elif n.get('style') == 'etanol':
        attrs['true_color'] = dxfcolors.rgb2int(hexrgb('#3a9d4a'))
    pts = n['pts']
    line = pts
    if n.get('arrowEnd'):
        line = shorten(line, True, ARROW_LEN * 0.8)
    if n.get('arrowStart'):
        line = shorten(line, False, ARROW_LEN * 0.8)
    la = dict(attrs, layer=layer)
    if n.get('style') == 'etanol':
        la.update(linetype='DASHED', ltscale=0.3)
    msp.add_lwpolyline([W(*q) for q in line], dxfattribs=la)
    if n.get('arrowEnd'):
        arrow(pts[-1], pts[-2], layer, attrs=attrs)
    if n.get('arrowStart'):
        arrow(pts[0], pts[1], layer, attrs=attrs)
    if n.get('midArrows'):
        for a, b in zip(pts, pts[1:]):
            seg = math.dist(a, b)
            s = 60.0
            while s < seg - 30:
                t = s / seg
                arrow((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), a, layer, 0.7, attrs)
                s += 60.0
# nodos de derivación de agua potable y sumidero
for x, y in [(72, 338), (162, 338), (258, 338), (684, 338), (314, 473), (351, 473), (389, 473)]:
    add_hatch(msp, None, hexrgb('#3aa84f'), 'P-AGUA-POTABLE', circle=(W(x, y), 0.12))
msp.add_circle(W(217, 313.5), 0.22, dxfattribs={'layer': 'P-PROCESO'})
msp.add_line(W(215.6, 313.5), W(218.4, 313.5), dxfattribs={'layer': 'P-PROCESO'})
msp.add_line(W(217, 312.1), W(217, 314.9), dxfattribs={'layer': 'P-PROCESO'})

# 10. Señalización
emit_items(msp, data['layers']['senalizacion'], W, 'G-SENALIZACION', 'G-SENALIZACION', 'G-SENALIZACION')

# 11. Rótulos
CAP = 0.716  # altura de mayúsculas / cuerpo de letra


def mtext(txt, x, y, size, layer, attach, bold=True, rot=0, rgb=None, wf=0.86):
    attrs = {'layer': layer, 'style': 'PLANO_N' if bold else 'PLANO', 'char_height': round(size * CAP * S, 4),
             'rotation': -rot, 'line_spacing_factor': 0.9}
    if rgb:
        attrs['true_color'] = dxfcolors.rgb2int(rgb)
    mt = msp.add_mtext(f'\\W{wf};' + txt, dxfattribs=attrs)
    mt.set_location(W(x, y), attachment_point=attach)
    return mt


for r in M['rooms']:
    if r.get('hideTitle'):
        continue
    cfg = M['titleLines'].get(r['id']) or {'lines': [r['name'].upper()]}
    s = cfg.get('size') or 7.3
    body = '\\P'.join(cfg['lines'])
    if cfg.get('sub'):
        body += '\\P' + '\\P'.join(f'{{\\H0.78x;{x}}}' for x in cfg['sub'])
    x, y = r['label']
    mtext(body, x, y - 0.366 * s, s, 'A-AREA-NOMBRE', MTextEntityAlignment.TOP_CENTER,
          rgb=(138, 147, 156) if r['id'] == 'local-e' else None)

for t in M['labels']:
    rgb = None
    c = t.get('color')
    if c:
        hx = VAR_COLORS.get(c, c if c.startswith('#') else None)
        rgb = hexrgb(hx) if hx else None
    layer = NET_LAYER.get(t.get('layer'), 'G-TEXTO')
    attach = MTextEntityAlignment.MIDDLE_LEFT if t.get('anchor') == 'start' else MTextEntityAlignment.MIDDLE_CENTER
    mtext('\\P'.join(t['text']), t['x'], t['y'], t['size'], layer, attach, bold=(t.get('weight') or 600) >= 600, rot=t.get('rotate') or 0, rgb=rgb)

# Tags de equipos
TAG_SIZE = 2.6
for e in M['equipment']:
    pos = M['tagPos'].get(e['id'])
    if not pos:
        continue
    lines = []
    if e['id'] in M['short']:
        lines = [M['short'][e['id']][i] for i in range(len(M['short'][e['id']]))]
        body = '\\P'.join(lines)
    else:
        parts = []
        if e.get('tag'):
            parts.append(e['tag'])
        if pos.get('name'):
            parts.append(f"{{\\fArial|b0;\\H0.82x;{e['name']}}}")
        body = '\\P'.join(parts)
    if not body:
        continue
    anchor = pos.get('anchor') or 'middle'
    attach = {'start': MTextEntityAlignment.TOP_LEFT, 'end': MTextEntityAlignment.TOP_RIGHT}.get(anchor, MTextEntityAlignment.TOP_CENTER)
    mtext(body, pos['x'], pos['y'] - 0.01 * TAG_SIZE, TAG_SIZE, 'G-ETIQUETA', attach)

# 12. Lámina: marco, leyenda y cajetín
SW = M['sheet']['w']
for inset, lw in ((4, 70), (6.5, 25)):
    msp.add_lwpolyline([W(inset, inset), W(SW - inset, inset), W(SW - inset, H - inset), W(inset, H - inset)], close=True,
                       dxfattribs={'layer': 'A-LAMINA', 'lineweight': lw})
lg = (1033, 470, 110, 95)
msp.add_lwpolyline([W(lg[0], lg[1]), W(lg[0] + lg[2], lg[1]), W(lg[0] + lg[2], lg[1] + lg[3]), W(lg[0], lg[1] + lg[3])], close=True, dxfattribs={'layer': 'A-LAMINA'})
msp.add_line(W(lg[0], lg[1] + 15), W(lg[0] + lg[2], lg[1] + 15), dxfattribs={'layer': 'A-LAMINA'})
mtext('LEYENDA', lg[0] + lg[2] / 2, lg[1] + 8, 5.6, 'A-LAMINA', MTextEntityAlignment.MIDDLE_CENTER)
for i, (label, layer, has_arrow) in enumerate([
    ('Tubería de agua potable', 'P-AGUA-POTABLE', False), ('Tránsito de personal', 'P-PERSONAL', True),
    ('Flujo de proceso', 'P-PROCESO', True), ('Flujo de residuos', 'P-RESIDUOS', True),
]):
    yy = lg[1] + 26 + i * 18
    msp.add_lwpolyline([W(lg[0] + 6, yy), W(lg[0] + (22 if has_arrow else 26), yy)], dxfattribs={'layer': layer, 'const_width': 0.16})
    if has_arrow:
        arrow((lg[0] + 27, yy), (lg[0] + 6, yy), layer, 0.9)
    mtext(label, lg[0] + 32, yy, 4.2, 'A-LAMINA', MTextEntityAlignment.MIDDLE_LEFT, bold=False)
tb = (956, 571, 192, 67)
for ins in (0, 3):
    msp.add_lwpolyline([W(tb[0] + ins, tb[1] + ins), W(tb[0] + tb[2] - ins, tb[1] + ins), W(tb[0] + tb[2] - ins, tb[1] + tb[3] - ins),
                        W(tb[0] + ins, tb[1] + tb[3] - ins)], close=True, dxfattribs={'layer': 'A-LAMINA'})
msp.add_line(W(tb[0] + 3, tb[1] + 30), W(tb[0] + tb[2] - 3, tb[1] + 30), dxfattribs={'layer': 'A-LAMINA'})
msp.add_line(W(tb[0] + 3, tb[1] + 50), W(tb[0] + tb[2] - 3, tb[1] + 50), dxfattribs={'layer': 'A-LAMINA'})
mtext('PLANTA DE EXTRACCIÓN\\PDE PECTINA CÍTRICA', tb[0] + tb[2] / 2, tb[1] + 16, 7.4, 'A-LAMINA', MTextEntityAlignment.MIDDLE_CENTER)
mtext('Autoría', tb[0] + 6, tb[1] + 36, 3.8, 'A-LAMINA', MTextEntityAlignment.MIDDLE_LEFT, bold=False)
for i, line in enumerate(['Reconstrucción vectorial 2D de la referencia · Unidades: metros (escala estimada 1 px de referencia = 0,10 m)',
                          'Planta general · Hoja 1/1']):
    t = msp.add_text(line, dxfattribs={'layer': 'A-LAMINA', 'style': 'PLANO', 'height': round(3.0 * CAP * S, 4), 'width': 0.8})
    t.set_placement(W(tb[0] + 6, tb[1] + 56 + i * 5))

# ---------------------------------------------------------------------------
# Comprobación, guardado y vista previa
# ---------------------------------------------------------------------------
doc.header['$EXTMIN'] = (0, 0, 0)
doc.header['$EXTMAX'] = (SW * S, H * S, 0)
doc.set_modelspace_vport(height=H * S * 1.05, center=(SW * S / 2, H * S / 2))
auditor = doc.audit()
doc.saveas(OUT, encoding='utf-8')

counts = Counter(e.dxftype() for e in msp)
print('DXF:', OUT)
print('entidades en modelo:', sum(counts.values()), dict(counts.most_common(8)))
print('bloques de equipo:', sum(1 for b in doc.blocks if b.name.startswith('EQ_')))
print('capas:', len(doc.layers))
print('auditoría: errores', len(auditor.errors), '· corregidos', len(auditor.fixes))

if PREVIEW:
    import matplotlib
    matplotlib.use('Agg')
    from ezdxf.addons.drawing import matplotlib as mpl_draw
    re_doc = ezdxf.readfile(OUT)
    mpl_draw.qsave(re_doc.modelspace(), PREVIEW, bg='#FFFFFF', dpi=260, size_inches=(23, 13))
    print('vista previa:', PREVIEW)
