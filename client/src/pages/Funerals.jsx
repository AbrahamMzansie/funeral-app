import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import { formatMoney, formatDate } from '../format'

export default function Funerals() {
  const [funerals, setFunerals] = useState(null)

  useEffect(() => {
    api.get('/funerals').then((res) => setFunerals(res.data.funerals))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Funerals</h1>
        <Link
          to="/funerals/new"
          className="rounded-xl bg-[var(--color-brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          + New
        </Link>
      </div>

      {!funerals ? (
        <p className="text-slate-400">Loading…</p>
      ) : funerals.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
          No funerals recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {funerals.map((f) => (
            <Link
              key={f.id}
              to={`/funerals/${f.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:ring-[var(--color-brand)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{f.deceasedName}</p>
                  <p className="text-xs text-slate-400">
                    Opened {formatDate(f.dateOpened)}
                    {f.beneficiaryMember ? ` · ${f.beneficiaryMember.fullName}'s family` : ''}
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </div>
              <p className="mt-2 font-bold text-[var(--color-brand)]">{formatMoney(f.totalCollected)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
