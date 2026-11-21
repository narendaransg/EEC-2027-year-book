'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateHouse, QUIZ_QUESTIONS } from '@/lib/houses';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  containsProfanity,
  sanitizeText,
  validateImageBuffer,
} from '@/lib/security';

const QUICK_QUESTION_IDS = ['q1', 'q2', 'q6'];

export async function lookupProfileForReforge(rawName: string, rawBranch?: string) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    return { error: 'Unauthorized. Please enter the batch passcode first.' };
  }

  const limit = await enforceRateLimit('quiz_lookup', 15, 5 * 60 * 1000);
  if (!limit.allowed) {
    return {
      error: `Too many searches. Please wait ${limit.retryAfterSec}s.`,
    };
  }

  // Strip SQL LIKE wildcard characters so users cannot dump the table with '%' or '_'
  const name = sanitizeText(rawName, 60).replace(/[%_\\]/g, '');
  const branch = sanitizeText(rawBranch, 40).replace(/[%_\\]/g, '');

  if (name.length < 2) {
    return { error: 'Enter at least 2 characters of your name to search.' };
  }

  let query = supabaseAdmin
    .from('profiles')
    .select('id, name, nickname, branch, house_name, house_words, sigil, created_at')
    .ilike('name', `%${name}%`)
    .order('created_at', { ascending: false })
    .limit(5);

  if (branch) {
    query = query.ilike('branch', `%${branch}%`);
  }

  const { data, error } = await query;
  if (error) {
    return { error: `Lookup failed: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { error: 'No matching entry found yet. Try Quick Claim below!' };
  }

  return { profiles: data };
}

export async function submitQuiz(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    return { error: 'Unauthorized. Please enter the batch passcode first.' };
  }

  const limit = await enforceRateLimit('quiz_submit', 3, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      error: `Submission cooldown active. Please wait ${limit.retryAfterSec}s.`,
    };
  }

  const mode = sanitizeText(formData.get('mode'), 12) === 'full' ? 'full' : 'quick';
  const name = sanitizeText(formData.get('name'), 70);
  const nickname = sanitizeText(formData.get('nickname'), 50) || null;
  const branch = sanitizeText(formData.get('branch'), 40);
  const customWords = sanitizeText(formData.get('custom_words'), 80);

  const rawMemory = sanitizeText(formData.get('college_memory'), 450, { multiline: true });
  const rawAdvice = sanitizeText(formData.get('junior_advice'), 280);
  const rawAlly = sanitizeText(formData.get('apocalypse_ally'), 100);

  if (!name || !branch) {
    return { error: 'Please enter your Name and Department/Branch.' };
  }

  if (mode === 'full' && (!rawMemory || !rawAdvice || !rawAlly)) {
    return { error: 'Please fill in all required chronicle fields.' };
  }

  const fieldsToCheck = [
    name,
    nickname || '',
    branch,
    customWords,
    rawMemory,
    rawAdvice,
    rawAlly,
  ];
  if (fieldsToCheck.some((f) => containsProfanity(f))) {
    return {
      error: 'Please keep all fields respectful and appropriate for the batch yearbook.',
    };
  }

  const collegeMemory =
    rawMemory || 'Etched into the Citadel annals of Batch 2027.';
  const juniorAdvice =
    rawAdvice || 'Keep building, enjoy the late nights, and back your squad.';
  const apocalypseAlly = rawAlly || 'The Batch 2027 Vanguard';

  const requiredQuestions =
    mode === 'full'
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => QUICK_QUESTION_IDS.includes(q.id));

  const answers: Record<string, number> = {};
  for (const q of requiredQuestions) {
    const val = formData.get(q.id);
    if (val === null || val === '') {
      return {
        error:
          mode === 'full'
            ? 'Please answer all 6 sorting questions.'
            : 'Please answer all 3 quick sorting questions.',
      };
    }
    const idx = Number(val);
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
      return { error: 'Invalid sorting option selected.' };
    }
    answers[q.id] = idx;
  }

  const { house, scores } = calculateHouse(answers);
  const finalWords = customWords || house.words;

  let portraitPath: string | null = null;
  const file = formData.get('portrait') as File | null;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const imgCheck = validateImageBuffer(buffer, file.type);
    if (!imgCheck.valid) {
      return { error: imgCheck.error || 'Invalid portrait image.' };
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${imgCheck.ext}`;
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
    profile: {
      name,
      branch,
      houseName: house.name,
      houseWords: finalWords,
      sigil: house.sigil,
    },
  };
}
