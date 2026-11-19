import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { deleteProfile } from './actions';

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    redirect('/');
  }

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, branch, house_name, portrait_url, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-amber-50 p-6 md:p-12 font-serif">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4 mb-6">
          <div>
            <h1 className="text-3xl text-amber-200">Grand Maester&apos;s Desk</h1>
            <p className="text-xs text-amber-200/60 mt-1">
              Manage &amp; remove duplicate or test chronicles
            </p>
          </div>
          <Link
            href="/book"
            className="text-sm text-amber-300 hover:underline"
          >
            ← Back to Book
          </Link>
        </div>

        <div className="space-y-3">
          {(profiles || []).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 bg-zinc-900 border border-amber-900/40 rounded-sm"
            >
              <div>
                <p className="font-bold text-amber-100">{p.name}</p>
                <p className="text-xs text-amber-200/60">
                  {p.branch} • {p.house_name}
                </p>
              </div>
              <form action={deleteProfile}>
                <input type="hidden" name="id" value={p.id} />
                <input
                  type="hidden"
                  name="portrait_url"
                  value={p.portrait_url || ''}
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 text-xs uppercase tracking-wider rounded-sm cursor-pointer"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
