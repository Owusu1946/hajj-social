import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageUploadProps {
  type: 'avatar' | 'cover'
  currentUrl?: string
  userId: string
  onUploadComplete: (url: string) => void
}

export default function ImageUpload({ type, currentUrl, userId, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClientComponentClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }
  
      const file = event.target.files[0]
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const filePath = `${type}s/${type}-${userId}-${timestamp}.${fileExt}`
  
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file)
  
      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }
  
      // Get signed URL with 2000 years expiration
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('profile-images')
        .createSignedUrl(filePath, 63072000000) // 2000 years in seconds
  
      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError)
        throw signedUrlError
      }
  
      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to get signed URL')
      }
  
      // Update profile with signed URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          [type === 'avatar' ? 'avatar_url' : 'cover_url']: signedUrlData.signedUrl 
        })
        .eq('id', userId)
  
      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }
  
      onUploadComplete(signedUrlData.signedUrl)
      toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} photo updated successfully`)
  
    } catch (error) {
      toast.error('Error uploading image')
      console.error('Full error:', error)
    } finally {
      setUploading(false)
    }
  }
  return (
    <div className="relative group">
      {type === 'avatar' ? (
        <div className="relative w-32 h-32">
          <Image
            src={currentUrl || '/headshot.jpg'}
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
          <label
            className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 
                     rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition
                     ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Upload className="w-6 h-6 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl" />
          {currentUrl && (
            <Image
              src={currentUrl}
              alt="Cover"
              fill
              className="rounded-xl object-cover"
            />
          )}
          <label
            className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 
                     rounded-xl opacity-0 group-hover:opacity-100 transition
                     ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Upload className="w-8 h-8 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}