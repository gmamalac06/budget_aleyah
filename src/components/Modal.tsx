import { useEffect, type ReactNode } from 'react';
import { BulsaIcon } from './icons/BulsaIcon';

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose(): void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal surface" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header><div><span className="eyebrow">Your Bulsa space</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><BulsaIcon name="close" size={20} /></button></header>
        {children}
      </section>
    </div>
  );
}
