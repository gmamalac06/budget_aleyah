import { BulsaIcon, type BulsaIconName } from '../../components/icons/BulsaIcon';
import { formatMoney } from '../../domain/budget';
import type { Transaction } from '../../domain/models';

const meta = {
  expense: { icon: 'expense' as BulsaIconName, className: 'expense' },
  income: { icon: 'income' as BulsaIconName, className: 'income' },
  savings: { icon: 'savings' as BulsaIconName, className: 'savings' },
  keep: { icon: 'wallet' as BulsaIconName, className: 'keep' },
};

export function TransactionList({ transactions, currency, onDelete, compact = false }: { transactions: Transaction[]; currency: string; onDelete?(id: string): void; compact?: boolean }) {
  if (!transactions.length) return <div className="empty-state"><span className="empty-illustration"><BulsaIcon name="activity" size={31} /></span><h3>Nothing here yet</h3><p>Your first money move will show up here.</p></div>;
  return (
    <div className="transaction-list">
      {transactions.map((item) => {
        const { icon, className } = meta[item.kind];
        return <article className="transaction-item" key={item.id}>
          <span className={`transaction-icon ${className}`}><BulsaIcon name={icon} size={19} /></span>
          <div className="transaction-copy"><strong>{item.note || item.category}</strong><span>{item.category} · {new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(new Date(item.occurredAt))}</span></div>
          <strong className={`transaction-amount ${className}`}>{item.kind === 'income' ? '+' : '−'}{formatMoney(item.amount, currency)}</strong>
          {!compact && onDelete && <button className="delete-button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.note || item.category}`}><BulsaIcon name="trash" size={18} /></button>}
        </article>;
      })}
    </div>
  );
}
