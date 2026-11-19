'use client';

import React, { useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BookDown,
  Search,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface ProfileItem {
  id: string;
  name: string;
  nickname: string | null;
  branch: string;
  signed_portrait_url: string | null;
  house_name: string;
  house_words: string;
  sigil: string;
  college_memory: string;
  junior_advice: string;
  apocalypse_ally: string;
}

function getSigilPath(houseName: string) {
  const key = houseName.replace(/^House\s+/i, '').trim().toLowerCase();
  return `/assets/sigil/${key}.png`;
}

// Synthesized crisp paper-turn sound (zero external MP3 dependencies)
function playPageFlipSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const duration = 0.22;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.25;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(0.9, ctx.currentTime);

    noise.connect(filter);
    filter.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore autoplay blocks
  }
}

function buildCoverHtml(
  origin: string,
  title: string,
  subtitle: string,
  isBack = false
) {
  return `
    <div style="width: 520px; height: 718px; position: relative; overflow: hidden; box-sizing: border-box; padding: 34px; color: #f3d99e; font-family: Georgia, serif; border: 4px solid #2b1208; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      <img src="${origin}/assets/leather.jpg" crossorigin="anonymous" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" />
      <div style="position: absolute; inset: 0; box-shadow: inset 24px 0 36px rgba(0,0,0,0.75), inset -8px 0 18px rgba(0,0,0,0.55); z-index: 1;"></div>
      <img src="${origin}/assets/corner-ornament.png" crossorigin="anonymous" style="position: absolute; top: 14px; left: 14px; width: 64px; height: 64px; opacity: 0.9; z-index: 2;" />
      <img src="${origin}/assets/corner-ornament.png" crossorigin="anonymous" style="position: absolute; top: 14px; right: 14px; width: 64px; height: 64px; opacity: 0.9; transform: scaleX(-1); z-index: 2;" />
      <img src="${origin}/assets/corner-ornament.png" crossorigin="anonymous" style="position: absolute; bottom: 14px; left: 14px; width: 64px; height: 64px; opacity: 0.9; transform: scaleY(-1); z-index: 2;" />
      <img src="${origin}/assets/corner-ornament.png" crossorigin="anonymous" style="position: absolute; bottom: 14px; right: 14px; width: 64px; height: 64px; opacity: 0.9; transform: scale(-1, -1); z-index: 2;" />
      <div style="position: relative; z-index: 3; width: 100%; height: 100%; border: 2px solid rgba(212, 175, 55, 0.75); outline: 1px solid rgba(212, 175, 55, 0.35); outline-offset: -8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; box-sizing: border-box; background: rgba(18, 7, 3, 0.35);">
        ${
          !isBack
            ? `<p style="margin: 0 0 18px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #f5d896;">Easwari Engineering College • Batch of 2027</p>`
            : ''
        }
        <h1 style="margin: 0 0 16px; font-size: 30px; letter-spacing: 5px; text-transform: uppercase; color: #f5d896; text-shadow: 0 2px 6px rgba(0,0,0,0.9); line-height: 1.35;">${title}</h1>
        <div style="width: 110px; height: 2px; background-color: #c59b43; margin: 10px 0 18px;"></div>
        <p style="margin: 0; font-style: italic; font-size: 16px; color: #e6c680; letter-spacing: 1px;">${subtitle}</p>
        ${
          !isBack
            ? `<p style="margin-top: 36px; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(230, 198, 128, 0.8);">Lineages &amp; Histories of the Batch</p>`
            : ''
        }
      </div>
    </div>
  `;
}

