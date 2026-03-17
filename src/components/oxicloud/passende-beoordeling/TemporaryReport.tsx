import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { PBProjectData } from './types';

interface TemporaryReportProps {
  project: PBProjectData;
  condensed?: boolean;
}

export function TemporaryReport({ project, condensed = false }: TemporaryReportProps) {
  const handleDownload = () => {
    toast.info('PDF wordt voorbereid en is straks beschikbaar.');
  };

  if (condensed) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Tijdelijk Conformiteitsrapport</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Tijdelijk Conformiteitsrapport
        </h4>
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            <Row label="Projectnaam" value={project.name} />
            <Row label="Adres" value={project.address} />
            <Row label="Scandatum" value={project.scanDate} />
            <Row label="NOx Impact" value={`${project.noxImpact} kg NOₓ`} />
            <Row label="Drempelwaarde" value={`${project.threshold} kg NOₓ`} />
            <Row label="Overschrijding" value={`+${project.overshoot} kg NOₓ`} highlight />
            <Row
              label="Conclusie"
              value="Dit project overschrijdt naar verwachting de toegestane NOx-limieten."
            />
            <Row
              label="Juridische implicatie"
              value="Conform de toepasselijke wetgeving is een Passende Beoordeling verplicht alvorens dit project verder kan worden ingediend."
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-muted-foreground font-medium w-[160px] align-top">{label}</td>
      <td className={`px-4 py-2.5 ${highlight ? 'text-destructive font-semibold' : 'text-foreground'}`}>
        {value}
      </td>
    </tr>
  );
}
