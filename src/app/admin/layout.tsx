import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'

export const metadata = { title: 'Admin | Calisthenics Mainz' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  return (
    <div style={{ display: 'flex', minHeight: '100svh', background: 'var(--bg)' }}>
      <AdminSidebar user={user} />
      <main className="admin-main" style={{ flex: 1, padding: '32px 40px 80px', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
