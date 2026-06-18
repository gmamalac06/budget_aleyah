import type { WalletMood } from '../../domain/models';

const expressions: Record<WalletMood, { eyes: string; mouth: string; brow: string }> = {
  happy: { eyes: 'happy', mouth: 'smile', brow: 'calm' },
  excited: { eyes: 'sparkle', mouth: 'open', brow: 'lift' },
  proud: { eyes: 'happy', mouth: 'smile', brow: 'lift' },
  worried: { eyes: 'round', mouth: 'worry', brow: 'worry' },
  shocked: { eyes: 'round', mouth: 'oh', brow: 'lift' },
  sad: { eyes: 'sad', mouth: 'sad', brow: 'worry' },
  sleepy: { eyes: 'sleepy', mouth: 'tiny', brow: 'calm' },
  thinking: { eyes: 'side', mouth: 'tiny', brow: 'lift' },
  celebrating: { eyes: 'sparkle', mouth: 'open', brow: 'lift' },
  cold: { eyes: 'round', mouth: 'worry', brow: 'worry' },
  energized: { eyes: 'sparkle', mouth: 'smile', brow: 'lift' },
};

export function WalletMascot({ mood, size = 150, className = '' }: { mood: WalletMood; size?: number; className?: string }) {
  const face = expressions[mood];
  const isCompanion = className.includes('companion-mascot');
  return (
    <div className={`wallet-mascot wallet-mascot--${mood} ${className}`} style={isCompanion ? undefined : { width: size, height: size }} role="img" aria-label={`Wallet companion feeling ${mood}`}>
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <defs>
          <linearGradient id="walletBody" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--mascot-light)" />
            <stop offset="1" stopColor="var(--mascot)" />
          </linearGradient>
          <filter id="walletShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="var(--shadow-color)" floodOpacity=".2" />
          </filter>
        </defs>
        <g className="wallet-float" filter="url(#walletShadow)">
          <path d="M39 53c0-10 8-18 18-18h68c8 0 15 5 17 12l7 22H52c-7 0-13-6-13-13v-3Z" fill="var(--mascot-dark)" />
          <rect x="26" y="57" width="132" height="94" rx="25" fill="url(#walletBody)" />
          <path d="M26 82c32 15 88 15 132 1" fill="none" stroke="var(--mascot-highlight)" strokeWidth="4" strokeLinecap="round" opacity=".55" />
          <rect x="119" y="88" width="48" height="38" rx="15" fill="var(--mascot-dark)" />
          <circle cx="139" cy="107" r="5" fill="var(--mascot-highlight)" />
          <g className={`brows brows--${face.brow}`} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M55 94q10-6 19 0" /><path d="M86 94q10-6 19 0" />
          </g>
          <g className={`eyes eyes--${face.eyes}`} fill="var(--ink)" stroke="var(--ink)" strokeLinecap="round">
            <circle className="eye-dot eye-left" cx="65" cy="106" r="5" />
            <circle className="eye-dot eye-right" cx="96" cy="106" r="5" />
            <path className="eye-line eye-left" d="M58 106q7 7 14 0" fill="none" strokeWidth="4" />
            <path className="eye-line eye-right" d="M89 106q7 7 14 0" fill="none" strokeWidth="4" />
          </g>
          <g className={`mouth mouth--${face.mouth}`} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" fill="none">
            <path className="mouth-smile" d="M72 122q8 9 17 0" />
            <path className="mouth-sad" d="M73 130q8-8 16 0" />
            <circle className="mouth-open" cx="81" cy="126" r="7" fill="var(--ink)" />
            <path className="mouth-tiny" d="M78 126h7" />
            <path className="mouth-worry" d="M74 126q5 4 10 0q4-3 8 0" />
          </g>
          <g fill="var(--blush)" opacity=".65"><ellipse cx="49" cy="121" rx="9" ry="5" /><ellipse cx="108" cy="121" rx="8" ry="5" /></g>
        </g>
        <g className="celebration-pieces">
          <path d="M31 48l-4-12" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
          <path d="M145 40l8-10" stroke="var(--success)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="164" cy="60" r="5" fill="var(--warning)" />
          <path d="M22 76l-11-2" stroke="var(--info)" strokeWidth="5" strokeLinecap="round" />
        </g>
        {mood === 'sleepy' && <g className="sleep-z" fill="var(--ink-soft)" fontWeight="800"><text x="137" y="43" fontSize="16">z</text><text x="151" y="28" fontSize="22">Z</text></g>}
        {mood === 'cold' && <g className="cold-puffs" fill="none" stroke="var(--info)" strokeWidth="3" strokeLinecap="round"><path d="M42 44h12m-6-6v12m-4-10 8 8m0-8-8 8"/><path d="M145 50h10m-5-5v10"/></g>}
        {mood === 'energized' && <g className="energy-rays" fill="none" stroke="var(--warning)" strokeWidth="4" strokeLinecap="round"><path d="m31 47-7-7m132 9 7-7M90 27V16M28 83H16m148 0h-12"/></g>}
      </svg>
    </div>
  );
}
