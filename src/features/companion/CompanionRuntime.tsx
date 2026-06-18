import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useAppData } from '../../app/AppDataProvider';
import { refreshEnvironment, syncCompanionNotifications } from './companionService';

export function CompanionRuntime() {
  const { data, ready, updateEnvironment } = useAppData();

  useEffect(() => {
    if (!ready || !data.preferences.locationContextEnabled) return;
    let disposed = false;
    const refresh = () => void refreshEnvironment(data).then((environment) => { if (!disposed && environment) updateEnvironment(environment); }).catch(() => undefined);
    refresh();
    const interval = window.setInterval(refresh, 15 * 60_000);
    let removeResume: (() => Promise<void>) | undefined;
    void CapacitorApp.addListener('appStateChange', ({ isActive }) => { if (isActive) refresh(); }).then((handle) => { removeResume = () => handle.remove(); });
    return () => { disposed = true; window.clearInterval(interval); void removeResume?.(); };
    // Recreate only when the opt-in setting changes. Environment writes should
    // not restart the monitor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, data.preferences.locationContextEnabled, data.preferences.weatherContextEnabled]);

  useEffect(() => {
    if (!ready) return;
    void syncCompanionNotifications(data).catch(() => undefined);
    // Notification content is refreshed when preferences or context changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, data.preferences.notificationsEnabled, data.preferences.notificationFrequency, data.companion.environment.weather?.capturedAt, data.companion.environment.coarseLocation?.capturedAt]);

  return null;
}
