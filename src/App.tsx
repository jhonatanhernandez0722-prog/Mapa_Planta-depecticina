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
import { Guide, guideAlreadySeen } from './ui/Guide';
import { Icon } from './ui/Icon';

function useMedia(query: string) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

function useWindowHeight() {
  const [h, setH] = useState(window.innerHeight);
  useEffect(() => {
    const on = () => setH(window.innerHeight);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return h;
}

/** Fracción de la altura que ocupa el panel de información en móvil. */
const SHEET_FRACTION = 0.5;

export default function App() {
  const controller = useRef<PlanController | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const mobile = useMedia('(max-width: 760px)');
  const touch = useMedia('(pointer: coarse)');
  const winH = useWindowHeight();
  const [selection, setSelection] = useState<Selection>(null);
  const [hidden, setHidden] = useState<Set<LayerId>>(() => new Set());
  const [tab, setTab] = useState<'areas' | 'capas'>('areas');
  const [grid, setGrid] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guide, setGuide] = useState(() => !guideAlreadySeen());
  const [interacted, setInteracted] = useState(false);

  const select = useCallback((s: Selection) => setSelection(s), []);

  const goTo = useCallback(
    (s: Selection) => {
      setSelection(s);
      if (mobile) setMenuOpen(false);
      // En móvil el panel inferior tapa media pantalla: se encuadra en la mitad visible.
      controller.current?.setBottomInset(mobile && s ? Math.round(window.innerHeight * SHEET_FRACTION) : 0);
      if (s?.type === 'equip') controller.current?.focusEquip(s.id);
      else if (s?.type === 'room') controller.current?.focusRoom(s.id);
    },
    [mobile],
  );

  const pick = useCallback((h: SearchHit) => goTo({ type: h.type, id: h.id }), [goTo]);

  // El aviso de uso desaparece tras la primera interacción con el plano.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || interacted) return;
    const done = () => setInteracted(true);
    el.addEventListener('wheel', done, { passive: true });
    el.addEventListener('pointerdown', done);
    return () => {
      el.removeEventListener('wheel', done);
      el.removeEventListener('pointerdown', done);
    };
  }, [interacted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || e.key === '/') {
        e.preventDefault();
        if (mobile) setMenuOpen(true);
        searchRef.current?.focus();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const c = controller.current;
      if (!c) return;
      if (e.key === 'f' || e.key === 'F' || e.key === 'Home') c.fit();
      else if (e.key === '+' || e.key === '=') c.zoomBy(1.6);
      else if (e.key === '-' || e.key === '_') c.zoomBy(1 / 1.6);
      else if (e.key === 'Escape') {
        setSelection(null);
        setMenuOpen(false);
        setGuide(false);
      } else if (['1', '2', '3', '4'].includes(e.key)) c.zoomToLod(+e.key as Lod);
      else if (e.key === 'g' || e.key === 'G') setGrid((g) => !g);
      else if (e.key === '?') setGuide((h) => !h);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobile]);

  const selectionLabel =
    selection?.type === 'equip'
      ? `Selección: ${EQUIP_BY_ID[selection.id]?.tag ?? ''} ${EQUIP_BY_ID[selection.id]?.name ?? ''}`.trim()
      : selection?.type === 'room'
        ? `Selección: ${ROOM_BY_ID[selection.id]?.name}`
        : 'Sin selección';

  const bottomInset = mobile && selection ? Math.round(winH * SHEET_FRACTION) : 0;

  return (
    <div className={`app ${selection ? 'with-info' : ''} ${mobile ? 'is-mobile' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <header className="toolbar">
        <button
          className="icon-btn menu-btn"
          onClick={() => setMenuOpen((m) => !m)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú: buscar, áreas y capas'}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
        </button>
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
        <div className="tb-sep hide-mobile" />
        <div className="tb-group">
          <button className="icon-btn" onClick={() => controller.current?.fit()} title="Ver toda la planta (F)" aria-label="Ver toda la planta">
            <Icon name="fit" />
          </button>
          <button className="icon-btn" onClick={() => controller.current?.zoomBy(1 / 1.6)} title="Alejar (−)" aria-label="Alejar">
            <Icon name="minus" />
          </button>
          <ZoomReadout />
          <button className="icon-btn" onClick={() => controller.current?.zoomBy(1.6)} title="Acercar (+)" aria-label="Acercar">
            <Icon name="plus" />
          </button>
        </div>
        <div className="tb-sep hide-mobile" />
        <LodIndicator controller={controller} />
        <div className="tb-grow" />
        <div className="tb-group">
          <button className={`help-btn ${guide ? 'on' : ''}`} onClick={() => setGuide((g) => !g)} title="Cómo usar el plano (?)">
            <Icon name="help" size={17} />
            <span>Cómo usar</span>
          </button>
          <button className={`icon-btn hide-mobile ${grid ? 'on' : ''}`} onClick={() => setGrid((g) => !g)} title="Rejilla de referencia (G)" aria-pressed={grid}>
            <Icon name="grid" />
          </button>
          <button className={`icon-btn hide-mobile ${minimap ? 'on' : ''}`} onClick={() => setMinimap((m) => !m)} title="Minimapa" aria-pressed={minimap}>
            <Icon name="map" />
          </button>
        </div>
      </header>

      {mobile && menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      <nav className="sidebar" aria-label="Navegación del plano">
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
              onSelectRoom={(id) => goTo({ type: 'room', id })}
              onSelectEquip={(id) => goTo({ type: 'equip', id })}
            />
          ) : (
            <LayerPanel hidden={hidden} setHidden={setHidden} />
          )}
        </div>
      </nav>

      <main className="canvas" ref={canvasRef}>
        <Plan hidden={hidden} selection={selection} onSelect={select} controller={controller} grid={grid} bottomInset={bottomInset} />
        <ScaleBar />
        {minimap && !mobile && <Minimap controller={controller} />}
        {!interacted && !guide && (
          <div className="usage-hint" role="note">
            <Icon name={touch ? 'hand' : 'info'} size={18} />
            <span>
              {touch ? (
                <>
                  <b>Pellizca</b> para acercar · <b>Arrastra</b> para moverte · <b>Toca</b> un equipo para ver su información
                </>
              ) : (
                <>
                  <b>Rueda del ratón</b>: acercar/alejar · <b>Arrastrar</b>: moverse · <b>Clic</b>: ver información · <b>Doble clic</b>: entrar al área
                </>
              )}
            </span>
            <button className="hint-more" onClick={() => setGuide(true)}>
              Ver guía
            </button>
          </div>
        )}
      </main>

      {selection && (
        <InfoPanel sel={selection} onClose={() => setSelection(null)} onSelect={goTo} controller={controller} />
      )}

      <StatusBar selectionLabel={selectionLabel} />

      {guide && <Guide touch={touch} onClose={() => setGuide(false)} />}
    </div>
  );
}
