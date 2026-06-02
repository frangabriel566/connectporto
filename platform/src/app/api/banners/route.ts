import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, auditLog } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

// GET /api/banners — banners ativos (público)
export async function GET() {
  const now = new Date().toISOString()
  const { data } = await supabaseAdmin
    .from('banners')
    .select('*')
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('order_index')

  return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'public, max-age=60' } })
}

// POST /api/banners — cria banner
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await auditLog('CREATE', 'banners', data.id, body, user.email ?? null)
  return NextResponse.json(data, { status: 201 })
}
