export function ProgressBar({ value, color, label }: { value: number; color?: string; label?: string }) {
  const percent = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
      <span style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}
