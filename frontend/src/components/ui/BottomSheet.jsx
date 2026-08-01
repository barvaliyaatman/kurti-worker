import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const BottomSheet = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-factory-navy/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 p-6 flex flex-col max-h-[85vh] overflow-hidden',
              className
            )}
          >
            {/* Touch Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 shrink-0" />

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
              {title && <h3 className="font-bold text-lg text-factory-navy">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 text-factory-muted hover:text-factory-navy rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
