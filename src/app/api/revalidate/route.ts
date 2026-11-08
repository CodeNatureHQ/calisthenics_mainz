import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // The whole public site in both languages: home, blog posts, Über uns, Ausrüstung,
  // Impressum, and the announcement in the shared layout.
  revalidatePath('/[lang]', 'layout')

  return NextResponse.json({ revalidated: true })
}
