'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ProfileCard from '@/components/dashboard/ProfileCard'
import CreatePost from '@/components/dashboard/CreatePost'
import PostCard from '@/components/dashboard/PostCard'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import ReviewCard from '@/components/dashboard/reviews/ReviewCard'
import ResourceHub from '@/components/dashboard/resources/ResourceHub'
import AgentCard from '@/components/dashboard/agents/AgentCard'
import Navbar from '@/components/dashboard/Navbar'
import { PostCardSkeleton } from '@/components/ui/Shimmer'
import ConnectionsOverview from '@/components/dashboard/connections/ConnectionsOverview'
import PilgrimsCard from '@/components/dashboard/pilgrims/PilgrimsCard'
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
  profiles: Profile
}

interface Event {
  id: string
  agent_id: string
  title: string
  description: string
  start_date: string
  end_date: string
  price: number
  capacity: number
  location: string
  agent_profiles: AgentProfile
}

interface Post {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
  }
  likes: number
  comments: number
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

export default function PilgrimDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [agents, setAgents] = useState<AgentProfile[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const supabase = createClientComponentClient()
  const { isOnline, isSupabaseConnected } = useConnectionStatus()
  const [loading, setLoading] = useState(true)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastPostRef = useRef<string | null>(null)
  const { ref, inView } = useInView()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }

    const getPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) setPosts(data)
    }

    const getAgentsAndReviews = async () => {
      try {
        setLoading(true)
        
        // Fetch agents with their reviews
        const { data: agentsData, error: agentsError } = await supabase
          .from('agent_profiles')
          .select(`
            *,
            profiles (
              id,
              full_name,
              avatar_url,
              location,
              is_verified
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
          .eq('is_approved', true)
          .limit(5)

        if (agentsError) throw agentsError
        if (agentsData) setAgents(agentsData)

        // Fetch recent reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            ),
            agent_profiles (
              company_name,
              profiles (
                full_name,
                avatar_url
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (reviewsError) throw reviewsError
        if (reviewsData) setReviews(reviewsData)

      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
    getPosts()
    getAgentsAndReviews()
  }, [])

const handleCreatePost = async (content: string, tags: string[], mediaUrls: string[]) => {
  console.log('Creating post with media:', { content, tags, mediaUrls });
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      media_urls: mediaUrls
    })
    .select()

  if (error) {
    console.error('Error creating post:', error);
    return;
  }

  console.log('Post created successfully:', data);
  if (data) {
    setPosts([data[0], ...posts])
  }
}

  const ConnectionStatus = () => {
    if (!isOnline || !isSupabaseConnected) {
      return (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{!isOnline ? 'You are offline' : 'Connection lost'}</span>
        </div>
      )
    }
    return null
  }

  const loadPosts = async (lastPost?: string) => {
    try {
      const query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          ),
          media_urls
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (lastPost) {
        query.lt('created_at', lastPost)
      }

      const { data, error } = await query

      if (error) throw error
      if (data.length < 10) setHasMore(false)
      if (data.length > 0) lastPostRef.current = data[data.length - 1].created_at

      setPosts(prev => lastPost ? [...prev, ...data] : data)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  useEffect(() => {
    const initialLoad = async () => {
      await loadPosts()
      setIsLoadingInitial(false)
    }
    initialLoad()
  }, [])

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !isLoadingInitial) {
      setIsLoadingMore(true)
      loadPosts(lastPostRef.current).finally(() => {
        setIsLoadingMore(false)
      })
    }
  }, [inView, hasMore, isLoadingMore, isLoadingInitial])

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1">
            {profile && <ProfileCard profile={profile} />}
            <div className="mt-6">
              <ResourceHub />
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-2">
            <CreatePost onSubmit={handleCreatePost} />
            <div className="space-y-6">
              {isLoadingInitial ? (
                Array(3).fill(0).map((_, i) => <PostCardSkeleton key={i} />)
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post}
                      currentUserId={currentUser?.id}
                    />
                  ))}
                  {isLoadingMore && <PostCardSkeleton />}
                  <div ref={ref} className="h-10" />
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Verified Agents */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Verified Agents</h2>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4">Loading agents...</div>
                  ) : agents.length > 0 ? (
                    agents.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No verified agents found
                    </div>
                  )}
                </div>
              </div>

              {/* Fellow Pilgrims */}
              {currentUser && (
                <PilgrimsCard />
              )}

              {/* Connections Overview */}
              {currentUser && (
                <ConnectionsOverview userId={currentUser.id} />
              )}

              {/* Recent Reviews */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard 
                        key={review.id} 
                        review={review}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No reviews yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConnectionStatus />
      </div>
    </>
  )
}