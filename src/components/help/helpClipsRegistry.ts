// Central registry of in-app instructional micro-clips.
// Each clip has an id used by <HelpClip clipId="..." /> and HelpCenter.
//
// videoUrl is intentionally undefined for now - the player falls back
// to an animated placeholder. Drop the real .mp4 path in when ready.

export type HelpClipCategory =
  | 'getting-started'
  | 'project-type'
  | 'map-drawing'
  | 'project-data';

export interface HelpClip {
  id: string;
  category: HelpClipCategory;
  title: { en: string; nl: string };
  description: { en: string; nl: string };
  durationSec: number;
  videoUrl?: string; // mp4 path once produced
  posterUrl?: string;
}

export const HELP_CATEGORIES: Record<HelpClipCategory, { en: string; nl: string }> = {
  'getting-started': { en: 'Getting started', nl: 'Aan de slag' },
  'project-type': { en: 'Project type & classification', nl: 'Projecttype & classificatie' },
  'map-drawing': { en: 'Map & plot drawing', nl: 'Kaart & perceel tekenen' },
  'project-data': { en: 'Filling in project data', nl: 'Projectgegevens invullen' },
};

export const HELP_CLIPS: HelpClip[] = [
  {
    id: 'workspace-what-and-create',
    category: 'getting-started',
    title: {
      en: 'What is a workspace & how do I create one?',
      nl: 'Wat is een workspace en hoe maak ik er een?',
    },
    description: {
      en: 'A workspace groups your company, team, and projects. Required before any project.',
      nl: 'Een workspace bundelt je bedrijf, team en projecten. Verplicht voor elk project.',
    },
    durationSec: 30,
  },
  {
    id: 'invite-manager',
    category: 'getting-started',
    title: { en: 'How do I invite my manager?', nl: 'Hoe nodig ik mijn manager uit?' },
    description: {
      en: 'Send an invite from the team panel - they receive a link to join your workspace.',
      nl: 'Stuur een uitnodiging via het teamoverzicht - ze krijgen een link om toe te treden.',
    },
    durationSec: 15,
  },
  {
    id: 'partner-program',
    category: 'getting-started',
    title: { en: 'What is the Partner Program?', nl: 'Wat is het Partner Programma?' },
    description: {
      en: 'Earn referrals and unlock perks by introducing OxiCloud to other firms.',
      nl: 'Verdien referrals en voordelen door OxiCloud te introduceren bij andere kantoren.',
    },
    durationSec: 30,
  },
  {
    id: 'multiple-subtypes',
    category: 'project-type',
    title: {
      en: 'Can I select multiple building subtypes at once?',
      nl: 'Kan ik meerdere gebouwsubtypes tegelijk kiezen?',
    },
    description: {
      en: 'Yes - hold and pick multiple. Here is the UI behavior.',
      nl: 'Ja - selecteer er meerdere tegelijk. Zo werkt het in de UI.',
    },
    durationSec: 10,
  },
  {
    id: 'polygon-mistake',
    category: 'map-drawing',
    title: {
      en: 'I made a mistake while drawing a polygon - what now?',
      nl: 'Ik maakte een fout bij het tekenen - wat nu?',
    },
    description: {
      en: 'Undo the last point or restart the shape without losing your project.',
      nl: 'Maak het laatste punt ongedaan of begin opnieuw zonder je project te verliezen.',
    },
    durationSec: 20,
  },
  {
    id: 'circle-and-line-meaning',
    category: 'map-drawing',
    title: {
      en: 'What do the circle and line on the final map mean?',
      nl: 'Wat betekenen de cirkel en lijn op de eindkaart?',
    },
    description: {
      en: 'They show the impact buffer and the closest sensitive feature.',
      nl: 'Ze tonen de impactzone en het dichtstbijzijnde gevoelige gebied.',
    },
    durationSec: 15,
  },
  {
    id: 'correct-wrong-address',
    category: 'map-drawing',
    title: {
      en: 'How do I correct a wrong address after entering it?',
      nl: 'Hoe corrigeer ik een verkeerd adres dat al is ingevoerd?',
    },
    description: {
      en: 'Click the address field, edit, and the map re-centers automatically.',
      nl: 'Klik in het adresveld, pas aan, en de kaart centreert opnieuw.',
    },
    durationSec: 10,
  },
  {
    id: 'building-surface-gross-net',
    category: 'project-data',
    title: {
      en: 'Building surface - gross or net? What to include?',
      nl: 'Gebouwoppervlak - bruto of netto? Wat tel ik mee?',
    },
    description: {
      en: 'Use gross floor area, including all interior partitions and exterior walls.',
      nl: 'Gebruik bruto vloeroppervlak, inclusief binnenwanden en buitenmuren.',
    },
    durationSec: 25,
  },
  {
    id: 'raising-ground-level',
    category: 'project-data',
    title: {
      en: 'What is "raising ground level" and how do I calculate the m²?',
      nl: 'Wat is "ophoging maaiveld" en hoe bereken ik de m²?',
    },
    description: {
      en: 'Any area where the existing terrain is built up. Multiply length × width of each raised zone.',
      nl: 'Elk gebied waar het terrein wordt opgehoogd. Vermenigvuldig lengte × breedte per zone.',
    },
    durationSec: 30,
  },
];

export function getClip(id: string): HelpClip | undefined {
  return HELP_CLIPS.find((c) => c.id === id);
}
