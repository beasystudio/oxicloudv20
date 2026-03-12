import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Clock, AlertTriangle, X } from 'lucide-react';
import { createInvitation, type UserRoleType, OWNER_ONLY_ACTIONS } from '@/lib/securityAuditStore';
import { toast } from 'sonner';

interface InviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerEmail: string;
  onInvited?: () => void;
}

const roleDescriptions: Record<Exclude<UserRoleType, 'OWNER'>, { label: string; description: string; restrictions: string[] }> = {
  SETUP_ADMIN: {
    label: 'Setup Admin (tijdelijk)',
    description: 'Kan het platform opzetten, maar heeft beperkte rechten. Rol verloopt automatisch na 7 dagen.',
    restrictions: [
      'Kan eigenaar niet verwijderen',
      'Kan eigendom niet overdragen',
      'Kan betaalmethode niet wijzigen',
      'Kan audit logs niet uitschakelen',
      'Kan organisatie niet verwijderen',
    ],
  },
  ADMIN: {
    label: 'Admin',
    description: 'Volledige beheertoegang, behalve eigenaar-specifieke acties.',
    restrictions: [
      'Kan eigenaar niet verwijderen',
      'Kan eigendom niet overdragen',
      'Bulk data export vereist goedkeuring eigenaar',
    ],
  },
  USER: {
    label: 'Medewerker',
    description: 'Standaard toegang tot projecten en basismodules.',
    restrictions: [
      'Geen toegang tot instellingen',
      'Geen toegang tot financieel dashboard',
      'Kan geen gebruikers beheren',
    ],
  },
  VIEWER: {
    label: 'Alleen-lezen',
    description: 'Kan gegevens bekijken maar niets wijzigen.',
    restrictions: [
      'Kan niets bewerken',
      'Geen toegang tot gevoelige data',
    ],
  },
};

export function InviteTeamMemberDialog({ open, onOpenChange, ownerId, ownerEmail, onInvited }: InviteTeamMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<UserRoleType, 'OWNER'>>('SETUP_ADMIN');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Voer een geldig e-mailadres in');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    createInvitation({
      email,
      role,
      createdBy: ownerId,
      createdByEmail: ownerEmail,
      expirationDays: role === 'SETUP_ADMIN' ? 7 : 30,
    });

    toast.success(`Uitnodiging verstuurd naar ${email}`);
    setEmail('');
    setRole('SETUP_ADMIN');
    setLoading(false);
    onInvited?.();
    onOpenChange(false);
  };

  const currentRole = roleDescriptions[role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Teamlid uitnodigen
          </DialogTitle>
          <DialogDescription>
            Nodig iemand uit om u te helpen met de setup. Alleen u als eigenaar kunt uitnodigingen versturen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">E-mailadres</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="collega@bedrijf.be"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 pl-10"
                type="email"
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Rol</Label>
            <Select value={role} onValueChange={v => setRole(v as any)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(roleDescriptions) as Array<Exclude<UserRoleType, 'OWNER'>>).map(key => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      {roleDescriptions[key].label}
                      {key === 'SETUP_ADMIN' && <Badge variant="secondary" className="text-[10px] h-4 px-1">Tijdelijk</Badge>}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role info card */}
          <div className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3">
            <p className="text-xs text-muted-foreground">{currentRole.description}</p>

            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Beperkingen</p>
              {currentRole.restrictions.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <X className="h-3 w-3 text-destructive shrink-0" />
                  <span className="text-xs text-foreground/70">{r}</span>
                </div>
              ))}
            </div>

            {role === 'SETUP_ADMIN' && (
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400">Verloopt automatisch na 7 dagen</span>
              </div>
            )}
          </div>

          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Beveiligingsregel:</strong> Deze persoon moet een eigen account aanmaken, e-mail verifiëren en de Voorwaarden & Verantwoordelijkheidsovereenkomst accepteren.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuleren</Button>
            <Button onClick={handleInvite} disabled={loading || !email}>
              {loading ? 'Verzenden…' : 'Uitnodiging versturen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
