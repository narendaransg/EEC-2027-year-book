import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import JukeboxClient, { SongEntry } from './JukeboxClient';

export const dynamic = 'force-dynamic';

export default async function JukeboxPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    redirect('/');
  }

  const isSealed = process.env.YEARBOOK_SEALED !== 'false';
  const { data } = await supabaseAdmin
    .from('jukebox_songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80);

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(22, 10, 4, 0.55) 0%, rgba(5, 2, 1, 0.94) 100%), url('/assets/iron-throne.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      className="relative min-h-screen text-amber-50 p-6 md:p-10 font-serif overflow-x-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center gap-3.5 border-b border-amber-500/30 pb-5 mb-6">
          <img
            src="/assets/bard-lute.png"
            alt=""
            className="w-12 h-12 object-contain drop-shadow"
          />
          <div>
            <h1 className="text-3xl md:text-4xl text-amber-200 tracking-wide">
              The Bard&apos;s Jukebox
            </h1>
            <p className="text-amber-200/80 text-sm mt-0.5">
              EEC Batch of 2027 Soundtrack · Watch the plushie dance while you browse
            </p>
          </div>
        </header>

        <JukeboxClient
          initialSongs={(data as SongEntry[]) || []}
          isSealed={isSealed}
        />
      </div>
    </div>
  );
}
