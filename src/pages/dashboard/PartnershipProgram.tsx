import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const steps = [
  { n: '01', label: 'Create a project', desc: 'Add project details — address, type, client contact.' },
  { n: '02', label: 'Complete the pre-estimation', desc: 'Fill in emission sources. OxiCloud calculates NOx impact and price.' },
  { n: '03', label: 'Send the quote to your client', desc: 'A professional quote is generated. Your client pays directly.' },
  { n: '04', label: 'Report is generated', desc: 'After payment, the compliance report is produced and delivered.' },
  { n: '05', label: 'You receive your commission', desc: '40 % of the report fee is automatically settled to your firm.' },
];

const faqs = [
  { q: 'How much do I earn per report?', a: 'You earn 40 % of the report fee. For a typical residential project this means €280 – €450 per report.' },
  { q: 'Do I need to pay anything upfront?', a: 'No. Your client pays the report fee directly. You never advance any money.' },
  { q: 'How is the commission paid?', a: 'After payment is confirmed, we generate a self-billing invoice. The commission is transferred to your company bank account.' },
  { q: 'Is there a minimum number of projects?', a: 'No minimum. You earn a commission on every single report — whether you submit one project or a hundred.' },
  { q: 'Can my whole team submit projects?', a: 'Yes. Add colleagues to your workspace. Every report submitted under your firm earns the same commission rate.' },
];

export default function PartnershipProgram() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Partnership Program · OxiCloud</title>
        <meta name="description" content="Learn how architects earn commissions through the OxiCloud Partnership Program." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <main className="container mx-auto px-6 py-12 max-w-2xl">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-10 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>

          {/* Header */}
          <header className="mb-14">
            <p className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-3">
              Partnership Program
            </p>
            <h1 className="text-[2rem] font-semibold tracking-tight text-foreground leading-tight mb-4">
              Earn a commission on every<br />
              NOx report you deliver.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
              OxiCloud is free for architects. When your client pays for a compliance report,
              your firm automatically receives <span className="font-semibold text-foreground">40 %</span> of the report fee — 
              with zero admin overhead.
            </p>
          </header>

          {/* How It Works */}
          <section className="mb-14">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-6">
              How it works
            </h2>
            <div className="border border-border rounded-xl overflow-hidden">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  className={`flex items-start gap-5 px-6 py-5 ${i < steps.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground/50 tracking-wider w-6 shrink-0 pt-0.5">
                    {step.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Example Earnings */}
          <section className="mb-14">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-6">
              Example earnings
            </h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-3 text-xs uppercase tracking-[0.1em] text-muted-foreground border-b border-border">
                <div className="px-5 py-3">Project type</div>
                <div className="px-5 py-3 text-right">Report fee</div>
                <div className="px-5 py-3 text-right">Your commission</div>
              </div>
              {[
                { type: 'Residential', fee: '€ 850', commission: '€ 340' },
                { type: 'Mixed-use', fee: '€ 1 125', commission: '€ 450' },
                { type: 'Industrial', fee: '€ 1 800', commission: '€ 720' },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 ${i < 2 ? 'border-b border-border' : ''}`}>
                  <div className="px-5 py-3.5 text-sm text-foreground">{row.type}</div>
                  <div className="px-5 py-3.5 text-sm text-muted-foreground text-right">{row.fee}</div>
                  <div className="px-5 py-3.5 text-sm font-semibold text-foreground text-right">{row.commission}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Amounts are indicative and depend on the scope of the project.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-14">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-foreground mb-1">{faq.q}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-8 text-center">
            <h3 className="text-base font-semibold mb-2">Ready to get started?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Create your workspace to start submitting projects and earning commissions.
            </p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <Button onClick={() => navigate('/register/workspace')} className="px-6">
                Create my Workspace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="px-6">
                Invite my manager
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
