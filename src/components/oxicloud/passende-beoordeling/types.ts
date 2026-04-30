export type PBStatus =
  | 'draft'
  | 'quote_sent'
  | 'signed'
  | 'report_held'
  | 'released';

export const PB_STATUS_CONFIG: Record<PBStatus, { label: string; index: number }> = {
  draft: { label: 'Draft', index: 0 },
  quote_sent: { label: 'Quote sent', index: 1 },
  signed: { label: 'Signed', index: 2 },
  report_held: { label: 'Report Held', index: 3 },
  released: { label: 'Released', index: 4 },
};

export const PB_STATUSES: PBStatus[] = [
  'draft',
  'quote_sent',
  'signed',
  'report_held',
  'released',
];

export interface PBProjectData {
  name: string;
  address: string;
  clientName: string;
  clientEmail: string;
  architectName: string;
  scanDate: string;
  referenceNumber: string;
  overshoot: number;
  threshold: number;
  noxImpact: number;
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
    clientName: 'Pauwels NV',
    clientEmail: 'info@pauwels-nv.be',
    architectName: managerName,
    scanDate: new Date().toLocaleDateString('nl-BE'),
    referenceNumber: 'OXI-2026-00847',
    overshoot: 18,
    threshold: 1.0,
    noxImpact: 1.18,
  };
}

export const QUOTE_LINE_ITEMS = [
  { description: 'Passende Beoordeling', amount: 3800 },
];
