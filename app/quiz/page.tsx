import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import QuizForm from './QuizForm';
import NedGuide from '@/app/components/NedGuide';

export default async function QuizPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('citadel_access')?.value !== 'granted') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-amber-50 p-6 md:p-12 font-serif">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl text-amber-200">
            The Sorting of Houses
          </h1>
          <Link
            href="/book"
            className="text-sm text-amber-200/70 hover:text-amber-200 underline"
          >
            ← Back to Book
          </Link>
        </div>
        <QuizForm />
      </div>

      <NedGuide mode="quiz" />
    </div>
  );
}
