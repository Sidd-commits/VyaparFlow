import { getActiveUser } from '@/app/actions';

export function getPlatformAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || 'admin@vyaparflow.com').toLowerCase().trim();
}

/**
 * Validates whether the given user record is the authorized Platform Administrator.
 * Requires both the 'ADMIN' database role AND matching the server-controlled ADMIN_EMAIL identity.
 */
export function isPlatformAdmin(
  user: { id?: string; email?: string | null; role?: string | null } | null | undefined
): boolean {
  if (!user || !user.email || !user.role) {
    return false;
  }

  const normalizedUserEmail = user.email.toLowerCase().trim();
  const normalizedAdminEmail = getPlatformAdminEmail();

  return user.role === 'ADMIN' && normalizedUserEmail === normalizedAdminEmail;
}

/**
 * Strict server-side authorization guard for administrative actions and mutations.
 * Throws an explicit error if the authenticated user is not the Platform Administrator.
 */
export async function requireAdmin(): Promise<{ user: any; role: 'ADMIN' }> {
  const { user, role } = await getActiveUser();

  if (!user || !role) {
    throw new Error('Unauthorized: Authentication required.');
  }

  if (!isPlatformAdmin(user)) {
    throw new Error('Forbidden: Platform Administrator privileges required.');
  }

  return { user, role: 'ADMIN' };
}
