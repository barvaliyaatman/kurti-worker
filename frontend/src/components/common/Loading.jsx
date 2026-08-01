import React from 'react';
import { motion } from 'framer-motion';

export const Loading = ({
  fullScreen = false,
  message = 'Loading Kurti ERP...',
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-brand-200 border-t-brand-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="w-6 h-6 rounded-full bg-brand-600/10 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
        </div>
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-factory-muted animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-factory-bg/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
