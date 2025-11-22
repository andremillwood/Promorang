import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@getmocha/users-service/react';

interface NotificationHook {
  unreadCount: number;
  addNotification: (notification: {
    type: 'achievement' | 'reward' | 'system' | 'social' | 'warning';
    title: string;
    message: string;
    data?: any;
  }) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export function useNotifications(): NotificationHook {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // In a real implementation, this would fetch the actual unread count
      // For now, we'll simulate with localStorage
      const stored = localStorage.getItem(`notifications_unread_${user.id}`);
      setUnreadCount(stored ? parseInt(stored) : 0);
    }
  }, [user]);

  const addNotification = useCallback((notification: {
    type: 'achievement' | 'reward' | 'system' | 'social' | 'warning';
    title: string;
    message: string;
    data?: any;
  }) => {
    if (!user) return;
    
    // Increment unread count
    const newCount = unreadCount + 1;
    setUnreadCount(newCount);
    localStorage.setItem(`notifications_unread_${user.id}`, newCount.toString());
    
    // Show toast notification
    showToast(notification.message, 'info');
    
    // In a real implementation, this would save to the database
    console.log('New notification:', notification);
  }, [user, unreadCount]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    // Create a toast notification element
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Style based on type
    const styles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };
    
    toast.className += ` ${styles[type]}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }, []);

  return {
    unreadCount,
    addNotification,
    showToast
  };
}
