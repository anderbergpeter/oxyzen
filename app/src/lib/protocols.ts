import type { Milestone, Protocol, ProtocolId } from './types';

const standardMilestones: Milestone[] = [
  {
    at: 1,
    title: 'Första andetaget',
    short:
      'Första sessionen klar. Många känner sig lugna och lite sömniga efteråt, det är helt normalt.',
    long:
      'Redan efter en session fördubblas antalet cirkulerande stamceller tillfälligt (Thom 2006). Det är inget du märker, men kroppen har börjat svara. Drick vatten, ta det lugnt i kväll och notera hur du sover.',
  },
  {
    at: 3,
    title: 'Rytmen sitter',
    short: 'Tre sessioner. Nu brukar tryckutjämningen i öronen gå på rutin.',
    long:
      'De första gångerna handlar mest om att vänja sig: trycket, masken, att sitta still. Från och med nu kan du börja lägga märke till små saker, som att du somnar lättare eller känner dig jämnare i energin.',
  },
  {
    at: 10,
    title: 'Halvvägs till grund',
    short:
      'Tio sessioner. Det är här många först beskriver att sömnen och energin känns annorlunda.',
    long:
      'Du har gjort tio av de tjugo som de flesta program ser som ett minimum. Effekterna i det här skedet är subtila och individuella. Titta gärna på dina egna måendekurvor i appen, de säger mer än någon generell beskrivning.',
  },
  {
    at: 20,
    title: 'Grund klar',
    short:
      'Tjugo sessioner. Det är den kur forskningen mätt stamcellsökning över. Bra jobbat.',
    long:
      'I en studie från 2006 ökade antalet cirkulerande stamceller åtta gånger över en kur på tjugo sessioner vid 2,0 ATA. Tjugo är också det minsta antal de flesta kliniker rekommenderar för att få en kännbar effekt. Du kan avsluta här, pausa, eller fortsätta mot 40.',
  },
  {
    at: 30,
    title: 'Halvvägs i resan',
    short: 'Trettio sessioner. Halvvägs till det fulla 60-protokollet.',
    long:
      'Kliniker som jobbar med dagliga sessioner beskriver att nya små blodkärl börjar bildas efter 6–8 sessioner och att den processen stabiliseras runt 30–40. Det är här många säger att återhämtning efter träning och fokus under dagen känns annorlunda. Håll rytmen, 3–5 gånger i veckan.',
  },
  {
    at: 40,
    title: 'Fördjupning klar',
    short: 'Fyrtio sessioner. Du är i det spann som kliniska program jobbar i.',
    long:
      'Fyrtio sessioner vid 2,0 ATA är den dos som bland annat Sagol Centers fibromyalgi-studie (2015) byggde på, och som många kliniska program för hjärnhälsa och återhämtning använder. Vi gör inga medicinska påståenden, men du har nu gett kroppen den dosen. Hela kuren är 60, det är 20 kvar.',
  },
  {
    at: 50,
    title: 'Slutspurt',
    short: 'Femtio sessioner. Tio kvar till hela forskningsprotokollet.',
    long:
      'Håll i rytmen den sista biten. Studierna som mätt effekt på telomerer, åldrade celler och kognition bygger alla på hela kuren om 60 sessioner, inte på enskilda besök.',
  },
  {
    at: 60,
    title: 'Longevity klar',
    short: 'Sextio sessioner. Hela kuren är genomförd. Nu är det dags för paus.',
    long:
      'Sextio sessioner på ungefär tre månader är det protokoll som Sagol Center studerade 2020. I en grupp friska 64+ mätte man 20–38 % längre telomerer och 11–37 % färre åldrade immunceller, och i en randomiserad studie på friska 60+ förbättrades uppmärksamhet, bearbetningshastighet och exekutiva funktioner jämfört med kontrollgruppen. Vi rekommenderar en paus på 4–8 veckor, sedan underhåll eller en ny kur.',
  },
];

const upTo = (n: number) => standardMilestones.filter((m) => m.at <= n);

const seniorMilestones: Milestone[] = [
  {
    at: 1,
    title: 'Första andetaget',
    short: 'Första sessionen klar. Ta det lugnt resten av dagen.',
    long:
      'Det viktigaste första gången är att öronen hann med och att du kände dig bekväm. Blev det tryck i öronen, säg till personalen nästa gång så går vi upp långsammare.',
  },
  {
    at: 3,
    title: 'Lugnt tempo',
    short: 'Tre sessioner. Nu brukar kroppen ha vant sig vid trycket.',
    long:
      'Vi håller oss på 1,5–1,6 ATA i det här protokollet, vilket är snällt mot öron och lungor. Effekten kommer av regelbundenheten, inte av högt tryck.',
  },
  ...standardMilestones.filter((m) => m.at >= 10 && m.at <= 40),
];

