import { describe, expect, it } from 'vitest';
import { createInitialData } from '../../domain/seed';
import { generateActionReaction, generateInsight, generateNotificationMessage } from './insightEngine';

describe('generateInsight', () => {
  it('celebrates a completed goal before lower-priority insights', () => {
    const data = createInitialData();
    data.goals[0].currentAmount = data.goals[0].targetAmount;
    expect(generateInsight(data, new Date(2026, 5, 18, 10))).toMatchObject({ mood: 'celebrating', reason: 'goal' });
  });

  it('warns gently when the monthly budget is exceeded', () => {
    const data = createInitialData();
    const now = new Date(2026, 5, 18, 12);
    data.transactions = [{ id: '1', kind: 'expense', amount: 21000, category: 'Other', note: '', occurredAt: now.toISOString(), createdAt: now.toISOString() }];
    expect(generateInsight(data, now)).toMatchObject({ mood: 'sad', reason: 'budget' });
  });

  it('responds excitedly to a newly recorded income', () => {
    const data = createInitialData();
    const now = new Date();
    data.transactions = [{ id: '1', kind: 'income', amount: 10000, category: 'income', note: '', occurredAt: now.toISOString(), createdAt: now.toISOString() }];
    expect(generateInsight(data, now)).toMatchObject({ mood: 'excited', reason: 'income' });
  });

  it('uses the selected masculine address instead of gendered defaults', () => {
    const data = createInitialData();
    data.profile.name = 'Marco';
    data.profile.addressStyle = 'kuya';
    data.profile.monthlyBudget = 10_000;
    data.transactions = [{ id: 'near-limit', kind: 'expense', amount: 8_500, category: 'Food', note: '', occurredAt: '2026-06-19T08:00:00.000Z', createdAt: '2026-06-19T08:00:00.000Z' }];
    const insight = generateInsight(data, new Date(2026, 5, 19, 8));
    expect(insight.message).toContain('Kuya Marco');
    expect(insight.message.toLowerCase()).not.toContain('queen');
  });

  it('reacts to cold weather and a changed location', () => {
    const data = createInitialData();
    const notification = generateNotificationMessage(data, new Date(2026, 5, 19, 7), {
      locationChanged: true,
      weather: { temperature: 17, weatherCode: 3, capturedAt: '2026-06-19T06:00:00.000Z' },
    }, 1);
    expect(notification.mood).toBe('excited');
    expect(notification.title).toContain('New place');
  });

  it.each(['create', 'edit', 'delete'] as const)('generates an action reaction for %s', (operation) => {
    const data = createInitialData();
    const insight = generateActionReaction(data, { id: operation, operation, entity: 'goal', occurredAt: '2026-06-19T08:00:00.000Z' });
    expect(insight.reason).toBe('action');
    expect(insight.message.length).toBeGreaterThan(24);
  });
});
