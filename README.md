# The Citadel Chronicles — Batch of 2027

A *Game of Thrones*–themed digital yearbook for **Easwari Engineering College (Batch of 2027)**. Batchmates enter behind a passcode gate, take a sorting quiz to claim one of the Great Houses, upload portraits, write their chronicles, and browse an interactive 3D leather-bound flipbook set over a wooden desk, the Iron Throne, and rising embers.

## Features

- **Passcode-Gated Entry (`/`)**: Protects batch chronicles behind a server-verified passcode cookie (`citadel_access`).
- **Great House Sorting Quiz (`/quiz`)**: 6-question sorting engine across 8 Great Houses with custom motto support, memories, junior advice, apocalypse ally shoutouts, portrait upload (up to 5 MB via Supabase Storage), and a downloadable PNG **House Reveal Card**.
- **3D Interactive Flipbook (`/book`)**:
  - Embossed leather cover with gold corner ornaments and *Easwari Engineering College • Batch of 2027* / *Lineages & Histories of the Batch* branding
  - Aged parchment pages with illuminated drop caps, House sigil crests, and subtle watermarks
  - Interactive **Contents** index, live **House Leaderboard** tally, and **Quick Jump Search** by name, branch, or House
  - Optional synthesized page-flip sound and Citadel hearth ambience toggle
  - **Single-Page PDF** and **Download Complete Book (PDF)** export powered by `html2pdf.js`
- **Lord Eddard Stark Guide**: Contextual parchment guide bubble across `/book` and `/quiz` that can be stepped through or toggled closed.
- **Grand Maester's Desk (`/admin`)**: Quick cleanup view to remove test or duplicate chronicles along with their stored portrait files.

## Tech Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling & Fonts**: Tailwind CSS v4 (`@tailwindcss/postcss`), `Cinzel`, `IM Fell English`
- **Database & Storage**: Supabase (Postgres `profiles` table + private `portraits` bucket)
- **3D Flipbook & PDF**: `react-pageflip`, `html2pdf.js`, `lucide-react`

## Project Structure

```text
├── app/
│   ├── admin/          # Cleanup route for deleting profiles & portraits
│   ├── book/           # Flipbook page, server data/signed URL loader & FlipbookClient
│   ├── components/     # Shared UI components (NedGuide)
│   ├── quiz/           # Sorting quiz page, form & server action
│   ├── globals.css     # Tailwind v4 theme tokens & flame/ember animations
│   ├── layout.tsx      # Root layout with Cinzel and IM Fell English fonts
│   └── page.tsx        # Passcode gatekeeper
├── lib/
│   ├── houses.ts       # Great Houses & sorting quiz logic
│   └── supabase.ts     # Supabase client and admin client setup
├── public/
│   └── assets/         # Leather, parchment, wood desk, Iron Throne, quill, ornaments & sigils
└── next.config.ts      # Server Actions body size limit (5mb)
```

## Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
BATCH_PASSCODE=your_batch_passcode
```

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` and enter `BATCH_PASSCODE` to access `/book`.

## Deployment

1. Push the repository to GitHub.
2. Import the repository into **Vercel**.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `BATCH_PASSCODE` under **Environment Variables**.
4. Deploy and share the live URL and batch passcode with classmates.
