import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">BizPilot AI</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        {children}
        {footer ? (
          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm">{footer}</div>
        ) : null}
      </div>
      <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-slate-400">
        Your account and workspace are protected by Supabase authentication. Business data is
        private to your workspace.
      </p>
    </div>
  )
}
