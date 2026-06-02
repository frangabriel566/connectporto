import { createClient } from '@/lib/supabase-server'
import AnalyticsClient from './AnalyticsClient'
import type { Integration } from '@/types'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .order('created_at')

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Analytics & Rastreamento</h1>
        <p className="page-sub">
          Gerencie Meta Pixel, Google Ads e GA4. Alterações aplicadas automaticamente — sem editar código.
        </p>
      </div>
      <AnalyticsClient integrations={(integrations ?? []) as Integration[]} />
    </div>
  )
}
