/**
 * Project Phases Table Component
 * Manage project phases with all settings
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllProjectPhases, createProjectPhase, updateProjectPhase, deleteProjectPhase } from "@/lib/mockProjectSettingsDB";
import { ProjectPhase, PHASE_TYPES } from "@/types/projectSettings";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function ProjectPhasesTable() {
  const { logApiCall } = useMockAuth();
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: '',
    color: '#3b82f6',
    admin: true,
    invoice: true,
    type: 'percentage' as 'percentage' | 'fixed' | 'regie' | 'na',
    value: 0,
    inServiceFee: true,
    order: 1
  });
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectPhase | null>(null);

  useEffect(() => {
    loadPhases();
  }, []);

  const loadPhases = () => {
    const loaded = getAllProjectPhases();
    setPhases(loaded.sort((a, b) => a.order - b.order));
  };

  const handleAdd = () => {
    setEditingPhase(null);
    setFormData({
      name: '',
      abbreviation: '',
      description: '',
      color: '#3b82f6',
      admin: true,
      invoice: true,
      type: 'percentage',
      value: 0,
      inServiceFee: true,
      order: phases.length + 1
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    setFormData({
      name: phase.name,
      abbreviation: phase.abbreviation,
      description: phase.description,
      color: phase.color,
      admin: phase.admin,
      invoice: phase.invoice,
      type: phase.type,
      value: phase.value,
      inServiceFee: phase.inServiceFee,
      order: phase.order
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingPhase) {
      updateProjectPhase(editingPhase.id, formData);
      toast.success("Project phase updated (mock)");
      logApiCall('PUT', '/api/mock/project-phases/' + editingPhase.id, formData);
    } else {
      createProjectPhase(formData);
      toast.success("Project phase created (mock)");
      logApiCall('POST', '/api/mock/project-phases', formData);
    }

    loadPhases();
    setIsDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProjectPhase(deleteConfirm.id);
      toast.success("Project phase deleted (mock)");
      logApiCall('DELETE', '/api/mock/project-phases/' + deleteConfirm.id, { status: 'deleted' });
      loadPhases();
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Project Phases</CardTitle>
              <CardDescription>
                Define project phases for schedules and tracking
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Abbr.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Invoice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">In Service</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phases.map(phase => (
                  <TableRow key={phase.id} className="cursor-pointer" onDoubleClick={() => handleEdit(phase)}>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full border" 
                        style={{ backgroundColor: phase.color }}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{phase.abbreviation}</TableCell>
                    <TableCell className="font-medium">{phase.name}</TableCell>
                    <TableCell className="text-center">
                      <Switch checked={phase.admin} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={phase.invoice} disabled />
                    </TableCell>
                    <TableCell>
                      {PHASE_TYPES.find(t => t.value === phase.type)?.label || phase.type}
                    </TableCell>
                    <TableCell className="text-right">
                      {phase.type === 'percentage' ? `${phase.value}%` : 
                       phase.type === 'fixed' ? `€${phase.value}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={phase.inServiceFee} disabled />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(phase)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(phase)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {phases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No project phases. Click "Seed Demo Data" to add defaults.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPhase ? 'Edit' : 'Add'} Project Phase</DialogTitle>
            <DialogDescription>
              Configure the phase settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
              <div className="space-y-2">
                <Label>Abbreviation *</Label>
                <Input
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                  placeholder="VST"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Phase Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Voorstudie"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this phase"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  disabled={formData.type === 'na' || formData.type === 'regie'}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              {[
                { key: 'admin', label: 'Admin Required' },
                { key: 'invoice', label: 'Invoiceable' },
                { key: 'inServiceFee', label: 'Include in Service Fee' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={(formData as any)[key]}
                    onCheckedChange={(v) => setFormData({ ...formData, [key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
