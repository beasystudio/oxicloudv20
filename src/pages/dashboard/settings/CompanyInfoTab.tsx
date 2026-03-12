import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddCompanyModal, type CompanyModalData } from "@/components/settings/AddCompanyModal";
import { isPilotAccount, isPilotCompany, PILOT_COMPANY_ID } from "@/lib/pilotAccountUtils";
import { getCompanyById } from "@/lib/mockCompanyDB";
import { useLanguage } from "@/i18n/LanguageContext";
interface CompanyData {
  id: string;
  name: string;
  vatNumber: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
  legalName: string;
  branchAddress: string;
  divisions: string[];
  logoUrl: string;
}

// Storage key for pilot companies (separate from demo companies)
const PILOT_COMPANIES_KEY = 'oxicloud_pilot_companies';
export const CompanyInfoTab = () => {
  const {
    toast
  } = useToast();
  const { t } = useLanguage();
  const {
    logApiCall,
    currentUser,
    selectedCompanyId
  } = useMockAuth();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [editModalData, setEditModalData] = useState<CompanyModalData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if this is the pilot account
  const isPilot = isPilotAccount(currentUser?.email) || isPilotCompany(selectedCompanyId);

  // Use separate storage for pilot vs regular users, scoped to selected company
  const storageKey = isPilot ? PILOT_COMPANIES_KEY : (selectedCompanyId ? `companiesList_${selectedCompanyId}` : "companiesList");
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCompanies(parsed);
    } else {
      // Seed with the currently selected company from mockCompanyDB
      const currentCompany = selectedCompanyId ? getCompanyById(selectedCompanyId) : null;
      if (currentCompany && !isPilot) {
        const seeded: CompanyData = {
          id: currentCompany.id,
          name: currentCompany.name,
          vatNumber: currentCompany.vatNumber || '',
          street: '',
          number: '',
          postalCode: '',
          city: '',
          country: 'Belgium',
          legalName: currentCompany.name,
          branchAddress: currentCompany.address || '',
          divisions: [],
          logoUrl: currentCompany.logoUrl || ''
        };
        // Parse address if available
        if (currentCompany.address) {
          const parts = currentCompany.address.split(',').map((s: string) => s.trim());
          if (parts.length >= 2) {
            seeded.street = parts[0].replace(/\d+$/, '').trim();
            const numMatch = parts[0].match(/(\d+)$/);
            if (numMatch) seeded.number = numMatch[1];
            const cityParts = parts[1]?.split(' ') || [];
            if (cityParts.length >= 2) {
              seeded.postalCode = cityParts[0];
              seeded.city = cityParts.slice(1).join(' ');
            }
          }
        }
        saveCompanies([seeded]);
      } else {
        setCompanies([]);
      }
    }
  }, [storageKey]);
  const saveCompanies = (updatedCompanies: CompanyData[]) => {
    localStorage.setItem(storageKey, JSON.stringify(updatedCompanies));
    setCompanies(updatedCompanies);
  };
  const handleAddCompany = (companyData: CompanyModalData) => {
    const newCompany: CompanyData = {
      id: crypto.randomUUID(),
      name: companyData.name,
      vatNumber: companyData.vatNumber,
      street: companyData.street,
      number: companyData.number,
      postalCode: companyData.postalCode,
      city: companyData.city,
      country: companyData.country,
      legalName: companyData.legalName || companyData.name,
      branchAddress: companyData.locations?.length > 0 ? `${companyData.locations[0].street} ${companyData.locations[0].number}, ${companyData.locations[0].postalCode} ${companyData.locations[0].city}` : "",
      divisions: companyData.divisions || [],
      logoUrl: (companyData as any).logoUrl || ""
    };
    const updatedCompanies = [...companies, newCompany];
    saveCompanies(updatedCompanies);
    logApiCall("POST", "/api/mock/companies", newCompany);
  };
  const handleEditCompany = (companyData: CompanyModalData) => {
    if (!editModalData?.id) return;
    const updatedCompany: CompanyData = {
      id: editModalData.id,
      name: companyData.name,
      vatNumber: companyData.vatNumber,
      street: companyData.street,
      number: companyData.number,
      postalCode: companyData.postalCode,
      city: companyData.city,
      country: companyData.country,
      legalName: companyData.legalName || companyData.name,
      branchAddress: companyData.locations?.length > 0 ? `${companyData.locations[0].street} ${companyData.locations[0].number}, ${companyData.locations[0].postalCode} ${companyData.locations[0].city}` : "",
      divisions: companyData.divisions || [],
      logoUrl: (companyData as any).logoUrl || editModalData.logoUrl || ""
    };
    const updatedCompanies = companies.map(c => c.id === editModalData.id ? updatedCompany : c);
    saveCompanies(updatedCompanies);
    logApiCall("PUT", `/api/mock/companies/${editModalData.id}`, updatedCompany);
    toast({
      title: t('forms.company.companyUpdated'),
      description: `${companyData.name} ${t('forms.company.companyUpdatedDesc')}`
    });
    setEditModalData(null);
  };
  const handleDeleteCompany = () => {
    const companyToDelete = editModalData || selectedCompany;
    if (!companyToDelete?.id) return;
    const updatedCompanies = companies.filter(c => c.id !== companyToDelete.id);
    saveCompanies(updatedCompanies);
    logApiCall("DELETE", `/api/mock/companies/${companyToDelete.id}`, {});
    toast({
      title: t('forms.company.companyDeleted'),
      description: `${companyToDelete.name} ${t('forms.company.companyDeletedDesc')}`
    });
    setSelectedCompany(null);
    setEditModalData(null);
    setIsDeleteDialogOpen(false);
  };
  const openEditDialog = (company: CompanyData) => {
    // Convert CompanyData to CompanyModalData format
    const modalData: CompanyModalData = {
      id: company.id,
      name: company.name,
      vatNumber: company.vatNumber,
      street: company.street,
      number: company.number,
      bus: "",
      postalCode: company.postalCode,
      city: company.city,
      country: company.country,
      peppolId: "",
      kboNumber: "",
      legalName: company.legalName,
      divisions: company.divisions || [],
      locations: [],
      // Could parse branchAddress if needed
      logoUrl: company.logoUrl
    };
    setEditModalData(modalData);
  };
  const openDeleteDialog = (company: CompanyData) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };
  const filteredCompanies = companies.filter(company => company.name.toLowerCase().includes(searchQuery.toLowerCase()) || company.vatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || company.city?.toLowerCase().includes(searchQuery.toLowerCase()) || company.legalName?.toLowerCase().includes(searchQuery.toLowerCase()));
  return <>
      <Card className="rounded-xl border border-border/50 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">{t('forms.company.companies')}</h3>
              <p className="text-xs text-muted-foreground">{t('forms.company.companiesDesc')}</p>
            </div>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t('forms.company.addCompany')}
            </Button>
          </div>
          <div className="relative w-64 mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder={t('forms.company.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          {companies.length === 0 ? <div className="text-center py-10 text-muted-foreground">
              
               <p className="text-sm">{t('forms.company.noCompaniesYet')}</p>
              <p className="text-xs mt-1">{t('forms.company.clickToAdd')}</p>
            </div> : <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="h-9 text-xs font-medium text-muted-foreground !pl-5">{t('forms.company.companyCol')}</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('forms.company.vatNumber')}</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('forms.company.headOffice')}</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('forms.company.branches')}</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-muted-foreground !pr-5">{t('forms.company.divisions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map(company => <TooltipProvider key={company.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TableRow className="group cursor-pointer border-b border-border/30 transition-all duration-200" onDoubleClick={() => openEditDialog(company)}>
                            <TableCell className="py-3 !pl-5">
                              <div className="flex items-center gap-2.5">
                                {company.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-7 h-7 object-contain rounded" />}
                                <div>
                                  <div className="text-sm font-medium">{company.name}</div>
                                  {company.legalName && <div className="text-xs text-muted-foreground">{company.legalName}</div>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-xs text-muted-foreground">
                              {company.vatNumber || "-"}
                            </TableCell>
                            <TableCell className="py-3">
                              {company.street || company.city ? <div>
                                  <div className="text-xs">
                                    {company.street && `${company.street} ${company.number}`}
                                  </div>
                                  {company.city && <div className="text-xs text-muted-foreground">
                                      {company.postalCode} {company.city}
                                    </div>}
                                </div> : <span className="text-xs text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell className="py-3">
                              {company.branchAddress ? <span className="text-xs text-muted-foreground">
                                  {company.branchAddress}
                                </span> : <span className="text-xs text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell className="py-3 !pr-5">
                              <div className="flex flex-wrap gap-1">
                                {company.divisions.length > 0 ? <>
                                    {company.divisions.slice(0, 2).map((div, index) => <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                        {div}
                                      </Badge>)}
                                    {company.divisions.length > 2 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                        +{company.divisions.length - 2}
                                      </Badge>}
                                  </> : <span className="text-xs text-muted-foreground">-</span>}
                              </div>
                            </TableCell>
                          </TableRow>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="text-xs">{t('forms.company.doubleClickEdit')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>)}
                </TableBody>
              </Table>
            </div>}
        </div>
      </Card>

      {/* Add/Edit Company Modal - Two-step VAT lookup */}
      <AddCompanyModal open={isAddDialogOpen || !!editModalData} onOpenChange={open => {
      if (!open) {
        setIsAddDialogOpen(false);
        setEditModalData(null);
      }
    }} existingVatNumbers={companies.filter(c => c.id !== editModalData?.id) // Exclude current company when editing
    .map(c => c.vatNumber?.replace(/[\s.\-]/g, '').toUpperCase()).filter(Boolean)} initialData={editModalData} onCompanyAdded={handleAddCompany} onCompanyUpdated={handleEditCompany} onCompanyDeleted={() => {
      if (editModalData) {
        setSelectedCompany({
          id: editModalData.id
        } as CompanyData);
        setEditModalData(null);
        setIsDeleteDialogOpen(true);
      }
    }} />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{t('forms.company.deleteCompany')}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t('forms.company.deleteConfirm')} "{selectedCompany?.name || editModalData?.name}"{t('forms.company.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('forms.company.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('forms.company.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
};