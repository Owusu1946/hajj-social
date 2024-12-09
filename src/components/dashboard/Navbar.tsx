'use client'

import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  UserPlusIcon, 
  HomeIcon, 
  UsersIcon, 
  MapIcon, 
  BookOpenIcon, 
  CalendarIcon,
  MessageSquareIcon,
  XIcon,
  CheckIcon,
  XCircleIcon,
  MapPinIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface NavbarProps {
  userEmail?: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}

interface PendingRequest {
  id: string
  sender: {
    id: string
    full_name: string
    avatar_url: string
    location?: string
  }
  created_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Hajj Guide Available',
    message: 'A new comprehensive guide for Hajj rituals has been published.',
    time: '2 hours ago',
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Weather Alert',
    message: 'High temperatures expected in Mecca tomorrow. Please stay hydrated.',
    time: '5 hours ago',
    read: false,
    type: 'warning'
  },
  {
    id: '3',
    title: 'Prayer Time Update',
    message: 'Prayer schedules have been updated for the coming week.',
    time: '1 day ago',
    read: true,
    type: 'success'
  }
]

function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative">
          <div 
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45" />
            
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">Hajj +</h1>
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="w-72 bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <NavItem 
              icon={<HomeIcon className="w-5 h-5" />} 
              label="Dashboard" 
              active 
            />
            <NavItem 
              icon={<UsersIcon className="w-5 h-5" />} 
              label="Groups" 
              count={2} 
            />
            <NavItem 
              icon={<MapIcon className="w-5 h-5" />} 
              label="Guide" 
            />
            <NavItem 
              icon={<BookOpenIcon className="w-5 h-5" />} 
              label="Learn" 
            />
            <NavItem 
              icon={<CalendarIcon className="w-5 h-5" />} 
              label="Events" 
            />
            <NavItem 
              icon={<MessageSquareIcon className="w-5 h-5" />} 
              label="Messages" 
            />
            <RequestsButton />
            <AnnouncementButton />
            {userEmail && (
              <span className="text-sm text-gray-600">
                Welcome, {userEmail.split('@')[0]}
              </span>
            )}
            <button className="text-sm text-red-600 hover:text-red-700">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function RequestsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('pilgrim_request')
        .select(`
          id,
          created_at,
          status,
          sender:profiles!sender_id (
            id,
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('pilgrim_request')
        .update({ 
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId))
      
      toast.success(
        accept 
          ? '✅ Connection request accepted!' 
          : '❌ Connection request declined'
      )

      // Refresh requests
      fetchRequests()
    } catch (error) {
      console.error('Error handling request:', error)
      toast.error('Failed to process request')
    }
  }

  // Format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    return Math.floor(seconds) + ' seconds ago'
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <UserPlusIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Requests</span>
        {requests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {requests.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="relative">
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45" />
              
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Connection Requests</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading requests...
                  </div>
                ) : requests.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="p-4 border-b hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={request.sender.avatar_url || '/headshot.jpg'}
                            alt={request.sender.full_name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {request.sender.full_name}
                            </h4>
                            {request.sender.location && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <MapPinIcon className="w-3 h-3 mr-1" />
                                {request.sender.location}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo(request.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRequest(request.id, true)}
                            className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                            title="Accept request"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRequest(request.id, false)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                            title="Decline request"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AnnouncementButton() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = mockNotifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <BellIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Announcements</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

function NavItem({ icon, label, count, active }: {
  icon: React.ReactNode
  label: string
  count?: number
  active?: boolean
}) {
  return (
    <button className={`flex flex-col items-center space-y-1 relative ${active ? 'text-black' : 'text-gray-500'}`}>
      {icon}
      <span className="text-xs">{label}</span>
      {count && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}