import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, type NotificationResponse } from '@/services/api';
import { chatWebSocketClient } from '@/utils/websocket';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface NotificationContextType {
    notifications: NotificationResponse[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount({ skipAuthRedirect: true, skipErrorToast: true });
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await notificationService.getNotifications({ size: 20 }, { skipAuthRedirect: true, skipErrorToast: true });
            setNotifications(response.data.content);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleNewNotification = useCallback((notification: NotificationResponse) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        toast(notification.title, {
            description: notification.message,
            action: {
                label: 'Xem',
                onClick: () => {
                    console.log('Viewing notification:', notification);
                }
            }
        });
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchUnreadCount();
            fetchNotifications();

            chatWebSocketClient.subscribeToNotifications(handleNewNotification);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [currentUser, fetchUnreadCount, fetchNotifications, handleNewNotification]);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
