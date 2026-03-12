import { motion } from 'framer-motion';
import { CheckCircle, Shield } from '@/components/icons/OxiIcons';

const reportRows = [
  { label: 'Project ID', value: 'PRJ-2024-00471', status: 'info' },
  { label: 'Distance to site', value: '142m — Verified', status: 'pass' },
  { label: 'Building perceel', value: 'Boundaries confirmed', status: 'pass' },
  { label: 'Natura 2000', value: 'Not in proximity', status: 'pass' },
  { label: 'Excavators (submitted)', value: '1 unit (system recommends: 2–3)', status: 'warn' },
  { label: 'Baseline comparison', value: 'Within tolerance', status: 'pass' },
  { label: 'Reviewer conclusion', value: 'Acceptable — flagged item noted', status: 'info' },
];

export const ValidationReportCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="max-w-xl mx-auto lg:mx-0"
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.1)]">
        {/* Header */}
        <div className="px-6 py-4 bg-secondary text-secondary-foreground flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-primary" />
            <span className="text-sm font-semibold tracking-wide">Validation Report</span>
          </div>
          <span className="text-xs text-secondary-foreground/50">OxiCloud Gov Platform</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {reportRows.map((row) => (
            <div key={row.label} className="px-6 py-3.5 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <div className="flex items-center gap-2 text-right">
                {row.status === 'pass' && <CheckCircle size={14} className="text-primary shrink-0" />}
                {row.status === 'warn' && <span className="text-amber-500 shrink-0">⚠</span>}
                <span className={`text-sm font-medium ${row.status === 'warn' ? 'text-amber-500' : 'text-foreground'}`}>
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stamp */}
        <div className="px-6 py-4 bg-primary/5 border-t border-primary/20 flex items-center gap-3">
          <span className="text-primary">🔏</span>
          <span className="text-xs text-foreground/70">
            Validation Report Generated · 07 Mar 2026 · 14:22 CET
          </span>
        </div>
      </div>
    </motion.div>
  );
};
