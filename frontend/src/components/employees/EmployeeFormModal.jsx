import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import { User, Phone, Calendar, Hash, FileText } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext.jsx';
import { settingService } from '../../services/settingService.js';

export const EmployeeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  isLoading = false,
}) => {
  const { config } = useConfig();
  const defaultStatus = config.default_employee_status || 'ACTIVE';
  const nameInputRef = useRef(null);

  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setEmployeeCode(employee.employee_code || '');
      setEmployeeName(employee.employee_name || '');
      setPhone(employee.phone || '');
      setJoiningDate(
        employee.joining_date
          ? new Date(employee.joining_date).toISOString().split('T')[0]
          : ''
      );
      setNotes(employee.notes || '');
    } else {
      if (isOpen) {
        settingService.getNextNumberSeries('employee').then((code) => {
          if (code) setEmployeeCode(code);
        }).catch(() => {
          setEmployeeCode(`EMP-1`);
        });
      }
      setEmployeeName('');
      setPhone('');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});

    // Auto-focus on name field
    if (isOpen) {
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [employee, isOpen, config]);

  const validate = () => {
    const errs = {};
    if (!employeeCode.trim()) errs.employeeCode = 'Worker Code is required';
    if (!employeeName.trim()) errs.employeeName = 'Employee Name is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().length < 10) {
      errs.phone = 'Phone number must be at least 10 digits';
    }
    if (!joiningDate) errs.joiningDate = 'Joining Date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      employee_code: employeeCode.trim().toUpperCase(),
      employee_name: employeeName.trim(),
      phone: phone.trim(),
      joining_date: joiningDate,
      status: defaultStatus,
      notes: notes.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `Edit Employee: ${employee.employee_name}` : 'Add New Production Worker'}
      subtitle={employee ? 'Update worker ledger & contact details' : 'Register a new tailor or worker into factory workforce'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Worker Code *"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="EMP-1"
            required
            icon={Hash}
            error={errors.employeeCode}
          />

          <Input
            ref={nameInputRef}
            label="Full Name *"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            required
            icon={User}
            error={errors.employeeName}
          />

          <Input
            label="Phone Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            required
            icon={Phone}
            error={errors.phone}
          />

          <Input
            label="Joining Date *"
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
            icon={Calendar}
            error={errors.joiningDate}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Stitching Specialization</label>
          <textarea
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-factory-navy focus:border-brand-600 outline-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Master Tailor - Kurti Top Stitching Specialist"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {employee ? 'Save Changes' : 'Register Worker'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
