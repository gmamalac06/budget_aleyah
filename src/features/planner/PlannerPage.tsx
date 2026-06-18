import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import { BulsaIcon } from '../../components/icons/BulsaIcon';
import { Modal } from '../../components/Modal';
import { formatMoney } from '../../domain/budget';
import type { BillKind, BillRecurrence, EWalletAccount, EWalletProvider, ScheduledPayment } from '../../domain/models';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const toDateKey = (date: Date) => [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-');
const todayKey = () => toDateKey(new Date());

const providerMeta: Record<EWalletProvider, { label: string; short: string; color: string }> = {
  gcash: { label: 'GCash', short: 'G', color: '#1673EA' },
  maya: { label: 'Maya', short: 'M', color: '#22B957' },
  landbank: { label: 'Landbank', short: 'LB', color: '#168D53' },
  gotyme: { label: 'GoTyme', short: 'GT', color: '#6F56D9' },
  seabank: { label: 'SeaBank', short: 'S', color: '#F26735' },
  cash: { label: 'Cash', short: '₱', color: '#C98632' },
  other: { label: 'Other wallet', short: 'W', color: '#718096' },
};

export function PlannerPage() {
  const { data, saveWallet, deleteWallet, saveScheduledPayment, deleteScheduledPayment, payScheduledPayment } = useAppData();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [paymentEditor, setPaymentEditor] = useState<ScheduledPayment | 'new' | null>(null);
  const [walletEditor, setWalletEditor] = useState<EWalletAccount | 'new' | null>(null);
  const dueOnSelected = data.scheduledPayments.filter((payment) => payment.active && payment.nextDueDate === selectedDate).sort((a, b) => a.name.localeCompare(b.name));
  const totalWalletBalance = data.wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const calendarDays = useMemo(() => {
    const firstWeekday = month.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekday + 1;
      return day >= 1 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null;
    });
  }, [month]);

  const changeMonth = (offset: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelectedDate(toDateKey(next));
  };

  return <>
    <header className="page-header"><div><span className="eyebrow">Never be surprised by a due date</span><h1>Money planner</h1><p>Bills, subscriptions, payments, and every wallet in one place.</p></div><button className="primary-button" onClick={() => setPaymentEditor('new')}><BulsaIcon name="plus" size={19} /> Add payment</button></header>
    <section className="planner-overview">
      <article className="planner-stat surface"><span className="planner-stat-icon"><BulsaIcon name="calendar" size={24} /></span><div><span>Upcoming this month</span><strong>{data.scheduledPayments.filter((item) => item.active && item.nextDueDate.slice(0, 7) === toDateKey(month).slice(0, 7)).length}</strong></div></article>
      <article className="planner-stat surface"><span className="planner-stat-icon wallet"><BulsaIcon name="wallet" size={24} /></span><div><span>Across your wallets</span><strong>{formatMoney(totalWalletBalance, data.profile.currency)}</strong></div></article>
    </section>
    <section className="calendar-layout">
      <article className="calendar-card surface">
        <header className="calendar-header"><button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Previous month"><BulsaIcon name="chevron-left" /></button><div><span className="eyebrow">Payment calendar</span><h2>{new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(month)}</h2></div><button className="icon-button" onClick={() => changeMonth(1)} aria-label="Next month"><BulsaIcon name="chevron-right" /></button></header>
        <div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{calendarDays.map((date, index) => {
          if (!date) return <span className="calendar-blank" key={`blank-${index}`} />;
          const key = toDateKey(date);
          const due = data.scheduledPayments.filter((payment) => payment.active && payment.nextDueDate === key);
          return <button key={key} className={`${key === selectedDate ? 'selected' : ''} ${key === todayKey() ? 'today' : ''}`} onClick={() => setSelectedDate(key)} aria-label={`${new Intl.DateTimeFormat('en-PH', { month: 'long', day: 'numeric' }).format(date)}${due.length ? `, ${due.length} scheduled` : ''}`}><span>{date.getDate()}</span>{due.length > 0 && <i className={`due-dot due-dot--${due[0].kind}`} />}{due.length > 1 && <small>{due.length}</small>}</button>;
        })}</div>
      </article>
      <aside className="day-agenda surface">
        <div className="day-agenda-head"><div><span className="eyebrow">Selected day</span><h2>{new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${selectedDate}T12:00:00`))}</h2></div><button className="icon-button" onClick={() => setPaymentEditor('new')} aria-label="Add payment on selected day"><BulsaIcon name="plus" size={18} /></button></div>
        {dueOnSelected.length ? <div className="agenda-list">{dueOnSelected.map((payment) => <article key={payment.id} className="agenda-item"><span className={`agenda-kind agenda-kind--${payment.kind}`}><BulsaIcon name={payment.kind === 'bill' ? 'bill' : payment.kind === 'subscription' ? 'subscription' : 'payment'} size={20} /></span><div><strong>{payment.name}</strong><span>{payment.recurrence} · {formatMoney(payment.amount, data.profile.currency)}</span></div><div className="agenda-actions"><button onClick={() => setPaymentEditor(payment)} aria-label={`Edit ${payment.name}`}><BulsaIcon name="edit" size={16} /></button><button className="pay-button" onClick={() => payScheduledPayment(payment.id, selectedDate)}>Mark paid</button></div></article>)}</div> : <div className="compact-empty"><BulsaIcon name="calendar" size={34} /><p>Nothing due on this day.</p><button className="text-button" onClick={() => setPaymentEditor('new')}>Schedule something <BulsaIcon name="arrow-right" size={16} /></button></div>}
      </aside>
    </section>
    <section className="wallet-section section-block">
      <div className="section-title"><div><span className="eyebrow">Your accounts, still offline</span><h2>E-wallets & cash</h2></div><button className="secondary-button" onClick={() => setWalletEditor('new')}><BulsaIcon name="plus" size={18} /> Add wallet</button></div>
      <div className="wallet-grid">{data.wallets.map((wallet) => { const provider = providerMeta[wallet.provider]; return <article className="ewallet-card surface" key={wallet.id} style={{ '--wallet-color': wallet.color } as CSSProperties}><div className="ewallet-top"><span className="wallet-brand">{provider.short}</span><button className="icon-button subtle" onClick={() => setWalletEditor(wallet)} aria-label={`Edit ${wallet.name}`}><BulsaIcon name="edit" size={16} /></button></div><span>{provider.label}{wallet.accountHint ? ` · •••• ${wallet.accountHint}` : ''}</span><h3>{wallet.name}</h3><strong>{formatMoney(wallet.balance, data.profile.currency)}</strong></article>; })}{!data.wallets.length && <button className="add-wallet-card surface" onClick={() => setWalletEditor('new')}><BulsaIcon name="wallet" size={32} /><strong>Add GCash, Maya, Landbank, or cash</strong><span>Balances stay only on this device.</span></button>}</div>
    </section>
    {paymentEditor && <Modal title={paymentEditor === 'new' ? 'Schedule a payment' : 'Edit scheduled payment'} onClose={() => setPaymentEditor(null)}><PaymentForm payment={paymentEditor === 'new' ? undefined : paymentEditor} defaultDate={selectedDate} wallets={data.wallets} categories={data.categories.map((item) => item.name)} onSave={(payment) => { saveScheduledPayment(payment); setPaymentEditor(null); }} onDelete={paymentEditor === 'new' ? undefined : (id) => { deleteScheduledPayment(id); setPaymentEditor(null); }} /></Modal>}
    {walletEditor && <Modal title={walletEditor === 'new' ? 'Add an e-wallet' : 'Edit wallet'} onClose={() => setWalletEditor(null)}><WalletForm wallet={walletEditor === 'new' ? undefined : walletEditor} onSave={(wallet) => { saveWallet(wallet); setWalletEditor(null); }} onDelete={walletEditor === 'new' ? undefined : (id) => { deleteWallet(id); setWalletEditor(null); }} /></Modal>}
  </>;
}

function PaymentForm({ payment, defaultDate, wallets, categories, onSave, onDelete }: { payment?: ScheduledPayment; defaultDate: string; wallets: EWalletAccount[]; categories: string[]; onSave(payment: ScheduledPayment): void; onDelete?(id: string): void }) {
  const [name, setName] = useState(payment?.name ?? '');
  const [kind, setKind] = useState<BillKind>(payment?.kind ?? 'bill');
  const [amount, setAmount] = useState(payment ? String(payment.amount) : '');
  const [nextDueDate, setNextDueDate] = useState(payment?.nextDueDate ?? defaultDate);
  const [recurrence, setRecurrence] = useState<BillRecurrence>(payment?.recurrence ?? 'monthly');
  const [category, setCategory] = useState(payment?.category ?? (categories.includes('Bills') ? 'Bills' : categories[0] ?? 'Other'));
  const [walletId, setWalletId] = useState(payment?.walletId ?? '');
  const submit = (event: FormEvent) => { event.preventDefault(); if (name.trim() && Number(amount) > 0) onSave({ id: payment?.id ?? makeId(), name: name.trim(), kind, amount: Number(amount), nextDueDate, recurrence, category, walletId: walletId || undefined, active: payment?.active ?? true, lastPaidAt: payment?.lastPaidAt }); };
  return <form className="standard-form" onSubmit={submit}><div className="kind-selector planner-kind">{(['bill', 'subscription', 'payment'] as BillKind[]).map((item) => <button type="button" key={item} className={kind === item ? 'selected' : ''} onClick={() => setKind(item)}><BulsaIcon name={item} size={19} />{item}</button>)}</div><label><span>Name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === 'subscription' ? 'Netflix' : kind === 'bill' ? 'Electric bill' : 'Loan payment'} required /></label><div className="form-row"><label><span>Amount</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label><span>Next due date</span><input type="date" value={nextDueDate} onChange={(event) => setNextDueDate(event.target.value)} required /></label></div><div className="form-row"><label><span>Repeats</span><select value={recurrence} onChange={(event) => setRecurrence(event.target.value as BillRecurrence)}><option value="once">Once</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label><label><span>Expense category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><label><span>Pay from <small>optional</small></span><select value={walletId} onChange={(event) => setWalletId(event.target.value)}><option value="">No linked wallet</option>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></label><button className="primary-button full"><BulsaIcon name="calendar" size={18} /> Save schedule</button>{onDelete && <button type="button" className="danger-button full" onClick={() => onDelete(payment!.id)}><BulsaIcon name="trash" size={17} /> Delete schedule</button>}</form>;
}

function WalletForm({ wallet, onSave, onDelete }: { wallet?: EWalletAccount; onSave(wallet: EWalletAccount): void; onDelete?(id: string): void }) {
  const [provider, setProvider] = useState<EWalletProvider>(wallet?.provider ?? 'gcash');
  const [name, setName] = useState(wallet?.name ?? providerMeta[wallet?.provider ?? 'gcash'].label);
  const [balance, setBalance] = useState(wallet ? String(wallet.balance) : '');
  const [accountHint, setAccountHint] = useState(wallet?.accountHint ?? '');
  const meta = providerMeta[provider];
  const submit = (event: FormEvent) => { event.preventDefault(); if (name.trim()) onSave({ id: wallet?.id ?? makeId(), provider, name: name.trim(), balance: Number(balance) || 0, color: meta.color, accountHint: accountHint.replace(/\D/g, '').slice(-4) || undefined }); };
  return <form className="standard-form" onSubmit={submit}><label><span>Wallet provider</span><select value={provider} onChange={(event) => { const next = event.target.value as EWalletProvider; setProvider(next); if (!wallet || name === providerMeta[provider].label) setName(providerMeta[next].label); }}>{Object.entries(providerMeta).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><label><span>Wallet name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="My GCash" required /></label><div className="form-row"><label><span>Current balance</span><input type="number" step="0.01" value={balance} onChange={(event) => setBalance(event.target.value)} placeholder="0" /></label><label><span>Last 4 digits <small>optional</small></span><input inputMode="numeric" value={accountHint} onChange={(event) => setAccountHint(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" maxLength={4} /></label></div><p className="form-explainer">Bulsa stores only the nickname, optional last four digits, and your manually entered balance—never a PIN or password.</p><button className="primary-button full"><BulsaIcon name="wallet" size={18} /> Save wallet</button>{onDelete && <button type="button" className="danger-button full" onClick={() => onDelete(wallet!.id)}><BulsaIcon name="trash" size={17} /> Remove wallet</button>}</form>;
}
