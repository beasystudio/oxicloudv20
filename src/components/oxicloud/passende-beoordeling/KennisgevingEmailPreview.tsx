import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import oxicloudLogo from '@/assets/oxicloud-logo.png';
import type { PBProjectData } from './types';

interface KennisgevingEmailPreviewProps {
  project: PBProjectData;
  quoteAmount: number;
  quoteLink?: string;
}

/**
 * Kennisgeving Passende Beoordeling — the email TEMPLATE used when sending
 * the quote. Not a separate step; it's the format of the quote email itself.
 * Sent from hello@oxicloud.be with the quote link embedded.
 * Branding mirrors the standard Stikstof report (OxiCloud + A-Spine letterhead).
 */
export function KennisgevingEmailPreview({
  project,
  quoteAmount,
  quoteLink = 'https://app.oxicloud.be/quote/OXI-2026-00847',
}: KennisgevingEmailPreviewProps) {
  const overshootPct = Math.round((project.overshoot / project.threshold) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Letterhead */}
      <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-border">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            OxiCloud · A-Spine
          </p>
          <h3 className="text-sm font-bold tracking-wide uppercase text-foreground mt-1">
            Kennisgeving — Passende Beoordeling
          </h3>
        </div>
        <img src={oxicloudLogo} alt="OxiCloud" className="w-8 h-8 rounded" />
      </div>

      {/* Email headers */}
      <div className="px-6 py-3 border-b border-border bg-muted/10 text-[11px] space-y-1">
        <Header label="From" value="hello@oxicloud.be" />
        <Header label="To" value={project.clientEmail} />
        <Header
          label="Subject"
          value={`Offerte Passende Beoordeling — ${project.name}`}
        />
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 text-sm leading-relaxed">
        <p>Geachte opdrachtgever,</p>

        <Section title="Projectoverzicht">
          <Row label="Projectnaam" value={project.name} />
          <Row label="Adres" value={project.address} />
          <Row label="Scandatum" value={project.scanDate} />
        </Section>

        <Section title="NOx-voorspelling">
          <Row label="Berekende impact" value={`${project.noxImpact} kg NOₓ`} />
          <Row label="Wettelijke drempel" value={`${project.threshold} kg NOₓ`} />
          <Row
            label="Overschrijding"
            value={`+${project.overshoot} kg NOₓ (+${overshootPct}%)`}
            highlight
          />
        </Section>

        <Section title="Conclusie">
          <p className="text-foreground">
            Het project overschrijdt de toegestane stikstofdrempel structureel, ook na
            sandbox-optimalisatie en gefaseerde uitvoering.
          </p>
        </Section>

        <Section title="Wettelijke grondslag">
          <p className="text-foreground">
            Stikstofdecreet — artikel 26/1 DABM
            <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-700 bg-amber-50">
              Pending sign-off Christine
            </span>
          </p>
        </Section>

        <Section title="Juridische implicatie">
          <p className="text-foreground">
            Een <strong>Passende Beoordeling</strong> is wettelijk verplicht voordat dit
            project verder kan worden ingediend voor vergunning.
          </p>
        </Section>

        {/* Embedded quote CTA */}
        <div className="rounded-md border border-foreground/15 bg-muted/15 px-4 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Bijhorende offerte
            </p>
            <p className="text-sm font-medium text-foreground tabular-nums">
              € {quoteAmount.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal text-muted-foreground">excl. BTW</span>
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{quoteLink}</p>
          </div>
          <Button size="sm" className="rounded-full gap-1.5 shrink-0">
            Offerte bekijken & ondertekenen
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        <p className="text-muted-foreground text-xs">
          Met vriendelijke groeten,
          <br />
          OxiCloud Platform — namens A-Spine
        </p>
      </div>

      <div className="border-t border-border px-6 py-3 bg-muted/10">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Verzonden vanuit <span className="font-medium text-foreground">hello@oxicloud.be</span>{' '}
          · Permanent opgeslagen in de NOx Card van het project.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
        {title}
      </h4>
      <div className="rounded-md border border-border overflow-hidden">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-border last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          highlight
            ? 'text-destructive font-semibold tabular-nums'
            : 'text-foreground tabular-nums'
        }
      >
        {value}
      </span>
    </div>
  );
}

function Header({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-14 shrink-0">{label}:</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}

// Wrap children safely when Section's child is a paragraph (no <Row>)
// We allow the Section to host any node; paragraphs render with their own padding.
// Adjust Section to not force a border when not using Row-list.
