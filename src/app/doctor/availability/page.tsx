'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function DoctorAvailability() {
  const router = useRouter();

  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState('09:00 AM - 05:00 PM');
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const allTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=doctor');
      return;
    }

    const userObj = JSON.parse(localUser);
    setDoctor(userObj);

    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/doctor/availability?doctor_id=${userObj.id}`, {
          headers: {
            'Authorization': `Bearer ${userObj.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setWorkingHours(data.working_hours || '09:00 AM - 05:00 PM');
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [router]);

  const handleToggleSlot = (slot: string) => {
    if (slots.includes(slot)) {
      setSlots(slots.filter(s => s !== slot));
    } else {
      setSlots([...slots, slot]);
    }
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch(`/api/doctor/availability?doctor_id=${doctor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctor.token}`
        },
        body: JSON.stringify({
          working_hours: workingHours,
          slots: slots
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update availability');

      setSuccess('Availability configurations updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
      <Sidebar role="doctor" activeTab="availability" userName={doctor?.name || 'Doctor'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={doctor?.name || 'Doctor'} role="doctor" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">Availability Slot Settings</h2>
            <p className="text-xs text-on-surface-variant">Configure consultation shift timings and active booking slots.</p>
          </div>

          {/* Messages */}
          {success && (
            <div className="bg-tertiary-container/30 text-on-tertiary-container text-xs p-4 rounded-xl font-medium border border-tertiary-fixed-dim/20">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-error-container text-error text-xs p-4 rounded-xl font-medium border border-error/20">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveAvailability} className="soft-card p-6 space-y-6 bg-white">
            <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Shift Configuration</h3>

            <div className="space-y-4">
              <div className="space-y-1 max-w-md">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Working shift Hours *</label>
                <input
                  type="text"
                  required
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              {/* Active slots checklist */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Active Booking Slots</label>
                <p className="text-[11px] text-outline mb-2">Check the slots you wish to open for client online bookings.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allTimeSlots.map((slot) => {
                    const isChecked = slots.includes(slot);
                    return (
                      <div
                        key={slot}
                        onClick={() => handleToggleSlot(slot)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-secondary-container/10 border-secondary text-secondary font-bold'
                            : 'bg-white border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                      >
                        <span className="text-xs">{slot}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/30">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs shadow"
              >
                {saving ? 'Saving Slot settings...' : 'Save Availability Config'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
