'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminAppointments() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reassignment Modal State
  const [selectedApptId, setSelectedApptId] = useState<string>('');
  const [newDoctorId, setNewDoctorId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const apptRes = await fetch('/api/admin/appointments');
      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data);
      }
      
      const docRes = await fetch('/api/doctors');
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData);
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
      router.push('/login?role=admin');
      return;
    }
    const userObj = JSON.parse(localUser);
    setAdmin(userObj);

    loadData();
  }, [router]);

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptId || !newDoctorId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/appointments/${selectedApptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          doctorId: newDoctorId
        })
      });

      if (!res.ok) throw new Error('Failed to reassign doctor');
      
      setSelectedApptId('');
      setNewDoctorId('');
      loadData();
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
      <Sidebar role="admin" activeTab="appointments" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div>
            <h2 className="text-2xl font-bold text-primary">Clinic Appointments Oversight</h2>
            <p className="text-xs text-on-surface-variant">View all booking sessions, manually reschedule slots, or reassign doctors.</p>
          </div>

          {/* List Table */}
          <div className="soft-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Assigned Doctor</th>
                    <th className="px-6 py-3">Schedule Time</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-on-surface-variant">
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-secondary-container/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">{appt.patient_name}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{appt.doctor_name} ({appt.specialization})</td>
                        <td className="px-6 py-4 font-semibold text-secondary">
                          {new Date(appt.date).toLocaleDateString()} • {appt.time_slot}
                        </td>
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
                                  className="px-2.5 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant hover:opacity-90 font-bold rounded-lg transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'REJECTED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1.5 bg-error-container text-error hover:opacity-90 font-bold rounded-lg transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                              <button
                                onClick={() => setSelectedApptId(appt.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-lg flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-xs">supervisor_account</span>
                                Reassign
                              </button>
                            )}

                            {['CONFIRMED', 'PENDING', 'IN_PROGRESS'].includes(appt.status) && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1.5 text-error hover:bg-error-container/20 rounded-lg font-bold flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-xs">cancel</span>
                                Cancel
                              </button>
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

      {/* Reassignment Modal */}
      {selectedApptId && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <form onSubmit={handleReassignDoctor} className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant space-y-4 animate-zoomIn">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
              <h3 className="font-bold text-primary text-sm">Reassign Consultant Doctor</h3>
              <button 
                type="button"
                onClick={() => setSelectedApptId('')}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Choose Doctor</label>
              <select
                required
                value={newDoctorId}
                onChange={(e) => setNewDoctorId(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApptId('')}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
              >
                {actionLoading ? 'Assigning...' : 'Reassign Doctor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
