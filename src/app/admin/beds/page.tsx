'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface Bed {
  id: string;
  ward_name: string;
  bed_number: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'DIRTY' | 'RESERVED';
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  floor: string;
}

export default function AdminBeds() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Bed State
  const [showAddForm, setShowAddForm] = useState(false);
  const [wardName, setWardName] = useState('');
  const [bedNumber, setBedNumber] = useState('');

  // Allocation Modal State
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      const deptsRes = await fetch('/api/admin/departments');
      let depts: Department[] = [];
      if (deptsRes.ok) {
        depts = await deptsRes.json();
        setDepartments(depts);
        if (depts.length > 0) {
          setWardName(depts[0].name);
        }
      }

      const bedsRes = await fetch('/api/admin/beds');
      if (bedsRes.ok) {
        const bedsData = await bedsRes.json();
        setBeds(bedsData);
      }

      const patientsRes = await fetch('/api/doctor/patients');
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
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

  const handleAddBedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardName || !bedNumber) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/beds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wardName, bedNumber })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add bed');

      setSuccessMsg(`Bed ${bedNumber} added to ${wardName} successfully.`);
      setBedNumber('');
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAllocateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId || !selectedPatientId) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/beds', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bedId: selectedBedId,
          status: 'OCCUPIED',
          patientId: selectedPatientId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to allocate bed');
      
      setSuccessMsg('Patient allocated to bed successfully!');
      setSelectedBedId('');
      setSelectedPatientId('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDischargePatient = async (bedId: string) => {
    if (!confirm('Discharge patient? Bed status will change to sanitizing/dirty.')) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/beds', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bedId,
          status: 'DIRTY',
          patientId: null
        })
      });

      if (!res.ok) throw new Error('Failed to discharge patient');
      setSuccessMsg('Patient discharged. Bed marked for sanitation.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanBed = async (bedId: string) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/beds', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bedId,
          status: 'AVAILABLE',
          patientId: null
        })
      });

      if (!res.ok) throw new Error('Failed to clean bed');
      setSuccessMsg('Bed sanitized and marked as available.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBed = async (bedId: string) => {
    if (!confirm('Are you sure you want to permanently delete this bed?')) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/beds?id=${bedId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete bed');
      setSuccessMsg('Bed deleted from inventory.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const triggerAddBedForDept = (deptName: string) => {
    setWardName(deptName);
    setShowAddForm(true);
  };

  // Stats
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const dirtyBeds = beds.filter(b => b.status === 'DIRTY').length;

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
      <Sidebar role="admin" activeTab="beds" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Ward Bed Configuration Panel</h2>
              <p className="text-xs text-on-surface-variant">Configure hospital ward beds dynamically linked with configured clinical departments.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              {showAddForm ? 'Close Drawer' : 'Add Hospital Bed'}
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

          {/* Add Bed Form Drawer (Dynamically loaded Departments) */}
          {showAddForm && (
            <form onSubmit={handleAddBedSubmit} className="soft-card p-6 space-y-4 max-w-xl bg-white animate-zoomIn">
              <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Catalog New Department Bed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Select Department Ward</label>
                  <select
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                  >
                    {departments.length === 0 ? (
                      <option value="">-- No Departments Configured --</option>
                    ) : (
                      departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Bed Label/Number *</label>
                  <input
                    type="text"
                    required
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="e.g. Bed-05, ICU-03"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || departments.length === 0}
                  className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Add Bed'}
                </button>
              </div>
            </form>
          )}

          {/* Stats Bar Card */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="soft-card p-4 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Total Beds</span>
                <span className="text-xl font-bold text-primary mt-1 block">{totalBeds}</span>
              </div>
              <span className="material-symbols-outlined text-secondary">hotel</span>
            </div>
            
            <div className="soft-card p-4 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Occupied</span>
                <span className="text-xl font-bold text-error mt-1 block">{occupiedBeds}</span>
              </div>
              <span className="material-symbols-outlined text-error">bed</span>
            </div>

            <div className="soft-card p-4 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Vacant</span>
                <span className="text-xl font-bold text-on-tertiary-container mt-1 block">{availableBeds}</span>
              </div>
              <span className="material-symbols-outlined text-on-tertiary-container">done_all</span>
            </div>

            <div className="soft-card p-4 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Needs Sanitation</span>
                <span className="text-xl font-bold text-amber-600 mt-1 block">{dirtyBeds}</span>
              </div>
              <span className="material-symbols-outlined text-amber-500">cleaning_services</span>
            </div>
          </section>

          {/* Ward Wise Grouping Cards - Dynamically Fetched Departments */}
          <div className="space-y-8">
            {departments.map((dept) => {
              const wardBeds = beds.filter(b => b.ward_name === dept.name);
              return (
                <div key={dept.id} className="space-y-4">
                  {/* Ward Header */}
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">domain</span>
                      <h3 className="font-extrabold text-primary text-base">{dept.name}</h3>
                      <span className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant font-medium text-[9px] rounded">
                        Floor {dept.floor}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant font-bold text-[10px] uppercase rounded-lg">
                      {wardBeds.length} Beds Total
                    </span>
                  </div>

                  {/* Bed Cards Layout */}
                  {wardBeds.length === 0 ? (
                    <div className="soft-card p-6 bg-white border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center space-y-2 py-8">
                      <span className="material-symbols-outlined text-outline text-3xl">hotel</span>
                      <h4 className="text-sm font-bold text-primary">No Beds Cataloged</h4>
                      <p className="text-xs text-on-surface-variant max-w-xs">There are no beds allocated in the {dept.name} department yet.</p>
                      <button
                        onClick={() => triggerAddBedForDept(dept.name)}
                        className="mt-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Bed Here
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {wardBeds.map((bed) => {
                        const isOccupied = bed.status === 'OCCUPIED';
                        const isDirty = bed.status === 'DIRTY';
                        const isAvailable = bed.status === 'AVAILABLE';

                        return (
                          <div
                            key={bed.id}
                            className={`soft-card p-5 bg-white border flex flex-col justify-between hover:shadow-md transition-all relative ${
                              isOccupied
                                ? 'border-error-container/30 ring-1 ring-error/10'
                                : isDirty
                                ? 'border-amber-400/30 ring-1 ring-amber-500/10'
                                : 'border-outline-variant/30'
                            }`}
                          >
                            {/* Card top details */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Floor Locator</span>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                                  isOccupied
                                    ? 'bg-error-container text-error'
                                    : isDirty
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant'
                                }`}>
                                  {bed.status === 'DIRTY' ? 'Dirty / Cleaning' : bed.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-xl ${
                                  isOccupied ? 'text-error' : isDirty ? 'text-amber-500' : 'text-secondary'
                                }`}>
                                  bed
                                </span>
                                <h4 className="text-sm font-bold text-primary">{bed.bed_number}</h4>
                              </div>

                              {/* Patient detail box if occupied */}
                              {isOccupied && bed.patient_name ? (
                                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/10 text-xs">
                                  <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Patient Admitted</span>
                                  <span className="font-bold text-primary mt-1 block">{bed.patient_name}</span>
                                  <span className="text-[10px] text-on-surface-variant block mt-0.5">{bed.patient_email}</span>
                                </div>
                              ) : isDirty ? (
                                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/20 text-xs text-amber-700">
                                  <span className="flex items-center gap-1 font-semibold">
                                    <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                                    Requires sanitizing prior to admit.
                                  </span>
                                </div>
                              ) : (
                                <p className="text-xs text-outline italic py-2">Bed is vacant and sanitized.</p>
                              )}
                            </div>

                            {/* Card bottom actions */}
                            <div className="mt-5 pt-3 border-t border-outline-variant/20 flex gap-2 justify-end">
                              {isAvailable && (
                                <>
                                  <button
                                    onClick={() => setSelectedBedId(bed.id)}
                                    className="flex-1 py-1.5 bg-secondary text-white hover:bg-secondary-container text-xs font-bold rounded-lg transition-all"
                                  >
                                    Assign
                                  </button>
                                  <button
                                    onClick={() => handleRemoveBed(bed.id)}
                                    className="p-1.5 text-error hover:bg-error-container/20 rounded-lg flex items-center justify-center transition-colors"
                                    title="Delete Bed"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </>
                              )}

                              {isOccupied && (
                                <button
                                  onClick={() => handleDischargePatient(bed.id)}
                                  className="w-full py-1.5 bg-error-container text-error hover:opacity-90 text-xs font-bold rounded-lg transition-all"
                                >
                                  Discharge
                                </button>
                              )}

                              {isDirty && (
                                <button
                                  onClick={() => handleCleanBed(bed.id)}
                                  className="w-full py-1.5 bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-sm">cleaning_services</span>
                                  Clean Bed
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Allocation Drawer Modal */}
      {selectedBedId && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <form onSubmit={handleAllocateBed} className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant space-y-4 animate-zoomIn">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
              <h3 className="font-bold text-primary text-sm">Admit Patient to Bed</h3>
              <button
                type="button"
                onClick={() => setSelectedBedId('')}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Choose Patient</label>
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBedId('')}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
              >
                {actionLoading ? 'Allocating...' : 'Confirm Admission'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
