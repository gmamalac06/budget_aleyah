import type { AppData, BudgetSnapshot, Transaction } from './models';

export type ExpensePeriod = 'daily' | 'monthly' | 'overall';

export interface ExpenseSummary {
  expenses: number;
  income: number;
  savings: number;
  keep: number;
  net: number;
  transactionCount: number;
  averageExpense: number;
  categories: { name: string; amount: number; share: number }[];
}

const isThisMonth = (date: string, now = new Date()) => {
  const value = new Date(date);
  return value.getMonth() === now.getMonth() && value.getFullYear() === now.getFullYear();
};

export const getMonthlyTransactions = (transactions: Transaction[], now = new Date()) =>
  transactions.filter((transaction) => isThisMonth(transaction.occurredAt, now));

export const calculateSnapshot = (data: AppData, now = new Date()): BudgetSnapshot => {
  const current = getMonthlyTransactions(data.transactions, now);
  const total = (kind: Transaction['kind']) =>
    current.filter((item) => item.kind === kind).reduce((sum, item) => sum + item.amount, 0);
  const income = total('income');
  const expenses = total('expense');
  const savings = total('savings');
  const keep = total('keep');

  return {
    income,
    expenses,
    savings,
    keep,
    balance: income - expenses - savings - keep,
    available: Math.max(0, data.profile.monthlyBudget - expenses),
    budgetUsed: data.profile.monthlyBudget > 0 ? expenses / data.profile.monthlyBudget : 0,
  };
};

export const formatMoney = (amount: number, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

export const categorySpend = (data: AppData, category: string) =>
  getMonthlyTransactions(data.transactions)
    .filter((item) => item.kind === 'expense' && item.category === category)
    .reduce((sum, item) => sum + item.amount, 0);

export const getPeriodTransactions = (transactions: Transaction[], period: ExpensePeriod, now = new Date()) => {
  if (period === 'overall') return transactions;
  return transactions.filter((transaction) => {
    const date = new Date(transaction.occurredAt);
    if (period === 'daily') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
};

export const calculateExpenseSummary = (data: AppData, period: ExpensePeriod, now = new Date()): ExpenseSummary => {
  const transactions = getPeriodTransactions(data.transactions, period, now);
  const total = (kind: Transaction['kind']) => transactions.filter((item) => item.kind === kind).reduce((sum, item) => sum + item.amount, 0);
  const expenses = total('expense');
  const categoryTotals = new Map<string, number>();
  transactions.filter((item) => item.kind === 'expense').forEach((item) => categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0) + item.amount));
  const categories = [...categoryTotals.entries()]
    .map(([name, amount]) => ({ name, amount, share: expenses > 0 ? amount / expenses : 0 }))
    .sort((a, b) => b.amount - a.amount);
  const expenseCount = transactions.filter((item) => item.kind === 'expense').length;
  const income = total('income');
  const savings = total('savings');
  const keep = total('keep');
  return {
    expenses, income, savings, keep,
    net: income - expenses - savings - keep,
    transactionCount: transactions.length,
    averageExpense: expenseCount ? expenses / expenseCount : 0,
    categories,
  };
};
