import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold text-factory-navy">{title}</h4>
        <p className="text-xs text-factory-muted mt-1 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
