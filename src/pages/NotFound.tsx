import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="max-w-md space-y-6"
      >
        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center">
          <span className="material-symbols-outlined text-[8rem] text-brand-100 dark:text-brand-950/20 select-none">
            explore
          </span>
          <span className="material-symbols-outlined absolute text-[4rem] text-brand-600 dark:text-brand-500 animate-spin" style={{ animationDuration: '8s' }}>
            explore
          </span>
        </div>

        <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">404</h1>
        
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Wandered off the trail?
        </h2>
        
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Looks like the page you are looking for doesn't exist. Let's get you back to tracking your stats!
        </p>

        <div className="pt-4">
          <Link to="/dashboard">
            <Button size="md" leftIcon="home">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
export default NotFound;
