import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Asset, AssetCondition, OperationalStatus } from '../../types';
import { X, Boxes, Upload, Camera } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, assetToEdit }) => {
  const { shops, createAsset, updateAsset } = useData();
  const { t } = useLanguage();

  const [trolleyNumber, setTrolleyNumber] = useState(assetToEdit?.trolleyNumber || '');
  const [name, setName] = useState(assetToEdit?.name || '');
  const [category, setCategory] = useState(assetToEdit?.category || 'Trolley');
  const [trolleyType, setTrolleyType] = useState(assetToEdit?.trolleyType || 'Assembly Transit Trolley');
  const [shopCode, setShopCode] = useState(assetToEdit?.shopCode || 'A1');
  const [location, setLocation] = useState(assetToEdit?.location || '');
  const [partNumber, setPartNumber] = useState(assetToEdit?.partNumber || '');
  const [dimensions, setDimensions] = useState(assetToEdit?.dimensions || '1800 x 1200 x 1400 mm');
  const [loadCapacityKg, setLoadCapacityKg] = useState(assetToEdit?.loadCapacityKg || 800);
  const [condition, setCondition] = useState<AssetCondition>(assetToEdit?.condition || 'good');
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>(
    assetToEdit?.operationalStatus || 'active'
  );
  const [maintenanceQuarter, setMaintenanceQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>(
    assetToEdit?.maintenanceQuarter || 'Q4'
  );
  const [photoUrl, setPhotoUrl] = useState(assetToEdit?.photoUrl || '');
  const [notes, setNotes] = useState(assetToEdit?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trolleyNumber.trim() || !name.trim()) return;

    setSubmitting(true);
    try {
      if (assetToEdit) {
        await updateAsset(assetToEdit.id, {
          trolleyNumber,
          name,
          category,
          trolleyType,
          shopCode,
          location,
          partNumber,
          dimensions,
          loadCapacityKg,
          condition,
          operationalStatus,
          maintenanceQuarter,
          photoUrl: photoUrl || undefined,
          notes,
        });
      } else {
        await createAsset({
          trolleyNumber,
          name,
          category,
          trolleyType,
          shopCode,
          location,
          partNumber,
          dimensions,
          loadCapacityKg,
          condition,
          operationalStatus,
          safetyStatus: 'safe',
          maintenanceQuarter,
          photoUrl: photoUrl || undefined,
          notes,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving asset:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {assetToEdit ? t('edit_asset_record', 'Edit Asset Record') : t('register_new_trolley_asset', 'Register New Trolley / Asset')}
              </h3>
              <p className="text-[11px] text-slate-400">{t('unique_qr_auto', 'Unique QR code generated automatically')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('trolley_number', 'Trolley Number')} *</label>
              <input
                type="text"
                value={trolleyNumber}
                onChange={(e) => setTrolleyNumber(e.target.value)}
                placeholder="e.g. TR-A1-042"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('asset_name', 'Asset Name')} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BIW Door Panel Trolley"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('assigned_shop', 'Assigned Shop')} *</label>
              <select
                value={shopCode}
                onChange={(e) => setShopCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('trolley_type_family', 'Trolley Type / Family')}</label>
              <input
                type="text"
                value={trolleyType}
                onChange={(e) => setTrolleyType(e.target.value)}
                placeholder="e.g. Heavy Kitting Cart"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('part_no', 'Vehicle Part Number')}</label>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. MN-PART-1002"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('load_rating', 'Max Dynamic Payload (Kg)')}</label>
              <input
                type="number"
                value={loadCapacityKg}
                onChange={(e) => setLoadCapacityKg(parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('floor_location_bay', 'Floor Location / Bay')}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bay 4 Sub-Assembly"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('quarterly_pm_cycle', 'Quarterly PM Cycle')}</label>
              <select
                value={maintenanceQuarter}
                onChange={(e) => setMaintenanceQuarter(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Q1">Q1 (Jan - Mar)</option>
                <option value="Q2">Q2 (Apr - Jun)</option>
                <option value="Q3">Q3 (Jul - Sep)</option>
                <option value="Q4">Q4 (Oct - Dec)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('current_physical_condition', 'Current Physical Condition')}</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white capitalize"
              >
                <option value="excellent">{t('condition_excellent', 'Excellent')}</option>
                <option value="good">{t('condition_good', 'Good')}</option>
                <option value="needs_repair">{t('condition_needs_repair', 'Needs Repair')}</option>
                <option value="critical_damage">{t('condition_critical_damage', 'Critical Damage')}</option>
                <option value="quarantined_unsafe">{t('condition_quarantined_unsafe', 'Quarantined Unsafe')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('operational_status', 'Operational Status')}</label>
              <select
                value={operationalStatus}
                onChange={(e) => setOperationalStatus(e.target.value as OperationalStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white capitalize"
              >
                <option value="active">{t('status_active', 'Active')}</option>
                <option value="under_maintenance">{t('status_under_maintenance', 'Under Maintenance')}</option>
                <option value="out_of_service">{t('status_out_of_service', 'Out of Service')}</option>
                <option value="scrapped">{t('status_scrapped', 'Scrapped')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('asset_photo_ref', 'Asset Photograph / Visual Reference')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-1 h-28">
                <ImageWithFallback
                  src={photoUrl}
                  alt={name || 'Asset Image'}
                  category={category.toLowerCase().includes('fixture') ? 'fixture' : 'trolley'}
                  title={trolleyNumber || 'New Asset'}
                  subtitle={name || 'Trolley Photo'}
                  aspectRatio="auto"
                  showUploadButton={true}
                  onPhotoUploaded={(url) => setPhotoUrl(url)}
                  containerClassName="h-full border border-dashed border-slate-300"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... or upload a photo"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t('upload_device_photo', 'Upload Device Photo')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const localUrl = URL.createObjectURL(file);
                          setPhotoUrl(localUrl);
                          // Also convert to base64 for persistent saving
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setPhotoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      {t('remove_photo', 'Remove Photo')}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('photo_upload_hint', 'PNG, JPG or WebP. Instant local preview generated automatically.')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technical Notes / Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Resting pads, wheel types, specialized clamping features..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t('loading', 'Saving...') : assetToEdit ? t('btn_save_changes', 'Save Changes') : t('btn_register_asset', 'Register Asset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
