'use client'

import { useState } from 'react'
import { 
  BookOpenIcon, 
  MapIcon, 
  ChurchIcon, 
  HeartPulseIcon,
  CalendarIcon,
  UsersIcon,
  BellIcon,
  PhoneIcon,
  GlobeIcon
} from 'lucide-react'

export default function ResourceHub() {
  const resources = [
    {
      id: 'guides',
      icon: BookOpenIcon,
      label: 'Hajj Guides',
      description: 'Step-by-step guides for Hajj rituals',
      color: 'from-emerald-500 to-emerald-700'
    },
    {
      id: 'sacred',
      icon: MapIcon,
      label: 'Sacred Sites',
      description: 'Maps and information about holy places',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'rituals',
      icon: ChurchIcon,
      label: 'Rituals & Prayers',
      description: 'Essential duas and ritual procedures',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'health',
      icon: HeartPulseIcon,
      label: 'Health & Safety',
      description: 'Medical advice and safety tips',
      color: 'from-red-500 to-red-700'
    }
  ]

  const secondaryResources = [
    {
      id: 'events',
      icon: CalendarIcon,
      label: 'Events',
      color: 'text-orange-600'
    },
    {
      id: 'community',
      icon: UsersIcon,
      label: 'Community',
      color: 'text-blue-600'
    },
    {
      id: 'updates',
      icon: BellIcon,
      label: 'Updates',
      color: 'text-purple-600'
    },
    {
      id: 'emergency',
      icon: PhoneIcon,
      label: 'Emergency',
      color: 'text-red-600'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Hajj Resource Hub</h2>
        
        {/* Main Resources */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <button
                key={resource.id}
                className={`relative p-4 rounded-lg bg-gradient-to-br ${resource.color} text-white hover:shadow-lg transition-all duration-200 text-left`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <h3 className="font-medium mb-1">{resource.label}</h3>
                <p className="text-xs text-white/80">{resource.description}</p>
              </button>
            )
          })}
        </div>

        {/* Secondary Resources */}
        <div className="grid grid-cols-4 gap-2">
          {secondaryResources.map((resource) => {
            const Icon = resource.icon
            return (
              <button
                key={resource.id}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <Icon className={`w-5 h-5 mb-1 ${resource.color}`} />
                <span className="text-xs text-gray-600">{resource.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}