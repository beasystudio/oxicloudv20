import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Copy, Edit, FileCheck, Lock, Mail, MapPin, Phone, Play, RefreshCw, Search, Trash2, User, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/LanguageContext';
import type { LocalProject } from '@/lib/mockLocalProjects';
import type { NoxProjectData } from '@/lib/noxProjectStore';
import { cn } from '@/lib/utils';

import { NoxStepProgress } from './NoxStepProgress';
import { NoxVersionHistory } from './NoxVersionHistory';
import { ProjectImagePreview } from './ProjectImagePreview';

export interface ProjectBinderContact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  mobile?: string;
  company: string;
  companyType: 'client' | 'team' | 'others';
  function?: string;
  vatNumber?: string;
  invoiceAddress?: string;
  workPhone?: string;
  isCompany?: boolean;
}

interface ProjectBinderDetailProps {
  project: LocalProject;
  companyName: string;
  isAdmin: boolean;
  canEditProject: boolean;
  noxData?: NoxProjectData;
  contacts: ProjectBinderContact[];
  selectedContactId?: string | null;
  contactFilter: 'all' | 'client' | 'team' | 'others';
  contactSearchQuery: string;
  onContactFilterChange: (filter: 'all' | 'client' | 'team' | 'others') => void;
  onContactSearchChange: (value: string) => void;
  onBack: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onNoxPrimaryAction: () => void;
  onCloneVersion: () => void;
  onContactClick: (contact: ProjectBinderContact) => void;
  onContactDoubleClick: (contact: ProjectBinderContact) => void;
  onOpenAddExistingContact: () => void;
  onOpenCreateContact: () => void;
}

const NOX_STATUS_LABEL: Record<string, string> = {
  input_incomplete: 'Input incomplete',
  input_completed: 'Input completed',
  price_generated: 'Price generated',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  report_in_progress: 'Report in progress',
  report_delivered: 'Report delivered',
};

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+32') || cleaned.startsWith('0')) {
    const normalized = cleaned.startsWith('+32') ? cleaned.slice(3) : cleaned.slice(1);
    if (normalized.length >= 8) {
      return `0${normalized.slice(0, 2)} / ${normalized.slice(2, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7)}`;
    }
  }
  return phone;
};

const getPrimaryActionMeta = (noxData: NoxProjectData | undefined, t: (key: string) => string) => {
  if (!noxData) {
    return {
      icon: Play,
      label: t('dashboard.projectsDashboard.startNox'),
    };
  }

  switch (noxData.status) {
    case 'input_incomplete':
      return {
        icon: Play,
        label: noxData.preEstimation ? t('dashboard.projectsDashboard.continueNox') : t('dashboard.nox.startInput'),
      };
    case 'input_completed':
      return {
        icon: RefreshCw,
        label: t('dashboard.projectsDashboard.generateQuote'),
      };
    case 'price_generated':
      return {
        icon: RefreshCw,
        label: t('dashboard.projectsDashboard.sendQuoteToClient'),
      };
    case 'awaiting_payment':
      return {
        icon: RefreshCw,
        label: t('dashboard.projectsDashboard.awaitingPayment'),
      };
    case 'paid':
    case 'report_in_progress':
      return {
        icon: RefreshCw,
        label: t('dashboard.projectsDashboard.continueNox'),
      };
    case 'report_delivered':
      return {
        icon: FileCheck,
        label: t('dashboard.projectsDashboard.viewReport'),
      };
    default:
      return {
        icon: Play,
        label: t('dashboard.projectsDashboard.startNox'),
      };
  }
};

