import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActivityType, Asset, WorkOrder, WorkOrderPriority } from '../../types';
import { X, Wrench, Upload, Image, Calculator, Check, AlertCircle, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedAsset?: Asset | null;
}

const ACTIVITIES: ActivityType[] = [
  'Fabrication',
  'Welding',
  'Painting',
  'Cleaning',
  'Locking',
  'Resting',
  'Repair',
  'Modification',
  'General Maintenance',
];

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  preSelectedAsset,
}) => {
  const { shops, assets, rateCards, createWorkOrder, manpower } = useData();
  const { profile } = useAuth();
  const { t } = useLanguage();

  const [shopCode, setShopCode] = useState<string>('A1');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [trolleyNumber, setTrolleyNumber] = useState<string>('');
  const [trolleyType, setTrolleyType] = useState<string>('');
  const [partNumber, setPartNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [activityType, setActivityType] = useState<ActivityType>('Fabrication');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('Trolley');
  const [priority, setPriority] = useState<WorkOrderPriority>('Normal');
  const [requiredDate, setRequiredDate] = useState<string>('');
  const [peRequired, setPeRequired] = useState<boolean>(false);
  const [assignedTechUid, setAssignedTechUid] = useState<string>('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Set default required date to 2 days from now (target SLA)
  useEffect(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    setRequiredDate(d.toISOString().split('T')[0]);
  }, []);

  // Pre-fill from asset if provided
  useEffect(() => {
    if (preSelectedAsset) {
      setSelectedAssetId(preSelectedAsset.id);
      setShopCode(preSelectedAsset.shopCode);
      setTrolleyNumber(preSelectedAsset.trolleyNumber);
      setTrolleyType(preSelectedAsset.trolleyType);
      setPartNumber(preSelectedAsset.partNumber);
      setLocation(preSelectedAsset.location);
    }
  }, [preSelectedAsset]);

  // When asset is picked from dropdown
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssetId(assetId);
    const ast = assets.find((a) => a.id === assetId);
    if (ast) {
      setShopCode(ast.shopCode);
      setTrolleyNumber(ast.trolleyNumber);
      setTrolleyType(ast.trolleyType);
      setPartNumber(ast.partNumber);
      setLocation(ast.location);
    }
  };

  // Find matching rate card item
  const matchedRateCard = rateCards.find(
    (rc) => rc.activityName === activityType || rc.category === activityType
  );
  const baseRate = matchedRateCard?.rate || 1850;
  const estimatedCost = baseRate * quantity;

  // Handle client-side image upload with instant Object URL preview & background compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // 1. Instant local preview
      const instantUrl = URL.createObjectURL(file);
      setBeforePhotos((prev) => [...prev, instantUrl]);

      // 2. Compress to Base64 in background
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setBeforePhotos((prev) => [
            ...prev.filter((p) => p !== instantUrl),
            compressedDataUrl,
          ]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setSubmitting(true);
    try {
      const selectedTech = manpower.find((m) => m.id === assignedTechUid);

      await createWorkOrder({
        shopCode,
        location,
        assetId: selectedAssetId,
        trolleyNumber,
        trolleyType,
        partNumber,
        jobDescription,
        activityType,
        quantity,
        unit,
        priority,
        estimatedCost,
        rateCardCode: matchedRateCard?.code || 'FAB-STR-01',
        requiredDate,
        peRequired,
        assignedTechnicianUids: selectedTech ? [selectedTech.id] : [],
        assignedTechnicianNames: selectedTech ? [`${selectedTech.name} (${selectedTech.designation})`] : [],
        beforePhotoUrls: beforePhotos,
      });

      onClose();
    } catch (err) {
      console.error('Error creating work order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{t('btn_raise_wo', 'Raise Digital Fabrication Work Order')}</h3>
              <p className="text-[11px] text-slate-400">
                {t('facility_subtitle', 'Technova Enterprises On-Site Team • M&M Chakan 15 Shops')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Step 1: Shop & Asset Selection */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-teal-800">
              1. Shop & Asset Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shop selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requesting Shop *</label>
                <select
                  value={shopCode}
                  onChange={(e) => setShopCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name} ({s.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Registered Asset / Trolley</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => handleAssetSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Manual / Custom Fixture --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.trolleyNumber} - {a.name} ({a.shopCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Trolley Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trolley Number / Tag ID</label>
                <input
                  type="text"
                  value={trolleyNumber}
                  onChange={(e) => setTrolleyNumber(e.target.value)}
                  placeholder="e.g. TR-A1-042"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Part Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vehicle Part Number</label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="e.g. MN-DOOR-5501-RH"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Area / Location */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Specific Bay / Location on Floor</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bay 3 Door Stamping Transfer Line"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Fabrication Activity & Rate Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-teal-800">
              2. Fabrication Activity & Pre-Approved Rate Card
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Activity Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Type *</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white font-semibold text-teal-900"
                >
                  {ACTIVITIES.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Trolley / Meter / Joint"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Rate Card Live Calculation Banner */}
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between text-teal-900 font-medium">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-700" />
                <span>
                  Contract Rate: <strong>₹{baseRate}</strong> ({matchedRateCard?.unit || 'per unit'})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-teal-700 block leading-tight">Calculated Estimate:</span>
                <span className="font-mono font-black text-sm text-teal-900">₹{estimatedCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Priority, Description & SLA Required Date */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Priority */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 font-bold ${
                    priority === 'Critical'
                      ? 'border-rose-400 bg-rose-50 text-rose-800'
                      : priority === 'High'
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <option value="Normal">Normal (Target 2 Days)</option>
                  <option value="High">High (Target 1 Day)</option>
                  <option value="Urgent">Urgent (Same Day)</option>
                  <option value="Critical">Critical (Immediate Hot Work / Line Stop)</option>
                </select>
              </div>

              {/* Required Completion Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required By (SLA Date) *</label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Fabrication / Repair Instructions *
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Specify dimensions, damaged weld seam, caster replacement, handle modification, safety stops..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* PE Approval Requirement Checkbox */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
              <input
                type="checkbox"
                id="peReq"
                checked={peRequired}
                onChange={(e) => setPeRequired(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="peReq" className="text-indigo-950 font-medium">
                <strong>Requires Plant Engineer (PE) Technical Validation</strong> (structural welds, load changes, drawing sign-off)
              </label>
            </div>

            {/* Direct Technician Assignment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Lead Fabricator / Welder</label>
              <select
                value={assignedTechUid}
                onChange={(e) => setAssignedTechUid(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">-- Assign Later by Fabrication Manager --</option>
                {manpower
                  .filter((m) => m.attendanceStatus === 'Present' || m.attendanceStatus === 'Overtime')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.designation} ({m.primarySkill})
                    </option>
                  ))}
              </select>
            </div>

            {/* Before-Work Photos Upload */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Before-Work Damage Photographs
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>Attach Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500">
                  {beforePhotos.length} photo(s) selected
                </span>
              </div>

              {beforePhotos.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-2.5">
                  {beforePhotos.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 group shadow-xs">
                      <ImageWithFallback
                        src={p}
                        alt={`Evidence ${idx + 1}`}
                        category={activityType === 'Welding' ? 'welding' : 'fabrication'}
                        aspectRatio="square"
                        allowZoom={true}
                      />
                      <button
                        type="button"
                        onClick={() => setBeforePhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 rounded bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              {t('btn_cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? t('loading', 'Submitting...') : t('btn_submit', 'Submit Work Order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
