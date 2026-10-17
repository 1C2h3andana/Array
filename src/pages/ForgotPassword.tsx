import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AuthShell } from '../components/AuthShell'
import { authErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()

    if (!email) {
      setError('Please enter the email on your account.')
      return
    }

    setError(null)
    setSubmitting(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (resetError) {
      setError(authErrorMessage(resetError))
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    setSent(true)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will email you a secure link to choose a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Back to log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="mt-6 space-y-4">
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800 ring-1 ring-inset ring-emerald-600/20"
          >
            If an account exists for that email, a reset link is on its way. The link expires
            shortly, so use it soon.
          </p>
          <Link
            to="/login"
            className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
              {error}
            </p>
          ) : null}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending link…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
