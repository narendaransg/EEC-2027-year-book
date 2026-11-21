'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  containsProfanity,
  sanitizeHouse,
  sanitizeText,
  validateSafeHttpUrl,
} from '@/lib/security';

export async function addJukeboxSong(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    return { ok: false, error: 'Unauthorized' };
  }

  const limit = await enforceRateLimit('jukebox_add', 6, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      ok: false,
      error: `Easy there, bard! Wait ${limit.retryAfterSec}s before dropping another track.`,
    };
  }

  const songTitle = sanitizeText(formData.get('song_title'), 120);
  const artist = sanitizeText(formData.get('artist'), 100);
  const dedication = sanitizeText(formData.get('dedication'), 240);
  const house = sanitizeHouse(formData.get('house'));
  const dedicatorName = sanitizeText(formData.get('dedicator_name'), 60);

  if (!songTitle || !artist) {
    return { ok: false, error: 'Song title and artist are required.' };
  }

  if (
    containsProfanity(songTitle) ||
    containsProfanity(artist) ||
    containsProfanity(dedication) ||
    containsProfanity(dedicatorName)
  ) {
    return {
      ok: false,
      error: 'Please keep song titles, dedications, and names respectful for the batch.',
    };
  }

  const urlCheck = validateSafeHttpUrl(formData.get('link_url'), 260);
  if (!urlCheck.valid) {
    return { ok: false, error: urlCheck.error };
  }

  const { error } = await supabaseAdmin.from('jukebox_songs').insert({
    song_title: songTitle,
    artist,
    link_url: urlCheck.url,
    dedication: dedication || null,
    house,
    dedicator_name: dedicatorName || 'Anonymous Bard',
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/jukebox');
  return { ok: true };
}
