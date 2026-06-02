import { createClient } from '@/lib/supabase-server'
import type { Lead } from '@/types'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const params  = await searchParams
  const page    = Number(params.page ?? 1)
  const perPage = 50
  const from    = (page - 1) * perPage

  const supabase = await createClient()
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,city.ilike.%${params.q}%,phone.ilike.%${params.q}%`)
  }

  const { data: leads, count } = await query

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">🎯 Leads</h1>
        <p className="page-sub">{count?.toLocaleString('pt-BR') ?? 0} leads capturados</p>
      </div>

      {/* Export */}
      <div className="flex justify-end mb-4">
        <a
          href="/api/leads/export"
          className="btn-secondary text-xs py-1.5"
        >
          ↓ Exportar CSV
        </a>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table whitespace-nowrap">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>Plano Interesse</th>
                <th>Origem</th>
                <th>Página</th>
              </tr>
            </thead>
            <tbody>
              {(leads as Lead[] ?? []).map(l => (
                <tr key={l.id}>
                  <td className="text-xs text-slate-500">
                    {new Date(l.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="font-medium">{l.name ?? '—'}</td>
                  <td className="font-mono text-sm">{l.phone ?? '—'}</td>
                  <td>{l.city ?? '—'}</td>
                  <td>
                    {l.plan_interest
                      ? <span className="badge badge-blue">{l.plan_interest}</span>
                      : '—'}
                  </td>
                  <td>
                    <span className={`badge ${l.source === 'whatsapp' ? 'badge-green' : 'badge-gray'}`}>
                      {l.source ?? '—'}
                    </span>
                  </td>
                  <td className="text-xs text-slate-400 max-w-xs truncate">{l.page ?? '—'}</td>
                </tr>
              ))}
              {!leads?.length && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-10">Nenhum lead encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
