import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronRight, Download, Building2, User, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPilotSession, getPilotUser, getPilotCompany, getPilotContacts, getPilotEmployees,
  addPilotContact, PilotContact
} from '@/lib/pilotSessionStore';
import { PilotAddCompanyDialog } from '@/components/pilot/PilotAddCompanyDialog';
import { PilotAddPersonDialog } from '@/components/pilot/PilotAddPersonDialog';
import { ContactDetailModal, type ContactData } from '@/components/contacts/ContactDetailModal';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
// Contact type tree for pilot (seeded defaults)
interface ContactTypeNode {
  id: string;
  label: string;
  children?: ContactTypeNode[];
}

const PILOT_CONTACT_TYPES: ContactTypeNode[] = [
  {
    id: 'consultant',
    label: 'Consultant',
    children: [{ id: 'architect', label: 'Architect' }],
  },
  {
    id: 'opdrachtgever',
    label: 'Opdrachtgever',
    children: [
      { id: 'bouwheer', label: 'Bouwheer' },
      { id: 'facturatie', label: 'Facturatie' },
    ],
  },
];

// Company view: group pilot contacts by company
interface CompanyGroup {
  id: string;
  name: string;
  email?: string;
  telephone?: string;
  vatNumber?: string;
  contactType?: string;
  address?: string;
  persons: {
    id: string;
    name: string;
    function: string;
    email: string;
    telephone: string;
  }[];
  addresses: {
    id: string;
    name: string;
    street: string;
    number: string;
    postcode: string;
    gemeente: string;
  }[];
}

