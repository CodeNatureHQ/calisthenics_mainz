import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'unsure']),
  message: z.string().min(10),
  privacy: z.boolean().refine((v) => v === true),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }

    const { name, email, level, message } = result.data

    const supabase = await createClient()
    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, level, message })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
