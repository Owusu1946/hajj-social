'use client'

import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ProfileCompletionForm from '@/components/ProfileCompletionForm'

export default function PilgrimProfileCompletion() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (formData: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('No user found')

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...formData,
          role: 'pilgrim'
        })
      
      if (profileError) throw profileError
      router.push('/pilgrim/dashboard')
    } catch (error: any) {
      console.error('Profile completion error:', error)
      throw error
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Complete Your Pilgrim Profile</h1>
      <ProfileCompletionForm role="pilgrim" onSubmit={handleSubmit} />
    </div>
  )
}