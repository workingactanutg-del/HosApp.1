'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function PatientProfile() {
  const router = useRouter();

  // States
  const [patient, setPatient] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const localUser = localStorage.getItem('hosapp_user');
    if (!localUser) {
      router.push('/login?role=patient');
      return;
    }

    const userObj = JSON.parse(localUser);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/patient/profile?patient_id=${userObj.id}`, {
          headers: {
            'Authorization': `Bearer ${userObj.token}`
          }
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        
        setPatient(userObj);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setGender(data.gender || 'Male');
        
        if (data.date_of_birth) {
          setDateOfBirth(new Date(data.date_of_birth).toISOString().split('T')[0]);
        }
        
        setBloodGroup(data.blood_group || 'A+');
        setEmergencyContact(data.emergency_contact || '');
        setInsuranceProvider(data.insurance_provider || '');
        setInsurancePolicyNumber(data.insurance_policy_number || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/patient/profile?patient_id=${patient.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient.token}`
        },
        body: JSON.stringify({
          fullName,
          phone,
          gender,
          dateOfBirth,
          bloodGroup,
          emergencyContact,
          insuranceProvider,
          insurancePolicyNumber
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccessMsg('Profile updated successfully!');
      
      // Update local storage user name if it changed
      const localUser = localStorage.getItem('hosapp_user');
      if (localUser) {
        const u = JSON.parse(localUser);
        u.name = fullName;
        localStorage.setItem('hosapp_user', JSON.stringify(u));
        setPatient(u);
      }

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAIAction = (action: string, data: any) => {
    if (action === 'HIGHLIGHT_MAP' && data.target) {
      router.push(`/patient/map?target=${data.target}`);
    } else if (action === 'BOOK_APPOINTMENT') {
      router.push(`/patient/appointments?book=true&doctorId=${data.doctorId}`);
    } else if (action === 'READ_PRESCRIPTION') {
      router.push('/patient/records?tab=prescriptions');
    } else if (action === 'SHOW_REPORTS') {
      router.push('/patient/records?tab=reports');
    } else if (action === 'CALL_EMERGENCY') {
      alert('Emergency services notified!');
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
      <Sidebar role="patient" activeTab="profile" userName={patient?.name || 'Patient'} />

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
            <h2 className="text-2xl font-bold text-primary">Patient Profile Details</h2>
            <p className="text-xs text-on-surface-variant">Update contact demographics, insurance coverage and emergency information.</p>
          </div>

          {/* Success/Error Alerts */}
          {successMsg && (
            <div className="bg-tertiary-container/30 text-on-tertiary-container text-xs p-4 rounded-xl font-medium border border-tertiary-fixed-dim/20 max-w-3xl">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-error-container text-error text-xs p-4 rounded-xl font-medium border border-error/20 max-w-3xl">
              {errorMsg}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="soft-card p-6 space-y-6 max-w-3xl bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account details */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">Account Profile</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email (Locked)</label>
                <input
                  type="email"
                  disabled
                  value={patient?.email || ''}
                  className="w-full px-4 py-2.5 bg-surface-container/50 border-none rounded-xl text-sm text-outline cursor-not-allowed"
                />
              </div>

              {/* Personal Details */}
              <div className="space-y-4 md:col-span-2 pt-2">
                <h3 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">Personal Demographics</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Emergency Contact (Name & Phone)</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              {/* Insurance info */}
              <div className="space-y-4 md:col-span-2 pt-2">
                <h3 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">Insurance Information (Demo)</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Insurance Provider</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Policy Number</label>
                <input
                  type="text"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/30">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs shadow"
              >
                {saveLoading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
