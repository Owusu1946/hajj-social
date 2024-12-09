'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
    </div>
  )
} 