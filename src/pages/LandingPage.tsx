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
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  } as const;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(11,11,11,0.5), rgba(11,11,11,0.95)), url('/gym_hero_bg.jpg')` }}>
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-[#FF5A00]/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#FF9A3D]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#151515]/90 border border-[#FF6B00]/30 text-[#FF8C32] text-xs font-bold mb-8 tracking-wider uppercase backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[1.4em] text-[#FF6B00]">celebration</span>
            <span>Version 2.0 Premium Release is Live</span>
          </motion.div>

          <motion.h1
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.9 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-none max-w-5xl"
          >
            TRACK. IMPROVE.<br />
            <span className="bg-gradient-to-r from-[#FF5A00] to-[#FF9A3D] bg-clip-text text-transparent">COMPETE.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.9, delay: 0.15 }}
            className="mt-8 text-lg sm:text-xl text-gray-400 font-medium max-w-3xl leading-relaxed"
          >
            FitSync is an elite social fitness platform. Log your training metrics, connect with workout partners, dominate global leaderboards, and monitor health stats in real-time.
          </motion.p>

          {/* Action CTA Buttons */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.9, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
          >
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center font-bold px-10 py-5 rounded-full bg-gradient-to-r from-[#FF5A00] to-[#FF9A3D] hover:from-[#FF6B00] hover:to-[#FF9A3D] text-white shadow-lg shadow-[#FF5A00]/30 active:scale-95 transition-all text-base cursor-pointer"
              >
                Go to Dashboard
                <span className="material-symbols-outlined ml-2 font-bold">arrow_forward</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center font-bold px-10 py-5 rounded-full bg-gradient-to-r from-[#FF5A00] to-[#FF9A3D] hover:from-[#FF6B00] hover:to-[#FF9A3D] text-white shadow-lg shadow-[#FF5A00]/30 active:scale-95 transition-all text-base cursor-pointer"
                >
                  Start Training Now
                  <span className="material-symbols-outlined ml-2 font-bold">rocket_launch</span>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center font-bold px-10 py-5 rounded-full bg-[#1D1D1D]/90 border border-gray-800 hover:border-gray-700 hover:bg-[#252525] text-white active:scale-95 transition-all text-base backdrop-blur-md"
                >
                  Explore Elite Features
                </a>
              </>
            )}
          </motion.div>

          {/* Luxury Metric Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-8 sm:gap-16 border-t border-gray-900 pt-10 w-full max-w-4xl"
          >
            <div>
              <p className="text-3xl sm:text-5xl font-black text-[#FF6B00]">10K+</p>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mt-1">Active Athletes</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-[#FF6B00]">1M+</p>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mt-1">Logged Workouts</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-[#FF6B00]">99.8%</p>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mt-1">Goal Success</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workout Categories Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#151515]/40 border-t border-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Categories</span>
            <h2 className="text-4xl font-extrabold text-white mt-2">Tailored Training Programs</h2>
            <p className="mt-4 text-gray-400 font-medium">Explore specific categories targeted towards elite performance levels.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Strength Training', icon: 'fitness_center', count: '45+ Workouts', color: 'from-orange-600 to-amber-500' },
              { title: 'Cardio Intensity', icon: 'directions_run', count: '30+ Programs', color: 'from-red-600 to-orange-500' },
              { title: 'Flexibility & Yoga', icon: 'self_improvement', count: '20+ Sessions', color: 'from-emerald-600 to-teal-500' },
              { title: 'Athletic Agility', icon: 'sports_gymnastics', count: '15+ Challenges', color: 'from-purple-600 to-indigo-500' }
            ].map((cat, idx) => (
              <div key={idx} className="group relative p-6 bg-[#1D1D1D] rounded-3xl border border-gray-900 overflow-hidden hover:border-[#FF6B00]/40 transition-all hover:scale-105 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center text-white mb-6 group-hover:bg-[#FF6B00]/10 group-hover:text-[#FF6B00] transition-colors">
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                <p className="text-xs text-gray-500 font-semibold">{cat.count}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FitSync / Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-950 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Core Features</span>
            <h2 className="text-4xl font-extrabold text-white mt-2">Next-Gen Fitness Tracking</h2>
            <p className="mt-4 text-gray-400 font-medium">Elevating daily wellness targets with social verification and gamified competitions.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="p-8 bg-[#1D1D1D] rounded-3xl border border-gray-900 text-left shadow-2xl relative overflow-hidden group hover:border-[#FF6B00]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">monitoring</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-3">Structured Analytics</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Log step counts, water intake, body metrics, and training intensity. Beautifully visual statistics charts compile progress updates.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="p-8 bg-[#1D1D1D] rounded-3xl border border-gray-900 text-left shadow-2xl relative overflow-hidden group hover:border-[#FF6B00]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-3">Real-Time Social Network</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Connect with fitness companions, monitor online activity, check completed workouts, and share progress updates in private chat feeds.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="p-8 bg-[#1D1D1D] rounded-3xl border border-gray-900 text-left shadow-2xl relative overflow-hidden group hover:border-[#FF6B00]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">emoji_events</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-3">Gamified Competitions</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Join daily step matches, calorie burners, and target milestones. Secure XP points, claim medals, and rise on global podium ranks.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing / Membership Tier */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-950 bg-[#151515]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Membership Plan</span>
            <h2 className="text-4xl font-extrabold text-white mt-2">100% Free Access</h2>
            <p className="mt-4 text-gray-400 font-medium">No credit cards, hidden subscriptions, or paywalled locks. Join the movement.</p>
          </div>

          <div className="max-w-xl mx-auto bg-[#1D1D1D] rounded-[2rem] border border-gray-900 p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B00]/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00] bg-[#FF6B00]/10 px-4 py-1.5 rounded-full">Community Tier</span>
            <div className="mt-8 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-extrabold text-white">$0</span>
              <span className="text-sm font-semibold text-gray-500">/ forever</span>
            </div>
            <p className="mt-6 text-sm text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              Unlock the complete feature set immediately with zero constraints.
            </p>
            
            <ul className="mt-10 space-y-4.5 text-sm text-gray-300 font-medium text-left border-t border-gray-900 pt-8 max-w-md mx-auto">
              <li className="flex items-center gap-3.5">
                <span className="material-symbols-outlined text-[#FF6B00] font-bold">check_circle</span>
                <span>Unlimited Health Metrics Tracking</span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="material-symbols-outlined text-[#FF6B00] font-bold">check_circle</span>
                <span>Detailed Weekly Progress Analytics</span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="material-symbols-outlined text-[#FF6B00] font-bold">check_circle</span>
                <span>Private Chat Channels & Friends Lists</span>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="material-symbols-outlined text-[#FF6B00] font-bold">check_circle</span>
                <span>Daily step count matches & Leaderboards</span>
              </li>
            </ul>

            <div className="mt-10">
              <Link
                to="/signup"
                className="w-full inline-flex items-center justify-center font-bold px-8 py-4.5 rounded-2xl bg-gradient-to-r from-[#FF5A00] to-[#FF9A3D] text-white hover:from-[#FF6B00] hover:to-[#FF9A3D] transition-all transform active:scale-95 shadow-lg shadow-[#FF5A00]/25 cursor-pointer text-base"
              >
                Sign Up & Claim Membership
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-950 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Success Stories</span>
            <h2 className="text-4xl font-extrabold text-white mt-2">Words From Elite Athletes</h2>
            <p className="mt-4 text-gray-400 font-medium">How FitSync transformed daily workout routines and habits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-[#1D1D1D] rounded-3xl border border-gray-900 relative">
              <span className="material-symbols-outlined text-5xl text-[#FF6B00]/20 absolute top-6 right-8">format_quote</span>
              <p className="text-base text-gray-300 italic relative z-10 leading-relaxed font-medium">
                "FitSync step battles with my office colleagues keep me moving every single hour. The premium dark aesthetic feels incredibly modern."
              </p>
              <div className="mt-6 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-white font-extrabold text-sm">
                  MD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Devore</h4>
                  <p className="text-xs text-gray-500 font-semibold uppercase mt-0.5">Strength Trainee</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-[#1D1D1D] rounded-3xl border border-gray-900 relative">
              <span className="material-symbols-outlined text-5xl text-[#FF6B00]/20 absolute top-6 right-8">format_quote</span>
              <p className="text-base text-gray-300 italic relative z-10 leading-relaxed font-medium">
                "Finding a community that tracks and cheers together is highly motivating. RLS security controls give me complete peace of mind over my health files."
              </p>
              <div className="mt-6 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-white font-extrabold text-sm">
                  SC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sarah Connor</h4>
                  <p className="text-xs text-gray-500 font-semibold uppercase mt-0.5">Cardio Athlete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-950 bg-[#151515]/20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">Our Mission</span>
          <h2 className="text-3xl font-extrabold text-white mt-2 mb-6">Bridging Fitness & Community</h2>
          <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed">
            FitSync was founded in 2026 with a simple vision: to bridge the gap between solo health tracking and social motivation. We believe that tracking your goals becomes more meaningful when shared with a community that supports, celebrates, and challenges you to push further.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default LandingPage;

