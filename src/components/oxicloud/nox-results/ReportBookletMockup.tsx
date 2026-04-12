/**
 * 3D open booklet mockup - realistic printed report on a light gray surface
 * Features: perspective tilt, center spine shadow, drop shadow, paper texture
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReportBookletMockupProps {
  projectName: string;
  isPaid: boolean;
  isUnblurring: boolean;
  t: (key: string) => string;
}

export function ReportBookletMockup({ projectName, isPaid, isUnblurring, t }: ReportBookletMockupProps) {
  const blurClass = cn(
    'select-none transition-all duration-700 ease-out',
    !isUnblurring && 'blur-[6px]',
    isUnblurring && 'blur-0'
  );

  return (
    <div className="relative py-8 px-2">
      {/* Surface background */}
      <div className="absolute inset-0 rounded-2xl bg-muted/30" />

      {/* Drop shadow under booklet */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[85%] h-8 rounded-[50%]"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--foreground) / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Booklet container with perspective */}
      <div
        className="relative mx-auto max-w-2xl"
        style={{
          perspective: '1200px',
        }}
      >
        <div
          className="grid grid-cols-2 gap-0"
          style={{
            transform: 'rotateX(2deg)',
            transformOrigin: 'center bottom',
          }}
        >
          {/* Left page - cover/title page */}
          <div
            className="relative bg-card rounded-l-lg p-5 min-h-[280px] border border-border/30 border-r-0"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.3) 100%)',
              boxShadow: 'inset -4px 0 8px -4px hsl(var(--foreground) / 0.06)',
            }}
          >
            {/* Subtle paper grain */}
            <div className="absolute inset-0 rounded-l-lg opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-1">
                  {t('reportHeld.technicalReport') || 'Technical Report'}
                </p>
                <p className="text-[8px] text-muted-foreground/60 mb-4">
                  {t('reportHeld.environmentalPermit') || 'Environmental Permit'}
                </p>

                <h3 className="text-base font-bold text-foreground leading-tight mb-1">
                  {t('reportHeld.nitrogenEmission') || 'Nitrogen Emission Report'}
                </h3>
                <p className={cn('text-[11px] text-muted-foreground/70 leading-relaxed', blurClass)}>
                  {t('reportHeld.preAssessment') || 'Pre-assessment - impact score construction phase'}
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">
                      {t('reportHeld.projectLabel') || 'Project'}
                    </p>
                    <p className={cn('text-[10px] font-medium text-foreground/80', blurClass)}>{projectName}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">
                      {t('reportHeld.phaseLabel') || 'Phase'}
                    </p>
                    <p className={cn('text-[10px] font-medium text-foreground/80', blurClass)}>
                      {t('reportHeld.constructionPhase') || 'Construction phase'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">
                      {t('reportHeld.methodologyLabel') || 'Methodology'}
                    </p>
                    <p className={cn('text-[10px] font-medium text-foreground/80', blurClass)}>VITO 2024</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">
                      {t('reportHeld.regulationLabel') || 'Regulation'}
                    </p>
                    <p className={cn('text-[10px] font-medium text-foreground/80', blurClass)}>
                      {t('reportHeld.nitrogenDecree') || 'Nitrogen Decree Flanders'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center spine shadow */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 z-20"
            style={{
              background: 'linear-gradient(to bottom, hsl(var(--foreground) / 0.03), hsl(var(--foreground) / 0.08), hsl(var(--foreground) / 0.03))',
              boxShadow: '0 0 6px 2px hsl(var(--foreground) / 0.04)',
            }}
          />

          {/* Right page - data page */}
          <div
            className="relative bg-card rounded-r-lg p-5 min-h-[280px] border border-border/30 border-l-0"
            style={{
              background: 'linear-gradient(225deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.2) 100%)',
              boxShadow: 'inset 4px 0 8px -4px hsl(var(--foreground) / 0.06)',
            }}
          >
            <div className="absolute inset-0 rounded-r-lg opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

            <div className="relative z-10 h-full flex flex-col">
              {/* Status badge */}
              <div className="flex justify-end mb-4">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] transition-all duration-500',
                    isPaid
                      ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10'
                      : 'text-amber-600 border-amber-500/30 bg-amber-500/10'
                  )}
                >
                  {isPaid ? (t('reportHeld.unlockedBadge') || 'Unlocked') : t('reportHeld.heldBadge')}
                </Badge>
              </div>

              {/* Metric tiles */}
              <div className="space-y-3 flex-1">
                {[
                  { label: t('reportHeld.totalNox'), value: '14.85', unit: 'kg/jaar' },
                  { label: t('reportHeld.threshold'), value: '938.00', unit: 'kg/jaar' },
                  { label: t('reportHeld.status') || 'Status', value: t('reportHeld.compliant') || 'Compliant', unit: '< 1%', isBadge: true },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-border/20 p-3 bg-muted/10">
                    <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-1">{metric.label}</p>
                    <div className={cn('flex items-baseline gap-2', blurClass)}>
                      {metric.isBadge ? (
                        <Badge className="bg-primary/20 text-primary text-[11px]">{metric.value}</Badge>
                      ) : (
                        <span className="text-lg font-bold text-foreground">{metric.value}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blurred placeholder rows */}
              <div className="space-y-2 mt-3">
                {['w-full', 'w-3/4', 'w-5/6'].map((w, i) => (
                  <div key={i} className={cn(`h-2 ${w} rounded-full bg-muted/40 transition-all duration-700 ease-out`, !isUnblurring && 'blur-[4px]', isUnblurring && 'blur-0')} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
