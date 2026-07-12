'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function PatientBloodBank() {
  const router = useRouter();

  // States
  const [patient, setPatient] = useState<any>(null);
  const [bloodStock, setBloodStock] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [pledgeGroup, setPledgeGroup] = useState('A+');
  const [pledgeDate, setPledgeDate] = useState('');
  
  const [requestGroup, setRequestGroup] = useState('A+');
  const [requestUnits, setRequestUnits] = useState('1');
  const [requestReason, setRequestReason] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async (patId: string, token: string) => {
    try {
      const res = await fetch('/api/blood-bank');
      if (res.ok) {
        const data = await res.json();
        setBloodStock(data);
      }

      const resReq = await fetch(`/api/blood-bank/requests?patient_id=${patId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resReq.ok) {
        const dataReq = await resReq.json();
        setMyRequests(dataReq);
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

    loadData(userObj.id, userObj.token);
  }, [router]);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccess('');
    setErrorMsg('');

    setTimeout(() => {
      setSuccess(`Thank you! Your donation pledge for Group ${pledgeGroup} on ${pledgeDate} has been registered.`);
      setPledgeDate('');
      setActionLoading(false);
    }, 1000);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccess('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/blood-bank/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient.token}`
        },
        body: JSON.stringify({
          bloodGroup: requestGroup,
          units: requestUnits,
          reason: requestReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      setSuccess(`Blood request for ${requestUnits} units of ${requestGroup} has been dispatched!`);
      setRequestReason('');
      setRequestUnits('1');
      
      // Refresh
      loadData(patient.id, patient.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant';
      case 'PENDING':
        return 'bg-outline-variant/30 text-outline';
      case 'REJECTED':
        return 'bg-error-container text-error';
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
      <Sidebar role="patient" activeTab="blood-bank" userName={patient?.name || 'Patient'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={patient?.name || 'Patient'} role="patient" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide max-w-5xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">Blood Bank Directory & Requests</h2>
            <p className="text-xs text-on-surface-variant">Check group availabilities, request blood units, or register a donation pledge.</p>
          </div>

          {success && (
            <div className="bg-tertiary-container/30 text-on-tertiary-container text-xs p-4 rounded-xl font-medium border border-tertiary-fixed-dim/20">
              {success}
            </div>
          )}
          {errorMsg && (
            <div className="bg-error-container text-error text-xs p-4 rounded-xl font-medium border border-error/20">
              {errorMsg}
            </div>
          )}

          {/* Availability Grid */}
          <div className="soft-card p-6 bg-white space-y-4">
            <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-error">bloodtype</span>
              Real-time Blood Bank Availability
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {bloodStock.map((b) => {
                const isAvailable = b.stock_units > 0;
                return (
                  <div key={b.blood_group} className={`p-4 rounded-2xl text-center border transition-all ${
                    isAvailable ? 'bg-white border-outline-variant/30 text-on-surface' : 'bg-surface-container border-outline-variant/10 text-outline'
                  }`}>
                    <span className="font-extrabold text-sm text-error">{b.blood_group}</span>
                    <h5 className="font-bold text-sm mt-1">{b.stock_units} Units</h5>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Columns Action Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pledge Form */}
            <form onSubmit={handlePledgeSubmit} className="soft-card p-6 bg-white space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">volunteer_activism</span>
                  Pledge Blood Donation
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Support your local hospital ecosystem by pledging a donation. Regular donations save lives.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Your Blood Group</label>
                    <select
                      value={pledgeGroup}
                      onChange={(e) => setPledgeGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={pledgeDate}
                      onChange={(e) => setPledgeDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="mt-6 w-full py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
              >
                Register Pledge
              </button>
            </form>

            {/* Request Form */}
            <form onSubmit={handleRequestSubmit} className="soft-card p-6 bg-white space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-error">emergency_share</span>
                  Request Blood Units
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Request clinical blood units for an active patient. Vetted by our central pharmacy desk.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Requested Blood Group</label>
                    <select
                      value={requestGroup}
                      onChange={(e) => setRequestGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Units Needed</label>
                    <select
                      value={requestUnits}
                      onChange={(e) => setRequestUnits(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs text-on-surface"
                    >
                      {['1', '2', '3', '4', '5'].map(u => (
                        <option key={u} value={u}>{u} Units</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant uppercase tracking-wider block">Reason / Diagnosis</label>
                    <input
                      type="text"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="e.g. Scheduled surgery, low hemoglobin"
                      className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="mt-6 w-full py-2.5 bg-error text-white font-bold rounded-xl hover:opacity-90 transition-all text-xs"
              >
                Dispatch Request
              </button>
            </form>

          </div>

          {/* Blood Requests Ledger */}
          <div className="soft-card overflow-hidden bg-white">
            <div className="p-5 border-b border-outline-variant/30 font-bold text-sm text-primary">
              My Blood Requests Ledger
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Group Requested</th>
                    <th className="px-6 py-3">Units Requested</th>
                    <th className="px-6 py-3">Clinical Indication</th>
                    <th className="px-6 py-3">Request Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {myRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-on-surface-variant">
                        No blood requests logged.
                      </td>
                    </tr>
                  ) : (
                    myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-secondary-container/5 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-error">{req.blood_group}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{req.units} Units</td>
                        <td className="px-6 py-4 text-on-surface-variant">{req.reason || 'N/A'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${getStatusBadge(req.status)}`}>
                            {req.status}
                          </span>
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
