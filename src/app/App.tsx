import { useEffect, useMemo, useState } from 'react';
import { AppNav } from '../components/AppNav';
import { useAppData } from './AppDataProvider';
import type { AppRoute } from './routes';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ActivityPage } from '../features/transactions/ActivityPage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { PlannerPage } from '../features/planner/PlannerPage';
import { BulsaIcon } from '../components/icons/BulsaIcon';
import { CompanionOverlay } from '../features/mascot/CompanionOverlay';
import { CompanionRuntime } from '../features/companion/CompanionRuntime';

export default function App() {
  const { data, ready } = useAppData();
  const [route, setRoute] = useState<AppRoute>('home');

  const resolvedMode = useMemo(() => {
    if (data.preferences.mode !== 'system') return data.preferences.mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [data.preferences.mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = data.preferences.theme;
    document.documentElement.dataset.mode = resolvedMode;
    document.documentElement.dataset.glass = String(data.preferences.glass);
    document.documentElement.dataset.motion = data.preferences.reducedMotion ? 'reduced' : 'full';
  }, [data.preferences, resolvedMode]);

  if (!ready) return <main className="loading-screen"><div className="loading-wallet"><BulsaIcon name="wallet" size={44} /></div><p>Opening your wallet…</p></main>;

  return (
    <div className="app-shell">
      <CompanionRuntime />
      <main className="page-container">
        {route === 'home' && <DashboardPage onNavigate={setRoute} />}
        {route === 'activity' && <ActivityPage />}
        {route === 'planner' && <PlannerPage />}
        {route === 'goals' && <GoalsPage />}
        {route === 'settings' && <SettingsPage />}
      </main>
      <CompanionOverlay />
      <AppNav current={route} onChange={setRoute} />
    </div>
  );
}
