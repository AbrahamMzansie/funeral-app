import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import { formatMoney, formatDate } from '../format'

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    return api
      .get(`/members/${id}`)
      .then((res) => setMember(res.data.member))
      .catch(() => setError('Could not load this member.'))
  }

  useEffect(() => {
    load()
  }, [id])

  async function toggleCancelled() {
    if (!member) return
    const nextStatus = member.status === 'CANCELLED' ? 'PROBATIONARY' : 'CANCELLED'
    const confirmMsg =
      nextStatus === 'CANCELLED'
        ? `Cancel ${member.fullName}'s membership?`
        : `Reactivate ${member.fullName}'s membership?`
    if (!confirm(confirmMsg)) return

    setBusy(true)
    try {
      await api.patch(`/members/${id}`, { status: nextStatus })
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (error) return <p className="text-[var(--color-danger)]">{error}</p>
  if (!member) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500">
        ← Back
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Member No. {member.memberNumber}</p>
            <h1 className="text-xl font-bold text-slate-800">{member.fullName}</h1>
            {member.phone && <p className="mt-0.5 text-sm text-slate-500">{member.phone}</p>}
          </div>
          <StatusBadge status={member.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Contributions</p>
            <p className="font-semibold text-slate-700">{member.contributionsCount}</p>
          </div>
          <div>
            <p className="text-slate-400">Joined</p>
            <p className="font-semibold text-slate-700">{formatDate(member.joinedAt)}</p>
          </div>
        </div>

        {member.hasBeenBeneficiary && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            This member has previously received a payout from the society.
          </p>
        )}

        {member.notes && <p className="mt-3 text-sm text-slate-500">{member.notes}</p>}

        <button
          onClick={toggleCancelled}
          disabled={busy}
          className={`mt-4 w-full rounded-xl py-2 text-sm font-semibold ${
            member.status === 'CANCELLED'
              ? 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]'
              : 'bg-red-50 text-[var(--color-danger)]'
          }`}
        >
          {member.status === 'CANCELLED' ? 'Reactivate member' : 'Cancel member'}
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold text-slate-800">Payment history</h2>
        {member.payments.length === 0 ? (
          <p className="text-sm text-slate-400">No payments recorded in the app yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            {member.payments.map((p) => (
              <Link
                key={p.id}
                to={`/funerals/${p.funeralEventId}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{p.funeralEvent.deceasedName}</p>
                  <p className="text-xs text-slate-400">
                    {formatDate(p.paidAt)} · {p.method}
                  </p>
                </div>
                <p className="font-semibold text-[var(--color-brand)]">{formatMoney(p.amount)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
