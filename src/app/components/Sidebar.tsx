'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'patient' | 'doctor' | 'admin';
  activeTab: string;
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ role, activeTab, userName = 'User Profile', userEmail = '' }: SidebarProps) {
  const router = useRouter();

  // Alert Badge States
  const [alerts, setAlerts] = useState({ pendingAppointments: 0, pendingBloodRequests: 0, dirtyBeds: 0 });

  const fetchAlerts = async () => {
    try {
      const localUser = localStorage.getItem('hosapp_user');
      if (!localUser) return;
      const userObj = JSON.parse(localUser);

      const res = await fetch('/api/admin/sidebar-alerts', {
        headers: {
          'Authorization': `Bearer ${userObj.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts({
          pendingAppointments: data.pendingAppointments || 0,
          pendingBloodRequests: data.pendingBloodRequests || 0,
          dirtyBeds: data.dirtyBeds || 0
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll sidebar alerts count every 15 seconds
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Role-specific navigation items
  const navItems = {
    patient: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/patient/dashboard' },
      { id: 'appointments', label: 'Appointments', icon: 'event', path: '/patient/appointments' },
      { id: 'records', label: 'Medical Records', icon: 'assignment', path: '/patient/records' },
      { id: 'med-tools', label: 'Med Tools', icon: 'medication_liquid', path: '/patient/med-tools' },
      { id: 'map', label: 'Hospital Map', icon: 'map', path: '/patient/map' },
      { id: 'blood-bank', label: 'Blood Bank', icon: 'vaccines', path: '/patient/blood-bank' },
      { id: 'profile', label: 'Profile', icon: 'person', path: '/patient/profile' },
    ],
    doctor: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/doctor/dashboard' },
      { id: 'patients', label: 'Patients', icon: 'person_2', path: '/doctor/patients' },
      { id: 'beds', label: 'Bed Allocations', icon: 'bed', path: '/doctor/beds' },
      { id: 'appointments', label: 'Appointments', icon: 'event', path: '/doctor/appointments' },
      { id: 'consultation', label: 'Consultation', icon: 'edit_document', path: '/doctor/consultation' },
      { id: 'availability', label: 'Availability', icon: 'schedule', path: '/doctor/availability' },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
      { id: 'users', label: 'User Management', icon: 'group', path: '/admin/users' },
      { id: 'beds', label: 'Beds Management', icon: 'bed', path: '/admin/beds' },
      { id: 'blood-bank', label: 'Blood Bank', icon: 'vaccines', path: '/admin/blood-bank' },
      { id: 'departments', label: 'Departments', icon: 'domain', path: '/admin/departments' },
      { id: 'appointments', label: 'Appointments', icon: 'event', path: '/admin/appointments' },
      { id: 'analytics', label: 'Analytics', icon: 'analytics', path: '/admin/analytics' },
    ],
  };

  const handleLogout = () => {
    // Clear user details from localStorage
    localStorage.removeItem('hosapp_user');
    router.push('/login');
  };

  const items = navItems[role] || [];

  // Get user avatar display initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="docked left-0 h-screen w-64 bg-primary text-on-primary flex flex-col py-md z-50 fixed md:relative transition-transform duration-300 -translate-x-full md:translate-x-0" id="sidebar">
      {/* Header */}
      <div className="px-lg mb-xl mt-4 flex items-center gap-3 pl-4">
        <img src="/favicon.png" alt="HOSAPP Logo" className="w-8 h-8 object-contain" />
        <div>
          <h1 className="text-xl font-black tracking-tight text-white leading-none">HOSAPP</h1>
          <p className="text-on-primary-container text-[9px] font-bold uppercase tracking-wider mt-1">
            {role === 'admin' ? 'HMS Admin' : role === 'doctor' ? 'HMS Doctor' : 'Patient Portal'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg mx-2 my-1 transition-colors group ${
                isActive
                  ? 'text-on-secondary-container bg-secondary-container font-semibold'
                  : 'text-on-primary-container hover:bg-on-primary-fixed-variant/10 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className={`material-symbols-outlined mr-3 ${isActive ? 'text-on-secondary-container' : 'text-on-primary-container'}`}>
                  {item.icon}
                </span>
                <span className="font-body-md text-sm">{item.label}</span>
              </div>

              {/* Glowing notification badge */}
              {((item.id === 'appointments' && alerts.pendingAppointments > 0) ||
                (item.id === 'blood-bank' && role === 'admin' && alerts.pendingBloodRequests > 0) ||
                (item.id === 'beds' && role === 'admin' && alerts.dirtyBeds > 0)) && (
                <span className="w-2.5 h-2.5 bg-error rounded-full animate-pulse shadow-[0_0_8px_#ff4d4d]" title="Pending Vetting Requests"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto px-4 pt-4 border-t border-on-primary-fixed-variant/20">
        {role !== 'patient' && (
          <button 
            onClick={() => router.push(`/${role}/dashboard?emergency=true`)}
            className="w-full py-3 px-4 bg-error text-white rounded-lg font-bold flex items-center justify-center mb-4 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined mr-2">emergency</span>
            Emergency Entry
          </button>
        )}
        
        <div className="space-y-1">
          {role === 'admin' && (
            <Link 
              href="/admin/settings" 
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-on-primary-fixed-variant/20 text-white' : 'text-on-primary-container hover:bg-on-primary-fixed-variant/10'}`}
            >
              <span className="material-symbols-outlined mr-3">settings</span>
              <span className="font-body-md text-sm">Settings</span>
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-on-primary-container hover:bg-on-primary-fixed-variant/10 hover:text-error rounded-lg transition-colors text-left"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="font-body-md text-sm">Logout</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="mt-6 mb-4 flex items-center px-2 py-3 bg-on-primary-fixed-variant/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
            {getInitials(userName)}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{userName}</p>
            <p className="text-on-primary-container text-xs truncate capitalize">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
