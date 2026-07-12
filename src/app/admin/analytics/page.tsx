'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminAnalytics() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=admin');
      return;
    }
    const userObj = JSON.parse(localUser);
    setAdmin(userObj);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar role="admin" activeTab="analytics" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div>
            <h2 className="text-2xl font-bold text-primary">Hospital Insights & Analytics</h2>
            <p className="text-xs text-on-surface-variant">Review clinic capacity indices, patient growth trajectories, and operational revenue.</p>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Patient Growth Trajectory */}
            <div className="soft-card p-6 space-y-4 bg-white">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                <h4 className="font-bold text-sm text-primary">Patient Intake Growth</h4>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-[9px] font-bold uppercase rounded-lg">Monthly</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Aggregated patient registration has increased by 14% over the last quarter. Spikes correlate with new department onboarding.
              </p>
              
              {/* Simulated Line Chart */}
              <div className="h-40 flex items-end justify-between px-2 pt-4">
                {[
                  { month: 'Jan', val: 20 },
                  { month: 'Feb', val: 35 },
                  { month: 'Mar', val: 30 },
                  { month: 'Apr', val: 55 },
                  { month: 'May', val: 75 },
                  { month: 'Jun', val: 90 }
                ].map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group">
                    <div className="w-4 bg-secondary rounded-t-full transition-all duration-500 hover:bg-secondary-container" style={{ height: `${m.val}px` }}></div>
                    <span className="text-[10px] text-outline font-semibold">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Revenue Streams */}
            <div className="soft-card p-6 space-y-4 bg-white">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                <h4 className="font-bold text-sm text-primary">Weekly Revenue Efficiency</h4>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-[9px] font-bold uppercase rounded-lg">Weekly</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Consultation invoice efficiency peaked at 92% this week. Pharmacy drug sales represent 40% of standard auxiliary revenues.
              </p>
              
              {/* Simulated Progress bars */}
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-on-surface-variant mb-1">
                    <span>Clinical Consultations</span>
                    <span className="font-bold text-primary">$28.4k (59%)</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: '59%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-on-surface-variant mb-1">
                    <span>Pharmacy Drug Dispensing</span>
                    <span className="font-bold text-primary">$14.2k (30%)</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary-container h-full rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-on-surface-variant mb-1">
                    <span>Lab Diagnostic Scans</span>
                    <span className="font-bold text-primary">$5.6k (11%)</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-tertiary-fixed-dim h-full rounded-full" style={{ width: '11%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Department Load Analysis */}
            <div className="soft-card p-6 space-y-4 bg-white md:col-span-2">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                <h4 className="font-bold text-sm text-primary">Department Load Metrics</h4>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-[9px] font-bold uppercase rounded-lg">Live</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <span className="text-outline text-xs block">Cardiology</span>
                  <span className="text-xl font-extrabold text-primary mt-1 block">85%</span>
                  <span className="text-[9px] text-error font-bold uppercase tracking-wider block mt-1">High Load</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <span className="text-outline text-xs block">Emergency</span>
                  <span className="text-xl font-extrabold text-primary mt-1 block">70%</span>
                  <span className="text-[9px] text-secondary font-bold uppercase tracking-wider block mt-1">Steady</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <span className="text-outline text-xs block">Pediatrics</span>
                  <span className="text-xl font-extrabold text-primary mt-1 block">42%</span>
                  <span className="text-[9px] text-tertiary-fixed-dim font-bold uppercase tracking-wider block mt-1">Under Load</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <span className="text-outline text-xs block">Neurology</span>
                  <span className="text-xl font-extrabold text-primary mt-1 block">92%</span>
                  <span className="text-[9px] text-error font-bold uppercase tracking-wider block mt-1">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
