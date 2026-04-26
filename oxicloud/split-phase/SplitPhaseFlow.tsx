import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import {
  SplitPhaseStep,
  SplitPhaseCalculation,
  PhaseProject,
  PerSourceRatios,
  EmissionSourceCode,
  computeComplianceRatio,
  computeMinimumRatio,
  computeWorstCaseRatio,
  computeBindingEmissionType,
  createPhaseProjects,
} from '@/types/splitPhase';
import * as turf from '@turf/turf';

import { SplitPhaseIntroScreen } from './SplitPhaseIntroScreen';
import { SplitPhaseCalculationScreen } from './SplitPhaseCalculationScreen';
import { SplitPhaseFootprintScreen } from './SplitPhaseFootprintScreen';
import { SplitPhasePreviewScreen } from './SplitPhasePreviewScreen';
import { SplitPhaseConfirmationScreen } from './SplitPhaseConfirmationScreen';
import { SplitPhaseCompleteScreen } from './SplitPhaseCompleteScreen';

interface SplitPhaseFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

/** Compute total footprint area from building footprint coordinates using Turf */
function computeTotalFootprintArea(footprintCoords: number[][][]): number {
  let total = 0;
  for (const ring of footprintCoords) {
    if (ring.length < 3) continue;
    try {
      const turfCoords = ring.map(([lat, lng]) => [lng, lat]);
      turfCoords.push(turfCoords[0]); // close ring
      const polygon = turf.polygon([turfCoords]);
      total += turf.area(polygon);
    } catch { /* skip invalid */ }
  }
  return Math.round(total);
}

