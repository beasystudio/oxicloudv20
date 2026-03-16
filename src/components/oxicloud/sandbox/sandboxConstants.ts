// OxiCloud Sandbox — Constants & Calculation Utilities

export const GFA = 4500; // m², gross floor area
export const WORKING_DAYS_CONSTRUCTION = 220;
export const WORKING_DAYS_OPERATION = 250;
export const EMISSION_FACTOR_LV = 0.0021; // kg NOₓ per vehicle trip
export const EMISSION_FACTOR_HV = 0.014; // kg NOₓ per vehicle trip

// Machine emission factors (kg NOₓ/hr)
export const MACHINE_EMISSION_FACTORS: Record<string, number> = {
  'Hydraulische graafmachine': 0.045,
  'Rijplatendrager': 0.028,
  'Betonpomp': 0.035,
  'Mobiele kraan': 0.022,
};

// Thresholds
export const THRESHOLDS = {
  bouwfase_punt: 32.0,
  bouwfase_lijn_lv: 18.5,
  bouwfase_lijn_hv: 12.2,
  exploitatie_punt: 4.8,
  exploitatie_lijn_lv: 14.2,
  exploitatie_lijn_hv: 8.6,
};

// Seed values
export const SEEDS = {
  // Tab 1 — Bouwfase Puntbronnen
  prefab_percentage: 0.40, // as decimal for tabs 2/3, as % (40) for slider in tab 1
  sloopoppervlakte: 1800,
  nieuwe_verharding: 950,
  diepte_bouwput: 4.5,
  grondwerkvolume: 2400,
  terrein_ophoging: 600,
  // Tab 2/3 — Lijnbron
  lv_trips_rate: 8.2,
  hv_trips_rate: 1.4,
  // Tab 4 — Exploitatie Punt
  operating_hours: 1000,
  vermogen: 60,
  // Tab 5/6 — Exploitatie Lijn
  parking_spaces: 42,
  modal_split_lv: 0.65,
  lv_trips_rate_op: 6.5,
  hv_trips_rate_op: 0.9,
};

export const RECOMMENDED = {
  prefab_percentage: 65,
  sloopoppervlakte: 1200,
  nieuwe_verharding: 700,
  grondwerkvolume: 1800,
  operating_hours: 650,
};

export interface MachineRow {
  id: string;
  machine: string;
  aantal: number;
  uren: number;
  emissionFactor: number;
}

export const DEFAULT_MACHINES: MachineRow[] = [
  { id: '1', machine: 'Hydraulische graafmachine', aantal: 2, uren: 480, emissionFactor: 0.045 },
  { id: '2', machine: 'Rijplatendrager', aantal: 1, uren: 120, emissionFactor: 0.028 },
  { id: '3', machine: 'Betonpomp', aantal: 1, uren: 200, emissionFactor: 0.035 },
  { id: '4', machine: 'Mobiele kraan', aantal: 1, uren: 300, emissionFactor: 0.022 },
];

// ── Calculation Functions ──

export function calcPointSourceConstruction(machines: MachineRow[]): number {
  return machines.reduce((sum, m) => sum + m.aantal * m.uren * m.emissionFactor, 0);
}

export function calcLineSourceConstruction(
  tripsRate: number,
  emissionFactor: number,
  prefabPercentage: number // decimal 0-1
): number {
  const dailyTrips = tripsRate * (GFA / 1000);
  return dailyTrips * WORKING_DAYS_CONSTRUCTION * emissionFactor * (1 - prefabPercentage);
}

export function calcDailyTripsConstruction(tripsRate: number): number {
  return Math.round(tripsRate * (GFA / 1000));
}

export function calcOperationPointEmission(vermogen: number, hours: number): number {
  return vermogen * hours * 0.00008;
}

export function calcLineSourceOperation(
  tripsRate: number,
  emissionFactor: number,
  modalSplitFactor: number, // for LV: modal_split_lv, for HV: (1 - modal_split_lv)
  parkingSpaces: number
): number {
  const dailyTrips = tripsRate * (GFA / 1000) * modalSplitFactor;
  return dailyTrips * WORKING_DAYS_OPERATION * emissionFactor * (parkingSpaces / 42);
}

export function calcDailyTripsOperation(
  tripsRate: number,
  modalSplitFactor: number
): number {
  return Math.round(tripsRate * (GFA / 1000) * modalSplitFactor);
}

// Compliance helpers
export function calcRemainingReduction(currentEmission: number, threshold: number): number {
  return Math.max(0, currentEmission - threshold);
}

export function calcProgress(remaining: number, originalOvershoot: number): number {
  if (originalOvershoot <= 0) return 100;
  return Math.min(100, Math.max(0, (1 - remaining / originalOvershoot) * 100));
}

// Source identifier type
export type SourceId = 'bouwfase_punt' | 'bouwfase_lijn_lv' | 'bouwfase_lijn_hv' | 'exploitatie_punt' | 'exploitatie_lijn_lv' | 'exploitatie_lijn_hv';

export const SOURCE_LABELS: Record<SourceId, string> = {
  bouwfase_punt: 'Bouwfase Puntbronnen',
  bouwfase_lijn_lv: 'Bouwfase Lijnbron LV',
  bouwfase_lijn_hv: 'Bouwfase Lijnbron HV',
  exploitatie_punt: 'Exploitatiefase Puntbronnen',
  exploitatie_lijn_lv: 'Exploitatiefase Lijnbron LV',
  exploitatie_lijn_hv: 'Exploitatiefase Lijnbron HV',
};

export const TAB_LABELS: Record<SourceId, string> = {
  bouwfase_punt: 'Bouwfase — Puntbronnen',
  bouwfase_lijn_lv: 'Bouwfase — Lijnbron LV',
  bouwfase_lijn_hv: 'Bouwfase — Lijnbron HV',
  exploitatie_punt: 'Exploitatiefase — Puntbronnen',
  exploitatie_lijn_lv: 'Exploitatiefase — Lijnbron LV',
  exploitatie_lijn_hv: 'Exploitatiefase — Lijnbron HV',
};
