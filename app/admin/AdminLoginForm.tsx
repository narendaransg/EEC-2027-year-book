'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminPasscode } from '@/app/actions';

export default function AdminLoginForm() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(false);
    const res = await verifyAdminPasscode(formData);
    if (res.success) {
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-amber-50 flex items-center justify-center p-6 font-serif">
      <div className="w-full max-w-md border border-amber-500/30 bg-zinc-900/90 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80 mb-2">
          Restricted Archive
        </p>
        <h1 className="text-2xl text-amber-200 mb-2">Grand Maester&apos;s Desk</h1>
        <p className="text-sm text-amber-100/70 mb-6">
          Speak the Grand Maester&apos;s secret key to manage chronicles.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="passcode"
            required
            placeholder="Enter admin passcode..."
            className="w-full bg-zinc-950 border border-amber-500/40 px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-400"
          />
          {error && (
            <p className="text-sm text-red-400">
              Incorrect admin passcode. Access denied.
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 py-3 uppercase tracking-widest text-xs font-bold transition-colors cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Unlock Desk'}
          </button>
        </form>
      </div>
    </div>
  );
}
