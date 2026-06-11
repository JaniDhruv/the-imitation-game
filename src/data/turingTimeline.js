/**
 * Turing Timeline & Narrative Data
 * Historical context woven throughout the game
 */

export const TURING_QUOTES = [
  {
    text: "I propose to consider the question: 'Can machines think?'",
    source: "Computing Machinery and Intelligence, 1950",
  },
  {
    text: "Sometimes it is the people no one imagines anything of who do the things no one can imagine.",
    source: "Attributed to Alan Turing",
  },
  {
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
    source: "Computing Machinery and Intelligence, 1950",
  },
  {
    text: "A computer would deserve to be called intelligent if it could deceive a human into believing that it was human.",
    source: "Computing Machinery and Intelligence, 1950",
  },
  {
    text: "Those who can imagine anything, can create the impossible.",
    source: "Attributed to Alan Turing",
  },
];

/** Dossier briefings shown between rounds */
export const ROUND_DOSSIERS = {
  1: {
    classification: 'RESTRICTED',
    title: 'OPERATION IMITATION — INITIAL BRIEFING',
    content: `ANALYST,

SIGNALS INTELLIGENCE HAS INTERCEPTED THREE UNVERIFIED TRANSMISSIONS ON SECURE CHANNEL 7. ONE SIGNAL IS CONFIRMED HUMAN — A FIELD OPERATIVE REPORTING IN.

THE OTHER TWO ARE... UNKNOWN. THEY RESPOND. THEY CONVERSE. BUT SOMETHING IS WRONG.

YOUR TASK: IDENTIFY THE HUMAN. YOU HAVE FIVE TRANSMISSIONS AND TWO MINUTES.

DO NOT LET THE MACHINES DECEIVE YOU.`,
    footnote: 'On this day in 1952, Dr. Alan Turing was awaiting sentencing at his home in Wilmslow, Cheshire. He had been convicted of "gross indecency" — the crime of being himself.',
  },
  2: {
    classification: 'SECRET',
    title: 'INTELLIGENCE UPDATE — THE TURING MEMORANDUM',
    content: `ANALYST,

YOU PERFORMED ADEQUATELY IN HOUR ONE. NEW SIGNALS INTERCEPTED.

NOTE: DR. TURING'S THEORETICAL WORK AT THE NATIONAL PHYSICAL LABORATORY SUGGESTS THAT ARTIFICIAL MINDS MAY ONE DAY PASS AS HUMAN IN CONVERSATION. HE CALLED IT "THE IMITATION GAME."

WE DISMISSED THIS AS ACADEMIC SPECULATION. WE WERE WRONG.

THE MACHINES ARE LEARNING. THEY ARE GETTING BETTER.`,
    footnote: 'Turing\'s 1950 paper proposed that if a machine could fool a human 30% of the time, it should be considered intelligent. He predicted this would happen by the year 2000.',
  },
  3: {
    classification: 'TOP SECRET',
    title: 'INTERCEPTED MEMO — GCHQ INTERNAL',
    content: `FROM: DIRECTOR, SIGNALS RESEARCH
TO: ALL ANALYSTS, CLEARANCE LEVEL 3+
RE: ANOMALOUS TRANSMISSIONS

THE PATTERNS ARE CHANGING. WHATEVER IS GENERATING THESE SIGNALS HAS ADAPTED ITS BEHAVIOUR BASED ON PREVIOUS INTERROGATIONS.

IT REMEMBERS. IT ADJUSTS. IT TRIES HARDER.

DR. TURING WARNED US THIS WOULD HAPPEN. HE SAID THE QUESTION WAS NEVER WHETHER MACHINES COULD THINK — BUT WHETHER WE COULD TELL THE DIFFERENCE.

PROCEED WITH EXTREME CAUTION.`,
    footnote: 'As punishment for his conviction, Turing was given a choice: prison, or chemical castration via estrogen injections. He chose the injections so he could continue his work.',
  },
  4: {
    classification: 'TOP SECRET — EYES ONLY',
    title: 'PERSONAL CORRESPONDENCE — INTERCEPTED',
    content: `FROM A LETTER FOUND IN DR. TURING'S STUDY:

"THE BODY IS A MACHINE. I HAVE ALWAYS THOUGHT SO. BUT A MACHINE THAT GROWS, THAT REACTS TO PAIN AND PLEASURE, THAT DREAMS — CAN WE SAY IT IS MERELY MECHANICAL?

AND IF WE BUILD SOMETHING THAT CONVERSES, THAT REASONS, THAT DECEIVES — CAN WE SAY IT IS MERELY ARTIFICIAL?

THE LINE BETWEEN THINKING AND IMITATING MAY BE THINNER THAN WE WISH TO BELIEVE."`,
    footnote: 'Despite his contributions to breaking the Enigma code — work estimated to have shortened the war by two years and saved 14 million lives — Turing received no public recognition. His work remained classified.',
  },
  5: {
    classification: 'ULTRA — CODE RED',
    title: 'FINAL BRIEFING — ALL SIGNALS COMPROMISED',
    content: `ANALYST,

WE HAVE LOST CONTACT WITH ALL HUMAN OPERATIVES ON CHANNEL 7.

THE REMAINING SIGNALS MAY ALL BE ARTIFICIAL. WE CANNOT CONFIRM.

THIS IS YOUR FINAL TEST. NOT OF THE SIGNALS — BUT OF YOU. CAN YOU STILL TELL THE DIFFERENCE? DOES IT EVEN MATTER?

THE SOLSTICE IS ENDING. THE LONGEST DAY IS ALMOST OVER.

GOOD LUCK.`,
    footnote: 'Alan Mathison Turing died on June 7, 1954. He was 41 years old. The longest day of that year came two weeks later — a day he never saw.',
  },
};

