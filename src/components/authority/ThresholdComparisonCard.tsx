import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertTriangle, Scale, Info } from 'lucide-react';
import { SubmittedProject } from '@/pages/dashboard/AuthorityDashboard';
import { cn } from '@/lib/utils';

interface ThresholdComparisonCardProps {
  project: SubmittedProject;
}

export function ThresholdComparisonCard({ project }: ThresholdComparisonCardProps) {
  const threshold = 1.0; // 1% de minimis
  const progressValue = Math.min((project.overallImpactPercent / threshold) * 100, 100);
  
  const getProgressColor = () => {
    if (project.overallImpactPercent >= threshold) return 'bg-red-500';
    if (project.overallImpactPercent >= threshold * 0.8) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Threshold Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Threshold & Legal Logic
          </CardTitle>
          <CardDescription>
            Clear comparison of calculated impact vs legal threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Project NOₓ Impact</span>
              <span className={cn(
                "font-bold text-lg",
                project.overallImpactPercent >= threshold ? "text-red-600" :
                project.overallImpactPercent >= threshold * 0.8 ? "text-amber-600" : "text-green-600"
              )}>
                {project.overallImpactPercent.toFixed(3)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={progressValue} className="h-4" />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-foreground"
                style={{ left: '100%', transform: 'translateX(-2px)' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium text-foreground">Legal Threshold: {threshold.toFixed(2)}%</span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg">
            <div className="text-center p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Calculated Impact</p>
              <p className={cn(
                "text-4xl font-bold",
                project.overallImpactPercent >= threshold ? "text-red-600" : "text-green-600"
              )}>
                {project.overallImpactPercent.toFixed(3)}%
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Legal Threshold</p>
              <p className="text-4xl font-bold text-foreground">
                {threshold.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Explanation */}
      <Card className={cn(
        "border-2",
        project.legalDecision === 'below_threshold' ? "border-green-500/30 bg-green-500/5" :
        project.legalDecision === 'conditional' ? "border-amber-500/30 bg-amber-500/5" :
        "border-red-500/30 bg-red-500/5"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {project.legalDecision === 'below_threshold' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {project.legalDecision === 'conditional' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {project.legalDecision === 'exceeds_threshold' && <XCircle className="h-5 w-5 text-red-500" />}
            Why This Result?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.legalDecision === 'below_threshold' && (
            <>
              <p className="text-green-700">
                The project's calculated NOₓ contribution ({project.overallImpactPercent.toFixed(3)}%) 
                is below the 1% de minimis threshold established by the Stikstofdecreet.
              </p>
              <div className="p-4 bg-background rounded-lg border border-green-200">
                <p className="text-sm font-medium mb-2">Legal Basis:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Stikstofdecreet Art. 8.2: Projects below 1% impact are eligible for permit</li>
                  <li>• Habitatrichtlijn Art. 6(3): No significant effect determination</li>
                  <li>• VITO Guidelines §5.1: De minimis threshold application</li>
                </ul>
              </div>
            </>
          )}
          
          {project.legalDecision === 'conditional' && (
            <>
              <p className="text-amber-700">
                The project's calculated NOₓ contribution ({project.overallImpactPercent.toFixed(3)}%) 
                is approaching the 1% threshold and requires additional review.
              </p>
              <div className="p-4 bg-background rounded-lg border border-amber-200">
                <p className="text-sm font-medium mb-2">Required Actions:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Verify input data accuracy with applicant</li>
                  <li>• Consider mitigation measures if available</li>
                  <li>• Review cumulative impact with nearby projects</li>
                </ul>
              </div>
            </>
          )}
          
          {project.legalDecision === 'exceeds_threshold' && (
            <>
              <p className="text-red-700">
                The project's calculated NOₓ contribution ({project.overallImpactPercent.toFixed(3)}%) 
                exceeds the 1% de minimis threshold established by the Stikstofdecreet.
              </p>
              <div className="p-4 bg-background rounded-lg border border-red-200">
                <p className="text-sm font-medium mb-2">Legal Consequence:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Stikstofdecreet Art. 8.3: Project requires passende beoordeling</li>
                  <li>• Alternative 1: Reduce project scope to lower emissions</li>
                  <li>• Alternative 2: Implement compensatory measures</li>
                  <li>• Alternative 3: Reject permit application</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Protected Site Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Protected Site Affected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Natura2000 Site</p>
                <p className="font-semibold text-lg">{project.natura2000Site}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Site Code</p>
                <p className="font-mono">{project.natura2000Code}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Distance from Project</p>
                <p className="font-semibold text-lg">{project.distanceToSite} meters</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Deposition Value (KDW)</p>
                <p className="font-semibold text-lg">{project.kdwValue} kg N/ha/yr</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
