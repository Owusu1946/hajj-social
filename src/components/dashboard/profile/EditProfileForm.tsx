'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface BaseProfileData {
  full_name: string
  username: string
  bio?: string
  location?: string
  website?: string
  phone?: string
  avatar_url?: string
}

interface AgentProfileData extends BaseProfileData {
  company_name: string
  license_number: string
  years_experience: number
  services_offered: string[]
  certification_urls: string[]
}

export default function EditProfileForm({ 
  userId, 
  role,
  initialData 
}: { 
  userId: string
  role: 'pilgrim' | 'agent'
  initialData: BaseProfileData | AgentProfileData
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          phone: formData.phone
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // If agent, update agent-specific profile
      if (role === 'agent') {
        const agentData = formData as AgentProfileData
        const { error: agentError } = await supabase
          .from('agent_profiles')
          .update({
            company_name: agentData.company_name,
            license_number: agentData.license_number,
            years_experience: agentData.years_experience,
            services_offered: agentData.services_offered,
            certification_urls: agentData.certification_urls
          })
          .eq('id', userId)

        if (agentError) throw agentError
      }

      toast.success('Profile updated successfully')
      router.push(`/${role}/${userId}`)
      router.refresh()

    } catch (error) {
      toast.error('Error updating profile')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Basic Profile Fields */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Agent-specific Fields */}
      {role === 'agent' && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={(formData as AgentProfileData).company_name || ''}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">License Number</label>
              <input
                type="text"
                value={(formData as AgentProfileData).license_number || ''}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                value={(formData as AgentProfileData).years_experience || 0}
                onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
                min="0"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Services Offered</label>
              <textarea
                value={(formData as AgentProfileData).services_offered?.join('\n') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  services_offered: e.target.value.split('\n').filter(service => service.trim())
                })}
                placeholder="Enter each service on a new line"
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}