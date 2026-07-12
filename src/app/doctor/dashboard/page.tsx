'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

function DoctorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalToday: 0, pendingToday: 0, confirmedToday: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=doctor');
      return;
    }

    const userObj = JSON.parse(localUser);
    if (userObj.role !== 'doctor') {
      router.push(`/${userObj.role}/dashboard`);
      return;
    }

    // Check emergency parameter
    if (searchParams.get('emergency') === 'true') {
      setEmergencyAlert(true);
    }

    const loadDashboard = async () => {
      try {
        const res = await fetch(`/api/doctor/dashboard?doctor_id=${userObj.id}`, {
          headers: {
            'Authorization': `Bearer ${userObj.token}`
          }
        });
        if (!res.ok) throw new Error('Failed to load dashboard');
        const data = await res.json();
        
        setDoctor(data.doctor);
        setAppointments(data.appointments);
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router, searchParams]);

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const localUser = localStorage.getItem('hosapp_user');
      const token = localUser ? JSON.parse(localUser).token : '';

      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Refresh list
      const localUserObj = JSON.parse(localUser || '{}');
      const refreshRes = await fetch(`/api/doctor/dashboard?doctor_id=${localUserObj.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const refreshData = await refreshRes.json();
      setAppointments(refreshData.appointments);
      setStats(refreshData.stats);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant';
      case 'PENDING':
        return 'bg-outline-variant/30 text-outline';
      case 'IN_PROGRESS':
        return 'bg-secondary-container/20 text-on-secondary-container animate-pulse';
      case 'CANCELLED':
        return 'bg-error-container text-error';
      case 'COMPLETED':
        return 'bg-primary-fixed text-primary';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

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
      <Sidebar role="doctor" activeTab="dashboard" userName={doctor?.full_name || 'Doctor'} />

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={doctor?.full_name || 'Doctor'} role="doctor" />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Emergency trauma warning */}
          {emergencyAlert && (
            <div className="bg-error text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-bounce">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl animate-pulse">emergency</span>
                <div className="text-xs">
                  <p className="font-bold uppercase tracking-wider">Critical Emergency trauma</p>
                  <p className="font-medium mt-0.5">Cardiac arrest patient inbound. Prepare room {doctor?.room_number || 'Trauma Bay 1'}.</p>
                </div>
              </div>
              <button 
                onClick={() => setEmergencyAlert(false)} 
                className="px-3 py-1 bg-white text-error font-bold text-[10px] uppercase rounded-lg hover:bg-error-container/20 hover:text-white"
              >
                Dismiss Alert
              </button>
            </div>
          )}

          {/* Welcome and stats */}
          <div>
            <h2 className="text-2xl font-bold text-primary">Doctor Consultations Console</h2>
            <p className="text-xs text-on-surface-variant">Review today's clinical schedules, handle pending requests, and log consult notes.</p>
          </div>

          {/* Statistics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="soft-card p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Today's Appointments</p>
                <h3 className="text-2xl font-bold text-primary mt-1">{stats.totalToday}</h3>
              </div>
              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">event</span>
              </div>
            </div>
            
            <div className="soft-card p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Pending Approvals</p>
                <h3 className="text-2xl font-bold text-error mt-1">{stats.pendingToday}</h3>
              </div>
              <div className="w-10 h-10 bg-error-container rounded-xl flex items-center justify-center text-error">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>

            <div className="soft-card p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Confirmed & Active</p>
                <h3 className="text-2xl font-bold text-on-tertiary-container mt-1">{stats.confirmedToday}</h3>
              </div>
              <div className="w-10 h-10 bg-tertiary-container/30 rounded-xl flex items-center justify-center text-on-tertiary-container">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>

            <div className="soft-card p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Unique Patients Base</p>
                <h3 className="text-2xl font-bold text-primary mt-1">{stats.totalPatients}</h3>
              </div>
              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
          </section>

          {/* Today's Queue */}
          <div className="soft-card overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-white">
              <h4 className="font-bold text-sm text-primary">Today's Appointment Queue</h4>
              <span className="px-2 py-0.5 bg-surface-container text-outline text-[9px] font-bold uppercase rounded-lg">
                Date: {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Schedule Slot</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-xs">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                        No appointments scheduled for today.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-secondary-container/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary font-bold flex items-center justify-center text-[11px]">
                              {appt.patient_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-primary">{appt.patient_name}</p>
                              <p className="text-[10px] text-on-surface-variant">{appt.gender} • Blood {appt.blood_group}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-secondary">{appt.time_slot}</td>
                        <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">{appt.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {appt.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant hover:opacity-90 font-bold rounded-lg transition-all"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'REJECTED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 bg-error-container text-error hover:opacity-90 font-bold rounded-lg transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {['CONFIRMED', 'IN_PROGRESS'].includes(appt.status) && (
                              <button
                                onClick={() => router.push(`/doctor/consultation?patientId=${appt.patient_id}&appointmentId=${appt.id}&patientName=${encodeURIComponent(appt.patient_name)}`)}
                                className="px-3 py-1.5 bg-secondary text-white hover:bg-secondary-container font-bold rounded-lg flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-xs">edit_document</span>
                                Start Consult
                              </button>
                            )}
                            {appt.status === 'COMPLETED' && (
                              <span className="text-[10px] text-outline font-semibold uppercase tracking-wider flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-on-tertiary-container">done</span>
                                Consult Done
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <DoctorDashboardContent />
    </Suspense>
  );
}
