'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          gender,
          dateOfBirth,
          bloodGroup,
          emergencyContact,
          insuranceProvider,
          insurancePolicyNumber
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?role=patient');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-background py-12 px-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-outline-variant/30 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary text-3xl font-bold">local_hospital</span>
            <span className="text-2xl font-bold text-primary tracking-tight">HOSAPP</span>
          </a>
          <p className="text-on-primary-container text-xs font-semibold uppercase tracking-wider">Patient Registration Portal</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-tertiary-container/30 text-on-tertiary-container text-xs p-4 rounded-xl font-medium border border-tertiary-fixed-dim/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-tertiary-container">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error-container text-error text-xs p-4 rounded-xl font-medium border border-error/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Credentials */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">Account Information</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="James D. Miller"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="james@example.com"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            {/* Demographics */}
            <div className="space-y-4 md:col-span-2 pt-2">
              <h3 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">Personal Details</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 987 654"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm text-on-surface"
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
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm text-on-surface"
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
                placeholder="Jane Miller (+1 555 123 456)"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            {/* Insurance Info */}
            <div className="space-y-4 md:col-span-2 pt-2">
              <h3 className="text-sm font-bold text-primary border-b border-outline-variant/30 pb-2">Insurance Information (Demo)</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Insurance Provider</label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="BlueCross Health"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Policy Number</label>
              <input
                type="text"
                value={insurancePolicyNumber}
                onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                placeholder="BC-99887711"
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/30">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Create Account</span>
                </>
              )}
            </button>
            
            <div className="text-center text-xs text-on-surface-variant font-semibold">
              Already have an account?{' '}
              <a href="/login?role=patient" className="text-secondary hover:underline">
                Sign in here
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
