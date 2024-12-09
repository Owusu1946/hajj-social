'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserPlusIcon, UserCheckIcon, UserIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ConnectionButtonProps {
  agentId: string
  currentUserId: string
}

export default function ConnectionButton({ agentId, currentUserId }: ConnectionButtonProps) {
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted'>('none')
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClientComponentClient()
  
    useEffect(() => {
      if (currentUserId && agentId) {
        checkConnectionStatus()
      }
    }, [agentId, currentUserId])
  
    const checkConnectionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('connections')
          .select('status')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${agentId}),and(sender_id.eq.${agentId},receiver_id.eq.${currentUserId})`)
          .single()
  
        if (error) {
          console.error('Error checking connection status:', error)
          return
        }
  
        if (data) {
          setConnectionStatus(data.status as 'pending' | 'accepted')
        }
      } catch (error) {
        console.error('Error checking connection status:', error)
      }
    }
  
    const handleConnect = async () => {
      if (!currentUserId) {
        toast.error('Please login to connect')
        return
      }
    
      setIsLoading(true)
      try {
        // First check if connection already exists
        const { data: existingConnection } = await supabase
          .from('connections')
          .select('id')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${agentId}),and(sender_id.eq.${agentId},receiver_id.eq.${currentUserId})`)
          .single()
    
        if (existingConnection) {
          toast.error('Connection already exists')
          return
        }
    
        // Start a Supabase transaction to insert both connection and notification
        const { data: connection, error: connectionError } = await supabase
          .from('connections')
          .insert({
            sender_id: currentUserId,
            receiver_id: agentId,
            status: 'pending'
          })
          .select()
          .single()
    
        if (connectionError) throw connectionError
    
        // Create notification for the receiver
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: agentId,
            type: 'connection_request',
            content: 'sent you a connection request',
            related_id: connection.id
          })
    
        if (notificationError) throw notificationError
    
        setConnectionStatus('pending')
        toast.success('Connection request sent!')
        
      } catch (error: any) {
        console.error('Error sending connection request:', error)
        toast.error(error.message || 'Failed to send connection request')
      } finally {
        setIsLoading(false)
      }
    }
    // Rest of the component remains the same
    const getButtonContent = () => {
      switch (connectionStatus) {
        case 'pending':
          return (
            <>
              <UserIcon className="w-5 h-5" />
              <span>Request Sent</span>
            </>
          )
        case 'accepted':
          return (
            <>
              <UserCheckIcon className="w-5 h-5" />
              <span>Connected</span>
            </>
          )
        default:
          return (
            <>
              <UserPlusIcon className="w-5 h-5" />
              <span>Connect</span>
            </>
          )
      }
    }
  
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading || connectionStatus !== 'none'}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
          connectionStatus === 'accepted'
            ? 'bg-green-600 text-white'
            : connectionStatus === 'pending'
            ? 'bg-gray-200 text-gray-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        {getButtonContent()}
      </button>
    )
  }