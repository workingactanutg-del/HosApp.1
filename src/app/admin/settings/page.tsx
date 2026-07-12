'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminSettings() {
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
      <Sidebar role="admin" activeTab="settings" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">System Configurations Settings</h2>
            <p className="text-xs text-on-surface-variant">Configure core hospital system triggers, database backup schedules, and notifications channels.</p>
          </div>

          {/* Settings panel */}
          <div className="soft-card p-6 space-y-6 bg-white">
            <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">HOSAPP System Core</h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Clinic Center Branding Name</label>
                  <input type="text" defaultValue="HOSAPP Clinic Center" className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Central Dispatch Desk Email</label>
                  <input type="email" defaultValue="dispatch@hosapp.com" className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Automated DB Backup Interval</label>
                  <select className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-on-surface">
                    <option>Daily at 12:00 AM</option>
                    <option>Weekly on Sunday</option>
                    <option>Real-Time Replica sync</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">SMTP Email Dispatch Server</label>
                  <input type="text" defaultValue="smtp.hosapp.com" className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl" />
                </div>
              </div>

              {/* Backups */}
              <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                <h4 className="font-bold text-primary">Database Backup & Security Log</h4>
                <div className="flex gap-2">
                  <button type="button" className="px-4 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all">
                    Backup Postgres Now
                  </button>
                  <button type="button" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl font-bold">
                    View Logs Audit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
