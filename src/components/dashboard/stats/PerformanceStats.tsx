 'use client'

import { UsersIcon, MapPinIcon, CalendarIcon } from 'lucide-react'

interface StatsProps {
  totalClients: number
  successfulTrips: number
  yearsActive: number
  connectionsCount: number
  reviewsCount: number
}

export default function PerformanceStats({ 
  totalClients, 
  successfulTrips, 
  yearsActive,
  connectionsCount,
  reviewsCount
}: StatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{successfulTrips}</div>
          <div className="text-sm text-gray-600">Successful Trips</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{connectionsCount}</div>
          <div className="text-sm text-gray-600">Connections</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{reviewsCount}</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
      </div>
    </div>
  )
}