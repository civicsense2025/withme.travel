import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-center font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 