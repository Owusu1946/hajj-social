import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange code for session
      const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)
      
      if (user) {
        // Create profile if it doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single()
          
        if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.user_metadata.full_name || '',
            avatar_url: user.user_metadata.avatar_url || '',
            role: 'pilgrim' // default role
          })
        }
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}