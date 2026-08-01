import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Canvas Dumbbell Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0.3;
    let angleY = 0.5;

    // Barbell 3D coordinates
    const nodes = [
      // Left plate 1
      { x: -50, y: -30, z: -30 }, { x: -50, y: 30, z: -30 },
      { x: -50, y: 30, z: 30 }, { x: -50, y: -30, z: 30 },
      // Left plate 2
      { x: -60, y: -40, z: -40 }, { x: -60, y: 40, z: -40 },
      { x: -60, y: 40, z: 40 }, { x: -60, y: -40, z: 40 },
      // Right plate 1
      { x: 50, y: -30, z: -30 }, { x: 50, y: 30, z: -30 },
      { x: 50, y: 30, z: 30 }, { x: 50, y: -30, z: 30 },
      // Right plate 2
      { x: 60, y: -40, z: -40 }, { x: 60, y: 40, z: -40 },
      { x: 60, y: 40, z: 40 }, { x: 60, y: -40, z: 40 },
      // Shaft
      { x: -80, y: 0, z: 0 }, { x: 80, y: 0, z: 0 }
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [8, 9], [9, 10], [10, 11], [11, 8],
      [12, 13], [13, 14], [14, 15], [15, 12],
      [16, 17],
      // Connecting left plates
      [0, 4], [1, 5], [2, 6], [3, 7],
      // Connecting right plates
      [8, 12], [9, 13], [10, 14], [11, 15]
    ];

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 450;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const project = (x: number, y: number, z: number) => {
      // 3D rotation matrix
      let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
      let z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
      let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
      
      const fov = 350;
      const distance = 280;
      const scale = fov / (distance + z2);
      const projX = canvas.width / 2 + x1 * scale;
      const projY = canvas.height / 2 + y2 * scale;
      return { x: projX, y: projY };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angleX += 0.006;
      angleY += 0.008;

      // Draw grid overlay
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 50) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      const projected = nodes.map(n => project(n.x, n.y, n.z));

      // Draw wires
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(57, 255, 20, 0.4)';
      
      edges.forEach(([u, v]) => {
        ctx.beginPath();
        ctx.moveTo(projected[u].x, projected[u].y);
        ctx.lineTo(projected[v].x, projected[v].y);
        ctx.stroke();
      });

      // Draw glowing nodes
      ctx.fillStyle = '#FFFFFF';
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* 1. Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-brand-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.15)]">
            <span className="material-symbols-outlined text-brand-400 font-bold text-2xl animate-pulse">fitness_center</span>
          </div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FITSYNC</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-black tracking-widest uppercase text-slate-400">
          <a href="#features" className="hover:text-brand-400 transition-colors">Features</a>
          <a href="#trainers" className="hover:text-brand-400 transition-colors">Trainers</a>
          <a href="#pricing" className="hover:text-brand-400 transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-brand-400 transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-brand-400 transition-colors">FAQ</a>
        </nav>

        <div>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center font-bold px-6 py-2.5 rounded-full bg-brand-400 text-slate-950 hover:bg-brand-500 transition-all text-xs tracking-wider shadow-[0_0_15px_rgba(57,255,20,0.35)]"
            >
              DASHBOARD
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center font-bold px-6 py-2.5 rounded-full border border-brand-500/30 text-brand-400 hover:border-brand-500 transition-all text-xs tracking-wider uppercase"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-brand-500/20 text-brand-400 text-[10px] font-black tracking-widest uppercase mb-6 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
            <span className="material-symbols-outlined text-xs animate-ping">circle</span>
            AI-Powered Elite Fitness
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-white uppercase">
            REDEFINE YOUR<br />
            <span className="text-brand-400 text-neon">PHYSICAL LIMITS</span><br />
            WITH AI
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-400 font-medium max-w-lg leading-relaxed">
            Elevate your metrics tracking, personalize circuits using streaming AI assistance, and monitor recovery inside a premium dark fitness ecosystem.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center font-bold px-8 py-3.5 rounded-full bg-brand-400 text-slate-950 hover:bg-brand-500 transition-all text-sm shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer"
            >
              Start Free Trial
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center font-bold px-8 py-3.5 rounded-full border border-slate-800 text-white hover:border-brand-500/50 transition-all text-sm cursor-pointer"
            >
              View Membership
            </a>
          </div>

          {/* Glowing Stats Strip */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-900 pt-8 w-full">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">4.9/5</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">App Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">97k+</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Active Athletes</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">AI Guided</p>
            </div>
          </div>
        </div>

        {/* 3D Rotating Model/Dumbbell Container */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] rounded-full bg-brand-950/5 border border-brand-500/10 blur-xl -z-10" />
          <canvas ref={canvasRef} className="w-full max-w-[500px] h-[450px] object-contain relative z-10" />
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="bg-slate-950 border-t border-slate-900 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-brand-400 uppercase">SYSTEM CAPABILITIES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-2">ELITE CAPABILITIES OF FITSYNC</h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              We leverage dynamic visualization metrics and intelligent data tracking layers to deliver structural analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-brand-500/20 transition-all text-left">
              <span className="material-symbols-outlined text-brand-400 text-3xl">smart_toy</span>
              <h3 className="text-lg font-bold text-white mt-6 mb-2">Streaming AI Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with our floating assistant to generate macro planning, correct postures, and detail workout steps instantly.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-brand-500/20 transition-all text-left">
              <span className="material-symbols-outlined text-brand-400 text-3xl">bar_chart</span>
              <h3 className="text-lg font-bold text-white mt-6 mb-2">Dynamic Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View calories, heart rate, hydration, and sleep dashboards built with interactive charts and automated tracking metrics.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-brand-500/20 transition-all text-left">
              <span className="material-symbols-outlined text-brand-400 text-3xl">music_note</span>
              <h3 className="text-lg font-bold text-white mt-6 mb-2">Workout Playlists</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep the rhythm pumping with our integrated persistent music player streaming sample mixes straight to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trainers Section */}
      <section id="trainers" className="bg-slate-950 border-t border-slate-900 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-brand-400 uppercase">EXPERT ROSTER</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-2">MEET OUR ELITE COACHES</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Marcus Steel', role: 'Strength & Power Specialist', avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&fit=crop&q=80' },
              { name: 'Elena Rostova', role: 'Cardio & Flexibility Lead', avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&fit=crop&q=80' },
              { name: 'Damian Vance', role: 'Calisthenics & Movement Coach', avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&fit=crop&q=80' }
            ].map((trainer, idx) => (
              <div key={idx} className="group rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-900 hover:border-brand-500/25 transition-all text-left">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={trainer.avatar}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
                </div>
                <div className="p-6">
                  <h4 className="text-base font-bold text-white">{trainer.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{trainer.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Matrix Section */}
      <section id="pricing" className="bg-slate-950 border-t border-slate-900 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-brand-400 uppercase">PRICING PACKAGES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-2">CHOOSE YOUR ATHLETIC PLAN</h2>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center p-1 bg-slate-900 rounded-full border border-slate-800">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
                  billingPeriod === 'monthly' ? 'bg-brand-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
                  billingPeriod === 'annual' ? 'bg-brand-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {/* Plan 1: Free */}
            <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all text-left">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Free Plan</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-xs text-slate-500 font-semibold">/mo</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-slate-400 border-t border-slate-900 pt-6">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    Workout Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    Basic Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    BMI Calculator
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-2.5 rounded-full border border-slate-800 text-center font-bold text-xs uppercase hover:bg-slate-900 transition-colors"
              >
                Choose Plan
              </Link>
            </div>

            {/* Plan 2: Discover */}
            <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all text-left">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Discover</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    ${billingPeriod === 'monthly' ? '99' : '79'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/mo</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-slate-400 border-t border-slate-900 pt-6">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    5 classes per month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    4 group class monthly
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    Online class access
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-2.5 rounded-full border border-brand-500/30 text-brand-400 text-center font-bold text-xs uppercase hover:border-brand-500 transition-all"
              >
                Upgrade
              </Link>
            </div>

            {/* Plan 3: Enterprise (Highlight) */}
            <div className="bg-slate-900 border-2 border-brand-400 p-8 rounded-2xl flex flex-col justify-between shadow-[0_0_25px_rgba(57,255,20,0.1)] relative text-left">
              <div className="absolute -top-3 right-6 bg-brand-400 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                POPULAR
              </div>
              <div>
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Enterprise</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    ${billingPeriod === 'monthly' ? '299' : '239'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/mo</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-slate-200 border-t border-slate-850 pt-6">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    10 classes per month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    8 group class monthly
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    Online class access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    E-book fitness guide
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-2.5 rounded-full bg-brand-400 text-slate-950 text-center font-bold text-xs uppercase hover:bg-brand-500 transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)]"
              >
                Upgrade
              </Link>
            </div>

            {/* Plan 4: Professional */}
            <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all text-left">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Professional</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    ${billingPeriod === 'monthly' ? '199' : '159'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/mo</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-slate-400 border-t border-slate-900 pt-6">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    7 classes per month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    6 group class monthly
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-400 text-sm">check</span>
                    Online class access
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-2.5 rounded-full border border-brand-500/30 text-brand-400 text-center font-bold text-xs uppercase hover:border-brand-500 transition-all"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section id="testimonials" className="bg-slate-950 border-t border-slate-900 py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <span className="text-xs font-black tracking-widest text-brand-400 uppercase">ATHLETE STORIES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-2">WHAT MEMBERS SAY</h2>
            <p className="text-sm text-slate-400 mt-6 leading-relaxed">
              We guide athletes on how to achieve concrete fitness gains and optimize daily habits.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-900 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-950 flex items-center justify-center font-bold text-brand-400 border border-brand-500/20">
                  KM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Klaus M.</h4>
                  <p className="text-[10px] text-slate-500 uppercase">Powerlifter</p>
                </div>
              </div>
              <div className="flex text-brand-400">
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="material-symbols-outlined text-sm">star</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
              "The AI coaching widget is surprisingly accurate with posture tips and diet summaries. It keeps my calorie intake perfectly aligned with target metrics."
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section id="faq" className="bg-slate-950 border-t border-slate-900 py-20 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-widest text-brand-400 uppercase">COMMON QUERIES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-2">FREQUENTLY ASKED QUESTIONS</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How does the AI Assistant help me?', a: 'The floating AI Coach can generate complete fitness programs, calculate macros, outline squats precautions, and details the steps of any exercise immediately.' },
              { q: 'Can I use the app offline?', a: 'Yes! FitSync is a fully supported Progressive Web App (PWA). It saves tracking metrics inside a local database cache when offline and syncs back once connection returns.' },
              { q: 'Is there a free membership option?', a: 'Absolutely! Our Free tier allows workout logging, daily metrics tracking, basic charts, and access to yoga recommendations.' }
            ].map((faq, idx) => (
              <div key={idx} className="rounded-xl bg-slate-900/40 border border-slate-900 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-white hover:bg-slate-900 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-slate-400">
                    {activeFaq === idx ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="p-5 border-t border-slate-900 text-xs text-slate-400 leading-relaxed bg-slate-950/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Premium Footer */}
      <Footer />
    </div>
  );
};
export default LandingPage;
