'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const PLUSHIE_PALETTES = [
  { name: 'Drogon Ember', filter: 'none', badge: 'bg-red-950/90 text-amber-200 border-red-500/50' },
  { name: 'Rhaegal Jade', filter: 'hue-rotate(115deg) saturate(1.2)', badge: 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50' },
  { name: 'Viserion Gold', filter: 'hue-rotate(38deg) brightness(1.12) saturate(1.15)', badge: 'bg-amber-950/90 text-amber-200 border-amber-400/50' },
  { name: 'White Walker Ice', filter: 'hue-rotate(195deg) saturate(0.85) brightness(1.15)', badge: 'bg-sky-950/90 text-sky-200 border-sky-400/50' },
  { name: 'Wildfire Violet', filter: 'hue-rotate(265deg) saturate(1.25)', badge: 'bg-purple-950/90 text-purple-200 border-purple-400/50' },
  { name: 'Weirwood Rose', filter: 'hue-rotate(320deg) saturate(1.1)', badge: 'bg-rose-950/90 text-rose-200 border-rose-400/50' },
];

const SQUEAK_LINES = [
  'Squeak! Stress dissolved.',
  'Dracarys on your stress!',
  'New coat unlocked!',
  'Boop! Back to building.',
  'Roar-squeak! Keep going.',
];

const CHOMP_LINES = [
  'CHOMP! Got your cursor!',
  'NOM! Tasty parchment edge!',
  'SNAP! Almost bit your finger!',
  'CRUNCH! Dragon tax collected!',
];

type BiteMark = {
  id: number;
  x: number;
  y: number;
  rotate: number;
};

function playPlushieSqueak(pitchMultiplier: number, isChomp = false) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isChomp ? 'triangle' : 'sine';
    const baseFreq = (isChomp ? 420 : 580) * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq * 0.8, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      baseFreq * (isChomp ? 1.7 : 1.45),
      ctx.currentTime + 0.08
    );
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, ctx.currentTime + 0.17);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  } catch {
    // Ignore autoplay restrictions
  }
}

