/**
 * Security Audit Store
 * Tracks security events, invitations, and role management for the pilot/demo environment.
 * In production, this would be backed by an immutable database table.
 */

const AUDIT_LOG_KEY = 'pilot_audit_log';
const INVITATIONS_KEY = 'pilot_invitations';

export type AuditEventType =
  | 'account_created'
  | 'login_success'
  | 'login_failed'
  | 'password_changed'
  | 'role_assigned'
  | 'role_changed'
  | 'invitation_created'
  | 'invitation_accepted'
  | 'invitation_expired'
  | 'invitation_revoked'
  | 'permission_blocked'
  | 'data_export_requested'
  | 'owner_approval_required'
  | 'settings_changed'
  | 'user_removed'
  | '2fa_enabled'
  | '2fa_verified';

export type UserRoleType = 'OWNER' | 'SETUP_ADMIN' | 'ADMIN' | 'USER' | 'VIEWER';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId: string;
  userEmail: string;
  targetUserId?: string;
  targetEmail?: string;
  description: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRoleType;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  acceptedAt?: string;
}

// Restricted actions for non-owners
export const OWNER_ONLY_ACTIONS = [
  'transfer_ownership',
  'remove_owner',
  'modify_owner_role',
  'change_billing',
  'disable_audit_logs',
  'export_full_data',
  'delete_organization',
  'add_another_owner',
] as const;

export type OwnerOnlyAction = typeof OWNER_ONLY_ACTIONS[number];

const generateId = () => 'audit_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now().toString(36);

// Simulated IP address
const getClientIP = () => '192.168.1.' + Math.floor(Math.random() * 255);

// Audit log management
export const getAuditLog = (): AuditEvent[] => {
  const stored = sessionStorage.getItem(AUDIT_LOG_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const logAuditEvent = (event: Omit<AuditEvent, 'id' | 'timestamp' | 'ipAddress'>): AuditEvent => {
  const log = getAuditLog();
  const newEvent: AuditEvent = {
    ...event,
    id: generateId(),
    timestamp: new Date().toISOString(),
    ipAddress: getClientIP(),
  };
  log.unshift(newEvent);
  sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log.slice(0, 200)));
  return newEvent;
};

// Invitation management
export const getInvitations = (): Invitation[] => {
  const stored = sessionStorage.getItem(INVITATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createInvitation = (data: { email: string; role: UserRoleType; createdBy: string; createdByEmail: string; expirationDays?: number }): Invitation => {
  const invitations = getInvitations();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.expirationDays || 7));

  const invitation: Invitation = {
    id: generateId(),
    email: data.email,
    role: data.role,
    createdBy: data.createdBy,
    createdByEmail: data.createdByEmail,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
  };

  invitations.push(invitation);
  sessionStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));

  logAuditEvent({
    eventType: 'invitation_created',
    userId: data.createdBy,
    userEmail: data.createdByEmail,
    targetEmail: data.email,
    description: `Invitation sent to ${data.email} with role ${data.role}`,
    metadata: { role: data.role, expiresAt: invitation.expiresAt },
  });

  return invitation;
};

export const revokeInvitation = (id: string, userId: string, userEmail: string): boolean => {
  const invitations = getInvitations();
  const index = invitations.findIndex(i => i.id === id);
  if (index === -1) return false;

  invitations[index].status = 'revoked';
  sessionStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));

  logAuditEvent({
    eventType: 'invitation_revoked',
    userId,
    userEmail,
    targetEmail: invitations[index].email,
    description: `Invitation to ${invitations[index].email} revoked`,
  });

  return true;
};

// Permission check
export const canPerformAction = (userRole: UserRoleType, action: OwnerOnlyAction): { allowed: boolean; reason: string } => {
  if (userRole === 'OWNER') {
    return { allowed: true, reason: '' };
  }

  const actionLabels: Record<OwnerOnlyAction, string> = {
    transfer_ownership: 'Eigendom overdragen',
    remove_owner: 'Eigenaar verwijderen',
    modify_owner_role: 'Eigenaar rol wijzigen',
    change_billing: 'Betaalmethode wijzigen',
    disable_audit_logs: 'Audit logs uitschakelen',
    export_full_data: 'Alle data exporteren',
    delete_organization: 'Organisatie verwijderen',
    add_another_owner: 'Extra eigenaar toevoegen',
  };

  logAuditEvent({
    eventType: 'permission_blocked',
    userId: 'current',
    userEmail: 'current',
    description: `Blocked action: ${actionLabels[action] || action}`,
    metadata: { action, userRole },
  });

  return {
    allowed: false,
    reason: `Actie niet toegestaan. Alleen de eigenaar (bestuurder) kan "${actionLabels[action] || action}" uitvoeren.`,
  };
};
