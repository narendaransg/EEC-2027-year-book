import type { Metadata } from "next";
import { Cinzel, IM_Fell_English } from "next/font/google";
import "./globals.css";
import CitadelNav from "./components/CitadelNav";
import RouteTransition from "./components/RouteTransition";
import DragonPlushie from "./components/DragonPlushie";
import NedGuide from "./components/NedGuide";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

const imFell = IM_Fell_English({
  subsets: ["latin"],
  variable: "--font-im-fell",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "The Citadel Chronicles",
  description: "Batch Yearbook of the Great Houses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${imFell.variable}`}>
      <body className="bg-zinc-950 text-amber-50 antialiased min-h-screen">
        <CitadelNav />
        <RouteTransition>{children}</RouteTransition>
        <DragonPlushie />
        <NedGuide />
      </body>
    </html>
  );
}
