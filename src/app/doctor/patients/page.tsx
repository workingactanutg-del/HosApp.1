'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function DoctorPatients() {
  const router = useRouter();

  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientDetails, setPatientDetails] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=doctor');
      return;
    }

    const userObj = JSON.parse(localUser);
    setDoctor(userObj);

    fetchPatients();
  }, [router]);

  const fetchPatients = async (query = '') => {
    try {
      const res = await fetch(`/api/doctor/patients?q=${encodeURIComponent(query)}`);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchPatients(val);
  };

  const handleSelectPatient = async (id: string) => {
    setSelectedPatientId(id);
    setDetailsLoading(true);
    setPatientDetails(null);
    try {
      const res = await fetch(`/api/doctor/patients?patient_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setPatientDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
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
      <Sidebar role="doctor" activeTab="patients" userName={doctor?.name || 'Doctor'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={doctor?.name || 'Doctor'} role="doctor" />

        {/* Canvas Split Pane */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Pane: Patient search list (1/2 width) */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-outline-variant/20 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-primary">Patient Directories</h2>
              <p className="text-xs text-on-surface-variant">Search and select a patient profile to review electronic medical histories.</p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search patient name, email or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary text-sm shadow-sm text-on-surface"
              />
            </div>

            {/* Patients List */}
            <div className="space-y-3">
              {patients.length === 0 ? (
                <p className="text-center text-xs text-on-surface-variant py-8">No patients found.</p>
              ) : (
                patients.map((pat) => {
                  const isSelected = pat.id === selectedPatientId;
                  return (
                    <div
                      key={pat.id}
                      onClick={() => handleSelectPatient(pat.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-101 ${
                        isSelected
                          ? 'bg-secondary-container/10 border-secondary-container/50 shadow-sm'
                          : 'bg-white border-outline-variant/30 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-primary text-sm">{pat.full_name}</p>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">{pat.email}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant font-bold text-[9px] uppercase rounded-lg">
                          Blood: {pat.blood_group || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-outline mt-3 pt-2 border-t border-outline-variant/10">
                        <span>Phone: {pat.phone || 'N/A'}</span>
                        <span>Gender: {pat.gender || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Patient medical charts (1/2 width) */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface-container-low">
            {selectedPatientId === '' ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant text-center space-y-2 py-16">
                <span className="material-symbols-outlined text-4xl text-outline-variant">folder_shared</span>
                <p className="font-bold text-sm">No Patient Selected</p>
                <p className="text-xs max-w-xs">Select a patient from the list directory to load their clinical medical charts.</p>
              </div>
            ) : detailsLoading ? (
              <div className="h-full flex items-center justify-center">
                <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
              </div>
            ) : patientDetails ? (
              <div className="space-y-6 animate-zoomIn">
                {/* Header card details */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-primary">{patientDetails.profile.full_name}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">{patientDetails.profile.email}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/doctor/consultation?patientId=${patientDetails.profile.id}&patientName=${encodeURIComponent(patientDetails.profile.full_name)}`)}
                      className="px-3 py-1.5 bg-secondary text-white hover:bg-secondary-container font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">edit_document</span>
                      Write Consultation
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs border-t border-outline-variant/20 pt-3">
                    <div>
                      <span className="text-outline">Phone Number</span>
                      <span className="font-bold text-primary mt-0.5 block">{patientDetails.profile.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-outline">Gender • DOB</span>
                      <span className="font-bold text-primary mt-0.5 block">
                        {patientDetails.profile.gender || 'N/A'} • {patientDetails.profile.date_of_birth ? new Date(patientDetails.profile.date_of_birth).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-outline">Blood Group</span>
                      <span className="font-bold text-primary mt-0.5 block">{patientDetails.profile.blood_group || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-outline">Emergency Contact</span>
                      <span className="font-bold text-primary mt-0.5 block">{patientDetails.profile.emergency_contact || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-outline">Insurance Plan</span>
                      <span className="font-bold text-primary mt-0.5 block">
                        {patientDetails.profile.insurance_provider ? `${patientDetails.profile.insurance_provider} (${patientDetails.profile.insurance_policy_number})` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EMR Tabs Sections */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-primary tracking-wide">Patient Clinical History</h4>
                  
                  {/* Visited Records list */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Previous Diagnoses</p>
                    {patientDetails.medicalRecords.length === 0 ? (
                      <p className="text-xs text-on-surface-variant p-4 bg-white rounded-xl text-center">No past records logged.</p>
                    ) : (
                      patientDetails.medicalRecords.map((rec: any) => (
                        <div key={rec.id} className="bg-white p-4 rounded-xl border border-outline-variant/30 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary">{rec.diagnosis}</span>
                            <span className="text-outline">{new Date(rec.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed bg-surface-container-low p-2.5 rounded-lg">
                            {rec.notes}
                          </p>
                          <span className="text-[10px] text-outline block">Logged by {rec.doctor_name}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Prescriptions list */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Prescriptions Issued</p>
                    {patientDetails.prescriptions.length === 0 ? (
                      <p className="text-xs text-on-surface-variant p-4 bg-white rounded-xl text-center">No prescriptions found.</p>
                    ) : (
                      patientDetails.prescriptions.map((presc: any) => (
                        <div key={presc.id} className="bg-white p-4 rounded-xl border border-outline-variant/30 text-xs space-y-2">
                          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
                            <span className="font-semibold text-primary">Dr. {presc.doctor_name}</span>
                            <span className="text-outline">{new Date(presc.date).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-1">
                            {presc.items?.map((item: any, idx: number) => (
                              <p key={idx} className="text-on-surface-variant font-medium">
                                • <span className="font-bold text-primary">{item.medicine_name}</span> ({item.dosage}) - {item.frequency} for {item.duration}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Lab Reports list */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Laboratory Reports</p>
                    {patientDetails.reports.length === 0 ? (
                      <p className="text-xs text-on-surface-variant p-4 bg-white rounded-xl text-center">No reports on file.</p>
                    ) : (
                      patientDetails.reports.map((rep: any) => (
                        <div key={rep.id} className="bg-white p-4 rounded-xl border border-outline-variant/30 text-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-1.5 py-0.5 bg-secondary-container/20 text-on-secondary-container text-[9px] font-bold uppercase rounded-lg">
                                {rep.report_type}
                              </span>
                              <h5 className="font-bold text-primary mt-1">{rep.title}</h5>
                            </div>
                            <span className="text-outline text-[10px]">{new Date(rep.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed text-[11px] bg-secondary-container/5 p-3 rounded-lg border border-secondary/10">
                            <span className="font-bold text-secondary block mb-1">AI Simplification:</span>
                            {rep.summary}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </main>
    </div>
  );
}
