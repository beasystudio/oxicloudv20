import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { GitBranch, Lock, FileText } from 'lucide-react';
import { PhaseData } from './splitPhaseEngine';
import { AuditEvent } from './useSplitPhase';
import { cn } from '@/lib/utils';

interface Props {
  phase1: PhaseData;
  phase2: PhaseData;
  splitDate: string;
  auditLog: AuditEvent[];
}

export function SPBinderCard({ phase1, phase2, splitDate, auditLog }: Props) {
  const { t } = useLanguage();

  const handleViewReport = (phase: string) => {
    toast.info(t('splitPhase.auditReportExported').replace('{phase}', phase));
  };

  return (
    <div className="space-y-4">
      {/* Fasesplitsing Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">{t('splitPhase.binderCardTitle')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {t('splitPhase.binderPhaseCounter').replace('{count}', '2')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t('splitPhase.binderSplitDate').replace('{date}', splitDate)}
            </span>
          </div>
        </div>

        {/* Phase 1 row */}
        <div className="px-5 py-4 bg-primary/3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-foreground text-background text-[10px] font-semibold">
                {t('splitPhase.binderFase1Badge')}
              </Badge>
              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
                {t('splitPhase.binderConformBadge')}
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                {t('splitPhase.binderActiveBadge')}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{phase1.footprintM2} m² — {(phase1.ratio * 100).toFixed(0)}%</span>
          </div>
          <Button onClick={() => handleViewReport('Phase 1')} className="w-full rounded-lg h-9 text-sm">
            {t('splitPhase.binderFase1Cta')}
          </Button>
        </div>

        {/* Phase 2 row */}
        <div className="px-5 py-4 bg-muted/20 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {t('splitPhase.binderFase2Badge')}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {t('splitPhase.binderFutureBadge')}
              </Badge>
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">{phase2.footprintM2} m² — {(phase2.ratio * 100).toFixed(0)}%</span>
          </div>
          <Button onClick={() => handleViewReport('Phase 2')} variant="outline" className="w-full rounded-lg h-9 text-sm">
            {t('splitPhase.binderFase2Cta')}
          </Button>
          <div className="mt-3 bg-muted/30 rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">{t('splitPhase.binderFase2Banner')}</p>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="px-5 py-3 bg-muted/10">
          <p className="text-xs text-muted-foreground">{t('splitPhase.binderFooterDisclaimer')}</p>
        </div>
      </div>

      {/* Audit Log Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{t('splitPhase.auditTitle')}</h3>
        </div>
        <div className="divide-y divide-border">
          {auditLog.map((entry) => (
            <div key={entry.id} className="px-5 py-3 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.phase && (
                    <Badge variant={entry.phase === 'PHASE_1' ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0">
                      {entry.phase === 'PHASE_1' ? t('splitPhase.binderFase1Badge') : t('splitPhase.binderFase2Badge')}
                    </Badge>
                  )}
                  <span className="text-sm text-foreground">{entry.event}</span>
                </div>
                {entry.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {new Date(entry.timestamp).toLocaleString('nl-BE')}
                </p>
              </div>
            </div>
          ))}
          {auditLog.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">
              No events recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
