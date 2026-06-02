'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Banner } from '@/types'

interface Props { banners: Banner[] }

const empty: Omit<Banner, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  image_url: '',
  link_url: '',
  alt_text: '',
  active: true,
  order_index: 0,
  starts_at: null,
  ends_at: null,
}

export default function BannersClient({ banners: initial }: Props) {
  const [list, setList]     = useState<Banner[]>(initial)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast]   = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]     = useState({ ...empty })
  const [editId, setEditId] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function startEdit(b: Banner) {
    setForm({
      title: b.title ?? '',
      image_url: b.image_url,
      link_url: b.link_url ?? '',
      alt_text: b.alt_text ?? '',
      active: b.active,
      order_index: b.order_index,
      starts_at: b.starts_at,
      ends_at: b.ends_at,
    })
    setEditId(b.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save() {
    if (!form.image_url) { alert('URL da imagem obrigatória'); return }
    setSaving('form')
    const url    = editId ? `/api/banners/${editId}` : '/api/banners'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      if (editId) {
        setList(l => l.map(b => b.id === editId ? data : b))
        showToast('✅ Banner atualizado!')
      } else {
        setList(l => [...l, data])
        showToast('✅ Banner criado!')
      }
      setShowForm(false)
      setEditId(null)
      setForm({ ...empty })
    }
    setSaving(null)
  }

  async function toggleBanner(id: string, active: boolean) {
    setSaving(id)
    const res = await fetch(`/api/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    if (res.ok) setList(l => l.map(b => b.id === id ? { ...b, active } : b))
    setSaving(null)
  }

  async function deleteBanner(id: string) {
    if (!confirm('Excluir este banner?')) return
    const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setList(l => l.filter(b => b.id !== id))
      showToast('🗑️ Banner excluído')
    }
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Form */}
      {showForm ? (
        <div className="admin-card">
          <h3 className="font-semibold text-navy mb-5">{editId ? 'Editar Banner' : 'Novo Banner'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Título (opcional)</label>
              <input type="text" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Banner Junho 2025" className="admin-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">URL da Imagem *</label>
              <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..." className="admin-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Link ao clicar (opcional)</label>
              <input type="url" value={form.link_url ?? ''} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                placeholder="https://..." className="admin-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Texto alternativo</label>
              <input type="text" value={form.alt_text ?? ''} onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))}
                placeholder="Descrição da imagem" className="admin-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Início (programar)</label>
              <input type="datetime-local" value={form.starts_at ?? ''} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value || null }))}
                className="admin-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Fim (programar)</label>
              <input type="datetime-local" value={form.ends_at ?? ''} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value || null }))}
                className="admin-input" />
            </div>
          </div>

          {/* Preview */}
          {form.image_url && (
            <div className="mb-5 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 px-4 pt-3 mb-2">Preview</p>
              <img src={form.image_url} alt="preview" className="w-full max-h-48 object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-brand" />
              Ativo
            </label>
            <button onClick={save} disabled={saving === 'form'} className="btn-primary ml-auto">
              {saving === 'form' ? 'Salvando...' : 'Salvar Banner'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm({ ...empty }) }} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Banner
        </button>
      )}

      {/* List */}
      {list.length === 0 ? (
        <div className="admin-card text-center py-12 text-slate-400 text-sm">
          Nenhum banner cadastrado ainda.
        </div>
      ) : (
        <div className="admin-card p-0 overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Título / URL</th>
                <th>Status</th>
                <th>Agendamento</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map(b => (
                <tr key={b.id}>
                  <td className="w-24">
                    <img src={b.image_url} alt={b.alt_text ?? ''} className="w-20 h-12 object-cover rounded-lg border border-slate-100" />
                  </td>
                  <td>
                    <div className="font-medium text-navy text-sm">{b.title || '—'}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{b.image_url}</div>
                  </td>
                  <td>
                    <label className="toggle-wrap">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={b.active}
                        disabled={saving === b.id}
                        onChange={e => toggleBanner(b.id, e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td className="text-xs text-slate-500">
                    {b.starts_at ? <div>De: {new Date(b.starts_at).toLocaleDateString('pt-BR')}</div> : null}
                    {b.ends_at   ? <div>Até: {new Date(b.ends_at).toLocaleDateString('pt-BR')}</div> : null}
                    {!b.starts_at && !b.ends_at && '—'}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(b)} className="btn-secondary text-xs py-1 px-2.5">Editar</button>
                      <button onClick={() => deleteBanner(b.id)} className="btn-danger">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
