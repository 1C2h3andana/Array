const badgeStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  sent: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  declined: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  overdue: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  open: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const text = label ?? status.charAt(0).toUpperCase() + status.slice(1)
  const style = badgeStyles[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {text}
    </span>
  )
}
