/**
 * Global Add Menu Component
 * Dropdown menu for adding Company, Person, or Project from main navigation
 */

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Plus, Building2, User, FolderPlus } from "lucide-react";
import { getSettingsStatus, getMissingSettings } from "@/lib/settingsValidator";
import { CreateClientCompanyDialog } from "./contacts/CreateClientCompanyDialog";
import { AddPersonDialog } from "./contacts/AddPersonDialog";
import { CreateNewProjectDialog } from "./projects/CreateNewProjectDialog";
import { type LocalProject } from "@/lib/mockLocalProjects";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface GlobalAddMenuProps {
  companyId: string;
}

export function GlobalAddMenu({ companyId }: GlobalAddMenuProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [settingsComplete, setSettingsComplete] = useState(false);
  const [missingSettings, setMissingSettings] = useState<string[]>([]);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  useEffect(() => {
    const checkSettings = () => {
      const status = getSettingsStatus();
      setSettingsComplete(status.allComplete);
      setMissingSettings(getMissingSettings());
    };
    checkSettings();
    window.addEventListener('storage', checkSettings);
    return () => window.removeEventListener('storage', checkSettings);
  }, []);

  const handleContactSaved = () => {
    toast({
      title: t('forms.globalAdd.contactCreated'),
      description: t('forms.globalAdd.goToContacts')
    });
  };

  const handleProjectCreated = (project: LocalProject) => {
    setCreateProjectOpen(false);
    toast({
      title: t('forms.globalAdd.projectCreated'),
      description: `${t('forms.globalAdd.goToProjects')} — ${project.name}`
    });
  };

  const openDialog = (setter: (v: boolean) => void) => {
    setDropdownOpen(false);
    requestAnimationFrame(() => {
      setter(true);
    });
  };

  if (!settingsComplete) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" disabled className="h-8 w-8 opacity-50 rounded-full bg-foreground text-[hsl(var(--neon-lime))]">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px]">
          <p className="font-medium">Complete settings first:</p>
          <ul className="text-xs mt-1">
            {missingSettings.map(s => <li key={s}>• {s}</li>)}
          </ul>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-foreground text-[hsl(var(--neon-lime))] hover:bg-muted/60 hover:text-foreground transition-all duration-200">
            <Plus className="h-3.5 w-3.5 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => openDialog(setAddCompanyOpen)}>
            {t('forms.globalAdd.addCompany')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openDialog(setAddPersonOpen)}>
            {t('forms.globalAdd.addPerson')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openDialog(setCreateProjectOpen)}>
            {t('forms.globalAdd.addProject')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {addCompanyOpen && (
        <CreateClientCompanyDialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen} onSaved={handleContactSaved} />
      )}
      {addPersonOpen && (
        <AddPersonDialog open={addPersonOpen} onOpenChange={setAddPersonOpen} onSaved={handleContactSaved} />
      )}
      {createProjectOpen && (
        <CreateNewProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} onProjectCreated={handleProjectCreated} companyId={companyId} />
      )}
    </>
  );
}
