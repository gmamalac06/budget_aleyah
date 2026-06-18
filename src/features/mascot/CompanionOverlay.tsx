import { useEffect, useState } from 'react';
import { useAppData } from '../../app/AppDataProvider';
import { BulsaIcon } from '../../components/icons/BulsaIcon';
import { generateActionReaction, type CompanionInsight } from '../insights/insightEngine';
import { WalletMascot } from './WalletMascot';

export function CompanionOverlay() {
  const { data, lastAction, clearAction, rememberCompanionMessage } = useAppData();
  const [reaction, setReaction] = useState<CompanionInsight | null>(null);

  useEffect(() => {
    if (!lastAction) return;
    const next = generateActionReaction(data, lastAction);
    setReaction(next);
    rememberCompanionMessage(next.message);
    const timer = window.setTimeout(() => { setReaction(null); clearAction(); }, 6500);
    return () => window.clearTimeout(timer);
    // The action id is the event boundary; data changes from memory updates must
    // not regenerate the same reaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAction?.id]);

  if (!reaction) return null;
  return <aside className="companion-overlay surface" aria-live="polite" aria-label="Bulsa reaction">
    <WalletMascot mood={reaction.mood} size={76} />
    <div><span className="eyebrow">Bulsa Mini · on-device</span><p>{reaction.message}</p></div>
    <button className="icon-button subtle" onClick={() => { setReaction(null); clearAction(); }} aria-label="Dismiss Bulsa reaction"><BulsaIcon name="close" size={17} /></button>
  </aside>;
}
