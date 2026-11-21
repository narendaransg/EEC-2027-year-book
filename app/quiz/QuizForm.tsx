'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Zap } from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/lib/houses';
import { lookupProfileForReforge, submitQuiz } from './actions';
import HouseCardStudio, { ForgedCardData } from './HouseCardStudio';

const QUICK_QUESTIONS = QUIZ_QUESTIONS.filter((q) =>
  ['q1', 'q2', 'q6'].includes(q.id)
);

type MatchedProfile = {
  id: string;
  name: string;
  nickname: string | null;
  branch: string;
  house_name: string;
  house_words: string;
  sigil: string;
};

export default function QuizForm() {
  const [tab, setTab] = useState<'claim' | 'reforge'>('claim');
  const [fullMode, setFullMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [forgedCard, setForgedCard] = useState<ForgedCardData | null>(null);

  // Re-forge lookup state
  const [lookupName, setLookupName] = useState('');
  const [lookupBranch, setLookupBranch] = useState('');
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [searching, startLookup] = useTransition();

  function handleClaimSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('mode', fullMode ? 'full' : 'quick');

    startTransition(async () => {
      const res = await submitQuiz(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.success && res.profile) {
        setForgedCard(res.profile);
        window.dispatchEvent(
          new CustomEvent('citadel:plushie', {
            detail: {
              action: 'fire',
              message: `Dracarys! Claimed ${res.profile.houseName}!`,
            },
          })
        );
      }
    });
  }

  function handleLookup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLookupError(null);
    setMatches([]);
    startLookup(async () => {
      const res = await lookupProfileForReforge(lookupName, lookupBranch);
      if (res.error) {
        setLookupError(res.error);
        return;
      }
      setMatches((res.profiles as MatchedProfile[]) || []);
    });
  }

  if (forgedCard) {
    return (
      <div className="space-y-5">
        <HouseCardStudio
          data={forgedCard}
          onReset={() => {
            setForgedCard(null);
            setError(null);
          }}
        />
        <div className="text-center">
          <Link
            href="/book"
            className="inline-block text-xs uppercase tracking-widest text-amber-300 hover:text-amber-100 underline"
          >
            Back to The Citadel Chronicles →
          </Link>
        </div>
      </div>
    );
  }

  const questionsToRender = fullMode ? QUIZ_QUESTIONS : QUICK_QUESTIONS;

  return (
    <div className="space-y-6">
      {/* Mode Switcher: 15s Quick Claim vs Re-forge Old Card */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-sm bg-black/65 border border-amber-700/40">
        <button
          type="button"
          onClick={() => setTab('claim')}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors ${
            tab === 'claim'
              ? 'bg-amber-800 text-amber-50 border border-amber-400/60'
              : 'text-amber-200/75 hover:text-amber-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>15s Quick Claim</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('reforge')}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors ${
            tab === 'reforge'
              ? 'bg-amber-800 text-amber-50 border border-amber-400/60'
              : 'text-amber-200/75 hover:text-amber-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Already Filled? Re-forge Card</span>
        </button>
      </div>

      {tab === 'reforge' ? (
        <div className="p-5 md:p-6 rounded-sm bg-[#1c0d06]/95 border border-amber-500/35 shadow-2xl space-y-4">
          <div>
            <h2 className="text-lg uppercase tracking-widest text-amber-300 font-bold">
              Find Your Existing Entry
            </h2>
            <p className="text-xs text-amber-200/75 mt-1">
              Already submitted your yearbook entry earlier? Look up your name and forge a new Valyrian, Parchment, or Dragonfire card.
            </p>
          </div>

          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={lookupName}
              onChange={(e) => setLookupName(e.target.value)}
              required
              placeholder="Your Name"
              className="px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
            />
            <input
              value={lookupBranch}
              onChange={(e) => setLookupBranch(e.target.value)}
              placeholder="Dept (e.g., ECE, CSE)"
              className="px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
            />
            <button
              type="submit"
              disabled={searching}
              className="flex items-center justify-center gap-1.5 bg-amber-800 hover:bg-amber-700 text-amber-50 px-4 py-2.5 rounded-sm uppercase tracking-wider text-xs font-bold border border-amber-400/40 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searching ? 'Searching...' : 'Find Entry'}</span>
            </button>
          </form>

          {lookupError && <p className="text-xs text-red-400">{lookupError}</p>}

          {matches.length > 0 && (
            <div className="space-y-2.5 pt-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-sm bg-black/60 border border-amber-600/35 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold text-amber-100">
                      {m.name}{' '}
                      <span className="text-xs font-normal text-amber-300/80">
                        ({m.branch})
                      </span>
                    </div>
                    <div className="text-xs text-amber-200/80">
                      {m.house_name} — &ldquo;{m.house_words}&rdquo;
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForgedCard({
                        name: m.name,
                        branch: m.branch,
                        houseName: m.house_name,
                        houseWords: m.house_words,
                        sigil: m.sigil,
                      })
                    }
                    className="px-4 py-2 rounded-sm bg-amber-700 hover:bg-amber-600 text-white text-xs uppercase tracking-wider font-bold cursor-pointer"
                  >
                    Open Card Studio
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleClaimSubmit}
          className="p-5 md:p-7 rounded-sm bg-[#1c0d06]/95 border border-amber-500/35 shadow-2xl space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/40 pb-4">
            <div>
              <h2 className="text-lg uppercase tracking-widest text-amber-300 font-bold">
                {fullMode ? 'Full Chronicle & Sorting' : '15-Second Quick Claim'}
              </h2>
              <p className="text-xs text-amber-200/75 mt-0.5">
                {fullMode
                  ? 'All 6 questions + memories, advice & portrait'
                  : 'Just Name, Dept & 3 picks—add full memories later or toggle Full Mode'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFullMode((v) => !v)}
              className="px-3 py-1.5 rounded-sm bg-black/60 hover:bg-black/80 border border-amber-600/40 text-[11px] uppercase tracking-wider text-amber-200 cursor-pointer"
            >
              {fullMode ? 'Switch to 15s Quick Claim' : 'Full 6-Question Mode'}
            </button>
          </div>

          {/* Core Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                Full Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g., Narendaran S G"
                className="w-full px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                Department / Branch *
              </label>
              <input
                name="branch"
                required
                placeholder="e.g., ECE, CSE, Mech, IT"
                className="w-full px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
              />
            </div>
          </div>

          {fullMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                  Nickname / Callsign
                </label>
                <input
                  name="nickname"
                  placeholder="Optional"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                  Custom House Words (Optional)
                </label>
                <input
                  name="custom_words"
                  placeholder="Leave blank for default House words"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
                />
              </div>
            </div>
          )}

          {/* Sorting Questions */}
          <div className="space-y-5">
            {questionsToRender.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-semibold text-amber-100">
                  {idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-start gap-2.5 p-2.5 rounded-sm bg-black/55 hover:bg-amber-950/50 border border-amber-800/40 text-xs text-amber-100/90 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={optIdx}
                        required
                        className="mt-0.5 accent-amber-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {fullMode && (
            <div className="space-y-4 pt-2 border-t border-amber-800/40">
              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                  Favorite College Memory *
                </label>
                <textarea
                  name="college_memory"
                  required={fullMode}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                    Advice for Juniors *
                  </label>
                  <input
                    name="junior_advice"
                    required={fullMode}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                    Apocalypse Ally *
                  </label>
                  <input
                    name="apocalypse_ally"
                    required={fullMode}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-200 mb-1">
                  Portrait (Optional)
                </label>
                <input
                  type="file"
                  name="portrait"
                  accept="image/*"
                  className="text-xs text-amber-200/80"
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 px-8 py-3 rounded-sm uppercase tracking-widest text-xs font-bold border border-amber-400/40 shadow-lg cursor-pointer"
          >
            {isPending ? 'Sorting Your House...' : 'Claim House & Open Card Forge'}
          </button>
        </form>
      )}
    </div>
  );
}
