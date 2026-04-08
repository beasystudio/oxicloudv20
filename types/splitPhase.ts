// Split Phase Simulation Types
// System for splitting projects into compliant phases

export interface PhaseProject {
  id: string;
  parentProjectId: string;
  phaseName: 'Phase 1' | 'Phase 2';
  ratio: number; // The proportion of the original project
  footprintArea: number; // m²
  
  // Demolition
  demolitionVolume: number;
  
  // Construction Phase - Point Sources
  equipmentHours: number;
  
  // Construction Phase - Line Sources
  trafficMovementsLight: number;
  trafficMovementsHeavy: number;
  
  // Operation Phase - Point Sources
  operationalEquipment: number;
  
  // Operation Phase - Line Sources
  operationalTrafficLight: number;
  operationalTrafficHeavy: number;
  
  // Timing
  constructionDuration: number; // days
  operationalStart: string; // date string
  
  // Calculated results
  emissionResult: PhaseEmissionResult;
  complianceStatus: 'compliant' | 'non_compliant' | 'future_phase';
}

export interface PhaseEmissionResult {
  constructionEmissions: number;
  operationalEmissions: number;
  totalEmissions: number;
  percentOfThreshold: number;
}

export interface SplitPhaseCalculation {
  projectEmission: number;
  threshold: number;
  minimumUtilizationRatio: number;
  
  // Calculated ratios
  complianceRatio: number; // R_compliance
  minimumRatio: number; // R_min
  candidateRatio: number; // R_candidate with safety margin
  finalRatio: number; // R_phase1 (worst case across emission types)
  
  // Per emission type ratios
  emissionTypeRatios: {
    demolition: number;
    constructionEquipment: number;
    constructionTraffic: number;
    operationalEquipment: number;
    operationalTraffic: number;
    operationalIndustrial: number;
  };
  
  // Phases
  phase1: PhaseProject | null;
  phase2: PhaseProject | null;
}

export interface SplitPhaseState {
  step: SplitPhaseStep;
  calculation: SplitPhaseCalculation | null;
  footprintConfirmed: boolean;
  phase1Footprint: number; // m²
  legalConfirmationChecked: boolean;
}

export type SplitPhaseStep = 
  | 'intro'
  | 'calculation'
  | 'footprint_map'
  | 'phase1_preview'
  | 'confirmation'
  | 'complete';

// Calculation functions

export const computeComplianceRatio = (projectEmission: number, threshold: number): number => {
  if (projectEmission <= 0) return 1;
  return threshold / projectEmission;
};

export const computeMinimumRatio = (
  projectEmission: number, 
  threshold: number, 
  minimumUtilizationRatio: number = 0.7
): number => {
  if (projectEmission <= 0) return minimumUtilizationRatio;
  return (minimumUtilizationRatio * threshold) / projectEmission;
};

export const computeWorstCaseRatio = (
  emissionTypeRatios: number[],
  complianceRatio: number
): number => {
  const safetyMargin = 0.97;
  const candidateRatio = complianceRatio * safetyMargin;
  
  // Get minimum ratio across all emission types
  const minEmissionRatio = Math.min(...emissionTypeRatios);
  
  // Final ratio must not exceed the candidate
  return Math.min(candidateRatio, minEmissionRatio);
};

export const createPhaseProjects = (
  parentProjectId: string,
  ratio: number,
  originalData: {
    totalFootprint: number;
    demolitionVolume: number;
    equipmentHours: number;
    trafficLV: number;
    trafficHV: number;
    operationalEquipment: number;
    operationalTrafficLV: number;
    operationalTrafficHV: number;
    constructionDuration: number;
  }
): { phase1: PhaseProject; phase2: PhaseProject } => {
  const phase1: PhaseProject = {
    id: `${parentProjectId}-phase1`,
    parentProjectId,
    phaseName: 'Phase 1',
    ratio,
    footprintArea: Math.round(originalData.totalFootprint * ratio),
    demolitionVolume: Math.round(originalData.demolitionVolume * ratio),
    equipmentHours: Math.round(originalData.equipmentHours * ratio),
    trafficMovementsLight: Math.round(originalData.trafficLV * ratio),
    trafficMovementsHeavy: Math.round(originalData.trafficHV * ratio),
    operationalEquipment: Math.round(originalData.operationalEquipment * ratio),
    operationalTrafficLight: Math.round(originalData.operationalTrafficLV * ratio),
    operationalTrafficHeavy: Math.round(originalData.operationalTrafficHV * ratio),
    constructionDuration: Math.round(originalData.constructionDuration * ratio),
    operationalStart: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    emissionResult: {
      constructionEmissions: 0,
      operationalEmissions: 0,
      totalEmissions: 0,
      percentOfThreshold: 0,
    },
    complianceStatus: 'compliant',
  };
  
  const phase2: PhaseProject = {
    id: `${parentProjectId}-phase2`,
    parentProjectId,
    phaseName: 'Phase 2',
    ratio: 1 - ratio,
    footprintArea: Math.round(originalData.totalFootprint * (1 - ratio)),
    demolitionVolume: Math.round(originalData.demolitionVolume * (1 - ratio)),
    equipmentHours: Math.round(originalData.equipmentHours * (1 - ratio)),
    trafficMovementsLight: Math.round(originalData.trafficLV * (1 - ratio)),
    trafficMovementsHeavy: Math.round(originalData.trafficHV * (1 - ratio)),
    operationalEquipment: Math.round(originalData.operationalEquipment * (1 - ratio)),
    operationalTrafficLight: Math.round(originalData.operationalTrafficLV * (1 - ratio)),
    operationalTrafficHeavy: Math.round(originalData.operationalTrafficHV * (1 - ratio)),
    constructionDuration: Math.round(originalData.constructionDuration * (1 - ratio)),
    operationalStart: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
    emissionResult: {
      constructionEmissions: 0,
      operationalEmissions: 0,
      totalEmissions: 0,
      percentOfThreshold: 0,
    },
    complianceStatus: 'future_phase',
  };
  
  return { phase1, phase2 };
};