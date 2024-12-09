'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  MapPinIcon, 
  GlobeIcon, 
  MailIcon, 
  PhoneIcon,
  EditIcon,
  UserIcon,
  BadgeCheckIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  email: string
  phone?: string
  is_verified: boolean
  role: 'pilgrim' | 'agent' | 'admin'
}

interface ProfileCardProps {
  profile: Profile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter()
  const [showContacts, setShowContacts] = useState(false)

  const handleProfileClick = () => {
    if (profile.role === 'agent') {
      router.push(`/agent/${profile.id}`)
    } else {
      router.push(`/pilgrim/${profile.id}`)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="relative">
        {/* Profile Banner */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl" />
        
        {/* Avatar */}
        <div className="relative text-center">
          <div className="relative inline-block">
            <Image
              src={profile.avatar_url || '/headshot.jpg'}
              alt={profile.full_name}
              width={96}
              height={96}
              className="rounded-full border-4 border-white shadow-md mx-auto relative z-10"
            />
            {profile.is_verified && (
              <BadgeCheckIcon className="absolute bottom-0 right-0 w-6 h-6 text-blue-500 bg-white rounded-full p-1 z-20" />
            )}
          </div>
        </div>

        {/* Profile Info with clickable name */}
        <div className="text-center mt-4">
          <h2 
            onClick={handleProfileClick}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
          >
            {profile.full_name}
          </h2>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-2">
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </span>
          <p className="text-gray-600 mt-3 text-sm">
            {profile.bio || 'No bio yet'}
          </p>
        </div>

        {/* Location & Website */}
        <div className="mt-4 space-y-2">
          {profile.location && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {profile.location}
            </div>
          )}
          {profile.website && (
            <div className="flex items-center text-gray-600 text-sm">
              <GlobeIcon className="w-4 h-4 mr-2" />
              <a 
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.website.replace(/(^\w+:|^)\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <button
          onClick={() => setShowContacts(!showContacts)}
          className="w-full mt-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          {showContacts ? 'Hide Contact Info' : 'Show Contact Info'}
        </button>

        {showContacts && (
          <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center text-gray-600 text-sm">
              <MailIcon className="w-4 h-4 mr-2" />
              {profile.email}
            </div>
            {profile.phone && (
              <div className="flex items-center text-gray-600 text-sm">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {profile.phone}
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Button */}
        <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>
    </div>
  )
}