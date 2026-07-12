'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const departments = [
    { name: 'Cardiology', icon: 'favorite', floor: '2nd Floor', desc: 'Comprehensive heart care, diagnostics, and treatment.' },
    { name: 'Neurology', icon: 'psychology', floor: '3rd Floor', desc: 'Brain, spine, and neurological disorders treatment.' },
    { name: 'Emergency', icon: 'emergency', floor: '1st Floor', desc: '24/7 immediate trauma and critical care response.' },
    { name: 'Pediatrics', icon: 'child_care', floor: '2nd Floor', desc: 'Specialized medical care and wellness checkups for kids.' },
    { name: 'ENT', icon: 'hearing', floor: '1st Floor', desc: 'Ear, Nose, Throat, and head/neck surgery care.' },
    { name: 'Dermatology', icon: 'face', floor: '1st Floor', desc: 'Advanced skin treatments, allergies, and cosmetic care.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-12 w-full h-20 bg-white border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="flex items-center">
          <img src="/logo.png" alt="HOSAPP Logo" className="h-10 object-contain" />
        </div>
        
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-on-surface-variant">
          <a href="#about" className="hover:text-secondary transition-colors">About</a>
          <a href="#departments" className="hover:text-secondary transition-colors">Departments</a>
          <a href="#ai-assistant" className="hover:text-secondary transition-colors">AI Showcase</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary-container/10 rounded-lg transition-colors border border-secondary"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 text-sm font-semibold bg-secondary text-white rounded-lg hover:bg-secondary-container hover:scale-105 active:scale-95 transition-all"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 px-6 md:px-12 overflow-hidden flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-secondary-fixed text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="material-symbols-outlined text-sm text-secondary-container animate-pulse">auto_awesome</span>
            AI-Powered Healthcare Ecosystem
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            The Future of Clinical Operations & Patient Care
          </h2>
          <p className="text-on-primary-container text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            HOSAPP simplifies interactions between patients, doctors, and administrators using intelligent medical record indexing, interactive navigation, and a voice-enabled clinical assistant.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-secondary-container text-on-secondary-container rounded-xl font-bold hover:bg-secondary-container/90 transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Access Portal
            </Link>
            <Link 
              href="/register" 
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access Portal Grid */}
      <section id="about" className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-12">Portal Access Hub</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patient Card */}
          <div className="soft-card p-8 flex flex-col justify-between hover:border-secondary-container transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-2xl text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">patient_list</span>
              </div>
              <h4 className="text-xl font-bold text-primary">Patient Portal</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Book appointments, consult with our AI voice assistant, access diagnostic lab reports, and manage digital prescriptions effortlessly.
              </p>
            </div>
            <Link 
              href="/login?role=patient" 
              className="mt-6 flex items-center gap-1.5 text-secondary font-bold text-sm hover:gap-2.5 transition-all"
            >
              Patient Sign In <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="soft-card p-8 flex flex-col justify-between hover:border-secondary-container transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-2xl text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">medical_services</span>
              </div>
              <h4 className="text-xl font-bold text-primary">Doctor Portal</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Review daily patient queues, check clinical histories, issue prescriptions, log consultation diagnostics, and schedule follow-ups.
              </p>
            </div>
            <Link 
              href="/login?role=doctor" 
              className="mt-6 flex items-center gap-1.5 text-secondary font-bold text-sm hover:gap-2.5 transition-all"
            >
              Doctor Sign In <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          {/* Admin Card */}
          <div className="soft-card p-8 flex flex-col justify-between hover:border-secondary-container transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-2xl text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <h4 className="text-xl font-bold text-primary">Admin Portal</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Manage user registrations (CRUD), configure hospital department details, oversee appointment queues, and track capacity metrics.
              </p>
            </div>
            <Link 
              href="/login?role=admin" 
              className="mt-6 flex items-center gap-1.5 text-secondary font-bold text-sm hover:gap-2.5 transition-all"
            >
              Admin Sign In <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="bg-surface-container-low py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold text-primary">Specialized Departments</h3>
            <p className="text-on-surface-variant text-sm">
              State-of-the-art medical departments configured on multiple levels for efficient clinical services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-outline-variant/30 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center rounded-xl text-secondary">
                    <span className="material-symbols-outlined text-2xl">{dept.icon}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-lg">
                    {dept.floor}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-primary mb-2">{dept.name}</h4>
                <p className="text-on-surface-variant text-xs leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Voice Assistant Showcase */}
      <section id="ai-assistant" className="ai-gradient py-20 px-6 md:px-12 border-y border-outline-variant/20">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          <div className="space-y-6 md:w-1/2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-on-tertiary-container/10 text-on-tertiary-container text-[10px] font-bold uppercase tracking-widest rounded-lg">
              <span className="material-symbols-outlined text-sm">mic</span>
              AI VOICE INTERACTION
            </span>
            <h3 className="text-3xl font-extrabold text-primary leading-tight">
              A True Hands-Free Clinical Assistant
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Experience the core innovation of HOSAPP. Instead of navigating menus, patients and clinicians can interact naturally with our voice assistant. Say commands like:
            </p>
            <ul className="space-y-3 text-sm font-medium text-on-surface">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                "I have chest pain" → Suggests Cardiologists and opens booking
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                "Read my prescription" → Explains dosage & medicine safety info
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                "Take me to Pharmacy" → Highlights target on interactive map
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Visual Chat Demo Representation */}
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-outline-variant p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white animate-pulse">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
                <div>
                  <p className="font-bold text-sm">HOSAPP Voice Assistant</p>
                  <p className="text-[10px] text-tertiary-fixed-dim font-bold">Listening...</p>
                </div>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-end">
                  <div className="bg-secondary-container/20 text-on-secondary-container rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                    "Take me to Pharmacy"
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-surface-container text-on-surface rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] space-y-1">
                    <p className="font-semibold text-secondary">Assistant:</p>
                    <p>Highlighting the Pharmacy on the hospital map. It is located on the 1st Floor, next to Reception.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <div className="flex-1 bg-surface-container-low rounded-xl py-2 px-4 text-xs text-outline flex items-center justify-between">
                  <span>Speak now...</span>
                  <span className="material-symbols-outlined text-sm">mic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-on-primary-container py-12 px-6 md:px-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-2xl">local_hospital</span>
            <span className="font-bold text-white tracking-wide">HOSAPP</span>
            <span className="text-xs">© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
