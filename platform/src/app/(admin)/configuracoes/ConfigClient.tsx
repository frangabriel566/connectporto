'use client'

import { useState } from 'react'
import type { SiteConfig } from '@/types'

const GROUPS: Record<string, string[]> = {
  'Identidade':     ['site_name', 'site_desc', 'logo_url', 'favicon_url'],
  'Contato':        ['phone', 'whatsapp', 'email', 'address'],
  'Redes Sociais':  ['facebook', 'instagram', 'youtube', 'tiktok'],
}

const ICONS: Record<string, string> = {
  site_name: '📝', site_desc: '📄', logo_url: '🖼️', favicon_url: '⭐',
  phone: '📞', whatsapp: '💬', email: '📧', address: '📍',
  facebook: '👤', instagram: '📸', youtube: '▶️', tiktok: '🎵',
}

interface Props { config: SiteConfig[] }

export default function ConfigClient({ config: initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initial.map(c => [c.key, c.value ?? '']))
  )
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState('')

  const configMap = Object.fromEntries(initial.map(c => [c.key, c]))

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function save(keys: string[]) {
    setSaving(true)
    const updates = keys.map(k => ({ key: k, value: values[k] }))
    const res = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    if (res.ok) showToast('✅ Configurações salvas!')
    else        showToast('❌ Erro ao salvar')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {Object.entries(GROUPS).map(([groupLabel, keys]) => (
        <div key={groupLabel} className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-navy">{groupLabel}</h3>
            <button
              onClick={() => save(keys)}
              disabled={saving}
              className="btn-primary text-xs py-1.5"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keys.map(key => {
              const cfg = configMap[key]
              if (!cfg) return null
              return (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                    <span>{ICONS[key] ?? '•'}</span>
                    {cfg.label}
                  </label>
                  {cfg.type === 'phone' || cfg.type === 'text' ? (
                    <input
                      type={cfg.type === 'phone' ? 'tel' : 'text'}
                      value={values[key] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      className="admin-input"
                    />
                  ) : cfg.type === 'email' ? (
                    <input
                      type="email"
                      value={values[key] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      className="admin-input"
                    />
                  ) : cfg.type === 'url' || cfg.type === 'image' ? (
                    <div className="space-y-1">
                      <input
                        type="url"
                        value={values[key] ?? ''}
                        onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                        placeholder="https://..."
                        className="admin-input"
                      />
                      {cfg.type === 'image' && values[key] && (
                        <img src={values[key]} alt={cfg.label} className="h-10 object-contain rounded" />
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
