import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Database, Lock, Shield, Clock, FileText } from 'lucide-react';
import { SubmittedProject } from '@/pages/dashboard/AuthorityDashboard';

interface DatasetVersionPanelProps {
  project: SubmittedProject;
}

export function DatasetVersionPanel({ project }: DatasetVersionPanelProps) {
  const datasets = [
    {
      icon: Database,
      title: "Calculation Engine",
      version: project.engineVersion,
      description: "OxiCloud NOₓ calculation core",
      validFrom: "2025-01-01",
      validUntil: "Current",
      status: "active"
    },
    {
      icon: FileText,
      title: "Emission Factor Dataset",
      version: project.datasetVersion,
      description: "VITO official emission factors",
      validFrom: "2025-01-01",
      validUntil: "2025-03-31",
      status: "active"
    },
    {
      icon: Shield,
      title: "Legal Framework",
      version: project.legalFrameworkVersion,
      description: "Stikstofdecreet and related regulations",
      validFrom: "2024-07-01",
      validUntil: "Until amendment",
      status: "active"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Data Integrity Guarantee</p>
              <p className="text-sm text-muted-foreground">
                All calculations are performed using identical, versioned datasets. 
                Both applicants and authorities see results from the same OxiCloud calculation core.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Cards */}
      <div className="grid gap-4">
        {datasets.map((dataset, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <dataset.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{dataset.title}</h3>
                      <p className="text-sm text-muted-foreground">{dataset.description}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Current
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Version</p>
                      <p className="font-mono font-medium">{dataset.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid From</p>
                      <p className="font-medium">{dataset.validFrom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid Until</p>
                      <p className="font-medium">{dataset.validUntil}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calculation Timestamp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Calculation Timestamp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Calculation Performed At</p>
              <p className="font-mono font-semibold text-lg">
                {new Date(project.calculatedAt).toLocaleString('nl-BE', {
                  dateStyle: 'full',
                  timeStyle: 'medium'
                })}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Submission Received At</p>
              <p className="font-mono font-semibold text-lg">
                {new Date(project.submissionDate).toLocaleString('nl-BE', {
                  dateStyle: 'full'
                })}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 border rounded-lg bg-background">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This calculation is cryptographically timestamped and cannot be altered. 
                The version snapshot above reflects the exact datasets used at calculation time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One Core Promise */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">One Core. One Truth.</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Applicants and authorities use the same OxiCloud calculation engine. 
                There are no separate versions, no hidden parameters, no possibility for manipulation.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <Badge variant="outline" className="text-sm">Same Engine</Badge>
              <Badge variant="outline" className="text-sm">Same Datasets</Badge>
              <Badge variant="outline" className="text-sm">Same Legal Logic</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
