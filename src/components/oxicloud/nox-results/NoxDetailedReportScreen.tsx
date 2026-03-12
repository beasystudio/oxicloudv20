import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { OxiCloudProject } from '@/types/oxicloud';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

interface NoxDetailedReportScreenProps {
  project: OxiCloudProject;
  onConfirmGenerate: () => void;
  onCancel: () => void;
}

export function NoxDetailedReportScreen({
  project,
  onConfirmGenerate,
  onCancel
}: NoxDetailedReportScreenProps) {
  const { t } = useLanguage();
  const [activeReport, setActiveReport] = useState<'bouwfase' | 'exploitatie'>('bouwfase');
  const [isReportOpen, setIsReportOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [reportData, setReportData] = useState({
    projectName: project.name || 'Project Name',
    projectCode: 'NOX-2024-001',
    clientLogo: null as string | null,
  });

  const phaseLabel = activeReport === 'bouwfase' ? t('noxDetailedReport.constructionPhase') : t('noxDetailedReport.operationalPhase');

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] flex flex-col px-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveReport('bouwfase')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeReport === 'bouwfase' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t('noxDetailedReport.constructionPhase')}
          </button>
          <button
            onClick={() => setActiveReport('exploitatie')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeReport === 'exploitatie' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t('noxDetailedReport.operationalPhase')}
          </button>
        </div>

        <div className="bg-background rounded-2xl border border-border overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 py-4">
            <h2 className="text-lg font-semibold">
              {t('noxDetailedReport.detailedReport').replace('{phase}', phaseLabel)}
            </h2>
          </div>

          <div className="bg-muted px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="space-y-1 flex-1 max-w-xs">
                      <Label className="text-xs text-muted-foreground">{t('noxDetailedReport.projectName')}</Label>
                      <Input value={reportData.projectName} onChange={(e) => setReportData({ ...reportData, projectName: e.target.value })} className="h-9" />
                    </div>
                    <div className="space-y-1 w-40">
                      <Label className="text-xs text-muted-foreground">{t('noxDetailedReport.projectCode')}</Label>
                      <Input value={reportData.projectCode} onChange={(e) => setReportData({ ...reportData, projectCode: e.target.value })} className="h-9" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">{reportData.projectName}</p>
                    <p className="text-sm text-muted-foreground">{reportData.projectCode}</p>
                  </div>
                )}
                <div className="h-10 w-24 border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground">
                  {t('noxDetailedReport.logo')}
                </div>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isEditing ? t('noxDetailedReport.save') : t('noxDetailedReport.edit')}
              </button>
            </div>
          </div>

          <Collapsible open={isReportOpen} onOpenChange={setIsReportOpen}>
            <CollapsibleTrigger asChild>
              <div className="px-6 py-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{t('noxDetailedReport.reportTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('noxDetailedReport.reportSubtitle').replace('{phase}', activeReport === 'bouwfase' ? t('noxDetailedReport.constructionPhase').toLowerCase() : t('noxDetailedReport.operationalPhase').toLowerCase())}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">{isReportOpen ? '−' : '+'}</span>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="p-6 space-y-8">
                <section className="space-y-4">
                  <h4 className="text-lg font-semibold border-b border-border pb-2">{t('noxDetailedReport.studyPurpose')}</h4>
                  <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                    <p>{t('noxDetailedReport.studyText1')}</p>
                    <p>{t('noxDetailedReport.studyText2')}</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>{t('noxDetailedReport.studyBullet1')}</strong></li>
                      <li><strong>{t('noxDetailedReport.studyBullet2')}</strong></li>
                    </ul>
                    <p>{t('noxDetailedReport.studyText3')}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-semibold border-b border-border pb-2">{t('noxDetailedReport.legalFoundation')}</h4>
                  <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>{t('noxDetailedReport.legalBullet1')}</strong></li>
                      <li><strong>{t('noxDetailedReport.legalBullet2')}</strong></li>
                    </ul>
                    <p>{t('noxDetailedReport.legalText')}</p>
                  </div>
                </section>

                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} className="mt-0.5" />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      {t('noxDetailedReport.agreeTerms')}
                    </Label>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('noxDetailedReport.cancelBtn')}
          </button>
          <button
            onClick={onConfirmGenerate}
            disabled={!agreedToTerms}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              agreedToTerms ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {t('noxDetailedReport.confirmGenerate')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}