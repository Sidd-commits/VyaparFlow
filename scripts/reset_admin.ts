import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import { hashPassword } from '../lib/crypto';
import { getPlatformAdminEmail } from '../lib/authGuards';

const prisma = new PrismaClient();

async function promptPassword(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter new Platform Administrator password (min. 8 characters): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('=====================================================');
  console.log('VyaparFlow — Platform Administrator Security Bootstrap & Reset');
  console.log('=====================================================');

  const adminEmail = getPlatformAdminEmail();
  console.log(`Configured Platform Admin Email: ${adminEmail}`);

  // Check if password passed via argument or environment variable, or prompt interactively
  let newPassword = process.argv[2] || process.env.NEW_ADMIN_PASSWORD;

  if (!newPassword) {
    newPassword = await promptPassword();
  }

  if (!newPassword || newPassword.length < 8) {
    console.error('❌ Error: Admin password must be at least 8 characters long.');
    process.exit(1);
  }

  const hashedPassword = hashPassword(newPassword);

  console.log('Hashing administrator password with PBKDF2 (100,000 rounds + salt)...');

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      name: 'Platform Operator Admin',
    },
    create: {
      email: adminEmail,
      name: 'Platform Operator Admin',
      role: 'ADMIN',
      passwordHash: hashedPassword,
    },
  });

  // Also record an audit log for security accountability
  try {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'ADMIN_CREDENTIALS_ROTATED',
        entityType: 'User',
        entityId: user.id,
        newValueJson: JSON.stringify({
          adminEmail,
          updatedAt: new Date().toISOString(),
          mechanism: 'CLI_ADMIN_RESET',
        }),
      },
    });
  } catch (err) {
    // Audit log table might be optional
  }

  console.log('✅ Success: Platform Administrator account credentials have been securely updated.');
  console.log(`   Admin ID:    ${user.id}`);
  console.log(`   Admin Email: ${user.email}`);
  console.log(`   Role:        ${user.role}`);
  console.log(`   Password:    [SECURELY HASHED - PBKDF2]`);
  console.log('=====================================================');
}

main()
  .catch((err) => {
    console.error('❌ Error updating administrator password:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
