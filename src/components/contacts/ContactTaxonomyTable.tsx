/**
 * Contact Taxonomy Table Component
 * Inline-editable taxonomy for Hoofdtype/Subtype with clean minimal UI
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAllTaxonomy, getHoofdtypes, addTaxonomyEntry, updateTaxonomyEntry, deleteTaxonomyEntry, getPilotTaxonomy, getPilotHoofdtypes, addPilotTaxonomyEntry, updatePilotTaxonomyEntry, deletePilotTaxonomyEntry } from "@/lib/mockContactDB";
import { ContactType } from "@/types/contact";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Search, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isPilotAccount, isPilotCompany } from "@/lib/pilotAccountUtils";
import { useLanguage } from "@/i18n/LanguageContext";

interface ContactTaxonomyTableProps {
  triggerAdd?: number;
}

export function ContactTaxonomyTable({ triggerAdd }: ContactTaxonomyTableProps) {
  const { logApiCall, currentUser, selectedCompanyId } = useMockAuth();
  const { t } = useLanguage();
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editField, setEditField] = useState<"hoofdtype" | "subtype">("subtype");
  const [deleteConfirm, setDeleteConfirm] = useState<ContactType | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ hoofdtype: "", subtype: "", isNewHoofdtype: false, newHoofdtype: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  const isPilot = isPilotAccount(currentUser?.email) || isPilotCompany(selectedCompanyId);

  useEffect(() => {loadData();}, [isPilot]);

  useEffect(() => {
    if (triggerAdd && triggerAdd > 0) {
      setAddForm({ hoofdtype: "", subtype: "", isNewHoofdtype: false, newHoofdtype: "" });
      setIsAddOpen(true);
    }
  }, [triggerAdd]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const loadData = () => {
    if (isPilot) {
      setTaxonomy(getPilotTaxonomy());
      setHoofdtypes(getPilotHoofdtypes());
    } else {
      setTaxonomy(getAllTaxonomy());
      setHoofdtypes(getHoofdtypes());
    }
  };

  const startEdit = (entry: ContactType, field: "hoofdtype" | "subtype") => {
    setEditingId(entry.id);
    setEditField(field);
    setEditValue(field === "hoofdtype" ? entry.hoofdtype : entry.subtype);
  };

  const cancelEdit = () => {setEditingId(null);setEditValue("");};

  const saveEdit = () => {
    if (!editingId || !editValue.trim()) {cancelEdit();return;}
    const entry = taxonomy.find((t) => t.id === editingId);
    if (!entry) {cancelEdit();return;}

    const newHoofdtype = editField === "hoofdtype" ? editValue.trim() : entry.hoofdtype;
    const newSubtype = editField === "subtype" ? editValue.trim() : entry.subtype;

    if (editField === "hoofdtype" && newHoofdtype !== entry.hoofdtype) {
      const entriesToUpdate = taxonomy.filter((t) => t.hoofdtype === entry.hoofdtype);
      try {
        for (const e of entriesToUpdate) {
          if (isPilot) {
            updatePilotTaxonomyEntry(e.id, newHoofdtype, e.subtype);
          } else {
            updateTaxonomyEntry(e.id, newHoofdtype, e.subtype);
          }
        }
        toast.success(t('contactTaxonomy.hoofdtypeRenamed').replace('{name}', newHoofdtype));
        logApiCall("PUT", "/api/mock/taxonomy/batch-rename", { oldHoofdtype: entry.hoofdtype, newHoofdtype });
      } catch (error: any) {
        toast.error(error.message || t('contactTaxonomy.renameError'));
      }
    } else if (editField === "subtype" && newSubtype !== entry.subtype) {
      try {
        if (isPilot) {
          updatePilotTaxonomyEntry(entry.id, newHoofdtype, newSubtype);
        } else {
          updateTaxonomyEntry(entry.id, newHoofdtype, newSubtype);
        }
        toast.success(t('contactTaxonomy.subtypeRenamed').replace('{name}', newSubtype));
        logApiCall("PUT", "/api/mock/taxonomy/" + entry.id, { hoofdtype: newHoofdtype, subtype: newSubtype });
      } catch (error: any) {
        toast.error(error.message || t('contactTaxonomy.renameError'));
      }
    }

    loadData();
    cancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {e.preventDefault();saveEdit();}
    if (e.key === "Escape") {e.preventDefault();cancelEdit();}
  };

  const handleDelete = (entry: ContactType) => {
    const siblings = taxonomy.filter(t => t.hoofdtype === entry.hoofdtype);
    if (entry.is_locked && siblings.length <= 1) {
      toast.info(t('contactTaxonomy.lastSubtypeLocked'));
      return;
    }
    setDeleteConfirm(entry);
  };

  const confirmDeleteFn = () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.is_locked) {
        const tax = isPilot ? getPilotTaxonomy() : getAllTaxonomy();
        const filtered = tax.filter(t => t.id !== deleteConfirm.id);
        const key = isPilot ? 'oxicloud_pilot_taxonomy' : 'oxicloud_contact_taxonomy';
        localStorage.setItem(key, JSON.stringify(filtered));
      } else {
        if (isPilot) {deletePilotTaxonomyEntry(deleteConfirm.id);} else
        {deleteTaxonomyEntry(deleteConfirm.id);}
      }
      toast.success(t('contactTaxonomy.subtypeDeleted'));
      logApiCall("DELETE", "/api/mock/taxonomy/" + deleteConfirm.id, { status: "deleted" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('contactTaxonomy.cannotDelete'));
    }
    setDeleteConfirm(null);
  };

  const handleAddSave = () => {
    const finalHoofdtype = addForm.isNewHoofdtype ? addForm.newHoofdtype : addForm.hoofdtype;
    if (!finalHoofdtype || !addForm.subtype) {toast.error(t('contactTaxonomy.fillAllFields'));return;}
    try {
      if (isPilot) {addPilotTaxonomyEntry(finalHoofdtype, addForm.subtype);} else
      {addTaxonomyEntry(finalHoofdtype, addForm.subtype);}
      toast.success(t('contactTaxonomy.typeAdded'));
      logApiCall("POST", "/api/mock/taxonomy", { hoofdtype: finalHoofdtype, subtype: addForm.subtype });
      loadData();
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error(error.message || t('contactTaxonomy.saveError'));
    }
  };

  // Group by hoofdtype
  const filtered = taxonomy.filter((e) =>
  e.hoofdtype.toLowerCase().includes(searchQuery.toLowerCase()) ||
  e.subtype.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const grouped = filtered.reduce((acc, e) => {
    if (!acc[e.hoofdtype]) acc[e.hoofdtype] = [];
    acc[e.hoofdtype].push(e);
    return acc;
  }, {} as Record<string, ContactType[]>);

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('contactTaxonomy.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs" />
        </div>

        {/* Taxonomy groups */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([hoofdtype, entries]) => {
            const isLocked = entries[0]?.is_locked;
            const isEditingHoofdtype = editingId === entries[0]?.id && editField === "hoofdtype";

            return (
              <div key={hoofdtype} className="border rounded-lg overflow-hidden">
                {/* Hoofdtype header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
                  {isEditingHoofdtype ?
                  <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <Input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      className="h-7 text-sm font-semibold max-w-[200px]" />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEdit}>
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div> :
                  <div className="flex items-center gap-2 group/header">
                      <span className="text-sm font-semibold">{hoofdtype}</span>
                      {isLocked &&
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-muted-foreground/30">
                          {t('contactTaxonomy.required')}
                        </Badge>
                    }
                      <button
                      onClick={() => startEdit(entries[0], "hoofdtype")}
                      className="opacity-0 group-hover/header:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent"
                      title={t('contactTaxonomy.renameHoofdtype')}>
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  }
                  <span className="text-[10px] text-muted-foreground">{entries.length} {t('contactTaxonomy.subtypes')}</span>
                </div>

                {/* Subtypes list */}
                <div className="divide-y divide-border/50">
                  {entries.map((entry) => {
                    const isEditingThis = editingId === entry.id && editField === "subtype";

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-4 py-2 group/row transition-colors bg-popover">
                        {isEditingThis ?
                        <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            className="h-7 text-sm max-w-[200px]" />
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEdit}>
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div> :
                        <span
                          className="text-sm cursor-pointer"
                          onDoubleClick={() => startEdit(entry, "subtype")}>
                            {entry.subtype}
                          </span>
                        }

                        {!isEditingThis &&
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                            onClick={() => startEdit(entry, "subtype")}
                            className="p-1 rounded hover:bg-accent"
                            title={t('contactTaxonomy.rename')}>
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <button
                            onClick={() => handleDelete(entry)}
                            className="p-1 rounded hover:bg-destructive/10"
                            title={entry.is_locked ? t('contactTaxonomy.deleteSubtype') : t('contactTaxonomy.deleteLabel')}>
                                <Trash2 className="h-3 w-3 text-destructive/70" />
                              </button>
                          </div>
                        }
                      </div>);
                  })}
                </div>
              </div>);
          })}

          {filtered.length === 0 &&
          <div className="text-center text-muted-foreground py-12 text-sm">
              {taxonomy.length === 0 ? t('contactTaxonomy.noTypesConfigured') : t('contactTaxonomy.noTypesFound')}
            </div>
          }
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contactTaxonomy.addTypeTitle')}</DialogTitle>
            <DialogDescription>{t('contactTaxonomy.addTypeDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('contactTaxonomy.mainType')}</Label>
              {addForm.isNewHoofdtype ?
              <Input
                value={addForm.newHoofdtype}
                onChange={(e) => setAddForm({ ...addForm, newHoofdtype: e.target.value })}
                placeholder={t('contactTaxonomy.newMainType')} /> :
              <Select value={addForm.hoofdtype} onValueChange={(v) => setAddForm({ ...addForm, hoofdtype: v })}>
                  <SelectTrigger><SelectValue placeholder={t('contactTaxonomy.selectMainType')} /></SelectTrigger>
                  <SelectContent>
                    {hoofdtypes.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              }
              <Button
                type="button" variant="link" size="sm" className="px-0 h-auto text-xs"
                onClick={() => setAddForm({ ...addForm, isNewHoofdtype: !addForm.isNewHoofdtype })}>
                {addForm.isNewHoofdtype ? t('contactTaxonomy.selectExisting') : t('contactTaxonomy.newMainTypeButton')}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>{t('contactTaxonomy.subtype')}</Label>
              <Input
                value={addForm.subtype}
                onChange={(e) => setAddForm({ ...addForm, subtype: e.target.value })}
                placeholder={t('contactTaxonomy.subtypePlaceholder')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t('contactTaxonomy.cancel')}</Button>
            <Button onClick={handleAddSave}>{t('contactTaxonomy.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contactTaxonomy.deleteTypeTitle')}</DialogTitle>
            <DialogDescription>
              {t('contactTaxonomy.deleteTypeConfirm').replace('{hoofdtype}', deleteConfirm?.hoofdtype || '').replace('{subtype}', deleteConfirm?.subtype || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('contactTaxonomy.cancel')}</Button>
            <Button variant="destructive" onClick={confirmDeleteFn}>{t('contactTaxonomy.deleteLabel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
