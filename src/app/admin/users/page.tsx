'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function AdminUsers() {
  const router = useRouter();

  // States
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState(''); // '' for all, 'PATIENT', 'DOCTOR', 'ADMIN'
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('PATIENT');
  
  // Demographics/Spec
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [roomNumber, setRoomNumber] = useState('');
  const [bio, setBio] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async (roleVal = '') => {
    try {
      const res = await fetch(`/api/admin/users?role=${roleVal}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
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

    loadUsers();
  }, [router]);

  const handleRoleFilterChange = (roleVal: string) => {
    setRoleFilter(roleVal);
    loadUsers(roleVal);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          phone,
          gender,
          dateOfBirth,
          bloodGroup,
          specialization,
          roomNumber,
          bio
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setSuccess(`Account for ${fullName} created successfully!`);
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setRoomNumber('');
      setBio('');
      setShowAddForm(false);
      
      // Refresh
      loadUsers(roleFilter);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action is irreversible.`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete user');
      loadUsers(roleFilter);
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
      <Sidebar role="admin" activeTab="users" userName={admin?.name || 'Administrator'} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header userName={admin?.name || 'Administrator'} role="admin" />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">User Management (CRUD)</h2>
              <p className="text-xs text-on-surface-variant">Create, read, and delete hospital staff, doctors, and patient credentials.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              {showAddForm ? 'Hide Form' : 'Register User'}
            </button>
          </div>

          {/* Success/Error Alerts */}
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

          {/* Add User Form Modal */}
          {showAddForm && (
            <form onSubmit={handleAddUser} className="soft-card p-6 space-y-4 max-w-3xl bg-white animate-zoomIn">
              <h3 className="font-bold text-primary text-sm border-b border-outline-variant/30 pb-2">Add New Account</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arthur@hosapp.com"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Account Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 1234"
                    className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                  />
                </div>

                {/* Patient specific */}
                {role === 'PATIENT' && (
                  <>
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
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                      />
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
                  </>
                )}

                {/* Doctor specific */}
                {role === 'DOCTOR' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Specialization</label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm text-on-surface"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Emergency">Emergency Trauma</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="ENT">ENT</option>
                        <option value="Dermatology">Dermatology</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Consultation Room *</label>
                      <input
                        type="text"
                        required
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. 204, 312"
                        className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Short Biography / Credentials</label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Enter doctor clinical training and background..."
                        className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  {actionLoading ? 'Creating...' : 'Register Account'}
                </button>
              </div>
            </form>
          )}

          {/* Directory Filter & Listings */}
          <div className="soft-card overflow-hidden">
            {/* Tabs Filter */}
            <div className="p-4 border-b border-outline-variant/30 flex gap-2">
              <button
                onClick={() => handleRoleFilterChange('')}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                  roleFilter === '' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                All Accounts
              </button>
              <button
                onClick={() => handleRoleFilterChange('PATIENT')}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                  roleFilter === 'PATIENT' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => handleRoleFilterChange('DOCTOR')}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                  roleFilter === 'DOCTOR' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Doctors
              </button>
              <button
                onClick={() => handleRoleFilterChange('ADMIN')}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                  roleFilter === 'ADMIN' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Admins
              </button>
            </div>

            {/* User Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Info/Specialization</th>
                    <th className="px-6 py-3">Registered On</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-on-surface-variant">
                        No user records found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-secondary-container/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-primary">{u.full_name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${
                            u.role === 'ADMIN' ? 'bg-error-container text-error' : u.role === 'DOCTOR' ? 'bg-secondary-container/20 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {u.role === 'DOCTOR' ? (
                            <span className="font-semibold text-secondary">{u.doctor_spec} (Room {u.doctor_room})</span>
                          ) : u.role === 'PATIENT' ? (
                            <span>Phone: {u.patient_phone || 'N/A'} • Blood: {u.patient_blood || 'N/A'}</span>
                          ) : (
                            <span>System Admin Desk</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {u.email !== admin?.email && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
                              className="px-2 py-1 hover:bg-error-container/20 text-error rounded-lg font-bold flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Delete
                            </button>
                          )}
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
