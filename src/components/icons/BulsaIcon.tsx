import type { CSSProperties, ReactNode, SVGProps } from 'react';

export type BulsaIconName =
  | 'home' | 'activity' | 'goals' | 'planner' | 'settings'
  | 'expense' | 'income' | 'savings' | 'wallet' | 'plus'
  | 'sparkle' | 'arrow-right' | 'trash' | 'search' | 'close'
  | 'image' | 'light' | 'dark' | 'system' | 'download' | 'upload'
  | 'reset' | 'calendar' | 'bill' | 'subscription' | 'payment'
  | 'edit' | 'chevron-left' | 'chevron-right' | 'check'
  | 'food' | 'transport' | 'shopping' | 'fun' | 'other' | 'chart';

interface BulsaIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: BulsaIconName;
  size?: number;
  duotone?: boolean;
}

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
};

/** Original, hand-drawn two-tone icon family used throughout Bulsa. */
export function BulsaIcon({ name, size = 20, duotone = true, style, ...props }: BulsaIconProps) {
  const mergedStyle = { '--icon-wash': 'currentColor', ...style } as CSSProperties;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" style={mergedStyle} {...props}>
      {duotone && <path d="M5.2 3.8c4.9-3 12.4-.7 14.7 4.7 2.3 5.5-.7 11.8-6.8 12.5-6 .8-11.2-3.7-10.4-9.7.4-3 1-5.9 2.5-7.5Z" fill="var(--icon-wash)" opacity=".1" />}
      {paths[name]}
    </svg>
  );
}