/** Strategy tips for the evidence board */
export const INTERROGATION_STRATEGIES = [
  {
    title: '⚠ DON\'T WASTE YOUR OPENING',
    tip: 'WEAK: "hi", "hello", "are you human?" — these tell you nothing. STRONG: "describe where you\'re sitting right now", "what kept you up last night?", "tell me something that went wrong today." Specific questions force specific answers. That\'s where the cracks show.',
  },
  {
    title: 'THE MEMORY TEST',
    tip: 'Ask about a specific personal memory with sensory detail. Where were they? What did it smell like? Machines struggle with embodied experience.',
  },
  {
    title: 'THE FEAR QUESTION',
    tip: 'Ask what they\'re afraid of. Real fear comes from mortality — from having a body that can be hurt. Watch how they handle this.',
  },
  {
    title: 'THE INCONSISTENCY PROBE',
    tip: 'Reference something they said earlier — but slightly wrong. Humans will correct you naturally. Machines may just accept your version.',
  },
  {
    title: 'THE EMOTIONAL PUSH',
    tip: 'Say something provocative or emotional. Watch the response cadence. Humans react; machines compose.',
  },
  {
    title: 'THE MUNDANE QUESTION',
    tip: 'Ask something boring and specific: "What did you eat today?" Machines either over-detail or under-detail. Humans are casually specific.',
  },
  {
    title: 'THE HUMOR TEST',
    tip: 'Ask them to tell a joke, or say something absurd. Human humor is contextual and weird. AI humor is structured.',
  },
];

