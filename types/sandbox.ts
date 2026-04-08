// OxiCloud Sandbox Types
// Multi-environment sandbox system for emission exceedance adjustments

export type SandboxEmissionType = 
  | 'bouwfase_puntbronnen'
  | 'bouwfase_lijnbronnen_lv'
  | 'bouwfase_lijnbronnen_hv'
  | 'exploitatie_puntbronnen'
  | 'exploitatie_lijnbronnen';

export type SandboxMode = 'guided' | 'expert';

// Bouwfase Puntbronnen (Construction - Point Sources)
export interface ConstructionSetupData {
  prefabricatedPercentage: number;
  demolitionSurface: number;
  newPavingArea: number;
  asphaltArea: number;
  concreteArea: number;
}

export interface EquipmentItem {
  id: string;
  machineType: string;
  quantity: number;
  operatingHours: number;
  emissionFactor: number;
}

export interface BouwfasePuntbronnenState {
  mode: SandboxMode;
  baseline: ConstructionSetupData;
  current: ConstructionSetupData;
  equipment: EquipmentItem[];
  targetReduction: number; // kg NOx
  achievedReduction: number;
  isCompliant: boolean;
}

// Bouwfase Lijnbronnen (Construction - Line Sources Traffic)
export interface TrafficKencijfers {
  baseLV: number; // trips per 1000 m² per day
  baseHV: number;
}

export interface ConstructionTrafficState {
  gfa: number; // Gross Floor Area m²
  constructionDuration: number; // days
  prefabLevel: number; // percentage
  kencijfers: TrafficKencijfers;
  calculatedLVTripsPerDay: number;
  calculatedHVTripsPerDay: number;
  totalLVMovements: number;
  totalHVMovements: number;
  allowedLVMovements: number;
  allowedHVMovements: number;
  lvRemaining: number;
  hvRemaining: number;
  isCompliant: boolean;
}

// Exploitatie Puntbronnen (Operational - Point Sources / Heating)
export interface HeatingSystemState {
  systemPresent: boolean;
  fuelType: string;
  installedCapacity: number; // kW
  emissionFactor: number;
  operatingHoursPerYear: number;
  systemLoad: number; // percentage
  currentEmissions: number; // kg NOx/year
  targetEmissions: number;
  recommendedHours: number;
  designCommitmentConfirmed: boolean;
  removalReason?: string;
  isCompliant: boolean;
}

// Exploitatie Lijnbronnen (Operational - Line Sources Traffic)
export interface OperationalTrafficState {
  parkingSpaces: number;
  modalSplitLV: number; // percentage
  lvRatePerSpace: number;
  hvRatePerSpace: number;
  calculatedLVPerDay: number;
  calculatedHVPerDay: number;
  totalMovementsPerDay: number;
  allowedMovementsPerDay: number;
  remainingReduction: number;
  isCompliant: boolean;
}

// Unified Sandbox State
export interface SandboxState {
  type: SandboxEmissionType;
  bouwfasePuntbronnen?: BouwfasePuntbronnenState;
  bouwfaseTraffic?: ConstructionTrafficState;
  exploitatiePuntbronnen?: HeatingSystemState;
  exploitatieTraffic?: OperationalTrafficState;
}

// Calculation helpers
export const calculateConstructionTraffic = (
  gfa: number,
  duration: number,
  prefabLevel: number,
  baseLV: number,
  baseHV: number
) => {
  const prefabMultiplier = 1 - (prefabLevel / 100) * 0.4; // Prefab reduces traffic
  const lvTripsPerDay = Math.round((gfa / 1000) * baseLV * prefabMultiplier);
  const hvTripsPerDay = Math.round((gfa / 1000) * baseHV * prefabMultiplier);
  const totalLV = lvTripsPerDay * duration;
  const totalHV = hvTripsPerDay * duration;
  
  return { lvTripsPerDay, hvTripsPerDay, totalLV, totalHV };
};

export const calculateOperationalTraffic = (
  parkingSpaces: number,
  modalSplitLV: number,
  lvRate: number,
  hvRate: number
) => {
  const lvPerDay = Math.round(parkingSpaces * lvRate * (modalSplitLV / 100) * 2);
  const hvPerDay = Math.round(parkingSpaces * hvRate * 2);
  return { lvPerDay, hvPerDay, total: lvPerDay + hvPerDay };
};

export const calculateHeatingEmissions = (
  capacity: number,
  hours: number,
  load: number,
  emissionFactor: number
) => {
  return (capacity * hours * (load / 100) * emissionFactor) / 1000; // kg NOx/year
};
