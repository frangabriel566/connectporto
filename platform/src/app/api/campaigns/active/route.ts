import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/campaigns/active — campanha ativa (consumida pelo site público)
export async function GET() {
  const { data } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('active', true)
    .maybeSingle()

  return NextResponse.json(data ?? null, {
    headers: { 'Cache-Control': 'public, max-age=30' },
  })
}
