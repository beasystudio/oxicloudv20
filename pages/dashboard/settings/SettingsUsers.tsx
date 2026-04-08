import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { UserList } from "@/components/users/UserList";
import { FormerEmployeesList } from "@/components/users/FormerEmployeesList";
import { UserFormDialogRedesigned } from "@/components/users/UserFormDialogRedesigned";
import { getAllActiveUsers, getAllFormerEmployees, getUsersByCompany } from "@/lib/mockUserDB";
import { FullUser } from "@/types/user";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { isPilotAccount } from "@/lib/pilotAccountUtils";
import { useLanguage } from "@/i18n/LanguageContext";

export function SettingsUsers() {
  const { currentUser, logApiCall, selectedCompanyId } = useMockAuth();
  const { t } = useLanguage();
  const [activeUsers, setActiveUsers] = useState<FullUser[]>([]);
  const [formerEmployees, setFormerEmployees] = useState<FullUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FullUser | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'active' | 'former'>('active');
  const isPilot = isPilotAccount(currentUser?.email);

  const loadUsers = () => {
    if (isPilot) {
      setActiveUsers([]);
      setFormerEmployees([]);
      return;
    }
    const isClientRole = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin' || currentUser?.role === 'client_user';
    if (isClientRole && selectedCompanyId) {
      const companyUsers = getUsersByCompany(selectedCompanyId);
      setActiveUsers(companyUsers.filter(u => !u.isFormerEmployee));
      setFormerEmployees(companyUsers.filter(u => u.isFormerEmployee));
    } else {
      setActiveUsers(getAllActiveUsers());
      setFormerEmployees(getAllFormerEmployees());
    }
  };

  useEffect(() => { loadUsers(); }, [selectedCompanyId, currentUser?.role, isPilot]);

  const handleAddUser = () => { setEditingUser(undefined); setIsDialogOpen(true); };
  const handleEditUser = (user: FullUser) => { setEditingUser(user); setIsDialogOpen(true); };
  const handleUserSaved = () => {
    loadUsers();
    setIsDialogOpen(false);
    setEditingUser(undefined);
    logApiCall('POST', '/api/mock/save-user', { userId: editingUser?.id || 'new' });
  };
  const handleUserDeleted = () => {
    loadUsers();
    logApiCall('DELETE', '/api/mock/delete-user', { userId: editingUser?.id });
  };

  return <>
      <Card className="rounded-xl border border-border/50 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">{t('settingsUsers.employees')}</h3>
              <p className="text-xs text-muted-foreground">{t('settingsUsers.employeesDesc')}</p>
            </div>
            <Button onClick={handleAddUser} size="sm" className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t('settingsUsers.addEmployee')}
            </Button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('active')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'active' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
              {t('settingsUsers.active')} ({activeUsers.length})
            </button>
            <button onClick={() => setActiveTab('former')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'former' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
              {t('settingsUsers.former')} ({formerEmployees.length})
            </button>
          </div>

          {activeTab === 'active' && <>
              {activeUsers.length === 0 ? <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm font-medium mb-1">{t('settingsUsers.noTeamMembers')}</p>
                  <p className="text-xs">{t('settingsUsers.clickToAdd')}</p>
                </div> : <UserList users={activeUsers} onEdit={handleEditUser} onDelete={handleUserDeleted} />}
            </>}
          {activeTab === 'former' && <FormerEmployeesList users={formerEmployees} />}
        </div>
      </Card>

      <UserFormDialogRedesigned open={isDialogOpen} onOpenChange={setIsDialogOpen} user={editingUser} onSaved={handleUserSaved} />
    </>;
}
