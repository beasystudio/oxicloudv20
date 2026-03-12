import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { updateMonitorProject, type MonitorProject } from '@/lib/monitorProjectStore';
import { addMonitorAuditEntry } from '@/lib/monitorAuditStore';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Shield, FileText, Download, Edit } from 'lucide-react';

interface Props {
  project: MonitorProject;
  onUpdate: (project: MonitorProject) => void;
  userName: string;
  municipality: string;
}

type FlowStep = 'ready' | 'processing' | 'result' | 'confirmation';

export function MonitorValidationFlow({ project, onUpdate, userName, municipality }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<FlowStep>(
    project.validationStatus === 'pending' ? 'ready' :
    project.confirmationSignedBy ? 'confirmation' : 'result'
  );
  const [confirmationNote, setConfirmationNote] = useState(
    project.confirmationNote ||
    `De gemeente ${municipality} bevestigt de beoordeling en validatie van het project "${project.projectName}" door projectontwikkelaar ${project.developer}, ontworpen door architectenbureau ${project.architectFirm}.`
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleStartValidation = () => {
    setStep('processing');
    addMonitorAuditEntry({
      userId: userName, userName, municipality, action: 'validation_started', category: 'validation',
      details: `Validation started for "${project.projectName}"`, projectId: project.id, projectName: project.projectName,
    });

    setTimeout(() => {
      const distance = project.closestDistanceToHabitat;
      const totalEmissions = project.emissionSources.reduce((s, e) => s + (e.emissionRate || 0), 0);
      const impactPercent = totalEmissions > 0 ? (totalEmissions / (distance * 100)) * 0.1 : 0.3;

      let status: MonitorProject['validationStatus'];
      let level: string;
      let result: string;

      if (impactPercent <= 0.5) {
        status = 'validated';
        level = 'Compliant – Below KDW threshold';
        result = `The NOx assessment for this project demonstrates compliance with current regulatory thresholds. The calculated impact percentage (${impactPercent.toFixed(2)}%) remains well below the 1% significance threshold for the nearest Natura 2000 habitat directive area (${project.natura2000Site}, ${project.natura2000Code}).`;
      } else if (impactPercent <= 1.0) {
        status = 'conditional';
        level = 'Conditional – Additional review recommended';
        result = `The NOx assessment indicates a calculated impact of ${impactPercent.toFixed(2)}%, which approaches the 1% significance threshold for the ${project.natura2000Site} area (${project.natura2000Code}). Additional review of emission sources and potential mitigation measures is recommended.`;
      } else {
        status = 'not_validated';
        level = 'Exceeds threshold – Requires passende beoordeling';
        result = `The calculated NOx impact (${impactPercent.toFixed(2)}%) exceeds the 1% significance threshold for the ${project.natura2000Site} habitat directive area. A comprehensive appropriate assessment (passende beoordeling) is required.`;
      }

      updateMonitorProject(project.id, {
        validationStatus: status, validationLevel: level, validationResult: result,
        validationDate: new Date().toISOString().split('T')[0], validatedBy: userName,
      });
      addMonitorAuditEntry({
        userId: userName, userName, municipality, action: 'validation_completed', category: 'validation',
        details: `Validation completed: ${level}`, projectId: project.id, projectName: project.projectName,
        metadata: { status, impactPercent },
      });
      onUpdate({ ...project, validationStatus: status, validationLevel: level, validationResult: result, validationDate: new Date().toISOString().split('T')[0], validatedBy: userName });
      setStep('result');
    }, 3000);
  };

  const handleSignConfirmation = () => {
    const now = new Date().toISOString().split('T')[0];
    updateMonitorProject(project.id, { confirmationNote, confirmationSignedBy: userName, confirmationSignedDate: now });
    addMonitorAuditEntry({
      userId: userName, userName, municipality, action: 'confirmation_signed', category: 'confirmation',
      details: `Confirmation signed for "${project.projectName}"`, projectId: project.id, projectName: project.projectName,
    });
    toast({ title: t('monitor.validation.confirmationSigned'), description: project.projectName });
    onUpdate({ ...project, confirmationNote, confirmationSignedBy: userName, confirmationSignedDate: now });
    setStep('confirmation');
  };

  const handleExportPdf = () => {
    updateMonitorProject(project.id, { pdfExported: true });
    addMonitorAuditEntry({
      userId: userName, userName, municipality, action: 'pdf_exported', category: 'export',
      details: `PDF exported for "${project.projectName}"`, projectId: project.id, projectName: project.projectName,
    });
    toast({ title: t('monitor.validation.exportPdf'), description: project.projectName });
    onUpdate({ ...project, pdfExported: true });
  };

  const statusIcon = () => {
    if (project.validationStatus === 'validated') return <CheckCircle className="h-6 w-6 text-primary" />;
    if (project.validationStatus === 'conditional') return <AlertTriangle className="h-6 w-6 text-muted-foreground" />;
    if (project.validationStatus === 'not_validated') return <XCircle className="h-6 w-6 text-destructive" />;
    return <Shield className="h-6 w-6 text-muted-foreground" />;
  };

  const statusBorder = () => {
    if (project.validationStatus === 'validated') return 'border-primary/30';
    if (project.validationStatus === 'conditional') return 'border-border';
    if (project.validationStatus === 'not_validated') return 'border-destructive/30';
    return 'border-border';
  };

  // Step: Ready
  if (step === 'ready') {
    return (
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{t('monitor.validation.title')}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{t('monitor.validation.description')}</p>
        <div className="p-4 rounded-xl bg-muted/30 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t('monitor.validation.natura2000Site')}</span><span className="font-semibold">{project.natura2000Site} ({project.natura2000Code})</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t('monitor.validation.distanceToHabitat')}</span><span className="font-semibold">{project.closestDistanceToHabitat} km</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">{t('monitor.validation.emissionSources')}</span><span className="font-semibold">{project.emissionSources.length}</span></div>
        </div>
        <Button onClick={handleStartValidation} className="w-full">
          <Shield className="h-4 w-4 mr-2" /> {t('monitor.validation.decodeAndValidate')}
        </Button>
      </div>
    );
  }

  // Step: Processing
  if (step === 'processing') {
    return (
      <div className="rounded-2xl border border-border p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{t('monitor.validation.analyzing')}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('monitor.validation.analyzingDesc')}</p>
        </div>
        <div className="w-full max-w-xs space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} /></div>
          <p className="text-[10px] text-muted-foreground">{t('monitor.validation.processingTime')}</p>
        </div>
      </div>
    );
  }

  // Step: Result
  if (step === 'result') {
    return (
      <div className="space-y-4">
        <div className={cn("rounded-2xl border-2 p-6", statusBorder())}>
          <div className="flex items-start gap-4">
            {statusIcon()}
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-sm">{project.validationLevel}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{project.validationResult}</p>
              <div className="flex items-center gap-3 pt-2">
                <Badge variant="outline" className="text-[10px]">{t('monitor.validation.assessed')}: {project.validationDate}</Badge>
                <Badge variant="outline" className="text-[10px]">{t('monitor.validation.by')}: {project.validatedBy}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{t('monitor.validation.confirmationNote')}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-xs h-7">
              <Edit className="h-3 w-3 mr-1" /> {isEditing ? t('monitor.validation.preview') : t('monitor.validation.edit')}
            </Button>
          </div>
          {isEditing ? (
            <Textarea value={confirmationNote} onChange={e => setConfirmationNote(e.target.value)} className="min-h-[120px] text-xs" />
          ) : (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
              <p className="text-xs leading-relaxed">{confirmationNote}</p>
            </div>
          )}
          <Button onClick={handleSignConfirmation} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" /> {t('monitor.validation.signAndConfirm')}
          </Button>
        </div>
      </div>
    );
  }

  // Step: Confirmation complete
  return (
    <div className="space-y-4">
      <div className={cn("rounded-2xl border-2 p-6", statusBorder())}>
        <div className="flex items-start gap-4">
          {statusIcon()}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sm">{project.validationLevel}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{project.validationResult}</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">{t('monitor.validation.confirmationSigned')}</h3>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-xs leading-relaxed">{project.confirmationNote}</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
            <div className="text-xs"><span className="text-muted-foreground">{t('monitor.validation.signedBy')}: </span><span className="font-semibold">{project.confirmationSignedBy}</span></div>
            <div className="text-xs"><span className="text-muted-foreground">{t('monitor.validation.date')}: </span><span className="font-semibold">{project.confirmationSignedDate}</span></div>
          </div>
        </div>
        <Button onClick={handleExportPdf} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" /> {t('monitor.validation.exportPdf')}
          {project.pdfExported && <Badge variant="outline" className="ml-2 text-[10px]">{t('monitor.validation.exported')}</Badge>}
        </Button>
      </div>
    </div>
  );
}
