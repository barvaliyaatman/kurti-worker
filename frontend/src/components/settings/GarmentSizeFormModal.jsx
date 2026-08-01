import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export const GarmentSizeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  sizeObj = null,
  isLoading = false,
}) => {
  const [sizeName, setSizeName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sizeObj) {
      setSizeName(sizeObj.size_name || '');
      setDisplayOrder(String(sizeObj.display_order ?? 0));
      setIsActive(sizeObj.is_active ?? true);
    } else {
      setSizeName('');
      setDisplayOrder('0');
      setIsActive(true);
    }
    setError('');
  }, [sizeObj, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!sizeName.trim()) {
      setError('Size Name is required (e.g., 3XL, Free Size, 28).');
      return;
    }

    onSubmit({
      size_name: sizeName.trim(),
      display_order: parseInt(displayOrder, 10) || 0,
      is_active: isActive,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sizeObj ? `Edit Garment Size: ${sizeObj.size_name}` : 'Add New Garment Size'}
      subtitle="Define custom size names and display sort order for production forms"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Size Name (e.g. 3XL, Free Size, 28) *"
          value={sizeName}
          onChange={(e) => setSizeName(e.target.value)}
          placeholder="e.g. 3XL or Free Size"
          required
        />

        <Input
          label="Display Sort Order (Integer)"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          placeholder="e.g. 7"
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_active_chk"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-slate-300"
          />
          <label htmlFor="is_active_chk" className="text-xs font-bold text-slate-700 cursor-pointer">
            Active Size (Visible on Job Card forms & matrices)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {sizeObj ? 'Update Size' : 'Save Size'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GarmentSizeFormModal;
