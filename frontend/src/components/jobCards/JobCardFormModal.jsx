import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { Hash, Layers, Calendar, Plus, Trash2, CheckCircle2, Banknote, Shirt, Sparkles } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext.jsx';
import { settingService } from '../../services/settingService.js';

const COMPONENTS_LIST = ['Top', 'Pant', 'Top Aster', 'Pant Aster', 'Dupatta', 'Other'];

export const JobCardFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  jobCard = null,
  isLoading = false,
}) => {
  const { config, garmentSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] } = useConfig();
  const SIZES = garmentSizes;
  const isEditing = !!jobCard;

  const defaultStitchingRateConfig = config.default_stitching_rate ? String(config.default_stitching_rate) : '';
  const defaultPriorityConfig = config.default_priority || 'NORMAL';
  const defaultDueDaysConfig = parseInt(config.default_due_days, 10) || 7;

  // Form State
  const [jobCardNumber, setJobCardNumber] = useState('');
  const [designCode, setDesignCode] = useState('');
  const [stitchingRate, setStitchingRate] = useState(defaultStitchingRateConfig);
  const [priority, setPriority] = useState(defaultPriorityConfig);
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Design-wide Components Selection
  const [selectedComponents, setSelectedComponents] = useState([]);

  // Color & Size Rows State
  const [colorRows, setColorRows] = useState([]);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (jobCard) {
      setJobCardNumber(jobCard.job_card_number || '');
      setDesignCode(jobCard.design_code || '');
      setStitchingRate(jobCard.stitching_rate ? String(jobCard.stitching_rate) : defaultStitchingRateConfig);
      setPriority(jobCard.priority || defaultPriorityConfig);
      setDueDate(
        jobCard.due_date
          ? new Date(jobCard.due_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setRemarks(jobCard.remarks || '');

      if (jobCard.components) {
        const comps = typeof jobCard.components === 'string'
          ? jobCard.components.split(',')
          : jobCard.components;
        setSelectedComponents(comps);
      } else {
        setSelectedComponents([]);
      }

      if (jobCard.items && jobCard.items.length > 0) {
        const colorMap = {};
        jobCard.items.forEach((item, index) => {
          const colorKey = item.color || 'Default';
          if (!colorMap[colorKey]) {
            colorMap[colorKey] = {
              id: index + 1,
              color: colorKey,
              sizes: {},
            };
          }
          colorMap[colorKey].sizes[item.size] = item.quantity;
        });
        setColorRows(Object.values(colorMap));
      } else {
        setColorRows([]);
      }
    } else {
      if (isOpen) {
        settingService.getNextNumberSeries('job-card').then((num) => {
          if (num) setJobCardNumber(num);
        }).catch(() => {
          setJobCardNumber(`JC-1`);
        });
      }
      setDesignCode('');
      setStitchingRate(defaultStitchingRateConfig);
      setPriority(defaultPriorityConfig);
      setDueDate(new Date(Date.now() + defaultDueDaysConfig * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRemarks('');
      setSelectedComponents([]);
      setColorRows([]);
    }
    setFormError('');
  }, [jobCard, isOpen, config]);

  const toggleComponent = (comp) => {
    if (selectedComponents.includes(comp)) {
      setSelectedComponents(selectedComponents.filter((c) => c !== comp));
    } else {
      setSelectedComponents([...selectedComponents, comp]);
    }
  };

  const handleAddColorRow = () => {
    const newId = colorRows.length > 0 ? Math.max(...colorRows.map((r) => r.id)) + 1 : 1;
    setColorRows([...colorRows, { id: newId, color: '', sizes: {} }]);
  };

  const handleRemoveColorRow = (id) => {
    setColorRows(colorRows.filter((r) => r.id !== id));
  };

  const handleColorChange = (id, newColor) => {
    setColorRows(
      colorRows.map((row) => (row.id === id ? { ...row, color: newColor } : row))
    );
  };

  const handleSizeQtyChange = (rowId, size, qty) => {
    setColorRows(
      colorRows.map((row) => {
        if (row.id === rowId) {
          const newSizes = { ...row.sizes };
          const val = parseInt(qty, 10);
          if (isNaN(val) || val <= 0) {
            delete newSizes[size];
          } else {
            newSizes[size] = val;
          }
          return { ...row, sizes: newSizes };
        }
        return row;
      })
    );
  };

  // Calculate Row Total
  const getRowTotal = (sizes) => {
    return Object.values(sizes).reduce((sum, q) => sum + (parseInt(q, 10) || 0), 0);
  };

  // Calculate Overall Total Quantity Across Colors & Sizes
  const totalQuantity = colorRows.reduce((sum, row) => sum + getRowTotal(row.sizes), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!jobCardNumber.trim()) {
      setFormError('Job Card Number is required.');
      return;
    }
    if (!designCode.trim()) {
      setFormError('Please enter Design Code.');
      return;
    }
    if (!stitchingRate || parseFloat(stitchingRate) <= 0) {
      setFormError('Please enter Stitching Rate per finished piece.');
      return;
    }
    if (selectedComponents.length === 0) {
      setFormError('Please select at least one garment production component (e.g., Top, Pant).');
      return;
    }
    if (colorRows.length === 0) {
      setFormError('Please click "+ Add Color Row" to add at least one color breakdown row.');
      return;
    }

    const items = [];
    let hasValidQuantity = false;

    colorRows.forEach((row) => {
      const colorName = row.color.trim();
      if (colorName) {
        Object.entries(row.sizes).forEach(([size, qty]) => {
          const quantity = parseInt(qty, 10);
          if (quantity > 0) {
            hasValidQuantity = true;
            items.push({
              color: colorName,
              size,
              quantity,
            });
          }
        });
      }
    });

    if (!hasValidQuantity || items.length === 0) {
      setFormError('Please enter Color Name and at least one size quantity greater than zero.');
      return;
    }

    const payload = {
      job_card_number: jobCardNumber.trim().toUpperCase(),
      design_code: designCode.trim().toUpperCase(),
      stitching_rate: parseFloat(stitchingRate),
      components: selectedComponents,
      priority,
      due_date: dueDate,
      remarks,
      items,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Job Card: ${jobCard?.job_card_number}` : 'Create Production Job Card'}
      subtitle="Define garment design specifications, stitching rates, and color-size breakdown"
      maxWidth="max-w-[92vw] lg:max-w-7xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 py-2">
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center justify-between shadow-xs">
            <span>⚠️ {formError}</span>
            <button
              type="button"
              onClick={() => setFormError('')}
              className="text-red-500 hover:text-red-800 text-xs font-extrabold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. TOP DYNAMIC PARAMETERS ROW (5-Column Single Desktop Row) */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-factory-navy uppercase tracking-wider flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-brand-600" />
              <span>Job Card Specifications</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Auto Generated Number & Configurable Defaults
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Input
                label="Job Card #"
                value={jobCardNumber}
                onChange={(e) => setJobCardNumber(e.target.value)}
                placeholder="JC-1"
                required
                disabled={isEditing}
                icon={Hash}
              />
            </div>

            <div>
              <Input
                label="Design Code *"
                value={designCode}
                onChange={(e) => setDesignCode(e.target.value)}
                placeholder="Enter Design Code"
                required
                icon={Layers}
              />
            </div>

            <div>
              <Input
                label="Stitching Rate (₹/Pcs) *"
                type="number"
                step="0.5"
                value={stitchingRate}
                onChange={(e) => setStitchingRate(e.target.value)}
                placeholder="Enter Stitching Rate"
                required
                icon={Banknote}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-factory-navy focus:border-brand-600 outline-none bg-white shadow-2xs"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <Input
                label="Due Date *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                icon={Calendar}
              />
            </div>
          </div>

          {/* Remarks / Fabric Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Fabric & Production Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks or fabric specifications (Optional)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-factory-navy focus:border-brand-600 outline-none bg-white"
            />
          </div>
        </div>

        {/* 2. PRODUCTION COMPONENTS CHECKLIST SECTION */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-factory-navy uppercase tracking-wider block">
              Garment Production Components Checklist *
            </label>
            <span className="text-[11px] text-slate-500 font-semibold">
              Selected: <strong className="text-brand-600">{selectedComponents.length} Components</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMPONENTS_LIST.map((comp) => {
              const isSelected = selectedComponents.includes(comp);
              return (
                <button
                  type="button"
                  key={comp}
                  onClick={() => toggleComponent(comp)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{comp}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. COLOR & SIZE QUANTITY BREAKDOWN (Dynamic Master Size Columns Grid) */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="text-xs font-extrabold text-factory-navy uppercase tracking-wider">
                  Color & Dynamic Size Quantity Matrix *
                </h4>
                <p className="text-xs text-factory-muted">
                  Dynamic size catalog configured from System Settings
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Total Quantity:</span>
                <span className="text-sm font-extrabold text-emerald-700">{totalQuantity} Pieces</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddColorRow}
            >
              Add Color Row
            </Button>
          </div>

          {/* EMPTY STATE IF NO COLOR ROWS ADDED */}
          {colorRows.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
              <p className="text-xs font-bold text-slate-600">No Color Rows Added</p>
              <p className="text-[11px] text-slate-400">
                Click <strong className="text-brand-600">+ Add Color Row</strong> to enter fabric color names and size breakdown quantities.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP DYNAMIC SIZE TABLE GRID */}
              <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Color Name *</th>
                      {SIZES.map((sz) => (
                        <th key={sz} className="py-2.5 px-2 text-center min-w-[80px]">
                          {sz}
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-center min-w-[100px] bg-slate-100/70">Row Total</th>
                      <th className="py-2.5 px-2 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {colorRows.map((row, idx) => {
                      const rowTotal = getRowTotal(row.sizes);
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 font-extrabold text-slate-400 text-center">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.color}
                              onChange={(e) => handleColorChange(row.id, e.target.value)}
                              placeholder="Enter Color Name"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-factory-navy focus:border-brand-600 outline-none"
                            />
                          </td>
                          {SIZES.map((sz) => (
                            <td key={sz} className="py-2 px-1.5 text-center">
                              <input
                                type="number"
                                min="0"
                                value={row.sizes[sz] || ''}
                                onChange={(e) => handleSizeQtyChange(row.id, sz, e.target.value)}
                                placeholder="0"
                                className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-factory-navy focus:border-brand-600 outline-none"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3 text-center font-extrabold text-brand-700 bg-slate-50/50">
                            {rowTotal} Pcs
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveColorRow(row.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Color Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE RESPONSIVE CARD STACK */}
              <div className="sm:hidden space-y-3">
                {colorRows.map((row, idx) => (
                  <div key={row.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-400">Color Row #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColorRow(row.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={row.color}
                      onChange={(e) => handleColorChange(row.id, e.target.value)}
                      placeholder="Enter Color Name"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {SIZES.map((sz) => (
                        <div key={sz} className="text-center">
                          <span className="text-[10px] text-slate-400 font-bold block">{sz}</span>
                          <input
                            type="number"
                            min="0"
                            value={row.sizes[sz] || ''}
                            onChange={(e) => handleSizeQtyChange(row.id, sz, e.target.value)}
                            className="w-full text-center px-1 py-1 rounded border border-slate-200 text-xs font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 4. STICKY ACTIONS FOOTER */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 bg-white">
          <div className="text-xs text-slate-500 font-semibold">
            Ready to process: <strong className="text-factory-navy">{totalQuantity} Pieces</strong> across <strong className="text-factory-navy">{colorRows.length} Colors</strong>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEditing ? 'Update Job Card' : 'Create Job Card'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default JobCardFormModal;
