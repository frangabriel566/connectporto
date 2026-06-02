import { createClient } from '@/lib/supabase-server'
import type { AuditLog } from '@/types'

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params  = await searchParams
  const page    = Number(params.page ?? 1)
  const perPage = 100
  const from    = (page - 1) * perPage

  const supabase = await createClient()
  const { data: logs, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  const actionColor: Record<string, string> = {
    UPDATE: 'badge-blue',
    CREATE: 'badge-green',
    DELETE: 'badge-red',
    ACTIVATE: 'badge-yellow',
    DEACTIVATE: 'badge-gray',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">📋 Logs do Sistema</h1>
        <p className="page-sub">{count?.toLocaleString('pt-BR') ?? 0} registros de auditoria</p>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table whitespace-nowrap">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>Detalhes</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {(logs as AuditLog[] ?? []).map(l => (
                <tr key={l.id}>
                  <td className="text-xs text-slate-500">
                    {new Date(l.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td>
                    <span className={`badge ${actionColor[l.action] ?? 'badge-gray'}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="text-sm">
                    <div className="font-medium">{l.entity ?? '—'}</div>
                    {l.entity_id && <div className="text-xs text-slate-400 font-mono">{l.entity_id}</div>}
                  </td>
                  <td className="text-xs text-slate-500 max-w-sm">
                    {l.new_value ? (
                      <pre className="text-[10px] bg-slate-50 rounded p-1 overflow-x-auto">
                        {JSON.stringify(l.new_value, null, 2)}
                      </pre>
                    ) : '—'}
                  </td>
                  <td className="text-xs text-slate-400">{l.user_email ?? '—'}</td>
                </tr>
              ))}
              {!logs?.length && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">Nenhum log encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
