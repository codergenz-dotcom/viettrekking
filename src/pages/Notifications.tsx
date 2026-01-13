import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Check,
    CheckCheck,
    ChevronRight,
    MessageSquare,
    UserPlus,
    Calendar,
    Trash2,
    Inbox,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        fetchNotifications
    } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const getIcon = (type: string) => {
        switch (type) {
            case 'NEW_JOIN_REQUEST':
                return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'JOIN_APPROVED':
                return <Check className="h-4 w-4 text-green-500" />;
            case 'JOIN_CANCELLED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'TRIP_APPROVED':
                return <Calendar className="h-4 w-4 text-green-500" />;
            case 'TRIP_REJECTED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Bell className="h-4 w-4 text-primary" />;
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate based on type and referenceId
        if (notification.type === 'NEW_JOIN_REQUEST' || notification.type === 'JOIN_APPROVED') {
            navigate(`/trip/${notification.referenceId}?tab=members`);
        } else if (notification.type === 'TRIP_APPROVED' || notification.type === 'TRIP_REJECTED') {
            navigate(`/trip/${notification.referenceId}`);
        }
    };

    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <div className="border-b border-border/60 bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                                <Bell className="h-6 w-6 text-primary" />
                                Thông báo
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-1">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Cập nhật những tin tức mới nhất về các chuyến đi của bạn
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-primary hover:text-primary/80 hover:bg-primary/10 font-medium"
                                >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Đánh dấu tất cả đã đọc
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 mt-6">
                        <Button
                            variant={filter === 'all' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('all')}
                            className={cn(
                                "rounded-full px-5",
                                filter === 'all' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            Tất cả
                        </Button>
                        <Button
                            variant={filter === 'unread' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('unread')}
                            className={cn(
                                "rounded-full px-5",
                                filter === 'unread' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                            )}
                        >
                            Chưa đọc
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto px-4 py-6 max-w-4xl">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse">Đang tải thông báo...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={cn(
                                    "group relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2",
                                    notification.isRead
                                        ? "bg-card hover:bg-muted/30 border-border/40"
                                        : "bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-sm shadow-primary/5"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Status Dot */}
                                {!notification.isRead && (
                                    <div className="absolute top-5 left-2 w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/40" />
                                )}

                                {/* Icon */}
                                <div className={cn(
                                    "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                                    notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className={cn(
                                        "font-semibold text-base leading-tight mb-1 line-clamp-1",
                                        notification.isRead ? "text-foreground/80" : "text-foreground"
                                    )}>
                                        {notification.title}
                                    </h3>
                                    <p className={cn(
                                        "text-sm mb-2 line-clamp-2 leading-relaxed",
                                        notification.isRead ? "text-muted-foreground" : "text-foreground/70"
                                    )}>
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                        {!notification.isRead && (
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                Mới
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow Indicator */}
                                <div className="shrink-0 self-center">
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                            <Inbox className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            {filter === 'all' ? 'Chưa có thông báo nào' : 'Không có thông báo chưa đọc'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            {filter === 'all'
                                ? 'Khi có các hoạt động mới diễn ra, bạn sẽ nhận được thông báo tại đây.'
                                : 'Bạn đã đọc hết tất cả các thông báo rồi! Quay lại sau nhé.'}
                        </p>
                        {filter === 'unread' && (
                            <Button variant="outline" onClick={() => setFilter('all')}>
                                Xem tất cả thông báo
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

// Missing XCircle component from lucide-react in the import, let's fix that or use a fallback
const XCircle = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
);

export default Notifications;
