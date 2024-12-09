import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UserPlusIcon, BadgeCheckIcon, MapPinIcon, ClockIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Pilgrim {
  id: string
  full_name: string
  avatar_url?: string
  location?: string
  is_verified: boolean
  role: 'pilgrim'
  requestSent?: boolean
}

export default function PilgrimsCard() {
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([])
  const [loading, setLoading] = useState(true)
  const [requestLoading, setRequestLoading] = useState<{ [key: string]: boolean }>({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPilgrims()
  }, [])

  const fetchPilgrims = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')
      
      // Get pilgrim profiles and check existing requests
      const { data: pilgrimsData, error: pilgrimsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          location,
          is_verified,
          role,
          pilgrim_request!receiver_id(
            status
          )
        `)
        .eq('role', 'pilgrim')
        .neq('id', user.id)
        .limit(5)
        .order('created_at', { ascending: false })

      if (pilgrimsError) throw pilgrimsError

      // Process the data to include request status
      const processedPilgrims = pilgrimsData?.map(pilgrim => ({
        ...pilgrim,
        requestSent: pilgrim.pilgrim_request?.length > 0
      })) || []

      setPilgrims(processedPilgrims)
    } catch (error) {
      console.error('Error fetching pilgrims:', error)
      toast.error('Failed to load pilgrims')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (pilgrimId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Set loading state for this specific request
      setRequestLoading(prev => ({ ...prev, [pilgrimId]: true }))

      // Insert the request
      const { error: requestError } = await supabase
        .from('pilgrim_request')
        .insert({
          sender_id: user.id,
          receiver_id: pilgrimId,
          status: 'pending'
        })

      if (requestError) throw requestError

      // Update local state
      setPilgrims(prev => 
        prev.map(pilgrim => 
          pilgrim.id === pilgrimId 
            ? { ...pilgrim, requestSent: true }
            : pilgrim
        )
      )

      // Show success message
      toast.success('Connection request sent!')
    } catch (error: any) {
      console.error('Error sending request:', error)
      toast.error(error.message || 'Failed to send request')
    } finally {
      setRequestLoading(prev => ({ ...prev, [pilgrimId]: false }))
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Fellow Pilgrims</h2>
        <button 
          onClick={() => router.push('/pilgrims')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : pilgrims.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No pilgrims found</p>
      ) : (
        <div className="space-y-4">
          {pilgrims.map((pilgrim) => (
            <div key={pilgrim.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={pilgrim.avatar_url || '/headshot.jpg'}
                    alt={pilgrim.full_name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  {pilgrim.is_verified && (
                    <BadgeCheckIcon className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{pilgrim.full_name}</h3>
                  {pilgrim.location && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPinIcon className="w-3 h-3 mr-1" />
                      {pilgrim.location}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleSendRequest(pilgrim.id)}
                disabled={pilgrim.requestSent || requestLoading[pilgrim.id]}
                className={cn(
                  "transition-all duration-200 ease-in-out",
                  "p-2 rounded-full",
                  pilgrim.requestSent
                    ? "bg-green-100 text-green-600"
                    : requestLoading[pilgrim.id]
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                )}
              >
                {pilgrim.requestSent ? (
                  <CheckIcon className="w-5 h-5 animate-check" />
                ) : requestLoading[pilgrim.id] ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlusIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}