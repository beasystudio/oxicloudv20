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
import { Search, Download, Building2, User, Plus } from 'lucide-react';
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

          {/* Main Content - Master-Detail Layout */}
          <div className="h-[calc(100vh-230px)] flex gap-0 overflow-hidden">
            {/* LEFT: Master List */}
            <div className={cn(
              "flex flex-col min-h-0 transition-all duration-300 border border-border/40 rounded-2xl bg-card/80 backdrop-blur-xl overflow-hidden",
              viewMode === 'company' && expandedCompanies.length > 0 ? "w-[380px] shrink-0" : "flex-1"
            )}>
              {/* List Header */}
              <div className="px-4 py-3 border-b border-border/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44 h-8 text-xs">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="lastname-asc">{t('pilot.contacts.sortNameAsc')}</SelectItem>
                      <SelectItem value="lastname-desc">{t('pilot.contacts.sortNameDesc')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <Button size="sm" onClick={() => setShowAddCompany(true)} className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />{t('pilot.contacts.addContact')}
                  </Button>
                </div>
              </div>

              {/* List Body */}
              <div className="flex-1 overflow-auto min-h-0">
                {viewMode === 'person' ? (
                  /* Person View */
                  <div>
                    {filteredPersons.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium mb-1">{t('pilot.contacts.noContactsYet')}</p>
                        <p className="text-xs">{t('pilot.contacts.noContactsDesc')}</p>
                      </div>
                    ) : (
                      filteredPersons.map(p => (
                        <div
                          key={p.id}
                          className="px-4 py-3 border-b border-border/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-10 relative group"
                          onDoubleClick={() => handlePersonDoubleClick({ ...p, company: p.company })}
                        >
                          <div className="text-sm font-medium text-foreground">{p.name}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">{p.company}</span>
                            <span className="text-[11px] text-muted-foreground/60">·</span>
                            <span className="text-[11px] text-muted-foreground truncate">{p.email}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Company View */
                  filteredCompanies.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium mb-1">{t('pilot.contacts.noContactsYet')}</p>
                      <p className="text-xs">{t('pilot.contacts.noContactsDesc')}</p>
                      <Button size="sm" className="mt-4" onClick={() => setShowAddCompany(true)}>
                        <Plus className="h-4 w-4 mr-2" />{t('pilot.contacts.addContact')}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {filteredCompanies.map(grp => {
                        const isSelected = expandedCompanies.includes(grp.id);
                        return (
                          <div
                            key={grp.id}
                            className={cn(
                              "px-4 py-3 border-b border-border/20 cursor-pointer transition-all duration-200 relative",
                              isSelected
                                ? "bg-card ring-1 ring-border rounded-xl mx-1.5 my-0.5 border-transparent shadow-sm"
                                : "hover:scale-[1.02] hover:z-10"
                            )}
                            onClick={() => {
                              setExpandedCompanies(isSelected ? [] : [grp.id]);
                            }}
                            onDoubleClick={(e) => { e.stopPropagation(); handleCompanyDoubleClick(grp); }}
                          >
                            <div className="text-sm font-semibold text-foreground">{grp.name}</div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                              <span className="truncate max-w-[160px]">{grp.email || '—'}</span>
                              <span className="opacity-40">·</span>
                              <span className="whitespace-nowrap">{grp.telephone || '—'}</span>
                            </div>
                            {grp.address && (
                              <div className="text-[10px] mt-0.5 truncate text-muted-foreground/60">
                                {grp.address}
                              </div>
                            )}
                            {grp.persons.length > 0 && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground/40">
                                {grp.persons.length} <User className="inline h-3 w-3 -mt-0.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* RIGHT: Detail Panel */}
            {viewMode === 'company' && expandedCompanies.length > 0 && (() => {
              const selectedCompanyData = filteredCompanies.find(c => expandedCompanies.includes(c.id));
              if (!selectedCompanyData) return null;
              return (
                <div className="flex-1 min-h-0 overflow-auto border border-border/40 rounded-2xl bg-card/80 backdrop-blur-xl ml-3">
                  {/* Detail Header */}
                  <div className="px-6 py-5 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{selectedCompanyData.name}</h2>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                          {selectedCompanyData.email && <span>{selectedCompanyData.email}</span>}
                          {selectedCompanyData.telephone && <span>{selectedCompanyData.telephone}</span>}
                        </div>
                        {selectedCompanyData.address && (
                          <div className="text-xs text-muted-foreground/70 mt-1">{selectedCompanyData.address}</div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleCompanyDoubleClick(selectedCompanyData)}>
                        {t('pilot.contacts.edit') || 'Edit'}
                      </Button>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="p-6 space-y-6">
                    {/* Contact Persons Section */}
                    {selectedCompanyData.persons.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            CONTACTPERSONEN
                          </h3>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            ({selectedCompanyData.persons.length})
                          </span>
                        </div>
                        <div className="rounded-xl border border-border/30 overflow-hidden">
                          <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/20">
                            <div>Naam</div>
                            <div>Functie</div>
                            <div>E-mail</div>
                            <div>Telefoon</div>
                          </div>
                          {selectedCompanyData.persons.map((p, pIdx) => (
                            <div
                              key={p.id}
                              className={cn(
                                "grid grid-cols-4 gap-4 px-4 py-2.5 text-xs cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:z-10 relative",
                                pIdx < selectedCompanyData.persons.length - 1 && "border-b border-border/10"
                              )}
                              onDoubleClick={(e) => { e.stopPropagation(); handlePersonDoubleClick({ ...p, company: selectedCompanyData.name }); }}
                            >
                              <div className="font-medium text-foreground">{p.name}</div>
                              <div className="text-muted-foreground">{p.function || '—'}</div>
                              <div className="text-muted-foreground truncate">{p.email}</div>
                              <div className="text-muted-foreground">{p.telephone}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Branches / Addresses Section */}
                    {selectedCompanyData.addresses.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            VESTIGINGEN / ADRESSEN
                          </h3>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            ({selectedCompanyData.addresses.length})
                          </span>
                        </div>
                        <div className="rounded-xl border border-border/30 overflow-hidden">
                          <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/20">
                            <div>Naam</div>
                            <div>Straat</div>
                            <div>Nummer</div>
                            <div>Postcode</div>
                            <div>Gemeente</div>
                          </div>
                          {selectedCompanyData.addresses.map((addr, addrIdx) => (
                            <div
                              key={addr.id}
                              className={cn(
                                "grid grid-cols-5 gap-4 px-4 py-2.5 text-xs",
                                addrIdx < selectedCompanyData.addresses.length - 1 && "border-b border-border/10"
                              )}
                            >
                              <div className="font-medium text-foreground">{addr.name}</div>
                              <div className="text-muted-foreground">{addr.street}</div>
                              <div className="text-muted-foreground">{addr.number}</div>
                              <div className="text-muted-foreground">{addr.postcode}</div>
                              <div className="text-muted-foreground">{addr.gemeente}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCompanyData.persons.length === 0 && selectedCompanyData.addresses.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">{t('pilot.contacts.noContactsYet')}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
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
