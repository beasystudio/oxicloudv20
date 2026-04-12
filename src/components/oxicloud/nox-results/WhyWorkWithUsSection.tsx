/**
 * Why Work With Us - dominant, numbered layout with strong visual hierarchy
 */

import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

interface WhyWorkWithUsSectionProps {
  t: (key: string) => string;
}

export function WhyWorkWithUsSection({ t }: WhyWorkWithUsSectionProps) {
  const items = [
    { title: t('reportHeld.fastDelivery'), desc: t('reportHeld.fastDeliveryDesc') },
    { title: t('reportHeld.fullLegalCompliance'), desc: t('reportHeld.fullLegalComplianceDesc') },
    { title: t('reportHeld.officialReports'), desc: t('reportHeld.officialReportsDesc') },
    { title: t('reportHeld.liabilityProtection'), desc: t('reportHeld.liabilityProtectionDesc') },
  ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg font-bold text-foreground">
          {t('reportHeld.whyWorkWithUs')}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t('reportHeld.builtToSupport')}
        </p>
      </div>

      {/* Numbered items */}
      <div className="px-6 pb-5 space-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 py-4 border-t border-border/20 first:border-t-0"
          >
            {/* Large number */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{i + 1}</span>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA bar */}
      <button
        onClick={() => toast.info(t('reportHeld.comingSoon'))}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 border-t border-border/20 bg-muted/10 hover:bg-muted/30 transition-colors group cursor-pointer text-left"
      >
        <p className="text-xs text-muted-foreground group-hover:text-foreground/80">
          {t('reportHeld.shareWithClient')}
        </p>
        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
    </div>
  );
}
