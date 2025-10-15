import { useEffect, useState } from 'react'
import { apiCall } from '../config/api'

type Balance = { user_id: string; points: number; keys: number; gems: number; gold: number }

export function useEconomy() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const res = await apiCall('/api/economy/me')
      if (res.status === 401) { setError('unauthenticated'); setBalance(null); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setBalance(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return { balance, loading, error, refresh: fetchBalance }
}
