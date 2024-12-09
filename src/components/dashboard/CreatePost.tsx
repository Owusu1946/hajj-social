'use client'

import { useState, useRef, useEffect } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Hash, Smile, AtSign, Image, Video, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import LiveStream from './LiveStream'

interface Mention {
  id: string
  username: string
  full_name: string
  avatar_url: string
}

interface Tag {
  id: string
  name: string
}

interface MediaFile {
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

interface CreatePostProps {
  onSubmit: (content: string, tags: string[], mediaUrls: string[], streamUrl?: string) => Promise<void>
}

export default function CreatePost({ onSubmit }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [tagQuery, setTagQuery] = useState('')
  const [mentions, setMentions] = useState<Mention[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClientComponentClient()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLiveStream, setShowLiveStream] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  // Handle mentions search
  useEffect(() => {
    if (mentionQuery) {
      searchUsers(mentionQuery)
    }
  }, [mentionQuery])

  // Handle tags search
  useEffect(() => {
    if (tagQuery) {
      searchTags(tagQuery)
    }
  }, [tagQuery])

  const searchUsers = async (query: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('full_name', `%${query}%`)
      .limit(5)

    if (data) setMentions(data)
  }

  const searchTags = async (query: string) => {
    const { data } = await supabase
      .from('tags')
      .select('id, name')
      .ilike('name', `%${query}%`)
      .limit(5)
  
    if (data) {
      setSuggestedTags(data)
    } else {
      // Fallback to dummy tags if no results or error
      const dummyTags = [
        { id: '1', name: 'hajj2024' },
        { id: '2', name: 'umrah' },
        { id: '3', name: 'makkah' },
        { id: '4', name: 'madinah' },
      ].filter(tag => tag.name.includes(query.toLowerCase()))
      setSuggestedTags(dummyTags)
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (e.key === '@') {
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = content.substring(0, cursorPosition)
      const lastWord = textBeforeCursor.split(/\s/).pop() || ''

      if (lastWord === '@') {
        setShowMentions(true)
        setMentionQuery('')
        e.preventDefault()
      }
    } else if (e.key === '#') {
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = content.substring(0, cursorPosition)
      const lastWord = textBeforeCursor.split(/\s/).pop() || ''

      if (lastWord === '#') {
        setShowTags(true)
        setTagQuery('')
        e.preventDefault()
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPosition)
    
    // Find the last @ or # symbol before cursor
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    const lastHashSymbol = textBeforeCursor.lastIndexOf('#')
    
    if (lastAtSymbol !== -1 && lastAtSymbol > lastHashSymbol) {
      const query = textBeforeCursor.slice(lastAtSymbol + 1)
      if (!query.includes(' ')) {
        setShowMentions(true)
        setMentionQuery(query)
        setShowTags(false)
      }
    } else if (lastHashSymbol !== -1 && lastHashSymbol > lastAtSymbol) {
      const query = textBeforeCursor.slice(lastHashSymbol + 1)
      if (!query.includes(' ')) {
        setShowTags(true)
        setTagQuery(query)
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
      setShowTags(false)
    }
  }

  const insertEmoji = (emoji: any) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + emoji.native + content.substring(end)
      setContent(newContent)
      // Update cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.native.length
        textarea.focus()
      }, 0)
    }
    setShowEmojiPicker(false)
  }

  const addMention = (user: Mention) => {
    const textarea = textareaRef.current
    if (!textarea) return
  
    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = content.substring(0, cursorPosition)
    const textAfterCursor = content.substring(cursorPosition)
    const words = textBeforeCursor.split(/\s/)
    words.pop() // Remove the @query
    
    // Use username instead of full_name for the mention
    const mentionText = `@${user.username} `
    const newContent = words.join(' ') + (words.length > 0 ? ' ' : '') + mentionText + textAfterCursor
  
    setContent(newContent)
    setShowMentions(false)
    
    setTimeout(() => {
      const newPosition = newContent.length - textAfterCursor.length
      textarea.selectionStart = textarea.selectionEnd = newPosition
      textarea.focus()
    }, 0)
  }
  
