'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The admin's data client. Every successful write (insert, update, delete) announces
 * itself with an `admin:saved` event; the admin shell answers by revalidating the
 * public site and showing "live". No page has to remember to publish its changes.
 *
 * Its own instance (not the browser singleton), because the public site creates the
 * plain client first when an admin navigates over from there.
 */
let client: SupabaseClient | null = null

const writes = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

const announcingFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init)
  const method = (init?.method ?? 'GET').toUpperCase()
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (res.ok && writes.has(method) && url.includes('/rest/v1/')) {
    window.dispatchEvent(new Event('admin:saved'))
  }
  return res
}

export function createClient(): SupabaseClient {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: false, global: { fetch: announcingFetch } },
  )
  return client
}
