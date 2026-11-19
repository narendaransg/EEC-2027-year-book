export type HouseKey =
  | 'stark'
  | 'lannister'
  | 'targaryen'
  | 'baratheon'
  | 'tyrell'
  | 'martell'
  | 'greyjoy'
  | 'arryn';

export interface HouseInfo {
  key: HouseKey;
  name: string;
  words: string;
  sigil: string;
  accent: string;
}

export const HOUSES: Record<HouseKey, HouseInfo> = {
  stark: {
    key: 'stark',
    name: 'House Stark',
    words: 'Winter Is Coming',
    sigil: '🐺 Grey Direwolf',
    accent: '#475569',
  },
  lannister: {
    key: 'lannister',
    name: 'House Lannister',
    words: 'Hear Me Roar!',
    sigil: '🦁 Golden Lion',
    accent: '#b45309',
  },
  targaryen: {
    key: 'targaryen',
    name: 'House Targaryen',
    words: 'Fire and Blood',
    sigil: '🐉 Three-Headed Dragon',
    accent: '#991b1b',
  },
  baratheon: {
    key: 'baratheon',
    name: 'House Baratheon',
    words: 'Ours is the Fury',
    sigil: '🦌 Crowned Stag',
    accent: '#ca8a04',
  },
  tyrell: {
    key: 'tyrell',
    name: 'House Tyrell',
    words: 'Growing Strong',
    sigil: '🌹 Golden Rose',
    accent: '#15803d',
  },
  martell: {
    key: 'martell',
    name: 'House Martell',
    words: 'Unbowed, Unbent, Unbroken',
    sigil: '☀️ Sun & Spear',
    accent: '#c2410c',
  },
  greyjoy: {
    key: 'greyjoy',
    name: 'House Greyjoy',
    words: 'We Do Not Sow',
    sigil: '🐙 Golden Kraken',
    accent: '#1e293b',
  },
  arryn: {
    key: 'arryn',
    name: 'House Arryn',
    words: 'As High as Honor',
    sigil: '🦅 White Falcon',
    accent: '#1d4ed8',
  },
};

