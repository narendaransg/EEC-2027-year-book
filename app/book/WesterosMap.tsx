'use client';

import { useMemo, useState } from 'react';
import type { ProfileItem } from './FlipbookClient';

type Stronghold = {
  key: string;
  house: string;
  seat: string;
  x: number;
  y: number;
  color: string;
};

const STRONGHOLDS: Stronghold[] = [
  { key: 'stark', house: 'House Stark', seat: 'Winterfell', x: 46, y: 24, color: '#e2e8f0' },
  { key: 'mormont', house: 'House Mormont', seat: 'Bear Island', x: 35, y: 17, color: '#86efac' },
  { key: 'bolton', house: 'House Bolton', seat: 'The Dreadfort', x: 56, y: 23, color: '#fda4af' },
  { key: 'arryn', house: 'House Arryn', seat: 'The Eyrie', x: 61, y: 47, color: '#7dd3fc' },
  { key: 'greyjoy', house: 'House Greyjoy', seat: 'Pyke', x: 31, y: 50, color: '#fbbf24' },
  { key: 'tully', house: 'House Tully', seat: 'Riverrun', x: 47, y: 52, color: '#60a5fa' },
  { key: 'lannister', house: 'House Lannister', seat: 'Casterly Rock', x: 33, y: 62, color: '#f87171' },
  { key: 'targaryen', house: 'House Targaryen', seat: 'Dragonstone', x: 67, y: 61, color: '#ef4444' },
  { key: 'baratheon', house: 'House Baratheon', seat: "Storm's End", x: 63, y: 73, color: '#facc15' },
  { key: 'tyrell', house: 'House Tyrell', seat: 'Highgarden', x: 41, y: 76, color: '#4ade80' },
  { key: 'martell', house: 'House Martell', seat: 'Sunspear', x: 66, y: 89, color: '#fb923c' },
];

function matchStronghold(houseName?: string | null): Stronghold {
  const lower = (houseName || '').toLowerCase();
  return (
    STRONGHOLDS.find((s) => lower.includes(s.key)) || {
      key: 'kingslanding',
      house: houseName || "King's Landing",
      seat: "King's Landing",
      x: 56,
      y: 63,
      color: '#f59e0b',
    }
  );
}

