import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LiveStreamProps {
  onClose: () => void
  onStreamStart: (streamUrl: string) => void
  onStreamEnd: () => void
}

export default function LiveStream({ onClose, onStreamStart, onStreamEnd }: LiveStreamProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamKey, setStreamKey] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    // Generate unique stream key
    setStreamKey(`stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    
    return () => {
      stopStream()
    }
  }, [])

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      mediaRecorderRef.current = mediaRecorder
      
      // Handle stream data
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const chunk = event.data
          // Upload chunk to Supabase storage
          const { data, error } = await supabase.storage
            .from('live_streams')
            .upload(`${streamKey}/${Date.now()}.webm`, chunk)

          if (error) {
            console.error('Error uploading stream chunk:', error)
            return
          }

          // Notify subscribers about new chunk
          await supabase
            .channel('live_stream')
            .send({
              type: 'broadcast',
              event: 'stream_chunk',
              payload: { streamKey, chunkUrl: data?.path }
            })
        }
      }

      mediaRecorder.start(1000) // Capture chunks every second
      setIsStreaming(true)
      onStreamStart(`live_streams/${streamKey}`)
      
    } catch (error) {
      console.error('Error starting stream:', error)
      toast.error('Failed to start stream')
    }
  }

  const stopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    setIsStreaming(false)
    onStreamEnd()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Live Stream</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center space-x-4">
          {!isStreaming ? (
            <button
              onClick={startStream}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              Start Streaming
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
            >
              Stop Streaming
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 