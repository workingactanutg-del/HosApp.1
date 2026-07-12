'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

function AppointmentsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async (docId: string, token: string) => {
    try {
      const res = await fetch(`/api/doctor/dashboard?doctor_id=${docId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

    setDoctor(userObj);
    loadData(userObj.id, userObj.token);

    // Read initial status filter if provided
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilter(statusParam.toUpperCase());
    }
  }, [router, searchParams]);

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctor.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      // Refresh
      loadData(doctor.id, doctor.token);
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

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

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
      <Sidebar role="doctor" activeTab="appointments" userName={doctor?.name || 'Doctor'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={doctor?.name || 'Doctor'} role="doctor" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">All Clinical Appointments</h2>
              <p className="text-xs text-on-surface-variant">Track your appointment ledger and schedule checkups.</p>
            </div>
          </div>

          {/* List Table */}
          <div className="soft-card overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-outline-variant/30 flex gap-2 overflow-x-auto scrollbar-hide">
              {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    filter === tab
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Gender / Blood</th>
                    <th className="px-6 py-3">Time Slot</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                        No appointments found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-secondary-container/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">{appt.patient_name}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{appt.gender} • Blood {appt.blood_group}</td>
                        <td className="px-6 py-4 font-semibold text-secondary">{appt.time_slot}</td>
                        <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">{appt.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${getStatusBadge(appt.status)}`}>
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

                            {['CONFIRMED', 'PENDING', 'IN_PROGRESS'].includes(appt.status) && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-error hover:bg-error-container/20 rounded-lg font-semibold flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                Cancel
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

export default function DoctorAppointments() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <AppointmentsListContent />
    </Suspense>
  );
}