export const protocols: Protocol[] = [
  {
    id: 'trial',
    name: 'Prova på',
    tagline: 'Känn hur det är',
    description:
      'En till fem sessioner för att känna hur det är att sitta i kammaren. Inga krav, ingen räkning.',
    sessions: 5,
    pressure: 1.5,
    pressureRange: [1.3, 1.5],
    durationMin: 60,
    cycle: 'none',
    perWeek: 'När det passar',
    audience: 'Nyfikna, första gången',
    milestones: [
      standardMilestones[0],
      {
        at: 5,
        title: 'Prova på klar',
        short: 'Fem sessioner. Vill du fortsätta?',
        long:
          'Grund är tjugo sessioner och det är där effekterna brukar börja synas. Byt protokoll under Profil så räknas dina fem sessioner med.',
      },
    ],
  },
  {
    id: 'base',
    name: 'Grund',
    tagline: '20 sessioner',
    description:
      'Det minsta antal sessioner de flesta program rekommenderar för kännbar effekt. Här finns också den mätbara stamcellsökningen (Thom 2006).',
    sessions: 20,
    pressure: 1.6,
    pressureRange: [1.5, 1.8],
    durationMin: 60,
    cycle: '20/5',
    perWeek: '3–5 dagar/vecka',
    audience: 'De som vill känna skillnad',
    milestones: upTo(20),
  },
  {
    id: 'deep',
    name: 'Fördjupning',
    tagline: '40 sessioner',
    description:
      'Det spann som många kliniska program jobbar i. För dig som vill fortsätta efter Grund.',
    sessions: 40,
    pressure: 1.8,
    pressureRange: [1.8, 2.0],
    durationMin: 90,
    cycle: '20/5',
    perWeek: '3–5 dagar/vecka',
    audience: 'Fortsättning efter Grund',
    milestones: upTo(40),
  },
  {
    id: 'longevity',
    name: 'Longevity',
    tagline: '60 sessioner, 2,0 ATA, 90 min',
    description:
      'Hela forskningsprotokollet från Sagol Center (2020): 60 sessioner på ungefär tre månader. Masken av fem minuter var tjugonde minut är en del av protokollet.',
    sessions: 60,
    pressure: 2.0,
    pressureRange: [2.0, 2.0],
    durationMin: 90,
    cycle: '20/5',
    perWeek: '5 dagar/vecka',
    audience: 'Fullt protokoll',
    milestones: upTo(60),
  },
  {
    id: 'blueprint',
    name: '60/90/2.0',
    tagline: 'Samma protokoll som Bryan Johnson kör',
    description:
      '60 sessioner på 90 dagar, 90 minuter per gång, 2,0 ATA, fem dagar i veckan, mask 20 minuter på och 5 minuter av. Kräver disciplin.',
    sessions: 60,
    pressure: 2.0,
    pressureRange: [2.0, 2.0],
    durationMin: 90,
    cycle: '20/5',
    perWeek: '5 dagar/vecka, 12 veckor',
    audience: 'Biohackers',
    milestones: upTo(60),
  },
  {
    id: 'senior',
    name: 'Varsam',
    tagline: 'Lägre tryck, lugnt tempo',
    description:
      'För dig som är 65+ eller har känsliga öron. Vi håller oss på 1,5–1,6 ATA och 60 minuter. Effekten kommer av regelbundenheten.',
    sessions: 40,
    pressure: 1.5,
    pressureRange: [1.5, 1.6],
    durationMin: 60,
    cycle: '20/5',
    perWeek: '2–4 dagar/vecka',
    audience: '65+ eller känsliga öron',
    milestones: seniorMilestones,
  },
  {
    id: 'maintenance',
    name: 'Underhåll',
    tagline: 'Efter avslutad kur och paus',
    description:
      'Fyra till åtta sessioner i månaden för att hålla i det du byggt upp. Ingen räkning mot ett mål, bara en månadsräkning.',
    sessions: null,
    pressure: 1.8,
    pressureRange: [1.5, 2.0],
    durationMin: 60,
    cycle: '20/5',
    perWeek: '1–2 dagar/vecka',
    audience: 'Efter 60-kur',
    milestones: [],
  },
];

// Resan visas alltid hela vägen till 60, som är full effekt enligt studierna,
// oavsett vilket protokoll man valt. Protokollets egna texter (t.ex. Varsam)
// ersätter standardtexten vid samma antal.
export const FULL_EFFECT_SESSIONS = 60;
export function journeyMilestonesFor(protocol: Protocol): Milestone[] {
  const overrides = new Map(protocol.milestones.map((m) => [m.at, m]));
  const merged = standardMilestones.map((m) => overrides.get(m.at) ?? m);
  for (const m of protocol.milestones) if (!merged.some((x) => x.at === m.at)) merged.push(m);
  return merged.sort((a, b) => a.at - b.at);
}

export const getProtocol = (id: ProtocolId): Protocol =>
  protocols.find((p) => p.id === id) ?? protocols[1];

export const pressureOptions = [1.3, 1.4, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4];
export const durationOptions = [60, 90, 120];
export const cycleOptions: { value: Protocol['cycle']; label: string; hint: string }[] = [
  { value: '20/5', label: '20 / 5', hint: 'Standard. Mask på 20 min, av 5 min.' },
  { value: '25/5', label: '25 / 5', hint: 'Längre syrgasblock.' },
  { value: '30/5', label: '30 / 5', hint: 'Färre pauser.' },
  { value: 'none', label: 'Utan cykel', hint: 'Inga larm. För samtal eller om masken sitter hela tiden.' },
];

export const ADVANCED_PRESSURE = 2.0;
export const SENIOR_AGE = 65;
export const SENIOR_MAX_PRESSURE = 1.6;
export const PAUSE_WEEKS = [4, 8] as const;

export function recommendedPressure(protocol: Protocol, age: number | null): number {
  if (age !== null && age >= SENIOR_AGE) {
    return Math.min(protocol.pressure, SENIOR_MAX_PRESSURE);
  }
  return protocol.pressure;
}

export function parseCycle(cycle: Protocol['cycle']): { on: number; off: number } | null {
  if (cycle === 'none') return null;
  const [on, off] = cycle.split('/').map(Number);
  return { on, off };
}
