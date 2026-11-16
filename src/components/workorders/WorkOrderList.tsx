import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { WorkOrder, WorkOrderStatus } from '../../types';
import {
  Search,
  Filter,
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  ChevronRight,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface WorkOrderListProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onOpenCreateWO: () => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({ onSelectWorkOrder, onOpenCreateWO }) => {
  const { workOrders, shops, activeShopFilter, setActiveShopFilter } = useData();
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  const STATUS_FILTERS: { label: string; value: WorkOrderStatus | 'ALL' }[] = [
    { label: t('status_all', 'All Jobs'), value: 'ALL' },
    { label: t('status_in_progress', 'In Progress'), value: 'In Progress' },
    { label: t('pending_pe_approval', 'Awaiting PE Approval'), value: 'Awaiting PE Approval' },
    { label: t('status_awaiting_inspection', 'Awaiting Inspection'), value: 'Awaiting Inspection' },
    { label: t('status_completed', 'Completed'), value: 'Completed' },
    { label: t('status_closed', 'Closed'), value: 'Closed' },
    { label: t('status_submitted', 'Submitted / Review'), value: 'Submitted' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Filtered orders
  const filtered = workOrders.filter((wo) => {
    // Shop filter
    if (activeShopFilter !== 'ALL' && wo.shopCode !== activeShopFilter) return false;

    // Status filter
    if (selectedStatus !== 'ALL' && wo.status !== selectedStatus) return false;

    // Priority filter
    if (priorityFilter !== 'ALL' && wo.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = wo.workOrderNumber.toLowerCase().includes(q);
      const matchDesc = wo.jobDescription.toLowerCase().includes(q);
      const matchTrolley = (wo.trolleyNumber || '').toLowerCase().includes(q);
      const matchPart = (wo.partNumber || '').toLowerCase().includes(q);
      const matchShop = wo.shopCode.toLowerCase().includes(q);
      if (!matchNum && !matchDesc && !matchTrolley && !matchPart && !matchShop) return false;
    }

    return true;
  });

  const exportToExcel = () => {
    const dataToExport = filtered.map((w) => ({
      'WO Number': w.workOrderNumber,
      Shop: w.shopCode,
      'Shop Name': w.shopName,
      'Trolley No': w.trolleyNumber || 'N/A',
      'Part No': w.partNumber || 'N/A',
      Activity: w.activityType,
      Description: w.jobDescription,
      Priority: w.priority,
      Status: w.status,
      'Required Date': w.requiredDate,
      'Estimated Cost (₹)': w.estimatedCost,
      'Actual Cost (₹)': w.actualCost || w.estimatedCost,
      'Turnaround (Days)': w.turnaroundDays || 'In Progress',
      'PE Approved': w.peApproved ? 'YES' : 'NO',
      'Created At': w.createdAt,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Work_Orders_Report');
    XLSX.writeFile(wb, `Technova_MM_Chakan_WorkOrders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            {t('digital_wo_title', 'Digital Work Order Management')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('digital_wo_desc', 'End-to-end fabrication tracking across 15 shops • SLA Target: < 2 Days')}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('btn_export_excel', 'Export Excel')}</span>
          </button>

          {hasPermission('create_work_order') && (
            <button
              onClick={onOpenCreateWO}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_raise_wo', 'Raise Work Order')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder_wo', 'Search by WO#, Trolley#, Part#, Shop, or Description...')}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Shop dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{t('shop_selector_label', 'Shop')}:</span>
            <select
              value={activeShopFilter}
              onChange={(e) => setActiveShopFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="ALL">{t('all_shops', 'All 15 Shops')}</option>
              {shops.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{t('priority', 'Priority')}:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="ALL">{t('all_priorities', 'All Priorities')}</option>
              <option value="Normal">{t('priority_normal', 'Normal')}</option>
              <option value="High">{t('priority_high', 'High')}</option>
              <option value="Critical">{t('priority_critical', 'Critical')}</option>
            </select>
          </div>
        </div>

        {/* Status pill bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedStatus(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === f.value
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">{t('th_wo_number', 'WO Number')}</th>
                <th className="py-3 px-3">{t('th_shop', 'Shop')}</th>
                <th className="py-3 px-3">{t('th_trolley_part', 'Trolley / Part #')}</th>
                <th className="py-3 px-3">{t('th_activity_details', 'Activity & Details')}</th>
                <th className="py-3 px-3">{t('th_priority', 'Priority')}</th>
                <th className="py-3 px-3">{t('th_status', 'Status')}</th>
                <th className="py-3 px-3">{t('th_tat_due', 'TAT / Due')}</th>
                <th className="py-3 px-3">{t('th_cost', 'Cost (₹)')}</th>
                <th className="py-3 px-3 text-right">{t('th_action', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">{t('no_matching_wo', 'No work orders match your search criteria')}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('try_resetting_filters', 'Try resetting filters or raising a new request.')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((wo) => {
                  const isCritical = wo.priority === 'Critical';
                  const isHigh = wo.priority === 'High';
                  const isCompleted = wo.status === 'Completed' || wo.status === 'Closed';

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => onSelectWorkOrder(wo)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      {/* WO Number */}
                      <td className="py-3 px-3 font-bold font-mono text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{wo.workOrderNumber}</span>
                          {wo.peRequired && !wo.peApproved && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                              PE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Shop Code */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200">
                          {wo.shopCode}
                        </span>
                      </td>

                      {/* Trolley / Part */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{wo.trolleyNumber || 'Shop Fixture'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{wo.partNumber || 'N/A'}</div>
                      </td>

                      {/* Activity & Description */}
                      <td className="py-3 px-3 max-w-[280px]">
                        <div className="font-bold text-teal-800">{wo.activityType}</div>
                        <div className="text-slate-600 line-clamp-1 text-[11px]">{wo.jobDescription}</div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isHigh
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t(`priority_${wo.priority.toLowerCase()}`, wo.priority)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : wo.status === 'In Progress'
                              ? 'bg-teal-100 text-teal-800'
                              : wo.status === 'Awaiting PE Approval'
                              ? 'bg-indigo-100 text-indigo-800'
                              : wo.status === 'Awaiting Inspection'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {t(`status_${wo.status.toLowerCase().replace(/ /g, '_')}`, wo.status)}
                        </span>
                      </td>

                      {/* TAT / Due Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                        {isCompleted ? (
                          <span className="font-bold text-emerald-700">
                            {wo.turnaroundDays ? `${wo.turnaroundDays}d TAT` : 'Done'}
                          </span>
                        ) : (
                          <span>{t('due_label', 'Due')} {wo.requiredDate}</span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                        ₹{(wo.actualCost || wo.estimatedCost).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectWorkOrder(wo);
                          }}
                          className="px-2.5 py-1 text-teal-700 hover:text-teal-900 font-bold text-xs hover:bg-teal-50 rounded transition inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{t('btn_review', 'Review')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
