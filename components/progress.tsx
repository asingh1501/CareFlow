export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div aria-label={label ?? `${value}% complete`}>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}