function buildChronicleHtml(
  origin: string,
  profile: ProfileItem,
  pageNumber: number
) {
  const sigilUrl = `${origin}${getSigilPath(profile.house_name)}`;
  const memoryText = profile.college_memory || '';
  const firstChar = memoryText.charAt(0);
  const restText = memoryText.slice(1);

  return `
    <div style="width: 520px; height: 718px; position: relative; overflow: hidden; box-sizing: border-box; padding: 28px; color: #24140c; font-family: Georgia, serif; display: flex; flex-direction: column; justify-content: space-between;">
      <img src="${origin}/assets/parchment.jpg" crossorigin="anonymous" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" />
      <div style="position: absolute; inset: 0; box-shadow: inset 0 0 55px rgba(72, 36, 12, 0.45); z-index: 1;"></div>
      <img src="${sigilUrl}" crossorigin="anonymous" style="position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%); width: 270px; height: 270px; object-fit: contain; opacity: 0.11; z-index: 1;" />

      <div style="position: relative; z-index: 2; width: 100%; height: 100%; border: 1px solid rgba(92, 48, 20, 0.5); outline: 1px solid rgba(92, 48, 20, 0.25); outline-offset: -5px; padding: 18px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(92, 48, 20, 0.55); padding-bottom: 12px; margin-bottom: 14px;">
            <div>
              <h2 style="margin: 0; font-size: 24px; color: #1f1008; letter-spacing: 1px;">${profile.name}</h2>
              ${
                profile.nickname
                  ? `<p style="margin: 3px 0 0; font-style: italic; font-size: 13px; color: #5c3118;">"${profile.nickname}"</p>`
                  : ''
              }
              <p style="margin: 5px 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #6e3a19; font-weight: bold;">${profile.branch}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; text-align: right;">
              <div>
                <div style="font-weight: bold; font-size: 15px; color: #1f1008;">${profile.house_name}</div>
                <div style="font-size: 11px; font-style: italic; color: #6e3a19;">"${profile.house_words}"</div>
              </div>
              <img src="${sigilUrl}" crossorigin="anonymous" style="width: 82px; height: 82px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));" />
            </div>
          </div>

          ${
            profile.signed_portrait_url
              ? `<div style="text-align: center; margin: 10px 0 14px;">
                   <img src="${profile.signed_portrait_url}" crossorigin="anonymous" style="width: 125px; height: 125px; object-fit: cover; border: 3px double #5c3118; padding: 2px; background: #e8d5b0;" />
                 </div>`
              : ''
          }

          <div style="font-size: 15px; line-height: 1.75; color: #24140c; text-align: justify; margin-top: 10px; white-space: pre-line;">
            <span style="float: left; font-size: 44px; line-height: 0.85; padding-right: 7px; padding-top: 4px; font-weight: bold; color: #6e2612;">${firstChar}</span>${restText}
          </div>
        </div>

        <div>
          <div style="border-top: 1px solid rgba(92, 48, 20, 0.45); padding-top: 10px; font-size: 13px; color: #3b1e0e; line-height: 1.55;">
            <p style="margin: 0 0 5px;"><strong>Counsel to Juniors:</strong> ${profile.junior_advice}</p>
            <p style="margin: 0;"><strong>Sworn Ally in the Long Night:</strong> ${profile.apocalypse_ally}</p>
          </div>
          <div style="text-align: center; margin-top: 10px; font-size: 11px; letter-spacing: 2px; color: #5c3118;">
            — ${pageNumber} —
          </div>
        </div>
      </div>
    </div>
  `;
}

const CoverPage = React.forwardRef<
  HTMLDivElement,
  { title: string; subtitle: string; isBack?: boolean }