  const addTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag])
    }
    
    const textarea = textareaRef.current
    if (!textarea) return
  
    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = content.substring(0, cursorPosition)
    const textAfterCursor = content.substring(cursorPosition)
    const words = textBeforeCursor.split(/\s/)
    words.pop() // Remove the #query
    
    // Add tag with special color formatting
    const tagText = `#${tag.name}`
    const newContent = words.join(' ') + ' ' + tagText + ' ' + textAfterCursor
  
    setContent(newContent)
    setShowTags(false)
    
    setTimeout(() => {
      const newPosition = newContent.length - textAfterCursor.length
      textarea.selectionStart = textarea.selectionEnd = newPosition
      textarea.focus()
    }, 0)
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newMediaFiles: MediaFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file)
        newMediaFiles.push({
          file,
          previewUrl,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        })
      }
    }

    setMediaFiles([...mediaFiles, ...newMediaFiles])
  }

  const removeMedia = (index: number) => {
    const newMediaFiles = [...mediaFiles]
    URL.revokeObjectURL(newMediaFiles[index].previewUrl)
    newMediaFiles.splice(index, 1)
    setMediaFiles(newMediaFiles)
  }

  const uploadMedia = async () => {
    const uploadedUrls: string[] = []
    console.log('Starting media upload...')
    
    for (const mediaFile of mediaFiles) {
      try {
        const fileExt = mediaFile.file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
        const filePath = `${mediaFile.type}s/${fileName}`
  
        const { error: uploadError } = await supabase.storage
          .from('upload_media')
          .upload(filePath, mediaFile.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: mediaFile.file.type
          })
  
        if (uploadError) throw uploadError
  
        // Get signed URL
        const { data: signedUrlData } = await supabase.storage
          .from('upload_media')
          .createSignedUrl(filePath, 31536000000) // URL valid for 1000 years
  
        if (signedUrlData?.signedUrl) {
          console.log('Generated signed URL:', signedUrlData.signedUrl)
          uploadedUrls.push(signedUrlData.signedUrl)
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        throw error
      }
    }
  
    return uploadedUrls
  }

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-12 h-12 rounded-full"
          />
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-grow text-left px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
          >
            Start a post
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            <textarea
              ref={textareaRef}
              className="w-full border rounded-lg p-4 min-h-[100px]"
              placeholder="What do you want to talk about? Use @ to mention someone or # for tags"
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map(tag => (
                  <span key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                    #{tag.name}
                    <button onClick={() => removeTag(tag.id)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Mentions Dropdown */}
            {showMentions && mentions.length > 0 && (
              <div className="absolute mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                {mentions.map(user => (
                  <button
                    key={user.id}
                    onClick={() => addMention(user)}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100"
                  >
                    <img src={user.avatar_url || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full" />
                    <span>{user.full_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tags Dropdown */}
            {showTags && suggestedTags.length > 0 && (
              <div className="absolute mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                {suggestedTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => addTag(tag)}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100"
                  >
                    <Hash className="w-4 h-4" />
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                >
                  <Smile className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                >
                  <Image className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setShowLiveStream(true)}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                >
                  <Video className="w-6 h-6" />
                </button>
              </div>
              <button
                onClick={async () => {
                  if (isUploading) return
                  setIsUploading(true)
                  
                  try {
                    const mediaUrls = mediaFiles.length > 0 ? await uploadMedia() : []
                    console.log('Media URLs to submit:', mediaUrls)
                    await onSubmit(content, selectedTags.map(t => t.name), mediaUrls, streamUrl || undefined)
                    setContent('')
                    setSelectedTags([])
                    setMediaFiles([])
                    setIsExpanded(false)
                  } catch (error) {
                    console.error('Error in submit:', error)
                    toast.error('Error uploading media')
                  } finally {
                    setIsUploading(false)
                  }
                }}
                disabled={!content.trim() && mediaFiles.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Post'}
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute mt-2 z-10">
                <Picker data={data} onEmojiSelect={insertEmoji} />
              </div>
            )}

            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative">
                    {media.type === 'image' ? (
                      <img 
                        src={media.previewUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={media.previewUrl} 
                        className="w-full h-48 object-cover rounded-lg" 
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showLiveStream && (
              <LiveStream
                onClose={() => setShowLiveStream(false)}
                onStreamStart={(url) => setStreamUrl(url)}
                onStreamEnd={() => setStreamUrl(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}