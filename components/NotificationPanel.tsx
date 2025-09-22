import React from 'react';
import { Notification, NotificationType } from '../types';
// FIX: Imported `CheckCircleIcon` and `PencilIcon` for forum-related notifications.
import { MegaphoneIcon, FileWarningIcon, ShieldCheckIcon, XCircleIcon, InboxIcon, BellIcon, AlertTriangleIcon, CheckCircleIcon, PencilIcon } from './Icons';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

// FIX: Added missing forum-related notification types to the `NOTIFICATION_ICONS` object to match the `NotificationType` enum.
const NOTIFICATION_ICONS: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  [NotificationType.ANNOUNCEMENT]: { icon: <MegaphoneIcon className="w-5 h-5" />, color: 'text-blue-500' },
  [NotificationType.ABSENCE]: { icon: <FileWarningIcon className="w-5 h-5" />, color: 'text-yellow-500' },
  [NotificationType.JUSTIFICATION_APPROVED]: { icon: <ShieldCheckIcon className="w-5 h-5" />, color: 'text-green-500' },
  [NotificationType.JUSTIFICATION_REJECTED]: { icon: <XCircleIcon className="w-5 h-5" />, color: 'text-red-500' },
  [NotificationType.JUSTIFICATION_REQUEST]: { icon: <InboxIcon className="w-5 h-5" />, color: 'text-purple-500' },
  [NotificationType.FORUM_THREAD_APPROVED]: { icon: <CheckCircleIcon className="w-5 h-5" />, color: 'text-green-500' },
  [NotificationType.FORUM_THREAD_REJECTED]: { icon: <XCircleIcon className="w-5 h-5" />, color: 'text-red-500' },
  [NotificationType.FORUM_THREAD_NEEDS_REVISION]: { icon: <PencilIcon className="w-5 h-5" />, color: 'text-orange-500' },
  [NotificationType.ATTENDANCE_WARNING]: { icon: <AlertTriangleIcon className="w-5 h-5" />, color: 'text-orange-500' },
  [NotificationType.ATTENDANCE_STATUS_LIBRE]: { icon: <AlertTriangleIcon className="w-5 h-5" />, color: 'text-red-500' },
};

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onMarkAllRead }) => {
  return (
    <div className="absolute top-24 right-4 left-4 sm:left-auto sm:w-full sm:max-w-sm z-40 animate-fade-in-up" style={{animationDuration: '0.3s'}}>
      <div className="solid-card shadow-2xl">
        <header className="p-4 border-b border-[--color-border] flex justify-between items-center">
          <h2 className="font-bold text-lg text-[--color-text-primary]">Notificaciones</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-sm font-semibold text-[--color-accent] hover:text-[--color-accent-hover] transition-colors"
            >
              Marcar todas como leídas
            </button>
            <button onClick={onClose} className="text-[--color-text-secondary] hover:text-[--color-text-primary]">&times;</button>
          </div>
        </header>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => {
              const { icon, color } = NOTIFICATION_ICONS[notification.type];
              return (
                <div key={notification.id} className={`p-4 flex items-start gap-4 border-b border-[--color-border] last:border-b-0 hover:bg-black/5 transition-colors ${!notification.read ? 'bg-black/5' : ''}`}>
                    {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>}
                    <div className={`shrink-0 ${color}`}>{icon}</div>
                    <div className="flex-grow">
                        <p className={`font-semibold text-sm ${!notification.read ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'}`}>{notification.text}</p>
                        {notification.details && <p className="text-sm text-[--color-text-secondary]">{notification.details}</p>}
                        <p className="text-xs text-[--color-text-secondary] mt-1"><TimeAgo date={notification.timestamp} /></p>
                    </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-[--color-text-secondary]">
              <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50"/>
              <p>No tienes notificaciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};