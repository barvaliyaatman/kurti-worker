import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, ArrowRight } from 'lucide-react';
import { APP_NAME, FACTORY_NAME, ROUTES } from '../constants/index.js';

export const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-factory-navy text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

      <div className="flex justify-between items-center z-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 border border-slate-700/80 px-3 py-1 rounded-full bg-slate-800/40 backdrop-blur-sm">
          Phase P-001 Architecture
        </span>
      </div>

      <div className="my-auto text-center flex flex-col items-center justify-center z-10 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-600 flex items-center justify-center text-white shadow-touch mb-8 relative group"
        >
          <Scissors className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" />
          <div className="absolute -inset-1 rounded-3xl bg-brand-500 opacity-30 blur-md -z-10"></div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-white"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm sm:text-base text-slate-300 max-w-sm font-medium leading-relaxed"
        >
          {FACTORY_NAME}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-48 h-1.5 bg-slate-800 rounded-full mt-10 overflow-hidden"
        >
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      <div className="z-10 text-center flex flex-col items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="btn-touch w-full max-w-xs bg-white text-factory-navy hover:bg-slate-100 flex items-center justify-center gap-2 font-bold"
        >
          <span>Continue to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500">
          Mobile First ERP Platform • Production Ready Foundation
        </p>
      </div>
    </div>
  );
};

export default SplashPage;
