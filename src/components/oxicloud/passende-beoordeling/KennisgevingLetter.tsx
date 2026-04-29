import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import oxicloudLogo from '@/assets/oxicloud-logo.png';
import type { PBProjectData } from './types';

interface KennisgevingLetterProps {
  project: PBProjectData;
  condensed?: boolean;
}

/**
 * Kennisgeving Passende Beoordeling — auto-generated notification letter.
 * Sent from hello@oxicloud.be to the client BEFORE any quote is issued.
 * Branding mirrors the standard Stikstof report (OxiCloud + A-Spine letterhead).
 */
export function KennisgevingLetter({ project, condensed = false }: KennisgevingLetterProps) {
  const handleDownload = () => {
    toast.info('Kennisgeving PDF wordt voorbereid en is straks beschikbaar.');
  };

  if (condensed) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/15 px-3 py-2">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Kennisgeving Passende Beoordeling</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 text-xs h-7">
          <Download className="w-3 h-3" />
          PDF
        </Button>
      </div>
    );
  }

  const overshootPct = Math.round((project.overshoot / project.threshold) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Letterhead */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-border">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            OxiCloud · A-Spine
          </p>
          <h3 className="text-base font-bold tracking-wide uppercase text-foreground mt-1">
            Kennisgeving — Passende Beoordeling
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Wettelijke kennisgeving aan de opdrachtgever
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src={oxicloudLogo} alt="OxiCloud" className="w-8 h-8 rounded" />
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5 text-sm leading-relaxed">
        {/* Recipient */}
        <div className="space-y-0.5 text-xs">
          <p className="text-muted-foreground">Aan</p>
          <p className="text-foreground font-medium">{project.clientName}</p>
          <p className="text-muted-foreground">Architect: {project.architectName}</p>
          <p className="text-muted-foreground">Datum: {project.scanDate}</p>
          <p className="text-muted-foreground">Ref: {project.referenceNumber}</p>
        </div>

        {/* 1. Project Summary */}
        <Section title="1. Projectoverzicht">
          <DetailTable rows={[
            ['Projectnaam', project.name],
            ['Adres', project.address],
            ['Scandatum', project.scanDate],
          ]} />
        </Section>

        {/* 2. NOx Prediction */}
        <Section title="2. NOx-voorspelling">
          <DetailTable rows={[
            ['Berekende NOx-impact', `${project.noxImpact} kg NOₓ`],
            ['Wettelijke drempelwaarde', `${project.threshold} kg NOₓ`],
            ['Overschrijding', `+${project.overshoot} kg NOₓ (+${overshootPct}%)`, true],
          ]} />
        </Section>

        {/* 3. Conclusion */}
        <Section title="3. Conclusie">
          <p className="text-foreground">
            Op basis van de uitgevoerde berekeningen, en na uitputting van de beschikbare
            mitigerende maatregelen (sandbox-optimalisatie en gefaseerde uitvoering), wordt
            verwacht dat het project de toegestane stikstofdrempel structureel overschrijdt.
          </p>
        </Section>

        {/* 4. Legal Basis */}
        <Section title="4. Wettelijke grondslag">
          <p className="text-foreground">
            Stikstofdecreet — artikel 26/1 DABM
            <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-700 bg-amber-50">
              Pending sign-off Christine
            </span>
          </p>
        </Section>

        {/* 5. Legal Implication */}
        <Section title="5. Juridische implicatie">
          <p className="text-foreground">
            Een <strong>Passende Beoordeling</strong> is wettelijk verplicht voordat dit
            project verder kan worden ingediend voor vergunning. Zonder geldige Passende
            Beoordeling kan de bouwvergunning niet worden afgeleverd.
          </p>
        </Section>

        {/* 6. Next Step */}
        <Section title="6. Volgende stap">
          <p className="text-foreground">
            De opdrachtgever wordt verzocht zijn goedkeuring te bevestigen om over te gaan
            tot de uitvoering van een Passende Beoordeling. Na bevestiging wordt een
            formele offerte opgesteld en bezorgd.
          </p>
        </Section>
      </div>

      <div className="border-t border-border px-6 py-4 bg-muted/10">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Deze kennisgeving wordt automatisch gegenereerd door het OxiCloud-platform
          op basis van de meest recente projectberekeningen. Verzonden vanuit
          <span className="font-medium text-foreground"> hello@oxicloud.be</span>.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground border-b border-border/50 pb-1.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailTable({ rows }: { rows: [string, string, boolean?][] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-xs">
        <tbody className="divide-y divide-border">
          {rows.map(([label, value, highlight]) => (
            <tr key={label}>
              <td className="px-3 py-2 text-muted-foreground w-[180px] align-top bg-muted/10">
                {label}
              </td>
              <td className={`px-3 py-2 ${highlight ? 'text-destructive font-semibold bg-destructive/5' : 'text-foreground'}`}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
