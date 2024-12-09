'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'

interface Post {
    id: string
    user_id: string
    content: string
    created_at: string
    media_urls: string[]  // Add this line
    profiles: {
      full_name: string
      avatar_url?: string
    }
    likes: number
    comments: number
  }

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
  }
}

interface Profile {
  full_name: string
  avatar_url?: string
}

interface LikeButtonProps {
  liked: boolean
  likesCount: number
  isLoading: boolean
  onClick: () => void
}

const LikeButton = ({ liked, likesCount, isLoading, onClick }: LikeButtonProps) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`flex items-center justify-center w-full space-x-2 py-2 hover:bg-gray-50 rounded-lg relative
      ${liked ? 'text-blue-600' : 'text-gray-500'}
      ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute left-1/2 transform -translate-x-1/2"
        >
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      ) : (
        <motion.div
          key="icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-2"
        >
          <svg 
            className="w-5 h-5" 
            fill={liked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <motion.span
            key={likesCount}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  </button>
)

interface CommentButtonProps {
  commentsCount: number
  isOpen: boolean
  onClick: () => void
}
const renderContent = (content: string, router: any, supabase: any) => {
  // Handle mentions
  const withMentions = content.replace(
    /@(\w+)/g,
    '<span class="text-blue-600 hover:underline cursor-pointer" data-username="$1">@$1</span>'
  )
  
  // Handle hashtags
  const withTags = withMentions.replace(
    /#(\w+)/g,
    '<span class="text-blue-600 cursor-pointer hover:underline">#$1</span>'
  )
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: withTags }} 
      className="whitespace-pre-wrap"
      onClick={async (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('text-blue-600')) {
          const text = target.textContent || '';
          if (text.startsWith('@')) {
            const username = target.getAttribute('data-username');
            if (!username) return;

            // Check if user is an agent
            const { data: userData } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('username', username)
              .single();

            if (userData) {
              const route = userData.role === 'agent' 
                ? `/agent/${userData.id}` 
                : `/user/${userData.id}`;
              router.push(route);
            }
          } else if (text.startsWith('#')) {
            const tag = text.slice(1);
            router.push(`/tag/${tag}`);
          }
        }
      }}
    />
  )
}

const CommentButton = ({ commentsCount, isOpen, onClick }: CommentButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-full space-x-2 py-2 hover:bg-gray-50 rounded-lg
      ${isOpen ? 'text-blue-600' : 'text-gray-500'}
    `}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
      />
    </svg>
    <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
  </button>
)

const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}

