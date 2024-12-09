'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheckIcon, StarIcon } from 'lucide-react'
import CreateReview from '../reviews/CreateReview'

interface Profile {
  id: string
  full_name: string
  avatar_url: string
  is_verified: boolean
}

interface AgentProfile {
  id: string
  company_name: string
  rating: number
  is_approved: boolean
  profiles: Profile
}

export default function AgentCard({ agent }: { agent: AgentProfile }) {
  const [showReviewForm, setShowReviewForm] = useState(false)

  return (
    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <Link href={`/agent/${agent.id}`} className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={agent.profiles.avatar_url || '/Kassim.jpg'}
            alt={agent.profiles.full_name}
            fill
            className="rounded-full object-cover"
          />
          {agent.is_approved && (
            <BadgeCheckIcon 
              className="absolute -right-1 -bottom-1 w-4 h-4 text-blue-500 bg-white rounded-full ring-2 ring-white" 
              fill="white"
            />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link 
            href={`/agent/${agent.id}`}
            className="group"
          >
            <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {agent.profiles.full_name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {agent.company_name}
            </p>
          </Link>
        </div>

        <button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Review
        </button>
      </div>

      {showReviewForm && (
        <div className="mt-4 pt-4 border-t">
          <CreateReview 
            agentId={agent.id} 
            onSuccess={() => setShowReviewForm(false)}
          />
        </div>
      )}
    </div>
  )
}