export interface QuizOption {
  label: string;
  scores: Partial<Record<HouseKey, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'A massive deadline or exam is 24 hours away. What is your actual state of mind?',
    options: [
      { label: 'Already finished two days ago; currently revising calmly.', scores: { stark: 2, arryn: 1 } },
      { label: 'Strategically analysing past papers for maximum marks with minimum effort.', scores: { lannister: 2 } },
      { label: 'Full adrenaline rush—pulling an all-nighter powered by coffee and willpower.', scores: { targaryen: 2, baratheon: 1 } },
      { label: 'Panicking loudly in the group chat, then somehow clutching it at 3 AM.', scores: { baratheon: 2 } },
      { label: 'Forming a study alliance, sharing notes, and keeping everyone’s morale up.', scores: { tyrell: 2 } },
      { label: 'Completely unbothered. Whatever happens, happens—I’ll wing it.', scores: { martell: 2 } },
      { label: 'Haven’t opened the syllabus yet; absorbing everything from the topper 30 mins before.', scores: { greyjoy: 2 } },
      { label: 'Locked in my room, phone on DND, executing a strict hour-by-hour schedule.', scores: { arryn: 2 } },
    ],
  },
  {
    id: 'q2',
    question: 'Someone takes credit for your work in a group project. How do you react?',
    options: [
      { label: 'Confront them directly and honestly—no games, just facts.', scores: { stark: 2 } },
      { label: 'Smile, stay calm, and quietly make sure the professor knows who built it.', scores: { lannister: 2 } },
      { label: 'Burn the whole bridge down. Nobody crosses me and walks away unscathed.', scores: { targaryen: 2 } },
      { label: 'Call them out loudly on the spot in front of everyone.', scores: { baratheon: 2 } },
      { label: 'Handle it smoothly so the grade doesn’t suffer, then never work with them again.', scores: { tyrell: 2 } },
      { label: 'Laugh it off—I know my worth, and they’ll fail the viva anyway.', scores: { martell: 2 } },
      { label: 'Detach completely and let them sink when the next milestone hits.', scores: { greyjoy: 2 } },
      { label: 'Document everything objectively and let the truth speak for itself.', scores: { arryn: 2 } },
    ],
  },
  {
    id: 'q3',
    question: 'What are you genuinely known for among your friends?',
    options: [
      { label: 'The dependable one—if someone is in trouble at 2 AM, they call me first.', scores: { stark: 2 } },
      { label: 'The mastermind—always planning trips, budgets, and career moves.', scores: { lannister: 2 } },
      { label: 'The wildcard—unpredictable, intense, and always chasing the next big obsession.', scores: { targaryen: 2 } },
      { label: 'The hype person—brings the energy, laughs, and chaos to every outing.', scores: { baratheon: 2 } },
      { label: 'The connector—knows every senior, junior, and faculty member by name.', scores: { tyrell: 2 } },
      { label: 'The free spirit—never stressed, always down for a spontaneous ride or food run.', scores: { martell: 2 } },
      { label: 'The ghost—disappears for weeks, drops a banger joke, vanishes again.', scores: { greyjoy: 2 } },
      { label: 'The voice of reason—the only one stopping the group from terrible decisions.', scores: { arryn: 2 } },
    ],
  },
  {
    id: 'q4',
    question: 'When a project or event is falling apart, how do you save it?',
    options: [
      { label: 'Pure grit—I sit down and grind through the hardest part myself.', scores: { stark: 2 } },
      { label: 'Strategy & negotiation—I cut scope and pitch it like a finished product.', scores: { lannister: 2 } },
      { label: 'Radical overhaul—I scrap the broken plan and build something 10x better.', scores: { targaryen: 2 } },
      { label: 'Brute force—I rally everyone together and push through on momentum.', scores: { baratheon: 2 } },
      { label: 'Networking—I call in favours and get the exact help we need in 10 minutes.', scores: { tyrell: 2 } },
      { label: 'Creative improvisation—I bend the rules and find a clever workaround.', scores: { martell: 2 } },
      { label: 'Last-minute miracle—I hack something together 20 mins before the demo.', scores: { greyjoy: 2 } },
      { label: 'Precision—I step back, find the exact root cause, and fix it cleanly.', scores: { arryn: 2 } },
    ],
  },
  {
    id: 'q5',
    question: 'Where are you most likely to be found during a free hour?',
    options: [
      { label: 'In the lab or library, quietly building something or finishing pending work.', scores: { stark: 2, arryn: 1 } },
      { label: 'Pitching an idea, trading, or planning my next big career step.', scores: { lannister: 2 } },
      { label: 'Deep in a rabbit hole—gaming, coding, or obsessing over a niche hobby.', scores: { targaryen: 2 } },
      { label: 'At the canteen or sports ground, making the most noise with the gang.', scores: { baratheon: 2 } },
      { label: 'Roaming campus, chatting with five different friend groups on the way.', scores: { tyrell: 2 } },
      { label: 'Off-campus—beach, café, or just riding around to escape the crowd.', scores: { martell: 2 } },
      { label: 'Sleeping in the hostel/home or lurking silently on Discord.', scores: { greyjoy: 2 } },
    ],
  },
  {
    id: 'q6',
    question: 'What drives you the most in life?',
    options: [
      { label: 'Loyalty, integrity, and protecting the people I care about.', scores: { stark: 2 } },
      { label: 'Success, influence, and building an empire of my own.', scores: { lannister: 2 } },
      { label: 'Greatness—leaving a mark that people will remember for years.', scores: { targaryen: 2 } },
      { label: 'Freedom, adrenaline, and living life with zero regrets.', scores: { baratheon: 2 } },
      { label: 'Connection, joy, and enjoying the finer things in life.', scores: { tyrell: 2 } },
      { label: 'Independence—living strictly on my own terms, answering to no one.', scores: { martell: 2 } },
      { label: 'Mastery—proving I can survive and win without anyone’s help.', scores: { greyjoy: 2 } },
      { label: 'Peace of mind, knowledge, and staying true to my principles.', scores: { arryn: 2 } },
    ],
  },
];

export function calculateHouse(answers: Record<string, number>): {
  house: HouseInfo;
  scores: Record<HouseKey, number>;
} {
  const scores: Record<HouseKey, number> = {
    stark: 0,
    lannister: 0,
    targaryen: 0,
    baratheon: 0,
    tyrell: 0,
    martell: 0,
    greyjoy: 0,
    arryn: 0,
  };

  for (const q of QUIZ_QUESTIONS) {
    const selectedIdx = answers[q.id];
    if (selectedIdx !== undefined && q.options[selectedIdx]) {
      const optionScores = q.options[selectedIdx].scores;
      for (const [house, pts] of Object.entries(optionScores)) {
        scores[house as HouseKey] += pts || 0;
      }
    }
  }

  let topHouse: HouseKey = 'stark';
  let maxScore = -1;
  for (const [house, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topHouse = house as HouseKey;
    }
  }

  return { house: HOUSES[topHouse], scores };
}
