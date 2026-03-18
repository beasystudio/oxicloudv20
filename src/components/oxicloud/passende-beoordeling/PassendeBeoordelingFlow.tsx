import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
'@/components/ui/dialog';
import { toast } from 'sonner';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import {
  FileText,
  Download,
  CheckCircle2,

  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye } from
'lucide-react';

import { type PBStatus, buildPBProjectData, QUOTE_LINE_ITEMS, COMMISSION_RATE } from './types';
import { DevStatusSimulator } from './DevStatusSimulator';
import { TemporaryReport } from './TemporaryReport';
import { StatusBanner } from './StatusBanner';
import { TimelineStepper } from './TimelineStepper';
import { EmailPreviewModal } from './EmailPreviewModal';

interface PassendeBeoordelingFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

// ─── Mockup flags ───
const sandboxExhausted = true;

export function PassendeBeoordelingFlow({
  project,
  results,
  onComplete,
  onBack
}: PassendeBeoordelingFlowProps) {
  const [pbStatus, setPbStatus] = useState<PBStatus>('input_complete');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<'generate_quote' | 'reactivate' | 'confirm_changes' | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [edgeCases, setEdgeCases] = useState({
    noResponse14Days: false,
    quoteExpired: false,
    slaMissed: false
  });

  const pbProject = SEED_PROJECT;
  const subtotal = QUOTE_LINE_ITEMS.reduce((s, i) => s + i.amount, 0);
  const commission = subtotal * COMMISSION_RATE;
  const quoteSentDate = new Date().toLocaleDateString('nl-BE');
  const slaDate = new Date(Date.now() + 21 * 86400000).toLocaleDateString('nl-BE');

  if (!sandboxExhausted) return null;

  const toggleEdgeCase = (key: 'noResponse14Days' | 'quoteExpired' | 'slaMissed') => {
    setEdgeCases((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openConfirm = (action: typeof confirmDialogAction) => {
    setConfirmDialogAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    if (confirmDialogAction === 'generate_quote') {
      setPbStatus('quote_generated');
    } else if (confirmDialogAction === 'reactivate') {
      setPbStatus('input_complete');
    }
    setConfirmDialogAction(null);
  };

  const handleSendQuote = () => {
    setShowEmailPreview(true);
  };

  const handleEmailConfirm = () => {
    setShowEmailPreview(false);
    toast.success('Offerte succesvol verstuurd naar opdrachtgever.');
    setPbStatus('awaiting_payment');
  };

  // Timeline step mapping for statuses 3-5
  const getTimelineStep = (): number => {
    switch (pbStatus) {
      case 'awaiting_payment':return 0;
      case 'paid':return 2;
      case 'report_delivered':return 3;
      default:return -1;
    }
  };

  // ─── RENDER ───
  return (
    <div className="space-y-6">
      {/* Dev Simulator */}
      <DevStatusSimulator
        currentStatus={pbStatus}
        onStatusChange={setPbStatus}
        edgeCases={edgeCases}
        onToggleEdgeCase={toggleEdgeCase} />
      

      {/* Section Header */}
      <Separator />
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-foreground">Passende Beoordeling</h2>
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
          Wettelijk vereist
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Na uitputting van alle optimalisatiemogelijkheden overschrijdt dit project de toegestane
        NOx-drempel. Conform de toepasselijke wetgeving is een Passende Beoordeling verplicht
        alvorens dit project verder kan worden ingediend.
      </p>

      {/* Status Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pbStatus}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-4">
          
          {/* ─── STATUS 0: ON HOLD ─── */}
          {pbStatus === 'on_hold' &&
          <>
              <StatusBanner variant="grey">
                Project on hold — De opdrachtgever heeft aangegeven momenteel niet verder te willen
                gaan met de Passende Beoordeling.
              </StatusBanner>
              <TemporaryReport project={pbProject} condensed />
              <Button
              variant="outline"
              className="w-full"
              onClick={() => openConfirm('reactivate')}>
              
                <RefreshCw className="w-4 h-4 mr-2" />
                Opdrachtgever wil toch doorgaan — Hervatten
              </Button>
            </>
          }

          {/* ─── STATUS 1: INPUT COMPLETE ─── */}
          {pbStatus === 'input_complete' &&
          <>
              <TemporaryReport project={pbProject} />
              <p className="text-xs text-muted-foreground">
                Bespreek dit rapport met uw opdrachtgever en verkrijg diens goedkeuring voordat u een
                formeel verzoek indient.
              </p>
              <div className="flex gap-3">
                <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setPbStatus('on_hold')}>
                
                  Opdrachtgever gaat niet verder
                </Button>
                <Button className="flex-1" onClick={() => openConfirm('generate_quote')}>
                  Offerte Genereren
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          }

          {/* ─── STATUS 2: QUOTE GENERATED ─── */}
          {pbStatus === 'quote_generated' &&
          <>
              <TemporaryReport project={pbProject} condensed />

              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Gegenereerde Offerte</h4>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100">
                    Klaar om te versturen
                  </Badge>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                          Omschrijving
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                          Bedrag
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {QUOTE_LINE_ITEMS.map((item) =>
                    <tr key={item.description}>
                          <td className="px-4 py-2.5">{item.description}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            € {item.amount.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                    )}
                      <tr className="bg-muted/20">
                        <td className="px-4 py-2.5 font-medium">Subtotaal</td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                          € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          Architectencommissie (8%)
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          € {commission.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="font-semibold">
                        <td className="px-4 py-3">Totaal (excl. BTW)</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          Verwachte leveringstermijn
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          ± 3 weken na betaling
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-muted-foreground">
                  De commissie wordt automatisch verrekend conform uw standaard commissiepercentage.
                  Geen handmatige configuratie vereist.
                </p>
              </div>

              <Button className="w-full" onClick={handleSendQuote}>
                
                Offerte Versturen naar Opdrachtgever
              </Button>
            </>
          }

          {/* ─── STATUS 3: AWAITING PAYMENT ─── */}
          {pbStatus === 'awaiting_payment' &&
          <>
              <StatusBanner variant="amber">
                Wachten op betaling — Offerte verstuurd naar opdrachtgever. Betaling via
                bankoverschrijving wordt verwacht.
              </StatusBanner>

              {edgeCases.noResponse14Days &&
            <StatusBanner variant="amber">
                  Geen reactie ontvangen na 14 dagen. Een herinnering is automatisch verstuurd naar de
                  opdrachtgever.
                </StatusBanner>
            }

              {edgeCases.quoteExpired &&
            <>
                  <StatusBanner variant="red">
                    Offerte verlopen na 30 dagen.
                  </StatusBanner>
                  <Button
                variant="outline"
                className="w-full"
                onClick={() => setPbStatus('input_complete')}>
                
                    Nieuwe Offerte Aanvragen
                  </Button>
                </>
            }

              <p className="text-xs text-muted-foreground">
                De opdrachtgever dient het bedrag over te schrijven. Na verwerking van de betaling
                door het OxiCloud-team wordt de status automatisch bijgewerkt.
              </p>

              <TemporaryReport project={pbProject} condensed />

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Offerte</p>
                  <p className="text-xs text-muted-foreground">
                    € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })} •
                    Verstuurd op {quoteSentDate}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Geen reactie na 14 dagen? Het systeem stuurt automatisch een herinnering naar de
                opdrachtgever.
              </p>

              <TimelineStepper currentStep={0} />
            </>
          }

          {/* ─── STATUS 4: PAID / REPORT IN PROGRESS ─── */}
          {pbStatus === 'paid' &&
          <>
              <StatusBanner variant="blue">
                Rapport in uitvoering — Betaling bevestigd. Het OxiCloud-team is gestart met de
                Passende Beoordeling.
              </StatusBanner>

              {edgeCases.slaMissed &&
            <StatusBanner variant="amber">
                  Vertraging verwacht. Het OxiCloud-team heeft u geïnformeerd. Wij houden u op de
                  hoogte.
                </StatusBanner>
            }

              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-sm font-semibold">Verwachte oplevering</p>
                <p className="text-lg font-semibold tabular-nums">{slaDate}</p>
                <p className="text-xs text-muted-foreground">
                  ± 3 weken (15 werkdagen) na betalingsbevestiging
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  U ontvangt een melding zodra uw rapport beschikbaar is. Bij vertraging informeren
                  wij u proactief.
                </p>
              </div>

              <TemporaryReport project={pbProject} condensed />
              <TimelineStepper currentStep={2} />
            </>
          }

          {/* ─── STATUS 5: REPORT DELIVERED ─── */}
          {pbStatus === 'report_delivered' &&
          <>
              <StatusBanner variant="green">
                Rapport Geleverd — De Passende Beoordeling is afgerond en beschikbaar in uw dossier.
              </StatusBanner>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h4 className="text-sm font-semibold">Documenten</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Tijdelijk Conformiteitsrapport — {pbProject.scanDate}</span>
                    </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => toast.info('PDF wordt voorbereid en is straks beschikbaar.')}>
                    
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Passende Beoordeling Rapport — {pbProject.scanDate}</span>
                    </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => toast.info('Rapport wordt geladen...')}>
                    
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => toast.info('Rapport wordt geopend...')}>
                <Eye className="w-4 h-4 mr-2" />
                Rapport Bekijken
              </Button>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-800">
                  Dit project komt in aanmerking voor verdere vergunningsaanvraag.
                </p>
              </div>

              <TimelineStepper currentStep={4} />
            </>
          }
        </motion.div>
      </AnimatePresence>

      {/* ─── Confirmation Dialog ─── */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmDialogAction === 'generate_quote' && 'Offerte genereren'}
              {confirmDialogAction === 'reactivate' && 'Project hervatten'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialogAction === 'generate_quote' &&
              'Heeft u het tijdelijk rapport met uw opdrachtgever besproken en diens goedkeuring ontvangen?'}
              {confirmDialogAction === 'reactivate' &&
              'Bevestigt u dat de opdrachtgever akkoord gaat om verder te gaan?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirmDialog(false)}>
              Annuleren
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              {confirmDialogAction === 'generate_quote' ? 'Ja, genereer offerte' : 'Bevestigen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Email Preview Modal ─── */}
      <EmailPreviewModal
        open={showEmailPreview}
        onOpenChange={setShowEmailPreview}
        project={pbProject}
        onConfirm={handleEmailConfirm} />
      
    </div>);

}