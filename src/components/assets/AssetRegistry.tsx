import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Asset, AssetCondition } from '../../types';
import {
  Boxes,
  QrCode,
  Printer,
  Wrench,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { AssetModal } from './AssetModal';
import { PrintableAssetTagModal } from '../common/PrintableAssetTagModal';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface AssetRegistryProps {
  onRaiseWOForAsset: (asset: Asset) => void;
}

export const AssetRegistry: React.FC<AssetRegistryProps> = ({ onRaiseWOForAsset }) => {
  const { assets, shops, activeShopFilter, setActiveShopFilter, updateAsset } = useData();
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [selectedAssetForTag, setSelectedAssetForTag] = useState<Asset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Filtered list
  const filteredAssets = assets.filter((a) => {
    if (activeShopFilter !== 'ALL' && a.shopCode !== activeShopFilter) return false;
    if (conditionFilter !== 'ALL' && a.condition !== conditionFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrolley = a.trolleyNumber.toLowerCase().includes(q);
      const matchName = a.name.toLowerCase().includes(q);
      const matchPart = a.partNumber.toLowerCase().includes(q);
      const matchQR = a.qrCode.toLowerCase().includes(q);
      const matchShop = a.shopCode.toLowerCase().includes(q);
      if (!matchTrolley && !matchName && !matchPart && !matchQR && !matchShop) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            {t('asset_registry_title', 'Centralized Asset Registry & QR Tagging')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('asset_registry_desc', 'Digital tracking of trolleys, fixtures, and material handling carriers across 15 shops')}
          </p>
        </div>

        {hasPermission('manage_assets') && (
          <button
            onClick={() => {
              setAssetToEdit(null);
              setIsAssetModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_register_asset', 'Register New Asset')}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder_asset', 'Search by Trolley #, Name, QR Tag, Part #, or Location...')}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{t('shop_selector_label', 'Shop')}:</span>
          <select
            value={activeShopFilter}
            onChange={(e) => setActiveShopFilter(e.target.value)}
            className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="ALL">{t('all_shops', 'All 15 Shops')}</option>
            {shops.map((s) => (
              <option key={s.id} value={s.code}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{t('condition', 'Condition')}:</span>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white capitalize"
          >
            <option value="ALL">{t('all_conditions', 'All Conditions')}</option>
            <option value="excellent">{t('condition_excellent', 'Excellent')}</option>
            <option value="good">{t('condition_good', 'Good')}</option>
            <option value="needs_repair">{t('condition_needs_repair', 'Needs Repair')}</option>
            <option value="critical_damage">{t('condition_critical_damage', 'Critical Damage')}</option>
            <option value="quarantined_unsafe">{t('condition_quarantined_unsafe', 'Quarantined Unsafe')}</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
            <Boxes className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-600">{t('no_assets_found', 'No assets found')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('try_relaxing_filters_asset', 'Try relaxing filters or registering a new trolley.')}</p>
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isUnsafe = asset.safetyStatus === 'unsafe_locked';
            const isDamaged = asset.condition === 'needs_repair' || asset.condition === 'critical_damage';

            return (
              <div
                key={asset.id}
                className={`bg-white rounded-xl border-2 p-4 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                  isUnsafe
                    ? 'border-rose-400 bg-rose-50/20'
                    : isDamaged
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sm text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                          {asset.trolleyNumber}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {asset.shopCode} Shop
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{asset.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{asset.trolleyType}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                          isUnsafe
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isUnsafe ? (
                          <>
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>LOCKED</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>SAFE</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{asset.maintenanceQuarter} Cycle</span>
                    </div>
                  </div>

                  {/* Image / Spec Details */}
                  <div className="mt-3">
                    <ImageWithFallback
                      src={asset.photoUrl}
                      alt={asset.name}
                      title={asset.name}
                      subtitle={`${asset.trolleyNumber} • ${asset.shopCode} Shop`}
                      category={asset.category === 'Fixture' ? 'fixture' : 'trolley'}
                      aspectRatio="video"
                      showUploadButton={hasPermission('manage_assets')}
                      onPhotoUploaded={(previewUrl) => {
                        updateAsset(asset.id, { photoUrl: previewUrl });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('location', 'Location')}</span>
                      <span className="font-medium truncate block">{asset.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('part_no', 'Part No')}</span>
                      <span className="font-mono font-medium truncate block">{asset.partNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('load_rating', 'Load Rating')}</span>
                      <span className="font-bold text-slate-900">{asset.loadCapacityKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('condition', 'Condition')}</span>
                      <span className="capitalize font-semibold text-slate-800">
                        {t(`condition_${asset.condition}`, asset.condition.replace('_', ' '))}
                      </span>
                    </div>
                  </div>

                  {asset.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 line-clamp-2">
                      {asset.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedAssetForTag(asset)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    <span>{t('btn_print_qr', 'Print QR Tag')}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {hasPermission('manage_assets') && (
                      <button
                        onClick={() => {
                          setAssetToEdit(asset);
                          setIsAssetModalOpen(true);
                        }}
                        className="px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        {t('btn_edit', 'Edit')}
                      </button>
                    )}

                    <button
                      onClick={() => onRaiseWOForAsset(asset)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{t('btn_raise_wo', 'Raise WO')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Asset Create/Edit Modal */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setAssetToEdit(null);
        }}
        assetToEdit={assetToEdit}
      />

      {/* Printable Tag Modal */}
      <PrintableAssetTagModal
        isOpen={!!selectedAssetForTag}
        onClose={() => setSelectedAssetForTag(null)}
        asset={selectedAssetForTag}
      />
    </div>
  );
};
