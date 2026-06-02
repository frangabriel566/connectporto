import Sidebar from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
          <div className="text-sm text-slate-500" id="topbar-title" />
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
              <span className="text-brand text-xs font-bold">
                {user.email?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:block">{user.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-screen-xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
