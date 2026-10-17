import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthShell } from '../components/AuthShell'
import { useAuth } from '../lib/auth-context'
import { authErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

/**
 * Target of the "reset password" email link. supabase-js detects the recovery
 * code in the URL and starts a session; this screen then lets the user set a
 * new password.
 */
export function ResetPassword() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The recovery link lands here with a ?code= parameter. supabase-js detects
  // it and starts a session asynchronously, so keep showing the spinner until
  // that session arrives instead of flashing "link expired".
  const [recovering] = useState(() => new URLSearchParams(window.location.search).has('code'))

  if (loading || (recovering && !session)) {
    return (
      <AuthShell title="Preparing your reset link" subtitle="Verifying the link we emailed you…">
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden="true" />
          <span className="sr-only">Verifying link</span>
          {recovering && !session ? (
            <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Stuck here? Request a new link
            </Link>
          ) : null}
        </div>
      </AuthShell>
    )
  }

  if (!session) {
    return (
      <AuthShell
        title="Link expired"
        subtitle="This password reset link is invalid or has already been used."
        footer={
          <>
            Need a new one?{' '}
            <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Request another link
            </Link>
          </>
        }
      >
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-600/20">
          Reset links only work once. Request a fresh link and choose a new password within the
          email.
        </p>
      </AuthShell>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const confirm = String(data.get('confirm') ?? '')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }

    setError(null)
    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(authErrorMessage(updateError))
      setSubmitting(false)
      return
    }
    navigate('/app', { replace: true })
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick a strong password for your BizPilot AI account."
      footer={
        <Link to="/app" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Skip and go to your workspace
        </Link>
      }
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-describedby="password-hint"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <p id="password-hint" className="mt-1 text-xs text-slate-500">
            At least 8 characters.
          </p>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Updating password…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
