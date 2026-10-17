import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
}

/**
 * Simulates fetching data over the network for the visual prototype.
 * Returns null data while loading so pages can render skeletons.
 */
export function useAsyncData<T>(load: () => T, delayMs = 500): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true })

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      if (active) setState({ data: load(), loading: false })
    }, delayMs)
    return () => {
      active = false
      clearTimeout(timer)
    }
    // Load once on mount; the sample data never changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
