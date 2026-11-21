'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Map as MapIcon,
  Music,
  Feather,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/book', label: 'Chronicles', icon: BookOpen },
  { href: '/map', label: 'Westeros Map', icon: MapIcon },
  { href: '/jukebox', label: 'Jukebox', icon: Music },
  { href: '/raven', label: 'Raven Post', icon: Feather },
  { href: '/quiz', label: 'Claim / Forge', icon: Flame },
];

export default function CitadelNav() {
  const pathname = usePathname() || '/';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio('/audio/theme.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  if (pathname === '/') return null;

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }

  return (
    <nav className="sticky top-0 z-30 w-full bg-[#140904]/90 backdrop-blur-md border-b border-amber-600/35 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider whitespace-nowrap transition-colors border ${
                  active
                    ? 'bg-amber-800/85 border-amber-400/70 text-amber-50 font-bold shadow'
                    : 'bg-[#241108]/75 border-amber-800/35 text-amber-200/80 hover:bg-[#381a0c] hover:text-amber-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleMusic}
          title={playing ? 'Pause Citadel soundtrack' : 'Play Citadel soundtrack'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#241108]/90 hover:bg-[#381a0c] border border-amber-600/40 text-amber-200 text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
        >
          {playing ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Theme On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-amber-300/60" />
              <span className="hidden sm:inline">Theme</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
