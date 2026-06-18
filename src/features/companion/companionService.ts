import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import type { AppData, EnvironmentContext } from '../../domain/models';
import { generateNotificationMessage } from '../insights/insightEngine';

const NOTIFICATION_MIN_ID = 7300;
const NOTIFICATION_MAX_ID = 7399;

export async function requestNotificationAccess() {
  if (Capacitor.isNativePlatform()) {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    return (await LocalNotifications.requestPermissions()).display === 'granted';
  }
  if (!('Notification' in window)) return false;
  return (await Notification.requestPermission()) === 'granted';
}

export async function syncCompanionNotifications(data: AppData) {
  if (!Capacitor.isNativePlatform()) return;
  const pending = await LocalNotifications.getPending();
  const ours = pending.notifications.filter((item) => item.id >= NOTIFICATION_MIN_ID && item.id <= NOTIFICATION_MAX_ID);
  if (ours.length) await LocalNotifications.cancel({ notifications: ours.map(({ id }) => ({ id })) });
  if (!data.preferences.notificationsEnabled) return;
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') return;
  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({ id: 'bulsa-companion', name: 'Bulsa companion', description: 'Contextual budget check-ins generated on your device', importance: 3, visibility: 1, vibration: true });
  }
  const dates = notificationDates(data.preferences.notificationFrequency, new Date());
  const generatedBodies = [...data.companion.recentMessages];
  const notifications: LocalNotificationSchema[] = dates.map((at, index) => {
    const generationData = { ...data, companion: { ...data.companion, recentMessages: generatedBodies } };
    const generated = generateNotificationMessage(generationData, at, data.companion.environment, index);
    generatedBodies.push(generated.body);
    return {
      id: NOTIFICATION_MIN_ID + index,
      title: generated.title,
      body: generated.body,
      schedule: { at, allowWhileIdle: true },
      channelId: Capacitor.getPlatform() === 'android' ? 'bulsa-companion' : undefined,
      extra: { source: 'bulsa-companion', mood: generated.mood },
    };
  });
  await LocalNotifications.schedule({ notifications });
}

export async function refreshEnvironment(data: AppData, requestPermission = false): Promise<Partial<EnvironmentContext> | null> {
  if (!data.preferences.locationContextEnabled) return null;
  const allowed = await hasLocationAccess(requestPermission);
  if (!allowed) return null;
  const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60_000 });
  const latitude = roundCoordinate(position.coords.latitude);
  const longitude = roundCoordinate(position.coords.longitude);
  const previous = data.companion.environment.coarseLocation;
  const locationChanged = Boolean(previous && distanceKm(previous.latitude, previous.longitude, latitude, longitude) >= 3);
  const next: Partial<EnvironmentContext> = { coarseLocation: { latitude, longitude, capturedAt: new Date().toISOString() }, locationChanged };

  if (data.preferences.weatherContextEnabled && navigator.onLine) {
    try {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(latitude));
      url.searchParams.set('longitude', String(longitude));
      url.searchParams.set('current', 'temperature_2m,weather_code');
      const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (response.ok) {
        const payload = await response.json() as { current?: { temperature_2m?: number; weather_code?: number } };
        if (typeof payload.current?.temperature_2m === 'number' && typeof payload.current.weather_code === 'number') {
          next.weather = { temperature: payload.current.temperature_2m, weatherCode: payload.current.weather_code, capturedAt: new Date().toISOString() };
        }
      }
    } catch {
      // Cached weather remains available; offline-first behavior is intentional.
    }
  }
  return next;
}

async function hasLocationAccess(requestPermission: boolean) {
  if (Capacitor.isNativePlatform()) {
    const current = await Geolocation.checkPermissions();
    if (current.coarseLocation === 'granted' || current.location === 'granted') return true;
    if (!requestPermission) return false;
    const requested = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] });
    return requested.coarseLocation === 'granted' || requested.location === 'granted';
  }
  if (!navigator.geolocation) return false;
  if (!navigator.permissions) return requestPermission;
  const status = await navigator.permissions.query({ name: 'geolocation' });
  return status.state === 'granted' || (status.state === 'prompt' && requestPermission);
}

function notificationDates(frequency: AppData['preferences']['notificationFrequency'], now: Date) {
  const dates: Date[] = [];
  if (frequency === 'hourly') {
    const candidate = new Date(now); candidate.setMinutes(0, 0, 0); candidate.setHours(candidate.getHours() + 1);
    while (dates.length < 24) {
      if (candidate.getHours() >= 6 && candidate.getHours() <= 22) dates.push(new Date(candidate));
      candidate.setHours(candidate.getHours() + 1);
    }
    return dates;
  }
  for (let day = 0; day < 7; day++) {
    for (const hour of [7, 12, 19]) {
      const at = new Date(now); at.setDate(now.getDate() + day); at.setHours(hour, 0, 0, 0);
      if (at > now) dates.push(at);
    }
  }
  return dates;
}

const roundCoordinate = (value: number) => Math.round(value * 100) / 100;
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1); const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
