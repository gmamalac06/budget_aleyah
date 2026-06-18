import type { AppData } from './models';

export const createInitialData = (): AppData => ({
  version: 3,
  profile: { name: 'Friend', currency: 'PHP', monthlyBudget: 20000, addressStyle: 'neutral' },
  preferences: { theme: 'ocean', mode: 'system', glass: true, reducedMotion: false, notificationsEnabled: false, notificationFrequency: 'gentle', locationContextEnabled: false, weatherContextEnabled: false },
  categories: [
    { id: 'food', name: 'Food', icon: 'food', color: '#ff849d', monthlyLimit: 5000 },
    { id: 'transport', name: 'Transport', icon: 'transport', color: '#7ca7f8', monthlyLimit: 2500 },
    { id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#b790ec', monthlyLimit: 3000 },
    { id: 'bills', name: 'Bills', icon: 'bill', color: '#ffc75a', monthlyLimit: 5000 },
    { id: 'fun', name: 'Fun', icon: 'fun', color: '#55cbb3', monthlyLimit: 2000 },
    { id: 'other', name: 'Other', icon: 'other', color: '#9ea8ba', monthlyLimit: 2500 },
  ],
  transactions: [],
  goals: [
    { id: 'emergency', name: 'Emergency fund', emoji: '☂️', targetAmount: 50000, currentAmount: 0 },
  ],
  scheduledPayments: [],
  wallets: [],
  companion: { recentMessages: [], environment: { locationChanged: false } },
});

export const normalizeAppData = (value: Partial<AppData> | null | undefined): AppData => {
  const initial = createInitialData();
  return {
    ...initial,
    ...value,
    version: 3,
    profile: { ...initial.profile, ...(value?.profile ?? {}) },
    preferences: { ...initial.preferences, ...(value?.preferences ?? {}) },
    categories: Array.isArray(value?.categories) ? value.categories : initial.categories,
    transactions: Array.isArray(value?.transactions) ? value.transactions : [],
    goals: Array.isArray(value?.goals) ? value.goals : initial.goals,
    scheduledPayments: Array.isArray(value?.scheduledPayments) ? value.scheduledPayments : [],
    wallets: Array.isArray(value?.wallets) ? value.wallets : [],
    companion: {
      ...initial.companion,
      ...(value?.companion ?? {}),
      recentMessages: Array.isArray(value?.companion?.recentMessages) ? value.companion.recentMessages.slice(-20) : [],
      environment: { ...initial.companion.environment, ...(value?.companion?.environment ?? {}) },
    },
  };
};
