import React, { ReactNode, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, SendHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface AdminStatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ReactNode;
}

export function AdminStatsCard({ title, value, change, trend, icon }: AdminStatsCardProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function sendAdminAlert() {
    setSending(true);
    try {
      const res = await fetch('/api/notifications/admin-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: alertTitle, content: alertMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Alert Sent',
          description: 'Your admin alert has been sent successfully',
        });
        setShowDialog(false);
        setAlertTitle('');
        setAlertMessage('');
      } else {
        toast({
          title: 'Failed to Send Alert',
          description: data.error || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to send admin alert',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className="rounded-full bg-primary/10 p-2.5 transition-transform duration-300 hover:scale-105">
            {icon}
          </div>
        </div>

        <div className="flex items-center mt-3">
          {trend === 'up' && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <ArrowUp className="h-3.5 w-3.5 mr-1" />
              <span>{change}</span>
            </div>
          )}

          {trend === 'down' && (
            <div className="flex items-center text-sm text-red-600 dark:text-red-400">
              <ArrowDown className="h-3.5 w-3.5 mr-1" />
              <span>{change}</span>
            </div>
          )}

          {trend === 'neutral' && (
            <div className="text-sm text-muted-foreground">
              <span>{change}</span>
            </div>
          )}

          <span className="text-xs text-muted-foreground ml-2">from last month</span>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={() => setShowDialog(true)}
        >
          <SendHorizontal className="h-4 w-4 mr-2" />
          Send Admin Alert
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Send Admin Alert</DialogTitle>
              <DialogDescription>Send an urgent notification to all admin users.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="alert-title" className="text-sm font-medium">
                  Alert Title
                </label>
                <Input
                  id="alert-title"
                  placeholder="Enter alert title"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="alert-message" className="text-sm font-medium">
                  Alert Message
                </label>
                <Textarea
                  id="alert-message"
                  placeholder="Enter alert message"
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  rows={4}
                  disabled={sending}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={sending}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={sendAdminAlert}
                disabled={sending || !alertTitle || !alertMessage}
              >
                {sending ? 'Sending...' : 'Send Alert'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
