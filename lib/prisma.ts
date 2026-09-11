import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith('file:') &&
    !process.env.DATABASE_URL.includes('dev.db')
  ) {
    return process.env.DATABASE_URL;
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy SQLite database to /tmp:', e);
          }
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${dbPath}`;
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

