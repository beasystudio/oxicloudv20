/**
 * Project Types Table Component
 * Manage project types with toggle options
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAllProjectTypes, createProjectType, updateProjectType, deleteProjectType } from "@/lib/mockProjectSettingsDB";
import { ProjectType } from "@/types/projectSettings";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function ProjectTypesTable() {
  const { logApiCall } = useMockAuth();
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProjectType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeCost: true,
    overhead: true,
    profitMargin: true,
    management: true,
    companyOverhead: true
  });
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectType | null>(null);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = () => {
    setTypes(getAllProjectTypes());
  };

  const handleAdd = () => {
    setEditingType(null);
    setFormData({
      name: '',
      employeeCost: true,
      overhead: true,
      profitMargin: true,
      management: true,
      companyOverhead: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (type: ProjectType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      employeeCost: type.employeeCost,
      overhead: type.overhead,
      profitMargin: type.profitMargin,
      management: type.management,
      companyOverhead: type.companyOverhead
    });
    setIsDialogOpen(true);
  };

  const handleToggle = (type: ProjectType, field: keyof ProjectType, value: boolean) => {
    updateProjectType(type.id, { [field]: value });
    loadTypes();
    logApiCall('PATCH', '/api/mock/project-types/' + type.id, { [field]: value });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a type name");
      return;
    }

    if (editingType) {
      updateProjectType(editingType.id, formData);
      toast.success("Project type updated (mock)");
      logApiCall('PUT', '/api/mock/project-types/' + editingType.id, formData);
    } else {
      createProjectType(formData);
      toast.success("Project type created (mock)");
      logApiCall('POST', '/api/mock/project-types', formData);
    }

    loadTypes();
    setIsDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProjectType(deleteConfirm.id);
      toast.success("Project type deleted (mock)");
      logApiCall('DELETE', '/api/mock/project-types/' + deleteConfirm.id, { status: 'deleted' });
      loadTypes();
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Project Types</CardTitle>
              <CardDescription>
                Define project types and their cost calculation settings
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Employee Cost</TableHead>
                  <TableHead className="text-center">Overhead</TableHead>
                  <TableHead className="text-center">Profit/Margin</TableHead>
                  <TableHead className="text-center">Management</TableHead>
                  <TableHead className="text-center">Company OH</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map(type => (
                  <TableRow key={type.id} className="cursor-pointer" onDoubleClick={() => handleEdit(type)}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={type.employeeCost} 
                        onCheckedChange={(v) => handleToggle(type, 'employeeCost', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={type.overhead} 
                        onCheckedChange={(v) => handleToggle(type, 'overhead', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={type.profitMargin} 
                        onCheckedChange={(v) => handleToggle(type, 'profitMargin', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={type.management} 
                        onCheckedChange={(v) => handleToggle(type, 'management', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={type.companyOverhead} 
                        onCheckedChange={(v) => handleToggle(type, 'companyOverhead', v)} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(type)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {types.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No project types. Click "Seed Demo Data" to add defaults.
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit' : 'Add'} Project Type</DialogTitle>
            <DialogDescription>
              Configure the project type and its settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Residential"
              />
            </div>
            <div className="space-y-3">
              <Label>Cost Settings</Label>
              {[
                { key: 'employeeCost', label: 'Employee Cost' },
                { key: 'overhead', label: 'Overhead' },
                { key: 'profitMargin', label: 'Profit/Margin' },
                { key: 'management', label: 'Management' },
                { key: 'companyOverhead', label: 'Company Overhead' }
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
            <DialogTitle>Delete Project Type</DialogTitle>
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
