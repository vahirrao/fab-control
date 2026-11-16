import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MHEEquipment } from '../../types';
import {
  Forklift,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const MHEView: React.FC = () => {
  const { mheEquipment, updateMHE, shops } = useData();
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<MHEEquipment | null>(null);
  const [breakdownReason, setBreakdownReason] = useState('');

  const filtered = mheEquipment.filter((e) => {
    if (selectedType !== 'ALL' && e.type !== selectedType) return false;
    return true;
  });

  const operationalCount = mheEquipment.filter((e) => e.currentStatus === 'Operational').length;
  const underServiceCount = mheEquipment.filter((e) => e.currentStatus === 'Under Service' || e.currentStatus === 'Breakdown').length;
  const totalDowntime = mheEquipment.reduce((acc, curr) => acc + curr.downtimeHours, 0);

  const handleStatusChange = async (id: string, status: MHEEquipment['currentStatus']) => {
    await updateMHE(id, {
      currentStatus: status,
      lastBreakdownReason: status === 'Breakdown' ? breakdownReason || 'Hydraulic leak / traction motor fault' : undefined,
    });
    setBreakdownReason('');
    setSelectedEquipment(null);
  };

  const getFilterLabel = (type: string) => {
    if (type === 'ALL') return t('all_mhe', 'All MHE');
    if (type === 'Forklift') return t('mhe_forklift', 'Forklift');
    if (type === 'Tow Truck') return t('mhe_tow_truck', 'Tow Truck');
    return t('mhe_hpt', 'Hand Pallet Truck (HPT)');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Forklift className="w-5 h-5 text-teal-600" />
            {t('mhe_title', 'Forklift, Tow Truck & Hand Pallet Truck (MHE) Maintenance')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('mhe_subtitle', 'Dedicated integrated maintenance service for Mahindra Chakan internal logistics equipment')}
          </p>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['ALL', 'Forklift', 'Tow Truck', 'Hand Pallet Truck (HPT)'] as const).map((tVal) => (
            <button
              key={tVal}
              onClick={() => setSelectedType(tVal)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                selectedType === tVal
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getFilterLabel(tVal)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('fleet_availability', 'Fleet Availability')}</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {Math.round((operationalCount / mheEquipment.length) * 100)}%
          </div>
          <span className="text-xs text-slate-500">{operationalCount} {t('of_units', 'of')} {mheEquipment.length} {t('units_operational', 'units operational')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('active_service_breakdown', 'Active Service / Breakdown')}</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{underServiceCount}</div>
          <span className="text-xs text-slate-500">{t('technicians_attending', 'Technova technicians attending')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('cumulative_fleet_downtime', 'Cumulative Fleet Downtime')}</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalDowntime} hrs</div>
          <span className="text-xs text-teal-600 font-semibold">{t('downtime_improvement', '-60% vs external vendor response delay')}</span>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((eq) => {
          const isOperational = eq.currentStatus === 'Operational';
          const isBreakdown = eq.currentStatus === 'Breakdown';

          return (
            <div
              key={eq.id}
              className={`bg-white rounded-xl border-2 p-4 shadow-xs flex flex-col justify-between ${
                isBreakdown ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {eq.equipmentCode}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{eq.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{eq.model}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isOperational
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBreakdown
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isOperational
                      ? t('status_operational', 'Operational')
                      : isBreakdown
                      ? t('status_breakdown', 'Breakdown')
                      : t('status_under_service', 'Under Service')}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('lbl_category', 'Category')}</span>
                    <span className="font-semibold text-slate-800">{eq.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('lbl_rated_capacity', 'Rated Capacity')}</span>
                    <span className="font-bold text-slate-900">{eq.capacityTons} Tonnes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('lbl_assigned_shop', 'Assigned Shop')}</span>
                    <span className="font-semibold text-slate-800">{eq.shopCode} {t('shop_selector_label', 'Shop')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('lbl_downtime', 'Downtime')}</span>
                    <span className="font-mono font-bold text-slate-900">{eq.downtimeHours} hrs</span>
                  </div>
                </div>

                {eq.lastBreakdownReason && (
                  <div className="mt-2.5 p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                    <strong>{t('status_breakdown', 'Breakdown')}:</strong> {eq.lastBreakdownReason}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {t('lbl_operator', 'Operator:')} <strong>{eq.assignedOperator || 'Floor Pool'}</strong>
                </span>
                <button
                  onClick={() => setSelectedEquipment(eq)}
                  className="px-2.5 py-1 text-teal-700 hover:text-teal-900 font-bold text-xs hover:bg-teal-50 rounded cursor-pointer"
                >
                  {t('btn_manage_service', 'Manage Service →')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Action Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">{t('modal_mhe_title', 'Update MHE Equipment Status')}</h3>
            <p className="text-slate-500 mb-3">{selectedEquipment.name} ({selectedEquipment.equipmentCode})</p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_set_operational_state', 'Set Current Operational State')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedEquipment.id, 'Operational')}
                    className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold cursor-pointer"
                  >
                    ✓ {t('status_operational', 'Operational')}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEquipment.id, 'Under Service')}
                    className="p-2 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold cursor-pointer"
                  >
                    {t('status_under_service', 'Under Service')}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEquipment.id, 'Breakdown')}
                    className="p-2 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold cursor-pointer"
                  >
                    {t('status_breakdown', 'Breakdown')}
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEquipment.id, 'Decommissioned')}
                    className="p-2 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold cursor-pointer"
                  >
                    {t('status_decommissioned', 'Decommission')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_breakdown_notes', 'Breakdown / Maintenance Notes')}</label>
                <input
                  type="text"
                  value={breakdownReason}
                  onChange={(e) => setBreakdownReason(e.target.value)}
                  placeholder="e.g. Hydraulic seal replaced, brake calibrated..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  {t('btn_cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

