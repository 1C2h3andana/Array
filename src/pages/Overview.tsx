import { AlertTriangle, ArrowRight, CircleDollarSign, FileText, Receipt, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { CardsSkeleton, TableSkeleton } from '../components/ui'
import { customers, followUps, invoices, quotations } from '../data/sampleData'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatCurrency, formatDate } from '../utils/format'

interface OverviewData {
  revenueCollected: number
  outstanding: number
  activeCustomers: number
  openQuotations: number
  recentInvoices: typeof invoices
  dueFollowUps: typeof followUps
}

function loadOverview(): OverviewData {
  const revenueCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const outstanding = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const activeCustomers = customers.filter((c) => c.status === 'active').length
  const openQuotations = quotations.filter(
    (q) => q.status === 'sent' || q.status === 'accepted',
  ).length

  return {
    revenueCollected,
    outstanding,
    activeCustomers,
    openQuotations,
    recentInvoices: invoices.slice(0, 4),
    dueFollowUps: followUps.filter((f) => f.status === 'open'),
  }
}

const statsConfig = [
  { key: 'revenueCollected', label: 'Revenue collected', icon: CircleDollarSign, href: '/app/invoices' },
  { key: 'outstanding', label: 'Outstanding balance', icon: AlertTriangle, href: '/app/invoices' },
  { key: 'activeCustomers', label: 'Active customers', icon: Users, href: '/app/customers' },
  { key: 'openQuotations', label: 'Open quotations', icon: FileText, href: '/app/quotations' },
] as const

export function Overview() {
  const { data, loading } = useAsyncData(loadOverview)

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <CardsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white">
            <TableSkeleton rows={4} columns={3} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <TableSkeleton rows={3} columns={3} />
          </div>
        </div>
      </div>
    )
  }

  const customerName = (id: string) => customers.find((c) => c.id === id)?.company ?? 'Unknown'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          A snapshot of how your business is doing this month.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map(({ key, label, icon: Icon, href }) => (
          <Link
            key={key}
            to={href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {key === 'revenueCollected' || key === 'outstanding'
                ? formatCurrency(data[key])
                : data[key]}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-invoices" className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 id="recent-invoices" className="text-sm font-semibold text-slate-900">
              Recent invoices
            </h2>
            <Link to="/app/invoices" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.recentInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {inv.number} · {customerName(inv.customerId)}
                  </p>
                  <p className="text-xs text-slate-500">Due {formatDate(inv.dueAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amount)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="due-follow-ups" className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 id="due-follow-ups" className="text-sm font-semibold text-slate-900">
              Follow-ups due
            </h2>
            <Link to="/app/follow-ups" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {data.dueFollowUps.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Receipt className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="mt-2 text-sm text-slate-500">Nothing due right now — you are all caught up.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.dueFollowUps.map((fu) => (
                <li key={fu.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-900">{fu.subject}</p>
                    <StatusBadge status={fu.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {customerName(fu.customerId)} · due {formatDate(fu.dueAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-xs text-slate-400">
        Prototype notice: all figures above come from sample data and are not connected to a live backend.
      </p>
    </div>
  )
}
