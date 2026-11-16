import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  CalendarClock,
  Users,
  Receipt,
  Forklift,
  ShieldCheck,
  FileBarChart,
  Settings,
  HardHat,
  AlertTriangle,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'work_orders'
  | 'assets'
  | 'pm'
  | 'manpower'
  | 'rate_card'
  | 'mhe'
  | 'quality_safety'
  | 'reports'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { role } = useAuth();
  const { workOrders, assets, preventiveMaintenance, safetyIncidents } = useData();
  const { t } = useLanguage();

  // Metrics for badges
  const pendingWOCount = workOrders.filter(
    (w) => !['Completed', 'Closed', 'Cancelled'].includes(w.status)
  ).length;

  const overduePMCount = preventiveMaintenance.filter((p) => p.status === 'Overdue').length;
  const activeSafetyCount = safetyIncidents.filter((s) => s.status !== 'Resolved & Cleared').length;

  const isWorker = role === 'technician';

  const navItems = [
    {
      id: 'dashboard',
      label: isWorker ? t('nav_worker_console', 'Worker Console') : t('nav_dashboard', 'Dashboard & MIS'),
      icon: isWorker ? HardHat : LayoutDashboard,
      roles: [
        'super_admin',
        'technova_admin',
        'plant_manager',
        'fabrication_manager',
        'shop_supervisor',
        'plant_engineer',
        'technician',
        'accounts_finance',
        'maintenance_coordinator',
      ],
    },
    {
      id: 'work_orders',
      label: t('nav_work_orders', 'Digital Work Orders'),
      icon: ClipboardList,
      badge: pendingWOCount > 0 ? pendingWOCount : undefined,
      badgeColor: 'bg-amber-500',
      roles: [
        'super_admin',
        'technova_admin',
        'plant_manager',
        'fabrication_manager',
        'shop_supervisor',
        'plant_engineer',
        'technician',
        'accounts_finance',
        'maintenance_coordinator',
      ],
    },
    {
      id: 'assets',
      label: t('nav_asset_registry', 'Asset Registry & QR'),
      icon: Boxes,
      badge: assets.length > 0 ? assets.length : undefined,
      badgeColor: 'bg-slate-700',
      roles: [
        'super_admin',
        'technova_admin',
        'plant_manager',
        'fabrication_manager',
        'shop_supervisor',
        'plant_engineer',
        'maintenance_coordinator',
      ],
    },
    {
      id: 'pm',
      label: t('nav_pm', 'Quarterly PM (Q1-Q4)'),
      icon: CalendarClock,
      badge: overduePMCount > 0 ? overduePMCount : undefined,
      badgeColor: 'bg-rose-500',
      roles: [
        'super_admin',
        'technova_admin',
        'plant_manager',
        'fabrication_manager',
        'shop_supervisor',
        'plant_engineer',
        'maintenance_coordinator',
      ],
    },
    {
      id: 'manpower',
      label: t('nav_manpower', 'Manpower & Roster'),
      icon: Users,
      roles: ['super_admin', 'technova_admin', 'plant_manager', 'fabrication_manager', 'shop_supervisor'],
    },
    {
      id: 'rate_card',
      label: t('nav_rate_card', 'Rate Card & ₹1Cr Savings'),
      icon: Receipt,
      roles: ['super_admin', 'technova_admin', 'plant_manager', 'accounts_finance', 'fabrication_manager'],
    },
    {
      id: 'mhe',
      label: t('nav_mhe', 'Forklifts / Tow Trucks'),
      icon: Forklift,
      roles: [
        'super_admin',
        'technova_admin',
        'plant_manager',
        'fabrication_manager',
        'maintenance_coordinator',
        'shop_supervisor',
      ],
    },
    {
      id: 'quality_safety',
      label: t('nav_quality_safety', 'Quality & Safety Hub'),
      icon: ShieldCheck,
      badge: activeSafetyCount > 0 ? activeSafetyCount : undefined,
      badgeColor: 'bg-rose-500',
      roles: [
        'super_admin',
        'technova_admin',
        'plant_manager',
        'fabrication_manager',
        'shop_supervisor',
        'plant_engineer',
        'maintenance_coordinator',
      ],
    },
    {
      id: 'reports',
      label: t('nav_reports', 'Reports & Export'),
      icon: FileBarChart,
      roles: ['super_admin', 'technova_admin', 'plant_manager', 'accounts_finance', 'fabrication_manager'],
    },
    {
      id: 'admin',
      label: t('nav_admin', 'Master Data Config'),
      icon: Settings,
      roles: ['super_admin', 'technova_admin'],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-3 px-2 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t('nav_industrial_operations', 'Industrial Operations')}
          </div>

          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-900/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${
                      item.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Facility Status Card */}
        <div className="p-3 m-2 rounded-lg bg-slate-800/60 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
            <span>{t('facility_sla_target', 'Facility SLA Target')}</span>
            <span className="text-teal-400 font-bold">&lt; 2.0 Days</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '92%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400">
            {t('tat_benchmark', 'Current Avg: 1.1 Days (Down from 8-12 days legacy vendor TAT)')}
          </p>
        </div>
      </aside>
    </>
  );
};
