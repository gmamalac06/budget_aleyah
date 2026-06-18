import type { CompanionInsight } from '../insights/insightEngine';
import { WalletMascot } from './WalletMascot';

export function CompanionCard({ insight }: { insight: CompanionInsight }) {
  return (
    <section className="companion-card surface" aria-live="polite">
      <WalletMascot mood={insight.mood} size={142} />
      <div className="speech-bubble">
        <span className="eyebrow">Bulsa says</span>
        <p>{insight.message}</p>
      </div>
    </section>
  );
}
