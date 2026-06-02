import { createClient } from '@/lib/supabase-server'
import CampanhasClient from './CampanhasClient'
import type { Campaign } from '@/types'

export default async function CampanhasPage() {
  const supabase = await createClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('id')

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">📣 Campanhas Sazonais</h1>
        <p className="page-sub">
          Ative uma campanha para exibir banner temático no site. Apenas uma ativa por vez.
        </p>
      </div>
      <CampanhasClient campaigns={(campaigns ?? []) as Campaign[]} />
    </div>
  )
}
