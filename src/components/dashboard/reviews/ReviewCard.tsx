'use client'

import { useState } from 'react'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Review {
  id: string
  user_id: string
  agent_id: string
  rating: number
  content: string
  created_at: string
  helpful_count: number
  profiles: {
    full_name: string
    avatar_url: string
  }
  agent_profiles?: {
    company_name: string
    profiles: {
      full_name: string
      avatar_url: string
    }
  }
}

export default function ReviewCard({ review }: { review: Review }) {
  const [isHelpful, setIsHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)

  const handleHelpful = async () => {
    setIsHelpful(!isHelpful)
    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1)
    // Add Supabase interaction here
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src={review.profiles.avatar_url || '/headshot.jpg'}
            alt={review.profiles.full_name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold">{review.profiles.full_name}</h3>
            {review.agent_profiles && (
              <p className="text-sm text-gray-500">
                Reviewed {review.agent_profiles.company_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`w-5 h-5 ${
                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill={i < review.rating ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-gray-700">{review.content}</p>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{new Date(review.created_at).toLocaleDateString()}</span>
        <button
          onClick={handleHelpful}
          className={`flex items-center space-x-1 ${
            isHelpful ? 'text-blue-600' : 'hover:text-gray-700'
          }`}
        >
          <span>{helpfulCount} found this helpful</span>
        </button>
      </div>
    </motion.div>
  )
}