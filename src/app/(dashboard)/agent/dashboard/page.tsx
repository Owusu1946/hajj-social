'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AgentDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [agentProfile, setAgentProfile] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [profileData, agentData] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
          supabase
            .from('agent_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        ])
        
        setProfile(profileData.data)
        setAgentProfile(agentData.data)
      }
    }
    getProfiles()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>
        
        {!agentProfile?.is_approved && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              Your agent account is pending approval. We'll notify you once approved.
            </p>
          </div>
        )}
        
        {profile && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Welcome, {profile.full_name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium">Active Pilgrims</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium">Applications</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium">Messages</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            
            {agentProfile?.is_approved && (
              <div className="mt-8">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Create New Package
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}