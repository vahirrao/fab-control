import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SafetyIncident } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  FileCheck2,
  Plus,
  Building2,
} from 'lucide-react';

export const QualitySafetyView: React.FC = () => {
  const { safetyIncidents, createSafetyIncident, resolveSafetyIncident, assets, shops } = useData();
  const { hasPermission, profile } = useAuth();
  const { t } = useLanguage();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState('E');
  const [severity, setSeverity] = useState<SafetyIncident['severity']>('Critical Unsafe');
  const [affectedAssetId, setAffectedAssetId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  const [resolvingIncident, setResolvingIncident] = useState<SafetyIncident | null>(null);
  const [clearanceAction, setClearanceAction] = useState('');

  const activeIncidents = safetyIncidents.filter((s) => s.status !== 'Resolved & Cleared');
  const resolvedIncidents = safetyIncidents.filter((s) => s.status === 'Resolved & Cleared');

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await createSafetyIncident({
      shopCode: selectedShop,
      location,
      severity,
      description,
      affectedAssetId: affectedAssetId || undefined,
      actionTaken,
    });

    setIsReportModalOpen(false);
    setDescription('');
    setLocation('');
    setActionTaken('');
    setAffectedAssetId('');
  };

  const handleResolveSubmit = async () => {
    if (!resolvingIncident) return;
    await resolveSafetyIncident(
      resolvingIncident.id,
      clearanceAction || `Defect repaired, safety inspection completed by ${profile.name}. Asset released to floor.`
    );
    setResolvingIncident(null);
    setClearanceAction('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            {t('quality_safety_title', 'Quality Assurance & Industrial Safety Lockout Hub')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('quality_safety_subtitle', 'Zero-harm factory governance, PPE compliance, and defective trolley quarantine protocol')}
          </p>
        </div>

        {hasPermission('safety_lockout') && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t('btn_report_defect_lockout', '+ Report Defect / Safety Lockout')}</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('active_safety_lockouts', 'Active Safety Lockouts')}
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">{activeIncidents.length}</div>
          <span className="text-xs text-rose-700 font-semibold">
            {t('trolleys_quarantined_desc', 'Trolleys quarantined from tow trains')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('safety_clearance_rate', 'Safety Clearance Rate')}
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {safetyIncidents.length > 0
              ? `${Math.round((resolvedIncidents.length / safetyIncidents.length) * 100)}%`
              : '100%'}
          </div>
          <span className="text-xs text-slate-500">
            {resolvedIncidents.length} {t('incidents_inspected_released', 'incidents inspected and released')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t('ppe_compliance_standard', 'PPE Compliance Standard')}
          </span>
          <div className="text-2xl font-black text-teal-600 mt-1">100%</div>
          <span className="text-xs text-teal-700 font-semibold">
            {t('ppe_compliance_desc', 'Eye protection, steel-toe, hot-work gear')}
          </span>
        </div>
      </div>

      {/* Active Lockout Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600" />
            {t('active_lockout_log_title', 'Active Lockout & Defect Quarantine Log')}
          </h3>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            {activeIncidents.length} {t('active_label', 'Active')}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeIncidents.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-sm text-slate-700">
                {t('all_shops_clear_lockouts', 'All shops clear of safety lockouts')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t('all_trolleys_authorized', 'All trolleys and fixtures inspected and authorized for use.')}
              </p>
            </div>
          ) : (
            activeIncidents.map((inc) => (
              <div key={inc.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                      {inc.incidentNumber}
                    </span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {inc.shopCode} {t('shop_selector_label', 'Shop')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inc.severity === 'Critical Unsafe'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.severity === 'Critical Unsafe' ? t('severity_critical_unsafe', 'Critical Unsafe') : inc.severity}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-slate-900 mt-1">{inc.description}</p>
                  <p className="text-xs text-slate-600">
                    {t('location', 'Location')}: <strong>{inc.location}</strong> • {t('action_taken_label', 'Action Taken:')} {inc.actionTaken}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    {t('reported_by', 'Reported by')} {inc.reportedBy} {t('on_date_label', 'on')} {new Date(inc.reportedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setResolvingIncident(inc)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{t('btn_clear_release_asset', 'Clear & Release Asset')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Defect Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">{t('modal_report_defect_title', 'Report Defect / Lockout Asset')}</h3>
            <p className="text-slate-500">
              {t('modal_report_defect_desc', 'Flags unsafe trolley or fixture. Immediately blocks asset from shop floor movement.')}
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('lbl_shop_code', 'Shop Code')} *</label>
                  <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('lbl_severity', 'Severity')} *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-rose-700"
                  >
                    <option value="Critical Unsafe">{t('severity_critical_unsafe', 'Critical Unsafe')} (Lockout Tagout)</option>
                    <option value="High">{t('severity_high', 'High Severity')}</option>
                    <option value="Medium">{t('severity_medium', 'Medium Severity')}</option>
                    <option value="Low">{t('severity_low', 'Low / Minor Defect')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_select_defective_asset', 'Select Defective Asset / Trolley')}</label>
                <select
                  value={affectedAssetId}
                  onChange={(e) => setAffectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">{t('opt_non_asset_hazard', '-- Non-Asset Shop Floor Hazard --')}</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.trolleyNumber} - {a.name} ({a.shopCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_floor_location', 'Floor Location')} *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bay 4 Engine Drop Line"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_defect_description', 'Observation / Defect Description')} *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe crack, failed hitch, missing lock pin, sharp metal protrusion..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('lbl_action_taken', 'Immediate Safety Action Taken')}</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Asset quarantined at Bay 4 quarantine pen; lockout tag affixed."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  {t('btn_cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {t('btn_confirm_lockout', 'Confirm Lockout & Log')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear & Release Modal */}
      {resolvingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">{t('modal_clear_release_title', 'Safety Clearance & Asset Release')}</h3>
            <p className="text-slate-500">
              {t('modal_clear_release_desc', 'Certifies that repair/fabrication has corrected the defect on')} {resolvingIncident.incidentNumber}.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('lbl_clearance_action', 'Clearance Action & Verification')}</label>
              <textarea
                rows={3}
                value={clearanceAction}
                onChange={(e) => setClearanceAction(e.target.value)}
                placeholder="e.g. Welds dye-penetrant tested by PE; new hitch pin installed; safe for operation."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setResolvingIncident(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
              >
                {t('btn_cancel', 'Cancel')}
              </button>
              <button
                onClick={handleResolveSubmit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                {t('btn_authorize_release', '✓ Authorize Release')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
