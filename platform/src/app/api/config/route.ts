import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, auditLog } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

// GET /api/config — configurações públicas do site
export async function GET() {
  const { data } = await supabaseAdmin
    .from('site_config')
    .select('key, value, label, type')

  const obj = Object.fromEntries((data ?? []).map(c => [c.key, c.value]))
  return NextResponse.json(obj, { headers: { 'Cache-Control': 'public, max-age=120' } })
}

// PATCH /api/config — atualiza múltiplos campos
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: { updates: { key: string; value: string }[] } = await req.json()

  const promises = body.updates.map(({ key, value }) =>
    supabaseAdmin
      .from('site_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
  )

  await Promise.all(promises)
  await auditLog('UPDATE', 'site_config', null, { keys: body.updates.map(u => u.key) }, user.email ?? null)

  return NextResponse.json({ ok: true })
}