export default function PostCard({ post, currentUserId }: { 
  post: Post
  currentUserId: string 
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const {isSupabaseConnected} = useConnectionStatus()
  const [likesCount, setLikesCount] = useState(post.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentsCount, setCommentsCount] = useState(post.comments || 0)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const supabase = createClientComponentClient()
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    checkIfLiked()
    getLikesCount()
    if (currentUserId) {
      getUserProfile()
    }
  }, [currentUserId])

  useEffect(() => {
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newComment } = await supabase
              .from('comments')
              .select(`*, profiles(full_name, avatar_url)`)
              .eq('id', payload.new.id)
              .single()
            
            if (newComment) {
              setComments(prev => [newComment, ...prev])
              setCommentsCount(prev => prev + 1)
            }
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id))
            setCommentsCount(prev => prev - 1)
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev => prev.map(c => 
              c.id === payload.new.id ? { ...c, content: payload.new.content } : c
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [post.id])

  const checkIfLiked = async () => {
    if (!currentUserId) return;
    
    const { data } = await supabase
      .from('likes')
      .select()
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();
    
    setLiked(!!data);
  }

  const getLikesCount = async () => {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('post_id', post.id);
    
    setLikesCount(count || 0);
  }

  const getUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', currentUserId)
      .single()
    
    if (data) {
      setUserProfile(data)
    }
  }

  const handleComment = async (parentId?: string) => {
    if (!currentUserId || isCommentLoading) return
    if (!isSupabaseConnected) {
      toast.error('Cannot post comment while offline')
      return
    }

    if (!newComment.trim() || !currentUserId || isCommentLoading) return;

    setIsCommentLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setComments(prev => [data, ...prev]);
        setNewComment('');
        // Update post comments count
        const newCount = post.comments + 1;
        await supabase
          .from('posts')
          .update({ comments: newCount })
          .eq('id', post.id);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
  };

  const handleLike = async () => {
    if (!currentUserId || isLikeLoading) return
    if (!isSupabaseConnected) {
      toast.error('Cannot like post while offline')
      return
    }

    if (!currentUserId || isLikeLoading) return;
    
    setIsLikeLoading(true);
    try {
      if (liked) {
        // Remove like
        const { error: deleteLikeError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);

        if (deleteLikeError) {
          console.error('Delete like error:', deleteLikeError.message);
          return;
        }

        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Add like
        const { error: insertLikeError } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: currentUserId
          });

        if (insertLikeError) {
          console.error('Insert like error:', insertLikeError.message);
          return;
        }

        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error handling like:', error.message);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) return

    setIsDeleting(prev => ({ ...prev, [commentId]: true }))
    // Optimistic update
    const previousComments = [...comments]
    setComments(comments.filter(c => c.id !== commentId))
    
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', currentUserId)

        if (error) throw error
      })
      
      toast.success('Comment deleted successfully')
    } catch (error: any) {
      // Revert optimistic update
      setComments(previousComments)
      toast.error('Failed to delete comment. Please try again.')
      console.error('Error deleting comment:', error)
    } finally {
      setIsDeleting(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!currentUserId || !editContent.trim()) return

    setIsEditing(prev => ({ ...prev, [commentId]: true }))
    const previousComments = [...comments]
    const newContent = editContent.trim()
    
    // Optimistic update
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, content: newContent } : c
    ))
    
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('comments')
          .update({ content: newContent })
          .eq('id', commentId)
          .eq('user_id', currentUserId)

        if (error) throw error
      })
      
      setEditingCommentId(null)
      setEditContent('')
      toast.success('Comment updated successfully')
    } catch (error: any) {
      // Revert optimistic update
      setComments(previousComments)
      toast.error('Failed to update comment. Please try again.')
      console.error('Error editing comment:', error)
    } finally {
      setIsEditing(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleReply = (e: React.MouseEvent<HTMLButtonElement>, parentId?: string) => {
    e.preventDefault()
    toggleReply(parentId)
  }

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex space-x-2"
    >
      <img
        src={comment.profiles.avatar_url || '/headshot.jpg'}
        alt=""
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-grow">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500">
                {format(new Date(comment.created_at), 'MMM d, yyyy')}
              </p>
              {currentUserId === comment.user_id && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id)
                      setEditContent(comment.content)
                    }}
                    disabled={isEditing[comment.id] || isDeleting[comment.id]}
                    className="text-gray-500 hover:text-blue-600 disabled:opacity-50"
                  >
                    {isEditing[comment.id] ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </motion.div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={isDeleting[comment.id] || isEditing[comment.id]}
                    className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                  >
                    {isDeleting[comment.id] ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </motion.div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          {editingCommentId === comment.id ? (
            <div className="mt-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setEditingCommentId(null)
                    setEditContent('')
                  }}
                  className="text-sm text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="text-sm text-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1">{comment.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start">
          <img
            src={post.profiles.avatar_url || 'https://via.placeholder.com/40'}
            alt={post.profiles.full_name}
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-3 flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold hover:text-blue-600 hover:underline cursor-pointer">
                  {post.profiles.full_name}
                </h3>
                <p className="text-xs text-gray-500">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-3">
          {renderContent(post.content, router, supabase)}
          {post.media_urls && post.media_urls.length > 0 && (
  <div className="mt-4 grid grid-cols-2 gap-2">
    {post.media_urls.map((url, index) => {
      // Update video detection to include mp4 and check for signed URLs
      const isVideo = url.toLowerCase().includes('/videos/') || 
                     url.toLowerCase().match(/\.(mpmov|avi|wmv)$/);
      
      return (
        <div key={index} className="relative bg-gray-100 rounded-lg">
          {isVideo ? (
            <video 
              src={url} 
              className="w-full h-48 object-cover rounded-lg" 
              controls
              playsInline
              onError={(e) => {
                console.error('Video load error:', e.currentTarget.error);
                e.currentTarget.outerHTML = `<div class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">Video Error</div>`;
              }}
            />
          ) : (
            <img 
              src={url} 
              alt="Post media" 
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                console.error('Image load error:', {
                  url,
                  error: e.currentTarget.onerror
                });
                e.currentTarget.src = 'https://via.placeholder.com/300?text=Error+Loading+Image';
                e.currentTarget.onerror = null;
              }}
            />
          )}
        </div>
      );
    })}
  </div>
)}
        </div>
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center text-gray-500 text-sm">
          <div className="flex items-center">
            <span className="flex -space-x-1">
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </span>
            </span>
            <span className="ml-2">{likesCount} likes</span>
          </div>
          <span className="mx-2">•</span>
          <button className="hover:text-blue-600 hover:underline">
            {post.comments} comments
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex justify-between">
          <LikeButton 
            liked={liked}
            likesCount={likesCount}
            isLoading={isLikeLoading}
            onClick={handleLike}
          />

          <CommentButton 
            commentsCount={post.comments}
            isOpen={showComments}
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) loadComments();
            }}
          />

          <button className="flex items-center justify-center w-full space-x-2 py-2 hover:bg-gray-50 rounded-lg text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="px-4 py-3 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow px-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim() || isCommentLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCommentLoading ? 'Posting...' : 'Post'}
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

