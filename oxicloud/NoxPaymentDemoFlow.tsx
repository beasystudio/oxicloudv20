import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Send, CreditCard, CheckCircle, Lock, Unlock, ArrowRight, ArrowLeft, User, Mail, Building2, Clock, ExternalLink, Calculator, Bell, Receipt } from 'lucide-react';
import { OxiCloudProject } from '@/types/oxicloud';
interface NoxPaymentDemoFlowProps {
  project: OxiCloudProject;
  onPaymentComplete: () => void;
  onBack: () => void;
}
type DemoStep = 'create-quote' | 'send-quote' | 'client-pays' | 'unlocked' | 'commission';

// Demo end-client contacts (the client's client - project owners who pay for NOx assessment)
const demoEndClients = [{
  id: 'c1',
  name: 'Artebeau BV',
  email: 'projects@artebeau.be',
  company: 'Artebeau BV',
  vatNumber: 'BE0987654321'
}, {
  id: 'c2',
  name: 'Immobel SA',
  email: 'projects@immobel.be',
  company: 'Immobel SA',
  vatNumber: 'BE0405966675'
}, {
  id: 'c3',
  name: 'Familie Van den Berghe',
  email: 'vandenberghe.family@gmail.com',
  company: 'Private Owner',
  vatNumber: ''
}];
export function NoxPaymentDemoFlow({
  project,
  onPaymentComplete,
  onBack
}: NoxPaymentDemoFlowProps) {
  const {
    toast
  } = useToast();
  const [currentStep, setCurrentStep] = useState<DemoStep>('create-quote');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const selectedEndClient = demoEndClients.find(c => c.id === selectedClientId);
  const basePrice = project.priceData?.basePrice || 2500;
  const vat = basePrice * 0.21;
  const totalPrice = basePrice + vat;
  const commissionRate = 0.08;
  const commissionAmount = basePrice * commissionRate;
  const steps = [{
    id: 'create-quote',
    label: 'Create Quote',
    icon: FileText
  }, {
    id: 'send-quote',
    label: 'Send Quote',
    icon: Send
  }, {
    id: 'client-pays',
    label: 'End Client Pays',
    icon: CreditCard
  }, {
    id: 'unlocked',
    label: 'Module Unlocks',
    icon: Unlock
  }, {
    id: 'commission',
    label: 'Commission',
    icon: Receipt
  }];
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = currentStepIndex / (steps.length - 1) * 100;
  const handleCreateQuote = async () => {
    if (!selectedEndClient) {
      toast({
        title: "Select an End Client",
        description: "Please select the project owner who will pay for the NOx assessment",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setQuoteNumber(`QT-${year}-${random}`);
    setIsProcessing(false);
    setCurrentStep('send-quote');
    toast({
      title: "Quote Created",
      description: `Quote ${quoteNumber || `QT-${year}-${random}`} created for ${selectedEndClient.name}`
    });
  };
  const handleSendQuote = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    const mockPaymentLink = `https://pay.oxicloud.be/nox/${quoteNumber}?t=${Date.now()}`;
    setPaymentLink(mockPaymentLink);
    setIsProcessing(false);
    setCurrentStep('client-pays');
    toast({
      title: "Quote Sent",
      description: `Payment link sent to ${selectedEndClient?.email}`
    });
  };
  const handleClientPayment = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessing(false);
    setCurrentStep('unlocked');
    toast({
      title: "Payment Received!",
      description: "€" + totalPrice.toLocaleString('nl-NL', {
        minimumFractionDigits: 2
      }) + " paid via Bancontact"
    });
  };
  const handleViewCommission = () => {
    setCurrentStep('commission');
  };
  const handleCompleteFlow = () => {
    onPaymentComplete();
    toast({
      title: "Flow Complete",
      description: "The detailed calculation module is now unlocked"
    });
  };
  return <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            
            NOx Payment Flow Demo
          </CardTitle>
          <CardDescription>
            {project.name} • Complete payment workflow demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = index < currentStepIndex;
              return <div key={step.id} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isComplete ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'}`}>
                      {isComplete ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span className={`text-xs ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>;
            })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'create-quote' && <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              
              Step 1: Create Quote for Your Client's Client
            </CardTitle>
            <CardDescription>Select the project owner who will pay for the NOx assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Summary */}
            

            {/* End Client Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select End Client (Project Owner)</Label>
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  From Contacts DB
                </Badge>
              </div>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose end client..." />
                </SelectTrigger>
                <SelectContent>
                  {demoEndClients.map(client => <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {client.name}
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>

              {selectedEndClient && <div className="bg-muted/30 border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedEndClient.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEndClient.email}</span>
                  </div>
                  {selectedEndClient.vatNumber && <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs">{selectedEndClient.vatNumber}</span>
                    </div>}
                </div>}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleCreateQuote} disabled={!selectedEndClient || isProcessing} className="flex-1 gap-2">
                {isProcessing ? 'Creating...' : <>
                    <FileText className="h-4 w-4" />
                    Create Quote
                  </>}
              </Button>
            </div>
          </CardContent>
        </Card>}

      {currentStep === 'send-quote' && <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              
              Step 2: Send Quote to Client
            </CardTitle>
            <CardDescription>
              Quote {quoteNumber} is ready to be sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{quoteNumber}</p>
                    <p className="text-sm text-muted-foreground">For: {selectedEndClient?.name}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              </div>
              
              <Separator />
              
              

              <div className="text-sm text-muted-foreground">
                <Mail className="h-4 w-4 inline mr-2" />
                Will be sent to: {selectedEndClient?.email}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Calculation Module Locked</p>
                  <p className="text-sm text-muted-foreground">
                    The detailed NOx calculation form will remain locked until payment is received.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep('create-quote')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSendQuote} disabled={isProcessing} className="flex-1 gap-2">
                {isProcessing ? 'Sending...' : <>
                    <Send className="h-4 w-4" />
                    Send Quote & Payment Link
                  </>}
              </Button>
            </div>
          </CardContent>
        </Card>}

      {currentStep === 'client-pays' && <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              
              Step 3: End Client Pays Directly to OxiCloud
            </CardTitle>
            <CardDescription>
              Quote sent! Waiting for your client's client to pay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Link</span>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting Payment
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background p-2 rounded border truncate">
                  {paymentLink}
                </code>
                <Button variant="outline" size="sm" asChild>
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Email sent to {selectedEndClient?.email} with secure payment link
              </p>
            </div>

            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center space-y-4 bg-primary/5">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Demo: Simulate End Client Payment</p>
                <p className="text-sm text-muted-foreground">
                  In production, the end client (project owner) would click the payment link and pay via Bancontact/Credit Card
                </p>
              </div>
              <Button onClick={handleClientPayment} disabled={isProcessing} size="lg" className="gap-2">
                {isProcessing ? 'Processing Payment...' : <>
                    <CheckCircle className="h-5 w-5" />
                    Simulate Payment - €{totalPrice.toLocaleString('nl-NL', {
                minimumFractionDigits: 2
              })}
                  </>}
              </Button>
            </div>

            <Button variant="outline" onClick={() => setCurrentStep('send-quote')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </CardContent>
        </Card>}

      {currentStep === 'unlocked' && <Card className="border-primary/50">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Unlock className="h-5 w-5" />
              Step 4: Calculation Module Unlocked!
            </CardTitle>
            <CardDescription>
              Payment successful - you can now access detailed calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-700 dark:text-green-400">Payment Received!</h3>
              <p className="text-sm text-muted-foreground">
                €{totalPrice.toLocaleString('nl-NL', {
              minimumFractionDigits: 2
            })} paid by {selectedEndClient?.name}
              </p>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Transaction ID: TXN-{Date.now().toString().slice(-8)}
              </Badge>
            </div>

            

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleViewCommission} className="gap-2">
                <Receipt className="h-4 w-4" />
                View Commission Details
              </Button>
              <Button onClick={handleCompleteFlow} className="flex-1 gap-2">
                <Calculator className="h-4 w-4" />
                Proceed to Detailed Calculation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>}

      {currentStep === 'commission' && <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Step 5: Commission Notification
            </CardTitle>
            <CardDescription>
              Your company has been notified about the earned commission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Commission Email Sent</p>
                  <p className="text-sm text-muted-foreground">To: billing@gdesign.be</p>
                </div>
                <Badge variant="outline" className="ml-auto">Just now</Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quote Total</span>
                  <span>€{basePrice.toLocaleString('nl-NL', {
                  minimumFractionDigits: 2
                })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission Rate</span>
                  <span>{(commissionRate * 100).toFixed(0)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Your Commission</span>
                  <span className="text-primary">€{commissionAmount.toLocaleString('nl-NL', {
                  minimumFractionDigits: 2
                })}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">What happens next?</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Your company sends an invoice for €{commissionAmount.toLocaleString('nl-NL', {
                minimumFractionDigits: 2
              })} to OxiCloud</li>
                <li>OxiCloud processes the invoice (usually within 30 days)</li>
                <li>Commission is paid to your company</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep('unlocked')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleCompleteFlow} className="flex-1 gap-2">
                <Calculator className="h-4 w-4" />
                Proceed to Detailed Calculation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>}
    </div>;
}