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

export default function DoctorBeds() {
  const router = useRouter();

  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=doctor');
      return;
    }
    const userObj = JSON.parse(localUser);
    setDoctor(userObj);

    const fetchBedsAndDepts = async () => {
      try {
        const deptsRes = await fetch('/api/admin/departments');
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          setDepartments(deptsData);
        }

        const bedsRes = await fetch('/api/admin/beds');
        if (bedsRes.ok) {
          const bedsData = await bedsRes.json();
          setBeds(bedsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBedsAndDepts();
  }, [router]);

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
      <Sidebar role="doctor" activeTab="beds" userName={doctor?.name || 'Doctor'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={doctor?.name || 'Doctor'} role="doctor" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div>
            <h2 className="text-2xl font-bold text-primary">Ward Bed Allocation Map</h2>
            <p className="text-xs text-on-surface-variant">Review all clinical ward occupancies and vacant bed locations linked to departments.</p>
          </div>

          {/* Ward Wise Grouping Cards */}
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
                      {wardBeds.length} Beds
                    </span>
                  </div>

                  {/* Bed Cards Layout */}
                  {wardBeds.length === 0 ? (
                    <div className="soft-card p-6 bg-white border border-dashed border-outline-variant/40 text-center text-xs text-outline italic">
                      No beds currently allocated in the {dept.name} department.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {wardBeds.map((bed) => {
                        const isOccupied = bed.status === 'OCCUPIED';
                        const isDirty = bed.status === 'DIRTY';

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
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Status</span>
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
                                  <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Admitted Patient</span>
                                  <span className="font-bold text-primary mt-1 block">{bed.patient_name}</span>
                                  <span className="text-[10px] text-on-surface-variant block mt-0.5">{bed.patient_email}</span>
                                </div>
                              ) : isDirty ? (
                                <p className="text-xs text-amber-700 italic py-2">Bed is dirty (needs sanitizing).</p>
                              ) : (
                                <p className="text-xs text-outline italic py-2">Bed is vacant and sanitized.</p>
                              )}
                            </div>

                            {isOccupied && (
                              <button
                                onClick={() => router.push(`/doctor/patients?patient_id=${bed.patient_id}`)}
                                className="mt-4 w-full py-1.5 bg-primary-container text-on-primary-fixed hover:bg-primary-fixed rounded-lg text-xs font-bold transition-all"
                              >
                                Open Medical Chart
                              </button>
                            )}
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
    </div>
  );
}
