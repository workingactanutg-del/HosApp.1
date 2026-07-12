'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  
  // Booking Form State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Slots Mock Data (since doctors hold slots JSON)
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=patient');
      return;
    }

    const userObj = JSON.parse(localUser);
    setPatient(userObj);

    // Read query params (e.g. ?book=true&doctorId=xyz)
    const bookParam = searchParams.get('book');
    const doctorIdParam = searchParams.get('doctorId');
    if (bookParam === 'true') {
      setShowBookingForm(true);
      if (doctorIdParam) {
        setSelectedDoctor(doctorIdParam);
      }
    }

    const loadData = async () => {
      try {
        // Fetch appointments
        const apptRes = await fetch(`/api/patient/appointments?patient_id=${userObj.id}`, {
          headers: { 'Authorization': `Bearer ${userObj.token}` }
        });
        const apptData = await apptRes.json();
        setAppointments(apptData);

        // Fetch doctors
        const docRes = await fetch('/api/doctors');
        const docData = await docRes.json();
        setDoctors(docData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, searchParams]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/patient/appointments?patient_id=${patient.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient.token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          date: selectedDate,
          timeSlot: selectedSlot,
          reason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book appointment');

      setSuccessMsg('Appointment requested successfully! Pending approval.');
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedSlot('');
      setReason('');
      setShowBookingForm(false);

      // Refresh list
      const apptRes = await fetch(`/api/patient/appointments?patient_id=${patient.id}`, {
        headers: { 'Authorization': `Bearer ${patient.token}` }
      });
      const apptData = await apptRes.json();
      setAppointments(apptData);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient.token}`
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (!res.ok) throw new Error('Failed to cancel appointment');

      // Refresh list
      const apptRes = await fetch(`/api/patient/appointments?patient_id=${patient.id}`, {
        headers: { 'Authorization': `Bearer ${patient.token}` }
      });
      const apptData = await apptRes.json();
      setAppointments(apptData);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAIAction = (action: string, data: any) => {
    if (action === 'HIGHLIGHT_MAP' && data.target) {
      router.push(`/patient/map?target=${data.target}`);
    } else if (action === 'BOOK_APPOINTMENT') {
      setShowBookingForm(true);
      if (data.doctorId) setSelectedDoctor(data.doctorId);
    } else if (action === 'READ_PRESCRIPTION') {
      router.push('/patient/records?tab=prescriptions');
    } else if (action === 'SHOW_REPORTS') {
      router.push('/patient/records?tab=reports');
    } else if (action === 'CALL_EMERGENCY') {
      alert('Emergency service triggered!');
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'ALL') return true;
    return appt.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant';
      case 'PENDING':
        return 'bg-outline-variant/30 text-outline';
      case 'IN_PROGRESS':
        return 'bg-secondary-container/20 text-on-secondary-container';
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
      <Sidebar role="patient" activeTab="appointments" userName={patient?.name || 'Patient'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header 
          userName={patient?.name || 'Patient'} 
          role="patient"
          onActionTriggered={handleAIAction}
        />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">Appointment Bookings</h2>
              <p className="text-xs text-on-surface-variant">Schedule clinical visits and track consultation statuses.</p>
            </div>
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              {showBookingForm ? 'Hide Form' : 'Request Appointment'}
            </button>
          </div>

          {/* Success/Error Alerts */}
          {successMsg && (
            <div className="bg-tertiary-container/30 text-on-tertiary-container text-xs p-4 rounded-xl font-medium border border-tertiary-fixed-dim/20">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-error-container text-error text-xs p-4 rounded-xl font-medium border border-error/20">
              {errorMsg}
            </div>
          )}

          {/* Booking Form Toggleable */}
          {showBookingForm && (
            <form onSubmit={handleBookAppointment} className="soft-card p-6 space-y-4 max-w-2xl animate-zoomIn">
              <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Schedule a Consultation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Select Doctor *</label>
                  <select
                    required
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialization} - Room {doc.room_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Preferred Time Slot *</label>
                  <select
                    required
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  >
                    <option value="">-- Choose Time Slot --</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Reason for Appointment</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your symptoms or reason for consulting..."
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
                >
                  {actionLoading ? 'Booking...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          )}

          {/* Appointments Filter & List */}
          <div className="soft-card overflow-hidden">
            {/* Filter Tabs */}
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

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Doctor</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Schedule</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-xs">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                        No appointments found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-secondary-container/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">{appt.doctor_name}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{appt.specialization} • Room {appt.room_number}</td>
                        <td className="px-6 py-4 font-semibold text-secondary">
                          {new Date(appt.date).toLocaleDateString()} • {appt.time_slot}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">{appt.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                            <button
                              onClick={() => handleCancelAppointment(appt.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 text-error hover:bg-error-container/20 rounded-lg font-bold flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              Cancel
                            </button>
                          )}
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

export default function PatientAppointments() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  );
}
