import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLocation('/dashboard')
      } else {
        setLocation('/auth')
      }
    })
  }, [setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="text-xl font-semibold">מאמת זהות...</div>
      </div>
    </div>
  )
}

