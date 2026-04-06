import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NoxProject } from '@/lib/noxProjectStore';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { OxiCloudStatusBadge } from './OxiCloudStatusBadge';
import { OxiCloudProjectStatus, STATUS_CONFIG } from '@/types/oxicloud';
import { Search, CreditCard, FileText, Download, RefreshCw, Play, ArrowRight, MapPin, Briefcase, Clock, FileCheck, CheckCircle, Euro } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { getTranslatedStatusLabel } from '@/lib/statusLabels';
interface NoxProjectDashboardProps {
  projects: NoxProject[];
  onSelectProject: (project: NoxProject) => void;
  stats: {
    totalProjects: number;
    projectsWithNoxData: number;
    activeProjects: number;
    awaitingPayment: number;
    reportsInProgress: number;
    reportsDelivered: number;
    totalSpendThisMonth: number;
  };
}
type PaymentState = 'all' | 'unpaid' | 'paid';
export function NoxProjectDashboard({
  projects,
  onSelectProject,
  stats
}: NoxProjectDashboardProps) {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typologyFilter, setTypologyFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentState>('all');

  // Get unique typologies from projects
  const typologies = useMemo(() => {
    const types = new Set(projects.map(p => p.projectType).filter(Boolean));
    return Array.from(types);
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      const matchesSearch = !searchTerm || project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter.length === 0 || project.noxData && statusFilter.includes(project.noxData.status);

      // Typology filter
      const matchesTypology = typologyFilter === 'all' || project.projectType === typologyFilter;

      // Payment filter
      let matchesPayment = true;
      if (paymentFilter === 'paid') {
        matchesPayment = project.noxData?.status === 'paid' || project.noxData?.status === 'report_in_progress' || project.noxData?.status === 'report_delivered';
      } else if (paymentFilter === 'unpaid') {
        matchesPayment = !project.noxData || project.noxData.status === 'input_incomplete' || project.noxData.status === 'input_completed' || project.noxData.status === 'price_generated' || project.noxData.status === 'awaiting_payment';
      }
      return matchesSearch && matchesStatus && matchesTypology && matchesPayment;
    });
  }, [projects, searchTerm, statusFilter, typologyFilter, paymentFilter]);

  // Get dynamic CTA based on status
  const getDynamicCTA = (project: NoxProject) => {
    if (!project.noxData) {
      return {
        label: 'Start Input',
        icon: Play,
        action: 'start'
      };
    }
    switch (project.noxData.status) {
      case 'input_incomplete':
        return {
          label: project.noxData.preEstimation ? 'Continue your NOx assessment' : 'Start Input',
          icon: Play,
          action: 'start'
        };
      case 'input_completed':
        return {
          label: 'Generate Quote',
          icon: FileText,
          action: 'generate'
        };
      case 'price_generated':
        return {
          label: 'View Quote Status',
          icon: Clock,
          action: 'view-quote'
        };
      case 'awaiting_payment':
        return {
          label: 'Awaiting Signature',
          icon: Clock,
          action: 'awaiting'
        };
      case 'paid':
        return {
          label: 'Continue your NOx assessment',
          icon: Play,
          action: 'details'
        };
      case 'report_in_progress':
        return {
          label: 'View Report (Held)',
          icon: FileCheck,
          action: 'progress'
        };
      case 'report_delivered':
        return {
          label: 'View Report',
          icon: Download,
          action: 'download'
        };
      default:
        return {
          label: 'View',
          icon: ArrowRight,
          action: 'view'
        };
    }
  };
  const statCards = [{
    title: t('dashboard.nox.totalProjects'),
    value: stats.totalProjects,
    icon: Briefcase,
    color: 'text-blue-500'
  }, {
    title: t('dashboard.nox.activeInNox'),
    value: stats.activeProjects,
    icon: Clock,
    color: 'text-orange-500'
  }, {
    title: t('dashboard.nox.awaitingPayment'),
    value: stats.awaitingPayment,
    icon: CreditCard,
    color: 'text-yellow-500'
  }, {
    title: t('dashboard.nox.reportsInProgress'),
    value: stats.reportsInProgress,
    icon: FileText,
    color: 'text-purple-500'
  }, {
    title: t('dashboard.nox.reportsDelivered'),
    value: stats.reportsDelivered,
    icon: CheckCircle,
    color: 'text-green-500'
  }, ...(isAdmin ? [{
    title: t('dashboard.nox.spendThisMonth'),
    value: `€${stats.totalSpendThisMonth.toLocaleString('nl-NL', {
      minimumFractionDigits: 2
    })}`,
    icon: Euro,
    color: 'text-emerald-500'
  }] : [])];
  const allStatuses: OxiCloudProjectStatus[] = ['input_incomplete', 'input_completed', 'price_generated', 'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'];
  const toggleStatus = (status: string) => {
    setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };
  return <div className="space-y-6">
      {/* Stats Cards */}
      

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.nox.filters')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('dashboard.nox.searchByNameOrLocation')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
               <label className="text-sm font-medium mb-2 block">{t('dashboard.nox.statusLabel')}</label>
               <div className="flex flex-wrap gap-2">
                 {allStatuses.map(status => <Badge key={status} variant={statusFilter.includes(status) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleStatus(status)}>
                     {getTranslatedStatusLabel(status, t)}
                   </Badge>)}
              </div>
            </div>

            {/* Typology Filter */}
            <div className="w-[200px]">
               <label className="text-sm font-medium mb-2 block">{t('dashboard.nox.typology')}</label>
               <Select value={typologyFilter} onValueChange={setTypologyFilter}>
                 <SelectTrigger>
                   <SelectValue placeholder={t('dashboard.nox.allTypologies')} />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">{t('dashboard.nox.allTypologies')}</SelectItem>
                   {typologies.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>

            {/* Payment State Filter */}
            <div className="w-[200px]">
               <label className="text-sm font-medium mb-2 block">{t('dashboard.nox.paymentState')}</label>
               <Select value={paymentFilter} onValueChange={v => setPaymentFilter(v as PaymentState)}>
                 <SelectTrigger>
                   <SelectValue placeholder={t('projectList.all')} />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">{t('projectList.all')}</SelectItem>
                   <SelectItem value="unpaid">{t('dashboard.nox.unpaid')}</SelectItem>
                   <SelectItem value="paid">{t('dashboard.nox.paid')}</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
           <CardTitle className="text-base">{t('dashboard.nox.projectsCount')} ({filteredProjects.length})</CardTitle>
         </CardHeader>
         <CardContent>
           {filteredProjects.length === 0 ? <div className="text-center py-8 text-muted-foreground">
               <p>{t('dashboard.nox.noProjectsFound')}</p>
               <p className="text-sm mt-2">{t('dashboard.nox.projectsCreatedIn')}</p>
             </div> : <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>{t('dashboard.nox.projectName')}</TableHead>
                   <TableHead>{t('dashboard.nox.location')}</TableHead>
                   <TableHead>{t('dashboard.nox.typology')}</TableHead>
                   <TableHead>{t('dashboard.nox.noxStatusLabel')}</TableHead>
                   {isAdmin && <TableHead>{t('dashboard.nox.price')}</TableHead>}
                   <TableHead className="text-right">{t('dashboard.nox.action')}</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {filteredProjects.map(project => {
              const cta = getDynamicCTA(project);
              const CTAIcon = cta.icon;
              return <TableRow key={project.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm truncate max-w-[200px]">{project.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{project.projectType || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                         {project.noxData ? <OxiCloudStatusBadge status={project.noxData.status} /> : <Badge variant="outline" className="text-muted-foreground">
                             {t('dashboard.nox.startInput')}
                           </Badge>}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {project.noxData?.priceData ? (
                            <span className="font-medium">
                              €{project.noxData.priceData.totalPrice.toLocaleString('nl-NL', {
                                minimumFractionDigits: 2
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => onSelectProject(project)} className="gap-2">
                          <CTAIcon className="h-4 w-4" />
                          {cta.label}
                        </Button>
                      </TableCell>
                    </TableRow>;
            })}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>
    </div>;
}