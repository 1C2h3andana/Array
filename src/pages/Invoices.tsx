import { Receipt, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState, PageHeader, TableSkeleton } from '../components/ui'
import { customers, invoices } from '../data/sampleData'
import { useAsyncData } from '../hooks/useAsyncData'
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from '../types'
import { formatCurrency, formatDate } from '../utils/format'

const statusFilters: Array<{ value: InvoiceStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

export function Invoices() {
  const { data, loading } = useAsyncData(() => invoices)
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.filter(
      (inv) =>
        (status === 'all' || inv.status === status) &&
        (!q ||
          inv.number.toLowerCase().includes(q) ||
          (customers
            .find((c) => c.id === inv.customerId)
            ?.company.toLowerCase()
            .includes(q) ??
            false)),
    )
  }, [data, status, query])

  const totals = useMemo(() => {
    if (!data) return null
    const paid = data
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)
    const outstanding = data
      .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0)
    return { paid, outstanding }
  }, [data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description={
          totals
            ? `${formatCurrency(totals.paid)} collected · ${formatCurrency(totals.outstanding)} outstanding`
            : 'Track what has been paid and what is still owed.'
        }
      />

      {loading || !data ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div aria-label="Filter invoices by status" className="flex flex-wrap gap-1.5">
              {statusFilters.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  onClick={() => setStatus(value)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    status === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="invoice-search" className="sr-only">
                Search invoices by number or company
              </label>
              <input
                id="invoice-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoices…"
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices match"
              description="No invoices match the current filters. Try a different status or clear your search."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <caption className="sr-only">List of invoices with status and amounts</caption>
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Invoice
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Customer
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Amount
                      </th>
                      <th scope="col" className="hidden px-4 py-3 text-left font-semibold text-slate-600 md:table-cell">
                        Due date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5 font-medium text-slate-900">{inv.number}</td>
                        <td className="px-4 py-3.5 text-slate-700">
                          {customers.find((c) => c.id === inv.customerId)?.company ?? 'Unknown customer'}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={inv.status} label={INVOICE_STATUS_LABELS[inv.status]} />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="hidden px-4 py-3.5 text-slate-600 md:table-cell">
                          {formatDate(inv.dueAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
