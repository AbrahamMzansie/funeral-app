import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function NewMember() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ memberNumber: '', fullName: '', phone: '', status: 'PROBATIONARY' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/members', form)
      navigate(`/members/${res.data.member.id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add member.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Add member</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Member number (payment reference)</label>
          <input
            type="number"
            required
            value={form.memberNumber}
            onChange={(e) => update('memberNumber', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone (optional)</label>
          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
          >
            <option value="PROBATIONARY">Probationary (new member)</option>
            <option value="ACTIVE">Active</option>
          </select>
          <p className="mt-1 text-xs text-slate-400">New members become Active automatically after 3 contributions.</p>
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[var(--color-brand)] py-2.5 text-base font-semibold text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Add member'}
        </button>
      </form>
    </div>
  )
}
