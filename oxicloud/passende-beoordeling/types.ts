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
  clientName: string;
  clientEmail: string;
  architectName: string;
  scanDate: string;
  referenceNumber: string;
}

/**
 * Build PB project data from existing mock project records.
 * Uses the first GDesign demo project by default.
 */
export function buildPBProjectData(): PBProjectData {
  // Pull from existing mock data via localStorage
  const stored = localStorage.getItem('oxicloud_local_projects');
  let name = 'Pauwels Herent';
  let address = 'Luchthavenlaan 16-18, 1800 Vilvoorde, Belgium';
  let managerName = 'Geoffrey Draelants';

  if (stored) {
    try {
      const projects = JSON.parse(stored);
      if (projects.length > 0) {
        const p = projects[0];
        name = p.name || name;
        address = p.location || address;
        managerName = p.managerName || managerName;
      }
    } catch {
      // fallback to defaults
    }
  }

  return {
    name,
    address,
    noxImpact: 38.4,
    threshold: 32.0,
    overshoot: 6.4,
    clientName: 'Pauwels NV',
    clientEmail: 'info@pauwels-nv.be',
    architectName: managerName,
    scanDate: new Date().toLocaleDateString('nl-BE'),
    referenceNumber: 'OXI-2026-00847',
  };
}

export const QUOTE_LINE_ITEMS = [
  { description: 'Passende Beoordeling — Uitvoering', amount: 2400 },
  { description: 'Juridische review', amount: 600 },
  { description: 'Ecologische impactanalyse', amount: 800 },
];

export const COMMISSION_RATE = 0.08;
