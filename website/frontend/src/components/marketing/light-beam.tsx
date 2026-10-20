const strands = [
  "M556 236 C552 300 532 372 500 446",
  "M594 236 C598 300 618 372 650 446",
  "M563 250 C558 320 544 384 526 440",
  "M587 250 C592 320 606 384 624 440",
  "M570 262 C568 330 562 394 554 448",
  "M580 262 C582 330 588 394 596 448",
];

export function LightBeam() {
  return (
    <div className="sp-beam" aria-hidden>
      <svg viewBox="0 0 1150 600" preserveAspectRatio="xMidYMin meet">
        <defs>
          <filter id="bm-b30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
          <filter id="bm-b16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
          <filter id="bm-b8" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="8" /></filter>
          <filter id="bm-b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="bm-b1" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="1.2" /></filter>

          <linearGradient id="bm-bar" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#a98bff" stopOpacity="0" />
            <stop offset="0.18" stopColor="#a98bff" stopOpacity="0.75" />
            <stop offset="0.44" stopColor="#d9a8ff" />
            <stop offset="0.5" stopColor="#ffd0ff" />
            <stop offset="0.56" stopColor="#d9a8ff" />
            <stop offset="0.82" stopColor="#a98bff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#a98bff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bm-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.06" stopColor="#c7b3ff" stopOpacity="0" />
            <stop offset="0.3" stopColor="#c7b3ff" stopOpacity="0.9" />
            <stop offset="0.47" stopColor="#ffd6ff" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="0.53" stopColor="#ffd6ff" />
            <stop offset="0.7" stopColor="#c7b3ff" stopOpacity="0.9" />
            <stop offset="0.94" stopColor="#c7b3ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bm-haze" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#a47bff" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#9d7dff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#9d8cff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bm-core" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#f2e8ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bm-strand" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="230" y2="460">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="575" cy="300" rx="190" ry="250" fill="#7350ff" opacity="0.18" filter="url(#bm-b30)" />
        <path d="M498 66 H652 L700 470 Q575 540 450 470 Z" fill="url(#bm-haze)" opacity="0.75" filter="url(#bm-b30)" />

        <rect x="40" y="56" width="1070" height="18" rx="9" fill="url(#bm-bar)" opacity="0.85" filter="url(#bm-b8)" />
        <rect x="70" y="63" width="1010" height="3" rx="1.5" fill="url(#bm-line)" filter="url(#bm-b1)" />

        <path d="M538 66 H612 L606 270 Q575 300 544 270 Z" fill="#f5a8ff" opacity="0.55" filter="url(#bm-b16)" />
        <path d="M548 66 H602 L596 250 Q575 290 554 250 Z" fill="url(#bm-core)" filter="url(#bm-b5)" />

        <g fill="none" stroke="url(#bm-strand)" strokeWidth="1.6" opacity="0.55" filter="url(#bm-b1)">
          {strands.map((d) => <path key={d} d={d} />)}
        </g>

        <ellipse cx="575" cy="405" rx="48" ry="92" fill="#aeb6ff" opacity="0.8" filter="url(#bm-b16)" />

        <ellipse cx="575" cy="64" rx="80" ry="12" fill="#ffffff" filter="url(#bm-b5)" />
        <ellipse cx="575" cy="58" rx="46" ry="22" fill="#ffb8ff" opacity="0.6" filter="url(#bm-b8)" />
      </svg>
      <div className="sp-beam__sparks" />
    </div>
  );
}
