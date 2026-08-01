import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export const NotificationWidget = () => {
  const navigate = useNavigate();

  const { data: notificationData = { notifications: [] }, isLoading } = useQuery({
    queryKey: ['dashboardNotificationWidget'],
    queryFn: () => notificationService.getNotifications({ limit: 5 }),
    refetchInterval: 20000,
  });

  const notifications = notificationData.notifications || [];
  const criticalCount = notifications.filter((n) => n.priority === 'CRITICAL' || n.priority === 'HIGH').length;

  const priorityColorConfig = {
    CRITICAL: 'bg-red-500 text-white',
    HIGH: 'bg-amber-500 text-white',
    MEDIUM: 'bg-brand-500 text-white',
    LOW: 'bg-slate-400 text-white',
  };

  return (
    <Card className="p-5 space-y-4 border border-factory-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-factory-navy">
              Live Notifications & Alert Center
            </h3>
            <p className="text-xs text-factory-muted">
              System alerts, status changes, and critical factory action items
            </p>
          </div>
        </div>

        {criticalCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <ShieldAlert className="w-4 h-4" />
            <span>{criticalCount} Critical</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-xs font-bold text-slate-400">
          Loading notification feed...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-6 text-center space-y-1 bg-slate-50 rounded-xl border border-slate-200/80">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
          <p className="font-extrabold text-xs text-factory-navy">No Active Alerts</p>
          <p className="text-[11px] text-factory-muted">Factory operations are running smoothly.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.slice(0, 4).map((notif) => {
            const badgeBg = priorityColorConfig[notif.priority] || priorityColorConfig.MEDIUM;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.reference_type === 'JOB_CARD') navigate('/job-cards');
                  else if (notif.reference_type === 'BUNDLE') navigate('/assignment');
                  else if (notif.reference_type === 'EMPLOYEE') navigate(`/employees/${notif.reference_id}/workspace`);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  !notif.is_read
                    ? 'bg-brand-50/50 border-brand-200 hover:border-brand-400'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-factory-navy">
                      {notif.title}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${badgeBg}`}>
                      {notif.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{notif.message}</p>
                </div>

                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default NotificationWidget;
