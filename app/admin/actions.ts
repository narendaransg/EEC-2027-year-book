'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function deleteProfile(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') return;

  const id = String(formData.get('id') || '');
  const portraitUrl = String(formData.get('portrait_url') || '');

  if (portraitUrl) {
    await supabaseAdmin.storage.from('portraits').remove([portraitUrl]);
  }
  if (id) {
    await supabaseAdmin.from('profiles').delete().eq('id', id);
  }

  revalidatePath('/admin');
  revalidatePath('/book');
}
