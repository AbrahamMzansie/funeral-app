import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatTile from '../components/StatTile'
import { formatMoney, formatDate } from '../format'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  if (error) return <p className="text-[var(--color-danger)]">{error}</p>
  if (!data) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of the society's funds and members</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Active members" value={data.activeMembers} sub={`${data.totalMembers} total`} />
        <StatTile label="Probationary" value={data.probationaryMembers} tone="warn" />
        <StatTile label="All-time collected" value={formatMoney(data.allTimeCollected)} tone="brand" />
        <StatTile label="Funerals recorded" value={data.closedFuneralsCount + data.openFunerals.length} tone="neutral" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Open collections</h2>
          <Link to="/funerals/new" className="text-sm font-medium text-[var(--color-brand)]">
            + New funeral
          </Link>
        </div>

        {data.openFunerals.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
            No open collections right now.
          </div>
        ) : (
          <div className="space-y-3">
            {data.openFunerals.map((f) => (
              <Link
                key={f.id}
                to={`/funerals/${f.id}`}
                className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-[var(--color-brand)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{f.deceasedName}</p>
                    <p className="text-xs text-slate-400">
                      Opened {formatDate(f.dateOpened)}
                      {f.beneficiaryMember ? ` · ${f.beneficiaryMember.fullName}'s family` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-brand)]">{formatMoney(f.totalCollected)}</p>
                    <p className="text-xs text-slate-400">{f.paidCount} paid</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
