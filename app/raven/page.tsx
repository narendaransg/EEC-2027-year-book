import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import RavenClient, { RavenDispatch } from './RavenClient';

export const dynamic = 'force-dynamic';

export default async function RavenPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    redirect('/');
  }

  const isSealed = process.env.YEARBOOK_SEALED !== 'false';
  const { data } = await supabaseAdmin
    .from('raven_dispatches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(20, 9, 4, 0.55) 0%, rgba(5, 2, 1, 0.94) 100%), url('/assets/iron-throne.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      className="relative min-h-screen text-amber-50 p-6 md:p-10 font-serif overflow-x-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center gap-3.5 border-b border-amber-500/30 pb-5 mb-6">
          <img
            src="/assets/raven-scroll.png"
            alt=""
            className="w-12 h-12 object-contain drop-shadow"
          />
          <div>
            <h1 className="text-3xl md:text-4xl text-amber-200 tracking-wide">
              The Raven Post &amp; Time Capsule
            </h1>
            <p className="text-amber-200/80 text-sm mt-0.5">
              Batch shoutouts &amp; sealed 2030 graduation prophecies
            </p>
          </div>
        </header>

        <RavenClient
          dispatches={(data as RavenDispatch[]) || []}
          isSealed={isSealed}
        />
      </div>
    </div>
  );
}
