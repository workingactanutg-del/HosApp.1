'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminDepartments() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [floor, setFloor] = useState('1');

  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadDepts = async () => {
    try {
      const res = await fetch('/api/admin/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
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

    loadDepts();
  }, [router]);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          floor
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create department');

      setSuccess(`Department ${name} added successfully!`);
      setName('');
      setDescription('');
      setFloor('1');
      setShowAddForm(false);
      
      loadDepts();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will unlink any doctors in this department.`)) return;

    try {
      const res = await fetch(`/api/admin/departments?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete department');
      loadDepts();
    } catch (err: any) {
      alert(err.message);
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
      <Sidebar role="admin" activeTab="departments" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Department Configurations</h2>
              <p className="text-xs text-on-surface-variant">Configure hospital wards, levels, and track assigned clinician counts.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-sm">domain_add</span>
              {showAddForm ? 'Hide Form' : 'Add Department'}
            </button>
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

          {/* Add Dept Form Toggleable */}
          {showAddForm && (
            <form onSubmit={handleAddDept} className="soft-card p-6 space-y-4 max-w-xl bg-white animate-zoomIn">
              <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Create Department</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ophthalmology, Oncology"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Floor Level *</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                  >
                    <option value="1">1st Floor (Ground)</option>
                    <option value="2">2nd Floor (Wards)</option>
                    <option value="3">3rd Floor (Specialties)</option>
                    <option value="4">4th Floor (ICU/Labs)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter details of clinical treatments offered..."
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
                  disabled={actionLoading}
                  className="px-5 py-2 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all text-xs"
                >
                  {actionLoading ? 'Creating...' : 'Confirm'}
                </button>
              </div>
            </form>
          )}

          {/* Department Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="soft-card p-6 bg-white flex flex-col justify-between group hover:border-secondary transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 bg-secondary-container/20 text-on-secondary-container text-[9px] font-extrabold uppercase rounded-lg">
                      Floor {dept.floor}
                    </span>
                    <span className="text-[10px] text-outline font-semibold">
                      {dept.doctor_count} Doctors
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-primary">{dept.name}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {dept.description || 'No description logged.'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteDept(dept.id, dept.name)}
                  className="mt-6 flex items-center justify-center gap-1.5 text-xs text-error font-bold border border-error-container hover:bg-error-container/20 py-2 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Remove Department
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
