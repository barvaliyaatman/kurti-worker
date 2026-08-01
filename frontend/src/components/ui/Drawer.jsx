import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right',
  size = 'max-w-md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const slideVariants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-factory-navy/70 backdrop-blur-xs"
          />

          <motion.div
            initial={slideVariants[position].initial}
            animate={slideVariants[position].animate}
            exit={slideVariants[position].exit}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed top-0 bottom-0 z-10 w-full bg-white shadow-2xl flex flex-col',
              position === 'right' ? 'right-0' : 'left-0',
              size
            )}
          >
            <div className="p-4 sm:p-6 border-b border-factory-border flex items-center justify-between bg-slate-50">
              <div>
                {title && <h3 className="text-lg font-bold text-factory-navy">{title}</h3>}
                {subtitle && <p className="text-xs text-factory-muted mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-factory-muted hover:text-factory-navy hover:bg-slate-200 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
