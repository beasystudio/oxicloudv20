import { useState } from 'react';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

interface NoxCommissionScreenProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onClaimCommission: () => void;
  onDownloadReport: () => void;
  onExportOptions: () => void;
  onBack: () => void;
}

export function NoxCommissionScreen({
  project,
  results,
  onClaimCommission,
  onDownloadReport,
  onExportOptions,
  onBack
}: NoxCommissionScreenProps) {
  const { t } = useLanguage();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [reportNotes, setReportNotes] = useState('');

  const handleSaveNotes = () => {
    toast.success(t('noxCommission.notesSaved'));
    setIsEditDialogOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center p-6 md:p-12">
      <motion.div className="w-full max-w-5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-primary/30 p-6 bg-primary">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('noxCommission.reportGenerated')}
              </h3>
              <p className="text-sm mb-4 text-primary-foreground">
                {t('noxCommission.reportDescription')}
              </p>
              <Button variant="outline" onClick={onBack} className="rounded-xl">
                {t('noxCommission.toProjectFolder')}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button onClick={onDownloadReport} className="flex-1 h-12 rounded-xl bg-secondary font-semibold text-white">
                {t('noxCommission.download')}
              </Button>
              <Button variant="outline" onClick={onExportOptions} className="flex-1 h-12 rounded-xl">
                {t('noxCommission.exportOptions')}
              </Button>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <span />
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">{t('noxCommission.editReportNotes')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('noxCommission.addNotes')}
                    </p>
                    <Textarea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} placeholder={t('noxCommission.notesPlaceholder')} className="min-h-[150px]" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveNotes} className="flex-1">
                      {t('noxCommission.saveNotes')}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      {t('noxCommission.cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    </div>
  );
}