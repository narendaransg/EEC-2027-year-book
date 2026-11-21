import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { logoutCitadel } from '@/app/actions';
import { getSealedQuote } from '@/lib/sealedQuotes';
import FlipbookClient, { ProfileItem } from './FlipbookClient';
import WesterosMap from './WesterosMap';
import NedGuide from '@/app/components/NedGuide';

export const dynamic = 'force-dynamic';

export default async function BookPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    redirect('/');
  }

  const isSealed = process.env.YEARBOOK_SEALED !== 'false';

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const enrichedProfiles: ProfileItem[] = await Promise.all(
    (profiles || []).map(async (p) => {
      if (isSealed) {
        return {
          ...p,
          nickname: null,
          branch: '',
          signed_portrait_url: null,
          house_words: 'Protected Until Graduation',
          college_memory: getSealedQuote(String(p.id || p.name || '')),
          junior_advice: 'Sealed until graduation — only Name & House are visible right now.',
          apocalypse_ally: 'Sealed until graduation',
          is_sealed: true,
        };
      }

      let signedUrl: string | null = null;
      if (p.portrait_url) {
        const { data } = await supabaseAdmin.storage
          .from('portraits')
          .createSignedUrl(p.portrait_url, 60 * 60);
        signedUrl = data?.signedUrl || null;
      }

      return {
        ...p,
        signed_portrait_url: signedUrl,
        is_sealed: false,
      };
    })
  );

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(15, 6, 3, 0.45) 0%, rgba(5, 2, 1, 0.9) 100%), url('/assets/iron-throne.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      className="relative min-h-screen text-amber-50 p-6 md:p-10 font-serif overflow-x-hidden"
    >
      {/* Flaming Glow & Rising Embers at the Bottom Behind the Desk */}
      <div className="fixed inset-x-0 bottom-0 h-56 pointer-events-none z-0 overflow-hidden">
        <div
          style={{
            background:
              'linear-gradient(to top, rgba(220, 38, 38, 0.55) 0%, rgba(234, 88, 12, 0.35) 40%, rgba(245, 158, 11, 0.12) 70%, transparent 100%)',
          }}
          className="absolute inset-0 flame-glow"
        />
        <span className="ember" style={{ left: '12%', animationDelay: '0s' }} />
        <span className="ember" style={{ left: '26%', animationDelay: '1.1s' }} />
        <span className="ember" style={{ left: '41%', animationDelay: '0.5s' }} />
        <span className="ember" style={{ left: '58%', animationDelay: '2.2s' }} />
        <span className="ember" style={{ left: '73%', animationDelay: '0.8s' }} />
        <span className="ember" style={{ left: '88%', animationDelay: '1.7s' }} />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between border-b border-amber-500/30 pb-5 mb-5 gap-4">
          <div>
            <h1 className="text-4xl text-amber-200 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              The Citadel Chronicles
            </h1>
            <p className="text-amber-200/85 mt-1 text-sm">
              Easwari Engineering College • Batch of 2027 •{' '}
              {enrichedProfiles.length} Chronicles Recorded
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quiz"
              className="bg-amber-800/90 hover:bg-amber-700 text-amber-50 px-6 py-3 uppercase tracking-widest text-xs font-bold transition-colors border border-amber-400/40 shadow-lg"
            >
              + Claim Your House
            </Link>

            <form action={logoutCitadel}>
              <button
                type="submit"
                className="bg-zinc-950/80 hover:bg-red-950/80 text-amber-200/80 hover:text-red-200 px-4 py-3 uppercase tracking-widest text-xs border border-amber-500/30 transition-colors cursor-pointer"
              >
                Lock Gate
              </button>
            </form>
          </div>
        </header>

        {isSealed && (
          <div className="mb-6 px-4 py-3 bg-amber-950/75 border border-amber-500/45 rounded-sm text-xs md:text-sm text-amber-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              <strong>Privacy Mode On:</strong> Personal content is protected until graduation—only <strong>Name</strong> and <strong>House</strong> are shown with Citadel &amp; engineering quotes.
            </span>
            <span className="uppercase tracking-widest text-[10px] font-bold text-amber-300 shrink-0">
              Sealed Until Graduation
            </span>
          </div>
        )}

        {error && (
          <p className="text-red-400 mb-6">
            Could not load chronicles: {error.message}
          </p>
        )}

        {enrichedProfiles.length === 0 ? (
          <div className="text-center py-20 border border-amber-900/50 bg-black/60 backdrop-blur-sm rounded-sm">
            <h2 className="text-2xl text-amber-200 mb-3">
              The Pages Are Still Blank
            </h2>
            <p className="text-amber-100/70 mb-6">
              Be the first of your batch to be sorted into a Great House and etched into the yearbook.
            </p>
            <Link
              href="/quiz"
              className="inline-block bg-amber-900 hover:bg-amber-800 text-amber-50 px-8 py-3 uppercase tracking-widest text-sm"
            >
              Take the Sorting Quiz
            </Link>
          </div>
        ) : (
          <>
            <FlipbookClient profiles={enrichedProfiles} />
            <WesterosMap profiles={enrichedProfiles} />
          </>
        )}
      </div>

      <NedGuide mode="book" />
    </div>
  );
}
