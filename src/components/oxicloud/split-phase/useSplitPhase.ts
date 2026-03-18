import { useState, useCallback, useMemo } from 'react';
import {
  calculateSplitPhase,
  computePhases,
  Point,
  shoelaceArea,
  PhaseData,
  SplitPhaseResult,
  OriginalProjectData,
  MOCK_ORIGINAL_DATA,
  MOCK_PROJECT_EMISSION,
  MOCK_THRESHOLD,
} from './splitPhaseEngine';

export type SplitPhaseStep =
  | 'entry'
  | 'stap1'
  | 'stap2'
  | 'stap3'
  | 'stap4'
  | 'completion1'
  | 'completion2';

export interface SplitPhaseSession {
  // Layer 1 — immutable after stap1
  projectEmission: number;
  threshold: number;
  calcResult: SplitPhaseResult | null;

  // Layer 2 — set at footprint confirmation
  phase1Polygon: Point[];
  phase1AreaM2: number;
  phase1Ratio: number;
  phase2AreaM2: number;
  phase2Ratio: number;
  phase1Data: PhaseData | null;
  phase2Data: PhaseData | null;

  // Layer 3 — legal checkboxes
  checkboxes: [boolean, boolean, boolean];
  confirmedAt: string | null;

  // UI
  currentStep: SplitPhaseStep;
}

export interface AuditEvent {
  id: string;
  event: string;
  timestamp: string;
  phase?: string;
  details?: string;
}

export function useSplitPhase() {
  const [session, setSession] = useState<SplitPhaseSession>({
    projectEmission: MOCK_PROJECT_EMISSION,
    threshold: MOCK_THRESHOLD,
    calcResult: null,
    phase1Polygon: [],
    phase1AreaM2: 0,
    phase1Ratio: 0,
    phase2AreaM2: 0,
    phase2Ratio: 0,
    phase1Data: null,
    phase2Data: null,
    checkboxes: [false, false, false],
    confirmedAt: null,
    currentStep: 'entry',
  });

  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);

  const addAudit = useCallback((event: string, phase?: string, details?: string) => {
    setAuditLog((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        event,
        timestamp: new Date().toISOString(),
        phase,
        details,
      },
    ]);
  }, []);

  const originalData: OriginalProjectData = MOCK_ORIGINAL_DATA;

  // Entry → Stap 1: run calculation
  const runCalculation = useCallback(() => {
    const result = calculateSplitPhase(session.projectEmission, session.threshold);
    setSession((s) => ({
      ...s,
      calcResult: result,
      currentStep: 'stap1',
    }));
    addAudit('split_initiated');
    addAudit('calculation_complete', undefined, result.bindingEmissionType);
  }, [session.projectEmission, session.threshold, addAudit]);

  // Stap 1 → Stap 2
  const goToStap2 = useCallback(() => {
    setSession((s) => ({ ...s, currentStep: 'stap2' }));
  }, []);

  // Stap 2 → Stap 3: confirm footprint
  const confirmFootprint = useCallback(
    (polygon: Point[], areaM2: number, totalM2: number) => {
      const ratio = areaM2 / totalM2;
      const { phase1, phase2 } = computePhases(originalData, ratio);
      setSession((s) => ({
        ...s,
        phase1Polygon: polygon,
        phase1AreaM2: areaM2,
        phase1Ratio: ratio,
        phase2AreaM2: totalM2 - areaM2,
        phase2Ratio: 1 - ratio,
        phase1Data: phase1,
        phase2Data: phase2,
        currentStep: 'stap3',
      }));
      addAudit('footprint_confirmed', 'PHASE_1', `${areaM2} m², ${(ratio * 100).toFixed(0)}%`);
    },
    [originalData, addAudit]
  );

  // Stap 3 → Stap 4
  const goToStap4 = useCallback(() => {
    addAudit('preview_reviewed');
    setSession((s) => ({ ...s, currentStep: 'stap4' }));
  }, [addAudit]);

  // Toggle checkbox
  const toggleCheckbox = useCallback((index: 0 | 1 | 2) => {
    setSession((s) => {
      const newCb = [...s.checkboxes] as [boolean, boolean, boolean];
      newCb[index] = !newCb[index];
      return { ...s, checkboxes: newCb };
    });
  }, []);

  // Stap 4 → Completion 1: generate reports
  const generateReports = useCallback(() => {
    addAudit('declarations_confirmed');
    addAudit('reports_generated', 'PHASE_1');
    addAudit('reports_generated', 'PHASE_2');
    setSession((s) => ({
      ...s,
      confirmedAt: new Date().toISOString(),
      currentStep: 'completion1',
    }));
  }, [addAudit]);

  // Go to completion 2
  const goToCompletion2 = useCallback(() => {
    setSession((s) => ({ ...s, currentStep: 'completion2' }));
  }, []);

  // Back navigation with contract enforcement
  const goBack = useCallback((from: SplitPhaseStep) => {
    switch (from) {
      case 'stap1':
        setSession((s) => ({ ...s, currentStep: 'entry' }));
        break;
      case 'stap2':
        // Polygon preserved
        setSession((s) => ({ ...s, currentStep: 'stap1' }));
        break;
      case 'stap3':
        // Polygon preserved
        setSession((s) => ({ ...s, currentStep: 'stap2' }));
        break;
      case 'stap4':
        // CHECKBOXES RESET
        setSession((s) => ({
          ...s,
          checkboxes: [false, false, false],
          confirmedAt: null,
          currentStep: 'stap3',
        }));
        break;
      // completion → anywhere is BLOCKED
      default:
        break;
    }
  }, []);

  const exportReport = useCallback(
    (phase: string) => {
      addAudit('report_exported', phase);
    },
    [addAudit]
  );

  const excessPercent = useMemo(() => {
    return Math.round(((session.projectEmission / session.threshold) * 100) - 100);
  }, [session.projectEmission, session.threshold]);

  return {
    session,
    auditLog,
    originalData,
    excessPercent,
    runCalculation,
    goToStap2,
    confirmFootprint,
    goToStap4,
    toggleCheckbox,
    generateReports,
    goToCompletion2,
    goBack,
    exportReport,
  };
}