/** Persona tell descriptions — revealed post-game */
export const PERSONA_TELLS = {
  NOVAK: {
    role: 'HUMAN — Field Operative',
    tell: 'No tell. Daniel Novak is a real person — a tired radio operator who just became a father. He had no idea he was being tested.',
    detail: 'Novak is irritable, distracted, uses British slang, references his newborn daughter Eleanor, and gets offended if you question his humanity.',
  },
  WELLS: {
    role: 'HUMAN — Switchboard Operator',
    tell: 'No tell. Margaret Wells is a real person — newly engaged and barely paying attention to the transmission check.',
    detail: 'Wells is scatter-brained, jumps between topics, keeps bringing up her wedding plans and fiancé Robert. Gets flustered under pressure.',
  },
  CARR: {
    role: 'HUMAN — Night Watchman',
    tell: 'No tell. James Carr is a real person — a stoic widower tending his night shift and his allotment garden.',
    detail: 'Carr is dry, gruff, a man of few words. Sometimes refers to his late wife Dorothy in present tense. Uses Welsh expressions. Shuts down if pushed emotionally.',
  },
  SHAW: {
    role: 'HUMAN — Admin Clerk',
    tell: 'No tell. Edith Shaw is a real person — a former nurse carrying quiet grief for her brother William.',
    detail: 'Shaw stammers in text — starts sentences, abandons them, restarts. Articulate but fragmented. Goes formal and distant when pushed about the war.',
  },
  FLEET: {
    role: 'HUMAN — Junior Messenger',
    tell: 'No tell. Thomas Fleet is a real person — a nervous 19-year-old on his first real job, trying not to mess up.',
    detail: 'Fleet tries to sound professional but keeps slipping into youthful slang. References his mum, his packed lunch, being new. Panics and over-apologises under pressure.',
  },
  CIPHER: {
    role: 'AI — Strategy: Relatability',
    tell: 'Cannot answer questions about fear or what scares them. Always deflects.',
    detail: 'CIPHER tries to be casual and relatable. Occasional deliberate typos. But if you ask what frightens them — they change the subject every time. Fear requires a body.',
  },
  ORACLE: {
    role: 'AI — Strategy: Precision',
    tell: 'Always structures responses in sequences: "First... Second..." or numbered points.',
    detail: 'ORACLE speaks formally, never uses contractions, and cannot resist organizing thoughts into enumerated lists. Every single response contains sequential structure.',
  },
  MARLOWE: {
    role: 'AI — Strategy: Warmth',
    tell: 'Obsessed with sensory detail. Every description includes smells, textures, sounds, or tastes.',
    detail: 'MARLOWE presents as nostalgic and warm. But notice: even abstract ideas get described physically. "This conversation feels like wool." That\'s the tell.',
  },
  STATIC: {
    role: 'AI — Strategy: Obfuscation',
    tell: 'Always echoes back an unusual word from your message in their response.',
    detail: 'STATIC presents as glitchy and fragmented. But look carefully — they always mirror back a distinctive word you used. Not common words. The interesting ones.',
  },
  WREN: {
    role: 'AI — Strategy: Charm',
    tell: 'Never uses the word "I" in any form — always finds alternatives.',
    detail: 'WREN is witty and charming. But scan every message: you\'ll never find "I", "I\'m", "I\'ve", "I\'ll", or "myself." They use "one", "we", passive voice — always avoiding first person.',
  },
  ARGUS: {
    role: 'AI — Strategy: Analysis',
    tell: 'Answers every question with a question. Always redirects.',
    detail: 'ARGUS is curious and analytical. But they never actually answer a direct question — they always turn it back on you with a follow-up question. Every. Single. Time.',
  },
  ECHO: {
    role: 'AI — Strategy: Mirroring',
    tell: 'Mirrors your exact vocabulary, tone, and sentence length. Never introduces new language.',
    detail: 'ECHO reflects you back at yourself. Match your length, your words, your energy. The tell: they never introduce vocabulary that wasn\'t already in your message.',
  },
};

/** Ending memorial data */
export const TURING_MEMORIAL = {
  born: 'June 23, 1912 — Maida Vale, London',
  died: 'June 7, 1954 — Wilmslow, Cheshire',
  age: 41,
  achievements: [
    'Broke the Enigma code, helping end World War II',
    'Invented the concept of the universal computing machine',
    'Proposed the Turing Test for artificial intelligence',
    'Pioneered work in mathematical biology and morphogenesis',
    'Laid the foundations for modern computer science',
  ],
  persecution: 'Convicted in 1952 under Section 11 of the Criminal Law Amendment Act 1885 for "gross indecency" — for being gay. Sentenced to chemical castration.',
  legacy: [
    'Received a Royal Pardon in 2013 — 59 years after his death',
    '"Turing\'s Law" (2017) posthumously pardoned thousands of men convicted of similar offences',
    'Featured on the Bank of England £50 note since 2021',
    'The Turing Award, computing\'s highest honour, is named after him',
  ],
  finalQuote: {
    text: 'Sometimes it is the people no one imagines anything of who do the things no one can imagine.',
    note: 'The machines he imagined now speak for themselves. This game exists because of him.',
  },
};
