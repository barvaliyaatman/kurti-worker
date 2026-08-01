import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader, CardBody } from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import { ShieldCheck, Mail, Calendar, Key, UserCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        subtitle="Manage account details, permissions, and session info."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Summary Card */}
        <Card className="lg:col-span-1 text-center p-6 flex flex-col items-center">
          <Avatar name={user?.full_name || 'User'} size="xl" status="active" showStatus className="mb-4" />
          <h2 className="text-xl font-bold text-factory-navy">{user?.full_name || 'User Name'}</h2>
          <p className="text-xs text-factory-muted mt-0.5">{user?.email}</p>

          <div className="mt-4">
            <StatusBadge status="active" label={`Role: ${user?.role || 'Owner'}`} />
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between text-factory-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-brand-600" />
                Account Status
              </span>
              <span className="font-bold text-emerald-600">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-factory-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-brand-600" />
                Last Login
              </span>
              <span className="font-semibold text-factory-navy">Today</span>
            </div>
          </div>
        </Card>

        {/* User Details & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Account Details" subtitle="System user specifications" />
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-semibold text-factory-muted uppercase">Full Name</label>
                  <p className="font-bold text-factory-navy mt-0.5">{user?.full_name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-factory-muted uppercase">Email Address</label>
                  <p className="font-bold text-factory-navy mt-0.5">{user?.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-factory-muted uppercase">Assigned Role</label>
                  <p className="font-bold text-brand-600 mt-0.5">{user?.role}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-factory-muted uppercase">Security Token</label>
                  <p className="font-bold text-factory-navy mt-0.5">JWT Authorized (24h)</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Role Permissions & Access Bounds" subtitle="Modules allowed for your user role" />
            <CardBody>
              <div className="space-y-2 text-xs text-factory-navy">
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-brand-900">
                      {user?.role} Access Level
                    </span>
                    {user?.role === 'OWNER' && 'Full administrative authority across all modules.'}
                    {user?.role === 'MANAGER' && 'Management authority over Job Cards, Work Assignment, Salary, and Reports.'}
                    {user?.role === 'CUTTING_MASTER' && 'Access restricted exclusively to Cutting operations.'}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
