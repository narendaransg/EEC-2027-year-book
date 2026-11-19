import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { logoutAdmin } from '@/app/actions';
import AdminLoginForm from './AdminLoginForm';

export const dynamic = 'force-dynamic';

async function deleteProfile(formData: FormData) {
  'use server';

  const cookieStore = await cookies();
  if (cookieStore.get('citadel_admin')?.value !== 'granted') {
    throw new Error('Unauthorized admin action');
  }

  const id = String(formData.get('id') || '');
  const portraitUrl = String(formData.get('portrait_url') || '');

  if (!id) return;

  if (portraitUrl) {
    await supabaseAdmin.storage.from('portraits').remove([portraitUrl]);
  }

  await supabaseAdmin.from('profiles').delete().eq('id', id);

  revalidatePath('/admin');
  revalidatePath('/book');
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_admin')?.value !== 'granted') {
    return <AdminLoginForm />;
  }

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-amber-50 p-6 md:p-10 font-serif">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap items-center justify-between border-b border-amber-500/30 pb-5 mb-8 gap-4">
          <div>
            <h1 className="text-3xl text-amber-200">Grand Maester&apos;s Desk</h1>
            <p className="text-sm text-amber-200/70 mt-1">
              Manage recorded chronicles ({profiles?.length || 0} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="border border-amber-500/40 hover:bg-amber-950/60 text-amber-200 px-4 py-2 text-xs uppercase tracking-widest"
            >
              Back to Book
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 px-4 py-2 text-xs uppercase tracking-widest cursor-pointer"
              >
                Lock Admin
              </button>
            </form>
          </div>
        </header>

        {error && (
          <p className="text-red-400 mb-6">Error loading entries: {error.message}</p>
        )}

        {!profiles || profiles.length === 0 ? (
          <p className="text-amber-100/60 py-12 text-center border border-amber-500/20">
            No chronicles recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {profiles.map((row: Record<string, unknown>) => {
              const id = String(row.id || '');
              const displayName = String(
                row.name || row.nickname || row.full_name || 'Unnamed Chronicle'
              );
              const houseLabel = String(row.house_name || row.house || '');
              const meta = [row.branch, houseLabel, row.nickname]
                .filter(Boolean)
                .map(String)
                .join(' • ');
              const portraitUrl = String(row.portrait_url || '');

              return (
                <div
                  key={id}
                  className="flex items-center justify-between bg-zinc-900/90 border border-amber-500/25 p-4 gap-4"
                >
                  <div>
                    <h2 className="text-lg text-amber-200">{displayName}</h2>
                    {meta && (
                      <p className="text-xs text-amber-100/70">{meta}</p>
                    )}
                  </div>

                  <form action={deleteProfile}>
                    <input type="hidden" name="id" value={id} />
                    <input
                      type="hidden"
                      name="portrait_url"
                      value={portraitUrl}
                    />
                    <button
                      type="submit"
                      className="bg-red-900/80 hover:bg-red-800 text-red-50 px-4 py-2 text-xs uppercase tracking-widest font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
