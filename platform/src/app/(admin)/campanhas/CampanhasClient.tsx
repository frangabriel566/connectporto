'use client'

import { useState } from 'react'
import type { Campaign } from '@/types'

interface Props { campaigns: Campaign[] }

export default function CampanhasClient({ campaigns: initial }: Props) {
  const [list, setList]   = useState<Campaign[]>(initial)
  const [loading, setLoading] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  async function toggle(id: number, active: boolean) {
    setLoading(id)
    const res = await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    if (res.ok) {
      // Só uma ativa por vez
      setList(l => l.map(c => ({ ...c, active: active ? c.id === id : c.id === id ? false : c.active })))
      const camp = list.find(c => c.id === id)
      showToast(active ? `✅ ${camp?.emoji} ${camp?.name} ativada no site!` : '⚪ Campanha desativada')
    }
    setLoading(null)
  }

  const ativa = list.find(c => c.active)

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Status bar */}
      {ativa && (
        <div
          className="p-4 rounded-xl mb-5 flex items-center gap-3 border"
          style={{ background: ativa.bg_color, borderColor: ativa.color + '44', color: ativa.text_color }}
        >
          <span className="text-2xl">{ativa.emoji}</span>
          <div>
            <div className="font-semibold text-sm">{ativa.name} está ativa no site agora</div>
            <div className="text-xs opacity-70">Visível em todos os dispositivos</div>
          </div>
          <button
            onClick={() => toggle(ativa.id, false)}
            className="ml-auto text-xs border border-current opacity-70 hover:opacity-100 px-3 py-1 rounded-lg transition-opacity"
          >
            Desativar
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {list.map(c => (
          <CampaignCard
            key={c.id}
            campaign={c}
            loading={loading === c.id}
            onToggle={active => toggle(c.id, active)}
          />
        ))}
      </div>

      {/* Info */}
      <div className="admin-card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">📋 Como funciona</h3>
        <ul className="text-blue-700 text-xs leading-relaxed space-y-1">
          <li>✓ Ao ativar: banner temático aparece no topo do site público imediatamente</li>
          <li>✓ Apenas uma campanha pode estar ativa. Ativar outra desativa a anterior automaticamente</li>
          <li>✓ Para desativar sem ativar outra, clique no toggle da campanha ativa</li>
          <li>✓ Funciona em desktop, tablet e celular</li>
        </ul>
      </div>
    </div>
  )
}

function CampaignCard({
  campaign: c,
  loading,
  onToggle,
}: {
  campaign: Campaign
  loading: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div
      className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-all
        ${c.active
          ? 'shadow-md scale-[1.02]'
          : 'border-slate-200 hover:border-slate-300'
        }`}
      style={c.active ? { borderColor: c.color, background: c.bg_color, color: c.text_color } : {}}
    >
      {/* Active dot */}
      {c.active && (
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-300 animate-pulse" />
      )}

      <span className="text-3xl leading-none">{c.emoji}</span>
      <span className="text-xs font-semibold leading-tight"
        style={{ color: c.active ? c.text_color : '#1e293b' }}
      >
        {c.name}
      </span>

      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? 'bg-white/40' : 'bg-slate-100 text-slate-400'}`}>
        {c.active ? '● Ativa' : 'Inativa'}
      </span>

      <label className="toggle-wrap mt-1">
        <input
          type="checkbox"
          className="toggle-input"
          checked={c.active}
          disabled={loading}
          onChange={e => onToggle(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}
