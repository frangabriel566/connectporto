import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, auditLog } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

// PATCH /api/campaigns/:id — ativa ou desativa campanha
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body    = await req.json()
  const active  = Boolean(body.active)

  // O trigger do banco já desativa as outras campanhas automaticamente
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .update({ active })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await auditLog(
    active ? 'ACTIVATE' : 'DEACTIVATE',
    'campaigns',
    id,
    { active },
    user.email ?? null
  )

  return NextResponse.json(data)
}
