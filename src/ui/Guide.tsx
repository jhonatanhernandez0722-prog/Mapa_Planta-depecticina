import { useState } from 'react';
import { Icon } from './Icon';

const STORE_KEY = 'plano-guia-v1';

export function guideAlreadySeen() {
  try {
    return localStorage.getItem(STORE_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberGuide() {
  try {
    localStorage.setItem(STORE_KEY, '1');
  } catch {
    /* almacenamiento no disponible: la guía volverá a mostrarse */
  }
}

/* Pictogramas de gestos (ratón / táctil) */
function Gesture({ kind }: { kind: 'wheel' | 'drag' | 'click' | 'dbl' | 'pinch' | 'pan' | 'tap' | 'dtap' }) {
  const mouse = (
    <>
      <rect x="15" y="6" width="18" height="28" rx="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="24" y1="6" x2="24" y2="16" stroke="currentColor" strokeWidth="2" />
    </>
  );
  const finger = <path d="M20 40V22a3 3 0 0 1 6 0v9l7 2a4 4 0 0 1 3 4.5L35 44H21z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
  return (
    <svg className="gesture" viewBox="0 0 48 48" aria-hidden>
      {kind === 'wheel' && (
        <>
          {mouse}
          <rect x="22" y="9" width="4" height="6" rx="2" fill="var(--accent)" />
          <path d="M38 12l3-4 3 4M38 30l3 4 3-4M41 8v26" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {kind === 'drag' && (
        <>
          {mouse}
          <path d="M15 16h9V6a9 9 0 0 0-9 9z" fill="var(--accent)" />
          <path d="M4 40h40M4 40l4-3M4 40l4 3M44 40l-4-3M44 40l-4 3" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {(kind === 'click' || kind === 'dbl') && (
        <>
          {mouse}
          <path d="M15 16h9V6a9 9 0 0 0-9 9z" fill="var(--accent)" />
          <text x="40" y="44" fontSize="12" fontWeight="700" fill="var(--accent)" textAnchor="middle">
            {kind === 'dbl' ? '×2' : '×1'}
          </text>
        </>
      )}
      {kind === 'pinch' && (
        <>
          <path d="M8 8l10 10M40 40L30 30M8 8h6M8 8v6M40 40h-6M40 40v-6" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="18" r="4" fill="currentColor" />
          <circle cx="30" cy="30" r="4" fill="currentColor" />
        </>
      )}
      {kind === 'pan' && (
        <>
          {finger}
          <path d="M4 10h40M4 10l4-3M4 10l4 3M44 10l-4-3M44 10l-4 3" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {(kind === 'tap' || kind === 'dtap') && (
        <>
          {finger}
          <circle cx="23" cy="14" r="6" fill="none" stroke="var(--accent)" strokeWidth="2" />
          {kind === 'dtap' && <circle cx="23" cy="14" r="10" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6" />}
        </>
      )}
    </svg>
  );
}

export function Guide({ touch, onClose }: { touch: boolean; onClose: () => void }) {
  const [dontShow, setDontShow] = useState(true);
  const close = () => {
    if (dontShow) rememberGuide();
    onClose();
  };
  const steps = touch
    ? [
        { g: 'pinch' as const, t: 'Pellizca con dos dedos', d: 'para acercar o alejar el plano.' },
        { g: 'pan' as const, t: 'Arrastra con un dedo', d: 'para moverte por la planta.' },
        { g: 'tap' as const, t: 'Toca un equipo o un área', d: 'para ver su nombre, función y datos.' },
        { g: 'dtap' as const, t: 'Toca dos veces', d: 'para entrar en un área; repite para acercarte más.' },
      ]
    : [
        { g: 'wheel' as const, t: 'Gira la rueda del ratón', d: 'para acercar o alejar. El zoom va hacia donde apunta el cursor.' },
        { g: 'drag' as const, t: 'Mantén pulsado y arrastra', d: 'para moverte por la planta.' },
        { g: 'click' as const, t: 'Haz clic en un equipo o un área', d: 'para ver su nombre, función y datos en el panel derecho.' },
        { g: 'dbl' as const, t: 'Haz doble clic', d: 'para entrar en un área o equipo; repite para acercarte más.' },
      ];
  return (
    <div className="guide-backdrop" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={close}>
      <div className="guide" onClick={(e) => e.stopPropagation()}>
        <header className="guide-head">
          <div>
            <div className="guide-kicker">Guía rápida</div>
            <h2 id="guide-title">Cómo usar el plano</h2>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Cerrar guía">
            <Icon name="close" />
          </button>
        </header>

        <ol className="guide-steps">
          {steps.map((s) => (
            <li key={s.t}>
              <Gesture kind={s.g} />
              <div>
                <strong>{s.t}</strong> {s.d}
              </div>
            </li>
          ))}
        </ol>

        <div className="guide-section">
          <h3>Niveles de detalle</h3>
          <p>
            Cuanto más te acercas, más detalle aparece. Puedes saltar a cada nivel con los botones{' '}
            <span className="chip">N1</span> <span className="chip">N2</span> <span className="chip">N3</span> <span className="chip">N4</span>{' '}
            de la barra superior:
          </p>
          <ul className="guide-levels">
            <li><b>N1</b> toda la planta · <b>N2</b> áreas y puertas · <b>N3</b> máquinas dibujadas · <b>N4</b> piezas, válvulas y pernos</li>
          </ul>
        </div>

        <div className="guide-section">
          <h3>Buscar y filtrar</h3>
          <p>
            {touch ? (
              <>Abre el menú <span className="chip"><Icon name="menu" size={13} /></span> para buscar un equipo (por ejemplo «R-201» o «caldera»), recorrer las áreas o mostrar y ocultar capas como tuberías o etiquetas.</>
            ) : (
              <>Usa el buscador del panel izquierdo (por ejemplo «R-201» o «caldera») para ir directo a un equipo. En la pestaña <b>Capas</b> puedes mostrar u ocultar tuberías, recorridos, etiquetas, etc.</>
            )}
          </p>
        </div>

        {!touch && (
          <div className="guide-section">
            <h3>Atajos de teclado</h3>
            <dl className="guide-keys">
              <dt><kbd>F</kbd></dt><dd>Ver toda la planta</dd>
              <dt><kbd>+</kbd> <kbd>−</kbd></dt><dd>Acercar / alejar</dd>
              <dt><kbd>1</kbd>–<kbd>4</kbd></dt><dd>Ir al nivel N1–N4</dd>
              <dt><kbd>/</kbd></dt><dd>Buscar</dd>
              <dt><kbd>G</kbd></dt><dd>Rejilla</dd>
              <dt><kbd>Esc</kbd></dt><dd>Quitar selección</dd>
            </dl>
          </div>
        )}

        <footer className="guide-foot">
          <label className="guide-check">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
            No volver a mostrar al entrar
          </label>
          <button className="btn primary" onClick={close}>
            Empezar a explorar
          </button>
        </footer>
      </div>
    </div>
  );
}
