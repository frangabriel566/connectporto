import { createClient } from '@supabase/supabase-js'

// Service role — bypassa RLS. Usar somente em API Routes server-side.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function auditLog(
  action: string,
  entity: string,
  entityId: string | null,
  newValue: Record<string, unknown> | null,
  userEmail: string | null,
  oldValue?: Record<string, unknown> | null
) {
  await supabaseAdmin.from('audit_logs').insert({
    action,
    entity,
    entity_id: entityId,
    old_value: oldValue ?? null,
    new_value: newValue,
    user_email: userEmail,
  })
}
