import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
 import { Upload, FileText, CheckCircle, Loader2, X, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Disable worker entirely - runs on main thread to avoid CDN/CORS issues
GlobalWorkerOptions.workerSrc = '';

interface UploadReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUploaded: (reportData: ReportData) => void;
}
export interface ReportData {
  id: string;
  fileName: string;
  projectName: string;
  projectCode: string;
  architect: string;
  company: string;
  address: string;
  submissionDate: string;
  natura2000Site: string;
  natura2000Code: string;
  distanceToHabitat: number;
  projectType: string;
  constructionType: string;
  technicalParams?: {
    groundFloorArea: number;
    numberOfFloors: number;
    parkingSpaces: number;
    constructionDuration: number;
    noxEmission: number | null;
    complianceStatus: string;
  };
}
type UploadStep = 'upload' | 'extracting' | 'parsing' | 'complete';
export function UploadReportDialog({
  open,
  onOpenChange,
  onReportUploaded
}: UploadReportDialogProps) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const resetState = () => {
    setStep('upload');
    setFile(null);
    setProgress(0);
    setStatusMessage('');
  };
  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      setFile(droppedFile);
    }
  };
  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({
      data: arrayBuffer
    }).promise;
    let fullText = '';
    const numPages = Math.min(pdf.numPages, 50); // Limit to first 50 pages

    for (let i = 1; i <= numPages; i++) {
      setProgress(Math.round(i / numPages * 50)); // 0-50% for extraction
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };
  const handleLoadDemo = async () => {
    try {
      setStep('extracting');
      setStatusMessage('Loading demo data...');
      setProgress(25);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStep('parsing');
      setStatusMessage('Processing demo report...');
      setProgress(60);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(100);
      
      const demoData: ReportData = {
        id: `demo-${Date.now()}`,
        fileName: 'Demo_NOx_Report_2025.pdf',
        projectName: 'Residentie De Groene Vallei',
        projectCode: 'PRJ-2025-DEMO',
        architect: 'Studio Architectura',
        company: 'Bouwgroep Antwerpen NV',
        address: 'Groenstraat 45, 2000 Antwerpen',
        submissionDate: new Date().toISOString().split('T')[0],
        natura2000Site: 'Kalmthoutse Heide',
        natura2000Code: 'BE2100015',
        distanceToHabitat: 1250,
        projectType: 'Residentieel',
        constructionType: 'Nieuwbouw',
        technicalParams: {
          groundFloorArea: 850,
          numberOfFloors: 4,
          parkingSpaces: 24,
          constructionDuration: 18,
          noxEmission: 0.42,
          complianceStatus: 'compliant'
        }
      };
      
      setStep('complete');
      setTimeout(() => {
        onReportUploaded(demoData);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error loading demo:', error);
      toast({
        title: "Demo failed",
        description: 'Failed to load demo data',
        variant: "destructive"
      });
      resetState();
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      // Step 1: Extract text from PDF
      setStep('extracting');
      setStatusMessage('Extracting text from PDF...');
      setProgress(0);
      const pdfText = await extractTextFromPdf(file);

      // Step 2: Parse with AI
      setStep('parsing');
      setStatusMessage('Analyzing report with AI...');
      setProgress(60);
      const {
        data,
        error
      } = await supabase.functions.invoke('parse-nox-report', {
        body: {
          pdfText,
          fileName: file.name
        }
      });
      if (error) {
        throw new Error(error.message || 'Failed to parse report');
      }
      if (!data?.success || !data?.data) {
        throw new Error(data?.error || 'Failed to extract report data');
      }
      setProgress(100);

      // Step 3: Complete
      setStep('complete');
      setTimeout(() => {
        onReportUploaded(data.data);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'Failed to process the PDF report',
        variant: "destructive"
      });
      resetState();
    }
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Upload NOx Report'}
            {step === 'extracting' && 'Extracting PDF Content'}
            {step === 'parsing' && 'Analyzing Report'}
            {step === 'complete' && 'Creating Project Dossier'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a PDF report to create a new project dossier'}
            {step === 'extracting' && 'Reading text content from your PDF document...'}
            {step === 'parsing' && 'Using AI to extract project information from the report...'}
            {step === 'complete' && 'Project dossier is being created...'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Upload Step */}
          {step === 'upload' && <div className="space-y-4">
              <div className={cn("border-2 rounded-xl p-8 text-center transition-colors cursor-pointer border-dotted", file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50")} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                
                {file ? <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => {
                e.stopPropagation();
                setFile(null);
              }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div> : <>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Drop your PDF here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Only PDF files are accepted</p>
                  </>}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={!file} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

               <Button variant="outline" onClick={handleLoadDemo} className="w-full border-dashed">
                 <Apple className="h-4 w-4 mr-2 text-amber-500" />
                 Load Demo Report
               </Button>
            </div>}

          {/* Processing Steps */}
          {(step === 'extracting' || step === 'parsing') && <div className="space-y-6 py-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{statusMessage}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Processing {file?.name}</p>
              </div>
            </div>}

          {/* Complete Step */}
          {step === 'complete' && <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-medium">Project Dossier Created</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting to project workspace...
                </p>
              </div>
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
}