export function SplitPhaseFlow({
  project,
  results,
  onComplete,
  onBack,
}: SplitPhaseFlowProps) {
  const [step, setStep] = useState<SplitPhaseStep>('intro');
  const [phase1Footprint, setPhase1Footprint] = useState<number>(0);

  // Extract real project data from preEstimation
  const mapData = project.preEstimation?.mapData;
  const projectCenter: [number, number] | undefined = mapData?.projectCoordinates
    ? [mapData.projectCoordinates.lat, mapData.projectCoordinates.lon]
    : undefined;
  const plotCoords: [number, number][] | undefined = mapData?.plotCoordinates
    ? (mapData.plotCoordinates as [number, number][])
    : undefined;
  const buildingFootprints: [number, number][][] | undefined = mapData?.footprintCoords
    ? (mapData.footprintCoords as [number, number][][])
    : undefined;

  // Compute real total footprint from building polygons, fallback to GFA
  const totalFootprint = useMemo(() => {
    if (mapData?.footprintCoords && mapData.footprintCoords.length > 0) {
      const computed = computeTotalFootprintArea(mapData.footprintCoords);
      if (computed > 0) return computed;
    }
    // Fallback to gross floor area from preEstimation entries
    const entries = project.preEstimation?.projectTypeEntries;
    if (entries && entries.length > 0) {
      return entries.reduce((sum, e) => sum + (e.gfa || 0), 0);
    }
    return 1200; // final fallback
  }, [mapData, project.preEstimation]);

  const originalData = useMemo(() => ({
    totalFootprint,
    demolitionVolume: project.preEstimation?.sloopEntry?.demolitionVolume || 450,
    equipmentHours: 2400,
    trafficLV: 30000,
    trafficHV: 4800,
    operationalEquipment: 650,
    operationalTrafficLV: 50000,
    operationalTrafficHV: 8000,
    constructionDuration: 180,
  }), [totalFootprint, project.preEstimation]);

  // Calculate the split phase parameters (Spec §18.2)
  const calculation = useMemo((): SplitPhaseCalculation => {
    const projectEmission = 18.2; // Total project emissions in kg NOx
    const threshold = 12.5; // Legal threshold
    const minimumUtilizationRatio = 0.7;
    const safetyMargin = 0.97;

    const complianceRatio = computeComplianceRatio(projectEmission, threshold);
    const minimumRatio = computeMinimumRatio(projectEmission, threshold, minimumUtilizationRatio);

    // Per-source R_compliance ratios (6-code taxonomy, Spec §3 + §18.4).
    // op_ps = null when screening gate excludes the source.
    const opPsExcluded = true;
    const perSourceRatios: PerSourceRatios = {
      cp_ps:    0.621,
      cp_ls_lv: 0.598,
      cp_ls_hv: 0.712,
      op_ps:    opPsExcluded ? null : 0.640,
      op_ls_lv: 0.570,
      op_ls_hv: 0.634,
    };

    const ratioValues = (Object.values(perSourceRatios).filter(v => v !== null) as number[]);
    const candidateRatio = complianceRatio * safetyMargin;
    const worstCase = computeWorstCaseRatio(ratioValues, complianceRatio);
    // Enforce 70% floor (R_min) — Spec §18.2 Constraint B
    const finalRatio = Math.max(minimumRatio, worstCase);
    const bindingEmissionType = computeBindingEmissionType(perSourceRatios);

    return {
      projectEmission,
      threshold,
      minimumUtilizationRatio,
      complianceRatio,
      minimumRatio,
      candidateRatio,
      finalRatio,
      safetyMarginApplied: safetyMargin,
      perSourceRatios,
      bindingEmissionType,
      phase1: null,
      phase2: null,
    };
  }, []);

  // Create phase projects based on footprint
  const phases = useMemo(() => {
    const ratio = phase1Footprint > 0 
      ? phase1Footprint / originalData.totalFootprint 
      : calculation.finalRatio;
    
    return createPhaseProjects(project.id, ratio, originalData);
  }, [project.id, phase1Footprint, originalData, calculation.finalRatio]);

  // Navigation handlers
  const handleIntroNext = () => setStep('calculation');
  const handleCalculationNext = () => setStep('footprint_map');
  const handleFootprintConfirm = (footprint: number) => {
    setPhase1Footprint(footprint);
    setStep('phase1_preview');
  };
  const handlePreviewNext = () => setStep('confirmation');
  const handleConfirmation = () => {
    toast.success('Split phase simulation complete', {
      description: 'Phase reports are ready for export.',
    });
    setStep('complete');
  };

  const handleDownloadPhase1 = () => {
    toast.info('Preparing Phase 1 report...', {
      description: 'Your PDF will be ready in a moment.',
    });
  };

  const handleDownloadPhase2 = () => {
    toast.info('Preparing Phase 2 report...', {
      description: 'Your PDF will be ready in a moment.',
    });
  };

  // Back navigation
  const getBackHandler = () => {
    switch (step) {
      case 'intro': return onBack;
      case 'calculation': return () => setStep('intro');
      case 'footprint_map': return () => setStep('calculation');
      case 'phase1_preview': return () => setStep('footprint_map');
      case 'confirmation': return () => setStep('phase1_preview');
      case 'complete': return onComplete;
      default: return onBack;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {step === 'intro' && (
          <SplitPhaseIntroScreen
            projectEmission={calculation.projectEmission}
            threshold={calculation.threshold}
            onContinue={handleIntroNext}
            onBack={onBack}
          />
        )}

        {step === 'calculation' && (
          <SplitPhaseCalculationScreen
            calculation={calculation}
            onContinue={handleCalculationNext}
            onBack={() => setStep('intro')}
          />
        )}

        {step === 'footprint_map' && (
          <SplitPhaseFootprintScreen
            calculation={calculation}
            totalFootprint={originalData.totalFootprint}
            plotCoordinates={plotCoords}
            buildingFootprints={buildingFootprints}
            projectCoordinates={projectCenter}
            onConfirm={handleFootprintConfirm}
            onBack={() => setStep('calculation')}
          />
        )}

        {step === 'phase1_preview' && (
          <SplitPhasePreviewScreen
            calculation={calculation}
            phase1={phases.phase1}
            phase2={phases.phase2}
            onContinue={handlePreviewNext}
            onBack={() => setStep('footprint_map')}
          />
        )}

        {step === 'confirmation' && (
          <SplitPhaseConfirmationScreen
            phase1={phases.phase1}
            phase2={phases.phase2}
            onConfirm={handleConfirmation}
            onBack={() => setStep('phase1_preview')}
          />
        )}

        {step === 'complete' && (
          <SplitPhaseCompleteScreen
            phase1={phases.phase1}
            phase2={phases.phase2}
            projectName={project.name}
            onDownloadPhase1={handleDownloadPhase1}
            onDownloadPhase2={handleDownloadPhase2}
            onBackToProjects={onComplete}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}