import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { employeeService } from '../../services/employeeService.js';
import { UserCheck, AlertTriangle, Layers, CheckCircle2, Hash, Banknote } from 'lucide-react';

export const AssignmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  bundle = null,
  isLoading = false,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignedSets, setAssignedSets] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch active employees
  const { data: empData } = useQuery({
    queryKey: ['activeEmployeesForAssignment'],
    queryFn: () => employeeService.getEmployees({ status: 'ACTIVE' }),
    enabled: isOpen,
  });

  const employees = empData?.employees || [];

  const remainingSets = bundle ? bundle.total_sets - (bundle.assigned_sets || 0) : 0;
  const stitchingRate = bundle?.job_card?.stitching_rate || 110.0;

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Check if selected worker has active assignments
  const isWorkerBusy = selectedEmployee && selectedEmployee._count?.assignments > 0;

  useEffect(() => {
    if (bundle) {
      setAssignedSets(remainingSets > 0 ? String(remainingSets) : '');
    } else {
      setAssignedSets('');
    }
    setSelectedEmployeeId('');
    setRemarks('');
    setFormError('');
  }, [bundle, isOpen]);

  const numAssigned = parseInt(assignedSets, 10) || 0;
  const projectedRemaining = remainingSets - numAssigned;
  const potentialEarnings = (numAssigned * stitchingRate).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedEmployeeId) {
      setFormError('Please select a worker / employee.');
      return;
    }

    if (!assignedSets || numAssigned <= 0) {
      setFormError('Please enter a valid assigned sets quantity greater than zero.');
      return;
    }

    if (numAssigned > remainingSets) {
      setFormError(`Assigned quantity (${numAssigned}) cannot exceed remaining bundle sets (${remainingSets}).`);
      return;
    }

    onSubmit({
      bundle_id: bundle.id,
      employee_id: selectedEmployeeId,
      assigned_sets: numAssigned,
      remarks: remarks.trim() || null,
    });
  };

  if (!bundle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Bundle: ${bundle.bundle_number}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Bundle Summary Banner */}
        <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-brand-600 bg-white px-2.5 py-1 rounded border border-brand-200">
              Bundle #{bundle.bundle_number}
            </span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ₹{stitchingRate}/Pcs Rate
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div>
              <span className="text-factory-muted block">Design Code</span>
              <span className="font-extrabold text-factory-navy">#{bundle.job_card?.design_code}</span>
            </div>
            <div>
              <span className="text-factory-muted block">Color / Size</span>
              <span className="font-extrabold text-factory-navy">{bundle.color} ({bundle.size})</span>
            </div>
            <div>
              <span className="text-factory-muted block">Available Sets</span>
              <span className="font-black text-emerald-600">{remainingSets} / {bundle.total_sets}</span>
            </div>
          </div>
        </div>

        {/* Select Worker Input */}
        <div>
          <label className="block text-xs font-bold text-factory-navy uppercase tracking-wider mb-1">
            Assign To Worker <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-factory-border bg-slate-50 font-bold text-factory-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">-- Select Active Production Worker --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>

        {/* Busy Worker Warning Banner */}
        {isWorkerBusy && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Worker Has Active Unfinished Tasks</strong>
              <span>
                {selectedEmployee.employee_name} currently has {selectedEmployee._count?.assignments} active assignment(s).
              </span>
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <Input
          label={`Assigned Sets Quantity (Max: ${remainingSets} Sets)`}
          type="number"
          min="1"
          max={remainingSets}
          value={assignedSets}
          onChange={(e) => setAssignedSets(e.target.value)}
          placeholder={`Enter quantity (e.g. ${remainingSets})`}
          required
        />

        {/* Projected Calculation */}
        {numAssigned > 0 && numAssigned <= remainingSets && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-factory-muted font-medium">Job Card Stitching Rate:</span>
              <span className="font-bold text-factory-navy">₹{stitchingRate.toFixed(2)} / Set</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-factory-muted font-medium">Estimated Worker Piece Earnings:</span>
              <span className="font-black text-emerald-600 text-sm">₹{potentialEarnings}</span>
            </div>
          </div>
        )}

        <Input
          label="Assignment Remarks / Special Instructions"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Stitching deadline, quality specifications..."
        />

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Confirm Work Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignmentModal;
