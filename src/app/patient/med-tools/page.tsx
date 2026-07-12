'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function PatientMedTools() {
  const router = useRouter();

  // States
  const [patient, setPatient] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reminder Form State
  const [medicineName, setMedicineName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [dosage, setDosage] = useState('1 Pill');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Interaction Checker State
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [checking, setChecking] = useState(false);
  const [interactionResult, setInteractionResult] = useState<any>(null);

  const loadReminders = async (patId: string, token: string) => {
    try {
      const res = await fetch(`/api/patient/reminders?patient_id=${patId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
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
      router.push('/login?role=patient');
      return;
    }
    const userObj = JSON.parse(localUser);
    setPatient(userObj);

    loadReminders(userObj.id, userObj.token);
  }, [router]);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccess('');

    try {
      const res = await fetch(`/api/patient/reminders?patient_id=${patient.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient.token}`
        },
        body: JSON.stringify({
          medicineName,
          timeOfDay,
          dosage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create reminder');

      setSuccess(`Reminder set for ${medicineName} at ${timeOfDay}!`);
      setMedicineName('');
      setTimeOfDay('');
      setDosage('1 Pill');
      
      loadReminders(patient.id, patient.token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Delete this medication reminder?')) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/patient/reminders?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
      loadReminders(patient.id, patient.token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugA || !drugB) return;
    setChecking(true);
    setInteractionResult(null);

    // Simulated AI drug checker lookup
    setTimeout(() => {
      const a = drugA.toLowerCase().trim();
      const b = drugB.toLowerCase().trim();
      let severity = 'SAFE';
      let description = '';
      let warning = '';

      if ((a.includes('aspirin') && b.includes('warfarin')) || (a.includes('warfarin') && b.includes('aspirin'))) {
        severity = 'SEVERE';
        warning = 'High Bleeding Risk Warning';
        description = 'Both Aspirin and Warfarin thin the blood. Combining them significantly increases the risk of severe internal bleeding, bruising, and gastrointestinal complications. Avoid combining without close laboratory INR monitoring.';
      } else if ((a.includes('lisinopril') && b.includes('ibuprofen')) || (a.includes('ibuprofen') && b.includes('lisinopril')) || (a.includes('advil') && a.includes('lisinopril'))) {
        severity = 'MODERATE';
        warning = 'Kidney Strain & Efficacy Caution';
        description = 'NSAIDs like Ibuprofen can decrease the antihypertensive effect of ACE inhibitors like Lisinopril. Additionally, combining them increases renal perfusion strain and risks acute kidney injury, particularly in elderly patients.';
      } else if ((a.includes('metformin') && b.includes('contrast')) || (a.includes('contrast') && b.includes('metformin'))) {
        severity = 'SEVERE';
        warning = 'Lactic Acidosis Risk';
        description = 'Iodinated contrast dyes used in CT scans can temporarily impair kidney clearance. Metformin can accumulate in the bloodstream, leading to lactic acidosis, a critical medical emergency. Metformin must be held 48 hours post-procedure.';
      } else if ((a.includes('amoxicillin') && b.includes('c')) || (a.includes('c') && b.includes('amoxicillin'))) {
        severity = 'SAFE';
        warning = 'No Interaction Detected';
        description = 'Vitamin C and Amoxicillin have no clinical chemical interaction. Vitamin C is water-soluble and does not alter the pharmacokinetic breakdown of Amoxicillin. Safe to take concurrently.';
      } else {
        severity = 'MODERATE';
        warning = 'Assumed Clinical Synergy Caution';
        description = `AI Analysis: Combining ${drugA} and ${drugB} may cause mild metabolic synergy. Ensure to log both medications in your HOSAPP EMR dashboard and review with your clinical consultant, Dr. Jenkins, to confirm safety parameters.`;
      }

      setInteractionResult({ severity, warning, description });
      setChecking(false);
    }, 1000);
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
      <Sidebar role="patient" activeTab="med-tools" userName={patient?.name || 'Patient'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={patient?.name || 'Patient'} role="patient" />

        {/* Canvas Split Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide max-w-5xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">Medication Reminders & Drug Checker</h2>
            <p className="text-xs text-on-surface-variant">Schedule daily pill alarms and verify drug-to-drug interactions using HOSAPP AI.</p>
          </div>

          {success && (
            <div className="bg-tertiary-container/30 text-on-tertiary-container text-xs p-4 rounded-xl font-medium border border-tertiary-fixed-dim/20">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Left Pane: Pill Alarm Scheduler */}
            <div className="space-y-6">
              {/* Form */}
              <form onSubmit={handleAddReminder} className="soft-card p-6 bg-white space-y-4">
                <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">alarm</span>
                  Create Medication Alarm
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Medicine Name *</label>
                    <input
                      type="text"
                      required
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      placeholder="e.g. Lisinopril"
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 10mg / 1 Pill"
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Time of Day *</label>
                    <input
                      type="time"
                      required
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
                  >
                    {actionLoading ? 'Scheduling...' : 'Set Reminder'}
                  </button>
                </div>
              </form>

              {/* List of Active Reminders */}
              <div className="soft-card p-6 bg-white space-y-4">
                <h4 className="font-bold text-sm text-primary">Active Pill Reminders</h4>
                <div className="divide-y divide-outline-variant/25">
                  {reminders.length === 0 ? (
                    <p className="text-xs text-on-surface-variant py-4 text-center">No active medication alarms set.</p>
                  ) : (
                    reminders.map((rem) => (
                      <div key={rem.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary text-lg">notifications_active</span>
                          <div>
                            <p className="font-bold text-primary">{rem.medicine_name}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">Dosage: {rem.dosage || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-surface-container text-secondary font-bold rounded-lg uppercase text-[10px]">
                            {rem.time_of_day}
                          </span>
                          <button
                            onClick={() => handleDeleteReminder(rem.id)}
                            className="p-1 hover:bg-error-container/20 text-error rounded-lg"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Pane: AI Drug Interaction Checker */}
            <div className="space-y-6">
              <form onSubmit={handleCheckInteraction} className="soft-card p-6 bg-white space-y-4">
                <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">flaky</span>
                  AI Drug Interaction Checker
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Enter two drug brands/generic names below to verify compatibility indices and side effects warnings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">First Medication</label>
                    <input
                      type="text"
                      required
                      value={drugA}
                      onChange={(e) => setDrugA(e.target.value)}
                      placeholder="e.g. Aspirin"
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Second Medication</label>
                    <input
                      type="text"
                      required
                      value={drugB}
                      onChange={(e) => setDrugB(e.target.value)}
                      placeholder="e.g. Warfarin"
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checking || !drugA || !drugB}
                  className="w-full py-2.5 bg-primary-container text-on-primary-fixed hover:bg-primary-fixed rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  {checking ? 'Analyzing compatibility...' : 'Analyze Drug Interaction'}
                </button>
              </form>

              {/* Interaction Output */}
              {interactionResult && (
                <div className={`soft-card p-6 border relative overflow-hidden animate-zoomIn ${
                  interactionResult.severity === 'SEVERE'
                    ? 'bg-error-container/20 border-error/30'
                    : interactionResult.severity === 'MODERATE'
                    ? 'bg-surface-container-high/30 border-secondary-container/40'
                    : 'bg-tertiary-container/20 border-tertiary-fixed-dim/30'
                }`}>
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-error"></div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`material-symbols-outlined text-sm font-bold ${
                      interactionResult.severity === 'SEVERE' ? 'text-error animate-pulse' : 'text-secondary'
                    }`}>
                      {interactionResult.severity === 'SEVERE' ? 'warning' : 'info'}
                    </span>
                    <span className={`font-extrabold text-xs uppercase tracking-wider ${
                      interactionResult.text === 'SEVERE' ? 'text-error' : 'text-primary'
                    }`}>
                      Severity: {interactionResult.severity}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-primary text-sm mb-1">{interactionResult.warning}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {interactionResult.description}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
