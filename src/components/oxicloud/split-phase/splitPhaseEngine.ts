/**
 * Split Phase Calculation Engine
 * Pure utility functions — no React, no side effects.
 */

export interface EmissionTypeRatio {
  id: string;
  label: string;
  R_compliance: number;
  R_min: number;
}

export interface SplitPhaseResult {
  R_compliance: number;
  R_min: number;
  safetyMargin: number;
  R_phase1: number;
  bindingEmissionType: string;
  perTypeRatios: EmissionTypeRatio[];
}

// The 6 emission source types with mock per-type emission/threshold values
const EMISSION_TYPES = [
  { id: 'construction_equipment', emission: 5.2, threshold: 3.8 },
  { id: 'construction_traffic_lv', emission: 3.1, threshold: 2.4 },
  { id: 'construction_traffic_hv', emission: 2.8, threshold: 1.9 },
  { id: 'demolition', emission: 2.4, threshold: 1.5 },
  { id: 'operational_equipment', emission: 2.1, threshold: 1.6 },
  { id: 'operational_traffic', emission: 2.6, threshold: 1.8 },
];

export function calculateSplitPhase(
  projectEmission: number,
  threshold: number
): SplitPhaseResult {
  const safetyMargin = 0.97;
  const R_compliance = threshold / projectEmission;
  const R_min = (0.70 * threshold) / projectEmission;

  const perTypeRatios: EmissionTypeRatio[] = EMISSION_TYPES.map((type) => ({
    id: type.id,
    label: type.id,
    R_compliance: type.threshold / type.emission,
    R_min: (0.70 * type.threshold) / type.emission,
  }));

  // Find binding constraint (minimum R_compliance across types)
  const binding = perTypeRatios.reduce((min, r) =>
    r.R_compliance < min.R_compliance ? r : min
  );

  const R_phase1 = binding.R_compliance * safetyMargin;

  return {
    R_compliance,
    R_min,
    safetyMargin,
    R_phase1,
    bindingEmissionType: binding.id,
    perTypeRatios,
  };
}

// ─── Polygon Geometry Utilities ───

export interface Point {
  x: number;
  y: number;
}

/** Shoelace formula for polygon area */
export function shoelaceArea(points: Point[]): number {
  if (!points || points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/** Sutherland-Hodgman polygon clipping against a horizontal or vertical cut line */
export function clipPolygon(
  points: Point[],
  cutValue: number,
  axis: 'horizontal' | 'vertical',
  side: 'above' | 'below'
): Point[] {
  const inside = (p: Point) =>
    axis === 'horizontal'
      ? side === 'above' ? p.y <= cutValue : p.y >= cutValue
      : side === 'above' ? p.x <= cutValue : p.x >= cutValue;

  const intersect = (a: Point, b: Point): Point => {
    const t = axis === 'horizontal'
      ? (cutValue - a.y) / (b.y - a.y)
      : (cutValue - a.x) / (b.x - a.x);
    return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  };

  const output: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = points[(i + points.length - 1) % points.length];
    if (inside(curr)) {
      if (!inside(prev)) output.push(intersect(prev, curr));
      output.push(curr);
    } else if (inside(prev)) {
      output.push(intersect(prev, curr));
    }
  }
  return output;
}

/** Binary search to find cut position that gives target area ratio */
export function findCutPosition(
  originalPoints: Point[],
  R_phase1: number,
  axis: 'horizontal' | 'vertical'
): number {
  const totalArea = shoelaceArea(originalPoints);
  const targetArea = R_phase1 * totalArea;

  const coords = originalPoints.map((p) => axis === 'horizontal' ? p.y : p.x);
  let lo = Math.min(...coords);
  let hi = Math.max(...coords);

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const clipped = clipPolygon(originalPoints, mid, axis, 'above');
    const clippedArea = shoelaceArea(clipped);

    if (Math.abs(clippedArea - targetArea) < 0.01) break;
    if (clippedArea > targetArea) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

// ─── Phase Parameter Scaling ───

export interface OriginalProjectData {
  totalFootprintM2: number;
  demolitionVolume: number;
  equipmentHours: number;
  constructionDays: number;
  lvTripsConstruction: number;
  hvTripsConstruction: number;
  lvTripsOperational: number;
  hvTripsOperational: number;
}

export interface PhaseData {
  footprintM2: number;
  ratio: number;
  demolitionVolume: number;
  equipmentHours: number;
  constructionDays: number;
  lvTripsConstruction: number;
  hvTripsConstruction: number;
  lvTripsOperational: number;
  hvTripsOperational: number;
}

export function scalePhaseData(
  original: OriginalProjectData,
  ratio: number
): PhaseData {
  return {
    footprintM2: Math.round(original.totalFootprintM2 * ratio),
    ratio,
    demolitionVolume: Math.round(original.demolitionVolume * ratio),
    equipmentHours: Math.round(original.equipmentHours * ratio),
    constructionDays: Math.round(original.constructionDays * ratio),
    lvTripsConstruction: Math.round(original.lvTripsConstruction * ratio),
    hvTripsConstruction: Math.round(original.hvTripsConstruction * ratio),
    lvTripsOperational: Math.round(original.lvTripsOperational * ratio),
    hvTripsOperational: Math.round(original.hvTripsOperational * ratio),
  };
}

/** Ensure phase1 + phase2 = original (no rounding drift) */
export function computePhases(
  original: OriginalProjectData,
  phase1Ratio: number
): { phase1: PhaseData; phase2: PhaseData } {
  const phase1 = scalePhaseData(original, phase1Ratio);
  const phase2: PhaseData = {
    footprintM2: original.totalFootprintM2 - phase1.footprintM2,
    ratio: 1 - phase1Ratio,
    demolitionVolume: original.demolitionVolume - phase1.demolitionVolume,
    equipmentHours: original.equipmentHours - phase1.equipmentHours,
    constructionDays: original.constructionDays - phase1.constructionDays,
    lvTripsConstruction: original.lvTripsConstruction - phase1.lvTripsConstruction,
    hvTripsConstruction: original.hvTripsConstruction - phase1.hvTripsConstruction,
    lvTripsOperational: original.lvTripsOperational - phase1.lvTripsOperational,
    hvTripsOperational: original.hvTripsOperational - phase1.hvTripsOperational,
  };
  return { phase1, phase2 };
}

// Mock original project data
export const MOCK_ORIGINAL_DATA: OriginalProjectData = {
  totalFootprintM2: 63,
  demolitionVolume: 450,
  equipmentHours: 2400,
  constructionDays: 180,
  lvTripsConstruction: 30000,
  hvTripsConstruction: 4800,
  lvTripsOperational: 50000,
  hvTripsOperational: 8000,
};

// Mock emission values
export const MOCK_PROJECT_EMISSION = 18.2;
export const MOCK_THRESHOLD = 12.5;
