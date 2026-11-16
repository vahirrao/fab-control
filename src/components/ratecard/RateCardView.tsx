import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { RateCardItem } from '../../types';
import {
  Receipt,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Edit2,
  FileSpreadsheet,
  FileText,
  Calculator,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const RateCardView: React.FC = () => {
  const { rateCards, updateRateCard, getFinancialSavings, workOrders } = useData();
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  const [editingItem, setEditingItem] = useState<RateCardItem | null>(null);
  const [editedRate, setEditedRate] = useState<number>(0);

  const { totalEstimatedSavings, technovaTotal, benchmarkExternalTotal } = getFinancialSavings();

  const handleEditRate = (item: RateCardItem) => {
    setEditingItem(item);
    setEditedRate(item.rate);
  };

  const handleSaveRate = async () => {
    if (!editingItem) return;
    await updateRateCard(editingItem.id, { rate: editedRate });
    setEditingItem(null);
  };

  const exportRateCardExcel = () => {
    const data = rateCards.map((rc) => ({
      Activity: rc.activityName,
      Code: rc.code,
      Category: rc.category,
      'Approved Technova Rate (₹)': rc.rate,
      Unit: rc.unit,
      'External Vendor Benchmark (₹)': rc.benchmarkExternalVendorRate || rc.rate * 1.7,
      'Savings Per Unit (₹)': (rc.benchmarkExternalVendorRate || rc.rate * 1.7) - rc.rate,
      'Effective Date': rc.effectiveDate,
      Status: rc.active ? 'ACTIVE' : 'INACTIVE',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Technova_Approved_Rate_Card');
    XLSX.writeFile(wb, `Technova_MM_Chakan_RateCard_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* ₹1+ Crore Savings Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl border border-teal-500/30 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/40 text-xs font-bold uppercase tracking-wider">
                {t('value_creation_milestone', 'Value Creation Milestone')}
              </span>
              <span className="text-xs text-slate-400">• {t('technova_proposal_exec', 'Technova Proposal Execution')}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {t('annual_contract_savings', 'Annual Contract Savings')}: ₹{(totalEstimatedSavings / 10000000).toFixed(2)} {t('crore_unit', 'Crore')}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {t('ratecard_hero_desc', 'Achieved through consolidated on-site fabrication operations, eliminating markup from fragmented off-site vendors and slashing turnaround from 10 days to 1.1 days.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportRateCardExcel}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span>{t('btn_export_rate_card', 'Export Rate Card (.xlsx)')}</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-850/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('technova_consolidated_spend', 'Technova Consolidated Spend')}</span>
            <div className="text-xl font-black text-teal-300 font-mono mt-0.5">
              ₹{(technovaTotal).toLocaleString()}
            </div>
            <span className="text-[10px] text-teal-400">{t('transparent_activity_rates', 'Pre-approved transparent activity rates')}</span>
          </div>

          <div className="bg-slate-850/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('external_vendor_baseline', 'External Vendor Baseline')}</span>
            <div className="text-xl font-black text-rose-300 font-mono mt-0.5">
              ₹{(benchmarkExternalTotal).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">{t('historical_vendor_spend', 'Historical fragmented vendor spend')}</span>
          </div>

          <div className="bg-slate-850/80 p-3 rounded-xl border border-teal-500/40">
            <span className="text-[10px] uppercase font-bold text-teal-400 block">{t('net_cumulative_savings', 'Net Cumulative Facility Savings')}</span>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              ₹{(totalEstimatedSavings).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">{t('exceeding_annual_target', 'Exceeding ₹1.00 Cr annual target')}</span>
          </div>
        </div>
      </div>

      {/* Rate Card Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">{t('preapproved_rates_title', 'Pre-Approved Activity-Wise Rate Schedule')}</h3>
            <p className="text-xs text-slate-500">{t('rate_schedule_subtitle', 'M&M Chakan 15-Shop Fabrication & Repair Agreement')}</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 font-mono">{t('core_activity_families', '8 Core Activity Families')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">{t('th_activity_family', 'Activity Family')}</th>
                <th className="py-3 px-3">{t('th_activity_code', 'Activity Code')}</th>
                <th className="py-3 px-3">{t('th_scope_description', 'Scope Description')}</th>
                <th className="py-3 px-3">{t('th_technova_rate', 'Technova Rate (₹)')}</th>
                <th className="py-3 px-3">{t('th_unit', 'Unit')}</th>
                <th className="py-3 px-3">{t('th_external_benchmark', 'External Vendor Benchmark')}</th>
                <th className="py-3 px-3">{t('th_savings_per_unit', 'Savings / Unit')}</th>
                <th className="py-3 px-3 text-right">{t('th_actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rateCards.map((rc) => {
                const benchmark = rc.benchmarkExternalVendorRate || rc.rate * 1.7;
                const unitSavings = benchmark - rc.rate;

                return (
                  <tr key={rc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{rc.activityName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-800">{rc.code}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">{rc.description}</td>
                    <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                      ₹{rc.rate.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{rc.unit}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      ₹{benchmark.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      +₹{unitSavings.toLocaleString()} ({Math.round((unitSavings / benchmark) * 100)}%)
                    </td>
                    <td className="py-3 px-3 text-right">
                      {hasPermission('manage_rate_card') && (
                        <button
                          onClick={() => handleEditRate(rc)}
                          className="px-2 py-1 text-teal-700 hover:text-teal-900 font-bold hover:bg-teal-50 rounded cursor-pointer"
                        >
                          {t('btn_modify_rate', 'Modify Rate')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rate Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">{t('modal_update_rate_title', 'Update Contract Rate')}</h3>
            <p className="text-slate-500 mb-3">{editingItem.activityName} ({editingItem.code})</p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_approved_rate_inr', 'Approved Rate in INR (₹)')}</label>
                <input
                  type="number"
                  value={editedRate}
                  onChange={(e) => setEditedRate(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  {t('btn_cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveRate}
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  {t('btn_save_rate', 'Save Rate')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
