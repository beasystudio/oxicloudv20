import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import {
  getMonitorSubscriptions,
  updateMonitorSubscription,
  addMonitorSubscription,
  getMonitorStats,
  type MonitorSubscription,
} from '@/lib/monitorSubscriptionStore';
import { Search } from 'lucide-react';

export function MonitorSubscriptionManager() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<MonitorSubscription[]>(getMonitorSubscriptions());
  const [selectedSub, setSelectedSub] = useState<MonitorSubscription | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newForm, setNewForm] = useState({
    municipalityName: '', municipalityCode: '', province: '', contactName: '', contactEmail: '', contactPhone: '',
    plan: 'Standard' as MonitorSubscription['plan'],
  });

  const stats = getMonitorStats();
  const reload = () => setSubscriptions(getMonitorSubscriptions());

  const filteredSubs = subscriptions.filter(s =>
    s.municipalityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (sub: MonitorSubscription) => {
    const newStatus = sub.status === 'active' ? 'suspended' : 'active';
    updateMonitorSubscription(sub.id, { status: newStatus });
    toast({ title: `${t('monitor.license.editSubscription')}`, description: `${sub.municipalityName} → ${newStatus}` });
    reload();
  };

  const handleUpdatePlan = () => {
    if (!selectedSub) return;
    updateMonitorSubscription(selectedSub.id, {
      plan: selectedSub.plan,
      monthlyFee: selectedSub.plan === 'Premium' ? 249 : selectedSub.plan === 'Standard' ? 149 : 79,
      maxPowerUsers: selectedSub.plan === 'Premium' ? 3 : selectedSub.plan === 'Standard' ? 2 : 1,
      maxStandardUsers: selectedSub.plan === 'Premium' ? 10 : selectedSub.plan === 'Standard' ? 5 : 2,
      renewalDate: selectedSub.renewalDate,
      notes: selectedSub.notes,
    });
    toast({ title: t('monitor.license.subscriptionUpdated'), description: `${selectedSub.municipalityName} ${t('monitor.license.planUpdated')}` });
    setEditOpen(false);
    reload();
  };

  const handleAddSubscription = () => {
    if (!newForm.municipalityName || !newForm.contactEmail) {
      toast({ title: t('monitor.upload.missingFields'), description: t('monitor.upload.fillRequired'), variant: 'destructive' });
      return;
    }
    const fee = newForm.plan === 'Premium' ? 249 : newForm.plan === 'Standard' ? 149 : 79;
    const renewal = new Date();
    renewal.setFullYear(renewal.getFullYear() + 1);

    addMonitorSubscription({
      id: `sub-${Date.now()}`, ...newForm, status: 'active',
      powerUsers: 0, standardUsers: 0,
      maxPowerUsers: newForm.plan === 'Premium' ? 3 : newForm.plan === 'Standard' ? 2 : 1,
      maxStandardUsers: newForm.plan === 'Premium' ? 10 : newForm.plan === 'Standard' ? 5 : 2,
      monthlyFee: fee,
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: renewal.toISOString().split('T')[0],
      billingStatus: 'pending', lastPaymentDate: null, notes: '',
    });
    toast({ title: t('monitor.license.subscriptionCreated'), description: `${newForm.municipalityName} ${t('monitor.license.hasBeenAdded')}` });
    setAddOpen(false);
    setNewForm({ municipalityName: '', municipalityCode: '', province: '', contactName: '', contactEmail: '', contactPhone: '', plan: 'Standard' });
    reload();
  };

  const billingBadge = (billing: MonitorSubscription['billingStatus']) => {
    if (billing === 'paid') return <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">{t('monitor.license.paid')}</Badge>;
    if (billing === 'pending') return <Badge variant="outline" className="text-muted-foreground border-border">{t('monitor.license.pendingBilling')}</Badge>;
    return <Badge variant="destructive">{t('monitor.license.overdueBilling')}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('monitor.license.totalMunicipalities'), value: stats.total },
          { label: t('monitor.license.active'), value: stats.active, color: 'text-primary' },
          { label: t('monitor.license.monthlyRevenue'), value: `€${stats.mrr}` },
          { label: t('monitor.license.overdue'), value: stats.overdue, color: stats.overdue > 0 ? 'text-destructive' : undefined },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">{s.label}</p>
            <p className={cn("text-2xl font-semibold mt-2", s.color || 'text-foreground')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('monitor.license.searchMunicipalities')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setAddOpen(true)}>
          {t('monitor.license.addMunicipality')}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredSubs.map(sub => (
          <div key={sub.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-start gap-6">
              {/* Left: Municipality Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{sub.municipalityName}</h3>
                  <Badge variant="outline" className="text-[10px]">{sub.plan}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{sub.contactName} · {sub.contactEmail}</p>
              </div>

              {/* Right: Grid of info + actions */}
              <div className="flex items-center gap-6">
                {/* Price + Status */}
                <div className="flex items-center justify-end gap-2 min-w-[150px]">
                  {billingBadge(sub.billingStatus)}
                  <div className="text-sm font-semibold tabular-nums">€{sub.monthlyFee}/mo</div>
                </div>

                {/* Users */}
                <div className="text-right min-w-[80px] hidden lg:block">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">{t('monitor.license.users')}</p>
                  <p className="text-sm font-semibold tabular-nums">{sub.powerUsers + sub.standardUsers} / {sub.maxPowerUsers + sub.maxStandardUsers}</p>
                </div>

                {/* Renewal */}
                <div className="text-right min-w-[90px] hidden lg:block">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">{t('monitor.license.renewal')}</p>
                  <p className="text-sm font-semibold">{sub.renewalDate}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={() => { setSelectedSub({ ...sub }); setEditOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={() => handleToggleStatus(sub)}>
                    {sub.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredSubs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="font-semibold">{t('monitor.license.noMunicipalities')}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('monitor.license.editSubscription')}</DialogTitle>
            <DialogDescription>{selectedSub?.municipalityName}</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>{t('monitor.license.plan')}</Label>
                <Select value={selectedSub.plan} onValueChange={v => setSelectedSub({ ...selectedSub, plan: v as MonitorSubscription['plan'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic - €79/mo</SelectItem>
                    <SelectItem value="Standard">Standard - €149/mo</SelectItem>
                    <SelectItem value="Premium">Premium - €249/mo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('monitor.license.renewalDate')}</Label>
                <Input type="date" value={selectedSub.renewalDate} onChange={e => setSelectedSub({ ...selectedSub, renewalDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('monitor.license.notes')}</Label>
                <Input value={selectedSub.notes} onChange={e => setSelectedSub({ ...selectedSub, notes: e.target.value })} />
              </div>
              <Button onClick={handleUpdatePlan} className="w-full">{t('monitor.license.saveChanges')}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('monitor.license.addMunicipality')}</DialogTitle>
            <DialogDescription>{t('monitor.license.createSubscription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('monitor.license.municipalityName')} *</Label>
              <Input value={newForm.municipalityName} onChange={e => setNewForm({ ...newForm, municipalityName: e.target.value })} placeholder="Gemeente..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('monitor.license.code')}</Label>
                <Input value={newForm.municipalityCode} onChange={e => setNewForm({ ...newForm, municipalityCode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('monitor.license.province')}</Label>
                <Input value={newForm.province} onChange={e => setNewForm({ ...newForm, province: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('monitor.license.contactName')}</Label>
              <Input value={newForm.contactName} onChange={e => setNewForm({ ...newForm, contactName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('monitor.license.contactEmail')} *</Label>
              <Input type="email" value={newForm.contactEmail} onChange={e => setNewForm({ ...newForm, contactEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('monitor.license.plan')}</Label>
              <Select value={newForm.plan} onValueChange={v => setNewForm({ ...newForm, plan: v as MonitorSubscription['plan'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic - €79/mo</SelectItem>
                  <SelectItem value="Standard">Standard - €149/mo</SelectItem>
                  <SelectItem value="Premium">Premium - €249/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddSubscription} className="w-full">{t('monitor.license.createSub')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
