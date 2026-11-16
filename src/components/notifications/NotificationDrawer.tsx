import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppNotification } from '../../types';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { notifications, markNotificationRead } = useData();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm text-white">{t('notification_center_title', 'In-App Notification Center')}</h3>
              <p className="text-[11px] text-slate-400">{t('notification_center_subtitle', 'Real-time SLA alerts & escalation notices')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm">{t('no_new_notifications', 'No new notifications')}</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;
              const isCritical = notif.priority === 'critical';

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    isCritical
                      ? 'bg-rose-50/80 border-rose-300 hover:border-rose-400'
                      : isUnread
                      ? 'bg-teal-50/60 border-teal-200 hover:border-teal-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                    )}
                  </div>

                  <p className="text-slate-600 mt-1 pl-6">{notif.message}</p>

                  <div className="mt-2 pl-6 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-teal-700 font-semibold hover:underline">{t('btn_dismiss', 'Dismiss')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
          <span className="text-slate-500">{t('alert_engine_footer', 'M&M Chakan 15-Shop Alert Engine')}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold cursor-pointer"
          >
            {t('btn_close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

