export const GOT_ENG_QUOTES: string[] = [
  "A mind needs books as a sword needs a whetstone—and an engineer needs strong coffee before an 8 AM lab.",
  "When you play the game of semesters, you pass or you write arrears. There is no middle ground.",
  "Winter is coming, and so are end-semester exams—yet the North remembers every all-nighter.",
  "What do we say to the God of Attendance Shortage? Not today.",
  "Chaos isn't a pit; chaos is a breadboard with twenty unlabelled jumper wires at 2 AM.",
  "The night is dark and full of viva questions, yet fire and blood carry us through.",
  "A Lannister always pays his debts, and an Easwari engineer always submits the record book before the deadline.",
  "Valar Morghulis—all men must die, but first all designs must pass timing closure.",
  "Never forget what you are, for surely the placement cell will not. Wear it like armour.",
  "Dracarys—may the build succeed on the first run without a single error.",
  "The lone wolf dies, but the last-bench crew survives four years of engineering together.",
  "Hear Me Roar—especially when the lab oscilloscope finally shows a clean waveform.",
  "We Do Not Sow—except during project reviews, where we reap what we built.",
  "Ours is the Fury of a thousand back-to-back internal assessments survived.",
  "Growing Strong—from clueless first-years to the Batch of 2027."
];

export function getSealedQuote(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GOT_ENG_QUOTES[hash % GOT_ENG_QUOTES.length];
}
