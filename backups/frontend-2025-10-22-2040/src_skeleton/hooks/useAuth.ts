import { useState } from 'react'
import { apiCall } from '../config/api'

type AuthState = {
  user: null | { id: string; email?: string; name?: string; avatar?: string }
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ user: null, loading: false, error: null })

  const fetchAuthUrl = async () => {
    try {
      setAuth((a) => ({ ...a, loading: true }))
      const res = await apiCall('/api/auth/google/url')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error('Invalid OAuth URL response')
    } catch (err: any) {
      setAuth({ user: null, loading: false, error: err.message })
    }
  }

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    signInWithGoogle: fetchAuthUrl
  }
}
