import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Save,
  RotateCcw,
  Type,
  Heading1,
  Table,
  BarChart3,
  FileText,
  AlertTriangle,
  User,
  Calculator,
  Image,
  Layers,
  Palette,
  Clock,
  GitBranch,
  Check,
  Copy,
  Download } from
'lucide-react';

interface TemplateBlock {
  id: string;
  type: 'heading' | 'text' | 'table' | 'chart' | 'token' | 'disclaimer' | 'summary' | 'image' | 'spacer';
  content: string;
  settings?: Record<string, any>;
}

interface TemplateVersion {
  id: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  createdBy: string;
  changes: string;
}

// Dynamic tokens available for insertion
const dynamicTokens = [
{ id: 'project_name', label: 'Project Name', category: 'project' },
{ id: 'project_address', label: 'Project Address', category: 'project' },
{ id: 'client_name', label: 'Client Name', category: 'client' },
{ id: 'client_company', label: 'Client Company', category: 'client' },
{ id: 'nox_total', label: 'Total NOx Emissions', category: 'calculation' },
{ id: 'nox_stationary', label: 'Stationary Emissions', category: 'calculation' },
{ id: 'nox_transport', label: 'Transport Emissions', category: 'calculation' },
{ id: 'compliance_status', label: 'Compliance Status', category: 'calculation' },
{ id: 'percent_of_max', label: '% of Maximum', category: 'calculation' },
{ id: 'calculation_date', label: 'Calculation Date', category: 'meta' },
{ id: 'report_id', label: 'Report ID', category: 'meta' },
{ id: 'algorithm_version', label: 'Algorithm Version', category: 'meta' }];


// Mock template blocks
const mockTemplateBlocks: TemplateBlock[] = [
{ id: '1', type: 'heading', content: 'NOx Emission Assessment Report' },
{ id: '2', type: 'text', content: 'This report presents the NOx emission assessment for {{project_name}} located at {{project_address}}.' },
{ id: '3', type: 'summary', content: 'Executive Summary' },
{ id: '4', type: 'table', content: 'Emission Results Table' },
{ id: '5', type: 'chart', content: 'Emission Breakdown Chart' },
{ id: '6', type: 'token', content: '{{compliance_status}}' },
{ id: '7', type: 'disclaimer', content: 'This assessment is based on VITO guidelines and current regulatory requirements.' }];


// Mock versions
const mockVersions: TemplateVersion[] = [
{ id: '1', version: '1.8', status: 'published', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), createdBy: 'Christine', changes: 'Added new summary section' },
{ id: '2', version: '1.7', status: 'archived', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'Paul', changes: 'Updated disclaimer text' },
{ id: '3', version: '1.6', status: 'archived', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'Christine', changes: 'Initial release' }];


const layoutThemes = [
{ id: 'standard', name: 'Standard', description: 'Clean professional layout' },
{ id: 'compact', name: 'Compact', description: 'Space-efficient design' },
{ id: 'technical', name: 'Technical', description: 'Detailed technical format' },
{ id: 'extended', name: 'Extended Summary', description: 'Emphasis on key findings' }];


const blockTypeIcons: Record<TemplateBlock['type'], React.ReactNode> = {
  heading: <Heading1 className="h-4 w-4" />,
  text: <Type className="h-4 w-4" />,
  table: <Table className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
  token: <Calculator className="h-4 w-4" />,
  disclaimer: <AlertTriangle className="h-4 w-4" />,
  summary: <FileText className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  spacer: <Layers className="h-4 w-4" />
};

export function NoxPdfTemplateBuilder() {
  const [blocks, setBlocks] = useState<TemplateBlock[]>(mockTemplateBlocks);
  const [selectedBlock, setSelectedBlock] = useState<TemplateBlock | null>(null);
  const [activeTheme, setActiveTheme] = useState('standard');
  const [activeTab, setActiveTab] = useState<'builder' | 'versions'>('builder');
  const [hasChanges, setHasChanges] = useState(false);

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
    setHasChanges(true);
  };

  const handleAddBlock = (type: TemplateBlock['type']) => {
    const newBlock: TemplateBlock = {
      id: Date.now().toString(),
      type,
      content: `New ${type} block`
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock);
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'builder' | 'versions')}>
            <TabsList>
              <TabsTrigger value="builder">Template Builder</TabsTrigger>
              <TabsTrigger value="versions">Version History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            v1.8 Published
          </Badge>
          {hasChanges && (
            <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500">
              Unsaved
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Preview PDF
          </Button>
          <Button variant="outline" size="sm" disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Revert
          </Button>
          <Button size="sm" disabled={!hasChanges} className="bg-primary">
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Canvas - Main Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Template Canvas</CardTitle>
                  <Select value={activeTheme} onValueChange={setActiveTheme}>
                  <SelectTrigger className="w-44 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-2 pr-4">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`group relative flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                          selectedBlock?.id === block.id
                            ? 'bg-primary/5 border border-primary'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                        onClick={() => setSelectedBlock(block)}
                      >
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </div>
                        <div className="p-2 rounded bg-background border shrink-0">
                          {blockTypeIcons[block.type]}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {block.type}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{block.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Block Properties */}
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide">
                  Block Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedBlock ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Block Type
                      </Label>
                      <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted">
                        {blockTypeIcons[selectedBlock.type]}
                        <span className="text-sm font-medium capitalize">{selectedBlock.type}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Content
                      </Label>
                      <Input
                        value={selectedBlock.content}
                        onChange={(e) => {
                          setBlocks(
                            blocks.map((b) =>
                              b.id === selectedBlock.id ? { ...b, content: e.target.value } : b
                            )
                          );
                          setSelectedBlock({ ...selectedBlock, content: e.target.value });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteBlock(selectedBlock.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Select a block to edit</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Tokens */}
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide">
                  Dynamic Tokens
                </CardTitle>
                <CardDescription className="text-xs">Click to copy token</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-64">
                  <div className="space-y-4 pr-4">
                    {['project', 'client', 'calculation', 'meta'].map((category) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          {category}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {dynamicTokens
                            .filter((t) => t.category === category)
                            .map((token) => (
                              <Badge
                                key={token.id}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-2 py-1"
                                onClick={() => {
                                  navigator.clipboard.writeText(`{{${token.id}}}`);
                                }}
                              >
                                {token.label}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Add Block */}
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide">
                  Add Block
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(blockTypeIcons).map(([type, icon]) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="h-auto py-3 flex flex-col gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                      onClick={() => handleAddBlock(type as TemplateBlock['type'])}
                    >
                      {icon}
                      <span className="text-[10px] font-medium capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Version History</CardTitle>
                <CardDescription>Track and manage template versions</CardDescription>
              </div>
              <Button size="sm">
                <GitBranch className="h-4 w-4 mr-1" />
                Create New Version
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {mockVersions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Version {version.version}</span>
                      <Badge
                        variant="outline"
                        className={
                          version.status === 'published'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : version.status === 'draft'
                              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                              : 'bg-muted text-muted-foreground'
                        }
                      >
                        {version.status === 'published' && <Check className="h-3 w-3 mr-1" />}
                        {version.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{version.changes}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.createdBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                    {version.status !== 'published' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

}