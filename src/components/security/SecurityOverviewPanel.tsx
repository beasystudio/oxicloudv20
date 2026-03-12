import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, Users, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getInvitations, getAuditLog, type Invitation, revokeInvitation } from '@/lib/securityAuditStore';
import { getPilotUser, getPilotEmployees } from '@/lib/pilotSessionStore';
import { InviteTeamMemberDialog } from './InviteTeamMemberDialog';
import { SecurityAuditLog } from './SecurityAuditLog';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

export function SecurityOverviewPanel() {
  const { t } = useLanguage();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const pilotUser = getPilotUser();
  const employees = getPilotEmployees();

  const loadData = () => { setInvitations(getInvitations()); };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRevoke = (id: string) => {
    if (pilotUser) {
      revokeInvitation(id, pilotUser.id, pilotUser.email);
      toast.success(t('security.invitationRevoked'));
      loadData();
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const auditEvents = getAuditLog();

  const statusConfig = {
    pending: { label: t('security.statusPending'), icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    accepted: { label: t('security.statusAccepted'), icon: CheckCircle, color: 'bg-primary/10 text-primary border-primary/20' },
    expired: { label: t('security.statusExpired'), icon: Clock, color: 'bg-muted text-muted-foreground border-border' },
    revoked: { label: t('security.statusRevoked'), icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-border/50">
          <div>
            <p className="text-xl font-semibold">{employees.length + 1}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('security.teamMembers')}</p>
          </div>
        </Card>
        <Card className="p-4 border-border/50">
          <div>
            <p className="text-xl font-semibold">{pendingInvitations.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('security.pendingInvitations')}</p>
          </div>
        </Card>
        <Card className="p-4 border-border/50">
          <div>
            <p className="text-xl font-semibold">{auditEvents.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('security.securityEvents')}</p>
          </div>
        </Card>
      </div>

      {pilotUser && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{pilotUser.firstName} {pilotUser.lastName}</p>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">OWNER</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pilotUser.email} • {t('security.fullAccess')}</p>
              </div>
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {t('security.inviteTeamMember')}
            </Button>
          </div>
        </Card>
      )}

      {invitations.length > 0 && (
        <Card className="border-border/50">
          <div className="p-5 pb-3">
            <h3 className="text-sm font-semibold mb-1">{t('security.invitations')}</h3>
            <p className="text-xs text-muted-foreground">{t('security.manageInvitations')}</p>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {invitations.map(inv => {
              const status = statusConfig[inv.status];
              const StatusIcon = status.icon;
              const expiresIn = Math.ceil((new Date(inv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">{inv.role}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {inv.status === 'pending' && expiresIn > 0 ? t('security.expiresIn').replace('{days}', String(expiresIn)) : status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {inv.status === 'pending' && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleRevoke(inv.id)}>
                      {t('security.revoke')}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <SecurityAuditLog />

      <InviteTeamMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        ownerId={pilotUser?.id || ''}
        ownerEmail={pilotUser?.email || ''}
        onInvited={loadData}
      />
    </div>
  );
}
