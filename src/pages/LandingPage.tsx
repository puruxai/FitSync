import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100 }
    }
  } as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden flex-1">
        {/* Decorative Blurred Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-10 w-[20rem] h-[20rem] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 120 }}
            className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold mb-6 tracking-wide"
          >
            <span className="material-symbols-outlined text-[1.3em]">celebration</span>
            <span>Version 2.0 is officially live!</span>
          </motion.div>

          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl"
          >
            Track. Improve.<br className="sm:hidden" />
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent"> Compete.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8, delay: 0.1 }}
            className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed"
          >
            FitSync is a premium social fitness platform where you track workouts, connect with friends, challenge your peers, and monitor health stats in real time.
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center font-bold px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/20 active:scale-95 transition-all text-sm cursor-pointer"
              >
                Go to Dashboard
                <span className="material-symbols-outlined ml-2">arrow_forward</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center font-bold px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/20 active:scale-95 transition-all text-sm cursor-pointer"
                >
                  Start For Free
                  <span className="material-symbols-outlined ml-2">rocket_launch</span>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center font-bold px-8 py-4 rounded-full border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 transition-all text-sm"
                >
                  Explore Features
                </a>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Why FitSync?</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">We combine health statistics with social engagement to make fitness fun and consistent.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/30 text-left shadow-sm">
              <span className="material-symbols-outlined text-4xl text-brand-600 dark:text-brand-500 bg-brand-50 dark:bg-brand-950/30 p-3 rounded-2xl">
                monitoring
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-6 mb-2">Detailed Tracking</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Log steps, hydration, weight changes, calories, and workouts. Watch your charts compile statistics weekly and monthly.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/30 text-left shadow-sm">
              <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl">
                groups
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-6 mb-2">Realtime Social Connect</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Search friends, check their online statuses, see what workouts they just finished, and cheer them on.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/40 dark:border-slate-800/30 text-left shadow-sm">
              <span className="material-symbols-outlined text-4xl text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl">
                emoji_events
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-6 mb-2">Leaderboards & Challenges</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Join step battles, calories burn contests, and custom private friend groups. Climb from Friends to Global rankings.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-900/30 bg-slate-100/30 dark:bg-slate-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Pricing Model</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">FitSync is built for the community. We believe fitness should be accessible to all.</p>
          </div>

          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-8 text-center shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-3.5 py-1 rounded-full">Community Tier</span>
            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
              <span className="text-sm font-semibold text-slate-400">/ forever</span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Get access to 100% of the platform with zero ads, subscriptions, or hidden locks.</p>
            <ul className="mt-8 space-y-4 text-sm text-slate-700 dark:text-slate-300 font-semibold text-left border-t border-slate-100 dark:border-slate-800/40 pt-6">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <span>Realtime Fitness Logs (Steps, Hydration, Weight)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <span>Interactive Progress Analytics & Charts</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <span>Social Friends, Chats & Activity Feed</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <span>Join Daily, Weekly & Private Challenges</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <span>Row Level Security (RLS) Privacy controls</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link
                to="/signup"
                className="w-full inline-flex items-center justify-center font-bold px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 text-white transition-colors cursor-pointer"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white mb-6">Our Mission</h2>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            FitSync was founded in 2026 with a simple vision: to bridge the gap between solo health tracking and social motivation. We believe that tracking your goals becomes more meaningful when shared with a community that supports, celebrates, and challenges you to push further.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default LandingPage;
