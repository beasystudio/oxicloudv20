import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OxiCloudProject, AssessmentRequest, ASSESSMENT_STATUS_CONFIG } from '@/types/oxicloud';
import { CheckCircle2, XCircle, ChevronRight, FileText, Clock, ArrowLeft, Send, CalendarClock, Leaf, Hammer, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessmentRequestByProjectId, createAssessmentRequest } from '@/lib/oxicloudStore';
import { toast } from 'sonner';
import { NoxResultFlow } from './NoxResultFlow';
import { applyMockOutcome, MOCK_COMPLIANCE_EVENT } from '@/components/dev/MockComplianceToggle';

interface OxiCloudResultScreenProps {
  project: OxiCloudProject;
  onBack: () => void;
  onRecalculate: () => void;
  onBackToDashboard: () => void;
}

export function OxiCloudResultScreen({
  project,
  onBack,
  onRecalculate,
  onBackToDashboard
}: OxiCloudResultScreenProps) {
  const [mockVersion, setMockVersion] = useState(0);

  useEffect(() => {
    const handleMockChange = () => setMockVersion((value) => value + 1);
    window.addEventListener(MOCK_COMPLIANCE_EVENT, handleMockChange);
    window.addEventListener('storage', handleMockChange);

    return () => {
      window.removeEventListener(MOCK_COMPLIANCE_EVENT, handleMockChange);
      window.removeEventListener('storage', handleMockChange);
    };
  }, []);

  const results = useMemo(() => {
    const baseResults = project.calculationResults;
    if (!baseResults) return baseResults;

    return {
      ...baseResults,
      compliance_status: applyMockOutcome(baseResults.compliance_status),
    };
  }, [project.calculationResults, mockVersion]);

  const hasValidResults = results && typeof results.max_nox_stationary === 'number' && typeof results.compliance_status === 'string';
  
  if (!hasValidResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-muted-foreground mb-4">No calculation results available.</p>
        <Button onClick={onBack}>Go Back & Calculate</Button>
      </div>
    );
  }

  // Use the new result flow component
  return (
    <NoxResultFlow
      project={project}
      results={results}
      onBackToProjects={onBackToDashboard}
      onRecalculate={onRecalculate}
    />
  );
}