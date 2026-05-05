import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Send, Loader2, User, Mail, Building2, Lock, AlertCircle, Check } from 'lucide-react';
import { getAllContacts } from '@/lib/mockContactDB';
import type { Contact } from '@/types/contact';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface CreateQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  companyId: string;
  estimatedAmount: number;
  onQuoteCreated: (quoteId: string) => void;
}

export function CreateQuoteDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  companyId,
  estimatedAmount,
  onQuoteCreated
}: CreateQuoteDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [clientContacts, setClientContacts] = useState<Contact[]>([]);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const quoteResultRef = useRef<{ quoteId: string; quoteNumber: string } | null>(null);

  const PROCESSING_STEPS = [
    t('createQuoteDialog.processingStep1'),
    t('createQuoteDialog.processingStep2'),
    t('createQuoteDialog.processingStep3'),
    t('createQuoteDialog.processingStep4'),
    t('createQuoteDialog.processingStep5'),
  ];

  const vatRate = 0.21;
  const vatAmount = estimatedAmount * vatRate;
  const totalAmount = estimatedAmount + vatAmount;

  useEffect(() => {
    if (open) {
      const allContacts = getAllContacts();
      const clients = allContacts.filter(c => 
        c.contactType === 'company' || 
        (c.contactType === 'individual' && c.email)
      );
      setClientContacts(clients);
    } else {
      setShowProcessing(false);
      setProcessingStep(0);
      setProgress(0);
      quoteResultRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!showProcessing) return;

    const stepDuration = 800;
    const totalDuration = stepDuration * PROCESSING_STEPS.length;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);

      const currentStep = Math.min(
        Math.floor(elapsed / stepDuration),
        PROCESSING_STEPS.length - 1
      );
      setProcessingStep(currentStep);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => {
          if (quoteResultRef.current) {
            toast({
              title: t('createQuoteDialog.quoteCreated'),
              description: t('createQuoteDialog.quoteCreatedDesc').replace('{number}', quoteResultRef.current.quoteNumber)
            });
            onQuoteCreated(quoteResultRef.current.quoteId);
            onOpenChange(false);
            setSelectedContactId('');
            setShowProcessing(false);
            setProcessingStep(0);
            setProgress(0);
          }
        }, 400);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [showProcessing]);

  const selectedContact = clientContacts.find(c => c.id === selectedContactId);

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `QT-${year}-${random}`;
  };

  const handleCreateQuote = async () => {
    if (!selectedContact) {
      toast({
        title: t('createQuoteDialog.noClientSelected'),
        description: t('createQuoteDialog.selectClientFromList'),
        variant: "destructive"
      });
      return;
    }

    if (!selectedContact.email) {
      toast({
        title: t('createQuoteDialog.emailMissing'),
        description: t('createQuoteDialog.selectedContactNoEmail'),
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setShowProcessing(true);

    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 14);
      const quoteNumber = generateQuoteNumber();

      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          quote_number: quoteNumber,
          project_id: projectId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          company_id: companyId,
          client_contact_name: selectedContact.name,
          client_contact_email: selectedContact.email,
          amount: estimatedAmount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          status: 'pending',
          valid_until: validUntil.toISOString()
        } as any)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('payment_audit_log').insert({
        event_type: 'quote_created',
        quote_id: quote.id,
        company_id: companyId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_data: { 
          project_name: projectName,
          amount: estimatedAmount,
          client_email: selectedContact.email 
        }
      });

      quoteResultRef.current = { quoteId: quote.id, quoteNumber: quote.quote_number };

    } catch (error: any) {
      console.error('Failed to create quote:', error);
      setShowProcessing(false);
      toast({
        title: t('createQuoteDialog.error'),
        description: error.message || t('createQuoteDialog.couldNotCreateQuote'),
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (showProcessing) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center py-8 px-4 space-y-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">{t('createQuoteDialog.generatingQuote')}</h3>
              <p className="text-sm text-muted-foreground">{t('createQuoteDialog.pleaseWait')}</p>
            </div>

            <div className="w-full space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="space-y-2">
                {PROCESSING_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 text-sm transition-all duration-300",
                      idx <= processingStep ? "opacity-100" : "opacity-0 translate-y-1"
                    )}
                  >
                    {idx < processingStep ? (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : idx === processingStep ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
                    )}
                    <span className={cn(
                      idx < processingStep && "text-muted-foreground",
                      idx === processingStep && "text-foreground font-medium"
                    )}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('createQuoteDialog.createQuoteTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('createQuoteDialog.createQuoteDesc').replace('{project}', projectName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('createQuoteDialog.project')}</span>
              <span className="font-medium">{projectName}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('createQuoteDialog.baseAmount')}</span>
              <span>€{estimatedAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('createQuoteDialog.vat21')}</span>
              <span>€{vatAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{t('createQuoteDialog.total')}</span>
              <span>€{totalAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t('createQuoteDialog.clientContact')}</h4>
              <Badge variant="outline" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                {t('createQuoteDialog.fromContacts')}
              </Badge>
            </div>
            
            {clientContacts.length === 0 ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive/70" />
                <p className="text-sm font-medium text-destructive">{t('createQuoteDialog.noContactsAvailable')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('createQuoteDialog.addContactsFirst')}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t('createQuoteDialog.selectClient')}</Label>
                  <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('createQuoteDialog.chooseClientContact')} />
                    </SelectTrigger>
                    <SelectContent>
                      {clientContacts.map(contact => (
                        <SelectItem key={contact.id} value={contact.id}>
                          <div className="flex items-center gap-2">
                            {contact.contactType === 'company' ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{contact.name}</span>
                            {contact.companyName && contact.contactType !== 'company' && (
                              <span className="text-muted-foreground text-xs">({contact.companyName})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedContact && (
                  <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('createQuoteDialog.name')}:</span>
                      <span className="font-medium">{selectedContact.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('createQuoteDialog.email')}:</span>
                      <span className="font-medium">{selectedContact.email || t('createQuoteDialog.noEmail')}</span>
                    </div>
                    {selectedContact.companyName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('createQuoteDialog.company')}:</span>
                        <span className="font-medium">{selectedContact.companyName}</span>
                      </div>
                    )}
                    {selectedContact.vatNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('createQuoteDialog.vatNumber')}:</span>
                        <span className="font-medium font-mono text-xs">{selectedContact.vatNumber}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      {t('createQuoteDialog.contactsSyncedFrom')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('createQuoteDialog.cancelBtn')}
            </Button>
            <Button
              onClick={handleCreateQuote}
              disabled={isCreating || !selectedContact || !selectedContact.email}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {t('createQuoteDialog.createQuoteBtn')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}