import type { AppRoute } from '../app/routes';
import { BulsaIcon, type BulsaIconName } from './icons/BulsaIcon';

const items: { route: AppRoute; label: string; icon: BulsaIconName }[] = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'activity', label: 'Activity', icon: 'activity' },
  { route: 'planner', label: 'Plan', icon: 'planner' },
  { route: 'goals', label: 'Goals', icon: 'goals' },
  { route: 'settings', label: 'Settings', icon: 'settings' },
];

export function AppNav({ current, onChange }: { current: AppRoute; onChange(route: AppRoute): void }) {
  return (
    <nav className="app-nav surface" aria-label="Main navigation">
      {items.map(({ route, label, icon }) => (
        <button key={route} className={current === route ? 'active' : ''} onClick={() => onChange(route)} aria-current={current === route ? 'page' : undefined}>
          <BulsaIcon name={icon} size={22} /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
