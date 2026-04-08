import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { motion } from 'framer-motion';
import { Check, FileText, Download, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface NoxPassResultScreenProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onConfirmReports: () => void;
  onBack: () => void;
}

export function NoxPassResultScreen({
  project,
  results,
  onConfirmReports,
  onBack,
}: NoxPassResultScreenProps) {
  const { t } = useLanguage();
  const bouwfasePercent = Math.min((results.percent_stationary + results.percent_light_construction + results.percent_heavy_construction) * 100, 100);
  const exploitatiePercent = Math.min((results.percent_light_operation + results.percent_heavy_operation) * 100, 100);

  const NEXT_STEPS = [
    { number: 1, title: t('noxPassResult.step1Title'), description: t('noxPassResult.step1Desc'), icon: FileText },
    { number: 2, title: t('noxPassResult.step2Title'), description: t('noxPassResult.step2Desc'), icon: Download },
    { number: 3, title: t('noxPassResult.step3Title'), description: t('noxPassResult.step3Desc'), icon: ArrowRight },
  ];

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center p-6 md:p-12">
      <motion.div
        className="w-full max-w-3xl space-y-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center space-y-5">
          <motion.div
            className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Check className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
          </motion.div>

          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              {t('noxPassResult.compliant')}
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {t('noxPassResult.description')}
            </p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <MetricBar label={t('noxPassResult.constructionPhase')} percent={bouwfasePercent} delay={0.4} thresholdLabel={t('noxPassResult.ofMaxThreshold')} />
          <MetricBar label={t('noxPassResult.operationalPhase')} percent={exploitatiePercent} delay={0.5} thresholdLabel={t('noxPassResult.ofMaxThreshold')} />
        </motion.div>

        <motion.div
          className="bg-muted/50 rounded-2xl border border-border p-6 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {t('noxPassResult.whatThisMeans')}
          </p>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span>{t('noxPassResult.noAdditional')}</li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span>{t('noxPassResult.standardPermit')}</li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span>{t('noxPassResult.includeReport')}</li>
          </ul>
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {t('noxPassResult.nextSteps')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {NEXT_STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="bg-card border border-border rounded-xl p-5 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center">
                    {step.number}
                  </span>
                  <step.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row gap-3 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <button onClick={onConfirmReports} className="flex-1 h-14 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors btn-spring">
            {t('noxPassResult.reviewConfirm')}
          </button>
          <button onClick={onBack} className="h-14 px-8 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-sm font-medium">
            {t('noxPassResult.backToProjects')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MetricBar({ label, percent, delay, thresholdLabel }: { label: string; percent: number; delay: number; thresholdLabel: string }) {
  const displayPercent = Math.max(0, Math.min(percent, 100));

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm font-semibold text-primary tabular-nums">{displayPercent.toFixed(1)}%</p>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${displayPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{thresholdLabel}</p>
    </div>
  );
}