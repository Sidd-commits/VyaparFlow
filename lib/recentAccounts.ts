'use client';

export interface SavedAccount {
  id?: string;
  email: string;
  name: string;
  role: 'MSME' | 'PROVIDER' | 'ADMIN';
  companyName?: string;
  lastActive: number;
}

export const RECENT_ACCOUNTS_KEY = 'vyaparflow_recent_accounts_v1';

export function getRecentAccounts(): SavedAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveRecentAccount(account: {
  id?: string;
  email: string;
  name: string;
  role: 'MSME' | 'PROVIDER' | 'ADMIN';
  companyName?: string;
}) {
  if (typeof window === 'undefined' || !account.email) return;
  try {
    const current = getRecentAccounts();
    const filtered = current.filter(
      (a) => a.email.toLowerCase().trim() !== account.email.toLowerCase().trim()
    );
    const updated: SavedAccount[] = [
      {
        id: account.id,
        email: account.email.toLowerCase().trim(),
        name: account.name || account.email.split('@')[0],
        role: account.role || 'MSME',
        companyName: account.companyName,
        lastActive: Date.now(),
      },
      ...filtered,
    ].slice(0, 6); // store up to 6 recent accounts

    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent account to localStorage', e);
  }
}

export function removeRecentAccount(email: string): SavedAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentAccounts();
    const updated = current.filter(
      (a) => a.email.toLowerCase().trim() !== email.toLowerCase().trim()
    );
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearAllRecentAccounts() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_ACCOUNTS_KEY);
  } catch (e) {}
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}
