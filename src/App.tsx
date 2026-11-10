import { useCallback, useEffect, useRef, useState } from 'react';
import { ROOM_BY_ID } from './model/architecture';
import { EQUIP_BY_ID } from './model/equipment';
import type { SearchHit } from './model/catalog';
import type { LayerId, Lod } from './model/types';
import { Plan, type PlanController } from './render/Plan';
import type { Selection } from './render/Overlays';
import { AreaTree, LayerPanel, SearchBox } from './ui/Sidebar';
import { InfoPanel } from './ui/InfoPanel';
import { LodIndicator, Minimap, ScaleBar, StatusBar, ZoomReadout } from './ui/Hud';
import { Icon } from './ui/Icon';

export default function App() {
  const controller = useRef<PlanController | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [hidden, setHidden] = useState<Set<LayerId>>(() => new Set());
  const [tab, setTab] = useState<'areas' | 'capas'>('areas');
  const [grid, setGrid] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [help, setHelp] = useState(false);

  const select = useCallback((s: Selection) => setSelection(s), []);

  const pick = useCallback((h: SearchHit) => {
    setSelection({ type: h.type, id: h.id });
    if (h.type === 'equip') controller.current?.focusEquip(h.id);
    else controller.current?.focusRoom(h.id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const c = controller.current;
      if (!c) return;
      if (e.key === 'f' || e.key === 'F' || e.key === 'Home') c.fit();
      else if (e.key === '+' || e.key === '=') c.zoomBy(1.6);
      else if (e.key === '-' || e.key === '_') c.zoomBy(1 / 1.6);
      else if (e.key === 'Escape') setSelection(null);
      else if (['1', '2', '3', '4'].includes(e.key)) c.zoomToLod(+e.key as Lod);
      else if (e.key === 'g' || e.key === 'G') setGrid((g) => !g);
      else if (e.key === '?') setHelp((h) => !h);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selectionLabel =
    selection?.type === 'equip'
      ? `Selección: ${EQUIP_BY_ID[selection.id]?.tag ?? ''} ${EQUIP_BY_ID[selection.id]?.name ?? ''}`.trim()
      : selection?.type === 'room'
        ? `Selección: ${ROOM_BY_ID[selection.id]?.name}`
        : 'Sin selección';

  return (
    <div className={`app ${selection ? 'with-info' : ''}`}>
      <header className="toolbar">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <rect x="2.5" y="5" width="19" height="14" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
            <path d="M8 5v14M2.5 11H8M14 11h7.5M14 5v6" stroke="var(--accent)" strokeWidth="1.2" />
            <circle cx="17.5" cy="15.5" r="2" fill="var(--accent)" />
          </svg>
          <div className="brand-txt">
            <strong>Planta de Extracción de Pectina Cítrica</strong>
            <span>Plano general 2D · Reconstrucción vectorial</span>
          </div>
        </div>
        <div className="tb-sep" />
        <div className="tb-group">
          <button className="icon-btn" onClick={() => controller.current?.fit()} title="Ver toda la planta (F)">
            <Icon name="fit" />
          </button>
          <button className="icon-btn" onClick={() => controller.current?.zoomBy(1 / 1.6)} title="Alejar (−)">
            <Icon name="minus" />
          </button>
          <ZoomReadout />
          <button className="icon-btn" onClick={() => controller.current?.zoomBy(1.6)} title="Acercar (+)">
            <Icon name="plus" />
          </button>
        </div>
        <div className="tb-sep" />
        <LodIndicator controller={controller} />
        <div className="tb-grow" />
        <div className="tb-group">
          <button className={`icon-btn ${grid ? 'on' : ''}`} onClick={() => setGrid((g) => !g)} title="Rejilla de referencia (G)" aria-pressed={grid}>
            <Icon name="grid" />
          </button>
          <button className={`icon-btn ${minimap ? 'on' : ''}`} onClick={() => setMinimap((m) => !m)} title="Minimapa" aria-pressed={minimap}>
            <Icon name="map" />
          </button>
          <button className={`icon-btn ${help ? 'on' : ''}`} onClick={() => setHelp((h) => !h)} title="Atajos de teclado (?)" aria-pressed={help}>
            <Icon name="keyboard" />
          </button>
        </div>
      </header>

      <nav className="sidebar">
        <SearchBox onPick={pick} inputRef={searchRef} />
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'areas'} className={tab === 'areas' ? 'on' : ''} onClick={() => setTab('areas')}>
            <Icon name="area" size={14} /> Áreas
          </button>
          <button role="tab" aria-selected={tab === 'capas'} className={tab === 'capas' ? 'on' : ''} onClick={() => setTab('capas')}>
            <Icon name="layers" size={14} /> Capas
            {hidden.size > 0 && <span className="badge">{9 - hidden.size}/9</span>}
          </button>
        </div>
        <div className="side-scroll">
          {tab === 'areas' ? (
            <AreaTree
              selection={selection}
              onSelectRoom={(id) => {
                setSelection({ type: 'room', id });
                controller.current?.focusRoom(id);
              }}
              onSelectEquip={(id) => {
                setSelection({ type: 'equip', id });
                controller.current?.focusEquip(id);
              }}
            />
          ) : (
            <LayerPanel hidden={hidden} setHidden={setHidden} />
          )}
        </div>
      </nav>

      <main className="canvas">
        <Plan hidden={hidden} selection={selection} onSelect={select} controller={controller} grid={grid} />
        <ScaleBar />
        {minimap && <Minimap controller={controller} />}
        <div className="canvas-hint">
          Rueda: zoom al cursor · Arrastrar: desplazar · Doble clic: acercar al área
        </div>
        {help && (
          <div className="help-pop" role="dialog" aria-label="Atajos de teclado">
            <div className="help-head">
              Atajos de teclado
              <button className="icon-btn sm" onClick={() => setHelp(false)} aria-label="Cerrar">
                <Icon name="close" size={14} />
              </button>
            </div>
            <dl>
              <dt><kbd>F</kbd></dt><dd>Ver toda la planta</dd>
              <dt><kbd>+</kbd> <kbd>−</kbd></dt><dd>Acercar / alejar</dd>
              <dt><kbd>1</kbd>–<kbd>4</kbd></dt><dd>Ir al nivel de detalle N1–N4</dd>
              <dt><kbd>/</kbd></dt><dd>Buscar</dd>
              <dt><kbd>G</kbd></dt><dd>Rejilla</dd>
              <dt><kbd>Esc</kbd></dt><dd>Quitar selección</dd>
              <dt>Doble clic</dt><dd>Encuadrar área; repetir para acercar</dd>
            </dl>
          </div>
        )}
      </main>

      {selection && (
        <InfoPanel sel={selection} onClose={() => setSelection(null)} onSelect={(s) => {
          setSelection(s);
          if (s?.type === 'equip') controller.current?.focusEquip(s.id);
          else if (s?.type === 'room') controller.current?.focusRoom(s.id);
        }} controller={controller} />
      )}

      <StatusBar selectionLabel={selectionLabel} />
    </div>
  );
}
