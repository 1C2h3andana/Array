import { useEffect, useState } from 'react'
import { toErrorMessage } from '../lib/errors'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface AsyncData<T> extends AsyncState<T> {
  reload: () => void
}

/**
 * Loads data from Supabase on mount (and on `reload`), exposing loading and
 * error state so pages can render skeletons and error banners.
 */
export function useAsyncData<T>(
  load: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncData<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    load().then(
      (data) => {
        if (active) setState({ data, loading: false, error: null })
      },
      (err: unknown) => {
        if (active) setState({ data: null, loading: false, error: toErrorMessage(err) })
      },
    )
    return () => {
      active = false
    }
    // Reload on mount, when `reload` is called, or when deps change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps])

  return { ...state, reload: () => setNonce((n) => n + 1) }
}
