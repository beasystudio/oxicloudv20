import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import { getMonitorAuditLog, type MonitorAuditEntry } from '@/lib/monitorAuditStore';
import { Search, Upload, FileText, Shield, CheckCircle, Download, Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

const actionIcons: Record<MonitorAuditEntry['action'], React.ReactNode> = {
  file_upload: <Upload className="h-3.5 w-3.5" />,
  project_created: <FileText className="h-3.5 w-3.5" />,
  data_entry: <Edit className="h-3.5 w-3.5" />,
  validation_started: <Shield className="h-3.5 w-3.5" />,
  validation_completed: <Shield className="h-3.5 w-3.5" />,
  confirmation_signed: <CheckCircle className="h-3.5 w-3.5" />,
  pdf_exported: <Download className="h-3.5 w-3.5" />,
  project_viewed: <Eye className="h-3.5 w-3.5" />,
  field_updated: <Edit className="h-3.5 w-3.5" />,
};

interface Props {
  projectId?: string;
}

export function MonitorAuditLog({ projectId }: Props) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const actionLabelKeys: Record<MonitorAuditEntry['action'], string> = {
    file_upload: 'monitor.audit.fileUpload',
    project_created: 'monitor.audit.projectCreatedAction',
    data_entry: 'monitor.audit.dataEntry',
    validation_started: 'monitor.audit.validationStarted',
    validation_completed: 'monitor.audit.validationCompleted',
    confirmation_signed: 'monitor.audit.confirmationSignedAction',
    pdf_exported: 'monitor.audit.pdfExported',
    project_viewed: 'monitor.audit.projectViewed',
    field_updated: 'monitor.audit.fieldUpdated',
  };

  const allLogs = getMonitorAuditLog();
  const logs = allLogs
    .filter(l => !projectId || l.projectId === projectId)
    .filter(l => categoryFilter === 'all' || l.category === categoryFilter)
    .filter(l =>
      !searchQuery ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.projectName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('monitor.audit.searchLogs')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder={t('monitor.audit.allCategories')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('monitor.audit.allCategories')}</SelectItem>
            <SelectItem value="upload">{t('monitor.audit.uploads')}</SelectItem>
            <SelectItem value="project">{t('monitor.audit.projectsCat')}</SelectItem>
            <SelectItem value="validation">{t('monitor.audit.validationCat')}</SelectItem>
            <SelectItem value="confirmation">{t('monitor.audit.confirmationCat')}</SelectItem>
            <SelectItem value="export">{t('monitor.audit.exportCat')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-1">
          {logs.map(entry => (
            <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                entry.category === 'validation' || entry.category === 'confirmation' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              )}>
                {actionIcons[entry.action]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t(actionLabelKeys[entry.action])}</span>
                  <Badge variant="outline" className="text-[9px]">{entry.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground/60">
                    {new Date(entry.timestamp).toLocaleString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">{entry.userName}</span>
                  {entry.projectName && <span className="text-[10px] text-muted-foreground/60">· {entry.projectName}</span>}
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('monitor.audit.noEntries')}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
