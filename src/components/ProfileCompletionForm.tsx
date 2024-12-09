 'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface BaseProfileData {
  full_name: string
  phone: string
  location: string
  bio: string
}

export default function ProfileCompletionForm({
  role,
  onSubmit,
  children
}: {
  role: 'pilgrim' | 'agent'
  onSubmit: (data: BaseProfileData) => Promise<void>
  children?: React.ReactNode
}) {
  const [formData, setFormData] = useState<BaseProfileData>({
    full_name: '',
    phone: '',
    location: '',
    bio: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.full_name}
          onChange={e => setFormData({...formData, full_name: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.location}
          onChange={e => setFormData({...formData, location: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
          value={formData.bio}
          onChange={e => setFormData({...formData, bio: e.target.value})}
        />
      </div>

      {children}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  )
}