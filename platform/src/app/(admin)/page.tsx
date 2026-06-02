import { createClient } from '@/lib/supabase-server'
import StatsCard from '@/components/admin/StatsCard'
import { VisitorAreaChart, DevicePieChart } from '@/components/admin/VisitorChart'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { VisitorsByDay } from '@/types'

async function getDashboardData() {
  const supabase = await createClient()
  const today    = new Date()
  const start30  = subDays(today, 30).toISOString()
  const todayStr = format(today, 'yyyy-MM-dd')

  const [
    { count: visitorsTotal },
    { count: visitorsToday },
    { count: visitors30d },
    { count: whatsappClicks },
    { count: contratarClicks },
    { count: leadsTotal },
    { data: visitsByDay },
    { data: deviceData },
  ] = await Promise.all([
    supabase.from('visitors').select('*', { count: 'exact', head: true }),
    supabase.from('visitors').select('*', { count: 'exact', head: true })
      .gte('visited_at', `${todayStr}T00:00:00`),
    supabase.from('visitors').select('*', { count: 'exact', head: true })
      .gte('visited_at', start30),
    supabase.from('events').select('*', { count: 'exact', head: true })
      .eq('type', 'whatsapp_click'),
    supabase.from('events').select('*', { count: 'exact', head: true })
      .eq('type', 'contratar_click'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.rpc('visitors_by_day', { days: 14 }),
    supabase.from('visitors').select('device')
      .gte('visited_at', start30),
  ])

  // Agrupa dispositivos
  const deviceCounts: Record<string, number> = {}
  ;(deviceData ?? []).forEach((v: { device: string | null }) => {
    const d = v.device ?? 'Desconhecido'
    deviceCounts[d] = (deviceCounts[d] ?? 0) + 1
  })
  const deviceChartData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))

  return {
    visitorsTotal:   visitorsTotal ?? 0,
    visitorsToday:   visitorsToday ?? 0,
    visitors30d:     visitors30d ?? 0,
    whatsappClicks:  whatsappClicks ?? 0,
    contratarClicks: contratarClicks ?? 0,
    leadsTotal:      leadsTotal ?? 0,
    visitsByDay:     (visitsByDay ?? []) as VisitorsByDay[],
    deviceChartData,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const convRate = data.visitorsTotal > 0
    ? ((data.leadsTotal / data.visitorsTotal) * 100).toFixed(1)
    : '0.0'

  const Icon = ({ d }: { d: string }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Visão geral em tempo real do site</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatsCard
          label="Total Visitantes"
          value={data.visitorsTotal.toLocaleString('pt-BR')}
          icon={<Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
          color="blue"
        />
        <StatsCard
          label="Visitantes Hoje"
          value={data.visitorsToday.toLocaleString('pt-BR')}
          icon={<Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
          color="green"
        />
        <StatsCard
          label="Últimos 30 dias"
          value={data.visitors30d.toLocaleString('pt-BR')}
          icon={<Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
          color="purple"
        />
        <StatsCard
          label="Cliques WhatsApp"
          value={data.whatsappClicks.toLocaleString('pt-BR')}
          icon={<Icon d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
          color="green"
        />
        <StatsCard
          label="Leads Gerados"
          value={data.leadsTotal.toLocaleString('pt-BR')}
          icon={<Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
          color="amber"
        />
        <StatsCard
          label="Taxa de Conversão"
          value={`${convRate}%`}
          icon={<Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Visitors by day */}
        <div className="admin-card xl:col-span-2">
          <h2 className="font-semibold text-navy mb-4">Visitantes por Dia — Últimos 14 dias</h2>
          {data.visitsByDay.length > 0
            ? <VisitorAreaChart data={data.visitsByDay} />
            : <EmptyChart label="Nenhum dado de visitantes ainda" />
          }
        </div>

        {/* Devices */}
        <div className="admin-card">
          <h2 className="font-semibold text-navy mb-4">Dispositivos</h2>
          {data.deviceChartData.length > 0
            ? <DevicePieChart data={data.deviceChartData} />
            : <EmptyChart label="Sem dados de dispositivos" />
          }
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink
          href="/admin/leads"
          title="Últimos Leads"
          desc="Ver todos os leads capturados"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <QuickLink
          href="/admin/campanhas"
          title="Campanhas Sazonais"
          desc="Ativar campanha ativa no site"
          icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
        <QuickLink
          href="/admin/analytics"
          title="Integrações"
          desc="Gerenciar Meta Pixel, GA4 e Google Ads"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </div>
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">{label}</div>
  )
}

function QuickLink({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: string }) {
  return (
    <a href={href} className="admin-card hover:border-brand/30 hover:shadow-sm transition-all group">
      <svg className="w-6 h-6 text-brand mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      <div className="font-semibold text-navy text-sm group-hover:text-brand transition-colors">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
    </a>
  )
}
