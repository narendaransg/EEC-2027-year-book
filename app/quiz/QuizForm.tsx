'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QUIZ_QUESTIONS } from '@/lib/houses';
import { submitQuiz } from './actions';

export default function QuizForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    studentName: string;
    branch: string;
    name: string;
    words: string;
    sigil: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const studentName = String(formData.get('name') || '').trim();
    const branch = String(formData.get('branch') || '').trim();
    const res = await submitQuiz(formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else if (res.success && res.house) {
      setResult({
        studentName,
        branch,
        ...res.house,
      });
    }
  }

  async function handleDownloadHouseCard() {
    if (!result) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadImg = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const houseKey = result.name.replace(/^House\s+/i, '').trim().toLowerCase();
    const [leather, sigil] = await Promise.all([
      loadImg('/assets/leather.jpg'),
      loadImg(`/assets/sigil/${houseKey}.png`),
    ]);

    ctx.drawImage(leather, 0, 0, 1080, 1350);
    ctx.fillStyle = 'rgba(18, 7, 3, 0.55)';
    ctx.fillRect(0, 0, 1080, 1350);

    // Gold border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(54, 54, 972, 1242);
    ctx.lineWidth = 2;
    ctx.strokeRect(72, 72, 936, 1206);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e6c680';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('EASWARI ENGINEERING COLLEGE • BATCH OF 2027', 540, 160);

    ctx.fillStyle = '#f5d896';
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText('The Maesters Have Sorted', 540, 240);

    // Sigil
    ctx.drawImage(sigil, 340, 290, 400, 400);

    ctx.fillStyle = '#f5d896';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(result.name.toUpperCase(), 540, 780);

    ctx.fillStyle = '#e6c680';
    ctx.font = 'italic 38px Georgia, serif';
    ctx.fillText(`"${result.words}"`, 540, 850);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText(result.studentName, 540, 1010);

    ctx.fillStyle = '#d4af37';
    ctx.font = '28px Georgia, serif';
    ctx.fillText(result.branch.toUpperCase(), 540, 1065);

    ctx.fillStyle = 'rgba(230, 198, 128, 0.75)';
    ctx.font = '22px Georgia, serif';
    ctx.fillText('THE CITADEL CHRONICLES', 540, 1210);

    const link = document.createElement('a');
    link.download = `${result.studentName.replace(/\s+/g, '_')}_${houseKey}_Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  if (result) {
    const houseKey = result.name.replace(/^House\s+/i, '').trim().toLowerCase();
    return (
      <div className="max-w-xl mx-auto text-center p-10 bg-amber-100 text-amber-950 border-2 border-amber-900/50 shadow-2xl rounded-sm">
        <p className="uppercase tracking-widest text-xs text-amber-900/70 mb-2">
          The Maesters Have Spoken
        </p>
        <img
          src={`/assets/sigil/${houseKey}.png`}
          alt={result.name}
          className="w-32 h-32 object-contain mx-auto my-4 drop-shadow-lg"
        />
        <h2 className="text-4xl font-bold mb-2">{result.name}</h2>
        <p className="italic text-xl text-amber-900 mb-6">
          &ldquo;{result.words}&rdquo;
        </p>
        <p className="text-sm text-amber-900/80 mb-8">
          Your chronicle has been etched into the Citadel archives.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={handleDownloadHouseCard}
            className="bg-[#5c3118] hover:bg-[#3f1f0d] text-amber-100 px-6 py-3 uppercase tracking-widest text-xs font-bold cursor-pointer transition-colors"
          >
            Download House Card (PNG)
          </button>
          <Link
            href="/book"
            className="inline-block bg-amber-900 hover:bg-amber-950 text-amber-50 px-8 py-3 uppercase tracking-widest text-xs font-bold transition-colors"
          >
            Open the Yearbook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-700 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Part 1: Identity */}
      <section className="p-6 md:p-8 bg-zinc-900/80 border border-amber-900/40 rounded-sm space-y-5">
        <h2 className="text-2xl text-amber-200 border-b border-amber-900/40 pb-2">
          I. Identity of the Scribe
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-amber-200/80 mb-1">
              Full Name *
            </label>
            <input
              name="name"
              required
              placeholder="e.g., Jon Snow"
              className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200/80 mb-1">
              College Nickname / Alias (Optional)
            </label>
            <input
              name="nickname"
              placeholder="e.g., The Night Owl"
              className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-amber-200/80 mb-1">
              Branch / Specialization *
            </label>
            <input
              name="branch"
              required
              placeholder="e.g., ECE, CSE, Mech"
              className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
            />
          </div>

          <div>
            <label className="block text-sm text-amber-200/80 mb-1">
              Portrait Photo (Optional, max 5MB)
            </label>
            <input
              type="file"
              name="portrait"
              accept="image/*"
              className="w-full p-2.5 bg-zinc-950 border border-amber-900/50 text-amber-100 text-sm file:mr-3 file:bg-amber-900 file:text-amber-50 file:border-0 file:px-3 file:py-1"
            />
          </div>
        </div>
      </section>

      {/* Part 2: Sorting Questions */}
      <section className="p-6 md:p-8 bg-zinc-900/80 border border-amber-900/40 rounded-sm space-y-8">
        <h2 className="text-2xl text-amber-200 border-b border-amber-900/40 pb-2">
          II. The Sorting Trials
        </h2>

        {QUIZ_QUESTIONS.map((q, qIdx) => (
          <div key={q.id} className="space-y-3">
            <p className="text-lg text-amber-100">
              {qIdx + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-start gap-3 p-3 bg-zinc-950/70 border border-amber-900/30 hover:border-amber-600/60 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={optIdx}
                    required
                    className="mt-1 accent-amber-600"
                  />
                  <span className="text-sm text-amber-100/90">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Part 3: The Chronicles */}
      <section className="p-6 md:p-8 bg-zinc-900/80 border border-amber-900/40 rounded-sm space-y-5">
        <h2 className="text-2xl text-amber-200 border-b border-amber-900/40 pb-2">
          III. Your Chronicles
        </h2>

        <div>
          <label className="block text-sm text-amber-200/80 mb-1">
            Custom House Words (Optional — leave blank to use your House motto)
          </label>
          <input
            name="custom_words"
            placeholder="e.g., Caffeine and Deadlines"
            className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
          />
        </div>

        <div>
          <label className="block text-sm text-amber-200/80 mb-1">
            Most Legendary College Memory *
          </label>
          <textarea
            name="college_memory"
            required
            rows={4}
            placeholder="Write a short paragraph about a moment you'll never forget..."
            className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
          />
        </div>

        <div>
          <label className="block text-sm text-amber-200/80 mb-1">
            One Unfiltered Piece of Advice for Juniors *
          </label>
          <input
            name="junior_advice"
            required
            placeholder="1–2 lines of real wisdom..."
            className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
          />
        </div>

        <div>
          <label className="block text-sm text-amber-200/80 mb-1">
            Who in this batch would you trust in a zombie apocalypse? *
          </label>
          <input
            name="apocalypse_ally"
            required
            placeholder="Shoutout a friend..."
            className="w-full p-3 bg-zinc-950 border border-amber-900/50 text-amber-50"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 py-4 uppercase tracking-widest text-sm font-bold border border-amber-500/40 cursor-pointer transition-colors"
      >
        {loading ? 'Consulting the Maesters...' : 'Claim My House & Seal Chronicle'}
      </button>
    </form>
  );
}
