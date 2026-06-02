import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, auditLog } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

// GET /api/integrations — lista todas (público, filtra ativas)
export async function GET() {
  const { data } = await supabaseAdmin
    .from('integrations')
    .select('type, name, value, secondary_value')
    .eq('active', true)
  return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'public, max-age=60' } })
}

// POST /api/integrations — cria nova integração
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('integrations')
    .insert({ ...body })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await auditLog('CREATE', 'integrations', data.id, body, user.email ?? null)
  return NextResponse.json(data, { status: 201 })
}
