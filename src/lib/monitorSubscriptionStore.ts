// Monitor Subscription Store - Municipal subscription management for OxiCloud Monitor

export interface MonitorSubscription {
  id: string;
  municipalityName: string;
  municipalityCode: string;
  province: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  plan: 'Basic' | 'Standard' | 'Premium';
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  powerUsers: number;
  standardUsers: number;
  maxPowerUsers: number;
  maxStandardUsers: number;
  monthlyFee: number;
  startDate: string;
  renewalDate: string;
  billingStatus: 'paid' | 'pending' | 'overdue';
  lastPaymentDate: string | null;
  notes: string;
}

const STORE_KEY = 'oxicloud_monitor_subscriptions';

const defaultSubscriptions: MonitorSubscription[] = [
  {
    id: 'sub-001',
    municipalityName: 'Stad Antwerpen',
    municipalityCode: 'ANT-001',
    province: 'Antwerpen',
    contactName: 'Koen Vandenberg',
    contactEmail: 'koen.vandenberg@antwerpen.be',
    contactPhone: '+32 3 221 13 33',
    plan: 'Premium',
    status: 'active',
    powerUsers: 2,
    standardUsers: 4,
    maxPowerUsers: 3,
    maxStandardUsers: 10,
    monthlyFee: 249,
    startDate: '2024-06-01',
    renewalDate: '2025-06-01',
    billingStatus: 'paid',
    lastPaymentDate: '2025-03-01',
    notes: 'Largest municipality client. Primary contact for pilot program.',
  },
  {
    id: 'sub-002',
    municipalityName: 'Gemeente Aarschot',
    municipalityCode: 'AAR-001',
    province: 'Vlaams-Brabant',
    contactName: 'Els De Smedt',
    contactEmail: 'els.desmedt@aarschot.be',
    contactPhone: '+32 16 63 05 00',
    plan: 'Standard',
    status: 'active',
    powerUsers: 1,
    standardUsers: 3,
    maxPowerUsers: 2,
    maxStandardUsers: 5,
    monthlyFee: 149,
    startDate: '2024-09-01',
    renewalDate: '2025-09-01',
    billingStatus: 'paid',
    lastPaymentDate: '2025-02-28',
    notes: 'Good adoption rate. Requested training session.',
  },
  {
    id: 'sub-003',
    municipalityName: 'Gemeente Herent',
    municipalityCode: 'HER-001',
    province: 'Vlaams-Brabant',
    contactName: 'Mark Willems',
    contactEmail: 'mark.willems@herent.be',
    contactPhone: '+32 16 85 15 80',
    plan: 'Basic',
    status: 'trial',
    powerUsers: 1,
    standardUsers: 1,
    maxPowerUsers: 1,
    maxStandardUsers: 2,
    monthlyFee: 79,
    startDate: '2025-02-01',
    renewalDate: '2025-05-01',
    billingStatus: 'pending',
    lastPaymentDate: null,
    notes: '3-month trial. Evaluating against current manual workflow.',
  },
  {
    id: 'sub-004',
    municipalityName: 'Stad Leuven',
    municipalityCode: 'LEU-001',
    province: 'Vlaams-Brabant',
    contactName: 'Sarah Claes',
    contactEmail: 'sarah.claes@leuven.be',
    contactPhone: '+32 16 27 21 11',
    plan: 'Standard',
    status: 'inactive',
    powerUsers: 0,
    standardUsers: 0,
    maxPowerUsers: 2,
    maxStandardUsers: 5,
    monthlyFee: 149,
    startDate: '2024-03-01',
    renewalDate: '2025-03-01',
    billingStatus: 'overdue',
    lastPaymentDate: '2024-12-15',
    notes: 'Subscription lapsed. Follow up required.',
  },
  {
    id: 'sub-005',
    municipalityName: 'Gemeente Mechelen',
    municipalityCode: 'MEC-001',
    province: 'Antwerpen',
    contactName: 'Pieter De Groote',
    contactEmail: 'pieter.degroote@mechelen.be',
    contactPhone: '+32 15 29 75 00',
    plan: 'Premium',
    status: 'active',
    powerUsers: 2,
    standardUsers: 5,
    maxPowerUsers: 3,
    maxStandardUsers: 10,
    monthlyFee: 249,
    startDate: '2024-04-01',
    renewalDate: '2025-04-01',
    billingStatus: 'paid',
    lastPaymentDate: '2025-03-01',
    notes: 'Very active user. Interested in API integration.',
  },
];

export function getMonitorSubscriptions(): MonitorSubscription[] {
  const stored = localStorage.getItem(STORE_KEY);
  if (!stored) {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultSubscriptions));
    return defaultSubscriptions;
  }
  return JSON.parse(stored);
}

export function saveMonitorSubscriptions(subs: MonitorSubscription[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(subs));
}

export function updateMonitorSubscription(id: string, updates: Partial<MonitorSubscription>): void {
  const subs = getMonitorSubscriptions();
  const idx = subs.findIndex(s => s.id === id);
  if (idx !== -1) {
    subs[idx] = { ...subs[idx], ...updates };
    saveMonitorSubscriptions(subs);
  }
}

export function addMonitorSubscription(sub: MonitorSubscription): void {
  const subs = getMonitorSubscriptions();
  subs.push(sub);
  saveMonitorSubscriptions(subs);
}

export function getMonitorStats() {
  const subs = getMonitorSubscriptions();
  return {
    total: subs.length,
    active: subs.filter(s => s.status === 'active').length,
    trial: subs.filter(s => s.status === 'trial').length,
    inactive: subs.filter(s => s.status === 'inactive').length,
    mrr: subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthlyFee, 0),
    overdue: subs.filter(s => s.billingStatus === 'overdue').length,
  };
}
