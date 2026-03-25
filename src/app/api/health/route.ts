import { NextResponse } from 'next/server'

/** Liveness for monitors (no secrets, no DB). */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'agrosmart',
    timestamp: new Date().toISOString(),
  })
}
