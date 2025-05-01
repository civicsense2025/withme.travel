'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WebSocketTest() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          setMessage('Failed to create Supabase client');
          setAuthStatus('unauthenticated');
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setAuthStatus('unauthenticated');
          return;
        }
        
        if (data.session) {
          setAuthStatus('authenticated');
          setUserId(data.session.user.id);
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setAuthStatus('unauthenticated');
      }
    };
    
    checkAuth();
  }, []);

  const testWebSocket = async () => {
    try {
      setStatus('connecting');
      setMessage('Initializing WebSocket connection...');
      
      const supabase = createClient();
      if (!supabase) {
        setStatus('error');
        setMessage('Failed to create Supabase client');
        return;
      }
      
      // Create a test channel
      const channel = supabase.channel('test-channel', {
        config: {
          broadcast: { self: true }
        }
      });
      
      // Set up channel event handlers
      channel
        .on('broadcast', { event: 'test' }, (payload) => {
          setMessage(`Received message: ${JSON.stringify(payload)}`);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setStatus('connected');
            setMessage('Successfully connected! Sending test message...');
            
            // Send a test message
            setTimeout(() => {
              channel.send({
                type: 'broadcast',
                event: 'test',
                payload: { message: 'Hello from WebSocket test!' }
              });
            }, 1000);
          } else if (status === 'CHANNEL_ERROR') {
            setStatus('error');
            setMessage(`Channel error: ${status}`);
          }
        });
      
      // Cleanup function
      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testPresence = async () => {
    try {
      setStatus('connecting');
      setMessage('Initializing presence...');
      
      const supabase = createClient();
      if (!supabase) {
        setStatus('error');
        setMessage('Failed to create Supabase client');
        return;
      }
      
      // Create a channel with presence enabled
      const channel = supabase.channel('presence-test', {
        config: {
          presence: {
            key: userId || 'anonymous-user'
          }
        }
      });
      
      // Set up presence handlers
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setMessage(`Presence state synced: ${JSON.stringify(state)}`);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          setMessage(`User ${key} joined with presences: ${JSON.stringify(newPresences)}`);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          setMessage(`User ${key} left with presences: ${JSON.stringify(leftPresences)}`);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setStatus('connected');
            setMessage('Successfully connected to presence channel! Tracking presence...');
            
            // Track presence
            await channel.track({
              user_id: userId || 'anonymous-user',
              online_at: new Date().toISOString()
            });
          } else if (status === 'CHANNEL_ERROR') {
            setStatus('error');
            setMessage(`Channel error: ${status}`);
          }
        });
      
      // Cleanup function
      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>WebSocket & Presence Test</CardTitle>
          <CardDescription>
            Test WebSocket connection and Presence feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Auth Status:</span>
              <span className={authStatus === 'authenticated' ? 'text-green-500' : 'text-red-500'}>
                {authStatus}
              </span>
            </div>
            
            {userId && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">User ID:</span>
                <span className="text-sm font-mono">{userId}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">Connection Status:</span>
              <span className={
                status === 'connected' ? 'text-green-500' : 
                status === 'error' ? 'text-red-500' : 
                status === 'connecting' ? 'text-yellow-500' : 'text-gray-500'
              }>
                {status}
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Message:</span>
              <div className="p-4 border rounded-md bg-gray-50 text-sm">
                {message || 'No messages yet'}
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <Button 
                onClick={testWebSocket}
                disabled={status === 'connecting' || authStatus === 'checking'}
              >
                Test WebSocket
              </Button>
              
              <Button 
                onClick={testPresence}
                disabled={status === 'connecting' || authStatus === 'checking' || authStatus === 'unauthenticated'}
                variant="outline"
              >
                Test Presence
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 