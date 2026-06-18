import { useRef, useState, type ChangeEvent } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import { Avatar } from '../../components/Avatar';
import { BulsaIcon, type BulsaIconName } from '../../components/icons/BulsaIcon';
import type { AppData, AppearanceMode } from '../../domain/models';
import { themes } from './themes';
import { refreshEnvironment, requestNotificationAccess } from '../companion/companionService';

export function SettingsPage() {
  const { data, updateProfile, updatePreferences, updateEnvironment, importData, resetData } = useAppData();
  const avatarInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [permissionNote, setPermissionNote] = useState('');

  const toggleNotifications = async (enabled: boolean) => {
    if (!enabled) { updatePreferences({ notificationsEnabled: false }); setPermissionNote('Reminders paused.'); return; }
    const granted = await requestNotificationAccess().catch(() => false);
    updatePreferences({ notificationsEnabled: granted });
    setPermissionNote(granted ? 'Reminders enabled on this device.' : 'Notification permission was not granted.');
  };

  const toggleLocation = async (enabled: boolean) => {
    updatePreferences({ locationContextEnabled: enabled, ...(!enabled ? { weatherContextEnabled: false } : {}) });
    if (!enabled) { updateEnvironment({ locationChanged: false }); return; }
    const nextData = { ...data, preferences: { ...data.preferences, locationContextEnabled: true } };
    const environment = await refreshEnvironment(nextData, true).catch(() => null);
    if (environment) { updateEnvironment(environment); setPermissionNote('Coarse location context is ready.'); }
    else setPermissionNote('Location permission was not granted.');
  };

  const toggleWeather = async (enabled: boolean) => {
    updatePreferences({ weatherContextEnabled: enabled, ...(enabled ? { locationContextEnabled: true } : {}) });
    if (!enabled) return;
    const nextData = { ...data, preferences: { ...data.preferences, locationContextEnabled: true, weatherContextEnabled: true } };
    const environment = await refreshEnvironment(nextData, true).catch(() => null);
    if (environment) { updateEnvironment(environment); setPermissionNote('Weather context updated.'); }
    else setPermissionNote('Weather needs location permission and an internet connection.');
  };

  const readImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile({ avatar: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `bulsa-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
  };
  const readBackup = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { try { const value = JSON.parse(String(reader.result)) as AppData; if (value.profile && Array.isArray(value.transactions)) importData(value); } catch { window.alert('That does not look like a valid Bulsa backup.'); } }; reader.readAsText(file);
  };

  return <>
    <header className="page-header"><div><span className="eyebrow">Make it feel like yours</span><h1>Settings</h1><p>Private, local, and delightfully customizable.</p></div></header>
    <section className="settings-section surface"><div className="setting-title"><div><span className="eyebrow">Profile</span><h2>Your little corner</h2></div></div><div className="profile-editor"><button className="avatar-editor" onClick={() => avatarInput.current?.click()}><Avatar name={data.profile.name} src={data.profile.avatar} size={82} /><span><BulsaIcon name="image" size={17} /></span></button><input ref={avatarInput} type="file" accept="image/*" hidden onChange={readImage} /><div className="profile-fields"><label><span>What should Bulsa call you?</span><input value={data.profile.name} onChange={(event) => updateProfile({ name: event.target.value })} maxLength={30} /></label><label><span>Address style</span><select value={data.profile.addressStyle} onChange={(event) => updateProfile({ addressStyle: event.target.value as AppData['profile']['addressStyle'] })}><option value="neutral">Name only (neutral)</option><option value="ate">Ate</option><option value="kuya">Kuya</option><option value="madam">Madam</option><option value="sir">Sir</option></select></label><label><span>Monthly spending budget</span><input type="number" min="0" step="100" value={data.profile.monthlyBudget} onChange={(event) => updateProfile({ monthlyBudget: Number(event.target.value) })} /></label></div></div></section>
    <section className="settings-section surface companion-settings"><div className="setting-title"><div><span className="eyebrow">Bulsa Mini</span><h2>Local AI companion</h2></div><span className="ai-badge"><BulsaIcon name="sparkle" size={14} /> On-device model</span></div><p className="setting-description">Bulsa Mini is a compact contextual AI, not a cloud LLM. It scores your actions and budget patterns to choose an emotion, then generates varied Taglish from a probabilistic language system. Recent-message memory helps it avoid repeating itself.</p><Toggle label="Daily companion reminders" detail="Generated locally; works when the native app is closed" checked={data.preferences.notificationsEnabled} onChange={(value) => void toggleNotifications(value)} /><div className="frequency-row"><span><strong>Reminder rhythm</strong><small>Gentle sends morning, lunch, and evening. Hourly pauses overnight.</small></span><select value={data.preferences.notificationFrequency} onChange={(event) => updatePreferences({ notificationFrequency: event.target.value as 'gentle' | 'hourly' })}><option value="gentle">Gentle · 3/day</option><option value="hourly">Hourly · 6AM–10PM</option></select></div><Toggle label="Location-aware reactions" detail="Uses coarse location while open and when resumed; detects moves of roughly 3 km" checked={data.preferences.locationContextEnabled} onChange={(value) => void toggleLocation(value)} /><Toggle label="Live weather context" detail="Optional: sends coarse coordinates to Open-Meteo; last result is cached offline" checked={data.preferences.weatherContextEnabled} onChange={(value) => void toggleWeather(value)} />{permissionNote && <p className="permission-note">{permissionNote}</p>}<div className="privacy-callout"><BulsaIcon name="system" size={20} /><span><strong>Private by default.</strong> Notifications are scheduled on-device. Location and weather remain off until you enable them; exact coordinates are never stored.</span></div></section>
    <section className="settings-section surface"><div className="setting-title"><div><span className="eyebrow">Color story</span><h2>Choose your theme</h2></div><span>7 palettes</span></div><div className="theme-grid">{themes.map((theme) => <button key={theme.id} className={`theme-choice ${data.preferences.theme === theme.id ? 'active' : ''}`} onClick={() => updatePreferences({ theme: theme.id })}><span className="theme-swatches">{theme.colors.map((color) => <i key={color} style={{ background: color }} />)}</span><span>{theme.name}</span></button>)}</div></section>
    <section className="settings-section surface"><div className="setting-title"><div><span className="eyebrow">Look & feel</span><h2>Appearance</h2></div></div><div className="mode-selector">{([{ id: 'light', label: 'Light', icon: 'light' }, { id: 'dark', label: 'Dark', icon: 'dark' }, { id: 'system', label: 'System', icon: 'system' }] as { id: AppearanceMode; label: string; icon: BulsaIconName }[]).map(({ id, label, icon }) => <button key={id} className={data.preferences.mode === id ? 'active' : ''} onClick={() => updatePreferences({ mode: id })}><BulsaIcon name={icon} size={19} />{label}</button>)}</div><Toggle label="Glassmorphism" detail="Soft translucent cards and gentle blur" checked={data.preferences.glass} onChange={(glass) => updatePreferences({ glass })} /><Toggle label="Reduce motion" detail="Keep the wallet cute, but calmer" checked={data.preferences.reducedMotion} onChange={(reducedMotion) => updatePreferences({ reducedMotion })} /></section>
    <section className="settings-section surface"><div className="setting-title"><div><span className="eyebrow">Your data</span><h2>Backup & privacy</h2></div><span className="privacy-badge"><BulsaIcon name="system" size={15} /> Offline only</span></div><p className="setting-description">Bulsa keeps your information on this device. Export a backup before changing phones or clearing app data.</p><div className="settings-actions"><button className="secondary-button" onClick={exportBackup}><BulsaIcon name="download" size={18} /> Export backup</button><button className="secondary-button" onClick={() => importInput.current?.click()}><BulsaIcon name="upload" size={18} /> Import backup</button><input ref={importInput} type="file" accept="application/json" hidden onChange={readBackup} /><button className="danger-button" onClick={() => { if (window.confirm('Reset all Bulsa data on this device? This cannot be undone.')) void resetData(); }}><BulsaIcon name="reset" size={18} /> Reset app</button></div></section>
    <footer className="settings-footer">Bulsa v0.1 · Made for calmer money days ✦</footer>
  </>;
}

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange(value: boolean): void }) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{detail}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}
