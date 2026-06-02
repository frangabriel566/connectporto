export interface SiteConfig {
  id: string
  key: string
  value: string | null
  label: string
  type: 'text' | 'url' | 'phone' | 'email' | 'image'
  updated_at: string
}

export interface Integration {
  id: string
  type: string
  name: string
  value: string | null
  secondary_value: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: number
  slug: string
  name: string
  emoji: string
  color: string
  bg_color: string
  text_color: string
  active: boolean
  updated_at: string
}

export interface Banner {
  id: string
  title: string | null
  image_url: string
  link_url: string | null
  alt_text: string | null
  active: boolean
  order_index: number
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Visitor {
  id: string
  ip: string | null
  city: string | null
  state: string | null
  country: string | null
  browser: string | null
  device: string | null
  os: string | null
  referrer: string | null
  page: string | null
  session_id: string | null
  visited_at: string
}

export interface Lead {
  id: string
  name: string | null
  phone: string | null
  city: string | null
  plan_interest: string | null
  source: string | null
  page: string | null
  ip: string | null
  created_at: string
}

export interface Event {
  id: string
  type: string
  page: string | null
  session_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface AuditLog {
  id: string
  action: string
  entity: string | null
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  user_email: string | null
  created_at: string
}

export interface DashboardStats {
  visitors_total: number
  visitors_today: number
  visitors_30d: number
  whatsapp_clicks: number
  contratar_clicks: number
  leads_total: number
}

export interface VisitorsByDay {
  date: string
  count: number
}
