'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  role: 'pilgrim' | 'agent'
}

export default function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'pilgrim'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: formData.role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Redirect to profile completion based on role
        if (formData.role === 'agent') {
          router.push('/agent/complete-profile')
        } else {
          router.push('/pilgrim/complete-profile')
        }
      }
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
          Email Address
        </label>
        <input
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.confirmPassword}
          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          I am a
        </label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.role}
          onChange={e => setFormData({...formData, role: e.target.value as 'pilgrim' | 'agent'})}
        >
          <option value="pilgrim">Pilgrim</option>
          <option value="agent">Hajj Agent</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}