 'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserIcon, Users2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Connection {
  id: string
  status: 'pending' | 'accepted'
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url?: string
    role: 'pilgrim' | 'agent'
  }
}

export default function ConnectionsOverview({ userId }: { userId: string }) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchConnections()
  }, [userId])

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id,
        status,
        created_at,
        profiles!receiver_id(id, full_name, avatar_url, role)
      `)
      .eq('sender_id', userId)
      .eq('status', 'accepted')
      .limit(6)

    if (data) setConnections(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="animate-pulse">Loading connections...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Users2Icon className="w-5 h-5 mr-2" />
          Connections
        </h2>
        <Link 
          href="/connections" 
          className="text-sm text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <Link 
            key={connection.id}
            href={`/${connection.profiles.role}/${connection.profiles.id}`}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50"
          >
            <Image
              src={connection.profiles.avatar_url || '/headshot.jpg'}
              alt={connection.profiles.full_name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <span className="text-sm font-medium mt-2 text-center">
              {connection.profiles.full_name}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {connection.profiles.role}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}