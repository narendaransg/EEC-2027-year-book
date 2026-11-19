'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateHouse, QUIZ_QUESTIONS } from '@/lib/houses';

export async function submitQuiz(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    return { error: 'Unauthorized. Please enter the batch passcode first.' };
  }

  const name = String(formData.get('name') || '').trim();
  const nickname = String(formData.get('nickname') || '').trim() || null;
  const branch = String(formData.get('branch') || '').trim();
  const customWords = String(formData.get('custom_words') || '').trim();
  const collegeMemory = String(formData.get('college_memory') || '').trim();
  const juniorAdvice = String(formData.get('junior_advice') || '').trim();
  const apocalypseAlly = String(formData.get('apocalypse_ally') || '').trim();

  if (!name || !branch || !collegeMemory || !juniorAdvice || !apocalypseAlly) {
    return { error: 'Please fill in all required fields.' };
  }

  // Collect quiz answers
  const answers: Record<string, number> = {};
  for (const q of QUIZ_QUESTIONS) {
    const val = formData.get(q.id);
    if (val === null || val === '') {
      return { error: 'Please answer all 6 sorting questions.' };
    }
    answers[q.id] = Number(val);
  }

  const { house, scores } = calculateHouse(answers);
  const finalWords = customWords || house.words;

  // Handle optional portrait upload
  let portraitPath: string | null = null;
  const file = formData.get('portrait') as File | null;

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('portraits')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Portrait upload failed: ${uploadError.message}` };
    }
    portraitPath = fileName;
  }

  // Insert into profiles table
  const { error: dbError } = await supabaseAdmin.from('profiles').insert({
    name,
    nickname,
    branch,
    portrait_url: portraitPath,
    house_name: house.name,
    house_words: finalWords,
    sigil: house.sigil,
    quiz_scores: scores,
    college_memory: collegeMemory,
    junior_advice: juniorAdvice,
    apocalypse_ally: apocalypseAlly,
  });

  if (dbError) {
    return { error: `Database error: ${dbError.message}` };
  }

  return {
    success: true,
    house: {
      name: house.name,
      words: finalWords,
      sigil: house.sigil,
    },
  };
}
