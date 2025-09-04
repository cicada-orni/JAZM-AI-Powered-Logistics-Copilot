export const runtime = 'nodejs' // ensure Node runtime for pg
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

export async function GET() {
  try {
    const r = await pool.query('select now() as ts')
    return NextResponse.json({ ok: true, ts: r.rows[0].ts })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'db_error' },
      { status: 500 }
    )
  }
}