export default function PilotContacts() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();

  const [contacts, setContacts] = useState(getPilotContacts());
  const [employees, setEmployees] = useState(getPilotEmployees());
  const [viewMode, setViewMode] = useState<'company' | 'person'>('company');
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('lastname-asc');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  // Contact detail modal state
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!session) navigate('/pilot-demo');
  }, []);

  // Handle URL action params from global + menu
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add-company') {
      setShowAddCompany(true);
      setSearchParams({}, { replace: true });
    } else if (action === 'add-person') {
      setShowAddPerson(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const refreshData = () => {
    setContacts(getPilotContacts());
    setEmployees(getPilotEmployees());
  };

  // Build company groups from pilot contacts
  const companyGroups = useMemo((): CompanyGroup[] => {
    if (!user || !company) return [];
    const groups: Record<string, CompanyGroup> = {};

    // Add own company with employees
    const ownAddr = company.legalAddress || '';
    const ownCity = [company.postalCode, company.city].filter(Boolean).join(' ');
    groups[company.id] = {
      id: company.id,
      name: company.name,
      email: user.email,
      telephone: user.phone,
      vatNumber: company.vatNumber,
      contactType: 'consultant',
      address: [ownAddr, ownCity].filter(Boolean).join(', ') || undefined,
      persons: [],
      addresses: company.legalAddress ? [{
        id: `${company.id}-addr`,
        name: company.name,
        street: company.legalAddress,
        number: '',
        postcode: company.postalCode || '',
        gemeente: company.city || '',
      }] : [],
    };

    // owner-function is metadata only, exclude from person lists
    const ownerEmpRec = employees.find(e => e.id === 'owner-function');
    const realEmps = employees.filter(e => e.id !== 'owner-function');
    const seenEmails = new Set<string>();

    // Add owner as person first
    groups[company.id].persons.push({
      id: 'owner',
      name: `${user.firstName} ${user.lastName}`,
      function: ownerEmpRec?.contactSubtype || '',
      email: user.email,
      telephone: user.phone || '',
    });
    seenEmails.add(user.email.toLowerCase());

    // Add real employees (skip duplicates by email)
    realEmps.forEach(emp => {
      const key = emp.email.toLowerCase();
      if (seenEmails.has(key)) return;
      seenEmails.add(key);
      groups[company.id].persons.push({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        function: emp.contactSubtype || '',
        email: emp.email,
        telephone: emp.phone || emp.mobile || '',
      });
    });

    // Add external contacts grouped by company
    contacts.filter(c => c.type === 'company').forEach(cc => {
      const addr = [cc.street, cc.number].filter(Boolean).join(' ');
      const cityLine = [cc.postalCode, cc.city].filter(Boolean).join(' ');
      groups[cc.id] = {
        id: cc.id,
        name: cc.companyName || 'Onbekend',
        email: cc.email,
        telephone: cc.phone,
        vatNumber: cc.vatNumber,
        contactType: cc.contactType,
        address: [addr, cityLine].filter(Boolean).join(', ') || undefined,
        persons: [],
        addresses: cc.street ? [{
          id: `${cc.id}-addr`,
          name: cc.companyName || '',
          street: cc.street || '',
          number: cc.number || '',
          postcode: cc.postalCode || '',
          gemeente: cc.city || '',
        }] : [],
      };
    });

    // Add persons to their company
    contacts.filter(c => c.type === 'person' && c.companyId).forEach(p => {
      if (groups[p.companyId!]) {
      groups[p.companyId!].persons.push({
          id: p.id,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          function: p.contactType || '',
          email: p.email || '',
          telephone: p.phone || '',
        });
      }
    });

    return Object.values(groups);
  }, [contacts, employees, company, user]);

  // All persons flat list
  const allPersons = useMemo(() => {
    const persons: { id: string; name: string; company: string; function: string; email: string; telephone: string }[] = [];

    if (!user || !company) return persons;

    const ownerEmpRecord = employees.find(e => e.id === 'owner-function');
    const realEmployees = employees.filter(e => e.id !== 'owner-function');

    const ownerInRealEmployees = realEmployees.some(e => e.email === user.email);
    if (!ownerInRealEmployees) {
      persons.push({
        id: 'owner',
        name: `${user.lastName} ${user.firstName}`,
        company: company.name,
        function: ownerEmpRecord?.contactSubtype || '',
        email: user.email,
        telephone: user.phone || '',
      });
    }

    realEmployees.forEach(emp => {
      persons.push({
        id: emp.id,
        name: `${emp.lastName} ${emp.firstName}`,
        company: company.name,
        function: emp.contactSubtype || '',
        email: emp.email,
        telephone: emp.phone || emp.mobile || '',
      });
    });

    // External persons
    contacts.filter(c => c.type === 'person').forEach(p => {
      const parentCompany = contacts.find(cc => cc.id === p.companyId);
      persons.push({
        id: p.id,
        name: `${p.lastName || ''} ${p.firstName || ''}`.trim(),
        company: parentCompany?.companyName || 'Onbekend',
        function: p.contactType || '',
        email: p.email || '',
        telephone: p.phone || '',
      });
    });

    return persons;
  }, [contacts, employees, company, user]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companyGroups.filter(g => {
      const matchesSearch = !searchTerm ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.persons.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(g.contactType || '');
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'lastname-desc') return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
  }, [companyGroups, searchTerm, selectedTypes, sortBy]);

  // Filtered persons
  const filteredPersons = useMemo(() => {
    return allPersons.filter(p => {
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'lastname-desc') return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
  }, [allPersons, searchTerm, sortBy]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleType = (id: string) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleCompany = (id: string) => {
    setExpandedCompanies(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Double-click handlers
  const handleCompanyDoubleClick = (grp: CompanyGroup) => {
    const contact: ContactData = {
      id: grp.id,
      name: grp.name,
      company: grp.name,
      email: grp.email || '',
      mobilePhone: '',
      workPhone: grp.telephone || '',
      homePhone: '',
      contactCategory: grp.contactType,
      isCompany: true,
    };
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handlePersonDoubleClick = (person: { id: string; name: string; company?: string; function: string; email: string; telephone: string }) => {
    const contact: ContactData = {
      id: person.id,
      name: person.name,
      company: person.company || '',
      email: person.email,
      mobilePhone: '',
      workPhone: person.telephone,
      homePhone: '',
      contactCategory: 'algemeen',
      isCompany: false,
    };
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleContactUpdated = () => {
    setSelectedContact(null);
    refreshData();
  };

  if (!session || !user || !company) return null;

  return (
    <>
      <Helmet><title>Contacten - OxiCloud</title></Helmet>
      <div className="min-h-screen bg-background">
        <PilotNavigation />
        <div className="container mx-auto px-4 py-6">

          {/* Search & Filter Bar with Company/Person toggle — matches Demo */}
          <Card className="mb-4">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md overflow-hidden shrink-0">
                  <button
                    onClick={() => setViewMode('company')}
                    className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                      viewMode === 'company' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t('pilot.contacts.company')}
                  </button>
                  <button
                    onClick={() => setViewMode('person')}
                    className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-l",
                      viewMode === 'person' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t('pilot.contacts.person')}
                  </button>
                </div>
                <div className="flex-1">
                  <Input placeholder={t('pilot.contacts.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="adv-search" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">{t('pilot.contacts.advancedSearch')}</Label>
                  <Switch id="adv-search" checked={advancedSearch} onCheckedChange={setAdvancedSearch} />
                </div>
                <Button variant="outline" className="h-8 text-sm" onClick={() => { setSearchTerm(''); setSelectedTypes([]); }}>
                  {t('pilot.contacts.clear')}
                </Button>
                <Button variant="outline" className="h-8 text-sm" onClick={() => toast.info(t('pilot.contacts.exportSoon'))}>
                  <Download className="h-3 w-3 mr-1" />{t('pilot.contacts.export')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Full Width */}
          <div className="h-[calc(100vh-230px)]">
            <Card className="h-full flex flex-col min-h-0">
              <CardHeader className="pb-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-44 h-8 text-xs bg-background">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="lastname-asc">{t('pilot.contacts.sortNameAsc')}</SelectItem>
                        <SelectItem value="lastname-desc">{t('pilot.contacts.sortNameDesc')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {viewMode === 'company' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setExpandedCompanies(filteredCompanies.map(c => c.id))} className="h-8 gap-1.5 text-xs">
                          <ArrowDown className="h-3 w-3" />{t('pilot.contacts.showAll')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setExpandedCompanies([])} className="h-8 gap-1.5 text-xs">
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Button size="sm" onClick={() => setShowAddCompany(true)} className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />{t('pilot.contacts.addContact')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-auto min-h-0">
                  {viewMode === 'person' ? (
                    /* ═══ PERSOON WEERGAVE ═══ */
                    <div>
                      <div className="grid grid-cols-[minmax(180px,1.5fr)_minmax(160px,1.2fr)_minmax(200px,1.5fr)_minmax(140px,1fr)] gap-4 px-6 py-3 border-b border-border bg-background text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                        <div>{t('pilot.contacts.name')}</div>
                        <div>{t('pilot.contacts.companyLabel')}</div>
                        <div>{t('pilot.contacts.email')}</div>
                        <div>{t('pilot.contacts.telephone')}</div>
                      </div>
                      {filteredPersons.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-4 opacity-40" />
                          <p className="text-base font-medium mb-2">{t('pilot.contacts.noContactsYet')}</p>
                          <p className="text-sm">{t('pilot.contacts.noContactsDesc')}</p>
                        </div>
                      ) : (
                        filteredPersons.map(p => (
                          <div
                            key={p.id}
                            className="grid grid-cols-[minmax(180px,1.5fr)_minmax(160px,1.2fr)_minmax(200px,1.5fr)_minmax(140px,1fr)] gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group rounded-lg hover:bg-[hsl(var(--neon-lime))]/90 hover:backdrop-blur-md hover:shadow-lg hover:shadow-[hsl(var(--neon-lime))]/20 hover:scale-[1.02] hover:z-10 relative hover:ring-2 hover:ring-[hsl(var(--neon-lime))]/50 hover:ring-offset-1"
                            onDoubleClick={() => handlePersonDoubleClick({ ...p, company: p.company })}
                          >
                            <div className="text-sm font-medium group-hover:text-black transition-colors">{p.name}</div>
                            <div className="text-xs text-muted-foreground group-hover:text-black/80 transition-colors">{p.company}</div>
                            <div className="text-xs text-muted-foreground group-hover:text-black/80 transition-colors truncate">{p.email}</div>
                            <div className="text-xs text-muted-foreground group-hover:text-black/80 transition-colors">{p.telephone}</div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* ═══ BEDRIJF WEERGAVE ═══ */
                    <div className="py-2">
                      {/* Table Header */}
                      <div className="grid grid-cols-[minmax(220px,1.3fr)_minmax(200px,1fr)_130px_minmax(220px,1.2fr)] gap-6 px-6 py-3 bg-background border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                        <div>{t('pilot.contacts.company')}</div>
                        <div>{t('pilot.contacts.email')}</div>
                        <div>{t('pilot.contacts.telephone')}</div>
                        <div>ADRES</div>
                      </div>

                      {filteredCompanies.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                          <p className="text-base font-medium mb-2">{t('pilot.contacts.noContactsYet')}</p>
                          <p className="text-sm mb-4">{t('pilot.contacts.noContactsDesc')}</p>
                          <Button size="sm" onClick={() => setShowAddCompany(true)}>
                            <Plus className="h-4 w-4 mr-2" />{t('pilot.contacts.addContact')}
                          </Button>
                        </div>
                      ) : (
                        filteredCompanies.map(grp => (
                          <div key={grp.id} className={cn("group/company", expandedCompanies.includes(grp.id) && "bg-muted/20 rounded-xl my-1 shadow-sm")}>
                            {/* Main Company Row */}
                            <div
                              className={cn(
                                "grid grid-cols-[minmax(220px,1.3fr)_minmax(200px,1fr)_130px_minmax(220px,1.2fr)] gap-6 px-6 py-3 my-0.5 cursor-pointer transition-all duration-200 rounded-lg group relative",
                                expandedCompanies.includes(grp.id)
                                  ? "bg-[hsl(var(--neon-lime))]/90 backdrop-blur-md shadow-lg shadow-[hsl(var(--neon-lime))]/20 ring-2 ring-[hsl(var(--neon-lime))]/50 rounded-b-none"
                                  : "hover:bg-[hsl(var(--neon-lime))]/90 hover:backdrop-blur-md hover:shadow-lg hover:shadow-[hsl(var(--neon-lime))]/20 hover:scale-[1.02] hover:z-10 hover:ring-2 hover:ring-[hsl(var(--neon-lime))]/50 hover:ring-offset-1"
                              )}
                              onClick={() => toggleCompany(grp.id)}
                              onDoubleClick={(e) => { e.stopPropagation(); handleCompanyDoubleClick(grp); }}
                            >
                              <div className={cn("text-sm font-medium truncate transition-colors", expandedCompanies.includes(grp.id) ? "text-black" : "group-hover:text-black")}>{grp.name}</div>
                              <div className={cn("text-xs truncate transition-colors", expandedCompanies.includes(grp.id) ? "text-black/80" : "text-muted-foreground group-hover:text-black/80")}>
                                {grp.email || '—'}
                              </div>
                              <div className={cn("text-xs transition-colors", expandedCompanies.includes(grp.id) ? "text-black/80" : "text-muted-foreground group-hover:text-black/80")}>
                                {grp.telephone || '—'}
                              </div>
                              <div className={cn("text-xs truncate transition-colors", expandedCompanies.includes(grp.id) ? "text-black/80" : "text-muted-foreground group-hover:text-black/80")}>
                                {grp.address || '—'}
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedCompanies.includes(grp.id) && (grp.persons.length > 0 || grp.addresses.length > 0) && (
                              <div className="bg-background/60 rounded-b-xl mx-1">
                                {/* CONTACTPERSONEN Section */}
                                {grp.persons.length > 0 && (
                                  <div className="px-6 py-4 ml-8 border-l-2 border-primary/30">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-wider mb-3">
                                      CONTACTPERSONEN
                                      <span className="ml-1 px-1.5 py-0.5 bg-primary/15 rounded-full text-[9px] font-bold">{grp.persons.length}</span>
                                    </div>
                                    <div className="grid grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_minmax(220px,1.2fr)_130px] gap-4 text-[10px] font-medium text-muted-foreground mb-2 pb-2 border-b border-border/40">
                                      <div>Naam</div>
                                      <div>Contacttype</div>
                                      <div>E-mail</div>
                                      <div>Telefoon</div>
                                    </div>
                                    <div className="space-y-0.5">
                                      {grp.persons.map(p => (
                                        <div
                                          key={p.id}
                                          className="grid grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_minmax(220px,1.2fr)_130px] gap-4 py-2 px-3 -mx-3 text-xs rounded-lg hover:bg-[hsl(var(--neon-lime))]/70 hover:backdrop-blur-sm hover:shadow-md hover:shadow-[hsl(var(--neon-lime))]/10 hover:scale-[1.01] cursor-pointer transition-all group/emp relative hover:z-10 hover:ring-1 hover:ring-[hsl(var(--neon-lime))]/40"
                                          onDoubleClick={(e) => { e.stopPropagation(); handlePersonDoubleClick({ ...p, company: grp.name }); }}
                                        >
                                          <div className="font-medium text-foreground group-hover/emp:text-black">{p.name}</div>
                                          <div className="text-muted-foreground group-hover/emp:text-black/70">{p.function}</div>
                                          <div className="text-muted-foreground truncate group-hover/emp:text-black/70">{p.email}</div>
                                          <div className="text-muted-foreground group-hover/emp:text-black/70">{p.telephone}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* VESTIGINGEN / ADRESSEN Section */}
                                {grp.addresses.length > 0 && (
                                  <div className={cn("px-6 py-4 ml-8 border-l-2 border-primary/30", grp.persons.length > 0 && "border-t border-border/30")}>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-wider mb-3">
                                      VESTIGINGEN / ADRESSEN
                                      <span className="ml-1 px-1.5 py-0.5 bg-primary/15 rounded-full text-[9px] font-bold">{grp.addresses.length}</span>
                                    </div>
                                    <div className="grid grid-cols-[minmax(130px,1fr)_minmax(160px,1.2fr)_80px_90px_minmax(140px,1fr)] gap-4 text-[10px] font-medium text-muted-foreground mb-2 pb-2 border-b border-border/40">
                                      <div>Naam</div>
                                      <div>Straat</div>
                                      <div>Nummer</div>
                                      <div>Postcode</div>
                                      <div>Gemeente</div>
                                    </div>
                                    <div className="space-y-0.5">
                                      {grp.addresses.map(addr => (
                                        <div key={addr.id} className="grid grid-cols-[minmax(130px,1fr)_minmax(160px,1.2fr)_80px_90px_minmax(140px,1fr)] gap-4 py-2 px-3 -mx-3 text-xs rounded-lg hover:bg-[hsl(var(--neon-lime))]/70 hover:backdrop-blur-sm hover:shadow-md hover:shadow-[hsl(var(--neon-lime))]/10 hover:scale-[1.01] cursor-pointer transition-all group/addr relative hover:z-10 hover:ring-1 hover:ring-[hsl(var(--neon-lime))]/40">
                                          <div className="font-medium text-foreground group-hover/addr:text-black">{addr.name}</div>
                                          <div className="text-muted-foreground group-hover/addr:text-black/70">{addr.street}</div>
                                          <div className="text-muted-foreground group-hover/addr:text-black/70">{addr.number}</div>
                                          <div className="text-muted-foreground group-hover/addr:text-black/70">{addr.postcode}</div>
                                          <div className="text-muted-foreground group-hover/addr:text-black/70">{addr.gemeente}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PilotAddCompanyDialog
        open={showAddCompany}
        onOpenChange={(open) => { setShowAddCompany(open); if (!open) refreshData(); }}
        onSaved={refreshData}
      />

      <PilotAddPersonDialog
        open={showAddPerson}
        onOpenChange={(open) => { setShowAddPerson(open); if (!open) refreshData(); }}
        onSaved={refreshData}
      />
      {/* Contact Detail Modal */}
      <ContactDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        contact={selectedContact}
        onContactUpdated={handleContactUpdated}
      />
    </>
  );
}
