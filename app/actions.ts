'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function verifyPasscode(formData: FormData) {
  const limit = await enforceRateLimit('gate_passcode', 10, 5 * 60 * 1000);
  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many attempts. Try again in ${limit.retryAfterSec}s.`,
    };
  }

  const raw = String(formData.get('passcode') || '');
  const passcode = raw.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
  const expected = String(process.env.BATCH_PASSCODE || '')
    .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase();

  if (expected && passcode === expected) {
    const cookieStore = await cookies();
    cookieStore.set('citadel_access', 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return { success: true };
  }

  return { success: false };
}

export async function logoutCitadel() {
  const cookieStore = await cookies();
  cookieStore.delete('citadel_access');
  redirect('/');
}

export async function verifyAdminPasscode(formData: FormData) {
  const limit = await enforceRateLimit('admin_passcode', 6, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many admin attempts. Try again in ${limit.retryAfterSec}s.`,
    };
  }

  const passcode = String(formData.get('passcode') || '').trim();
  const expected = process.env.ADMIN_PASSCODE;

  if (expected && passcode === expected) {
    const cookieStore = await cookies();
    cookieStore.set('citadel_admin', 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return { success: true };
  }

  return { success: false };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('citadel_admin');
  redirect('/admin');
}
