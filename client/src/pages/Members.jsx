import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Probationary', value: 'PROBATIONARY' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function Members() {
  const [members, setMembers] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      api
        .get('/members', { params: { q, status }, signal: controller.signal })
        .then((res) => setMembers(res.data.members))
        .catch((err) => {
          if (err.name !== 'CanceledError') console.error(err)
        })
    }, 250)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [q, status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Members</h1>
        <Link
          to="/members/new"
          className="rounded-xl bg-[var(--color-brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          + Add member
        </Link>
      </div>

      <input
        placeholder="Search by name or member number…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              status === f.value
                ? 'bg-[var(--color-brand)] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!members ? (
        <p className="text-slate-400">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-slate-400">No members found.</p>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          {members.map((m) => (
            <Link
              key={m.id}
              to={`/members/${m.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-sm font-bold text-[var(--color-brand-dark)]">
                  {m.memberNumber}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {m.fullName}
                    {m.hasBeenBeneficiary && <span title="Has previously received a payout"> ●</span>}
                  </p>
                  <p className="text-xs text-slate-400">{m.contributionsCount} contributions</p>
                </div>
              </div>
              <StatusBadge status={m.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
