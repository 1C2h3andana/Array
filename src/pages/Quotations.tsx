import { FileText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState, PageHeader, TableSkeleton } from '../components/ui'
import { customers, quotations } from '../data/sampleData'
import { useAsyncData } from '../hooks/useAsyncData'
import { QUOTATION_STATUS_LABELS, type Quotation, type QuotationStatus } from '../types'
import { formatCurrency, formatDate, formatQuotationTotal } from '../utils/format'

const statusFilters: Array<{ value: QuotationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
]

function QuotationRow({ quotation }: { quotation: Quotation }) {
  const customer = customers.find((c) => c.id === quotation.customerId)
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-4 py-3.5">
        <p className="font-medium text-slate-900">{quotation.number}</p>
        <p className="text-xs text-slate-500">{customer?.company ?? 'Unknown customer'}</p>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={quotation.status} label={QUOTATION_STATUS_LABELS[quotation.status]} />
      </td>
      <td className="px-4 py-3.5 text-slate-700">
        {quotation.items.length} item{quotation.items.length === 1 ? '' : 's'}
      </td>
      <td className="px-4 py-3.5 font-medium text-slate-900">
        {formatCurrency(formatQuotationTotal(quotation.items))}
      </td>
      <td className="hidden px-4 py-3.5 text-slate-600 md:table-cell">
        {formatDate(quotation.validUntil)}
      </td>
    </tr>
  )
}

export function Quotations() {
  const { data, loading } = useAsyncData(() => quotations)
  const [status, setStatus] = useState<QuotationStatus | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.filter(
      (qtn) =>
        (status === 'all' || qtn.status === status) &&
        (!q ||
          qtn.number.toLowerCase().includes(q) ||
          (customers
            .find((c) => c.id === qtn.customerId)
            ?.company.toLowerCase()
            .includes(q) ??
            false)),
    )
  }, [data, status, query])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Track every quote from draft to decision."
      />

      {loading || !data ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <TableSkeleton rows={4} columns={5} />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div aria-label="Filter quotations by status" className="flex flex-wrap gap-1.5">
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
              <label htmlFor="quotation-search" className="sr-only">
                Search quotations by number or company
              </label>
              <input
                id="quotation-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quotes…"
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No quotations match"
              description="No quotations match the current filters. Try a different status or clear your search."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <caption className="sr-only">List of quotations with status and totals</caption>
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Quotation
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Line items
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Total
                      </th>
                      <th scope="col" className="hidden px-4 py-3 text-left font-semibold text-slate-600 md:table-cell">
                        Valid until
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((quotation) => (
                      <QuotationRow key={quotation.id} quotation={quotation} />
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
