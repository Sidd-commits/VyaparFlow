const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mode = process.argv[2] || 'sqlite';
const rootDir = path.resolve(__dirname, '..');
const prismaDir = path.join(rootDir, 'prisma');

const targetSchema = mode === 'postgresql' || mode === 'cloud' 
  ? path.join(prismaDir, 'schema.postgresql.prisma') 
  : path.join(prismaDir, 'schema.sqlite.prisma');

const destSchema = path.join(prismaDir, 'schema.prisma');

if (!fs.existsSync(targetSchema)) {
  console.error(`❌ Source schema not found: ${targetSchema}`);
  process.exit(1);
}

fs.copyFileSync(targetSchema, destSchema);
console.log(`✅ Configured Prisma for: ${mode.toUpperCase()}`);

try {
  console.log(`⏳ Pushing schema to database...`);
  execSync('npx prisma db push', { cwd: rootDir, stdio: 'inherit' });
  console.log(`⏳ Seeding demo data...`);
  execSync('npx tsx prisma/seed.ts', { cwd: rootDir, stdio: 'inherit' });
  console.log(`🎉 Database setup complete for ${mode.toUpperCase()}!`);
} catch (err) {
  console.error(`❌ Failed during database push/seed:`, err.message);
  process.exit(1);
}

