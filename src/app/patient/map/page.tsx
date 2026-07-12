'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface DepartmentMap {
  name: string;
  floor: number;
  location: string;
  doctor: string;
  color: string;
  description: string;
}

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [patient, setPatient] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState<string>('Reception');
  const [loading, setLoading] = useState(true);

  const departmentsList: DepartmentMap[] = [
    { name: 'Reception', floor: 1, location: 'Central Entrance Lobby', doctor: 'Staff Desk', color: 'bg-primary', description: 'Patient admission, info desk, check-ins and emergency registration.' },
    { name: 'Pharmacy', floor: 1, location: 'East Wing Ground Floor', doctor: 'Dr. Linda Ross (PharmD)', color: 'bg-secondary', description: 'Dispenses prescription medications, health supplements, and clinical advice.' },
    { name: 'Radiology', floor: 1, location: 'West Wing Ground Floor', doctor: 'Dr. David Miller', color: 'bg-error', description: 'X-Rays, MRI, CT Scans, Ultrasound diagnostics and report rendering.' },
    { name: 'Emergency', floor: 1, location: 'South Gate Trauma wing', doctor: 'Dr. David Miller', color: 'bg-error', description: '24/7 critical trauma care, ambulance arrivals, and life-saving procedures.' },
    { name: 'Cardiology', floor: 2, location: 'East Wing Second Floor', doctor: 'Dr. Sarah Jenkins', color: 'bg-secondary-container', description: 'Cardiovascular diagnostics, ECG checkups, heart condition therapies.' },
    { name: 'Pediatrics', floor: 2, location: 'North Wing Second Floor', doctor: 'Dr. Emily Taylor', color: 'bg-tertiary-fixed', description: 'Childhood growth checkups, immunization, pediatric specialty consults.' },
    { name: 'Lab', floor: 2, location: 'West Wing Second Floor', doctor: 'Dr. Michael Chen', color: 'bg-surface-dim', description: 'Diagnostic fluid analyses, blood draws, pathology processing.' },
    { name: 'ICU', floor: 2, location: 'South Wing Second Floor', doctor: 'Dr. Sarah Jenkins', color: 'bg-inverse-surface', description: 'Intensive Care Unit for critically ill or post-surgical recovery monitoring.' },
    { name: 'Neurology', floor: 3, location: 'Top Floor Specialty Wing', doctor: 'Dr. Michael Chen', color: 'bg-primary-container', description: 'Neurological assessments, neuro-trauma therapy, brain mapping consults.' }
  ];

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=patient');
      return;
    }

    const userObj = JSON.parse(localUser);
    setPatient(userObj);
    setLoading(false);

    // Read target department from query param (set by Voice Assistant)
    const targetParam = searchParams.get('target');
    if (targetParam) {
      const match = departmentsList.find(d => d.name.toLowerCase() === targetParam.toLowerCase());
      if (match) {
        setSelectedDept(match.name);
      }
    }
  }, [router, searchParams]);

  const handleAIAction = (action: string, data: any) => {
    if (action === 'HIGHLIGHT_MAP' && data.target) {
      setSelectedDept(data.target);
    } else if (action === 'BOOK_APPOINTMENT') {
      router.push(`/patient/appointments?book=true&doctorId=${data.doctorId}`);
    } else if (action === 'READ_PRESCRIPTION') {
      router.push('/patient/records?tab=prescriptions');
    } else if (action === 'SHOW_REPORTS') {
      router.push('/patient/records?tab=reports');
    } else if (action === 'CALL_EMERGENCY') {
      setSelectedDept('Emergency');
    }
  };

  const selectedData = departmentsList.find(d => d.name === selectedDept) || departmentsList[0];

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
      <Sidebar role="patient" activeTab="map" userName={patient?.name || 'Patient'} />

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
          <div>
            <h2 className="text-2xl font-bold text-primary">Hospital Indoor Navigation Map</h2>
            <p className="text-xs text-on-surface-variant">Locate departments, check floor numbers, and find routing paths.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Map Visual (2/3 columns wide) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="soft-card p-6 bg-white flex flex-col items-center">
                <div className="w-full flex justify-between items-center pb-4 border-b border-outline-variant/30 mb-4">
                  <span className="font-bold text-xs text-primary">Level Layout: Floor {selectedData.floor}</span>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 bg-secondary rounded-full animate-ping"></span>
                    <span className="text-[10px] text-secondary font-extrabold uppercase">Live Path Routing</span>
                  </div>
                </div>

                {/* Simulated SVG Hospital Map */}
                <div className="w-full max-w-lg aspect-video bg-surface-container-low border border-outline-variant/30 rounded-2xl relative p-4 flex flex-col justify-between">
                  {/* Floor Grid representation */}
                  <div className="grid grid-cols-3 grid-rows-2 gap-3 h-full">
                    {departmentsList
                      .filter(d => d.floor === selectedData.floor)
                      .map((d) => {
                        const isTarget = d.name === selectedDept;
                        return (
                          <div
                            key={d.name}
                            onClick={() => setSelectedDept(d.name)}
                            className={`rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-102 ${
                              isTarget 
                                ? 'bg-secondary text-white border-secondary ring-4 ring-secondary-container/50 animate-pulse' 
                                : 'bg-white border-outline-variant/40 hover:border-secondary'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-xs">{d.name}</p>
                              <p className={`text-[9px] mt-0.5 ${isTarget ? 'text-white/80' : 'text-on-surface-variant'}`}>{d.location.split(' ')[0]}</p>
                            </div>
                            <span className="material-symbols-outlined text-sm self-end">
                              {d.name === 'Pharmacy' ? 'medication' : d.name === 'Lab' ? 'biotech' : d.name === 'Reception' ? 'desk' : 'medical_services'}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Navigation Visual Path Overlay (if Reception clicked on Floor 1, highlight etc) */}
                  {selectedData.floor === 1 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* Visual Path trace simulation */}
                      <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200">
                        {/* Reception is usually center. Draw path from Reception (center) to target */}
                        {selectedDept === 'Pharmacy' && (
                          <path d="M 200,100 L 320,100" fill="none" stroke="#39b8fd" strokeWidth="4" strokeDasharray="6" className="animate-[dash_2s_linear_infinite]" />
                        )}
                        {selectedDept === 'Radiology' && (
                          <path d="M 200,100 L 80,100" fill="none" stroke="#39b8fd" strokeWidth="4" strokeDasharray="6" className="animate-[dash_2s_linear_infinite]" />
                        )}
                        {selectedDept === 'Emergency' && (
                          <path d="M 200,100 L 200,160" fill="none" stroke="#39b8fd" strokeWidth="4" strokeDasharray="6" className="animate-[dash_2s_linear_infinite]" />
                        )}
                      </svg>
                    </div>
                  )}

                  {/* Key */}
                  <div className="flex gap-4 justify-center items-center text-[10px] text-on-surface-variant pt-2 border-t border-outline-variant/20 mt-4">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-secondary rounded"></span> Active Highlight</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-surface-container-low border border-outline-variant/40 rounded"></span> Other Department</span>
                    <span className="flex items-center gap-1"><span className="w-6 h-1 border-t-2 border-dashed border-secondary-container"></span> Path Guide</span>
                  </div>
                </div>
              </div>

              {/* Department details */}
              <div className="soft-card p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-primary">{selectedData.name} Details</h3>
                  <span className="px-2.5 py-1 bg-surface-container text-secondary text-xs font-bold rounded-lg uppercase">
                    Level {selectedData.floor}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedData.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-outline-variant/20 text-xs">
                  <div>
                    <span className="text-outline block">Department Location</span>
                    <span className="font-bold text-primary mt-0.5 block">{selectedData.location}</span>
                  </div>
                  <div>
                    <span className="text-outline block">Head Consultant / Duty Officer</span>
                    <span className="font-bold text-primary mt-0.5 block">{selectedData.doctor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar list of departments (1/3 columns wide) */}
            <div className="space-y-4">
              <div className="soft-card p-6 space-y-4">
                <h4 className="font-bold text-sm text-primary">Department Directories</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-hide">
                  {departmentsList.map((d) => {
                    const isSelected = d.name === selectedDept;
                    return (
                      <div
                        key={d.name}
                        onClick={() => setSelectedDept(d.name)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-secondary-container/10 border-secondary-container/50 text-secondary font-bold'
                            : 'bg-white border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm">
                            {d.name === 'Reception' ? 'desk' : d.name === 'Pharmacy' ? 'medication' : 'local_hospital'}
                          </span>
                          <div>
                            <p className="text-xs">{d.name}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">Floor {d.floor}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamic Path Keyframe style */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
}

export default function PatientMap() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <MapContent />
    </Suspense>
  );
}
