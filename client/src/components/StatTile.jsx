export default function StatTile({ label, value, sub, tone = 'brand' }) {
  const toneClasses = {
    brand: 'text-[var(--color-brand)]',
    danger: 'text-[var(--color-danger)]',
    warn: 'text-[var(--color-warn)]',
    neutral: 'text-slate-700',
  }[tone]

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClasses}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}
