'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUserAndProfile = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (!profile && !window.location.pathname.includes('complete-profile')) {
          const role = currentUser.user_metadata.role || 'pilgrim'
          router.push(`/${role}/complete-profile`)
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        router.push('/login')
      }
    }

    checkUserAndProfile()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}