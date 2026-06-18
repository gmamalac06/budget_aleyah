import { useMemo, useState } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import { BulsaIcon } from '../../components/icons/BulsaIcon';
import { Modal } from '../../components/Modal';
import { calculateExpenseSummary, formatMoney, getPeriodTransactions, type ExpensePeriod } from '../../domain/budget';
import type { TransactionKind } from '../../domain/models';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';

const periods: { id: ExpensePeriod; label: string }[] = [
  { id: 'daily', label: 'Today' },
  { id: 'monthly', label: 'This month' },
  { id: 'overall', label: 'All time' },
];

export function ActivityPage() {
  const { data, deleteTransaction } = useAppData();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | TransactionKind>('all');
  const [period, setPeriod] = useState<ExpensePeriod>('monthly');
  const [query, setQuery] = useState('');
  const summary = useMemo(() => calculateExpenseSummary(data, period), [data, period]);
  const transactions = useMemo(() => getPeriodTransactions(data.transactions, period).filter((item) => (filter === 'all' || item.kind === filter) && `${item.note} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [data.transactions, period, filter, query]);

  return <>
    <header className="page-header"><div><span className="eyebrow">Your money, in context</span><h1>Spending reports</h1><p>Daily, monthly, and your complete history.</p></div><button className="primary-button" onClick={() => setAdding(true)}><BulsaIcon name="plus" size={19} /> Add</button></header>
    <div className="report-period" role="group" aria-label="Report period">{periods.map((item) => <button key={item.id} className={period === item.id ? 'active' : ''} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div>
    <section className="report-summary">
      <article className="report-main surface"><span className="report-icon expense"><BulsaIcon name="expense" size={23} /></span><div><span>Total expenses</span><strong>{formatMoney(summary.expenses, data.profile.currency)}</strong><small>{summary.transactionCount} money {summary.transactionCount === 1 ? 'move' : 'moves'} in this view</small></div></article>
      <article className="report-mini surface"><span>Income</span><strong className="income">{formatMoney(summary.income, data.profile.currency)}</strong><small>Money added</small></article>
      <article className="report-mini surface"><span>Net change</span><strong className={summary.net >= 0 ? 'income' : 'expense'}>{summary.net < 0 ? '−' : '+'}{formatMoney(Math.abs(summary.net), data.profile.currency)}</strong><small>After spending, saving & keep</small></article>
      <article className="report-mini surface"><span>Average expense</span><strong>{formatMoney(summary.averageExpense, data.profile.currency)}</strong><small>Per expense entry</small></article>
    </section>
    <section className="spending-breakdown surface">
      <div className="section-title"><div><span className="eyebrow">Where it went</span><h2>Expense breakdown</h2></div><BulsaIcon name="chart" size={24} /></div>
      {summary.categories.length ? <div className="breakdown-bars">{summary.categories.slice(0, 6).map((category, index) => <div className="breakdown-row" key={category.name}><div><strong>{category.name}</strong><span>{formatMoney(category.amount, data.profile.currency)}</span></div><div className="breakdown-track"><span style={{ width: `${Math.max(4, category.share * 100)}%`, opacity: 1 - index * .08 }} /></div><small>{Math.round(category.share * 100)}%</small></div>)}</div> : <div className="compact-empty"><BulsaIcon name="chart" size={28} /><p>No expenses in this period yet.</p></div>}
    </section>
    <section className="activity-tools surface"><label className="search-field"><BulsaIcon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></label><div className="filter-pills">{(['all', 'expense', 'income', 'savings', 'keep'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></section>
    <section className="surface list-surface activity-list"><TransactionList transactions={transactions} currency={data.profile.currency} onDelete={deleteTransaction} /></section>
    {adding && <Modal title="New transaction" onClose={() => setAdding(false)}><TransactionForm onDone={() => setAdding(false)} /></Modal>}
  </>;
}
