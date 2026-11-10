import { ROOM_BY_ID } from '../model/architecture';
import { EQUIPMENT, EQUIP_BY_ID } from '../model/equipment';
import { CATEGORY_LABEL, KIND_LABEL, areaName, connectionsOf, polyArea } from '../model/catalog';
import { METERS_PER_UNIT } from '../engine/camera';
import type { Selection } from '../render/Overlays';
import type { PlanController } from '../render/Plan';
import { Icon } from './Icon';

const CONF_TXT = {
  alta: 'Identificación alta',
  media: 'Identificación media',
  baja: 'Aproximación',
};

const fmt = (v: number, d = 1) => v.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d });

export function InfoPanel({
  sel, onClose, onSelect, controller,
}: {
  sel: Selection;
  onClose: () => void;
  onSelect: (s: Selection) => void;
  controller: React.MutableRefObject<PlanController | null>;
}) {
  if (!sel) return null;

  if (sel.type === 'room') {
    const r = ROOM_BY_ID[sel.id];
    if (!r) return null;
    const eq = EQUIPMENT.filter((e) => e.room === r.id);
    const area = polyArea(r.poly) * METERS_PER_UNIT * METERS_PER_UNIT;
    return (
      <aside className="info" key={`r-${r.id}`}>
        <header className="info-head">
          <div>
            <div className="info-kicker">
              <span className={`dot cat-${r.category}`} /> Área · {CATEGORY_LABEL[r.category]}
            </div>
            <h2>{r.name}</h2>
            {r.sub && <div className="info-sub">{r.sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar panel">
            <Icon name="close" />
          </button>
        </header>
        <div className="info-body">
          <p className="info-desc">{r.descripcion}</p>
          <dl className="kv">
            <dt>Superficie en planta</dt>
            <dd className="mono">≈ {fmt(area, 0)} m² <span className="dim">(escala estimada)</span></dd>
            <dt>Equipos</dt>
            <dd className="mono">{eq.length}</dd>
            {r.rotulo && (
              <>
                <dt>Rótulo en la referencia</dt>
                <dd className="quote">«{r.rotulo}»</dd>
              </>
            )}
          </dl>
          {r.nota && (
            <div className="note">
              <Icon name="info" /> <span>{r.nota}</span>
            </div>
          )}
          {eq.length > 0 && (
            <>
              <h3>Equipamiento</h3>
              <ul className="eq-list">
                {eq.map((e) => (
                  <li key={e.id}>
                    <button onClick={() => onSelect({ type: 'equip', id: e.id })}>
                      {e.tag ? <span className="mono ti-tag">{e.tag}</span> : <span className="ti-tag ghost">·</span>}
                      <span>{e.name}</span>
                      <Icon name="chevron" size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <footer className="info-actions">
          <button className="btn" onClick={() => controller.current?.focusRoom(r.id)}>
            <Icon name="fit" /> Encuadrar área
          </button>
        </footer>
      </aside>
    );
  }

  const e = EQUIP_BY_ID[sel.id];
  if (!e) return null;
  const conns = connectionsOf(e);
  return (
    <aside className="info" key={`e-${e.id}`}>
      <header className="info-head">
        <div>
          <div className="info-kicker">Equipo · {KIND_LABEL[e.kind]}</div>
          <h2>
            {e.tag && <span className="mono info-tag">{e.tag}</span>}
            {e.name}
          </h2>
          <button className="area-link" onClick={() => e.room !== 'exterior' && onSelect({ type: 'room', id: e.room })}>
            <Icon name="area" size={13} /> {areaName(e.room)}
          </button>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Cerrar panel">
          <Icon name="close" />
        </button>
      </header>
      <div className="info-body">
        <div className={`conf conf-${e.confianza}`} title="Grado de certeza de la identificación a partir de la referencia">
          <span className="conf-bars">
            <i />
            <i />
            <i />
          </span>
          {CONF_TXT[e.confianza]}
        </div>
        <h3>Descripción</h3>
        <p className="info-desc">{e.descripcion}</p>
        <h3>Función</h3>
        <p className="info-desc">{e.funcion}</p>
        <dl className="kv">
          {e.rotulo && (
            <>
              <dt>Rótulo en la referencia</dt>
              <dd className="quote">«{e.rotulo}»</dd>
            </>
          )}
          {e.datos?.map(([k, v]) => (
            <FragmentKV key={k} k={k} v={v} />
          ))}
          <dt>Posición en plano</dt>
          <dd className="mono">
            X {fmt(e.x)} · Y {fmt(e.y)} u
          </dd>
          <dt>Huella en plano</dt>
          <dd className="mono">
            ≈ {fmt(e.w * METERS_PER_UNIT)} × {fmt(e.h * METERS_PER_UNIT)} m <span className="dim">(escala estimada)</span>
          </dd>
        </dl>
        {e.nota && (
          <div className="note">
            <Icon name="info" /> <span>{e.nota}</span>
          </div>
        )}
        {conns.length > 0 && (
          <>
            <h3>Conexiones dibujadas</h3>
            <ul className="conn-list">
              {conns.map((c) => (
                <li key={c.id}>
                  <span className="conn-sw" style={{ background: c.color }} />
                  {c.name}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="fineprint">Especificaciones técnicas no indicadas en la referencia: no se muestran.</p>
      </div>
      <footer className="info-actions">
        <button className="btn" onClick={() => controller.current?.focusEquip(e.id)}>
          <Icon name="target" /> Centrar
        </button>
        <button
          className="btn"
          onClick={() => {
            const m = Math.max(e.w, e.h) * 0.25 + 4;
            controller.current?.zoomToBox({ x: e.x - e.w / 2 - m, y: e.y - e.h / 2 - m, w: e.w + 2 * m, h: e.h + 2 * m });
          }}
        >
          <Icon name="zoomIn" /> Ver en detalle
        </button>
      </footer>
    </aside>
  );
}

function FragmentKV({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}
