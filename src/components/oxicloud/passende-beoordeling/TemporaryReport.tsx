import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import oxicloudLogo from '@/assets/oxicloud-logo.png';
import type { PBProjectData } from './types';

interface TemporaryReportProps {
  project: PBProjectData;
  condensed?: boolean;
}

export function TemporaryReport({ project, condensed = false }: TemporaryReportProps) {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const handleDownload = () => {
    toast.info(isNL
      ? 'PDF wordt voorbereid en is straks beschikbaar.'
      : 'PDF is being prepared and will be available shortly.');
  };

  if (condensed) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isNL ? 'Tijdelijk Conformiteitsrapport' : 'Temporary Compliance Report'}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </Button>
      </div>
    );
  }

  const overshootPct = Math.round((project.overshoot / project.threshold) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ─── Document Header ─── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-border">
        <div>
          <h3 className="text-base font-bold tracking-wide uppercase text-foreground">
            {isNL ? 'TIJDELIJK CONFORMITEITSRAPPORT' : 'TEMPORARY COMPLIANCE REPORT'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isNL
              ? 'Vertrouwelijk - Opgesteld door OxiCloud voor professioneel gebruik'
              : 'Confidential - Prepared by OxiCloud for professional use'}
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

      <div className="px-6 py-5 space-y-6">
        {/* ─── 2. Project Details ─── */}
        <Section title={isNL ? 'Projectgegevens' : 'Project Details'}>
          <DetailTable rows={[
            [isNL ? 'Projectnaam' : 'Project name', project.name],
            [isNL ? 'Adres' : 'Address', project.address],
            [isNL ? 'Opdrachtgever' : 'Client', project.clientName],
            ['Architect', project.architectName],
            [isNL ? 'Scandatum' : 'Scan date', project.scanDate],
            [isNL ? 'Referentienummer' : 'Reference number', project.referenceNumber],
          ]} />
        </Section>

        {/* ─── 3. Executive Summary ─── */}
        <Section title={isNL ? 'Samenvatting' : 'Executive Summary'}>
          {isNL ? (
            <p className="text-sm text-foreground leading-relaxed">
              Dit rapport bevestigt dat het bovengenoemde bouwproject, op basis van de meest recente
              NOx-impactberekeningen, de wettelijk toegestane stikstofdrempelwaarde overschrijdt.
              Alle beschikbare optimalisatiemaatregelen zijn onderzocht en toegepast. De overschrijding
              kan niet worden opgelost via technische aanpassingen alleen.
              <br /><br />
              Op grond van de geldende Europese en nationale milieuwetgeving is het uitvoeren van een
              Passende Beoordeling een wettelijke vereiste voordat dit project verder kan worden
              ingediend of vergund.
            </p>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              This report confirms that the above construction project, based on the most recent NOx
              impact calculations, exceeds the legally permitted nitrogen threshold. All available
              optimisation measures have been explored and applied. The exceedance cannot be resolved
              through technical adjustments alone.
              <br /><br />
              Under applicable European and national environmental legislation, conducting an
              Appropriate Assessment is a legal requirement before this project may proceed to permit
              submission.
            </p>
          )}
        </Section>

        {/* ─── 4. NOx Impact Analysis ─── */}
        <Section title={isNL ? 'NOx Impactanalyse' : 'NOx Impact Analysis'}>
          <DetailTable rows={[
            [
              isNL ? 'Berekende NOx-impact' : 'Calculated NOx impact',
              `${project.noxImpact} kg NOₓ`,
            ],
            [
              isNL ? 'Wettelijke drempelwaarde' : 'Legal threshold',
              `${project.threshold} kg NOₓ`,
            ],
            [
              isNL ? 'Overschrijding' : 'Exceedance',
              `+${project.overshoot} kg NOₓ (+${overshootPct}%)`,
              true,
            ],
          ]} />
          <div className="mt-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <Badge variant="destructive" className="text-xs">
              {isNL ? 'Niet conform' : 'Non-compliant'}
            </Badge>
          </div>
        </Section>

        {/* ─── 5. What does this mean? ─── */}
        <Section title={isNL ? 'Wat betekent dit?' : 'What does this mean?'}>
          {isNL ? (
            <p className="text-sm text-foreground leading-relaxed">
              Het bouwproject overschrijdt de wettelijk toegestane stikstofuitstoot. Zonder een
              goedgekeurde Passende Beoordeling <strong className="text-destructive">kan het project
              geen bouwvergunning ontvangen</strong>. Dit is geen beleidskeuze maar een bindende
              juridische vereiste op basis van Europese en nationale milieuwetgeving.
            </p>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              The construction project exceeds the legally permitted nitrogen emissions. Without an
              approved Appropriate Assessment, <strong className="text-destructive">the project cannot
              receive a building permit</strong>. This is not a policy choice but a binding legal
              requirement under European and national environmental legislation.
            </p>
          )}
        </Section>

        {/* ─── 6. Legal Basis ─── */}
        <Section title={isNL ? 'Wettelijke Grondslag' : 'Legal Basis'}>
          <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
            {isNL ? (
              <>
                <li>Habitatrichtlijn - Artikel 6, lid 3: vereist een passende beoordeling voor projecten die significante effecten op Natura 2000-gebieden kunnen hebben.</li>
                <li>Wet Natuurbescherming - Artikel 2.8: implementeert de Europese verplichting in nationaal recht en vereist een voorafgaande beoordeling bij mogelijke significante effecten.</li>
                <li>PAS-uitspraak (ECLI:NL:RVS:2019:1603): het Programma Aanpak Stikstof is ongeldig verklaard. Individuele projectbeoordelingen zijn nu verplicht.</li>
              </>
            ) : (
              <>
                <li>Habitats Directive - Article 6(3): requires an appropriate assessment for projects likely to have significant effects on Natura 2000 sites.</li>
                <li>Nature Conservation Act - Article 2.8: transposes the European obligation into national law, requiring prior assessment where significant effects are possible.</li>
                <li>PAS ruling (ECLI:NL:RVS:2019:1603): the Programmatic Approach to Nitrogen was invalidated. Individual project assessments are now mandatory.</li>
              </>
            )}
          </ul>
        </Section>

        {/* ─── 7. Next Steps ─── */}
        <Section title={isNL ? 'Wat zijn de volgende stappen?' : 'What are the next steps?'}>
          <ol className="text-sm text-foreground space-y-2 list-decimal list-inside">
            {isNL ? (
              <>
                <li>Bespreek dit rapport met uw opdrachtgever en verkrijg diens goedkeuring om door te gaan.</li>
                <li>Genereer een formele offerte voor de Passende Beoordeling via het OxiCloud-platform.</li>
                <li>Na betaling wordt de beoordeling opgestart door het OxiCloud-team van gecertificeerde specialisten.</li>
                <li>Na oplevering van het rapport kan het project worden ingediend voor vergunning.</li>
              </>
            ) : (
              <>
                <li>Discuss this report with your client and obtain their approval to proceed.</li>
                <li>Generate a formal quote for the Appropriate Assessment via the OxiCloud platform.</li>
                <li>Upon payment, the assessment will be initiated by the OxiCloud team of certified specialists.</li>
                <li>Once the report is delivered, the project may proceed to permit submission.</li>
              </>
            )}
          </ol>
        </Section>

        {/* ─── 8. Why is this urgent? ─── */}
        <Section title={isNL ? 'Waarom is dit urgent?' : 'Why is this urgent?'}>
          {isNL ? (
            <p className="text-sm text-foreground leading-relaxed">
              Vergunningsaanvragen zonder geldige Passende Beoordeling worden systematisch geweigerd.
              Vroeg handelen voorkomt projectvertraging, extra kosten en juridische risico's. De
              verwerkingstijd bedraagt gemiddeld drie weken na betaling.
            </p>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              Permit applications without a valid Appropriate Assessment are systematically rejected.
              Acting early prevents project delays, additional costs, and legal risks. Processing time
              averages three weeks after payment.
            </p>
          )}
        </Section>
      </div>

      {/* ─── 9. Document Footer ─── */}
      <div className="border-t border-border px-6 py-5 space-y-4 bg-muted/10">
        <DetailTable rows={[
          ['Platform', 'OxiCloud NOx Scan'],
          [isNL ? 'Rapporttype' : 'Report type', isNL ? 'Tijdelijk Conformiteitsrapport' : 'Temporary Compliance Report'],
          [isNL ? 'Geldigheid' : 'Validity', isNL ? '30 dagen' : '30 days'],
          [isNL ? 'Volgende stap' : 'Next step', isNL ? 'Offerte genereren via OxiCloud' : 'Generate quote via OxiCloud'],
        ]} />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isNL
            ? 'Dit rapport is automatisch gegenereerd door het OxiCloud-platform op basis van de ingevoerde projectgegevens en beschikbare emissiedata. Het dient uitsluitend als voorlopige indicatie en vervangt geen formele Passende Beoordeling. OxiCloud aanvaardt geen aansprakelijkheid voor beslissingen genomen op basis van dit document zonder aanvullend deskundig advies.'
            : 'This report was automatically generated by the OxiCloud platform based on submitted project data and available emission data. It serves solely as a preliminary indication and does not replace a formal Appropriate Assessment. OxiCloud accepts no liability for decisions made based on this document without additional expert advice.'}
        </p>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-1.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailTable({ rows }: { rows: [string, string, boolean?][] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border">
          {rows.map(([label, value, highlight]) => (
            <tr key={label}>
              <td className="px-4 py-2.5 text-muted-foreground font-medium w-[180px] align-top bg-muted/10">
                {label}
              </td>
              <td className={`px-4 py-2.5 ${highlight ? 'text-destructive font-semibold bg-destructive/5' : 'text-foreground'}`}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
