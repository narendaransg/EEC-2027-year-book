'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function verifyPasscode(formData: FormData) {
  const passcode = String(formData.get('passcode') || '').trim();
  const expected = process.env.BATCH_PASSCODE;

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
