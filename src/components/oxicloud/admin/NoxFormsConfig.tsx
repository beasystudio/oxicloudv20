import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Save,
  RotateCcw,
  Settings2,
  Type,
  Hash,
  List,
  FileUp,
  ToggleLeft,
  HelpCircle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'file' | 'toggle' | 'textarea';
  required: boolean;
  visible: boolean;
  locked: boolean;
  helpText?: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  section: string;
}

interface FormSection {
  id: string;
  name: string;
  collapsed: boolean;
  fields: FormField[];
}

// Mock data for pre-estimation form
const mockPreEstimationSections: FormSection[] = [
  {
    id: 'project-info',
    name: 'Project Information',
    collapsed: false,
    fields: [
      { id: 'project-type', label: 'Project Type', type: 'select', required: true, visible: true, locked: false, section: 'project-info', options: ['Residential', 'Commercial', 'Industrial', 'Mixed-use'] },
      { id: 'construction-type', label: 'Construction Type', type: 'select', required: true, visible: true, locked: false, section: 'project-info', options: ['New Construction', 'Renovation', 'Extension'] },
      { id: 'project-description', label: 'Project Description', type: 'textarea', required: false, visible: true, locked: false, section: 'project-info', helpText: 'Brief description of the project scope' },
    ],
  },
  {
    id: 'dimensions',
    name: 'Project Dimensions',
    collapsed: false,
    fields: [
      { id: 'gross-floor-area', label: 'Gross Floor Area (m²)', type: 'number', required: true, visible: true, locked: false, section: 'dimensions', validation: { min: 0 } },
      { id: 'parking-spaces', label: 'Number of Parking Spaces', type: 'number', required: false, visible: true, locked: false, section: 'dimensions', validation: { min: 0 } },
      { id: 'expected-traffic', label: 'Expected Daily Traffic', type: 'number', required: false, visible: true, locked: false, section: 'dimensions', helpText: 'Estimated vehicle movements per day' },
    ],
  },
  {
    id: 'demolition',
    name: 'Demolition Details',
    collapsed: true,
    fields: [
      { id: 'has-demolition', label: 'Includes Demolition', type: 'toggle', required: false, visible: true, locked: false, section: 'demolition' },
      { id: 'demolition-area', label: 'Demolition Area (m²)', type: 'number', required: false, visible: true, locked: false, section: 'demolition', validation: { min: 0 } },
    ],
  },
];

const fieldTypeIcons: Record<FormField['type'], React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  select: <List className="h-4 w-4" />,
  file: <FileUp className="h-4 w-4" />,
  toggle: <ToggleLeft className="h-4 w-4" />,
  textarea: <Type className="h-4 w-4" />,
};

export function NoxFormsConfig() {
  const [activeForm, setActiveForm] = useState<'pre-estimation' | 'detailed'>('pre-estimation');
  const [sections, setSections] = useState<FormSection[]>(mockPreEstimationSections);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleSectionCollapse = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
    ));
  };

  const toggleFieldVisibility = (fieldId: string) => {
    setSections(sections.map(section => ({
      ...section,
      fields: section.fields.map(field =>
        field.id === fieldId ? { ...field, visible: !field.visible } : field
      ),
    })));
    setHasChanges(true);
  };

  const toggleFieldRequired = (fieldId: string) => {
    setSections(sections.map(section => ({
      ...section,
      fields: section.fields.map(field =>
        field.id === fieldId ? { ...field, required: !field.required } : field
      ),
    })));
    setHasChanges(true);
  };

  const toggleFieldLocked = (fieldId: string) => {
    setSections(sections.map(section => ({
      ...section,
      fields: section.fields.map(field =>
        field.id === fieldId ? { ...field, locked: !field.locked } : field
      ),
    })));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Form Type Tabs with inline actions */}
      <Tabs value={activeForm} onValueChange={(v) => setActiveForm(v as 'pre-estimation' | 'detailed')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pre-estimation">Pre-Estimation Form</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Calculation Form</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Version 2.1
            </Badge>
            {hasChanges && (
              <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600">
                Unsaved
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            <Button variant="outline" size="sm" disabled={!hasChanges}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Revert
            </Button>
            <Button size="sm" disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>

        <TabsContent value="pre-estimation" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Builder */}
            <div className="lg:col-span-2 space-y-4">
              {sections.map((section) => (
                <Card key={section.id} className="border-border/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <CardTitle className="text-base">{section.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {section.fields.filter(f => f.visible).length} fields
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => toggleSectionCollapse(section.id)}
                        >
                          {section.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {!section.collapsed && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {section.fields.map((field) => (
                          <div
                            key={field.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedField?.id === field.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border/50 hover:border-border'
                            } ${!field.visible ? 'opacity-50' : ''}`}
                            onClick={() => setSelectedField(field)}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div className="p-1.5 rounded bg-muted">
                              {fieldTypeIcons[field.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{field.label}</span>
                                {field.required && (
                                  <span className="text-destructive text-xs">*</span>
                                )}
                                {field.locked && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              {field.helpText && (
                                <p className="text-xs text-muted-foreground truncate">{field.helpText}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFieldVisibility(field.id);
                                }}
                              >
                                <Eye className={`h-3.5 w-3.5 ${!field.visible ? 'text-muted-foreground' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFieldLocked(field.id);
                                }}
                              >
                                {field.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}

              {/* Add Section */}
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Field Properties */}
              <Card className="border-border/50 sticky top-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Field Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedField ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input value={selectedField.label} onChange={() => setHasChanges(true)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select value={selectedField.type}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="file">File Upload</SelectItem>
                            <SelectItem value="toggle">Toggle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Help Text</Label>
                        <Input 
                          value={selectedField.helpText || ''} 
                          placeholder="Optional help text..."
                          onChange={() => setHasChanges(true)}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            Required
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </Label>
                          <Switch 
                            checked={selectedField.required}
                            onCheckedChange={() => toggleFieldRequired(selectedField.id)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Visible</Label>
                          <Switch 
                            checked={selectedField.visible}
                            onCheckedChange={() => toggleFieldVisibility(selectedField.id)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            Expert Only
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </Label>
                          <Switch 
                            checked={selectedField.locked}
                            onCheckedChange={() => toggleFieldLocked(selectedField.id)}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Select a field to edit its properties
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Add Field */}
              <Card className="border-border/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Add Field
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(fieldTypeIcons).map(([type, icon]) => (
                      <Button key={type} variant="outline" size="sm" className="justify-start">
                        {icon}
                        <span className="ml-2 capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-balance">Detailed Calculation Form configuration follows the same pattern.</p>
            <p className="text-sm text-muted-foreground mt-2 text-balance">Switch to Pre-Estimation Form to see the builder in action.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
