import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'

export const metadata = { title: 'Admin | Calisthenics Mainz' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100svh',
        background: 'var(--bg)',
      }}
    >
      <AdminSidebar user={user} />
      <main
        style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  )
}
