import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock,
  X
} from 'lucide-react';
import { notificationService } from '../../services/notificationService.js';

export const NotificationBellDropdown = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Unread Counter Badge
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 15000, // Poll every 15 seconds
  });

  // Fetch Notifications List when dropdown open
  const { data: notificationData = { notifications: [] }, isLoading } = useQuery({
    queryKey: ['notificationsList', { filter }],
    queryFn: () =>
      notificationService.getNotifications({
        is_read: filter === 'UNREAD' ? 'false' : undefined,
        priority: filter === 'CRITICAL' ? 'CRITICAL' : undefined,
      }),
    enabled: isOpen,
  });

  const notifications = notificationData.notifications || [];

  // Mark single notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      queryClient.invalidateQueries(['unreadNotificationCount']);
    },
  });

  // Mark all notifications as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      queryClient.invalidateQueries(['unreadNotificationCount']);
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      queryClient.invalidateQueries(['unreadNotificationCount']);
    },
  });

  const priorityColorConfig = {
    CRITICAL: { badgeBg: 'bg-red-500 text-white', dotBg: 'bg-red-500' },
    HIGH: { badgeBg: 'bg-amber-500 text-white', dotBg: 'bg-amber-500' },
    MEDIUM: { badgeBg: 'bg-brand-500 text-white', dotBg: 'bg-brand-500' },
    LOW: { badgeBg: 'bg-slate-400 text-white', dotBg: 'bg-slate-400' },
  };

  const handleOpenReference = (notif) => {
    markReadMutation.mutate(notif.id);
    setIsOpen(false);
    if (notif.reference_type === 'JOB_CARD') {
      navigate(`/job-cards`);
    } else if (notif.reference_type === 'BUNDLE') {
      navigate(`/assignment`);
    } else if (notif.reference_type === 'EMPLOYEE') {
      navigate(`/employees/${notif.reference_id}/workspace`);
    } else {
      navigate(`/home`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Notifications & Alert Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-400" />
              <span className="font-extrabold text-xs tracking-wider uppercase">Notifications & Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[11px] font-bold text-slate-300 hover:text-white underline px-1"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
            {['ALL', 'UNREAD', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  filter === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f === 'ALL' && 'All'}
                {f === 'UNREAD' && 'Unread'}
                {f === 'CRITICAL' && 'Critical Alerts'}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-extrabold text-xs text-factory-navy">You're All Caught Up!</p>
                <p className="text-[11px] text-factory-muted">No unread notifications requiring attention.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const priorityConfig = priorityColorConfig[notif.priority] || priorityColorConfig.MEDIUM;

                return (
                  <div
                    key={notif.id}
                    className={`p-3 transition-colors hover:bg-slate-50 flex items-start gap-2.5 ${
                      !notif.is_read ? 'bg-brand-50/40 border-l-4 border-l-brand-600' : ''
                    }`}
                  >
                    <div className="pt-0.5">
                      <span className={`w-2 h-2 rounded-full block ${priorityConfig.dotBg}`} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-factory-navy block">
                          {notif.title}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${priorityConfig.badgeBg}`}>
                          {notif.priority}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-snug">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.created_at).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenReference(notif)}
                            className="p-1 rounded text-brand-600 hover:bg-brand-50 text-[11px] font-bold flex items-center gap-0.5"
                            title="Open related record"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => deleteMutation.mutate(notif.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBellDropdown;
