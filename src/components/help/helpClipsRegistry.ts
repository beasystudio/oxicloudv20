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
      en: 'What is a Workspace & how do I create one?',
      nl: 'Wat is een Workspace en hoe maak ik er een?',
    },
    description: {
      en: 'A Workspace is your firm\'s registered account, linked to a valid VAT number - all projects, reports and partner settlements live there. Click "Workspace aanmaken", enter your VAT number and OxiCloud fills in the rest.',
      nl: 'Een Workspace is het geregistreerde account van je kantoor, gekoppeld aan een geldig BTW-nummer - al je projecten, rapporten en partner-afrekeningen zitten daar. Klik op "Workspace aanmaken", geef je BTW-nummer in en OxiCloud vult de rest aan.',
    },
    durationSec: 20,
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
    title: { en: 'What is the OxiCloud Partner Program?', nl: 'Wat is het OxiCloud Partner Programma?' },
    description: {
      en: 'You already do the hard work - gathering project data, guiding clients through compliance. OxiCloud handles the quote, signature, billing and commission automatically. You bring the expertise, we make sure you get rewarded.',
      nl: 'Jij doet al het echte werk - projectdata verzamelen en klanten begeleiden door compliance. OxiCloud regelt de offerte, handtekening, facturatie en commissie automatisch. Jij brengt de expertise, wij zorgen dat je beloond wordt.',
    },
    durationSec: 25,
  },
  {
    id: 'multiple-subtypes',
    category: 'project-type',
    title: {
      en: 'What if my project has multiple building or construction types?',
      nl: 'Wat als mijn project meerdere gebouw- of bouwtypes combineert?',
    },
    description: {
      en: 'Mix of types? Pick the most complex one only. New build + renovation? Always go new build - it carries the highest emission factors. Hierarchy: new build > extension > renovation. Enter the total GFA across all buildings.',
      nl: 'Meerdere types? Kies enkel het meest complexe. Nieuwbouw én renovatie? Altijd nieuwbouw kiezen - dat heeft de hoogste emissiefactoren. Volgorde: nieuwbouw > uitbreiding > renovatie. Voor de BVO geef je het totale oppervlak in.',
    },
    durationSec: 10,
  },
  {
    id: 'polygon-mistake',
    category: 'map-drawing',
    title: {
      en: 'I made a mistake while drawing the polygon - what now?',
      nl: 'Ik maakte een fout bij het tekenen - wat nu?',
    },
    description: {
      en: 'Click point by point along your site boundary until the polygon closes. Made a mistake? Delete the last point one by one, or cancel and restart. You can draw multiple polygons for separate zones or parcels.',
      nl: 'Klik punt voor punt langs de grens van je terrein tot het polygoon sluit. Foutje? Verwijder het laatste punt stap voor stap, of annuleer en begin opnieuw. Je kan meerdere polygonen tekenen voor aparte zones of percelen.',
    },
    durationSec: 20,
  },
  {
    id: 'circle-and-line-meaning',
    category: 'map-drawing',
    title: {
      en: 'What do the circle and line on the map mean?',
      nl: 'Wat betekenen de cirkel en de lijn op de kaart?',
    },
    description: {
      en: 'The red circle marks the 2 km buffer zone around your site, as defined by the Stikstofdecreet. The line shows the actual distance from your site to the nearest Natura 2000 habitat. Both values appear in the final emissions report.',
      nl: 'De rode cirkel toont de bufferzone van 2 km rond je terrein, zoals bepaald door het Stikstofdecreet. De lijn toont de werkelijke afstand tot het dichtstbijzijnde Natura 2000-gebied. Beide waarden komen in het eindrapport.',
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
      en: 'OxiCloud uses gross floor area, measured to the outside of the walls. Simple rule: if it has mass and volume, it counts - structural walls, floors, stairwells in; open patios, gardens, unenclosed terraces out. We calculate from terrain upward.',
      nl: 'OxiCloud werkt met bruto vloeroppervlakte, gemeten aan de buitenkant van de muren. Simpele regel: massa en volume = telt mee. Draagmuren, vloeren, trappenhuizen erin; open patio\'s, tuinen, niet-overdekte terrassen eruit. Vanaf het terrein omhoog.',
    },
    durationSec: 25,
  },
  {
    id: 'raising-ground-level',
    category: 'project-data',
    title: {
      en: 'What is ground level raising, and how do I calculate it?',
      nl: 'Wat is terreinophoging, en hoe bereken ik het?',
    },
    description: {
      en: 'When a site slopes, architects fill it to a flat surface - that\'s ground level raising. Take the raised zone\'s area in m² and multiply by the AVERAGE fill depth in m (not max, not min). That gives the volume in m³ OxiCloud needs.',
      nl: 'Bij een hellend terrein wordt opgehoogd tot een vlak werkoppervlak - dat is terreinophoging. Neem het oppervlak van de opgehoogde zone in m² en vermenigvuldig met de GEMIDDELDE ophooghoogte in m (niet max, niet min). Dat geeft het volume in m³.',
    },
    durationSec: 30,
  },
];

export function getClip(id: string): HelpClip | undefined {
  return HELP_CLIPS.find((c) => c.id === id);
}
