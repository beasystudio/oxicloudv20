import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InviteManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteManagerDialog({ open, onOpenChange }: InviteManagerDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    // Simulate sending - in production this would call an edge function
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Invitation sent!', {
      description: `We've sent an email to ${email} about OxiCloud.`,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSent(false);
      setEmail('');
      setName('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Invitation Sent</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We've sent an email to <strong>{email}</strong> with information about OxiCloud and how to create a Workspace.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite your manager</DialogTitle>
              <DialogDescription>
                Send your manager an email about OxiCloud. They can create a Workspace for your firm and invite you to join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Manager's name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  placeholder="e.g. Paul Gijsemans"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Manager's email</Label>
                <Input
                  type="email"
                  placeholder="manager@firm.be"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button onClick={handleSend} disabled={!email || loading} className="w-full gap-2">
                <Send className="w-4 h-4" />
                {loading ? 'Sending…' : 'Send Invitation'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
