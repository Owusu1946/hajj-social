'use client'

import { use } from 'react'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import EditProfileForm from '@/components/dashboard/profile/EditProfileForm'
import { toast } from 'react-hot-toast'

interface Props {
  params: Promise<{
    role: 'pilgrim' | 'agent'
    id: string
  }>
}

export default function EditProfilePage({ params }: Props) {
  const resolvedParams = use(params)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (profileError) throw profileError

        if (resolvedParams.role === 'agent') {
          const { data: agentData, error: agentError } = await supabase
            .from('agent_profiles')
            .select('*')
            .eq('id', resolvedParams.id)
            .single()

          if (agentError) throw agentError
          setInitialData({ ...profileData, ...agentData })
        } else {
          setInitialData(profileData)
        }
      } catch (error) {
        toast.error('Error loading profile data')
        console.error('Error:', error)
        router.push(`/${resolvedParams.role}/${resolvedParams.id}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [resolvedParams.id, resolvedParams.role])

  if (loading || !initialData) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <EditProfileForm
        userId={resolvedParams.id}
        role={resolvedParams.role}
        initialData={initialData}
      />
    </div>
  )
}