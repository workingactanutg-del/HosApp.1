'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminDashboard() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=admin');
      return;
    }

    const userObj = JSON.parse(localUser);
    if (userObj.role !== 'admin') {
      router.push(`/${userObj.role}/dashboard`);
      return;
    }

    setAdmin(userObj);

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard?demo=true');
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalPatients: 1284,
    totalDoctors: 18,
    totalAppointments: 42,
    totalDepartments: 6,
    bedsOccupied: '18/24',
    weeklyRevenue: '$48.2k'
  };

  const queue = dashboardData?.todayQueue || [];
  const activity = dashboardData?.recentActivity || [];
  const depts = dashboardData?.deptEfficiencies || [];

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar role="admin" activeTab="dashboard" userName={admin?.name || 'Administrator'} />

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Summary Row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Patients */}
            <div className="soft-card p-6 flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">Total Patients</p>
                <h3 className="text-primary font-bold text-3xl mt-1">{stats.totalPatients}</h3>
                <div className="flex items-center text-tertiary-fixed-dim text-xs mt-2 font-medium">
                  <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
                  <span>+4.2% from last week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
            </div>

            {/* Card 2: Appointments */}
            <div className="soft-card p-6 flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">Today's Appts</p>
                <h3 className="text-primary font-bold text-3xl mt-1">{stats.totalAppointments}</h3>
                <div className="flex items-center text-on-primary-container text-xs mt-2 font-medium">
                  <span className="material-symbols-outlined text-xs mr-1">schedule</span>
                  <span>8 pending check-ins</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">calendar_today</span>
              </div>
            </div>

            {/* Card 3: Doctors */}
            <div className="soft-card p-6 flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">Doctors Active</p>
                <h3 className="text-primary font-bold text-3xl mt-1">{stats.totalDoctors}/24</h3>
                <div className="flex items-center text-tertiary-fixed-dim text-xs mt-2 font-medium">
                  <span className="material-symbols-outlined text-xs mr-1">check_circle</span>
                  <span>6 on standby</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">medical_services</span>
              </div>
            </div>

            {/* Card 4: Revenue */}
            <div className="soft-card p-6 flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">Weekly Revenue</p>
                <h3 className="text-primary font-bold text-3xl mt-1">{stats.weeklyRevenue}</h3>
                <div className="flex items-center text-tertiary-fixed-dim text-xs mt-2 font-medium">
                  <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
                  <span>+12.5% efficiency</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
            </div>
          </section>

          {/* Central Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Today's Queue (2/3 columns wide) */}
            <div className="lg:col-span-2 soft-card overflow-hidden">
              <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
                <h4 className="text-primary font-bold text-sm">Today's Appointment Queue</h4>
                <button onClick={() => router.push('/admin/appointments')} className="text-secondary text-xs font-bold hover:underline">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Patient Name</th>
                      <th className="px-6 py-3">Time</th>
                      <th className="px-6 py-3">Assigned Doctor</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {queue.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-on-surface-variant">
                          No appointments recorded for today.
                        </td>
                      </tr>
                    ) : (
                      queue.map((row: any) => (
                        <tr key={row.id} className="hover:bg-secondary-container/5 transition-colors">
                          <td className="px-6 py-4 font-bold text-primary">{row.patient_name}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{row.time_slot}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{row.doctor_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                              row.status === 'CONFIRMED' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant' : 'bg-outline-variant/30 text-outline'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Health Insights (1/3 column wide) */}
            <div className="soft-card ai-gradient p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-on-tertiary-container">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <h4 className="text-primary font-bold text-sm">AI Administrative Insights</h4>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white border border-outline-variant/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                    <h5 className="text-primary font-bold text-xs">Critical Capacity Warning</h5>
                    <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                      Bed capacity predicted to reach <span className="font-bold text-error">95%</span> in 4 hours based on ER admission rates.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-outline-variant/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container"></div>
                    <h5 className="text-primary font-bold text-xs">Pending summaries</h5>
                    <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                      Lab reports pending for <span className="font-bold">5 patients</span> in Cardiology. AI translation explanations ready.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => router.push('/admin/analytics')}
                className="mt-6 w-full py-2 bg-primary-container text-on-primary-fixed rounded-xl text-xs font-bold hover:bg-primary-fixed transition-all"
              >
                View Logistics Analytics
              </button>
            </div>
          </section>

          {/* Bottom Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            
            {/* Department Efficiency */}
            <div className="soft-card p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-primary font-bold text-sm">Department Load Indicators</h4>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-[9px] font-bold uppercase rounded-lg">Last 7 Days</span>
              </div>
              <div className="h-48 flex items-end gap-3 px-2">
                {depts.map((d: any, idx: number) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-full bg-secondary-container/20 rounded-t-lg relative overflow-hidden h-[85%]">
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700" 
                        style={{ height: `${d.efficiency}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-bold text-on-surface-variant truncate max-w-full">{d.name.substring(0, 5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity logs */}
            <div className="soft-card p-6 space-y-4">
              <h4 className="text-primary font-bold text-sm">Recent System Activity</h4>
              <div className="space-y-4 overflow-y-auto max-h-48 pr-1 scrollbar-hide">
                {activity.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-secondary">
                      <span className="material-symbols-outlined text-sm">
                        {act.type === 'file_upload' ? 'file_upload' : act.type === 'edit' ? 'edit' : 'vpn_key'}
                      </span>
                    </div>
                    <div>
                      <p className="text-on-surface text-xs leading-relaxed">{act.text}</p>
                      <span className="text-[9px] text-outline mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
