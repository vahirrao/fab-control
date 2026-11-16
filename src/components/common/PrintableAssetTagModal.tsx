import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Asset } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PrintableAssetTagModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableAssetTagModal: React.FC<PrintableAssetTagModalProps> = ({ asset, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { t } = useLanguage();

  useEffect(() => {
    if (!asset) return;

    QRCode.toDataURL(asset.qrCode, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(console.error);
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white print:hidden">
          <div>
            <h3 className="font-bold text-sm text-white">{t('print_asset_label', 'Print Industrial Asset Label')}</h3>
            <p className="text-[11px] text-slate-400">{t('thermal_sticker_tag', 'Standard thermal sticker tag for trolley frame')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 bg-slate-50 flex justify-center">
          <div
            id="printable-tag"
            className="w-full bg-white border-2 border-slate-900 rounded-lg p-4 shadow-md text-slate-900 font-sans print:shadow-none print:border-4 print:border-black"
          >
            {/* Top Bar: Mahindra & Technova */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
              <div>
                <span className="font-black text-xs tracking-tight text-slate-900 uppercase">MAHINDRA & MAHINDRA</span>
                <p className="text-[9px] font-semibold text-slate-600">CHAKAN FACILITY • {asset.shopCode} SHOP</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-300">
                  TECHNOVA FAB-PRO
                </span>
                <p className="text-[8px] text-slate-500 font-mono">ASSET CONTROL</p>
              </div>
            </div>

            {/* Middle Section: QR Code and Key Specs */}
            <div className="flex items-center gap-3 py-1">
              {/* QR Code image */}
              <div className="shrink-0 border border-slate-300 p-1 rounded bg-white">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={asset.qrCode} className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Identity details */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-500">TROLLEY NUMBER</div>
                <div className="text-lg font-black tracking-tight text-slate-900 font-mono truncate">
                  {asset.trolleyNumber}
                </div>

                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">TAG / QR CODE ID</div>
                <div className="text-[11px] font-mono text-slate-800 font-bold truncate">
                  {asset.qrCode}
                </div>

                <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">LOAD CAPACITY</div>
                <div className="text-xs font-black text-rose-700">
                  MAX {asset.loadCapacityKg} KG DYNAMIC
                </div>
              </div>
            </div>

            {/* Bottom Metadata Grid */}
            <div className="grid grid-cols-2 gap-1.5 border-t border-slate-300 pt-2 text-[10px] text-slate-700 font-medium">
              <div>
                <span className="text-slate-500">Asset:</span> <span className="font-bold truncate block">{asset.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Part No:</span> <span className="font-bold truncate block">{asset.partNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Quarterly PM:</span> <span className="font-bold">{asset.maintenanceQuarter} Cycle</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{' '}
                <span className="font-bold text-emerald-700 uppercase">{asset.operationalStatus}</span>
              </div>
            </div>

            <div className="mt-2 text-center border-t border-dashed border-slate-300 pt-1 text-[8px] text-slate-500 uppercase tracking-widest font-mono">
              Do not remove or deface • Report damaged trolley immediately to Technova
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {t('btn_cancel', 'Cancel')}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {t('btn_print_label', 'Print Label')}
          </button>
        </div>
      </div>
    </div>
  );
};
