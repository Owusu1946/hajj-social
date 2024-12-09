'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { StarIcon } from 'lucide-react'

export default function CreateReview({ agentId, onSuccess }: { agentId: string, onSuccess: () => void }) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          rating,
          content
        })

      if (error) throw error
      onSuccess()
      setRating(0)
      setContent('')
    } catch (error) {
      console.error('Error creating review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="focus:outline-none"
          >
            <StarIcon
              className={`w-6 h-6 ${
                value <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill={value <= rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review..."
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        rows={4}
        required
      />
      <button
        type="submit"
        disabled={isSubmitting || rating === 0 || !content.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}