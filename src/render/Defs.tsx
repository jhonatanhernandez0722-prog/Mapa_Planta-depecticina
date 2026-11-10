/**
 * Gradientes y patrones compartidos. Los patrones usan userSpaceOnUse para
 * que la textura escale con el objeto (como un sombreado CAD) y sólo se
 * aplican a partir del nivel 3.
 */
export function Defs() {
  return (
    <defs>
      {/* ---------- Materiales ---------- */}
      <radialGradient id="g-dome" cx="0.38" cy="0.34" r="0.75">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor="#e7ebef" />
        <stop offset="0.8" stopColor="#bcc5ce" />
        <stop offset="1" stopColor="#9aa5b1" />
      </radialGradient>
      <radialGradient id="g-dome-warm" cx="0.38" cy="0.34" r="0.75">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.4" stopColor="#eef0ee" />
        <stop offset="0.85" stopColor="#c9cfcb" />
        <stop offset="1" stopColor="#aab3ae" />
      </radialGradient>
      <radialGradient id="g-dome-dark" cx="0.4" cy="0.36" r="0.8">
        <stop offset="0" stopColor="#8d99a6" />
        <stop offset="0.6" stopColor="#5c6b7a" />
        <stop offset="1" stopColor="#3b4754" />
      </radialGradient>
      <linearGradient id="g-cyl-x" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9ba5b0" />
        <stop offset="0.28" stopColor="#f4f6f8" />
        <stop offset="0.55" stopColor="#d5dbe1" />
        <stop offset="1" stopColor="#8a95a1" />
      </linearGradient>
      <linearGradient id="g-cyl-y" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9ba5b0" />
        <stop offset="0.28" stopColor="#f4f6f8" />
        <stop offset="0.55" stopColor="#d5dbe1" />
        <stop offset="1" stopColor="#8a95a1" />
      </linearGradient>
      <linearGradient id="g-duct-x" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a7b0ba" />
        <stop offset="0.3" stopColor="#f7f8fa" />
        <stop offset="0.6" stopColor="#dde2e7" />
        <stop offset="1" stopColor="#97a2ad" />
      </linearGradient>
      <linearGradient id="g-duct-y" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a7b0ba" />
        <stop offset="0.3" stopColor="#f7f8fa" />
        <stop offset="0.6" stopColor="#dde2e7" />
        <stop offset="1" stopColor="#97a2ad" />
      </linearGradient>
      <linearGradient id="g-ss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f3f5f7" />
        <stop offset="0.5" stopColor="#dfe4e9" />
        <stop offset="1" stopColor="#c3cbd3" />
      </linearGradient>
      <linearGradient id="g-motor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5d7c99" />
        <stop offset="0.35" stopColor="#7d9bb6" />
        <stop offset="1" stopColor="#34506b" />
      </linearGradient>
      <linearGradient id="g-motor-y" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#5d7c99" />
        <stop offset="0.35" stopColor="#7d9bb6" />
        <stop offset="1" stopColor="#34506b" />
      </linearGradient>
      <linearGradient id="g-paint-green" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7f9c86" />
        <stop offset="1" stopColor="#557060" />
      </linearGradient>
      <linearGradient id="g-safety" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6c945" />
        <stop offset="1" stopColor="#d9a514" />
      </linearGradient>
      <linearGradient id="g-water" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#cfe6f3" />
        <stop offset="1" stopColor="#9cc8e0" />
      </linearGradient>
      <linearGradient id="g-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d9b98a" />
        <stop offset="1" stopColor="#c49c66" />
      </linearGradient>
      <linearGradient id="g-kraft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#efe2c4" />
        <stop offset="1" stopColor="#d6c296" />
      </linearGradient>
      <linearGradient id="g-truck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9dee3" />
        <stop offset="0.25" stopColor="#ffffff" />
        <stop offset="1" stopColor="#c4ccd4" />
      </linearGradient>
      <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b9d6ea" />
        <stop offset="1" stopColor="#6f9cbd" />
      </linearGradient>
      <linearGradient id="g-panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e9ecef" />
        <stop offset="1" stopColor="#c7ced5" />
      </linearGradient>

      {/* ---------- Patrones ---------- */}
      <pattern id="p-checker" width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="3" height="3" fill="#dfe3e7" />
        <path d="M0.4 0.9 L1.1 0.4 M1.9 2.6 L2.6 2.1" stroke="#a9b2bb" strokeWidth="0.22" strokeLinecap="round" />
        <path d="M1.9 0.4 L2.6 0.9 M0.4 2.1 L1.1 2.6" stroke="#b9c1c9" strokeWidth="0.22" strokeLinecap="round" />
      </pattern>
      <pattern id="p-grating" width="1.6" height="1.6" patternUnits="userSpaceOnUse">
        <rect width="1.6" height="1.6" fill="#e7ebee" />
        <path d="M0 0.8 H1.6 M0.8 0 V1.6" stroke="#9aa4ae" strokeWidth="0.16" />
      </pattern>
      <pattern id="p-concrete" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#d9d9d4" />
        <circle cx="1.2" cy="1.4" r="0.25" fill="#a7a7a0" />
        <circle cx="4.1" cy="2.2" r="0.18" fill="#b5b5ad" />
        <circle cx="2.6" cy="4.6" r="0.3" fill="#a3a39b" />
        <path d="M4.6 4.4 l0.6 0.9 h-1.1z" fill="none" stroke="#a7a7a0" strokeWidth="0.15" />
        <path d="M0.6 3.6 l0.5 0.7 h-0.9z" fill="none" stroke="#b0b0a8" strokeWidth="0.12" />
      </pattern>
      <pattern id="p-water" width="8" height="5" patternUnits="userSpaceOnUse">
        <rect width="8" height="5" fill="url(#g-water)" />
        <path d="M0.5 1.6 q1 -0.6 2 0 t2 0" fill="none" stroke="#ffffff" strokeWidth="0.25" opacity="0.8" />
        <path d="M3.5 3.8 q1 -0.6 2 0 t2 0" fill="none" stroke="#7fb3d2" strokeWidth="0.2" opacity="0.8" />
      </pattern>
      <pattern id="p-hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="2" stroke="#7d8790" strokeWidth="0.25" />
      </pattern>
      <pattern id="p-hatch-red" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="2.4" stroke="#c0392b" strokeWidth="0.22" opacity="0.5" />
      </pattern>
      <pattern id="p-hazard" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="4" height="4" fill="#f2c230" />
        <rect width="2" height="4" fill="#1f2328" />
      </pattern>
      <pattern id="p-insul" width="3" height="2" patternUnits="userSpaceOnUse">
        <path d="M0 1 q0.75 -0.9 1.5 0 t1.5 0" fill="none" stroke="#b0a58f" strokeWidth="0.2" />
      </pattern>
      <pattern id="p-belt" width="2.2" height="10" patternUnits="userSpaceOnUse">
        <rect width="2.2" height="10" fill="#3d4348" />
        <rect x="0" width="0.5" height="10" fill="#5c646b" />
      </pattern>
      <pattern id="p-rollers" width="2" height="2" patternUnits="userSpaceOnUse">
        <rect width="2" height="2" fill="#cfd5db" />
        <rect y="0.35" width="2" height="1.1" fill="url(#g-cyl-x)" />
      </pattern>
      <pattern id="p-tile" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M8 0 V8 H0" fill="none" stroke="#000" strokeOpacity="0.045" strokeWidth="0.25" />
      </pattern>
      <pattern id="p-ground" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="var(--c-ground)" />
        <circle cx="2" cy="3" r="0.35" fill="#000" opacity="0.06" />
        <circle cx="7" cy="7.5" r="0.3" fill="#000" opacity="0.05" />
        <circle cx="8" cy="1.5" r="0.25" fill="#000" opacity="0.05" />
      </pattern>
      <pattern id="p-lockers" width="5" height="4" patternUnits="userSpaceOnUse">
        <path d="M1 1 h3 M1 1.7 h3 M1 2.4 h3" stroke="#6b7680" strokeWidth="0.2" />
      </pattern>

      {/* ---------- Marcadores (flechas de redes) ---------- */}
      <filter id="f-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}
