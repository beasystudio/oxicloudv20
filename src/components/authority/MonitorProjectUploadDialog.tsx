import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  addMonitorProject,
  type MonitorProject,
  type EmissionSource } from
'@/lib/monitorProjectStore';
import { addMonitorAuditEntry } from '@/lib/monitorAuditStore';
import { Plus, X } from 'lucide-react';
import { PROJECT_TYPE_CATEGORIES } from '@/types/oxicloud';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: MonitorProject) => void;
  userName: string;
  municipality: string;
}

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  sloop: 'forms.projectTypes.sloop',
  residentieel: 'forms.projectTypes.residentieel',
  utiliteitsbouw: 'forms.projectTypes.utiliteitsbouw',
  industrieel_agrarisch: 'forms.projectTypes.industrieelAgrarisch',
  specifieke_projecttypes: 'forms.projectTypes.specifiekeProjecttypes',
};

const SUBTYPE_LABEL_KEYS: Record<string, string> = {
  eengezinswoningen: 'forms.projectTypes.eengezinswoningen',
  meergezinswoningen: 'forms.projectTypes.meergezinswoningen',
  sociale_woningbouw: 'forms.projectTypes.socialeWoningbouw',
  collectieve_woonvormen: 'forms.projectTypes.collectieveWoonvormen',
  kantoren: 'forms.projectTypes.kantoren',
  onderwijsgebouwen: 'forms.projectTypes.onderwijsgebouwen',
  gezondheidszorg: 'forms.projectTypes.gezondheidszorg',
  handelsgebouwen: 'forms.projectTypes.handelsgebouwen',
  cultuur_vrijetijd: 'forms.projectTypes.cultuurVrijetijd',
  industriele_gebouwen: 'forms.projectTypes.industrieleGebouwen',
  opslaggebouwen: 'forms.projectTypes.opslaggebouwen',
  agrarische_gebouwen: 'forms.projectTypes.agrarischeGebouwen',
  complexe_projecten: 'forms.projectTypes.complexeProjecten',
  openbare_werken: 'forms.projectTypes.openbareWerken',
};

