import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath('/de', 'page')
  revalidatePath('/en', 'page')
  revalidatePath('/de/blog/[slug]', 'page')
  revalidatePath('/en/blog/[slug]', 'page')

  return NextResponse.json({ revalidated: true })
}
