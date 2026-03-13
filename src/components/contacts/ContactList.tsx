/**
 * Contact List Component
 * Displays all contacts in a sortable/filterable table with filter tree
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllContacts, deleteContact, getAllTaxonomy, getHoofdtypes, getAllOrganizationalLabels, OrganizationalLabel } from "@/lib/mockContactDB";
import { Contact, ContactType } from "@/types/contact";
import { ContactFormDialog } from "./ContactFormDialog";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Pencil, Trash2, Search, Building, User, ChevronRight, ChevronDown, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface ContactListProps {
  onRefresh: () => void;
}

interface TreeNode {
  type: string;
  subtypes: string[];
  expanded: boolean;
}

export function ContactList({ onRefresh }: ContactListProps) {
  const { logApiCall } = useMockAuth();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [organizationalLabels, setOrganizationalLabels] = useState<OrganizationalLabel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrgLabel, setFilterOrgLabel] = useState<string>("all");
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filter tree state
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allContacts = getAllContacts();
    const allTaxonomy = getAllTaxonomy();
    const allHoofdtypes = getHoofdtypes();
    
    setContacts(allContacts);
    setTaxonomy(allTaxonomy);
    setHoofdtypes(allHoofdtypes);
    setOrganizationalLabels(getAllOrganizationalLabels());
    
    const nodes: TreeNode[] = allHoofdtypes.map(h => ({
      type: h,
      subtypes: [...new Set(allTaxonomy.filter(t => t.hoofdtype === h).map(t => t.subtype))],
      expanded: false,
    }));
    setTreeNodes(nodes);
  };

  const getOrgLabelName = (labelId?: string): string => {
    if (!labelId) return '-';
    const label = organizationalLabels.find(l => l.id === labelId);
    return label?.name || '-';
  };

  const getTaxonomyLabel = (contact: Contact): { hoofdtype: string; subtype: string } => {
    const entry = taxonomy.find(t => t.id === contact.hoofdtypeId);
    return entry ? { hoofdtype: entry.hoofdtype, subtype: entry.subtype } : { hoofdtype: '-', subtype: '-' };
  };

  const toggleTreeNode = (type: string) => {
    setTreeNodes(prev => prev.map(n => 
      n.type === type ? { ...n, expanded: !n.expanded } : n
    ));
  };

  const handleTypeSelect = (type: string) => {
    if (selectedType === type && !selectedSubtype) {
      setSelectedType(null);
    } else {
      setSelectedType(type);
      setSelectedSubtype(null);
    }
  };

  const handleSubtypeSelect = (type: string, subtype: string) => {
    if (selectedType === type && selectedSubtype === subtype) {
      setSelectedSubtype(null);
    } else {
      setSelectedType(type);
      setSelectedSubtype(subtype);
    }
  };

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedSubtype(null);
    setFilterOrgLabel("all");
    setSearchTerm("");
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    setDeleteConfirm(contact);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteContact(deleteConfirm.id);
      toast.success(t('contactList.contactDeleted'));
      logApiCall('DELETE', '/api/mock/contacts/' + deleteConfirm.id, { status: 'deleted' });
      loadData();
      setDeleteConfirm(null);
      onRefresh();
    }
  };

  const handleContactSaved = () => {
    setIsEditDialogOpen(false);
    setEditingContact(null);
    loadData();
    onRefresh();
  };

  const getTypeCount = (type: string): number => {
    return contacts.filter(c => {
      const taxLabels = getTaxonomyLabel(c);
      return taxLabels.hoofdtype === type;
    }).length;
  };

  const getSubtypeCount = (type: string, subtype: string): number => {
    return contacts.filter(c => {
      const taxLabels = getTaxonomyLabel(c);
      return taxLabels.hoofdtype === type && taxLabels.subtype === subtype;
    }).length;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.companyName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const taxLabels = getTaxonomyLabel(contact);
    const matchesTypeFilter = !selectedType || taxLabels.hoofdtype === selectedType;
    const matchesSubtypeFilter = !selectedSubtype || taxLabels.subtype === selectedSubtype;
    const matchesOrgLabel = filterOrgLabel === "all" || 
      (filterOrgLabel === "none" && !contact.organizationalLabelId) ||
      contact.organizationalLabelId === filterOrgLabel;
    
    return matchesSearch && matchesTypeFilter && matchesSubtypeFilter && matchesOrgLabel;
  });

  const hasActiveFilters = selectedType || selectedSubtype || filterOrgLabel !== "all" || searchTerm;

  return (
    <>
      <div className="flex gap-6">
        {/* Filter Tree Sidebar */}
        <Card className="w-64 shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">{t('contactList.contactTypes')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="px-3 pb-3">
                <button
                  onClick={clearFilters}
                  className={cn(
                    "w-full flex items-center justify-between py-2 px-2 rounded-md text-sm transition-colors",
                    !selectedType && !selectedSubtype 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted"
                  )}
                >
                  <span>{t('contactList.allContacts')}</span>
                  <Badge variant="secondary" className="text-xs">{contacts.length}</Badge>
                </button>
                
                {treeNodes.map((node) => (
                  <div key={node.type} className="mt-1">
                    <button
                      onClick={() => {
                        toggleTreeNode(node.type);
                        handleTypeSelect(node.type);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between py-2 px-2 rounded-md text-sm transition-colors",
                        selectedType === node.type && !selectedSubtype
                          ? "bg-secondary text-secondary-foreground font-medium"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {node.subtypes.length > 0 && (
                          node.expanded ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          )
                        )}
                        <span className={cn(node.subtypes.length === 0 && "ml-4")}>{node.type}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{getTypeCount(node.type)}</Badge>
                    </button>
                    
                    {node.expanded && node.subtypes.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {node.subtypes.map((subtype) => (
                          <button
                            key={subtype}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubtypeSelect(node.type, subtype);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors",
                              selectedType === node.type && selectedSubtype === subtype
                                ? "bg-secondary text-secondary-foreground font-medium"
                                : "hover:bg-muted text-muted-foreground"
                            )}
                          >
                            <span>{subtype}</span>
                            <Badge variant="outline" className="text-xs h-5">
                              {getSubtypeCount(node.type, subtype)}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="flex-1">
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{t('contactList.contacts')}</CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('contactList.clearFilters')}
                  </Button>
                )}
              </div>
              <CardDescription>
                {selectedType 
                  ? t('contactList.showingContacts').replace('{type}', selectedSubtype || selectedType)
                  : t('contactList.manageContacts')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('contactList.searchContacts')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterOrgLabel} onValueChange={setFilterOrgLabel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('contactList.filterByLabel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('contactList.allLabels')}</SelectItem>
                  <SelectItem value="none">{t('contactList.noLabel')}</SelectItem>
                  {organizationalLabels.map(label => (
                    <SelectItem key={label.id} value={label.id}>{label.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>{t('contactList.name')}</TableHead>
                    <TableHead>{t('contactList.type')}</TableHead>
                    <TableHead>{t('contactList.subtype')}</TableHead>
                    <TableHead>{t('contactList.label')}</TableHead>
                    <TableHead>{t('contactList.company')}</TableHead>
                    <TableHead>{t('contactList.phone')}</TableHead>
                    <TableHead>{t('contactList.email')}</TableHead>
                    <TableHead>{t('contactList.status')}</TableHead>
                    <TableHead className="w-24">{t('contactList.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map(contact => {
                    const taxLabels = getTaxonomyLabel(contact);
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contact.avatarUrl} />
                            <AvatarFallback>
                              {contact.contactType === 'company' ? (
                                <Building className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{taxLabels.hoofdtype}</Badge>
                        </TableCell>
                        <TableCell>{taxLabels.subtype}</TableCell>
                        <TableCell>
                          {contact.organizationalLabelId && (
                            <Badge variant="secondary">{getOrgLabelName(contact.organizationalLabelId)}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{contact.companyName || '-'}</TableCell>
                        <TableCell>{contact.phone || contact.gsm || '-'}</TableCell>
                        <TableCell>{contact.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={contact.status === 'Active' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(contact)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredContacts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        {contacts.length === 0 
                          ? t('contactList.noContactsYet')
                          : t('contactList.noContactsMatch')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContactFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        contact={editingContact}
        onSaved={handleContactSaved}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contactList.deleteContact')}</DialogTitle>
            <DialogDescription>
              {t('contactList.confirmDelete').replace('{name}', deleteConfirm?.name || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={confirmDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
