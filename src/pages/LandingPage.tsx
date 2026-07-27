import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* 1. Compact Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2">
          {/* dumbbell icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#FF9A3D] flex items-center justify-center">
            <span className="material-symbols-outlined text-white font-bold text-2xl">fitness_center</span>
          </div>
          <span className="text-xl font-black tracking-wider text-white">FITSYNC</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#about" className="hover:text-white transition-colors">About Us</a>
          <a href="#program" className="hover:text-white transition-colors">Program</a>
          <a href="#membership" className="hover:text-white transition-colors">Membership</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </nav>

        <div>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center font-bold px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF5A00] to-[#FF9A3D] text-white hover:opacity-90 active:scale-95 transition-all text-xs tracking-wider"
            >
              DASHBOARD
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center font-bold px-6 py-2.5 rounded-full bg-[#FF5A00] hover:bg-[#FF8C32] text-white active:scale-95 transition-all text-xs tracking-wider uppercase"
            >
              Sign Up
            </Link>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side Content */}
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white uppercase">
            GET HEALTHY BODY<br />
            WITH THE PERFECT<br />
            EXERCISES
          </h1>

          <p className="mt-6 text-sm sm:text-base text-gray-400 font-medium max-w-lg leading-relaxed">
            We are always there to help you to make a healthy body and mind through the power of fitness.
          </p>

          <div className="mt-8 w-full flex justify-center lg:justify-start">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center font-bold px-10 py-3.5 rounded-full bg-[#FF5A00] hover:bg-[#FF8C32] text-white active:scale-95 transition-all text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 flex items-center gap-8 border-t border-gray-900 pt-8 w-full">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">105+</p>
              <p className="text-xxs sm:text-xs text-gray-500 font-bold uppercase mt-1">Expert Trainers</p>
            </div>
            <div className="h-8 w-px bg-gray-900" />
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">970+</p>
              <p className="text-xxs sm:text-xs text-gray-500 font-bold uppercase mt-1">Member Joined</p>
            </div>
            <div className="h-8 w-px bg-gray-900" />
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">135+</p>
              <p className="text-xxs sm:text-xs text-gray-500 font-bold uppercase mt-1">Fitness Programs</p>
            </div>
          </div>
        </div>

        {/* Right Side Trainer Image with Floating Cards */}
        <div className="relative flex justify-center items-center">
          <div className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#FF5A00]/10 to-transparent absolute -z-10 blur-xl" />
          <img
            src="/trainers_hero.jpg"
            alt="Fitness Trainers"
            className="w-full max-w-[450px] object-contain rounded-3xl"
          />
          {/* Floating Info Card */}
          <div className="absolute bottom-6 left-2 sm:left-6 p-4 bg-[#1D1D1D]/90 border border-gray-800 rounded-2xl flex flex-col gap-1.5 shadow-2xl backdrop-blur-md text-left">
            <span className="text-gray-400 text-xxs font-bold uppercase">Today's Calories</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">150 Cal</span>
              <span className="text-[#22C55E] text-xxs font-bold">+10% This week</span>
            </div>
            <div className="flex gap-1 items-end h-8 mt-1">
              <div className="w-1.5 h-3 bg-gray-800 rounded-sm" />
              <div className="w-1.5 h-5 bg-[#FF5A00] rounded-sm" />
              <div className="w-1.5 h-8 bg-[#FF5A00] rounded-sm" />
              <div className="w-1.5 h-4 bg-gray-800 rounded-sm" />
              <div className="w-1.5 h-6 bg-[#FF5A00] rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trusted Partners Logo Strip */}
      <section className="bg-[#151515] py-8 border-y border-gray-900 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-extrabold text-white">970K+ More</h3>
            <p className="text-xs text-gray-500 font-semibold uppercase mt-0.5">Trusted Companies Partner</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-400 font-black tracking-widest text-lg">
            <span className="hover:text-white transition-colors">videoask</span>
            <span className="hover:text-white transition-colors">HubSpot</span>
            <span className="hover:text-white transition-colors">mapbox</span>
          </div>
        </div>
      </section>

      {/* 4. About Us Section */}
      <section id="about" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Image */}
        <div className="relative flex justify-center">
          <div className="relative rounded-[2rem] overflow-hidden max-w-[420px] w-full border border-gray-900 shadow-2xl">
            <img
              src="/battle_ropes.jpg"
              alt="Elite Battle Ropes Training"
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-[#FF5A00] text-white px-4 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold shadow-lg">
              <span className="material-symbols-outlined text-sm">school</span>
              Professional Trainer
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex flex-col items-start text-left">
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase">
            Get Ready To Reach<br />Your Fitness Goals
          </h2>
          <p className="mt-6 text-sm sm:text-base text-gray-400 leading-relaxed font-medium">
            We are a gym that is committed to help people reach their fitness goals. We offer a variety of theirs programs and services to fit your needs, whether you are a experienced athlete.
          </p>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed font-medium">
            We believe that everyone should have access to the benefits of exercise make it happen.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center justify-center font-bold px-8 py-3.5 rounded-full bg-[#FF5A00] hover:bg-[#FF8C32] text-white active:scale-95 transition-all text-sm"
          >
            Free Trial Today
          </Link>
        </div>
      </section>

      {/* 5. Programs Section */}
      <section id="program" className="bg-[#151515]/30 py-20 border-t border-gray-950 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase max-w-md text-left">
              The Best Programs We Offers For You
            </h2>
            <p className="text-sm text-gray-400 font-medium max-w-md text-left md:text-right leading-relaxed">
              We offer a wide range of comprehensive fitness programs designed to cater to individuals of all fitness levels. Our aim to help you achieve specific goals & maximize results.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Strength Training', icon: 'fitness_center', text: 'Our trainers will design that is progressive workout plans that help achieve strength.', active: false },
              { title: 'Basic Yoga', icon: 'self_improvement', text: 'This program combines yoga to stretch & strength training to help lose weight & fitness.', active: false },
              { title: 'Body Building', icon: 'sports_martial_arts', text: 'For those looking to increase strength build lean muscle our strength & muscle.', active: true },
              { title: 'Weight Loss', icon: 'directions_run', text: 'Our weight loss programs are designed to help you make sustainable lifestyle changes.', active: false }
            ].map((prog, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl border text-left flex flex-col justify-between h-72 transition-all hover:scale-102 ${
                  prog.active
                    ? 'bg-[#FF5A00] border-transparent text-white shadow-xl shadow-[#FF5A00]/20'
                    : 'bg-[#1D1D1D] border-gray-900 text-gray-300'
                }`}
              >
                <div>
                  <span className={`material-symbols-outlined text-4xl p-2 rounded-xl ${prog.active ? 'bg-white/20' : 'bg-[#252525] text-[#FF5A00]'}`}>
                    {prog.icon}
                  </span>
                  <h3 className="text-xl font-bold mt-6 mb-3">{prog.title}</h3>
                  <p className={`text-xs leading-relaxed ${prog.active ? 'text-white/95' : 'text-gray-400'}`}>
                    {prog.text}
                  </p>
                </div>
                <button className={`inline-flex items-center text-xs font-black tracking-wider uppercase mt-4 gap-1 ${prog.active ? 'text-white' : 'text-[#FF5A00]'}`}>
                  Learn More
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-start text-left">
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase">
            Why Should People Choose<br />FitSync Services
          </h2>

          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#FF5A00] bg-[#FF5A00]/10 p-1.5 rounded-full text-base">check</span>
              <div>
                <h4 className="text-base font-bold text-white">Personal Training</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Our personal trainers can help you create a personalized fitness plan and track your progress.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#FF5A00] bg-[#FF5A00]/10 p-1.5 rounded-full text-base">check</span>
              <div>
                <h4 className="text-base font-bold text-white">Expert Trainer</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Our gym is proud to offer a team of highly skilled and certified trainer help achieve your health & fitness.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#FF5A00] bg-[#FF5A00]/10 p-1.5 rounded-full text-base">check</span>
              <div>
                <h4 className="text-base font-bold text-white">Flexible Time</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">There are many fitness classes that are offered during off-peak hours, such as early morning or late evening.</p>
              </div>
            </div>
          </div>

          <Link
            to="/signup"
            className="mt-10 inline-flex items-center justify-center font-bold px-8 py-3.5 rounded-full bg-[#FF5A00] hover:bg-[#FF8C32] text-white active:scale-95 transition-all text-sm"
          >
            Join Today
          </Link>
        </div>

        {/* Right Circular Photo Container with Badges */}
        <div className="relative flex justify-center items-center">
          <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border-2 border-dashed border-[#FF5A00]/30 absolute -z-10" />
          <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full overflow-hidden bg-[#151515]">
            <img
              src="/athlete_pose.jpg"
              alt="Athlete Pose"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Badge 1 (Heart Rate) */}
          <div className="absolute top-10 right-0 sm:right-6 p-3 bg-[#1D1D1D]/90 border border-gray-800 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md text-left">
            <span className="material-symbols-outlined text-red-500 text-3xl animate-pulse">favorite</span>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Heart Rate</p>
              <p className="text-sm font-black text-white">70 bpm</p>
            </div>
          </div>

          {/* Floating Badge 2 (Fat Burning) */}
          <div className="absolute bottom-10 left-0 sm:left-6 p-3 bg-[#1D1D1D]/90 border border-gray-800 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md text-left">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF5A00] flex items-center justify-center text-white text-[10px] font-black">
              24%
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Fat Burning</p>
              <p className="text-sm font-black text-white">24%</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section id="membership" className="bg-[#151515]/30 py-20 border-t border-gray-950 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Choose The Best Plan</h2>
            <p className="mt-4 text-sm text-gray-400 font-medium leading-relaxed">
              Choose a plan that's right for your growing team. Simple pricing & no hidden charges.
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="mt-8 inline-flex items-center p-1 bg-[#1D1D1D] rounded-full border border-gray-800">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all uppercase ${billingPeriod === 'monthly' ? 'bg-[#FF5A00] text-white' : 'text-gray-400'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all uppercase ${billingPeriod === 'annual' ? 'bg-[#FF5A00] text-white' : 'text-gray-400'}`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#1D1D1D] border border-gray-900 p-8 rounded-3xl text-left flex flex-col justify-between transition-all hover:scale-102">
              <div>
                <span className="text-xxs font-black uppercase text-gray-500 tracking-widest">Free</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-xs text-gray-500 font-semibold uppercase">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-gray-400 font-semibold border-t border-gray-900 pt-6">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    Workout Tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    Basic Analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    BMI Calculator
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    Daily Activity Tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    Community Access
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-center font-bold px-6 py-3 rounded-full border border-gray-800 text-white hover:bg-gray-800 transition-colors text-xs uppercase"
                >
                  Choose Plan
                </Link>
              </div>
            </div>

            {/* Paid Plan 1 (Discover) */}
            <div className="bg-[#1D1D1D] border border-gray-900 p-8 rounded-3xl text-left flex flex-col justify-between transition-all hover:scale-102">
              <div>
                <span className="text-xxs font-black uppercase text-gray-500 tracking-widest">Discover</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${billingPeriod === 'monthly' ? '99' : '79'}</span>
                  <span className="text-xs text-gray-500 font-semibold uppercase">/ Per Month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-gray-400 font-semibold border-t border-gray-900 pt-6">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    5 classes per month
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    4 group class monthly
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    Online class access
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    E-book fitness guide
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-center font-bold px-6 py-3 rounded-full border-2 border-[#FF5A00] text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white transition-colors text-xs uppercase shadow-md shadow-[#FF5A00]/15"
                >
                  Upgrade
                </Link>
              </div>
            </div>

            {/* Paid Plan 2 (Highlighted Enterprise) */}
            <div className="bg-[#FF5A00] p-8 rounded-3xl text-left flex flex-col justify-between transition-all hover:scale-102 shadow-xl shadow-[#FF5A00]/20 relative">
              <div>
                <span className="text-xxs font-black uppercase text-white/80 tracking-widest">Enterprise</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${billingPeriod === 'monthly' ? '299' : '239'}</span>
                  <span className="text-xs text-white/85 font-semibold uppercase">/ Per Month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-white/95 font-semibold border-t border-white/20 pt-6">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                    10 classes per month
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                    8 group class monthly
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                    Online class access
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                    E-book fitness guide
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                    7 days fitness training
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-center font-bold px-6 py-3 rounded-full bg-white text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white transition-colors text-xs uppercase shadow-lg shadow-white/30"
                >
                  Upgrade
                </Link>
              </div>
            </div>

            {/* Paid Plan 3 (Professional) */}
            <div className="bg-[#1D1D1D] border border-gray-900 p-8 rounded-3xl text-left flex flex-col justify-between transition-all hover:scale-102">
              <div>
                <span className="text-xxs font-black uppercase text-gray-500 tracking-widest">Professional</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${billingPeriod === 'monthly' ? '199' : '159'}</span>
                  <span className="text-xs text-gray-500 font-semibold uppercase">/ Per Month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-gray-400 font-semibold border-t border-gray-900 pt-6">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    7 classes per month
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    6 group class monthly
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    Online class access
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FF5A00] text-sm">check_circle</span>
                    E-book fitness guide
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-center font-bold px-6 py-3 rounded-full border-2 border-[#FF5A00] text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white transition-colors text-xs uppercase shadow-md shadow-[#FF5A00]/15"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side Quote header */}
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF5A00]">Testimonial</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase mt-2">
            What Our Happy Clients<br />Say About Us
          </h2>
          <p className="mt-6 text-sm text-gray-400 max-w-md leading-relaxed font-medium">
            I've been a member of Fitness for about 6 months now and absolutely love it. The trainers are so motivate and they really help to reach fitness goals.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-[#0B0B0B] flex items-center justify-center text-xxs font-bold text-white">JD</div>
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-[#0B0B0B] flex items-center justify-center text-xxs font-bold text-white">KM</div>
              <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-[#0B0B0B] flex items-center justify-center text-xxs font-bold text-white">AS</div>
            </div>
            <div className="text-left">
              <div className="flex items-center text-amber-500 text-xs">
                <span className="material-symbols-outlined text-sm font-black">star</span>
                <span className="ml-1 text-sm font-bold text-white">4.9</span>
                <span className="ml-1 text-gray-500 font-semibold text-xs">(450 Reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-gray-500 border-t border-gray-900 pt-6 w-full">
            <span className="material-symbols-outlined text-sm text-amber-500">star</span>
            <span>Trustpilot</span>
          </div>
        </div>

        {/* Right testimonial box */}
        <div className="p-8 bg-[#1D1D1D] rounded-3xl border border-gray-900 text-left relative flex flex-col justify-between h-64">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-[#FF5A00]">
                FR
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Farhan R.</h4>
                <p className="text-xxs text-gray-500 font-semibold uppercase mt-0.5">Happy Customer</p>
              </div>
            </div>
            <div className="flex items-center text-amber-500 text-xs gap-0.5">
              <span className="material-symbols-outlined text-sm font-black">star</span>
              <span className="material-symbols-outlined text-sm font-black">star</span>
              <span className="material-symbols-outlined text-sm font-black">star</span>
              <span className="material-symbols-outlined text-sm font-black">star</span>
              <span className="material-symbols-outlined text-sm font-black">star</span>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed mt-4">
            "I've been coming to this gym for 3 years now and I've never been in better shape. The trainers are amazing and they always push me to my best. I'm so glad to join this gym."
          </p>

          <div className="flex items-center gap-2 self-end mt-4">
            <button className="w-7 h-7 rounded-full border border-gray-800 hover:border-gray-700 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded-full border border-[#FF5A00] bg-[#FF5A00] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. Premium Footer */}
      <Footer />
    </div>
  );
};
export default LandingPage;


