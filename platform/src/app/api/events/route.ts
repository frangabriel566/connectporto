import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/events — registra cliques e conversões do site público
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, page, session_id, metadata } = body

    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 })

    await supabaseAdmin.from('events').insert({ type, page, session_id, metadata })

    // Se for lead (whatsapp_click com dados), salva também em leads
    if (type === 'whatsapp_click' && metadata?.city) {
      const forwarded = req.headers.get('x-forwarded-for')
      const ip        = forwarded ? forwarded.split(',')[0].trim() : null
      await supabaseAdmin.from('leads').insert({
        city:          metadata.city,
        plan_interest: metadata.plan ?? null,
        source:        'whatsapp',
        page,
        ip,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
