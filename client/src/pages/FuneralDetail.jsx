import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import { formatMoney, formatDate } from '../format'
import { compressImage } from '../compressImage'

const METHODS = ['EFT', 'ECOCASH', 'EWALLET', 'CASH', 'OTHER']

export default function FuneralDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [funeral, setFuneral] = useState(null)
  const [roster, setRoster] = useState([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [amountDraft, setAmountDraft] = useState('')
  const [methodDraft, setMethodDraft] = useState('EFT')
  const [slipDraft, setSlipDraft] = useState(null)
  const [slipProcessing, setSlipProcessing] = useState(false)
  const [slipError, setSlipError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    return api
      .get(`/funerals/${id}`)
      .then((res) => {
        setFuneral(res.data.funeral)
        setRoster(res.data.roster)
      })
      .catch(() => setError('Could not load this funeral.'))
  }

  useEffect(() => {
    load()
  }, [id])

  function startEditing(row) {
    setEditingId(row.member.id)
    setAmountDraft(row.payment ? String(row.payment.amount) : '')
    setMethodDraft(row.payment?.method || 'EFT')
    setSlipDraft(row.payment?.slipImage || null)
    setSlipError('')
  }

  async function handleSlipSelected(file) {
    if (!file) return
    setSlipError('')
    setSlipProcessing(true)
    try {
      const dataUrl = await compressImage(file)
      setSlipDraft(dataUrl)
    } catch {
      setSlipError('Could not process that image — try a different photo.')
    } finally {
      setSlipProcessing(false)
    }
  }

  async function savePayment(memberId) {
    if (!amountDraft || Number.isNaN(Number(amountDraft))) return
    setBusyId(memberId)
    try {
      await api.put(`/funerals/${id}/payments/${memberId}`, {
        amount: Number(amountDraft),
        method: methodDraft,
        slipImage: slipDraft,
      })
      setEditingId(null)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function undoPayment(memberId) {
    if (!confirm('Remove this payment?')) return
    setBusyId(memberId)
    try {
      await api.delete(`/funerals/${id}/payments/${memberId}`)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function toggleClosed() {
    const nextStatus = funeral.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    const msg = nextStatus === 'CLOSED' ? 'Close this collection?' : 'Reopen this collection?'
    if (!confirm(msg)) return
    await api.patch(`/funerals/${id}`, { status: nextStatus })
    await load()
  }

  if (error) return <p className="text-[var(--color-danger)]">{error}</p>
  if (!funeral) return <p className="text-slate-400">Loading…</p>

  const filteredRoster = roster.filter((row) => {
    if (!q) return true
    const needle = q.toLowerCase()
    return (
      row.member.fullName.toLowerCase().includes(needle) ||
      String(row.member.memberNumber).includes(needle)
    )
  })

  const paidCount = roster.filter((r) => r.payment).length

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500">
        ← Back
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Funeral collection</p>
            <h1 className="text-xl font-bold text-slate-800">{funeral.deceasedName}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Opened {formatDate(funeral.dateOpened)}
              {funeral.beneficiaryMember ? ` · ${funeral.beneficiaryMember.fullName}'s family` : ''}
            </p>
          </div>
          <StatusBadge status={funeral.status} />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400">Total collected</p>
            <p className="text-3xl font-bold text-[var(--color-brand)]">{formatMoney(funeral.totalCollected)}</p>
          </div>
          <p className="text-sm text-slate-500">
            {paidCount} / {roster.length} paid
          </p>
        </div>

        {(funeral.collectionAccountNo || funeral.collectionEwallet || funeral.collectionEcocash) && (
          <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            {funeral.collectionAccountHolder && <p>Account holder: {funeral.collectionAccountHolder}</p>}
            {funeral.collectionBank && funeral.collectionAccountNo && (
              <p>
                {funeral.collectionBank}: {funeral.collectionAccountNo}
              </p>
            )}
            {funeral.collectionEwallet && <p>eWallet: {funeral.collectionEwallet}</p>}
            {funeral.collectionEcocash && <p>EcoCash: {funeral.collectionEcocash}</p>}
          </div>
        )}

        <button
          onClick={toggleClosed}
          className={`mt-4 w-full rounded-xl py-2 text-sm font-semibold ${
            funeral.status === 'OPEN'
              ? 'bg-slate-100 text-slate-600'
              : 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]'
          }`}
        >
          {funeral.status === 'OPEN' ? 'Close collection' : 'Reopen collection'}
        </button>
      </div>

      <div>
        <input
          placeholder="Search members…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-light)]"
        />

        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          {filteredRoster.map((row) => {
            const isEditing = editingId === row.member.id
            const isBusy = busyId === row.member.id

            return (
              <div key={row.member.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-sm font-bold text-[var(--color-brand-dark)]">
                      {row.member.memberNumber}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">{row.member.fullName}</p>
                      {row.payment && (
                        <p className="text-xs text-slate-400">{row.payment.method} · ref {row.payment.reference}</p>
                      )}
                    </div>
                  </div>

                  {row.payment ? (
                    <div className="flex shrink-0 items-center gap-2">
                      {row.payment.slipImage && (
                        <a href={row.payment.slipImage} target="_blank" rel="noreferrer">
                          <img
                            src={row.payment.slipImage}
                            alt="Payment slip"
                            className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        </a>
                      )}
                      <span className="font-semibold text-[var(--color-brand)]">{formatMoney(row.payment.amount)}</span>
                      <button
                        onClick={() => startEditing(row)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(row)}
                      className="shrink-0 rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
                    >
                      Mark paid
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        autoFocus
                        placeholder="Amount"
                        value={amountDraft}
                        onChange={(e) => setAmountDraft(e.target.value)}
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[var(--color-brand)] focus:outline-none"
                      />
                      <select
                        value={methodDraft}
                        onChange={(e) => setMethodDraft(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[var(--color-brand)] focus:outline-none"
                      >
                        {METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => savePayment(row.member.id)}
                        disabled={isBusy || slipProcessing}
                        className="rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1.5 text-sm text-slate-500">
                        Cancel
                      </button>
                      {row.payment && (
                        <button
                          onClick={() => undoPayment(row.member.id)}
                          disabled={isBusy}
                          className="ml-auto text-sm text-[var(--color-danger)]"
                        >
                          Remove payment
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {slipDraft ? (
                        <img src={slipDraft} alt="Payment slip preview" className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">
                          No slip
                        </div>
                      )}
                      <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        {slipProcessing ? 'Processing…' : slipDraft ? 'Replace slip' : 'Attach slip photo'}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handleSlipSelected(e.target.files?.[0])}
                        />
                      </label>
                      {slipDraft && (
                        <button
                          type="button"
                          onClick={() => setSlipDraft(null)}
                          className="text-sm text-[var(--color-danger)]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {slipError && <p className="text-sm text-[var(--color-danger)]">{slipError}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
