import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Asset } from '../../types';
import { X, QrCode, Search, AlertTriangle, ShieldCheck, Wrench, ArrowRight } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: Asset, action?: 'view' | 'work_order' | 'safety') => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSelectAsset }) => {
  const { assets, getAssetByQRCode } = useData();
  const { t } = useLanguage();
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<Asset | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    // Initialize scanner
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            const matchedAsset = getAssetByQRCode(decodedText);
            if (matchedAsset) {
              setScannedResult(matchedAsset);
              setScanError(null);
            } else {
              setScanError(`No asset found matching tag: "${decodedText}"`);
            }
          },
          (error) => {
            // Scanner frame ignore
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.warn('Camera scanner initialization notice:', err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, activeTab, getAssetByQRCode]);

  if (!isOpen) return null;

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const matched = getAssetByQRCode(manualCode);
    if (matched) {
      setScannedResult(matched);
      setScanError(null);
    } else {
      setScannedResult(null);
      setScanError(`No asset found with code: ${manualCode}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm text-white">{t('qr_scanner_title', 'Industrial Asset QR Scanner')}</h3>
              <p className="text-[11px] text-slate-400">{t('qr_scanner_subtitle', 'Scan trolley or fixture barcode on the shop floor')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer ${
              activeTab === 'camera' ? 'border-b-2 border-teal-600 text-teal-700 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tab_camera_scanner', 'Camera Scanner')}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer ${
              activeTab === 'manual' ? 'border-b-2 border-teal-600 text-teal-700 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tab_manual_search', 'Manual Search / Tag ID')}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {scannedResult ? (
            /* Matched Asset Result Card */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-bold">
                      {scannedResult.trolleyNumber}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{scannedResult.name}</h4>
                    <p className="text-xs text-slate-600">{scannedResult.trolleyType} • {scannedResult.shopCode} Shop</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                      scannedResult.safetyStatus === 'unsafe_locked'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {scannedResult.safetyStatus === 'unsafe_locked' ? t('locked_unsafe', 'Locked / Unsafe') : t('safe_for_use', 'Safe for Use')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-700 border-t border-teal-200/60 pt-3">
                  <div>
                    <span className="text-slate-500">{t('location', 'Location')}:</span> {scannedResult.location}
                  </div>
                  <div>
                    <span className="text-slate-500">{t('part_no', 'Part No')}:</span> {scannedResult.partNumber}
                  </div>
                  <div>
                    <span className="text-slate-500">{t('load_rating', 'Load Rating')}:</span> {scannedResult.loadCapacityKg} kg
                  </div>
                  <div>
                    <span className="text-slate-500">{t('condition', 'Condition')}:</span>{' '}
                    <span className="capitalize font-semibold">{t(`condition_${scannedResult.condition}`, scannedResult.condition.replace('_', ' '))}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onSelectAsset(scannedResult, 'work_order');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    {t('btn_create_repair_wo', 'Create Fabrication / Repair Work Order')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectAsset(scannedResult, 'view');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition cursor-pointer"
                >
                  <span>{t('btn_view_asset_history', 'View Asset History & Details')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    setScannedResult(null);
                    setManualCode('');
                  }}
                  className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {t('btn_scan_another', 'Scan Another Asset')}
                </button>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            <div>
              <div id="qr-reader-container" className="w-full min-h-[260px] rounded-lg overflow-hidden border border-slate-200" />
              <p className="text-[11px] text-slate-500 text-center mt-2">
                {t('align_qr_viewfinder', 'Align the asset QR code or barcode inside the viewfinder box.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <form onSubmit={handleManualSearch} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('enter_trolley_qr', 'Enter Trolley Number or Asset QR Code')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. TR-A1-042 or MM-CK-A1-TR-001"
                    className="w-full px-3 py-2.5 pl-9 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  {t('search_asset_registry', 'Search Asset Registry')}
                </button>
              </form>

              {/* Quick sample chips */}
              <div className="border-t border-slate-200 pt-3">
                <p className="text-[11px] text-slate-500 mb-2 font-medium">{t('quick_pick_samples', 'Quick Pick Sample Assets:')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {assets.slice(0, 5).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setScannedResult(a)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      {a.trolleyNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {scanError && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{scanError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
