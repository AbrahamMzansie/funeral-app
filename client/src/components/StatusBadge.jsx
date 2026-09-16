const STYLES = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  PROBATIONARY: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-700',
  OPEN: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-200 text-slate-600',
}

const LABELS = {
  ACTIVE: 'Active',
  PROBATIONARY: 'Probationary',
  CANCELLED: 'Cancelled',
  OPEN: 'Open',
  CLOSED: 'Closed',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {LABELS[status] || status}
    </span>
  )
}
