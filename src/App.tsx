import { Database, KeyRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { useAuth } from './lib/auth-context'
import { supabaseConfigured } from './lib/supabase'
import { AIAssistant } from './pages/AIAssistant'
import { Customers } from './pages/Customers'
import { FollowUps } from './pages/FollowUps'
import { ForgotPassword } from './pages/ForgotPassword'
import { Invoices } from './pages/Invoices'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { Quotations } from './pages/Quotations'
import { ResetPassword } from './pages/ResetPassword'
import { Settings } from './pages/Settings'
import { Signup } from './pages/Signup'

function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-label={label}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullPageSpinner label="Checking your session" />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullPageSpinner label="Checking your session" />
  if (session) return <Navigate to="/app" replace />
  return <>{children}</>
}

function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Database className="h-5 w-5 text-amber-700" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Connect Supabase to continue</h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          BizPilot AI stores accounts and business data in Supabase, but this deployment has no
          credentials configured. Add the two variables below and restart the app.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          <li>
            1. Create a project at supabase.com and run the SQL files in{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">supabase/migrations/</code> from
            the SQL editor.
          </li>
          <li>
            2. In the project settings, copy the <strong>Project URL</strong> and the{' '}
            <strong>anon public key</strong> (never the service-role key).
          </li>
          <li>
            3. Put them in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.local</code>:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs leading-relaxed text-slate-100">
              <KeyRound className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden="true" />
              {`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`}
            </pre>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default function App() {
  if (!supabaseConfigured) {
    return <SetupRequired />
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <Signup />
          </GuestOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPassword />
          </GuestOnly>
        }
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="customers" element={<Customers />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="follow-ups" element={<FollowUps />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
