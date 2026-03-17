export type PBStatus =
  | 'on_hold'
  | 'input_complete'
  | 'quote_generated'
  | 'awaiting_payment'
  | 'paid'
  | 'report_delivered';

export const PB_STATUS_CONFIG: Record<PBStatus, { label: string; index: number }> = {
  on_hold: { label: 'On Hold — Awaiting Client Decision', index: 0 },
  input_complete: { label: 'Input Complete', index: 1 },
  quote_generated: { label: 'Offerte Gegenereerd', index: 2 },
  awaiting_payment: { label: 'Wachten op Betaling', index: 3 },
  paid: { label: 'Rapport in Uitvoering', index: 4 },
  report_delivered: { label: 'Rapport Geleverd', index: 5 },
};

export const PB_STATUSES: PBStatus[] = [
  'on_hold',
  'input_complete',
  'quote_generated',
  'awaiting_payment',
  'paid',
  'report_delivered',
];

export interface PBProjectData {
  name: string;
  address: string;
  noxImpact: number;
  threshold: number;
  overshoot: number;
  clientEmail: string;
  scanDate: string;
}

export const SEED_PROJECT: PBProjectData = {
  name: 'Residentie Brugge Noord',
  address: 'Noordzandstraat 14, Brugge',
  noxImpact: 38.4,
  threshold: 32.0,
  overshoot: 6.4,
  clientEmail: 'j.dejong@opdrachtgever.nl',
  scanDate: new Date().toLocaleDateString('nl-BE'),
};

export const QUOTE_LINE_ITEMS = [
  { description: 'Passende Beoordeling — Uitvoering', amount: 2400 },
  { description: 'Juridische review', amount: 600 },
  { description: 'Ecologische impactanalyse', amount: 800 },
];

export const COMMISSION_RATE = 0.08;
