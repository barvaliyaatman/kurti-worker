import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { CreditCard, Banknote } from 'lucide-react';

export const AddAdvanceModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  isLoading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const amountRef = useRef(null);

  useEffect(() => {
    setAmount('');
    setReason('');
    setFormError('');

    if (isOpen) {
      setTimeout(() => {
        if (amountRef.current) amountRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid advance loan amount greater than 0.');
      return;
    }

    onSubmit({
      amount: numAmount,
      reason: reason.trim() || 'Salary advance',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Issue Advance Loan: ${employee.employee_name}`}
      subtitle={`Worker Code: ${employee.employee_code} • Contact: ${employee.phone}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
            ⚠️ {formError}
          </div>
        )}

        <Input
          ref={amountRef}
          label="Advance Amount (₹) *"
          type="number"
          step="1"
          placeholder="e.g. 2000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          icon={Banknote}
        />

        <Input
          label="Reason for Advance Loan"
          type="text"
          placeholder="e.g. Medical emergency, festival advance, family expense"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          icon={CreditCard}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading}>
            Disburse Advance Loan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAdvanceModal;
