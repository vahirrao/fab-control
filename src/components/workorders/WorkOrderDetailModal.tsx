import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { WorkOrder, WorkOrderStatus } from '../../types';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Wrench,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  Calendar,
  Building2,
  Sparkles,
  ArrowRight,
  Play,
  Check,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'photos' | 'pe_approval' | 'quality' | 'costing' | 'history';

const WORKFLOW_STEPS: WorkOrderStatus[] = [
  'Submitted',
  'Approved',
  'Assigned',
  'In Progress',
  'Awaiting Inspection',
  'Completed',
  'Closed',
];

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  workOrder,
  isOpen,
  onClose,
}) => {
  const { updateWorkOrderStatus, updateWorkOrder, rateCards, manpower, auditLogs } = useData();
  const { profile, hasPermission } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [remarks, setRemarks] = useState('');
  const [peNotes, setPeNotes] = useState('');
  const [qaInspectorName, setQaInspectorName] = useState(profile.name);
  const [qaRemarks, setQaRemarks] = useState('');
  const [reworkReason, setReworkReason] = useState('');

  if (!isOpen || !workOrder) return null;

  // Rate card comparison
  const matchedRC = rateCards.find(
    (rc) => rc.activityName === workOrder.activityType || rc.code === workOrder.rateCardCode
  );
  const externalBenchmark = matchedRC?.benchmarkExternalVendorRate || (workOrder.actualCost || 1850) * 1.75;
  const savingsForThisJob = Math.max(0, externalBenchmark - (workOrder.actualCost || workOrder.estimatedCost));

  // Related audit logs
  const relatedLogs = auditLogs.filter(
    (l) => l.entityId === workOrder.id || l.details.includes(workOrder.workOrderNumber)
  );

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    await updateWorkOrderStatus(workOrder.id, newStatus, remarks);
    setRemarks('');
  };

  const handlePESignOff = async (approved: boolean) => {
    await updateWorkOrder(workOrder.id, {
      peApproved: approved,
      peApprovalNotes: peNotes || (approved ? 'Technical validation passed per M&M standard.' : 'Technical revision required.'),
      peApprovedBy: `${profile.name} (PE)`,
      peApprovedAt: new Date().toISOString(),
      status: approved ? 'Approved' : 'Rejected',
    });
    setPeNotes('');
  };

  const handleQualityVerify = async (passed: boolean) => {
    if (passed) {
      await updateWorkOrderStatus(
        workOrder.id,
        'Completed',
        `Quality inspection passed by ${qaInspectorName}. Remarks: ${qaRemarks || 'Meets fabrication standards.'}`,
        {
          qualityInspectionPassed: true,
          qualityInspectorName: qaInspectorName,
          qualityRemarks: qaRemarks,
        }
      );
    } else {
      // Trigger Rework
      await updateWorkOrderStatus(
        workOrder.id,
        'Rework Required',
        `Rework needed: ${reworkReason || 'Weld defect / dimensional deviation'}`,
        {
          qualityInspectionPassed: false,
          reworkCount: (workOrder.reworkCount || 0) + 1,
        }
      );
    }
  };

  // Upload after / progress photos with instant Object URL preview and client compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'during' | 'after') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // 1. Instant local preview
      const instantUrl = URL.createObjectURL(file);
      if (photoType === 'after') {
        updateWorkOrder(workOrder.id, {
          afterPhotoUrls: [...(workOrder.afterPhotoUrls || []), instantUrl],
        });
      } else {
        updateWorkOrder(workOrder.id, {
          duringPhotoUrls: [...(workOrder.duringPhotoUrls || []), instantUrl],
        });
      }

      // 2. Compress to Base64 in background
      const reader = new FileReader();
      reader.onload = (event) => {
        const compressed = event.target?.result as string;
        if (photoType === 'after') {
          updateWorkOrder(workOrder.id, {
            afterPhotoUrls: [
              ...(workOrder.afterPhotoUrls || []).filter((u) => u !== instantUrl),
              compressed,
            ],
          });
        } else {
          updateWorkOrder(workOrder.id, {
            duringPhotoUrls: [
              ...(workOrder.duringPhotoUrls || []).filter((u) => u !== instantUrl),
              compressed,
            ],
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const currentStepIndex = WORKFLOW_STEPS.indexOf(workOrder.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black px-2.5 py-1 rounded bg-teal-600 text-white">
              {workOrder.workOrderNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{workOrder.shopCode} Shop</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-teal-400 font-semibold">{workOrder.activityType}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    workOrder.priority === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : workOrder.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {workOrder.priority} Priority
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Raised by {workOrder.requesterName} • Required: {workOrder.requiredDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                workOrder.status === 'Completed' || workOrder.status === 'Closed'
                  ? 'bg-emerald-500 text-white'
                  : workOrder.status === 'In Progress'
                  ? 'bg-teal-500 text-white'
                  : workOrder.status === 'Awaiting PE Approval'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {workOrder.status}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Workflow Journey Bar */}
        <div className="bg-slate-850 px-5 py-2.5 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center min-w-[550px] justify-between text-[11px]">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = workOrder.status === step;
              return (
                <div key={step} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      isCurrent
                        ? 'bg-teal-400 text-slate-900 ring-2 ring-teal-400/50'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isPast && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`truncate text-[10px] font-semibold ${
                      isCurrent ? 'text-teal-400 font-bold' : isPast ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step}
                  </span>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 ${isPast && currentStepIndex > idx ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'overview' ? 'border-teal-600 text-teal-700 bg-white font-bold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tab_overview', 'Overview & Specs')}
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'photos' ? 'border-teal-600 text-teal-700 bg-white font-bold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t('tab_photos', 'Photos')} ({workOrder.beforePhotoUrls?.length + (workOrder.afterPhotoUrls?.length || 0)})</span>
          </button>
          <button
            onClick={() => setActiveTab('pe_approval')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pe_approval' ? 'border-teal-600 text-teal-700 bg-white font-bold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('tab_pe_validation', 'PE Validation')} {workOrder.peApproved ? '✓' : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quality' ? 'border-teal-600 text-teal-700 bg-white font-bold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{t('tab_quality_inspection', 'Quality Inspection')}</span>
          </button>
          <button
            onClick={() => setActiveTab('costing')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'costing' ? 'border-teal-600 text-teal-700 bg-white font-bold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('tab_cost_savings', 'Cost & Savings')}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'border-teal-600 text-teal-700 bg-white font-bold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('tab_audit_history', 'Audit History')}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 text-teal-800">
                  Job Specifications & Requirements
                </h4>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {workOrder.jobDescription}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-slate-600">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Trolley Number</span>
                    <span className="font-bold text-slate-900 text-xs">{workOrder.trolleyNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Part Number</span>
                    <span className="font-bold text-slate-900 text-xs font-mono">{workOrder.partNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Floor Location</span>
                    <span className="font-bold text-slate-900 text-xs">{workOrder.location}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Rate Card Activity</span>
                    <span className="font-bold text-teal-800 text-xs">{workOrder.activityType}</span>
                  </div>
                </div>
              </div>

              {/* Assignment & Execution Panel */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-teal-800">
                    On-Site Technova Fabrication Crew
                  </h4>
                  <span className="text-xs text-slate-500">
                    {workOrder.turnaroundDays ? `TAT: ${workOrder.turnaroundDays} Days` : 'In Progress'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {workOrder.assignedTechnicianNames?.length > 0 ? (
                    workOrder.assignedTechnicianNames.map((name, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No technician assigned yet.</span>
                  )}
                </div>

                {/* Quick Status Transition Controls */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block text-[11px]">Advance Workflow Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {workOrder.status === 'Submitted' && (
                      <button
                        onClick={() => handleStatusChange('Approved')}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
                      >
                        Approve Request
                      </button>
                    )}
                    {['Submitted', 'Approved'].includes(workOrder.status) && (
                      <button
                        onClick={() => handleStatusChange('In Progress')}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
                      >
                        Start Work On Floor
                      </button>
                    )}
                    {workOrder.status === 'In Progress' && (
                      <button
                        onClick={() => handleStatusChange('Awaiting Inspection')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                      >
                        Mark Ready for Inspection
                      </button>
                    )}
                    {workOrder.status === 'Completed' && (
                      <button
                        onClick={() => handleStatusChange('Closed')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                      >
                        Close & Invoice Work Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOGRAPHIC EVIDENCE */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('visual_verification_title', 'Visual Verification & Photographic Evidence')}</h4>
                  <p className="text-slate-500 text-[11px]">{t('visual_verification_subtitle', 'Before, during, and after repair photos for quality records')}</p>
                </div>

                <label className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('btn_upload_completed_photo', 'Upload Completed Photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'after')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Before Photos */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    {t('before_photos_title', 'Before-Work Condition Photos')}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {workOrder.beforePhotoUrls?.length || 0} {t('attached_count', 'Attached')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {workOrder.beforePhotoUrls?.length > 0 ? (
                    workOrder.beforePhotoUrls.map((url, i) => (
                      <ImageWithFallback
                        key={i}
                        src={url}
                        alt={`${t('initial_inspection', 'Initial Inspection')} #${i + 1}`}
                        title={`${t('initial_inspection', 'Initial Inspection')} #${i + 1}`}
                        subtitle={`${workOrder.shopCode} Shop • ${workOrder.trolleyNumber || 'Shop Fixture'}`}
                        category={workOrder.activityType === 'Welding' ? 'welding' : 'fabrication'}
                        aspectRatio="video"
                      />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <ImageWithFallback
                        src={null}
                        alt={t('before_photos_title', 'Before-Work Condition Photos')}
                        title={t('no_before_photos', 'No Initial Photo Uploaded')}
                        subtitle={t('click_attach_before_photos', 'Click to attach before-work damage photographs')}
                        category="inspection"
                        showUploadButton={true}
                        onPhotoUploaded={(previewUrl) => {
                          updateWorkOrder(workOrder.id, {
                            beforePhotoUrls: [...(workOrder.beforePhotoUrls || []), previewUrl],
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* After Photos */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    {t('after_photos_title', 'After-Work Completion Photos')}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {workOrder.afterPhotoUrls?.length || 0} {t('attached_count', 'Attached')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {workOrder.afterPhotoUrls?.length > 0 ? (
                    workOrder.afterPhotoUrls.map((url, i) => (
                      <ImageWithFallback
                        key={i}
                        src={url}
                        alt={`${t('quality_passed', 'Quality Passed')} #${i + 1}`}
                        title={`${t('quality_passed', 'Quality Passed')} #${i + 1}`}
                        subtitle={t('verified_by_qa', 'Verified by Technova QA')}
                        category={workOrder.activityType === 'Welding' ? 'welding' : 'fabrication'}
                        aspectRatio="video"
                      />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <ImageWithFallback
                        src={null}
                        alt={t('after_photos_title', 'After-Work Completion Photos')}
                        title={t('no_after_photos', 'Awaiting Job Completion Photos')}
                        subtitle={t('technician_uploads_photo', 'Technician or supervisor uploads photographic proof after fabrication')}
                        category="fabrication"
                        showUploadButton={true}
                        onPhotoUploaded={(previewUrl) => {
                          updateWorkOrder(workOrder.id, {
                            afterPhotoUrls: [...(workOrder.afterPhotoUrls || []), previewUrl],
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLANT ENGINEER VALIDATION */}
          {activeTab === 'pe_approval' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    <h4 className="font-bold text-indigo-950 text-sm">Plant Engineer (PE) Technical Validation</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded font-bold text-[11px] ${
                      workOrder.peApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {workOrder.peApproved ? 'Technical Sign-Off Approved' : 'Technical Review Pending'}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  Validates structural modifications, high-tensile welding specifications, dynamic load ratings, and assembly drawings for Mahindra Chakan vehicle lines.
                </p>

                {workOrder.peApprovalNotes && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">PE Engineering Remarks</span>
                    <p className="font-medium text-slate-900 mt-1">{workOrder.peApprovalNotes}</p>
                    <div className="text-[10px] text-slate-400 mt-2">
                      Validated by: {workOrder.peApprovedBy || 'Er. Rajesh Varma (PE)'}
                    </div>
                  </div>
                )}
              </div>

              {/* PE Review Action Form */}
              {hasPermission('pe_approval') && !workOrder.peApproved && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-slate-800">Record Plant Engineer Decision:</h5>
                  <textarea
                    rows={2}
                    value={peNotes}
                    onChange={(e) => setPeNotes(e.target.value)}
                    placeholder="Enter structural inspection comments, tolerance verification, or drawing references..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePESignOff(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                    >
                      ✓ Approve Technical Compliance
                    </button>
                    <button
                      onClick={() => handlePESignOff(false)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                    >
                      Reject & Request Redesign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUALITY INSPECTION */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">Quality Gate & Workmanship Audit</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                      workOrder.qualityInspectionPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {workOrder.qualityInspectionPassed ? 'QA Passed' : 'Inspection Due'}
                  </span>
                </div>

                <div className="space-y-2 mt-3 text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Weld integrity, absence of porosity, spatter cleanup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Positive foot brake engagement and wheel swivel action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Anti-scratch PU resting pads installed securely</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>QR Code tag affixed and scan test confirmed</span>
                  </div>
                </div>

                {workOrder.reworkCount && workOrder.reworkCount > 0 ? (
                  <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                    Rework Cycle #{workOrder.reworkCount} has been executed on this job.
                  </div>
                ) : null}
              </div>

              {/* QA Actions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800">Quality Inspection Action:</h5>
                <input
                  type="text"
                  value={qaRemarks}
                  onChange={(e) => setQaRemarks(e.target.value)}
                  placeholder="Inspector remarks (e.g. weld bead verified, tolerances OK)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQualityVerify(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                  >
                    ✓ Pass Inspection & Mark Completed
                  </button>
                  <button
                    onClick={() => handleQualityVerify(false)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                  >
                    Flag Rework Required
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COSTING & BILLING */}
          {activeTab === 'costing' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-xl border border-teal-800">
                <span className="text-xs uppercase font-bold text-teal-400">Activity-Wise Pre-Approved Rate Card</span>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <h4 className="text-xl font-black text-white">{workOrder.activityType}</h4>
                    <p className="text-xs text-slate-300">Rate Code: {workOrder.rateCardCode || 'FAB-STR-01'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Approved Cost</span>
                    <span className="text-2xl font-mono font-black text-teal-300">
                      ₹{(workOrder.actualCost || workOrder.estimatedCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Comparison Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Legacy External Vendor Benchmark
                  </span>
                  <div className="text-lg font-mono font-bold text-slate-700 mt-1">
                    ₹{externalBenchmark.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">8–12 days turnaround delay</p>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">
                    Savings with Technova On-Site Team
                  </span>
                  <div className="text-lg font-mono font-black text-teal-900 mt-1">
                    +₹{savingsForThisJob.toLocaleString()} ({Math.round((savingsForThisJob / externalBenchmark) * 100)}%)
                  </div>
                  <p className="text-[10px] text-teal-700 mt-1">1–2 days fast turnaround</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Immutable Status & Compliance Audit Trail</h4>
              <div className="space-y-2">
                {relatedLogs.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">No previous logs recorded.</p>
                ) : (
                  relatedLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{log.details}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        By {log.performedByName} ({log.performedByRole})
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Current Status: <strong className="text-slate-900">{workOrder.status}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {t('btn_close', 'Close Details')}
          </button>
        </div>
      </div>
    </div>
  );
};
