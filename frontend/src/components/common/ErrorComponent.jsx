import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorComponent = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try refreshing or contact support.',
  onRetry,
}) => {
  return (
    <div className="card-factory text-center max-w-md mx-auto my-8 p-8 flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-red-50 text-factory-danger flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-factory-navy mb-2">{title}</h3>
      <p className="text-sm text-factory-muted mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary w-full">
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;
