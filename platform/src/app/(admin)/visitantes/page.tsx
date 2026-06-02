import { createClient } from '@/lib/supabase-server'
import VisitantesClient from './VisitantesClient'
import type { Visitor } from '@/types'

export default async function VisitantesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; city?: string; device?: string; date?: string }>
}) {
  const params  = await searchParams
  const page    = Number(params.page ?? 1)
  const perPage = 50
  const from    = (page - 1) * perPage
  const to      = from + perPage - 1

  const supabase = await createClient()
  let query = supabase
    .from('visitors')
    .select('*', { count: 'exact' })
    .order('visited_at', { ascending: false })
    .range(from, to)

  if (params.city)   query = query.ilike('city', `%${params.city}%`)
  if (params.device) query = query.eq('device', params.device)
  if (params.date)   query = query.gte('visited_at', `${params.date}T00:00:00`).lte('visited_at', `${params.date}T23:59:59`)

  const { data: visitors, count } = await query

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">👁️ Visitantes</h1>
        <p className="page-sub">
          {count?.toLocaleString('pt-BR') ?? 0} registros • Filtre por cidade, dispositivo ou data
        </p>
      </div>
      <VisitantesClient
        visitors={(visitors ?? []) as Visitor[]}
        total={count ?? 0}
        page={page}
        perPage={perPage}
      />
    </div>
  )
}
