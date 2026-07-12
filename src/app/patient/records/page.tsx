'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

function RecordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'visits' | 'prescriptions' | 'reports'>('visits');
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('Blood Test');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Prescription AI Explanation Modal State
  const [selectedPrescDetails, setSelectedPrescDetails] = useState<any>(null);

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=patient');
      return;
    }

    const userObj = JSON.parse(localUser);
    setPatient(userObj);

    // Read tab parameter from URL
    const tabParam = searchParams.get('tab');
    if (tabParam === 'prescriptions' || tabParam === 'reports') {
      setActiveTab(tabParam);
    }

    const fetchRecords = async () => {
      try {
        const res = await fetch(`/api/patient/records?patient_id=${userObj.id}`, {
          headers: {
            'Authorization': `Bearer ${userObj.token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch records');
        const data = await res.json();
        
        setMedicalRecords(data.medicalRecords);
        setPrescriptions(data.prescriptions);
        setReports(data.reports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [router, searchParams]);

  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadSuccess('');

    try {
      const res = await fetch(`/api/patient/records/upload?patient_id=${patient.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient.token}`
        },
        body: JSON.stringify({
          title: uploadTitle,
          reportType: uploadType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload report');

      setUploadSuccess('Report uploaded and analyzed by AI!');
      setUploadTitle('');
      setShowUploadForm(false);

      // Refresh records
      const refreshRes = await fetch(`/api/patient/records?patient_id=${patient.id}`, {
        headers: { 'Authorization': `Bearer ${patient.token}` }
      });
      const data2 = await refreshRes.json();
      setReports(data2.reports);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAIAction = (action: string, data: any) => {
    if (action === 'HIGHLIGHT_MAP' && data.target) {
      router.push(`/patient/map?target=${data.target}`);
    } else if (action === 'BOOK_APPOINTMENT') {
      router.push(`/patient/appointments?book=true&doctorId=${data.doctorId}`);
    } else if (action === 'READ_PRESCRIPTION') {
      setActiveTab('prescriptions');
    } else if (action === 'SHOW_REPORTS') {
      setActiveTab('reports');
    } else if (action === 'CALL_EMERGENCY') {
      alert('Emergency assistance triggered!');
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
      <Sidebar role="patient" activeTab="records" userName={patient?.name || 'Patient'} />

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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Electronic Medical Records (EMR)</h2>
              <p className="text-xs text-on-surface-variant">View your diagnoses, active prescriptions, and lab reports.</p>
            </div>
            
            {activeTab === 'reports' && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-4 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center gap-2 text-xs"
              >
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                Upload Lab Report
              </button>
            )}
          </div>

          {/* Upload Report Modal Form */}
          {showUploadForm && (
            <form onSubmit={handleUploadReport} className="soft-card p-6 space-y-4 max-w-md animate-zoomIn">
              <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Upload Diagnostic Report</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Report Title</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. CBC Blood Count, Chest X-Ray"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Report Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Cardiology">Cardiology / ECG</option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="Radiology">Radiology / X-Ray</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Select PDF File (Demo Mock)</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 text-center cursor-pointer hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-outline text-3xl">picture_as_pdf</span>
                    <p className="text-xs text-outline-variant mt-1 font-semibold">Select clinical PDF file</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
                >
                  {uploadLoading ? 'AI Summarizing...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          )}

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-outline-variant/30">
            {(['visits', 'prescriptions', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowUploadForm(false);
                }}
                className={`px-6 py-3 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab === 'visits' ? 'Clinical Visits' : tab === 'prescriptions' ? 'Prescriptions' : 'Lab Reports'}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="space-y-6">
            {/* 1. Clinical Visits Tab */}
            {activeTab === 'visits' && (
              <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-8 text-center soft-card p-6">No previous clinical records found.</p>
                ) : (
                  medicalRecords.map((rec) => (
                    <div key={rec.id} className="soft-card p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-bold text-primary">{rec.diagnosis}</h4>
                          <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mt-0.5">
                            {rec.specialization} • Dr. {rec.doctor_name}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container text-secondary text-xs font-bold rounded-lg">
                          {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-xl">
                        {rec.notes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-8 text-center soft-card p-6">No prescriptions found on file.</p>
                ) : (
                  prescriptions.map((presc) => (
                    <div key={presc.id} className="soft-card p-6 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                        <div>
                          <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Prescribing Doctor</p>
                          <h4 className="text-sm font-bold text-primary">Dr. {presc.doctor_name}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPrescDetails(presc)}
                            className="px-3 py-1.5 bg-primary-container text-on-primary-fixed hover:bg-primary-fixed rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            Explain Medicines
                          </button>
                          <span className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-lg">
                            {new Date(presc.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-outline-variant/20">
                        {presc.items?.map((item: any, idx: number) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                            <div className="md:col-span-1">
                              <p className="font-bold text-primary">{item.medicine_name}</p>
                              <p className="text-outline text-[10px]">{item.dosage}</p>
                            </div>
                            <div>
                              <p className="text-on-surface-variant font-medium">Frequency</p>
                              <p className="font-bold text-primary mt-0.5">{item.frequency}</p>
                            </div>
                            <div>
                              <p className="text-on-surface-variant font-medium">Duration</p>
                              <p className="font-bold text-primary mt-0.5">{item.duration}</p>
                            </div>
                            <div>
                              <p className="text-on-surface-variant font-medium">Special Instructions</p>
                              <p className="text-on-surface-variant mt-0.5">{item.instructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {presc.notes && (
                        <div className="bg-surface-container-low p-3 rounded-xl text-xs text-on-surface-variant leading-relaxed">
                          <span className="font-bold text-primary">Doctor Notes:</span> {presc.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Lab Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-8 text-center soft-card p-6">No diagnostic lab reports found.</p>
                ) : (
                  reports.map((rep) => (
                    <div key={rep.id} className="soft-card p-6 space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 bg-secondary-container/20 text-on-secondary-container text-[9px] font-bold uppercase rounded-lg">
                            {rep.report_type}
                          </span>
                          <h4 className="text-base font-bold text-primary mt-1.5">{rep.title}</h4>
                        </div>
                        <span className="text-xs text-outline">
                          {new Date(rep.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {rep.summary && (
                        <div className="ai-gradient p-4 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                          <div className="flex items-center gap-1.5 text-secondary font-bold text-xs mb-2">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            <span>AI Report Simplification</span>
                          </div>
                          <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line">
                            {rep.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Prescription Explanation Dialog */}
      {selectedPrescDetails && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-outline-variant space-y-4 animate-zoomIn">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">auto_awesome</span>
                <h3 className="font-bold text-primary text-sm">AI Medicine Explanation</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedPrescDetails(null)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-96 overflow-y-auto pr-2 scrollbar-hide">
              {selectedPrescDetails.items?.map((item: any, idx: number) => (
                <div key={idx} className="bg-surface-container-low p-4 rounded-2xl space-y-2 border border-outline-variant/10">
                  <p className="font-extrabold text-secondary text-sm">{item.medicine_name}</p>
                  <p className="text-on-surface leading-relaxed">
                    <span className="font-bold text-primary">Purpose:</span>{' '}
                    {item.medicine_name.toLowerCase().includes('lisinopril') 
                      ? 'Lisinopril is an ACE inhibitor and is commonly used to treat high blood pressure (hypertension) or heart failure. It helps relax blood vessels so blood flows more smoothly.'
                      : item.medicine_name.toLowerCase().includes('aspirin')
                      ? 'Low-dose Aspirin is a blood thinner. It prevents blood clots from forming, reducing the risk of cardiovascular events like heart attacks or strokes.'
                      : 'This medicine is prescribed by your consultant to alleviate active symptoms and restore metabolic indexes. Follow clinical instructions.'}
                  </p>
                  <p className="text-on-surface leading-relaxed">
                    <span className="font-bold text-primary">Dosage Details:</span> Take {item.dosage} ({item.frequency}) for {item.duration}.
                  </p>
                  <p className="text-error leading-relaxed">
                    <span className="font-bold">Caution / Side Effects:</span> Avoid taking with alcohol. Consult your clinician if you experience lightheadedness, dry cough, or gastrointestinal discomfort.
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPrescDetails(null)}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-colors text-xs"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientRecords() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <RecordsContent />
    </Suspense>
  );
}
