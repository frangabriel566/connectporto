import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (data ?? []).map(l => [
    new Date(l.created_at).toLocaleString('pt-BR'),
    l.name ?? '',
    l.phone ?? '',
    l.city ?? '',
    l.plan_interest ?? '',
    l.source ?? '',
    l.page ?? '',
    l.ip ?? '',
  ])

  const header = ['Data', 'Nome', 'Telefone', 'Cidade', 'Plano Interesse', 'Origem', 'Página', 'IP']
  const csv    = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
