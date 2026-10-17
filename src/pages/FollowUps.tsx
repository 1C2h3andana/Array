import { CheckCircle2, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState, LoadError, PageHeader, TableSkeleton } from '../components/ui'
import { toErrorMessage } from '../lib/errors'
import { completeFollowUp, fetchFollowUps } from '../lib/data'
import { useAsyncData } from '../hooks/useAsyncData'
import type { FollowUp } from '../types'
import { formatDate } from '../utils/format'

type Tab = 'open' | 'completed'

export function FollowUps() {
  const { data, loading, error, reload } = useAsyncData(fetchFollowUps)
  const [items, setItems] = useState<FollowUp[] | null>(null)
  const [tab, setTab] = useState<Tab>('open')
  const [actionError, setActionError] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const current = items ?? data
  const visible = useMemo(
    () => (current ? current.filter((f) => f.status === tab) : []),
    [current, tab],
  )

  async function markDone(id: string) {
    if (!current) return
    setActionError(null)
    setCompletingId(id)
    try {
      await completeFollowUp(id)
      // Optimistic update only after the write succeeds.
      setItems(current.map((f) => (f.id === id ? { ...f, status: 'completed' } : f)))
    } catch (err) {
      setActionError(toErrorMessage(err))
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="A focused queue of conversations that should not go cold."
      />

      {error ? (
        <LoadError message={error} onRetry={reload} />
      ) : loading || !current ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <TableSkeleton rows={3} columns={3} />
        </div>
      ) : (
        <>
          <div aria-label="Filter follow-ups by status" className="flex gap-1.5">
            {(
              [
                { value: 'open', label: 'Open' },
                { value: 'completed', label: 'Completed' },
              ] as Array<{ value: Tab; label: string }>
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tab === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {actionError ? (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
              {actionError}
            </p>
          ) : null}

          {visible.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={tab === 'open' ? 'You are all caught up' : 'Nothing completed yet'}
              description={
                tab === 'open'
                  ? 'There are no open follow-ups right now. New reminders will appear here.'
                  : 'Follow-ups you mark as done will show up in this list.'
              }
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((followUp) => (
                <li
                  key={followUp.id}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{followUp.subject}</h2>
                        <StatusBadge status={followUp.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{followUp.notes}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {followUp.customerCompany ?? 'Unknown customer'} ·{' '}
                        {followUp.dueAt ? `due ${formatDate(followUp.dueAt)}` : 'no due date'}
                      </p>
                    </div>
                    {followUp.status === 'open' ? (
                      <button
                        type="button"
                        onClick={() => markDone(followUp.id)}
                        disabled={completingId !== null}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        {completingId === followUp.id ? 'Saving…' : 'Mark done'}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
