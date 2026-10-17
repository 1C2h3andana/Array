import { Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState, LoadError, PageHeader, TableSkeleton } from '../components/ui'
import { fetchCustomers } from '../lib/data'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatCurrency, formatDate } from '../utils/format'

export function Customers() {
  const { data, loading, error, reload } = useAsyncData(fetchCustomers)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false),
    )
  }, [data, query])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Everyone you do business with, in one directory."
      />

      {error ? (
        <LoadError message={error} onRetry={reload} />
      ) : loading || !data ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="customer-search" className="sr-only">
              Search customers by name, company or email
            </label>
            <input
              id="customer-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers…"
              className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                query
                  ? `No customer matches “${query}”. Try a different name, company or email.`
                  : 'Your customer directory is empty. Add your first customer to get started.'
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <caption className="sr-only">List of customers with contact details and status</caption>
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Customer
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Contact
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                        Total spend
                      </th>
                      <th scope="col" className="hidden px-4 py-3 text-left font-semibold text-slate-600 md:table-cell">
                        Since
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-500">{customer.company ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-slate-700">{customer.email ?? '—'}</p>
                          <p className="text-xs text-slate-500">{customer.phone ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={customer.status} />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900">
                          {formatCurrency(customer.totalSpend)}
                        </td>
                        <td className="hidden px-4 py-3.5 text-slate-600 md:table-cell">
                          {formatDate(customer.createdAt)}
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
