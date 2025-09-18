import { useState, useEffect } from 'react';
import { Bell, X, Check, Trophy, Star, Coins, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';

interface Notification {
  id: string;
  type: 'achievement' | 'reward' | 'system' | 'social' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // For now, we'll use mock data since we don't have a notifications API yet
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You earned the "First Steps" achievement and received 50 gold!',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          data: { achievement: 'first_steps', gold_reward: 50 }
        },
        {
          id: '2',
          type: 'reward',
          title: 'Points Earned',
          message: 'You earned 25 points from sharing content!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          data: { points_earned: 25, action: 'content_share' }
        },
        {
          id: '3',
          type: 'system',
          title: 'Master Key Activated',
          message: 'Your master key for today has been activated. You can now apply to drops!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          read: true
        },
        {
          id: '4',
          type: 'social',
          title: 'New Follower',
          message: 'PromoCreator just followed you!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          read: true,
          actionUrl: '/users/promocreator'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'reward':
        return <Coins className="w-5 h-5 text-blue-600" />;
      case 'system':
        return <Info className="w-5 h-5 text-purple-600" />;
      case 'social':
        return <Star className="w-5 h-5 text-pink-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-6 py-3 border-b border-gray-100">
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        !notification.read ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.data && (
                        <div className="mt-2 flex items-center space-x-4">
                          {notification.data.gold_reward && (
                            <div className="flex items-center space-x-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                              <Trophy className="w-3 h-3" />
                              <span>+{notification.data.gold_reward} Gold</span>
                            </div>
                          )}
                          {notification.data.points_earned && (
                            <div className="flex items-center space-x-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                              <Coins className="w-3 h-3" />
                              <span>+{notification.data.points_earned} Points</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Stay tuned for more updates and achievements!
          </p>
        </div>
      </div>
    </div>
  );
}
