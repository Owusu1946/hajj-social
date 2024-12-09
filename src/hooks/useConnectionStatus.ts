import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const checkSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1)
        setIsSupabaseConnected(!error)
      } catch {
        setIsSupabaseConnected(false)
      }
    }

    const interval = setInterval(checkSupabaseConnection, 30000)
    checkSupabaseConnection()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, isSupabaseConnected }
}