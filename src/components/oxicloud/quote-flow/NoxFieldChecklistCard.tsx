/**
 * Minimal, white-aesthetic preview of the NOx assessment fields. Monochrome.
 */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import jsPDF from "jspdf";

type Tag = "required" | "conditional" | "optional";

interface FieldDef {
  id: string;
  tag: Tag;
}

interface StepDef {
  id: "building" | "paving" | "groundwork" | "details" | "exploitation";
  fields: FieldDef[];
}

const STEPS: StepDef[] = [
  {
    id: "building",
    fields: [
      { id: "gfa", tag: "required" },
      { id: "shell", tag: "required" },
      { id: "perimeter", tag: "required" },
      { id: "asphaltDemo", tag: "conditional" },
    ],
  },
  {
    id: "paving",
    fields: [
      { id: "newPaving", tag: "required" },
      { id: "asphalt", tag: "conditional" },
      { id: "concrete", tag: "conditional" },
      { id: "pavers", tag: "conditional" },
      { id: "loose", tag: "optional" },
      { id: "permeable", tag: "optional" },
    ],
  },
  {
    id: "groundwork",
    fields: [
      { id: "pit", tag: "required" },
      { id: "pitDepth", tag: "conditional" },
      { id: "raising", tag: "conditional" },
      { id: "raisingArea", tag: "conditional" },
      { id: "raisingVolume", tag: "conditional" },
    ],
  },
  {
    id: "details",
    fields: [
      { id: "prefab", tag: "required" },
      { id: "parking", tag: "required" },
      { id: "grid", tag: "required" },
    ],
  },
  {
    id: "exploitation",
    fields: [{ id: "exploit", tag: "optional" }],
  },
];

interface NoxFieldChecklistCardProps {
  clientName: string;
}

export function NoxFieldChecklistCard({ clientName }: NoxFieldChecklistCardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<StepDef["id"]>(STEPS[0].id);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const totalFields = useMemo(() => STEPS.reduce((n, s) => n + s.fields.length, 0), []);
  const gathered = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const progressPct = totalFields ? (gathered / totalFields) * 100 : 0;

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const activeStep = STEPS.find((s) => s.id === activeTab) ?? STEPS[0];

  const tField = (stepId: string, fieldId: string, key: "label" | "hint") =>
    t(`quoteFlow.noxChecklist.fields.${fieldId}.${key}`);
  const tStep = (stepId: string) => t(`quoteFlow.noxChecklist.steps.${stepId}`);
  const tTag = (tag: Tag) => t(`quoteFlow.noxChecklist.tags.${tag}`);

  const fmt = (s: string, vars: Record<string, string | number>) =>
    s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t("quoteFlow.noxChecklist.pdfTitle"), margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(fmt(t("quoteFlow.noxChecklist.pdfIntro"), { client: clientName }), margin, y);
    y += 24;
    doc.setTextColor(0);

    STEPS.forEach((step) => {
      if (y > 760) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(tStep(step.id), margin, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      step.fields.forEach((f) => {
        if (y > 780) { doc.addPage(); y = margin; }
        const mark = checked[f.id] ? "[x]" : "[ ]";
        doc.text(`${mark}  ${tField(step.id, f.id, "label")}  (${tTag(f.tag)})`, margin, y);
        y += 14;
        const hint = tField(step.id, f.id, "hint");
        if (hint) {
          doc.setTextColor(120);
          doc.text(`     ${hint}`, margin, y);
          doc.setTextColor(0);
          y += 14;
        }
      });
      y += 8;
    });

    doc.save("nox-assessment-checklist.pdf");
  };

  return (
    <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground leading-tight">
          {t("quoteFlow.noxChecklist.title")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {fmt(t("quoteFlow.noxChecklist.subtitle"), { count: totalFields })}
        </p>
      </div>

      <div className="border-t border-border/60">
        <div className="px-5 py-5 space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-prose">
            {fmt(t("quoteFlow.noxChecklist.intro"), { client: clientName })}
          </p>

          {/* Tabs */}
          <div className="border-b border-border/60">
            <div className="flex gap-6 -mb-px overflow-x-auto">
              {STEPS.map((step, idx) => {
                const isActive = step.id === activeTab;
                const stepGathered = step.fields.filter((f) => checked[f.id]).length;
                const stepDone = stepGathered === step.fields.length;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveTab(step.id)}
                    className={cn(
                      "py-2.5 text-xs font-medium whitespace-nowrap border-b transition-colors flex items-center gap-1.5",
                      isActive
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={cn("tabular-nums", isActive ? "opacity-100" : "opacity-50")}>
                      {idx + 1}
                    </span>
                    <span>{tStep(step.id)}</span>
                    {stepDone && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field list */}
          <ul className="divide-y divide-border/40">
            {activeStep.fields.map((field) => {
              const isChecked = !!checked[field.id];
              const label = tField(activeStep.id, field.id, "label");
              const hint = tField(activeStep.id, field.id, "hint");
              return (
                <li key={field.id}>
                  <button
                    type="button"
                    onClick={() => toggle(field.id)}
                    className="w-full flex items-start gap-3 py-3 text-left group"
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                        isChecked
                          ? "bg-foreground border-foreground"
                          : "border-border group-hover:border-foreground/40"
                      )}
                    >
                      {isChecked && (
                        <Check className="h-2.5 w-2.5 text-background" strokeWidth={3.5} />
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className={cn(
                            "text-[13px] font-medium leading-snug",
                            isChecked ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          {label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 shrink-0">
                          {tTag(field.tag)}
                        </span>
                      </div>
                      {hint && (
                        <p className="text-[12px] text-muted-foreground/80 mt-0.5 leading-snug">
                          {hint}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Progress */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground uppercase tracking-wider">
                {t("quoteFlow.noxChecklist.progress")}
              </span>
              <span className="text-foreground tabular-nums font-medium">
                {gathered}
                <span className="text-muted-foreground/70"> / {totalFields}</span>
              </span>
            </div>
            <Progress
              value={progressPct}
              className="h-1 bg-muted/60 [&>div]:bg-foreground"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-border/60 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {t("quoteFlow.noxChecklist.saveOffline")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadPdf}
            className="gap-1.5 h-8 text-xs font-medium hover:bg-background"
          >
            <Download className="h-3.5 w-3.5" />
            {t("quoteFlow.noxChecklist.downloadPdf")}
          </Button>
        </div>
      </div>
    </div>
  );
}
