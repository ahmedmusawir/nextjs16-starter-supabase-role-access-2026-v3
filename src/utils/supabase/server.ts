// src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const secure = siteUrl.startsWith("https://")

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            // Preserve the kit's cookie security flags (secure / sameSite / httpOnly)
            // while modernizing the mechanism to getAll/setAll. httpOnly:false is a
            // deliberate choice — Supabase needs client-side access to the session.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                secure,
                sameSite: 'lax',
                httpOnly: false,
              })
            )
          } catch {
            // setAll was called from a Server Component — ignored; updateSession
            // (proxy/middleware) refreshes the session cookies on the next request.
          }
        },
      },
    }
  )
}