import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/campaigns — retorna todas (público)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=30' },
  })
}
