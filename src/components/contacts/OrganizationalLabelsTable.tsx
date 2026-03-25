/**
 * Organizational Labels Table
 * Manages organizational/administrative contact groupings
 * System labels (Employee, Clients) are fixed at top
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAllOrganizationalLabels, addOrganizationalLabel, updateOrganizationalLabel, deleteOrganizationalLabel, reorderOrganizationalLabels, OrganizationalLabel } from "@/lib/mockContactDB";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus, GripVertical, Lock } from "lucide-react";
export function OrganizationalLabelsTable() {
  const {
    logApiCall
  } = useMockAuth();
  const [labels, setLabels] = useState<OrganizationalLabel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<OrganizationalLabel | null>(null);
  const [formName, setFormName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<OrganizationalLabel | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    setLabels(getAllOrganizationalLabels());
  };
  const handleAdd = () => {
    setEditingLabel(null);
    setFormName("");
    setIsDialogOpen(true);
  };
  const handleEdit = (label: OrganizationalLabel) => {
    if (label.isSystem) return;
    setEditingLabel(label);
    setFormName(label.name);
    setIsDialogOpen(true);
  };
  const handleSave = () => {
    if (!formName.trim()) {
      toast.error("Label name is required");
      return;
    }
    try {
      if (editingLabel) {
        updateOrganizationalLabel(editingLabel.id, formName.trim());
        toast.success("Label updated");
        logApiCall('PUT', '/api/mock/organizational-labels/' + editingLabel.id, {
          name: formName
        });
      } else {
        addOrganizationalLabel(formName.trim());
        toast.success("Label added");
        logApiCall('POST', '/api/mock/organizational-labels', {
          name: formName
        });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleDelete = (label: OrganizationalLabel) => {
    if (label.isSystem) return;
    setDeleteConfirm(label);
  };
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteOrganizationalLabel(deleteConfirm.id);
      toast.success("Label deleted");
      logApiCall('DELETE', '/api/mock/organizational-labels/' + deleteConfirm.id, {
        status: 'deleted'
      });
      loadData();
      setDeleteConfirm(null);
    }
  };

  // Drag and drop handling
  const handleDragStart = (index: number) => {
    if (labels[index].isSystem) return;
    setDraggedIndex(index);
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const systemCount = labels.filter(l => l.isSystem).length;
    if (index < systemCount) return;
  };
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null) return;
    const systemCount = labels.filter(l => l.isSystem).length;
    if (targetIndex < systemCount) return;
    const newLabels = [...labels];
    const [draggedItem] = newLabels.splice(draggedIndex, 1);
    newLabels.splice(targetIndex, 0, draggedItem);
    const reorderedLabels = newLabels.map((label, idx) => ({
      ...label,
      order: idx + 1
    }));
    reorderOrganizationalLabels(reorderedLabels);
    setLabels(reorderedLabels);
    setDraggedIndex(null);
    logApiCall('PUT', '/api/mock/organizational-labels/reorder', {
      labels: reorderedLabels.map(l => l.id)
    });
  };
  const systemLabels = labels.filter(l => l.isSystem);
  const customLabels = labels.filter(l => !l.isSystem);
  return <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 text-xs w-10"></TableHead>
                <TableHead className="h-9 text-xs">Label Name</TableHead>
                <TableHead className="h-9 text-xs">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* System labels - always at top, not draggable */}
              {systemLabels.map(label => <TableRow key={label.id} className="bg-muted/30">
                  <TableCell className="py-2.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="py-2.5 text-sm font-medium">{label.name}</TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-xs text-muted-foreground">System</span>
                  </TableCell>
                </TableRow>)}
              
              {/* Custom labels - draggable */}
              {customLabels.map((label, index) => {
              const actualIndex = systemLabels.length + index;
              return <TableRow 
                    key={label.id} 
                    draggable 
                    onDragStart={() => handleDragStart(actualIndex)} 
                    onDragOver={e => handleDragOver(e, actualIndex)} 
                    onDrop={() => handleDrop(actualIndex)} 
                    className={`cursor-pointer transition-all duration-200 hover:backdrop-blur-md hover:shadow-lg hover:shadow-foreground/5 hover:scale-[1.02] hover:z-10 ${draggedIndex === actualIndex ? "opacity-50" : ""}`}
                    onDoubleClick={() => handleEdit(label)}
                    title="Double-click to edit, drag to reorder"
                  >
                    <TableCell className="py-2.5">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell className="py-2.5 text-sm font-medium">{label.name}</TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-xs text-muted-foreground">Custom</span>
                    </TableCell>
                  </TableRow>;
            })}
              
              {labels.length === 0 && <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6 text-sm">
                    No organizational labels configured
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">Double-click a row to edit, drag to reorder</p>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLabel ? 'Edit Label' : 'Add Label'}</DialogTitle>
            <DialogDescription>
              {editingLabel ? 'Update the label name.' : 'Create a new organizational label.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Suppliers, Legal" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingLabel ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Label</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
              This will not delete contacts assigned to this label.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}