import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Clock, FileText, User, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface VersionEntry {
  version: string;
  createdAt: string;
  createdBy: string;
  status: string;
}

interface NoxVersionHistoryProps {
  noxData: {
    status: string;
    currentVersion?: string;
    versionHistory?: VersionEntry[];
    noxCreatedAt?: string;
    created_at?: string;
  };
  onCloneVersion: () => void;
}

export function NoxVersionHistory({ noxData, onCloneVersion }: NoxVersionHistoryProps) {
  const { t, language } = useLanguage();

  const VERSION_STATUS_MAP: Record<string, { label: string; color: string }> = {
    input_incomplete: { label: t('versionHistory.statusConcept'), color: 'bg-gray-400' },
    input_completed: { label: t('versionHistory.statusInputCompleted'), color: 'bg-blue-500' },
    price_generated: { label: t('versionHistory.statusPriceGenerated'), color: 'bg-indigo-500' },
    awaiting_payment: { label: t('versionHistory.statusAwaitingPayment'), color: 'bg-amber-500' },
    paid: { label: t('versionHistory.statusPaid'), color: 'bg-green-500' },
    report_in_progress: { label: t('versionHistory.statusReportInProgress'), color: 'bg-orange-500' },
    report_delivered: { label: t('versionHistory.statusReportDelivered'), color: 'bg-emerald-600' },
  };

  const createdDate = noxData.noxCreatedAt || noxData.created_at || new Date().toISOString();
  
  const allVersions = [
    ...(noxData.versionHistory || []).map(v => ({ ...v, locked: true })),
    {
      version: noxData.currentVersion || 'v0',
      createdAt: createdDate,
      createdBy: 'Current User',
      status: noxData.status,
      locked: false,
    },
  ];

  const isReportDelivered = noxData.status === 'report_delivered';
  const locale = language === 'nl' ? 'nl-BE' : 'en-GB';

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {t('versionHistory.title')}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {allVersions.length} {allVersions.length === 1 ? t('versionHistory.version') : t('versionHistory.versions')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative space-y-0">
          {allVersions.map((entry, i) => {
            const isCurrent = i === allVersions.length - 1;
            const isLocked = 'locked' in entry && entry.locked;
            const statusInfo = VERSION_STATUS_MAP[entry.status] || { label: entry.status, color: 'bg-gray-500' };
            
            return (
              <div key={entry.version + '-' + i} className="relative">
                {i < allVersions.length - 1 && (
                  <div className="absolute left-[11px] top-[26px] bottom-0 w-px bg-border/60" />
                )}
                
                <div className={cn(
                  "flex items-start gap-2.5 p-2 rounded-lg transition-colors",
                  isCurrent ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/20"
                )}>
                  <div className={cn(
                    "mt-0.5 h-[22px] w-[22px] rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold",
                    isCurrent ? "bg-primary" : "bg-muted-foreground/30"
                  )}>
                    {isLocked ? <Lock className="h-2.5 w-2.5" /> : entry.version.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold font-mono">{entry.version}</span>
                      <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white", statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                      {isCurrent && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary text-primary">
                          {t('versionHistory.active')}
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 gap-0.5">
                          <Lock className="h-2 w-2" />
                          {t('versionHistory.locked')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(entry.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {entry.createdBy && (
                        <span className="flex items-center gap-0.5">
                          <User className="h-2.5 w-2.5" />
                          {entry.createdBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isReportDelivered && (
          <div className="pt-2 border-t border-border/40 space-y-2">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-200">
                  {t('versionHistory.reportDelivered')}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {t('versionHistory.cloneDescription')}
                </p>
              </div>
            </div>
            <Button onClick={onCloneVersion} className="w-full gap-2" size="sm">
              <Copy className="h-3.5 w-3.5" />
              {t('versionHistory.createNewVersion')}
              <ArrowRight className="h-3.5 w-3.5 ml-auto" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
