'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminBloodBank() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [bloodStock, setBloodStock] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit stock state
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newStockUnits, setNewStockUnits] = useState('0');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async (token: string) => {
    try {
      const resStock = await fetch('/api/blood-bank');
      if (resStock.ok) {
        const dataStock = await resStock.json();
        setBloodStock(dataStock);
      }

      const resReq = await fetch('/api/blood-bank/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (resReq.ok) {
        const dataReq = await resReq.json();
        setBloodRequests(dataReq);
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

    loadData(userObj.token);
  }, [router]);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setActionLoading(true);
    setSuccess('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/blood-bank', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bloodGroup: selectedGroup,
          stockUnits: newStockUnits
        })
      });

      if (!res.ok) throw new Error('Failed to update stock');
      
      setSuccess(`Stock for ${selectedGroup} updated to ${newStockUnits} units.`);
      setSelectedGroup('');
      setNewStockUnits('0');
      loadData(admin.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustUnits = async (group: string, change: number) => {
    const current = bloodStock.find(b => b.blood_group === group);
    if (!current) return;
    const currentStock = current.stock_units;
    const newStock = Math.max(0, currentStock + change);
    
    setActionLoading(true);
    setSuccess('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/blood-bank', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bloodGroup: group,
          stockUnits: newStock
        })
      });

      if (!res.ok) throw new Error('Failed to adjust stock');
      
      setSuccess(`Adjusted ${group} stock to ${newStock} units.`);
      loadData(admin.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    setSuccess('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/blood-bank/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify({
          requestId,
          status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update blood request');

      setSuccess(`Request successfully ${status.toLowerCase()}!`);
      loadData(admin.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const pendingRequests = bloodRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar role="admin" activeTab="blood-bank" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide max-w-5xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">Blood Bank Stock & Requests</h2>
            <p className="text-xs text-on-surface-variant">Vet blood requests from patients and adjust stock inventories.</p>
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

          {/* Pending Patient Requests List */}
          <div className="soft-card overflow-hidden bg-white">
            <div className="p-5 border-b border-outline-variant/30 font-bold text-sm text-primary flex justify-between items-center">
              <span>Patient Blood Requests Queue</span>
              <span className="px-2 py-0.5 bg-secondary-container/20 text-on-secondary-container text-[10px] font-bold uppercase rounded-lg">
                {pendingRequests.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Group Required</th>
                    <th className="px-6 py-3">Units Requested</th>
                    <th className="px-6 py-3">Clinical Indication</th>
                    <th className="px-6 py-3">Request Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-on-surface-variant">
                        No pending blood requests in queue.
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((req) => {
                      const stockAvailable = bloodStock.find(b => b.blood_group === req.blood_group)?.stock_units || 0;
                      const hasSufficientStock = stockAvailable >= req.units;

                      return (
                        <tr key={req.id} className="hover:bg-secondary-container/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-primary">{req.patient_name}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{req.patient_email}</p>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-error">{req.blood_group}</td>
                          <td className="px-6 py-4 font-semibold text-primary">{req.units} Units</td>
                          <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">{req.reason || 'N/A'}</td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {hasSufficientStock ? (
                                <button
                                  onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant hover:opacity-90 font-bold rounded-lg transition-all"
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="px-2.5 py-1.5 bg-error-container text-error text-[10px] font-bold rounded-lg flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">warning</span>
                                  Low Stock
                                </span>
                              )}
                              <button
                                onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Adjustment Form */}
          <form onSubmit={handleUpdateStock} className="soft-card p-6 bg-white space-y-4">
            <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Manual Inventory Override</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Blood Group *</label>
                <select
                  required
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    const current = bloodStock.find(b => b.blood_group === e.target.value);
                    if (current) setNewStockUnits(String(current.stock_units));
                  }}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                >
                  <option value="">-- Choose Blood Group --</option>
                  {bloodStock.map(b => (
                    <option key={b.blood_group} value={b.blood_group}>{b.blood_group}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Stock Level (Units) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newStockUnits}
                  onChange={(e) => setNewStockUnits(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading || !selectedGroup}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs shadow disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Update Stock Units'}
              </button>
            </div>
          </form>

          {/* Blood Stock Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {bloodStock.map((b) => {
              const isLow = b.stock_units < 5;
              return (
                <div key={b.blood_group} className="soft-card p-6 bg-white text-center space-y-3 border border-outline-variant/30">
                  <span className="w-10 h-10 bg-error/10 text-error rounded-full flex items-center justify-center font-extrabold text-sm mx-auto">
                    {b.blood_group}
                  </span>
                  <div>
                    <h4 className="text-xl font-extrabold text-primary mt-1">{b.stock_units} Units</h4>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${isLow ? 'text-error animate-pulse' : 'text-on-tertiary-container'}`}>
                      {isLow ? 'Critical Low' : 'Adequate'}
                    </p>
                  </div>

                  {/* Inline quick + / - adjustment buttons */}
                  <div className="flex gap-2 justify-center pt-2 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => handleAdjustUnits(b.blood_group, -1)}
                      disabled={actionLoading || b.stock_units <= 0}
                      className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold flex items-center justify-center transition-all disabled:opacity-40"
                      title="Decrease by 1"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustUnits(b.blood_group, 1)}
                      disabled={actionLoading}
                      className="w-8 h-8 rounded-lg bg-secondary text-white hover:bg-secondary-container font-bold flex items-center justify-center transition-all"
                      title="Increase by 1"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
