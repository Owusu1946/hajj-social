 'use client'

import { useState } from 'react'
import ReviewCard from './ReviewCard'
import CreateReview from './CreateReview'

interface ReviewsSectionProps {
  reviews: Review[]
  agentId: string
  onReviewAdded?: () => void
}

export default function ReviewsSection({ reviews, agentId, onReviewAdded }: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Write a Review
        </button>
      </div>

      {showReviewForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <CreateReview
            agentId={agentId}
            onSuccess={() => {
              setShowReviewForm(false)
              onReviewAdded?.()
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  )
}