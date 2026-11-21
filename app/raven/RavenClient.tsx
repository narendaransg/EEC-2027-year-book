'use client';

import React, { useState, useTransition } from 'react';
import { Feather, Lock, Sparkles } from 'lucide-react';
import { sendRavenDispatch } from './actions';

export type RavenDispatch = {
  id: string;
  kind: 'shoutout' | 'prediction_2030';
  message: string;
  house: string;
  sender_label: string | null;
  created_at: string;
};

const HOUSES = [
  'House Stark',
  'House Targaryen',
  'House Lannister',
  'House Baratheon',
  'House Tyrell',
  'House Martell',
  'House Arryn',
  'House Tully',
  'House Greyjoy',
];

export default function RavenClient({
  dispatches,
  isSealed,
}: {
  dispatches: RavenDispatch[];
  isSealed: boolean;
}) {
  const [kind, setKind] = useState<'shoutout' | 'prediction_2030'>('shoutout');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSent(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('kind', kind);

    startTransition(async () => {
      const res = await sendRavenDispatch(fd);
      if (!res.ok) {
        setError(res.error || 'Could not dispatch raven.');
        return;
      }
      form.reset();
      setSent(true);
      window.dispatchEvent(
        new CustomEvent('citadel:plushie', {
          detail: {
            action: 'fire',
            message:
              kind === 'prediction_2030'
                ? '2030 Time Capsule sealed in wax!'
                : 'Raven dispatched to the Rookery!',
          },
        })
      );
    });
  }

  const shoutouts = dispatches.filter((d) => d.kind === 'shoutout');
  const predictions = dispatches.filter((d) => d.kind === 'prediction_2030');

  return (
    <div className="space-y-8">
      {/* Send Raven Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 md:p-6 rounded-sm bg-[#1c0d06]/90 border border-amber-500/35 shadow-2xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind('shoutout')}
              className={`px-3.5 py-1.5 rounded-sm text-xs uppercase tracking-wider border cursor-pointer ${
                kind === 'shoutout'
                  ? 'bg-amber-800 border-amber-400 text-amber-50 font-bold'
                  : 'bg-black/50 border-amber-700/40 text-amber-200/75'
              }`}
            >
              Batch Shoutout
            </button>
            <button
              type="button"
              onClick={() => setKind('prediction_2030')}
              className={`px-3.5 py-1.5 rounded-sm text-xs uppercase tracking-wider border cursor-pointer ${
                kind === 'prediction_2030'
                  ? 'bg-red-900/90 border-amber-400 text-amber-50 font-bold'
                  : 'bg-black/50 border-amber-700/40 text-amber-200/75'
              }`}
            >
              2030 Time Capsule
            </button>
          </div>
          <span className="text-[11px] text-amber-200/70">
            {kind === 'prediction_2030'
              ? 'Sealed in wax until graduation'
              : 'Quick note for the batch'}
          </span>
        </div>

        <textarea
          name="message"
          required
          rows={3}
          maxLength={320}
          placeholder={
            kind === 'prediction_2030'
              ? 'Where will our gang or favorite classmate be in 2030? (e.g., "Running an ASIC startup in Bengaluru or still debugging Verilog at 2 AM")'
              : 'Drop a wholesome shoutout, inside joke, or thank-you to the batch...'
          }
          className="w-full px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            name="house"
            defaultValue="House Stark"
            className="px-3.5 py-2.5 rounded-sm bg-black/75 border border-amber-700/50 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
          >
            {HOUSES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <input
            name="sender_label"
            maxLength={60}
            placeholder="Signed as (leave blank for Anonymous Raven)"
            className="px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {sent && (
          <p className="text-xs text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Raven stamped and delivered!</span>
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-amber-800/90 hover:bg-amber-700 disabled:opacity-50 text-amber-50 px-6 py-2.5 uppercase tracking-widest text-xs font-bold border border-amber-400/40 shadow cursor-pointer"
        >
          <Feather className="w-3.5 h-3.5" />
          <span>{isPending ? 'Sealing Scroll...' : 'Release Raven'}</span>
        </button>
      </form>

      {/* 2030 Time Capsule Vault */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
            <img src="/assets/wax-seal-gold.png" alt="" className="w-6 h-6 object-contain" />
            <span>2030 Time Capsule Vault ({predictions.length})</span>
          </h2>
          {isSealed && (
            <span className="text-[11px] text-amber-300/85 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Sealed Until Graduation
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.length === 0 ? (
            <p className="text-xs text-amber-200/65 col-span-full">
              No 2030 predictions sealed yet—lock in the first prophecy above.
            </p>
          ) : (
            predictions.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-sm bg-[#231007]/90 border border-amber-500/35 relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                    {p.house} · {p.sender_label || 'Anonymous Raven'}
                  </span>
                  <img
                    src="/assets/wax-seal-gold.png"
                    alt="Sealed"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                {isSealed ? (
                  <p className="text-xs italic text-amber-200/75">
                    Sealed in gold wax — contents unlock on graduation day.
                  </p>
                ) : (
                  <p className="text-sm text-amber-50 leading-relaxed">{p.message}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex justify-center">
        <img
          src="/assets/scroll-divider.png"
          alt=""
          className="h-7 object-contain opacity-85"
        />
      </div>

      {/* Batch Shoutout Wall */}
      <section className="space-y-3">
        <h2 className="text-lg uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
          <img src="/assets/wax-seal-crimson.png" alt="" className="w-6 h-6 object-contain" />
          <span>Rookery Shoutout Wall ({shoutouts.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shoutouts.length === 0 ? (
            <p className="text-xs text-amber-200/65 col-span-full">
              The rookery is quiet—send the first shoutout above.
            </p>
          ) : (
            shoutouts.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-sm bg-[#211007]/90 border border-amber-600/30 shadow-lg"
              >
                <p className="text-sm text-amber-50 leading-relaxed">
                  &ldquo;{s.message}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-amber-200/70">
                  <span>
                    {s.house} · {s.sender_label || 'Anonymous Raven'}
                  </span>
                  <img
                    src="/assets/wax-seal-crimson.png"
                    alt=""
                    className="w-5 h-5 object-contain opacity-85"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
