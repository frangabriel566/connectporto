import { createClient } from '@/lib/supabase-server'
import BannersClient from './BannersClient'
import type { Banner } from '@/types'

export default async function BannersPage() {
  const supabase = await createClient()
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('order_index')

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">🖼️ Banners Promocionais</h1>
        <p className="page-sub">Gerencie os banners do carrossel. Ative, desative, reordene e programe.</p>
      </div>
      <BannersClient banners={(banners ?? []) as Banner[]} />
    </div>
  )
}
