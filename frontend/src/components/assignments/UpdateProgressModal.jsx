import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { CheckCircle2, Hash, ArrowUpRight } from 'lucide-react';

export const UpdateProgressModal = ({
  isOpen,
  onClose,
  onSubmit,
  assignment = null,
  isLoading = false,
}) => {
  const [completedSets, setCompletedSets] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (assignment) {
      setCompletedSets(String(assignment.completed_sets || 0));
      setNotes('');
    } else {
      setCompletedSets('');
    }
    setFormError('');
  }, [assignment, isOpen]);

  if (!assignment) return null;

  const {
    id,
    assigned_sets,
    completed_sets: currentCompleted,
    employee,
    bundle,
  } = assignment;

  const stitchingRate = assignment.stitching_rate || bundle?.job_card?.stitching_rate || 110.0;

  const numCompleted = parseInt(completedSets, 10) || 0;
  const earnings = (numCompleted * stitchingRate).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (numCompleted < 0) {
      setFormError('Completed quantity cannot be negative.');
      return;
    }

    if (numCompleted > assigned_sets) {
      setFormError(`Completed quantity (${numCompleted}) cannot exceed assigned sets (${assigned_sets}).`);
      return;
    }

    onSubmit({
      id,
      completed_sets: numCompleted,
      notes: notes.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Progress: ${employee?.employee_name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Header Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-factory-navy">
              Bundle #{bundle?.bundle_number}
            </span>
            <span className="font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Design #{bundle?.job_card?.design_code}
            </span>
          </div>

          <div className="flex items-center justify-between font-bold pt-1 border-t border-slate-200/60">
            <span className="text-factory-muted">Assigned Total:</span>
            <span className="text-factory-navy">{assigned_sets} Sets</span>
          </div>
        </div>

        {/* Input Completed Quantity */}
        <Input
          label={`Completed Quantity (0 to ${assigned_sets} Sets)`}
          type="number"
          min="0"
          max={assigned_sets}
          value={completedSets}
          onChange={(e) => setCompletedSets(e.target.value)}
          placeholder="Enter completed sets count"
          required
        />

        {/* Calculated Earnings Preview */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 font-medium">
            <span>Job Card Stitching Rate:</span>
            <span className="font-extrabold">₹{stitchingRate.toFixed(2)} / Set</span>
          </div>
          <div className="flex items-center justify-between text-emerald-950 font-bold text-sm">
            <span>Earned Amount:</span>
            <span className="text-emerald-700 font-black">₹{earnings}</span>
          </div>
        </div>

        <Input
          label="Progress Notes / Remarks (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Finished 30 sets today, remaining 20 sets tomorrow..."
        />

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Update Progress
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateProgressModal;
