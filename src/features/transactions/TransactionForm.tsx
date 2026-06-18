import { useMemo, useState, type FormEvent } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import { BulsaIcon, type BulsaIconName } from '../../components/icons/BulsaIcon';
import type { TransactionKind } from '../../domain/models';

const kinds = [
  { id: 'expense' as const, label: 'Expense', icon: 'expense' as BulsaIconName },
  { id: 'income' as const, label: 'Income', icon: 'income' as BulsaIconName },
  { id: 'savings' as const, label: 'Savings', icon: 'savings' as BulsaIconName },
  { id: 'keep' as const, label: 'Keep', icon: 'wallet' as BulsaIconName },
];

export function TransactionForm({ initialKind = 'expense', onDone }: { initialKind?: TransactionKind; onDone(): void }) {
  const { data, addTransaction } = useAppData();
  const [kind, setKind] = useState<TransactionKind>(initialKind);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(data.categories[0]?.name ?? 'Other');
  const [note, setNote] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const valid = useMemo(() => Number(amount) > 0 && date, [amount, date]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    addTransaction({ kind, amount: Number(amount), category: kind === 'expense' ? category : kind, note: note.trim(), occurredAt: new Date(`${date}T12:00:00`).toISOString(), walletId: walletId || undefined });
    onDone();
  };

  return (
    <form className="transaction-form" onSubmit={submit}>
      <div className="kind-selector">
        {kinds.map(({ id, label, icon }) => <button type="button" key={id} className={kind === id ? 'selected' : ''} onClick={() => setKind(id)}><BulsaIcon name={icon} size={18} />{label}</button>)}
      </div>
      <label className="amount-field"><span>Amount</span><div><b>{data.profile.currency === 'PHP' ? '₱' : data.profile.currency}</b><input autoFocus inputMode="decimal" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" aria-label="Amount" /></div></label>
      {kind === 'expense' && <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{data.categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>}
      <label><span>Account <small>optional</small></span><select value={walletId} onChange={(event) => setWalletId(event.target.value)}><option value="">No linked wallet</option>{data.wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></label>
      <div className="form-row"><label><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label><span>Note <small>optional</small></span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What was it for?" maxLength={80} /></label></div>
      <button className="primary-button full" disabled={!valid}>Save {kind}</button>
    </form>
  );
}
