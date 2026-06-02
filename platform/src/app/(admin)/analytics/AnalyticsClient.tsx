'use client'

import { useState } from 'react'
import type { Integration } from '@/types'

const INTEGRATION_META: Record<string, { label: string; icon: string; color: string; placeholder: string; secondaryLabel?: string; secondaryPlaceholder?: string }> = {
  meta_pixel: {
    label: 'Meta Pixel (Facebook / Instagram)',
    icon: '📘',
    color: 'bg-blue-50 border-blue-100',
    placeholder: 'Ex: 965565039421014',
  },
  google_ads: {
    label: 'Google Ads',
    icon: '🟡',
    color: 'bg-yellow-50 border-yellow-100',
    placeholder: 'Conversion ID — Ex: 18179908366',
    secondaryLabel: 'Conversion Label',
    secondaryPlaceholder: 'Ex: AW-XXXXXXXX/YYYYYYY',
  },
  ga4: {
    label: 'Google Analytics 4 (GA4)',
    icon: '📊',
    color: 'bg-orange-50 border-orange-100',
    placeholder: 'Measurement ID — Ex: G-XXXXXXXXXX',
  },
  gtm: {
    label: 'Google Tag Manager',
    icon: '🏷️',
    color: 'bg-blue-50 border-blue-100',
    placeholder: 'Container ID — Ex: GTM-XXXXXXXX',
  },
  tiktok: {
    label: 'TikTok Pixel',
    icon: '🎵',
    color: 'bg-slate-50 border-slate-100',
    placeholder: 'Pixel ID',
  },
}

interface Props { integrations: Integration[] }

export default function AnalyticsClient({ integrations: initial }: Props) {
  const [list, setList]     = useState<Integration[]>(initial)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast]   = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ type: 'meta_pixel', name: '', value: '', secondary_value: '' })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  async function toggleActive(id: string, active: boolean) {
    setSaving(id)
    const res = await fetch(`/api/integrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    if (res.ok) {
      setList(l => l.map(i => i.id === id ? { ...i, active } : i))
      showToast(active ? '✅ Integração ativada' : '⚪ Integração desativada')
    }
    setSaving(null)
  }

  async function saveValue(id: string, value: string, secondary: string) {
    setSaving(id)
    const res = await fetch(`/api/integrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, secondary_value: secondary }),
    })
    if (res.ok) {
      setList(l => l.map(i => i.id === id ? { ...i, value, secondary_value: secondary } : i))
      showToast('✅ Salvo com sucesso!')
    }
    setSaving(null)
  }

  async function deleteIntegration(id: string) {
    if (!confirm('Remover esta integração?')) return
    const res = await fetch(`/api/integrations/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setList(l => l.filter(i => i.id !== id))
      showToast('🗑️ Integração removida')
    }
  }

  async function addIntegration() {
    const res = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newItem,
        name: newItem.name || INTEGRATION_META[newItem.type]?.label || newItem.type,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setList(l => [...l, data])
      setShowAdd(false)
      setNewItem({ type: 'meta_pixel', name: '', value: '', secondary_value: '' })
      showToast('✅ Integração adicionada!')
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Integrations list */}
      {list.map(item => {
        const meta = INTEGRATION_META[item.type] ?? { label: item.name, icon: '⚙️', color: 'bg-slate-50 border-slate-100', placeholder: 'Valor' }
        return (
          <IntegrationCard
            key={item.id}
            item={item}
            meta={meta}
            saving={saving === item.id}
            onToggle={active => toggleActive(item.id, active)}
            onSave={(v, sv) => saveValue(item.id, v, sv)}
            onDelete={() => deleteIntegration(item.id)}
          />
        )
      })}

      {/* Add new */}
      {showAdd ? (
        <div className="admin-card border-dashed border-2 border-brand/30">
          <h3 className="font-semibold text-navy mb-4">Nova Integração</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo</label>
              <select
                value={newItem.type}
                onChange={e => setNewItem(n => ({ ...n, type: e.target.value }))}
                className="admin-input"
              >
                {Object.entries(INTEGRATION_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nome (opcional)</label>
              <input
                type="text"
                value={newItem.name}
                onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                placeholder="Nome customizado"
                className="admin-input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">ID / Valor</label>
              <input
                type="text"
                value={newItem.value}
                onChange={e => setNewItem(n => ({ ...n, value: e.target.value }))}
                placeholder={INTEGRATION_META[newItem.type]?.placeholder ?? 'Valor'}
                className="admin-input"
              />
            </div>
            {INTEGRATION_META[newItem.type]?.secondaryLabel && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  {INTEGRATION_META[newItem.type].secondaryLabel}
                </label>
                <input
                  type="text"
                  value={newItem.secondary_value}
                  onChange={e => setNewItem(n => ({ ...n, secondary_value: e.target.value }))}
                  placeholder={INTEGRATION_META[newItem.type].secondaryPlaceholder}
                  className="admin-input"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={addIntegration} className="btn-primary">Adicionar</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm
                     hover:border-brand/40 hover:text-brand transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Nova Integração
        </button>
      )}

      <div className="admin-card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">📋 Como funciona</h3>
        <p className="text-blue-700 text-xs leading-relaxed">
          As integrações salvas aqui são injetadas automaticamente no site público via API.
          Adicione o script de rastreamento ao site público conforme o guia de integração.
          Nenhum redeploy necessário.
        </p>
      </div>
    </div>
  )
}

function IntegrationCard({
  item, meta, saving, onToggle, onSave, onDelete
}: {
  item: Integration
  meta: { label: string; icon: string; color: string; placeholder: string; secondaryLabel?: string; secondaryPlaceholder?: string }
  saving: boolean
  onToggle: (v: boolean) => void
  onSave: (value: string, secondary: string) => void
  onDelete: () => void
}) {
  const [value, setValue]     = useState(item.value ?? '')
  const [secondary, setSecondary] = useState(item.secondary_value ?? '')
  const dirty = value !== (item.value ?? '') || secondary !== (item.secondary_value ?? '')

  return (
    <div className={`admin-card border ${meta.color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="font-semibold text-navy text-sm">{meta.label}</div>
            <div className="text-xs text-slate-400">{item.type}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${item.active ? 'badge-green' : 'badge-gray'}`}>
            {item.active ? '● Ativo' : '○ Inativo'}
          </span>
          <label className="toggle-wrap">
            <input
              type="checkbox"
              className="toggle-input"
              checked={item.active}
              disabled={saving}
              onChange={e => onToggle(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">ID / Valor</label>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={meta.placeholder}
            className="admin-input font-mono text-xs"
          />
        </div>
        {meta.secondaryLabel && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{meta.secondaryLabel}</label>
            <input
              type="text"
              value={secondary}
              onChange={e => setSecondary(e.target.value)}
              placeholder={meta.secondaryPlaceholder}
              className="admin-input font-mono text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {dirty && (
          <button
            onClick={() => onSave(value, secondary)}
            disabled={saving}
            className="btn-primary text-xs py-1.5 px-3"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        )}
        <button onClick={onDelete} className="btn-danger ml-auto">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remover
        </button>
      </div>
    </div>
  )
}
