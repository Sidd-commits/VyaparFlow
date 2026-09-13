import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();

  try {
    // Ping Supabase PostgreSQL database
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        service: 'VyaparFlow Enterprise Platform',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        database: {
          status: 'connected',
          provider: 'Supabase PostgreSQL (South Asia / Mumbai)',
          latencyMs,
        },
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error('Healthcheck database ping failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'VyaparFlow Enterprise Platform',
        database: {
          status: 'disconnected',
          error: error.message || 'Database connection error',
          latencyMs,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
