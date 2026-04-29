/**
 * Passende Beoordeling — Functional Spec v4
 *
 * Status sequence: identical to the normal v0 compliance flow.
 * The only PB-specific element is the Kennisgeving email template used
 * when sending the quote, and the fact that Christine manually prepares
 * and uploads the final report instead of an automated calculation.
 */

export type PBStatus =
  | 'price_generated'      // Quote auto-generated, ready to send via Kennisgeving email
  | 'awaiting_payment'     // Quote sent — waiting for client signature + payment
  | 'paid'                 // Client paid → Christine is preparing the PB report manually
  | 'report_in_progress'   // Christine uploaded the report → held until final release
  | 'report_delivered';    // Released to the client

export const PB_STATUS_CONFIG: Record<PBStatus, { label: string; index: number }> = {
  price_generated:    { label: 'Quote Ready',          index: 0 },
  awaiting_payment:   { label: 'Awaiting Payment',     index: 1 },
  paid:               { label: 'In Preparation',       index: 2 },
  report_in_progress: { label: 'Report Held',          index: 3 },
  report_delivered:   { label: 'Released',             index: 4 },
};

export const PB_STATUSES: PBStatus[] = [
  'price_generated',
  'awaiting_payment',
  'paid',
  'report_in_progress',
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

export function buildPBProjectData(): PBProjectData {
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
  { description: 'Passende Beoordeling - Uitvoering', amount: 2400 },
  { description: 'Juridische review', amount: 600 },
  { description: 'Ecologische impactanalyse', amount: 800 },
];

export const COMMISSION_RATE = 0.08;

export const KENNISGEVING_SENDER = 'hello@oxicloud.be';
