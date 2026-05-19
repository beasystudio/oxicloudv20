import { OxiCloudProject } from '@/types/oxicloud';
import { motion } from 'framer-motion';
 import { Check, ArrowRight, FileText, Download, Apple } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface NoxComplianceAchievedScreenProps {
  project: OxiCloudProject;
  method: 'sandbox' | 'split_phase' | 'passende_beoordeling';
  onContinueToReport: () => void;
  onBackToProjects: () => void;
}

export function NoxComplianceAchievedScreen({
  project,
  method,
  onContinueToReport,
  onBackToProjects,
}: NoxComplianceAchievedScreenProps) {
  const { t } = useLanguage();

  const METHOD_LABELS: Record<string, { title: string; description: string }> = {
    sandbox: { title: t('noxComplianceAchieved.parametersAdjusted'), description: t('noxComplianceAchieved.parametersDesc') },
    split_phase: { title: t('noxComplianceAchieved.phasesSplit'), description: t('noxComplianceAchieved.phasesDesc') },
    passende_beoordeling: { title: t('noxComplianceAchieved.assessmentComplete'), description: t('noxComplianceAchieved.assessmentDesc') },
  };

  const NEXT_STEPS = [
    { number: 1, title: t('noxComplianceAchieved.step1Title'), description: t('noxComplianceAchieved.step1Desc'), icon: FileText },
    { number: 2, title: t('noxComplianceAchieved.step2Title'), description: t('noxComplianceAchieved.step2Desc'), icon: Download },
    { number: 3, title: t('noxComplianceAchieved.step3Title'), description: t('noxComplianceAchieved.step3Desc'), icon: ArrowRight },
  ];

  const methodInfo = METHOD_LABELS[method];

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
            className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
             <motion.div
               className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 0.5, type: 'spring' }}
             >
               <Apple className="w-3.5 h-3.5 text-accent-foreground" />
             </motion.div>
          </motion.div>

          <div className="space-y-2">
            <motion.p
              className="text-xs font-bold uppercase tracking-widest text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {methodInfo.title}
            </motion.p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t('noxComplianceAchieved.compliant')}
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {methodInfo.description}
            </p>
          </div>
        </div>

        <motion.div
          className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {t('noxComplianceAchieved.whatThisMeans')}
          </p>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span>{t('noxComplianceAchieved.noAdditional')}</li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span>{t('noxComplianceAchieved.standardPermit')}</li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span>{t('noxComplianceAchieved.includeReport')}</li>
          </ul>
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground text-center">
            {t('noxComplianceAchieved.nextSteps')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {NEXT_STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="bg-card border border-border rounded-xl p-5 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
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
          <button onClick={onContinueToReport} className="flex-1 h-14 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            {t('noxComplianceAchieved.reviewConfirm')}
          </button>
          <button onClick={onBackToProjects} className="h-14 px-8 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-sm font-medium">
            {t('noxComplianceAchieved.backToProjects')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}