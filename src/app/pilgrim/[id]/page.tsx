'use client'

import { use } from 'react'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MapPinIcon, GlobeIcon, MailIcon, PhoneIcon,
  EditIcon, UserIcon, Users2Icon, BookOpenIcon
} from 'lucide-react'
import ConnectionsOverview from '@/components/dashboard/connections/ConnectionsOverview'
import SuggestedConnections from '@/components/dashboard/connections/SuggestedConnections'
import CreatePost from '@/components/dashboard/CreatePost'
import PostCard from '@/components/dashboard/PostCard'
import ImageUpload from '@/components/dashboard/profile/ImageUpload'

interface PilgrimProfile {
  id: string
  full_name: string
  avatar_url?: string
  cover_url?: string
  bio?: string
  location?: string
  website?: string
  email: string
  phone?: string
  is_verified: boolean
}

export default function PilgrimProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<PilgrimProfile | null>(null)
  const [posts, setPosts] = useState([])
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Check if current user
      const { data: { user } } = await supabase.auth.getUser()
      setIsCurrentUser(user?.id === resolvedParams.id)

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (profileData) setProfile(profileData)

      // Fetch user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('user_id', resolvedParams.id)
        .order('created_at', { ascending: false })

      if (postsData) setPosts(postsData)
      setLoading(false)
    }

    fetchData()
  }, [resolvedParams.id])

  if (loading || !profile) {
    return <div className="animate-pulse">Loading profile...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="relative mb-8">
        <ImageUpload
          type="cover"
          currentUrl={profile.cover_url}
          userId={resolvedParams.id}
          onUploadComplete={(url) => setProfile({ ...profile, cover_url: url })}
        />
        <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
          <ImageUpload
            type="avatar"
            currentUrl={profile.avatar_url}
            userId={resolvedParams.id}
            onUploadComplete={(url) => setProfile({ ...profile, avatar_url: url })}
          />
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
            <p className="text-blue-100">Pilgrim</p>
          </div>
          {isCurrentUser && (
            <button
              onClick={() => router.push(`/pilgrim/${resolvedParams.id}/edit`)}
              className="mb-4 flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <EditIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <div className="space-y-4">
              {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
              
              {profile.location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <GlobeIcon className="w-5 h-5" />
                  <a href={profile.website} className="hover:text-blue-600">{profile.website}</a>
                </div>
              )}
              
              {profile.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Connections Overview */}
          <ConnectionsOverview userId={resolvedParams.id} />

          {/* Suggested Connections */}
          <SuggestedConnections userId={resolvedParams.id} userRole="pilgrim" />
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {isCurrentUser && (
            <CreatePost onSubmit={async (postData) => {
              const { data, error } = await supabase
                .from('posts')
                .insert({
                  ...postData,
                  user_id: resolvedParams.id
                })
                .select('*, profiles(*)')
                .single()

              if (data) {
                setPosts([data, ...posts])
              }
            }} />
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                currentUserId={resolvedParams.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}