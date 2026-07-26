'use server';

import { getSession } from '@/lib/auth';

export async function checkIsAdminAction(): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session) return false;
    return session.email === 'didosyukur123@gmail.com' || session.role === 'ADMIN';
  } catch {
    return false;
  }
}
