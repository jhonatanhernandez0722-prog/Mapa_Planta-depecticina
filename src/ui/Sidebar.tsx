import { useEffect, useMemo, useRef, useState } from 'react';
import { ROOM_BY_ID, ZONE_GROUPS } from '../model/architecture';
import { EQUIPMENT } from '../model/equipment';
import { LAYERS, search, type SearchHit } from '../model/catalog';
import type { LayerId } from '../model/types';
import type { Selection } from '../render/Overlays';
import { Icon } from './Icon';

/* ---------------- Búsqueda ---------------- */
export function SearchBox({
  onPick, inputRef,
}: {
  onPick: (h: SearchHit) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const hits = useMemo(() => search(q), [q]);
  useEffect(() => setIdx(0), [q]);
  const pick = (h: SearchHit) => {
    onPick(h);
    setOpen(false);
    inputRef.current?.blur();
  };
  return (
    <div className="search">
      <div className="search-field">
        <Icon name="search" />
        <input
          ref={inputRef}
          value={q}
          placeholder="Buscar equipo, tag o área…"
          spellCheck={false}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIdx((i) => Math.min(hits.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIdx((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter' && hits[idx]) pick(hits[idx]);
            else if (e.key === 'Escape') {
              setQ('');
              inputRef.current?.blur();
            }
          }}
          aria-label="Buscar en el plano"
        />
        <kbd>/</kbd>
      </div>
      {open && q && (
        <div className="search-results" role="listbox">
          {hits.length === 0 && <div className="sr-empty">Sin resultados para «{q}»</div>}
          {hits.map((h, i) => (
            <button
              key={`${h.type}-${h.id}`}
              className={`sr-item ${i === idx ? 'on' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(h);
              }}
              onMouseEnter={() => setIdx(i)}
              role="option"
              aria-selected={i === idx}
            >
              <span className={`sr-kind ${h.type}`}>{h.type === 'room' ? 'ÁREA' : 'EQUIPO'}</span>
              <span className="sr-main">
                <span className="sr-title">
                  {h.tag && <span className="mono sr-tag">{h.tag}</span>}
                  {h.title}
                </span>
                <span className="sr-sub">{h.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Árbol de áreas ---------------- */
export function AreaTree({
  selection, onSelectRoom, onSelectEquip,
}: {
  selection: Selection;
  onSelectRoom: (id: string) => void;
  onSelectEquip: (id: string) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(['Proceso']));
  const selRoom =
    selection?.type === 'room' ? selection.id : selection?.type === 'equip' ? EQUIPMENT.find((e) => e.id === selection.id)?.room : undefined;
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selRoom) {
      const g = ZONE_GROUPS.find((z) => z.rooms.includes(selRoom));
      if (g && !open.has(g.name)) setOpen((s) => new Set(s).add(g.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selRoom]);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selection]);

  return (
    <div className="tree">
      {ZONE_GROUPS.map((g) => {
        const isOpen = open.has(g.name);
        return (
          <div key={g.name} className="tree-group">
            <button
              className={`tree-gh ${isOpen ? 'open' : ''}`}
              onClick={() =>
                setOpen((s) => {
                  const n = new Set(s);
                  if (n.has(g.name)) n.delete(g.name);
                  else n.add(g.name);
                  return n;
                })
              }
            >
              <Icon name="chevron" size={13} />
              <span>{g.name}</span>
              <span className="count">{g.rooms.length}</span>
            </button>
            {isOpen &&
              g.rooms.map((rid) => {
                const r = ROOM_BY_ID[rid];
                const eq = EQUIPMENT.filter((e) => e.room === rid && e.kind !== 'mesadaLab');
                const on = selection?.type === 'room' && selection.id === rid;
                return (
                  <div key={rid} className="tree-room">
                    <button
                      ref={on ? activeRef : undefined}
                      className={`tree-item room ${on ? 'on' : ''} ${selRoom === rid ? 'ctx' : ''}`}
                      onClick={() => onSelectRoom(rid)}
                      title="Clic: seleccionar y encuadrar"
                    >
                      <span className={`dot cat-${r.category}`} />
                      <span className="ti-name">{r.name}</span>
                      {eq.length > 0 && <span className="count">{eq.length}</span>}
                    </button>
                    {selRoom === rid &&
                      eq.map((e) => {
                        const eon = selection?.type === 'equip' && selection.id === e.id;
                        return (
                          <button
                            key={e.id}
                            ref={eon ? activeRef : undefined}
                            className={`tree-item equip ${eon ? 'on' : ''}`}
                            onClick={() => onSelectEquip(e.id)}
                          >
                            {e.tag ? <span className="mono ti-tag">{e.tag}</span> : <span className="ti-tag ghost">·</span>}
                            <span className="ti-name">{e.name}</span>
                          </button>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        );
      })}
      {/* Exterior: tanques sin sala */}
      <div className="tree-group">
        <div className="tree-gh static">
          <span>Patio de tanques (exterior)</span>
        </div>
        {EQUIPMENT.filter((e) => e.room === 'exterior').map((e) => (
          <button
            key={e.id}
            className={`tree-item equip ${selection?.type === 'equip' && selection.id === e.id ? 'on' : ''}`}
            onClick={() => onSelectEquip(e.id)}
          >
            <span className="ti-tag ghost">·</span>
            <span className="ti-name">{e.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Capas ---------------- */
export function LayerPanel({
  hidden, setHidden,
}: {
  hidden: Set<LayerId>;
  setHidden: React.Dispatch<React.SetStateAction<Set<LayerId>>>;
}) {
  const toggle = (id: LayerId) =>
    setHidden((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const solo = (id: LayerId) => {
    const keep: LayerId[] = ['estructura', 'divisiones', id];
    setHidden(new Set(LAYERS.map((l) => l.id).filter((l) => !keep.includes(l))));
  };
  return (
    <div className="layers">
      {LAYERS.map((l, i) => {
        const on = !hidden.has(l.id);
        return (
          <div key={l.id} className={`layer-row ${on ? '' : 'off'}`}>
            <button className="layer-toggle" onClick={() => toggle(l.id)} aria-pressed={on} title={on ? 'Ocultar capa' : 'Mostrar capa'}>
              <span className="layer-num mono">{i + 1}</span>
              <span className={`swatch ${l.kind}`} style={{ ['--sw' as string]: l.swatch }} />
              <span className="layer-name">{l.name}</span>
              <Icon name={on ? 'eye' : 'eyeOff'} size={15} />
            </button>
            <button className="layer-solo" onClick={() => solo(l.id)} title="Aislar esta capa (mantiene la arquitectura)">
              solo
            </button>
          </div>
        );
      })}
      <div className="layer-actions">
        <button onClick={() => setHidden(new Set())}>Mostrar todas</button>
        <button onClick={() => setHidden(new Set(LAYERS.map((l) => l.id).filter((l) => l !== 'estructura')))}>Sólo estructura</button>
      </div>
      <div className="legend-box">
        <div className="legend-title">Leyenda original</div>
        <div className="legend-row"><span className="lg-line" style={{ background: 'var(--c-agua)' }} />Tubería de agua potable</div>
        <div className="legend-row"><span className="lg-arrow" style={{ ['--c' as string]: 'var(--c-personal)' }} />Tránsito de personal</div>
        <div className="legend-row"><span className="lg-arrow" style={{ ['--c' as string]: 'var(--c-proceso)' }} />Flujo de proceso</div>
        <div className="legend-row"><span className="lg-arrow" style={{ ['--c' as string]: 'var(--c-residuos)' }} />Flujo de residuos</div>
        <div className="legend-sep" />
        <div className="legend-row"><span className="lg-line dashed" style={{ background: 'var(--c-etanol)' }} />Línea de etanol (verde en la referencia)</div>
        <div className="legend-row"><span className="lg-line" style={{ background: 'var(--c-lavado)' }} />Agua de lavado / drenaje PTAR</div>
        <div className="legend-row"><span className="lg-line pipe" />Tubería / ducto de proceso</div>
      </div>
    </div>
  );
}
