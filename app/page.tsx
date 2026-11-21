import { verifyPasscode } from './actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PasscodeInput from './components/PasscodeInput';

export default async function Gatekeeper({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value === 'granted') {
    redirect('/book');
  }

  const { error } = await searchParams;

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(15, 6, 3, 0.55) 0%, rgba(5, 2, 1, 0.92) 100%), url('/assets/iron-throne.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="flex min-h-screen items-center justify-center p-4 font-serif"
    >
      <div
        style={{
          backgroundImage: `url('/assets/parchment.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 70px rgba(0,0,0,0.9), inset 0 0 40px rgba(72,36,12,0.45)',
        }}
        className="w-full max-w-md p-8 rounded-sm border-2 border-[#5c3118] text-[#24140c]"
      >
        <p className="text-center text-xs uppercase tracking-[0.22em] font-bold text-[#6e2612] mb-1">
          Easwari Engineering College
        </p>
        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-[#5c3118] mb-5">
          Batch of 2027
        </p>

        <h1
          style={{ fontFamily: 'var(--font-cinzel), Georgia, serif' }}
          className="text-2xl md:text-3xl text-center font-bold text-[#1f1008] mb-4"
        >
          Speak the Password to Enter
        </h1>

        <div className="mb-5 p-3.5 bg-[#5c3118]/12 border border-[#5c3118]/45 rounded-xs text-xs leading-relaxed text-[#24140c]">
          <p className="font-bold uppercase tracking-wider text-[#6e2612] mb-1">
            Privacy Vault Active Until Graduation
          </p>
          <p>
            Your content is protected: while we&apos;re still in college, <strong>only your Name &amp; House</strong> are shown in the book and index alongside Game of Thrones &amp; engineering quotes. Photos, memories, and personal notes stay locked until we graduate.
          </p>
        </div>

        {error && (
          <p className="text-red-900 text-center font-bold mb-4 text-sm">
            Incorrect passcode. The Citadel remains closed.
          </p>
        )}

        <form
          action={async (formData) => {
            'use server';
            const result = await verifyPasscode(formData);
            if (result.success) {
              redirect('/book');
            } else {
              redirect('/?error=1');
            }
          }}
          className="flex flex-col gap-4"
        >
          <PasscodeInput />

          <button
            type="submit"
            className="bg-[#5c3118] text-amber-100 p-3 uppercase tracking-widest text-xs font-bold hover:bg-[#3f1f0d] transition-colors cursor-pointer"
          >
            Enter the Citadel
          </button>
        </form>
      </div>
    </div>
  );
}
