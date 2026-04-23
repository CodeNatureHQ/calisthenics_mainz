/**
 * Run once after schema setup:
 *   npx ts-node --skip-project supabase/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const seed = require('./seed.json')

async function main() {
  console.log('Seeding database …')

  // Posts
  const { error: postsErr } = await supabase.from('posts').upsert(seed.posts)
  if (postsErr) console.error('posts:', postsErr.message)
  else console.log(`✓ ${seed.posts.length} posts`)

  // Events
  const { error: eventsErr } = await supabase.from('events').upsert(seed.events)
  if (eventsErr) console.error('events:', eventsErr.message)
  else console.log(`✓ ${seed.events.length} events`)

  // Training sessions
  const { error: trainingErr } = await supabase.from('training_sessions').upsert(seed.training_sessions)
  if (trainingErr) console.error('training_sessions:', trainingErr.message)
  else console.log(`✓ ${seed.training_sessions.length} training sessions`)

  // Calendar overrides
  const { error: overridesErr } = await supabase.from('calendar_overrides').upsert(seed.calendar_overrides)
  if (overridesErr) console.error('calendar_overrides:', overridesErr.message)
  else console.log(`✓ ${seed.calendar_overrides.length} calendar overrides`)

  // Spots (with lat/lng added)
  const spotsWithCoords = seed.spots.map((s: Record<string, unknown>) => ({
    ...s,
    lat: s.id === 'jgu' ? 49.9927 : s.id === 'volkspark' ? 49.9793 : s.id === 'biebrich' ? 50.0118 : null,
    lng: s.id === 'jgu' ? 8.2297  : s.id === 'volkspark' ? 8.2619  : s.id === 'biebrich' ? 8.2385  : null,
    subtitle: s.subtitle ?? { de: '', en: '' },
    images: [],
  }))
  const { error: spotsErr } = await supabase.from('spots').upsert(spotsWithCoords)
  if (spotsErr) console.error('spots:', spotsErr.message)
  else console.log(`✓ ${spotsWithCoords.length} spots`)

  // Site settings
  const { error: settingsErr } = await supabase
    .from('site_settings')
    .upsert({ id: 1, ...seed.site_settings })
  if (settingsErr) console.error('site_settings:', settingsErr.message)
  else console.log('✓ site_settings')

  console.log('Done!')
}

main().catch(console.error)
