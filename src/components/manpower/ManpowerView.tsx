import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ManpowerRecord } from '../../types';
import { Users, UserCheck, ShieldCheck, Phone, Wrench, Award, CheckCircle2, Search } from 'lucide-react';

export const ManpowerView: React.FC = () => {
  const { manpower, updateManpower, shops } = useData();
  const { hasPermission } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');

  const filtered = manpower.filter((m) => {
    if (shiftFilter !== 'ALL' && m.currentShift !== shiftFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.primarySkill.toLowerCase().includes(q) && !m.employeeCode.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleAttendanceChange = async (id: string, status: ManpowerRecord['attendanceStatus']) => {
    await updateManpower(id, { attendanceStatus: status });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            {t('manpower_title', 'Dedicated On-Site Technova Fabrication Workforce')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('manpower_subtitle', 'Certified welders, fitters, and fabricators stationed at M&M Chakan central fabrication cell')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
            {manpower.filter((m) => m.attendanceStatus === 'Present' || m.attendanceStatus === 'Overtime').length} / {manpower.length} {t('on_duty', 'On Duty')}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_manpower_placeholder', 'Search by technician name, skill, or employee ID...')}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <select
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        >
          <option value="ALL">{t('all_shifts', 'All Shifts')}</option>
          <option value="Shift A (Morning)">{t('shift_morning', 'Shift A (Morning)')}</option>
          <option value="Shift B (Evening)">{t('shift_evening', 'Shift B (Evening)')}</option>
          <option value="Shift C (Night)">{t('shift_night', 'Shift C (Night)')}</option>
          <option value="General">{t('shift_general', 'General Shift')}</option>
        </select>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tech) => {
          return (
            <div
              key={tech.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-teal-400 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-teal-400 font-black flex items-center justify-center text-sm border border-slate-700">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{tech.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{tech.employeeCode} • {tech.assignedShop} {t('shop_selector_label', 'Shop')}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tech.attendanceStatus === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tech.attendanceStatus === 'Overtime'
                        ? 'bg-purple-100 text-purple-800'
                        : tech.attendanceStatus === 'On Leave'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tech.attendanceStatus === 'Present'
                      ? t('status_present', 'Present')
                      : tech.attendanceStatus === 'Overtime'
                      ? t('status_overtime', 'Overtime')
                      : tech.attendanceStatus === 'On Leave'
                      ? t('status_on_leave', 'On Leave')
                      : tech.attendanceStatus}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Wrench className="w-3.5 h-3.5 text-teal-600" />
                    <span>{tech.designation}</span>
                  </div>

                  <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">{t('primary_skill', 'Primary Skill')}</span>
                    <span className="font-medium text-slate-800">{tech.primarySkill}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tech.certifications.map((cert, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">{t('current_shift', 'Current Shift:')}</span>
                    <span className="font-semibold text-slate-800">{tech.currentShift}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{t('active_work_orders_tech', 'Active Work Orders:')}</span>
                    <span className="font-bold text-teal-800 font-mono">{tech.activeWorkOrders} {t('assigned_count', 'Assigned')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{t('safety_inducted', 'Safety Inducted:')}</span>
                    <span className="font-bold text-emerald-700">{t('verified_year', '✓ Verified 2026')}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Quick Toggle */}
              {hasPermission('assign_technician') && (
                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('mark_status', 'Mark Status:')}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAttendanceChange(tech.id, 'Present')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        tech.attendanceStatus === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t('status_present', 'Present')}
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(tech.id, 'Overtime')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        tech.attendanceStatus === 'Overtime' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t('status_overtime', 'OT')}
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(tech.id, 'On Leave')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        tech.attendanceStatus === 'On Leave' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t('status_on_leave', 'Leave')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
