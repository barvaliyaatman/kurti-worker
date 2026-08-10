import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { Banknote, Hash } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext.jsx';

export const AddPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  summary = {},
  isLoading = false,
}) => {
  const { config } = useConfig();
  const defaultPaymentModeConfig = config.default_payment_mode || 'CASH';

  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState(defaultPaymentModeConfig);
  const [referenceNo, setReferenceNo] = useState('');
  const [formError, setFormError] = useState('');
  const amountRef = useRef(null);

  useEffect(() => {
    if (summary.pending_payment > 0) {
      setAmount(String(summary.pending_payment));
    } else {
      setAmount('');
    }
    setPaymentMode(defaultPaymentModeConfig);
    setReferenceNo('');
    setFormError('');

    if (isOpen) {
      setTimeout(() => {
        if (amountRef.current) amountRef.current.focus();
      }, 100);
    }
  }, [isOpen, summary, config]);

  if (!employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid payment amount greater than 0.');
      return;
    }

    onSubmit({
      amount: numAmount,
      payment_mode: paymentMode,
      reference_no: referenceNo.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disburse Salary Payment: ${employee.employee_name}`}
      subtitle={`Worker Code: ${employee.employee_code} • Pending Net Salary: ₹${(summary.pending_payment || 0).toFixed(2)}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
            ⚠️ {formError}
          </div>
        )}

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold">Pending Net Outstanding Salary:</span>
          <span className="font-extrabold text-emerald-700 text-sm">
            ₹{(summary.pending_payment || 0).toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            ref={amountRef}
            label="Payment Amount (₹) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            icon={Banknote}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#384CF0] outline-none bg-white shadow-2xs"
            >
              <option value="CASH">CASH</option>
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS)</option>
              <option value="CHEQUE">CHEQUE</option>
            </select>
          </div>
        </div>

        <Input
          label="Reference / Transaction No. (Optional)"
          type="text"
          placeholder="e.g. UTR-987654321 or Cheque #123456"
          value={referenceNo}
          onChange={(e) => setReferenceNo(e.target.value)}
          icon={Hash}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading}>
            Disburse Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPaymentModal;
