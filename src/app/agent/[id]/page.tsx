'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  BadgeCheckIcon, 
  ArrowLeftIcon, 
  StarIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  PhoneIcon, 
  MailIcon,
  GlobeIcon,
  CalendarIcon,
  NotepadTextDashed,
  UsersIcon,
  UserPlusIcon,
  MessageSquareIcon,
  TrendingUpIcon
} from 'lucide-react'
import ReviewCard from '@/components/dashboard/reviews/ReviewCard'
import CreateReview from '@/components/dashboard/reviews/CreateReview'
import PostCard from '@/components/dashboard/PostCard'
import { use } from 'react'
import PerformanceStats from '@/components/dashboard/stats/PerformanceStats'
import ReviewsSection from '@/components/dashboard/reviews/ReviewsSection'
import ConnectionButton from '@/components/dashboard/ConnectionButton'

// Import interfaces from dashboard
interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  role: 'pilgrim' | 'agent' | 'admin'
  bio?: string
  location?: string
  website?: string
  email: string
  phone?: string
  is_verified: boolean
}

interface AgentProfile {
  id: string
  company_name: string
  license_number: string
  years_experience: number
  services_offered: string[]
  certification_urls: string[]
  rating: number
  is_approved: boolean
  banner_url?: string
  connections_count: number
  profiles: Profile
}

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
  agent_profiles: {
    company_name: string
    profiles: {
      full_name: string
      avatar_url: string
    }
  }
}

interface Post {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url?: string
  }
  likes: number
  comments: number
}

export default function AgentProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [stats, setStats] = useState({
    totalClients: 0,
    successfulTrips: 0,
    yearsActive: 0
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [agentResponse, postsResponse] = await Promise.all([
          supabase
            .from('agent_profiles')
            .select(`
              *,
              profiles (
                id,
                full_name,
                avatar_url,
                location,
                email,
                phone,
                is_verified,
                bio,
                website
              ),
              reviews (
                id,
                rating,
                content,
                created_at,
                helpful_count,
                profiles (
                  full_name,
                  avatar_url
                )
              )
            `)
            .eq('id', resolvedParams.id)
            .single(),
          supabase
            .from('posts')
            .select('*, profiles(*)')
            .eq('user_id', resolvedParams.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ])

        if (agentResponse.error) throw agentResponse.error
        if (postsResponse.error) throw postsResponse.error

        setAgent(agentResponse.data)
        setReviews(agentResponse.data.reviews)
        setPosts(postsResponse.data)
        
        // Mock stats for now - you can replace with real data
        setStats({
          totalClients: Math.floor(Math.random() * 100),
          successfulTrips: Math.floor(Math.random() * 50),
          yearsActive: agentResponse.data.years_experience
        })
      } catch (err) {
        setError('Failed to load agent profile')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id])

  const handleBackToDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return router.push('/login')
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const dashboardPath = profile?.role === 'pilgrim' ? '/pilgrim/dashboard' : '/agent/dashboard'
    router.push(dashboardPath)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 w-1/3 rounded" />
            <div className="h-4 bg-gray-200 w-1/2 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Agent not found'}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Go back
          </button>
        </div>
      </div>
    )
  }

    function fetchData() {
        throw new Error('Function not implemented.')
    }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative">
        <div className="h-64">
          <Image
            src={agent?.banner_url || '/algebra uni.jpg'}
            alt="Profile Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </div>

        {/* Back Button - Overlaid on banner */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors bg-black/20 px-4 py-2 rounded-lg"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        {/* Banner Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
              </div>
            </div>
            
            <div className="flex space-x-3">
              <ConnectionButton agentId={agent.id} currentUserId={resolvedParams.id} />
              <button className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 flex items-center space-x-2">
                <MessageSquareIcon className="w-5 h-5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="relative flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={agent?.profiles.avatar_url || '/Kassim.jpg'}
                    alt={agent?.profiles.full_name || ''}
                    fill
                    className="rounded-full object-cover border-4 border-white"
                  />
                  {agent?.profiles.is_verified && (
                    <BadgeCheckIcon className="absolute -right-2 -bottom-2 w-6 h-6 text-blue-500 bg-white rounded-full" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-center text-gray-900">
                  {agent?.profiles.full_name}
                </h1>
                <p className="text-lg text-gray-600 text-center">{agent?.company_name}</p>
                
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{agent?.rating}/5</span>
                  <span className="text-gray-500">({reviews.length} reviews)</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <UsersIcon className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <div className="text-lg font-semibold">{stats.totalClients}</div>
                    <div className="text-xs text-gray-500">Clients</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <MapPinIcon className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <div className="text-lg font-semibold">{stats.successfulTrips}</div>
                    <div className="text-xs text-gray-500">Trips</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <div className="text-lg font-semibold">{stats.yearsActive}</div>
                    <div className="text-xs text-gray-500">Years</div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="w-full mt-6 space-y-3">
                  {agent?.profiles.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>{agent.profiles.location}</span>
                    </div>
                  )}
                  {agent?.profiles.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      <span>{agent.profiles.phone}</span>
                    </div>
                  )}
                  {agent?.profiles.email && (
                    <div className="flex items-center text-gray-600">
                      <MailIcon className="w-4 h-4 mr-2" />
                      <span>{agent.profiles.email}</span>
                    </div>
                  )}
                  {agent?.profiles.website && (
                    <div className="flex items-center text-gray-600">
                      <GlobeIcon className="w-4 h-4 mr-2" />
                      <a href={agent.profiles.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        {agent.profiles.website.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Performance Stats */}
            <PerformanceStats
              totalClients={stats.totalClients}
              successfulTrips={stats.successfulTrips}
              yearsActive={stats.yearsActive}
              connectionsCount={agent?.connections_count || 0}
              reviewsCount={reviews.length}
            />
          </div>

          {/* Middle Column */}
          <div className="md:col-span-1 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 mb-6">{agent?.profiles.bio || 'No bio available.'}</p>
              
              <h3 className="font-medium text-gray-900 mb-2">Services Offered</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {agent?.services_offered?.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>

              <h3 className="font-medium text-gray-900 mb-2">Certifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {agent?.certification_urls?.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <NotepadTextDashed className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm">View Certificate {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Posts Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={resolvedParams.id} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 bg-white rounded-lg shadow-md">
                  No posts yet.
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Reviews Section */}
            <ReviewsSection
              reviews={reviews}
              agentId={agent.id}
              onReviewAdded={() => {
                // Refresh reviews
                fetchData()
              }}
            />
            
            {/* Connections Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Connections</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  See All
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* We'll map through connections here - for now showing placeholder */}
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src="/headshot.jpg"
                      alt="Connection"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">John Doe</p>
                      <p className="text-sm text-gray-500 truncate">Travel Agent</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}