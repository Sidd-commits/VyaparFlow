import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  // 1. If hosted PostgreSQL/MySQL is explicitly configured on Vercel
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith('file:') &&
    !process.env.DATABASE_URL.includes('dev.db')
  ) {
    return process.env.DATABASE_URL;
  }

  const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  // 2. When running in a Vercel Serverless Function runtime
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const candidates = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
        ];
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            const tmpDir = path.dirname(tmpDbPath);
            if (!fs.existsSync(tmpDir)) {
              fs.mkdirSync(tmpDir, { recursive: true });
            }
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          }
        }
      }
      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (e) {
      console.error('Error setting up SQLite in /tmp:', e);
    }
  }

  // 3. Local development and standard builds
  return `file:${localDbPath}`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

