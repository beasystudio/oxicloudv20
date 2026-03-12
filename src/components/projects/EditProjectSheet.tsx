import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LocalProject } from '@/lib/mockLocalProjects';

interface EditProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: LocalProject | null;
  onSave: (updates: Partial<LocalProject>) => void;
}

export const EditProjectSheet = ({ open, onOpenChange, project, onSave }: EditProjectSheetProps) => {
  const [formData, setFormData] = useState({
    projectNumber: '',
    name: '',
    status: '',
    code: '',
    managerName: '',
    projectType: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        projectNumber: project.projectNumber || '',
        name: project.name || '',
        status: project.status || '',
        code: project.code || '',
        managerName: project.managerName || '',
        projectType: project.projectType || '',
        description: project.description || '',
        location: project.location || '',
      });
    }
  }, [project]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Project Details</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="projectNumber">Project Number</Label>
            <Input
              id="projectNumber"
              value={formData.projectNumber}
              onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="(selecteer)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerName">Project Manager</Label>
            <Input
              id="managerName"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Input
              id="projectType"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
