import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import {
  Bell,
  QrCode,
  ShieldAlert,
  ChevronDown,
  User,
  LogOut,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  onOpenQRScanner: () => void;
  onOpenNotifications: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; badgeColor: string }> = {
  super_admin: { label: 'Super Admin', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
  technova_admin: { label: 'Technova Admin', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  plant_manager: { label: 'Plant Manager', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  fabrication_manager: { label: 'Fabrication Manager', badgeColor: 'bg-teal-100 text-teal-800 border-teal-300' },
  shop_supervisor: { label: 'Shop Supervisor', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  plant_engineer: { label: 'Plant Engineer (PE)', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  technician: { label: 'Fabricator / Worker', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300' },
  accounts_finance: { label: 'Accounts & Finance', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  maintenance_coordinator: { label: 'PM Coordinator', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenQRScanner, onOpenNotifications }) => {
  const { profile, role, switchPersona, availablePersonas, signInWithGoogle, signOut, currentUser } = useAuth();
  const { shops, activeShopFilter, setActiveShopFilter, notifications, safetyIncidents, refreshData } = useData();
  const { language, setLanguage, t } = useLanguage();

  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeUnsafeCount = safetyIncidents.filter((s) => s.status === 'Open' || s.status === 'Corrective Action').length;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 select-none">
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Branding & Plant Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center font-black text-xl tracking-wider text-white shadow-md border border-teal-400/30">
            FP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">{t('app_name', 'FAB-CONTROL')}</span>
              <span className="text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/40">
                {t('app_edition', 'PRO')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">
              {t('facility_subtitle', 'Technova Enterprises • M&M Chakan Facility (15 Shops)')}
            </p>
          </div>
        </div>

        {/* Center: Global Shop Selector */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {t('shop_selector_label', 'Shop')}:{' '}
                <strong className="text-white">
                  {activeShopFilter === 'ALL'
                    ? t('all_shops', 'All 15 Shops')
                    : `${activeShopFilter} ${t('shop_selector_label', 'Shop')}`}
                </strong>
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {shopDropdownOpen && (
              <div
                className="absolute left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1"
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  {t('select_facility_shop', 'Select Facility Shop')}
                </div>
                <button
                  onClick={() => {
                    setActiveShopFilter('ALL');
                    setShopDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 ${
                    activeShopFilter === 'ALL' ? 'text-teal-400 font-bold bg-slate-700/60' : 'text-slate-300'
                  }`}
                >
                  <span>{t('all_shops_consolidated', 'All Shops (Consolidated Facility)')}</span>
                  {activeShopFilter === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                </button>
                {shops.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveShopFilter(s.code);
                      setShopDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-700 ${
                      activeShopFilter === s.code ? 'text-teal-400 font-bold bg-slate-700/60' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.area}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {s.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeUnsafeCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{activeUnsafeCount} {t('unsafe_lockout', 'Unsafe Lockout Active')}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Tools, Multi-Language & Role Persona Selector */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Multi-Language Switcher (English <-> Marathi) */}
          <div
            className="flex items-center rounded-lg bg-slate-800 border border-slate-700 p-0.5 text-xs shadow-xs"
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                language === 'en'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to English"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[11px]">EN</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                language === 'mr'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="मराठी मध्ये बदला (Switch to Marathi)"
            >
              <span className="text-[11px]">मराठी</span>
            </button>
          </div>

          {/* QR Scanner Tool Button */}
          <button
            onClick={onOpenQRScanner}
            title={t('scan_asset_qr', 'Scan Asset QR Code')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden md:inline">{t('scan_asset_qr', 'Scan Asset QR')}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            title="In-app Notifications & Escalations"
            className="relative p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Persona / Role Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 text-teal-400 flex items-center justify-center font-bold text-xs uppercase">
                {profile.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  <span>{profile.name.split(' ')[0]}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${ROLE_LABELS[role]?.badgeColor || 'bg-slate-700 text-slate-300'}`}
                  >
                    {t(`role_${role}`, ROLE_LABELS[role]?.label || role)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-none">{t('role_switcher', 'Role Persona Switcher')}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {personaDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 py-1"
                onMouseLeave={() => setPersonaDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    {t('rbac_title', 'Role-Based Access Control (RBAC)')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t('rbac_desc', 'Switch roles to evaluate distinct workflows, permissions, and dashboards.')}
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {availablePersonas.map((p) => {
                    const isCurrent = p.role === role;
                    return (
                      <button
                        key={p.role}
                        onClick={() => {
                          switchPersona(p.role);
                          setPersonaDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 transition ${
                          isCurrent ? 'bg-slate-700/80 font-bold' : ''
                        }`}
                      >
                        <div>
                          <div className="text-white font-medium flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isCurrent && <span className="text-[9px] text-teal-400 uppercase font-mono">({t('active_label', 'Active')})</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {t(`role_${p.role}`, ROLE_LABELS[p.role]?.label)} • {p.department}
                          </div>
                        </div>
                        {isCurrent && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-700 p-2 flex items-center justify-between bg-slate-850">
                  {currentUser ? (
                    <button
                      onClick={signOut}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('sign_out', 'Sign Out')}
                    </button>
                  ) : (
                    <button
                      onClick={signInWithGoogle}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      {t('sign_in_google', 'Sign in with Google')}
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Chakan Plant M&M</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