export function ProjectBinderDetail({
  project,
  companyName,
  isAdmin,
  canEditProject,
  noxData,
  contacts,
  selectedContactId,
  contactFilter,
  contactSearchQuery,
  onContactFilterChange,
  onContactSearchChange,
  onBack,
  onEditProject,
  onDeleteProject,
  onNoxPrimaryAction,
  onCloneVersion,
  onContactClick,
  onContactDoubleClick,
  onOpenAddExistingContact,
  onOpenCreateContact,
}: ProjectBinderDetailProps) {
  const { t, language } = useLanguage();
  const [showVersions, setShowVersions] = useState(false);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  const hasClientContact = contacts.some((contact) => contact.companyType === 'client');
  const hasTeamContact = contacts.some((contact) => contact.companyType === 'team');
  const isNoxLocked = !isAdmin && (!hasClientContact || !hasTeamContact);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (contactFilter !== 'all' && contact.companyType !== contactFilter) return false;

      if (!contactSearchQuery) return true;

      const query = contactSearchQuery.toLowerCase();
      return (
        contact.fullName.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
      );
    });
  }, [contactFilter, contactSearchQuery, contacts]);

  const groupedCompanies = useMemo(() => {
    const groups = new Map<string, { companyContact: ProjectBinderContact; persons: ProjectBinderContact[] }>();

    filteredContacts.forEach((contact) => {
      const existing = groups.get(contact.company);

      if (!existing) {
        groups.set(contact.company, {
          companyContact: {
            ...contact,
            id: `company-${contact.company}`,
            fullName: contact.company,
            isCompany: true,
          },
          persons: contact.isCompany ? [] : [contact],
        });
        return;
      }

      existing.companyContact = {
        ...existing.companyContact,
        email: existing.companyContact.email || contact.email,
        phone: existing.companyContact.phone || contact.phone,
        invoiceAddress: existing.companyContact.invoiceAddress || contact.invoiceAddress,
        vatNumber: existing.companyContact.vatNumber || contact.vatNumber,
      };

      if (!contact.isCompany) {
        existing.persons.push(contact);
      }
    });

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredContacts]);

  useEffect(() => {
    if (groupedCompanies.length === 0) {
      setActiveCompany(null);
      return;
    }

    const hasActiveCompany = groupedCompanies.some(([company]) => company === activeCompany);
    if (!hasActiveCompany) {
      setActiveCompany(groupedCompanies[0][0]);
    }
  }, [activeCompany, groupedCompanies]);

  const activeCompanyGroup = groupedCompanies.find(([company]) => company === activeCompany)?.[1] ?? null;
  const primaryAction = getPrimaryActionMeta(noxData, t);
  const PrimaryActionIcon = primaryAction.icon;
  const versionCount = (noxData?.versionHistory?.length ?? 0) + (noxData ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('dashboard.projectsDashboard.projectOverview')}
          </Button>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{project.projectNumber}</span>
              <span>•</span>
              <span>{companyName}</span>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-medium">
                {project.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description || project.mission || project.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditProject && (
            <Button variant="outline" size="sm" onClick={onEditProject}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {!isAdmin && (
            <Button variant="outline" size="sm" onClick={onDeleteProject}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {t('dashboard.projectsDashboard.details')}
                </div>

                <div
                  className={cn(
                    'space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4',
                    canEditProject && 'cursor-pointer transition-colors hover:bg-muted/40'
                  )}
                  onDoubleClick={canEditProject ? onEditProject : undefined}
                >
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{t('dashboard.projectsDashboard.number')}</span>
                    <span className="font-medium text-foreground">{project.projectNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{t('dashboard.projectsDashboard.manager')}</span>
                    <span className="font-medium text-foreground">{project.managerName || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{t('dashboard.projectsDashboard.company')}</span>
                    <span className="font-medium text-foreground">{companyName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground">{project.projectType || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-border/50 pt-4">
                <ProjectImagePreview projectId={project.id} projectName={project.name} />
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {t('dashboard.projectsDashboard.siteLocation')}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {project.location || t('dashboard.projectsDashboard.noLocation')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8 space-y-6">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t('dashboard.projectsDashboard.noxAssessment')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Clear progress steps with a single primary next action.</p>
                </div>
                {noxData && (
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                    {NOX_STATUS_LABEL[noxData.status] || noxData.status}
                  </Badge>
                )}
              </div>

              {isNoxLocked ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-background p-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-foreground">{t('dashboard.projectsDashboard.contactsRequired')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.projectsDashboard.contactsRequiredDesc').replace(/<br\s*\/?>/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant={hasClientContact ? 'secondary' : 'outline'} className="rounded-full px-3 py-1 text-[11px]">
                      {hasClientContact ? 'Client linked' : 'Client missing'}
                    </Badge>
                    <Badge variant={hasTeamContact ? 'secondary' : 'outline'} className="rounded-full px-3 py-1 text-[11px]">
                      {hasTeamContact ? 'Team linked' : 'Team missing'}
                    </Badge>
                  </div>

                  <Button className="mt-4 w-full" variant="outline" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    {t('dashboard.projectsDashboard.noxLocked')}
                  </Button>
                </div>
              ) : noxData ? (
                <>
                  <NoxStepProgress currentStatus={noxData.status} />

                  <Button className="w-full justify-between gap-3" size="lg" onClick={onNoxPrimaryAction}>
                    <span className="flex items-center gap-2">
                      <PrimaryActionIcon className="h-4 w-4" />
                      {primaryAction.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {(noxData.versionHistory?.length ?? 0) > 0 && (
                    <div className="border-t border-border/50 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowVersions((current) => !current)}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showVersions ? 'Hide' : 'Show'} {versionCount} versions
                      </button>

                      {showVersions && (
                        <div className="mt-4">
                          <NoxVersionHistory
                            noxData={{
                              status: noxData.status,
                              currentVersion: noxData.currentVersion,
                              versionHistory: noxData.versionHistory,
                              noxCreatedAt: noxData.noxCreatedAt,
                            }}
                            onCloneVersion={onCloneVersion}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {noxData.status === 'report_delivered' && (
                    <div className="border-t border-border/50 pt-4">
                      <Button variant="outline" className="w-full" onClick={onCloneVersion}>
                        <Copy className="mr-2 h-4 w-4" />
                        {t('dashboard.projectsDashboard.newVersionCreated')}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                  <p className="mb-4 text-sm text-muted-foreground">
                    {language === 'nl' ? 'Nog geen NOx-assessment gestart voor dit project.' : 'No NOx assessment started for this project yet.'}
                  </p>
                  <Button className="w-full justify-between" size="lg" onClick={onNoxPrimaryAction}>
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      {primaryAction.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-4 border-b border-border/50 p-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t('dashboard.projectsDashboard.contacts')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {groupedCompanies.length} companies • {filteredContacts.filter((contact) => !contact.isCompany).length} contact persons
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-full bg-muted p-1">
                    {(['all', 'client', 'team', 'others'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => onContactFilterChange(tab)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          contactFilter === tab ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {tab === 'all'
                          ? t('common.all')
                          : tab === 'client'
                            ? t('dashboard.projectsDashboard.client')
                            : tab === 'team'
                              ? t('dashboard.projectsDashboard.team')
                              : t('dashboard.projectsDashboard.other')}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={contactSearchQuery}
                      onChange={(event) => onContactSearchChange(event.target.value)}
                      placeholder={`${t('common.search')}...`}
                      className="h-10 w-56 pl-9"
                    />
                  </div>

                  {!isAdmin && (
                    <>
                      <Button variant="outline" size="sm" onClick={onOpenAddExistingContact}>
                        {t('dashboard.projectsDashboard.addExisting')}
                      </Button>
                      <Button size="sm" onClick={onOpenCreateContact}>
                        {t('dashboard.projectsDashboard.createNew')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 rounded-full bg-muted p-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{t('dashboard.projectsDashboard.noContactsLinked')}</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {isAdmin ? 'No contacts linked to this project.' : t('dashboard.projectsDashboard.addContactsDesc')}
                  </p>
                </div>
              ) : groupedCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 rounded-full bg-muted p-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">No contacts match this filter</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Adjust the search or switch tabs.</p>
                </div>
              ) : (
                <div className="grid min-h-[32rem] grid-cols-[320px_minmax(0,1fr)]">
                  <div className="border-r border-border/50 bg-muted/10 p-3">
                    <div className="space-y-2">
                      {groupedCompanies.map(([company, group]) => {
                        const isActive = company === activeCompany;

                        return (
                          <button
                            key={company}
                            type="button"
                            onClick={() => setActiveCompany(company)}
                            className={cn(
                              'w-full rounded-2xl border px-4 py-3 text-left transition-transform duration-200 hover:scale-[1.01]',
                              isActive
                                ? 'border-border bg-background'
                                : 'border-transparent bg-transparent hover:border-border/60 hover:bg-background/70'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{company}</p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">{group.companyContact.email || '—'}</p>
                              </div>
                              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px]">
                                {group.persons.length}
                              </Badge>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{group.companyContact.phone ? formatPhoneNumber(group.companyContact.phone) : '—'}</span>
                              <span>{group.companyContact.invoiceAddress || '—'}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="min-w-0 p-5">
                    {activeCompanyGroup && (
                      <div className="space-y-6">
                        <div className="space-y-3 border-b border-border/50 pb-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{activeCompany}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">Selected company details for this project.</p>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                              {activeCompanyGroup.persons.length} contacts
                            </Badge>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                Email
                              </div>
                              <p className="text-sm font-medium text-foreground">{activeCompanyGroup.companyContact.email || '—'}</p>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                Phone
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {activeCompanyGroup.companyContact.phone
                                  ? formatPhoneNumber(activeCompanyGroup.companyContact.phone)
                                  : '—'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                Address
                              </div>
                              <p className="text-sm font-medium text-foreground">{activeCompanyGroup.companyContact.invoiceAddress || '—'}</p>
                            </div>
                          </div>
                        </div>

                        <section className="space-y-3">
                          <div className="flex items-end justify-between gap-4 border-b border-border/50 pb-3">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">Contact persons</h4>
                              <p className="mt-1 text-xs text-muted-foreground">{activeCompanyGroup.persons.length} contacts</p>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                            <div className="grid grid-cols-[minmax(160px,1fr)_minmax(140px,1fr)_minmax(220px,1.3fr)_120px] gap-4 border-b border-border/50 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                              <div>{t('dashboard.projectsDashboard.name')}</div>
                              <div>{t('dashboard.projectsDashboard.function')}</div>
                              <div>Email</div>
                              <div>{t('dashboard.projectsDashboard.phone')}</div>
                            </div>

                            {activeCompanyGroup.persons.length > 0 ? (
                              activeCompanyGroup.persons.map((contact, index) => (
                                <button
                                  key={contact.id}
                                  type="button"
                                  onClick={() => onContactClick(contact)}
                                  onDoubleClick={() => onContactDoubleClick(contact)}
                                  className={cn(
                                    'grid w-full grid-cols-[minmax(160px,1fr)_minmax(140px,1fr)_minmax(220px,1.3fr)_120px] gap-4 px-4 py-3 text-left text-sm transition-transform duration-200 hover:scale-[1.005] hover:bg-muted/30',
                                    index < activeCompanyGroup.persons.length - 1 && 'border-b border-border/40',
                                    selectedContactId === contact.id && 'bg-muted/40'
                                  )}
                                >
                                  <div className="font-medium text-foreground">{contact.fullName}</div>
                                  <div className="text-muted-foreground">{contact.function || '—'}</div>
                                  <div className="truncate text-muted-foreground">{contact.email || '—'}</div>
                                  <div className="text-muted-foreground">{contact.phone ? formatPhoneNumber(contact.phone) : '—'}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-sm text-muted-foreground">No contact persons available.</div>
                            )}
                          </div>
                        </section>

                        <section className="space-y-3">
                          <div className="flex items-end justify-between gap-4 border-b border-border/50 pb-3">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">Branches & addresses</h4>
                              <p className="mt-1 text-xs text-muted-foreground">1 location</p>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 border-b border-border/50 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                              <div>Label</div>
                              <div>{t('dashboard.contactsDashboard.address')}</div>
                            </div>
                            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 px-4 py-4 text-sm">
                              <div className="font-medium text-foreground">Main office</div>
                              <div className="text-muted-foreground">
                                {activeCompanyGroup.companyContact.invoiceAddress || project.location || '—'}
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}