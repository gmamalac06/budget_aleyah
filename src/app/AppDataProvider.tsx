import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { appStorage } from '../data/storage';
import type { AppData, BudgetCategory, CompanionAction, EWalletAccount, EnvironmentContext, Preferences, Profile, SavingsGoal, ScheduledPayment, Transaction } from '../domain/models';
import { createInitialData, normalizeAppData } from '../domain/seed';

interface AppDataContextValue {
  data: AppData;
  ready: boolean;
  lastAction: CompanionAction | null;
  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): void;
  deleteTransaction(id: string): void;
  saveGoal(goal: SavingsGoal): void;
  deleteGoal(id: string): void;
  saveCategory(category: BudgetCategory): void;
  saveWallet(wallet: EWalletAccount): void;
  deleteWallet(id: string): void;
  saveScheduledPayment(payment: ScheduledPayment): void;
  deleteScheduledPayment(id: string): void;
  payScheduledPayment(id: string, paidOn?: string): void;
  updateProfile(profile: Partial<Profile>): void;
  updatePreferences(preferences: Partial<Preferences>): void;
  announceAction(action: Omit<CompanionAction, 'id' | 'occurredAt'>): void;
  clearAction(): void;
  rememberCompanionMessage(message: string): void;
  updateEnvironment(environment: Partial<EnvironmentContext>): void;
  importData(data: AppData): void;
  resetData(): Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(createInitialData);
  const [ready, setReady] = useState(false);
  const [lastAction, setLastAction] = useState<CompanionAction | null>(null);

  const announceAction = useCallback((action: Omit<CompanionAction, 'id' | 'occurredAt'>) => {
    setLastAction({ ...action, id: makeId(), occurredAt: new Date().toISOString() });
  }, []);
  const clearAction = useCallback(() => setLastAction(null), []);

  useEffect(() => {
    appStorage.load().then((saved) => {
      setData(saved);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) void appStorage.save(data);
  }, [data, ready]);

  const addTransaction = useCallback((input: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction = { ...input, id: makeId(), createdAt: new Date().toISOString() };
    setData((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
      wallets: input.walletId
        ? current.wallets.map((wallet) => wallet.id === input.walletId
          ? { ...wallet, balance: wallet.balance + (input.kind === 'income' ? input.amount : -input.amount) }
          : wallet)
        : current.wallets,
    }));
    announceAction({ operation: 'create', entity: 'transaction', label: input.kind, amount: input.amount });
  }, [announceAction]);

  const deleteTransaction = useCallback((id: string) => {
    setData((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== id) }));
    announceAction({ operation: 'delete', entity: 'transaction' });
  }, [announceAction]);

  const saveGoal = useCallback((goal: SavingsGoal) => {
    const exists = data.goals.some((item) => item.id === goal.id);
    setData((current) => ({
      ...current,
      goals: current.goals.some((item) => item.id === goal.id)
        ? current.goals.map((item) => item.id === goal.id ? goal : item)
        : [goal, ...current.goals],
    }));
    announceAction({ operation: exists ? 'edit' : 'create', entity: 'goal', label: goal.name, amount: goal.currentAmount });
  }, [data.goals, announceAction]);

  const deleteGoal = useCallback((id: string) => {
    setData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) }));
    announceAction({ operation: 'delete', entity: 'goal' });
  }, [announceAction]);

  const saveCategory = useCallback((category: BudgetCategory) => {
    setData((current) => {
      const previous = current.categories.find((item) => item.id === category.id);
      const renamed = previous && previous.name !== category.name;
      return {
        ...current,
        categories: previous ? current.categories.map((item) => item.id === category.id ? category : item) : [...current.categories, category],
        transactions: renamed ? current.transactions.map((item) => item.category === previous.name ? { ...item, category: category.name } : item) : current.transactions,
        scheduledPayments: renamed ? current.scheduledPayments.map((item) => item.category === previous.name ? { ...item, category: category.name } : item) : current.scheduledPayments,
      };
    });
    announceAction({ operation: 'edit', entity: 'category', label: category.name, amount: category.monthlyLimit });
  }, [announceAction]);

  const saveWallet = useCallback((wallet: EWalletAccount) => {
    const exists = data.wallets.some((item) => item.id === wallet.id);
    setData((current) => ({
      ...current,
      wallets: current.wallets.some((item) => item.id === wallet.id)
        ? current.wallets.map((item) => item.id === wallet.id ? wallet : item)
        : [...current.wallets, wallet],
    }));
    announceAction({ operation: exists ? 'edit' : 'create', entity: 'wallet', label: wallet.name, amount: wallet.balance });
  }, [data.wallets, announceAction]);

  const deleteWallet = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      wallets: current.wallets.filter((wallet) => wallet.id !== id),
      scheduledPayments: current.scheduledPayments.map((payment) => payment.walletId === id ? { ...payment, walletId: undefined } : payment),
    }));
    announceAction({ operation: 'delete', entity: 'wallet' });
  }, [announceAction]);

  const saveScheduledPayment = useCallback((payment: ScheduledPayment) => {
    const exists = data.scheduledPayments.some((item) => item.id === payment.id);
    setData((current) => ({
      ...current,
      scheduledPayments: current.scheduledPayments.some((item) => item.id === payment.id)
        ? current.scheduledPayments.map((item) => item.id === payment.id ? payment : item)
        : [...current.scheduledPayments, payment],
    }));
    announceAction({ operation: exists ? 'edit' : 'create', entity: 'payment', label: payment.name, amount: payment.amount });
  }, [data.scheduledPayments, announceAction]);

  const deleteScheduledPayment = useCallback((id: string) => {
    setData((current) => ({ ...current, scheduledPayments: current.scheduledPayments.filter((payment) => payment.id !== id) }));
    announceAction({ operation: 'delete', entity: 'payment' });
  }, [announceAction]);

  const payScheduledPayment = useCallback((id: string, paidOn = new Date().toISOString().slice(0, 10)) => {
    const payment = data.scheduledPayments.find((item) => item.id === id);
    setData((current) => {
      const payment = current.scheduledPayments.find((item) => item.id === id);
      if (!payment || !payment.active) return current;
      const occurredAt = new Date(`${paidOn}T12:00:00`).toISOString();
      const transaction: Transaction = {
        id: makeId(), kind: 'expense', amount: payment.amount, category: payment.category,
        note: payment.name, occurredAt, createdAt: new Date().toISOString(), walletId: payment.walletId,
      };
      return {
        ...current,
        transactions: [transaction, ...current.transactions],
        wallets: payment.walletId
          ? current.wallets.map((wallet) => wallet.id === payment.walletId ? { ...wallet, balance: wallet.balance - payment.amount } : wallet)
          : current.wallets,
        scheduledPayments: current.scheduledPayments.map((item) => item.id === id
          ? { ...item, lastPaidAt: occurredAt, active: item.recurrence !== 'once', nextDueDate: advanceDueDate(item.nextDueDate, item.recurrence) }
          : item),
      };
    });
    announceAction({ operation: 'pay', entity: 'payment', label: payment?.name, amount: payment?.amount });
  }, [data.scheduledPayments, announceAction]);

  const updateProfile = useCallback((profile: Partial<Profile>) => {
    setData((current) => ({ ...current, profile: { ...current.profile, ...profile } }));
    announceAction({ operation: 'edit', entity: 'profile' });
  }, [announceAction]);

  const updatePreferences = useCallback((preferences: Partial<Preferences>) => {
    setData((current) => ({ ...current, preferences: { ...current.preferences, ...preferences } }));
    announceAction({ operation: 'change', entity: 'theme', label: preferences.theme ?? preferences.mode ?? 'preference' });
  }, [announceAction]);

  const rememberCompanionMessage = useCallback((message: string) => {
    setData((current) => ({ ...current, companion: { ...current.companion, recentMessages: [...current.companion.recentMessages.filter((item) => item !== message), message].slice(-20) } }));
  }, []);

  const updateEnvironment = useCallback((environment: Partial<EnvironmentContext>) => {
    setData((current) => ({ ...current, companion: { ...current.companion, environment: { ...current.companion.environment, ...environment } } }));
    if (environment.locationChanged) announceAction({ operation: 'change', entity: 'settings', label: 'new-location' });
  }, [announceAction]);

  const importData = useCallback((next: AppData) => { setData(normalizeAppData(next)); announceAction({ operation: 'import', entity: 'data' }); }, [announceAction]);
  const resetData = useCallback(async () => {
    await appStorage.clear();
    setData(createInitialData());
    announceAction({ operation: 'reset', entity: 'data' });
  }, [announceAction]);

  const value = useMemo(() => ({
    data, ready, lastAction, addTransaction, deleteTransaction, saveGoal, deleteGoal,
    saveCategory, saveWallet, deleteWallet, saveScheduledPayment, deleteScheduledPayment, payScheduledPayment,
    updateProfile, updatePreferences, announceAction, clearAction, rememberCompanionMessage, updateEnvironment, importData, resetData,
  }), [data, ready, lastAction, addTransaction, deleteTransaction, saveGoal, deleteGoal, saveCategory, saveWallet, deleteWallet, saveScheduledPayment, deleteScheduledPayment, payScheduledPayment, updateProfile, updatePreferences, announceAction, clearAction, rememberCompanionMessage, updateEnvironment, importData, resetData]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export const useAppData = () => {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
};

function advanceDueDate(date: string, recurrence: ScheduledPayment['recurrence']) {
  if (recurrence === 'once') return date;
  const [year, month, day] = date.split('-').map(Number);
  if (recurrence === 'yearly') {
    const nextDay = month === 2 && day === 29 ? 28 : day;
    return toDateKey(new Date(year + 1, month - 1, nextDay));
  }
  const targetMonth = month === 12 ? 0 : month;
  const targetYear = month === 12 ? year + 1 : year;
  const daysInTarget = new Date(targetYear, targetMonth + 1, 0).getDate();
  return toDateKey(new Date(targetYear, targetMonth, Math.min(day, daysInTarget)));
}

const toDateKey = (date: Date) => [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-');
