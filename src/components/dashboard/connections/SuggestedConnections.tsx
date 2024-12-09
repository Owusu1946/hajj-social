'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserPlusIcon, BadgeCheckIcon, SearchIcon } from 'lucide-react'
import Image from 'next/image'
import ConnectionButton from '../ConnectionButton'

interface SuggestedProfile {
  id: string
  full_name: string
  avatar_url?: string
  role: 'pilgrim' | 'agent'
  is_verified: boolean
  bio?: string
  agent_profiles: {
    company_name: string | null
  }[]
}

export default function SuggestedConnections({ 
  userId,
  userRole 
}: { 
  userId: string
  userRole: 'pilgrim' | 'agent'
}) {
  const [agents, setAgents] = useState<SuggestedProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAgents()
  }, [userId])

  const fetchAgents = async () => {
    try {
      const { data: agentsData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          role,
          is_verified,
          bio,
          agent_profiles (
            company_name
          )
        `)
        .eq('role', 'agent')
        .neq('id', userId)
        .order('full_name')

      if (error) {
        console.error('Error fetching agents:', error)
        return
      }

      if (agentsData) {
        console.log('Agents data:', agentsData)
        setAgents(agentsData)
      }
    } catch (error) {
      console.error('Error in fetchAgents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const searchLower = searchQuery.toLowerCase()
    return (
      agent.full_name.toLowerCase().includes(searchLower) ||
      agent.agent_profiles?.[0]?.company_name?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <div className="animate-pulse">Loading agents...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold flex items-center mb-4">
        <UserPlusIcon className="w-5 h-5 mr-2" />
        Available Hajj Agents ({agents.length})
      </h2>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search agents by name or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg pl-10"
        />
        <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src={agent.avatar_url || '/headshot.jpg'}
                  alt={agent.full_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                {agent.is_verified && (
                  <BadgeCheckIcon className="absolute -right-1 -bottom-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{agent.full_name}</h3>
                {agent.agent_profiles?.[0]?.company_name && (
                  <p className="text-sm text-gray-500">{agent.agent_profiles[0].company_name}</p>
                )}
              </div>
            </div>
            <ConnectionButton 
              agentId={agent.id}
              currentUserId={userId}
            />
          </div>
        ))}
      </div>
    </div>
  )
}