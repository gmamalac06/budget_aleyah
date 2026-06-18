import { describe, expect, it } from 'vitest';
import { normalizeAppData } from './seed';

describe('normalizeAppData', () => {
  it('migrates v1 local data with empty planner collections', () => {
    const migrated = normalizeAppData({
      version: 1,
      profile: { name: 'A', currency: 'PHP', monthlyBudget: 10000 },
      transactions: [], categories: [], goals: [],
    } as never);
    expect(migrated.version).toBe(3);
    expect(migrated.wallets).toEqual([]);
    expect(migrated.scheduledPayments).toEqual([]);
    expect(migrated.profile.addressStyle).toBe('neutral');
    expect(migrated.preferences.notificationsEnabled).toBe(false);
    expect(migrated.companion.recentMessages).toEqual([]);
  });
});
