import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, auditLog } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// PATCH /api/integrations/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body   = await req.json()

  const { data, error } = await supabaseAdmin
    .from('integrations')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await auditLog('UPDATE', 'integrations', id, body, user.email ?? null)
  return NextResponse.json(data)
}

// DELETE /api/integrations/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('integrations').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await auditLog('DELETE', 'integrations', id, null, user.email ?? null)
  return NextResponse.json({ ok: true })
}