export default function WesterosMap({ profiles }: { profiles: ProfileItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeHouse, setActiveHouse] = useState<string>('ALL');

  const plottedMembers = useMemo(() => {
    const grouped: Record<string, ProfileItem[]> = {};
    for (const p of profiles) {
      const sh = matchStronghold(p.house_name);
      if (!grouped[sh.key]) grouped[sh.key] = [];
      grouped[sh.key].push(p);
    }

    const dots: Array<{
      profile: ProfileItem;
      stronghold: Stronghold;
      left: number;
      top: number;
    }> = [];

    for (const [key, members] of Object.entries(grouped)) {
      const sh = matchStronghold(members[0]?.house_name);
      members.forEach((member, idx) => {
        const ring = Math.floor(idx / 8);
        const posInRing = idx % 8;
        const totalInRing = Math.min(8, members.length - ring * 8);
        const angle = (posInRing / totalInRing) * Math.PI * 2 - Math.PI / 2;
        const radius = members.length === 1 ? 0 : 1.7 + ring * 1.4;

        dots.push({
          profile: member,
          stronghold: sh,
          left: Math.min(96, Math.max(4, sh.x + Math.cos(angle) * radius)),
          top: Math.min(96, Math.max(4, sh.y + Math.sin(angle) * radius * 0.65)),
        });
      });
    }

    return dots;
  }, [profiles]);

  const selectedEntry = useMemo(
    () => plottedMembers.find((d) => d.profile.id === selectedId) || plottedMembers[0] || null,
    [plottedMembers, selectedId]
  );

  const visibleDots =
    activeHouse === 'ALL'
      ? plottedMembers
      : plottedMembers.filter((d) => d.stronghold.key === activeHouse);

  const activeStrongholds = STRONGHOLDS.filter((sh) =>
    plottedMembers.some((d) => d.stronghold.key === sh.key)
  );

  return (
    <section className="mt-12 border border-amber-500/30 bg-black/75 backdrop-blur-sm rounded-sm p-5 md:p-7 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/25 pb-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">
            The Known World • Batch Allegiance
          </p>
          <h2 className="text-2xl md:text-3xl text-amber-200 mt-1">
            Realm of Westeros Map
          </h2>
          <p className="text-sm text-amber-100/75 mt-1">
            Each glowing marker represents a classmate sworn to their Great House. Tap any dot to inspect their chronicle.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveHouse('ALL')}
            className={`px-2.5 py-1 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
              activeHouse === 'ALL'
                ? 'bg-amber-800 text-amber-50 border-amber-400'
                : 'bg-zinc-950/80 text-amber-200/75 border-amber-500/25 hover:border-amber-400/60'
            }`}
          >
            All ({profiles.length})
          </button>
          {activeStrongholds.map((sh) => {
            const count = plottedMembers.filter((d) => d.stronghold.key === sh.key).length;
            return (
              <button
                key={sh.key}
                type="button"
                onClick={() => setActiveHouse(sh.key)}
                className={`px-2.5 py-1 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  activeHouse === sh.key
                    ? 'bg-amber-800 text-amber-50 border-amber-400'
                    : 'bg-zinc-950/80 text-amber-200/75 border-amber-500/25 hover:border-amber-400/60'
                }`}
              >
                {sh.house.replace('House ', '')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 relative w-full overflow-hidden rounded-sm border-2 border-[#5c3118] shadow-[0_15px_50px_rgba(0,0,0,0.9)] bg-[#1b120c]">
          <img
            src="/assets/westeros-map.jpg"
            alt="Map of Westeros"
            className="w-full h-auto block select-none brightness-95 contrast-105"
          />

          {activeStrongholds.map((sh) => (
            <div
              key={sh.key}
              style={{ left: `${sh.x}%`, top: `${sh.y}%` }}
              className="absolute -translate-x-1/2 translate-y-2.5 pointer-events-none hidden sm:block"
            >
              <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-widest bg-black/75 text-amber-200/90 border border-amber-500/30 rounded-xs whitespace-nowrap shadow">
                {sh.seat}
              </span>
            </div>
          ))}

          {visibleDots.map(({ profile, stronghold, left, top }) => {
            const isSelected = selectedEntry?.profile.id === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedId(profile.id)}
                title={`${profile.name} — ${stronghold.house} (${stronghold.seat})`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  backgroundColor: stronghold.color,
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'w-4 h-4 ring-4 ring-amber-300/90 scale-125 z-30'
                    : 'w-3 h-3 ring-2 ring-black/80 hover:scale-150 hover:z-20 z-10'
                }`}
              >
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 text-xs bg-zinc-950/95 text-amber-100 border border-amber-400/50 rounded-xs whitespace-nowrap shadow-lg">
                  {profile.name}
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            backgroundImage: `url('/assets/parchment.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="p-5 rounded-sm border-2 border-[#5c3118] text-[#24140c] shadow-xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#6e2612]">
            Citadel Raven Dispatch
          </p>

          {selectedEntry ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                {selectedEntry.profile.signed_portrait_url ? (
                  <img
                    src={selectedEntry.profile.signed_portrait_url}
                    alt={selectedEntry.profile.name}
                    className="w-16 h-16 object-cover rounded-sm border border-[#5c3118]"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-[#5c3118]/15 border border-[#5c3118]/40 text-xs font-bold uppercase text-[#5c3118]">
                    {selectedEntry.stronghold.house.replace('House ', '').slice(0, 3)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-[#1f1008]">
                    {selectedEntry.profile.name}
                  </h3>
                  {selectedEntry.profile.nickname && (
                    <p className="text-xs italic text-[#5c3118]">
                      &ldquo;{selectedEntry.profile.nickname}&rdquo;
                    </p>
                  )}
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6e2612] mt-0.5">
                    {selectedEntry.stronghold.house} • {selectedEntry.stronghold.seat}
                  </p>
                </div>
              </div>

              {selectedEntry.profile.branch && (
                <p className="text-xs uppercase tracking-widest text-[#3b1e0e] border-y border-[#5c3118]/25 py-1.5">
                  Department: <span className="font-bold">{selectedEntry.profile.branch}</span>
                </p>
              )}

              {selectedEntry.profile.house_words && (
                <p className="text-sm italic text-[#3b1e0e]">
                  &ldquo;{selectedEntry.profile.house_words}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#3b1e0e] mt-3">
              No banners raised yet—claim your House to appear on the map of Westeros.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
