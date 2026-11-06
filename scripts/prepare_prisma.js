const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const prismaDir = path.join(rootDir, 'prisma');
const postgresSchema = path.join(prismaDir, 'schema.postgresql.prisma');
const sqliteSchema = path.join(prismaDir, 'schema.sqlite.prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');

let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
if (!dbUrl) {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
    if (match) dbUrl = match[1];
  }
}

const isPostgres = Boolean(
  process.env.VERCEL ||
  process.env.POSTGRES_URL ||
  (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')))
);

const source = isPostgres ? postgresSchema : sqliteSchema;

if (fs.existsSync(source)) {
  fs.copyFileSync(source, targetSchema);
  console.log(`[prepare_prisma] Configured schema for: ${isPostgres ? 'POSTGRESQL (Cloud / Supabase / Vercel)' : 'SQLITE (Local Development)'}`);
} else {
  console.log(`[prepare_prisma] Source schema not found at ${source}, preserving existing schema.prisma`);
}
