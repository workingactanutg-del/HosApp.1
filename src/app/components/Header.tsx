'use client';

import React, { useState, useEffect } from 'react';
import AIAssistantModal from './AIAssistantModal';

interface HeaderProps {
  userName: string;
  role: 'patient' | 'doctor' | 'admin';
  onActionTriggered?: (action: string, data: any) => void;
}

export default function Header({ userName, role, onActionTriggered }: HeaderProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const localUser = localStorage.getItem('hosapp_user');
      if (!localUser) return;
      const userObj = JSON.parse(localUser);

      const res = await fetch(`/api/notifications?user_id=${userObj.id}`, {
        headers: {
          'Authorization': `Bearer ${userObj.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      const localUser = localStorage.getItem('hosapp_user');
      if (!localUser) return;
      const userObj = JSON.parse(localUser);

      await fetch(`/api/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userObj.token}`
        },
        body: JSON.stringify({ id: null })
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <header className="flex justify-between items-center px-6 w-full sticky top-0 z-40 bg-surface-container-lowest h-20 shadow-sm border-b border-outline-variant/30">
      {/* Search Bar / Welcome */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 text-on-surface hover:bg-surface-container-low rounded-lg"
          onClick={() => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('-translate-x-full');
          }}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative max-w-md hidden sm:block w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg w-full focus:ring-2 focus:ring-secondary text-sm text-on-surface"
            placeholder="Search files, records or schedules..."
            type="text"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-fixed rounded-lg text-xs font-bold hover:bg-primary-fixed transition-all animate-pulse"
        >
          <span className="material-symbols-outlined text-secondary-container text-sm">bolt</span>
          AI Assistant
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-surface-container-low relative transition-colors text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {getUnreadCount() > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface-container-lowest"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant/30 py-3 z-50 animate-zoomIn">
              <div className="flex justify-between items-center px-4 pb-2 border-b border-outline-variant/30">
                <span className="font-bold text-xs text-primary">Notifications</span>
                {getUnreadCount() > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    className="text-[10px] text-secondary font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-hide divide-y divide-outline-variant/30">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-on-surface-variant py-6">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs ${n.read ? 'opacity-70' : 'bg-secondary-container/5 font-semibold'}`}>
                      <p className="text-primary font-bold">{n.title}</p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-outline block mt-1">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User initials bubble */}
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm border border-outline-variant">
          {userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
        </div>
      </div>

      {/* AI Voice Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onOpen={() => setIsAIModalOpen(true)}
        onActionTriggered={(action, data) => {
          if (onActionTriggered) {
            onActionTriggered(action, data);
          }
        }}
      />
    </header>
  );
}
