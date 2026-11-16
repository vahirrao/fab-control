import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { WorkOrder } from '../../types';
import {
  Play,
  Pause,
  CheckCircle,
  Camera,
  AlertOctagon,
  Wrench,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface WorkerDashboardProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onOpenPhotoUpload: (wo: WorkOrder) => void;
  onOpenReportIssue: (wo: WorkOrder) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onSelectWorkOrder,
  onOpenPhotoUpload,
  onOpenReportIssue,
}) => {
  const { profile } = useAuth();
  const { workOrders, updateWorkOrderStatus, updateWorkOrder } = useData();
  const { t } = useLanguage();

  // Find work orders assigned to this worker or relevant to this user
  const myAssignedOrders = workOrders.filter(
    (wo) =>
      wo.assignedTechnicianUids.includes(profile.uid) ||
      wo.assignedTechnicianNames.some((n) => n.includes(profile.name.split(' ')[0])) ||
      // Fallback for demo technician
      wo.status === 'In Progress' ||
      wo.status === 'Assigned'
  );

  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'urgent'>('in_progress');

  const filteredOrders = myAssignedOrders.filter((wo) => {
    if (activeTab === 'in_progress') return wo.status === 'In Progress';
    if (activeTab === 'urgent') return wo.priority === 'Critical' || wo.priority === 'High';
    return true;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Top Welcome Card with Factory Worker Focus */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {t('worker_team_alpha', 'Technova On-Site Team Alpha • Chakan')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            {t('worker_greeting', 'Hello')}, {profile.name}!
          </h1>
          <p className="text-xs text-slate-300">
            {profile.designation || t('role_technician', 'Fabricator & Welder')} • {t('worker_shift', 'Shift A (Morning)')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3.5 py-2 rounded-xl text-center border border-slate-700">
            <div className="text-xs text-slate-400 uppercase font-bold">{t('assigned_jobs_stat', 'Assigned Jobs')}</div>
            <div className="text-xl font-black text-white">{myAssignedOrders.length}</div>
          </div>
          <div className="bg-teal-950/80 px-3.5 py-2 rounded-xl text-center border border-teal-500/40">
            <div className="text-xs text-teal-300 uppercase font-bold">{t('status_in_progress', 'In Progress')}</div>
            <div className="text-xl font-black text-teal-400">
              {myAssignedOrders.filter((w) => w.status === 'In Progress').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/70 p-1.5 rounded-xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`py-2.5 rounded-lg transition cursor-pointer ${
            activeTab === 'in_progress' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tab_active_jobs_now', 'Active Jobs Now')} ({myAssignedOrders.filter((w) => w.status === 'In Progress').length})
        </button>
        <button
          onClick={() => setActiveTab('urgent')}
          className={`py-2.5 rounded-lg transition cursor-pointer ${
            activeTab === 'urgent' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tab_urgent_priority', 'Urgent / High Priority')}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2.5 rounded-lg transition cursor-pointer ${
            activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tab_all_assigned', 'All Assigned')} ({myAssignedOrders.length})
        </button>
      </div>

      {/* List of Large Touch-Friendly Job Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No jobs in this category</h3>
            <p className="text-xs text-slate-400 mt-1">Check "All Assigned" to view upcoming jobs or notify supervisor.</p>
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isInProgress = wo.status === 'In Progress';
            const isCritical = wo.priority === 'Critical' || wo.priority === 'High';

            return (
              <div
                key={wo.id}
                className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition ${
                  isInProgress ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                        {wo.workOrderNumber}
                      </span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        {wo.shopCode} Shop
                      </span>
                      {isCritical && (
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          {wo.priority} Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">{wo.jobDescription}</h3>
                    <p className="text-xs text-slate-500">
                      Trolley: <strong className="text-slate-800">{wo.trolleyNumber || 'N/A'}</strong> • Location: {wo.location}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                      isInProgress ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {wo.status}
                  </span>
                </div>

                {/* Technical / Activity Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs bg-slate-50 p-2.5 rounded-xl text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Activity</span>
                    <span className="font-semibold text-slate-800">{wo.activityType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Part No</span>
                    <span className="font-semibold text-slate-800">{wo.partNumber || 'MN-PART'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Required Date</span>
                    <span className="font-semibold text-slate-800">{wo.requiredDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">PE Approval</span>
                    <span className={`font-semibold ${wo.peApproved ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {wo.peApproved ? 'Cleared ✓' : 'Awaiting Review'}
                    </span>
                  </div>
                </div>

                {/* Photo Evidence Preview Strip */}
                {((wo.beforePhotoUrls?.length || 0) > 0 || (wo.duringPhotoUrls?.length || 0) > 0 || (wo.afterPhotoUrls?.length || 0) > 0) && (
                  <div className="my-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Attached Photographic Proof:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[...(wo.beforePhotoUrls || []), ...(wo.duringPhotoUrls || []), ...(wo.afterPhotoUrls || [])].slice(0, 5).map((url, i) => (
                        <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <ImageWithFallback
                            src={url}
                            alt={`Photo ${i + 1}`}
                            category={wo.activityType === 'Welding' ? 'welding' : 'fabrication'}
                            aspectRatio="square"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worker Primary Action Touch Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {!isInProgress ? (
                    <button
                      onClick={() =>
                        updateWorkOrderStatus(wo.id, 'In Progress', 'Technician initiated work on shop floor.')
                      }
                      className="py-3 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{t('btn_start_work', 'Start Work')}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          updateWorkOrderStatus(wo.id, 'On Hold', 'Worker temporarily paused task.')
                        }
                        className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Pause className="w-4 h-4" />
                        <span>{t('btn_cancel', 'Pause')}</span>
                      </button>

                      <button
                        onClick={() =>
                          updateWorkOrderStatus(
                            wo.id,
                            'Awaiting Inspection',
                            'Fabrication completed by technician. Ready for QA & Supervisor inspection.'
                          )
                        }
                        className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('btn_complete_job', 'Finish Job')}</span>
                      </button>
                    </>
                  )}

                  {/* Photo Evidence button */}
                  <button
                    onClick={() => onOpenPhotoUpload(wo)}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-teal-400" />
                    <span>{t('btn_upload_photo', 'Upload Photo')}</span>
                  </button>

                  {/* Report Issue / Blocker */}
                  <button
                    onClick={() => onOpenReportIssue(wo)}
                    className="py-3 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 active:scale-95 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>{t('btn_report_issue', 'Report Blocker')}</span>
                  </button>

                  {/* Full Details link */}
                  <button
                    onClick={() => onSelectWorkOrder(wo)}
                    className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <span>{t('view_details', 'View Specs →')}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
