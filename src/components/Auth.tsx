 'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function AuthComponent() {
  return (
    <div className="max-w-md mx-auto p-8">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={['google']}
        socialLayout="horizontal"
        redirectTo={`${window.location.origin}/auth/callback`}
      />
    </div>
  )
}