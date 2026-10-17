import { Check } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../components/ui'

const CURRENCIES = ['USD — US Dollar', 'EUR — Euro', 'GBP — British Pound'] as const

interface SettingsState {
  businessName: string
  email: string
  currency: string
  notifyFollowUps: boolean
  notifyInvoices: boolean
}

const STORAGE_KEY = 'bizpilot.settings'

function loadSettings(): SettingsState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SettingsState
  } catch {
    // Ignore malformed stored values and fall back to defaults.
  }
  return {
    businessName: 'Acme Studio',
    email: 'hello@acmestudio.com',
    currency: CURRENCIES[0],
    notifyFollowUps: true,
    notifyInvoices: false,
  }
}

export function Settings() {
  const [form, setForm] = useState<SettingsState>(loadSettings)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // Storage may be unavailable; the prototype still shows confirmation.
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

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
          Settings saved to this browser (prototype only).
        </p>
      ) : null}

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
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                Contact email
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
                Currency
              </label>
              <select
                id="currency"
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
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
                checked={form.notifyFollowUps}
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
                checked={form.notifyInvoices}
                onChange={(e) => update('notifyInvoices', e.target.checked)}
                className="h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Save changes
          </button>
          <p className="text-xs text-slate-400">
            Prototype notice: preferences are stored in this browser only, not on a server.
          </p>
        </div>
      </form>
    </div>
  )
}
