import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminShell from '@/components/admin/Shell'

export const metadata = { title: 'Admin | Calisthenics Mainz' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  return (
    <AdminShell>
      <AdminSidebar user={user} />
      <main className="admin-main" style={{ flex: 1, padding: '32px 40px 80px', paddingLeft: 280, overflowY: 'auto', minWidth: 0 }}>
        {/* list pages read ?edit= deep links via useSearchParams */}
        <Suspense>{children}</Suspense>
      </main>
    </AdminShell>
  )
}
