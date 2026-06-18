import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import type { AppRoute } from '../../app/routes';
import { Avatar } from '../../components/Avatar';
import { BulsaIcon, type BulsaIconName } from '../../components/icons/BulsaIcon';
import { Modal } from '../../components/Modal';
import { ProgressBar } from '../../components/ProgressBar';
import { calculateSnapshot, categorySpend, formatMoney } from '../../domain/budget';
import type { BudgetCategory, TransactionKind } from '../../domain/models';
import { generateInsight } from '../insights/insightEngine';
import { CompanionCard } from '../mascot/CompanionCard';
import { TransactionForm } from '../transactions/TransactionForm';
import { TransactionList } from '../transactions/TransactionList';

const categoryIcons = new Set<BulsaIconName>(['food', 'transport', 'shopping', 'bill', 'fun', 'other']);
const getCategoryIcon = (category: BudgetCategory): BulsaIconName => categoryIcons.has(category.icon as BulsaIconName) ? category.icon as BulsaIconName : ({ Food: 'food', Transport: 'transport', Shopping: 'shopping', Bills: 'bill', Fun: 'fun' }[category.name] as BulsaIconName ?? 'other');

export function DashboardPage({ onNavigate }: { onNavigate(route: AppRoute): void }) {
  const { data, saveCategory } = useAppData();
  const [adding, setAdding] = useState<TransactionKind | null>(null);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const sessionStart = useRef(Date.now());
  const snapshot = useMemo(() => calculateSnapshot(data), [data]);
  const insight = useMemo(() => generateInsight(data, new Date(), sessionStart.current), [data]);
  const firstName = data.profile.name.trim().split(' ')[0] || 'friend';

  return <>
    <header className="topbar">
      <div><span className="eyebrow">Your money space</span><h1>Hi, {firstName} <span>✦</span></h1></div>
      <Avatar name={data.profile.name} src={data.profile.avatar} />
    </header>
    <CompanionCard insight={insight} />
    <section className="balance-card">
      <div className="balance-heading"><div><span>Wallet balance</span><h2>{formatMoney(snapshot.balance, data.profile.currency)}</h2></div><span className="balance-chip"><BulsaIcon name="sparkle" size={15} /> {Math.round(Math.max(0, 1 - snapshot.budgetUsed) * 100)}% left</span></div>
      <ProgressBar value={snapshot.budgetUsed} label="Monthly budget used" />
      <div className="balance-stats">
        <div><span><BulsaIcon name="income" size={16} /> Income</span><strong>{formatMoney(snapshot.income, data.profile.currency)}</strong></div>
        <div><span><BulsaIcon name="expense" size={16} /> Spent</span><strong>{formatMoney(snapshot.expenses, data.profile.currency)}</strong></div>
        <div><span><BulsaIcon name="wallet" size={16} /> Monthly budget remaining</span><strong>{formatMoney(snapshot.available, data.profile.currency)}</strong></div>
      </div>
    </section>
    <section className="quick-actions" aria-label="Quick actions">
      <button onClick={() => setAdding('expense')}><span className="action-icon expense"><BulsaIcon name="expense" size={24} /></span><span>Expense</span></button>
      <button onClick={() => setAdding('income')}><span className="action-icon income"><BulsaIcon name="income" size={24} /></span><span>Income</span></button>
      <button onClick={() => setAdding('savings')}><span className="action-icon savings"><BulsaIcon name="savings" size={24} /></span><span>Save</span></button>
      <button onClick={() => setAdding('keep')}><span className="action-icon keep"><BulsaIcon name="wallet" size={24} /></span><span>Keep</span></button>
    </section>
    <section className="section-block">
      <div className="section-title"><div><span className="eyebrow">Gentle guardrails</span><h2>Monthly category limits</h2></div><span className="section-hint">Tap a card to edit</span></div>
      <div className="category-grid">
        {data.categories.slice(0, 6).map((category) => {
          const spent = categorySpend(data, category.name);
          const ratio = category.monthlyLimit > 0 ? spent / category.monthlyLimit : 0;
          return <button type="button" className="category-card surface" key={category.id} onClick={() => setEditingCategory(category)} aria-label={`Edit ${category.name} monthly limit`}>
            <div><span className="category-emoji" style={{ background: `${category.color}20`, color: category.color }}><BulsaIcon name={getCategoryIcon(category)} size={21} /></span><span className="category-edit"><BulsaIcon name="edit" size={14} /> {Math.round(ratio * 100) || 0}%</span></div>
            <h3>{category.name}</h3>
            <p><strong>{formatMoney(spent, data.profile.currency)}</strong> spent this month</p>
            <small>{formatMoney(category.monthlyLimit, data.profile.currency)} monthly limit</small>
            <ProgressBar value={ratio} color={category.color} label={`${category.name} monthly budget used`} />
          </button>;
        })}
      </div>
    </section>
    <section className="section-block">
      <div className="section-title"><div><span className="eyebrow">Fresh from the wallet</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => onNavigate('activity')}>See reports <BulsaIcon name="arrow-right" size={17} /></button></div>
      <div className="surface list-surface"><TransactionList transactions={data.transactions.slice(0, 4)} currency={data.profile.currency} compact /></div>
    </section>
    {adding && <Modal title={`New ${adding}`} onClose={() => setAdding(null)}><TransactionForm initialKind={adding} onDone={() => setAdding(null)} /></Modal>}
    {editingCategory && <Modal title={`Edit ${editingCategory.name}`} onClose={() => setEditingCategory(null)}><CategoryEditor category={editingCategory} onSave={(category) => { saveCategory(category); setEditingCategory(null); }} /></Modal>}
  </>;
}

function CategoryEditor({ category, onSave }: { category: BudgetCategory; onSave(category: BudgetCategory): void }) {
  const [name, setName] = useState(category.name);
  const [limit, setLimit] = useState(String(category.monthlyLimit));
  const [color, setColor] = useState(category.color);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() && Number(limit) >= 0) onSave({ ...category, name: name.trim(), monthlyLimit: Number(limit), color });
  };
  return <form className="standard-form" onSubmit={submit}>
    <p className="form-explainer">This is the maximum you want to spend in this category each month. Your recorded expenses fill the progress bar.</p>
    <label><span>Category name</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} required /></label>
    <label><span>Monthly spending limit</span><input type="number" min="0" step="100" value={limit} onChange={(event) => setLimit(event.target.value)} required /></label>
    <label><span>Accent color</span><div className="color-input"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /><span>{color.toUpperCase()}</span></div></label>
    <button className="primary-button full"><BulsaIcon name="check" size={18} /> Save category</button>
  </form>;
}
