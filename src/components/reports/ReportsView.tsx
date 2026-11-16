import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  TrendingDown,
  Sparkles,
  Printer,
  Download,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsView: React.FC = () => {
  const { workOrders, shops, assets, preventiveMaintenance, manpower, getFinancialSavings } = useData();
  const { t } = useLanguage();

  const [reportType, setReportType] = useState<
    'work_orders' | 'shop_performance' | 'savings_financial' | 'pm_compliance' | 'manpower'
  >('work_orders');

  const { totalEstimatedSavings, technovaTotal, benchmarkExternalTotal, completedTurnaroundAvg, slaCompliancePct } =
    getFinancialSavings();

  // Excel Export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (reportType === 'work_orders') {
      const data = workOrders.map((w) => ({
        'Work Order #': w.workOrderNumber,
        Shop: w.shopCode,
        'Shop Name': w.shopName,
        'Trolley #': w.trolleyNumber || 'N/A',
        Activity: w.activityType,
        Priority: w.priority,
        Status: w.status,
        'Required Date': w.requiredDate,
        'Estimated (₹)': w.estimatedCost,
        'Actual (₹)': w.actualCost || w.estimatedCost,
        'TAT (Days)': w.turnaroundDays || 'Active',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Work_Orders');
    } else if (reportType === 'shop_performance') {
      const data = shops.map((s) => {
        const shopWOs = workOrders.filter((w) => w.shopCode === s.code);
        const completed = shopWOs.filter((w) => ['Completed', 'Closed'].includes(w.status)).length;
        const totalCost = shopWOs.reduce((acc, c) => acc + (c.actualCost || c.estimatedCost), 0);
        return {
          'Shop Code': s.code,
          'Shop Name': s.name,
          Area: s.area,
          Supervisor: s.supervisorName,
          'Target TAT (Days)': s.targetTAT,
          'Total Jobs': shopWOs.length,
          'Completed Jobs': completed,
          'Total Expenditure (₹)': totalCost,
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Shop_Performance');
    } else if (reportType === 'savings_financial') {
      const data = [
        { Metric: 'Technova Consolidated Expenditure', Value: `INR ${technovaTotal.toLocaleString()}` },
        { Metric: 'Legacy External Vendor Baseline', Value: `INR ${benchmarkExternalTotal.toLocaleString()}` },
        { Metric: 'Cumulative Net Facility Savings', Value: `INR ${totalEstimatedSavings.toLocaleString()}` },
        { Metric: 'Average Turnaround Time', Value: `${completedTurnaroundAvg} Days (Legacy: 8-12 Days)` },
        { Metric: 'SLA Target Compliance', Value: `${slaCompliancePct}%` },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Financial_Savings');
    }

    XLSX.writeFile(wb, `Technova_MM_Chakan_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF Export using jsPDF and autoTable
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('FAB-CONTROL PRO - INDUSTRIAL MIS REPORT', 14, 15);
    doc.setFontSize(10);
    doc.text('Technova Enterprises • Mahindra & Mahindra Ltd. Chakan Plant', 14, 22);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | 15-Shop Consolidated`, 14, 28);

    if (reportType === 'work_orders') {
      const tableData = workOrders.map((w) => [
        w.workOrderNumber,
        w.shopCode,
        w.trolleyNumber || 'N/A',
        w.activityType,
        w.status,
        `Rs. ${w.actualCost || w.estimatedCost}`,
        `${w.turnaroundDays || '-'} d`,
      ]);

      autoTable(doc, {
        startY: 33,
        head: [['WO #', 'Shop', 'Trolley', 'Activity', 'Status', 'Cost', 'TAT']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });
    } else if (reportType === 'shop_performance') {
      const tableData = shops.map((s) => {
        const count = workOrders.filter((w) => w.shopCode === s.code).length;
        return [s.code, s.name, s.area, s.supervisorName, `${s.targetTAT} d`, `${count} Jobs`];
      });

      autoTable(doc, {
        startY: 33,
        head: [['Code', 'Shop Name', 'Area', 'Supervisor', 'Target TAT', 'Volume']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });
    } else {
      const tableData = [
        ['Technova Consolidated Spend', `Rs. ${technovaTotal.toLocaleString()}`],
        ['Legacy External Vendor Benchmark', `Rs. ${benchmarkExternalTotal.toLocaleString()}`],
        ['Annual Projected Facility Savings', `Rs. ${totalEstimatedSavings.toLocaleString()} (Exceeding Rs 1+ Cr)`],
        ['Average Turnaround Time (TAT)', `${completedTurnaroundAvg} Days (Down from 8-12 days)`],
        ['SLA Compliance Percentage', `${slaCompliancePct}%`],
      ];

      autoTable(doc, {
        startY: 33,
        head: [['Financial & Operational Metric', 'Value / Performance']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
      });
    }

    doc.save(`Technova_MM_Chakan_${reportType}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-teal-600" />
            {t('reports_title', 'Executive Reports & Management Information System (MIS)')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('reports_subtitle', 'Export official operational, financial, and SLA audit reports for M&M management review')}
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('btn_export_excel_full', 'Export Excel (.xlsx)')}</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>{t('btn_generate_pdf', 'Generate PDF Report')}</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setReportType('work_orders')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer ${
            reportType === 'work_orders' ? 'bg-teal-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tab_wo_mis_report', 'Work Order MIS Report')}
        </button>
        <button
          onClick={() => setReportType('shop_performance')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer ${
            reportType === 'shop_performance' ? 'bg-teal-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tab_shop_performance', '15-Shop Performance & Volume')}
        </button>
        <button
          onClick={() => setReportType('savings_financial')}
          className={`py-2 px-3 rounded-lg transition cursor-pointer ${
            reportType === 'savings_financial' ? 'bg-teal-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tab_savings_financial', 'Financial Savings & Rate Audit')}
        </button>
      </div>

      {/* Report Preview Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 capitalize">
              {reportType === 'work_orders'
                ? t('tab_wo_mis_report', 'Work Order MIS Report')
                : reportType === 'shop_performance'
                ? t('tab_shop_performance', '15-Shop Performance & Volume')
                : t('tab_savings_financial', 'Financial Savings & Rate Audit')}{' '}
              {t('live_data_preview', 'Live Data Preview')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('preview_subtitle', 'Live preview before exporting to Excel or PDF format')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
            {t('ready_for_export', 'Ready for Export')}
          </span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'work_orders' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">{t('th_wo_number', 'WO #')}</th>
                  <th className="py-2.5 px-3">{t('th_shop', 'Shop')}</th>
                  <th className="py-2.5 px-3">{t('trolley_number', 'Trolley #')}</th>
                  <th className="py-2.5 px-3">{t('th_activity', 'Activity')}</th>
                  <th className="py-2.5 px-3">{t('th_priority', 'Priority')}</th>
                  <th className="py-2.5 px-3">{t('th_status', 'Status')}</th>
                  <th className="py-2.5 px-3">{t('th_cost', 'Cost (₹)')}</th>
                  <th className="py-2.5 px-3">{t('tat_turnaround', 'TAT')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{w.workOrderNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{w.shopCode}</td>
                    <td className="py-2.5 px-3">{w.trolleyNumber || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-medium text-teal-800">{w.activityType}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          w.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : w.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t(`priority_${w.priority.toLowerCase()}`, w.priority)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.status === 'Completed' || w.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.status === 'In Progress'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t(`status_${w.status.toLowerCase().replace(/ /g, '_')}`, w.status)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">₹{(w.actualCost || w.estimatedCost).toLocaleString()}</td>
                    <td className="py-2.5 px-3">{w.turnaroundDays ? `${w.turnaroundDays} d` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'shop_performance' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">{t('th_shop_code', 'Shop Code')}</th>
                  <th className="py-2.5 px-3">{t('th_name', 'Name')}</th>
                  <th className="py-2.5 px-3">{t('th_area_bay', 'Area / Bay')}</th>
                  <th className="py-2.5 px-3">{t('th_supervisor', 'Supervisor')}</th>
                  <th className="py-2.5 px-3">{t('th_target_tat', 'Target TAT')}</th>
                  <th className="py-2.5 px-3">{t('th_total_volume', 'Total Volume')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => {
                  const count = workOrders.filter((w) => w.shopCode === s.code).length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.area}</td>
                      <td className="py-2.5 px-3">{s.supervisorName}</td>
                      <td className="py-2.5 px-3 font-bold text-teal-800">&lt; {s.targetTAT} {t('days_unit', 'Days')}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{count} {t('jobs_raised', 'Jobs Raised')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'savings_financial' && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {t('technova_consolidated_spend', 'Technova Consolidated Spend')}
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    ₹{technovaTotal.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-[10px] uppercase font-bold text-teal-700">
                    {t('annual_net_value', 'Annual Net Value Creation')}
                  </span>
                  <div className="text-2xl font-black text-teal-900 font-mono mt-1">
                    ₹{totalEstimatedSavings.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
