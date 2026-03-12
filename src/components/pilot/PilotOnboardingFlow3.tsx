import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  getPilotProjects,
  addPilotQuote,
  updatePilotQuote,
  updatePilotProject,
  addPilotReport,
  updatePilotReport,
  simulatePilotPayment,
  completeOnboardingFlow,
  PilotProject,
  PilotQuote,
} from '@/lib/pilotSessionStore';

interface Props {
  onComplete: () => void;
  onClose: () => void;
}

type Step = 'pre-estimation' | 'quote-preview' | 'awaiting-payment' | 'payment-simulation' | 'nox-assessment' | 'report-complete';

export function PilotOnboardingFlow3({ onComplete, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('pre-estimation');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const projects = getPilotProjects();
  const latestProject = projects[projects.length - 1];

  const [estimationData, setEstimationData] = useState({
    projectType: 'residential',
    buildingSize: '1500',
    constructionDuration: '18',
    demolitionArea: '500',
  });

  const [currentQuote, setCurrentQuote] = useState<PilotQuote | null>(null);

  const calculateQuoteAmount = () => {
    const basePrice = 850;
    const sizeMultiplier = parseInt(estimationData.buildingSize) > 1000 ? 1.2 : 1;
    const amount = basePrice * sizeMultiplier;
    const vatAmount = amount * 0.21;
    return {
      amount: Math.round(amount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round((amount + vatAmount) * 100) / 100,
    };
  };

  const handleGenerateQuote = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pricing = calculateQuoteAmount();
    const quote = addPilotQuote({
      projectId: latestProject?.id || '',
      amount: pricing.amount,
      vatAmount: pricing.vatAmount,
      totalAmount: pricing.totalAmount,
    });

    setCurrentQuote(quote);
    setIsProcessing(false);
    setCurrentStep('quote-preview');
  };

  const handleSendQuote = async () => {
    if (!currentQuote) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    updatePilotQuote(currentQuote.id, {
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    updatePilotProject(latestProject.id, {
      status: 'quoted',
    });

    setCurrentQuote(prev => prev ? { ...prev, status: 'sent' } : null);
    setIsProcessing(false);
    setCurrentStep('awaiting-payment');
  };

  const handleSimulatePayment = async () => {
    if (!currentQuote || !latestProject) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    simulatePilotPayment(latestProject.id, currentQuote.id);
    
    setCurrentQuote(prev => prev ? { ...prev, status: 'paid' } : null);
    setIsProcessing(false);
    toast.success('Payment successful (simulated)');
    setCurrentStep('nox-assessment');
  };

  const handleRunAssessment = async () => {
    if (!currentQuote || !latestProject) return;

    setIsProcessing(true);
    
    // Create report
    const report = addPilotReport({
      projectId: latestProject.id,
      quoteId: currentQuote.id,
      type: 'nox_screening',
    });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Complete report with pass result
    updatePilotReport(report.id, {
      status: 'completed',
      result: 'pass',
      pdfUrl: '/demo-nox-report.pdf',
      completedAt: new Date().toISOString(),
    });

    updatePilotProject(latestProject.id, {
      status: 'completed',
    });

    setIsProcessing(false);
    setCurrentStep('report-complete');
  };

  const handleComplete = () => {
    completeOnboardingFlow(3);
    toast.success('Congratulations! You completed the full workflow.');
    onComplete();
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'pre-estimation': return 1;
      case 'quote-preview': return 2;
      case 'awaiting-payment': return 3;
      case 'payment-simulation': return 3;
      case 'nox-assessment': return 4;
      case 'report-complete': return 5;
    }
  };

  if (!latestProject) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-border/50">
          <h2 className="text-xl font-semibold">No Project Found</h2>
          <p className="text-muted-foreground text-sm">
            Please create a project first before generating a quote.
          </p>
          <Button onClick={onClose}>Close</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {currentStep === 'pre-estimation' && 'Pre-Estimation'}
              {currentStep === 'quote-preview' && 'Quote Preview'}
              {currentStep === 'awaiting-payment' && 'Awaiting Payment'}
              {currentStep === 'payment-simulation' && 'Payment'}
              {currentStep === 'nox-assessment' && 'NOx Assessment'}
              {currentStep === 'report-complete' && 'Report Complete'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {latestProject.name}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step}
              className={`flex-1 h-1 rounded-full ${
                step <= getStepNumber() ? 'bg-primary' : 'bg-muted'
              }`} 
            />
          ))}
        </div>

        {/* Pre-Estimation Step */}
        {currentStep === 'pre-estimation' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Enter project parameters to generate a quote for NOx assessment.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Type</Label>
                <select
                  value={estimationData.projectType}
                  onChange={(e) => setEstimationData(prev => ({ ...prev, projectType: e.target.value }))}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed">Mixed Use</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Building Size (m²)</Label>
                <Input
                  type="number"
                  value={estimationData.buildingSize}
                  onChange={(e) => setEstimationData(prev => ({ ...prev, buildingSize: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Construction Duration (months)</Label>
                <Input
                  type="number"
                  value={estimationData.constructionDuration}
                  onChange={(e) => setEstimationData(prev => ({ ...prev, constructionDuration: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Demolition Area (m²)</Label>
                <Input
                  type="number"
                  value={estimationData.demolitionArea}
                  onChange={(e) => setEstimationData(prev => ({ ...prev, demolitionArea: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGenerateQuote} disabled={isProcessing}>
                {isProcessing ? 'Generating...' : 'Generate Quote'}
              </Button>
            </div>
          </div>
        )}

        {/* Quote Preview Step */}
        {currentStep === 'quote-preview' && currentQuote && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-muted/50 border border-border/50 space-y-4">
              <h3 className="font-semibold">Quote Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NOx Screening Assessment</span>
                  <span>€{currentQuote.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (21%)</span>
                  <span>€{currentQuote.vatAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>€{currentQuote.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">
                This quote will be sent to the client for payment. Once paid, the NOx assessment will begin.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('pre-estimation')}>
                Back
              </Button>
              <Button onClick={handleSendQuote} disabled={isProcessing}>
                {isProcessing ? 'Sending...' : 'Send Quote to Client'}
              </Button>
            </div>
          </div>
        )}

        {/* Awaiting Payment Step */}
        {currentStep === 'awaiting-payment' && (
          <div className="space-y-6">
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quote Sent</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  The quote has been sent to your client. We will notify you once payment is received. After payment, you can continue the NOx assessment for this project.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                View Quote
              </Button>
              <Button variant="outline" className="w-full">
                Download Invoice
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Pilot Mode:</span> In the live system, you would wait for client payment. For this demo, click below to simulate payment.
              </p>
              <Button 
                className="w-full" 
                onClick={handleSimulatePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : 'Simulate Payment'}
              </Button>
            </div>
          </div>
        )}

        {/* NOx Assessment Step */}
        {currentStep === 'nox-assessment' && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm font-medium text-primary mb-1">Payment Confirmed</p>
              <p className="text-xs text-muted-foreground">
                You can now run the NOx assessment for this project.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-muted/50 border border-border/50 space-y-4">
              <h3 className="font-semibold">Project Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Project Type</p>
                  <p className="font-medium capitalize">{estimationData.projectType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Building Size</p>
                  <p className="font-medium">{estimationData.buildingSize} m²</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Construction Duration</p>
                  <p className="font-medium">{estimationData.constructionDuration} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Demolition Area</p>
                  <p className="font-medium">{estimationData.demolitionArea} m²</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12" 
              onClick={handleRunAssessment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Running Assessment...' : 'Run NOx Assessment'}
            </Button>
          </div>
        )}

        {/* Report Complete Step */}
        {currentStep === 'report-complete' && (
          <div className="space-y-6">
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Assessment Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Your project has passed the NOx screening requirements.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-muted/50 border border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">NOx Screening Report</p>
                  <p className="text-xs text-muted-foreground">Generated {new Date().toLocaleDateString()}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  PASS
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bouwfase</p>
                  <p className="font-medium">0.85% of threshold</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Exploitatiefase</p>
                  <p className="font-medium">0.6% of threshold</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Download Report (PDF)
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">
                Partner Settlement Rewarded
              </p>
              <p className="text-xs text-muted-foreground">
                This assessment qualifies for partner commission. It has been processed to your settlement account.
              </p>
            </div>

            <Button className="w-full h-12" onClick={handleComplete}>
              Complete Demo
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
