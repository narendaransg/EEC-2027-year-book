'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Download, RotateCcw, Sparkles } from 'lucide-react';

export type ForgedCardData = {
  name: string;
  branch: string;
  houseName: string;
  houseWords: string;
  sigil: string;
};

type CardThemeId = 'valyrian' | 'parchment' | 'dragonfire';
type AspectId = 'square' | 'story';

const THEMES: {
  id: CardThemeId;
  label: string;
  subtitle: string;
}[] = [
  {
    id: 'valyrian',
    label: 'Valyrian Steel & Gold',
    subtitle: 'Obsidian Damascus metal + champagne gold foil',
  },
  {
    id: 'parchment',
    label: 'Royal Parchment',
    subtitle: 'Warm Citadel vellum + crimson wax seal',
  },
  {
    id: 'dragonfire',
    label: 'Dragonfire & Ember',
    subtitle: 'Smoldering ember glow + Valyrian flame',
  },
];

function houseSlug(houseName: string) {
  return houseName
    .toLowerCase()
    .replace(/^house\s+/, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim() || 'stark';
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function HouseCardStudio({
  data,
  onReset,
}: {
  data: ForgedCardData;
  onReset: () => void;
}) {
  const [theme, setTheme] = useState<CardThemeId>('valyrian');
  const [aspect, setAspect] = useState<AspectId>('square');
  const [customMotto, setCustomMotto] = useState(data.houseWords);
  const [customTitle, setCustomTitle] = useState(
    `${data.branch.toUpperCase()} • BATCH OF 2027`
  );
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCustomMotto(data.houseWords);
    setCustomTitle(`${data.branch.toUpperCase()} • BATCH OF 2027`);
  }, [data]);

  async function renderToCanvas(targetAspect: AspectId) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 1080;
    const height = targetAspect === 'square' ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const slug = houseSlug(data.houseName);
    const [crestImg, valyrianImg, foilImg, dividerImg, sealGoldImg, sealRedImg] =
      await Promise.all([
        loadImage(`/assets/crests/${slug}.png`),
        loadImage('/assets/valyrian-texture.jpg'),
        loadImage('/assets/gold-foil-grain.png'),
        loadImage('/assets/scroll-divider.png'),
        loadImage('/assets/wax-seal-gold.png'),
        loadImage('/assets/wax-seal-crimson.png'),
      ]);

    // 1. Base background per theme
    if (theme === 'valyrian') {
      if (valyrianImg) {
        ctx.drawImage(valyrianImg, 0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f1218');
        grad.addColorStop(1, '#1d160c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.fillStyle = 'rgba(9, 11, 16, 0.52)';
      ctx.fillRect(0, 0, width, height);
    } else if (theme === 'parchment') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f3e5c2');
      grad.addColorStop(0.55, '#e7d2a2');
      grad.addColorStop(1, '#cfa968');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        80,
        width * 0.5,
        height * 0.5,
        width * 0.9
      );
      grad.addColorStop(0, '#4c0d09');
      grad.addColorStop(0.55, '#1d0705');
      grad.addColorStop(1, '#090303');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Gold foil shimmer overlay
    if (foilImg) {
      ctx.save();
      ctx.globalAlpha = theme === 'parchment' ? 0.14 : 0.24;
      ctx.drawImage(foilImg, 0, 0, width, height);
      ctx.restore();
    }

    // 3. Ornate frame border
    const pad = 54;
    const isLight = theme === 'parchment';
    ctx.strokeStyle = isLight ? '#7c2d12' : 'rgba(251, 191, 36, 0.72)';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    ctx.strokeStyle = isLight ? 'rgba(124, 45, 18, 0.35)' : 'rgba(251, 191, 36, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2);

    const centerYOffset = targetAspect === 'story' ? 220 : 0;

    // 4. Header label
    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#7c2d12' : '#fbbf24';
    ctx.font = 'bold 24px Cinzel, Georgia, serif';
    ctx.fillText('THE CITADEL CHRONICLES • GREAT HOUSE CARD', width / 2, 130 + centerYOffset * 0.5);

    // 5. Crest graphic
    const crestSize = 270;
    const crestY = 185 + centerYOffset * 0.65;
    if (crestImg) {
      ctx.drawImage(
        crestImg,
        width / 2 - crestSize / 2,
        crestY,
        crestSize,
        crestSize
      );
    }

    const textStartY = crestY + crestSize + 68;

    // 6. House name & sigil
    ctx.fillStyle = isLight ? '#451a03' : '#fef3c7';
    ctx.font = 'bold 54px Cinzel, Georgia, serif';
    ctx.fillText(data.houseName.toUpperCase(), width / 2, textStartY);

    ctx.fillStyle = isLight ? '#92400e' : '#fcd34d';
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText(`“${customMotto}”`, width / 2, textStartY + 52);

    // 7. Filigree divider
    if (dividerImg) {
      ctx.drawImage(dividerImg, width / 2 - 230, textStartY + 78, 460, 42);
    }

    // 8. Student Name & Department
    ctx.fillStyle = isLight ? '#1c1917' : '#ffffff';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.fillText(data.name, width / 2, textStartY + 185);

    ctx.fillStyle = isLight ? '#78350f' : '#fde68a';
    ctx.font = '24px Cinzel, Georgia, serif';
    ctx.fillText(customTitle, width / 2, textStartY + 232);

    // 9. Wax seal stamp at bottom
    const sealImg = isLight ? sealRedImg : sealGoldImg;
    if (sealImg) {
      const sealSize = 92;
      ctx.drawImage(
        sealImg,
        width / 2 - sealSize / 2,
        height - 175,
        sealSize,
        sealSize
      );
    }
  }

  useEffect(() => {
    renderToCanvas(aspect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, aspect, customMotto, customTitle, data]);

  async function handleDownloadPng() {
    setExporting(true);
    await renderToCanvas(aspect);
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      const cleanName = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanName}-${houseSlug(data.houseName)}-${aspect}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    setExporting(false);
    window.dispatchEvent(
      new CustomEvent('citadel:plushie', {
        detail: {
          action: 'fire',
          message: `Forged ${aspect === 'story' ? 'Story' : 'Square'} House Card!`,
        },
      })
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-7 rounded-sm bg-[#1c0d06]/95 border border-amber-500/45 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-700/40 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> House Card Forge Studio
          </span>
          <h2 className="text-2xl text-amber-100 mt-0.5">
            {data.name} — {data.houseName}
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-black/60 hover:bg-black/80 border border-amber-600/40 text-xs text-amber-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Claim / Lookup Another</span>
        </button>
      </div>

      {/* Theme Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`p-3.5 rounded-sm text-left border transition-all cursor-pointer ${
              theme === t.id
                ? 'bg-amber-800/80 border-amber-300 text-amber-50 shadow-lg'
                : 'bg-black/50 border-amber-800/40 text-amber-200/80 hover:border-amber-600/60'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">{t.label}</div>
            <div className="text-[11px] opacity-80 mt-1">{t.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Format & Text Tweaks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-amber-300/85 mb-1">
            Card Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAspect('square')}
              className={`py-2 px-3 rounded-sm text-xs border cursor-pointer ${
                aspect === 'square'
                  ? 'bg-amber-700 border-amber-300 text-white font-bold'
                  : 'bg-black/50 border-amber-800/40 text-amber-200/80'
              }`}
            >
              Square (1:1)
            </button>
            <button
              type="button"
              onClick={() => setAspect('story')}
              className={`py-2 px-3 rounded-sm text-xs border cursor-pointer ${
                aspect === 'story'
                  ? 'bg-amber-700 border-amber-300 text-white font-bold'
                  : 'bg-black/50 border-amber-800/40 text-amber-200/80'
              }`}
            >
              Story (9:16)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-amber-300/85 mb-1">
            House Motto
          </label>
          <input
            value={customMotto}
            onChange={(e) => setCustomMotto(e.target.value)}
            maxLength={70}
            className="w-full px-3 py-2 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-amber-300/85 mb-1">
            Subtitle / Dept Line
          </label>
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            maxLength={70}
            className="w-full px-3 py-2 rounded-sm bg-black/65 border border-amber-700/50 text-amber-50 text-xs"
          />
        </div>
      </div>

      {/* Live Canvas Preview */}
      <div className="flex flex-col items-center bg-black/60 p-4 rounded-sm border border-amber-800/40">
        <canvas
          ref={canvasRef}
          className={`rounded-sm shadow-2xl border border-amber-500/30 ${
            aspect === 'square'
              ? 'w-full max-w-[380px] aspect-square'
              : 'w-full max-w-[270px] aspect-[9/16]'
          }`}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={exporting}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-6 py-3 rounded-sm uppercase tracking-widest text-xs font-bold border border-amber-300/50 shadow-lg cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>
            {exporting
              ? 'Forging PNG...'
              : `Download ${aspect === 'story' ? 'Story' : 'Square'} Card PNG`}
          </span>
        </button>
      </div>
    </div>
  );
}
