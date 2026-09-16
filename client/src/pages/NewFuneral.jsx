import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function NewFuneral() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    deceasedName: '',
    beneficiaryMemberId: '',
    collectionAccountNo: '',
    collectionAccountHolder: '',
    collectionBank: '',
    collectionEwallet: '',
    collectionEcocash: '',
    notes: '',
  })
  const [memberQuery, setMemberQuery] = useState('')
  const [memberOptions, setMemberOptions] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!memberQuery) {
      setMemberOptions([])
      return
    }
    const timeout = setTimeout(() => {
      api.get('/members', { params: { q: memberQuery, status: 'ACTIVE' } }).then((res) => setMemberOptions(res.data.members))
    }, 250)
    return () => clearTimeout(timeout)
  }, [memberQuery])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function pickMember(member) {
    setSelectedMember(member)
    update('beneficiaryMemberId', member.id)
    setMemberQuery('')
    setMemberOptions([])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/funerals', form)
      navigate(`/funerals/${res.data.funeral.id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create this funeral collection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold text-slate-800">New funeral collection</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Deceased's name</label>
          <input
            required
            value={form.deceasedName}
            onChange={(e) => update('deceasedName', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Member whose family this is (optional)</label>
          {selectedMember ? (
            <div className="flex items-center justify-between rounded-xl bg-[var(--color-brand-light)] px-3 py-2.5 text-sm">
              <span>
                #{selectedMember.memberNumber} — {selectedMember.fullName}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null)
                  update('beneficiaryMemberId', '')
                }}
                className="text-[var(--color-brand-dark)]"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                placeholder="Search member by name or number…"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
              />
              {memberOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
                  {memberOptions.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => pickMember(m)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      #{m.memberNumber} — {m.fullName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Where should members pay?</p>
          <div className="space-y-3">
            <input
              placeholder="Account holder"
              value={form.collectionAccountHolder}
              onChange={(e) => update('collectionAccountHolder', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Bank"
                value={form.collectionBank}
                onChange={(e) => update('collectionBank', e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
              />
              <input
                placeholder="Account no."
                value={form.collectionAccountNo}
                onChange={(e) => update('collectionAccountNo', e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="eWallet number"
                value={form.collectionEwallet}
                onChange={(e) => update('collectionEwallet', e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
              />
              <input
                placeholder="EcoCash number"
                value={form.collectionEcocash}
                onChange={(e) => update('collectionEcocash', e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[var(--color-brand)] py-2.5 text-base font-semibold text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Open collection'}
        </button>
      </form>
    </div>
  )
}
