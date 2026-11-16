import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { QRScannerModal } from './components/common/QRScannerModal';
import { ManagementDashboard } from './components/dashboard/ManagementDashboard';
import { WorkerDashboard } from './components/dashboard/WorkerDashboard';
import { WorkOrderList } from './components/workorders/WorkOrderList';
import { WorkOrderModal } from './components/workorders/WorkOrderModal';
import { WorkOrderDetailModal } from './components/workorders/WorkOrderDetailModal';
import { AssetRegistry } from './components/assets/AssetRegistry';
import { PreventiveMaintenanceView } from './components/pm/PreventiveMaintenanceView';
import { ManpowerView } from './components/manpower/ManpowerView';
import { RateCardView } from './components/ratecard/RateCardView';
import { MHEView } from './components/mhe/MHEView';
import { QualitySafetyView } from './components/quality/QualitySafetyView';
import { ReportsView } from './components/reports/ReportsView';
import { AdminMasterDataView } from './components/admin/AdminMasterDataView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Asset, WorkOrder } from './types';
import { Menu, Wrench, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { role, profile } = useAuth();
  const { workOrders } = useData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Work order modals state
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isCreateWOOpen, setIsCreateWOOpen] = useState(false);
  const [preSelectedAssetForWO, setPreSelectedAssetForWO] = useState<Asset | null>(null);

  const handleOpenCreateWO = (asset?: Asset | null) => {
    setPreSelectedAssetForWO(asset || null);
    setIsCreateWOOpen(true);
  };

  const handleQRSelectAsset = (asset: Asset, action?: 'view' | 'work_order' | 'safety') => {
    if (action === 'work_order') {
      handleOpenCreateWO(asset);
    } else {
      setActiveTab('assets');
    }
  };

  const isWorker = role === 'technician';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Industrial Navigation Bar */}
      <Navbar
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden bg-slate-800 text-white px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <button
          onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white"
        >
          <Menu className="w-4 h-4 text-teal-400" />
          <span>{t('operations_navigation', 'Operations Navigation')}</span>
        </button>

        <span className="text-[11px] font-mono text-teal-300">
          Role: <strong className="uppercase">{role.replace('_', ' ')}</strong>
        </span>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isSidebarOpenMobile}
          setIsOpenMobile={setIsSidebarOpenMobile}
        />

        {/* Dynamic Center Stage Content View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              isWorker ? (
                <WorkerDashboard
                  onSelectWorkOrder={(wo) => setSelectedWorkOrder(wo)}
                  onOpenPhotoUpload={(wo) => setSelectedWorkOrder(wo)}
                  onOpenReportIssue={(wo) => setActiveTab('quality_safety')}
                />
              ) : (
                <ManagementDashboard
                  onSelectWorkOrder={(wo) => setSelectedWorkOrder(wo)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenCreateWO={() => handleOpenCreateWO(null)}
                />
              )
            )}

            {activeTab === 'work_orders' && (
              <WorkOrderList
                onSelectWorkOrder={(wo) => setSelectedWorkOrder(wo)}
                onOpenCreateWO={() => handleOpenCreateWO(null)}
              />
            )}

            {activeTab === 'assets' && (
              <AssetRegistry
                onRaiseWOForAsset={(asset) => handleOpenCreateWO(asset)}
              />
            )}

            {activeTab === 'pm' && <PreventiveMaintenanceView />}

            {activeTab === 'manpower' && <ManpowerView />}

            {activeTab === 'rate_card' && <RateCardView />}

            {activeTab === 'mhe' && <MHEView />}

            {activeTab === 'quality_safety' && <QualitySafetyView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'admin' && <AdminMasterDataView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectAsset={handleQRSelectAsset}
      />

      <WorkOrderModal
        isOpen={isCreateWOOpen}
        onClose={() => {
          setIsCreateWOOpen(false);
          setPreSelectedAssetForWO(null);
        }}
        preSelectedAsset={preSelectedAssetForWO}
      />

      <WorkOrderDetailModal
        workOrder={selectedWorkOrder}
        isOpen={!!selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsNotificationDrawerOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