>(({ title, subtitle, isBack }, ref) => (
  <div ref={ref} className="w-full h-full select-none">
    <div className="relative w-full h-full flex flex-col items-center justify-center p-7 text-center overflow-hidden border-4 border-[#2a1107]">
      <img
        src="/assets/leather.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div
        style={{
          boxShadow:
            'inset 26px 0 42px rgba(0,0,0,0.85), inset -8px 0 18px rgba(0,0,0,0.65)',
        }}
        className="absolute inset-0 pointer-events-none"
      />
      <div
        style={{
          left: isBack ? 'auto' : '18px',
          right: isBack ? '18px' : 'auto',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.85), rgba(255,220,160,0.1), rgba(0,0,0,0.45))',
        }}
        className="absolute top-0 bottom-0 w-1.5 pointer-events-none z-10"
      />

      <img
        src="/assets/corner-ornament.png"
        alt=""
        className="absolute top-3 left-3 w-14 h-14 opacity-90 pointer-events-none z-10"
      />
      <img
        src="/assets/corner-ornament.png"
        alt=""
        className="absolute top-3 right-3 w-14 h-14 opacity-90 scale-x-[-1] pointer-events-none z-10"
      />
      <img
        src="/assets/corner-ornament.png"
        alt=""
        className="absolute bottom-3 left-3 w-14 h-14 opacity-90 scale-y-[-1] pointer-events-none z-10"
      />
      <img
        src="/assets/corner-ornament.png"
        alt=""
        className="absolute bottom-3 right-3 w-14 h-14 opacity-90 scale-[-1] pointer-events-none z-10"
      />

      <div
        style={{
          border: '2px solid rgba(212, 175, 55, 0.75)',
          outline: '1px solid rgba(212, 175, 55, 0.35)',
          outlineOffset: '-7px',
          background: 'rgba(18, 7, 3, 0.35)',
        }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6"
      >
        {!isBack && (
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/90 font-bold">
              Easwari Engineering College
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 mt-0.5">
              Batch of 2027
            </p>
          </div>
        )}

        <h2
          style={{
            color: '#f5d896',
            textShadow: '0 2px 6px rgba(0,0,0,0.95)',
            fontFamily: 'var(--font-cinzel), Georgia, serif',
          }}
          className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase mb-3 leading-snug"
        >
          {title}
        </h2>
        <div
          style={{ backgroundColor: '#c59b43' }}
          className="w-24 h-[2px] my-3 opacity-85"
        />
        <p
          style={{ color: '#e6c680', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          className="italic text-sm tracking-wider"
        >
          {subtitle}
        </p>
        {!isBack && (
          <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-amber-200/80">
            Lineages &amp; Histories of the Batch
          </p>
        )}
      </div>
    </div>
  </div>
));
CoverPage.displayName = 'CoverPage';

const TocPage = React.forwardRef<
  HTMLDivElement,
  { profiles: ProfileItem[]; onJump: (bookIndex: number) => void }
>(({ profiles, onJump }, ref) => (
  <div
    ref={ref}
    className="w-full h-full"
    onMouseDownCapture={(e) => e.stopPropagation()}
    onPointerDownCapture={(e) => e.stopPropagation()}
    onTouchStartCapture={(e) => e.stopPropagation()}
  >
    <div className="relative w-full h-full p-5 flex flex-col justify-between overflow-hidden text-[#24140c]">
      <img
        src="/assets/parchment.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div
        style={{
          boxShadow:
            'inset 0 0 55px rgba(72, 36, 12, 0.45), inset 16px 0 24px rgba(0,0,0,0.2)',
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <div
        style={{
          border: '1px solid rgba(92, 48, 20, 0.5)',
          outline: '1px solid rgba(92, 48, 20, 0.25)',
          outlineOffset: '-5px',
        }}
        className="relative z-10 w-full h-full p-4 flex flex-col"
      >
        <h3
          style={{ fontFamily: 'var(--font-cinzel), Georgia, serif' }}
          className="text-xl font-bold text-center tracking-[0.2em] uppercase text-[#1f1008] border-b-2 border-[#5c3118]/50 pb-2 mb-3"
        >
          Contents
        </h3>
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-sm">
          {profiles.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onJump(idx + 2);
              }}
              className="w-full flex items-baseline justify-between text-left hover:text-[#6e2612] border-b border-dotted border-[#5c3118]/40 pb-1 cursor-pointer"
            >
              <span className="font-semibold truncate pr-2">
                {p.name}{' '}
                <span className="text-[10px] font-normal italic text-[#5c3118]">
                  ({p.house_name.replace('House ', '')})
                </span>
              </span>
              <span className="shrink-0 text-[11px] font-bold text-[#6e2612]">
                {idx + 1}
              </span>
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] tracking-widest text-[#5c3118] pt-2">
          — Index —
        </p>
      </div>
    </div>
  </div>
));
TocPage.displayName = 'TocPage';

const ChroniclePage = React.forwardRef<
  HTMLDivElement,
  { profile: ProfileItem; pageNumber: number }
>(({ profile, pageNumber }, ref) => {
  const [exporting, setExporting] = useState(false);

  async function handleDownloadSinglePdf(e: React.MouseEvent) {
    e.stopPropagation();
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const container = document.createElement('div');
      container.style.margin = '0';
      container.style.padding = '0';
      container.innerHTML = buildChronicleHtml(
        window.location.origin,
        profile,
        pageNumber
      );

      await html2pdf()
        .set({
          margin: 0,
          filename: `${profile.name.replace(/\s+/g, '_')}_Chronicle.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            onclone: (clonedDoc: Document) => {
              clonedDoc
                .querySelectorAll('style, link[rel="stylesheet"]')
                .forEach((el) => el.remove());
            },
          },
          jsPDF: {
            unit: 'px',
            format: [520, 720],
            orientation: 'portrait',
          },
        })
        .from(container)
        .save();
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Could not generate PDF.');
    } finally {
      setExporting(false);
    }
  }

  const memory = profile.college_memory || '';
  const firstLetter = memory.charAt(0);
  const restMemory = memory.slice(1);
  const sigilPath = getSigilPath(profile.house_name);

  return (
    <div ref={ref} className="w-full h-full">
      <div className="relative w-full h-full p-5 flex flex-col justify-between overflow-hidden text-[#24140c]">
        <img
          src="/assets/parchment.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div
          style={{
            boxShadow:
              'inset 0 0 55px rgba(72, 36, 12, 0.45), inset 16px 0 24px rgba(0,0,0,0.2)',
          }}
          className="absolute inset-0 pointer-events-none"
        />
        <img
          src={sigilPath}
          alt=""
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 object-contain opacity-[0.11] pointer-events-none select-none"
        />

        <div
          style={{
            border: '1px solid rgba(92, 48, 20, 0.5)',
            outline: '1px solid rgba(92, 48, 20, 0.25)',
            outlineOffset: '-5px',
          }}
          className="relative z-10 w-full h-full p-4 flex flex-col justify-between"
        >
          <div className="flex-1 overflow-y-auto pr-1">
            <div
              style={{ borderColor: 'rgba(92, 48, 20, 0.5)' }}
              className="flex items-center justify-between border-b-2 pb-2.5 mb-3 gap-2"
            >
              <div>
                <h3 className="text-xl font-bold leading-tight text-[#1f1008]">
                  {profile.name}
                </h3>
                {profile.nickname && (
                  <p className="italic text-xs text-[#5c3118]">
                    &ldquo;{profile.nickname}&rdquo;
                  </p>
                )}
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#6e3a19] mt-0.5">
                  {profile.branch}
                </p>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0">
                <div>
                  <span className="font-bold text-xs block text-[#1f1008]">
                    {profile.house_name}
                  </span>
                  <span className="text-[10px] italic text-[#6e3a19] block">
                    &ldquo;{profile.house_words}&rdquo;
                  </span>
                </div>
                <img
                  src={sigilPath}
                  alt={profile.house_name}
                  className="w-20 h-20 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            {profile.signed_portrait_url && (
              <div className="flex justify-center my-2.5">
                <img
                  src={profile.signed_portrait_url}
                  alt={profile.name}
                  crossOrigin="anonymous"
                  className="w-24 h-24 object-cover border-2 border-[#5c3118] p-0.5 bg-[#e8d5b0] shadow-md sepia-[.25]"
                />
              </div>
            )}

            <p className="text-sm md:text-[15px] leading-relaxed text-justify whitespace-pre-line mt-2 text-[#24140c]">
              <span className="float-left text-4xl leading-[0.82] pr-2 pt-1 font-bold text-[#6e2612]">
                {firstLetter}
              </span>
              {restMemory}
            </p>
          </div>

          <div>
            <div
              style={{ borderColor: 'rgba(92, 48, 20, 0.4)' }}
              className="border-t pt-2 space-y-1.5 text-xs md:text-[13px] text-[#3b1e0e]"
            >
              <p>
                <strong>Counsel to Juniors:</strong> {profile.junior_advice}
              </p>
              <p>
                <strong>Sworn Ally:</strong> {profile.apocalypse_ally}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 mt-1 text-[11px]">
              <span className="tracking-widest text-[#5c3118]">
                — {pageNumber} —
              </span>
              <button
                type="button"
                onMouseDownCapture={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
                onTouchStartCapture={(e) => e.stopPropagation()}
                onClick={handleDownloadSinglePdf}
                disabled={exporting}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#5c3118] hover:bg-[#432210] text-amber-100 rounded-sm uppercase tracking-wider text-[10px] cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {exporting ? 'Sealing...' : 'Page PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ChroniclePage.displayName = 'ChroniclePage';

export default function FlipbookClient({
  profiles,
}: {
  profiles: ProfileItem[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [exportingBook, setExportingBook] = useState(false);
  const [search, setSearch] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [ambienceOn, setAmbienceOn] = useState(false);
  const ambienceCtxRef = useRef<AudioContext | null>(null);

  // House Leaderboard tally
  const houseCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of profiles) {
      map[p.house_name] = (map[p.house_name] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [profiles]);

  const searchMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return profiles
      .map((p, idx) => ({ profile: p, bookIndex: idx + 2 }))
      .filter(
        ({ profile }) =>
          profile.name.toLowerCase().includes(q) ||
          profile.branch.toLowerCase().includes(q) ||
          profile.house_name.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [search, profiles]);

  function jumpToPage(bookIndex: number) {
    const pf = bookRef.current?.pageFlip();
    if (!pf) return;
    if (typeof pf.flip === "function") {
      pf.flip(bookIndex, "top");
    } else if (typeof pf.turnToPage === "function") {
      pf.turnToPage(bookIndex);
    }
    setSearch('');
  }

  function toggleAmbience() {
    if (ambienceOn) {
      ambienceCtxRef.current?.close();
      ambienceCtxRef.current = null;
      setAmbienceOn(false);
      return;
    }
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.35;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      source.connect(filter);
      filter.connect(ctx.destination);
      source.start();

      ambienceCtxRef.current = ctx;
      setAmbienceOn(true);
    } catch {
      // Ignore audio errors
    }
  }

  async function handleDownloadFullBook() {
    setExportingBook(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const origin = window.location.origin;

      const wrapper = document.createElement('div');
      wrapper.style.margin = '0';
      wrapper.style.padding = '0';

      const allPages = [
        buildCoverHtml(
          origin,
          'The Citadel Chronicles',
          'Records of the Great Houses'
        ),
        ...profiles.map((p, idx) => buildChronicleHtml(origin, p, idx + 1)),
        buildCoverHtml(origin, 'Finis', 'What is dead may never die.', true),
      ];

      wrapper.innerHTML = allPages
        .map((html, idx) =>
          idx < allPages.length - 1
            ? `<div style="page-break-after: always; margin: 0; padding: 0;">${html}</div>`
            : `<div style="margin: 0; padding: 0;">${html}</div>`
        )
        .join('');

      await html2pdf()
        .set({
          margin: 0,
          filename: 'EEC_2027_Citadel_Chronicles_Complete.pdf',
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            onclone: (clonedDoc: Document) => {
              clonedDoc
                .querySelectorAll('style, link[rel="stylesheet"]')
                .forEach((el) => el.remove());
            },
          },
          jsPDF: {
            unit: 'px',
            format: [520, 720],
            orientation: 'portrait',
          },
        })
        .from(wrapper)
        .save();
    } catch (err) {
      console.error('Full book PDF export failed:', err);
      alert('Could not compile the full book PDF.');
    } finally {
      setExportingBook(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* House Leaderboard + Quick Search Bar */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-5 bg-black/55 backdrop-blur-sm border border-amber-700/40 px-4 py-3 rounded-sm">
        {/* Leaderboard */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="uppercase tracking-widest text-amber-300/80 font-bold mr-1">
            Houses:
          </span>
          {houseCounts.map(([house, count]) => (
            <button
              key={house}
              type="button"
              onClick={() => setSearch(house.replace('House ', ''))}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a1208]/90 hover:bg-[#421d0d] border border-amber-700/40 text-amber-100 rounded-sm cursor-pointer"
            >
              <img
                src={getSigilPath(house)}
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span>{house.replace('House ', '')}</span>
              <span className="text-amber-400 font-bold">{count}</span>
            </button>
          ))}
        </div>

        {/* Quick Jump Search & Audio Toggles */}
        <div className="flex items-center gap-2 w-full md:w-auto relative">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-amber-400/70 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Jump to classmate or House..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 border border-amber-700/50 text-amber-100 text-xs rounded-sm focus:outline-none focus:border-amber-400"
            />
            {searchMatches.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#1f0d06] border border-amber-600/50 shadow-2xl z-50 rounded-sm overflow-hidden">
                {searchMatches.map(({ profile, bookIndex }) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => jumpToPage(bookIndex)}
                    className="w-full px-3 py-2 text-left text-xs text-amber-100 hover:bg-amber-900/60 flex justify-between items-center cursor-pointer border-b border-amber-900/40 last:border-0"
                  >
                    <span>{profile.name}</span>
                    <span className="text-[10px] text-amber-300/80">
                      {profile.house_name.replace('House ', '')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSoundOn((s) => !s)}
            title={soundOn ? 'Mute page flip sound' : 'Unmute page flip sound'}
            className="p-1.5 bg-[#2a1208] border border-amber-700/50 text-amber-200 hover:bg-[#3f1c0d] rounded-sm cursor-pointer"
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleAmbience}
            className={`px-2.5 py-1.5 text-[10px] uppercase tracking-wider border rounded-sm cursor-pointer ${
              ambienceOn
                ? 'bg-amber-700 border-amber-400 text-amber-50'
                : 'bg-[#2a1208] border-amber-700/50 text-amber-200/80'
            }`}
          >
            {ambienceOn ? '🔥 Hearth On' : '🔥 Hearth'}
          </button>
        </div>
      </div>

      {/* Wooden Desk Slab holding the Leather Book + Quill */}
      <div
        style={{
          backgroundImage: `radial-gradient(ellipse at center, rgba(20, 10, 5, 0.25) 0%, rgba(10, 4, 2, 0.78) 100%), url('/assets/wood-desk.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow:
            '0 30px 90px rgba(0,0,0,0.95), inset 0 0 30px rgba(0,0,0,0.75)',
        }}
        className="relative w-full flex justify-center py-8 px-4 rounded-sm border-2 border-[#3d1c0c]"
      >
        <img
          src="/assets/quill-ink.png"
          alt="Maester's Quill and Inkwell"
          className="hidden xl:block absolute right-4 bottom-6 w-36 pointer-events-none select-none drop-shadow-[0_18px_25px_rgba(0,0,0,0.9)] z-20"
        />

        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={580}
          size="fixed"
          minWidth={320}
          maxWidth={460}
          minHeight={480}
          maxHeight={620}
          showCover={true}
          mobileScrollSupport={true}
          className="shadow-[0_30px_80px_rgba(0,0,0,0.95)]"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={750}
          usePortrait={false}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.65}
          showPageCorners={true}
          disableFlipByClick={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={120}
          onFlip={() => {
            if (soundOn) playPageFlipSound();
          }}
        >
          <CoverPage
            title="The Citadel Chronicles"
            subtitle="Records of the Great Houses"
          />

          <TocPage profiles={profiles} onJump={jumpToPage} />

          {profiles.map((p, idx) => (
            <ChroniclePage key={p.id} profile={p} pageNumber={idx + 1} />
          ))}

          <CoverPage
            title="Finis"
            subtitle="What is dead may never die."
            isBack
          />
        </HTMLFlipBook>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2a1208]/90 hover:bg-[#3f1c0d] border border-amber-600/40 text-amber-200 text-xs uppercase tracking-widest cursor-pointer transition-colors shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Prev Page
        </button>

        <button
          onClick={() => jumpToPage(1)}
          className="px-4 py-2.5 bg-[#2a1208]/90 hover:bg-[#3f1c0d] border border-amber-600/40 text-amber-200 text-xs uppercase tracking-widest cursor-pointer transition-colors shadow-lg"
        >
          Contents
        </button>

        <button
          onClick={handleDownloadFullBook}
          disabled={exportingBook}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 border border-amber-400/50 text-amber-50 text-xs uppercase tracking-widest font-bold cursor-pointer transition-colors shadow-lg"
        >
          <BookDown className="w-4 h-4" />
          {exportingBook
            ? 'Binding Full Tome...'
            : 'Download Complete Book (PDF)'}
        </button>

        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2a1208]/90 hover:bg-[#3f1c0d] border border-amber-600/40 text-amber-200 text-xs uppercase tracking-widest cursor-pointer transition-colors shadow-lg"
        >
          Next Page <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
