'use server'

import { cookies } from 'next/headers'

export async function verifyPasscode(formData: FormData) {
  const code = String(formData.get('passcode') || '').trim()
  const expected = String(process.env.BATCH_PASSCODE || '').trim()

  console.log('Entered:', JSON.stringify(code), '| Expected:', JSON.stringify(expected))

  if (expected && code === expected) {
    (await cookies()).set('citadel_access', 'granted', { maxAge: 60 * 60 * 24 * 7 })
    return { success: true }
  }
  return { success: false }
}
