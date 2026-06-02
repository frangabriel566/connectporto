import { createClient } from '@/lib/supabase-server'
import ConfigClient from './ConfigClient'
import type { SiteConfig } from '@/types'

export default async function ConfigPage() {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('site_config')
    .select('*')
    .order('key')

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">⚙️ Configurações Gerais</h1>
        <p className="page-sub">Gerencie todas as informações do site. Salvo automaticamente ao clicar em Salvar.</p>
      </div>
      <ConfigClient config={(config ?? []) as SiteConfig[]} />
    </div>
  )
}