export function MonitorProjectUploadDialog({ open, onOpenChange, onProjectCreated, userName, municipality }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    referenceNumber: `OMV-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`, projectName: '', projectType: '', projectSubtype: '',
    developer: '', architect: '', architectFirm: '', address: '',
    natura2000Site: '', natura2000Code: '', spzH: '', closestDistanceToHabitat: '', uploadedFileName: ''
  });

  const [emissionSources, setEmissionSources] = useState<EmissionSource[]>([
    { id: 'es-1', name: '', type: 'Stationary', emissionRate: undefined, unit: 'kg NOx/year' }
  ]);

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const addEmissionSource = () => {
    if (emissionSources.length >= 6) return;
    setEmissionSources((prev) => [...prev, { id: `es-${Date.now()}`, name: '', type: 'Stationary', emissionRate: undefined, unit: 'kg NOx/year' }]);
  };

  const removeEmissionSource = (id: string) => setEmissionSources((prev) => prev.filter((s) => s.id !== id));

  const updateEmissionSource = (id: string, field: string, value: string | number | undefined) => {
    setEmissionSources((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const getCategoryLabel = (value: string, fallback: string) => {
    const key = CATEGORY_LABEL_KEYS[value];
    return key ? t(key) : fallback;
  };

  const getSubtypeLabel = (value: string, fallback: string) => {
    const key = SUBTYPE_LABEL_KEYS[value];
    return key ? t(key) : fallback;
  };

  const handleSubmit = () => {
    if (!form.referenceNumber || !form.projectName || !form.projectType) {
      toast({ title: t('monitor.upload.missingFields'), description: t('monitor.upload.fillRequired'), variant: 'destructive' });
      return;
    }
    const project: MonitorProject = {
      id: `mon-${Date.now()}`, referenceNumber: form.referenceNumber, projectName: form.projectName,
      projectType: form.projectType, projectSubtype: form.projectSubtype, developer: form.developer,
      architect: form.architect, architectFirm: form.architectFirm, address: form.address,
      municipality, natura2000Site: form.natura2000Site, natura2000Code: form.natura2000Code,
      spzH: form.spzH, closestDistanceToHabitat: parseFloat(form.closestDistanceToHabitat) || 0,
      emissionSources: emissionSources.filter((s) => s.name.trim()),
      validationStatus: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: userName, source: 'manual',
      uploadedFileName: undefined
    };
    addMonitorProject(project);
    addMonitorAuditEntry({
      userId: userName, userName, municipality, action: 'project_created', category: 'project',
      details: `Project "${project.projectName}" created (${project.source})`, projectId: project.id, projectName: project.projectName
    });
    toast({ title: t('monitor.upload.projectCreated'), description: `${project.projectName} ${t('monitor.upload.addedToWorkspace')}` });
    onProjectCreated(project);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setForm({ referenceNumber: `OMV-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`, projectName: '', projectType: '', projectSubtype: '', developer: '', architect: '', architectFirm: '', address: '', natura2000Site: '', natura2000Code: '', spzH: '', closestDistanceToHabitat: '', uploadedFileName: '' });
    setEmissionSources([{ id: 'es-1', name: '', type: 'Stationary', emissionRate: undefined, unit: 'kg NOx/year' }]);
  };

  const selectedCategory = PROJECT_TYPE_CATEGORIES.find(c => c.value === form.projectType);
  const subtypeOptions = selectedCategory?.subtypes ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => {if (!v) resetForm();onOpenChange(v);}}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('monitor.upload.generalInfo')}</DialogTitle>
          <DialogDescription>{t('monitor.upload.fillInfo')}</DialogDescription>
        </DialogHeader>

        <div className="pt-2 space-y-5">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('monitor.upload.generalInfo')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.referenceNumber')} *</Label><Input value={form.referenceNumber} onChange={(e) => updateField('referenceNumber', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.projectNameLabel')} *</Label><Input value={form.projectName} onChange={(e) => updateField('projectName', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('monitor.upload.projectType')} *</Label>
                  <Select value={form.projectType} onValueChange={(v) => {updateField('projectType', v);updateField('projectSubtype', '');}}>
                    <SelectTrigger><SelectValue placeholder={t('monitor.upload.selectType')} /></SelectTrigger>
                    <SelectContent>{PROJECT_TYPE_CATEGORIES.map((cat) => <SelectItem key={cat.value} value={cat.value}>{getCategoryLabel(cat.value, cat.label)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('monitor.upload.subtype')}</Label>
                  <Select value={form.projectSubtype} onValueChange={(v) => updateField('projectSubtype', v)} disabled={!subtypeOptions.length}>
                    <SelectTrigger><SelectValue placeholder={t('monitor.upload.selectSubtype')} /></SelectTrigger>
                    <SelectContent>{subtypeOptions.map((s) => <SelectItem key={s.value} value={s.value}>{getSubtypeLabel(s.value, s.label)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.developer')}</Label><Input value={form.developer} onChange={(e) => updateField('developer', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.architect')}</Label><Input value={form.architect} onChange={(e) => updateField('architect', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.architectFirm')}</Label><Input value={form.architectFirm} onChange={(e) => updateField('architectFirm', e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.address')}</Label><Input value={form.address} onChange={(e) => updateField('address', e.target.value)} /></div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('monitor.upload.kdwInfo')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.natura2000Site')}</Label><Input value={form.natura2000Site} onChange={(e) => updateField('natura2000Site', e.target.value)} placeholder="e.g. Dijlevallei" /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.siteCode')}</Label><Input value={form.natura2000Code} onChange={(e) => updateField('natura2000Code', e.target.value)} placeholder="e.g. BE2400014" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.spzHZone')}</Label><Input value={form.spzH} onChange={(e) => updateField('spzH', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t('monitor.upload.distanceHabitat')}</Label><Input type="number" step="0.01" value={form.closestDistanceToHabitat} onChange={(e) => updateField('closestDistanceToHabitat', e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('monitor.upload.emissionSourcesLabel')}</h4>
                {emissionSources.length < 6 &&
              <Button variant="ghost" size="sm" onClick={addEmissionSource} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> {t('monitor.upload.addSource')}
                  </Button>
              }
              </div>
              {emissionSources.map((source, idx) =>
            <div key={source.id} className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground mt-2 w-4">{idx + 1}.</span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input placeholder={t('monitor.upload.sourceName')} value={source.name} onChange={(e) => updateEmissionSource(source.id, 'name', e.target.value)} className="text-xs h-8" />
                    <Select value={source.type} onValueChange={(v) => updateEmissionSource(source.id, 'type', v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stationary">{t('monitor.upload.stationary')}</SelectItem>
                        <SelectItem value="Mobile">{t('monitor.upload.mobile')}</SelectItem>
                        <SelectItem value="Fugitive">{t('monitor.upload.fugitive')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder={t('monitor.upload.rate')} value={source.emissionRate ?? ''} onChange={(e) => updateEmissionSource(source.id, 'emissionRate', e.target.value ? parseFloat(e.target.value) : undefined)} className="text-xs h-8" />
                  </div>
                  {emissionSources.length > 1 &&
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeEmissionSource(source.id)}>
                      <X className="h-3 w-3" />
                    </Button>
              }
                </div>
            )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => {resetForm();onOpenChange(false);}} className="flex-1">{t('monitor.upload.back')}</Button>
              <Button onClick={handleSubmit} className="flex-1">{t('monitor.upload.createProject')}</Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>);
}
