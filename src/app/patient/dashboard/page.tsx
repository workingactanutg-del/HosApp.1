'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function PatientDashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [latestRecord, setLatestRecord] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch user from localStorage
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=patient');
      return;
    }

    const userObj = JSON.parse(localUser);
    if (userObj.role !== 'patient') {
      router.push(`/${userObj.role}/dashboard`);
      return;
    }

    // 2. Load dashboard data from API
    const loadDashboardData = async () => {
      try {
        const res = await fetch(`/api/patient/dashboard?patient_id=${userObj.id}`, {
          headers: {
            'Authorization': `Bearer ${userObj.token}`
          }
        });
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        
        setPatient(data.patient);
        setUpcomingAppointment(data.upcomingAppointment);
        setLatestRecord(data.latestRecord);
        setPrescriptions(data.prescriptions);
        setNotifications(data.notifications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  // Handle voice actions
  const handleAIAction = (action: string, data: any) => {
    if (action === 'HIGHLIGHT_MAP' && data.target) {
      router.push(`/patient/map?target=${data.target}`);
    } else if (action === 'BOOK_APPOINTMENT') {
      router.push(`/patient/appointments?book=true&doctorId=${data.doctorId}`);
    } else if (action === 'READ_PRESCRIPTION') {
      router.push('/patient/records?tab=prescriptions');
    } else if (action === 'SHOW_REPORTS') {
      router.push('/patient/records?tab=reports');
    } else if (action === 'CALL_EMERGENCY') {
      alert('Mock Emergency assistance is on the way!');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider">Loading Patient Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar role="patient" activeTab="dashboard" userName={patient?.full_name || 'Patient'} />

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header 
          userName={patient?.full_name || 'Patient'} 
          role="patient"
          onActionTriggered={handleAIAction}
        />

        {/* Dashboard Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Welcome Banner */}
          <section className="bg-primary text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[160px] shadow-sm">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-secondary-container/20 to-transparent pointer-events-none"></div>
            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-1 bg-white/10 text-secondary-fixed text-[10px] font-bold uppercase rounded-lg tracking-wider">
                Patient Account Verified
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome Back, {patient?.full_name || 'Patient'}!
              </h2>
              <p className="text-on-primary-container text-xs max-w-xl">
                Check upcoming diagnostic visits, review clinical notes from Dr. Jenkins, or speak with our AI Assistant to book appointments or search records hands-free.
              </p>
            </div>
          </section>

          {/* Central Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side (2 columns wide) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Appointment Widget */}
              <div className="soft-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <p className="text-on-surface-variant font-label-sm uppercase tracking-wider text-xs">Upcoming Appointment</p>
                  {upcomingAppointment ? (
                    <div>
                      <h3 className="text-lg font-bold text-primary">{upcomingAppointment.doctor_name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">medical_services</span>
                        Cardiology Dept • Room {upcomingAppointment.room_number}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-secondary font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          {new Date(upcomingAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-secondary font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {upcomingAppointment.time_slot}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant">No upcoming appointments scheduled.</p>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {upcomingAppointment ? (
                    <>
                      <button 
                        onClick={() => router.push(`/patient/map?target=Cardiology`)}
                        className="flex-1 md:flex-none px-4 py-2 bg-surface-container hover:bg-surface-container-high text-xs font-bold rounded-xl transition-all"
                      >
                        Find Room Map
                      </button>
                      <button 
                        onClick={() => router.push('/patient/appointments')}
                        className="flex-1 md:flex-none px-4 py-2 bg-secondary text-white hover:bg-secondary-container text-xs font-bold rounded-xl transition-all"
                      >
                        Reschedule
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => router.push('/patient/appointments?book=true')}
                      className="w-full md:w-auto px-6 py-2.5 bg-secondary text-white hover:bg-secondary-container text-xs font-bold rounded-xl transition-all shadow"
                    >
                      Book Appointment Now
                    </button>
                  )}
                </div>
              </div>

              {/* Health Metrics & Records Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Summary Card */}
                <div className="soft-card p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                    <h4 className="font-bold text-sm text-primary">Health Summary</h4>
                    <span className="material-symbols-outlined text-secondary text-sm">badge</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-on-surface-variant font-medium">Blood Group</p>
                      <p className="font-bold text-primary mt-0.5">{patient?.blood_group || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-medium">Insurance Provider</p>
                      <p className="font-bold text-primary mt-0.5">{patient?.insurance_provider || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-on-surface-variant font-medium">Emergency Contact</p>
                      <p className="font-bold text-primary mt-0.5">{patient?.emergency_contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Latest Records / Diagnosis Card */}
                <div className="soft-card p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                    <h4 className="font-bold text-sm text-primary">Latest Diagnosis</h4>
                    <span className="material-symbols-outlined text-secondary text-sm">assignment_ind</span>
                  </div>
                  {latestRecord ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-bold text-primary">{latestRecord.diagnosis}</p>
                        <p className="text-on-surface-variant mt-1 leading-relaxed truncate">{latestRecord.notes}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-outline">By {latestRecord.doctor_name}</span>
                        <button 
                          onClick={() => router.push('/patient/records')}
                          className="text-[10px] text-secondary font-bold hover:underline"
                        >
                          View Full History
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant py-4">No diagnosis logs found.</p>
                  )}
                </div>
              </div>

              {/* Active Prescriptions Widget */}
              <div className="soft-card p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                  <h4 className="font-bold text-sm text-primary">Active Prescriptions Preview</h4>
                  <button 
                    onClick={() => router.push('/patient/records')}
                    className="text-xs text-secondary font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                {prescriptions.length > 0 ? (
                  <div className="divide-y divide-outline-variant/30">
                    {prescriptions.slice(0, 2).map((item, index) => (
                      <div key={index} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-primary">{item.medicine_name}</p>
                          <p className="text-on-surface-variant mt-0.5">{item.dosage} • {item.frequency} • {item.duration}</p>
                        </div>
                        <span className="px-2 py-1 bg-surface-container text-on-surface-variant font-bold text-[9px] rounded-lg">
                          Dr. Jenkins
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant py-4 text-center">No prescriptions found.</p>
                )}
              </div>
            </div>

            {/* Right side (1 column wide) - AI Insights & Notifications */}
            <div className="space-y-6">
              {/* AI Insights Card */}
              <div className="soft-card ai-gradient p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-tertiary-container">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <h4 className="font-bold text-sm">AI Health Insights</h4>
                  </div>
                  
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                      <p className="font-semibold text-primary">Lisinopril Instructions Explained</p>
                      <p className="text-on-surface-variant mt-1 text-[11px]">
                        Your prescription of Lisinopril is for hypertension. Avoid excessive potassium-rich foods or salt substitutes without consulting your doctor.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-fixed-dim"></div>
                      <p className="font-semibold text-primary">ECG Summary Ready</p>
                      <p className="text-on-surface-variant mt-1 text-[11px]">
                        The ECG test done on June 10 shows normal sinus rhythm. Click to let AI voice assistant read the detailed medical terminology.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleAIAction('READ_PRESCRIPTION', {})}
                  className="mt-6 w-full py-2 bg-primary-container text-on-primary-fixed rounded-xl text-xs font-bold hover:bg-primary-fixed transition-all"
                >
                  Analyze Medications
                </button>
              </div>

              {/* Notifications Widget */}
              <div className="soft-card p-6 space-y-4">
                <h4 className="font-bold text-sm text-primary">Recent System Activity</h4>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex gap-3 text-xs">
                      <span className="material-symbols-outlined text-secondary shrink-0 text-sm mt-0.5">
                        {n.title.includes('Confirm') ? 'event_available' : 'notifications'}
                      </span>
                      <div>
                        <p className="font-bold text-primary">{n.title}</p>
                        <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-outline mt-1 block">
                          {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-on-surface-variant text-center py-4">No recent logs.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
