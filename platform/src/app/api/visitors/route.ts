import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function getDevice(ua: string): string {
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'Mobile'
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  return 'Desktop'
}

function getBrowser(ua: string): string {
  if (/Edg\//i.test(ua))     return 'Edge'
  if (/OPR\//i.test(ua))     return 'Opera'
  if (/Chrome\//i.test(ua))  return 'Chrome'
  if (/Safari\//i.test(ua))  return 'Safari'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  return 'Outro'
}

function getOS(ua: string): string {
  if (/Windows/i.test(ua))    return 'Windows'
  if (/Mac OS X/i.test(ua))   return 'macOS'
  if (/Android/i.test(ua))    return 'Android'
  if (/iPhone|iPad/i.test(ua)) return 'iOS'
  if (/Linux/i.test(ua))      return 'Linux'
  return 'Outro'
}

// POST /api/visitors — registra visita (chamado pelo site público)
export async function POST(req: NextRequest) {
  try {
    const body       = await req.json().catch(() => ({}))
    const ua         = req.headers.get('user-agent') ?? ''
    const forwarded  = req.headers.get('x-forwarded-for')
    const ip         = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    // Geolocalização via ipapi.co (free tier, sem API key)
    let city = null, state = null, country = 'BR'
    if (ip && ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168')) {
      const geo = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(2000) })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
      if (geo) {
        city    = geo.city ?? null
        state   = geo.region ?? null
        country = geo.country_code ?? 'BR'
      }
    }

    await supabaseAdmin.from('visitors').insert({
      ip,
      city,
      state,
      country,
      browser:    getBrowser(ua),
      device:     getDevice(ua),
      os:         getOS(ua),
      referrer:   body.referrer ?? req.headers.get('referer') ?? null,
      page:       body.page ?? '/',
      session_id: body.session_id ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
