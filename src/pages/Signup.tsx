import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthShell } from '../components/AuthShell'
import { authErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function Signup() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const business = String(data.get('business') ?? '').trim()

    if (!name || !email || !password || !business) {
      setError('All fields are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setError(null)
    setSubmitting(true)
    // The on_auth_user_created trigger in the database uses this metadata to
    // provision the user's profile and business workspace.
    const { data: result, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, business_name: business },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (signUpError) {
      setError(authErrorMessage(signUpError))
      setSubmitting(false)
      return
    }
    if (result.session) {
      navigate('/app', { replace: true })
      return
    }
    // Email confirmation is enabled: the user must verify before logging in.
    setAwaitingConfirmation(true)
    setSubmitting(false)
  }

  if (awaitingConfirmation) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="We sent you a confirmation link to finish creating your workspace."
        footer={
          <>
            Already confirmed?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </>
        }
      >
        <p className="mt-6 rounded-lg bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-800 ring-1 ring-inset ring-indigo-600/20">
          Click the link in the email we just sent you. Once confirmed, you can sign in and your
          business workspace will be ready.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Set up BizPilot AI for your business in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </>
      }
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label htmlFor="business" className="block text-sm font-medium text-slate-700">
            Business name
          </label>
          <input
            id="business"
            name="business"
            type="text"
            autoComplete="organization"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
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
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
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
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating workspace…' : 'Create workspace'}
        </button>
      </form>
    </AuthShell>
  )
}
