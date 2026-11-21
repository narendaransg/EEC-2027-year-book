import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import WesterosMap from '@/app/book/WesterosMap';
import type { ProfileItem } from '@/app/book/FlipbookClient';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    redirect('/');
  }

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, house_name, sigil, branch, created_at')
    .order('created_at', { ascending: false });

  const list = profiles || [];

  const mapProfiles: ProfileItem[] = list.map((p) => ({
    id: String(p.id),
    name: p.name || 'Unknown',
    nickname: null,
    house_name: p.house_name || 'House Stark',
    house_words: '',
    sigil: p.sigil || '',
    branch: '',
    college_memory: '',
    junior_advice: '',
    apocalypse_ally: '',
    signed_portrait_url: null,
    is_sealed: true,
  }));

  const houseCounts = new Map<string, number>();
  const deptCounts = new Map<string, number>();

  for (const p of list) {
    const h = (p.house_name || 'Unclaimed').trim();
    houseCounts.set(h, (houseCounts.get(h) || 0) + 1);

    const rawDept = (p.branch || 'General').trim().toUpperCase();
    const dept = rawDept || 'GENERAL';
    deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
  }

  const sortedHouses = Array.from(houseCounts.entries()).sort((a, b) => b[1] - a[1]);
  const sortedDepts = Array.from(deptCounts.entries()).sort((a, b) => b[1] - a[1]);
  const total = Math.max(list.length, 1);

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(18, 9, 4, 0.55) 0%, rgba(5, 2, 1, 0.94) 100%), url('/assets/iron-throne.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      className="relative min-h-screen text-amber-50 p-6 md:p-10 font-serif overflow-x-hidden"
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/compass-rose.png"
              alt=""
              className="w-11 h-11 object-contain drop-shadow"
            />
            <div>
              <h1 className="text-3xl md:text-4xl text-amber-200 tracking-wide">
                Realm of Westeros &amp; War Chest
              </h1>
              <p className="text-amber-200/80 text-sm mt-0.5">
                {list.length} Banners Raised Across the Seven Kingdoms
              </p>
            </div>
          </div>

          <Link
            href="/quiz"
            className="bg-amber-800/90 hover:bg-amber-700 text-amber-50 px-5 py-2.5 uppercase tracking-widest text-xs font-bold border border-amber-400/40 shadow"
          >
            + Raise Your Banner
          </Link>
        </header>

        <WesterosMap profiles={mapProfiles} />

        <div className="my-8 flex justify-center">
          <img
            src="/assets/scroll-divider.png"
            alt=""
            className="h-7 object-contain opacity-85"
          />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-sm bg-[#1c0d06]/90 border border-amber-600/35 shadow-xl">
            <h2 className="text-lg uppercase tracking-widest text-amber-300 font-bold mb-1">
              Great House Standings
            </h2>
            <p className="text-xs text-amber-200/70 mb-4">
              Live allegiance count across the batch
            </p>
            <div className="space-y-3">
              {sortedHouses.length === 0 ? (
                <p className="text-xs text-amber-200/60">No banners claimed yet.</p>
              ) : (
                sortedHouses.map(([house, count]) => {
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={house}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-100 font-semibold">{house}</span>
                        <span className="text-amber-300">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-amber-800/40">
                        <div
                          style={{ width: `${Math.max(pct, 6)}%` }}
                          className="h-full bg-gradient-to-r from-amber-700 to-amber-400"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-5 rounded-sm bg-[#1c0d06]/90 border border-amber-600/35 shadow-xl">
            <h2 className="text-lg uppercase tracking-widest text-amber-300 font-bold mb-1">
              Department War Chest
            </h2>
            <p className="text-xs text-amber-200/70 mb-4">
              Which EEC department commands the realm
            </p>
            <div className="space-y-3">
              {sortedDepts.length === 0 ? (
                <p className="text-xs text-amber-200/60">No departments recorded yet.</p>
              ) : (
                sortedDepts.map(([dept, count]) => {
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-100 font-semibold">{dept}</span>
                        <span className="text-amber-300">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-amber-800/40">
                        <div
                          style={{ width: `${Math.max(pct, 6)}%` }}
                          className="h-full bg-gradient-to-r from-red-800 via-amber-600 to-amber-300"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