const paths: Record<BulsaIconName, ReactNode> = {
  home: <><path {...common} d="M3.5 11.2 12 4l8.5 7.2"/><path {...common} d="M5.5 10.2v9h13v-9M9.2 19.2v-5.8h5.6v5.8"/><path {...common} d="M8 5.6c1.5-.9 3-.7 4 .1" opacity=".5"/></>,
  activity: <><path {...common} d="M7 5.2h12M7 11.8h12M7 18.4h8"/><path {...common} d="m3.2 5.2.9.9 1.7-2M3.2 11.8l.9.9 1.7-2M3.2 18.4l.9.9 1.7-2"/></>,
  goals: <><path {...common} d="M5 9.7c0-2.4 1.8-4.2 4.1-4.2 1.3 0 2.3.6 2.9 1.5.6-.9 1.6-1.5 2.9-1.5 2.3 0 4.1 1.8 4.1 4.2 0 4-4.7 7.7-7 9.1-2.3-1.4-7-5.1-7-9.1Z"/><path {...common} d="M12 9v5m-2.1-2.5h4.2"/></>,
  planner: <><rect {...common} x="4" y="5.3" width="16" height="15" rx="3"/><path {...common} d="M8 3.5v3.6m8-3.6v3.6M4 9.4h16"/><path {...common} d="m8 14 2.2 2.2 5-5"/></>,
  settings: <><path {...common} d="M9.4 4.2 10 2.8h4l.6 1.4 1.6.9 1.5-.2 2 3.4-.9 1.2v1.9l.9 1.2-2 3.4-1.5-.2-1.6.9-.6 1.5h-4l-.6-1.5-1.6-.9-1.5.2-2-3.4.9-1.2V9.5l-.9-1.2 2-3.4 1.5.2 1.6-.9Z"/><circle {...common} cx="12" cy="10.5" r="2.7"/></>,
  expense: <><path {...common} d="M7 5h11v11"/><path {...common} d="M18 5 6 17"/><path {...common} d="M5 12.5V19h6.5"/></>,
  income: <><path {...common} d="M17 19H6V8"/><path {...common} d="M6 19 18 7"/><path {...common} d="M19 11.5V5h-6.5"/></>,
  savings: <><path {...common} d="M4 11.5c0-3 3.5-5.5 8-5.5s8 2.5 8 5.5V16c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4v-4.5Z"/><path {...common} d="M9.2 6V4.8c0-.8 1.2-1.4 2.8-1.4s2.8.6 2.8 1.4V6M12 10v4m-1.5-2h3"/></>,
  wallet: <><path {...common} d="M4 7.4h14.5A2.5 2.5 0 0 1 21 9.9v7.6a2.5 2.5 0 0 1-2.5 2.5h-12A3.5 3.5 0 0 1 3 16.5V6.8A2.8 2.8 0 0 1 5.8 4h10.7"/><path {...common} d="M16 11.2h5v4.5h-5a2.2 2.2 0 1 1 0-4.5Z"/><circle cx="16.5" cy="13.45" r=".7" fill="currentColor"/></>,
  plus: <><path {...common} d="M12 5v14M5 12h14"/><circle {...common} cx="12" cy="12" r="9" opacity=".45"/></>,
  sparkle: <><path {...common} d="M12 2.8c.5 5.2 2.2 7 7.2 7.5-5 .5-6.7 2.2-7.2 7.5-.5-5.3-2.2-7-7.2-7.5 5-.5 6.7-2.3 7.2-7.5Z"/><path {...common} d="M18.5 16.5c.2 2.1.9 2.8 2.8 3-1.9.2-2.6.9-2.8 2.8-.2-1.9-.9-2.6-2.8-2.8 1.9-.2 2.6-.9 2.8-3Z"/></>,
  'arrow-right': <><path {...common} d="M4 12h15M14 6l6 6-6 6"/><path {...common} d="M5 8.5c-1.5 1.4-1.5 5.6 0 7" opacity=".45"/></>,
  trash: <><path {...common} d="M5.5 7.5h13l-1 12.5h-11l-1-12.5ZM9 7.5V4.4h6v3.1M4 7.5h16M9.5 11v5.5m5-5.5v5.5"/></>,
  search: <><circle {...common} cx="10.5" cy="10.5" r="6.5"/><path {...common} d="m15.5 15.5 5 5"/><path {...common} d="M7.5 8.5c.8-1.2 2-1.8 3.4-1.8" opacity=".5"/></>,
  close: <><path {...common} d="m6 6 12 12M18 6 6 18"/><circle {...common} cx="12" cy="12" r="9" opacity=".35"/></>,
  image: <><rect {...common} x="3.5" y="4.5" width="17" height="15" rx="3"/><circle {...common} cx="9" cy="10" r="2"/><path {...common} d="m5.5 17 4-4 3 3 2.2-2.2 3.8 3.2"/></>,
  light: <><circle {...common} cx="12" cy="12" r="4"/><path {...common} d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4m0-13.4-1.4 1.4M6.7 17.3l-1.4 1.4"/></>,
  dark: <><path {...common} d="M19.5 15.2A8.5 8.5 0 0 1 8.8 4.5a8.5 8.5 0 1 0 10.7 10.7Z"/><path {...common} d="m16.6 5 .5 1.3 1.4.5-1.4.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3Z"/></>,
  system: <><rect {...common} x="3" y="4" width="18" height="13" rx="2.5"/><path {...common} d="M8 21h8m-4-4v4"/><path {...common} d="m7 10 2 2 3.5-4"/></>,
  download: <><path {...common} d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/></>,
  upload: <><path {...common} d="M12 16V4M8 8l4-4 4 4M4 17v3h16v-3"/></>,
  reset: <><path {...common} d="M5.2 7.4A8 8 0 1 1 4 15"/><path {...common} d="M5 3v4.6h4.6"/></>,
  calendar: <><rect {...common} x="3.5" y="5" width="17" height="16" rx="3"/><path {...common} d="M8 3v4m8-4v4M3.5 9.5h17"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/></>,
  bill: <><path {...common} d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3v-17Z"/><path {...common} d="M9 8h6M9 12h6M9 16h3"/></>,
  subscription: <><path {...common} d="M7 7.5A7 7 0 0 1 19 12"/><path {...common} d="m19 7.5.2 4.7-4.6-.2M17 16.5A7 7 0 0 1 5 12"/><path {...common} d="m5 16.5-.2-4.7 4.6.2"/></>,
  payment: <><rect {...common} x="3" y="5.5" width="18" height="13" rx="3"/><path {...common} d="M3 9.5h18M7 14.5h3"/></>,
  edit: <><path {...common} d="m5 16-.8 4 4-.8L19 8.4 15.6 5 5 16Z"/><path {...common} d="m13.8 6.8 3.4 3.4M4.2 20h15.6"/></>,
  'chevron-left': <path {...common} d="m15 5-7 7 7 7"/>,
  'chevron-right': <path {...common} d="m9 5 7 7-7 7"/>,
  check: <><path {...common} d="m5 12.5 4.2 4.2L19 7"/><circle {...common} cx="12" cy="12" r="9" opacity=".35"/></>,
  food: <><path {...common} d="M5 4v6c0 1.7 1.3 3 3 3s3-1.3 3-3V4M8 4v16M15 4v16M15 4c3 1.4 4.5 4.8 2.7 8H15"/></>,
  transport: <><rect {...common} x="4" y="4" width="16" height="14" rx="4"/><path {...common} d="M7 8h10M7 12h10M7 18v2m10-2v2"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></>,
  shopping: <><path {...common} d="M5 8h14l-1 12H6L5 8Z"/><path {...common} d="M9 9V6a3 3 0 0 1 6 0v3"/><path {...common} d="M9 13c1.5 1.3 4.5 1.3 6 0"/></>,
  fun: <><path {...common} d="M7 8h10c2 0 3.5 1.5 4 4l.7 3.7c.4 2.2-2.2 3.6-3.6 1.8L16 15H8l-2.1 2.5c-1.4 1.8-4 .4-3.6-1.8L3 12c.5-2.5 2-4 4-4Z"/><path {...common} d="M7 11v3m-1.5-1.5h3M15.5 11.5h.1m2.3 2h.1"/></>,
  other: <><path {...common} d="M12 3.2c.5 5.5 2.1 7.1 7.5 7.6-5.4.5-7 2.1-7.5 7.6-.5-5.5-2.1-7.1-7.5-7.6C9.9 10.3 11.5 8.7 12 3.2Z"/><circle cx="19.5" cy="18.7" r="1.5" fill="currentColor"/></>,
  chart: <><path {...common} d="M4 20V9m5 11V4m5 16v-7m5 7V7"/><path {...common} d="M3 20.5h18"/></>,
};
