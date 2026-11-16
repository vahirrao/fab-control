import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ClipboardCheck,
  Clock,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Boxes,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { WorkOrder } from '../../types';

interface ManagementDashboardProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onNavigateTab: (tab: any) => void;
  onOpenCreateWO: () => void;
}

const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  onSelectWorkOrder,
  onNavigateTab,
  onOpenCreateWO,
}) => {
  const {
    shops,
    workOrders,
    assets,
    preventiveMaintenance,
    manpower,
    safetyIncidents,
    activeShopFilter,
    getFinancialSavings,
  } = useData();
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  // Filter based on active shop if set
  const filteredWOs =
    activeShopFilter === 'ALL'
      ? workOrders
      : workOrders.filter((w) => w.shopCode === activeShopFilter);

  const filteredAssets =
    activeShopFilter === 'ALL'
      ? assets
      : assets.filter((a) => a.shopCode === activeShopFilter);

  // Key metrics
  const totalWOs = filteredWOs.length;
  const inProgressWOs = filteredWOs.filter((w) => w.status === 'In Progress').length;
  const completedWOs = filteredWOs.filter((w) => ['Completed', 'Closed'].includes(w.status)).length;
  const awaitingPEWOs = filteredWOs.filter((w) => w.status === 'Awaiting PE Approval').length;
  const awaitingInspectionWOs = filteredWOs.filter((w) => w.status === 'Awaiting Inspection').length;
  const openWOs = totalWOs - completedWOs;

  const overdueWOs = filteredWOs.filter((w) => {
    if (['Completed', 'Closed', 'Cancelled'].includes(w.status)) return false;
    return new Date(w.requiredDate).getTime() < Date.now();
  });

  const {
    totalEstimatedSavings,
    technovaTotal,
    completedTurnaroundAvg,
    slaCompliancePct,
  } = getFinancialSavings();

  // Rework & Quality
  const reworks = filteredWOs.filter((w) => (w.reworkCount || 0) > 0).length;
  const reworkRate = completedWOs > 0 ? ((reworks / completedWOs) * 100).toFixed(1) : '0.0';

  // PM Compliance
  const totalPM = preventiveMaintenance.length;
  const completedPM = preventiveMaintenance.filter((p) => p.status === 'Completed').length;
  const overduePM = preventiveMaintenance.filter((p) => p.status === 'Overdue').length;
  const pmCompliancePct = totalPM > 0 ? Math.round((completedPM / totalPM) * 100) : 85;

  // Manpower present
  const presentWorkers = manpower.filter((m) => m.attendanceStatus === 'Present' || m.attendanceStatus === 'Overtime').length;

  // Chart data: Shop-wise work order distribution
  const shopData = shops.map((s) => {
    const count = workOrders.filter((w) => w.shopCode === s.code).length;
    return {
      shop: s.code,
      orders: count,
    };
  });

  // Chart data: TAT Improvement (Legacy vs Technova On-Site)
  const tatData = [
    { period: 'May (Legacy)', tatDays: 9.8, target: 2.0 },
    { period: 'Jun (Legacy)', tatDays: 10.4, target: 2.0 },
    { period: 'Jul (Legacy)', tatDays: 8.9, target: 2.0 },
    { period: 'Aug (Technova On-Site)', tatDays: 2.4, target: 2.0 },
    { period: 'Sep (Technova On-Site)', tatDays: 1.6, target: 2.0 },
    { period: 'Oct (Current M&M)', tatDays: completedTurnaroundAvg || 1.1, target: 2.0 },
  ];

  // Chart data: Work order status breakdown
  const statusData = [
    { name: 'Completed / Closed', value: completedWOs || 1 },
    { name: 'In Progress', value: inProgressWOs || 1 },
    { name: 'Awaiting PE', value: awaitingPEWOs || 1 },
    { name: 'Awaiting Inspection', value: awaitingInspectionWOs || 1 },
    { name: 'Submitted / Review', value: Math.max(1, openWOs - inProgressWOs - awaitingPEWOs - awaitingInspectionWOs) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Objectives & Savings Tracker */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-xl p-5 text-white shadow-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
                {t('cockpit_badge', 'M&M Chakan 15-Shop Improvement Initiative')}
              </span>
              <span className="text-xs text-slate-400">• {t('dedicated_crew_badge', 'Dedicated On-Site Technova Team')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t('cockpit_title', 'Executive Fabrication & Maintenance Cockpit')}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {t('cockpit_desc', 'Consolidating fabrication, trolley overhaul, and preventive maintenance. Replaced fragmented external vendors to compress turnaround from 8–12 days down to 1–2 days.')}
            </p>
          </div>

          {/* ₹1+ Crore Savings Highlight Card */}
          <div className="bg-slate-800/90 border border-teal-500/40 rounded-xl p-4 min-w-[260px] text-right shadow-inner">
            <div className="flex items-center justify-end gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('projected_annual_savings', 'Projected Annual Savings')}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              ₹{(totalEstimatedSavings / 10000000).toFixed(2)} Cr
            </div>
            <p className="text-[11px] text-teal-300/80 font-medium">
              {t('savings_target_subtitle', 'Target: ₹1.00+ Cr • Rate Card & Downtime Savings')}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TAT Metric */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-400 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('turnaround_time', 'Turnaround Time')}</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {completedTurnaroundAvg} <span className="text-xs font-medium text-slate-500">{t('days_unit', 'Days')}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>{t('down_from_legacy', 'Down from 8–12 days')}</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-400 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('sla_compliance', 'SLA Compliance')}</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {slaCompliancePct}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {t('target_sla_text', 'Target: < 2 Days per job')}
          </div>
        </div>

        {/* Open Work Orders */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('active_work_orders', 'Active Work Orders')}</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {openWOs}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {inProgressWOs} {t('in_progress_now', 'in progress now')}
          </div>
        </div>

        {/* Overdue Jobs Alert */}
        <div className={`p-3.5 rounded-xl border shadow-xs transition ${
          overdueWOs.length > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={overdueWOs.length > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
              {t('overdue_work_orders', 'Overdue Work Orders')}
            </span>
            <AlertTriangle className={`w-4 h-4 ${overdueWOs.length > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-black mt-1 ${overdueWOs.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {overdueWOs.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {overdueWOs.length > 0 ? t('escalation_triggered', 'Escalation triggered') : t('all_jobs_on_track', 'All jobs on track')}
          </div>
        </div>

        {/* PM Compliance */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-400 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('q4_pm_compliance', 'Q4 PM Compliance')}</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {pmCompliancePct}%
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            {overduePM} {t('overdue_pm_cycles', 'overdue PM cycles')}
          </div>
        </div>

        {/* Manpower Availability */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-400 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('on_site_manpower', 'On-Site Manpower')}</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {presentWorkers} <span className="text-xs font-normal text-slate-500">/ {manpower.length}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {t('dedicated_crew_text', 'Dedicated Technova crew')}
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Turnaround Time Compression Chart */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('chart_tat_title', 'Work Order Turnaround Time (Days)')}</h3>
              <p className="text-[11px] text-slate-500">
                {t('chart_tat_desc', 'Drastic reduction from legacy 8–12 days external vendor delay to 1.1–1.5 days')}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {t('tat_reduction_badge', '-88% TAT')}
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} ${t('days_unit', 'Days')}`, t('turnaround_time', 'Turnaround')]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="tatDays" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#tatGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop-Wise Work Order Distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('chart_shop_title', '15-Shop Workload Distribution')}</h3>
              <p className="text-[11px] text-slate-500">{t('chart_shop_desc', 'Fabrication and trolley repair requests across M&M Chakan')}</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 font-mono">{t('shops_total_label', '15 Shops Total')}</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shopData.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shop" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Jobs`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="orders" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section: Priority Escalations & Work Order Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Urgent Escalations & Overdue Jobs */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t('urgent_escalations', 'Urgent & Escalations')}
              </h3>
              <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {t('action_required', 'Action Required')}
              </span>
            </div>

            <div className="space-y-2.5">
              {overdueWOs.length === 0 && awaitingPEWOs === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-70" />
                  {t('no_overdue_jobs', 'No overdue or blocked jobs! All operations running smoothly.')}
                </div>
              ) : (
                <>
                  {overdueWOs.map((wo) => (
                    <div
                      key={wo.id}
                      onClick={() => onSelectWorkOrder(wo)}
                      className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 hover:border-rose-400 cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span>{wo.workOrderNumber}</span>
                        <span className="text-[10px] bg-rose-200 px-1.5 py-0.2 rounded text-rose-900 font-mono">
                          {t('overdue_tag', 'OVERDUE')}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] font-medium mt-0.5 line-clamp-1">{wo.jobDescription}</p>
                      <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                        <span>{t('th_shop', 'Shop')}: {wo.shopCode}</span>
                        <span>{t('due_label', 'Due')}: {wo.requiredDate}</span>
                      </div>
                    </div>
                  ))}

                  {filteredWOs
                    .filter((w) => w.status === 'Awaiting PE Approval')
                    .map((wo) => (
                      <div
                        key={wo.id}
                        onClick={() => onSelectWorkOrder(wo)}
                        className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 hover:border-indigo-400 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-indigo-900">
                          <span>{wo.workOrderNumber}</span>
                          <span className="text-[10px] bg-indigo-200 px-1.5 py-0.2 rounded text-indigo-900">
                            {t('pe_signoff_due', 'PE SIGN-OFF DUE')}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] font-medium mt-0.5 line-clamp-1">{wo.jobDescription}</p>
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                          <span>{t('th_shop', 'Shop')}: {wo.shopCode}</span>
                          <span>{t('th_priority', 'Priority')}: {t(`priority_${wo.priority.toLowerCase()}`, wo.priority)}</span>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('work_orders')}
            className="w-full mt-4 py-2 text-center text-xs text-teal-700 hover:text-teal-800 font-semibold bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{t('view_all_wo', 'View All Work Orders')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Active Work Orders Pipeline */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('recent_fabrication_wo', 'Recent Fabrication Work Orders')}</h3>
              <p className="text-[11px] text-slate-500">{t('recent_wo_subtitle', 'Live operational requests across the 15 Chakan shops')}</p>
            </div>
            {hasPermission('create_work_order') && (
              <button
                onClick={onOpenCreateWO}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{t('btn_raise_new_wo', '+ Raise Work Order')}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-2 px-2.5">{t('th_wo_number', 'WO Number')}</th>
                  <th className="py-2 px-2.5">{t('th_shop', 'Shop')}</th>
                  <th className="py-2 px-2.5">{t('th_activity', 'Activity')}</th>
                  <th className="py-2 px-2.5">{t('th_priority', 'Priority')}</th>
                  <th className="py-2 px-2.5">{t('th_status', 'Status')}</th>
                  <th className="py-2 px-2.5">{t('th_technicians', 'Technicians')}</th>
                  <th className="py-2 px-2.5 text-right">{t('th_action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWOs.slice(0, 6).map((wo) => {
                  return (
                    <tr key={wo.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2 px-2.5 font-bold font-mono text-slate-900">{wo.workOrderNumber}</td>
                      <td className="py-2 px-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                          {wo.shopCode}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-medium text-slate-700">{wo.activityType}</td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            wo.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : wo.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t(`priority_${wo.priority.toLowerCase()}`, wo.priority)}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            wo.status === 'Completed' || wo.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : wo.status === 'In Progress'
                              ? 'bg-teal-100 text-teal-800'
                              : wo.status === 'Awaiting PE Approval'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {t(`status_${wo.status.toLowerCase().replace(/ /g, '_')}`, wo.status)}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-slate-600 truncate max-w-[130px]">
                        {wo.assignedTechnicianNames?.length > 0
                          ? wo.assignedTechnicianNames.map((n) => n.split(' ')[0]).join(', ')
                          : t('unassigned_label', 'Unassigned')}
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          onClick={() => onSelectWorkOrder(wo)}
                          className="px-2 py-1 text-teal-700 hover:text-teal-900 font-semibold text-[11px] hover:underline cursor-pointer"
                        >
                          {t('btn_details', 'Details →')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