export default function DragonPlushie() {
  const pathname = usePathname();
  const [colorIdx, setColorIdx] = useState(0);
  const [squishing, setSquishing] = useState(false);
  const [breathingFire, setBreathingFire] = useState(false);
  const [biting, setBiting] = useState(false);
  const [squishCount, setSquishCount] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [biteMarks, setBiteMarks] = useState<BiteMark[]>([]);

  // Dynamic position in viewport px (null = parked bottom-left)
  const [pos, setPos] = useState<{ x: number; y: number; flipX: boolean; tilt: number } | null>(
    null
  );
  const [glideDuration, setGlideDuration] = useState(2800);

  const cursorRef = useRef<{ x: number; y: number }>({ x: 320, y: 260 });
  const bubbleTimerRef = useRef<number | null>(null);
  const isBitingRef = useRef(false);

  const isMap = pathname?.startsWith('/map');
  const isJukebox = pathname?.startsWith('/jukebox');
  const isQuiz = pathname?.startsWith('/quiz');

  // Track user cursor so the dragon can sneak up and bite it
  useEffect(() => {
    function onMove(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Random organic flight loop across /map
  useEffect(() => {
    if (!isMap) {
      if (!isBitingRef.current) setPos(null);
      return;
    }

    let cancelled = false;
    let timerId: number;

    function flyToNextRandomPoint() {
      if (cancelled) return;
      if (!isBitingRef.current) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const nextX = Math.round(60 + Math.random() * Math.max(vw - 180, 120));
        const nextY = Math.round(90 + Math.random() * Math.max(vh - 220, 140));
        const duration = Math.round(2300 + Math.random() * 1900);

        setGlideDuration(duration);
        setPos((prev) => {
          const prevX = prev ? prev.x : 40;
          const goingLeft = nextX < prevX;
          const tilt = goingLeft
            ? -8 + Math.random() * 14
            : -6 + Math.random() * 14;
          return { x: nextX, y: nextY, flipX: goingLeft, tilt };
        });

        timerId = window.setTimeout(flyToNextRandomPoint, duration + 250);
      } else {
        timerId = window.setTimeout(flyToNextRandomPoint, 1000);
      }
    }

    // Start flying immediately on /map
    flyToNextRandomPoint();

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [isMap]);

  // Frequent playful cursor / page chomp loop across the site
  useEffect(() => {
    if (pathname === '/') return;

    let cancelled = false;
    let scheduleTimer: number;

    function triggerRandomChomp() {
      if (cancelled) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const biteCursor = Math.random() < 0.65;

      const targetX = biteCursor
        ? Math.min(Math.max(cursorRef.current.x - 42, 24), vw - 110)
        : Math.random() < 0.5
        ? Math.round(80 + Math.random() * (vw - 200))
        : vw - 105;

      const targetY = biteCursor
        ? Math.min(Math.max(cursorRef.current.y - 42, 64), vh - 110)
        : Math.round(110 + Math.random() * (vh - 220));

      isBitingRef.current = true;
      setGlideDuration(620);
      setPos((prev) => ({
        x: targetX,
        y: targetY,
        flipX: targetX < (prev ? prev.x : 30),
        tilt: -14,
      }));

      // Snap jaws upon arrival
      window.setTimeout(() => {
        if (cancelled) return;
        setBiting(true);
        setPos((prev) => (prev ? { ...prev, tilt: 12 } : prev));
        playPlushieSqueak(1.05, true);

        document.body.classList.remove('citadel-chomp-shake');
        void document.body.offsetWidth;
        document.body.classList.add('citadel-chomp-shake');

        const markId = Date.now() + Math.random();
        setBiteMarks((prev) => [
          ...prev.slice(-3),
          {
            id: markId,
            x: targetX + 36,
            y: targetY + 38,
            rotate: Math.round(-25 + Math.random() * 50),
          },
        ]);

        window.setTimeout(() => {
          setBiteMarks((prev) => prev.filter((m) => m.id !== markId));
        }, 3200);

        const line = CHOMP_LINES[Math.floor(Math.random() * CHOMP_LINES.length)];
        setBubble(line);
        if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = window.setTimeout(() => setBubble(null), 1800);
      }, 640);

      // Release bite and return to normal patrol / corner
      window.setTimeout(() => {
        if (cancelled) return;
        setBiting(false);
        isBitingRef.current = false;
        if (!window.location.pathname.startsWith('/map')) {
          setGlideDuration(850);
          setPos({ x: 16, y: vh - 112, flipX: false, tilt: 0 });
          window.setTimeout(() => {
            if (!isBitingRef.current && !window.location.pathname.startsWith('/map')) {
              setPos(null);
            }
          }, 900);
        }
      }, 1750);

      // Next chomp in 8–15 seconds
      const nextDelay = Math.round(8000 + Math.random() * 7000);
      scheduleTimer = window.setTimeout(triggerRandomChomp, nextDelay);
    }

    scheduleTimer = window.setTimeout(triggerRandomChomp, 6500);

    return () => {
      cancelled = true;
      window.clearTimeout(scheduleTimer);
    };
  }, [pathname]);

  useEffect(() => {
    function handleEvent(e: Event) {
      const custom = e as CustomEvent<{ action?: string; message?: string }>;
      if (custom.detail?.action === 'fire') {
        setBreathingFire(true);
        window.setTimeout(() => setBreathingFire(false), 950);
      }
      if (custom.detail?.message) {
        setBubble(custom.detail.message);
        if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = window.setTimeout(() => setBubble(null), 2200);
      }
    }
    window.addEventListener('citadel:plushie', handleEvent);
    return () => {
      window.removeEventListener('citadel:plushie', handleEvent);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  function handleClick() {
    const nextColor = (colorIdx + 1) % PLUSHIE_PALETTES.length;
    const nextCount = squishCount + 1;
    setColorIdx(nextColor);
    setSquishCount(nextCount);
    setSquishing(true);

    if (nextCount % 4 === 0) {
      setBreathingFire(true);
      window.setTimeout(() => setBreathingFire(false), 900);
    }

    window.setTimeout(() => setSquishing(false), 260);
    playPlushieSqueak(0.92 + nextColor * 0.05);

    const line = SQUEAK_LINES[nextCount % SQUEAK_LINES.length];
    setBubble(`${PLUSHIE_PALETTES[nextColor].name}: ${line}`);
    if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => setBubble(null), 1900);
  }

  const palette = PLUSHIE_PALETTES[colorIdx];
  const imgSrc = biting
    ? '/assets/plushie/dragon-bite.png'
    : breathingFire || isQuiz
    ? '/assets/plushie/dragon-fire.png'
    : isMap
    ? '/assets/plushie/dragon-flying.png'
    : '/assets/plushie/dragon-idle.png';

  const isRoaming = pos !== null;

  return (
    <>
      {/* Temporary dragon bite marks left on the page */}
      {biteMarks.map((mark) => (
        <div
          key={mark.id}
          style={{
            left: `${mark.x}px`,
            top: `${mark.y}px`,
            transform: `rotate(${mark.rotate}deg)`,
          }}
          className="pointer-events-none fixed z-30 transition-opacity duration-1000 opacity-85"
        >
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path
              d="M9 14 C14 7, 28 7, 33 14"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
            <path
              d="M9 28 C14 35, 28 35, 33 28"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}

      <div
        style={
          isRoaming
            ? {
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transitionProperty: 'left, top, transform',
                transitionDuration: `${glideDuration}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              }
            : undefined
        }
        className={isRoaming ? 'fixed z-40' : 'fixed bottom-4 left-4 z-40'}
      >
        <div className="relative flex flex-col items-start">
          {bubble && (
            <div className="mb-1.5 px-2.5 py-1 rounded-sm bg-[#1f0d06]/95 border border-amber-500/50 text-[11px] text-amber-100 shadow-lg whitespace-nowrap pointer-events-none">
              {bubble}
            </div>
          )}

          {isJukebox && !isRoaming && (
            <div className="relative w-full h-4 pointer-events-none">
              <span className="anim-note-float absolute left-3 top-0 text-xs text-amber-300">♪</span>
              <span
                className="anim-note-float absolute left-9 top-0 text-xs text-amber-400"
                style={{ animationDelay: '0.6s' }}
              >
                ♫
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleClick}
            title={`Click to squish & change plushie color (${palette.name})`}
            className={`group relative cursor-pointer focus:outline-none transition-transform duration-200 ${
              squishing
                ? 'scale-x-125 scale-y-75'
                : biting
                ? 'scale-125'
                : 'hover:scale-105'
            } ${isJukebox && !isRoaming ? 'anim-plushie-dance' : ''}`}
          >
            <img
              src={imgSrc}
              alt="Interactive Dragon Plushie"
              style={{
                filter: palette.filter,
                transform: isRoaming
                  ? `scaleX(${pos.flipX ? -1 : 1}) rotate(${pos.tilt}deg)`
                  : undefined,
                transition: 'transform 450ms ease',
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.85)] select-none"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('dragon-bite.png')) {
                  target.src = '/assets/plushie/dragon-fire.png';
                } else if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = '/assets/plushie/dragon-idle.png';
                }
              }}
            />
          </button>

          {!isRoaming && (
            <button
              type="button"
              onClick={handleClick}
              className={`mt-1 px-2 py-0.5 rounded-full border text-[10px] tracking-wide cursor-pointer ${palette.badge}`}
            >
              {palette.name} · {squishCount}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
