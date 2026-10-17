import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toErrorMessage } from './errors'
import { fetchProfile } from './data'
import { supabase } from './supabase'
import { AuthContext } from './auth-context'
import type { Profile } from '../types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadedUserRef = useRef<string | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      setProfile(await fetchProfile(userId))
      setError(null)
    } catch (err) {
      setProfile(null)
      setError(toErrorMessage(err))
    }
  }, [])

  const applySession = useCallback(
    (nextSession: Session | null) => {
      setSession(nextSession)
      const userId = nextSession?.user?.id ?? null
      if (userId) {
        if (loadedUserRef.current !== userId) {
          loadedUserRef.current = userId
          void loadProfile(userId)
        }
      } else {
        loadedUserRef.current = null
        setProfile(null)
      }
      setLoading(false)
    },
    [loadProfile],
  )

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => applySession(nextSession))

    return () => subscription.unsubscribe()
  }, [applySession])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

