import {
  BarChart3,
  Bot,
  Check,
  FileText,
  Menu,
  Receipt,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Users,
    title: 'Customer directory',
    description: 'Keep every contact, company and interaction in one organized place.',
  },
  {
    icon: FileText,
    title: 'Quotation pipeline',
    description: 'Draft quotes, track what was sent, accepted or declined at a glance.',
  },
  {
    icon: Receipt,
    title: 'Invoice tracking',
    description: 'See paid, pending and overdue invoices without a spreadsheet.',
  },
  {
    icon: Zap,
    title: 'Follow-up reminders',
    description: 'A focused queue so promising conversations never go cold.',
  },
  {
    icon: BarChart3,
    title: 'Business overview',
    description: 'Revenue, outstanding balance and pipeline health on one screen.',
  },
  {
    icon: Bot,
    title: 'AI assistant',
    description:
      'Ask about your numbers and get quick summaries, computed in-app from your data.',
  },
]

const dashboardHighlights = [
  'Sidebar navigation built for daily use',
  'Your own secure workspace — data is never shared between businesses',
  'Loading and empty states throughout',
  'Works on phones, tablets and desktops',
]

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-tight">BizPilot AI</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
              Features
            </a>
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Get started
            </Link>
          </nav>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-menu" className="border-t border-slate-200 px-4 py-3 md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>
                Features
              </a>
              <Link to="/login" className="text-sm text-slate-600" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </nav>
        ) : null}
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Built for small businesses
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Run your whole business from one clean workspace
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                BizPilot AI brings your customers, quotations, invoices and follow-ups
                together — with an AI assistant to answer questions about your numbers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Start for free
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log in to demo
                </Link>
              </div>
              <ul className="mt-8 space-y-2">
                {dashboardHighlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  This month at a glance
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-xs text-indigo-700">Revenue</p>
                    <p className="mt-1 text-xl font-semibold text-indigo-900">$22,100</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-700">Outstanding</p>
                    <p className="mt-1 text-xl font-semibold text-amber-900">$13,530</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Quotation QT-2042 accepted', tone: 'text-emerald-600' },
                  { label: 'Invoice INV-4150 is overdue', tone: 'text-rose-600' },
                  { label: '3 follow-ups due this week', tone: 'text-slate-600' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <span className={`h-2 w-2 rounded-full ${row.tone.replace('text-', 'bg-')}`} aria-hidden="true" />
                    <p className="text-sm text-slate-700">{row.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Everything a small business needs
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Each module is designed to be clear on day one — no setup marathons,
              no training videos required.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
                    <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl bg-indigo-600 px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Get your own workspace
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Create an account and the dashboard is yours — every workspace is
              isolated with row-level security. BizPilot does not process payments,
              and the assistant is an in-app calculator, not a live AI service.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Create your workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-sm text-slate-500">© 2026 BizPilot AI</p>
          <p className="text-xs text-slate-400">
            No payment processing. The assistant computes answers in-app, not via a live AI service.
          </p>
        </div>
      </footer>
    </div>
  )
}
