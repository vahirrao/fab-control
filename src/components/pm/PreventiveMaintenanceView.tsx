import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PreventiveMaintenanceSchedule } from '../../types';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  Search,
  Filter,
  Wrench,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const PreventiveMaintenanceView: React.FC = () => {
  const { preventiveMaintenance, updatePM, shops, activeShopFilter, setActiveShopFilter } = useData();
  const { hasPermission, profile } = useAuth();
  const { t } = useLanguage();

  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q4');
  const [selectedPM, setSelectedPM] = useState<PreventiveMaintenanceSchedule | null>(null);

  const filtered = preventiveMaintenance.filter((p) => {
    if (activeShopFilter !== 'ALL' && p.shopCode !== activeShopFilter) return false;
    if (selectedQuarter !== 'ALL' && p.quarter !== selectedQuarter) return false;
    return true;
  });

  const completedCount = filtered.filter((p) => p.status === 'Completed').length;
  const overdueCount = filtered.filter((p) => p.status === 'Overdue').length;
  const scheduledCount = filtered.filter((p) => p.status === 'Scheduled').length;
  const compliancePct = filtered.length > 0 ? Math.round((completedCount / filtered.length) * 100) : 100;

  const handleToggleChecklistItem = async (pmId: string, itemIdx: number) => {
    const pm = preventiveMaintenance.find((p) => p.id === pmId);
    if (!pm) return;

    const newChecklist = [...pm.checklist];
    const current = newChecklist[itemIdx].status;
    newChecklist[itemIdx].status = current === 'pass' ? 'fail' : 'pass';

    await updatePM(pmId, { checklist: newChecklist });
    if (selectedPM?.id === pmId) {
      setSelectedPM({ ...selectedPM, checklist: newChecklist });
    }
  };

  const handleCompletePM = async (pmId: string) => {
    await updatePM(pmId, {
      status: 'Completed',
      completedDate: new Date().toISOString().split('T')[0],
      verifiedBySupervisor: profile.name,
      conditionPostPM: 'excellent',
    });
    setSelectedPM(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-teal-600" />
            {t('pm_mgmt_title', 'Quarterly Preventive Maintenance (PM) Management')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('pm_mgmt_subtitle', 'Systematic quarterly inspection and overhaul cycle for trolleys & fixtures across 15 shops')}
          </p>
        </div>

        {/* Quarter Selector Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                selectedQuarter === q
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {q === 'ALL' ? t('all_quarters', 'All Quarters') : `${q} ${t('q_cycle', 'Cycle')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('pm_compliance_card', 'PM Compliance')}</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{compliancePct}%</div>
          <span className="text-[10px] text-teal-600 font-semibold">{t('target_pm_quarterly', 'Target: 95%+ Quarterly')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('completed_inspections', 'Completed Inspections')}</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">{completedCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">{t('overhauled_certified', 'Overhauled & Certified')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('scheduled_pms', 'Scheduled PMs')}</span>
          <div className="text-2xl font-black text-teal-600 mt-0.5">{scheduledCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">{t('upcoming_in', 'Upcoming in')} {selectedQuarter}</span>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-xs ${overdueCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
          <span className={`text-[10px] uppercase font-bold block ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
            {t('overdue_maintenance', 'Overdue Maintenance')}
          </span>
          <div className={`text-2xl font-black mt-0.5 ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {overdueCount}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">{t('action_required', 'Action Required')}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">{t('th_trolley_part', 'Trolley #')}</th>
                <th className="py-3 px-3">{t('th_shop', 'Shop')}</th>
                <th className="py-3 px-3">{t('quarter', 'Quarter')}</th>
                <th className="py-3 px-3">{t('th_scheduled_date', 'Scheduled Date')}</th>
                <th className="py-3 px-3">{t('th_status', 'Status')}</th>
                <th className="py-3 px-3">{t('th_assigned_team', 'Assigned PM Team')}</th>
                <th className="py-3 px-3">{t('th_checklist_summary', 'Checklist Summary')}</th>
                <th className="py-3 px-3 text-right">{t('th_action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((pm) => {
                const passedCount = pm.checklist.filter((c) => c.status === 'pass').length;
                return (
                  <tr key={pm.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{pm.trolleyNumber}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-slate-700 bg-slate-100">
                        {pm.shopCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-800">{pm.quarter} - {pm.year}</td>
                    <td className="py-3 px-3 text-slate-700">{pm.scheduledDate}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          pm.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pm.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {t(`status_${pm.status.toLowerCase()}`, pm.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{pm.assignedTeam}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {passedCount} / {pm.checklist.length} {t('pass_count_label', 'Pass')}
                        </span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${(passedCount / pm.checklist.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedPM(pm)}
                        className="px-2.5 py-1 text-teal-700 hover:text-teal-900 font-bold text-xs hover:bg-teal-50 rounded transition cursor-pointer"
                      >
                        {t('btn_inspect', 'Inspect →')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Checklist Modal */}
      {selectedPM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-sm text-white">{t('modal_pm_checklist', 'PM Checklist:')} {selectedPM.trolleyNumber}</h3>
                <p className="text-[11px] text-slate-400">
                  {selectedPM.quarter} {t('q_cycle', 'Cycle')} • {selectedPM.shopCode} {t('shop_selector_label', 'Shop')}
                </p>
              </div>
              <button
                onClick={() => setSelectedPM(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <span className="font-bold text-slate-700 block uppercase text-[10px]">
                {t('standard_pm_points', 'Standard PM Inspection Points:')}
              </span>

              <div className="space-y-2">
                {selectedPM.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklistItem(selectedPM.id, idx)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 cursor-pointer flex items-center justify-between transition"
                  >
                    <span className="text-slate-800 font-medium pr-2">{item.item}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.status === 'pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status === 'pass' ? t('status_pass', 'PASS') : t('status_fail', 'FAIL')}
                    </span>
                  </div>
                ))}
              </div>

              {selectedPM.technicianRemarks && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('notes', 'Remarks')}</span>
                  {selectedPM.technicianRemarks}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPM(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  {t('btn_close', 'Close')}
                </button>
                <button
                  onClick={() => handleCompletePM(selectedPM.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {t('btn_signoff_certify_pm', '✓ Sign-off & Certify PM')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

