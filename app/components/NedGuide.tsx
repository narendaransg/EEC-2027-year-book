'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface NedGuideProps {
  mode: 'book' | 'quiz';
}

const BOOK_TIPS = [
  'Welcome to the Citadel, friend. Winter is coming, and these pages preserve our batch’s legacy before we part ways.',
  'Click the corners of the book—or use Prev / Next Page below—to turn through the chronicles of your batchmates.',
  'Haven’t etched your name yet? Click "+ Claim Your House" at the top right to take the Sorting Trials and add your page.',
  'Want a keepsake? Hit "Page PDF" on any chronicle for a single sheet, or "Download Complete Book (PDF)" to bind the entire tome.',
];

const QUIZ_TIPS = [
  'The man who passes the sentence should swing the sword—answer honestly, and the Maesters will sort you into your true Great House.',
  'Step I (Identity): Enter your name, branch, and upload a portrait photo if you wish it framed on your parchment.',
  'Step II (The Sorting Trials): Answer all 6 trials. Each choice weighs your temperament across the 8 Great Houses.',
  'Step III (Chronicles): Leave your favourite memory, counsel for juniors, and your sworn ally—then seal it into the book.',
];

export default function NedGuide({ mode }: NedGuideProps) {
  const tips = mode === 'book' ? BOOK_TIPS : QUIZ_TIPS;
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-end gap-3 pointer-events-none">
      {/* Parchment Speech Bubble */}
      {open && (
        <div
          style={{
            backgroundImage: `url('/assets/parchment.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow:
              '0 12px 35px rgba(0,0,0,0.85), inset 0 0 25px rgba(72, 36, 12, 0.4)',
          }}
          className="pointer-events-auto relative w-64 sm:w-72 p-4 rounded-sm border-2 border-[#5c3118] text-[#24140c] font-serif"
        >
          <div className="flex items-center justify-between border-b border-[#5c3118]/40 pb-1.5 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6e2612]">
              Lord Eddard Stark
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Hide guide"
              className="text-[#5c3118] hover:text-[#1f1008] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-base leading-relaxed leading-relaxed min-h-[60px]">
            &ldquo;{tips[step]}&rdquo;
          </p>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#5c3118]/30 text-xs">
            <span className="text-[#5c3118] font-bold">
              {step + 1} / {tips.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStep((s) => (s > 0 ? s - 1 : tips.length - 1))}
                className="p-1 bg-[#5c3118]/15 hover:bg-[#5c3118]/30 text-[#24140c] rounded-sm cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) % tips.length)}
                className="flex items-center gap-0.5 px-2 py-1 bg-[#5c3118] hover:bg-[#432210] text-amber-100 rounded-sm uppercase tracking-wider cursor-pointer"
              >
                {step === tips.length - 1 ? 'Replay' : 'Next'}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ned Stark Portrait (click to toggle bubble) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Hide Lord Stark' : 'Ask Lord Stark for guidance'}
        className="pointer-events-auto group relative shrink-0 cursor-pointer focus:outline-none"
      >
        <img
          src="/assets/ned-stark.png"
          alt="Lord Eddard Stark"
          className="w-24 sm:w-28 h-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.95)] transition-transform group-hover:scale-105"
        />
        {!open && (
          <span className="absolute -top-2 -left-2 bg-[#6e2612] text-amber-100 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-400/60 shadow">
            Guide
          </span>
        )}
      </button>
    </div>
  );
}
