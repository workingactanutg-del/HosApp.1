'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface MedicineItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

function ConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Handle preset queries
  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=doctor');
      return;
    }

    const userObj = JSON.parse(localUser);
    setDoctor(userObj);

    // Parse params
    const patId = searchParams.get('patientId') || '';
    if (patId) {
      setSelectedPatientId(patId);
    }

    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/doctor/patients');
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [router, searchParams]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index: number, field: keyof MedicineItem, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    // Check if appointment ID was provided
    const appointmentId = searchParams.get('appointmentId') || null;

    try {
      const res = await fetch(`/api/doctor/consultation?doctor_id=${doctor.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctor.token}`
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          diagnosis,
          notes,
          medicines: medicines.filter(m => m.medicineName.trim() !== ''),
          appointmentId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit consult notes');

      setSuccess('Consultation logged successfully!');
      setDiagnosis('');
      setNotes('');
      setMedicines([{ medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }]);
      
      setTimeout(() => {
        router.push('/doctor/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
      <Sidebar role="doctor" activeTab="consultation" userName={doctor?.name || 'Doctor'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={doctor?.name || 'Doctor'} role="doctor" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide max-w-4xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">Consultation Logger & Prescriptions</h2>
            <p className="text-xs text-on-surface-variant">Log patient diagnosis, clinical observations, and digital prescriptions.</p>
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
          <form onSubmit={handleSaveConsultation} className="soft-card p-6 space-y-6 bg-white">
            <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Active Consultation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Patient */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                  ))}
                </select>
              </div>

              {/* Diagnosis */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Mild Hypertension, Common Cold, Type-2 Diabetes"
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Consultation / Visit Notes</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter clinical observations, advice, recommended diets or tests..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Prescription Items Builder */}
            <div className="space-y-4 pt-2 border-t border-outline-variant/30">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Digital Prescription (Medicines)</h4>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold text-secondary flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">add</span> Add Medicine
                </button>
              </div>

              <div className="space-y-4 divide-y divide-outline-variant/20">
                {medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-4 first:pt-0">
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Medicine Name</label>
                      <input
                        type="text"
                        value={med.medicineName}
                        onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                        placeholder="e.g. Lisinopril, Metformin"
                        className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 10mg, 500mg"
                        className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                      >
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                        placeholder="e.g. 7 days, 1 month"
                        className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-6 grid grid-cols-6 gap-3 items-end">
                      <div className="col-span-5 space-y-1">
                        <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Usage Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          placeholder="e.g. Take after breakfast, avoid dairy products."
                          className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-xs"
                        />
                      </div>
                      
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-2 text-error hover:bg-error-container/20 rounded-xl flex items-center justify-center transition-colors mb-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => router.push('/doctor/dashboard')}
                className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs shadow"
              >
                {submitting ? 'Logging...' : 'Submit Consultation'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function DoctorConsultation() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <ConsultationContent />
    </Suspense>
  );
}
