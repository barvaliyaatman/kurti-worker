import React, { useState, useEffect } from 'react';
import { Hash, Layers, Calendar, Plus, Trash2, CheckCircle2, Banknote, Shirt, Sparkles, ArrowLeft, X, Edit, Check } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext.jsx';
import { settingService } from '../../services/settingService.js';
import Button from '../ui/Button.jsx';

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

  const defaultStitchingRateConfig = config.default_stitching_rate ? String(config.default_stitching_rate) : '110.0';
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

  // Add/Edit Color Bottom Sheet State
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('add'); // 'add' | 'edit'
  const [editingRowId, setEditingRowId] = useState(null);
  const [sheetColorName, setSheetColorName] = useState('');
  const [sheetSizes, setSheetSizes] = useState({});

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
          setJobCardNumber(`JC-${Math.floor(1000 + Math.random() * 9000)}`);
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

  const getRowTotal = (sizes) => {
    return Object.values(sizes).reduce((sum, q) => sum + (parseInt(q, 10) || 0), 0);
  };

  const totalQuantity = colorRows.reduce((sum, row) => sum + getRowTotal(row.sizes), 0);

  // Stepper adjustments for Bottom Sheet
  const handleStepSize = (size, increment) => {
    const currentVal = parseInt(sheetSizes[size] || 0, 10);
    const newVal = Math.max(0, currentVal + increment);
    setSheetSizes({ ...sheetSizes, [size]: newVal });
  };

  const openAddColorSheet = () => {
    setSheetMode('add');
    setSheetColorName('');
    setSheetSizes({});
    setColorSheetOpen(true);
  };

  const openEditColorSheet = (row) => {
    setSheetMode('edit');
    setEditingRowId(row.id);
    setSheetColorName(row.color);
    setSheetSizes({ ...row.sizes });
    setColorSheetOpen(true);
  };

  const saveColorSheet = () => {
    if (!sheetColorName.trim()) {
      alert('Color Name is required');
      return;
    }

    if (sheetMode === 'add') {
      const newId = colorRows.length > 0 ? Math.max(...colorRows.map((r) => r.id)) + 1 : 1;
      setColorRows([...colorRows, { id: newId, color: sheetColorName.trim(), sizes: sheetSizes }]);
    } else {
      setColorRows(colorRows.map(r => r.id === editingRowId ? { ...r, color: sheetColorName.trim(), sizes: sheetSizes } : r));
    }
    setColorSheetOpen(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!jobCardNumber.trim()) {
      setFormError('Job Card Number is required.');
      return;
    }
    if (!designCode.trim()) {
      setFormError('Please select or enter Design Code.');
      return;
    }
    if (!stitchingRate || parseFloat(stitchingRate) <= 0) {
      setFormError('Please enter Stitching Rate per finished piece.');
      return;
    }
    if (selectedComponents.length === 0) {
      setFormError('Please select at least one garment production component.');
      return;
    }
    if (colorRows.length === 0) {
      setFormError('Please add at least one color breakdown card.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-50 flex flex-col font-sans select-none overflow-hidden h-full">
      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-30 bg-[#0B132B] text-white h-14 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="font-extrabold text-sm tracking-tight">
            {isEditing ? `Edit Job Card` : 'Create Job Card'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3.5 py-1.5 bg-[#384CF0] hover:bg-[#2a3bdb] text-white text-xs font-bold rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── DYNAMIC FORM SCROLL BODY ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-32">
        {formError && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between">
            <span>⚠️ {formError}</span>
            <button type="button" onClick={() => setFormError('')} className="text-red-500 font-extrabold text-xs">✕</button>
          </div>
        )}

        {/* ═══ CARD 1: BASIC DETAILS ═══ */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shirt className="w-4 h-4 text-[#384CF0]" /> Basic Details
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Job Card # (Read-only)</label>
                <input
                  type="text"
                  value={jobCardNumber}
                  disabled
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Stitching Rate (₹/Pcs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={stitchingRate}
                  onChange={(e) => setStitchingRate(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#384CF0] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#384CF0] outline-none bg-white"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#384CF0] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Design Code *</label>
                <input
                  type="text"
                  value={designCode}
                  onChange={(e) => setDesignCode(e.target.value)}
                  placeholder="Enter Design Code"
                  required
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#384CF0] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Fabric & Production Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter special notes..."
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-[#384CF0] outline-none"
                />
              </div>
            </div>
          </div>
        </div>


        {/* ═══ CARD 3: COMPONENTS CHECKLIST ═══ */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#384CF0]" /> Production Components
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {COMPONENTS_LIST.map((comp) => {
              const isSelected = selectedComponents.includes(comp);
              return (
                <button
                  type="button"
                  key={comp}
                  onClick={() => toggleComponent(comp)}
                  className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-50 border-[#384CF0] text-[#384CF0] shadow-2xs'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#384CF0] border-[#384CF0] text-white' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{comp}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ CARD 4: COLOR & SIZE BREAKDOWN ═══ */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#384CF0]" /> Fabric Color Cards
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Total: {totalQuantity} Pcs</span>
          </div>

          {colorRows.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-slate-600">No color variations added</p>
              <p className="text-[10px] text-slate-400">Use the floating button below to add color cards.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {colorRows.map((row, idx) => {
                const rowTotal = getRowTotal(row.sizes);
                return (
                  <div key={row.id} className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: row.color.toLowerCase() === 'black' ? '#000' : row.color.toLowerCase() === 'white' ? '#fff' : row.color.toLowerCase() === 'blue' ? '#3b82f6' : row.color.toLowerCase() === 'red' ? '#ef4444' : '#94a3b8', border: '1px solid #cbd5e1' }} />
                        <span className="text-xs font-extrabold text-slate-800">{row.color}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openEditColorSheet(row)} className="p-1 hover:bg-slate-200/60 rounded text-slate-500"><Edit className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => setColorRows(colorRows.filter(r => r.id !== row.id))} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(row.sizes).map(([sz, qty]) => (
                        <div key={sz} className="bg-white p-2 rounded-lg border border-slate-100 text-center shadow-3xs">
                          <span className="text-[10px] text-slate-400 font-bold block">{sz}</span>
                          <span className="text-xs font-extrabold text-slate-700">{qty} Pcs</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-150/60 text-[10px] font-bold text-slate-500">
                      <span>Breakdown</span>
                      <span className="text-brand-600 font-extrabold">{rowTotal} Pieces</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── ADD COLOR FLOATING BUTTON ─── */}
      <button
        type="button"
        onClick={openAddColorSheet}
        className="fixed right-6 bottom-32 z-40 bg-[#384CF0] hover:bg-[#2a3bdb] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ─── STICKY SUMMARY & BOTTOM ACTION BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {/* Metric Summary Panel */}
        <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-100">
          <span>Pieces: <strong className="text-slate-800">{totalQuantity} Pcs</strong></span>
          <span>Sets: <strong className="text-slate-800">{colorRows.length}</strong></span>
          <span>Labour: <strong className="text-emerald-600">₹{(totalQuantity * parseFloat(stitchingRate || 0)).toLocaleString('en-IN')}</strong></span>
        </div>

        {/* Buttons */}
        <div className="p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 h-11 bg-[#384CF0] hover:bg-[#2a3bdb] text-white rounded-xl text-xs font-extrabold shadow-md transition-colors"
          >
            {isLoading ? 'Creating...' : isEditing ? 'Update Job Card' : 'Create Job Card'}
          </button>
        </div>
      </div>

      {/* ─── BOTTOM SHEET – ADD/EDIT COLOR ─── */}
      {colorSheetOpen && (
        <div className="fixed inset-0 bg-[#0B132B]/60 backdrop-blur-xs z-50 flex flex-col justify-end sm:justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md mx-auto max-h-[95dvh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <span className="font-extrabold text-sm text-slate-800">
                {sheetMode === 'add' ? 'Add Color Breakdown' : 'Edit Color Card'}
              </span>
              <button type="button" onClick={() => setColorSheetOpen(false)} className="text-slate-400 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200/50">✕</button>
            </div>

            {/* Sheet Scroll Body */}
            <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Color Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Red, Royal Blue, Jet Black"
                  value={sheetColorName}
                  onChange={e => setSheetColorName(e.target.value)}
                  className="w-full h-12 px-3.5 border border-slate-200 rounded-xl text-sm sm:text-xs font-bold text-slate-900 focus:border-[#384CF0] outline-none bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-2">Sizes Quantity Breakdown</label>
                <div className="space-y-2 sm:space-y-3">
                  {SIZES.map((sz) => {
                    const val = sheetSizes[sz] !== undefined ? sheetSizes[sz] : 0;
                    return (
                      <div key={sz} className="flex items-center justify-between p-2 bg-slate-50/50 rounded-xl border border-slate-100 gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-700 shrink-0 w-8 sm:w-10 truncate">{sz}</span>
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-end max-w-full">
                          <button
                            type="button"
                            onClick={() => handleStepSize(sz, -5)}
                            className="w-10 sm:w-11 h-11 sm:h-10 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0 active:bg-slate-200"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepSize(sz, -1)}
                            className="w-10 sm:w-11 h-11 sm:h-10 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0 active:bg-slate-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={val.toString()}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              setSheetSizes({ ...sheetSizes, [sz]: isNaN(v) ? 0 : v });
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-12 sm:w-14 h-11 sm:h-10 text-center bg-white border border-slate-200 rounded-lg text-sm sm:text-xs font-extrabold text-slate-800 shrink-0 focus:border-[#384CF0] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleStepSize(sz, 1)}
                            className="w-10 sm:w-11 h-11 sm:h-10 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0 active:bg-slate-200"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepSize(sz, 5)}
                            className="w-10 sm:w-11 h-11 sm:h-10 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0 active:bg-slate-200"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white">
              <button
                type="button"
                onClick={() => setColorSheetOpen(false)}
                className="flex-1 h-12 border border-slate-200 rounded-xl text-sm sm:text-xs font-bold text-slate-500 active:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveColorSheet}
                className="flex-1 h-12 bg-[#384CF0] hover:bg-[#2a3bdb] text-white rounded-xl text-sm sm:text-xs font-bold shadow-md active:scale-[0.98] transition-transform"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCardFormModal;
