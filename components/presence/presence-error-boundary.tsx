'use client';

import React from 'react';
import { usePresenceContext } from './presence-context';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Loader } from 'lucide-react';

// Local Icons component to avoid external dependency
const Icons = {
  AlertTriangle,
  RefreshCw,
  Loader
};

interface Props {
  children: React.ReactNode;
  onRecoveryFailed?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean;
}

export class PresenceErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isRecovering: false
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Presence error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <PresenceErrorDisplay 
        error={this.state.error} 
        isRecovering={this.state.isRecovering}
        onRecover={() => this.setState({ isRecovering: true })}
        onRecoveryComplete={() => {
          this.setState({
            hasError: false,
            error: null,
            isRecovering: false
          });
        }}
        onRecoveryFailed={this.props.onRecoveryFailed}
      />;
    }

    return this.props.children;
  }
}

interface PresenceErrorDisplayProps {
  error: Error | null;
  isRecovering: boolean;
  onRecover: () => void;
  onRecoveryComplete: () => void;
  onRecoveryFailed?: () => void;
}

function PresenceErrorDisplay({ 
  error, 
  isRecovering,
  onRecover,
  onRecoveryComplete,
  onRecoveryFailed
}: PresenceErrorDisplayProps) {
  const { recoverPresence, isLoading, connectionState } = usePresenceContext();

  const handleRecovery = async () => {
    try {
      onRecover();
      await recoverPresence();
      onRecoveryComplete();
    } catch (err) {
      console.error('Failed to recover presence:', err);
      onRecoveryFailed?.();
    }
  };

  return (
    <Alert variant="destructive" className="my-4">
      <Icons.AlertTriangle className="h-4 w-4" />
      <AlertTitle>Presence Connection Issue</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p className="text-sm">
            {error?.message || 'An error occurred while tracking real-time presence'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Connection status: {connectionState}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleRecovery}
            disabled={isRecovering || isLoading || connectionState === 'connecting'}
          >
            {isRecovering || isLoading || connectionState === 'connecting' ? (
              <>
                <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <Icons.RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
