'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';

const ROUTE_TIPS: Record<string, string> = {
  '/book': 'Drag page corners or use search—personal details stay sealed until graduation.',
  '/map': 'Tap any House filter to highlight strongholds across the realm.',
  '/jukebox': 'Drop a college song dedication so the batch farewell playlist grows.',
  '/raven': 'Send a quick shoutout or lock in a 2030 time-capsule prediction.',
  '/quiz': 'Claim your House in 15 seconds or re-forge an existing House card.',
};

export default function NedGuide({ mode }: { mode?: string }) {
  const pathname = usePathname() || '/book';
  const [open, setOpen] = useState(false);

  const tip =
    ROUTE_TIPS[pathname] ||
    (mode === 'book'
      ? ROUTE_TIPS['/book']
      : 'Only your Name & House show while sealed—claim yours quickly.');

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-2 max-w-xs p-3 rounded-sm bg-[#241209]/95 border border-amber-500/50 text-amber-100 text-xs shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-300">
              Lord Eddard · Quick Tip
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Ned tip"
              className="text-amber-300/70 hover:text-amber-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="leading-relaxed text-amber-100/90">{tip}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#2a1208]/95 hover:bg-[#3f1c0d] border border-amber-500/50 text-amber-200 text-[11px] uppercase tracking-wider shadow-xl cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ned</span>
      </button>
    </div>
  );
}
