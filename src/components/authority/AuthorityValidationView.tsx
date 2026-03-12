import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileCheck, FileText, Database, Scale, History, Shield, BookOpen, ExternalLink, Download, MessageSquare } from 'lucide-react';
import { SubmittedProject } from '@/pages/dashboard/AuthorityDashboard';
import { cn } from '@/lib/utils';
import { ValidationStepCard } from './ValidationStepCard';
import { ThresholdComparisonCard } from './ThresholdComparisonCard';
import { DatasetVersionPanel } from './DatasetVersionPanel';
import { DecisionAuditTrail } from './DecisionAuditTrail';
interface AuthorityValidationViewProps {
  project: SubmittedProject;
  onBack: () => void;
}
export function AuthorityValidationView({
  project,
  onBack
}: AuthorityValidationViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [internalNotes, setInternalNotes] = useState('');
  const getDecisionColor = () => {
    switch (project.legalDecision) {
      case 'below_threshold':
        return 'text-green-600';
      case 'conditional':
        return 'text-amber-600';
      case 'exceeds_threshold':
        return 'text-red-600';
    }
  };
  const getDecisionBg = () => {
    switch (project.legalDecision) {
      case 'below_threshold':
        return 'bg-green-500/10 border-green-500/30';
      case 'conditional':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'exceeds_threshold':
        return 'bg-red-500/10 border-red-500/30';
    }
  };
  const getDecisionIcon = () => {
    switch (project.legalDecision) {
      case 'below_threshold':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'conditional':
        return <AlertTriangle className="h-8 w-8 text-amber-500" />;
      case 'exceeds_threshold':
        return;
    }
  };
  const getDecisionText = () => {
    switch (project.legalDecision) {
      case 'below_threshold':
        return 'Project NOₓ impact is below the 1% de minimis threshold';
      case 'conditional':
        return 'Project requires additional review before final decision';
      case 'exceeds_threshold':
        return 'Project NOₓ impact exceeds the 1% de minimis threshold';
    }
  };
  return <div className="space-y-6 pb-24">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.projectName}</h1>
            <Badge variant="outline" className="font-mono">{project.projectId}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Submitted by {project.applicant} ({project.applicantCompany}) • {new Date(project.submissionDate).toLocaleDateString('nl-BE')}
          </p>
        </div>
        
      </div>

      {/* Legal Decision Preview Card */}
      <Card className={cn("border-2", getDecisionBg())}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Legal Decision Preview</p>
              <h2 className={cn("text-2xl font-bold mt-1", getDecisionColor())}>
                {project.legalDecision === 'below_threshold' && '✅ Eligible for Approval'}
                {project.legalDecision === 'conditional' && '⚠️ Conditional Review Required'}
                {project.legalDecision === 'exceeds_threshold' && '❌ Recommended for Rejection'}
              </h2>
              <p className="text-muted-foreground mt-2">{getDecisionText()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Overall Impact</p>
              <p className={cn("text-4xl font-bold", getDecisionColor())}>
                {project.overallImpactPercent.toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground">of 1% threshold</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="overview" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calculation" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Calculation Steps
          </TabsTrigger>
          <TabsTrigger value="threshold" className="gap-2">
            <Scale className="h-4 w-4" />
            Threshold Logic
          </TabsTrigger>
          <TabsTrigger value="datasets" className="gap-2">
            <Database className="h-4 w-4" />
            Data Versions
          </TabsTrigger>
          <TabsTrigger value="decision" className="gap-2">
            <History className="h-4 w-4" />
            Decision & Audit
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Project Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project ID</p>
                    <p className="font-medium font-mono">{project.projectId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submission Date</p>
                    <p className="font-medium">{new Date(project.submissionDate).toLocaleDateString('nl-BE')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applicant</p>
                    <p className="font-medium">{project.applicant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{project.applicantCompany}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{project.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Natura2000 Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Protected Area Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Natura2000 Site</p>
                    <p className="font-medium">{project.natura2000Site}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Site Code</p>
                    <p className="font-medium font-mono">{project.natura2000Code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance to Site</p>
                    <p className="font-medium">{project.distanceToSite} meters</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KDW Value</p>
                    <p className="font-medium">{project.kdwValue} kg N/ha/yr</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Calculation performed at</span>
                  <span className="font-mono text-sm">{new Date(project.calculatedAt).toLocaleString('nl-BE')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Verification Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                At-a-Glance Verification
              </CardTitle>
              <CardDescription>
                Key checkpoints for permit decision — all using the same OxiCloud calculation core
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
                  <p className="text-sm font-medium">Input Data Valid</p>
                  <p className="text-xs text-muted-foreground mt-1">All required fields complete</p>
                </div>
                <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
                  <p className="text-sm font-medium">Official Datasets Used</p>
                  <p className="text-xs text-muted-foreground mt-1">VITO-EF-2025-Q1</p>
                </div>
                <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
                  <p className="text-sm font-medium">Legal Framework Current</p>
                  <p className="text-xs text-muted-foreground mt-1">Stikstofdecreet v1.2</p>
                </div>
                <div className={cn("p-4 rounded-lg border", project.legalDecision === 'below_threshold' ? "bg-green-500/5 border-green-500/20" : project.legalDecision === 'conditional' ? "bg-amber-500/5 border-amber-500/20" : "bg-red-500/5 border-red-500/20")}>
                  {project.legalDecision === 'below_threshold' ? <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" /> : project.legalDecision === 'conditional' ? <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" /> : <XCircle className="h-5 w-5 text-red-500 mb-2" />}
                  <p className="text-sm font-medium">Threshold Check</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {project.overallImpactPercent.toFixed(2)}% of 1% limit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculation Steps Tab */}
        <TabsContent value="calculation" className="mt-6 space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm">Glass-Box View: Each step below shows how the calculation was performed, using the same OxiCloud engine as the applicant. <strong>Glass-Box View:</strong> Each step below shows how the calculation was performed, 
                using the same OxiCloud engine as the applicant. No raw formulas — just clear verification checkpoints.
              </p>
            </CardContent>
          </Card>

          <ValidationStepCard stepNumber={1} title="Activity Classification" status="passed" description="How inputs were classified into emission categories" details={[{
          label: "Project Type",
          value: "Residential + Commercial Mixed-Use"
        }, {
          label: "Construction Category",
          value: "New Construction (Nieuwbouw)"
        }, {
          label: "Activity Classification",
          value: "Housing > 50 units + Retail"
        }]} legalReference="Stikstofdecreet Art. 5.1" />

          <ValidationStepCard stepNumber={2} title="Emission Factors Applied" status="passed" description="Official emission datasets and versions used" details={[{
          label: "Emission Factor Dataset",
          value: "VITO-EF-2025-Q1"
        }, {
          label: "Source Category",
          value: "Residential Construction"
        }, {
          label: "Effective Date",
          value: "01 January 2025"
        }, {
          label: "Dataset Valid Until",
          value: "31 March 2025"
        }]} legalReference="VITO Technical Guidelines §3.2" />

          <ValidationStepCard stepNumber={3} title="Spatial Allocation" status="passed" description="Location reference and grid resolution" details={[{
          label: "Project Coordinates",
          value: "50.8789° N, 4.6987° E"
        }, {
          label: "Grid Resolution",
          value: "100m × 100m"
        }, {
          label: "Nearest Natura2000 Site",
          value: `${project.natura2000Site} (${project.natura2000Code})`
        }, {
          label: "Distance to Boundary",
          value: `${project.distanceToSite} meters`
        }]} legalReference="Habitatrichtlijn Art. 6" />

          <ValidationStepCard stepNumber={4} title="Deposition Calculation" status={project.legalDecision === 'exceeds_threshold' ? 'failed' : 'passed'} description="Final contribution value and threshold comparison" details={[{
          label: "Calculated NOₓ Contribution",
          value: `${project.overallImpactPercent.toFixed(3)}%`
        }, {
          label: "Legal Threshold",
          value: "1.00% (de minimis)"
        }, {
          label: "KDW Value Applied",
          value: `${project.kdwValue} kg N/ha/yr`
        }, {
          label: "Result",
          value: project.legalDecision === 'below_threshold' ? 'PASS' : project.legalDecision === 'conditional' ? 'CONDITIONAL' : 'FAIL'
        }]} legalReference="Stikstofdecreet Art. 8.2" />
        </TabsContent>

        {/* Threshold & Legal Logic Tab */}
        <TabsContent value="threshold" className="mt-6">
          <ThresholdComparisonCard project={project} />
        </TabsContent>

        {/* Data Versions Tab */}
        <TabsContent value="datasets" className="mt-6">
          <DatasetVersionPanel project={project} />
        </TabsContent>

        {/* Decision & Audit Tab */}
        <TabsContent value="decision" className="mt-6">
          <DecisionAuditTrail project={project} internalNotes={internalNotes} onNotesChange={setInternalNotes} />
        </TabsContent>
      </Tabs>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="h-4 w-4" />
              Reject Application
            </Button>
            <Button variant="outline" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              Request Changes
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Approve Application
            </Button>
          </div>
        </div>
      </div>
    </div>;
}