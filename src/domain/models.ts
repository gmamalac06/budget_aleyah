export type TransactionKind = 'income' | 'expense' | 'savings' | 'keep';
export type WalletMood = 'happy' | 'excited' | 'proud' | 'worried' | 'shocked' | 'sad' | 'sleepy' | 'thinking' | 'celebrating' | 'cold' | 'energized';
export type AppearanceMode = 'light' | 'dark' | 'system';
export type ThemeId = 'strawberry' | 'lavender' | 'matcha' | 'ocean' | 'sunset' | 'midnight' | 'mono';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  amount: number;
  category: string;
  note: string;
  occurredAt: string;
  createdAt: string;
  walletId?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export interface Profile {
  name: string;
  avatar?: string;
  currency: string;
  monthlyBudget: number;
  addressStyle: 'neutral' | 'ate' | 'kuya' | 'madam' | 'sir';
}

export interface Preferences {
  theme: ThemeId;
  mode: AppearanceMode;
  glass: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  notificationFrequency: 'gentle' | 'hourly';
  locationContextEnabled: boolean;
  weatherContextEnabled: boolean;
}

export interface EnvironmentContext {
  coarseLocation?: { latitude: number; longitude: number; capturedAt: string };
  locationChanged: boolean;
  weather?: { temperature: number; weatherCode: number; capturedAt: string };
}

export interface CompanionMemory {
  recentMessages: string[];
  environment: EnvironmentContext;
}

export interface CompanionAction {
  id: string;
  operation: 'create' | 'edit' | 'delete' | 'pay' | 'change' | 'import' | 'reset';
  entity: 'transaction' | 'goal' | 'category' | 'wallet' | 'payment' | 'profile' | 'theme' | 'settings' | 'data';
  label?: string;
  amount?: number;
  occurredAt: string;
}

export type BillKind = 'bill' | 'subscription' | 'payment';
export type BillRecurrence = 'once' | 'monthly' | 'yearly';

export interface ScheduledPayment {
  id: string;
  name: string;
  kind: BillKind;
  amount: number;
  nextDueDate: string;
  recurrence: BillRecurrence;
  category: string;
  walletId?: string;
  active: boolean;
  lastPaidAt?: string;
}

export type EWalletProvider = 'gcash' | 'maya' | 'landbank' | 'gotyme' | 'seabank' | 'cash' | 'other';

export interface EWalletAccount {
  id: string;
  provider: EWalletProvider;
  name: string;
  balance: number;
  color: string;
  accountHint?: string;
}

export interface AppData {
  version: 3;
  profile: Profile;
  preferences: Preferences;
  categories: BudgetCategory[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  scheduledPayments: ScheduledPayment[];
  wallets: EWalletAccount[];
  companion: CompanionMemory;
}

export interface BudgetSnapshot {
  income: number;
  expenses: number;
  savings: number;
  keep: number;
  balance: number;
  available: number;
  budgetUsed: number;
}
