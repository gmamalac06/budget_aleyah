import { useState, type FormEvent } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import { BulsaIcon } from '../../components/icons/BulsaIcon';
import { Modal } from '../../components/Modal';
import { ProgressBar } from '../../components/ProgressBar';
import { formatMoney } from '../../domain/budget';
import type { SavingsGoal } from '../../domain/models';
import { WalletMascot } from '../mascot/WalletMascot';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;

export function GoalsPage() {
  const { data, saveGoal, deleteGoal } = useAppData();
  const [adding, setAdding] = useState(false);
  return <>
    <header className="page-header"><div><span className="eyebrow">A little closer every time</span><h1>Savings goals</h1><p>Dream it, name it, fund it slowly.</p></div><button className="primary-button" onClick={() => setAdding(true)}><BulsaIcon name="plus" size={19} /> New goal</button></header>
    <section className="goal-hero surface"><WalletMascot mood={data.goals.some((goal) => goal.currentAmount >= goal.targetAmount) ? 'celebrating' : 'proud'} size={120} /><div><span className="eyebrow">Future-you fund</span><h2>{formatMoney(data.goals.reduce((sum, goal) => sum + goal.currentAmount, 0), data.profile.currency)}</h2><p>saved across {data.goals.length} {data.goals.length === 1 ? 'dream' : 'dreams'}</p></div><BulsaIcon name="sparkle" size={25} className="goal-sparkle" /></section>
    <div className="goals-grid">
      {data.goals.map((goal) => <GoalCard key={goal.id} goal={goal} currency={data.profile.currency} onSave={saveGoal} onDelete={deleteGoal} />)}
      {!data.goals.length && <div className="empty-state surface"><span className="empty-illustration"><BulsaIcon name="goals" size={32} /></span><h3>Your next goal starts here</h3><p>Add something worth looking forward to.</p><button className="primary-button" onClick={() => setAdding(true)}>Create a goal</button></div>}
    </div>
    {adding && <Modal title="New savings goal" onClose={() => setAdding(false)}><GoalForm onSave={(goal) => { saveGoal(goal); setAdding(false); }} /></Modal>}
  </>;
}

function GoalCard({ goal, currency, onSave, onDelete }: { goal: SavingsGoal; currency: string; onSave(goal: SavingsGoal): void; onDelete(id: string): void }) {
  const [amount, setAmount] = useState('');
  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  return <article className="goal-card surface"><div className="goal-card-head"><span className="goal-emoji">{goal.emoji}</span><button className="delete-button" onClick={() => onDelete(goal.id)} aria-label={`Delete ${goal.name}`}><BulsaIcon name="trash" size={18} /></button></div><h2>{goal.name}</h2><p><strong>{formatMoney(goal.currentAmount, currency)}</strong> <span>of {formatMoney(goal.targetAmount, currency)}</span></p><ProgressBar value={progress} label={`${goal.name} progress`} /><div className="goal-progress-label"><span>{Math.round(progress * 100)}% funded</span><span>{formatMoney(Math.max(0, goal.targetAmount - goal.currentAmount), currency)} to go</span></div>{progress < 1 ? <form className="goal-contribute" onSubmit={(event) => { event.preventDefault(); const value = Number(amount); if (value > 0) { onSave({ ...goal, currentAmount: Math.min(goal.targetAmount, goal.currentAmount + value) }); setAmount(''); } }}><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Add amount" aria-label={`Contribute to ${goal.name}`} /><button className="secondary-button">Add</button></form> : <div className="goal-complete"><BulsaIcon name="sparkle" size={17} /> Goal complete!</div>}</article>;
}

function GoalForm({ onSave }: { onSave(goal: SavingsGoal): void }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [target, setTarget] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (name.trim() && Number(target) > 0) onSave({ id: makeId(), name: name.trim(), emoji, targetAmount: Number(target), currentAmount: 0 }); };
  return <form className="standard-form" onSubmit={submit}><div className="form-row compact"><label className="emoji-field"><span>Emoji</span><input value={emoji} onChange={(event) => setEmoji(event.target.value)} maxLength={4} /></label><label><span>Goal name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Japan trip" required /></label></div><label><span>Target amount</span><input type="number" min="1" step="1" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="50000" required /></label><button className="primary-button full">Create goal</button></form>;
}
