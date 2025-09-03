import 'server-only'
import { createClient } from '@supabase/supabase-js'

// 1) Create a server-side Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!, // https://<ref>.supabase.co
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only (full access)
  {
    // 2) ensure we use runtime fetch (works on Vercel)
    fetch: fetch.bind(globalThis),
  }
)

// 3) Save/refresh the offline token idempotently
export async function upsertShopToken(params: {
  shop_domain: string
  offline_access_token: string
}) {
  const { error } = await supabase.from('shops').upsert(
    {
      shop_domain: params.shop_domain,
      offline_access_token: params.offline_access_token,
      installed_at: new Date().toISOString(),
      uninstalled: false,
    },
    { onConflict: 'shop_domain' }
  )
  if (error) throw error
}
