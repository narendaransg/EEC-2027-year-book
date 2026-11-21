'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  containsProfanity,
  sanitizeHouse,
  sanitizeText,
} from '@/lib/security';

export async function sendRavenDispatch(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    return { ok: false, error: 'Unauthorized' };
  }

  const limit = await enforceRateLimit('raven_dispatch', 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      ok: false,
      error: `The rookery is resting. Wait ${limit.retryAfterSec}s before sending another raven.`,
    };
  }

  const kindRaw = sanitizeText(formData.get('kind'), 24);
  const kind = kindRaw === 'prediction_2030' ? 'prediction_2030' : 'shoutout';
  const message = sanitizeText(formData.get('message'), 320, { multiline: true });
  const house = sanitizeHouse(formData.get('house'));
  const senderLabel =
    sanitizeText(formData.get('sender_label'), 60) || 'Anonymous Raven';

  if (message.length < 4) {
    return { ok: false, error: 'Write at least a short line before sending your raven.' };
  }

  if (containsProfanity(message) || containsProfanity(senderLabel)) {
    return {
      ok: false,
      error: 'Please keep dispatches and signatures respectful for the batch.',
    };
  }

  const { error } = await supabaseAdmin.from('raven_dispatches').insert({
    kind,
    message,
    house,
    sender_label: senderLabel,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/raven');
  return { ok: true };
}
