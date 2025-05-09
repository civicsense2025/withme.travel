import React, { ReactNode, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ReactNode;
}

export function AdminStatsCard({ title, value, change, trend, icon }: AdminStatsCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function sendAdminAlert() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/notifications/admin-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: alertTitle, content: alertMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setResult('Alert sent!');
        setShowDialog(false);
        setAlertTitle('');
        setAlertMessage('');
      } else {
        setResult(data.error || 'Failed to send alert');
      }
    } catch (e) {
      setResult('Error sending alert');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className="rounded-full bg-primary/10 p-2.5">
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
        <button onClick={() => setShowDialog(true)} className="bg-red-600 text-white px-3 py-1 rounded mt-2">Send Admin Alert</button>
        {showDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-bold mb-2">Send Admin Alert</h2>
              <input
                className="w-full border p-2 mb-2"
                placeholder="Title"
                value={alertTitle}
                onChange={e => setAlertTitle(e.target.value)}
                disabled={sending}
              />
              <textarea
                className="w-full border p-2 mb-2"
                placeholder="Message"
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
                rows={4}
                disabled={sending}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowDialog(false)} className="px-3 py-1" disabled={sending}>Cancel</button>
                <button onClick={sendAdminAlert} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={sending || !alertTitle || !alertMessage}>Send</button>
              </div>
              {result && <div className="mt-2 text-sm text-red-600">{result}</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 