import { Check } from 'lucide-react'
import { useState } from 'react'
import { LoadError, PageHeader } from '../components/ui'
import { useAuth } from '../lib/auth-context'
import { fetchBusinessSettings, updateBusinessSettings } from '../lib/data'
import { toErrorMessage } from '../lib/errors'
import { useAsyncData } from '../hooks/useAsyncData'
import type { BusinessSettingsPatch } from '../lib/data'

const CURRENCIES = ['USD', 'EUR', 'GBP'] as const

const CURRENCY_LABELS: Record<string, string> = {
  USD: 'USD — US Dollar',
  EUR: 'EUR — Euro',
  GBP: 'GBP — British Pound',
}

export function Settings() {
  const { profile, session } = useAuth()
  const businessId = profile?.businessId
  const { data, loading, error, reload } = useAsyncData(
    async () => (businessId ? await fetchBusinessSettings(businessId) : null),
    [businessId],
  )

  const [form, setForm] = useState<Partial<BusinessSettingsPatch> | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function update<K extends keyof BusinessSettingsPatch>(key: K, value: BusinessSettingsPatch[K]) {
    setForm((prev) => ({ ...(prev ?? {}), [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!businessId) return
    const name = (form?.name ?? data?.name ?? '').trim()
    const contactEmail = (form?.contactEmail ?? data?.contactEmail ?? '').trim()
    if (!name) {
      setSaveError('Your business needs a name.')
      return
    }

    setSaveError(null)
    setSaving(true)
    try {
      await updateBusinessSettings(businessId, {
        name,
        contactEmail,
        currency: form?.currency ?? data?.currency ?? 'USD',
        notifyFollowUps: form?.notifyFollowUps ?? data?.notifyFollowUps ?? true,
        notifyInvoices: form?.notifyInvoices ?? data?.notifyInvoices ?? false,
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(toErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const accountEmail = session?.user?.email ?? '—'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Workspace preferences for your BizPilot AI account."
      />

      {saved ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Settings saved to your workspace.
        </p>
      ) : null}

      {error ? (
        <LoadError message={error} onRetry={reload} />
      ) : loading || !data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section aria-labelledby="business-settings" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 id="business-settings" className="text-sm font-semibold text-slate-900">
              Business profile
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="business-name" className="block text-sm font-medium text-slate-700">
                  Business name
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={form?.name ?? data.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label htmlFor="account-email" className="block text-sm font-medium text-slate-700">
                  Account email
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={accountEmail}
                  readOnly
                  aria-readonly="true"
                  className="mt-1 block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                  Contact email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form?.contactEmail ?? data.contactEmail ?? ''}
                  onChange={(e) => update('contactEmail', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
                  Currency
                </label>
                <select
                  id="currency"
                  value={form?.currency ?? data.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {CURRENCY_LABELS[currency]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section aria-labelledby="notification-settings" className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 id="notification-settings" className="text-sm font-semibold text-slate-900">
              Notifications
            </h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                <span>
                  <span className="block text-sm font-medium text-slate-900">Follow-up reminders</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Show a nudge when a follow-up is due.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={form?.notifyFollowUps ?? data.notifyFollowUps}
                  onChange={(e) => update('notifyFollowUps', e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                <span>
                  <span className="block text-sm font-medium text-slate-900">Invoice alerts</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Flag invoices as soon as they become overdue.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={form?.notifyInvoices ?? data.notifyInvoices}
                  onChange={(e) => update('notifyInvoices', e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </section>

          {saveError ? (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
              {saveError}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <p className="text-xs text-slate-400">
              Changes are stored in your workspace and visible only to you.
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
