import 'server-only' // Ensures this file is only bundled server-side
import { Pool } from 'pg' // Node Postgres client with connection pooling

// Create one pool per process using the Neon URL from .env.local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!, // includes sslmode=require
})

// Reusable helper: insert or update the shop’s offline token
export async function upsertShopToken(params: {
  shop_domain: string
  offline_access_token: string
}) {
  await pool.query(
    `insert into shops (shop_domain, offline_access_token, installed_at, uninstalled)
     values ($1, $2, now(), false)
     on conflict (shop_domain) do update
       set offline_access_token = excluded.offline_access_token,
           installed_at = now(),
           uninstalled = false`,
    [params.shop_domain, params.offline_access_token]
  )
}
