import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Clock, UserPlus, UserMinus, Lock, Eye, Shield } from 'lucide-react';
import { getAuditLog, type AuditEvent, type AuditEventType } from '@/lib/securityAuditStore';
import { useLanguage } from '@/i18n/LanguageContext';

const eventIcons: Record<AuditEventType, { icon: any; color: string }> = {
  account_created: { icon: UserPlus, color: 'text-primary' },
  login_success: { icon: CheckCircle, color: 'text-primary' },
  login_failed: { icon: AlertTriangle, color: 'text-destructive' },
  password_changed: { icon: Lock, color: 'text-amber-500' },
  role_assigned: { icon: Shield, color: 'text-primary' },
  role_changed: { icon: Shield, color: 'text-amber-500' },
  invitation_created: { icon: UserPlus, color: 'text-blue-500' },
  invitation_accepted: { icon: CheckCircle, color: 'text-primary' },
  invitation_expired: { icon: Clock, color: 'text-muted-foreground' },
  invitation_revoked: { icon: UserMinus, color: 'text-destructive' },
  permission_blocked: { icon: AlertTriangle, color: 'text-destructive' },
  data_export_requested: { icon: Eye, color: 'text-amber-500' },
  owner_approval_required: { icon: Shield, color: 'text-amber-500' },
  settings_changed: { icon: Lock, color: 'text-blue-500' },
  user_removed: { icon: UserMinus, color: 'text-destructive' },
  '2fa_enabled': { icon: Shield, color: 'text-primary' },
  '2fa_verified': { icon: CheckCircle, color: 'text-primary' },
};

const eventLabelKeys: Record<AuditEventType, string> = {
  account_created: 'security.accountCreated',
  login_success: 'security.loginSuccess',
  login_failed: 'security.loginFailed',
  password_changed: 'security.passwordChanged',
  role_assigned: 'security.roleAssigned',
  role_changed: 'security.roleChanged',
  invitation_created: 'security.invitationCreated',
  invitation_accepted: 'security.invitationAccepted',
  invitation_expired: 'security.invitationExpired',
  invitation_revoked: 'security.invitationRevokedEvent',
  permission_blocked: 'security.permissionBlocked',
  data_export_requested: 'security.dataExport',
  owner_approval_required: 'security.ownerApproval',
  settings_changed: 'security.settingsChanged',
  user_removed: 'security.userRemoved',
  '2fa_enabled': 'security.twoFaEnabled',
  '2fa_verified': 'security.twoFaVerified',
};

export function SecurityAuditLog() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    setEvents(getAuditLog());
    const interval = setInterval(() => setEvents(getAuditLog()), 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('nl-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="border-border/50">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold">{t('security.auditLogTitle')}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{t('security.auditLogDesc')}</p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="px-5 pb-5 space-y-1">
          {events.length === 0 ?
          <p className="text-xs text-muted-foreground text-center py-8">{t('security.noSecurityEvents')}</p> :
          events.map((event) => {
            const iconConfig = eventIcons[event.eventType] || { icon: Shield, color: 'text-muted-foreground' };
            const Icon = iconConfig.icon;
            const labelKey = eventLabelKeys[event.eventType];
            const label = labelKey ? t(labelKey) : event.eventType;
            return (
              <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconConfig.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">{label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatTime(event.timestamp)}</span>
                  </div>
                  <p className="text-xs text-foreground/80 truncate">{event.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">IP: {event.ipAddress}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
