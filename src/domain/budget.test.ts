import { describe, expect, it } from 'vitest';
import { calculateExpenseSummary, calculateSnapshot } from './budget';
import { createInitialData } from './seed';

describe('calculateSnapshot', () => {
  it('separates expenses, income, savings, and keep money', () => {
    const data = createInitialData();
    const occurredAt = new Date(2026, 5, 10).toISOString();
    data.transactions = [
      { id: '1', kind: 'income', amount: 30000, category: 'income', note: '', occurredAt, createdAt: occurredAt },
      { id: '2', kind: 'expense', amount: 4000, category: 'Food', note: '', occurredAt, createdAt: occurredAt },
      { id: '3', kind: 'savings', amount: 5000, category: 'savings', note: '', occurredAt, createdAt: occurredAt },
      { id: '4', kind: 'keep', amount: 2000, category: 'keep', note: '', occurredAt, createdAt: occurredAt },
    ];

    expect(calculateSnapshot(data, new Date(2026, 5, 18))).toMatchObject({
      income: 30000,
      expenses: 4000,
      savings: 5000,
      keep: 2000,
      balance: 19000,
      available: 16000,
      budgetUsed: 0.2,
    });
  });

  it('excludes transactions outside the selected month', () => {
    const data = createInitialData();
    data.transactions = [{ id: '1', kind: 'expense', amount: 1000, category: 'Food', note: '', occurredAt: new Date(2026, 4, 31).toISOString(), createdAt: new Date().toISOString() }];
    expect(calculateSnapshot(data, new Date(2026, 5, 18)).expenses).toBe(0);
  });

  it('builds daily, monthly, and all-time expense summaries', () => {
    const data = createInitialData();
    const june18 = new Date(2026, 5, 18, 12).toISOString();
    const june10 = new Date(2026, 5, 10, 12).toISOString();
    const may31 = new Date(2026, 4, 31, 12).toISOString();
    data.transactions = [
      { id: '1', kind: 'expense', amount: 500, category: 'Food', note: '', occurredAt: june18, createdAt: june18 },
      { id: '2', kind: 'expense', amount: 300, category: 'Transport', note: '', occurredAt: june10, createdAt: june10 },
      { id: '3', kind: 'expense', amount: 200, category: 'Food', note: '', occurredAt: may31, createdAt: may31 },
    ];
    const now = new Date(2026, 5, 18, 20);
    expect(calculateExpenseSummary(data, 'daily', now).expenses).toBe(500);
    expect(calculateExpenseSummary(data, 'monthly', now).expenses).toBe(800);
    expect(calculateExpenseSummary(data, 'overall', now).expenses).toBe(1000);
    expect(calculateExpenseSummary(data, 'overall', now).categories[0]).toMatchObject({ name: 'Food', amount: 700, share: 0.7 });
  });
});
