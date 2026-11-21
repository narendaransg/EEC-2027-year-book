'use client';

import React, { useState, useTransition } from 'react';
import { ExternalLink, Music2, Sparkles } from 'lucide-react';
import { addJukeboxSong } from './actions';

export type SongEntry = {
  id: string;
  song_title: string;
  artist: string;
  link_url: string | null;
  dedication: string | null;
  house: string;
  dedicator_name: string | null;
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

function houseCrestPath(house: string) {
  const key = house.toLowerCase().replace(/^house\s+/, '').trim();
  return `/assets/crests/${key}.png`;
}

export default function JukeboxClient({
  initialSongs,
  isSealed,
}: {
  initialSongs: SongEntry[];
  isSealed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const res = await addJukeboxSong(fd);
      if (!res.ok) {
        setError(res.error || 'Could not add song.');
        return;
      }
      form.reset();
      setSuccess(true);
      window.dispatchEvent(
        new CustomEvent('citadel:plushie', {
          detail: { action: 'fire', message: 'New track added to the Citadel Jukebox!' },
        })
      );
    });
  }

  return (
    <div className="space-y-8">
      {/* Quick 15-Second Song Drop Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 md:p-6 rounded-sm bg-[#1c0d06]/90 border border-amber-500/35 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base md:text-lg uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
            <Music2 className="w-4 h-4 text-amber-400" />
            <span>Drop a Batch Anthem</span>
          </h2>
          <span className="text-[11px] text-amber-200/70">Takes 10 seconds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="song_title"
            required
            maxLength={120}
            placeholder="Song Title (e.g., Enna Solla Pogirai / Starboy)"
            className="px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
          />
          <input
            name="artist"
            required
            maxLength={100}
            placeholder="Artist / Composer (e.g., A.R. Rahman / The Weeknd)"
            className="px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            name="dedicator_name"
            maxLength={60}
            placeholder="Your Name (optional)"
            className="px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
          />

          <input
            name="link_url"
            type="url"
            maxLength={260}
            placeholder="Spotify / YouTube link (optional)"
            className="px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <input
          name="dedication"
          maxLength={240}
          placeholder="One-line memory or vibe (e.g., '3 AM bus ride back from symposium')"
          className="w-full px-3.5 py-2.5 rounded-sm bg-black/60 border border-amber-700/50 text-amber-50 placeholder:text-amber-200/40 text-sm focus:outline-none focus:border-amber-400"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && (
          <p className="text-xs text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Track etched onto the Citadel playlist!</span>
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-amber-800/90 hover:bg-amber-700 disabled:opacity-50 text-amber-50 px-6 py-2.5 uppercase tracking-widest text-xs font-bold border border-amber-400/40 shadow cursor-pointer"
        >
          {isPending ? 'Adding Track...' : 'Add to Jukebox'}
        </button>
      </form>

      <div className="flex justify-center">
        <img
          src="/assets/scroll-divider.png"
          alt=""
          className="h-7 object-contain opacity-85"
        />
      </div>

      {/* Playlist Wall */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialSongs.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-black/50 border border-amber-800/40 rounded-sm text-amber-200/75 text-sm">
            No songs dedicated yet—be the first bard to set the batch soundtrack.
          </div>
        ) : (
          initialSongs.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-sm bg-[#211007]/90 border border-amber-600/30 flex items-start gap-3.5 shadow-lg"
            >
              <img
                src={houseCrestPath(s.house)}
                alt={s.house}
                className="w-11 h-11 object-contain shrink-0 mt-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-amber-100 leading-snug">
                      {s.song_title}
                    </h3>
                    <p className="text-xs text-amber-300/85">{s.artist}</p>
                  </div>
                  {s.link_url && (
                    <a
                      href={s.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-sm bg-amber-900/70 hover:bg-amber-800 border border-amber-500/40 text-[11px] text-amber-100"
                    >
                      <span>Play</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {s.dedication && !isSealed && (
                  <p className="mt-2 text-xs italic text-amber-100/85">
                    &ldquo;{s.dedication}&rdquo;
                  </p>
                )}

                <p className="mt-2 text-[11px] text-amber-200/65">
                  {s.house} · Dedicated by{' '}
                  <span className="text-amber-200">
                    {s.dedicator_name || 'Anonymous Bard'}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
