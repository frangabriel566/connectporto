'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Visitor } from '@/types'

interface Props {
  visitors: Visitor[]
  total: number
  page: number
  perPage: number
}

export default function VisitantesClient({ visitors, total, page, perPage }: Props) {
  const router = useRouter()
  const sp     = useSearchParams()

  const [filters, setFilters] = useState({
    city:   sp.get('city')   ?? '',
    device: sp.get('device') ?? '',
    date:   sp.get('date')   ?? '',
  })

  function applyFilters() {
    const q = new URLSearchParams()
    if (filters.city)   q.set('city',   filters.city)
    if (filters.device) q.set('device', filters.device)
    if (filters.date)   q.set('date',   filters.date)
    q.set('page', '1')
    router.push(`/admin/visitantes?${q.toString()}`)
  }

  function clearFilters() {
    setFilters({ city: '', device: '', date: '' })
    router.push('/admin/visitantes')
  }

  function exportCSV() {
    const header = ['IP', 'Cidade', 'Estado', 'País', 'Navegador', 'Dispositivo', 'SO', 'Página', 'Referrer', 'Data']
    const rows   = visitors.map(v => [
      v.ip, v.city, v.state, v.country, v.browser, v.device, v.os, v.page, v.referrer,
      new Date(v.visited_at).toLocaleString('pt-BR'),
    ])
    const csv  = [header, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `visitantes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const pages = Math.ceil(total / perPage)

  function goPage(p: number) {
    const q = new URLSearchParams(sp.toString())
    q.set('page', String(p))
    router.push(`/admin/visitantes?${q.toString()}`)
  }

  const deviceBadge: Record<string, string> = {
    Mobile:  'badge-blue',
    Desktop: 'badge-green',
    Tablet:  'badge-yellow',
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="admin-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Cidade</label>
            <input
              type="text"
              value={filters.city}
              onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Ex: Porto"
              className="admin-input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Dispositivo</label>
            <select
              value={filters.device}
              onChange={e => setFilters(f => ({ ...f, device: e.target.value }))}
              className="admin-input"
            >
              <option value="">Todos</option>
              <option value="Mobile">Mobile</option>
              <option value="Desktop">Desktop</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Data</label>
            <input
              type="date"
              value={filters.date}
              onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
              className="admin-input"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={applyFilters} className="btn-primary text-xs py-1.5">Filtrar</button>
          <button onClick={clearFilters} className="btn-secondary text-xs py-1.5">Limpar</button>
          <button onClick={exportCSV} className="btn-secondary text-xs py-1.5 ml-auto">
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table whitespace-nowrap">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Localização</th>
                <th>Dispositivo</th>
                <th>Navegador / SO</th>
                <th>Página</th>
                <th>Origem</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-10">Nenhum visitante encontrado</td>
                </tr>
              ) : (
                visitors.map(v => (
                  <tr key={v.id}>
                    <td className="text-xs">
                      {new Date(v.visited_at).toLocaleDateString('pt-BR')}
                      <span className="block text-slate-400">{new Date(v.visited_at).toLocaleTimeString('pt-BR')}</span>
                    </td>
                    <td className="text-xs">
                      <div>{v.city ?? '—'}{v.state ? `, ${v.state}` : ''}</div>
                      <div className="text-slate-400">{v.country ?? '—'}</div>
                    </td>
                    <td>
                      <span className={`badge ${deviceBadge[v.device ?? ''] ?? 'badge-gray'}`}>
                        {v.device ?? '—'}
                      </span>
                    </td>
                    <td className="text-xs">
                      <div>{v.browser ?? '—'}</div>
                      <div className="text-slate-400">{v.os ?? '—'}</div>
                    </td>
                    <td className="text-xs max-w-xs truncate">{v.page ?? '/'}</td>
                    <td className="text-xs text-slate-500 max-w-xs truncate">{v.referrer ?? 'Direto'}</td>
                    <td className="text-xs font-mono text-slate-400">{v.ip ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button disabled={page === 1} onClick={() => goPage(page - 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">←</button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`text-xs py-1.5 px-3 rounded-lg ${p === page ? 'bg-brand text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            )
          })}
          <button disabled={page === pages} onClick={() => goPage(page + 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  )
}
